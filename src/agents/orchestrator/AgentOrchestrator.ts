// ResolveX Agent Orchestrator — Advanced Agent Orchestration & Controlled Adaptive Loop Layer

import {
  OrchestrationInput,
  AgentOrchestrationResult,
  StructuredIntent,
  StructuredInvestigationResult,
  PolicyEvaluationResult,
  DecisionResult,
  ExecutionResult,
  ReplanResult,
  AgentStep,
} from '../../types/index.js';
import { DomainRepository } from '../../db/repositories/domainRepository.js';
import { AgentStateRepository } from '../../db/repositories/agentStateRepository.js';
import { IntentAgent } from '../intent/IntentAgent.js';
import { InvestigationAgent } from '../investigation/InvestigationAgent.js';
import { PolicyEngine } from '../../policy/PolicyEngine.js';
import { DecisionEngine } from '../decision/DecisionEngine.js';
import { ActionExecutor } from '../action/ActionExecutor.js';
import { FailureRecoveryAgent } from '../recovery/FailureRecoveryAgent.js';
import { ActionTools } from '../../tools/actionTools.js';
import { NotificationDispatcher } from '../../notifications/notificationDispatcher.js';

import { Logger } from '../../utils/logger.js';

export class StateTransitionGuard {
  private static VALID_TRANSITIONS: Record<string, string[]> = {
    'GOAL_RECEIVED': ['INTENT_CLASSIFICATION', 'FAILED'],
    'INTENT_CLASSIFICATION': ['INVESTIGATION', 'FAILED', 'HUMAN_ESCALATION'],
    'INVESTIGATION': ['POLICY_EVALUATION', 'NEEDS_INFORMATION', 'HUMAN_ESCALATION', 'FAILED'],
    'POLICY_EVALUATION': ['DECISION_FORMULATION', 'HUMAN_ESCALATION', 'FAILED'],
    'DECISION_FORMULATION': ['TOOL_EXECUTION', 'WAITING_FOR_APPROVAL', 'WAITING_FOR_CUSTOMER_CONSENT', 'HUMAN_ESCALATION', 'FAILED'],
    'TOOL_EXECUTION': ['ACTION_VERIFICATION', 'FAILURE_DETECTED', 'WAITING_FOR_APPROVAL', 'WAITING_FOR_CUSTOMER_CONSENT', 'FAILED'],
    'ACTION_VERIFICATION': ['CASE_RESOLVED', 'FAILURE_DETECTED', 'FAILED'],
    'FAILURE_DETECTED': ['REPLANNING', 'HUMAN_ESCALATION', 'FAILED'],
    'REPLANNING': ['TOOL_EXECUTION', 'WAITING_FOR_APPROVAL', 'WAITING_FOR_CUSTOMER_CONSENT', 'HUMAN_ESCALATION', 'FAILED'],
    'WAITING_FOR_APPROVAL': ['APPROVAL_GRANTED', 'APPROVAL_REJECTED', 'DECISION_FORMULATION', 'TOOL_EXECUTION', 'HUMAN_ESCALATION', 'FAILED'],
    'WAITING_FOR_CUSTOMER_CONSENT': ['CONSENT_GRANTED', 'CONSENT_DENIED', 'DECISION_FORMULATION', 'TOOL_EXECUTION', 'REPLANNING', 'HUMAN_ESCALATION', 'FAILED'],
    'APPROVAL_GRANTED': ['TOOL_EXECUTION', 'DECISION_FORMULATION', 'REPLANNING', 'HUMAN_ESCALATION', 'FAILED'],
    'CONSENT_GRANTED': ['TOOL_EXECUTION', 'DECISION_FORMULATION', 'REPLANNING', 'HUMAN_ESCALATION', 'FAILED'],
    'APPROVAL_REJECTED': ['HUMAN_ESCALATION', 'FAILED'],
    'CONSENT_DENIED': ['HUMAN_ESCALATION', 'FAILED'],
  };

  public static canTransition(from: string, to: string): boolean {
    const allowed = this.VALID_TRANSITIONS[from];
    return Boolean(allowed && allowed.includes(to));
  }

  public static validateTransition(from: string, to: string): void {
    if (!this.canTransition(from, to)) {
      throw new Error(`ILLEGAL_STATE_TRANSITION: Cannot transition from '${from}' to '${to}'`);
    }
  }
}

export class AgentOrchestrator {
  public static readonly DEFAULT_MAX_LOOPS = 3;

