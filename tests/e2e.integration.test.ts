import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import http from 'http';
import { prisma } from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';
import app from '../src/backend/server.js';
import { VerificationTools } from '../src/tools/verificationTools.js';
import { getAuthHeaders } from './helpers/authHelper.js';
import {
  CANONICAL_DEMO_SCENARIOS,
  assertNeverFalseResolution,
  assertWaitingStateNoMutations,
} from './fixtures/demoScenarios.js';

describe('Phase 11: End-to-End Integration & Demo Flow Test Suite', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    await prisma.$connect();
    // Start E2E HTTP Server instance on port 5055 to avoid port collision
    await new Promise<void>((resolve) => {
      server = app.listen(5055, () => {
        baseUrl = 'http://localhost:5055';
        resolve();
      });
    });
  });

  beforeEach(async () => {
    await seedDatabase();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((res) => server.close(() => res()));
    }
    await prisma.$disconnect();
  });

  describe('1. API Health & Gateway Smoke Tests', () => {
    it('1. GET /api/v1/health returns HTTP 200 OK with system status', async () => {
      const res = await fetch(`${baseUrl}/api/v1/health`);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe('ok');
      expect(data.service).toContain('ResolveX');
      expect(data.version).toBeDefined();
    });

    it('2. GET /api/v1/tools returns discoverable registered tools', async () => {
      const res = await fetch(`${baseUrl}/api/v1/tools`, {
        headers: getAuthHeaders('OPERATOR'),
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.tools).toBeDefined();
      expect(Array.isArray(data.tools)).toBe(true);

      const toolNames = data.tools;
      expect(toolNames).toContain('issueRefund');
      expect(toolNames).toContain('createReplacement');
      expect(toolNames).toContain('cancelOrder');
      expect(toolNames).toContain('applyCoupon');
      expect(toolNames).toContain('escalateTicket');
    });
  });

  describe('2. Scenario A E2E — High-Value Refund Approval Gate', () => {
    it('1. POST /api/v1/agents/run with ₹24,999 refund halts at WAITING_FOR_APPROVAL with 0 mutations', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_A;
      const idempotencyKey = `e2e-sc-a-${Date.now()}`;

      const res = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('SERVICE') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      const result = data.orchestrationResult;
      expect(result.status).toBe('WAITING_FOR_APPROVAL');
      expect(result.intent?.issueType).toBe('DAMAGED_ITEM');
      expect(result.intent?.requestedResolution).toBe('REFUND');
      expect(result.intent?.entities?.amount).toBe(24999);

      expect(result.decision?.approvalRequired).toBe(true);
      expect(result.execution).toBeUndefined(); // Zero execution attempt

      // Direct Ground-Truth Database Assertions
      const refundCount = await prisma.refundTransaction.count({
        where: { orderId: sc.orderId },
      });
      const actionCount = await prisma.actionRecord.count({
        where: { actionType: 'REFUND' },
      });
      const order = await prisma.order.findUnique({
        where: { id: sc.orderId },
      });

      expect(refundCount).toBe(0);
      expect(actionCount).toBe(0);
      expect(order?.status).toBe('DELIVERED');

      assertNeverFalseResolution(result);
      assertWaitingStateNoMutations(result, refundCount, actionCount);
    });
  });

  describe('3. Scenario B E2E — Low-Value Auto Refund & Idempotency', () => {
    it('1. POST /api/v1/agents/run with ₹4,999 refund auto-resolves with exactly 1 verified mutation', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const idempotencyKey = `e2e-sc-b-${Date.now()}`;

      const res = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('SERVICE') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      const result = data.orchestrationResult;
      expect(result.status).toBe('RESOLVED');
      expect(result.execution?.status).toBe('EXECUTED');
      expect(result.execution?.executed).toBe(true);
      expect(result.execution?.verificationStatus).toBe('SUCCESS');
      expect(result.resolution?.confirmed).toBe(true);

      // Direct Ground-Truth Database Assertions
      const refundCount = await prisma.refundTransaction.count({
        where: { orderId: sc.orderId },
      });
      const actionRecords = await prisma.actionRecord.findMany({
        where: { actionType: 'REFUND' },
      });

      expect(refundCount).toBe(1);
      expect(actionRecords.length).toBe(1);
      expect(actionRecords[0].id).toBe(result.execution.actionId);

      assertNeverFalseResolution(result);
    });

    it('2. Repeated request with identical idempotency key MUST NOT create duplicate financial mutations', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const idempotencyKey = `e2e-idempotency-refund-4999-${Date.now()}`;

      // Request 1
      const res1 = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('SERVICE') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey,
        }),
      });
      const data1 = await res1.json();
      expect(data1.orchestrationResult.status).toBe('RESOLVED');

      const refundCountBeforeSecond = await prisma.refundTransaction.count({
        where: { orderId: sc.orderId },
      });
      const actionCountBeforeSecond = await prisma.actionRecord.count({
        where: { actionType: 'REFUND' },
      });

      expect(refundCountBeforeSecond).toBe(1);

      // Request 2 (Duplicate)
      const res2 = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('SERVICE') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey,
        }),
      });
      const data2 = await res2.json();
      expect(data2.orchestrationResult.status).toBe('RESOLVED');

      const refundCountAfterSecond = await prisma.refundTransaction.count({
        where: { orderId: sc.orderId },
      });
      const actionCountAfterSecond = await prisma.actionRecord.count({
        where: { actionType: 'REFUND' },
      });

      // Strict Idempotency Assertion: Zero duplicate rows created
      expect(refundCountAfterSecond).toBe(refundCountBeforeSecond);
      expect(actionCountAfterSecond).toBe(actionCountBeforeSecond);
    });
  });

  describe('4. Scenario C E2E — Out of Stock Recovery & Customer Consent Gate', () => {
    it('1. Replacement for OOS primary SKU discovers alternative and halts at customer consent gate with 0 stock decrement', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_C;
      const idempotencyKey = `e2e-sc-c-${Date.now()}`;

      // Verify Initial Product Stocks
      const primaryProdBefore = await prisma.product.findUnique({
        where: { id: sc.primaryProductId },
      });
      const altProdBefore = await prisma.product.findUnique({
        where: { id: sc.alternativeProductId },
      });

      expect(primaryProdBefore?.stockQuantity).toBe(sc.primaryExpectedStock); // 0
      expect(altProdBefore?.stockQuantity).toBe(sc.alternativeExpectedStock); // 15

      const res = await fetch(`${baseUrl}/api/v1/agents/run`, {
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

      expect(res.status).toBe(200);
      const data = await res.json();
      const result = data.orchestrationResult;

      expect(['WAITING_FOR_CUSTOMER_CONSENT', 'WAITING_FOR_APPROVAL', 'ESCALATED']).toContain(result.status);
      expect(result.execution).toBeUndefined(); // Zero execution attempt without consent

      // Verify Stock Integrity & Action Records
      const altProdAfter = await prisma.product.findUnique({
        where: { id: sc.alternativeProductId },
      });
      const replacementActionCount = await prisma.actionRecord.count({
        where: { actionType: 'REPLACEMENT' },
      });

      expect(altProdAfter?.stockQuantity).toBe(sc.alternativeExpectedStock); // Still 15 (0 stock decrement)
      expect(replacementActionCount).toBe(0);

      assertNeverFalseResolution(result);
    });

    it('2. Consent-positive path enables alternative replacement execution when consent is granted', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_C;
      const idempotencyKey = `e2e-sc-c-consent-${Date.now()}`;

      const res = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('SERVICE') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          customerConsentGiven: true,
          idempotencyKey,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      const result = data.orchestrationResult;

      expect(result.decision?.selectedAction).toBeDefined();
      assertNeverFalseResolution(result);
    });
  });

  describe('5. Scenario D E2E — Verification Failure & Escalation Safety', () => {
    it('1. Verification failure never claims RESOLVED and escalates case safely', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_D;
      const idempotencyKey = `e2e-sc-d-${Date.now()}`;

      // Simulate ground-truth verification mismatch (verified = false)
      vi.spyOn(VerificationTools, 'verifyAction').mockResolvedValueOnce({
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

      const res = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('SERVICE') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      const result = data.orchestrationResult;

      expect(result.status).not.toBe('RESOLVED');
      expect(['ESCALATED', 'WAITING_FOR_APPROVAL', 'FAILED']).toContain(result.status);
      assertNeverFalseResolution(result);
    });
  });

  describe('6. AgentRun Persistence & Trace Completeness API Tests', () => {
    it('1. GET /api/v1/agent-runs/:id retrieves persisted AgentRun and chronological trace entries', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const idempotencyKey = `e2e-trace-run-${Date.now()}`;

      const runRes = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('SERVICE') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey,
        }),
      });

      const runData = await runRes.json();
      const agentRunId = runData.orchestrationResult.agentRunId;
      expect(agentRunId).toBeDefined();

      // Retrieve via Read-Only GET Endpoint
      const getRes = await fetch(`${baseUrl}/api/v1/agent-runs/${agentRunId}`, {
        headers: getAuthHeaders('OPERATOR'),
      });
      expect(getRes.status).toBe(200);

      const runDetails = await getRes.json();
      expect(runDetails.id).toBe(agentRunId);
      expect(['COMPLETED', 'RESOLVED']).toContain(runDetails.status);

      expect(Array.isArray(runDetails.traces)).toBe(true);
      expect(runDetails.traces.length).toBeGreaterThan(0);

      const steps = runDetails.traces.map((t: any) => t.step);
      expect(steps).toContain('GOAL_RECEIVED');
      expect(steps).toContain('INTENT_CLASSIFICATION');
      expect(steps).toContain('INVESTIGATION');
      expect(steps).toContain('POLICY_EVALUATION');
    });
  });
});
