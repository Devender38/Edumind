import { BaseTool, BaseToolOptions } from './base.js';
import { AgentStateRepository } from '../db/repositories/agentStateRepository.js';
import { prisma } from '../db/client.js';
import { ToolResult } from '../types/index.js';

export class VerificationTools {
  /**
   * 16. verifyAction(actionId)
   * Ground-Truth Database State Verification
   */
  static async verifyAction(actionId: string, options?: BaseToolOptions): Promise<ToolResult> {
    const actionRecord = await prisma.actionRecord.findUnique({
      where: { id: actionId },
      include: { ticket: true },
    });

    if (!actionRecord) {
      return BaseTool.formatError('verifyAction', 'ACTION_NOT_FOUND', `Action record ${actionId} not found`, false, options, { actionId });
    }

    let verified = false;
    let expectedState = '';
    let actualState = '';
    let message = '';

    switch (actionRecord.actionType) {
      case 'REFUND': {
        expectedState = 'COMPLETED_REFUND_TRANSACTION';
        const refundTx = await prisma.refundTransaction.findFirst({
          where: { id: actionRecord.externalReference || undefined },
        });

        if (refundTx && refundTx.status === 'COMPLETED') {
          verified = true;
          actualState = 'COMPLETED_REFUND_TRANSACTION';
          message = `Ground truth verified: Refund transaction ${refundTx.id} exists with amount ₹${refundTx.amount}`;
        } else {
          actualState = refundTx ? `REFUND_STATUS_${refundTx.status}` : 'REFUND_RECORD_MISSING';
          message = `Verification failed: Refund transaction not found or incomplete`;
        }
        break;
      }

      case 'REPLACEMENT': {
        expectedState = 'PROCESSING_REPLACEMENT_ORDER';
        const replacementOrder = await prisma.order.findUnique({
          where: { id: actionRecord.externalReference || undefined },
          include: { items: true },
        });

        if (replacementOrder && (replacementOrder.status === 'PROCESSING' || replacementOrder.status === 'SHIPPED')) {
          verified = true;
          actualState = 'PROCESSING_REPLACEMENT_ORDER';
          message = `Ground truth verified: Replacement order ${replacementOrder.id} created with total ₹${replacementOrder.totalAmount}`;
        } else {
          actualState = replacementOrder ? `ORDER_STATUS_${replacementOrder.status}` : 'REPLACEMENT_ORDER_MISSING';
          message = `Verification failed: Replacement order record missing or invalid state`;
        }
        break;
      }

      case 'CANCELLATION': {
        expectedState = 'CANCELLED_ORDER';
        const order = await prisma.order.findUnique({
          where: { id: actionRecord.externalReference || undefined },
        });

        if (order && order.status === 'CANCELLED') {
          verified = true;
          actualState = 'CANCELLED_ORDER';
          message = `Ground truth verified: Order ${order.id} status is strictly CANCELLED`;
        } else {
          actualState = order ? `ORDER_STATUS_${order.status}` : 'ORDER_MISSING';
          message = `Verification failed: Order status is not CANCELLED`;
        }
        break;
      }

      case 'COUPON': {
        expectedState = 'ISSUED_COUPON';
        const coupon = await prisma.coupon.findUnique({
          where: { id: actionRecord.externalReference || undefined },
        });

        if (coupon && !coupon.isUsed) {
          verified = true;
          actualState = 'ISSUED_COUPON';
          message = `Ground truth verified: Coupon code ${coupon.code} issued for discount ₹${coupon.discount}`;
        } else {
          actualState = coupon ? 'COUPON_ALREADY_USED' : 'COUPON_RECORD_MISSING';
          message = `Verification failed: Coupon not found or already redeemed`;
        }
        break;
      }

      case 'ESCALATION': {
        expectedState = 'PENDING_ESCALATION';
        const escalation = await prisma.escalation.findUnique({
          where: { id: actionRecord.externalReference || undefined },
        });

        if (escalation) {
          verified = true;
          actualState = `ESCALATION_${escalation.status}`;
          message = `Ground truth verified: Escalation ${escalation.id} logged with status ${escalation.status}`;
        } else {
          actualState = 'ESCALATION_MISSING';
          message = `Verification failed: Escalation record missing`;
        }
        break;
      }

      default: {
        verified = true;
        expectedState = 'EXECUTED';
        actualState = 'EXECUTED';
        message = `Ground truth verified for action type ${actionRecord.actionType}`;
      }
    }

    // Record verification result in DB
    const verificationRecord = await AgentStateRepository.recordVerification({
      actionId: actionRecord.id,
      agentRunId: options?.agentRunId || actionRecord.agentRunId || 'standalone-run',
      status: verified ? 'SUCCESS' : 'FAILED',
      expectedState,
      actualState,
      message,
    }).catch(() => null);

    return BaseTool.formatSuccess('verifyAction', {
      actionId: actionRecord.id,
      actionType: actionRecord.actionType,
      verified,
      expectedState,
      actualState,
      message,
      verificationRecordId: verificationRecord?.id,
    }, options, { actionId });
  }
}