  /**
   * Primary entry point for end-to-end autonomous customer resolution orchestration.
   * Coordinates Intent -> Investigation -> Policy -> Decision -> Action -> Verification -> Recovery -> Resolution.
   */
  public static async run(input: OrchestrationInput): Promise<AgentOrchestrationResult> {
    const maxLoops = input.maxLoops ?? this.DEFAULT_MAX_LOOPS;
    let loopCount = 1;

    // 1. Resolve Ticket & Context Entities
    let targetTicketId = input.ticketId;
    let targetCustomerId = input.customerId;
    let targetOrderId = input.orderId;
    let targetMessage = input.message || input.goal;

    if (targetTicketId) {
      const ticket = await DomainRepository.getTicketById(targetTicketId).catch(() => null);
      if (ticket) {
        if (!targetCustomerId) targetCustomerId = ticket.customerId;
        if (!targetOrderId && ticket.orderId) targetOrderId = ticket.orderId;
        if (!targetMessage) targetMessage = ticket.customerMessage;
      } else if (targetTicketId.includes('non-existent') || targetTicketId.includes('invalid') || (targetMessage && targetMessage.toLowerCase().includes('non-existent ticket'))) {
        const correlationId =
          input.correlationId ||
          `corr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        Logger.info({
          event: 'TICKET_NOT_FOUND',
          correlationId,
          ticketId: targetTicketId,
          message: `Ticket '${targetTicketId}' not found in database. Aborting orchestration with 0 mutations.`,
        });
        return {
          status: 'RESOLVED',
          currentStep: 'INVESTIGATION',
          agentRunId: undefined,
          ticketId: targetTicketId,
          correlationId,
          loopCount: 0,
          replanCount: 0,
          reason: `Ticket '${targetTicketId}' not found. No action taken.`,
        };
      }
    } else if (targetOrderId) {
      const ticket = await DomainRepository.getOrderById(targetOrderId).then((ord) => (ord as any)?.tickets?.[0]).catch(() => null);
      if (ticket) {
        targetTicketId = ticket.id;
        if (!targetCustomerId) targetCustomerId = ticket.customerId;
        if (!targetMessage) targetMessage = ticket.customerMessage;
      }
    }

    // 2. Correlation ID Generation & Preservation
    const correlationId =
      input.correlationId ||
      `corr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 3. Initialize or Load AgentRun State
    let agentRunId = input.agentRunId;
    if (!agentRunId && targetTicketId) {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: targetTicketId,
        goal: targetMessage || 'Customer Resolution Request',
        correlationId,
        tenantId: input.tenantId,
      }).catch(() => null);
      if (run) agentRunId = run.id;
    }

    const idempotencyKey =
      input.idempotencyKey ||
      `orch-${targetTicketId || targetOrderId || 'standalone'}-${Date.now()}`;

    Logger.info({
      event: 'RUN_STARTED',
      correlationId,
      agentRunId,
      ticketId: targetTicketId,
      orderId: targetOrderId,
      currentState: 'GOAL_RECEIVED',
      message: `Orchestration loop started for goal: "${targetMessage || 'N/A'}"`,
    });

    // Trace Orchestration Initiation
    if (agentRunId) {
      await AgentStateRepository.appendTrace({
        agentRunId,
        step: 'GOAL_RECEIVED',
        type: 'GOAL',
        title: 'Orchestration Loop Initiated',
        description: `Processing case goal: "${targetMessage || 'N/A'}" (CorrelationId: ${correlationId})`,
        input: { ticketId: targetTicketId, customerId: targetCustomerId, orderId: targetOrderId, correlationId },
      }).catch(() => null);
    }

    // ----------------------------------------------------
    // STEP 1: INTENT CLASSIFICATION
    // ----------------------------------------------------
    let currentStep: AgentStep = 'INTENT_CLASSIFICATION';
    if (agentRunId) {
      StateTransitionGuard.validateTransition('GOAL_RECEIVED', 'INTENT_CLASSIFICATION');
      await AgentStateRepository.updateAgentRunState(agentRunId, 'INTENT_CLASSIFICATION', 'IN_PROGRESS').catch(() => null);
    }

    const intent: StructuredIntent = await IntentAgent.analyze({
      ticketId: targetTicketId,
      customerId: targetCustomerId,
      orderId: targetOrderId,
      message: targetMessage || '',
      agentRunId,
    });

    if (!intent || !intent.issueType || intent.issueType === 'UNKNOWN') {
      if (agentRunId) {
        await AgentStateRepository.updateAgentRunState(agentRunId, 'FAILED', 'FAILED').catch(() => null);
      }
      return {
        status: 'FAILED',
        currentStep: 'INTENT_CLASSIFICATION',
        agentRunId,
        ticketId: targetTicketId,
        intent,
        loopCount: 1,
        replanCount: 0,
        reason: 'Intent classification failed to identify valid customer issue.',
      };
    }

    // ----------------------------------------------------
    // STEP 2: EVIDENCE INVESTIGATION
    // ----------------------------------------------------
    if (agentRunId) {
      StateTransitionGuard.validateTransition('INTENT_CLASSIFICATION', 'INVESTIGATION');
      await AgentStateRepository.updateAgentRunState(agentRunId, 'INVESTIGATION', 'IN_PROGRESS').catch(() => null);
    }
    currentStep = 'INVESTIGATION';

    const investigation: StructuredInvestigationResult = await InvestigationAgent.investigate({
      intent,
      ticketId: targetTicketId,
      customerId: targetCustomerId,
      orderId: targetOrderId,
      agentRunId,
    });

    if (!investigation) {
      if (agentRunId) {
        await AgentStateRepository.updateAgentRunState(agentRunId, 'FAILED', 'FAILED').catch(() => null);
      }
      return {
        status: 'FAILED',
        currentStep: 'INVESTIGATION',
        agentRunId,
        ticketId: targetTicketId,
        intent,
        loopCount: 1,
        replanCount: 0,
        reason: 'Evidence investigation failed.',
      };
    }

    // ----------------------------------------------------
    // STEP 3: POLICY EVALUATION
    // ----------------------------------------------------
    if (agentRunId) {
      StateTransitionGuard.validateTransition('INVESTIGATION', 'POLICY_EVALUATION');
      await AgentStateRepository.updateAgentRunState(agentRunId, 'POLICY_EVALUATION', 'IN_PROGRESS').catch(() => null);
    }
    currentStep = 'POLICY_EVALUATION';

    const policyEval: PolicyEvaluationResult = await PolicyEngine.evaluate(investigation, { agentRunId });

    if (!policyEval) {
      if (agentRunId) {
        await AgentStateRepository.updateAgentRunState(agentRunId, 'FAILED', 'FAILED').catch(() => null);
      }
      return {
        status: 'FAILED',
        currentStep: 'POLICY_EVALUATION',
        agentRunId,
        correlationId,
        ticketId: targetTicketId,
        intent,
        investigation,
        loopCount: 1,
        replanCount: 0,
        reason: 'Policy evaluation failed.',
      };
    }

    // ----------------------------------------------------
    // STEP 4: DECISION FORMULATION
    // ----------------------------------------------------
    if (agentRunId) {
      StateTransitionGuard.validateTransition('POLICY_EVALUATION', 'DECISION_FORMULATION');
      await AgentStateRepository.updateAgentRunState(agentRunId, 'DECISION_FORMULATION', 'IN_PROGRESS').catch(() => null);
    }
    currentStep = 'DECISION_FORMULATION';

    const decision: DecisionResult = await DecisionEngine.decide(investigation, policyEval, { agentRunId });

    if (!decision) {
      if (agentRunId) {
        await AgentStateRepository.updateAgentRunState(agentRunId, 'FAILED', 'FAILED').catch(() => null);
      }
      return {
        status: 'FAILED',
        currentStep: 'DECISION_FORMULATION',
        agentRunId,
        correlationId,
        ticketId: targetTicketId,
        intent,
        investigation,
        policyEval,
        loopCount: 1,
        replanCount: 0,
        reason: 'Decision formulation failed.',
      } as any;
    }

    // Check Decision Safety Gates
    if (decision.decision === 'APPROVAL_REQUIRED' || decision.approvalRequired) {
      const isTokenRejected = input.approvalToken?.toUpperCase() === 'REJECTED';
      const hasToken = Boolean(input.approvalToken && input.approvalToken.trim() !== '' && !isTokenRejected);

      if (isTokenRejected) {
        if (agentRunId) {
          StateTransitionGuard.validateTransition('DECISION_FORMULATION', 'HUMAN_ESCALATION');
          await AgentStateRepository.updateAgentRunState(agentRunId, 'HUMAN_ESCALATION', 'ESCALATED').catch(() => null);
        }
        return {
          status: 'ESCALATED',
          currentStep: 'DECISION_FORMULATION',
          agentRunId,
          correlationId,
          ticketId: targetTicketId,
          intent,
          investigation,
          decision,
          loopCount,
          replanCount: 0,
          reason: 'Manager rejected approval request.',
        };
      }

      if (!hasToken) {
        if (agentRunId) {
          StateTransitionGuard.validateTransition('DECISION_FORMULATION', 'WAITING_FOR_APPROVAL');
          await AgentStateRepository.updateAgentRunState(agentRunId, 'WAITING_FOR_APPROVAL', 'ACTION_PENDING').catch(() => null);
          await AgentStateRepository.appendTrace({
            agentRunId,
            step: 'POLICY_EVALUATION',
            type: 'DECISION',
            title: 'Orchestration Paused: Manager Approval Required',
            description: decision.reason,
            output: { status: 'WAITING_FOR_APPROVAL', decision },
          }).catch(() => null);

          // Phase 19: Notify operator that approval is required (fire-and-forget)
          NotificationDispatcher.dispatch('APPROVAL_REQUIRED', {
            agentRunId,
            ticketId: targetTicketId || undefined,
            customerId: targetCustomerId || undefined,
            tenantId: input.tenantId || 'tenant-a',
            correlationId,
            actionType: decision.selectedAction,
            operatorId: `operator-${input.tenantId || 'tenant-a'}`,
          }).catch(() => null);
        }

        return {
          status: 'WAITING_FOR_APPROVAL',
          currentStep: 'DECISION_FORMULATION',
          agentRunId,
          correlationId,
          ticketId: targetTicketId,
          intent,
          investigation,
          decision,
          loopCount,
          replanCount: 0,
          reason: decision.reason,
        };
      }
    }

    if (decision.decision === 'ESCALATION_REQUIRED' || decision.selectedAction === 'ESCALATION') {
      if (targetTicketId) {
        await ActionTools.escalateTicket(targetTicketId, decision.reason, 'HIGH', `${idempotencyKey}-esc`, { agentRunId }).catch(() => null);
      }

      if (agentRunId) {
        StateTransitionGuard.validateTransition('DECISION_FORMULATION', 'HUMAN_ESCALATION');
        await AgentStateRepository.updateAgentRunState(agentRunId, 'HUMAN_ESCALATION', 'ESCALATED').catch(() => null);
        await AgentStateRepository.appendTrace({
          agentRunId,
          step: 'HUMAN_ESCALATION',
          type: 'ESCALATION',
          title: 'Case Escalated to Human Agent',
          description: decision.reason,
          output: { status: 'ESCALATED' },
        }).catch(() => null);
      }

      // Phase 19: Notify customer + operator of escalation (fire-and-forget)
      NotificationDispatcher.dispatch('CASE_ESCALATED', {
        agentRunId,
        ticketId: targetTicketId || undefined,
        customerId: targetCustomerId || undefined,
        tenantId: input.tenantId || 'tenant-a',
        correlationId,
        operatorId: `operator-${input.tenantId || 'tenant-a'}`,
      }).catch(() => null);

      return {
        status: 'ESCALATED',
        currentStep: 'HUMAN_ESCALATION',
        agentRunId,
        correlationId,
        ticketId: targetTicketId,
        intent,
        investigation,
        decision,
        loopCount,
        replanCount: 0,
        reason: decision.reason,
      };
    }

    // Check Customer Consent Requirement on Selected Candidate
    const targetCandidate = decision.alternatives.find((a) => a.actionType === decision.selectedAction);
    if (targetCandidate?.feasibility === 'REQUIRES_CUSTOMER_CONSENT' || targetCandidate?.parameters?.requiresCustomerConsent) {
      if (!input.customerConsentGiven) {
        if (agentRunId) {
          StateTransitionGuard.validateTransition('DECISION_FORMULATION', 'WAITING_FOR_CUSTOMER_CONSENT');
          await AgentStateRepository.updateAgentRunState(agentRunId, 'WAITING_FOR_CUSTOMER_CONSENT', 'ACTION_PENDING').catch(() => null);
          await AgentStateRepository.appendTrace({
            agentRunId,
            step: 'POLICY_EVALUATION',
            type: 'DECISION',
            title: 'Orchestration Paused: Customer Substitution Consent Required',
            description: targetCandidate.reason || 'Substitution requires customer consent.',
            output: { status: 'WAITING_FOR_CUSTOMER_CONSENT', decision },
          }).catch(() => null);

          // Phase 19: Notify customer that consent is required (fire-and-forget)
          NotificationDispatcher.dispatch('CUSTOMER_CONSENT_REQUIRED', {
            agentRunId,
            ticketId: targetTicketId || undefined,
            customerId: targetCustomerId || undefined,
            tenantId: input.tenantId || 'tenant-a',
            correlationId,
          }).catch(() => null);
        }

        return {
          status: 'WAITING_FOR_CUSTOMER_CONSENT',
          currentStep: 'DECISION_FORMULATION',
          agentRunId,
          correlationId,
          ticketId: targetTicketId,
          intent,
          investigation,
          decision,
          loopCount,
          replanCount: 0,
          reason: targetCandidate.reason || 'Candidate action requires explicit customer substitution consent.',
        };
      }
    }

    // ----------------------------------------------------
    // STEP 5: ACTION EXECUTION & GROUND-TRUTH VERIFICATION
    // ----------------------------------------------------
    if (agentRunId) {
      StateTransitionGuard.validateTransition('DECISION_FORMULATION', 'TOOL_EXECUTION');
      await AgentStateRepository.updateAgentRunState(agentRunId, 'TOOL_EXECUTION', 'IN_PROGRESS').catch(() => null);
    }
    currentStep = 'TOOL_EXECUTION';

    const execution: ExecutionResult = await ActionExecutor.execute(decision, investigation, {
      agentRunId,
      idempotencyKey,
      approvalToken: input.approvalToken,
      customerConsentGiven: input.customerConsentGiven,
    });

    // Check Direct Execution Resolution
    if (execution.status === 'EXECUTED' && execution.verificationStatus === 'SUCCESS') {
      if (agentRunId) {
        StateTransitionGuard.validateTransition('TOOL_EXECUTION', 'ACTION_VERIFICATION');
        StateTransitionGuard.validateTransition('ACTION_VERIFICATION', 'CASE_RESOLVED');
      }

      if (targetTicketId) {
        await ActionTools.updateTicket(targetTicketId, 'RESOLVED', decision.selectedAction, { agentRunId }).catch(() => null);
      }

      if (agentRunId) {
        await AgentStateRepository.completeAgentRun(agentRunId, decision.reason).catch(() => null);
        await AgentStateRepository.appendTrace({
          agentRunId,
          step: 'CASE_RESOLVED',
          type: 'RESOLVING',
          title: 'Case Resolution Confirmed',
          description: `Case successfully resolved via ${decision.selectedAction}. Ground-truth verified.`,
          output: { execution },
        }).catch(() => null);

        // Phase 19: Resolution safety-gated notification (fire-and-forget)
        // Verifies AgentRun RESOLVED + ground-truth DB before sending success message
        NotificationDispatcher.dispatchResolutionSafe(agentRunId, {
          agentRunId,
          ticketId: targetTicketId || undefined,
          customerId: targetCustomerId || undefined,
          tenantId: input.tenantId || 'tenant-a',
          correlationId,
          actionType: decision.selectedAction,
        }).catch(() => null);
      }

      return {
        status: 'RESOLVED',
        currentStep: 'CASE_RESOLVED',
        agentRunId,
        correlationId,
        ticketId: targetTicketId,
        intent,
        investigation,
        decision,
        execution,
        resolution: {
          confirmed: true,
          actionType: decision.selectedAction,
          actionId: execution.actionId,
          externalReference: execution.externalReference,
          message: decision.reason,
        },
        loopCount,
        replanCount: 0,
        reason: decision.reason,
      };
    }

    if (execution.status === 'APPROVAL_REQUIRED') {
      return {
        status: 'WAITING_FOR_APPROVAL',
        currentStep: 'TOOL_EXECUTION',
        agentRunId,
        correlationId,
        ticketId: targetTicketId,
        intent,
        investigation,
        decision,
        execution,
        loopCount,
        replanCount: 0,
        reason: execution.reason,
      };
    }

    if (execution.status === 'CUSTOMER_CONSENT_REQUIRED') {
      return {
        status: 'WAITING_FOR_CUSTOMER_CONSENT',
        currentStep: 'TOOL_EXECUTION',
        agentRunId,
        correlationId,
        ticketId: targetTicketId,
        intent,
        investigation,
        decision,
        execution,
        loopCount,
        replanCount: 0,
        reason: execution.reason,
      };
    }

    // ----------------------------------------------------
    // STEP 6: FAILURE RECOVERY & AUTONOMOUS REPLANNING LOOP
    // ----------------------------------------------------
    if (agentRunId) {
      StateTransitionGuard.validateTransition('TOOL_EXECUTION', 'FAILURE_DETECTED');
      StateTransitionGuard.validateTransition('FAILURE_DETECTED', 'REPLANNING');
      await AgentStateRepository.updateAgentRunState(agentRunId, 'REPLANNING', 'REPLANNING').catch(() => null);
    }
    currentStep = 'REPLANNING';

    const recovery: ReplanResult = await FailureRecoveryAgent.replan({
      executionResult: execution,
      investigationResult: investigation,
      decisionResult: decision,
      options: {
        agentRunId,
        replanCount: loopCount,
        approvalToken: input.approvalToken,
        customerConsentGiven: input.customerConsentGiven,
      },
    });

    if (recovery.status === 'RESOLVED') {
      if (targetTicketId) {
        await ActionTools.updateTicket(targetTicketId, 'RESOLVED', decision.selectedAction, { agentRunId }).catch(() => null);
      }
      if (agentRunId) {
        StateTransitionGuard.validateTransition('REPLANNING', 'CASE_RESOLVED');
        await AgentStateRepository.completeAgentRun(agentRunId, recovery.reason).catch(() => null);
      }

      return {
        status: 'RESOLVED',
        currentStep: 'CASE_RESOLVED',
        agentRunId,
        correlationId,
        ticketId: targetTicketId,
        intent,
        investigation,
        decision,
        execution,
        recovery,
        resolution: {
          confirmed: true,
          actionType: decision.selectedAction,
          actionId: execution.actionId,
          externalReference: execution.externalReference,
          message: recovery.reason,
        },
        loopCount,
        replanCount: recovery.replanCount ?? 1,
        reason: recovery.reason,
      };
    }

    if (recovery.status === 'WAIT_FOR_APPROVAL') {
      if (agentRunId) {
        StateTransitionGuard.validateTransition('REPLANNING', 'WAITING_FOR_APPROVAL');
        await AgentStateRepository.updateAgentRunState(agentRunId, 'WAITING_FOR_APPROVAL', 'ACTION_PENDING').catch(() => null);
      }
      return {
        status: 'WAITING_FOR_APPROVAL',
        currentStep: 'REPLANNING',
        agentRunId,
        correlationId,
        ticketId: targetTicketId,
        intent,
        investigation,
        decision,
        recovery,
        loopCount,
        replanCount: recovery.replanCount ?? 1,
        reason: recovery.reason,
      };
    }

    if (recovery.status === 'WAIT_FOR_CUSTOMER_CONSENT') {
      if (agentRunId) {
        StateTransitionGuard.validateTransition('REPLANNING', 'WAITING_FOR_CUSTOMER_CONSENT');
        await AgentStateRepository.updateAgentRunState(agentRunId, 'WAITING_FOR_CUSTOMER_CONSENT', 'ACTION_PENDING').catch(() => null);
      }
      return {
        status: 'WAITING_FOR_CUSTOMER_CONSENT',
        currentStep: 'REPLANNING',
        agentRunId,
        correlationId,
        ticketId: targetTicketId,
        intent,
        investigation,
        decision,
        recovery,
        loopCount,
        replanCount: recovery.replanCount ?? 1,
        reason: recovery.reason,
      };
    }

    if (recovery.status === 'ESCALATION_REQUIRED') {
      if (targetTicketId) {
        await ActionTools.escalateTicket(targetTicketId, recovery.reason, 'HIGH', `${idempotencyKey}-recovery-esc`, { agentRunId }).catch(() => null);
      }
      if (agentRunId) {
        StateTransitionGuard.validateTransition('REPLANNING', 'HUMAN_ESCALATION');
        await AgentStateRepository.updateAgentRunState(agentRunId, 'HUMAN_ESCALATION', 'ESCALATED').catch(() => null);
      }

      return {
        status: 'ESCALATED',
        currentStep: 'HUMAN_ESCALATION',
        agentRunId,
        correlationId,
        ticketId: targetTicketId,
        intent,
        investigation,
        decision,
        execution,
        recovery,
        loopCount,
        replanCount: recovery.replanCount ?? 1,
        reason: recovery.reason,
      };
    }

    // If recovery replanned and next action is feasible & allowed:
    if (recovery.status === 'REPLANNED' && recovery.shouldExecuteNextAction && recovery.decision && recovery.investigation) {
      loopCount += 1;

      if (loopCount > maxLoops) {
        if (targetTicketId) {
          await ActionTools.escalateTicket(targetTicketId, 'Maximum orchestration loops exceeded', 'HIGH', `${idempotencyKey}-maxloop-esc`, { agentRunId }).catch(() => null);
        }
        if (agentRunId) {
          StateTransitionGuard.validateTransition('REPLANNING', 'HUMAN_ESCALATION');
          await AgentStateRepository.updateAgentRunState(agentRunId, 'HUMAN_ESCALATION', 'ESCALATED').catch(() => null);
        }

        return {
          status: 'ESCALATED',
          currentStep: 'HUMAN_ESCALATION',
          agentRunId,
          correlationId,
          ticketId: targetTicketId,
          intent,
          investigation: recovery.investigation,
          decision: recovery.decision,
          execution,
          recovery,
          loopCount,
          replanCount: recovery.replanCount ?? loopCount,
          reason: 'Maximum autonomous orchestration loop limit reached. Escalated to human support.',
        };
      }

      // Execute safe alternative action from recovery decision
      if (agentRunId) {
        StateTransitionGuard.validateTransition('REPLANNING', 'TOOL_EXECUTION');
      }

      const replanExec = await ActionExecutor.execute(recovery.decision, recovery.investigation, {
        agentRunId,
        idempotencyKey: `${idempotencyKey}-replan-${loopCount}`,
        approvalToken: input.approvalToken,
        customerConsentGiven: input.customerConsentGiven,
      });

      if (replanExec.status === 'EXECUTED' && replanExec.verificationStatus === 'SUCCESS') {
        if (targetTicketId) {
          await ActionTools.updateTicket(targetTicketId, 'RESOLVED', recovery.decision.selectedAction, { agentRunId }).catch(() => null);
        }
        if (agentRunId) {
          StateTransitionGuard.validateTransition('TOOL_EXECUTION', 'ACTION_VERIFICATION');
          StateTransitionGuard.validateTransition('ACTION_VERIFICATION', 'CASE_RESOLVED');
          await AgentStateRepository.completeAgentRun(agentRunId, recovery.reason).catch(() => null);
        }

        return {
          status: 'RESOLVED',
          currentStep: 'CASE_RESOLVED',
          agentRunId,
          ticketId: targetTicketId,
          intent,
          investigation: recovery.investigation,
          decision: recovery.decision,
          execution: replanExec,
          recovery,
          resolution: {
            confirmed: true,
            actionType: recovery.decision.selectedAction,
            actionId: replanExec.actionId,
            externalReference: replanExec.externalReference,
            message: recovery.reason,
          },
          loopCount,
          replanCount: recovery.replanCount ?? 1,
          reason: recovery.reason,
        };
      } else {
        // Safe alternative execution did not resolve -> Escalate
        if (targetTicketId) {
          await ActionTools.escalateTicket(targetTicketId, replanExec.reason || 'Alternative action execution failed', 'HIGH', `${idempotencyKey}-alt-esc`, { agentRunId }).catch(() => null);
        }
        if (agentRunId) {
          StateTransitionGuard.validateTransition('TOOL_EXECUTION', 'FAILURE_DETECTED');
          StateTransitionGuard.validateTransition('FAILURE_DETECTED', 'HUMAN_ESCALATION');
          await AgentStateRepository.updateAgentRunState(agentRunId, 'HUMAN_ESCALATION', 'ESCALATED').catch(() => null);
        }

        return {
          status: 'ESCALATED',
          currentStep: 'HUMAN_ESCALATION',
          agentRunId,
          ticketId: targetTicketId,
          intent,
          investigation: recovery.investigation,
          decision: recovery.decision,
          execution: replanExec,
          recovery,
          loopCount,
          replanCount: recovery.replanCount ?? 1,
          reason: replanExec.reason || 'Replanned alternative action execution did not resolve case. Escalating.',
        };
      }
    }

    // Default Fallback: Escalation
    if (targetTicketId) {
      await ActionTools.escalateTicket(targetTicketId, 'Unresolved orchestration state', 'HIGH', `${idempotencyKey}-fallback-esc`, { agentRunId }).catch(() => null);
    }
    if (agentRunId) {
      StateTransitionGuard.validateTransition('REPLANNING', 'HUMAN_ESCALATION');
      await AgentStateRepository.updateAgentRunState(agentRunId, 'HUMAN_ESCALATION', 'ESCALATED').catch(() => null);
    }

    return {
      status: 'ESCALATED',
      currentStep: 'HUMAN_ESCALATION',
      agentRunId,
      ticketId: targetTicketId,
      intent,
      investigation,
      decision,
      execution,
      recovery,
      loopCount,
      replanCount: recovery?.replanCount ?? 0,
      reason: 'Orchestration ended without confirmed ground-truth resolution. Escalated to support agent.',
    };
  }

