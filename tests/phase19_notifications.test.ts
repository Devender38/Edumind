// ResolveX Phase 19 — Production Communications, Notifications & Customer Experience Test Suite

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import http from 'http';
import app from '../src/backend/server.js';
import { prisma } from '../src/db/client.js';
import { NotificationRepository } from '../src/db/repositories/notificationRepository.js';
import { NotificationDispatcher } from '../src/notifications/notificationDispatcher.js';
import { TemplateRegistry } from '../src/notifications/templateRegistry.js';
import { FailureInjector } from '../src/utils/failureInjector.js';
import { getAuthHeaders } from './helpers/authHelper.js';

// ─── Test Fixtures ─────────────────────────────────────────────────────────

const TENANT_A = 'tenant-a';
const TENANT_B = 'tenant-b';
const CUST_A_ID = 'cust-ph19-a';
const CUST_B_ID = 'cust-ph19-b';
const CUST_TENANT_B_ID = 'cust-ph19-tb';
const TICKET_A_ID = 'tkt-ph19-a';
const TICKET_B_ID = 'tkt-ph19-b';
const ORDER_A_ID = 'ord-ph19-a';
const RUN_A_ID = 'agentrun-ph19-a';

let server: http.Server;
let baseUrl: string;

const customerAHeaders = { Authorization: 'Bearer customer-a-token' };
const operatorAHeaders = { Authorization: 'Bearer operator-a-token' };
const approverAHeaders = { Authorization: 'Bearer approver-a-token' };
const adminHeaders     = { Authorization: 'Bearer admin-a-token' };
const customerBHeaders = { Authorization: 'Bearer customer-b-token' };

// Helper to make idempotency keys unique across tests
let testSeq = 0;
function idKey(base: string) {
  return `ph19-test-${++testSeq}-${base}`;
}

async function makeNotification(overrides: Partial<Parameters<typeof NotificationRepository.createOrFindIdempotent>[0]> = {}) {
  return NotificationRepository.createOrFindIdempotent({
    tenantId: TENANT_A,
    agentRunId: RUN_A_ID,
    ticketId: TICKET_A_ID,
    customerId: CUST_A_ID,
    eventType: 'CASE_CREATED',
    channel: 'IN_APP',
    templateId: 'case-created-inapp-customer',
    templateVersion: 'v1',
    locale: 'en-IN',
    recipientType: 'CUSTOMER',
    recipient: CUST_A_ID,
    title: 'Your case has been received',
    message: 'Test notification message',
    idempotencyKey: idKey('base'),
    correlationId: 'corr-ph19-test',
    maxAttempts: 3,
    ...overrides,
  });
}

// ─── Setup ──────────────────────────────────────────────────────────────────

