import { LookupTools } from './lookupTools.js';
import { PolicyTools } from './policyTools.js';
import { ActionTools } from './actionTools.js';
import { VerificationTools } from './verificationTools.js';
import { ToolResult } from '../types/index.js';
import { BaseToolOptions } from './base.js';

export class ToolRegistry {
  private static toolMap: Record<string, (params: any, options?: BaseToolOptions) => Promise<ToolResult>> = {
    // Lookup Tools
    getCustomer: (p, opts) => LookupTools.getCustomer(p.customerId, opts),
    getCustomerHistory: (p, opts) => LookupTools.getCustomerHistory(p.customerId, opts),
    getTicket: (p, opts) => LookupTools.getTicket(p.ticketId, opts),
    getOrder: (p, opts) => LookupTools.getOrder(p.orderId, opts),
    checkInventory: (p, opts) => LookupTools.checkInventory(p.productId, opts),
    getProduct: (p, opts) => LookupTools.getProduct(p.productId, opts),

    // Policy Tools
    checkPolicy: (p, opts) => PolicyTools.checkPolicy(p.issueType, p.actionType, p.context, opts),
    checkRefundEligibility: (p, opts) => PolicyTools.checkRefundEligibility(p.orderId, p.context, opts),

    // Action Tools
    issueRefund: (p, opts) => ActionTools.issueRefund(p.orderId, p.amount, p.reason, p.idempotencyKey, opts),
    createReplacement: (p, opts) => ActionTools.createReplacement(p.orderId, p.replacementProductId, p.reason, p.idempotencyKey, opts),
    cancelOrder: (p, opts) => ActionTools.cancelOrder(p.orderId, p.reason, p.idempotencyKey, opts),
    applyCoupon: (p, opts) => ActionTools.applyCoupon(p.customerId, p.couponCode, p.ticketId, p.idempotencyKey, opts),
    updateTicket: (p, opts) => ActionTools.updateTicket(p.ticketId, p.status, p.resolutionType, opts),
    escalateTicket: (p, opts) => ActionTools.escalateTicket(p.ticketId, p.reason, p.priority, p.idempotencyKey, opts),
    sendNotification: (p, opts) => ActionTools.sendNotification(p.ticketId, p.type, p.message, p.idempotencyKey, opts),

    // Verification Tools
    verifyAction: (p, opts) => VerificationTools.verifyAction(p.actionId, opts),
  };

  /**
   * Execute tool by name
   */
  static async executeTool(
    toolName: string,
    params: any,
    options?: BaseToolOptions
  ): Promise<ToolResult> {
    const fn = this.toolMap[toolName];
    if (!fn) {
      return {
        success: false,
        error: {
          code: 'TOOL_NOT_FOUND',
          message: `Tool '${toolName}' is not registered in ToolRegistry`,
          retryable: false,
        },
        metadata: { toolName },
      };
    }

    try {
      return await fn(params, options);
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'TOOL_EXECUTION_ERROR',
          message: err.message || 'Unhandled exception in tool execution',
          retryable: false,
        },
        metadata: { toolName },
      };
    }
  }

  /**
   * Get list of all available tools
   */
  static getAvailableTools(): string[] {
    return Object.keys(this.toolMap);
  }
}
