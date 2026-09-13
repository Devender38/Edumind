// ResolveX Production Deployment Phase 1 — Deterministic Production Smoke Test Suite

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import app from '../src/backend/server.js';
import { prisma } from '../src/db/client.js';
import { seedDatabase } from '../src/db/seedDatabase.js';
import { getAuthHeaders } from './helpers/authHelper.js';
import { AgentOrchestrator } from '../src/agents/orchestrator/AgentOrchestrator.js';
import { AdaptiveModelRouter } from '../src/ai/adaptiveModelRouter.js';

describe('Production Deployment Phase 1: Infrastructure Smoke Test Suite', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    await prisma.$connect();
    await seedDatabase();
    await new Promise<void>((resolve) => {
      server = app.listen(5099, () => {
        baseUrl = 'http://localhost:5099';
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((res) => server.close(() => res()));
    }
    await prisma.$disconnect();
  });

  it('1. Backend starts and GET /api/v1/health returns HTTP 200 ok', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.service).toContain('ResolveX');
  });

  it('2. Readiness probe GET /api/v1/health/readiness returns HTTP 200 when system ready', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health/readiness`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('READY');
  });

  it('3. Database connection works and seeds deterministic entities', async () => {
    const ticket = await prisma.ticket.findUnique({ where: { id: 'tkt-damaged-phone-001' } });
    expect(ticket).not.toBeNull();
    expect(ticket?.tenantId).toBe('tenant-a');
  });

  it('4. Authentication works and protected route without token returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ops/runs`);
    expect(res.status).toBe(401);
  });

  it('5. Tenant isolation works: Tenant A approver cannot access Tenant B run', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/runs/run-tenant-b-001/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders('APPROVER', undefined, 'tenant-a'),
      },
      body: JSON.stringify({ decision: 'APPROVE' }),
    });
    expect(res.status).toBe(404); // Hides cross-tenant resource existence
  });

  it('6. AI Model Router executes advisory classification safely', async () => {
    const decision = AdaptiveModelRouter.routeRequest('I want a refund for my phone', 'run-smoke-001', 'tenant-a');
    expect(decision.selectedProvider).toBeDefined();
    expect(decision.budgetState).toBe('AVAILABLE');
  });

  it('7. AI Advisory Level Invariant: Zero direct DB mutation authority by AI model', () => {
    const authority = AdaptiveModelRouter.getInstance().getAuthorityLevel();
    expect(authority).toBe('ADVISORY_ONLY');
  });

  it('8. Approval Gate: High-value refund (>₹10,000) halts at WAITING_FOR_APPROVAL with 0 mutations', async () => {
    const run = await AgentOrchestrator.run({
      ticketId: 'tkt-damaged-phone-001',
      orderId: 'ord-phone-24999',
      customerId: 'cust-primary-001',
      goal: 'I want a refund for ₹24,999 phone',
    });
    expect(run.status).toBe('WAITING_FOR_APPROVAL');
    expect(run.currentStep).toBe('DECISION_FORMULATION');

    const txs = await prisma.refundTransaction.findMany({ where: { orderId: 'ord-phone-24999' } });
    expect(txs.length).toBe(0);
  });

  it('9. Consent Gate: Replacement SKU swap halts at WAITING_FOR_CUSTOMER_CONSENT', async () => {
    const run = await AgentOrchestrator.run({
      ticketId: 'tkt-damaged-phone-001',
      orderId: 'ord-phone-24999',
      customerId: 'cust-primary-001',
      goal: 'I want replacement phone ord-phone-24999',
    });
    expect(run.status).toBe('WAITING_FOR_CUSTOMER_CONSENT');
  });

  it('10. Ground-Truth Verification Guard confirms DB transaction before RESOLVED state', async () => {
    const run = await AgentOrchestrator.run({
      ticketId: 'tkt-earbuds-001',
      orderId: 'ord-refund-4999',
      customerId: 'cust-primary-001',
      goal: 'I want a refund for ₹4,999 earbuds',
    });
    expect(run.status).toBe('RESOLVED');

    const txs = await prisma.refundTransaction.findMany({ where: { orderId: 'ord-refund-4999' } });
    expect(txs.length).toBe(1);
    expect(txs[0].amount).toBe(4999);
  });

  it('11. Operational Prometheus Metrics are available via GET /api/v1/enterprise/metrics/prometheus', async () => {
    const res = await fetch(`${baseUrl}/api/v1/enterprise/metrics/prometheus`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('resolvex_');
  });
});