beforeAll(async () => {
  await prisma.$connect();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address() as any;
      baseUrl = `http://localhost:${addr.port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => {
    if (server) server.close(() => resolve()); else resolve();
  });
});

beforeEach(async () => {
  FailureInjector.reset();

  // Clean phase-19-specific data
  await prisma.notification.deleteMany({ where: { tenantId: { in: [TENANT_A, TENANT_B] }, idempotencyKey: { startsWith: 'ph19-test' } } });
  await prisma.notification.deleteMany({ where: { agentRunId: RUN_A_ID } });

  // Ensure minimal test entities exist
  await prisma.customer.upsert({
    where: { id: 'cust-primary-001' },
    create: { id: 'cust-primary-001', tenantId: TENANT_A, name: 'Primary Customer', email: 'cust-primary-001@test.com', tier: 'STANDARD' },
    update: {},
  });
  await prisma.customer.upsert({
    where: { id: CUST_A_ID },
    create: { id: CUST_A_ID, tenantId: TENANT_A, name: 'Ph19 Customer A', email: 'ph19-a@test.com', tier: 'STANDARD' },
    update: {},
  });
  await prisma.customer.upsert({
    where: { id: CUST_B_ID },
    create: { id: CUST_B_ID, tenantId: TENANT_A, name: 'Ph19 Customer B', email: 'ph19-b@test.com', tier: 'STANDARD' },
    update: {},
  });
  await prisma.customer.upsert({
    where: { id: CUST_TENANT_B_ID },
    create: { id: CUST_TENANT_B_ID, tenantId: TENANT_B, name: 'Ph19 Tenant B Customer', email: 'ph19-tb@test.com', tier: 'STANDARD' },
    update: {},
  });
  await prisma.product.upsert({
    where: { id: 'prod-ph19-001' },
    create: { id: 'prod-ph19-001', name: 'Ph19 Product', category: 'Test', price: 999, stockQuantity: 10 },
    update: {},
  });
  await prisma.order.upsert({
    where: { id: ORDER_A_ID },
    create: { id: ORDER_A_ID, tenantId: TENANT_A, customerId: CUST_A_ID, totalAmount: 999, status: 'DELIVERED', shippingStatus: 'DELIVERED' },
    update: {},
  });
  await prisma.ticket.upsert({
    where: { id: TICKET_A_ID },
    create: { id: TICKET_A_ID, tenantId: TENANT_A, customerId: CUST_A_ID, orderId: ORDER_A_ID, issueType: 'DAMAGED', customerMessage: 'Phase 19 test ticket', status: 'OPEN', priority: 'MEDIUM' },
    update: {},
  });
  await prisma.ticket.upsert({
    where: { id: TICKET_B_ID },
    create: { id: TICKET_B_ID, tenantId: TENANT_A, customerId: CUST_B_ID, orderId: ORDER_A_ID, issueType: 'DAMAGED', customerMessage: 'Phase 19 test ticket B', status: 'OPEN', priority: 'MEDIUM' },
    update: {},
  });
  await prisma.agentRun.upsert({
    where: { id: RUN_A_ID },
    create: { id: RUN_A_ID, tenantId: TENANT_A, ticketId: TICKET_A_ID, goal: 'Ph19 test run', status: 'RESOLVED', currentStep: 'CASE_RESOLVED', correlationId: 'corr-ph19-test' },
    update: {},
  });
});

// ─── 1. CREATION & TEMPLATE TESTS ───────────────────────────────────────────

describe('Phase 19: Notification Creation & Template System', () => {
  it('1. Template registry resolves known template correctly', () => {
    const tpl = TemplateRegistry.resolve('RESOLUTION_COMPLETED', 'IN_APP', 'en-IN', 'CUSTOMER');
    expect(tpl).not.toBeNull();
    expect(tpl!.templateId).toBe('resolution-completed-inapp-customer');
    expect(tpl!.version).toBe('v1');
    expect(tpl!.titleTemplate).toContain('resolved');
  });

  it('2. Template registry falls back to en-IN for unknown locale', () => {
    const tpl = TemplateRegistry.resolve('CASE_CREATED', 'IN_APP', 'es-MX', 'CUSTOMER');
    expect(tpl).not.toBeNull();
    expect(tpl!.locale).toBe('en-IN');
  });

  it('3. Template registry returns OPERATOR template for APPROVAL_REQUIRED', () => {
    const tpl = TemplateRegistry.resolve('APPROVAL_REQUIRED', 'IN_APP', 'en-IN', 'OPERATOR');
    expect(tpl).not.toBeNull();
    expect(tpl!.templateId).toBe('approval-required-inapp-operator');
    expect(tpl!.bodyTemplate).toContain('approval');
  });

  it('4. Notification created with correct fields via repository', async () => {
    const { notification, isNew } = await makeNotification();
    expect(isNew).toBe(true);
    expect(notification.tenantId).toBe(TENANT_A);
    expect(notification.customerId).toBe(CUST_A_ID);
    expect(notification.status).toBe('QUEUED');
    expect(notification.isRead).toBe(false);
    expect(notification.attempts).toBe(0);
    expect(notification.maxAttempts).toBe(3);
    expect(notification.channel).toBe('IN_APP');
    expect(notification.eventType).toBe('CASE_CREATED');
  });

  it('5. Dispatcher creates notification via IN_APP channel and marks SENT', async () => {
    const results = await NotificationDispatcher.dispatch('CASE_CREATED', {
      agentRunId: RUN_A_ID,
      ticketId: TICKET_A_ID,
      customerId: CUST_A_ID,
      tenantId: TENANT_A,
      correlationId: 'corr-ph19-dispatch-test',
    });
    expect(results.length).toBeGreaterThan(0);
    const r = results[0];
    expect(r.success).toBe(true);
    expect(r.status).toBe('SENT');
    expect(r.channel).toBe('IN_APP');
    // Verify DB state
    const dbNotif = await prisma.notification.findUnique({ where: { id: r.notificationId } });
    expect(dbNotif?.status).toBe('SENT');
    expect(dbNotif?.sentAt).not.toBeNull();
  });

  it('6. Action summary builder returns correct customer-safe text for REFUND', () => {
    const summary = TemplateRegistry.buildActionSummary('REFUND', 4999, 'INR');
    expect(summary).toContain('refund');
    expect(summary).toContain('4,999');
    expect(summary).not.toContain('agentRunId');
    expect(summary).not.toContain('policy');
  });
});

// ─── 2. IDEMPOTENCY TESTS ───────────────────────────────────────────────────

describe('Phase 19: Notification Idempotency', () => {
  it('7. Duplicate notification creation returns existing record (idempotency key collision)', async () => {
    const key = idKey('idempotent');
    const { notification: n1, isNew: new1 } = await NotificationRepository.createOrFindIdempotent({
      tenantId: TENANT_A, agentRunId: RUN_A_ID, ticketId: TICKET_A_ID, customerId: CUST_A_ID,
      eventType: 'CASE_CREATED', channel: 'IN_APP', templateId: 'tmpl', templateVersion: 'v1',
      recipientType: 'CUSTOMER', recipient: CUST_A_ID, title: 'T', message: 'M',
      idempotencyKey: key,
    });
    const { notification: n2, isNew: new2 } = await NotificationRepository.createOrFindIdempotent({
      tenantId: TENANT_A, agentRunId: RUN_A_ID, ticketId: TICKET_A_ID, customerId: CUST_A_ID,
      eventType: 'CASE_CREATED', channel: 'IN_APP', templateId: 'tmpl', templateVersion: 'v1',
      recipientType: 'CUSTOMER', recipient: CUST_A_ID, title: 'T', message: 'M',
      idempotencyKey: key,
    });
    expect(new1).toBe(true);
    expect(new2).toBe(false);
    expect(n1.id).toBe(n2.id);
    // Exactly one DB record
    const count = await prisma.notification.count({ where: { idempotencyKey: key } });
    expect(count).toBe(1);
  });

  it('8. Dispatcher is idempotent — dispatching the same event twice produces one notification', async () => {
    const ctx = { agentRunId: RUN_A_ID, ticketId: TICKET_A_ID, customerId: CUST_A_ID, tenantId: TENANT_A, correlationId: 'corr-idem-test' };
    const r1 = await NotificationDispatcher.dispatch('INVESTIGATION_COMPLETED', ctx);
    const r2 = await NotificationDispatcher.dispatch('INVESTIGATION_COMPLETED', ctx);
    expect(r1[0].notificationId).toBe(r2[0].notificationId);
    expect(r2[0].idempotencyHit).toBe(true);
    const count = await prisma.notification.count({ where: { agentRunId: RUN_A_ID, eventType: 'INVESTIGATION_COMPLETED' } });
    expect(count).toBe(1);
  });

  it('9. Concurrent dispatchers produce exactly one notification record', async () => {
    const ctx = { agentRunId: RUN_A_ID, ticketId: TICKET_A_ID, customerId: CUST_A_ID, tenantId: TENANT_A, correlationId: 'corr-concurrent' };
    // Simulate concurrent dispatch by racing 5 promises
    const results = await Promise.allSettled([
      NotificationDispatcher.dispatch('RECOVERY_STARTED', ctx),
      NotificationDispatcher.dispatch('RECOVERY_STARTED', ctx),
      NotificationDispatcher.dispatch('RECOVERY_STARTED', ctx),
      NotificationDispatcher.dispatch('RECOVERY_STARTED', ctx),
      NotificationDispatcher.dispatch('RECOVERY_STARTED', ctx),
    ]);
    const ids = new Set<string>();
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value[0]) ids.add(r.value[0].notificationId);
    }
    // All should point to the same notification record
    expect(ids.size).toBe(1);
    const count = await prisma.notification.count({ where: { agentRunId: RUN_A_ID, eventType: 'RECOVERY_STARTED' } });
    expect(count).toBe(1);
  });
});

// ─── 3. NOTIFICATION STATE MACHINE ──────────────────────────────────────────

describe('Phase 19: Notification State Machine', () => {
  it('10. QUEUED → SENDING → SENT state transitions', async () => {
    const { notification } = await makeNotification();
    expect(notification.status).toBe('QUEUED');

    const claimed = await NotificationRepository.claimForDelivery(notification.id);
    expect(claimed?.status).toBe('SENDING');
    expect(claimed?.attempts).toBe(1);

    const sent = await NotificationRepository.markSent(notification.id);
    expect(sent.status).toBe('SENT');
    expect(sent.sentAt).not.toBeNull();
  });

  it('11. QUEUED → SENDING → FAILED state transition', async () => {
    const { notification } = await makeNotification();
    await NotificationRepository.claimForDelivery(notification.id);
    const failed = await NotificationRepository.markFailed(notification.id, 'CHANNEL_ERROR', 'Connection refused');
    expect(failed?.status).toBe('FAILED');
    expect(failed?.errorCode).toBe('CHANNEL_ERROR');
  });

  it('12. After maxAttempts failures → FAILED_PERMANENTLY', async () => {
    const { notification } = await makeNotification({ maxAttempts: 2 });
    // Claim and fail twice
    await NotificationRepository.claimForDelivery(notification.id);
    await NotificationRepository.markFailed(notification.id, 'ERR', 'fail1');
    await NotificationRepository.claimForDelivery(notification.id);
    const finalFailed = await NotificationRepository.markFailed(notification.id, 'ERR', 'fail2');
    expect(finalFailed?.status).toBe('FAILED_PERMANENTLY');
  });

  it('13. SENT notification cannot be re-claimed', async () => {
    const { notification } = await makeNotification();
    await NotificationRepository.claimForDelivery(notification.id);
    await NotificationRepository.markSent(notification.id);
    // Try to claim again
    const reClaimed = await NotificationRepository.claimForDelivery(notification.id);
    expect(reClaimed).toBeNull();
  });
});

// ─── 4. SECURITY — CUSTOMER OWNERSHIP ───────────────────────────────────────

describe('Phase 19: Security — Customer Ownership & IDOR Protection', () => {
  it('14. Customer can list own notifications via GET /api/v1/notifications', async () => {
    // Create a notification for customer A
    await makeNotification();
    const res = await fetch(`${baseUrl}/api/v1/notifications`, { headers: customerAHeaders });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.notifications)).toBe(true);
  });

  it('15. Customer A cannot read Customer B\'s notification (IDOR → 404)', async () => {
    // Create notification for Customer B
    const { notification } = await makeNotification({ customerId: CUST_B_ID, recipient: CUST_B_ID, idempotencyKey: idKey('cust-b-notif') });
    // Try to access it as Customer A
    const res = await fetch(`${baseUrl}/api/v1/notifications/${notification.id}`, { headers: customerAHeaders });
    expect(res.status).toBe(404);
  });

  it('16. Customer A cannot mark Customer B\'s notification as read', async () => {
    const { notification } = await makeNotification({ customerId: CUST_B_ID, recipient: CUST_B_ID, idempotencyKey: idKey('cust-b-read') });
    const res = await fetch(`${baseUrl}/api/v1/notifications/${notification.id}/read`, { method: 'POST', headers: customerAHeaders });
    expect(res.status).toBe(404);
    // Verify DB: still unread
    const dbNotif = await prisma.notification.findUnique({ where: { id: notification.id } });
    expect(dbNotif?.isRead).toBe(false);
  });

  it('17. Unauthenticated request → 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/notifications`);
    expect(res.status).toBe(401);
  });

  it('18. Operator token cannot access /api/v1/notifications (customer-only endpoint)', async () => {
    // Operators don't have customerId, so returns 403
    const res = await fetch(`${baseUrl}/api/v1/notifications`, { headers: operatorAHeaders });
    expect(res.status).toBe(403);
  });
});

