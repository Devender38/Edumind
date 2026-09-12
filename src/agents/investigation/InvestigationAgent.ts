import {
  StructuredIntent,
  StructuredInvestigationResult,
  EvidenceItem,
  EligibilitySignal,
} from '../../types/index.js';
import { ToolRegistry } from '../../tools/registry.js';
import { AgentStateRepository } from '../../db/repositories/agentStateRepository.js';

export interface InvestigationAgentInput {
  intent: StructuredIntent;
  ticketId?: string;
  customerId?: string;
  orderId?: string;
  agentRunId?: string;
}

export class InvestigationAgent {
  // Read-only tools allowed during investigation phase
  private static ALLOWED_READ_ONLY_TOOLS = new Set([
    'getCustomer',
    'getCustomerHistory',
    'getTicket',
    'getOrder',
    'checkInventory',
    'getProduct',
    'checkPolicy',
    'checkRefundEligibility',
  ]);

  /**
   * Safe tool execution wrapper ensuring no state-changing tools are invoked
   */
  private static async safeExecuteTool(toolName: string, params: any, agentRunId?: string) {
    if (!this.ALLOWED_READ_ONLY_TOOLS.has(toolName)) {
      throw new Error(`SECURITY_VIOLATION: InvestigationAgent is forbidden from invoking state-changing tool '${toolName}'`);
    }
    return ToolRegistry.executeTool(toolName, params, { agentRunId });
  }

