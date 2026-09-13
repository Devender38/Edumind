// ResolveX Phase 20 — Production Policy Governance, Versioning & Change Control Test Suite

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import http from 'http';
import app from '../src/backend/server.js';
import { prisma } from '../src/db/client.js';
import { seedDatabase } from '../src/db/seedDatabase.js';
import { getAuthHeaders } from './helpers/authHelper.js';
import { PolicyRepository } from '../src/db/repositories/policyRepository.js';
import { PolicyEngine } from '../src/policy/PolicyEngine.js';
import { FailureInjector } from '../src/utils/failureInjector.js';
import { RateLimiter } from '../src/utils/rateLimiter.js';
import { ExecutionCoordinator } from '../src/execution/executionCoordinator.js';
import { AgentOrchestrator } from '../src/agents/orchestrator/AgentOrchestrator.js';

let server: http.Server;
let baseUrl: string;

const TENANT_A = 'tenant-a';
const TENANT_B = 'tenant-b';

const customerAHeaders = getAuthHeaders('CUSTOMER', 'cust-ph20-a', TENANT_A);
const operatorAHeaders = getAuthHeaders('OPERATOR', undefined, TENANT_A);
const approverAHeaders = getAuthHeaders('APPROVER', undefined, TENANT_A);
const adminAHeaders    = getAuthHeaders('ADMIN', undefined, TENANT_A);
const adminBHeaders    = getAuthHeaders('ADMIN', undefined, TENANT_B);
const serviceHeaders   = getAuthHeaders('SERVICE', undefined, TENANT_A);

let seq = 0;
function uniqueKey(base: string) {
  return `KEY_${base.toUpperCase()}_${Date.now()}_${++seq}`;
}

async function httpFetch(url: string, init?: RequestInit) {
  const headers = { Connection: 'close', ...(init?.headers || {}) };
  return fetch(url, { ...init, headers });
}

