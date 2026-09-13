import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import http from 'http';
import { prisma } from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';
import app from '../src/backend/server.js';
import { AgentOrchestrator } from '../src/agents/orchestrator/AgentOrchestrator.js';
import { AgentStateRepository } from '../src/db/repositories/agentStateRepository.js';
import { VerificationTools } from '../src/tools/verificationTools.js';
import { ActionTools } from '../src/tools/actionTools.js';
import { CANONICAL_DEMO_SCENARIOS, assertNeverFalseResolution } from './fixtures/demoScenarios.js';
import { FailureInjector } from '../src/utils/failureInjector.js';
import { RetryPolicy } from '../src/utils/retryPolicy.js';
import { TimeoutPolicy } from '../src/utils/timeoutPolicy.js';
import { getAuthHeaders } from './helpers/authHelper.js';

describe('Phase 14: Reliability, Failure Injection & Production Hardening Suite', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    await prisma.$connect();
    await new Promise<void>((resolve) => {
      server = app.listen(5059, () => {
        baseUrl = 'http://localhost:5059';
        resolve();
      });
    });
  });

  beforeEach(async () => {
    FailureInjector.reset();
    await seedDatabase();
  });

  afterAll(async () => {
    FailureInjector.reset();
    if (server) {
      await new Promise<void>((res) => server.close(() => res()));
    }
    await prisma.$disconnect();
  });

  describe('1. Failure Injection & Bounded Retry Policy', () => {
    it('1. Transient failure before tool execution triggers safe retry and succeeds', async () => {
      FailureInjector.enable({
        point: 'BEFORE_TOOL',
        target: 'issueRefund',
        failOnce: true,
      });

      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const res = await AgentOrchestrator.run({
        ticketId: sc.ticketId,
        orderId: sc.orderId,
        message: sc.message,
        idempotencyKey: `p14-retry-succ-${Date.now()}`,
      });

      expect(res.status).toBe('RESOLVED');
      expect(res.execution?.verificationStatus).toBe('SUCCESS');
      expect(FailureInjector.getHistory().length).toBe(1);
    });

    it('2. Non-retryable errors stop execution cleanly without infinite loops', () => {
      expect(RetryPolicy.isRetryable(new Error('POLICY_BLOCK: Exceeds maximum threshold'))).toBe(false);
      expect(RetryPolicy.isRetryable(new Error('APPROVAL_REQUIRED'))).toBe(false);
      expect(RetryPolicy.isRetryable(new Error('VERIFICATION_FAILED'))).toBe(false);
    });

    it('3. Retry limit exhaustion stops bounded at maxAttempts', async () => {
      let attemptsCount = 0;
      await expect(
        RetryPolicy.executeWithRetry(
          async () => {
            attemptsCount++;
            throw new Error('TOOL_FAILURE: Continuous transient failure');
          },
          { maxAttempts: 3, operationName: 'ExhaustionTest' }
        )
      ).rejects.toThrow('Continuous transient failure');

      expect(attemptsCount).toBe(3);
    });
  });

  describe('2. Crash Window Handling & Ground-Truth Verification-First', () => {
    it('1. Crash after business mutation uses ground truth to prevent duplicate financial mutation', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const idempotencyKey = `p14-crash-after-mut-${Date.now()}`;

      // Simulate first attempt where mutation happens in DB but crash occurs immediately after
      FailureInjector.enable({
        point: 'AFTER_ACTION_MUTATION',
        target: 'issueRefund',
        failOnce: true,
      });

      const runRes = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('CUSTOMER') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey,
        }),
      });

      const data = await runRes.json();
      expect(data.orchestrationResult.status).toBe('RESOLVED');
      expect(data.orchestrationResult.execution?.verificationStatus).toBe('SUCCESS');

      // Verify Failure Injection actually triggered once
      const injectedHistory = FailureInjector.getHistory().filter((h) => h.point === 'AFTER_ACTION_MUTATION');
      expect(injectedHistory.length).toBe(1);

      // Verify Ground Truth DB: EXACTLY ONE RefundTransaction created in SQLite!
      const refundCountFinal = await prisma.refundTransaction.count({ where: { orderId: sc.orderId } });
      expect(refundCountFinal).toBe(1); // EXACTLY 1! ZERO DUPLICATE FINANCIAL MUTATION!
    });
  });

  describe('3. Process Restart & Durable Resume', () => {
    it('1. Run waiting for manager approval resumes cleanly after process restart simulation', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_A;
      const idempotencyKey = `p14-restart-appr-${Date.now()}`;

      // Step 1: Initial run -> PAUSED at WAITING_FOR_APPROVAL
      const initRes = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('CUSTOMER') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey,
        }),
      });
      const initData = await initRes.json();
      const runId = initData.orchestrationResult.agentRunId;

      const reloadedRun = await AgentStateRepository.getAgentRun(runId);
      expect(reloadedRun?.currentStep).toBe('WAITING_FOR_APPROVAL');
      expect(['WAITING_FOR_APPROVAL', 'ACTION_PENDING']).toContain(reloadedRun?.status);

      // Step 2: POST Approve
      const approveRes = await fetch(`${baseUrl}/api/v1/agents/runs/${runId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('APPROVER') },
        body: JSON.stringify({
          decision: 'APPROVE',
          approvalToken: 'MANAGER_APPROVAL_TOKEN_VALID',
          reason: 'Approved post-restart.',
        }),
      });

      const approveData = await approveRes.json();
      expect(approveData.orchestrationResult.status).toBe('RESOLVED');
      expect(approveData.orchestrationResult.agentRunId).toBe(runId);
    });
  });

  describe('4. Ground-Truth Reconciliation Endpoint', () => {
    it('1. POST /api/v1/ops/runs/:id/reconcile inspects DB ground truth and repairs uncompleted run cleanly', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const idempotencyKey = `p14-reconcile-test-${Date.now()}`;

      // Create an action in DB but leave run in intermediate state
      const run = await AgentStateRepository.createAgentRun({
        ticketId: sc.ticketId,
        goal: sc.message,
      });

      const refundTx = await prisma.refundTransaction.create({
        data: {
          orderId: sc.orderId,
          amount: 4999,
          reason: 'Reconciliation test refund',
          idempotencyKey,
          status: 'COMPLETED',
        },
      });

      await prisma.actionRecord.create({
        data: {
          ticketId: sc.ticketId,
          agentRunId: run.id,
          actionType: 'REFUND',
          status: 'VERIFIED',
          externalReference: refundTx.id,
          amount: 4999,
        },
      });

      // Call Reconcile Endpoint
      const recRes = await fetch(`${baseUrl}/api/v1/ops/runs/${run.id}/reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('OPERATOR') },
      });

      expect(recRes.status).toBe(200);
      const recData = await recRes.json();
      expect(recData.success).toBe(true);
      expect(recData.reconciliation.status).toBe('RESOLVED');
      expect(recData.reconciliation.actionTaken).toBe('RECONCILED_RESOLVED');
    });

    it('2. Reconcile endpoint returns 404 for non-existent run ID', async () => {
      const res = await fetch(`${baseUrl}/api/v1/ops/runs/non-existent-run-id/reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('OPERATOR') },
      });
      expect(res.status).toBe(404);
    });
  });

  describe('5. Timeout & Concurrency Protection', () => {
    it('1. TimeoutPolicy rejects execution exceeding threshold', async () => {
      const slowPromise = new Promise((resolve) => setTimeout(resolve, 500));
      await expect(
        TimeoutPolicy.withTimeout(slowPromise, 50, 'SlowToolOperation')
      ).rejects.toThrow('SlowToolOperation timed out after 50ms');
    });

    it('2. Concurrent approval requests yield exactly ONE financial mutation', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_A;
      const idempotencyKey = `p14-concurrent-appr-${Date.now()}`;

      // Step 1: Initial run -> WAITING_FOR_APPROVAL
      const initRes = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('CUSTOMER') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey,
        }),
      });
      const initData = await initRes.json();
      const runId = initData.orchestrationResult.agentRunId;

      // Step 2: Trigger 2 concurrent approval requests simultaneously
      const [res1, res2] = await Promise.all([
        fetch(`${baseUrl}/api/v1/agents/runs/${runId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders('APPROVER') },
          body: JSON.stringify({
            decision: 'APPROVE',
            approvalToken: 'MANAGER_APPROVAL_TOKEN_VALID',
            reason: 'Concurrent request 1',
          }),
        }),
        fetch(`${baseUrl}/api/v1/agents/runs/${runId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders('APPROVER') },
          body: JSON.stringify({
            decision: 'APPROVE',
            approvalToken: 'MANAGER_APPROVAL_TOKEN_VALID',
            reason: 'Concurrent request 2',
          }),
        }),
      ]);

      const statuses = [res1.status, res2.status];
      expect(statuses).toContain(200);

      // Verify ground truth DB: Exactly 1 RefundTransaction created
      const refundCount = await prisma.refundTransaction.count({ where: { orderId: sc.orderId } });
      expect(refundCount).toBe(1);
    });
  });

  describe('6. Critical Business Safety Invariants', () => {
    it('1. High-value refund (>₹10k) performs ZERO mutations prior to approval', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_A;
      const res = await AgentOrchestrator.run({
        ticketId: sc.ticketId,
        orderId: sc.orderId,
        message: sc.message,
        idempotencyKey: `p14-highval-safety-${Date.now()}`,
      });

      expect(res.status).toBe('WAITING_FOR_APPROVAL');
      const refundCount = await prisma.refundTransaction.count({ where: { orderId: sc.orderId } });
      expect(refundCount).toBe(0);
    });

    it('2. Low-value refund (<=₹10k) auto-resolves with exactly 1 verified mutation', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const res = await AgentOrchestrator.run({
        ticketId: sc.ticketId,
        orderId: sc.orderId,
        message: sc.message,
        idempotencyKey: `p14-lowval-auto-${Date.now()}`,
      });

      expect(res.status).toBe('RESOLVED');
      expect(res.execution?.verificationStatus).toBe('SUCCESS');
      const refundCount = await prisma.refundTransaction.count({ where: { orderId: sc.orderId } });
      expect(refundCount).toBe(1);
    });

    it('3. Verification failure escalates case and NEVER claims RESOLVED', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_D;

      vi.spyOn(VerificationTools, 'verifyAction').mockResolvedValueOnce({
        success: true,
        data: {
          actionId: 'act-mismatch-id',
          actionType: 'CANCELLATION',
          verified: false,
          expectedState: 'CANCELLED_ORDER',
          actualState: 'ORDER_STATUS_PROCESSING',
          verifiedAt: new Date().toISOString(),
        },
      });

      const res = await AgentOrchestrator.run({
        ticketId: sc.ticketId,
        orderId: sc.orderId,
        message: sc.message,
        idempotencyKey: `p14-verif-fail-esc-${Date.now()}`,
      });

      expect(res.status).toBe('ESCALATED');
      assertNeverFalseResolution(res);
    });
  });
});
