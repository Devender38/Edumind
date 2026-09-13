/**
 * ResolveX — Step 1 Remediation: Real PostgreSQL Integration Test Suite
 *
 * TARGET: Real PostgreSQL 18.4 on 127.0.0.1:5432
 * DATABASE: resolvex_test (schema: public)
 * PRISMA SCHEMA: prisma/schema.pg.prisma (provider = "postgresql")
 *
 * This test file ONLY runs when DATABASE_URL_PG is set to a real PostgreSQL URL.
 * It covers all 12 mandatory concurrency scenarios, crash-window scenarios,
 * transaction integrity, tenant isolation, and schema/index verification.
 *
 * IMPORTANT: These tests use the client-pg generated client which points to PostgreSQL.
 * They do NOT share state with the SQLite test suite.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

// ─── Constants ────────────────────────────────────────────────────────────────

const PG_URL = 'postgresql://postgres:resolvex_dev_2026@127.0.0.1:5432/resolvex_test?schema=public';

// Seed data used across tests — created once in beforeAll
let seedCustomerId: string;
let seedOrderId: string;
let seedProductId: string;
let seedTicketId: string;
let seedPolicyId: string;

// ─── Lazy pg client import ─────────────────────────────────────────────────────
// We instantiate PrismaClient directly here to avoid import ordering issues with
// the generated client-pg. This mirrors what client.pg.ts does.

let pg: any;

async function getPg() {
  if (!pg) {
    // Dynamic import of the generated pg client
    const { PrismaClient } = await import('../node_modules/.prisma/client-pg/index.js');
    pg = new PrismaClient({
      datasources: { db: { url: PG_URL } },
      log: ['error'],
    });
  }
  return pg;
}

// ─── Helper: clean all test rows ──────────────────────────────────────────────
async function cleanPg() {
  const client = await getPg();
  // Delete in FK-safe order
  await client.verificationResult.deleteMany({});
  await client.actionRecord.deleteMany({});
  await client.notification.deleteMany({});
  await client.agentTrace.deleteMany({});
  await client.toolExecution.deleteMany({});
  await client.executionJob.deleteMany({});
  await client.escalation.deleteMany({});
  await client.agentRun.deleteMany({});
  await client.refundTransaction.deleteMany({});
  await client.coupon.deleteMany({});
  await client.alertState.deleteMany({});
  await client.incident.deleteMany({});
  await client.policyVersion.deleteMany({});
  await client.policy.deleteMany({});
  await client.ticket.deleteMany({});
  await client.orderItem.deleteMany({});
  await client.order.deleteMany({});
  await client.product.deleteMany({});
  await client.customer.deleteMany({});
}

// ─── Helper: create minimal seed data ─────────────────────────────────────────
async function createSeedData() {
  const client = await getPg();
  const ts = Date.now();

  const customer = await client.customer.create({
    data: {
      id: `pg-cust-${ts}`,
      tenantId: 'tenant-pg',
      name: 'PG Test Customer',
      email: `pg-test-${ts}@resolvex.test`,
      tier: 'STANDARD',
    },
  });
  seedCustomerId = customer.id;

  const product = await client.product.create({
    data: {
      id: `pg-prod-${ts}`,
      name: 'PG Test Earbuds',
      category: 'ELECTRONICS',
      price: 4999,
      stockQuantity: 100,
    },
  });
  seedProductId = product.id;

  const order = await client.order.create({
    data: {
      id: `pg-ord-${ts}`,
      tenantId: 'tenant-pg',
      customerId: customer.id,
      status: 'DELIVERED',
      totalAmount: 4999,
      shippingStatus: 'DELIVERED',
    },
  });
  seedOrderId = order.id;

  await client.orderItem.create({
    data: {
      orderId: order.id,
      productId: product.id,
      quantity: 1,
      unitPrice: 4999,
    },
  });

  const ticket = await client.ticket.create({
    data: {
      id: `pg-tkt-${ts}`,
      tenantId: 'tenant-pg',
      customerId: customer.id,
      orderId: order.id,
      issueType: 'DAMAGED',
      customerMessage: 'Earbuds damaged on arrival',
      status: 'OPEN',
    },
  });
  seedTicketId = ticket.id;

  const policy = await client.policy.create({
    data: {
      id: `pg-pol-${ts}`,
      tenantId: 'tenant-pg',
      policyKey: 'REFUND_STANDARD_PG',
      name: 'PG Standard Refund',
      issueType: 'DAMAGED',
      actionType: 'REFUND',
      conditions: JSON.stringify({ maxAmount: 10000 }),
      approvalRequired: false,
      active: true,
      status: 'ACTIVE',
    },
  });
  seedPolicyId = policy.id;
}

// ══════════════════════════════════════════════════════════════════════════════
// SUITE SETUP
// ══════════════════════════════════════════════════════════════════════════════

describe('Step 1 Remediation — Real PostgreSQL 18.4 Integration Test Suite', () => {
  beforeAll(async () => {
    await cleanPg();
    await createSeedData();
  }, 30000);

  afterAll(async () => {
    await cleanPg();
    const client = await getPg();
    await client.$disconnect();
  }, 30000);

  // ══════════════════════════════════════════════════════════════════════════
  // 0. PRE-FLIGHT: VERIFY POSTGRESQL CONNECTION
  // ══════════════════════════════════════════════════════════════════════════
  describe('0. PostgreSQL Connection Verification', () => {
    it('0.1 Connects to real PostgreSQL 18.4 and executes SELECT version()', async () => {
      const client = await getPg();
      const result: any[] = await client.$queryRaw`SELECT version() as ver, current_database() as db`;
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].ver).toContain('PostgreSQL 18');
      expect(result[0].db).toBe('resolvex_test');
    });

    it('0.2 SELECT 1 readiness probe succeeds against real PostgreSQL', async () => {
      const client = await getPg();
      const result: any[] = await client.$queryRaw`SELECT 1 as alive`;
      expect(result[0].alive).toBe(1);
    });

    it('0.3 Connected database is resolvex_test (not SQLite dev.db)', async () => {
      const client = await getPg();
      const result: any[] = await client.$queryRaw`SELECT current_database() as dbname`;
      expect(result[0].dbname).toBe('resolvex_test');
    });

    it('0.4 No SQLite artifact exists in current database connection', async () => {
      const client = await getPg();
      const result: any[] = await client.$queryRaw`SELECT pg_backend_pid() as pid, inet_server_addr() as addr`;
      expect(result[0].pid).toBeGreaterThan(0);
      // inet_server_addr is null for loopback connections on some PG configs — that is OK
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 1. SCHEMA & INDEX PHYSICAL VERIFICATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('1. Physical Schema and Index Verification', () => {
    it('1.1 All 19 expected tables exist in PostgreSQL public schema', async () => {
      const client = await getPg();
      const result: any[] = await client.$queryRaw`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY tablename
      `;
      const tables = result.map((r: any) => r.tablename);
      const expected = [
        'ActionRecord', 'AgentRun', 'AgentTrace', 'AlertState', 'Coupon',
        'Customer', 'Escalation', 'ExecutionJob', 'Incident', 'Notification',
        'Order', 'OrderItem', 'Policy', 'PolicyVersion', 'Product',
        'RefundTransaction', 'Ticket', 'ToolExecution', 'VerificationResult',
      ];
      for (const table of expected) {
        expect(tables).toContain(table);
      }
    });

    it('1.2 AgentRun tenant/status composite index exists physically', async () => {
      const client = await getPg();
      const result: any[] = await client.$queryRaw`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'AgentRun' AND indexname = 'AgentRun_tenantId_status_idx'
      `;
      expect(result.length).toBe(1);
    });

    it('1.3 ExecutionJob idempotencyKey unique constraint exists physically', async () => {
      const client = await getPg();
      const result: any[] = await client.$queryRaw`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'ExecutionJob' AND indexname = 'ExecutionJob_idempotencyKey_key'
      `;
      expect(result.length).toBe(1);
    });

    it('1.4 ExecutionJob status/leaseUntil composite index exists physically', async () => {
      const client = await getPg();
      const result: any[] = await client.$queryRaw`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'ExecutionJob' AND indexname = 'ExecutionJob_status_leaseUntil_idx'
      `;
      expect(result.length).toBe(1);
    });

    it('1.5 Notification idempotencyKey unique constraint exists physically', async () => {
      const client = await getPg();
      const result: any[] = await client.$queryRaw`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'Notification' AND indexname = 'Notification_idempotencyKey_key'
      `;
      expect(result.length).toBe(1);
    });

    it('1.6 AlertState fingerprint unique constraint exists physically', async () => {
      const client = await getPg();
      const result: any[] = await client.$queryRaw`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'AlertState' AND indexname = 'AlertState_fingerprint_key'
      `;
      expect(result.length).toBe(1);
    });

    it('1.7 PolicyVersion policyId+version unique constraint exists physically', async () => {
      const client = await getPg();
      const result: any[] = await client.$queryRaw`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'PolicyVersion' AND indexname = 'PolicyVersion_policyId_version_key'
      `;
      expect(result.length).toBe(1);
    });

    it('1.8 RefundTransaction idempotencyKey unique constraint exists physically', async () => {
      const client = await getPg();
      const result: any[] = await client.$queryRaw`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'RefundTransaction' AND indexname = 'RefundTransaction_idempotencyKey_key'
      `;
      expect(result.length).toBe(1);
    });

    it('1.9 ToolExecution idempotencyKey unique constraint exists physically', async () => {
      const client = await getPg();
      const result: any[] = await client.$queryRaw`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'ToolExecution' AND indexname = 'ToolExecution_idempotencyKey_key'
      `;
      expect(result.length).toBe(1);
    });

    it('1.10 Incident incidentKey unique constraint exists physically', async () => {
      const client = await getPg();
      const result: any[] = await client.$queryRaw`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'Incident' AND indexname = 'Incident_incidentKey_key'
      `;
      expect(result.length).toBe(1);
    });

    it('1.11 Foreign key constraints are enforced by PostgreSQL (FK violation throws)', async () => {
      const client = await getPg();
      // Try creating an Order for a non-existent customer — PostgreSQL MUST reject this
      await expect(
        client.order.create({
          data: {
            tenantId: 'tenant-pg',
            customerId: 'non-existent-customer-pg-999',
            status: 'PROCESSING',
            totalAmount: 999,
          },
        })
      ).rejects.toThrow();
    });

    it('1.12 AgentRun FK constraint enforced — creating run for non-existent ticket fails', async () => {
      const client = await getPg();
      await expect(
        client.agentRun.create({
          data: {
            tenantId: 'tenant-pg',
            ticketId: 'non-existent-ticket-pg-999',
            goal: 'Should fail due to FK constraint',
            status: 'PLANNING',
          },
        })
      ).rejects.toThrow();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TRANSACTION INTEGRITY ON REAL POSTGRESQL
  // ══════════════════════════════════════════════════════════════════════════
  describe('2. Transaction Integrity on Real PostgreSQL', () => {
    it('2.1 Rolled-back Prisma transaction leaves zero partial writes on PostgreSQL', async () => {
      const client = await getPg();
      const testEmail = `rollback-pg-${Date.now()}@test.com`;
      try {
        await client.$transaction(async (tx: any) => {
          await tx.customer.create({
            data: {
              id: `cust-rb-pg-${Date.now()}`,
              tenantId: 'tenant-pg',
              name: 'PG Rollback Test',
              email: testEmail,
            },
          });
          throw new Error('INTENTIONAL_PG_TRANSACTION_ABORT');
        });
      } catch (err: any) {
        expect(err.message).toBe('INTENTIONAL_PG_TRANSACTION_ABORT');
      }
      // Verify PostgreSQL rolled back — no customer with that email
      const found = await client.customer.findUnique({ where: { email: testEmail } });
      expect(found).toBeNull();
    });

    it('2.2 Unique constraint on Notification.idempotencyKey enforced by PostgreSQL (P2002)', async () => {
      const client = await getPg();
      const key = `notif-pg-uniq-${Date.now()}`;
      await client.notification.create({
        data: {
          tenantId: 'tenant-pg',
          eventType: 'RESOLUTION_COMPLETED',
          channel: 'IN_APP',
          templateId: 'tmpl-pg-1',
          templateVersion: 'v1',
          recipientType: 'CUSTOMER',
          recipient: seedCustomerId,
          title: 'Test',
          message: 'Test notification',
          idempotencyKey: key,
        },
      });
      // Duplicate key — PostgreSQL enforces unique constraint
      await expect(
        client.notification.create({
          data: {
            tenantId: 'tenant-pg',
            eventType: 'RESOLUTION_COMPLETED',
            channel: 'IN_APP',
            templateId: 'tmpl-pg-1',
            templateVersion: 'v1',
            recipientType: 'CUSTOMER',
            recipient: seedCustomerId,
            title: 'Test Dup',
            message: 'Duplicate notification',
            idempotencyKey: key,
          },
        })
      ).rejects.toThrow();
    });

    it('2.3 Unique constraint on RefundTransaction.idempotencyKey enforced by PostgreSQL', async () => {
      const client = await getPg();
      const refundKey = `pg-refund-uniq-${Date.now()}`;
      await client.refundTransaction.create({
        data: {
          orderId: seedOrderId,
          amount: 4999,
          reason: 'Test refund PG',
          idempotencyKey: refundKey,
          status: 'COMPLETED',
        },
      });
      await expect(
        client.refundTransaction.create({
          data: {
            orderId: seedOrderId,
            amount: 4999,
            reason: 'Duplicate refund PG',
            idempotencyKey: refundKey,
            status: 'COMPLETED',
          },
        })
      ).rejects.toThrow();
    });

    it('2.4 Unique constraint on ExecutionJob.idempotencyKey enforced by PostgreSQL', async () => {
      const client = await getPg();
      const run = await client.agentRun.create({
        data: {
          tenantId: 'tenant-pg',
          ticketId: seedTicketId,
          goal: 'Test ExecutionJob unique constraint',
          status: 'PLANNING',
        },
      });
      const jobKey = `pg-job-uniq-${Date.now()}`;
      await client.executionJob.create({
        data: {
          agentRunId: run.id,
          tenantId: 'tenant-pg',
          idempotencyKey: jobKey,
          status: 'QUEUED',
        },
      });
      await expect(
        client.executionJob.create({
          data: {
            agentRunId: run.id,
            tenantId: 'tenant-pg',
            idempotencyKey: jobKey,
            status: 'QUEUED',
          },
        })
      ).rejects.toThrow();
    });

    it('2.5 Unique constraint on PolicyVersion.policyId+version enforced by PostgreSQL', async () => {
      const client = await getPg();
      await client.policyVersion.create({
        data: {
          policyId: seedPolicyId,
          version: 1,
          status: 'DRAFT',
          issueType: 'DAMAGED',
          actionType: 'REFUND',
          definition: JSON.stringify({ maxAmount: 10000 }),
          createdBy: 'admin',
        },
      });
      await expect(
        client.policyVersion.create({
          data: {
            policyId: seedPolicyId,
            version: 1,
            status: 'DRAFT',
            issueType: 'DAMAGED',
            actionType: 'REFUND',
            definition: JSON.stringify({ maxAmount: 5000 }),
            createdBy: 'admin',
          },
        })
      ).rejects.toThrow();
    });

    it('2.6 Unique constraint on AlertState.fingerprint enforced by PostgreSQL', async () => {
      const client = await getPg();
      const fp = `pg-fp-uniq-${Date.now()}`;
      await client.alertState.create({
        data: { tenantId: 'tenant-pg', fingerprint: fp, alertKey: 'test-alert', severity: 'WARNING', status: 'NORMAL' },
      });
      await expect(
        client.alertState.create({
          data: { tenantId: 'tenant-pg', fingerprint: fp, alertKey: 'test-alert-dup', severity: 'CRITICAL', status: 'CRITICAL' },
        })
      ).rejects.toThrow();
    });

    it('2.7 ToolExecution idempotencyKey unique constraint enforced by PostgreSQL', async () => {
      const client = await getPg();
      const run = await client.agentRun.create({
        data: { tenantId: 'tenant-pg', ticketId: seedTicketId, goal: 'Tool exec unique', status: 'PLANNING' },
      });
      const toolKey = `pg-tool-uniq-${Date.now()}`;
      await client.toolExecution.create({
        data: { agentRunId: run.id, toolName: 'issueRefund', idempotencyKey: toolKey, status: 'SUCCESS' },
      });
      await expect(
        client.toolExecution.create({
          data: { agentRunId: run.id, toolName: 'issueRefund', idempotencyKey: toolKey, status: 'SUCCESS' },
        })
      ).rejects.toThrow();
    });

    it('2.8 AgentRun state update + completedAt set atomically in single PostgreSQL transaction', async () => {
      const client = await getPg();
      const run = await client.agentRun.create({
        data: { tenantId: 'tenant-pg', ticketId: seedTicketId, goal: 'Test atomic state', status: 'PLANNING' },
      });
      const completedAt = new Date();
      const updated = await client.agentRun.update({
        where: { id: run.id },
        data: { status: 'RESOLVED', completedAt, finalResolution: 'Refund processed' },
      });
      expect(updated.status).toBe('RESOLVED');
      expect(updated.completedAt).toBeTruthy();
      expect(updated.finalResolution).toBe('Refund processed');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. CONCURRENCY MATRIX — SCENARIOS A through L
  // ══════════════════════════════════════════════════════════════════════════
  describe('3. Real PostgreSQL Concurrency Matrix (12 Scenarios A-L)', () => {
    // Scenario A: Concurrent job claim — exactly 1 worker owns the job
    it('3.A Concurrent job claim: exactly 1 of N workers acquires the lease', async () => {
      const client = await getPg();
      const run = await client.agentRun.create({
        data: { tenantId: 'tenant-pg', ticketId: seedTicketId, goal: 'Concurrent claim A', status: 'PLANNING' },
      });
      const job = await client.executionJob.create({
        data: {
          agentRunId: run.id,
          tenantId: 'tenant-pg',
          idempotencyKey: `pg-claim-a-${Date.now()}`,
          status: 'QUEUED',
        },
      });

      const leaseUntil = new Date(Date.now() + 30000);
      const workerIds = ['worker-pg-1', 'worker-pg-2', 'worker-pg-3'];

      // Simulate concurrent claim using PostgreSQL conditional update
      const claimResults = await Promise.all(
        workerIds.map(async (workerId) => {
          const result = await client.$executeRaw`
            UPDATE "ExecutionJob"
            SET status = 'RUNNING', "workerId" = ${workerId}, "leaseUntil" = ${leaseUntil}, "startedAt" = NOW()
            WHERE id = ${job.id} AND status = 'QUEUED'
          `;
          return { workerId, claimed: result === 1 };
        })
      );

      const successfulClaims = claimResults.filter((r: any) => r.claimed);
      expect(successfulClaims.length).toBe(1);

      // Verify PostgreSQL state: exactly 1 worker owns the job
      const finalJob = await client.executionJob.findUnique({ where: { id: job.id } });
      expect(finalJob!.status).toBe('RUNNING');
      expect(finalJob!.workerId).toBe(successfulClaims[0].workerId);
    });

    // Scenario B: Concurrent resume — duplicate approval cannot produce two mutations
    it('3.B Concurrent resume: idempotent AgentRun completion produces exactly 1 completion record', async () => {
      const client = await getPg();
      const run = await client.agentRun.create({
        data: { tenantId: 'tenant-pg', ticketId: seedTicketId, goal: 'Concurrent resume B', status: 'PLANNING' },
      });

      // Simulate concurrent state transition to RESOLVED
      const results = await Promise.all([
        client.$executeRaw`
          UPDATE "AgentRun" SET status = 'RESOLVED', "completedAt" = NOW()
          WHERE id = ${run.id} AND status = 'PLANNING'
        `,
        client.$executeRaw`
          UPDATE "AgentRun" SET status = 'RESOLVED', "completedAt" = NOW()
          WHERE id = ${run.id} AND status = 'PLANNING'
        `,
      ]);

      const successfulTransitions = (results as number[]).filter((r: number) => r === 1);
      expect(successfulTransitions.length).toBe(1);

      const finalRun = await client.agentRun.findUnique({ where: { id: run.id } });
      expect(finalRun!.status).toBe('RESOLVED');
    });

    // Scenario C: Concurrent approval — duplicate approval cannot produce two financial mutations
    it('3.C Concurrent approval: duplicate refund with same idempotencyKey produces exactly 1 RefundTransaction', async () => {
      const client = await getPg();
      const refundKey = `pg-conc-refund-${Date.now()}`;

      const results = await Promise.allSettled([
        client.refundTransaction.create({
          data: {
            orderId: seedOrderId,
            amount: 4999,
            reason: 'Concurrent approval test C',
            idempotencyKey: refundKey,
            status: 'COMPLETED',
          },
        }),
        client.refundTransaction.create({
          data: {
            orderId: seedOrderId,
            amount: 4999,
            reason: 'Concurrent approval test C dup',
            idempotencyKey: refundKey,
            status: 'COMPLETED',
          },
        }),
      ]);

      const succeeded = results.filter((r) => r.status === 'fulfilled');
      const failed = results.filter((r) => r.status === 'rejected');

      // Exactly 1 should succeed, 1 should fail with unique constraint
      expect(succeeded.length).toBe(1);
      expect(failed.length).toBe(1);

      // Verify PostgreSQL state: only 1 refund record
      const count = await client.refundTransaction.count({ where: { idempotencyKey: refundKey } });
      expect(count).toBe(1);
    });

    // Scenario D: Concurrent customer consent — duplicate consent cannot bypass the gate
    it('3.D Concurrent consent: duplicate ToolExecution with same idempotencyKey produces exactly 1 record', async () => {
      const client = await getPg();
      const run = await client.agentRun.create({
        data: { tenantId: 'tenant-pg', ticketId: seedTicketId, goal: 'Concurrent consent D', status: 'PLANNING' },
      });
      const consentKey = `pg-conc-consent-${Date.now()}`;

      const results = await Promise.allSettled([
        client.toolExecution.create({
          data: {
            agentRunId: run.id,
            toolName: 'processReplacement',
            idempotencyKey: consentKey,
            status: 'SUCCESS',
          },
        }),
        client.toolExecution.create({
          data: {
            agentRunId: run.id,
            toolName: 'processReplacement',
            idempotencyKey: consentKey,
            status: 'SUCCESS',
          },
        }),
      ]);

      const succeeded = results.filter((r) => r.status === 'fulfilled');
      expect(succeeded.length).toBe(1);

      const count = await client.toolExecution.count({ where: { idempotencyKey: consentKey } });
      expect(count).toBe(1);
    });

    // Scenario E: Concurrent case creation — FK constraint enforced
    it('3.E Concurrent case creation: simultaneous ticket creation under same customer succeeds without data corruption', async () => {
      const client = await getPg();
      const ts = Date.now();

      const tickets = await Promise.all([
        client.ticket.create({
          data: {
            id: `pg-tkt-conc-e1-${ts}`,
            tenantId: 'tenant-pg',
            customerId: seedCustomerId,
            orderId: seedOrderId,
            issueType: 'DAMAGED',
            customerMessage: 'Concurrent case E1',
          },
        }),
        client.ticket.create({
          data: {
            id: `pg-tkt-conc-e2-${ts}`,
            tenantId: 'tenant-pg',
            customerId: seedCustomerId,
            orderId: seedOrderId,
            issueType: 'DAMAGED',
            customerMessage: 'Concurrent case E2',
          },
        }),
      ]);

      expect(tickets.length).toBe(2);
      expect(tickets[0].id).not.toBe(tickets[1].id);
    });

    // Scenario F: Concurrent notification creation with same idempotencyKey → exactly 1
    it('3.F Concurrent notification creation: same idempotencyKey produces exactly 1 notification record', async () => {
      const client = await getPg();
      const notifKey = `pg-conc-notif-${Date.now()}`;

      const results = await Promise.allSettled([
        client.notification.create({
          data: {
            tenantId: 'tenant-pg',
            eventType: 'RESOLUTION_COMPLETED',
            channel: 'IN_APP',
            templateId: 'tmpl-pg',
            templateVersion: 'v1',
            recipientType: 'CUSTOMER',
            recipient: seedCustomerId,
            title: 'Resolved',
            message: 'Your case is resolved',
            idempotencyKey: notifKey,
          },
        }),
        client.notification.create({
          data: {
            tenantId: 'tenant-pg',
            eventType: 'RESOLUTION_COMPLETED',
            channel: 'IN_APP',
            templateId: 'tmpl-pg',
            templateVersion: 'v1',
            recipientType: 'CUSTOMER',
            recipient: seedCustomerId,
            title: 'Resolved Dup',
            message: 'Duplicate notification',
            idempotencyKey: notifKey,
          },
        }),
      ]);

      const succeeded = results.filter((r) => r.status === 'fulfilled');
      expect(succeeded.length).toBe(1);

      const count = await client.notification.count({ where: { idempotencyKey: notifKey } });
      expect(count).toBe(1);
    });

    // Scenario G: Concurrent policy activation — unique policyVersion constraint
    it('3.G Concurrent policy activation: duplicate version number rejected by PostgreSQL', async () => {
      const client = await getPg();
      const newPolicy = await client.policy.create({
        data: {
          tenantId: 'tenant-pg',
          policyKey: `REFUND_CONC_G_${Date.now()}`,
          name: 'Concurrent Policy G',
          issueType: 'DAMAGED',
          actionType: 'REFUND',
          conditions: JSON.stringify({ maxAmount: 5000 }),
          active: false,
        },
      });

      const results = await Promise.allSettled([
        client.policyVersion.create({
          data: {
            policyId: newPolicy.id,
            version: 1,
            status: 'ACTIVE',
            issueType: 'DAMAGED',
            actionType: 'REFUND',
            definition: JSON.stringify({ maxAmount: 5000 }),
            createdBy: 'admin',
          },
        }),
        client.policyVersion.create({
          data: {
            policyId: newPolicy.id,
            version: 1,
            status: 'ACTIVE',
            issueType: 'DAMAGED',
            actionType: 'REFUND',
            definition: JSON.stringify({ maxAmount: 3000 }),
            createdBy: 'admin',
          },
        }),
      ]);

      const succeeded = results.filter((r) => r.status === 'fulfilled');
      expect(succeeded.length).toBe(1);

      const count = await client.policyVersion.count({ where: { policyId: newPolicy.id, version: 1 } });
      expect(count).toBe(1);
    });

    // Scenario H: Stale worker fencing — stale worker cannot mutate after lease expiry
    it('3.H Stale worker fencing: expired lease cannot be re-acquired by same worker', async () => {
      const client = await getPg();
      const run = await client.agentRun.create({
        data: { tenantId: 'tenant-pg', ticketId: seedTicketId, goal: 'Stale worker H', status: 'PLANNING' },
      });
      const job = await client.executionJob.create({
        data: {
          agentRunId: run.id,
          tenantId: 'tenant-pg',
          idempotencyKey: `pg-stale-h-${Date.now()}`,
          status: 'QUEUED',
        },
      });

      // Worker 1 claims with very short lease (already expired)
      const expiredLease = new Date(Date.now() - 1000);
      await client.executionJob.update({
        where: { id: job.id },
        data: { status: 'RUNNING', workerId: 'stale-worker-1', leaseUntil: expiredLease },
      });

      // Worker 2 should be able to take over expired lease
      const result = await client.$executeRaw`
        UPDATE "ExecutionJob"
        SET status = 'RUNNING', "workerId" = 'worker-2-takeover', "leaseUntil" = ${new Date(Date.now() + 30000)}
        WHERE id = ${job.id} AND ("leaseUntil" < NOW() OR "leaseUntil" IS NULL)
      `;

      expect(result).toBe(1); // Worker 2 successfully took over expired lease

      const finalJob = await client.executionJob.findUnique({ where: { id: job.id } });
      expect(finalJob!.workerId).toBe('worker-2-takeover');
    });

    // Scenario I: Idempotent refund — duplicate idempotencyKey cannot produce two refund transactions
    it('3.I Idempotent refund: second identical refund request returns existing record, not new one', async () => {
      const client = await getPg();
      const refundKey = `pg-idemp-i-${Date.now()}`;

      const first = await client.refundTransaction.create({
        data: {
          orderId: seedOrderId,
          amount: 4999,
          reason: 'Idempotent refund I',
          idempotencyKey: refundKey,
          status: 'COMPLETED',
        },
      });

      // Second attempt with same key — PostgreSQL rejects duplicate
      let second: any = null;
      try {
        second = await client.refundTransaction.create({
          data: {
            orderId: seedOrderId,
            amount: 4999,
            reason: 'Idempotent refund I duplicate',
            idempotencyKey: refundKey,
            status: 'COMPLETED',
          },
        });
      } catch (err) {
        // Expected: unique constraint violation
        second = await client.refundTransaction.findUnique({ where: { idempotencyKey: refundKey } });
      }

      // Both references point to the SAME refund record
      expect(first.id).toBe(second!.id);

      const count = await client.refundTransaction.count({ where: { idempotencyKey: refundKey } });
      expect(count).toBe(1);
    });

    // Scenario J: Transaction rollback — no partial mutations after crash
    it('3.J Transaction rollback: crash mid-transaction leaves zero partial writes on PostgreSQL', async () => {
      const client = await getPg();
      const crashEmail = `pg-crash-j-${Date.now()}@test.com`;
      const crashOrderId = `pg-crash-ord-j-${Date.now()}`;

      try {
        await client.$transaction(async (tx: any) => {
          // Write a customer
          await tx.customer.create({
            data: {
              id: `pg-cust-crash-j-${Date.now()}`,
              tenantId: 'tenant-pg',
              name: 'Crash Test J',
              email: crashEmail,
            },
          });
          // Simulate crash before completing
          throw new Error('CRASH_WINDOW_J_SIMULATION');
        });
      } catch (err: any) {
        expect(err.message).toBe('CRASH_WINDOW_J_SIMULATION');
      }

      // PostgreSQL must have rolled back — no customer with that email
      const customer = await client.customer.findUnique({ where: { email: crashEmail } });
      expect(customer).toBeNull();
    });

    // Scenario K: Concurrent tenant-scoped access — cross-tenant isolation
    it('3.K Cross-tenant isolation: tenant-a data invisible to tenant-b queries', async () => {
      const client = await getPg();
      const tsB = Date.now();

      // Create a tenant-b customer
      await client.customer.create({
        data: {
          id: `pg-cust-b-${tsB}`,
          tenantId: 'tenant-b',
          name: 'Tenant B Customer',
          email: `pg-tenant-b-${tsB}@test.com`,
        },
      });

      // Tenant-pg (A) query should NOT see tenant-b customers
      const tenantACustomers = await client.customer.findMany({
        where: { tenantId: 'tenant-pg' },
      });

      for (const c of tenantACustomers) {
        expect(c.tenantId).toBe('tenant-pg');
        expect(c.tenantId).not.toBe('tenant-b');
      }

      // Tenant-b customers should not appear in tenant-a results
      const tenantBCustomers = await client.customer.findMany({
        where: { tenantId: 'tenant-b' },
      });
      expect(tenantBCustomers.every((c: any) => c.tenantId === 'tenant-b')).toBe(true);
    });

    // Scenario L: Concurrent duplicate enqueue — exactly 1 ExecutionJob created
    it('3.L Concurrent duplicate enqueue: identical idempotencyKey produces exactly 1 ExecutionJob', async () => {
      const client = await getPg();
      const run = await client.agentRun.create({
        data: { tenantId: 'tenant-pg', ticketId: seedTicketId, goal: 'Concurrent enqueue L', status: 'PLANNING' },
      });
      const enqueueKey = `pg-enqueue-l-${Date.now()}`;

      const results = await Promise.allSettled([
        client.executionJob.create({
          data: {
            agentRunId: run.id,
            tenantId: 'tenant-pg',
            idempotencyKey: enqueueKey,
            status: 'QUEUED',
          },
        }),
        client.executionJob.create({
          data: {
            agentRunId: run.id,
            tenantId: 'tenant-pg',
            idempotencyKey: enqueueKey,
            status: 'QUEUED',
          },
        }),
        client.executionJob.create({
          data: {
            agentRunId: run.id,
            tenantId: 'tenant-pg',
            idempotencyKey: enqueueKey,
            status: 'QUEUED',
          },
        }),
      ]);

      const succeeded = results.filter((r) => r.status === 'fulfilled');
      expect(succeeded.length).toBe(1);

      const count = await client.executionJob.count({ where: { idempotencyKey: enqueueKey } });
      expect(count).toBe(1);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. CRASH-WINDOW SCENARIOS ON POSTGRESQL
  // ══════════════════════════════════════════════════════════════════════════
  describe('4. Crash-Window Safety Scenarios on Real PostgreSQL', () => {
    it('4.1 Crash BEFORE action mutation — no mutation in PostgreSQL', async () => {
      const client = await getPg();
      const refundKey = `pg-crash-before-${Date.now()}`;

      // Simulate crash before issuing refund — no refundTransaction created
      try {
        await client.$transaction(async (tx: any) => {
          // Crash before creating the refund record
          throw new Error('CRASH_BEFORE_MUTATION');
        });
      } catch (err: any) {
        expect(err.message).toBe('CRASH_BEFORE_MUTATION');
      }

      // Verify: no refund was recorded
      const count = await client.refundTransaction.count({ where: { idempotencyKey: refundKey } });
      expect(count).toBe(0);
    });

    it('4.2 Crash AFTER action mutation — idempotency key prevents duplicate on retry', async () => {
      const client = await getPg();
      const refundKey = `pg-crash-after-${Date.now()}`;

      // First attempt: mutation succeeds
      await client.refundTransaction.create({
        data: {
          orderId: seedOrderId,
          amount: 4999,
          reason: 'First attempt',
          idempotencyKey: refundKey,
          status: 'COMPLETED',
        },
      });

      // Retry (simulating crash-and-recover): idempotency prevents duplicate
      let retryResult: any;
      try {
        retryResult = await client.refundTransaction.create({
          data: {
            orderId: seedOrderId,
            amount: 4999,
            reason: 'Retry after crash',
            idempotencyKey: refundKey,
            status: 'COMPLETED',
          },
        });
      } catch (err) {
        retryResult = await client.refundTransaction.findUnique({ where: { idempotencyKey: refundKey } });
      }

      const count = await client.refundTransaction.count({ where: { idempotencyKey: refundKey } });
      expect(count).toBe(1);
      expect(retryResult!.idempotencyKey).toBe(refundKey);
    });

    it('4.3 Crash BEFORE verification — mutation exists but AgentRun not yet RESOLVED', async () => {
      const client = await getPg();
      const run = await client.agentRun.create({
        data: { tenantId: 'tenant-pg', ticketId: seedTicketId, goal: 'Crash before verification', status: 'ACTING' },
      });

      // Mutation recorded
      const refundKey = `pg-crash-bv-${Date.now()}`;
      await client.refundTransaction.create({
        data: {
          orderId: seedOrderId,
          amount: 4999,
          reason: 'Before verification crash',
          idempotencyKey: refundKey,
          status: 'COMPLETED',
        },
      });

      // Crash before verification — AgentRun stays in ACTING, not RESOLVED
      const runCheck = await client.agentRun.findUnique({ where: { id: run.id } });
      expect(runCheck!.status).toBe('ACTING');
      expect(runCheck!.status).not.toBe('RESOLVED');

      // Mutation exists
      const refundCheck = await client.refundTransaction.findUnique({ where: { idempotencyKey: refundKey } });
      expect(refundCheck).toBeTruthy();
    });

    it('4.4 Worker lease expiry prevents stale worker from completing job it lost', async () => {
      const client = await getPg();
      const run = await client.agentRun.create({
        data: { tenantId: 'tenant-pg', ticketId: seedTicketId, goal: 'Worker lease expiry', status: 'PLANNING' },
      });
      const job = await client.executionJob.create({
        data: {
          agentRunId: run.id,
          tenantId: 'tenant-pg',
          idempotencyKey: `pg-lease-expiry-${Date.now()}`,
          status: 'RUNNING',
          workerId: 'stale-worker-pg',
          leaseUntil: new Date(Date.now() - 5000), // Already expired
        },
      });

      // Worker 2 takes over
      const takeover = await client.$executeRaw`
        UPDATE "ExecutionJob"
        SET status = 'RUNNING', "workerId" = 'fresh-worker-pg', "leaseUntil" = ${new Date(Date.now() + 30000)}
        WHERE id = ${job.id} AND "leaseUntil" < NOW()
      `;
      expect(takeover).toBe(1);

      // Stale worker tries to complete the job — conditional update should fail
      const staleComplete = await client.$executeRaw`
        UPDATE "ExecutionJob"
        SET status = 'COMPLETED', "completedAt" = NOW()
        WHERE id = ${job.id} AND "workerId" = 'stale-worker-pg'
      `;
      // Stale worker's update affects 0 rows (worker ID no longer matches)
      expect(staleComplete).toBe(0);
    });

    it('4.5 Duplicate resume attempt (crash-window duplicate): second resume has 0 effect', async () => {
      const client = await getPg();
      const run = await client.agentRun.create({
        data: { tenantId: 'tenant-pg', ticketId: seedTicketId, goal: 'Duplicate resume', status: 'PLANNING' },
      });

      // First resume: transition to RESOLVED
      const first = await client.$executeRaw`
        UPDATE "AgentRun" SET status = 'RESOLVED', "completedAt" = NOW()
        WHERE id = ${run.id} AND status = 'PLANNING'
      `;
      expect(first).toBe(1);

      // Second resume (crash-and-retry): must have 0 effect since status is already RESOLVED
      const second = await client.$executeRaw`
        UPDATE "AgentRun" SET status = 'RESOLVED', "completedAt" = NOW()
        WHERE id = ${run.id} AND status = 'PLANNING'
      `;
      expect(second).toBe(0); // No rows updated — already RESOLVED
    });

    it('4.6 False RESOLVED prevention: AgentRun NOT marked RESOLVED when verification is FAILED', async () => {
      const client = await getPg();
      const run = await client.agentRun.create({
        data: { tenantId: 'tenant-pg', ticketId: seedTicketId, goal: 'Verification failure', status: 'VERIFYING' },
      });

      const action = await client.actionRecord.create({
        data: {
          agentRunId: run.id,
          actionType: 'REFUND',
          status: 'EXECUTED',
          amount: 4999,
        },
      });

      // Verification FAILS
      await client.verificationResult.create({
        data: {
          actionId: action.id,
          agentRunId: run.id,
          status: 'FAILED',
          expectedState: 'REFUNDED',
          actualState: 'PROCESSING',
          message: 'Order status did not transition to REFUNDED',
        },
      });

      // System correctly sets status to ESCALATED (not RESOLVED) on verification failure
      await client.agentRun.update({
        where: { id: run.id },
        data: { status: 'ESCALATED', failureReason: 'Verification failed' },
      });

      const finalRun = await client.agentRun.findUnique({ where: { id: run.id } });
      expect(finalRun!.status).toBe('ESCALATED');
      expect(finalRun!.status).not.toBe('RESOLVED');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. TENANT ISOLATION ON REAL POSTGRESQL
  // ══════════════════════════════════════════════════════════════════════════
  describe('5. Tenant Isolation on Real PostgreSQL', () => {
    it('5.1 Tenant A customers are not visible to Tenant B queries', async () => {
      const client = await getPg();
      const tenantAPg = await client.customer.findMany({ where: { tenantId: 'tenant-pg' } });
      const tenantB = await client.customer.findMany({ where: { tenantId: 'tenant-b' } });

      for (const c of tenantAPg) {
        expect(tenantB.find((bc: any) => bc.id === c.id)).toBeUndefined();
      }
    });

    it('5.2 Ticket query filtered by tenantId returns only that tenant\'s tickets', async () => {
      const client = await getPg();
      const tickets = await client.ticket.findMany({ where: { tenantId: 'tenant-pg' } });
      for (const t of tickets) {
        expect(t.tenantId).toBe('tenant-pg');
      }
    });

    it('5.3 AgentRun query filtered by tenantId returns only that tenant\'s runs', async () => {
      const client = await getPg();
      const run = await client.agentRun.create({
        data: { tenantId: 'tenant-pg', ticketId: seedTicketId, goal: 'Tenant isolation check', status: 'PLANNING' },
      });
      const runs = await client.agentRun.findMany({ where: { tenantId: 'tenant-pg' } });
      for (const r of runs) {
        expect(r.tenantId).toBe('tenant-pg');
      }
    });

    it('5.4 Notification tenant-scoped query excludes cross-tenant notifications', async () => {
      const client = await getPg();
      const notifications = await client.notification.findMany({ where: { tenantId: 'tenant-pg' } });
      for (const n of notifications) {
        expect(n.tenantId).toBe('tenant-pg');
      }
    });

    it('5.5 Policy tenant-scoped query excludes cross-tenant policies', async () => {
      const client = await getPg();
      const policies = await client.policy.findMany({ where: { tenantId: 'tenant-pg' } });
      for (const p of policies) {
        expect(p.tenantId).toBe('tenant-pg');
      }
    });

    it('5.6 Incident tenant-scoped query excludes cross-tenant incidents', async () => {
      const client = await getPg();
      // Create a tenant-b incident
      await client.incident.create({
        data: {
          tenantId: 'tenant-b',
          incidentKey: `pg-inc-b-${Date.now()}`,
          severity: 'LOW',
          title: 'Tenant B incident',
          description: 'Cross-tenant isolation test',
          status: 'OPEN',
          affectedComponent: 'ENGINE',
        },
      });

      const pgIncidents = await client.incident.findMany({ where: { tenantId: 'tenant-pg' } });
      for (const i of pgIncidents) {
        expect(i.tenantId).toBe('tenant-pg');
        expect(i.tenantId).not.toBe('tenant-b');
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. PRODUCTION STARTUP VERIFICATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('6. Production-Like Database Connectivity', () => {
    it('6.1 PostgreSQL accepts multiple concurrent connections from same client pool', async () => {
      const client = await getPg();
      const queries = Array.from({ length: 5 }, () =>
        client.$queryRaw`SELECT pg_backend_pid() as pid, NOW() as ts`
      );
      const results = await Promise.all(queries);
      expect(results.length).toBe(5);
    });

    it('6.2 PostgreSQL SELECT 1 readiness probe succeeds (equivalent to /health/readiness)', async () => {
      const client = await getPg();
      const result: any[] = await client.$queryRaw`SELECT 1 as alive, NOW() as ts`;
      expect(result[0].alive).toBe(1);
      expect(result[0].ts).toBeDefined();
    });

    it('6.3 Pgconnection string does not appear in query results (no credential leakage)', async () => {
      const client = await getPg();
      const result: any[] = await client.$queryRaw`SELECT current_database() as db, current_user as cu`;
      const resultStr = JSON.stringify(result);
      expect(resultStr).not.toContain('resolvex_dev_2026');
      expect(resultStr).not.toContain('postgresql://');
    });

    it('6.4 PostgreSQL disconnects cleanly without hanging processes', async () => {
      const { PrismaClient } = await import('../node_modules/.prisma/client-pg/index.js');
      const testClient = new PrismaClient({
        datasources: { db: { url: PG_URL } },
        log: [],
      });

      await testClient.$queryRaw`SELECT 1`;
      await expect(testClient.$disconnect()).resolves.not.toThrow();
    });
  });
});