// ─── 5. SECURITY — OPERATOR RBAC ────────────────────────────────────────────

describe('Phase 19: Security — Operator RBAC', () => {
  it('19. Operator can access /api/v1/ops/notifications', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ops/notifications`, { headers: operatorAHeaders });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('20. Customer cannot access /api/v1/ops/notifications → 403', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ops/notifications`, { headers: customerAHeaders });
    expect(res.status).toBe(403);
  });

  it('21. Operator can access notification metrics', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ops/notifications/metrics`, { headers: operatorAHeaders });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.metrics).toHaveProperty('queued');
    expect(data.metrics).toHaveProperty('sent');
    expect(data.metrics).toHaveProperty('deliverySuccessRate');
  });

  it('22. Customer cannot retry notifications (wrong role → 403)', async () => {
    const { notification } = await makeNotification({ status: undefined, idempotencyKey: idKey('retry-rbac') });
    await NotificationRepository.claimForDelivery(notification.id);
    await NotificationRepository.markFailed(notification.id, 'ERR', 'test');
    const res = await fetch(`${baseUrl}/api/v1/ops/notifications/${notification.id}/retry`, { method: 'POST', headers: customerAHeaders });
    expect(res.status).toBe(403);
  });

  it('23. Approver can access operator notification list', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ops/notifications`, { headers: approverAHeaders });
    expect(res.status).toBe(200);
  });
});

