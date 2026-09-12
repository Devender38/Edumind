import { BaseTool, BaseToolOptions } from './base.js';
import { DomainRepository } from '../db/repositories/domainRepository.js';
import { prisma } from '../db/client.js';
import { ToolResult } from '../types/index.js';

export class LookupTools {
  /**
   * 1. getCustomer(customerId)
   */
  static async getCustomer(customerId: string, options?: BaseToolOptions): Promise<ToolResult> {
    const customer = await DomainRepository.getCustomerById(customerId);
    if (!customer) {
      return BaseTool.formatError('getCustomer', 'CUSTOMER_NOT_FOUND', `Customer with ID ${customerId} not found`, false, options, { customerId });
    }

    return BaseTool.formatSuccess('getCustomer', {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      tier: customer.tier,
      riskScore: customer.riskScore,
      createdAt: customer.createdAt,
      ordersCount: customer.orders.length,
      ticketsCount: customer.tickets.length,
      couponsCount: customer.coupons.length,
    }, options, { customerId });
  }

  /**
   * 2. getCustomerHistory(customerId)
   */
  static async getCustomerHistory(customerId: string, options?: BaseToolOptions): Promise<ToolResult> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          include: { items: { include: { product: true } }, refunds: true },
          orderBy: { createdAt: 'desc' },
        },
        tickets: {
          include: { actionRecords: true, escalations: true },
          orderBy: { createdAt: 'desc' },
        },
        coupons: true,
      },
    });

    if (!customer) {
      return BaseTool.formatError('getCustomerHistory', 'CUSTOMER_NOT_FOUND', `Customer ${customerId} not found`, false, options, { customerId });
    }

    const previousRefundsCount = customer.orders.reduce((acc, ord) => acc + ord.refunds.length, 0);

    return BaseTool.formatSuccess('getCustomerHistory', {
      customerId: customer.id,
      customerName: customer.name,
      tier: customer.tier,
      riskScore: customer.riskScore,
      previousOrders: customer.orders.map((o) => ({
        orderId: o.id,
        status: o.status,
        totalAmount: o.totalAmount,
        deliveredAt: o.deliveryDate,
        refunds: o.refunds,
      })),
      previousTickets: customer.tickets.map((t) => ({
        ticketId: t.id,
        issueType: t.issueType,
        status: t.status,
        resolutionType: t.resolutionType,
        actionsCount: t.actionRecords.length,
      })),
      previousRefundsCount,
    }, options, { customerId });
  }

  /**
   * 3. getTicket(ticketId)
   */
  static async getTicket(ticketId: string, options?: BaseToolOptions): Promise<ToolResult> {
    const ticket = await DomainRepository.getTicketById(ticketId);
    if (!ticket) {
      return BaseTool.formatError('getTicket', 'TICKET_NOT_FOUND', `Ticket with ID ${ticketId} not found`, false, options, { ticketId });
    }

    return BaseTool.formatSuccess('getTicket', {
      id: ticket.id,
      customerId: ticket.customerId,
      customer: {
        name: ticket.customer.name,
        email: ticket.customer.email,
        tier: ticket.customer.tier,
      },
      orderId: ticket.orderId,
      order: ticket.order ? {
        id: ticket.order.id,
        status: ticket.order.status,
        totalAmount: ticket.order.totalAmount,
        deliveryDate: ticket.order.deliveryDate,
      } : null,
      issueType: ticket.issueType,
      customerMessage: ticket.customerMessage,
      status: ticket.status,
      priority: ticket.priority,
      resolutionType: ticket.resolutionType,
      createdAt: ticket.createdAt,
    }, options, { ticketId });
  }

  /**
   * 4. getOrder(orderId)
   */
  static async getOrder(orderId: string, options?: BaseToolOptions): Promise<ToolResult> {
    const order = await DomainRepository.getOrderById(orderId);
    if (!order) {
      return BaseTool.formatError('getOrder', 'ORDER_NOT_FOUND', `Order with ID ${orderId} not found`, false, options, { orderId });
    }

    return BaseTool.formatSuccess('getOrder', {
      id: order.id,
      customerId: order.customerId,
      customerName: order.customer.name,
      status: order.status,
      totalAmount: order.totalAmount,
      currency: order.currency,
      deliveryDate: order.deliveryDate,
      shippingStatus: order.shippingStatus,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.product.name,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        replacementEligible: i.product.replacementEligible,
      })),
      refunds: order.refunds,
    }, options, { orderId });
  }

  /**
   * 5. checkInventory(productId)
   */
  static async checkInventory(productId: string, options?: BaseToolOptions): Promise<ToolResult> {
    const product = await DomainRepository.getProductById(productId);
    if (!product) {
      return BaseTool.formatError('checkInventory', 'PRODUCT_NOT_FOUND', `Product with ID ${productId} not found`, false, options, { productId });
    }

    const available = product.stockQuantity > 0;

    return BaseTool.formatSuccess('checkInventory', {
      productId: product.id,
      productName: product.name,
      stockQuantity: product.stockQuantity,
      replacementEligible: product.replacementEligible,
      available,
      status: available ? 'IN_STOCK' : 'OUT_OF_STOCK',
    }, options, { productId });
  }

  /**
   * 6. getProduct(productId)
   */
  static async getProduct(productId: string, options?: BaseToolOptions): Promise<ToolResult> {
    const product = await DomainRepository.getProductById(productId);
    if (!product) {
      return BaseTool.formatError('getProduct', 'PRODUCT_NOT_FOUND', `Product with ID ${productId} not found`, false, options, { productId });
    }

    return BaseTool.formatSuccess('getProduct', {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stockQuantity: product.stockQuantity,
      replacementEligible: product.replacementEligible,
    }, options, { productId });
  }
}
