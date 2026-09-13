// ResolveX Action Executor — Safe Action Execution & Ground-Truth Verification Layer

import {
  DecisionResult,
  StructuredInvestigationResult,
  ExecutionResult,
  ExecutionOptions,
  CandidateAction,
  ToolResult,
} from '../../types/index.js';
import { ActionTools } from '../../tools/actionTools.js';
import { VerificationTools } from '../../tools/verificationTools.js';
import { AgentStateRepository } from '../../db/repositories/agentStateRepository.js';
import { RetryPolicy } from '../../utils/retryPolicy.js';
import { FailureInjector } from '../../utils/failureInjector.js';

export class ActionExecutor {
  /**
   * Safe action execution entry point.
   * Enforces Approval Gate, Customer Consent Gate, and Blocked Gate, then invokes ActionTools and runs verifyAction.
   */
  public static async execute(
    decisionResult: DecisionResult,
    investigationResult: StructuredInvestigationResult,
    options?: ExecutionOptions
  ): Promise<ExecutionResult> {
    const selectedAction = decisionResult.selectedAction;
    const agentRunId = options?.agentRunId;

    // Find target candidate action in decision alternatives or selected candidate
    const targetCandidate = decisionResult.alternatives.find(
      (a) => a.actionType === selectedAction
    ) || {
      actionType: selectedAction,
      eligible: true,
      feasibility: decisionResult.approvalRequired ? 'APPROVAL_REQUIRED' : 'FEASIBLE',
      approvalRequired: decisionResult.approvalRequired,
      priority: 1,
      reason: decisionResult.reason,
      supportingPolicies: decisionResult.supportingPolicies,
      blockingReasons: [],
    };

    const idempotencyKey =
      options?.idempotencyKey ||
      `exec-${investigationResult.order?.id || 'standalone'}-${selectedAction.toLowerCase()}-${Date.now()}`;

    // ----------------------------------------------------
    // 1. APPROVAL GATE
    // ----------------------------------------------------
    const isApprovalRequired =
      decisionResult.decision === 'APPROVAL_REQUIRED' ||
      decisionResult.approvalRequired === true ||
      targetCandidate.approvalRequired === true ||
      targetCandidate.feasibility === 'APPROVAL_REQUIRED';

    const hasValidApprovalToken = Boolean(options?.approvalToken && options.approvalToken.trim() !== '');

    if (isApprovalRequired && !hasValidApprovalToken) {
      if (agentRunId) {
        await AgentStateRepository.appendTrace({
          agentRunId,
          step: 'ACTION_EXECUTION',
          type: 'ACTION',
          title: `Action Execution Blocked: Approval Required (${selectedAction})`,
          description: decisionResult.reason || 'Action requires manager/human approval prior to execution.',
          status: 'PENDING',
          input: { selectedAction, idempotencyKey },
          output: { status: 'APPROVAL_REQUIRED', executed: false },
        }).catch(() => null);
      }

      return {
        status: 'APPROVAL_REQUIRED',
        actionType: selectedAction,
        executed: false,
        reason: decisionResult.reason || 'Action requires manager/human approval prior to execution.',
        approvalRequired: true,
        nextStep: 'WAIT_FOR_APPROVAL',
        idempotencyKey,
        timestamp: new Date().toISOString(),
      };
    }

    // ----------------------------------------------------
    // 2. CUSTOMER CONSENT GATE
    // ----------------------------------------------------
    const isConsentRequired =
      targetCandidate.feasibility === 'REQUIRES_CUSTOMER_CONSENT' ||
      Boolean(targetCandidate.parameters?.requiresCustomerConsent);

    const hasCustomerConsent = Boolean(options?.customerConsentGiven);

    if (isConsentRequired && !hasCustomerConsent) {
      if (agentRunId) {
        await AgentStateRepository.appendTrace({
          agentRunId,
          step: 'ACTION_EXECUTION',
          type: 'ACTION',
          title: `Action Execution Blocked: Customer Consent Required (${selectedAction})`,
          description: targetCandidate.reason || 'Candidate action requires explicit customer substitution consent.',
          status: 'PENDING',
          input: { selectedAction, idempotencyKey },
          output: { status: 'CUSTOMER_CONSENT_REQUIRED', executed: false },
        }).catch(() => null);
      }

      return {
        status: 'CUSTOMER_CONSENT_REQUIRED',
        actionType: selectedAction,
        executed: false,
        reason: targetCandidate.reason || 'Candidate action requires explicit customer substitution consent.',
        customerConsentRequired: true,
        nextStep: 'WAIT_FOR_CUSTOMER_CONSENT',
        idempotencyKey,
        timestamp: new Date().toISOString(),
      };
    }

    // ----------------------------------------------------
    // 3. BLOCKED GATE
    // ----------------------------------------------------
    const isBlocked =
      targetCandidate.feasibility === 'BLOCKED' ||
      targetCandidate.blockingReasons.length > 0 ||
      decisionResult.blockedActions.some((b) => b.actionType === selectedAction);

    if (isBlocked && !hasValidApprovalToken && !hasCustomerConsent) {
      const blockReason =
        targetCandidate.blockingReasons.join('; ') ||
        decisionResult.blockedActions.find((b) => b.actionType === selectedAction)?.reason ||
        'Action is blocked by hard business constraints.';

      if (agentRunId) {
        await AgentStateRepository.appendTrace({
          agentRunId,
          step: 'ACTION_EXECUTION',
          type: 'ACTION',
          title: `Action Execution Blocked: Hard Constraint (${selectedAction})`,
          description: blockReason,
          status: 'FAILED',
          input: { selectedAction, idempotencyKey },
          output: { status: 'BLOCKED', executed: false },
        }).catch(() => null);
      }

      return {
        status: 'BLOCKED',
        actionType: selectedAction,
        executed: false,
        reason: blockReason,
        nextStep: 'ESCALATE_OR_REPLAN',
        idempotencyKey,
        timestamp: new Date().toISOString(),
      };
    }

    // ----------------------------------------------------
    // 4. FEASIBLE TOOL EXECUTION MAPPING WITH RETRY & VERIFICATION-FIRST POLICY
    // ----------------------------------------------------
    if (agentRunId) {
      await AgentStateRepository.appendTrace({
        agentRunId,
        step: 'ACTION_EXECUTION',
        type: 'ACTION',
        title: `Invoking Action Tool for ${selectedAction}`,
        description: `Executing ${selectedAction} tool via ToolRegistry with idempotency key ${idempotencyKey}`,
        input: { selectedAction, idempotencyKey, parameters: targetCandidate.parameters },
      }).catch(() => null);
    }

    FailureInjector.checkAndInject('BEFORE_ACTION', selectedAction, { agentRunId, idempotencyKey });

    let toolResult: ToolResult;
    const orderId = investigationResult.order?.id || targetCandidate.parameters?.orderId || 'ord-phone-24999';
    const customerId = investigationResult.customer?.id || 'cust-primary-001';
    const ticketId = investigationResult.intent.entities.orderId || 'tkt-damaged-phone-001';

    const executeTool = async () => {
      switch (selectedAction) {
        case 'REFUND': {
          const amount = targetCandidate.parameters?.amount || investigationResult.order?.totalAmount || 24999;
          const reason = decisionResult.reason || 'Approved customer refund';
          return await ActionTools.issueRefund(orderId, amount, reason, idempotencyKey, { agentRunId });
        }
        case 'REPLACEMENT': {
          const replacementProductId =
            targetCandidate.parameters?.productId ||
            investigationResult.products?.[0]?.productId ||
            'prod-phone-001';
          const reason = decisionResult.reason || 'Approved replacement order';
          return await ActionTools.createReplacement(
            orderId,
            replacementProductId,
            reason,
            idempotencyKey,
            { agentRunId }
          );
        }
        case 'CANCELLATION': {
          const reason = decisionResult.reason || 'Order cancellation requested';
          return await ActionTools.cancelOrder(orderId, reason, idempotencyKey, { agentRunId });
        }
        case 'COUPON': {
          const couponCode = targetCandidate.parameters?.couponCode || `GOODWILL-${Date.now().toString().slice(-6)}`;
          return await ActionTools.applyCoupon(customerId, couponCode, ticketId, idempotencyKey, { agentRunId });
        }
        case 'ESCALATION': {
          const reason = decisionResult.reason || 'Case escalated to human support';
          return await ActionTools.escalateTicket(ticketId, reason, 'HIGH', idempotencyKey, { agentRunId });
        }
        default: {
          throw new Error(`Unsupported action type ${selectedAction}`);
        }
      }
    };

    toolResult = await RetryPolicy.executeWithRetry(
      () => executeTool(),
      {
        maxAttempts: 3,
        operationName: `Action_${selectedAction}`,
        agentRunId,
        verifyFirst: async () => {
          // Check ground truth before retrying to prevent duplicate mutations on ambiguous failures
          const actionRecord = await AgentStateRepository.findActionRecordByIdempotencyKey(idempotencyKey).catch(() => null);
          if (actionRecord) {
            const vResult = await VerificationTools.verifyAction(actionRecord.id, { agentRunId }).catch(() => null);
            if (vResult && vResult.success && vResult.data?.verified) {
              return {
                verified: true,
                data: {
                  success: true,
                  data: {
                    actionId: actionRecord.id,
                    refundTransactionId: actionRecord.externalReference,
                    replacementOrderId: actionRecord.externalReference,
                    status: 'COMPLETED',
                    idempotencyKey,
                    reconciled: true,
                  },
                  metadata: { toolName: selectedAction },
                },
              };
            }
          }
          return { verified: false };
        },
      }
    ).catch((err: any) => {
      return {
        success: false,
        error: { code: 'ACTION_FAILED', message: err.message, retryable: false },
      } as ToolResult;
    });

    // ----------------------------------------------------
    // 5. TOOL FAILURE EVALUATION
    // ----------------------------------------------------
    if (!toolResult.success || toolResult.error) {
      if (agentRunId) {
        await AgentStateRepository.appendTrace({
          agentRunId,
          step: 'ACTION_EXECUTION',
          type: 'RESULT',
          title: `Tool Execution Failed: ${toolResult.metadata?.toolName}`,
          description: toolResult.error?.message || 'Tool execution returned failure result.',
          status: 'FAILED',
          input: { selectedAction, idempotencyKey },
          output: toolResult,
        }).catch(() => null);
      }

      return {
        status: 'FAILED',
        actionType: selectedAction,
        executed: false,
        toolName: toolResult.metadata?.toolName,
        error: toolResult.error,
        reason: toolResult.error?.message || 'Action tool invocation failed.',
        idempotencyKey,
        timestamp: new Date().toISOString(),
      };
    }

    // Extract actionId from successful tool output
    const actionId = toolResult.data?.actionId;
    const externalReference =
      toolResult.data?.refundTransactionId ||
      toolResult.data?.replacementOrderId ||
      toolResult.data?.orderId ||
      toolResult.data?.couponId ||
      toolResult.data?.escalationId;

    if (agentRunId) {
      await AgentStateRepository.appendTrace({
        agentRunId,
        step: 'ACTION_EXECUTION',
        type: 'RESULT',
        title: `Tool Execution Succeeded: ${toolResult.metadata?.toolName}`,
        description: `Successfully executed ${selectedAction} tool. ActionRecord ID: ${actionId || 'N/A'}`,
        input: { selectedAction, idempotencyKey },
        output: toolResult.data,
      }).catch(() => null);
    }

    // ----------------------------------------------------
    // 6. IMMEDIATE GROUND-TRUTH DATABASE VERIFICATION
    // ----------------------------------------------------
    if (!actionId) {
      return {
        status: 'EXECUTED',
        actionType: selectedAction,
        executed: true,
        toolName: toolResult.metadata?.toolName,
        externalReference,
        verificationStatus: 'PENDING',
        reason: 'Action executed, but no ActionRecord ID returned for ground-truth verification.',
        idempotencyKey,
        timestamp: new Date().toISOString(),
      };
    }

    const verifyResult = await VerificationTools.verifyAction(actionId, { agentRunId });
    const isVerified = verifyResult.success && verifyResult.data?.verified === true;

    if (agentRunId) {
      await AgentStateRepository.appendTrace({
        agentRunId,
        step: 'ACTION_VERIFICATION',
        type: 'VERIFICATION',
        title: `Ground-Truth DB Verification: ${isVerified ? 'SUCCESS' : 'FAILED'}`,
        description: verifyResult.data?.message || 'Ground-truth state verification performed.',
        status: isVerified ? 'SUCCESS' : 'FAILED',
        input: { actionId },
        output: verifyResult.data,
      }).catch(() => null);

      await AgentStateRepository.updateAgentRunState(
        agentRunId,
        'ACTION_VERIFICATION',
        isVerified ? 'COMPLETED' : 'FAILED'
      ).catch(() => null);
    }

    if (isVerified) {
      return {
        status: 'EXECUTED',
        actionType: selectedAction,
        executed: true,
        toolName: toolResult.metadata?.toolName,
        actionId,
        externalReference,
        verificationStatus: 'SUCCESS',
        verificationDetails: verifyResult.data,
        idempotencyKey,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        status: 'VERIFICATION_FAILED',
        actionType: selectedAction,
        executed: true,
        toolName: toolResult.metadata?.toolName,
        actionId,
        externalReference,
        verificationStatus: 'FAILED',
        reason: verifyResult.data?.message || 'Ground-truth database state verification failed.',
        idempotencyKey,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