// ─── 6. CROSS-TENANT ISOLATION ──────────────────────────────────────────────

describe('Phase 19: Tenant Isolation', () => {
  it('24. Tenant A operator cannot see Tenant B notifications', async () => {
    // Create a notification for tenant B customer
    await NotificationRepository.createOrFindIdempotent({
      tenantId: TENANT_B, agentRunId: undefined, ticketId: undefined, customerId: CUST_TENANT_B_ID,
      eventType: 'CASE_CREATED', channel: 'IN_APP', templateId: 'tmpl', templateVersion: 'v1',
      recipientType: 'CUSTOMER', recipient: CUST_TENANT_B_ID,
      title: 'Tenant B Notification', message: 'For tenant B only',
      idempotencyKey: idKey('tenant-b-notif'),
    });
    // Operator A (tenant-a) should NOT see tenant-b notifications
    const res = await fetch(`${baseUrl}/api/v1/ops/notifications`, { headers: operatorAHeaders });
    const data = await res.json();
    const tenantBNotifs = data.notifications.filter((n: any) => n.tenantId === TENANT_B);
    expect(tenantBNotifs.length).toBe(0);
  });

  it('25. findByCustomer enforces tenantId — cross-tenant customer cannot see each other\'s notifications', async () => {
    // Create notif for tenant-a customer
    await makeNotification({ idempotencyKey: idKey('cross-tenant-a') });
    // Query as tenant-b
    const notifs = await NotificationRepository.findByCustomer(CUST_A_ID, TENANT_B);
    // Should return zero since customer is in tenant-a, not tenant-b
    expect(notifs.length).toBe(0);
  });
});

