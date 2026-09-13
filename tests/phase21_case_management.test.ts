// ResolveX Phase 21 — Customer Experience & Case Management Comprehensive Test Suite

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import app from '../src/backend/server.js';
import { prisma } from '../src/db/client.js';
import { CaseManager } from '../src/cases/CaseManager.js';
import { TimelineEngine } from '../src/cases/TimelineEngine.js';
import { caseRepository } from '../src/db/repositories/caseRepository.js';

let server: http.Server;
let baseUrl: string;

const customerAHeaders = { Authorization: 'Bearer customer-a-token', 'x-tenant-id': 'tenant-a' };
const operatorAHeaders = { Authorization: 'Bearer operator-a-token', 'x-tenant-id': 'tenant-a' };
const customerBHeaders = { Authorization: 'Bearer customer-b-token', 'x-tenant-id': 'tenant-a' };

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address() as any;
      baseUrl = `http://localhost:${addr.port}`;
      resolve();
    });
  });

  // Seed DB records for Phase 21 testing
  await prisma.customer.upsert({
    where: { id: 'cust-primary-001' },
    update: { tenantId: 'tenant-a' },
    create: {
      id: 'cust-primary-001',
      tenantId: 'tenant-a',
      name: 'Alice Phase21',
      email: 'alice.ph21@example.com',
      tier: 'VIP',
    },
  });

  await prisma.customer.upsert({
    where: { id: 'cust-ph21-b' },
    update: { tenantId: 'tenant-a' },
    create: {
      id: 'cust-ph21-b',
      tenantId: 'tenant-a',
      name: 'Bob Phase21',
      email: 'bob.ph21@example.com',
      tier: 'STANDARD',
    },
  });

  await prisma.order.upsert({
    where: { id: 'ord-ph21-1' },
    update: { tenantId: 'tenant-a', customerId: 'cust-primary-001' },
    create: {
      id: 'ord-ph21-1',
      tenantId: 'tenant-a',
      customerId: 'cust-primary-001',
      status: 'DELIVERED',
      totalAmount: 4999,
    },
  });

  await prisma.ticket.upsert({
    where: { id: 'tkt-ph21-1' },
    update: { tenantId: 'tenant-a', customerId: 'cust-primary-001', orderId: 'ord-ph21-1' },
    create: {
      id: 'tkt-ph21-1',
      tenantId: 'tenant-a',
      customerId: 'cust-primary-001',
      orderId: 'ord-ph21-1',
      issueType: 'DAMAGED',
      customerMessage: 'Screen was cracked upon opening box',
      status: 'OPEN',
      priority: 'HIGH',
    },
  });

  await prisma.ticket.upsert({
    where: { id: 'tkt-ph21-2' },
    update: {},
    create: {
      id: 'tkt-ph21-2',
      tenantId: 'tenant-a',
      customerId: 'cust-ph21-b',
      orderId: null,
      issueType: 'WRONG_ITEM',
      customerMessage: 'Received shoes instead of jacket',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      resolutionType: 'REFUND',
    },
  });

  // Seed Tenant B records for cross-tenant isolation testing
  await prisma.customer.upsert({
    where: { id: 'cust-tenant-b-001' },
    update: { tenantId: 'tenant-b' },
    create: {
      id: 'cust-tenant-b-001',
      tenantId: 'tenant-b',
      name: 'Tenant B Customer',
      email: 'customer.tenantb@example.com',
    },
  });

  await prisma.ticket.upsert({
    where: { id: 'tkt-tenant-b-1' },
    update: { tenantId: 'tenant-b', customerId: 'cust-tenant-b-001' },
    create: {
      id: 'tkt-tenant-b-1',
      tenantId: 'tenant-b',
      customerId: 'cust-tenant-b-001',
      issueType: 'NOT_RECEIVED',
      customerMessage: 'Package never delivered to tenant-b address',
      status: 'OPEN',
      priority: 'HIGH',
    },
  });

  // Seed AgentRun with internal traces & sensitive token for redaction testing
  const runWithSecret = await prisma.agentRun.create({
    data: {
      id: 'run-sec-ph21',
      tenantId: 'tenant-a',
      ticketId: 'tkt-ph21-1',
      goal: 'Resolve damaged screen',
      status: 'INVESTIGATING',
      traces: {
        create: [
          {
            step: 'PROMPT_BUILDING',
            type: 'PROMPT',
            title: 'Internal System Prompt',
            description: 'System prompt containing internal reasoning instructions',
            input: 'System prompt with secret_key=supersecret123',
          },
          {
            step: 'INVESTIGATION',
            type: 'INVESTIGATION',
            title: 'Investigating Order Delivery',
            description: 'Order delivery verified with Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 token and secret_key=mysecret',
          },
        ],
      },
    },
  });
});

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

