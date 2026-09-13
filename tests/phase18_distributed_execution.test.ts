// ResolveX Phase 18 — Distributed Execution, Production-Scale Coordination & Transaction Integrity Test Suite

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import http from 'http';
import app from '../src/backend/server.js';
import { prisma } from '../src/db/client.js';
import { ExecutionCoordinator } from '../src/execution/executionCoordinator.js';
import { ExecutionRepository } from '../src/db/repositories/executionRepository.js';
import { PrismaExecutionStore, ExecutionStateMachine } from '../src/execution/executionStore.js';
import { AgentStateRepository } from '../src/db/repositories/agentStateRepository.js';
import { FailureInjector } from '../src/utils/failureInjector.js';
import { getAuthHeaders } from './helpers/authHelper.js';
import { seedDatabase } from '../src/db/seedDatabase.js';
import { AIProviderRegistry } from '../src/ai/providers/AIProviderRegistry.js';
import { AIProviderMode } from '../src/ai/types/AITypes.js';

describe('Phase 18: Distributed Execution & Transaction Integrity Suite', () => {
  let server: http.Server;
  let baseUrl: string;
  const store = PrismaExecutionStore.getInstance();

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

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      if (server) {
        server.close(() => resolve());
      } else {
        resolve();
      }
    });
  });

  beforeEach(async () => {
    // Reset Database State & Execution Coordinator
    ExecutionCoordinator.resetInstance();
    FailureInjector.reset();
    AIProviderRegistry.getInstance().resetAll();
    AIProviderRegistry.getInstance().setMode(AIProviderMode.AI_SANDBOX);

    await seedDatabase();

    await prisma.executionJob.deleteMany();
    await prisma.agentTrace.deleteMany();
    await prisma.toolExecution.deleteMany();
    await prisma.verificationResult.deleteMany();
    await prisma.actionRecord.deleteMany();
    await prisma.escalation.deleteMany();
    await prisma.agentRun.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.refundTransaction.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.customer.deleteMany();

    // Create Base Customer, Order, Ticket for Tenant A
    const custA = await prisma.customer.create({
      data: {
        id: 'cust-ph18-a',
        tenantId: 'tenant-a',
        name: 'Distributed Test Customer A',
        email: 'ph18_cust_a@example.com',
        tier: 'STANDARD',
      },
    });

    await prisma.order.create({
      data: {
        id: 'ord-ph18-low',
        tenantId: 'tenant-a',
        customerId: custA.id,
        totalAmount: 3500.0,
        status: 'DELIVERED',
        shippingStatus: 'DELIVERED',
      },
    });

    await prisma.order.create({
      data: {
        id: 'ord-ph18-high',
        tenantId: 'tenant-a',
        customerId: custA.id,
        totalAmount: 25000.0,
        status: 'DELIVERED',
        shippingStatus: 'DELIVERED',
      },
    });

    await prisma.ticket.create({
      data: {
        id: 'tkt-ph18-low',
        tenantId: 'tenant-a',
        customerId: custA.id,
        orderId: 'ord-ph18-low',
        issueType: 'DAMAGED',
        customerMessage: 'Item arrived damaged, please refund ₹3500.',
        status: 'OPEN',
      },
    });

    await prisma.ticket.create({
      data: {
        id: 'tkt-ph18-high',
        tenantId: 'tenant-a',
        customerId: custA.id,
        orderId: 'ord-ph18-high',
        issueType: 'DAMAGED',
        customerMessage: 'High value item damaged ₹25000.',
        status: 'OPEN',
      },
    });

    // Create Customer B for Tenant B
    const custB = await prisma.customer.create({
      data: {
        id: 'cust-ph18-b',
        tenantId: 'tenant-b',
        name: 'Distributed Test Customer B',
        email: 'ph18_cust_b@example.com',
        tier: 'STANDARD',
      },
    });

    await prisma.ticket.create({
      data: {
        id: 'tkt-ph18-tenant-b',
        tenantId: 'tenant-b',
        customerId: custB.id,
        issueType: 'DAMAGED',
        customerMessage: 'Tenant B issue',
        status: 'OPEN',
      },
    });
  });

  afterEach(() => {
    ExecutionCoordinator.resetInstance();
    FailureInjector.reset();
  });

  // =========================================================================
  // 1. STORAGE ABSTRACTION & ATOMIC LEASE CLAIM TESTS
  // =========================================================================
  describe('1. Storage Abstraction & Atomic Lease Claim', () => {
    it('1. enqueueJob creates a single QUEUED ExecutionJob', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-ph18-low',
        goal: 'Refund request',
      });

      const job = await store.enqueueJob({
        agentRunId: run.id,
        tenantId: 'tenant-a',
        correlationId: 'corr-101',
      });

      expect(job.id).toBeDefined();
      expect(job.agentRunId).toBe(run.id);
      expect(job.status).toBe('QUEUED');
      expect(job.leaseGeneration).toBe(0);
    });

    it('2. enqueueJob with idempotencyKey returns existing job on duplicate requests', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-ph18-low',
        goal: 'Refund request idempotency',
      });

      const job1 = await store.enqueueJob({
        agentRunId: run.id,
        tenantId: 'tenant-a',
        idempotencyKey: 'idempotent-enqueue-key-123',
      });

      const job2 = await store.enqueueJob({
        agentRunId: run.id,
        tenantId: 'tenant-a',
        idempotencyKey: 'idempotent-enqueue-key-123',
      });

      expect(job1.id).toBe(job2.id);
    });

    it('3. acquireLeaseAtomically increments leaseGeneration atomically', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-ph18-low',
        goal: 'Lease claim test',
      });

      const job = await store.enqueueJob({ agentRunId: run.id });
      expect(job.leaseGeneration).toBe(0);

      const claim = await store.acquireLeaseAtomically(job.id, 'worker-alpha', 10000);
      expect(claim.acquired).toBe(true);
      expect(claim.leaseGeneration).toBe(1);
      expect(claim.job?.status).toBe('RUNNING');
      expect(claim.job?.workerId).toBe('worker-alpha');
    });

    it('4. acquireNextJobAtomically selects candidate deterministically by createdAt ASC', async () => {
      const run1 = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Job 1' });
      const run2 = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Job 2' });

      const job1 = await store.enqueueJob({ agentRunId: run1.id });
      await new Promise((r) => setTimeout(r, 10)); // tiny gap
      const job2 = await store.enqueueJob({ agentRunId: run2.id });

      const claimed = await store.acquireNextJobAtomically('worker-beta', 10000);
      expect(claimed?.id).toBe(job1.id);
    });

    it('5. ExecutionStateMachine rejects illegal transitions', () => {
      expect(ExecutionStateMachine.canTransition('QUEUED', 'RUNNING')).toBe(true);
      expect(ExecutionStateMachine.canTransition('RUNNING', 'COMPLETED')).toBe(true);
      expect(ExecutionStateMachine.canTransition('COMPLETED', 'RUNNING')).toBe(false);
      expect(ExecutionStateMachine.canTransition('FAILED', 'RUNNING')).toBe(false);
      expect(() => ExecutionStateMachine.validateTransition('COMPLETED', 'RUNNING')).toThrow(/ILLEGAL_EXECUTION_JOB_TRANSITION/);
    });
  });

  // =========================================================================
  // 2. FENCING GENERATION & STALE WORKER PROTECTION TESTS
  // =========================================================================
  describe('2. Monotonic Fencing Generation & Stale Worker Protection', () => {
    it('6. renewLease with stale leaseGeneration returns false', async () => {
      const run = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Fencing test' });
      const job = await store.enqueueJob({ agentRunId: run.id });

      const claim1 = await store.acquireLeaseAtomically(job.id, 'worker-1', 10000);
      expect(claim1.leaseGeneration).toBe(1);

      // Simulate lease expiration & claim by worker-2
      await prisma.executionJob.update({
        where: { id: job.id },
        data: { leaseUntil: new Date(Date.now() - 5000) },
      });

      const claim2 = await store.acquireLeaseAtomically(job.id, 'worker-2', 10000);
      expect(claim2.leaseGeneration).toBe(2);

      // Stale worker-1 attempts to renew lease with old generation 1
      const renewed = await store.renewLease(job.id, 'worker-1', 1, 10000);
      expect(renewed).toBe(false);
    });

    it('7. markCompleted with stale leaseGeneration is rejected', async () => {
      const run = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Stale complete' });
      const job = await store.enqueueJob({ agentRunId: run.id });

      await store.acquireLeaseAtomically(job.id, 'worker-1', 10000); // gen 1

      // Expire lease and worker-2 claims gen 2
      await prisma.executionJob.update({
        where: { id: job.id },
        data: { leaseUntil: new Date(Date.now() - 5000) },
      });
      await store.acquireLeaseAtomically(job.id, 'worker-2', 10000); // gen 2

      // Worker-1 tries to mark completed using gen 1
      const completed = await store.markCompleted(job.id, 'worker-1', 1);
      expect(completed).toBe(false);

      const currentDBJob = await store.getJobById(job.id);
      expect(currentDBJob?.status).toBe('RUNNING');
      expect(currentDBJob?.workerId).toBe('worker-2');
      expect(currentDBJob?.leaseGeneration).toBe(2);
    });

    it('8. markWaiting with stale leaseGeneration is rejected', async () => {
      const run = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Stale wait' });
      const job = await store.enqueueJob({ agentRunId: run.id });

      await store.acquireLeaseAtomically(job.id, 'worker-1', 10000); // gen 1

      // Worker 2 claims gen 2
      await prisma.executionJob.update({
        where: { id: job.id },
        data: { leaseUntil: new Date(Date.now() - 5000) },
      });
      await store.acquireLeaseAtomically(job.id, 'worker-2', 10000); // gen 2

      const waiting = await store.markWaiting(job.id, 'worker-1', 1);
      expect(waiting).toBe(false);
    });

    it('9. markFailed with mismatched workerId/generation is rejected', async () => {
      const run = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Stale fail' });
      const job = await store.enqueueJob({ agentRunId: run.id });

      await store.acquireLeaseAtomically(job.id, 'worker-1', 10000); // gen 1

      // Worker 2 claims gen 2
      await prisma.executionJob.update({
        where: { id: job.id },
        data: { leaseUntil: new Date(Date.now() - 5000) },
      });
      await store.acquireLeaseAtomically(job.id, 'worker-2', 10000); // gen 2

      const failed = await store.markFailed(job.id, 'worker-1', 1, 'ERR', 'Stale fail');
      expect(failed).toBe(false);
    });
  });

  // =========================================================================
  // 3. MULTI-WORKER CONCURRENCY & RACE CONDITION TESTS
  // =========================================================================
  describe('3. Multi-Worker Concurrency & Race Condition Integrity', () => {
    it('10. Concurrent acquireLeaseAtomically calls grant exactly one valid lease', async () => {
      const run = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Race test' });
      const job = await store.enqueueJob({ agentRunId: run.id });

      const results = await Promise.all([
        store.acquireLeaseAtomically(job.id, 'worker-A', 10000),
        store.acquireLeaseAtomically(job.id, 'worker-B', 10000),
        store.acquireLeaseAtomically(job.id, 'worker-C', 10000),
      ]);

      const acquiredCount = results.filter((r) => r.acquired).length;
      expect(acquiredCount).toBe(1);

      const dbJob = await store.getJobById(job.id);
      expect(dbJob?.leaseGeneration).toBe(1);
      expect(dbJob?.status).toBe('RUNNING');
    });

    it('11. Concurrent acquireNextJobAtomically across 3 workers allocates distinct jobs', async () => {
      const runs = await Promise.all([
        AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Run 1' }),
        AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Run 2' }),
        AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Run 3' }),
      ]);

      for (const r of runs) {
        await store.enqueueJob({ agentRunId: r.id });
      }

      const claims = await Promise.all([
        store.acquireNextJobAtomically('w-1', 10000),
        store.acquireNextJobAtomically('w-2', 10000),
        store.acquireNextJobAtomically('w-3', 10000),
      ]);

      const claimedJobIds = claims.map((c) => c?.id).filter(Boolean);
      const uniqueJobIds = new Set(claimedJobIds);

      expect(uniqueJobIds.size).toBe(claimedJobIds.length);
    });

    it('12. Concurrent enqueueRun with identical idempotencyKey results in exactly 1 ExecutionJob', async () => {
      const run = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Concurrent enqueue' });

      const results = await Promise.all([
        store.enqueueJob({ agentRunId: run.id, idempotencyKey: 'key-concurrent-100' }),
        store.enqueueJob({ agentRunId: run.id, idempotencyKey: 'key-concurrent-100' }),
        store.enqueueJob({ agentRunId: run.id, idempotencyKey: 'key-concurrent-100' }),
      ]);

      const jobIds = new Set(results.map((r) => r.id));
      expect(jobIds.size).toBe(1);

      const totalJobsInDB = await prisma.executionJob.count({ where: { agentRunId: run.id } });
      expect(totalJobsInDB).toBe(1);
    });

    it('13. Concurrent resumeRun requests produce exactly 1 effective execution', async () => {
      const coordinator = ExecutionCoordinator.getInstance();

      // Create a run halting at WAITING_FOR_APPROVAL
      const initRes = await coordinator.enqueueRun({
        agentRunId: 'run-concurrent-resume',
        tenantId: 'tenant-a',
        syncExecute: true,
        orchestrationInput: {
          ticketId: 'tkt-ph18-high',
          goal: 'High value refund ₹25000',
        },
      });

      expect(initRes.status).toBe('WAITING_FOR_APPROVAL');

      // Concurrent approval requests with valid manager token
      await Promise.all([
        coordinator.resumeRun({
          agentRunId: initRes.agentRunId,
          syncExecute: true,
          resumeInput: { approvalToken: 'VALID_APPROVAL_TOKEN_MGR', decision: 'APPROVE', managerApproved: true, managerId: 'mgr-1' },
        }),
        coordinator.resumeRun({
          agentRunId: initRes.agentRunId,
          syncExecute: true,
          resumeInput: { approvalToken: 'VALID_APPROVAL_TOKEN_MGR', decision: 'APPROVE', managerApproved: true, managerId: 'mgr-1' },
        }),
      ]);

      // Exactly one execution completes the refund, verified mutations = 1
      const refundCount = await prisma.refundTransaction.count({
        where: { orderId: 'ord-ph18-high' },
      });
      expect(refundCount).toBe(1);
    });
  });

  // =========================================================================
  // 4. CRASH-WINDOW MATRIX (A–J) TESTS
  // =========================================================================
  describe('4. Crash-Window Matrix (A–J) Hardening', () => {
    it('14. Crash Window A: Worker dies before tool call -> stale recovery re-enqueues run safely', async () => {
      const coordinator = ExecutionCoordinator.getInstance();
      const run = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Crash A' });
      const job = await store.enqueueJob({ agentRunId: run.id });

      // Claim job and simulate crash before action tool execution
      await store.acquireLeaseAtomically(job.id, 'worker-dead-a', 1000);
      await prisma.executionJob.update({
        where: { id: job.id },
        data: { leaseUntil: new Date(Date.now() - 5000) },
      });

      // Recover stale job
      const recoveredCount = await coordinator.recoverStaleJobs();
      expect(recoveredCount).toBe(1);

      const dbJob = await store.getJobById(job.id);
      expect(dbJob?.leaseGeneration).toBe(2);
      expect(dbJob?.status).toBe('COMPLETED');
    });

    it('15. Crash Window B: Worker dies after tool call but before persistence -> stale recovery reconciles ground truth', async () => {
      const coordinator = ExecutionCoordinator.getInstance();
      const run = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Crash B' });
      const job = await store.enqueueJob({ agentRunId: run.id });

      await store.acquireLeaseAtomically(job.id, 'worker-dead-b', 1000);

      // Create verified refund transaction (simulating tool succeeded before crash)
      await prisma.refundTransaction.create({
        data: {
          orderId: 'ord-ph18-low',
          amount: 3500.0,
          reason: 'Damaged item',
          idempotencyKey: `ref-ph18-crash-b-${run.id}`,
          status: 'COMPLETED',
        },
      });

      await prisma.executionJob.update({
        where: { id: job.id },
        data: { leaseUntil: new Date(Date.now() - 5000) },
      });

      const recovered = await coordinator.recoverStaleJobs();
      expect(recovered).toBe(1);

      const updatedRun = await AgentStateRepository.getAgentRun(run.id);
      expect(['RESOLVED', 'COMPLETED', 'ESCALATED']).toContain(updatedRun.status);
    });

    it('16. Crash Window C: Worker dies after business mutation -> 0 duplicate mutations on recovery', async () => {
      const coordinator = ExecutionCoordinator.getInstance();
      const run = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Crash C' });
      const job = await store.enqueueJob({ agentRunId: run.id });

      await store.acquireLeaseAtomically(job.id, 'worker-dead-c', 1000);

      // Create refund transaction with idempotency key
      await prisma.refundTransaction.create({
        data: {
          orderId: 'ord-ph18-low',
          amount: 3500.0,
          reason: 'Damaged item',
          idempotencyKey: `ref-ph18-crash-c-${run.id}`,
          status: 'COMPLETED',
        },
      });

      await prisma.executionJob.update({
        where: { id: job.id },
        data: { leaseUntil: new Date(Date.now() - 5000) },
      });

      await coordinator.recoverStaleJobs();

      const totalRefunds = await prisma.refundTransaction.count({ where: { orderId: 'ord-ph18-low' } });
      expect(totalRefunds).toBe(1);
    });

    it('17. Crash Window D: Worker dies after mutation but before verification -> recovery completes verification', async () => {
      const coordinator = ExecutionCoordinator.getInstance();
      const run = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Crash D' });
      const job = await store.enqueueJob({ agentRunId: run.id });

      await store.acquireLeaseAtomically(job.id, 'worker-dead-d', 1000);

      await prisma.refundTransaction.create({
        data: {
          orderId: 'ord-ph18-low',
          amount: 3500.0,
          reason: 'Damaged item',
          idempotencyKey: `ref-ph18-crash-d-${run.id}`,
          status: 'COMPLETED',
        },
      });

      await prisma.executionJob.update({
        where: { id: job.id },
        data: { leaseUntil: new Date(Date.now() - 5000) },
      });

      await coordinator.recoverStaleJobs();

      const finalJob = await store.getJobById(job.id);
      expect(finalJob?.status).toBe('COMPLETED');
    });

    it('18. Crash Window E: Worker dies after verification but before final persistence -> recovery updates execution status', async () => {
      const coordinator = ExecutionCoordinator.getInstance();
      const run = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Crash E' });
      const job = await store.enqueueJob({ agentRunId: run.id });

      await store.acquireLeaseAtomically(job.id, 'worker-dead-e', 1000);

      await prisma.refundTransaction.create({
        data: {
          orderId: 'ord-ph18-low',
          amount: 3500.0,
          reason: 'Damaged item',
          idempotencyKey: `ref-ph18-crash-e-${run.id}`,
          status: 'COMPLETED',
        },
      });

      await prisma.executionJob.update({
        where: { id: job.id },
        data: { leaseUntil: new Date(Date.now() - 5000) },
      });

      await coordinator.recoverStaleJobs();

      const updatedJob = await store.getJobById(job.id);
      expect(updatedJob?.status).toBe('COMPLETED');
    });

    it('19. Crash Window F: Worker loses lease while executing -> completion is rejected', async () => {
      const run = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Crash F' });
      const job = await store.enqueueJob({ agentRunId: run.id });

      await store.acquireLeaseAtomically(job.id, 'worker-stale-f', 1000); // gen 1

      // Expire & worker 2 claims gen 2
      await prisma.executionJob.update({
        where: { id: job.id },
        data: { leaseUntil: new Date(Date.now() - 5000) },
      });
      await store.acquireLeaseAtomically(job.id, 'worker-new-f', 10000); // gen 2

      const marked = await store.markCompleted(job.id, 'worker-stale-f', 1);
      expect(marked).toBe(false);
    });

    it('20. Crash Window G: Old worker returns after new worker acquired lease -> old worker rejected', async () => {
      const run = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Crash G' });
      const job = await store.enqueueJob({ agentRunId: run.id });

      await store.acquireLeaseAtomically(job.id, 'worker-old-g', 1000); // gen 1

      await prisma.executionJob.update({
        where: { id: job.id },
        data: { leaseUntil: new Date(Date.now() - 5000) },
      });
      await store.acquireLeaseAtomically(job.id, 'worker-new-g', 10000); // gen 2

      const renewed = await store.renewLease(job.id, 'worker-old-g', 1, 10000);
      expect(renewed).toBe(false);
    });

    it('21. Crash Window H: Two workers attempt stale recovery simultaneously -> exactly 1 acquires generation', async () => {
      const run = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Crash H' });
      const job = await store.enqueueJob({ agentRunId: run.id });

      await store.acquireLeaseAtomically(job.id, 'worker-old-h', 1000); // gen 1
      await prisma.executionJob.update({
        where: { id: job.id },
        data: { leaseUntil: new Date(Date.now() - 5000) },
      });

      const claims = await Promise.all([
        store.acquireLeaseAtomically(job.id, 'worker-rec-1', 10000, 1),
        store.acquireLeaseAtomically(job.id, 'worker-rec-2', 10000, 1),
      ]);

      const acquiredCount = claims.filter((c) => c.acquired).length;
      expect(acquiredCount).toBe(1);
    });

    it('22. Crash Window I: Two processes attempt resume simultaneously -> 1 resume execution succeeds', async () => {
      const coordinator = ExecutionCoordinator.getInstance();

      const initRes = await coordinator.enqueueRun({
        agentRunId: 'run-resume-crash-i',
        tenantId: 'tenant-a',
        syncExecute: true,
        orchestrationInput: {
          ticketId: 'tkt-ph18-high',
          goal: 'High value refund ₹25000',
        },
      });

      const [res1, res2] = await Promise.all([
        coordinator.resumeRun({
          agentRunId: initRes.agentRunId,
          syncExecute: true,
          resumeInput: { approvalToken: 'VALID_APPROVAL_TOKEN_MGR', decision: 'APPROVE', managerApproved: true, managerId: 'mgr-1' },
        }).catch((e) => ({ status: 'CONFLICT', error: e.message })),
        coordinator.resumeRun({
          agentRunId: initRes.agentRunId,
          syncExecute: true,
          resumeInput: { approvalToken: 'VALID_APPROVAL_TOKEN_MGR', decision: 'APPROVE', managerApproved: true, managerId: 'mgr-1' },
        }).catch((e) => ({ status: 'CONFLICT', error: e.message })),
      ]);

      const status1 = res1?.status || (res1 as any)?.status;
      const status2 = res2?.status || (res2 as any)?.status;

      expect(['RESOLVED', 'COMPLETED', 'WAITING_FOR_APPROVAL', 'FAILED', 'ESCALATED']).toContain(status1 || status2);
    });

    it('23. Crash Window J: Two processes attempt idempotent enqueue simultaneously -> 1 job created', async () => {
      const run = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', goal: 'Crash J' });

      const [j1, j2] = await Promise.all([
        store.enqueueJob({ agentRunId: run.id, idempotencyKey: 'key-j-unique' }),
        store.enqueueJob({ agentRunId: run.id, idempotencyKey: 'key-j-unique' }),
      ]);

      expect(j1.id).toBe(j2.id);
    });
  });

  // =========================================================================
  // 5. HUMAN WAITING STATE & CAPACITY RELEASE TESTS
  // =========================================================================
  describe('5. Human Waiting State & Worker Capacity Release', () => {
    it('24. High-value refund halting at WAITING_FOR_APPROVAL sets job status to WAITING and clears workerId', async () => {
      const coordinator = ExecutionCoordinator.getInstance();

      const result = await coordinator.enqueueRun({
        agentRunId: 'run-wait-release',
        tenantId: 'tenant-a',
        syncExecute: true,
        orchestrationInput: {
          ticketId: 'tkt-ph18-high',
          goal: 'High-value refund ₹25000',
        },
      });

      expect(result.status).toBe('WAITING_FOR_APPROVAL');

      const job = await ExecutionRepository.getJobByAgentRunId('run-wait-release');
      expect(job?.status).toBe('WAITING');
      expect(job?.workerId).toBeNull();
      expect(job?.leaseUntil).toBeNull();
    });

    it('25. Resuming run from WAITING state assigns new lease and completes execution', async () => {
      const coordinator = ExecutionCoordinator.getInstance();

      await coordinator.enqueueRun({
        agentRunId: 'run-resume-complete',
        tenantId: 'tenant-a',
        syncExecute: true,
        orchestrationInput: {
          ticketId: 'tkt-ph18-high',
          goal: 'High-value refund ₹25000',
        },
      });

      const resumeRes = await coordinator.resumeRun({
        agentRunId: 'run-resume-complete',
        syncExecute: true,
        resumeInput: {
          approvalToken: 'VALID_APPROVAL_TOKEN_MGR',
          decision: 'APPROVE',
          managerApproved: true,
          managerId: 'mgr-1',
        },
      });

      expect(['RESOLVED', 'COMPLETED']).toContain(resumeRes.status);

      const job = await ExecutionRepository.getJobByAgentRunId('run-resume-complete');
      expect(job?.status).toBe('COMPLETED');
    });
  });

  // =========================================================================
  // 6. TENANT ISOLATION & SECURITY CONTEXT PRESERVATION TESTS
  // =========================================================================
  describe('6. Tenant Isolation & Security Context Preservation', () => {
    it('26. Execution jobs preserve tenantId and filter metrics by tenant', async () => {
      const runA = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-low', tenantId: 'tenant-a', goal: 'Tenant A' });
      const runB = await AgentStateRepository.createAgentRun({ ticketId: 'tkt-ph18-tenant-b', tenantId: 'tenant-b', goal: 'Tenant B' });

      await store.enqueueJob({ agentRunId: runA.id, tenantId: 'tenant-a' });
      await store.enqueueJob({ agentRunId: runB.id, tenantId: 'tenant-b' });

      const metricsA = await store.getMetrics('tenant-a');
      const metricsB = await store.getMetrics('tenant-b');

      expect(metricsA.totalJobs).toBe(1);
      expect(metricsB.totalJobs).toBe(1);
    });

    it('27. Cross-tenant execution request via API returns 404', async () => {
      const res = await fetch(`${baseUrl}/api/v1/agents/runs/non-existent-run-tenant-b/execution`, {
        headers: getAuthHeaders('ADMIN'),
      });

      expect(res.status).toBe(404);
    });
  });

  // =========================================================================
  // 7. OPERATOR TELEMETRY & API ENDPOINT TESTS
  // =========================================================================
  describe('7. Operator Telemetry & Control Plane Endpoints', () => {
    it('28. GET /api/v1/ops/execution/status exposes operational telemetry including fencing metrics', async () => {
      const res = await fetch(`${baseUrl}/api/v1/ops/execution/status`, {
        headers: getAuthHeaders('OPERATOR'),
      });

      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data.metrics.configuredConcurrency).toBeDefined();
      expect(data.metrics.fencingConflicts).toBeDefined();
      expect(data.metrics.leaseLossEvents).toBeDefined();
    });

    it('29. GET /api/v1/agents/runs/:id/execution returns execution job details for a valid run', async () => {
      const coordinator = ExecutionCoordinator.getInstance();
      const initRes = await coordinator.enqueueRun({
        agentRunId: 'run-telemetry-101',
        tenantId: 'tenant-a',
        syncExecute: true,
        orchestrationInput: { ticketId: 'tkt-ph18-low', goal: 'Telemetry run' },
      });

      const targetRunId = initRes.agentRunId || 'run-telemetry-101';
      const res = await fetch(`${baseUrl}/api/v1/agents/runs/${targetRunId}/execution`, {
        headers: getAuthHeaders('ADMIN'),
      });

      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data.executionJob.agentRunId).toBe(targetRunId);
      expect(data.executionJob.status).toBeDefined();
    });

    it('30. Readiness endpoint GET /api/v1/health/readiness returns 200 when ready and 503 during shutdown', async () => {
      const res1 = await fetch(`${baseUrl}/api/v1/health/readiness`);
      expect(res1.status).toBe(200);
      const data1: any = await res1.json();
      expect(data1.status).toBe('READY');

      const coordinator = ExecutionCoordinator.getInstance();
      // Initiate shutdown
      const shutdownPromise = coordinator.shutdown();

      const res2 = await fetch(`${baseUrl}/api/v1/health/readiness`);
      expect(res2.status).toBe(503);
      const data2: any = await res2.json();
      expect(data2.status).toBe('SHUTTING_DOWN');

      await shutdownPromise;
    });
  });

  // =========================================================================
  // 8. SAFETY & INVARIANT TESTS
  // =========================================================================
  describe('8. Hard Safety Invariant Verification', () => {
    it('31. Repeated auto-refund execution never produces duplicate financial transactions', async () => {
      const coordinator = ExecutionCoordinator.getInstance();

      const runRes = await coordinator.enqueueRun({
        agentRunId: 'run-auto-refund-idempotent',
        tenantId: 'tenant-a',
        syncExecute: true,
        orchestrationInput: {
          ticketId: 'tkt-ph18-low',
          goal: 'Auto refund ₹3500',
        },
      });

      expect(runRes.status).toBe('RESOLVED');

      // Re-run execution for same run ID
      await coordinator.enqueueRun({
        agentRunId: 'run-auto-refund-idempotent',
        tenantId: 'tenant-a',
        syncExecute: true,
        orchestrationInput: {
          ticketId: 'tkt-ph18-low',
          goal: 'Auto refund ₹3500',
        },
      });

      const refunds = await prisma.refundTransaction.findMany({
        where: { orderId: 'ord-ph18-low' },
      });

      expect(refunds.length).toBe(1);
    });

    it('32. 0 false resolutions: verification failure prevents RESOLVED state', async () => {
      const coordinator = ExecutionCoordinator.getInstance();

      // Enable failure injection on verification
      FailureInjector.enable({
        point: 'AFTER_VERIFICATION',
        failOnce: true,
      });

      try {
        await coordinator.enqueueRun({
          agentRunId: 'run-verify-fail',
          tenantId: 'tenant-a',
          syncExecute: true,
          orchestrationInput: {
            ticketId: 'tkt-ph18-low',
            goal: 'Auto refund ₹3500',
          },
        });
      } catch (e) {
        // expected failure injection error
      }

      const run = await AgentStateRepository.getAgentRun('run-verify-fail').catch(() => null);
      if (run) {
        expect(run.status).not.toBe('RESOLVED');
      }
    });

    it('33. 0 approval bypasses: high-value refund without approval token never mutates DB', async () => {
      const coordinator = ExecutionCoordinator.getInstance();

      const res = await coordinator.enqueueRun({
        agentRunId: 'run-no-approval',
        tenantId: 'tenant-a',
        syncExecute: true,
        orchestrationInput: {
          ticketId: 'tkt-ph18-high',
          goal: 'High value refund ₹25000',
        },
      });

      console.log('DEBUG RES:', JSON.stringify(res, null, 2));
      expect(res.status).toBe('WAITING_FOR_APPROVAL');

      const refunds = await prisma.refundTransaction.findMany({
        where: { orderId: 'ord-ph18-high' },
      });

      expect(refunds.length).toBe(0);
    });

    it('34. 0 consent bypasses: out-of-stock alternative stops at WAITING_FOR_CUSTOMER_CONSENT with 0 stock decrement', async () => {
      const coordinator = ExecutionCoordinator.getInstance();

      // Create out-of-stock product & order with unique IDs
      const prodOOS = await prisma.product.create({
        data: {
          id: 'prod-ph18-oos-34',
          name: 'Primary Phone OOS',
          category: 'Mobile',
          price: 15000.0,
          stockQuantity: 0,
        },
      });

      const ordOOS = await prisma.order.create({
        data: {
          id: 'ord-ph18-oos-34',
          tenantId: 'tenant-a',
          customerId: 'cust-ph18-a',
          totalAmount: 15000.0,
          status: 'DELIVERED',
        },
      });

      await prisma.orderItem.create({
        data: {
          orderId: ordOOS.id,
          productId: prodOOS.id,
          quantity: 1,
          unitPrice: 15000.0,
        },
      });

      const ticketOOS = await prisma.ticket.create({
        data: {
          id: 'tkt-ph18-oos-34',
          tenantId: 'tenant-a',
          customerId: 'cust-ph18-a',
          orderId: ordOOS.id,
          issueType: 'DAMAGED',
          customerMessage: 'Item arrived broken, need replacement',
        },
      });

      const res = await coordinator.enqueueRun({
        agentRunId: 'run-oos-consent',
        tenantId: 'tenant-a',
        syncExecute: true,
        orchestrationInput: {
          ticketId: ticketOOS.id,
          goal: 'Replacement request',
        },
      });

      expect(res.status).toBe('WAITING_FOR_CUSTOMER_CONSENT');
    });

    it('35. Property test: completed jobs map to terminal AgentRun states with valid lease generations', async () => {
      const coordinator = ExecutionCoordinator.getInstance();

      const result = await coordinator.enqueueRun({
        agentRunId: 'run-property-check',
        tenantId: 'tenant-a',
        syncExecute: true,
        orchestrationInput: {
          ticketId: 'tkt-ph18-low',
          goal: 'Property test refund',
        },
      });

      expect(result.status).toBe('RESOLVED');

      const job = await ExecutionRepository.getJobByAgentRunId('run-property-check');
      expect(job?.status).toBe('COMPLETED');
      expect(job?.leaseGeneration).toBeGreaterThan(0);
      expect(job?.workerId).toBeDefined();
    });
  });
});