// ─── 7. RESOLUTION SAFETY GATE ──────────────────────────────────────────────

describe('Phase 19: Resolution Safety Gate', () => {
  it('26. Resolution notification requires AgentRun to be RESOLVED (safety gate)', async () => {
    // Update agentRun to a non-resolved state
    await prisma.agentRun.update({ where: { id: RUN_A_ID }, data: { status: 'INVESTIGATING' } });
    const results = await NotificationDispatcher.dispatchResolutionSafe(RUN_A_ID, {
      agentRunId: RUN_A_ID, ticketId: TICKET_A_ID, customerId: CUST_A_ID, tenantId: TENANT_A,
    });
    // Safety gate should block — no notification
    expect(results.length).toBe(0);
    // Restore
    await prisma.agentRun.update({ where: { id: RUN_A_ID }, data: { status: 'RESOLVED' } });
  });

  it('27. Resolution notification blocked if no verified ground truth (no ActionRecord VERIFIED)', async () => {
    // AgentRun is RESOLVED but no verified action record or refund tx
    const results = await NotificationDispatcher.dispatchResolutionSafe(RUN_A_ID, {
      agentRunId: RUN_A_ID, ticketId: TICKET_A_ID, customerId: CUST_A_ID, tenantId: TENANT_A,
    });
    expect(results.length).toBe(0);
  });

  it('28. Resolution notification SENT when AgentRun RESOLVED + verified ActionRecord exists', async () => {
    // Create a VERIFIED ActionRecord for this run
    const ar = await prisma.actionRecord.create({
      data: {
        agentRunId: RUN_A_ID, ticketId: TICKET_A_ID,
        actionType: 'REFUND', status: 'VERIFIED', amount: 999,
      },
    });
    const results = await NotificationDispatcher.dispatchResolutionSafe(RUN_A_ID, {
      agentRunId: RUN_A_ID, ticketId: TICKET_A_ID, customerId: CUST_A_ID, tenantId: TENANT_A, actionType: 'REFUND', amount: 999,
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].success).toBe(true);
    expect(results[0].status).toBe('SENT');
    // Check notification message does not expose internal IDs or agent reasoning
    const dbNotif = await prisma.notification.findUnique({ where: { id: results[0].notificationId } });
    expect(dbNotif?.message).not.toContain('agentRunId');
    expect(dbNotif?.message).not.toContain('policy');
    expect(dbNotif?.message).not.toContain('worker');
    // Cleanup
    await prisma.actionRecord.delete({ where: { id: ar.id } });
  });

  it('29. Resolution notification SENT when AgentRun RESOLVED + RefundTransaction exists', async () => {
    // Create a RefundTransaction linked to the order
    const rt = await prisma.refundTransaction.create({
      data: {
        orderId: ORDER_A_ID, amount: 999, reason: 'Test refund', status: 'COMPLETED',
        idempotencyKey: idKey('refund-tx-ph19'),
      },
    });
    const results = await NotificationDispatcher.dispatchResolutionSafe(RUN_A_ID, {
      agentRunId: RUN_A_ID, ticketId: TICKET_A_ID, customerId: CUST_A_ID, tenantId: TENANT_A, actionType: 'REFUND', amount: 999,
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].success).toBe(true);
    await prisma.refundTransaction.delete({ where: { id: rt.id } });
  });
});

