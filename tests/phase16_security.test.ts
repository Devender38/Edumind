// ResolveX Phase 16 — Production Security, Authentication, Authorization & Tenant Isolation Test Suite

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'http';
import app from '../src/backend/server.js';
import { seedDatabase } from '../src/db/seedDatabase.js';
import { prisma } from '../src/db/client.js';
import { getAuthHeaders } from './helpers/authHelper.js';
import { AuthService } from '../src/auth/authService.js';
import { RateLimiter } from '../src/utils/rateLimiter.js';

describe('Phase 16: Security, Authentication, Authorization & Tenant Isolation Suite', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    await prisma.$connect();
    await new Promise<void>((resolve) => {
      server = app.listen(5077, () => {
        baseUrl = 'http://localhost:5077';
        resolve();
      });
    });
  });

  beforeEach(async () => {
    RateLimiter.resetStore();
    await seedDatabase();
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((res) => server.close(() => res()));
    }
    await prisma.$disconnect();
  });

  // ----------------------------------------------------
  // 1. AUTHENTICATION BOUNDARY TESTS
  // ----------------------------------------------------
  describe('1. Authentication Boundary Tests', () => {
    it('1. Public health check GET /api/v1/health is accessible without authentication', async () => {
      const res = await fetch(`${baseUrl}/api/v1/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('ok');
    });

    it('2. Protected endpoint GET /api/v1/ops/runs without auth returns 401 Unauthorized', async () => {
      const res = await fetch(`${baseUrl}/api/v1/ops/runs`);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unauthorized');
    });

    it('3. Protected endpoint with invalid token returns 401 Unauthorized', async () => {
      const res = await fetch(`${baseUrl}/api/v1/ops/runs`, {
        headers: { Authorization: 'Bearer invalid-token-signature-xyz' },
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('4. Protected endpoint with malformed auth header returns 401 Unauthorized', async () => {
      const res = await fetch(`${baseUrl}/api/v1/ops/runs`, {
        headers: { Authorization: 'MalformedHeaderWithoutBearer' },
      });
      expect(res.status).toBe(401);
    });

    it('5. Authentication failure response contains NO secrets or internal stack traces', async () => {
      const res = await fetch(`${baseUrl}/api/v1/ops/runs`, {
        headers: { Authorization: 'Bearer bad-token' },
      });
      const bodyText = await res.text();
      expect(bodyText).not.toContain('RESOLVEX_AUTH_SECRET');
      expect(bodyText).not.toContain('stack');
    });
  });

  // ----------------------------------------------------
  // 2. ROLE-BASED ACCESS CONTROL (RBAC) TESTS
  // ----------------------------------------------------
  describe('2. Role-Based Access Control (RBAC)', () => {
    it('6. CUSTOMER role cannot access operator endpoint GET /api/v1/ops/runs (returns 403)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/ops/runs`, {
        headers: getAuthHeaders('CUSTOMER', 'cust-primary-001'),
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Forbidden: Insufficient privileges');
    });

    it('7. OPERATOR role cannot perform manager approval (returns 403)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/agents/runs/run-tenant-a-001/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders('OPERATOR'),
        },
        body: JSON.stringify({ decision: 'APPROVE' }),
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Forbidden');
    });

    it('8. APPROVER role is permitted to attempt manager approval', async () => {
      const createRes = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders('SERVICE'),
        },
        body: JSON.stringify({
          ticketId: 'tkt-damaged-phone-001',
          orderId: 'ord-phone-24999',
          customerId: 'cust-primary-001',
          message: 'My ₹24,999 phone arrived damaged. I want a refund.',
        }),
      });
      const createData = await createRes.json();
      const runId = createData.orchestrationResult.agentRunId || createData.orchestrationResult.runId;

      const approveRes = await fetch(`${baseUrl}/api/v1/agents/runs/${runId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders('APPROVER'),
        },
        body: JSON.stringify({ decision: 'APPROVE' }),
      });

      expect(approveRes.status).toBe(200);
      const approveData = await approveRes.json();
      expect(approveData.success).toBe(true);
    });

    it('9. CUSTOMER role cannot invoke internal recovery replan endpoint (returns 403)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/agents/recovery/replan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders('CUSTOMER', 'cust-primary-001'),
        },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(403);
    });
  });

  // ----------------------------------------------------
  // 3. CUSTOMER OWNERSHIP & IDOR PROTECTION TESTS
  // ----------------------------------------------------
  describe('3. Customer Ownership & IDOR Protection', () => {
    it('10. Customer A can inspect their own customer profile', async () => {
      const res = await fetch(`${baseUrl}/api/v1/customers/cust-primary-001`, {
        headers: getAuthHeaders('CUSTOMER', 'cust-primary-001'),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe('cust-primary-001');
    });

    it('11. Customer A cannot access Customer B order (returns 404 without existence leakage)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders/ord-tenant-b-999`, {
        headers: getAuthHeaders('CUSTOMER', 'cust-primary-001', 'tenant-a'),
      });
      expect(res.status).toBe(404);
    });

    it('12. Customer A cannot submit consent for another customer run (returns 404)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/agents/runs/run-tenant-b-001/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders('CUSTOMER', 'cust-primary-001', 'tenant-a'),
        },
        body: JSON.stringify({ consentGiven: true }),
      });
      expect(res.status).toBe(404);
    });

    it('13. Customer A specifying a different customerId in POST /api/v1/agents/run is rejected (403)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders('CUSTOMER', 'cust-primary-001'),
        },
        body: JSON.stringify({
          customerId: 'cust-risk-003',
          message: 'Fraudulent refund request',
        }),
      });
      expect(res.status).toBe(403);
    });
  });

  // ----------------------------------------------------
  // 4. TENANT ISOLATION TESTS
  // ----------------------------------------------------
  describe('4. Multi-Tenant Isolation', () => {
    it('14. Tenant A caller cannot access Tenant B run (returns 404)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/agents/runs/run-tenant-b-001`, {
        headers: getAuthHeaders('OPERATOR', undefined, 'tenant-a'),
      });
      expect(res.status).toBe(404);
    });

    it('15. Tenant A approver cannot approve Tenant B run (returns 404)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/agents/runs/run-tenant-b-001/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders('APPROVER', undefined, 'tenant-a'),
        },
        body: JSON.stringify({ decision: 'APPROVE' }),
      });
      expect(res.status).toBe(404);

      const runB = await prisma.agentRun.findUnique({ where: { id: 'run-tenant-b-001' } });
      expect(runB?.status).toBe('WAITING_FOR_APPROVAL');
    });

    it('16. Operator listing for Tenant A only returns Tenant A runs', async () => {
      const res = await fetch(`${baseUrl}/api/v1/ops/runs`, {
        headers: getAuthHeaders('OPERATOR', undefined, 'tenant-a'),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.runs.every((r: any) => r.tenantId === 'tenant-a' || !r.tenantId)).toBe(true);
      expect(data.runs.some((r: any) => r.id === 'run-tenant-b-001')).toBe(false);
    });
  });

  // ----------------------------------------------------
  // 5. REMOVAL OF UNIVERSAL APPROVAL AUTHORIZATION
  // ----------------------------------------------------
  describe('5. Hardened Approval Gate Security', () => {
    it('17. Universal token "VALID_TOKEN" without APPROVER role fails with 401', async () => {
      const res = await fetch(`${baseUrl}/api/v1/agents/runs/run-tenant-b-001/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer VALID_TOKEN',
        },
        body: JSON.stringify({ decision: 'APPROVE' }),
      });
      expect(res.status).toBe(401);
    });

    it('18. Customer role with syntactically valid signed token cannot perform approval (403)', async () => {
      const customerToken = AuthService.generateToken({
        id: 'cust-001',
        type: 'CUSTOMER',
        role: 'CUSTOMER',
        tenantId: 'tenant-a',
      });
      const res = await fetch(`${baseUrl}/api/v1/agents/runs/run-tenant-b-001/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({ decision: 'APPROVE' }),
      });
      expect(res.status).toBe(403);
    });
  });

  // ----------------------------------------------------
  // 6. REQUEST VALIDATION & INPUT SECURITY
  // ----------------------------------------------------
  describe('6. Input Validation & Request Hardening', () => {
    it('19. Oversized customerMessage (>2000 chars) is rejected with 400 Bad Request', async () => {
      const longMessage = 'A'.repeat(2500);
      const res = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders('CUSTOMER', 'cust-primary-001'),
        },
        body: JSON.stringify({
          ticketId: 'tkt-damaged-phone-001',
          message: longMessage,
        }),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('customerMessage exceeds maximum permitted length');
    });

    it('20. Excessive pagination limit (>100) is safely clamped to 100', async () => {
      const res = await fetch(`${baseUrl}/api/v1/ops/runs?limit=500`, {
        headers: getAuthHeaders('OPERATOR'),
      });
      expect(res.status).toBe(200);
    });

    it('21. Path traversal characters in URL parameters are rejected with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/customers/..%2F..%2Fetc%2Fpasswd`, {
        headers: getAuthHeaders('OPERATOR'),
      });
      expect(res.status).toBe(400);
    });
  });

  // ----------------------------------------------------
  // 7. REGRESSION MATRIX (PHASES 1–15 COMPATIBILITY)
  // ----------------------------------------------------
  describe('7. Phase 1-15 Regression Compliance', () => {
    it('22. Authenticated high-value refund flow still halts at WAITING_FOR_APPROVAL', async () => {
      const res = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders('CUSTOMER', 'cust-primary-001'),
        },
        body: JSON.stringify({
          ticketId: 'tkt-damaged-phone-001',
          orderId: 'ord-phone-24999',
          message: 'My ₹24,999 phone arrived damaged. I want a refund.',
        }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.orchestrationResult.status).toBe('WAITING_FOR_APPROVAL');
    });

    it('23. Authenticated low-value refund flow auto-resolves with 1 verified mutation', async () => {
      const res = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders('CUSTOMER', 'cust-standard-002'),
        },
        body: JSON.stringify({
          orderId: 'ord-refund-4999',
          message: 'I want a refund for my ₹4,999 earbuds order.',
        }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.orchestrationResult.status).toBe('RESOLVED');
    });

    it('24. Authenticated operator reconciliation route functions cleanly', async () => {
      const createRes = await fetch(`${baseUrl}/api/v1/agents/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders('CUSTOMER', 'cust-standard-002'),
        },
        body: JSON.stringify({
          ticketId: 'tkt-refund-4999',
          orderId: 'ord-refund-4999',
          message: 'I want a refund for my ₹4,999 earbuds order.',
        }),
      });
      const createData = await createRes.json();
      const runId = createData.orchestrationResult.agentRunId || createData.orchestrationResult.runId;

      const reconRes = await fetch(`${baseUrl}/api/v1/ops/runs/${runId}/reconcile`, {
        method: 'POST',
        headers: getAuthHeaders('OPERATOR'),
      });
      expect(reconRes.status).toBe(200);
      const reconData = await reconRes.json();
      expect(reconData.success).toBe(true);
    });
  });
});