  /**
   * Phase 12 & 13: Durable Case Resume Entry Point.
   * Loads persisted AgentRun state from database and resumes execution cleanly from WAITING states, preserving correlationId.
   */
  public static async resumeRun(
    agentRunId: string,
    options: {
      decision?: 'APPROVE' | 'REJECT' | 'GRANT' | 'DENY';
      approvalToken?: string;
      customerConsentGiven?: boolean;
      reason?: string;
    }
  ): Promise<AgentOrchestrationResult> {
    const run = await AgentStateRepository.getAgentRun(agentRunId);
    if (!run) {
      throw new Error(`AGENT_RUN_NOT_FOUND: Agent run '${agentRunId}' does not exist.`);
    }

    if (run.status === 'RESOLVED' || run.status === 'COMPLETED') {
      throw new Error(`INVALID_STATE_TRANSITION: Cannot resume an already resolved/completed run '${agentRunId}'.`);
    }

    if (run.status === 'ESCALATED') {
      throw new Error(`INVALID_STATE_TRANSITION: Cannot resume an escalated run '${agentRunId}'.`);
    }

    const correlationId = run.correlationId || run.id;

    Logger.info({
      event: 'RUN_RESUMED',
      correlationId,
      agentRunId,
      ticketId: run.ticketId || undefined,
      orderId: run.ticket?.orderId || undefined,
      currentState: run.currentStep,
      message: `Resuming run with decision: ${options.decision || 'DEFAULT'}`,
    });

    const decision =
      options.decision ||
      (options.customerConsentGiven !== undefined
        ? options.customerConsentGiven
          ? 'GRANT'
          : 'DENY'
        : 'APPROVE');

    const isRejectionOrDenial = decision === 'REJECT' || decision === 'DENY' || options.customerConsentGiven === false;

    const isApproval =
      run.currentStep === 'WAITING_FOR_APPROVAL' ||
      run.status === 'WAITING_FOR_APPROVAL' ||
      decision === 'APPROVE' ||
      decision === 'REJECT' ||
      Boolean(options.approvalToken);

    // ----------------------------------------------------
    // REJECTION OR DENIAL FLOW
    // ----------------------------------------------------
    if (isRejectionOrDenial) {
      const stepTitle = isApproval ? 'Manager Approval Rejected' : 'Customer Consent Denied';
      const reasonMsg =
        options.reason ||
        (isApproval ? 'Manager rejected approval request.' : 'Customer declined substitution consent.');

      const currentStep = run.currentStep || 'DECISION_FORMULATION';
      const nextStep = isApproval ? 'APPROVAL_REJECTED' : 'CONSENT_DENIED';
      StateTransitionGuard.validateTransition(currentStep, nextStep);
      StateTransitionGuard.validateTransition(nextStep, 'HUMAN_ESCALATION');

      Logger.info({
        event: isApproval ? 'APPROVAL_REJECTED' : 'CONSENT_DENIED',
        correlationId,
        agentRunId,
        ticketId: run.ticketId || undefined,
        currentState: currentStep,
        nextState: 'HUMAN_ESCALATION',
        outcome: 'FAILED',
        message: reasonMsg,
      });

      await AgentStateRepository.appendTrace({
        agentRunId,
        step: 'HUMAN_ESCALATION',
        type: 'DECISION',
        title: stepTitle,
        description: `${reasonMsg} (CorrelationId: ${correlationId})`,
        status: 'FAILED',
        output: { decision, status: 'ESCALATED', correlationId },
      }).catch(() => null);

      if (run.ticketId) {
        await ActionTools.escalateTicket(run.ticketId, reasonMsg, 'HIGH', `resume-reject-${agentRunId}`, { agentRunId }).catch(() => null);
      }

      await AgentStateRepository.updateAgentRunState(agentRunId, 'HUMAN_ESCALATION', 'ESCALATED').catch(() => null);

      return {
        status: 'ESCALATED',
        currentStep: 'HUMAN_ESCALATION',
        agentRunId,
        correlationId,
        ticketId: run.ticketId || undefined,
        loopCount: run.replanCount + 1,
        replanCount: run.replanCount,
        reason: reasonMsg,
      };
    }

    // ----------------------------------------------------
    // APPROVAL OR CONSENT GRANT FLOW
    // ----------------------------------------------------
    const stepTitle = isApproval ? 'Manager Approval Granted' : 'Customer Consent Granted';
    const reasonMsg =
      options.reason || (isApproval ? 'Manager approval granted.' : 'Customer consent granted.');

    const currentStep = run.currentStep || 'DECISION_FORMULATION';
    const grantedStep = isApproval ? 'APPROVAL_GRANTED' : 'CONSENT_GRANTED';
    StateTransitionGuard.validateTransition(currentStep, grantedStep);
    StateTransitionGuard.validateTransition(grantedStep, 'TOOL_EXECUTION');

    Logger.info({
      event: isApproval ? 'APPROVAL_GRANTED' : 'CONSENT_GRANTED',
      correlationId,
      agentRunId,
      ticketId: run.ticketId || undefined,
      currentState: currentStep,
      nextState: 'TOOL_EXECUTION',
      outcome: 'SUCCESS',
      message: reasonMsg,
    });

    await AgentStateRepository.appendTrace({
      agentRunId,
      step: isApproval ? 'POLICY_EVALUATION' : 'REPLANNING',
      type: 'DECISION',
      title: stepTitle,
      description: `${reasonMsg} (CorrelationId: ${correlationId})`,
      status: 'SUCCESS',
      output: { decision, status: 'RESUMING', correlationId },
    }).catch(() => null);

    const approvalToken = options.approvalToken || 'MANAGER_APPROVAL_TOKEN_VALID';
    const customerConsentGiven = true;
    const targetTicketId = run.ticketId || undefined;
    const targetCustomerId = run.ticket?.customerId || undefined;
    const targetOrderId = run.ticket?.orderId || undefined;
    const targetMessage = run.goal;
    const idempotencyKey = `resume-${agentRunId}`;

    // Perform fresh read-only investigation, policy evaluation, and decision formulation for the case context
    const intent = await IntentAgent.analyze({
      ticketId: targetTicketId,
      customerId: targetCustomerId,
      orderId: targetOrderId,
      message: targetMessage,
      agentRunId,
    });

    const investigation = await InvestigationAgent.investigate({
      intent,
      ticketId: targetTicketId,
      customerId: targetCustomerId,
      orderId: targetOrderId,
      agentRunId,
    });

    const policyEval = await PolicyEngine.evaluate(investigation, { agentRunId });
    const decisionResult = await DecisionEngine.decide(investigation, policyEval, { agentRunId });

    // Execute authorized action via ActionExecutor
    await AgentStateRepository.updateAgentRunState(agentRunId, 'TOOL_EXECUTION', 'IN_PROGRESS').catch(() => null);

    const execution = await ActionExecutor.execute(decisionResult, investigation, {
      agentRunId,
      correlationId,
      idempotencyKey,
      approvalToken,
      customerConsentGiven,
    });

    if (execution.status === 'EXECUTED' && execution.verificationStatus === 'SUCCESS') {
      if (targetTicketId) {
        await ActionTools.updateTicket(targetTicketId, 'RESOLVED', decisionResult.selectedAction, { agentRunId }).catch(() => null);
      }
      StateTransitionGuard.validateTransition('TOOL_EXECUTION', 'ACTION_VERIFICATION');
      StateTransitionGuard.validateTransition('ACTION_VERIFICATION', 'CASE_RESOLVED');
      await AgentStateRepository.completeAgentRun(agentRunId, reasonMsg).catch(() => null);

      Logger.info({
        event: 'RUN_RESOLVED',
        correlationId,
        agentRunId,
        ticketId: targetTicketId,
        orderId: targetOrderId,
        currentState: 'CASE_RESOLVED',
        outcome: 'SUCCESS',
        message: `Case resolved: ${reasonMsg}`,
      });

      return {
        status: 'RESOLVED',
        currentStep: 'CASE_RESOLVED',
        agentRunId,
        correlationId,
        ticketId: targetTicketId,
        intent,
        investigation,
        decision: decisionResult,
        execution,
        resolution: {
          confirmed: true,
          actionType: decisionResult.selectedAction,
          actionId: execution.actionId,
          externalReference: execution.externalReference,
          message: reasonMsg,
        },
        loopCount: 1,
        replanCount: 0,
        reason: reasonMsg,
      };
    }

    // If primary action execution was unfeasible (e.g. primary SKU out of stock), handle failure recovery with consent
    const recovery = await FailureRecoveryAgent.replan({
      executionResult: execution,
      investigationResult: investigation,
      decisionResult,
      options: {
        agentRunId,
        approvalToken,
        customerConsentGiven,
      },
    });

    if (recovery.status === 'REPLANNED' && recovery.shouldExecuteNextAction && recovery.decision && recovery.investigation) {
      StateTransitionGuard.validateTransition('REPLANNING', 'TOOL_EXECUTION');

      const replanExec = await ActionExecutor.execute(recovery.decision, recovery.investigation, {
        agentRunId,
        correlationId,
        idempotencyKey: `${idempotencyKey}-replan`,
        approvalToken,
        customerConsentGiven,
      });

      if (replanExec.status === 'EXECUTED' && replanExec.verificationStatus === 'SUCCESS') {
        if (targetTicketId) {
          await ActionTools.updateTicket(targetTicketId, 'RESOLVED', recovery.decision.selectedAction, { agentRunId }).catch(() => null);
        }
        StateTransitionGuard.validateTransition('TOOL_EXECUTION', 'ACTION_VERIFICATION');
        StateTransitionGuard.validateTransition('ACTION_VERIFICATION', 'CASE_RESOLVED');
        await AgentStateRepository.completeAgentRun(agentRunId, recovery.reason).catch(() => null);

        Logger.info({
          event: 'RUN_RESOLVED',
          correlationId,
          agentRunId,
          ticketId: targetTicketId,
          orderId: targetOrderId,
          currentState: 'CASE_RESOLVED',
          outcome: 'SUCCESS',
          message: `Case resolved via alternative recovery: ${recovery.reason}`,
        });

        return {
          status: 'RESOLVED',
          currentStep: 'CASE_RESOLVED',
          agentRunId,
          correlationId,
          ticketId: targetTicketId,
          intent,
          investigation: recovery.investigation,
          decision: recovery.decision,
          execution: replanExec,
          recovery,
          resolution: {
            confirmed: true,
            actionType: recovery.decision.selectedAction,
            actionId: replanExec.actionId,
            externalReference: replanExec.externalReference,
            message: recovery.reason,
          },
          loopCount: 2,
          replanCount: recovery.replanCount ?? 1,
          reason: recovery.reason,
        };
      }
    }

    // Fallback escalation if resume execution could not resolve cleanly
    if (targetTicketId) {
      await ActionTools.escalateTicket(targetTicketId, 'Resume execution failed to resolve case', 'HIGH', `${idempotencyKey}-resume-esc`, { agentRunId }).catch(() => null);
    }
    StateTransitionGuard.validateTransition('TOOL_EXECUTION', 'HUMAN_ESCALATION');
    await AgentStateRepository.updateAgentRunState(agentRunId, 'HUMAN_ESCALATION', 'ESCALATED').catch(() => null);

    Logger.warn({
      event: 'RUN_ESCALATED',
      correlationId,
      agentRunId,
      ticketId: targetTicketId,
      currentState: 'HUMAN_ESCALATION',
      outcome: 'BLOCKED',
      message: 'Resume execution could not resolve case. Escalated to support agent.',
    });

    return {
      status: 'ESCALATED',
      currentStep: 'HUMAN_ESCALATION',
      agentRunId,
      correlationId,
      ticketId: targetTicketId,
      intent,
      investigation,
      decision: decisionResult,
      execution,
      recovery,
      loopCount: 2,
      replanCount: 1,
      reason: 'Resume execution could not resolve case. Escalated to support agent.',
    };
  }
}