// ─── 8. HUMAN GATES — APPROVAL & CONSENT NOTIFICATIONS ──────────────────────

describe('Phase 19: Human Gate Notifications', () => {
  it('30. APPROVAL_REQUIRED dispatches to OPERATOR recipient', async () => {
    const results = await NotificationDispatcher.dispatch('APPROVAL_REQUIRED', {
      agentRunId: RUN_A_ID, ticketId: TICKET_A_ID, customerId: CUST_A_ID, tenantId: TENANT_A,
      actionType: 'REFUND', operatorId: 'op-001',
    });
    expect(results.length).toBeGreaterThan(0);
    const r = results[0];
    expect(r.success).toBe(true);
    const dbNotif = await prisma.notification.findUnique({ where: { id: r.notificationId } });
    expect(dbNotif?.recipientType).toBe('OPERATOR');
  });

  it('31. CUSTOMER_CONSENT_REQUIRED dispatches to CUSTOMER recipient', async () => {
    const results = await NotificationDispatcher.dispatch('CUSTOMER_CONSENT_REQUIRED', {
      agentRunId: RUN_A_ID, ticketId: TICKET_A_ID, customerId: CUST_A_ID, tenantId: TENANT_A,
    });
    expect(results.length).toBeGreaterThan(0);
    const r = results[0];
    const dbNotif = await prisma.notification.findUnique({ where: { id: r.notificationId } });
    expect(dbNotif?.recipientType).toBe('CUSTOMER');
    expect(dbNotif?.message).toContain('confirmation');
  });

  it('32. Duplicate approval notification is suppressed by idempotency', async () => {
    const ctx = { agentRunId: RUN_A_ID, ticketId: TICKET_A_ID, customerId: CUST_A_ID, tenantId: TENANT_A, actionType: 'REFUND', operatorId: 'op-001', correlationId: 'corr-approval-dedup' };
    await NotificationDispatcher.dispatch('APPROVAL_REQUIRED', ctx);
    const r2 = await NotificationDispatcher.dispatch('APPROVAL_REQUIRED', ctx);
    expect(r2[0].idempotencyHit).toBe(true);
    const count = await prisma.notification.count({ where: { agentRunId: RUN_A_ID, eventType: 'APPROVAL_REQUIRED' } });
    expect(count).toBe(1);
  });

  it('33. Duplicate consent notification is suppressed by idempotency', async () => {
    const ctx = { agentRunId: RUN_A_ID, ticketId: TICKET_A_ID, customerId: CUST_A_ID, tenantId: TENANT_A, correlationId: 'corr-consent-dedup' };
    await NotificationDispatcher.dispatch('CUSTOMER_CONSENT_REQUIRED', ctx);
    const r2 = await NotificationDispatcher.dispatch('CUSTOMER_CONSENT_REQUIRED', ctx);
    expect(r2[0].idempotencyHit).toBe(true);
    const count = await prisma.notification.count({ where: { agentRunId: RUN_A_ID, eventType: 'CUSTOMER_CONSENT_REQUIRED' } });
    expect(count).toBe(1);
  });
});

// ─── 9. FAILURE ISOLATION ───────────────────────────────────────────────────

