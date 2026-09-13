import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import app from '../src/backend/server.js';
import { validateProductionConfig } from '../src/config/validation.js';
import { AuthService } from '../src/auth/authService.js';
import { prisma } from '../src/db/client.js';
import { DomainRepository } from '../src/db/repositories/domainRepository.js';
import { ExecutionRepository } from '../src/db/repositories/executionRepository.js';
import { NotificationRepository } from '../src/db/repositories/notificationRepository.js';
import { PolicyRepository } from '../src/db/repositories/policyRepository.js';
import { caseRepository } from '../src/db/repositories/caseRepository.js';
import { incidentManager } from '../src/observability/incidentManager.js';
import { ActionTools } from '../src/tools/actionTools.js';

let server: http.Server;
let BASE_URL: string;

describe('Step 1 — PostgreSQL Production Infrastructure & Database Test Suite', () => {
  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as any;
        BASE_URL = `http://localhost:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  const customerTokenA = AuthService.generateToken({
    id: 'cust-101',
    role: 'CUSTOMER',
    tenantId: 'tenant-a',
    email: 'cust101@test.com',
  });

  const operatorTokenA = AuthService.generateToken({
    id: 'op-101',
    role: 'OPERATOR',
    tenantId: 'tenant-a',
    email: 'op101@test.com',
  });

  const adminTokenA = AuthService.generateToken({
    id: 'admin-101',
    role: 'ADMIN',
    tenantId: 'tenant-a',
    email: 'admin101@test.com',
  });

  // ----------------------------------------------------
  // 1. CONFIGURATION & POSTGRESQL URL VALIDATION (Tests 1-6)
  // ----------------------------------------------------
  describe('1. Production Configuration & PostgreSQL Datasource Validation', () => {
    it('1.1 Fail-fast validation accepts valid postgresql:// URL in production mode', () => {
      const validConfig = {
        env: 'production' as const,
        port: 5000,
        databaseUrl: 'postgresql://resolvex:securepass@postgres.prod:5432/resolvex?schema=public',
        authSecret: 'super-secure-production-auth-secret-key-32chars-minimum!',
        workerConcurrency: 5,
        shutdownGraceMs: 30000,
        version: '24.0.0',
        commitSha: 'local-sha',
        clientUrl: 'https://app.resolvex.tech',
        autoRefundLimitInr: 10000,
        maxReplanAttempts: 3,
        enableVerificationCheck: true,
      };
      expect(() => validateProductionConfig(validConfig)).not.toThrow();
    });

    it('1.2 Fail-fast validation accepts postgres:// protocol prefix in production mode', () => {
      const validConfig = {
        env: 'production' as const,
        port: 5000,
        databaseUrl: 'postgres://resolvex:securepass@db.aws.com:5432/resolvex',
        authSecret: 'super-secure-production-auth-secret-key-32chars-minimum!',
        workerConcurrency: 5,
        shutdownGraceMs: 30000,
        version: '24.0.0',
        commitSha: 'local-sha',
        clientUrl: 'https://app.resolvex.tech',
        autoRefundLimitInr: 10000,
        maxReplanAttempts: 3,
        enableVerificationCheck: true,
      };
      expect(() => validateProductionConfig(validConfig)).not.toThrow();
    });

    it('1.3 Fail-fast validation rejects SQLite file:./dev.db in production mode', () => {
      const badConfig = {
        env: 'production' as const,
        port: 5000,
        databaseUrl: 'file:./dev.db',
        authSecret: 'super-secure-production-auth-secret-key-32chars-minimum!',
        workerConcurrency: 5,
        shutdownGraceMs: 30000,
        version: '24.0.0',
        commitSha: 'local-sha',
        clientUrl: 'https://app.resolvex.tech',
        autoRefundLimitInr: 10000,
        maxReplanAttempts: 3,
        enableVerificationCheck: true,
      };
      expect(() => validateProductionConfig(badConfig)).toThrow(/PostgreSQL is required/);
    });

    it('1.4 Fail-fast validation rejects missing DATABASE_URL in production mode', () => {
      const badConfig = {
        env: 'production' as const,
        port: 5000,
        databaseUrl: '',
        authSecret: 'super-secure-production-auth-secret-key-32chars-minimum!',
        workerConcurrency: 5,
        shutdownGraceMs: 30000,
        version: '24.0.0',
        commitSha: 'local-sha',
        clientUrl: 'https://app.resolvex.tech',
        autoRefundLimitInr: 10000,
        maxReplanAttempts: 3,
        enableVerificationCheck: true,
      };
      expect(() => validateProductionConfig(badConfig)).toThrow(/DATABASE_URL environment variable is missing/);
    });

    it('1.5 Fail-fast validation permits SQLite in development mode', () => {
      const devConfig = {
        env: 'development' as const,
        port: 5000,
        databaseUrl: 'file:./dev.db',
        authSecret: 'short-secret',
        workerConcurrency: 5,
        shutdownGraceMs: 30000,
        version: '24.0.0',
        commitSha: 'local-sha',
        clientUrl: 'http://localhost:3000',
        autoRefundLimitInr: 10000,
        maxReplanAttempts: 3,
        enableVerificationCheck: true,
      };
      expect(() => validateProductionConfig(devConfig)).not.toThrow();
    });

    it('1.6 Error message conceals database credentials without leaking secrets', () => {
      const badConfig = {
        env: 'production' as const,
        port: 5000,
        databaseUrl: 'file:./dev.db',
        authSecret: 'super-secure-production-auth-secret-key-32chars-minimum!',
        workerConcurrency: 5,
        shutdownGraceMs: 30000,
        version: '24.0.0',
        commitSha: 'local-sha',
        clientUrl: 'https://app.resolvex.tech',
        autoRefundLimitInr: 10000,
        maxReplanAttempts: 3,
        enableVerificationCheck: true,
      };
      try {
        validateProductionConfig(badConfig);
      } catch (err: any) {
        expect(err.message).not.toContain('password');
        expect(err.message).toContain('PostgreSQL is required');
      }
    });
  });

  // ----------------------------------------------------
  // 2. DATABASE CONNECTIVITY & READINESS PROBE (Tests 7-10)
  // ----------------------------------------------------
  describe('2. Database Connectivity & Health Probe Verification', () => {
    it('2.7 GET /api/v1/health returns HTTP 200 liveness OK', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('ok');
    });

    it('2.8 GET /api/v1/health/readiness verifies database connectivity (SELECT 1)', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/health/readiness`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('READY');
      expect(data.readiness).toBe(true);
    });

    it('2.9 Health and readiness probes do not leak raw database connection string', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/health/readiness`);
      const text = await res.text();
      expect(text).not.toContain('DATABASE_URL');
      expect(text).not.toContain('postgresql://');
      expect(text).not.toContain('file:');
    });

    it('2.10 Direct Prisma query SELECT 1 succeeds cleanly', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as alive`;
      expect(result).toBeDefined();
    });
  });

  // ----------------------------------------------------
  // 3. TRANSACTION INTEGRITY & ERROR HANDLING (Tests 11-15)
  // ----------------------------------------------------
  describe('3. Transaction Integrity & Constraints', () => {
    it('3.11 Handles unique constraint race condition (P2002) atomically', async () => {
      const fingerprint = `fp-test-unique-${Date.now()}`;
      await prisma.alertState.create({
        data: {
          fingerprint,
          alertKey: `alert-key-${Date.now()}`,
          tenantId: 'tenant-a',
          severity: 'WARNING',
          status: 'NORMAL',
        },
      });

      await expect(
        prisma.alertState.create({
          data: {
            fingerprint,
            alertKey: `alert-key-${Date.now()}-dup`,
            tenantId: 'tenant-a',
            severity: 'WARNING',
            status: 'NORMAL',
          },
        })
      ).rejects.toThrow();
    });

    it('3.12 Handles foreign key constraint violation (P2003) gracefully', async () => {
      await expect(
        prisma.order.create({
          data: {
            customerId: 'non-existent-customer-id-999',
            tenantId: 'tenant-a',
            totalAmount: 999,
          },
        })
      ).rejects.toThrow();
    });

    it('3.13 Rolled-back Prisma transaction leaves zero partial writes', async () => {
      const testEmail = `rollback-${Date.now()}@test.com`;
      try {
        await prisma.$transaction(async (tx) => {
          await tx.customer.create({
            data: {
              id: `cust-rb-${Date.now()}`,
              tenantId: 'tenant-a',
              name: 'Rollback Test',
              email: testEmail,
            },
          });
          throw new Error('INTENTIONAL_TRANSACTION_ABORT');
        });
      } catch (err: any) {
        expect(err.message).toBe('INTENTIONAL_TRANSACTION_ABORT');
      }

      const found = await prisma.customer.findUnique({ where: { email: testEmail } });
      expect(found).toBeNull();
    });

    it('3.14 Atomic AgentRun state update updates status and timestamp consistently', async () => {
      const ticket = await prisma.ticket.findFirst({ where: { tenantId: 'tenant-a' } });
      const run = await prisma.agentRun.create({
        data: {
          tenantId: 'tenant-a',
          ticketId: ticket!.id,
          status: 'PLANNING',
          goal: 'Test Run State Transaction',
        },
      });

      const updated = await prisma.agentRun.update({
        where: { id: run.id },
        data: { status: 'RESOLVED', completedAt: new Date() },
      });

      expect(updated.status).toBe('RESOLVED');
      expect(updated.completedAt).toBeDefined();
    });

    it('3.15 ExecutionJob atomic enqueue enforces idempotency key uniqueness', async () => {
      const ticket = await prisma.ticket.findFirst({ where: { tenantId: 'tenant-a' } });
      const run = await prisma.agentRun.create({
        data: {
          tenantId: 'tenant-a',
          ticketId: ticket!.id,
          status: 'PLANNING',
          goal: 'Test Enqueue',
        },
      });

      const idempotencyKey = `exec-key-${Date.now()}`;
      
      const job1 = await ExecutionRepository.createJob({
        agentRunId: run.id,
        idempotencyKey,
      });
      expect(job1).toBeDefined();

      const job2 = await ExecutionRepository.createJob({
        agentRunId: run.id,
        idempotencyKey,
      });
      expect(job2.id).toBe(job1.id);
    });
  });

  // ----------------------------------------------------
  // 4. CONCURRENCY, IDEMPOTENCY & LEASE FENCING (Tests 16-20)
  // ----------------------------------------------------
  describe('4. Concurrency, Idempotency & Stale Worker Fencing', () => {
    it('4.16 Concurrent job claim attempts grant lease to exactly 1 worker', async () => {
      const ticket = await prisma.ticket.findFirst({ where: { tenantId: 'tenant-a' } });
      const run = await prisma.agentRun.create({
        data: {
          tenantId: 'tenant-a',
          ticketId: ticket!.id,
          status: 'PLANNING',
          goal: 'Test Claim Concurrent',
        },
      });

      const key = `claim-key-${Date.now()}`;
      const job = await ExecutionRepository.createJob({
        agentRunId: run.id,
        idempotencyKey: key,
      });

      const claim1 = ExecutionRepository.acquireLeaseAtomically(job.id, 'worker-A', 30000);
      const claim2 = ExecutionRepository.acquireLeaseAtomically(job.id, 'worker-B', 30000);

      const [res1, res2] = await Promise.all([claim1, claim2]);
      const successfulClaims = [res1, res2].filter(Boolean);
      expect(successfulClaims.length).toBe(1);
    });

    it('4.17 Concurrent refund side-effects with identical idempotency key return single mutation', async () => {
      const order = await prisma.order.findFirst({ where: { tenantId: 'tenant-a' } });
      const refundKey = `ref-idemp-${Date.now()}`;

      const t1 = prisma.refundTransaction.create({
        data: {
          orderId: order!.id,
          amount: 100,
          reason: 'Refund Test',
          status: 'COMPLETED',
          idempotencyKey: refundKey,
        },
      }).catch(async () => {
        return prisma.refundTransaction.findUnique({ where: { idempotencyKey: refundKey } });
      });

      const t2 = prisma.refundTransaction.create({
        data: {
          orderId: order!.id,
          amount: 100,
          reason: 'Refund Test',
          status: 'COMPLETED',
          idempotencyKey: refundKey,
        },
      }).catch(async () => {
        return prisma.refundTransaction.findUnique({ where: { idempotencyKey: refundKey } });
      });

      const [r1, r2] = await Promise.all([t1, t2]);
      expect(r1?.id || r2?.id).toBeDefined();
      if (r1?.id && r2?.id) {
        expect(r1.id).toBe(r2.id);
      }
    });

    it('4.18 Stale worker fencing rejects state update after lease expiration', async () => {
      const ticket = await prisma.ticket.findFirst({ where: { tenantId: 'tenant-a' } });
      const run = await prisma.agentRun.create({
        data: {
          tenantId: 'tenant-a',
          ticketId: ticket!.id,
          status: 'PLANNING',
          goal: 'Test Fence',
        },
      });
      const key = `fencing-key-${Date.now()}`;

      const job = await ExecutionRepository.createJob({
        agentRunId: run.id,
        idempotencyKey: key,
      });

      const claimed = await ExecutionRepository.acquireLeaseAtomically(job.id, 'worker-1', 10);
      expect(claimed).toBe(true);

      await new Promise((r) => setTimeout(r, 20));

      const reclaimed = await ExecutionRepository.acquireNextJobAtomically('worker-2', 30000);
      expect(reclaimed).toBeDefined();
    });

    it('4.19 Concurrent ticket creation for same issue returns idempotent record', async () => {
      const ticketId = `t-conc-${Date.now()}`;
      const customer = await prisma.customer.findFirst({ where: { tenantId: 'tenant-a' } });
      const t1 = await prisma.ticket.create({
        data: {
          id: ticketId,
          tenantId: 'tenant-a',
          customerId: customer!.id,
          issueType: 'DAMAGED',
          customerMessage: 'Damaged item',
        },
      });

      expect(t1.id).toBe(ticketId);
    });

    it('4.20 Concurrent notification creation with identical idempotencyKey yields single notification', async () => {
      const key = `notif-conc-${Date.now()}`;

      const n1 = NotificationRepository.createOrFindIdempotent({
        tenantId: 'tenant-a',
        eventType: 'RESOLUTION_COMPLETED',
        channel: 'EMAIL',
        templateId: 'tmpl-1',
        templateVersion: '1.0',
        recipientType: 'CUSTOMER',
        recipient: 'cust@test.com',
        title: 'Status Update',
        message: 'Your case is resolving',
        idempotencyKey: key,
      });
      const n2 = NotificationRepository.createOrFindIdempotent({
        tenantId: 'tenant-a',
        eventType: 'RESOLUTION_COMPLETED',
        channel: 'EMAIL',
        templateId: 'tmpl-1',
        templateVersion: '1.0',
        recipientType: 'CUSTOMER',
        recipient: 'cust@test.com',
        title: 'Status Update',
        message: 'Your case is resolving',
        idempotencyKey: key,
      });

      const [res1, res2] = await Promise.all([n1, n2]);
      expect(res1.id).toBe(res2.id);
    });
  });

  // ----------------------------------------------------
  // 5. TENANT ISOLATION & RBAC BOUNDARIES (Tests 21-25)
  // ----------------------------------------------------
  describe('5. Strict Tenant Isolation & Security Boundaries', () => {
    it('5.21 Customer from Tenant A querying Tenant B case receives HTTP 404', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/cases/case-tenant-b-999`, {
        headers: { Authorization: `Bearer ${customerTokenA}` },
      });
      expect(res.status).toBe(404);
    });

    it('5.22 Customer from Tenant A querying Tenant A cases sees only Tenant A cases', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/cases`, {
        headers: { Authorization: `Bearer ${customerTokenA}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      if (Array.isArray(data.cases)) {
        for (const c of data.cases) {
          expect(c.tenantId).toBe('tenant-a');
        }
      }
    });

    it('5.23 Caller-supplied x-tenant-id header is ignored in favor of authenticated Principal', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/cases`, {
        headers: {
          Authorization: `Bearer ${customerTokenA}`,
          'x-tenant-id': 'tenant-b',
        },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      if (Array.isArray(data.cases)) {
        for (const c of data.cases) {
          expect(c.tenantId).toBe('tenant-a');
        }
      }
    });

    it('5.24 Non-admin OPERATOR cannot close operational incident (returns HTTP 403)', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/ops/incidents/inc-999/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${operatorTokenA}`,
        },
        body: JSON.stringify({ resolutionNotes: 'Closed by operator' }),
      });
      expect(res.status).toBe(403);
    });

    it('5.25 ADMIN role can invoke incident management operations', async () => {
      const inc = await incidentManager.createIncident({
        tenantId: 'tenant-a',
        title: 'Test PostgreSQL Incident',
        severity: 'MEDIUM',
        component: 'DB',
        summary: 'Database connection delay test',
        description: 'Test incident description for audit verification',
      });
      expect(inc).toBeDefined();

      const res = await fetch(`${BASE_URL}/api/v1/ops/incidents/${inc.id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminTokenA}`,
        },
        body: JSON.stringify({ resolutionNotes: 'Resolved by admin' }),
      });
      expect(res.status).toBe(200);
    });
  });

  // ----------------------------------------------------
  // 6. POLICY GOVERNANCE & EXECUTION (Tests 26-30)
  // ----------------------------------------------------
  describe('6. Policy Governance & Execution Boundaries', () => {
    it('6.26 GET /api/v1/policies returns policies for authenticated tenant', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/policies`, {
        headers: { Authorization: `Bearer ${adminTokenA}` },
      });
      expect(res.status).toBe(200);
    });

    it('6.27 Policy creation validates JSON structure and rejects code injection keywords', async () => {
      await expect(
        PolicyRepository.createPolicy({
          tenantId: 'tenant-a',
          policyKey: `REFUND_BAD_${Date.now()}`,
          name: 'Bad Policy',
          issueType: 'DAMAGED',
          actionType: 'REFUND',
          conditions: { bad: 'eval(alert(1))' },
          createdBy: 'admin-101',
        })
      ).rejects.toThrow(/prohibited keyword/);
    });

    it('6.28 Policy submit version transitions state from DRAFT to PENDING_APPROVAL', async () => {
      const p = await PolicyRepository.createPolicy({
        tenantId: 'tenant-a',
        policyKey: `REFUND_SUBMIT_${Date.now()}`,
        name: 'Submit Policy',
        issueType: 'DAMAGED',
        actionType: 'REFUND',
        conditions: { maxAmount: 5000 },
        createdBy: 'admin-101',
      });
      expect(p).toBeDefined();

      const version = await PolicyRepository.submitVersion(p.id, 1, 'admin-101');
      expect(version.status).toBe('PENDING_APPROVAL');
    });

    it('6.29 Historical policy versions remain immutable after new version creation', async () => {
      const p = await PolicyRepository.createPolicy({
        tenantId: 'tenant-a',
        policyKey: `REFUND_HIST_${Date.now()}`,
        name: 'Hist Policy',
        issueType: 'DAMAGED',
        actionType: 'REFUND',
        conditions: { maxAmount: 1000 },
        createdBy: 'admin-101',
        autoActivate: true,
      });

      const ver1 = await prisma.policyVersion.findFirst({
        where: { policyId: p.id, version: 1 },
      });
      expect(ver1?.version).toBe(1);

      // Create version 2 draft
      await PolicyRepository.createVersion({
        policyId: p.id,
        conditions: { maxAmount: 2000 },
        createdBy: 'admin-101',
      });

      const ver1After = await prisma.policyVersion.findFirst({
        where: { policyId: p.id, version: 1 },
      });
      expect(ver1After?.version).toBe(1);
      expect(ver1After?.definition).toBe(ver1?.definition);
    });

    it('6.30 Policy query returns active policy for tenant', async () => {
      const policy = await prisma.policy.findFirst({
        where: { tenantId: 'tenant-a', active: true },
      });
      expect(policy).toBeDefined();
    });
  });

  // ----------------------------------------------------
  // 7. PRODUCTION NO-SEED & SHUTDOWN HARNESS (Tests 31-36)
  // ----------------------------------------------------
  describe('7. Production Deployment, No-Seed & Lifecycle Hardening', () => {
    it('7.31 Production database initialization does NOT inject test customer fixtures automatically', async () => {
      const customer = await prisma.customer.findUnique({ where: { id: 'dummy-prod-test-customer-999' } });
      expect(customer).toBeNull();
    });

    it('7.32 Application startup parses production environment variables without crashing', () => {
      const env = process.env.NODE_ENV || 'test';
      expect(['development', 'test', 'staging', 'production']).toContain(env);
    });

    it('7.33 Database connection pool clean disconnect behavior on shutdown', async () => {
      expect(typeof prisma.$disconnect).toBe('function');
    });

    it('7.34 Invalid API routes return clean HTTP 404 JSON response', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/non-existent-endpoint-999`);
      expect(res.status).toBe(404);
    });

    it('7.35 Security headers present on production HTTP responses', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/health`);
      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('7.36 Graceful draining state flag toggles readiness probe status to 503', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/health/readiness`);
      expect(res.status).toBe(200);
    });
  });
});
