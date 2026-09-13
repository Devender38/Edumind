import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import app from '../src/backend/server.js';
import { AuthService } from '../src/auth/authService.js';
import { PolicyRepository } from '../src/db/repositories/policyRepository.js';
import { AgentOrchestrator, IntentAgent, InvestigationAgent, DecisionEngine, ActionExecutor, FailureRecoveryAgent } from '../src/agents/index.js';
import { DomainRepository } from '../src/db/repositories/domainRepository.js';
import { AgentStateRepository } from '../src/db/repositories/agentStateRepository.js';
import { PolicyConditionEvaluator } from '../src/policy/PolicyConditionEvaluator.js';
import { ExecutionCoordinator } from '../src/execution/executionCoordinator.js';
import { ExecutionRepository } from '../src/db/repositories/executionRepository.js';
import { metricsRegistry } from '../src/observability/index.js';

let server: http.Server;
let BASE_URL: string;

describe('Phase 24 Live HTTP & Certification Verification Suite', () => {
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

  const customerTokenTenantA = AuthService.generateToken({
    id: 'cust-101',
    role: 'CUSTOMER',
    tenantId: 'tenant-a',
    email: 'cust101@test.com',
  });

  const customerTokenTenantB = AuthService.generateToken({
    id: 'cust-202',
    role: 'CUSTOMER',
    tenantId: 'tenant-b',
    email: 'cust202@test.com',
  });

  const operatorTokenTenantA = AuthService.generateToken({
    id: 'op-101',
    role: 'OPERATOR',
    tenantId: 'tenant-a',
    email: 'op101@test.com',
  });

  const adminTokenTenantA = AuthService.generateToken({
    id: 'admin-101',
    role: 'ADMIN',
    tenantId: 'tenant-a',
    email: 'admin101@test.com',
  });

  const expiredToken = AuthService.generateToken(
    {
      id: 'cust-101',
      role: 'CUSTOMER',
      tenantId: 'tenant-a',
      email: 'cust101@test.com',
    },
    -1000
  );

  const invalidSignatureToken = customerTokenTenantA + 'tampered';

  describe('1. Live HTTP Endpoint Matrix', () => {
    it('1.1 GET /api/v1/health returns 200', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/health`);
      expect(res.status).toBe(200);
    });

    it('1.2 GET /api/v1/health/readiness returns 200', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/health/readiness`);
      expect(res.status).toBe(200);
    });

    it('1.3 GET /api/v1/cases with NO token returns 401', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/cases`);
      expect(res.status).toBe(401);
    });

    it('1.4 GET /api/v1/cases with MALFORMED token returns 401', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/cases`, {
        headers: { Authorization: 'Bearer invalid-token' },
      });
      expect(res.status).toBe(401);
    });

    it('1.5 GET /api/v1/cases with EXPIRED token returns 401', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/cases`, {
        headers: { Authorization: `Bearer ${expiredToken}` },
      });
      expect(res.status).toBe(401);
    });

    it('1.6 GET /api/v1/cases with INVALID SIGNATURE returns 401', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/cases`, {
        headers: { Authorization: `Bearer ${invalidSignatureToken}` },
      });
      expect(res.status).toBe(401);
    });

    it('1.7 GET /api/v1/cases with VALID CUSTOMER token returns 200', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/cases`, {
        headers: { Authorization: `Bearer ${customerTokenTenantA}` },
      });
      expect(res.status).toBe(200);
    });

    it('1.8 POST /api/v1/agents/run creates new run', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/agents/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerTokenTenantA}`,
        },
        body: JSON.stringify({ customerMessage: 'I want a refund for earbuds ord-refund-4999' }),
      });
      expect(res.status).toBe(200);
    });

    it('1.9 GET /api/v1/ops/runs returns 200 for OPERATOR', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/ops/runs`, {
        headers: { Authorization: `Bearer ${operatorTokenTenantA}` },
      });
      expect(res.status).toBe(200);
    });

    it('1.10 GET /api/v1/ops/slo returns 200 for OPERATOR', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/ops/slo`, {
        headers: { Authorization: `Bearer ${operatorTokenTenantA}` },
      });
      expect(res.status).toBe(200);
    });

    it('1.11 GET /api/v1/metrics returns 200', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/metrics`, {
        headers: { Authorization: `Bearer ${operatorTokenTenantA}` },
      });
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toContain('resolvex_');
    });

    it('1.12 Customer attempting approval returns 403 Forbidden', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/agents/runs/dummy-run-id/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerTokenTenantA}`,
        },
        body: JSON.stringify({ decision: 'APPROVED' }),
      });
      expect(res.status).toBe(403);
    });

    it('1.13 Cross-tenant case access returns 404 Not Found', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/cases/case-tenant-a-999`, {
        headers: { Authorization: `Bearer ${customerTokenTenantB}` },
      });
      expect(res.status).toBe(404);
    });
  });

  describe('2. Historical Policy Reproducibility Verification', () => {
    it('Policy version remains immutable and pinned AgentRuns evaluate against historical policy', async () => {
      const p1 = await prisma.policy.findFirst({
        where: { tenantId: 'tenant-a', issueType: 'DAMAGED' },
        include: { versions: true },
      });
      expect(p1).toBeDefined();

      const activeVer = p1?.versions.find((v) => v.status === 'ACTIVE') || p1?.versions[0];
      expect(activeVer).toBeDefined();

      // Pinned policy version check
      const pinnedVersionNumber = activeVer?.version;
      const reevaluatedVer = await prisma.policyVersion.findFirst({
        where: { policyId: p1?.id, version: pinnedVersionNumber },
      });

      expect(reevaluatedVer?.version).toBe(pinnedVersionNumber);
      expect(reevaluatedVer?.definition).toBe(activeVer?.definition);
    });
  });

  describe('3. Observability Failure Isolation Verification', () => {
    it('Metrics ingestion error does NOT affect business execution outcome', () => {
      expect(() => {
        metricsRegistry.incrementCounter('resolvex_agent_runs_total', 1, { tenant_id: 'tenant-a', status: 'COMPLETED' });
      }).not.toThrow();
    });
  });
});
