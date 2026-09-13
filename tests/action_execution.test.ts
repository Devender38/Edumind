import { describe, it, expect, beforeAll, vi } from 'vitest';
import { seedDatabase } from '../prisma/seed.js';
import { DomainRepository } from '../src/db/repositories/domainRepository.js';
import { IntentAgent } from '../src/agents/intent/IntentAgent.js';
import { InvestigationAgent } from '../src/agents/investigation/InvestigationAgent.js';
import { PolicyEngine } from '../src/policy/PolicyEngine.js';
import { DecisionEngine } from '../src/agents/decision/DecisionEngine.js';
import { ActionExecutor } from '../src/agents/action/ActionExecutor.js';
import { ActionTools } from '../src/tools/actionTools.js';
import { VerificationTools } from '../src/tools/verificationTools.js';
import { prisma } from '../src/db/client.js';

describe('Phase 7: Action Execution & Verification Test Suite', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  // 1. Safety Boundary & Gate Tests
  describe('Safety Gates (Approval, Consent, Blocked)', () => {
    it('1. Approval Gate: should block execution when decision requires manager approval (Primary ₹24,999 Demo)', async () => {
      const ticket = await DomainRepository.getTicketById('tkt-damaged-phone-001');
      const intent = await IntentAgent.analyze({
        ticketId: ticket!.id,
        message: ticket!.customerMessage,
      });
      const investigation = await InvestigationAgent.investigate({ intent, ticketId: ticket!.id });
      const policyEval = await PolicyEngine.evaluate(investigation);
      const decision = await DecisionEngine.decide(investigation, policyEval);

      expect(decision.decision).toBe('APPROVAL_REQUIRED');

      const initialRefundCount = await prisma.refundTransaction.count();

      // Attempt execution without approval token
      const execResult = await ActionExecutor.execute(decision, investigation);

      expect(execResult.status).toBe('APPROVAL_REQUIRED');
      expect(execResult.executed).toBe(false);
      expect(execResult.approvalRequired).toBe(true);

      const finalRefundCount = await prisma.refundTransaction.count();
      expect(finalRefundCount).toBe(initialRefundCount);
    });

    it('2. Customer Consent Gate: should block candidate requiring customer consent', async () => {
      const mockDecision: any = {
        decision: 'AUTONOMOUSLY_ALLOWED',
        selectedAction: 'REPLACEMENT',
        approvalRequired: false,
        reason: 'Alternative replacement evaluated',
        alternatives: [
          {
            actionType: 'REPLACEMENT',
            eligible: true,
            feasibility: 'REQUIRES_CUSTOMER_CONSENT',
            approvalRequired: false,
            reason: 'Alternative product requires consent',
            supportingPolicies: [],
            blockingReasons: [],
            parameters: { requiresCustomerConsent: true },
          },
        ],
        blockedActions: [],
      };

      const mockInvestigation: any = {
        intent: { issueType: 'DAMAGED_ITEM', requestedResolution: 'REPLACEMENT', entities: {} },
        order: { id: 'ord-phone-24999' },
        customer: { id: 'cust-primary-001' },
      };

      const execResult = await ActionExecutor.execute(mockDecision, mockInvestigation);

      expect(execResult.status).toBe('CUSTOMER_CONSENT_REQUIRED');
      expect(execResult.executed).toBe(false);
      expect(execResult.customerConsentRequired).toBe(true);
    });

    it('3. Blocked Gate: should block candidate with hard constraints (Primary SKU out of stock)', async () => {
      const mockDecision: any = {
        decision: 'BLOCKED',
        selectedAction: 'REPLACEMENT',
        approvalRequired: false,
        reason: 'Primary product is out of stock',
        alternatives: [
          {
            actionType: 'REPLACEMENT',
            eligible: false,
            feasibility: 'BLOCKED',
            approvalRequired: false,
            reason: 'Stock is 0',
            supportingPolicies: [],
            blockingReasons: ['Primary product is out of stock (Stock: 0).'],
          },
        ],
        blockedActions: [{ actionType: 'REPLACEMENT', reason: 'Primary product out of stock (Stock: 0).' }],
      };

      const mockInvestigation: any = {
        intent: { issueType: 'DAMAGED_ITEM', requestedResolution: 'REPLACEMENT', entities: {} },
        order: { id: 'ord-phone-24999' },
      };

      const execResult = await ActionExecutor.execute(mockDecision, mockInvestigation);

      expect(execResult.status).toBe('BLOCKED');
      expect(execResult.executed).toBe(false);
      expect(execResult.reason).toContain('out of stock');
    });
  });

  // 2. Autonomous Execution + Ground-Truth DB Verification Tests
  describe('Autonomous Execution & Ground-Truth DB Verification', () => {
    it('4. Feasible Action Execution & DB Verification: should execute eligible refund (<= ₹10,000) and verify DB state', async () => {
      const refundOrder = await DomainRepository.getOrderById('ord-refund-4999');
      expect(refundOrder).toBeDefined();

      const intent = await IntentAgent.analyze({
        orderId: refundOrder!.id,
        message: 'I want a refund for my ₹4,999 earbuds order.',
      });
      const investigation = await InvestigationAgent.investigate({ intent, orderId: refundOrder!.id });
      const policyEval = await PolicyEngine.evaluate(investigation);
      const decision = await DecisionEngine.decide(investigation, policyEval);

      expect(decision.decision).toBe('AUTONOMOUSLY_ALLOWED');
      expect(decision.selectedAction).toBe('REFUND');

      const idempotencyKey = `test-exec-refund-4999-${Date.now()}`;
      const execResult = await ActionExecutor.execute(decision, investigation, { idempotencyKey });

      expect(execResult.status).toBe('EXECUTED');
      expect(execResult.executed).toBe(true);
      expect(execResult.verificationStatus).toBe('SUCCESS');
      expect(execResult.actionId).toBeDefined();

      // Ground-truth DB verification
      const dbOrder = await DomainRepository.getOrderById(refundOrder!.id);
      expect(dbOrder!.status).toBe('REFUNDED');

      const refundTx = await prisma.refundTransaction.findFirst({
        where: { orderId: refundOrder!.id },
      });
      expect(refundTx).toBeDefined();
      expect(refundTx!.amount).toBe(4999);
      expect(refundTx!.status).toBe('COMPLETED');
    });

    it('5. Execution-Time Inventory Race Condition: should report FAILED when tool returns OUT_OF_STOCK', async () => {
      const mockDecision: any = {
        decision: 'AUTONOMOUSLY_ALLOWED',
        selectedAction: 'REPLACEMENT',
        approvalRequired: false,
        reason: 'Replacement decision formulated',
        alternatives: [
          {
            actionType: 'REPLACEMENT',
            eligible: true,
            feasibility: 'FEASIBLE',
            approvalRequired: false,
            reason: 'Stock check passed at decision time',
            supportingPolicies: [],
            blockingReasons: [],
            parameters: { productId: 'prod-phone-001' }, // Stock = 0
          },
        ],
        blockedActions: [],
      };

      const mockInvestigation: any = {
        intent: { issueType: 'DAMAGED_ITEM', requestedResolution: 'REPLACEMENT', entities: {} },
        order: { id: 'ord-phone-24999' },
        products: [{ productId: 'prod-phone-001', name: 'Nexus Pro 5G', stockQuantity: 0 }],
      };

      const execResult = await ActionExecutor.execute(mockDecision, mockInvestigation, {
        idempotencyKey: `test-out-of-stock-${Date.now()}`,
      });

      expect(execResult.status).toBe('FAILED');
      expect(execResult.executed).toBe(false);
      expect(execResult.error?.code).toBe('OUT_OF_STOCK');
    });

    it('6. CASE B: Ground-Truth Verification Failure: ActionExecutor must return VERIFICATION_FAILED when tool succeeds but DB postcondition is not verified', async () => {
      const order = await DomainRepository.getOrderById('ord-cancel-3500');
      expect(order).toBeDefined();

      const intent = await IntentAgent.analyze({
        orderId: order!.id,
        message: 'Cancel my order.',
      });
      const investigation = await InvestigationAgent.investigate({ intent, orderId: order!.id });
      const policyEval = await PolicyEngine.evaluate(investigation);
      const decision = await DecisionEngine.decide(investigation, policyEval);

      // Spy on VerificationTools.verifyAction to simulate a postcondition mismatch (verified = false)
      const verifySpy = vi.spyOn(VerificationTools, 'verifyAction').mockResolvedValueOnce({
        success: true,
        data: {
          actionId: 'act-sample-mismatch-id',
          actionType: 'CANCELLATION',
          verified: false,
          expectedState: 'CANCELLED_ORDER',
          actualState: 'ORDER_STATUS_PROCESSING',
          message: 'Ground-truth verification failed: Order status in database remains PROCESSING',
        },
      });

      const execResult = await ActionExecutor.execute(decision, investigation, {
        idempotencyKey: `test-verif-fail-${Date.now()}`,
      });

      expect(verifySpy).toHaveBeenCalled();
      expect(execResult.status).toBe('VERIFICATION_FAILED');
      expect(execResult.executed).toBe(true);
      expect(execResult.verificationStatus).toBe('FAILED');
      expect(execResult.status).not.toBe('EXECUTED');
      expect(execResult.verificationStatus).not.toBe('SUCCESS');
      expect(execResult.reason).toContain('Ground-truth verification failed');

      verifySpy.mockRestore();
    });

    it('6b. CASE A: Non-Existent Action ID: verifyAction returns ACTION_NOT_FOUND', async () => {
      const fakeActionId = 'non-existent-action-id-999';
      const verifyRes = await VerificationTools.verifyAction(fakeActionId);

      expect(verifyRes.success).toBe(false);
      expect(verifyRes.error?.code).toBe('ACTION_NOT_FOUND');
    });

    it('7. Idempotency Safety: should prevent duplicate execution when retried with same key', async () => {
      const mockDecision: any = {
        decision: 'AUTONOMOUSLY_ALLOWED',
        selectedAction: 'COUPON',
        approvalRequired: false,
        reason: 'Goodwill coupon formulated',
        alternatives: [],
        blockedActions: [],
      };

      const mockInvestigation: any = {
        intent: { issueType: 'GENERAL_SUPPORT', requestedResolution: 'COUPON', entities: { orderId: 'tkt-damaged-phone-001' } },
        customer: { id: 'cust-primary-001' },
      };

      const idempotencyKey = `test-coupon-idemp-${Date.now()}`;

      // First execution
      const exec1 = await ActionExecutor.execute(mockDecision, mockInvestigation, { idempotencyKey });
      expect(exec1.status).toBe('EXECUTED');
      expect(exec1.executed).toBe(true);

      // Second execution with identical idempotencyKey
      const exec2 = await ActionExecutor.execute(mockDecision, mockInvestigation, { idempotencyKey });
      expect(exec2.status).toBe('EXECUTED');
      expect(exec2.executed).toBe(true);
      expect(exec2.actionId).toBe(exec1.actionId);
    });
  });
});
