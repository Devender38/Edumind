import { describe, it, expect, beforeEach, vi } from 'vitest';
import { seedDatabase } from '../prisma/seed.js';
import { DomainRepository } from '../src/db/repositories/domainRepository.js';
import { AgentOrchestrator, StateTransitionGuard } from '../src/agents/orchestrator/AgentOrchestrator.js';
import { InvestigationAgent } from '../src/agents/investigation/InvestigationAgent.js';
import { ActionExecutor } from '../src/agents/action/ActionExecutor.js';
import { VerificationTools } from '../src/tools/verificationTools.js';
import { AgentStateRepository } from '../src/db/repositories/agentStateRepository.js';
import { IntentAgent } from '../src/agents/intent/IntentAgent.js';
import { PolicyEngine } from '../src/policy/PolicyEngine.js';
import { DecisionEngine } from '../src/agents/decision/DecisionEngine.js';
import { prisma } from '../src/db/client.js';

describe('Phase 9: Advanced Agent Orchestration Test Suite (Verification & Hardening Pass)', () => {
  beforeEach(async () => {
    await seedDatabase();
  });

  // CORRECTION 1: Duplicate Orchestration Request Test
  describe('Correction 1: Duplicate Orchestration Request Safety', () => {
    it('1. Same successful request submitted twice must NOT create duplicate business actions or database mutations', async () => {
      const idempotencyKey = `orch-idemp-dup-test-${Date.now()}`;
      const refundOrder = await DomainRepository.getOrderById('ord-refund-4999');

      const initialRefundTxCount = await prisma.refundTransaction.count({ where: { orderId: refundOrder!.id } });
      const initialActionRecordCount = await prisma.actionRecord.count({ where: { actionType: 'REFUND' } });

      // Request #1: Full orchestration -> Action succeeds -> Verification succeeds -> RESOLVED
      const run1 = await AgentOrchestrator.run({
        orderId: refundOrder!.id,
        message: 'I want a refund for my ₹4,999 earbuds order.',
        idempotencyKey,
      });

      expect(run1.status).toBe('RESOLVED');
      expect(run1.execution?.status).toBe('EXECUTED');
      expect(run1.execution?.verificationStatus).toBe('SUCCESS');

      const refundCountAfterFirst = await prisma.refundTransaction.count({ where: { orderId: refundOrder!.id } });
      const actionRecordCountAfterFirst = await prisma.actionRecord.count({ where: { actionType: 'REFUND' } });

      expect(refundCountAfterFirst).toBe(initialRefundTxCount + 1);

      // Request #2: Same request with identical idempotencyKey
      const run2 = await AgentOrchestrator.run({
        orderId: refundOrder!.id,
        message: 'I want a refund for my ₹4,999 earbuds order.',
        idempotencyKey,
      });

      expect(run2.status).toBe('RESOLVED');

      const refundCountAfterSecond = await prisma.refundTransaction.count({ where: { orderId: refundOrder!.id } });
      const actionRecordCountAfterSecond = await prisma.actionRecord.count({ where: { actionType: 'REFUND' } });

      // Assert ZERO duplicate mutations
      expect(refundCountAfterSecond).toBe(refundCountAfterFirst);
      expect(actionRecordCountAfterSecond).toBe(actionRecordCountAfterFirst);
    });
  });

  // CORRECTION 2 & 7: Orchestrator-Level OUT_OF_STOCK Recovery & Trace Completeness
  describe('Correction 2 & 7: Orchestrator-Level OUT_OF_STOCK Recovery & Trace Completeness', () => {
    it('2. Pre-execution OUT_OF_STOCK shift must enter recovery, perform fresh investigation, and enforce consent without blind retries', async () => {
      const order = await DomainRepository.getOrderById('ord-phone-24999');

      // 1. Initial investigation observes stock > 0 at decision time
      const originalInvestigate = InvestigationAgent.investigate.bind(InvestigationAgent);
      const investSpy = vi.spyOn(InvestigationAgent, 'investigate').mockImplementationOnce(async (input: any) => {
        const realRes = await originalInvestigate(input);
        return {
          ...realRes,
          products: [{ productId: 'prod-phone-001', productName: 'Nexus Pro 5G', stockQuantity: 5, available: true }],
        };
      });

      // 2. ActionExecutor returns OUT_OF_STOCK on action execution
      const actionSpy = vi.spyOn(ActionExecutor, 'execute').mockResolvedValueOnce({
        status: 'FAILED',
        actionType: 'REPLACEMENT',
        executed: false,
        error: { code: 'OUT_OF_STOCK', message: 'Primary SKU prod-phone-001 stock is 0', retryable: false },
        reason: 'Primary SKU prod-phone-001 stock is 0',
        timestamp: new Date().toISOString(),
      });

      const initialReplacementCount = await prisma.actionRecord.count({ where: { actionType: 'REPLACEMENT' } });
      const altProductBefore = await DomainRepository.getProductById('prod-phone-002');
      const initialAltStock = altProductBefore?.stockQuantity || 15;

      // Execute Orchestrator without customer consent
      const orchWithoutConsent = await AgentOrchestrator.run({
        orderId: order!.id,
        message: 'I want a replacement for my damaged phone.',
        customerConsentGiven: false,
      });

      expect(orchWithoutConsent.status).toBe('WAITING_FOR_CUSTOMER_CONSENT');
      expect(orchWithoutConsent.recovery?.failureType).toBe('OUT_OF_STOCK');
      expect(orchWithoutConsent.recovery?.requiresCustomerConsent).toBe(true);

      // Assert original SKU was NOT retried blindly and alternative SKU was NOT executed without consent
      const finalReplacementCount = await prisma.actionRecord.count({ where: { actionType: 'REPLACEMENT' } });
      expect(finalReplacementCount).toBe(initialReplacementCount);

      const altProductAfter = await DomainRepository.getProductById('prod-phone-002');
      expect(altProductAfter?.stockQuantity).toBe(initialAltStock);

      // Trace Completeness Assertions
      if (orchWithoutConsent.agentRunId) {
        const dbRun = await AgentStateRepository.getAgentRun(orchWithoutConsent.agentRunId);
        expect(dbRun).toBeDefined();
        const traceSteps = dbRun!.traces.map((t) => t.type);
        expect(traceSteps).toContain('GOAL');
        expect(traceSteps).toContain('INTENT');
        expect(traceSteps).toContain('INVESTIGATION');
        expect(traceSteps).toContain('POLICY');
        expect(traceSteps).toContain('DECISION');
        expect(traceSteps).toContain('FAILURE_DETECTED');
        expect(traceSteps).toContain('RECOVERY_INVESTIGATION');
        expect(traceSteps).toContain('POLICY_REEVALUATION');
      }

      actionSpy.mockRestore();
      investSpy.mockRestore();
    });
  });

  // CORRECTION 3: Orchestrator-Level Verification Failure
  describe('Correction 3: Orchestrator-Level Verification Failure Handling', () => {
    it('3. Verification failure post-action execution must NOT return RESOLVED, must enter failure recovery', async () => {
      const order = await DomainRepository.getOrderById('ord-cancel-3500');

      // VerificationTools returns verified = false
      const verifySpy = vi.spyOn(VerificationTools, 'verifyAction').mockResolvedValue({
        success: true,
        data: {
          actionId: 'act-sample-mismatch',
          actionType: 'CANCELLATION',
          verified: false,
          expectedState: 'CANCELLED_ORDER',
          actualState: 'ORDER_STATUS_PROCESSING',
          message: 'Ground-truth verification failed: Order status remains PROCESSING in DB',
        },
      });

      const orchRes = await AgentOrchestrator.run({
        orderId: order!.id,
        message: 'Cancel my order.',
      });

      // Orchestrator MUST NOT return RESOLVED
      expect(orchRes.status).not.toBe('RESOLVED');
      expect(orchRes.status).toBe('ESCALATED');

      verifySpy.mockRestore();
    });
  });

  // CORRECTION 4: Approval Waiting State Assertions
  describe('Correction 4: Approval Waiting State Assertions (₹24,999 Refund)', () => {
    it('4. ₹24,999 refund request must halt at WAITING_FOR_APPROVAL with zero database mutations', async () => {
      const ticket = await DomainRepository.getTicketById('tkt-damaged-phone-001');
      expect(ticket).toBeDefined();

      const initialRefundCount = await prisma.refundTransaction.count();
      const initialActionRecordCount = await prisma.actionRecord.count();

      const orchResult = await AgentOrchestrator.run({
        ticketId: ticket!.id,
        message: ticket!.customerMessage,
      });

      // Deep Intent Assertions
      expect(orchResult.intent?.issueType).toBe('DAMAGED_ITEM');
      expect(orchResult.intent?.requestedResolution).toBe('REFUND');
      expect(orchResult.intent?.entities.amount).toBe(24999);

      // Decision & Status Assertions
      expect(orchResult.decision?.decision).toBe('APPROVAL_REQUIRED');
      expect(orchResult.status).toBe('WAITING_FOR_APPROVAL');
      expect(orchResult.currentStep).toBe('DECISION_FORMULATION');

      // Database State Assertions (0 RefundTransactions, 0 ActionRecords)
      const finalRefundCount = await prisma.refundTransaction.count();
      const finalActionRecordCount = await prisma.actionRecord.count();

      expect(finalRefundCount).toBe(initialRefundCount);
      expect(finalActionRecordCount).toBe(initialActionRecordCount);

      // AgentRun status assertion in DB
      if (orchResult.agentRunId) {
        const dbRun = await AgentStateRepository.getAgentRun(orchResult.agentRunId);
        expect(dbRun).toBeDefined();
        expect(dbRun!.status).toBe('ACTION_PENDING');
      }
    });
  });

  // CORRECTION 5: Customer Consent Waiting State Assertions
  describe('Correction 5: Customer Consent Waiting State Assertions', () => {
    it('5. Alternative replacement requiring consent must halt at WAITING_FOR_CUSTOMER_CONSENT with zero stock decrement', async () => {
      const order = await DomainRepository.getOrderById('ord-phone-24999');

      // Initial investigation sees stock > 0 for primary product
      const originalInvestigate = InvestigationAgent.investigate.bind(InvestigationAgent);
      const investSpy = vi.spyOn(InvestigationAgent, 'investigate').mockImplementationOnce(async (input: any) => {
        const realRes = await originalInvestigate(input);
        return {
          ...realRes,
          products: [{ productId: 'prod-phone-001', productName: 'Nexus Pro 5G', stockQuantity: 5, available: true }],
        };
      });

      // Execution returns OUT_OF_STOCK
      const actionSpy = vi.spyOn(ActionExecutor, 'execute').mockResolvedValueOnce({
        status: 'FAILED',
        actionType: 'REPLACEMENT',
        executed: false,
        error: { code: 'OUT_OF_STOCK', message: 'Primary product out of stock', retryable: false },
        timestamp: new Date().toISOString(),
      });

      const altProductBefore = await DomainRepository.getProductById('prod-phone-002');
      const initialAltStock = altProductBefore?.stockQuantity || 15;
      const initialActionRecordCount = await prisma.actionRecord.count();

      const orchResult = await AgentOrchestrator.run({
        orderId: order!.id,
        message: 'I want a replacement for my damaged phone.',
        customerConsentGiven: false,
      });

      expect(orchResult.status).toBe('WAITING_FOR_CUSTOMER_CONSENT');
      expect(orchResult.recovery?.requiresCustomerConsent).toBe(true);

      // Zero stock decrement for alternative SKU
      const altProductAfter = await DomainRepository.getProductById('prod-phone-002');
      expect(altProductAfter?.stockQuantity).toBe(initialAltStock);

      // Zero alternative replacement ActionRecord created
      const finalActionRecordCount = await prisma.actionRecord.count();
      expect(finalActionRecordCount).toBe(initialActionRecordCount);

      actionSpy.mockRestore();
      investSpy.mockRestore();
    });
  });

  // CORRECTION 6: State Machine Guard Validation
  describe('Correction 6: State Machine Transition Guard', () => {
    it('6. StateTransitionGuard must reject illegal state transitions', () => {
      expect(() => StateTransitionGuard.validateTransition('DECISION_FORMULATION', 'CASE_RESOLVED')).toThrow('ILLEGAL_STATE_TRANSITION');
      expect(() => StateTransitionGuard.validateTransition('TOOL_EXECUTION', 'CASE_RESOLVED')).toThrow('ILLEGAL_STATE_TRANSITION');
      expect(() => StateTransitionGuard.validateTransition('FAILURE_DETECTED', 'CASE_RESOLVED')).toThrow('ILLEGAL_STATE_TRANSITION');

      // Valid transitions pass without throwing
      expect(() => StateTransitionGuard.validateTransition('GOAL_RECEIVED', 'INTENT_CLASSIFICATION')).not.toThrow();
      expect(() => StateTransitionGuard.validateTransition('ACTION_VERIFICATION', 'CASE_RESOLVED')).not.toThrow();
    });
  });

  // CORRECTION 8: Bounded Loop Execution Test
  describe('Correction 8: Bounded Loop Execution', () => {
    it('8. Forced recovery failures must terminate at maxLoops without infinite execution or action storms', async () => {
      const order = await DomainRepository.getOrderById('ord-refund-4999');

      // Spy on ActionExecutor to return persistent FAILED result
      const actionSpy = vi.spyOn(ActionExecutor, 'execute').mockResolvedValue({
        status: 'FAILED',
        actionType: 'REFUND',
        executed: false,
        error: { code: 'TOOL_FAILURE', message: 'Persistent tool error', retryable: false },
        reason: 'Persistent tool failure',
        timestamp: new Date().toISOString(),
      });

      const orchResult = await AgentOrchestrator.run({
        orderId: order!.id,
        message: 'I want a refund for my ₹4,999 earbuds order.',
        maxLoops: 3,
      });

      expect(orchResult.status).toBe('ESCALATED');
      expect(orchResult.currentStep).toBe('HUMAN_ESCALATION');
      expect(orchResult.loopCount).toBeLessThanOrEqual(3);

      actionSpy.mockRestore();
    });
  });

  // CORRECTION 9: Failure Boundaries Tests
  describe('Correction 9: Failure Boundaries Safety', () => {
    it('9a. Intent failure must halt without executing actions', async () => {
      const intentSpy = vi.spyOn(IntentAgent, 'analyze').mockResolvedValueOnce({
        issueType: 'UNKNOWN',
        requestedResolution: 'UNKNOWN',
        entities: {},
        urgency: 'LOW',
        confidence: 0.0,
        reasoningSummary: 'Failed to extract intent',
        missingInformation: ['message'],
      });

      const initialActionCount = await prisma.actionRecord.count();

      const orchResult = await AgentOrchestrator.run({
        message: 'unparseable gibberish string',
      });

      expect(orchResult.status).toBe('FAILED');
      expect(orchResult.currentStep).toBe('INTENT_CLASSIFICATION');

      const finalActionCount = await prisma.actionRecord.count();
      expect(finalActionCount).toBe(initialActionCount);

      intentSpy.mockRestore();
    });

    it('9b. Policy failure must halt without executing actions', async () => {
      const policySpy = vi.spyOn(PolicyEngine, 'evaluate').mockResolvedValueOnce(null as any);
      const initialActionCount = await prisma.actionRecord.count();

      const orchResult = await AgentOrchestrator.run({
        orderId: 'ord-refund-4999',
        message: 'I want a refund for my ₹4,999 earbuds order.',
      });

      expect(orchResult.status).toBe('FAILED');
      expect(orchResult.currentStep).toBe('POLICY_EVALUATION');

      const finalActionCount = await prisma.actionRecord.count();
      expect(finalActionCount).toBe(initialActionCount);

      policySpy.mockRestore();
    });

    it('9c. Decision failure must halt without executing actions', async () => {
      const decisionSpy = vi.spyOn(DecisionEngine, 'decide').mockResolvedValueOnce(null as any);
      const initialActionCount = await prisma.actionRecord.count();

      const orchResult = await AgentOrchestrator.run({
        orderId: 'ord-refund-4999',
        message: 'I want a refund for my ₹4,999 earbuds order.',
      });

      expect(orchResult.status).toBe('FAILED');
      expect(orchResult.currentStep).toBe('DECISION_FORMULATION');

      const finalActionCount = await prisma.actionRecord.count();
      expect(finalActionCount).toBe(initialActionCount);

      decisionSpy.mockRestore();
    });
  });
});
