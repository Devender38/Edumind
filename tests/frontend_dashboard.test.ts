import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';
import { AgentOrchestrator } from '../src/agents/orchestrator/AgentOrchestrator.js';
import { PRESET_SCENARIOS } from '../src/frontend/components/ScenarioPresets.js';

describe('Phase 10: Agent Experience + Autonomous Resolution Dashboard Test Suite', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Preset Scenario API Contract Verification', () => {
    it('1. Preset 1 (High-Value ₹24,999 Damaged Phone) requires approval and performs 0 DB mutations', async () => {
      const preset = PRESET_SCENARIOS[0];
      expect(preset.id).toBe('phone-24999-approval');

      const result = await AgentOrchestrator.run({
        ticketId: preset.ticketId,
        message: preset.message,
        orderId: preset.orderId,
        idempotencyKey: `test-p1-${Date.now()}`,
      });

      expect(result.status).toBe('WAITING_FOR_APPROVAL');
      expect(result.decision?.approvalRequired).toBe(true);
      expect(result.execution).toBeUndefined(); // Zero execution attempt

      // Ground truth safety proof: Refund transactions for this order must be 0
      const refundCount = await prisma.refundTransaction.count({
        where: { orderId: preset.orderId },
      });
      expect(refundCount).toBe(0);
    });

    it('2. Preset 2 (₹4,999 Earbuds Refund) auto-resolves with verified mutation', async () => {
      const preset = PRESET_SCENARIOS[1];
      expect(preset.id).toBe('earbuds-4999-auto');

      const result = await AgentOrchestrator.run({
        ticketId: 'tkt-damaged-phone-001',
        message: preset.message,
        orderId: preset.orderId,
        idempotencyKey: `test-p2-${Date.now()}`,
      });

      expect(result.status).toBe('RESOLVED');
      expect(result.decision?.approvalRequired).toBe(false);
      expect(result.execution?.status).toBe('EXECUTED');
      expect(result.execution?.verificationStatus).toBe('SUCCESS');

      // Ground truth safety proof: Exactly 1 refund transaction exists
      const refundCount = await prisma.refundTransaction.count({
        where: { orderId: preset.orderId },
      });
      expect(refundCount).toBe(1);
    });

    it('3. Preset 3 (Out-of-Stock Replacement) offers alternative replacement or stops at consent', async () => {
      const preset = PRESET_SCENARIOS[2];
      expect(preset.id).toBe('out-of-stock-consent');

      const result = await AgentOrchestrator.run({
        ticketId: 'tkt-damaged-phone-001',
        message: preset.message,
        orderId: preset.orderId,
        customerConsentGiven: false,
        idempotencyKey: `test-p3-${Date.now()}`,
      });

      expect(['WAITING_FOR_CUSTOMER_CONSENT', 'WAITING_FOR_APPROVAL', 'ESCALATED']).toContain(result.status);
      expect(result.decision?.selectedAction).toBeDefined();
    });

    it('4. Preset 4 (Verification / Cancel Request) processes cancellation intent safely', async () => {
      const preset = PRESET_SCENARIOS[3];
      expect(preset.id).toBe('verification-failure');

      const result = await AgentOrchestrator.run({
        ticketId: 'tkt-damaged-phone-001',
        message: preset.message,
        orderId: preset.orderId,
        idempotencyKey: `test-p4-${Date.now()}`,
      });

      expect(['RESOLVED', 'WAITING_FOR_APPROVAL', 'ESCALATED']).toContain(result.status);
      expect(result.intent?.issueType).toBe('CANCELLATION_REQUEST');
    });
  });

  describe('2. Dashboard Safety Proof Invariants', () => {
    it('1. Agent run trace items contain step transitions and evidence details', async () => {
      const runResult = await AgentOrchestrator.run({
        ticketId: 'tkt-damaged-phone-001',
        message: 'My ₹4,999 earbuds order ord-refund-4999 arrived broken.',
        orderId: 'ord-refund-4999',
        idempotencyKey: `test-trace-${Date.now()}`,
      });

      expect(runResult.agentRunId).toBeDefined();

      const runRecord = await prisma.agentRun.findUnique({
        where: { id: runResult.agentRunId },
      });

      expect(runRecord).not.toBeNull();

      const traces = await prisma.agentTrace.findMany({
        where: { agentRunId: runResult.agentRunId },
        orderBy: { timestamp: 'asc' },
      });

      expect(traces.length).toBeGreaterThan(0);
      const stepNames = traces.map((t) => t.step);
      expect(stepNames).toContain('INTENT_CLASSIFICATION');
      expect(stepNames).toContain('INVESTIGATION');
      expect(stepNames).toContain('POLICY_EVALUATION');
    });
  });
});