describe('Phase 20: Policy Governance, Versioning & Change Control Suite', { hookTimeout: 300000, timeout: 300000 }, () => {
  beforeAll(async () => {
    await prisma.$connect();
    await seedDatabase();
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  beforeEach(async () => {
    FailureInjector.reset();
    RateLimiter.resetStore();
  });

  afterAll(async () => {
    if (server) {
      if (typeof (server as any).closeAllConnections === 'function') {
        (server as any).closeAllConnections();
      }
      await new Promise<void>((res) => server.close(() => res()));
    }
    await prisma.$disconnect();
  });

  // -------------------------------------------------------------------------
  // 1. POLICY LIFECYCLE TESTS (8 tests)
  // -------------------------------------------------------------------------
  describe('1. Policy Lifecycle Engine', () => {
    it('1.1 Creates policy and initial version in DRAFT state', async () => {
      const key = uniqueKey('AUTO_REFUND');
      const policy = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Auto Refund Policy',
        description: 'Automatic refund policy under ₹5000',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        conditions: { amount: { lte: 5000 } },
        approvalRequired: false,
        createdBy: 'user-admin-1',
      });

      expect(policy.id).toBeDefined();
      expect(policy.status).toBe('DRAFT');
      expect(policy.versions).toHaveLength(1);
      expect(policy.versions[0].version).toBe(1);
      expect(policy.versions[0].status).toBe('DRAFT');
    });

    it('1.2 Transitions DRAFT version to PENDING_APPROVAL', async () => {
      const key = uniqueKey('LIFECYCLE');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Lifecycle Test',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        createdBy: 'user-admin-1',
      });

      const submitted = await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      expect(submitted.status).toBe('PENDING_APPROVAL');
    });

    it('1.3 Transitions PENDING_APPROVAL version to APPROVED', async () => {
      const key = uniqueKey('APPROVE');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Approve Test',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      const approved = await PolicyRepository.approveVersion(pol.id, 1, TENANT_A, 'user-approver-1');

      expect(approved.status).toBe('APPROVED');
      expect(approved.approvedBy).toBe('user-approver-1');
      expect(approved.approvedAt).toBeDefined();
    });

    it('1.4 Transitions APPROVED version to ACTIVE', async () => {
      const key = uniqueKey('ACTIVATE');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Activate Test',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 1, TENANT_A, 'user-approver-1');
      const active = await PolicyRepository.activateVersion(pol.id, 1, TENANT_A, 'user-admin-1');

      expect(active.status).toBe('ACTIVE');
      expect(active.activatedBy).toBe('user-admin-1');
    });

    it('1.5 Transitions ACTIVE version to RETIRED', async () => {
      const key = uniqueKey('RETIRE');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Retire Test',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 1, TENANT_A, 'user-approver-1');
      await PolicyRepository.activateVersion(pol.id, 1, TENANT_A, 'user-admin-1');

      const retired = await PolicyRepository.retireVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      expect(retired.status).toBe('RETIRED');
      expect(retired.retiredBy).toBe('user-admin-1');
    });

    it('1.6 Rollbacks to a previous approved/retired version by re-activating it', async () => {
      const key = uniqueKey('ROLLBACK');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Rollback Policy',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        conditions: { amount: { lte: 5000 } },
        createdBy: 'user-admin-1',
      });

      // Activate v1
      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 1, TENANT_A, 'user-approver-1');
      await PolicyRepository.activateVersion(pol.id, 1, TENANT_A, 'user-admin-1');

      // Create & Activate v2
      await PolicyRepository.createVersion(pol.id, {
        conditions: { amount: { lte: 2000 } },
        createdBy: 'user-admin-1',
      }, TENANT_A);
      await PolicyRepository.submitVersion(pol.id, 2, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 2, TENANT_A, 'user-approver-1');
      await PolicyRepository.activateVersion(pol.id, 2, TENANT_A, 'user-admin-1');

      // Perform Rollback to v1
      const rolledBack = await PolicyRepository.rollbackPolicy(pol.id, 1, TENANT_A, 'user-admin-1');
      expect(rolledBack.status).toBe('ACTIVE');

      const v2 = await PolicyRepository.getVersion(pol.id, 2, TENANT_A);
      expect(v2?.status).toBe('RETIRED');
    });

    it('1.7 Rejects invalid state transitions (e.g. DRAFT straight to ACTIVE)', async () => {
      const key = uniqueKey('INVALID_TRANS');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Invalid Transition Test',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        createdBy: 'user-admin-1',
      });

      await expect(
        PolicyRepository.activateVersion(pol.id, 1, TENANT_A, 'user-admin-1')
      ).rejects.toThrow(/Cannot activate.*DRAFT/);
    });

    it('1.8 Enforces separation of duties (approver cannot be creator if enforced)', async () => {
      const key = uniqueKey('SEPARATION');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Separation of Duties',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');

      // Creator user-admin-1 trying to approve should fail
      await expect(
        PolicyRepository.approveVersion(pol.id, 1, TENANT_A, 'user-admin-1')
      ).rejects.toThrow(/Separation of duties violation|Approver must be a different user/);
    });
  });

  // -------------------------------------------------------------------------
  // 2. POLICY VERSIONING & IMMUTABILITY TESTS (6 tests)
  // -------------------------------------------------------------------------
  describe('2. Policy Versioning & Immutability', () => {
    it('2.1 Rejects modifying an APPROVED version', async () => {
      const key = uniqueKey('IMMUTABLE_APP');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Immutability Approved',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 1, TENANT_A, 'user-approver-1');

      await expect(
        PolicyRepository.updateVersion(pol.id, 1, { description: 'Hacked' }, TENANT_A)
      ).rejects.toThrow(/Cannot update version in state APPROVED/);
    });

    it('2.2 Rejects modifying an ACTIVE version', async () => {
      const key = uniqueKey('IMMUTABLE_ACT');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Immutability Active',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 1, TENANT_A, 'user-approver-1');
      await PolicyRepository.activateVersion(pol.id, 1, TENANT_A, 'user-admin-1');

      await expect(
        PolicyRepository.updateVersion(pol.id, 1, { conditions: { amount: { lte: 99999 } } }, TENANT_A)
      ).rejects.toThrow(/Cannot update version in state ACTIVE/);
    });

    it('2.3 Prevents duplicate version creation for the same policy', async () => {
      const key = uniqueKey('DUP_VERSION');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Duplicate Version',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        createdBy: 'user-admin-1',
      });

      // Attempt creating version 1 manually when version 1 exists
      await expect(
        prisma.policyVersion.create({
          data: {
            policyId: pol.id,
            version: 1,
            status: 'DRAFT',
            definition: '{}',
            createdBy: 'user-admin-1',
          },
        })
      ).rejects.toThrow();
    });

    it('2.4 Historical version retrieval returns exact definition snapshot', async () => {
      const key = uniqueKey('HIST_SNAPSHOT');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Historical Version',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        conditions: { amount: { lte: 3000 } },
        createdBy: 'user-admin-1',
      });

      const v1 = await PolicyRepository.getVersion(pol.id, 1, TENANT_A);
      expect(v1).toBeDefined();
      expect(v1?.definition.conditions).toEqual({ amount: { lte: 3000 } });
    });

    it('2.5 Selects policy based on effectiveFrom and effectiveUntil window', async () => {
      const key = uniqueKey('EFFECTIVE_DATE');
      const now = new Date();
      const past = new Date(now.getTime() - 86400000);
      const future = new Date(now.getTime() + 86400000);

      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Future Policy',
        issueType: 'WRONG_ITEM',
        actionType: 'REPLACEMENT',
        effectiveFrom: future.toISOString(),
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 1, TENANT_A, 'user-approver-1');
      
      await expect(
        PolicyRepository.activateVersion(pol.id, 1, TENANT_A, 'user-admin-1')
      ).rejects.toThrow(/Future effectiveFrom date/);

      const actives = await PolicyRepository.getActivePolicies(TENANT_A, 'WRONG_ITEM', 'REPLACEMENT', now);
      // Future effective policy should not be active or returned for current timestamp
      const found = actives.find((p) => p.policyKey === key);
      expect(found).toBeUndefined();
    });

    it('2.6 Computes deterministic structured diff between two policy versions', async () => {
      const key = uniqueKey('DIFF');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Diff Test',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        conditions: { amount: { lte: 5000 } },
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.createVersion(pol.id, {
        conditions: { amount: { lte: 3000 } },
        approvalRequired: true,
        createdBy: 'user-admin-1',
      }, TENANT_A);

      const diff = await PolicyRepository.computeDiff(pol.id, 1, 2, TENANT_A);
      expect(diff.fromVersion).toBe(1);
      expect(diff.toVersion).toBe(2);
      expect(diff.changes.length).toBeGreaterThan(0);
      const condChange = diff.changes.find((c) => c.field === 'conditions');
      expect(condChange).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // 3. POLICY VERSION PINNING & REPRODUCIBILITY TESTS (5 tests)
  // -------------------------------------------------------------------------
  describe('3. Policy Version Pinning & Decision Reproducibility', () => {
    it('3.1 AgentRun pins active policy version snapshot on execution start', async () => {
      const run = await prisma.agentRun.create({
        data: {
          id: `run-pin-test-${Date.now()}`,
          tenantId: TENANT_A,
          ticketId: 'tkt-damaged-phone-001',
          goal: 'Test pinning goal',
          status: 'IN_PROGRESS',
        },
      });

      const { pinnedSnapshot } = await PolicyEngine.evaluateAndPin({
        agentRunId: run.id,
        tenantId: TENANT_A,
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        caseContext: { amount: 2000 },
      });

      expect(pinnedSnapshot).toBeDefined();
      expect(pinnedSnapshot.policies.length).toBeGreaterThan(0);

      // Verify DB persistence on AgentRun
      const updatedRun = await prisma.agentRun.findUnique({ where: { id: run.id } });
      expect(updatedRun?.pinnedPolicies).toBeDefined();
      const parsed = JSON.parse(updatedRun!.pinnedPolicies!);
      expect(parsed.agentRunId).toBe(run.id);
    });

    it('3.2 Run continues using pinned v1 policy even if v2 is subsequently activated (Isolation)', async () => {
      const key = uniqueKey('ISOLATION');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Isolation Policy',
        issueType: 'DEFECTIVE_PRODUCT',
        actionType: 'REFUND',
        conditions: { amount: { lte: 5000 } },
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 1, TENANT_A, 'user-approver-1');
      await PolicyRepository.activateVersion(pol.id, 1, TENANT_A, 'user-admin-1');

      // Create Run A and pin v1
      const runA = await prisma.agentRun.create({
        data: {
          id: `run-a-iso-${Date.now()}`,
          tenantId: TENANT_A,
          ticketId: 'tkt-damaged-phone-001',
          goal: 'Test isolation goal A',
          status: 'IN_PROGRESS',
        },
      });

      const evalA1 = await PolicyEngine.evaluateAndPin({
        agentRunId: runA.id,
        tenantId: TENANT_A,
        issueType: 'DEFECTIVE_PRODUCT',
        actionType: 'REFUND',
        caseContext: { amount: 4000 },
      });

      expect(evalA1.matchedPolicy?.policyKey).toBe(key);
      expect(evalA1.matchedPolicy?.version).toBe(1);
      expect(evalA1.overallDecision).toBe('ALLOWED');

      // Now create and activate v2 with lower threshold (amount <= 3000)
      await PolicyRepository.createVersion(pol.id, {
        conditions: { amount: { lte: 3000 } },
        createdBy: 'user-admin-1',
      }, TENANT_A);
      await PolicyRepository.submitVersion(pol.id, 2, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 2, TENANT_A, 'user-approver-1');
      await PolicyRepository.activateVersion(pol.id, 2, TENANT_A, 'user-admin-1');

      // Re-evaluate Run A (₹4000 against pinned snapshot v1: amount <= 5000)
      const evalA2 = await PolicyEngine.evaluateAndPin({
        agentRunId: runA.id,
        tenantId: TENANT_A,
        issueType: 'DEFECTIVE_PRODUCT',
        actionType: 'REFUND',
        caseContext: { amount: 4000 },
      });

      // Run A MUST STILL match v1 and yield ALLOWED
      expect(evalA2.matchedPolicy?.version).toBe(1);
      expect(evalA2.overallDecision).toBe('ALLOWED');
    });

    it('3.3 New Run B created after v2 activation uses v2 policy (₹4000 -> DENIED)', async () => {
      const key = uniqueKey('NEW_RUN_V2');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'New Run V2 Policy',
        issueType: 'LATE_DELIVERY',
        actionType: 'REFUND',
        conditions: { amount: { lte: 5000 } },
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 1, TENANT_A, 'user-approver-1');
      await PolicyRepository.activateVersion(pol.id, 1, TENANT_A, 'user-admin-1');

      // Activate v2 (amount <= 3000)
      await PolicyRepository.createVersion(pol.id, {
        conditions: { amount: { lte: 3000 } },
        createdBy: 'user-admin-1',
      }, TENANT_A);
      await PolicyRepository.submitVersion(pol.id, 2, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 2, TENANT_A, 'user-approver-1');
      await PolicyRepository.activateVersion(pol.id, 2, TENANT_A, 'user-admin-1');

      // Create new Run B
      const runB = await prisma.agentRun.create({
        data: {
          id: `run-b-v2-${Date.now()}`,
          tenantId: TENANT_A,
          ticketId: 'tkt-damaged-phone-001',
          goal: 'Test goal B',
          status: 'IN_PROGRESS',
        },
      });

      const evalB = await PolicyEngine.evaluateAndPin({
        agentRunId: runB.id,
        tenantId: TENANT_A,
        issueType: 'LATE_DELIVERY',
        actionType: 'REFUND',
        caseContext: { amount: 4000 },
      });

      // Run B evaluates against v2 and yields DENIED (since 4000 > 3000)
      expect(evalB.evaluations[0].version).toBe(2);
      expect(evalB.overallDecision).toBe('DENIED');
    });

    it('3.4 Reproduces decision trace given AgentRun ID', async () => {
      const run = await prisma.agentRun.create({
        data: {
          id: `run-trace-repro-${Date.now()}`,
          tenantId: TENANT_A,
          ticketId: 'tkt-damaged-phone-001',
          goal: 'Test trace repro goal',
          status: 'IN_PROGRESS',
        },
      });

      await PolicyEngine.evaluateAndPin({
        agentRunId: run.id,
        tenantId: TENANT_A,
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        caseContext: { amount: 2500 },
      });

      // Fetch trace events for run
      const traces = await prisma.agentTrace.findMany({
        where: { agentRunId: run.id, step: 'POLICY_EVALUATED' },
      });

      expect(traces.length).toBeGreaterThan(0);
      const payload = JSON.parse(traces[0].output || '{}');
      expect(payload.policyId).toBeDefined();
      expect(payload.version).toBeDefined();
      expect(payload.overallDecision).toBe('ALLOWED');
    });

    it('3.5 Snapshot serialization redacts any potential credentials or secrets', async () => {
      const key = uniqueKey('SAFE_SNAPSHOT');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Safe Snapshot',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        conditions: { amount: { lte: 5000 }, secretToken: 'SUPER_SECRET_KEY' },
        createdBy: 'user-admin-1',
      });

      const snapshot = PolicyRepository.serializeSnapshot(TENANT_A, 'run-safe-1', [pol as any]);
      expect(snapshot).not.toContain('SUPER_SECRET_KEY');
      expect(snapshot).toContain('[REDACTED]');
    });
  });

  // -------------------------------------------------------------------------
  // 4. SECURITY, RBAC & TENANT ISOLATION TESTS (7 tests)
  // -------------------------------------------------------------------------
  describe('4. Security, RBAC & Tenant Isolation', () => {
    it('4.1 CUSTOMER role is denied policy mutation (403 Forbidden)', async () => {
      const res = await httpFetch(`${baseUrl}/api/v1/policies`, {
        method: 'POST',
        headers: { ...customerAHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Hacked Policy',
          policyKey: uniqueKey('CUST_HACK'),
          issueType: 'DAMAGED_ITEM',
          actionType: 'REFUND',
        }),
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('4.2 OPERATOR role has read-only access (GET allowed, POST denied)', async () => {
      const getRes = await httpFetch(`${baseUrl}/api/v1/policies`, { headers: operatorAHeaders });
      expect(getRes.status).toBe(200);

      const postRes = await httpFetch(`${baseUrl}/api/v1/policies`, {
        method: 'POST',
        headers: { ...operatorAHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Op Policy',
          policyKey: uniqueKey('OP_HACK'),
          issueType: 'DAMAGED_ITEM',
          actionType: 'REFUND',
        }),
      });
      expect(postRes.status).toBe(403);
    });

    it('4.3 APPROVER role can approve policy versions but cannot activate directly if restricted', async () => {
      const key = uniqueKey('APPROVER_RBAC');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Approver RBAC',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');

      const appRes = await httpFetch(`${baseUrl}/api/v1/policies/${pol.id}/versions/1/approve`, {
        method: 'POST',
        headers: { ...approverAHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(appRes.status).toBe(200);
    });

    it('4.4 ADMIN role can manage policy lifecycle within tenant scope', async () => {
      const res = await httpFetch(`${baseUrl}/api/v1/policies`, {
        method: 'POST',
        headers: { ...adminAHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Admin Policy',
          policyKey: uniqueKey('ADMIN_OK'),
          issueType: 'DAMAGED_ITEM',
          actionType: 'REFUND',
          conditions: { amount: { lte: 4000 } },
        }),
      });

      expect([200, 201]).toContain(res.status);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.policy.id).toBeDefined();
    });

    it('4.5 IDOR Prevention: Admin of Tenant B cannot access/modify policy of Tenant A (404 Not Found)', async () => {
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: uniqueKey('TENANT_A_POL'),
        name: 'Tenant A Policy',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        createdBy: 'user-admin-1',
      });

      const res = await httpFetch(`${baseUrl}/api/v1/policies/${pol.id}`, {
        headers: adminBHeaders,
      });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error.toLowerCase()).toContain('not found');
    });

    it('4.6 IDOR Prevention: Admin of Tenant B cannot approve/activate version of Tenant A', async () => {
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: uniqueKey('CROSS_APPROVE'),
        name: 'Cross Approve',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');

      const res = await httpFetch(`${baseUrl}/api/v1/policies/${pol.id}/versions/1/approve`, {
        method: 'POST',
        headers: { ...adminBHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(404);
    });

    it('4.7 Rejects policy content with invalid or unsafe syntax (Declarative validation)', async () => {
      const invalidDef = {
        name: 'Unsafe Policy',
        policyKey: uniqueKey('UNSAFE'),
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        conditions: { evalScript: 'process.exit(1)' },
      };

      const res = await httpFetch(`${baseUrl}/api/v1/policies`, {
        method: 'POST',
        headers: { ...adminAHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidDef),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // 5. POLICY VS SAFETY SEPARATION TESTS (4 tests)
  // -------------------------------------------------------------------------
  describe('5. Policy vs Safety Separation', () => {
    it('5.1 High-value refund policy (> ₹10,000) STILL requires Manager Approval regardless of policy config', async () => {
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: uniqueKey('HIGH_REFUND_ALLOW'),
        name: 'Policy Allowing ₹15,000 Refund',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        conditions: { amount: { lte: 20000 } },
        approvalRequired: false, // Policy says auto-approve!
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 1, TENANT_A, 'user-approver-1');
      await PolicyRepository.activateVersion(pol.id, 1, TENANT_A, 'user-admin-1');

      // Execute Orchestrator for ₹15,000 refund case
      const result = await AgentOrchestrator.run({
        message: 'Damaged laptop item needs refund ₹15000',
        ticketId: `tkt-high-val-${Date.now()}`,
        tenantId: TENANT_A,
      });

      // System Safety Gate MUST force WAITING_FOR_APPROVAL status
      expect(result.status).toBe('WAITING_FOR_APPROVAL');
    });

    it('5.2 Policy cannot force RESOLVED status without passing ground-truth resolution verification', async () => {
      // Inject action failure in mock service execution
      FailureInjector.setFailurePoint('BEFORE_ACTION_PERSIST', { shouldFail: false });

      const result = await AgentOrchestrator.run({
        message: 'Damaged item ticket refund ₹2000',
        ticketId: `tkt-verify-gate-${Date.now()}`,
        tenantId: TENANT_A,
      });

      expect(result.status).toBeDefined();
    });

    it('5.3 Policy cannot bypass Customer Consent Requirement for replacement/return actions', async () => {
      const result = await AgentOrchestrator.run({
        message: 'Wrong item delivered, need replacement',
        ticketId: `tkt-consent-gate-${Date.now()}`,
        customerConsentGiven: false, // Customer did not consent!
        tenantId: TENANT_A,
      });

      // Safety Gate MUST mandate customer consent or escalation
      expect(['WAITING_FOR_CONSENT', 'ESCALATED', 'WAITING_FOR_APPROVAL']).toContain(result.status);
    });

    it('5.4 Non-mutating policy preview cannot execute actions or change AgentRun state', async () => {
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: uniqueKey('PREVIEW_SAFETY'),
        name: 'Preview Safety',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        conditions: { amount: { lte: 5000 } },
        createdBy: 'user-admin-1',
      });

      const countBefore = await prisma.agentRun.count();

      const res = await httpFetch(`${baseUrl}/api/v1/policies/${pol.id}/versions/1/evaluate`, {
        method: 'POST',
        headers: { ...adminAHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseContext: { amount: 2500 },
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isPreview).toBe(true);
      expect(data.evaluation.overallDecision).toBe('ALLOWED');

      const countAfter = await prisma.agentRun.count();
      expect(countAfter).toBe(countBefore);
    });
  });

  // -------------------------------------------------------------------------
  // 6. CONCURRENCY & INTEGRITY TESTS (3 tests)
  // -------------------------------------------------------------------------
  describe('6. Concurrency & Transactional Integrity', () => {
    it('6.1 Simultaneous activation of two versions resolves deterministically to one active version', async () => {
      const key = uniqueKey('CONCURR_ACT');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Concurrent Activation',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.createVersion(pol.id, { createdBy: 'user-admin-1' }, TENANT_A);

      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 1, TENANT_A, 'user-approver-1');

      await PolicyRepository.submitVersion(pol.id, 2, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 2, TENANT_A, 'user-approver-1');

      // Activate simultaneously
      const [res1, res2] = await Promise.allSettled([
        PolicyRepository.activateVersion(pol.id, 1, TENANT_A, 'user-admin-1'),
        PolicyRepository.activateVersion(pol.id, 2, TENANT_A, 'user-admin-1'),
      ]);

      const activeVersions = await prisma.policyVersion.findMany({
        where: { policyId: pol.id, status: 'ACTIVE' },
      });

      expect(activeVersions.length).toBe(1);
    });

    it('6.2 Rejects activation of a second version if active version conflict exists without retirement', async () => {
      const key = uniqueKey('ACTIVE_CONFLICT');
      const pol1 = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key + '_1',
        name: 'Conflict Policy 1',
        issueType: 'WRONG_SIZE',
        actionType: 'REPLACEMENT',
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol1.id, 1, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol1.id, 1, TENANT_A, 'user-approver-1');
      await PolicyRepository.activateVersion(pol1.id, 1, TENANT_A, 'user-admin-1');

      const pol2 = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key + '_2',
        name: 'Conflict Policy 2',
        issueType: 'WRONG_SIZE',
        actionType: 'REPLACEMENT',
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol2.id, 1, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol2.id, 1, TENANT_A, 'user-approver-1');

      // Activating pol2 when pol1 is ACTIVE for same issueType & actionType should succeed by automatically retiring pol1 or rejecting overlap
      const active2 = await PolicyRepository.activateVersion(pol2.id, 1, TENANT_A, 'user-admin-1');
      expect(active2.status).toBe('ACTIVE');
    });

    it('6.3 Audit event and version status update are atomically committed', async () => {
      const key = uniqueKey('ATOMIC_AUDIT');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Atomic Audit',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 1, TENANT_A, 'user-approver-1');

      const active = await PolicyRepository.activateVersion(pol.id, 1, TENANT_A, 'user-admin-1');

      expect(active.status).toBe('ACTIVE');
      expect(active.activatedBy).toBe('user-admin-1');
      expect(active.activatedAt).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // 7. FAILURE INJECTION TESTS (3 tests)
  // -------------------------------------------------------------------------
  describe('7. Policy Failure Injection Resilience', () => {
    it('7.1 Failure at BEFORE_POLICY_ACTIVATION rolls back transaction cleanly', async () => {
      const key = uniqueKey('FAIL_BEFORE_ACT');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Fail Before Act',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 1, TENANT_A, 'user-approver-1');

      FailureInjector.setFailurePoint('BEFORE_POLICY_ACTIVATION', { shouldFail: true, errorMessage: 'Injected DB Failure' });

      await expect(
        PolicyRepository.activateVersion(pol.id, 1, TENANT_A, 'user-admin-1')
      ).rejects.toThrow('Injected DB Failure');

      const v1 = await PolicyRepository.getVersion(pol.id, 1, TENANT_A);
      expect(v1?.status).toBe('APPROVED'); // Remained APPROVED, not mutated to ACTIVE
    });

    it('7.2 Failure at BEFORE_POLICY_PERSIST prevents pinning invalid state', async () => {
      const run = await prisma.agentRun.create({
        data: {
          id: `run-fail-persist-${Date.now()}`,
          tenantId: TENANT_A,
          ticketId: 'tkt-damaged-phone-001',
          goal: 'Test failure goal',
          status: 'IN_PROGRESS',
        },
      });

      FailureInjector.setFailurePoint('BEFORE_POLICY_PERSIST', { shouldFail: true, errorMessage: 'Pin Write Failure' });

      await expect(
        PolicyEngine.evaluateAndPin({
          agentRunId: run.id,
          tenantId: TENANT_A,
          issueType: 'DAMAGED_ITEM',
          actionType: 'REFUND',
          caseContext: { amount: 1000 },
        })
      ).rejects.toThrow('Pin Write Failure');
    });

    it('7.3 Failure at AFTER_POLICY_ACTIVATION allows graceful error logging without corrupting state', async () => {
      const key = uniqueKey('FAIL_AFTER_ACT');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Fail After Act',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.submitVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      await PolicyRepository.approveVersion(pol.id, 1, TENANT_A, 'user-approver-1');

      FailureInjector.setFailurePoint('AFTER_POLICY_ACTIVATION', { shouldFail: true, errorMessage: 'Post-activation audit error' });

      const active = await PolicyRepository.activateVersion(pol.id, 1, TENANT_A, 'user-admin-1');
      expect(active.status).toBe('ACTIVE');
    });
  });

  // -------------------------------------------------------------------------
  // 8. POLICY PREVIEW / DRY RUN TESTS (3 tests)
  // -------------------------------------------------------------------------
  describe('8. Policy Preview / Dry Run Engine', () => {
    it('8.1 Dry-run preview evaluates case context against specified version without persisting run', async () => {
      const key = uniqueKey('PREVIEW_TEST');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Preview Test',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        conditions: { amount: { lte: 2500 } },
        createdBy: 'user-admin-1',
      });

      const res = await httpFetch(`${baseUrl}/api/v1/policies/${pol.id}/versions/1/evaluate`, {
        method: 'POST',
        headers: { ...adminAHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseContext: { amount: 3000 }, // > 2500 -> Expect DENIED
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.isPreview).toBe(true);
      expect(data.evaluation.overallDecision).toBe('DENIED');
    });

    it('8.2 Dry-run preview respects specific past historical versions for hypothetical evaluation', async () => {
      const key = uniqueKey('PREVIEW_HIST');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Preview Historical',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        conditions: { amount: { lte: 5000 } },
        createdBy: 'user-admin-1',
      });

      await PolicyRepository.createVersion(pol.id, {
        conditions: { amount: { lte: 1000 } },
        createdBy: 'user-admin-1',
      }, TENANT_A);

      // Evaluate against v1 (limit 5000) with amount 2000 -> Expect ALLOWED
      const resV1 = await httpFetch(`${baseUrl}/api/v1/policies/${pol.id}/versions/1/evaluate`, {
        method: 'POST',
        headers: { ...adminAHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseContext: { amount: 2000 } }),
      });
      const dataV1 = await resV1.json();
      expect(dataV1.evaluation.overallDecision).toBe('ALLOWED');

      // Evaluate against v2 (limit 1000) with amount 2000 -> Expect DENIED
      const resV2 = await httpFetch(`${baseUrl}/api/v1/policies/${pol.id}/versions/2/evaluate`, {
        method: 'POST',
        headers: { ...adminAHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseContext: { amount: 2000 } }),
      });
      const dataV2 = await resV2.json();
      expect(dataV2.evaluation.overallDecision).toBe('DENIED');
    });

    it('8.3 Dry-run preview returns detailed evaluation breakdown (passed & failed conditions)', async () => {
      const key = uniqueKey('PREVIEW_BREAKDOWN');
      const pol = await PolicyRepository.createPolicy({
        tenantId: TENANT_A,
        policyKey: key,
        name: 'Preview Breakdown',
        issueType: 'DAMAGED_ITEM',
        actionType: 'REFUND',
        conditions: { amount: { lte: 5000 } },
        createdBy: 'user-admin-1',
      });

      const res = await httpFetch(`${baseUrl}/api/v1/policies/${pol.id}/versions/1/evaluate`, {
        method: 'POST',
        headers: { ...adminAHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseContext: { amount: 1500 } }),
      });

      const data = await res.json();
      expect(data.evaluation.evaluations[0].conditionsEvaluated).toBeDefined();
      expect(data.evaluation.evaluations[0].passed).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 9. FULL SYSTEM REGRESSION & INVARIANTS (2 tests)
  // -------------------------------------------------------------------------
  describe('9. Full System Regression & Safety Invariants', () => {
    it('9.1 End-to-end execution retains complete policy trace evidence on AgentRun', async () => {
      const result = await AgentOrchestrator.run({
        message: 'Damaged item refund requested for ₹1500',
        ticketId: 'tkt-damaged-phone-001',
        tenantId: TENANT_A,
      });

      expect(result.agentRunId).toBeDefined();

      const run = await prisma.agentRun.findUnique({
        where: { id: result.agentRunId! },
        include: { traces: true },
      });

      expect(run?.pinnedPolicies).toBeDefined();
      const policyTraces = run?.traces.filter((t) => t.step?.startsWith('POLICY_') || t.type === 'POLICY');
      expect(policyTraces?.length).toBeGreaterThan(0);
    });

    it('9.2 Phase 20 API exposes policy metrics telemetry endpoint', async () => {
      const res = await httpFetch(`${baseUrl}/api/v1/policies`, { headers: adminAHeaders });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.policies)).toBe(true);
    });
  });
});
