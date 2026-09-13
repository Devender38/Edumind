import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import http from 'http';
import { prisma } from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';
import app from '../src/backend/server.js';
import { AgentOrchestrator } from '../src/agents/orchestrator/AgentOrchestrator.js';
import { AgentStateRepository } from '../src/db/repositories/agentStateRepository.js';
import { VerificationTools } from '../src/tools/verificationTools.js';
import { CANONICAL_DEMO_SCENARIOS, assertNeverFalseResolution } from './fixtures/demoScenarios.js';
import { Logger } from '../src/utils/logger.js';
import { classifyError, ResolveXError } from '../src/utils/errors.js';
import { getAuthHeaders } from './helpers/authHelper.js';

describe('Phase 13: Production Observability, Audit Integrity & Operator Control Plane Suite', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    await prisma.$connect();
    await new Promise<void>((resolve) => {
      server = app.listen(5058, () => {
        baseUrl = 'http://localhost:5058';
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

  describe('A. Correlation ID Lifecycle', () => {
    it('1. Generates correlation ID when absent in request', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B; // low-value refund

      const res = await AgentOrchestrator.run({
        ticketId: sc.ticketId,
        orderId: sc.orderId,
        message: sc.message,
        idempotencyKey: `p13-corr-gen-${Date.now()}`
      });

      expect(res.correlationId).toBeDefined();
      expect(res.correlationId).toMatch(/^corr-\d+-/);
    });

    it('2. Preserves caller-supplied correlation ID', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const customCorrId = `CUSTOM-TRACE-ID-${Date.now()}`;

      const res = await AgentOrchestrator.run({
        ticketId: sc.ticketId,
        orderId: sc.orderId,
        message: sc.message,
        idempotencyKey: `p13-corr-preserve-${Date.now()}`,
        correlationId: customCorrId
      });

      expect(res.correlationId).toBe(customCorrId);
    });

    it('3. Preserves correlation ID across human approval resume', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_A; // high-value refund requiring approval
      const customCorrId = `RESUME-TRACE-ID-${Date.now()}`;

      // Step 1: Initial run -> PAUSED at WAITING_FOR_APPROVAL
      const initRes = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('CUSTOMER') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey: `p13-corr-resume-${Date.now()}`,
          correlationId: customCorrId
        }),
      });

      const initData = await initRes.json();
      const runId = initData.orchestrationResult.agentRunId;
      expect(initData.orchestrationResult.correlationId).toBe(customCorrId);

      // Step 2: Approve run
      const approveRes = await fetch(`${baseUrl}/api/v1/agents/runs/${runId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('APPROVER') },
        body: JSON.stringify({
          decision: 'APPROVE',
          approvalToken: 'MANAGER_APPROVAL_TOKEN_VALID',
          reason: 'Approved for testing trace continuity.'
        }),
      });

      const approveData = await approveRes.json();
      expect(approveData.orchestrationResult.correlationId).toBe(customCorrId);
    });

    it('4. Generates unique correlation IDs for independent runs', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;

      const res1 = await AgentOrchestrator.run({
        ticketId: sc.ticketId,
        orderId: sc.orderId,
        message: sc.message,
        idempotencyKey: `p13-unique-1-${Date.now()}`
      });

      const res2 = await AgentOrchestrator.run({
        ticketId: sc.ticketId,
        orderId: sc.orderId,
        message: sc.message,
        idempotencyKey: `p13-unique-2-${Date.now()}`
      });

      expect(res1.correlationId).not.toBe(res2.correlationId);
    });
  });

  describe('B. Structured Trace & Audit Events', () => {
    it('1. Records structured lifecycle events in AgentTrace', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const idempotencyKey = `p13-trace-events-${Date.now()}`;

      const res = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('CUSTOMER') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey
        }),
      });

      const data = await res.json();
      const runId = data.orchestrationResult.agentRunId;

      const traces = await prisma.agentTrace.findMany({
        where: { agentRunId: runId },
        orderBy: { timestamp: 'asc' }
      });

      expect(traces.length).toBeGreaterThan(0);
      
      const steps = traces.map(t => t.step);
      expect(steps).toContain('GOAL_RECEIVED');
      expect(steps).toContain('INTENT_CLASSIFICATION');
      expect(steps).toContain('CASE_RESOLVED');
    });
  });

  describe('C. Audit Integrity (Attempted vs Executed vs Verified)', () => {
    it('1. Correctly distinguishes ATTEMPTED, EXECUTED, and VERIFIED mutations', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;

      const result = await AgentOrchestrator.run({
        ticketId: sc.ticketId,
        orderId: sc.orderId,
        message: sc.message,
        idempotencyKey: `p13-audit-dist-${Date.now()}`
      });

      expect(result.status).toBe('RESOLVED');
      expect(result.execution).toBeDefined();
      expect(result.execution?.status).toBe('EXECUTED');
      expect(result.execution?.verificationStatus).toBe('SUCCESS');

      // Audit summary check via Operator Repository
      const repo = new AgentStateRepository();
      const detail = await repo.getOperatorRunDetail(result.agentRunId);
      expect(detail).not.toBeNull();
      expect(detail?.mutationAudit.attempted).toBe(1);
      expect(detail?.mutationAudit.executed).toBe(1);
      expect(detail?.mutationAudit.verified).toBe(1);
      expect(detail?.mutationAudit.verificationFailures).toBe(0);
    });

    it('2. Shows verification failure as EXECUTED but NOT VERIFIED on failure', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_D; // Verification Failure scenario
      
      vi.spyOn(VerificationTools, 'verifyAction').mockResolvedValueOnce({
        success: true,
        data: {
          actionId: 'act-sample-mismatch-id',
          actionType: 'CANCELLATION',
          verified: false,
          expectedState: 'CANCELLED_ORDER',
          actualState: 'ORDER_STATUS_PROCESSING',
          verifiedAt: new Date().toISOString(),
        },
      });

      const result = await AgentOrchestrator.run({
        ticketId: sc.ticketId,
        orderId: sc.orderId,
        message: sc.message,
        idempotencyKey: `p13-verif-fail-${Date.now()}`
      });

      expect(result.status).toBe('ESCALATED');
      assertNeverFalseResolution(result);

      const repo = new AgentStateRepository();
      const detail = await repo.getOperatorRunDetail(result.agentRunId);
      expect(detail).not.toBeNull();
      expect(detail?.mutationAudit.verified).toBe(0); // Never verified!
    });
  });

  describe('D. Operator Inspection APIs', () => {
    it('1. GET /api/v1/ops/runs lists runs with concise summaries and supports filters', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      await AgentOrchestrator.run({
        ticketId: sc.ticketId,
        orderId: sc.orderId,
        message: sc.message,
        idempotencyKey: `p13-list-prep-${Date.now()}`
      });

      const res = await fetch(`${baseUrl}/api/v1/ops/runs?limit=10`, {
        headers: getAuthHeaders('OPERATOR')
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.runs)).toBe(true);
      expect(data.total).toBeGreaterThanOrEqual(1);

      const firstRun = data.runs[0];
      expect(firstRun.id).toBeDefined();
      expect(firstRun.correlationId).toBeDefined();
      expect(firstRun.status).toBeDefined();
      expect(firstRun.currentStep).toBeDefined();
    });

    it('2. GET /api/v1/ops/runs supports correlationId and status filtering', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const targetCorrId = `FILTER-CORR-ID-${Date.now()}`;

      await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('CUSTOMER') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey: `p13-filter-${Date.now()}`,
          correlationId: targetCorrId
        }),
      });

      const res = await fetch(`${baseUrl}/api/v1/ops/runs?correlationId=${targetCorrId}`, {
        headers: getAuthHeaders('OPERATOR')
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.runs.length).toBe(1);
      expect(data.runs[0].correlationId).toBe(targetCorrId);
    });

    it('3. GET /api/v1/ops/runs/:id returns complete operational view', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;

      const initRes = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('CUSTOMER') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey: `p13-detail-${Date.now()}`
        }),
      });
      const initData = await initRes.json();
      const runId = initData.orchestrationResult.agentRunId;

      const opsRes = await fetch(`${baseUrl}/api/v1/ops/runs/${runId}`, {
        headers: getAuthHeaders('OPERATOR')
      });
      expect(opsRes.status).toBe(200);
      const opsData = await opsRes.json();
      expect(opsData.success).toBe(true);

      const run = opsData.run;
      expect(run.id).toBe(runId);
      expect(run.correlationId).toBeDefined();
      expect(run.traces).toBeDefined();
      expect(run.mutationAudit).toBeDefined();
      expect(run.mutationAudit.attempted).toBeDefined();
    });
  });

  describe('E. Operational Error Classification', () => {
    it('1. Classifies errors accurately into standard categories', () => {
      const valErr = classifyError(new Error('Validation failed for missing ticketId'));
      expect(valErr.code).toBe('VALIDATION_ERROR');

      const polErr = classifyError(new Error('Policy check failed: refund exceeds limit'));
      expect(polErr.code).toBe('POLICY_BLOCK');

      const verifErr = classifyError(new Error('Post-action verification failed for refund'));
      expect(verifErr.code).toBe('VERIFICATION_FAILURE');

      const idempErr = classifyError(new Error('Idempotency key lock active or conflict'));
      expect(idempErr.code).toBe('IDEMPOTENCY_CONFLICT');

      const concErr = classifyError(new Error('Concurrent modification conflict on ticket'));
      expect(concErr.code).toBe('CONCURRENCY_CONFLICT');
    });

    it('2. Preserves existing ResolveXError classification', () => {
      const rxErr = new ResolveXError('Action execution tool failed', 'TOOL_FAILURE', 500);
      const classified = classifyError(rxErr);
      expect(classified.code).toBe('TOOL_FAILURE');
      expect(classified.statusCode).toBe(500);
    });
  });

  describe('F. Diagnostic & Stale Run Health API', () => {
    it('1. GET /api/v1/ops/health/runs categorizes runs into healthy, waiting, stale, suspicious', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      await AgentOrchestrator.run({
        ticketId: sc.ticketId,
        orderId: sc.orderId,
        message: sc.message,
        idempotencyKey: `p13-health-prep-${Date.now()}`
      });

      const res = await fetch(`${baseUrl}/api/v1/ops/health/runs`, {
        headers: getAuthHeaders('OPERATOR')
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.report).toBeDefined();

      const report = data.report;
      expect(report.summary.totalRuns).toBeGreaterThanOrEqual(1);
      expect(report.summary.healthy).toBeDefined();
      expect(report.summary.waiting).toBeDefined();
      expect(report.summary.stale).toBeDefined();
      expect(report.summary.suspicious).toBeDefined();
      expect(report.summary.escalated).toBeDefined();
    });

    it('2. Diagnostic API is strictly read-only and never mutates database state', async () => {
      const countBefore = await prisma.agentRun.count();
      
      const res = await fetch(`${baseUrl}/api/v1/ops/health/runs`, {
        headers: getAuthHeaders('OPERATOR')
      });
      expect(res.status).toBe(200);

      const countAfter = await prisma.agentRun.count();
      expect(countAfter).toBe(countBefore);
    });
  });

  describe('G. Security, Secrets & Safety Invariants', () => {
    it('1. Approval tokens and credentials never appear in API responses or trace output', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_A;
      const idempotencyKey = `p13-sec-token-${Date.now()}`;

      // Create waiting run
      const initRes = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('CUSTOMER') },
        body: JSON.stringify({
          message: sc.message,
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          idempotencyKey
        }),
      });
      const initData = await initRes.json();
      const runId = initData.orchestrationResult.agentRunId;

      // Approve with token
      const secretToken = 'SECRET_MANAGER_KEY_12345';
      await fetch(`${baseUrl}/api/v1/agents/runs/${runId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('APPROVER') },
        body: JSON.stringify({
          decision: 'APPROVE',
          approvalToken: secretToken,
          reason: 'Testing secret leakage.'
        }),
      });

      // Retrieve detail from Operator API
      const detailRes = await fetch(`${baseUrl}/api/v1/ops/runs/${runId}`, {
        headers: getAuthHeaders('OPERATOR')
      });
      const detailStr = JSON.stringify(await detailRes.json());
      expect(detailStr).not.toContain(secretToken);
      expect(detailStr).toContain('"approvalGranted":true');
    });

    it('2. No force-resolve endpoint exists (returns 404)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/ops/runs/run-123/force-resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders('OPERATOR') }
      });
      expect(res.status).toBe(404);
    });

    it('3. Logger redacts sensitive fields correctly', () => {
      const logOutput = Logger.formatLog('TOOL_COMPLETED', {
        agentRunId: 'run-1',
        password: 'super-secret-pass',
        approvalToken: 'token-999',
        normalField: 'safe-value'
      });

      expect(logOutput).not.toContain('super-secret-pass');
      expect(logOutput).not.toContain('token-999');
      expect(logOutput).toContain('[REDACTED]');
      expect(logOutput).toContain('"approvalTokenProvided":true');
      expect(logOutput).toContain('safe-value');
    });
  });
});