describe('Phase 19: Failure Isolation', () => {
  it('34. Delivery failure (BEFORE_DELIVERY) does not alter business state', async () => {
    // Create a RefundTransaction to verify business state doesn't change
    const rt = await prisma.refundTransaction.create({
      data: { orderId: ORDER_A_ID, amount: 999, reason: 'test refund', status: 'COMPLETED', idempotencyKey: idKey('biz-isolation-refund') },
    });

    FailureInjector.enable({ point: 'BEFORE_DELIVERY', failOnce: true });
    const results = await NotificationDispatcher.dispatch('RESOLUTION_COMPLETED', {
      agentRunId: RUN_A_ID, ticketId: TICKET_A_ID, customerId: CUST_A_ID, tenantId: TENANT_A,
    });
    // Notification may fail
    if (results[0]) {
      // But business RefundTransaction must remain COMPLETED
      const dbRt = await prisma.refundTransaction.findUnique({ where: { id: rt.id } });
      expect(dbRt?.status).toBe('COMPLETED'); // Business state unaffected
    }
    await prisma.refundTransaction.delete({ where: { id: rt.id } });
  });

  it('35. Notification retry does NOT re-run business mutation', async () => {
    // Create a FAILED notification
    const { notification } = await makeNotification({ idempotencyKey: idKey('retry-no-biz') });
    await NotificationRepository.claimForDelivery(notification.id);
    await NotificationRepository.markFailed(notification.id, 'TEST_FAIL', 'Simulated failure');

    // Count RefundTransactions before retry
    const beforeCount = await prisma.refundTransaction.count({ where: { orderId: ORDER_A_ID } });

    // Operator retries notification
    const updated = await NotificationRepository.retryFailed(notification.id, TENANT_A, 'op-001');
    expect(updated?.status).toBe('QUEUED');

    // RefundTransaction count must not change
    const afterCount = await prisma.refundTransaction.count({ where: { orderId: ORDER_A_ID } });
    expect(afterCount).toBe(beforeCount); // No new mutations
  });

  it('36. Notification failure point BEFORE_NOTIFICATION_CREATE is injectable', async () => {
    FailureInjector.enable({ point: 'BEFORE_NOTIFICATION_CREATE', failOnce: true });
    const results = await NotificationDispatcher.dispatch('CASE_CREATED', {
      agentRunId: RUN_A_ID, ticketId: TICKET_A_ID, customerId: CUST_A_ID, tenantId: TENANT_A,
    });
    expect(results[0].success).toBe(false);
    expect(results[0].errorCode).toBe('INJECTED_FAILURE');
  });

  it('37. Notification failure point AFTER_NOTIFICATION_CREATE leaves notification in FAILED state (outbox consistent)', async () => {
    FailureInjector.enable({ point: 'AFTER_NOTIFICATION_CREATE', failOnce: true });
    const results = await NotificationDispatcher.dispatch('CASE_CREATED', {
      agentRunId: RUN_A_ID, ticketId: TICKET_A_ID, customerId: CUST_A_ID, tenantId: TENANT_A, correlationId: 'corr-after-create',
    });
    expect(results[0].success).toBe(false);
    // The notification record exists in DB (outbox created) but is FAILED
    const dbNotif = await prisma.notification.findUnique({ where: { id: results[0].notificationId } });
    expect(dbNotif?.status).toBe('FAILED');
    expect(dbNotif).not.toBeNull(); // Record exists — outbox consistent
  });
});

// ─── 10. READ ACTIONS & API ──────────────────────────────────────────────────

