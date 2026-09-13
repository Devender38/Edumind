import { describe, it, expect, beforeAll } from 'vitest';
import { seedDatabase } from '../prisma/seed.js';
import { DomainRepository } from '../src/db/repositories/domainRepository.js';
import { AgentStateRepository } from '../src/db/repositories/agentStateRepository.js';
import { IntentAgent } from '../src/agents/intent/IntentAgent.js';
import { InvestigationAgent } from '../src/agents/investigation/InvestigationAgent.js';
import { PolicyEngine } from '../src/policy/PolicyEngine.js';
import { PolicyConditionEvaluator } from '../src/policy/PolicyConditionEvaluator.js';
import { DecisionEngine } from '../src/agents/decision/DecisionEngine.js';
import { prisma } from '../src/db/client.js';

describe('Phase 6: Policy Engine & Decision Engine Test Suite', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  // 1. DB Policy Loading & Condition Evaluator Tests
  describe('PolicyConditionEvaluator & Database Policies', () => {
    it('should load active policies from DB', async () => {
      const activePolicies = await DomainRepository.getActivePolicies();
      expect(activePolicies.length).toBeGreaterThanOrEqual(2);
      expect(activePolicies.some((p) => p.name.includes('Auto-Refund'))).toBe(true);
      expect(activePolicies.some((p) => p.name.includes('Replacement Preference'))).toBe(true);
    });

    it('should evaluate refund threshold policy: <= ₹10,000', async () => {
      const mockPolicy = {
        id: 'p-1',
        name: 'Auto-Refund Limit',
        issueType: 'DAMAGED',
        actionType: 'REFUND',
        conditions: JSON.stringify({ maxAutoRefundAmount: 10000, requiresApprovalAbove: true }),
        approvalRequired: false,
        priority: 1,
        active: true,
      };

      const mockInvestigation: any = {
        intent: { issueType: 'DAMAGED_ITEM', requestedResolution: 'REFUND', entities: { amount: 5000 } },
        order: { totalAmount: 5000 },
        customer: { tier: 'STANDARD' },
        evidence: [],
        eligibilitySignals: [],
        missingInformation: [],
      };

      const evalResult = PolicyConditionEvaluator.evaluatePolicy(mockPolicy, mockInvestigation);
      expect(evalResult.applicable).toBe(true);
      expect(evalResult.approvalRequired).toBe(false);
      expect(evalResult.constraints.length).toBe(0);
    });

    it('should evaluate refund threshold policy: > ₹10,000 requiring approval', async () => {
      const mockPolicy = {
        id: 'p-1',
        name: 'Auto-Refund Limit',
        issueType: 'DAMAGED',
        actionType: 'REFUND',
        conditions: JSON.stringify({ maxAutoRefundAmount: 10000, requiresApprovalAbove: true }),
        approvalRequired: false,
        priority: 1,
        active: true,
      };

      const mockInvestigation: any = {
        intent: { issueType: 'DAMAGED_ITEM', requestedResolution: 'REFUND', entities: { amount: 24999 } },
        order: { totalAmount: 24999 },
        customer: { tier: 'VIP' },
        evidence: [],
        eligibilitySignals: [],
        missingInformation: [],
      };

      const evalResult = PolicyConditionEvaluator.evaluatePolicy(mockPolicy, mockInvestigation);
      expect(evalResult.applicable).toBe(true);
      expect(evalResult.approvalRequired).toBe(true);
      expect(evalResult.constraints.some((c) => c.includes('exceeds automatic refund limit'))).toBe(true);
    });
  });

  // 2. Policy Engine Candidate Action Generation
  describe('PolicyEngine Candidate Action Generation', () => {
    it('should generate eligible and blocked candidate actions correctly', async () => {
      const ticket = await DomainRepository.getTicketById('tkt-damaged-phone-001');
      expect(ticket).toBeDefined();

      const intent = await IntentAgent.analyze({
        ticketId: ticket!.id,
        customerId: ticket!.customerId,
        orderId: ticket!.orderId!,
        message: ticket!.customerMessage,
      });

      const investigation = await InvestigationAgent.investigate({
        intent,
        ticketId: ticket!.id,
        customerId: ticket!.customerId,
        orderId: ticket!.orderId!,
      });

      const policyEval = await PolicyEngine.evaluate(investigation);

      expect(policyEval.applicablePolicies.length).toBeGreaterThanOrEqual(1);
      expect(policyEval.candidateActions.length).toBeGreaterThan(0);

      const refundCandidate = policyEval.candidateActions.find((c) => c.actionType === 'REFUND');
      expect(refundCandidate).toBeDefined();
      expect(refundCandidate!.approvalRequired).toBe(true);
      expect(refundCandidate!.blockingReasons.length).toBeGreaterThan(0);

      const replacementCandidate = policyEval.candidateActions.find((c) => c.actionType === 'REPLACEMENT');
      expect(replacementCandidate).toBeDefined();
      expect(replacementCandidate!.blockingReasons.some((r) => r.includes('out of stock'))).toBe(true);
    });
  });

  // 3. Decision Engine & Explainability Tests
  describe('DecisionEngine Decision Formulation', () => {
    it('should formulate unambiguous decision adhering to policy hierarchy', async () => {
      const ticket = await DomainRepository.getTicketById('tkt-damaged-phone-001');

      const intent = await IntentAgent.analyze({
        ticketId: ticket!.id,
        customerId: ticket!.customerId,
        orderId: ticket!.orderId!,
        message: ticket!.customerMessage,
      });

      const investigation = await InvestigationAgent.investigate({
        intent,
        ticketId: ticket!.id,
        customerId: ticket!.customerId,
        orderId: ticket!.orderId!,
      });

      const policyEval = await PolicyEngine.evaluate(investigation);
      const decisionResult = await DecisionEngine.decide(investigation, policyEval);

      expect(decisionResult).toBeDefined();
      expect(decisionResult.decision).toBe('APPROVAL_REQUIRED');
      expect(decisionResult.approvalRequired).toBe(true);
      expect(decisionResult.selectedAction).toBe('REFUND');
      expect(decisionResult.reason).toContain('exceeds automatic refund threshold');

      // Verify blocked actions list includes Primary Replacement (stock: 0)
      const replacementBlock = decisionResult.blockedActions.find((b) => b.actionType === 'REPLACEMENT');
      expect(replacementBlock).toBeDefined();
      expect(replacementBlock!.reason).toContain('out of stock');

      // Verify alternatives list contains alternative product candidate requiring customer consent
      const alternativeCandidate = decisionResult.alternatives.find((a) => a.feasibility === 'REQUIRES_CUSTOMER_CONSENT');
      expect(alternativeCandidate).toBeDefined();
      expect(alternativeCandidate!.parameters?.requiresCustomerConsent).toBe(true);

      expect(decisionResult.explanation.customerIntentSummary).toBeDefined();
      expect(decisionResult.explanation.policyEvaluationSummary).toBeDefined();
      expect(decisionResult.explanation.actionSelectionJustification).toBeDefined();
      expect(decisionResult.explanation.inventoryOrConstraintNote).toContain('OUT OF STOCK');
    });

    it('should handle standalone agent run state tracing when agentRunId is provided', async () => {
      const ticket = await DomainRepository.getTicketById('tkt-damaged-phone-001');
      const run = await AgentStateRepository.createAgentRun({
        ticketId: ticket!.id,
        goal: 'Resolve ₹24,999 Damaged Phone Ticket',
      });

      const intent = await IntentAgent.analyze({
        ticketId: ticket!.id,
        message: ticket!.customerMessage,
        agentRunId: run.id,
      });

      const investigation = await InvestigationAgent.investigate({
        intent,
        ticketId: ticket!.id,
        agentRunId: run.id,
      });

      const policyEval = await PolicyEngine.evaluate(investigation, { agentRunId: run.id });
      const decisionResult = await DecisionEngine.decide(investigation, policyEval, { agentRunId: run.id });

      expect(decisionResult).toBeDefined();

      const updatedRun = await AgentStateRepository.getAgentRun(run.id);
      expect(updatedRun).toBeDefined();

      const traceSteps = updatedRun!.traces.map((t) => t.step);
      expect(traceSteps).toContain('POLICY_EVALUATION');
      expect(traceSteps).toContain('DECISION_FORMULATION');
    });
  });

  // 4. Side-Effect Safety & Business State Isolation Test
  describe('Phase 6 Side-Effect Safety Verification', () => {
    it('must NOT execute business state-changing tools or mutate business entities during Policy + Decision runs', async () => {
      const orderBefore = await DomainRepository.getOrderById('ord-phone-24999');
      const initialOrderStatus = orderBefore!.status;
      const initialStock = orderBefore!.items[0].product.stockQuantity;

      const initialRefundCount = await prisma.refundTransaction.count();
      const initialActionRecordCount = await prisma.actionRecord.count();
      const initialCouponCount = await prisma.coupon.count();
      const initialEscalationCount = await prisma.escalation.count();
      const initialNotificationCount = await prisma.notification.count();

      // Run full pipeline: Intent -> Investigation -> Policy -> Decision
      const intent = await IntentAgent.analyze({
        orderId: 'ord-phone-24999',
        message: 'My ₹24,999 phone arrived damaged. I want a refund.',
      });

      const investigation = await InvestigationAgent.investigate({
        intent,
        orderId: 'ord-phone-24999',
      });

      const policyEval = await PolicyEngine.evaluate(investigation);
      const decisionResult = await DecisionEngine.decide(investigation, policyEval);

      expect(decisionResult.decision).toBe('APPROVAL_REQUIRED');

      // VERIFY ZERO SIDE-EFFECTS IN BUSINESS DB
      const orderAfter = await DomainRepository.getOrderById('ord-phone-24999');
      expect(orderAfter!.status).toBe(initialOrderStatus);
      expect(orderAfter!.items[0].product.stockQuantity).toBe(initialStock);

      const finalRefundCount = await prisma.refundTransaction.count();
      const finalActionRecordCount = await prisma.actionRecord.count();
      const finalCouponCount = await prisma.coupon.count();
      const finalEscalationCount = await prisma.escalation.count();
      const finalNotificationCount = await prisma.notification.count();

      expect(finalRefundCount).toBe(initialRefundCount);
      expect(finalActionRecordCount).toBe(initialActionRecordCount);
      expect(finalCouponCount).toBe(initialCouponCount);
      expect(finalEscalationCount).toBe(initialEscalationCount);
      expect(finalNotificationCount).toBe(initialNotificationCount);
    });
  });
});