describe('Phase 21 — CaseManager Status Engine & Safety Invariants', () => {
  it('1. maps raw ticket OPEN status to OPEN when no run exists', () => {
    const status = CaseManager.mapStatus({ status: 'OPEN' });
    expect(status).toBe('OPEN');
  });

  it('2. maps WAITING_FOR_CUSTOMER_CONSENT run status to WAITING_FOR_CUSTOMER', () => {
    const status = CaseManager.mapStatus({ status: 'OPEN' }, { status: 'WAITING_FOR_CUSTOMER_CONSENT' });
    expect(status).toBe('WAITING_FOR_CUSTOMER');
  });

  it('3. maps WAITING_FOR_APPROVAL run status to WAITING_FOR_APPROVAL', () => {
    const status = CaseManager.mapStatus({ status: 'OPEN' }, { status: 'WAITING_FOR_APPROVAL' });
    expect(status).toBe('WAITING_FOR_APPROVAL');
  });

  it('4. maps PLANNING run status to INVESTIGATING', () => {
    const status = CaseManager.mapStatus({ status: 'OPEN' }, { status: 'PLANNING' });
    expect(status).toBe('INVESTIGATING');
  });

  it('5. maps INVESTIGATING run status to INVESTIGATING', () => {
    const status = CaseManager.mapStatus({ status: 'OPEN' }, { status: 'INVESTIGATING' });
    expect(status).toBe('INVESTIGATING');
  });

  it('6. maps DECIDING run status to PROCESSING', () => {
    const status = CaseManager.mapStatus({ status: 'OPEN' }, { status: 'DECIDING' });
    expect(status).toBe('PROCESSING');
  });

  it('7. maps ACTING run status to PROCESSING', () => {
    const status = CaseManager.mapStatus({ status: 'OPEN' }, { status: 'ACTING' });
    expect(status).toBe('PROCESSING');
  });

  it('8. maps ESCALATED run status to ESCALATED', () => {
    const status = CaseManager.mapStatus({ status: 'OPEN' }, { status: 'ESCALATED' });
    expect(status).toBe('ESCALATED');
  });

  it('9. maps FAILED run status to FAILED', () => {
    const status = CaseManager.mapStatus({ status: 'OPEN' }, { status: 'FAILED' });
    expect(status).toBe('FAILED');
  });

  it('10. Ground-Truth Resolution Safety: RESOLVED run with verified action maps to RESOLVED', () => {
    const ticket = { status: 'RESOLVED' };
    const run = {
      status: 'RESOLVED',
      actionRecords: [{ executionStatus: 'EXECUTED', verified: true }],
    };
    const status = CaseManager.mapStatus(ticket, run);
    expect(status).toBe('RESOLVED');
  });

  it('11. Ground-Truth Resolution Safety: RESOLVED run with unverified action maps to ESCALATED', () => {
    const ticket = { status: 'RESOLVED' };
    const run = {
      status: 'RESOLVED',
      actionRecords: [{ executionStatus: 'EXECUTED', verified: false }],
    };
    const status = CaseManager.mapStatus(ticket, run);
    expect(status).toBe('ESCALATED');
  });
});

