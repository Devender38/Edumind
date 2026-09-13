import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { IntentAgent, InvestigationAgent } from '../src/agents/index.js';
import { prisma } from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';
import { AIProviderRegistry } from '../src/ai/providers/AIProviderRegistry.js';
import { AIProviderMode } from '../src/ai/types/AITypes.js';
import { AIService } from '../src/ai/AIService.js';

describe('ResolveX Phase 5 Intent & Investigation Agents Test Suite', () => {
  beforeAll(async () => {
    await prisma.$connect();
    await seedDatabase();
  });

  beforeEach(() => {
    AIProviderRegistry.getInstance().resetAll();
    AIProviderRegistry.getInstance().setMode(AIProviderMode.AI_SANDBOX);
    AIService.resetCallCounts();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. Damaged + refund classification
  it('1. Should classify damaged item with refund request correctly', async () => {
    const intent = await IntentAgent.analyze({
      message: 'My ₹24,999 phone arrived damaged. I want a refund.',
    });
    expect(intent.issueType).toBe('DAMAGED_ITEM');
    expect(intent.requestedResolution).toBe('REFUND');
    expect(intent.entities.amount).toBe(24999);
    expect(intent.entities.currency).toBe('INR');
    expect(intent.confidence).toBeGreaterThanOrEqual(0.9);
  });

  // 2. Replacement request classification
  it('2. Should classify defective item with replacement request', async () => {
    const intent = await IntentAgent.analyze({
      message: 'The tablet screen is defective, please send me a replacement.',
    });
    expect(intent.issueType).toBe('DEFECTIVE_ITEM');
    expect(intent.requestedResolution).toBe('REPLACEMENT');
  });

  // 3. Cancellation classification
  it('3. Should classify cancellation request with order ID extraction', async () => {
    const intent = await IntentAgent.analyze({
      message: "I don't want order ord-cancel-3500 anymore, please cancel it.",
    });
    expect(intent.issueType).toBe('CANCELLATION_REQUEST');
    expect(intent.requestedResolution).toBe('CANCELLATION');
    expect(intent.entities.orderId).toBe('ord-cancel-3500');
  });

  // 4. Late delivery classification
  it('4. Should classify late delivery query', async () => {
    const intent = await IntentAgent.analyze({
      message: "Where is my package? It hasn't arrived yet.",
    });
    expect(intent.issueType).toBe('LATE_DELIVERY');
    expect(intent.requestedResolution).toBe('INFORMATION');
  });

  // 5. Coupon request classification
  const testCoupon = it('5. Should classify goodwill coupon request', async () => {
    const intent = await IntentAgent.analyze({
      message: 'Can I get a discount coupon for the delay?',
    });
    expect(intent.issueType).toBe('COUPON_REQUEST');
    expect(intent.requestedResolution).toBe('COUPON');
  });

  // 6. General support classification
  it('6. Should classify general support with lower confidence', async () => {
    const intent = await IntentAgent.analyze({
      message: 'My order has a problem.',
    });
    expect(intent.issueType).toBe('GENERAL_SUPPORT');
    expect(intent.confidence).toBeLessThan(0.8);
    expect(intent.missingInformation).toContain('specific_issue_details');
  });

  // 7. Unknown/ambiguous classification
  it('7. Should classify unrecognized message as UNKNOWN', async () => {
    const intent = await IntentAgent.analyze({
      message: 'asdfghjkl 12345',
    });
    expect(intent.issueType).toBe('UNKNOWN');
    expect(intent.confidence).toBeLessThan(0.3);
  });

  // 8 & 9. Amount and Currency extraction
  it('8-9. Should extract amount and currency accurately', async () => {
    const intent = await IntentAgent.analyze({
      message: 'I paid Rs 15,000 for order ord-123 and it was missing items',
    });
    expect(intent.entities.amount).toBe(15000);
    expect(intent.entities.currency).toBe('INR');
  });

  // 10. No hallucinated order ID
  it('10. Should NOT hallucinate order ID when not provided in text', async () => {
    const intent = await IntentAgent.analyze({
      message: 'I want a refund for my damaged phone.',
    });
    expect(intent.entities.orderId).toBeUndefined();
    expect(intent.missingInformation).toContain('orderId');
  });

  // 11 & 12. Confidence & missing info behavior
  it('11-12. Should set appropriate confidence and populate missing information', async () => {
    const intent = await IntentAgent.analyze({
      message: 'I need help with my refund',
    });
    expect(intent.requestedResolution).toBe('REFUND');
    expect(intent.missingInformation).toContain('orderId');
  });

  // 13-23. Investigation Agent Unit Tests
  it('13-23. InvestigationAgent should aggregate facts via read-only tools', async () => {
    const intent = await IntentAgent.analyze({
      ticketId: 'tkt-damaged-phone-001',
      message: 'My phone arrived damaged. I want a refund.',
    });

    const result = await InvestigationAgent.investigate({
      intent,
      ticketId: 'tkt-damaged-phone-001',
    });

    expect(result.customer).toBeDefined();
    expect(result.customer.email).toBe('devender.sharma@example.com');
    expect(result.order).toBeDefined();
    expect(result.order.id).toBe('ord-phone-24999');
    expect(result.evidence.length).toBeGreaterThan(0);
    expect(result.evidence.every((e) => e.isObservedFact)).toBe(true);
    expect(result.nextStep).toBe('POLICY_EVALUATION');
  });

  // 24. PRIMARY HACKATHON DEMO TEST
  it('24. Primary ₹24,999 Damaged Phone Demo Investigation Test', async () => {
    const customerMessage = 'My ₹24,999 phone arrived damaged. I want a refund.';
    const ticketId = 'tkt-damaged-phone-001';

    // A. Intent Analysis
    const intent = await IntentAgent.analyze({
      ticketId,
      message: customerMessage,
    });

    expect(intent.issueType).toBe('DAMAGED_ITEM');
    expect(intent.requestedResolution).toBe('REFUND');
    expect(intent.entities.amount).toBe(24999);
    expect(intent.entities.currency).toBe('INR');

    // B. Evidence-Backed Investigation
    const investigation = await InvestigationAgent.investigate({
      intent,
      ticketId,
    });

    expect(investigation.customer.id).toBe('cust-primary-001');
    expect(investigation.customer.tier).toBe('VIP');
    expect(investigation.order.id).toBe('ord-phone-24999');
    expect(investigation.order.totalAmount).toBe(24999.0);
    expect(investigation.order.status).toBe('DELIVERED');

    // Primary product stock = 0 signal discovered
    const stockSignal = investigation.eligibilitySignals.find((s) => s.signal === 'PRIMARY_REPLACEMENT_OUT_OF_STOCK');
    expect(stockSignal).toBeDefined();
    expect(stockSignal?.status).toBe('INELIGIBLE');

    // Policy signal discovered: Amount > 10000 requires approval
    const policySignal = investigation.eligibilitySignals.find((s) => s.signal === 'REFUND_POLICY_CHECK');
    expect(policySignal).toBeDefined();
    expect(policySignal?.status).toBe('REQUIRES_APPROVAL');

    // Crucial check: Investigation Agent does NOT jump ahead or execute business actions
    expect(investigation.nextStep).toBe('POLICY_EVALUATION');
  });

  // 25. SIDE-EFFECT SAFETY TEST
  it('25. Side-Effect Safety Test: Intent & Investigation must NOT mutate business database state', async () => {
    // Record pre-investigation database metrics
    const preOrder = await prisma.order.findUnique({ where: { id: 'ord-phone-24999' } });
    const preProduct = await prisma.product.findUnique({ where: { id: 'prod-phone-001' } });
    const preRefundsCount = await prisma.refundTransaction.count();
    const preCouponsCount = await prisma.coupon.count();
    const preActionsCount = await prisma.actionRecord.count();

    // Run Intent + Investigation
    const intent = await IntentAgent.analyze({
      ticketId: 'tkt-damaged-phone-001',
      message: 'My ₹24,999 phone arrived damaged. I want a refund.',
    });

    await InvestigationAgent.investigate({
      intent,
      ticketId: 'tkt-damaged-phone-001',
    });

    // Record post-investigation database metrics
    const postOrder = await prisma.order.findUnique({ where: { id: 'ord-phone-24999' } });
    const postProduct = await prisma.product.findUnique({ where: { id: 'prod-phone-001' } });
    const postRefundsCount = await prisma.refundTransaction.count();
    const postCouponsCount = await prisma.coupon.count();
    const postActionsCount = await prisma.actionRecord.count();

    // Verify 100% Zero Business State Mutation!
    expect(postOrder?.status).toBe(preOrder?.status);
    expect(postProduct?.stockQuantity).toBe(preProduct?.stockQuantity);
    expect(postRefundsCount).toBe(preRefundsCount);
    expect(postCouponsCount).toBe(preCouponsCount);
    expect(postActionsCount).toBe(preActionsCount);
  });
});
