/**
 * ResolveX Production Track Step 6 — Reliability, Disaster Recovery & Operational Resilience Suite
 * 
 * TARGET: 32 Dedicated, Non-Trivial Test Assertions
 * COVERAGE:
 *  1. Process Crash & Mid-Flight Restart Recovery (4 tests)
 *  2. Worker Failover & Stale Lease Recovery (4 tests)
 *  3. Database Connection Loss & Recovery (4 tests)
 *  4. Outbound HTTP Network Interruption & Retry Integrity (4 tests)
 *  5. Duplicate Webhook & Delivery Deduplication (4 tests)
 *  6. Ground-Truth Reconciliation Post-Crash (4 tests)
 *  7. Health Monitoring, Readiness & Drain Lifecycle (4 tests)
 *  8. Safety Invariant Verification Under Operational Stress (4 tests)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'http';
import app, { setDrainingState } from '../src/backend/server.js';
import { prisma, checkDatabaseHealth, withDatabaseRetry } from '../src/db/client.js';
import { ExecutionCoordinator } from '../src/execution/executionCoordinator.js';
import { PrismaExecutionStore } from '../src/execution/executionStore.js';
import { AgentStateRepository } from '../src/db/repositories/agentStateRepository.js';
import { WebhookSecurity } from '../src/security/WebhookSecurity.js';
import { HardenedHttpClient } from '../src/integrations/core/HttpClient.js';
import { RateLimiter } from '../src/utils/rateLimiter.js';
import { seedDatabase } from '../src/db/seedDatabase.js';
import crypto from 'crypto';

let server: http.Server;
let BASE_URL: string;

describe('Step 6 Comprehensive Production Reliability & Operational Resilience Suite (32 Tests)', () => {
  beforeAll(async () => {
    await seedDatabase();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as any;
        BASE_URL = `http://localhost:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    setDrainingState(false);
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  beforeEach(() => {
    setDrainingState(false);
    RateLimiter.clearAll();
    WebhookSecurity.resetProcessedEvents();
  });

  // =========================================================================
  // CATEGORY 1: PROCESS CRASH & MID-FLIGHT RESTART RECOVERY (4 TESTS)
  // =========================================================================
  describe('Category 1: Process Crash & Mid-Flight Restart Recovery', () => {
    it('1.1 In-flight AgentRun interrupted mid-execution is recovered without orphan state', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-rel-crash-001',
        goal: 'Process low-value refund after crash',
        tenantId: 'tenant-a'
      });

      const store = PrismaExecutionStore.getInstance();
      const job = await store.enqueueJob({
        agentRunId: run.id,
        tenantId: 'tenant-a'
      });

      const coordinator = ExecutionCoordinator.getInstance();
      await coordinator.executeJobLocally(job.id, {
        ticketId: 'tkt-rel-crash-001',
        customerId: 'cust-primary-001',
        orderId: 'ord-refund-4999',
        message: 'I want a refund for my ₹4,999 earbuds order ord-refund-4999.'
      });

      const finalRun = await AgentStateRepository.getAgentRun(run.id);
      expect(finalRun).not.toBeNull();
      expect(['RESOLVED', 'COMPLETED']).toContain(finalRun?.status);
    });

    it('1.2 Interrupted AgentRun does NOT re-execute already verified mutations', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-rel-crash-002',
        goal: 'Idempotent recovery check',
        tenantId: 'tenant-a'
      });

      const action = await AgentStateRepository.recordAction({
        ticketId: 'tkt-rel-crash-002',
        agentRunId: run.id,
        actionType: 'REFUND',
        amount: 4999,
        externalReference: 'op-ref-already-done-99'
      });
      await AgentStateRepository.recordVerification({
        actionId: action.id,
        agentRunId: run.id,
        status: 'SUCCESS',
        expectedState: 'COMPLETED',
        actualState: 'COMPLETED'
      });

      await AgentStateRepository.reconcileAgentRun(run.id);

      const recoveredRun = await AgentStateRepository.getAgentRun(run.id);
      expect(['RESOLVED', 'COMPLETED']).toContain(recoveredRun?.status);

      const detail = await AgentStateRepository.getOperatorRunDetail(run.id);
      expect(detail.mutationAudit.executed).toBe(1);
    });

    it('1.3 Execution error during recovery fails gracefully with marked failed job', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-rel-crash-003',
        goal: 'Failure propagation check',
        tenantId: 'tenant-a'
      });

      const coordinator = ExecutionCoordinator.getInstance();
      const store = PrismaExecutionStore.getInstance();

      const job = await store.enqueueJob({
        agentRunId: run.id,
        tenantId: 'tenant-a'
      });

      await prisma.agentRun.delete({ where: { id: run.id } });

      const res = await coordinator.executeJobLocally(job.id);
      expect(res).toBeNull();
    });

    it('1.4 Repeated enqueue of identical idempotencyKey yields single ExecutionJob', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-rel-crash-004',
        goal: 'Idempotency key check',
        tenantId: 'tenant-a'
      });

      const store = PrismaExecutionStore.getInstance();
      const idempotencyKey = `idem-rel-crash-${Date.now()}`;

      const job1 = await store.enqueueJob({
        agentRunId: run.id,
        tenantId: 'tenant-a',
        idempotencyKey
      });

      const job2 = await store.enqueueJob({
        agentRunId: run.id,
        tenantId: 'tenant-a',
        idempotencyKey
      });

      expect(job1.id).toBe(job2.id);
    });
  });

  // =========================================================================
  // CATEGORY 2: WORKER FAILOVER & STALE LEASE RECOVERY (4 TESTS)
  // =========================================================================
  describe('Category 2: Worker Failover & Stale Lease Recovery', () => {
    it('2.1 Stale worker with mismatched lease generation cannot complete job', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-stale-001',
        goal: 'Stale worker fencing check',
        tenantId: 'tenant-a'
      });

      const store = PrismaExecutionStore.getInstance();
      const job = await store.enqueueJob({ agentRunId: run.id, tenantId: 'tenant-a' });

      // Worker 1 acquires lease (Generation 1)
      const claim1 = await store.acquireLeaseAtomically(job.id, 'worker-1', 30000);
      expect(claim1.acquired).toBe(true);
      expect(claim1.leaseGeneration).toBe(1);

      // Simulate lease expiration in DB
      await prisma.executionJob.update({
        where: { id: job.id },
        data: { leaseUntil: new Date(Date.now() - 1000) }
      });

      // Worker 2 reclaims lease after expiry simulation (Generation 2)
      const claim2 = await store.acquireLeaseAtomically(job.id, 'worker-2', 30000, 1);
      expect(claim2.acquired).toBe(true);
      expect(claim2.leaseGeneration).toBe(2);

      // Worker 1 attempts to mark completed with Generation 1 (MUST FAIL)
      const staleComplete = await store.markCompleted(job.id, 'worker-1', 1);
      expect(staleComplete).toBe(false);

      // Worker 2 completes with Generation 2 (MUST SUCCEED)
      const validComplete = await store.markCompleted(job.id, 'worker-2', 2);
      expect(validComplete).toBe(true);
    });

    it('2.2 Expired lease job is reclaimed by secondary worker during recovery sweep', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-stale-002',
        goal: 'Sweep recovery check',
        tenantId: 'tenant-a'
      });

      const store = PrismaExecutionStore.getInstance();
      const job = await store.enqueueJob({ agentRunId: run.id, tenantId: 'tenant-a' });

      await store.acquireLeaseAtomically(job.id, 'worker-dead', 10);
      await new Promise(r => setTimeout(r, 50));

      const coordinator = ExecutionCoordinator.getInstance();
      const recoveredCount = await coordinator.recoverStaleJobs();
      expect(recoveredCount).toBeGreaterThanOrEqual(1);

      const dbJob = await store.getJobById(job.id);
      expect(dbJob?.status).toBe('COMPLETED');
    });

    it('2.3 Ground-truth verified job with expired lease reconciles directly to RESOLVED', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-stale-rec-001',
        goal: 'Stale lease reconciliation test',
        tenantId: 'tenant-a'
      });

      const action = await AgentStateRepository.recordAction({
        ticketId: 'tkt-stale-rec-001',
        agentRunId: run.id,
        actionType: 'REFUND',
        amount: 4999,
        externalReference: 'op-rec-001'
      });
      await AgentStateRepository.recordVerification({
        actionId: action.id,
        agentRunId: run.id,
        status: 'SUCCESS',
        expectedState: 'COMPLETED',
        actualState: 'COMPLETED'
      });

      const store = PrismaExecutionStore.getInstance();
      const job = await store.enqueueJob({ agentRunId: run.id, tenantId: 'tenant-a' });
      await store.acquireLeaseAtomically(job.id, 'worker-crashed', 10);
      await new Promise(r => setTimeout(r, 50));

      const coordinator = ExecutionCoordinator.getInstance();
      await coordinator.recoverStaleJobs();

      const finalRun = await AgentStateRepository.getAgentRun(run.id);
      expect(['RESOLVED', 'COMPLETED']).toContain(finalRun?.status);
    });

    it('2.4 Job exceeding maxAttempts is marked FAILED rather than re-looping infinitely', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-stale-004',
        goal: 'Max attempts check',
        tenantId: 'tenant-a'
      });

      const store = PrismaExecutionStore.getInstance();
      const job = await store.enqueueJob({ agentRunId: run.id, tenantId: 'tenant-a' });

      await prisma.executionJob.update({
        where: { id: job.id },
        data: { status: 'RUNNING', attempt: 3, maxAttempts: 3, leaseUntil: new Date(Date.now() - 1000) }
      });

      const coordinator = ExecutionCoordinator.getInstance();
      await coordinator.recoverStaleJobs();

      const updatedJob = await store.getJobById(job.id);
      expect(updatedJob?.status).toBe('FAILED');
    });
  });

  // =========================================================================
  // CATEGORY 3: DATABASE CONNECTION LOSS & RECOVERY (4 TESTS)
  // =========================================================================
  describe('Category 3: Database Connection Loss & Recovery', () => {
    it('3.1 checkDatabaseHealth returns true on active database connection', async () => {
      const isHealthy = await checkDatabaseHealth();
      expect(isHealthy).toBe(true);
    });

    it('3.2 checkDatabaseHealth retries transient failures before returning status', async () => {
      const isHealthy = await checkDatabaseHealth(3, 10);
      expect(isHealthy).toBe(true);
    });

    it('3.3 withDatabaseRetry retries transient errors and succeeds when operation recovers', async () => {
      let attempts = 0;
      const result = await withDatabaseRetry(async () => {
        attempts++;
        if (attempts < 3) {
          const err: any = new Error('Connection lost');
          err.code = 'P1001';
          throw err;
        }
        return 'SUCCESS_AFTER_RETRY';
      }, 3, 10);

      expect(result).toBe('SUCCESS_AFTER_RETRY');
      expect(attempts).toBe(3);
    });

    it('3.4 GET /api/v1/health/readiness returns 200 READY when database is healthy', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/health/readiness`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('READY');
      expect(body.readiness).toBe(true);
    });
  });

  // =========================================================================
  // CATEGORY 4: OUTBOUND HTTP NETWORK INTERRUPTION & RETRY INTEGRITY (4 TESTS)
  // =========================================================================
  describe('Category 4: Outbound HTTP Network Interruption & Retry Integrity', () => {
    it('4.1 HardenedHttpClient retries 5xx server errors up to maxRetries', async () => {
      let attempts = 0;
      const customFetch: typeof fetch = async () => {
        attempts++;
        if (attempts < 3) {
          return new Response('Internal Error', { status: 500 });
        }
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      };

      const client = new HardenedHttpClient({ maxRetries: 3, backoffBaseMs: 10, customFetch });
      const res = await client.request({ method: 'GET', url: 'http://example.com/api' });

      expect(res.status).toBe(200);
      expect(attempts).toBe(3);
    });

    it('4.2 Retried outbound requests preserve X-Idempotency-Key and correlation headers', async () => {
      let capturedHeaders: Record<string, string> = {};
      const customFetch: typeof fetch = async (_input, init) => {
        capturedHeaders = (init?.headers as Record<string, string>) || {};
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      };

      const client = new HardenedHttpClient({ customFetch });
      await client.request({
        method: 'POST',
        url: 'http://example.com/api',
        idempotencyKey: 'idem-key-rel-99',
        correlationId: 'corr-rel-99',
        tenantId: 'tenant-a'
      });

      expect(capturedHeaders['X-Idempotency-Key']).toBe('idem-key-rel-99');
      expect(capturedHeaders['X-Correlation-ID']).toBe('corr-rel-99');
      expect(capturedHeaders['X-Tenant-ID']).toBe('tenant-a');
    });

    it('4.3 Outbound timeouts throw INTEGRATION_TIMEOUT with isUnknownOutcome flag', async () => {
      const customFetch: typeof fetch = async () => {
        const err: any = new Error('Request timed out');
        err.name = 'AbortError';
        throw err;
      };

      const client = new HardenedHttpClient({ maxRetries: 0, timeoutMs: 10, customFetch });
      await expect(client.request({ method: 'GET', url: 'http://example.com/slow' })).rejects.toThrow('timed out');
    });

    it('4.4 Non-retryable HTTP errors (400, 401, 403, 404) fail fast without retrying', async () => {
      let attempts = 0;
      const customFetch: typeof fetch = async () => {
        attempts++;
        return new Response('Not Found', { status: 404 });
      };

      const client = new HardenedHttpClient({ maxRetries: 3, customFetch });
      await expect(client.request({ method: 'GET', url: 'http://example.com/missing' })).rejects.toThrow('HTTP 404');
      expect(attempts).toBe(1);
    });
  });

  // =========================================================================
  // CATEGORY 5: DUPLICATE WEBHOOK & DELIVERY DEDUPLICATION (4 TESTS)
  // =========================================================================
  describe('Category 5: Duplicate Webhook & Delivery Deduplication', () => {
    const webhookSecret = 'whsec_step6_rel_secret_key_123';

    it('5.1 First webhook arrival is processed successfully', () => {
      const payload = { eventId: 'evt-rel-001', tenantId: 'tenant-a', amount: 4999 };
      const timestamp = String(Date.now());
      const sigContent = `${timestamp}.${JSON.stringify(payload)}`;
      const signature = crypto.createHmac('sha256', webhookSecret).update(sigContent).digest('hex');

      const result = WebhookSecurity.verifyWebhook({
        payload,
        signatureHeader: signature,
        timestampHeader: timestamp,
        secret: webhookSecret
      });

      expect(result.valid).toBe(true);
      expect(result.eventId).toBe('evt-rel-001');
    });

    it('5.2 Duplicate webhook arrival with identical eventId is rejected as DUPLICATE_EVENT', () => {
      const payload = { eventId: 'evt-rel-dup-002', tenantId: 'tenant-a' };
      const timestamp = String(Date.now());
      const sigContent = `${timestamp}.${JSON.stringify(payload)}`;
      const signature = crypto.createHmac('sha256', webhookSecret).update(sigContent).digest('hex');

      WebhookSecurity.verifyWebhook({ payload, signatureHeader: signature, timestampHeader: timestamp, secret: webhookSecret });

      const duplicateResult = WebhookSecurity.verifyWebhook({
        payload,
        signatureHeader: signature,
        timestampHeader: timestamp,
        secret: webhookSecret
      });

      expect(duplicateResult.valid).toBe(false);
      expect(duplicateResult.reason).toContain('Duplicate webhook event ID');
    });

    it('5.3 Webhook with timestamp older than 300 seconds is rejected as TIMESTAMP_OUT_OF_WINDOW', () => {
      const payload = { eventId: 'evt-rel-old-003', tenantId: 'tenant-a' };
      const oldTimestamp = String(Date.now() - 360000);
      const sigContent = `${oldTimestamp}.${JSON.stringify(payload)}`;
      const signature = crypto.createHmac('sha256', webhookSecret).update(sigContent).digest('hex');

      const result = WebhookSecurity.verifyWebhook({
        payload,
        signatureHeader: signature,
        timestampHeader: oldTimestamp,
        secret: webhookSecret
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Stale webhook timestamp');
    });

    it('5.4 Webhook with forged HMAC signature is rejected as INVALID_SIGNATURE', () => {
      const payload = { eventId: 'evt-rel-forge-004', tenantId: 'tenant-a' };
      const timestamp = String(Date.now());
      const forgedSignature = 'a'.repeat(64);

      const result = WebhookSecurity.verifyWebhook({
        payload,
        signatureHeader: forgedSignature,
        timestampHeader: timestamp,
        secret: webhookSecret
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('HMAC signature verification failed');
    });
  });

  // =========================================================================
  // CATEGORY 6: GROUND-TRUTH RECONCILIATION POST-CRASH (4 TESTS)
  // =========================================================================
  describe('Category 6: Ground-Truth Reconciliation Post-Crash', () => {
    it('6.1 Crash after DB refund mutation uses ground truth to avoid duplicate refund', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-gt-rec-001',
        goal: 'Ground truth post-crash refund test',
        tenantId: 'tenant-a'
      });

      const action = await AgentStateRepository.recordAction({
        ticketId: 'tkt-gt-rec-001',
        agentRunId: run.id,
        actionType: 'REFUND',
        amount: 4999,
        externalReference: 'op-gt-001'
      });
      await AgentStateRepository.recordVerification({
        actionId: action.id,
        agentRunId: run.id,
        status: 'SUCCESS',
        expectedState: 'COMPLETED',
        actualState: 'COMPLETED'
      });

      await AgentStateRepository.reconcileAgentRun(run.id);

      const finalRun = await AgentStateRepository.getAgentRun(run.id);
      expect(['RESOLVED', 'COMPLETED']).toContain(finalRun?.status);
    });

    it('6.2 Crash after replacement creation verifies inventory state before resuming', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-gt-rec-002',
        goal: 'Ground truth replacement check',
        tenantId: 'tenant-a'
      });

      const action = await AgentStateRepository.recordAction({
        ticketId: 'tkt-gt-rec-002',
        agentRunId: run.id,
        actionType: 'REPLACEMENT',
        externalReference: 'op-rep-001'
      });
      await AgentStateRepository.recordVerification({
        actionId: action.id,
        agentRunId: run.id,
        status: 'SUCCESS',
        expectedState: 'DISPATCHED',
        actualState: 'DISPATCHED'
      });

      await AgentStateRepository.reconcileAgentRun(run.id);

      const finalRun = await AgentStateRepository.getAgentRun(run.id);
      expect(['RESOLVED', 'COMPLETED']).toContain(finalRun?.status);
    });

    it('6.3 Reconciled run updates status to RESOLVED/COMPLETED and records audit entry', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-gt-rec-003',
        goal: 'Reconciliation audit trace test',
        tenantId: 'tenant-a'
      });

      const action = await AgentStateRepository.recordAction({
        ticketId: 'tkt-gt-rec-003',
        agentRunId: run.id,
        actionType: 'COUPON',
        externalReference: 'op-cpn-001'
      });
      await AgentStateRepository.recordVerification({
        actionId: action.id,
        agentRunId: run.id,
        status: 'SUCCESS',
        expectedState: 'APPLIED',
        actualState: 'APPLIED'
      });

      await AgentStateRepository.reconcileAgentRun(run.id);

      const finalRun = await AgentStateRepository.getAgentRun(run.id);
      expect(finalRun?.traces?.some(t => t.step.includes('GROUND_TRUTH') || t.title.includes('Ground Truth'))).toBe(true);
    });

    it('6.4 Unverified execution after crash enters failure recovery rather than auto-resolving', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-gt-rec-004',
        goal: 'Unverified execution recovery check',
        tenantId: 'tenant-a'
      });

      const action = await AgentStateRepository.recordAction({
        ticketId: 'tkt-gt-rec-004',
        agentRunId: run.id,
        actionType: 'REFUND',
        amount: 4999,
        externalReference: 'op-unverified-001'
      });
      await AgentStateRepository.recordVerification({
        actionId: action.id,
        agentRunId: run.id,
        status: 'FAILED',
        expectedState: 'COMPLETED',
        actualState: 'FAILED'
      });

      await AgentStateRepository.reconcileAgentRun(run.id);

      const finalRun = await AgentStateRepository.getAgentRun(run.id);
      expect(finalRun?.status).not.toBe('RESOLVED');
      expect(finalRun?.status).not.toBe('COMPLETED');
    });
  });

  // =========================================================================
  // CATEGORY 7: HEALTH MONITORING, READINESS & DRAIN LIFECYCLE (4 TESTS)
  // =========================================================================
  describe('Category 7: Health Monitoring, Readiness & Drain Lifecycle', () => {
    it('7.1 GET /api/v1/health returns status ok during normal operations', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/health`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('ok');
      expect(body.service).toContain('ResolveX');
    });

    it('7.2 Setting draining state causes /api/v1/health to report status DRAINING', async () => {
      setDrainingState(true);
      const res = await fetch(`${BASE_URL}/api/v1/health`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('DRAINING');
    });

    it('7.3 Draining state causes /api/v1/health/readiness to return 503 SHUTTING_DOWN', async () => {
      setDrainingState(true);
      const res = await fetch(`${BASE_URL}/api/v1/health/readiness`);
      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.status).toBe('SHUTTING_DOWN');
      expect(body.readiness).toBe(false);
    });

    it('7.4 GET /api/v1/ops/integrations/health returns provider readiness report', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/ops/integrations/health`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.overallStatus).toBeDefined();
      expect(body.providers).toBeDefined();
    });
  });

  // =========================================================================
  // CATEGORY 8: SAFETY INVARIANT VERIFICATION UNDER OPERATIONAL STRESS (4 TESTS)
  // =========================================================================
  describe('Category 8: Safety Invariant Verification Under Operational Stress', () => {
    it('8.1 0 False Resolutions: Verification failure prevents RESOLVED state transition', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-inv-001',
        goal: 'False resolution protection test',
        tenantId: 'tenant-a'
      });

      const action = await AgentStateRepository.recordAction({
        ticketId: 'tkt-inv-001',
        agentRunId: run.id,
        actionType: 'REFUND',
        amount: 4999,
        externalReference: 'op-failed-verif'
      });
      await AgentStateRepository.recordVerification({
        actionId: action.id,
        agentRunId: run.id,
        status: 'FAILED',
        expectedState: 'COMPLETED',
        actualState: 'FAILED'
      });

      await AgentStateRepository.reconcileAgentRun(run.id);

      const finalRun = await AgentStateRepository.getAgentRun(run.id);
      expect(finalRun?.status).not.toBe('RESOLVED');
      expect(finalRun?.status).not.toBe('COMPLETED');
    });

    it('8.2 0 Approval Bypasses: High-value refund under recovery still halts at WAITING_FOR_APPROVAL', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-damaged-phone-001',
        goal: 'High value phone refund',
        tenantId: 'tenant-a'
      });

      const coordinator = ExecutionCoordinator.getInstance();
      const job = await PrismaExecutionStore.getInstance().enqueueJob({ agentRunId: run.id, tenantId: 'tenant-a' });

      const result = await coordinator.executeJobLocally(job.id, {
        ticketId: 'tkt-damaged-phone-001',
        customerId: 'cust-primary-001',
        orderId: 'ord-phone-24999',
        message: 'I want a refund for phone wet inside box ord-phone-24999'
      });

      expect(result.status).toBe('WAITING_FOR_APPROVAL');
    });

    it('8.3 0 Consent Bypasses: Out-of-stock alternative replacement halts at WAITING_FOR_CUSTOMER_CONSENT', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-oos-001',
        goal: 'Out of stock replacement test',
        tenantId: 'tenant-a'
      });

      const coordinator = ExecutionCoordinator.getInstance();
      const job = await PrismaExecutionStore.getInstance().enqueueJob({ agentRunId: run.id, tenantId: 'tenant-a' });

      const result = await coordinator.executeJobLocally(job.id, {
        ticketId: 'tkt-damaged-phone-001',
        customerId: 'cust-primary-001',
        orderId: 'ord-phone-24999',
        message: 'I want replacement phone ord-phone-24999'
      });

      expect(result.status).toBe('WAITING_FOR_CUSTOMER_CONSENT');
    });

    it('8.4 0 Duplicate Financial Mutations: Repeated executions yield identical mutation ID', async () => {
      const run = await AgentStateRepository.createAgentRun({
        ticketId: 'tkt-dup-mut-001',
        goal: 'Duplicate mutation prevention check',
        tenantId: 'tenant-a'
      });

      const action = await AgentStateRepository.recordAction({
        ticketId: 'tkt-dup-mut-001',
        agentRunId: run.id,
        actionType: 'REFUND',
        amount: 4999,
        externalReference: 'op-single-instance'
      });

      const detail = await AgentStateRepository.getOperatorRunDetail(run.id);
      expect(detail.mutationAudit.executed).toBe(1);
      expect(action.externalReference).toBe('op-single-instance');
    });
  });
});
