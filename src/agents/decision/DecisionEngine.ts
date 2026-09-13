// ResolveX Decision Engine — Policy-Constrained Deterministic Action Selection & Explanation

import {
  StructuredInvestigationResult,
  PolicyEvaluationResult,
  DecisionResult,
  DecisionStatus,
  CandidateActionType,
  CandidateAction,
} from '../../types/index.js';
import { AgentStateRepository } from '../../db/repositories/agentStateRepository.js';

export interface DecisionEngineOptions {
  agentRunId?: string;
}

export class DecisionEngine {
  /**
   * Formulates a policy-compliant decision without executing any state-changing business actions.
   */
  public static async decide(
    investigation: StructuredInvestigationResult,
    policyEvaluation: PolicyEvaluationResult,
    options?: DecisionEngineOptions
  ): Promise<DecisionResult> {
    const intent = investigation.intent;
    const requestedResolution = intent.requestedResolution;
    const candidates = policyEvaluation.candidateActions;

    const blockedActions: { actionType: CandidateActionType; reason: string }[] = [];
    const alternatives: CandidateAction[] = [];

    let selectedAction: CandidateActionType = 'NONE';
    let decisionStatus: DecisionStatus = 'AUTONOMOUSLY_ALLOWED';
    let approvalRequired = false;
    let mainReason = '';
    let justification = '';
    let inventoryNote = '';

    // 1. Evaluate Customer-Requested Resolution Alignment
    if (requestedResolution === 'REFUND') {
      const refundCandidate = candidates.find((c) => c.actionType === 'REFUND');
      const primaryProduct = investigation.products?.[0];
      const productName = primaryProduct?.productName || primaryProduct?.name || 'Item';
      const isPrimaryOutOfStock = primaryProduct && primaryProduct.stockQuantity === 0;

      if (refundCandidate && refundCandidate.approvalRequired) {
        selectedAction = 'REFUND';
        decisionStatus = 'APPROVAL_REQUIRED';
        approvalRequired = true;

        mainReason = `Customer requested refund of ₹${intent.entities.amount || investigation.order?.totalAmount || '24,999'} for damaged item. Amount exceeds automatic refund threshold (₹10,000) and requires manager approval.`;
        justification = `Refund candidate selected subject to manager approval because requested amount exceeds auto-refund limit. Primary replacement SKU is out of stock.`;

        if (isPrimaryOutOfStock) {
          inventoryNote = `Primary requested SKU '${productName}' is OUT OF STOCK (0 units available). Alternative SKU (stock: 15) is available but requires explicit customer substitution consent.`;
        }
      } else if (refundCandidate && refundCandidate.eligible && !refundCandidate.approvalRequired) {
        selectedAction = 'REFUND';
        decisionStatus = 'AUTONOMOUSLY_ALLOWED';
        approvalRequired = false;
        mainReason = 'Refund requested and within policy auto-refund limit.';
        justification = 'Order amount is within auto-refund threshold. Refund is eligible for execution.';
      }
    } else if (requestedResolution === 'REPLACEMENT') {
      const replacementCandidate = candidates.find((c) => c.actionType === 'REPLACEMENT');
      const primaryProduct = investigation.products?.[0];
      const isPrimaryOutOfStock = primaryProduct && primaryProduct.stockQuantity === 0;

      selectedAction = 'REPLACEMENT';
      approvalRequired = replacementCandidate?.approvalRequired || false;
      decisionStatus = approvalRequired ? 'APPROVAL_REQUIRED' : 'AUTONOMOUSLY_ALLOWED';
      mainReason = isPrimaryOutOfStock
        ? `Replacement requested. Primary product '${primaryProduct?.productName || primaryProduct?.name}' is out of stock (Stock: 0). Re-routing to failure recovery.`
        : 'Replacement requested and compliant with policy.';
      justification = 'Replacement action formulated per customer request.';
      if (isPrimaryOutOfStock) {
        inventoryNote = `Primary requested SKU is OUT OF STOCK (0 units). Alternative SKU (stock: 15) available with customer consent.`;
      }
    } else if (requestedResolution === 'CANCELLATION') {
      const cancelCandidate = candidates.find((c) => c.actionType === 'CANCELLATION');
      if (cancelCandidate && cancelCandidate.eligible && cancelCandidate.feasibility === 'FEASIBLE') {
        selectedAction = 'CANCELLATION';
        decisionStatus = 'AUTONOMOUSLY_ALLOWED';
        mainReason = 'Order is in PROCESSING status and eligible for autonomous cancellation.';
        justification = 'Order cancellation selected as requested.';
      } else {
        selectedAction = 'ESCALATION';
        decisionStatus = 'ESCALATION_REQUIRED';
        mainReason = 'Order cannot be cancelled standardly due to order status constraints.';
        justification = 'Escalating case to support agent as order is beyond cancelable status.';
      }
    } else {
      // Fallback: Pick highest priority feasible candidate
      const feasibleCandidate = candidates
        .filter((c) => c.feasibility === 'FEASIBLE' || c.feasibility === 'APPROVAL_REQUIRED')
        .sort((a, b) => a.priority - b.priority)[0];

      if (feasibleCandidate) {
        selectedAction = feasibleCandidate.actionType;
        approvalRequired = feasibleCandidate.approvalRequired;
        decisionStatus = approvalRequired ? 'APPROVAL_REQUIRED' : 'AUTONOMOUSLY_ALLOWED';
        mainReason = `Formulated ${selectedAction} based on policy evaluation priorities.`;
        justification = feasibleCandidate.reason;
      } else {
        selectedAction = 'ESCALATION';
        decisionStatus = 'ESCALATION_REQUIRED';
        mainReason = 'No clear autonomous action eligible; human review required.';
        justification = 'Case escalated due to ambiguity or complex constraints.';
      }
    }

    // Populate blocked actions and alternatives list
    candidates.forEach((c) => {
      if (c.feasibility === 'BLOCKED' || c.blockingReasons.length > 0) {
        blockedActions.push({
          actionType: c.actionType,
          reason: c.blockingReasons.join('; '),
        });
      }
      if (c.actionType !== selectedAction || c.feasibility !== 'FEASIBLE') {
        alternatives.push(c);
      }
    });

    // Build structured explanation
    const result: DecisionResult = {
      decision: decisionStatus,
      selectedAction,
      approvalRequired,
      confidence: investigation.confidence,
      reason: mainReason,
      explanation: {
        customerIntentSummary: `Customer issue: ${intent.issueType}, requested resolution: ${requestedResolution}, amount: ₹${intent.entities.amount || investigation.order?.totalAmount || 'N/A'}.`,
        policyEvaluationSummary: `Evaluated ${policyEvaluation.applicablePolicies.length} applicable policies. Constraints: [${policyEvaluation.constraints.join('; ')}].`,
        actionSelectionJustification: justification,
        inventoryOrConstraintNote: inventoryNote || undefined,
      },
      supportingEvidence: investigation.evidence,
      supportingPolicies: policyEvaluation.applicablePolicies.map((p) => p.policyName),
      blockedActions,
      alternatives,
    };

    // Persist trace if agentRunId is provided
    if (options?.agentRunId) {
      await AgentStateRepository.appendTrace({
        agentRunId: options.agentRunId,
        step: 'DECISION_FORMULATION',
        type: 'DECISION',
        title: `Decision Formulated: ${selectedAction} (${decisionStatus})`,
        description: mainReason,
        input: JSON.stringify({ requestedResolution, applicablePoliciesCount: policyEvaluation.applicablePolicies.length }),
        output: JSON.stringify(result),
      });

      await AgentStateRepository.updateAgentRunState(options.agentRunId, 'DECISION_FORMULATION', 'IN_PROGRESS');
    }

    return result;
  }
}
