import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import http from 'http';
import { prisma } from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';
import app from '../src/backend/server.js';
import { ExecutionCoordinator } from '../src/execution/executionCoordinator.js';
import { ExecutionRepository } from '../src/db/repositories/executionRepository.js';
import { AgentStateRepository } from '../src/db/repositories/agentStateRepository.js';
import { AgentOrchestrator } from '../src/agents/orchestrator/AgentOrchestrator.js';
import { CANONICAL_DEMO_SCENARIOS, assertNeverFalseResolution } from './fixtures/demoScenarios.js';
import { FailureInjector } from '../src/utils/failureInjector.js';
import { getAuthHeaders } from './helpers/authHelper.js';

describe('Phase 17: Production Job Execution, Concurrency & Graceful Shutdown Suite', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    await prisma.$connect();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as any;
        baseUrl = `http://localhost:${address.port}`;
        resolve();
      });
    });
  });

  beforeEach(async () => {
    FailureInjector.reset();
    ExecutionCoordinator.resetInstance();
    await seedDatabase();
  });

  afterAll(async () => {
    FailureInjector.reset();
    ExecutionCoordinator.resetInstance();
    if (server) {
      await new Promise<void>((res) => server.close(() => res()));
    }
    await prisma.$disconnect();
  });

  describe('1. Execution Job Lifecycle & Persistence', () => {
    it('1. Creating a run enqueues a durable ExecutionJob in DB', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const coordinator = ExecutionCoordinator.getInstance();

      const run = await AgentStateRepository.createAgentRun({
        ticketId: sc.ticketId,
        goal: sc.message,
        tenantId: 'tenant-a',
      });

      const enqueueRes = await coordinator.enqueueRun({
        agentRunId: run.id,
        tenantId: 'tenant-a',
        syncExecute: false,
      });

      expect(enqueueRes.job).toBeDefined();
      expect(enqueueRes.job.status).toBe('QUEUED');
      expect(enqueueRes.job.tenantId).toBe('tenant-a');

      const dbJob = await ExecutionRepository.getJobByAgentRunId(run.id, 'tenant-a');
      expect(dbJob).not.toBeNull();
      expect(['QUEUED', 'RUNNING']).toContain(dbJob?.status);
    });

    it('2. Execution completes cleanly and transitions ExecutionJob to COMPLETED', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B; // low-value auto refund
      const coordinator = ExecutionCoordinator.getInstance();

      const run = await AgentStateRepository.createAgentRun({
        ticketId: sc.ticketId,
        goal: sc.message,
        tenantId: 'tenant-a',
      });

      const enqueueRes = await coordinator.enqueueRun({
        agentRunId: run.id,
        tenantId: 'tenant-a',
        syncExecute: true,
        orchestrationInput: {
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          message: sc.message,
          agentRunId: run.id,
          idempotencyKey: `p17-comp-${Date.now()}`,
        },
      });

      expect((enqueueRes as any).status).toBe('RESOLVED');

      const dbJob = await ExecutionRepository.getJobByAgentRunId(run.id, 'tenant-a');
      expect(dbJob?.status).toBe('COMPLETED');
      expect(dbJob?.completedAt).not.toBeNull();
    });

    it('3. Run halting at WAITING_FOR_APPROVAL releases worker lease to WAITING state', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_A; // high-value refund requires approval
      const coordinator = ExecutionCoordinator.getInstance();

      const run = await AgentStateRepository.createAgentRun({
        ticketId: sc.ticketId,
        goal: sc.message,
        tenantId: 'tenant-a',
      });

      const result = await coordinator.enqueueRun({
        agentRunId: run.id,
        tenantId: 'tenant-a',
        syncExecute: true,
        orchestrationInput: {
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          message: sc.message,
          agentRunId: run.id,
          idempotencyKey: `p17-waiting-appr-${Date.now()}`,
        },
      });

      expect((result as any).status).toBe('WAITING_FOR_APPROVAL');

      const dbJob = await ExecutionRepository.getJobByAgentRunId(run.id, 'tenant-a');
      expect(dbJob?.status).toBe('WAITING');
      expect(dbJob?.workerId).toBeNull(); // Worker capacity released!
      expect(dbJob?.leaseUntil).toBeNull();
    });

    it('4. Failed orchestration persists FAILED status on ExecutionJob', async () => {
      const coordinator = ExecutionCoordinator.getInstance();

      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-damaged-phone-001',
        goal: 'Invalid run test',
        tenantId: 'tenant-a',
      });

      const job = await ExecutionRepository.createJob({
        agentRunId: run.id,
        tenantId: 'tenant-a',
      });

      // Force failure during local execution
      vi.spyOn(AgentOrchestrator, 'run').mockRejectedValueOnce(new Error('FATAL_DATABASE_FAILURE'));

      await expect(coordinator.executeJobLocally(job.id)).rejects.toThrow('FATAL_DATABASE_FAILURE');

      const dbJob = await ExecutionRepository.getJobByAgentRunId(run.id, 'tenant-a');
      expect(dbJob?.status).toBe('FAILED');
      expect(dbJob?.errorCode).toBe('EXECUTION_ERROR');
    });
  });

  describe('2. Concurrency & Atomic Lease Control', () => {
    it('1. Atomic lease acquisition prevents duplicate execution of same job', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;

      const run = await AgentStateRepository.createAgentRun({
        ticketId: sc.ticketId,
        goal: sc.message,
        tenantId: 'tenant-a',
      });

      const job = await ExecutionRepository.createJob({
        agentRunId: run.id,
        tenantId: 'tenant-a',
      });

      // Worker A acquires lease
      const workerA_acquired = await ExecutionRepository.acquireLeaseAtomically(job.id, 'worker-A', 30000);
      expect(workerA_acquired).toBe(true);

      // Worker B attempts to acquire lease on same job
      const workerB_acquired = await ExecutionRepository.acquireLeaseAtomically(job.id, 'worker-B', 30000);
      expect(workerB_acquired).toBe(false); // DENIED!

      const dbJob = await ExecutionRepository.getJobByAgentRunId(run.id);
      expect(dbJob?.workerId).toBe('worker-A');
    });

    it('2. Concurrent HTTP run creation yields exactly ONE business mutation', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const idempotencyKey = `p17-conc-http-${Date.now()}`;

      const [res1, res2] = await Promise.all([
        fetch(`${baseUrl}/api/v1/agents/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders('CUSTOMER') },
          body: JSON.stringify({
            message: sc.message,
            ticketId: sc.ticketId,
            orderId: sc.orderId,
            idempotencyKey,
          }),
        }),
        fetch(`${baseUrl}/api/v1/agents/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders('CUSTOMER') },
          body: JSON.stringify({
            message: sc.message,
            ticketId: sc.ticketId,
            orderId: sc.orderId,
            idempotencyKey,
          }),
        }),
      ]);

      expect([res1.status, res2.status]).toContain(200);

      // Ground truth safety check: Exactly 1 RefundTransaction created
      const refundCount = await prisma.refundTransaction.count({ where: { orderId: sc.orderId } });
      expect(refundCount).toBe(1);
    });

    it('3. Concurrent approval attempts produce exactly ONE business execution', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_A;
      const idempotencyKey = `p17-conc-appr-${Date.now()}`;

      // Create waiting run
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

      // Trigger 2 concurrent approval HTTP calls
      const [app1, app2] = await Promise.all([
        fetch(`${baseUrl}/api/v1/agents/runs/${runId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders('APPROVER') },
          body: JSON.stringify({ decision: 'APPROVE', reason: 'Concurrent approval 1' }),
        }),
        fetch(`${baseUrl}/api/v1/agents/runs/${runId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders('APPROVER') },
          body: JSON.stringify({ decision: 'APPROVE', reason: 'Concurrent approval 2' }),
        }),
      ]);

      const statuses = [app1.status, app2.status];
      expect(statuses).toContain(200);

      // Ground truth safety check: Exactly 1 RefundTransaction created
      const refundCount = await prisma.refundTransaction.count({ where: { orderId: sc.orderId } });
      expect(refundCount).toBe(1);
    });
  });

  describe('3. Heartbeat & Stale Lease Recovery', () => {
    it('1. Active worker extends lease via heartbeat', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;

      const run = await AgentStateRepository.createAgentRun({
        ticketId: sc.ticketId,
        goal: sc.message,
        tenantId: 'tenant-a',
      });

      const job = await ExecutionRepository.createJob({
        agentRunId: run.id,
        tenantId: 'tenant-a',
      });

      await ExecutionRepository.acquireLeaseAtomically(job.id, 'worker-test-hb', 1000); // 1s short lease

      // Update heartbeat
      const hbUpdated = await ExecutionRepository.updateHeartbeat(job.id, 'worker-test-hb', 10000); // extend 10s
      expect(hbUpdated).toBe(true);

      const dbJob = await ExecutionRepository.getJobByAgentRunId(run.id);
      expect(dbJob?.leaseUntil?.getTime()).toBeGreaterThan(Date.now());
    });

    it('2. Expired lease is identified and recovered safely using ground truth', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const coordinator = ExecutionCoordinator.getInstance();

      const run = await AgentStateRepository.createAgentRun({
        ticketId: sc.ticketId,
        goal: sc.message,
        tenantId: 'tenant-a',
      });

      const job = await ExecutionRepository.createJob({
        agentRunId: run.id,
        tenantId: 'tenant-a',
      });

      // Simulate a crashed worker holding an expired lease
      await prisma.executionJob.update({
        where: { id: job.id },
        data: {
          status: 'RUNNING',
          workerId: 'worker-dead-123',
          leaseUntil: new Date(Date.now() - 5000), // Expired 5s ago!
        },
      });

      const recoveredCount = await coordinator.recoverStaleJobs();
      expect(recoveredCount).toBeGreaterThanOrEqual(1);

      const updatedJob = await ExecutionRepository.getJobByAgentRunId(run.id);
      expect(updatedJob?.status).not.toBe('QUEUED');
    });

    it('3. Crash after business mutation uses ground truth reconciliation to prevent duplicate mutation on recovery', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const idempotencyKey = `p17-crash-gt-${Date.now()}`;
      const coordinator = ExecutionCoordinator.getInstance();

      // Step 1: Create a run and perform verified mutation in DB
      const run = await AgentStateRepository.createAgentRun({
        ticketId: sc.ticketId,
        goal: sc.message,
        tenantId: 'tenant-a',
      });

      const refundTx = await prisma.refundTransaction.create({
        data: {
          orderId: sc.orderId,
          amount: 4999,
          reason: 'Pre-crash refund mutation',
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

      // Step 2: Create a job with an expired lease representing a crashed worker
      const job = await ExecutionRepository.createJob({
        agentRunId: run.id,
        tenantId: 'tenant-a',
      });

      await prisma.executionJob.update({
        where: { id: job.id },
        data: {
          status: 'RUNNING',
          workerId: 'worker-crashed-after-mut',
          leaseUntil: new Date(Date.now() - 5000),
        },
      });

      // Step 3: Trigger stale job recovery
      await coordinator.recoverStaleJobs();

      // Verify Ground Truth: Job marked COMPLETED, AgentRun marked RESOLVED, and ZERO DUPLICATE MUTATIONS!
      const dbJob = await ExecutionRepository.getJobByAgentRunId(run.id);
      expect(dbJob?.status).toBe('COMPLETED');

      const reloadedRun = await AgentStateRepository.getAgentRun(run.id);
      expect(['RESOLVED', 'COMPLETED']).toContain(reloadedRun?.status);

      const refundCount = await prisma.refundTransaction.count({ where: { orderId: sc.orderId } });
      expect(refundCount).toBe(1); // EXACTLY 1! Zero duplicate financial mutation!
    });
  });

  describe('4. Graceful Process Shutdown & Readiness', () => {
    it('1. GET /api/v1/health/readiness returns 200 READY normally and 503 during shutdown', async () => {
      // Normal state
      const res1 = await fetch(`${baseUrl}/api/v1/health/readiness`);
      expect(res1.status).toBe(200);
      const data1 = await res1.json();
      expect(data1.readiness).toBe(true);
      expect(data1.status).toBe('READY');

      // Trigger shutdown simulation
      const coordinator = ExecutionCoordinator.getInstance();
      const shutdownPromise = coordinator.shutdown();

      const res2 = await fetch(`${baseUrl}/api/v1/health/readiness`);
      expect(res2.status).toBe(503);
      const data2 = await res2.json();
      expect(data2.readiness).toBe(false);
      expect(data2.status).toBe('SHUTTING_DOWN');

      await shutdownPromise;
    });

    it('2. Graceful shutdown rejects new job execution cleanly', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const coordinator = ExecutionCoordinator.getInstance();

      const run = await AgentStateRepository.createAgentRun({
        ticketId: sc.ticketId,
        goal: sc.message,
        tenantId: 'tenant-a',
      });

      const job = await ExecutionRepository.createJob({
        agentRunId: run.id,
        tenantId: 'tenant-a',
      });

      // Initiate shutdown
      const shutdownPromise = coordinator.shutdown();

      // Attempt to execute job locally while shutting down
      const execResult = await coordinator.executeJobLocally(job.id);
      expect(execResult).toBeNull(); // Rejected cleanly!

      await shutdownPromise;
    });
  });

  describe('5. Operator Telemetry & Status API', () => {
    it('1. GET /api/v1/ops/execution/status returns worker metrics and configured concurrency', async () => {
      const res = await fetch(`${baseUrl}/api/v1/ops/execution/status`, {
        headers: getAuthHeaders('OPERATOR'),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.workerId).toBeDefined();
      expect(data.metrics).toBeDefined();
      expect(data.metrics.configuredConcurrency).toBeGreaterThan(0);
      expect(typeof data.metrics.queuedJobs).toBe('number');
      expect(typeof data.metrics.runningJobs).toBe('number');
    });

    it('2. GET /api/v1/agents/runs/:id/execution retrieves execution job details for customer run', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const run = await AgentStateRepository.createAgentRun({
        ticketId: sc.ticketId,
        goal: sc.message,
        tenantId: 'tenant-a',
      });

      await ExecutionRepository.createJob({
        agentRunId: run.id,
        tenantId: 'tenant-a',
      });

      const res = await fetch(`${baseUrl}/api/v1/agents/runs/${run.id}/execution`, {
        headers: getAuthHeaders('CUSTOMER'),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.executionJob).toBeDefined();
      expect(data.executionJob.agentRunId).toBe(run.id);
    });
  });

  describe('6. Security & Safety Invariant Compliance', () => {
    it('1. Unauthenticated request to /api/v1/ops/execution/status is rejected (401)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/ops/execution/status`);
      expect(res.status).toBe(401);
    });

    it('2. Customer A cannot inspect execution job of Customer B (returns 404)', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_B;
      const run = await AgentStateRepository.createAgentRun({
        ticketId: sc.ticketId,
        goal: sc.message,
        tenantId: 'tenant-a',
      });

      await ExecutionRepository.createJob({
        agentRunId: run.id,
        tenantId: 'tenant-a',
      });

      // Customer B requests Customer A's run execution details
      const res = await fetch(`${baseUrl}/api/v1/agents/runs/${run.id}/execution`, {
        headers: getAuthHeaders('CUSTOMER', 'cust-tenant-b-001', 'tenant-b'),
      });

      expect(res.status).toBe(404);
    });

    it('3. High-value refund approval gate remains 100% enforced during execution', async () => {
      const sc = CANONICAL_DEMO_SCENARIOS.SCENARIO_A;
      const coordinator = ExecutionCoordinator.getInstance();

      const run = await AgentStateRepository.createAgentRun({
        ticketId: sc.ticketId,
        goal: sc.message,
        tenantId: 'tenant-a',
      });

      const result = await coordinator.enqueueRun({
        agentRunId: run.id,
        tenantId: 'tenant-a',
        syncExecute: true,
        orchestrationInput: {
          ticketId: sc.ticketId,
          orderId: sc.orderId,
          message: sc.message,
          agentRunId: run.id,
          idempotencyKey: `p17-highval-safety-${Date.now()}`,
        },
      });

      expect((result as any).status).toBe('WAITING_FOR_APPROVAL');
      const refundCount = await prisma.refundTransaction.count({ where: { orderId: sc.orderId } });
      expect(refundCount).toBe(0); // 0 MUTATIONS PRIOR TO APPROVAL!
    });
  });
});
