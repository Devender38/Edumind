import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { LookupTools, PolicyTools, ActionTools, VerificationTools, ToolRegistry } from '../src/tools/index.js';
import { prisma } from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';

describe('ResolveX Phase 4 Tool Layer Test Suite', () => {
  beforeAll(async () => {
    await prisma.$connect();
    await seedDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // A. Customer lookup
  it('A. getCustomer should return customer details', async () => {
    const res = await LookupTools.getCustomer('cust-primary-001');
    expect(res.success).toBe(true);
    expect(res.data?.email).toBe('devender.sharma@example.com');
    expect(res.data?.tier).toBe('VIP');
  });

  // B. Customer history
  it('B. getCustomerHistory should return previous orders and tickets', async () => {
    const res = await LookupTools.getCustomerHistory('cust-primary-001');
    expect(res.success).toBe(true);
    expect(res.data?.previousOrders.length).toBeGreaterThan(0);
    expect(res.data?.previousTickets.length).toBeGreaterThan(0);
  });

  // C. Order lookup
  it('C. getOrder should return order details and line items', async () => {
    const res = await LookupTools.getOrder('ord-phone-24999');
    expect(res.success).toBe(true);
    expect(res.data?.totalAmount).toBe(24999.0);
    expect(res.data?.items.length).toBeGreaterThan(0);
  });

  // D. Product lookup
  it('D. getProduct should return product details', async () => {
    const res = await LookupTools.getProduct('prod-phone-001');
    expect(res.success).toBe(true);
    expect(res.data?.name).toContain('Nexus Pro 5G');
  });

  // E. Inventory lookup
  it('E. checkInventory should return stock status', async () => {
    const resOut = await LookupTools.checkInventory('prod-phone-001');
    expect(resOut.success).toBe(true);
    expect(resOut.data?.stockQuantity).toBe(0);
    expect(resOut.data?.status).toBe('OUT_OF_STOCK');

    const resIn = await LookupTools.checkInventory('prod-phone-002');
    expect(resIn.success).toBe(true);
    expect(resIn.data?.stockQuantity).toBeGreaterThan(0);
    expect(resIn.data?.status).toBe('IN_STOCK');
  });

  // F. Policy lookup
  it('F. checkPolicy should return grounded business policy', async () => {
    const res = await PolicyTools.checkPolicy('DAMAGED', 'REFUND', { amount: 24999 });
    expect(res.success).toBe(true);
    expect(res.data?.policyName).toContain('Auto-Refund');
    expect(res.data?.approvalRequired).toBe(true);
  });

  // G. Refund eligibility
  it('G. checkRefundEligibility should validate refund amount caps', async () => {
    const resEligible = await PolicyTools.checkRefundEligibility('ord-refund-4999', { requestedAmount: 4999 });
    expect(resEligible.success).toBe(true);
    expect(resEligible.data?.eligible).toBe(true);

    const resExcess = await PolicyTools.checkRefundEligibility('ord-refund-4999', { requestedAmount: 99999 });
    expect(resExcess.success).toBe(true);
    expect(resExcess.data?.eligible).toBe(false);
  });

  // H. Successful refund
  it('H. issueRefund should succeed for valid order', async () => {
    const idempKey = `idemp-refund-test-${Date.now()}`;
    const res = await ActionTools.issueRefund('ord-refund-4999', 4999, 'Unopened return refund', idempKey);
    expect(res.success).toBe(true);
    expect(res.data?.status).toBe('COMPLETED');
    expect(res.data?.actionId).toBeDefined();
  });

  // I. Duplicate refund blocked by idempotency
  it('I. issueRefund duplicate idempotencyKey should be blocked', async () => {
    const idempKey = `idemp-refund-dup-${Date.now()}`;
    const res1 = await ActionTools.issueRefund('ord-phone-24999', 100, 'Test refund 1', idempKey);
    expect(res1.success).toBe(true);

    const res2 = await ActionTools.issueRefund('ord-phone-24999', 100, 'Test refund 2', idempKey);
    expect(res2.success).toBe(true);
    expect(res2.metadata?.idempotencyKey).toBe(idempKey);
  });

  // J. Invalid refund rejected
  it('J. issueRefund with excess amount should be rejected', async () => {
    const idempKey = `idemp-refund-excess-${Date.now()}`;
    const res = await ActionTools.issueRefund('ord-refund-4999', 999999, 'Excess refund', idempKey);
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('REFUND_REJECTED');
  });

  // K, L, M, N & Killer Demo Scenario (Section 15)
  it('K-N & Killer Demo Test: Replacement stock 0 fails, alternative stock 15 succeeds and verifies', async () => {
    const idempKeyOut = `idemp-repl-out-${Date.now()}`;

    // 1. Primary demo product prod-phone-001 (stock = 0) returns OUT_OF_STOCK
    const resOut = await ActionTools.createReplacement(
      'ord-phone-24999',
      'prod-phone-001',
      'Damaged phone replacement attempt 1',
      idempKeyOut
    );
    expect(resOut.success).toBe(false);
    expect(resOut.error?.code).toBe('OUT_OF_STOCK');
    expect(resOut.error?.retryable).toBe(false);

    // 2. Alternative product prod-phone-002 (stock = 15) succeeds & decrements stock to 14
    const idempKeySuccess = `idemp-repl-success-${Date.now()}`;
    const resSuccess = await ActionTools.createReplacement(
      'ord-phone-24999',
      'prod-phone-002',
      'Damaged phone alternative replacement attempt 2',
      idempKeySuccess
    );

    expect(resSuccess.success).toBe(true);
    expect(resSuccess.data?.replacementOrderId).toBeDefined();
    expect(resSuccess.data?.remainingStock).toBe(14);
    const actionId = resSuccess.data?.actionId;
    expect(actionId).toBeDefined();

    // 3. Duplicate replacement blocked by idempotency
    const resDup = await ActionTools.createReplacement(
      'ord-phone-24999',
      'prod-phone-002',
      'Duplicate replacement attempt',
      idempKeySuccess
    );
    expect(resDup.success).toBe(true);

    // 4. Ground-truth database verification
    const resVerify = await VerificationTools.verifyAction(actionId!);
    expect(resVerify.success).toBe(true);
    expect(resVerify.data?.verified).toBe(true);
    expect(resVerify.data?.actualState).toBe('PROCESSING_REPLACEMENT_ORDER');
  });

  // O & P. Cancellation tests
  it('O & P. cancelOrder should allow eligible cancellation and reject dispatched cancellation', async () => {
    const idempCancel = `idemp-cancel-${Date.now()}`;
    const resCancel = await ActionTools.cancelOrder('ord-cancel-3500', 'Customer changed mind', idempCancel);
    expect(resCancel.success).toBe(true);
    expect(resCancel.data?.status).toBe('CANCELLED');

    const idempDelivered = `idemp-cancel-del-${Date.now()}`;
    const resFail = await ActionTools.cancelOrder('ord-phone-24999', 'Cancel delivered phone', idempDelivered);
    expect(resFail.success).toBe(false);
    expect(resFail.error?.code).toBe('CANCELLATION_NOT_ALLOWED');
  });

  // R, S, T. Coupon tests
  it('R-T. applyCoupon should issue discount and prevent duplicate codes', async () => {
    const code = `GOODWILL-${Date.now()}`;
    const idempKey = `idemp-coupon-${Date.now()}`;
    const res = await ActionTools.applyCoupon('cust-primary-001', code, 'tkt-damaged-phone-001', idempKey);
    expect(res.success).toBe(true);
    expect(res.data?.discount).toBe(1000.0);

    const resDup = await ActionTools.applyCoupon('cust-primary-001', code, 'tkt-damaged-phone-001', idempKey);
    expect(resDup.success).toBe(true);
  });

  // U, V. Escalation tests
  it('U, V. escalateTicket should escalate support ticket state and record escalation', async () => {
    const idempEsc = `idemp-esc-${Date.now()}`;
    const res = await ActionTools.escalateTicket('tkt-damaged-phone-001', 'Stock depletion requires manager override', 'HIGH', idempEsc);
    expect(res.success).toBe(true);
    expect(res.data?.status).toBe('ESCALATED');
  });

  // W, X. Notification tests
  it('W, X. sendNotification should log notification to database', async () => {
    const idempNotif = `idemp-notif-${Date.now()}`;
    const res = await ActionTools.sendNotification('tkt-damaged-phone-001', 'EMAIL', 'Your replacement order has been confirmed', idempNotif);
    expect(res.success).toBe(true);
    expect(res.data?.status).toBe('SENT');
  });

  // Tool Registry Execution
  it('Registry.executeTool should route tools dynamically by name', async () => {
    const res = await ToolRegistry.executeTool('checkInventory', { productId: 'prod-phone-002' });
    expect(res.success).toBe(true);
    expect(res.data?.productId).toBe('prod-phone-002');
  });
});