  /**
   * Run investigation workflow driven by intent and case context
   */
  static async investigate(input: InvestigationAgentInput): Promise<StructuredInvestigationResult> {
    const evidence: EvidenceItem[] = [];
    const eligibilitySignals: EligibilitySignal[] = [];
    const missingInfo: string[] = [...input.intent.missingInformation];

    let customerData: any = null;
    let orderData: any = null;
    const productsData: any[] = [];

    // Step 1: Entity Resolution via Ticket (if ticketId provided)
    let targetTicketId = input.ticketId;
    let targetCustomerId = input.customerId || input.intent.entities.customerId;
    let targetOrderId = input.orderId || input.intent.entities.orderId;

    if (targetTicketId) {
      const ticketRes = await this.safeExecuteTool('getTicket', { ticketId: targetTicketId }, input.agentRunId);
      if (ticketRes.success && ticketRes.data) {
        const t = ticketRes.data;
        if (!targetCustomerId) targetCustomerId = t.customerId;
        if (!targetOrderId && t.orderId) targetOrderId = t.orderId;

        evidence.push({
          source: 'getTicket',
          toolUsed: 'getTicket',
          entity: t.id,
          fact: `Ticket ${t.id} exists for issue '${t.issueType}' with status '${t.status}'`,
          isObservedFact: true,
          timestamp: new Date().toISOString(),
        });
      } else {
        missingInfo.push('valid_ticket');
      }
    }

    // Step 2: Investigate Customer & Customer History
    if (targetCustomerId) {
      const custRes = await this.safeExecuteTool('getCustomer', { customerId: targetCustomerId }, input.agentRunId);
      if (custRes.success && custRes.data) {
        customerData = custRes.data;
        evidence.push({
          source: 'getCustomer',
          toolUsed: 'getCustomer',
          entity: customerData.id,
          fact: `Customer ${customerData.name} is tier '${customerData.tier}' with risk score ${customerData.riskScore}`,
          isObservedFact: true,
          timestamp: new Date().toISOString(),
        });
      }

      const historyRes = await this.safeExecuteTool('getCustomerHistory', { customerId: targetCustomerId }, input.agentRunId);
      if (historyRes.success && historyRes.data) {
        evidence.push({
          source: 'getCustomerHistory',
          toolUsed: 'getCustomerHistory',
          entity: targetCustomerId,
          fact: `Customer history: ${historyRes.data.previousOrders.length} previous orders, ${historyRes.data.previousRefundsCount} previous refunds`,
          isObservedFact: true,
          timestamp: new Date().toISOString(),
        });

        if (historyRes.data.previousRefundsCount > 3) {
          eligibilitySignals.push({
            signal: 'FRAUD_RISK_FLAG',
            status: 'REQUIRES_APPROVAL',
            details: `Customer has ${historyRes.data.previousRefundsCount} previous refunds; auto-resolution locked`,
          });
        }
      }
    } else {
      missingInfo.push('customerId');
    }

    // Step 3: Investigate Order Details & Line Items
    if (targetOrderId) {
      const orderRes = await this.safeExecuteTool('getOrder', { orderId: targetOrderId }, input.agentRunId);
      if (orderRes.success && orderRes.data) {
        orderData = orderRes.data;
        evidence.push({
          source: 'getOrder',
          toolUsed: 'getOrder',
          entity: orderData.id,
          fact: `Order ${orderData.id} total is ₹${orderData.totalAmount}, status is '${orderData.status}', shipping status is '${orderData.shippingStatus}'`,
          isObservedFact: true,
          timestamp: new Date().toISOString(),
        });

        // Step 4: Investigate Products & Check Inventory
        for (const item of orderData.items) {
          const invRes = await this.safeExecuteTool('checkInventory', { productId: item.productId }, input.agentRunId);
          if (invRes.success && invRes.data) {
            productsData.push({
              productId: item.productId,
              productName: item.productName,
              unitPrice: item.unitPrice,
              stockQuantity: invRes.data.stockQuantity,
              available: invRes.data.available,
            });

            evidence.push({
              source: 'checkInventory',
              toolUsed: 'checkInventory',
              entity: item.productId,
              fact: `Product '${item.productName}' inventory stock is ${invRes.data.stockQuantity} (${invRes.data.status})`,
              isObservedFact: true,
              timestamp: new Date().toISOString(),
            });

            if (!invRes.data.available && (input.intent.requestedResolution === 'REPLACEMENT' || input.intent.issueType === 'DAMAGED_ITEM')) {
              eligibilitySignals.push({
                signal: 'PRIMARY_REPLACEMENT_OUT_OF_STOCK',
                status: 'INELIGIBLE',
                details: `Primary ordered product '${item.productName}' is out of stock (Stock: 0)`,
              });
            }
          }
        }

        // Step 5: Check Policy Signals & Refund Eligibility
        const refundElig = await this.safeExecuteTool('checkRefundEligibility', {
          orderId: targetOrderId,
          context: { requestedAmount: input.intent.entities.amount || orderData.totalAmount },
        }, input.agentRunId);

        if (refundElig.success && refundElig.data) {
          eligibilitySignals.push({
            signal: 'REFUND_POLICY_CHECK',
            status: refundElig.data.approvalRequired ? 'REQUIRES_APPROVAL' : refundElig.data.eligible ? 'ELIGIBLE' : 'INELIGIBLE',
            details: refundElig.data.reason,
          });
        }
      } else {
        missingInfo.push('valid_order_record');
      }
    } else {
      missingInfo.push('orderId');
    }

    // Step 6: Determine Workflow NextStep Signal
    let nextStep: 'POLICY_EVALUATION' | 'NEEDS_INFORMATION' | 'ESCALATION' = 'POLICY_EVALUATION';
    if (missingInfo.includes('orderId') || missingInfo.includes('issue_clarification')) {
      nextStep = 'NEEDS_INFORMATION';
    } else if (eligibilitySignals.some((s) => s.status === 'REQUIRES_APPROVAL' && s.signal === 'FRAUD_RISK_FLAG')) {
      nextStep = 'ESCALATION';
    }

    const investigationSummary = `Investigation completed with ${evidence.length} ground-truth evidence facts aggregated across customer, order, inventory, and policy layers.`;

    const result: StructuredInvestigationResult = {
      intent: input.intent,
      customer: customerData,
      order: orderData,
      products: productsData,
      evidence,
      eligibilitySignals,
      missingInformation: Array.from(new Set(missingInfo)),
      investigationSummary,
      confidence: input.intent.confidence,
      nextStep,
    };

    // Persist AgentTrace if agentRunId is provided
    if (input.agentRunId) {
      await AgentStateRepository.appendTrace({
        agentRunId: input.agentRunId,
        step: 'INVESTIGATION',
        type: 'INVESTIGATION',
        title: 'Evidence-Backed Ground Truth Investigation',
        description: result.investigationSummary,
        input: { intent: input.intent.issueType, ticketId: targetTicketId, orderId: targetOrderId },
        output: result,
      }).catch(() => null);
    }

    return result;
  }
}
