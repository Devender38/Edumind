import { BaseTool, BaseToolOptions } from './base.js';
import { DomainRepository } from '../db/repositories/domainRepository.js';
import { PolicyTools } from './policyTools.js';
import { prisma } from '../db/client.js';
import { ToolResult } from '../types/index.js';

export class ActionTools {
  /**
   * 9. issueRefund(orderId, amount, reason, idempotencyKey)
   */
  static async issueRefund(
    orderId: string,
    amount: number,
    reason: string,
    idempotencyKey: string,
    options?: BaseToolOptions
  ): Promise<ToolResult> {
    const opts = { ...options, idempotencyKey };

    // Idempotency check
    const existingResult = await BaseTool.checkIdempotency(idempotencyKey, 'issueRefund');
    if (existingResult) return existingResult;

    // Validate inputs
    if (!orderId || !amount || amount <= 0 || !idempotencyKey) {
      return BaseTool.formatError('issueRefund', 'INVALID_INPUT', 'Order ID, positive amount, and idempotencyKey are required', false, opts, { orderId, amount, reason });
    }

    const order = await DomainRepository.getOrderById(orderId);
    if (!order) {
      return BaseTool.formatError('issueRefund', 'ORDER_NOT_FOUND', `Order ${orderId} not found`, false, opts, { orderId, amount });
    }

    // Check eligibility
    const eligibility = await PolicyTools.checkRefundEligibility(orderId, { requestedAmount: amount });
    if (!eligibility.data?.eligible) {
      return BaseTool.formatError('issueRefund', 'REFUND_REJECTED', eligibility.data?.reason || 'Order not eligible for refund', false, opts, { orderId, amount });
    }

    // Database Transaction: Create RefundTransaction + ActionRecord + Update Order Status
    try {
      const transactionResult = await prisma.$transaction(async (tx) => {
        const refundTx = await tx.refundTransaction.create({
          data: {
            orderId: order.id,
            amount,
            reason,
            idempotencyKey,
            status: 'COMPLETED',
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: { status: 'REFUNDED' },
        });

        // Find associated ticket if present
        const ticket = await tx.ticket.findFirst({ where: { orderId: order.id } });
        const validAgentRunId = options?.agentRunId && options.agentRunId !== 'standalone-run' ? options.agentRunId : null;

        const actionRecord = await tx.actionRecord.create({
          data: {
            ticketId: ticket?.id || null,
            agentRunId: validAgentRunId,
            actionType: 'REFUND',
            status: 'EXECUTED',
            externalReference: refundTx.id,
            amount,
            metadata: JSON.stringify({ orderId, reason, idempotencyKey }),
          },
        });

        return { refundTx, actionRecord };
      });

      return BaseTool.formatSuccess('issueRefund', {
        refundTransactionId: transactionResult.refundTx.id,
        actionId: transactionResult.actionRecord.id,
        orderId: order.id,
        amount,
        status: 'COMPLETED',
        idempotencyKey,
      }, opts, { orderId, amount, reason });
    } catch (err: any) {
      if (err.code === 'P2002') {
        return BaseTool.formatError('issueRefund', 'IDEMPOTENT_DUPLICATE', 'Refund transaction with this idempotency key already processed', false, opts, { orderId, amount });
      }
      return BaseTool.formatError('issueRefund', 'REFUND_FAILED', err.message || 'Refund processing failed', false, opts, { orderId, amount });
    }
  }

  /**
   * 10. createReplacement(orderId, replacementProductId, reason, idempotencyKey)
   * Deterministic stock check: prod-phone-001 (stock=0) fails with OUT_OF_STOCK!
   */
  static async createReplacement(
    orderId: string,
    replacementProductId: string,
    reason: string,
    idempotencyKey: string,
    options?: BaseToolOptions
  ): Promise<ToolResult> {
    const opts = { ...options, idempotencyKey };

    // Idempotency check
    const existingResult = await BaseTool.checkIdempotency(idempotencyKey, 'createReplacement');
    if (existingResult) return existingResult;

    if (!orderId || !replacementProductId || !idempotencyKey) {
      return BaseTool.formatError('createReplacement', 'INVALID_INPUT', 'orderId, replacementProductId, and idempotencyKey are required', false, opts, { orderId, replacementProductId });
    }

    const order = await DomainRepository.getOrderById(orderId);
    if (!order) {
      return BaseTool.formatError('createReplacement', 'ORDER_NOT_FOUND', `Original order ${orderId} not found`, false, opts, { orderId });
    }

    const product = await DomainRepository.getProductById(replacementProductId);
    if (!product) {
      return BaseTool.formatError('createReplacement', 'PRODUCT_NOT_FOUND', `Replacement product ${replacementProductId} not found`, false, opts, { replacementProductId });
    }

    // Mandatory Failure Check: Product stock = 0
    if (product.stockQuantity <= 0) {
      return BaseTool.formatError('createReplacement', 'OUT_OF_STOCK', `Replacement product '${product.name}' is out of stock (Stock: 0)`, false, opts, { orderId, replacementProductId });
    }

    // Database Transaction: Decrement stock, create replacement order, create ActionRecord
    try {
      const transactionResult = await prisma.$transaction(async (tx) => {
        // Decrement product inventory
        const updatedProduct = await tx.product.update({
          where: { id: product.id },
          data: { stockQuantity: product.stockQuantity - 1 },
        });

        // Create replacement order
        const newReplacementOrder = await tx.order.create({
          data: {
            customerId: order.customerId,
            status: 'PROCESSING',
            totalAmount: product.price,
            currency: order.currency,
            shippingStatus: 'PENDING',
            items: {
              create: [
                {
                  productId: product.id,
                  quantity: 1,
                  unitPrice: product.price,
                },
              ],
            },
          },
        });

        const ticket = await tx.ticket.findFirst({ where: { orderId: order.id } });
        const validAgentRunId = options?.agentRunId && options.agentRunId !== 'standalone-run' ? options.agentRunId : null;

        const actionRecord = await tx.actionRecord.create({
          data: {
            ticketId: ticket?.id || null,
            agentRunId: validAgentRunId,
            actionType: 'REPLACEMENT',
            status: 'EXECUTED',
            externalReference: newReplacementOrder.id,
            amount: product.price,
            metadata: JSON.stringify({ originalOrderId: order.id, replacementProductId: product.id, idempotencyKey }),
          },
        });

        return { newReplacementOrder, actionRecord, remainingStock: updatedProduct.stockQuantity };
      });

      return BaseTool.formatSuccess('createReplacement', {
        replacementOrderId: transactionResult.newReplacementOrder.id,
        actionId: transactionResult.actionRecord.id,
        originalOrderId: order.id,
        replacementProductId: product.id,
        replacementProductName: product.name,
        remainingStock: transactionResult.remainingStock,
        status: 'PROCESSING',
        idempotencyKey,
      }, opts, { orderId, replacementProductId, reason });
    } catch (err: any) {
      return BaseTool.formatError('createReplacement', 'REPLACEMENT_FAILED', err.message || 'Failed to create replacement order', false, opts, { orderId, replacementProductId });
    }
  }

  /**
   * 11. cancelOrder(orderId, reason, idempotencyKey)
   */
  static async cancelOrder(
    orderId: string,
    reason: string,
    idempotencyKey: string,
    options?: BaseToolOptions
  ): Promise<ToolResult> {
    const opts = { ...options, idempotencyKey };

    const existingResult = await BaseTool.checkIdempotency(idempotencyKey, 'cancelOrder');
    if (existingResult) return existingResult;

    const order = await DomainRepository.getOrderById(orderId);
    if (!order) {
      return BaseTool.formatError('cancelOrder', 'ORDER_NOT_FOUND', `Order ${orderId} not found`, false, opts, { orderId });
    }

    if (order.status === 'DELIVERED' || order.shippingStatus === 'DISPATCHED' || order.shippingStatus === 'DELIVERED') {
      return BaseTool.formatError('cancelOrder', 'CANCELLATION_NOT_ALLOWED', `Cannot cancel order ${orderId} because it is already shipped/delivered`, false, opts, { orderId, status: order.status });
    }

    try {
      const transactionResult = await prisma.$transaction(async (tx) => {
        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED', shippingStatus: 'RETURNED' },
        });

        const ticket = await tx.ticket.findFirst({ where: { orderId: order.id } });
        const validAgentRunId = options?.agentRunId && options.agentRunId !== 'standalone-run' ? options.agentRunId : null;

        const actionRecord = await tx.actionRecord.create({
          data: {
            ticketId: ticket?.id || null,
            agentRunId: validAgentRunId,
            actionType: 'CANCELLATION',
            status: 'EXECUTED',
            externalReference: updatedOrder.id,
            amount: updatedOrder.totalAmount,
            metadata: JSON.stringify({ reason, idempotencyKey }),
          },
        });

        return { updatedOrder, actionRecord };
      });

      return BaseTool.formatSuccess('cancelOrder', {
        orderId: transactionResult.updatedOrder.id,
        actionId: transactionResult.actionRecord.id,
        status: 'CANCELLED',
        idempotencyKey,
      }, opts, { orderId, reason });
    } catch (err: any) {
      return BaseTool.formatError('cancelOrder', 'CANCELLATION_FAILED', err.message || 'Order cancellation failed', false, opts, { orderId });
    }
  }

  /**
   * 12. applyCoupon(customerId, couponCode, ticketId, idempotencyKey)
   */
  static async applyCoupon(
    customerId: string,
    couponCode: string,
    ticketId: string,
    idempotencyKey: string,
    options?: BaseToolOptions
  ): Promise<ToolResult> {
    const opts = { ...options, idempotencyKey };

    const existingResult = await BaseTool.checkIdempotency(idempotencyKey, 'applyCoupon');
    if (existingResult) return existingResult;

    const customer = await DomainRepository.getCustomerById(customerId);
    if (!customer) {
      return BaseTool.formatError('applyCoupon', 'CUSTOMER_NOT_FOUND', `Customer ${customerId} not found`, false, opts, { customerId });
    }

    try {
      const transactionResult = await prisma.$transaction(async (tx) => {
        const coupon = await tx.coupon.create({
          data: {
            customerId,
            code: couponCode,
            discount: 1000.0, // ₹1,000 Goodwill Discount
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            isUsed: false,
          },
        });

        const validAgentRunId = options?.agentRunId && options.agentRunId !== 'standalone-run' ? options.agentRunId : null;

        const actionRecord = await tx.actionRecord.create({
          data: {
            ticketId,
            agentRunId: validAgentRunId,
            actionType: 'COUPON',
            status: 'EXECUTED',
            externalReference: coupon.id,
            amount: 1000.0,
            metadata: JSON.stringify({ couponCode, idempotencyKey }),
          },
        });

        return { coupon, actionRecord };
      });

      return BaseTool.formatSuccess('applyCoupon', {
        couponId: transactionResult.coupon.id,
        code: transactionResult.coupon.code,
        discount: transactionResult.coupon.discount,
        actionId: transactionResult.actionRecord.id,
        status: 'ISSUED',
        idempotencyKey,
      }, opts, { customerId, couponCode, ticketId });
    } catch (err: any) {
      if (err.code === 'P2002') {
        return BaseTool.formatError('applyCoupon', 'INVALID_COUPON', `Coupon code ${couponCode} already exists or applied`, false, opts, { couponCode });
      }
      return BaseTool.formatError('applyCoupon', 'COUPON_FAILED', err.message || 'Failed to issue coupon', false, opts, { couponCode });
    }
  }

  /**
   * 13. updateTicket(ticketId, status, resolutionType?)
   */
  static async updateTicket(
    ticketId: string,
    status: string,
    resolutionType?: string,
    options?: BaseToolOptions
  ): Promise<ToolResult> {
    const ticket = await DomainRepository.getTicketById(ticketId);
    if (!ticket) {
      return BaseTool.formatError('updateTicket', 'TICKET_NOT_FOUND', `Ticket ${ticketId} not found`, false, options, { ticketId });
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status,
        ...(resolutionType ? { resolutionType } : {}),
      },
    });

    return BaseTool.formatSuccess('updateTicket', {
      ticketId: updated.id,
      previousStatus: ticket.status,
      newStatus: updated.status,
      resolutionType: updated.resolutionType,
    }, options, { ticketId, status, resolutionType });
  }

  /**
   * 14. escalateTicket(ticketId, reason, priority, idempotencyKey)
   */
  static async escalateTicket(
    ticketId: string,
    reason: string,
    priority: string,
    idempotencyKey: string,
    options?: BaseToolOptions
  ): Promise<ToolResult> {
    const opts = { ...options, idempotencyKey };

    const existingResult = await BaseTool.checkIdempotency(idempotencyKey, 'escalateTicket');
    if (existingResult) return existingResult;

    const ticket = await DomainRepository.getTicketById(ticketId);
    if (!ticket) {
      return BaseTool.formatError('escalateTicket', 'TICKET_NOT_FOUND', `Ticket ${ticketId} not found`, false, opts, { ticketId });
    }

    try {
      const transactionResult = await prisma.$transaction(async (tx) => {
        await tx.ticket.update({
          where: { id: ticketId },
          data: { status: 'ESCALATED', priority },
        });

        const validAgentRunId = options?.agentRunId && options.agentRunId !== 'standalone-run' ? options.agentRunId : null;

        const escalation = await tx.escalation.create({
          data: {
            ticketId,
            agentRunId: validAgentRunId,
            reason,
            priority,
            status: 'PENDING',
          },
        });

        const actionRecord = await tx.actionRecord.create({
          data: {
            ticketId,
            agentRunId: validAgentRunId,
            actionType: 'ESCALATION',
            status: 'EXECUTED',
            externalReference: escalation.id,
            metadata: JSON.stringify({ reason, priority, idempotencyKey }),
          },
        });

        return { escalation, actionRecord };
      });

      return BaseTool.formatSuccess('escalateTicket', {
        escalationId: transactionResult.escalation.id,
        actionId: transactionResult.actionRecord.id,
        ticketId,
        status: 'ESCALATED',
        priority,
        idempotencyKey,
      }, opts, { ticketId, reason, priority });
    } catch (err: any) {
      return BaseTool.formatError('escalateTicket', 'ESCALATION_FAILED', err.message || 'Escalation failed', false, opts, { ticketId });
    }
  }

  /**
   * 15. sendNotification(ticketId, type, message, idempotencyKey)
   */
  static async sendNotification(
    ticketId: string,
    type: 'EMAIL' | 'SMS' | 'IN_APP',
    message: string,
    idempotencyKey: string,
    options?: BaseToolOptions
  ): Promise<ToolResult> {
    const opts = { ...options, idempotencyKey };

    const existingResult = await BaseTool.checkIdempotency(idempotencyKey, 'sendNotification');
    if (existingResult) return existingResult;

    const ticket = await DomainRepository.getTicketById(ticketId);
    if (!ticket) {
      return BaseTool.formatError('sendNotification', 'TICKET_NOT_FOUND', `Ticket ${ticketId} not found`, false, opts, { ticketId });
    }

    const notification = await prisma.notification.create({
      data: {
        ticketId,
        customerId: ticket.customerId,
        type,
        recipient: ticket.customer.email,
        message,
        status: 'SENT',
      },
    });

    return BaseTool.formatSuccess('sendNotification', {
      notificationId: notification.id,
      recipient: notification.recipient,
      type: notification.type,
      status: notification.status,
      idempotencyKey,
    }, opts, { ticketId, type, message });
  }
}