describe('Phase 21 — Resolution Summaries & Redaction Engine', () => {
  it('12. generates refund resolution summary with formatted currency amount', () => {
    const summary = CaseManager.getResolutionSummary('RESOLVED', {
      resolutionType: 'REFUND',
      order: { totalAmount: 4999 },
    });
    expect(summary).toContain('refund of ₹4,999');
  });

  it('13. generates replacement resolution summary', () => {
    const summary = CaseManager.getResolutionSummary('RESOLVED', {
      resolutionType: 'REPLACEMENT',
    });
    expect(summary).toContain('replacement request has been confirmed');
  });

  it('14. generates escalation summary', () => {
    const summary = CaseManager.getResolutionSummary('ESCALATED', {});
    expect(summary).toContain('escalated to our support team');
  });

  it('15. generates waiting customer input summary', () => {
    const summary = CaseManager.getResolutionSummary('WAITING_FOR_CUSTOMER', {});
    expect(summary).toContain('confirmation is required');
  });

  it('16. redacts Bearer authorization tokens', () => {
    const text = 'Authorization token Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 sent';
    const redacted = CaseManager.redactSensitiveText(text);
    expect(redacted).not.toContain('eyJhbGci');
    expect(redacted).toContain('[REDACTED_TOKEN]');
  });

  it('17. redacts secret keys and API keys', () => {
    const text = 'secret_key=supersecret123 and api-key=abc123xyz';
    const redacted = CaseManager.redactSensitiveText(text);
    expect(redacted).not.toContain('supersecret123');
    expect(redacted).not.toContain('abc123xyz');
    expect(redacted).toContain('[REDACTED_SECRET]');
    expect(redacted).toContain('[REDACTED_API_KEY]');
  });
});

describe('Phase 21 — TimelineEngine Boundaries', () => {
  it('18. generates CREATED entry for ticket opening', () => {
    const ticket = {
      id: 'tkt-test-1',
      createdAt: new Date(),
      issueType: 'DAMAGED',
    };
    const timeline = TimelineEngine.generateTimeline(ticket, false);
    expect(timeline.length).toBeGreaterThanOrEqual(1);
    expect(timeline[0].stage).toBe('CREATED');
    expect(timeline[0].actor).toBe('CUSTOMER');
  });

  it('19. filters out internal chain-of-thought traces for customer view', () => {
    const ticket = {
      id: 'tkt-test-2',
      createdAt: new Date(),
      issueType: 'WRONG_ITEM',
      agentRuns: [
        {
          id: 'run-1',
          startedAt: new Date(),
          traces: [
            { id: 'tr-1', step: 'PROMPT_BUILDING', type: 'PROMPT', title: 'Internal System Prompt', description: 'System prompt text' },
            { id: 'tr-2', step: 'INVESTIGATION', type: 'INVESTIGATION', title: 'Order History Lookup', description: 'Verified delivery date' },
          ],
        },
      ],
    };
    const customerTimeline = TimelineEngine.generateTimeline(ticket, false);
    const traceTitles = customerTimeline.map((t) => t.title);
    expect(traceTitles).not.toContain('Internal System Prompt');
    expect(traceTitles).toContain('Order History Lookup');
  });

  it('20. includes internal traces for operator view', () => {
    const ticket = {
      id: 'tkt-test-3',
      createdAt: new Date(),
      issueType: 'WRONG_ITEM',
      agentRuns: [
        {
          id: 'run-1',
          startedAt: new Date(),
          traces: [
            { id: 'tr-1', step: 'PROMPT_BUILDING', type: 'PROMPT', title: 'Internal System Prompt', description: 'System prompt text' },
          ],
        },
      ],
    };
    const operatorTimeline = TimelineEngine.generateTimeline(ticket, true);
    const traceTitles = operatorTimeline.map((t) => t.title);
    expect(traceTitles).toContain('Internal System Prompt');
  });

  it('21. adds EXECUTING_ACTION and VERIFYING events for action records', () => {
    const ticket = {
      id: 'tkt-test-4',
      createdAt: new Date(),
      issueType: 'DAMAGED',
      actionRecords: [
        {
          id: 'act-1',
          actionType: 'REFUND',
          amount: 1500,
          status: 'VERIFIED',
          verified: true,
          createdAt: new Date(),
        },
      ],
    };
    const timeline = TimelineEngine.generateTimeline(ticket, false);
    const stages = timeline.map((t) => t.stage);
    expect(stages).toContain('EXECUTING_ACTION');
    expect(stages).toContain('VERIFYING');
  });

  it('22. includes ESCALATED entry when ticket escalations exist', () => {
    const ticket = {
      id: 'tkt-test-5',
      createdAt: new Date(),
      issueType: 'DAMAGED',
      escalations: [
        { id: 'esc-1', reason: 'High risk customer score', priority: 'HIGH', createdAt: new Date() },
      ],
    };
    const timeline = TimelineEngine.generateTimeline(ticket, false);
    const stages = timeline.map((t) => t.stage);
    expect(stages).toContain('ESCALATED');
  });

  it('23. sorts all timeline entries chronologically ascending', () => {
    const t1 = new Date('2026-09-01T10:00:00Z');
    const t2 = new Date('2026-09-01T11:00:00Z');
    const ticket = {
      id: 'tkt-test-6',
      createdAt: t1,
      issueType: 'DAMAGED',
      actionRecords: [
        { id: 'act-1', actionType: 'REFUND', amount: 500, createdAt: t2 },
      ],
    };
    const timeline = TimelineEngine.generateTimeline(ticket, false);
    expect(new Date(timeline[0].timestamp).getTime()).toBeLessThan(new Date(timeline[1].timestamp).getTime());
  });
});

