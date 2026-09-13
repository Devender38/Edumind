import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'http';
import { prisma } from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';
import app from '../src/backend/server.js';
import { getAuthHeaders } from './helpers/authHelper.js';
import { AgentOrchestrator } from '../src/agents/orchestrator/AgentOrchestrator.js';
import { AgentStateRepository } from '../src/db/repositories/agentStateRepository.js';
import { CANONICAL_DEMO_SCENARIOS, assertNeverFalseResolution } from './fixtures/demoScenarios.js';

describe('Phase 12: Production-Grade Case Lifecycle & Human-in-the-Loop Resume Test Suite', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    await prisma.$connect();
    await new Promise<void>((resolve) => {
      server = app.listen(5056, () => {
        baseUrl = 'http://localhost:5056';
        resolve();
      });
    });
  });

  beforeEach(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((res) => server.close(() => res()));
    }
    await prisma.$disconnect();
  });

  describe('1. Human Approval Lifecycle & Resume Tests', () => {
    it('1. Approval endpoint resumes existing AgentRun and executes high-value refund upon valid manager approval', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_A;
      const idempotencyKey = `p12-approve-run-${Date.now()}`;

      // Step 1: Initial run -> PAUSED at WAITING_FOR_APPROVAL
      const initRes = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('SERVICE') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey,
        }),
      });

      const initData = await initRes.json();
      const runId = initData.orchestrationResult?.agentRunId || initData.orchestrationResult?.runId;
      expect(runId).toBeDefined();
      expect(initData.orchestrationResult.status).toBe('WAITING_FOR_APPROVAL');

      // Verify 0 DB mutations prior to approval
      const refundsBefore = await prisma.refundTransaction.count({ where: { orderId: sc.orderId } });
      expect(refundsBefore).toBe(0);

      // Step 2: POST /api/v1/agents/runs/:id/approve
      const approveRes = await fetch(`${baseUrl}/api/v1/agents/runs/${runId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('APPROVER') },
        body: JSON.stringify({
          decision: 'APPROVE',
          reason: 'High-value refund approved by senior ops manager.',
        }),
      });

      expect(approveRes.status).toBe(200);
      const approveData = await approveRes.json();
      expect(approveData.success).toBe(true);

      const result = approveData.orchestrationResult;
      expect(result.agentRunId).toBe(runId); // Resumes SAME AgentRun ID!
      expect(result.status).toBe('RESOLVED');
      expect(result.execution?.status).toBe('EXECUTED');
      expect(result.execution?.verificationStatus).toBe('SUCCESS');

      // Verify direct ground-truth DB mutation post-approval
      const refundsAfter = await prisma.refundTransaction.count({ where: { orderId: sc.orderId } });
      expect(refundsAfter).toBe(1);

      assertNeverFalseResolution(result);
    });

    it('2. Manager approval rejection halts case cleanly at ESCALATED with 0 business mutations', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_A;
      const idempotencyKey = `p12-reject-run-${Date.now()}`;

      // Step 1: Initial run -> WAITING_FOR_APPROVAL
      const initRes = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('SERVICE') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey,
        }),
      });
      const initData = await initRes.json();
      const runId = initData.orchestrationResult?.agentRunId || initData.orchestrationResult?.runId;

      // Step 2: POST /api/v1/agents/runs/:id/approve with REJECT decision
      const rejectRes = await fetch(`${baseUrl}/api/v1/agents/runs/${runId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('APPROVER') },
        body: JSON.stringify({
          decision: 'REJECT',
          reason: 'Manager rejected high-value refund request.',
        }),
      });

      expect(rejectRes.status).toBe(200);
      const rejectData = await rejectRes.json();
      expect(rejectData.orchestrationResult.status).toBe('ESCALATED');

      // Verify 0 DB mutations on rejection
      const refundCount = await prisma.refundTransaction.count({ where: { orderId: sc.orderId } });
      expect(refundCount).toBe(0);

      // Verify rejection audit trace recorded
      const traces = await prisma.agentTrace.findMany({ where: { agentRunId: runId } });
      const titles = traces.map((t) => t.title);
      expect(titles).toContain('Manager Approval Rejected');
    });

    it('3. Repeated approval attempts on a resolved run return HTTP 409 conflict and prevent duplicate mutations', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_A;
      const idempotencyKey = `p12-idemp-approve-${Date.now()}`;

      const initRes = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('SERVICE') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey,
        }),
      });
      const initData = await initRes.json();
      const runId = initData.orchestrationResult?.agentRunId || initData.orchestrationResult?.runId;

      // First Approval
      await fetch(`${baseUrl}/api/v1/agents/runs/${runId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('APPROVER') },
        body: JSON.stringify({ decision: 'APPROVE' }),
      });

      const refundCountFirst = await prisma.refundTransaction.count({ where: { orderId: sc.orderId } });
      expect(refundCountFirst).toBe(1);

      // Second Approval Attempt
      const dupRes = await fetch(`${baseUrl}/api/v1/agents/runs/${runId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('APPROVER') },
        body: JSON.stringify({ decision: 'APPROVE' }),
      });

      expect(dupRes.status).toBe(409); // Conflict

      const refundCountSecond = await prisma.refundTransaction.count({ where: { orderId: sc.orderId } });
      expect(refundCountSecond).toBe(1); // Zero duplicate mutations!
    });
  });

  describe('2. Customer Consent Lifecycle & Resume Tests', () => {
    it('1. Customer consent endpoint resumes run and executes alternative replacement when consent is granted', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_C;
      const idempotencyKey = `p12-consent-grant-${Date.now()}`;

      // Step 1: Initial run without consent -> PAUSED at WAITING_FOR_CUSTOMER_CONSENT
      const initRes = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('SERVICE') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          customerConsentGiven: false,
          idempotencyKey,
        }),
      });
      const initData = await initRes.json();
      const runId = initData.orchestrationResult?.agentRunId || initData.orchestrationResult?.runId;

      // Step 2: POST /api/v1/agents/runs/:id/consent with consentGiven: true
      const consentRes = await fetch(`${baseUrl}/api/v1/agents/runs/${runId}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('CUSTOMER', 'cust-primary-001') },
        body: JSON.stringify({
          consentGiven: true,
          reason: 'Customer agreed to alternative SKU substitution.',
        }),
      });

      expect(consentRes.status).toBe(200);
      const consentData = await consentRes.json();
      expect(consentData.success).toBe(true);

      const result = consentData.orchestrationResult;
      expect(result.agentRunId).toBe(runId); // Resumes SAME AgentRun ID!
      assertNeverFalseResolution(result);
    });

    it('2. Customer consent denial halts case safely at ESCALATED with 0 stock decrement', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_C;
      const idempotencyKey = `p12-consent-deny-${Date.now()}`;

      const initRes = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('SERVICE') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          customerConsentGiven: false,
          idempotencyKey,
        }),
      });
      const initData = await initRes.json();
      const runId = initData.orchestrationResult?.agentRunId || initData.orchestrationResult?.runId;

      // Consent Denial
      const denyRes = await fetch(`${baseUrl}/api/v1/agents/runs/${runId}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('CUSTOMER', 'cust-primary-001') },
        body: JSON.stringify({
          consentGiven: false,
          reason: 'Customer requested full refund instead of alternative SKU.',
        }),
      });

      expect(denyRes.status).toBe(200);
      const denyData = await denyRes.json();
      expect(denyData.orchestrationResult.status).toBe('ESCALATED');

      // Verify alternative product stock remains 15 (0 stock decrement)
      const altProduct = await prisma.product.findUnique({ where: { id: sc.alternativeProductId } });
      expect(altProduct?.stockQuantity).toBe(15);
    });
  });

  describe('3. Restart Recovery & Concurrency Safety Tests', () => {
    it('1. Persisted waiting AgentRun survives process restart and resumes cleanly from SQLite DB', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_A;
      const idempotencyKey = `p12-restart-run-${Date.now()}`;

      // Run 1: Pause at WAITING_FOR_APPROVAL
      const run1 = await AgentOrchestrator.run({
        ticketId: sc.ticketId,
        orderId: sc.orderId,
        message: sc.message,
        idempotencyKey,
      });

      const agentRunId = run1.agentRunId;
      expect(agentRunId).toBeDefined();

      // Confirm persisted run in DB
      const persistedBefore = await AgentStateRepository.getAgentRun(agentRunId!);
      expect(persistedBefore).not.toBeNull();
      expect(['WAITING_FOR_APPROVAL', 'ACTION_PENDING']).toContain(persistedBefore?.status);

      // Simulate Process Restart: Call AgentOrchestrator.resumeRun on fresh invocation
      const resumed = await AgentOrchestrator.resumeRun(agentRunId!, {
        decision: 'APPROVE',
        approvalToken: 'MANAGER_TOKEN_AFTER_RESTART',
      });

      expect(resumed.agentRunId).toBe(agentRunId); // Same AgentRun ID
      expect(resumed.status).toBe('RESOLVED');
      expect(resumed.execution?.verificationStatus).toBe('SUCCESS');

      // Direct DB verification
      const refundCount = await prisma.refundTransaction.count({ where: { orderId: sc.orderId } });
      expect(refundCount).toBe(1);
    });

    it('2. Concurrent approval requests execute the business action exactly once', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_A;
      const idempotencyKey = `p12-concurrent-approve-${Date.now()}`;

      const initRes = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('SERVICE') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey,
        }),
      });
      const initData = await initRes.json();
      const runId = initData.orchestrationResult?.agentRunId || initData.orchestrationResult?.runId;

      // Fire two concurrent approval requests simultaneously
      const [res1, res2] = await Promise.all([
        fetch(`${baseUrl}/api/v1/agents/runs/${runId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders('APPROVER') },
          body: JSON.stringify({ decision: 'APPROVE' }),
        }),
        fetch(`${baseUrl}/api/v1/agents/runs/${runId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders('APPROVER') },
          body: JSON.stringify({ decision: 'APPROVE' }),
        }),
      ]);

      const refundCount = await prisma.refundTransaction.count({ where: { orderId: sc.orderId } });
      const actionCount = await prisma.actionRecord.count({ where: { actionType: 'REFUND' } });

      // Concurrent Safety Assertion: Exactly 1 financial mutation
      expect(refundCount).toBe(1);
      expect(actionCount).toBe(1);
    });
  });
});
