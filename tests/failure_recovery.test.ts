import { describe, it, expect, beforeAll, vi } from 'vitest';
import { seedDatabase } from '../prisma/seed.js';
import { DomainRepository } from '../src/db/repositories/domainRepository.js';
import { IntentAgent } from '../src/agents/intent/IntentAgent.js';
import { InvestigationAgent } from '../src/agents/investigation/InvestigationAgent.js';
import { PolicyEngine } from '../src/policy/PolicyEngine.js';
import { DecisionEngine } from '../src/agents/decision/DecisionEngine.js';
import { ActionExecutor } from '../src/agents/action/ActionExecutor.js';
import { FailureRecoveryAgent } from '../src/agents/recovery/FailureRecoveryAgent.js';
import { VerificationTools } from '../src/tools/verificationTools.js';
import { AgentStateRepository } from '../src/db/repositories/agentStateRepository.js';
import { ExecutionResult } from '../src/types/index.js';

describe('Phase 8: Failure Recovery & Autonomous Replanning Test Suite', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  describe('Core Recovery & Classification Behavior', () => {
    it('1. EXECUTED + SUCCESS: should return RESOLVED with no replan required', async () => {
      const mockExecResult: ExecutionResult = {
        status: 'EXECUTED',
        actionType: 'REFUND',
        executed: true,
        actionId: 'act-sample-success-id',
        externalReference: 'tx-12345',
        verificationStatus: 'SUCCESS',
        timestamp: new Date().toISOString(),
      };

      const mockInvestigation: any = {
        intent: { issueType: 'REFUND_REQUEST', requestedResolution: 'REFUND', entities: {} },
      };

      const replanRes = await FailureRecoveryAgent.replan({
        executionResult: mockExecResult,
        investigationResult: mockInvestigation,
      });

      expect(replanRes.status).toBe('RESOLVED');
      expect(replanRes.shouldExecuteNextAction).toBe(false);
      expect(replanRes.reason).toContain('successfully executed and verified');
    });

    it('2. APPROVAL_REQUIRED: should return WAIT_FOR_APPROVAL without autonomous retry (₹24,999 Primary Refund Demo)', async () => {
      const ticket = await DomainRepository.getTicketById('tkt-damaged-phone-001');
      const intent = await IntentAgent.analyze({ ticketId: ticket!.id, message: ticket!.customerMessage });
      const investigation = await InvestigationAgent.investigate({ intent, ticketId: ticket!.id });
      const policyEval = await PolicyEngine.evaluate(investigation);
      const decision = await DecisionEngine.decide(investigation, policyEval);

      const execResult = await ActionExecutor.execute(decision, investigation);
      expect(execResult.status).toBe('APPROVAL_REQUIRED');

      const replanRes = await FailureRecoveryAgent.replan({
        executionResult: execResult,
        investigationResult: investigation,
        decisionResult: decision,
      });

      expect(replanRes.status).toBe('WAIT_FOR_APPROVAL');
      expect(replanRes.requiresApproval).toBe(true);
      expect(replanRes.shouldExecuteNextAction).toBe(false);
      expect(replanRes.failureType).toBe('APPROVAL_REQUIRED');
    });

    it('3. CUSTOMER_CONSENT_REQUIRED: should return WAIT_FOR_CUSTOMER_CONSENT without autonomous retry', async () => {
      const mockExecResult: ExecutionResult = {
        status: 'CUSTOMER_CONSENT_REQUIRED',
        actionType: 'REPLACEMENT',
        executed: false,
        customerConsentRequired: true,
        reason: 'Candidate action requires explicit customer substitution consent.',
        timestamp: new Date().toISOString(),
      };

      const mockInvestigation: any = {
        intent: { issueType: 'DAMAGED_ITEM', requestedResolution: 'REPLACEMENT', entities: {} },
      };

      const replanRes = await FailureRecoveryAgent.replan({
        executionResult: mockExecResult,
        investigationResult: mockInvestigation,
      });

      expect(replanRes.status).toBe('WAIT_FOR_CUSTOMER_CONSENT');
      expect(replanRes.requiresCustomerConsent).toBe(true);
      expect(replanRes.shouldExecuteNextAction).toBe(false);
      expect(replanRes.failureType).toBe('CUSTOMER_CONSENT_REQUIRED');
    });
  });

  describe('Killer Scenario: Pre-Execution OUT_OF_STOCK Inventory Shift & Replanning', () => {
    it('4. Out-of-Stock Replanning: should NOT retry failing SKU, should run fresh investigation, detect alternative SKU, and enforce customer consent gate', async () => {
      // Setup mock execution result for OUT_OF_STOCK failure (Primary SKU prod-phone-001 stock = 0)
      const mockExecResult: ExecutionResult = {
        status: 'FAILED',
        actionType: 'REPLACEMENT',
        executed: false,
        error: { code: 'OUT_OF_STOCK', message: 'Requested product prod-phone-001 is out of stock (Stock: 0)', retryable: false },
        reason: 'Requested product prod-phone-001 is out of stock (Stock: 0)',
        timestamp: new Date().toISOString(),
      };

      const order = await DomainRepository.getOrderById('ord-phone-24999');
      const intent = await IntentAgent.analyze({ orderId: order!.id, message: 'I want a replacement phone.' });
      const originalInvestigation = await InvestigationAgent.investigate({ intent, orderId: order!.id });

      // Replanning without customer consent given
      const replanWithoutConsent = await FailureRecoveryAgent.replan({
        executionResult: mockExecResult,
        investigationResult: originalInvestigation,
        options: { customerConsentGiven: false },
      });

      expect(replanWithoutConsent.status).toBe('WAIT_FOR_CUSTOMER_CONSENT');
      expect(replanWithoutConsent.failureType).toBe('OUT_OF_STOCK');
      expect(replanWithoutConsent.previousActionType).toBe('REPLACEMENT');
      expect(replanWithoutConsent.nextActionType).toBe('REPLACEMENT');
      expect(replanWithoutConsent.requiresCustomerConsent).toBe(true);
      expect(replanWithoutConsent.shouldExecuteNextAction).toBe(false);
      expect(replanWithoutConsent.reason).toContain('customer consent');

      // Replanning WITH explicit customer consent given
      const replanWithConsent = await FailureRecoveryAgent.replan({
        executionResult: mockExecResult,
        investigationResult: originalInvestigation,
        options: { customerConsentGiven: true },
      });

      expect(replanWithConsent.status).toBe('REPLANNED');
      expect(replanWithConsent.failureType).toBe('OUT_OF_STOCK');
      expect(replanWithConsent.nextActionType).toBe('REPLACEMENT');
      expect(replanWithConsent.shouldExecuteNextAction).toBe(true);
      expect(replanWithConsent.reason).toContain('Alternative SKU replacement selected with explicit customer consent');
    });
  });

  describe('Verification Failure & Replan Cap Controls', () => {
    it('5. VERIFICATION_FAILED Recovery: fresh investigation determines state unresolved, must NOT report RESOLVED', async () => {
      const mockExecResult: ExecutionResult = {
        status: 'VERIFICATION_FAILED',
        actionType: 'CANCELLATION',
        executed: true,
        actionId: 'act-sample-mismatch',
        verificationStatus: 'FAILED',
        reason: 'Ground-truth verification failed: Order status remains PROCESSING',
        timestamp: new Date().toISOString(),
      };

      const order = await DomainRepository.getOrderById('ord-cancel-3500');
      const intent = await IntentAgent.analyze({ orderId: order!.id, message: 'Cancel order' });
      const investigation = await InvestigationAgent.investigate({ intent, orderId: order!.id });

      const replanRes = await FailureRecoveryAgent.replan({
        executionResult: mockExecResult,
        investigationResult: investigation,
      });

      expect(replanRes.status).not.toBe('RESOLVED');
      expect(replanRes.failureType).toBe('VERIFICATION_FAILED');
      expect(replanRes.previousActionType).toBe('CANCELLATION');
    });

    it('6. Bounded Replan Limit: should halt autonomous replanning when replanCount exceeds cap (3)', async () => {
      const mockExecResult: ExecutionResult = {
        status: 'FAILED',
        actionType: 'REPLACEMENT',
        executed: false,
        error: { code: 'TOOL_FAILURE', message: 'Persistent tool error', retryable: false },
        reason: 'Persistent tool failure',
        timestamp: new Date().toISOString(),
      };

      const mockInvestigation: any = {
        intent: { issueType: 'DAMAGED_ITEM', requestedResolution: 'REPLACEMENT', entities: {} },
      };

      const replanRes = await FailureRecoveryAgent.replan({
        executionResult: mockExecResult,
        investigationResult: mockInvestigation,
        options: { replanCount: 3 }, // replanCount >= MAX_REPLAN_COUNT (3)
      });

      expect(replanRes.status).toBe('ESCALATION_REQUIRED');
      expect(replanRes.shouldExecuteNextAction).toBe(false);
      expect(replanRes.reason).toContain('Maximum autonomous replan limit (3) exceeded');
    });

    it('7. Idempotency & AgentState Trace Verification', async () => {
      const ticket = await DomainRepository.getTicketById('tkt-damaged-phone-001');
      const agentRun = await AgentStateRepository.createAgentRun({
        ticketId: ticket!.id,
        goal: 'Customer resolution with replanning audit trace',
      });

      const mockExecResult: ExecutionResult = {
        status: 'FAILED',
        actionType: 'REPLACEMENT',
        executed: false,
        error: { code: 'OUT_OF_STOCK', message: 'Primary SKU out of stock', retryable: false },
        reason: 'Primary SKU out of stock',
        timestamp: new Date().toISOString(),
      };

      const intent = await IntentAgent.analyze({ ticketId: ticket!.id, message: ticket!.customerMessage, agentRunId: agentRun.id });
      const investigation = await InvestigationAgent.investigate({ intent, ticketId: ticket!.id, agentRunId: agentRun.id });

      const replanRes = await FailureRecoveryAgent.replan({
        executionResult: mockExecResult,
        investigationResult: investigation,
        options: { agentRunId: agentRun.id },
      });

      expect(replanRes.status).toBe('WAIT_FOR_CUSTOMER_CONSENT');

      // Verify traces persisted in AgentRun
      const fetchedRun = await AgentStateRepository.getAgentRun(agentRun.id);
      expect(fetchedRun).toBeDefined();
      expect(fetchedRun!.replanCount).toBeGreaterThan(0);
      expect(fetchedRun!.traces.some((t) => t.type === 'FAILURE_DETECTED')).toBe(true);
      expect(fetchedRun!.traces.some((t) => t.type === 'RECOVERY_INVESTIGATION')).toBe(true);
    });
  });
});