describe('Phase 21 — CaseRepository Database Query Layer', () => {
  it('24. listCases filters by tenantId', async () => {
    const res = await caseRepository.listCases({ tenantId: 'tenant-a' });
    expect(res.cases.length).toBeGreaterThan(0);
    expect(res.cases.every((c) => c.tenantId === 'tenant-a')).toBe(true);
  });

  it('25. listCases filters by customerId for customer scoping', async () => {
    const res = await caseRepository.listCases({ tenantId: 'tenant-a', customerId: 'cust-primary-001' });
    expect(res.cases.length).toBeGreaterThan(0);
    expect(res.cases.every((c) => c.customerId === 'cust-primary-001')).toBe(true);
  });

  it('26. listCases executes search by caseId', async () => {
    const res = await caseRepository.listCases({ tenantId: 'tenant-a', search: 'tkt-ph21-1' });
    expect(res.cases.length).toBe(1);
    expect(res.cases[0].id).toBe('tkt-ph21-1');
  });

  it('27. listCases calculates pagination metadata', async () => {
    const res = await caseRepository.listCases({ tenantId: 'tenant-a', page: 1, limit: 1 });
    expect(res.limit).toBe(1);
    expect(res.cases.length).toBeLessThanOrEqual(1);
    expect(res.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('28. getCaseById returns detail for authorized customer', async () => {
    const detail = await caseRepository.getCaseById('tkt-ph21-1', 'tenant-a', 'cust-primary-001');
    expect(detail).not.toBeNull();
    expect(detail?.id).toBe('tkt-ph21-1');
  });

  it('29. getCaseById returns null on IDOR access attempt by wrong customer', async () => {
    const detail = await caseRepository.getCaseById('tkt-ph21-1', 'tenant-a', 'cust-ph21-b');
    expect(detail).toBeNull();
  });
});

describe('Phase 21 — HTTP API Integration & RBAC Endpoints', () => {
  it('30. GET /api/v1/cases requires authentication (401 without token)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cases`);
    expect(res.status).toBe(401);
  });

  it('31. GET /api/v1/cases returns 200 and customer-scoped cases for customer token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cases`, { headers: customerAHeaders });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.cases)).toBe(true);
  });

  it('32. GET /api/v1/cases supports search parameter', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cases?search=tkt-ph21-1`, { headers: customerAHeaders });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.cases.length).toBe(1);
    expect(data.cases[0].id).toBe('tkt-ph21-1');
  });

  it('33. GET /api/v1/cases/:id returns case details for owner', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cases/tkt-ph21-1`, { headers: customerAHeaders });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.case.id).toBe('tkt-ph21-1');
  });

  it('34. GET /api/v1/cases/:id enforces IDOR protection (404 for wrong customer)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cases/tkt-ph21-1`, { headers: customerBHeaders });
    expect(res.status).toBe(404);
  });

  it('35. GET /api/v1/cases/:id/timeline returns redacted timeline for customer', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cases/tkt-ph21-1/timeline`, { headers: customerAHeaders });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.timeline)).toBe(true);
  });

  it('36. GET /api/v1/cases/:id/timeline returns complete timeline for operator', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cases/tkt-ph21-1/timeline`, { headers: operatorAHeaders });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.timeline)).toBe(true);
  });
});