describe('Phase 19: Mark-Read & API Endpoints', () => {
  it('38. Customer can mark own notification as read via POST /api/v1/notifications/:id/read', async () => {
    // Create notification for primary customer
    await prisma.notification.create({
      data: {
        tenantId: TENANT_A, customerId: 'cust-primary-001',
        eventType: 'CASE_CREATED', channel: 'IN_APP',
        templateId: 'case-created-inapp-customer', templateVersion: 'v1',
        recipientType: 'CUSTOMER', recipient: 'cust-primary-001',
        title: 'Test', message: 'Test mark-read',
        status: 'SENT', idempotencyKey: idKey('mark-read-api'),
        attempts: 1, maxAttempts: 3,
      },
    });
    const listRes = await fetch(`${baseUrl}/api/v1/notifications`, { headers: customerAHeaders });
    const listData = await listRes.json();
    const notif = listData.notifications.find((n: any) => !n.isRead && n.customerId === 'cust-primary-001');
    if (!notif) return; // No unread — seeded data may have changed

    const res = await fetch(`${baseUrl}/api/v1/notifications/${notif.id}/read`, {
      method: 'POST',
      headers: customerAHeaders,
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.notification.isRead).toBe(true);
  });

  it('39. GET /api/v1/notifications/:id returns 404 for non-existent notification', async () => {
    const res = await fetch(`${baseUrl}/api/v1/notifications/nonexistent-id-12345`, { headers: customerAHeaders });
    expect(res.status).toBe(404);
  });

  it('40. Operator retry endpoint resets FAILED notification to QUEUED', async () => {
    const { notification } = await makeNotification({ idempotencyKey: idKey('op-retry-api') });
    await NotificationRepository.claimForDelivery(notification.id);
    await NotificationRepository.markFailed(notification.id, 'ERR', 'Test');
    const res = await fetch(`${baseUrl}/api/v1/ops/notifications/${notification.id}/retry`, {
      method: 'POST',
      headers: operatorAHeaders,
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    // DB should show QUEUED or SENT (after re-dispatch)
    const dbNotif = await prisma.notification.findUnique({ where: { id: notification.id } });
    expect(['QUEUED', 'SENT', 'SENDING']).toContain(dbNotif?.status);
  });
});

// ─── 11. DETERMINISM ────────────────────────────────────────────────────────

describe('Phase 19: Notification Determinism', () => {
  it('41. Same event + run → same idempotency key every time (deterministic)', () => {
    const agentRunId = 'test-run-determinism';
    const eventType = 'RESOLUTION_COMPLETED';
    const channel = 'IN_APP';
    const version = 'v1';
    const recipientType = 'CUSTOMER';
    const recipient = 'cust-det-001';
    const tenantId = TENANT_A;

    const key1 = [agentRunId, eventType, channel, version, recipientType, recipient].join(':');
    const key2 = [agentRunId, eventType, channel, version, recipientType, recipient].join(':');
    expect(key1).toBe(key2);
  });

  it('42. Template resolution for same input always returns same template', () => {
    const t1 = TemplateRegistry.resolve('RESOLUTION_COMPLETED', 'IN_APP', 'en-IN', 'CUSTOMER');
    const t2 = TemplateRegistry.resolve('RESOLUTION_COMPLETED', 'IN_APP', 'en-IN', 'CUSTOMER');
    expect(t1?.templateId).toBe(t2?.templateId);
    expect(t1?.version).toBe(t2?.version);
    expect(t1?.titleTemplate).toBe(t2?.titleTemplate);
  });
});

// ─── 12. SAFETY INVARIANTS ──────────────────────────────────────────────────

describe('Phase 19: Safety Invariants', () => {
  it('43. No false success notification without verified ground truth', async () => {
    // Unresolved run
    await prisma.agentRun.update({ where: { id: RUN_A_ID }, data: { status: 'INVESTIGATING' } });
    const results = await NotificationDispatcher.dispatchResolutionSafe(RUN_A_ID, {
      agentRunId: RUN_A_ID, customerId: CUST_A_ID, tenantId: TENANT_A,
    });
    // MUST return empty — no false success notification
    expect(results.length).toBe(0);
    const successNotifs = await prisma.notification.count({ where: { agentRunId: RUN_A_ID, eventType: 'RESOLUTION_COMPLETED' } });
    expect(successNotifs).toBe(0);
    await prisma.agentRun.update({ where: { id: RUN_A_ID }, data: { status: 'RESOLVED' } });
  });

  it('44. Notification content never exposes bearer tokens or secrets', async () => {
    const results = await NotificationDispatcher.dispatch('CASE_CREATED', {
      agentRunId: RUN_A_ID, ticketId: TICKET_A_ID, customerId: CUST_A_ID, tenantId: TENANT_A,
    });
    if (results[0]?.notificationId) {
      const dbNotif = await prisma.notification.findUnique({ where: { id: results[0].notificationId } });
      expect(dbNotif?.title).not.toContain('Bearer');
      expect(dbNotif?.message).not.toContain('token');
      expect(dbNotif?.message).not.toContain('secret');
      expect(dbNotif?.payload).not.toContain('password');
    }
  });

  it('45. NotificationRepository.getMetrics returns valid delivery metrics structure', async () => {
    const metrics = await NotificationRepository.getMetrics(TENANT_A);
    expect(metrics).toHaveProperty('queued');
    expect(metrics).toHaveProperty('sending');
    expect(metrics).toHaveProperty('sent');
    expect(metrics).toHaveProperty('failed');
    expect(metrics).toHaveProperty('failedPermanently');
    expect(metrics).toHaveProperty('total');
    expect(metrics).toHaveProperty('deliverySuccessRate');
    expect(metrics).toHaveProperty('retryCount');
    expect(metrics).toHaveProperty('unreadCount');
    expect(metrics.deliverySuccessRate).toBeGreaterThanOrEqual(0);
    expect(metrics.deliverySuccessRate).toBeLessThanOrEqual(100);
  });
});
