import { BaseTool, BaseToolOptions } from './base.js';
import { DomainRepository } from '../db/repositories/domainRepository.js';
import { prisma } from '../db/client.js';
import { ToolResult } from '../types/index.js';

export class PolicyTools {
  /**
   * 7. checkPolicy(issueType, actionType, context)
   * Reads deterministic policies from the database.
   */
  static async checkPolicy(
    issueType: string,
    actionType: string,
    context?: Record<string, any>,
    options?: BaseToolOptions
  ): Promise<ToolResult> {
    const policies = await prisma.policy.findMany({
      where: {
        issueType,
        actionType,
        active: true,
      },
      orderBy: { priority: 'asc' },
    });

    if (policies.length === 0) {
      // Fallback policy lookup by actionType or issueType
      const fallbackPolicies = await prisma.policy.findMany({
        where: {
          OR: [{ issueType }, { actionType }],
          active: true,
        },
      });

      if (fallbackPolicies.length === 0) {
        return BaseTool.formatSuccess('checkPolicy', {
          eligible: true,
          policyId: null,
          policyName: 'Default Standard Policy',
          approvalRequired: false,
          reason: 'No restrictive policy found for this claim type',
          constraints: {},
        }, options, { issueType, actionType, context });
      }
    }

    const primaryPolicy = policies[0];
    let parsedConditions: Record<string, any> = {};
    try {
      parsedConditions = JSON.parse(primaryPolicy.conditions);
    } catch {
      parsedConditions = {};
    }

    let eligible = true;
    let reason = `Grounded by policy: ${primaryPolicy.name}`;

    // Apply deterministic condition evaluation
    if (parsedConditions.maxAutoRefundAmount && context?.amount) {
      if (context.amount > parsedConditions.maxAutoRefundAmount && !primaryPolicy.approvalRequired) {
        eligible = false;
        reason = `Requested amount ₹${context.amount} exceeds auto-approval limit of ₹${parsedConditions.maxAutoRefundAmount}`;
      }
    }

    return BaseTool.formatSuccess('checkPolicy', {
      eligible,
      policyId: primaryPolicy.id,
      policyName: primaryPolicy.name,
      approvalRequired: primaryPolicy.approvalRequired,
      reason,
      constraints: parsedConditions,
    }, options, { issueType, actionType, context });
  }

  /**
   * 8. checkRefundEligibility(orderId, context)
   * Evaluates deterministic database-backed refund rules.
   */
  static async checkRefundEligibility(
    orderId: string,
    context?: { requestedAmount?: number; claimReason?: string },
    options?: BaseToolOptions
  ): Promise<ToolResult> {
    const order = await DomainRepository.getOrderById(orderId);
    if (!order) {
      return BaseTool.formatError('checkRefundEligibility', 'ORDER_NOT_FOUND', `Order ${orderId} not found`, false, options, { orderId });
    }

    const amountToRefund = context?.requestedAmount || order.totalAmount;
    const existingRefundsTotal = order.refunds.reduce((sum, r) => sum + r.amount, 0);

    // Rule 1: Cannot refund more than order total
    if (existingRefundsTotal + amountToRefund > order.totalAmount) {
      return BaseTool.formatSuccess('checkRefundEligibility', {
        eligible: false,
        reason: `Total refund amount (₹${existingRefundsTotal + amountToRefund}) exceeds order total ₹${order.totalAmount}`,
        maxRefundableAmount: Math.max(0, order.totalAmount - existingRefundsTotal),
        approvalRequired: false,
      }, options, { orderId, context });
    }

    // Rule 2: Fetch database policy for Auto-Refund threshold
    const policyResult = await PolicyTools.checkPolicy('DAMAGED', 'REFUND', { amount: amountToRefund });
    const policyData = policyResult.data;

    let approvalRequired = policyData?.approvalRequired || false;
    let eligible = true;
    let reason = 'Order is eligible for refund';

    if (amountToRefund > 10000) {
      approvalRequired = true;
      reason = `Refund amount ₹${amountToRefund} exceeds auto-approval limit of ₹10,000; requires manager/tier-2 override`;
    }

    return BaseTool.formatSuccess('checkRefundEligibility', {
      eligible,
      orderId: order.id,
      orderStatus: order.status,
      requestedAmount: amountToRefund,
      existingRefundsTotal,
      maxRefundableAmount: order.totalAmount - existingRefundsTotal,
      approvalRequired,
      reason,
    }, options, { orderId, context });
  }
}