describe('Phase 21 — Required Security Validation Suite (Tests 1–8)', () => {
  it('Security Test 1 — Caller tenant spoofing: Principal tenant-a with x-tenant-id: tenant-b remains scoped to tenant-a', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cases`, {
      headers: {
        Authorization: 'Bearer operator-a-token',
        'x-tenant-id': 'tenant-b',
      },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.cases.every((c: any) => c.tenantId === 'tenant-a')).toBe(true);
    expect(data.cases.some((c: any) => c.id === 'tkt-tenant-b-1')).toBe(false);
  });

  it('Security Test 2 — Cross-tenant case access: Principal tenant-a requesting tenant-b case returns 404', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cases/tkt-tenant-b-1`, {
      headers: { Authorization: 'Bearer operator-a-token' },
    });
    expect(res.status).toBe(404);
  });

  it('Security Test 3 — Customer ownership (IDOR): Customer A requesting Customer B case returns 404', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cases/tkt-ph21-2`, {
      headers: { Authorization: 'Bearer customer-a-token' },
    });
    expect(res.status).toBe(404);
  });

  it('Security Test 4 — Operator scope: Operator tenant-a accesses tenant-a case (200) and tenant-b case (404)', async () => {
    const resA = await fetch(`${baseUrl}/api/v1/cases/tkt-ph21-1`, {
      headers: { Authorization: 'Bearer operator-a-token' },
    });
    expect(resA.status).toBe(200);

    const resB = await fetch(`${baseUrl}/api/v1/cases/tkt-tenant-b-1`, {
      headers: { Authorization: 'Bearer operator-a-token' },
    });
    expect(resB.status).toBe(404);
  });

  it('Security Test 5 — Header manipulation: None of x-tenant-id, tenantId, tenant-id, X-Tenant-ID override Principal tenant', async () => {
    const headersList = [
      { Authorization: 'Bearer operator-a-token', 'x-tenant-id': 'tenant-b' },
      { Authorization: 'Bearer operator-a-token', tenantId: 'tenant-b' },
      { Authorization: 'Bearer operator-a-token', 'tenant-id': 'tenant-b' },
      { Authorization: 'Bearer operator-a-token', 'X-Tenant-ID': 'tenant-b' },
    ];

    for (const h of headersList) {
      const res = await fetch(`${baseUrl}/api/v1/cases`, { headers: h });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.cases.every((c: any) => c.tenantId === 'tenant-a')).toBe(true);
      expect(data.cases.some((c: any) => c.id === 'tkt-tenant-b-1')).toBe(false);
    }
  });

  it('Security Test 6 — Unauthenticated access: Missing Authorization header returns 401 for all case endpoints', async () => {
    const r1 = await fetch(`${baseUrl}/api/v1/cases`);
    expect(r1.status).toBe(401);

    const r2 = await fetch(`${baseUrl}/api/v1/cases/tkt-ph21-1`);
    expect(r2.status).toBe(401);

    const r3 = await fetch(`${baseUrl}/api/v1/cases/tkt-ph21-1/timeline`);
    expect(r3.status).toBe(401);
  });

  it('Security Test 7 — Customer timeline privacy: Excludes chain-of-thought, prompts, and redacts credentials', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cases/tkt-ph21-1/timeline`, {
      headers: { Authorization: 'Bearer customer-a-token' },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    const titles = data.timeline.map((t: any) => t.title);
    const descriptions = data.timeline.map((t: any) => t.description).join(' ');

    expect(titles).not.toContain('Internal System Prompt');
    expect(descriptions).not.toContain('eyJhbGci');
    expect(descriptions).not.toContain('supersecret123');
    expect(descriptions).not.toContain('mysecret');
  });

  it('Security Test 8 — Operator timeline security: Exposes operational steps but redacts tokens & secret keys', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cases/tkt-ph21-1/timeline`, {
      headers: { Authorization: 'Bearer operator-a-token' },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    const titles = data.timeline.map((t: any) => t.title);
    const descriptions = data.timeline.map((t: any) => t.description).join(' ');

    expect(titles).toContain('Internal System Prompt');
    expect(descriptions).not.toContain('eyJhbGci');
    expect(descriptions).not.toContain('supersecret123');
    expect(descriptions).not.toContain('mysecret');
    expect(descriptions).toContain('[REDACTED_TOKEN]');
    expect(descriptions).toContain('[REDACTED_SECRET]');
  });
});

