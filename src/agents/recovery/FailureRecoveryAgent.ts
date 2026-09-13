// ResolveX Failure Recovery & Autonomous Replanning Agent

import {
  ExecutionResult,
  StructuredInvestigationResult,
  DecisionResult,
  ReplanResult,
  ReplanStatus,
  FailureType,
  CandidateActionType,
  CandidateActionFeasibility,
} from '../../types/index.js';
import { InvestigationAgent } from '../investigation/InvestigationAgent.js';
import { PolicyEngine } from '../../policy/PolicyEngine.js';
import { DecisionEngine } from '../decision/DecisionEngine.js';
import { AgentStateRepository } from '../../db/repositories/agentStateRepository.js';

export interface FailureRecoveryInput {
  executionResult: ExecutionResult;
  investigationResult: StructuredInvestigationResult;
  decisionResult?: DecisionResult;
  options?: {
    agentRunId?: string;
    replanCount?: number;
    approvalToken?: string;
    customerConsentGiven?: boolean;
  };
}

export class FailureRecoveryAgent {
  public static readonly MAX_REPLAN_COUNT = 3;

  /**
   * Deterministic recovery entry point.
   * Classifies failure, executes fresh read-only investigation, re-evaluates policy/decision,
   * enforces safety boundaries (Approval Gate, Consent Gate, Replan Cap), and returns structured ReplanResult.
   */
  public static async replan(input: FailureRecoveryInput): Promise<ReplanResult> {
    const { executionResult, investigationResult, options } = input;
    const agentRunId = options?.agentRunId;
    let replanCount = options?.replanCount ?? 0;

    // 1. Success Case: Executed & Verified -> RESOLVED
    if (executionResult.status === 'EXECUTED' && executionResult.verificationStatus === 'SUCCESS') {
      if (agentRunId) {
        await AgentStateRepository.appendTrace({
          agentRunId,
          step: 'REPLANNING',
          type: 'RESULT',
          title: 'Case Resolved — No Replan Required',
          description: 'Action successfully executed and verified against database ground truth.',
          output: { status: 'RESOLVED' },
        }).catch(() => null);
      }

      return {
        status: 'RESOLVED',
        reason: 'Action successfully executed and verified against DB ground truth.',
        previousActionType: executionResult.actionType,
        shouldExecuteNextAction: false,
        replanCount,
        executionResult,
      };
    }

    // 2. Classify Failure Type
    const failureType = this.classifyFailure(executionResult);

    // Trace failure detection
    if (agentRunId) {
      await AgentStateRepository.appendTrace({
        agentRunId,
        step: 'REPLANNING',
        type: 'FAILURE_DETECTED',
        title: `Failure Detected: ${failureType}`,
        description: executionResult.reason || `Execution failed with status ${executionResult.status}`,
        input: { status: executionResult.status, actionType: executionResult.actionType, error: executionResult.error },
        output: { failureType },
      }).catch(() => null);
    }

    // 3. Approval Gate: APPROVAL_REQUIRED -> WAIT_FOR_APPROVAL
    if (failureType === 'APPROVAL_REQUIRED' || executionResult.status === 'APPROVAL_REQUIRED') {
      return {
        status: 'WAIT_FOR_APPROVAL',
        reason: executionResult.reason || 'Action requires human manager approval prior to execution.',
        failureType: 'APPROVAL_REQUIRED',
        previousActionType: executionResult.actionType,
        requiresApproval: true,
        shouldExecuteNextAction: false,
        replanCount,
        executionResult,
      };
    }

    // 4. Customer Consent Gate: CUSTOMER_CONSENT_REQUIRED -> WAIT_FOR_CUSTOMER_CONSENT
    if (failureType === 'CUSTOMER_CONSENT_REQUIRED' || executionResult.status === 'CUSTOMER_CONSENT_REQUIRED') {
      return {
        status: 'WAIT_FOR_CUSTOMER_CONSENT',
        reason: executionResult.reason || 'Action requires explicit customer substitution consent.',
        failureType: 'CUSTOMER_CONSENT_REQUIRED',
        previousActionType: executionResult.actionType,
        requiresCustomerConsent: true,
        shouldExecuteNextAction: false,
        replanCount,
        executionResult,
      };
    }

    // 5. Bounded Replan Limit Check
    if (agentRunId) {
      const updatedRun = await AgentStateRepository.replanAgentRun(agentRunId, executionResult.reason || failureType).catch(() => null);
      if (updatedRun) {
        replanCount = updatedRun.replanCount;
      } else {
        replanCount += 1;
      }
    } else {
      replanCount += 1;
    }

    if (replanCount > this.MAX_REPLAN_COUNT) {
      if (agentRunId) {
        await AgentStateRepository.appendTrace({
          agentRunId,
          step: 'HUMAN_ESCALATION',
          type: 'RECOVERY_ESCALATION',
          title: 'Max Autonomous Replan Limit Exceeded',
          description: `Replan count (${replanCount}) exceeds maximum limit (${this.MAX_REPLAN_COUNT}). Escalating to human agent.`,
          output: { status: 'ESCALATION_REQUIRED', replanCount },
        }).catch(() => null);

        await AgentStateRepository.updateAgentRunState(agentRunId, 'HUMAN_ESCALATION', 'ESCALATED').catch(() => null);
      }

      return {
        status: 'ESCALATION_REQUIRED',
        reason: `Maximum autonomous replan limit (${this.MAX_REPLAN_COUNT}) exceeded. Escalating case to human customer support.`,
        failureType,
        previousActionType: executionResult.actionType,
        shouldExecuteNextAction: false,
        replanCount,
        nextStep: 'HUMAN_ESCALATION',
        executionResult,
      };
    }

    // 6. Fresh Read-Only Investigation
    if (agentRunId) {
      await AgentStateRepository.appendTrace({
        agentRunId,
        step: 'REPLANNING',
        type: 'RECOVERY_INVESTIGATION',
        title: 'Executing Fresh Read-Only Investigation',
        description: 'Gathering updated ground-truth facts across inventory, order, and customer state.',
        input: { ticketId: investigationResult.intent.entities.orderId, orderId: investigationResult.order?.id },
      }).catch(() => null);
    }

    const freshInvestigation = await InvestigationAgent.investigate({
      intent: investigationResult.intent,
      ticketId: investigationResult.intent.entities.orderId,
      customerId: investigationResult.customer?.id,
      orderId: investigationResult.order?.id,
      agentRunId,
    });

    // 7. Policy Re-evaluation & Decision Formulation
    const freshPolicyEval = await PolicyEngine.evaluate(freshInvestigation, { agentRunId });
    const freshDecision = await DecisionEngine.decide(freshInvestigation, freshPolicyEval, { agentRunId });

    if (agentRunId) {
      await AgentStateRepository.appendTrace({
        agentRunId,
        step: 'REPLANNING',
        type: 'POLICY_REEVALUATION',
        title: 'Policy Re-evaluation & Decision Formulation Complete',
        description: `Formulated decision: ${freshDecision.selectedAction} (${freshDecision.decision}).`,
        input: { failureType, previousAction: executionResult.actionType },
        output: freshDecision,
      }).catch(() => null);
    }

    // 8. Deterministic Replan Evaluation & Candidate Selection
    const prevAction = executionResult.actionType;

    // Check if primary candidate action was requested as REPLACEMENT and failed with OUT_OF_STOCK or BLOCKED
    if ((failureType === 'OUT_OF_STOCK' || failureType === 'BLOCKED') && prevAction === 'REPLACEMENT') {
      // Find alternative SKU candidate in policy evaluation
      const altCandidate = freshPolicyEval.candidateActions.find(
        (c) => c.actionType === 'REPLACEMENT' && c.parameters?.isAlternativeSKU
      );

      if (altCandidate) {
        const requiresConsent =
          altCandidate.feasibility === 'REQUIRES_CUSTOMER_CONSENT' ||
          Boolean(altCandidate.parameters?.requiresCustomerConsent);

        const consentGiven = Boolean(options?.customerConsentGiven);

        if (requiresConsent && !consentGiven) {
          if (agentRunId) {
            await AgentStateRepository.appendTrace({
              agentRunId,
              step: 'REPLANNING',
              type: 'RECOVERY_DECISION',
              title: 'Alternative SKU Available: Customer Consent Required',
              description: altCandidate.reason,
              output: { status: 'WAIT_FOR_CUSTOMER_CONSENT', candidate: altCandidate },
            }).catch(() => null);
          }

          return {
            status: 'WAIT_FOR_CUSTOMER_CONSENT',
            reason: altCandidate.reason || 'Alternative product SKU is available in stock, but requires explicit customer consent.',
            failureType: 'OUT_OF_STOCK',
            previousActionType: 'REPLACEMENT',
            nextActionType: 'REPLACEMENT',
            nextActionFeasibility: 'REQUIRES_CUSTOMER_CONSENT',
            requiresCustomerConsent: true,
            shouldExecuteNextAction: false,
            investigation: freshInvestigation,
            decision: freshDecision,
            replanCount,
            nextStep: 'WAIT_FOR_CUSTOMER_CONSENT',
            executionResult,
          };
        } else if (consentGiven) {
          const altDecision: DecisionResult = {
            ...freshDecision,
            selectedAction: 'REPLACEMENT',
            decision: 'AUTONOMOUSLY_ALLOWED',
            approvalRequired: false,
            reason: 'Alternative SKU replacement selected with explicit customer consent.',
            alternatives: [altCandidate, ...freshDecision.alternatives],
          };

          return {
            status: 'REPLANNED',
            reason: `Primary SKU out of stock. Alternative SKU replacement selected with explicit customer consent.`,
            failureType: 'OUT_OF_STOCK',
            previousActionType: 'REPLACEMENT',
            nextActionType: 'REPLACEMENT',
            nextActionFeasibility: 'FEASIBLE',
            shouldExecuteNextAction: true,
            investigation: freshInvestigation,
            decision: altDecision,
            replanCount,
            nextStep: 'ACTION_EXECUTION',
            executionResult,
          };
        }
      }
    }

    // Evaluate candidate actions from fresh policy decision
    const nextActionType = freshDecision.selectedAction;

    if (freshDecision.decision === 'APPROVAL_REQUIRED' || freshDecision.approvalRequired) {
      return {
        status: 'WAIT_FOR_APPROVAL',
        reason: freshDecision.reason,
        failureType,
        previousActionType: prevAction,
        nextActionType,
        nextActionFeasibility: 'APPROVAL_REQUIRED',
        requiresApproval: true,
        shouldExecuteNextAction: false,
        investigation: freshInvestigation,
        decision: freshDecision,
        replanCount,
        nextStep: 'WAIT_FOR_APPROVAL',
        executionResult,
      };
    }

    if (freshDecision.decision === 'ESCALATION_REQUIRED' || nextActionType === 'ESCALATION') {
      if (agentRunId) {
        await AgentStateRepository.appendTrace({
          agentRunId,
          step: 'HUMAN_ESCALATION',
          type: 'RECOVERY_ESCALATION',
          title: 'Case Escalated to Support Agent',
          description: freshDecision.reason,
          output: { status: 'ESCALATION_REQUIRED' },
        }).catch(() => null);

        await AgentStateRepository.updateAgentRunState(agentRunId, 'HUMAN_ESCALATION', 'ESCALATED').catch(() => null);
      }

      return {
        status: 'ESCALATION_REQUIRED',
        reason: freshDecision.reason || 'No safe autonomous action eligible; escalated to support agent.',
        failureType,
        previousActionType: prevAction,
        nextActionType: 'ESCALATION',
        nextActionFeasibility: 'FEASIBLE',
        shouldExecuteNextAction: false,
        investigation: freshInvestigation,
        decision: freshDecision,
        replanCount,
        nextStep: 'HUMAN_ESCALATION',
        executionResult,
      };
    }

    if (freshDecision.decision === 'AUTONOMOUSLY_ALLOWED') {
      return {
        status: 'REPLANNED',
        reason: freshDecision.reason,
        failureType,
        previousActionType: prevAction,
        nextActionType,
        nextActionFeasibility: 'FEASIBLE',
        shouldExecuteNextAction: true,
        investigation: freshInvestigation,
        decision: freshDecision,
        replanCount,
        nextStep: 'ACTION_EXECUTION',
        executionResult,
      };
    }

    // Default Fallback: Escalation
    return {
      status: 'ESCALATION_REQUIRED',
      reason: 'No safe autonomous action available following failure recovery evaluation.',
      failureType,
      previousActionType: prevAction,
      shouldExecuteNextAction: false,
      investigation: freshInvestigation,
      decision: freshDecision,
      replanCount,
      nextStep: 'HUMAN_ESCALATION',
      executionResult,
    };
  }

  /**
   * Helper to classify ExecutionResult into standard FailureType
   */
  private static classifyFailure(executionResult: ExecutionResult): FailureType {
    if (executionResult.status === 'APPROVAL_REQUIRED') return 'APPROVAL_REQUIRED';
    if (executionResult.status === 'CUSTOMER_CONSENT_REQUIRED') return 'CUSTOMER_CONSENT_REQUIRED';
    if (executionResult.status === 'BLOCKED') return 'BLOCKED';
    if (executionResult.status === 'VERIFICATION_FAILED') return 'VERIFICATION_FAILED';

    if (executionResult.status === 'FAILED') {
      const errCode = executionResult.error?.code;
      if (errCode === 'OUT_OF_STOCK') return 'OUT_OF_STOCK';
      if (errCode === 'ACTION_NOT_FOUND') return 'ACTION_NOT_FOUND';
      if (errCode === 'VALIDATION_FAILURE') return 'VALIDATION_FAILURE';
      return 'TOOL_FAILURE';
    }

    return 'UNKNOWN_FAILURE';
  }
}
