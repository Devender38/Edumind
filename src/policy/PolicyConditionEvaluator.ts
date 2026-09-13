// ResolveX Deterministic Policy Condition Evaluator

import {
  PolicyEvaluationItem,
  PolicyConditions,
  StructuredInvestigationResult,
} from '../types/index.js';

export interface DBPolicy {
  id: string;
  name: string;
  issueType: string;
  actionType: string;
  conditions: string; // JSON string
  approvalRequired: boolean;
  priority: number;
  active: boolean;
}

export class PolicyConditionEvaluator {
  /**
   * Maps intent issue types to database policy issue types
   */
  private static isIssueTypeMatching(policyIssueType: string, intentIssueType: string): boolean {
    if (policyIssueType === intentIssueType) return true;
    
    // Normalize aliases
    const aliases: Record<string, string[]> = {
      'DAMAGED': ['DAMAGED_ITEM', 'DEFECTIVE_ITEM', 'REFUND_REQUEST', 'REPLACEMENT_REQUEST'],
      'DAMAGED_ITEM': ['DAMAGED', 'DEFECTIVE_ITEM', 'REFUND_REQUEST', 'REPLACEMENT_REQUEST'],
      'NOT_RECEIVED': ['MISSING_ITEM', 'LATE_DELIVERY', 'REFUND_REQUEST'],
      'MISSING_ITEM': ['NOT_RECEIVED', 'REFUND_REQUEST', 'REPLACEMENT_REQUEST'],
      'CANCEL_REQUEST': ['CANCELLATION_REQUEST'],
      'CANCELLATION_REQUEST': ['CANCEL_REQUEST'],
      'REFUND_REQUEST': ['DAMAGED', 'DAMAGED_ITEM', 'DEFECTIVE_ITEM', 'MISSING_ITEM', 'LATE_DELIVERY', 'REFUND_REQUEST'],
      'REPLACEMENT_REQUEST': ['DAMAGED', 'DAMAGED_ITEM', 'DEFECTIVE_ITEM', 'WRONG_ITEM', 'REPLACEMENT_REQUEST'],
    };

    if (aliases[policyIssueType]?.includes(intentIssueType)) return true;
    if (aliases[intentIssueType]?.includes(policyIssueType)) return true;

    return false;
  }

  /**
   * Evaluates a single database policy against investigation facts
   */
  public static evaluatePolicy(
    policy: DBPolicy,
    investigation: StructuredInvestigationResult
  ): PolicyEvaluationItem {
    const matchedConditions: string[] = [];
    const failedConditions: string[] = [];
    const constraints: string[] = [];

    const intent = investigation.intent;
    const order = investigation.order;
    const customer = investigation.customer;

    let isApplicable = true;
    let approvalRequired = policy.approvalRequired;

    // 1. Issue Type Check
    if (this.isIssueTypeMatching(policy.issueType, intent.issueType)) {
      matchedConditions.push(`Issue type matched: ${policy.issueType} ~ ${intent.issueType}`);
    } else {
      isApplicable = false;
      failedConditions.push(`Issue type mismatch: Policy requires ${policy.issueType}, detected ${intent.issueType}`);
    }

    // Parse JSON conditions stored in policy
    let parsedConditions: PolicyConditions = {};
    try {
      if (policy.conditions) {
        parsedConditions = typeof policy.conditions === 'string' ? JSON.parse(policy.conditions) : policy.conditions;
      }
    } catch {
      parsedConditions = {};
    }

    // 2. Amount / Threshold Constraints
    const requestedOrOrderAmount = intent.entities.amount || order?.totalAmount || 0;
    if (parsedConditions.maxAutoRefundAmount !== undefined && policy.actionType === 'REFUND') {
      if (requestedOrOrderAmount <= parsedConditions.maxAutoRefundAmount) {
        approvalRequired = false;
        matchedConditions.push(`Amount ₹${requestedOrOrderAmount} is within auto-refund limit of ₹${parsedConditions.maxAutoRefundAmount}`);
      } else {
        approvalRequired = true;
        constraints.push(`Amount ₹${requestedOrOrderAmount} exceeds automatic refund limit of ₹${parsedConditions.maxAutoRefundAmount}`);
        if (parsedConditions.requiresApprovalAbove) {
          matchedConditions.push(`Refund over limit requires manual/higher approval`);
        }
      }
    }

    // 3. Days Post Delivery Constraint
    if (parsedConditions.maxDaysPostDelivery !== undefined && order?.deliveryDate) {
      const deliveryDate = new Date(order.deliveryDate);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - deliveryDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays <= parsedConditions.maxDaysPostDelivery) {
        matchedConditions.push(`Delivered ${diffDays} days ago (within ${parsedConditions.maxDaysPostDelivery}-day policy limit)`);
      } else {
        isApplicable = false;
        failedConditions.push(`Delivered ${diffDays} days ago (exceeds ${parsedConditions.maxDaysPostDelivery}-day policy limit)`);
      }
    }

    // 4. Customer Tier Restrictions
    if (parsedConditions.allowedCustomerTiers && Array.isArray(parsedConditions.allowedCustomerTiers)) {
      const tier = customer?.tier || 'STANDARD';
      if (parsedConditions.allowedCustomerTiers.includes(tier)) {
        matchedConditions.push(`Customer tier '${tier}' is eligible under policy`);
      } else {
        isApplicable = false;
        failedConditions.push(`Customer tier '${tier}' not in allowed list [${parsedConditions.allowedCustomerTiers.join(', ')}]`);
      }
    }

    // 5. Replacement Preference Flag
    if (parsedConditions.preferReplacementFirst) {
      matchedConditions.push(`Policy prefers replacement resolution for damaged goods before issuing cash refund`);
    }

    // Determine reasoning message
    let reason = `${policy.name}: Policy applies for ${policy.actionType}.`;
    if (!isApplicable) {
      reason = `${policy.name}: Policy not applicable due to failed conditions [${failedConditions.join('; ')}].`;
    } else if (approvalRequired) {
      reason = `${policy.name}: Policy applies but requires manual approval due to constraints [${constraints.join('; ')}].`;
    }

    return {
      policyId: policy.id,
      policyName: policy.name,
      issueType: policy.issueType,
      actionType: policy.actionType,
      applicable: isApplicable,
      conditionsMatched: matchedConditions,
      conditionsFailed: failedConditions,
      constraints,
      approvalRequired,
      priority: policy.priority,
      reason,
    };
  }
}
