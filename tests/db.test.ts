import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DomainRepository } from '../src/db/repositories/domainRepository.js';
import { AgentStateRepository } from '../src/db/repositories/agentStateRepository.js';
import { prisma } from '../src/db/client.js';

describe('ResolveX Phase 3 Database & State Repository Integration Tests', () => {
  beforeAll(async () => {
    // Ensure database connection
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. Should retrieve seeded primary customer', async () => {
    const customer = await DomainRepository.getCustomerById('cust-primary-001');
    expect(customer).not.toBeNull();
    expect(customer?.email).toBe('devender.sharma@example.com');
    expect(customer?.tier).toBe('VIP');
  });

  it('2. Should retrieve seeded primary ₹24,999 smartphone order with items', async () => {
    const order = await DomainRepository.getOrderById('ord-phone-24999');
    expect(order).not.toBeNull();
    expect(order?.totalAmount).toBe(24999.0);
    expect(order?.items.length).toBeGreaterThan(0);
    expect(order?.items[0].product.name).toContain('Nexus Pro 5G');
  });

  it('3. Should retrieve seeded primary support case/ticket', async () => {
    const ticket = await DomainRepository.getTicketById('tkt-damaged-phone-001');
    expect(ticket).not.toBeNull();
    expect(ticket?.issueType).toBe('DAMAGED');
    expect(ticket?.priority).toBe('HIGH');
  });

  it('4. Should retrieve active deterministic business policies', async () => {
    const policies = await DomainRepository.getActivePolicies();
    expect(policies.length).toBeGreaterThan(0);
    const autoRefundPolicy = policies.find((p) => p.name.includes('Auto-Refund'));
    expect(autoRefundPolicy).toBeDefined();
    expect(autoRefundPolicy?.approvalRequired).toBe(true);
  });

  it('5. Should create an AgentRun, append trace, record tool execution, action, and verification', async () => {
    // A. Create Agent Run
    const run = await AgentStateRepository.createAgentRun({
      ticketId: 'tkt-damaged-phone-001',
      goal: 'Resolve damaged ₹24,999 smartphone complaint autonomously',
    });
    expect(run.id).toBeDefined();
    expect(run.currentStep).toBe('GOAL_RECEIVED');
    expect(run.status).toBe('PLANNING');

    // B. Update State
    const updatedRun = await AgentStateRepository.updateAgentRunState(run.id, 'INVESTIGATION', 'IN_PROGRESS');
    expect(updatedRun.currentStep).toBe('INVESTIGATION');
    expect(updatedRun.status).toBe('IN_PROGRESS');

    // C. Append Execution Trace
    const trace = await AgentStateRepository.appendTrace({
      agentRunId: run.id,
      step: 'INVESTIGATION',
      type: 'INVESTIGATION',
      title: 'Order Ground-Truth Verification',
      description: 'Order ord-phone-24999 verified delivered 2 days ago',
      input: { orderId: 'ord-phone-24999' },
      output: { totalAmount: 24999, status: 'DELIVERED' },
    });
    expect(trace.id).toBeDefined();
    expect(trace.type).toBe('INVESTIGATION');

    // D. Record Tool Execution
    const toolExec = await AgentStateRepository.recordToolExecution({
      agentRunId: run.id,
      toolName: 'create_replacement_order',
      idempotencyKey: `idemp-test-${Date.now()}`,
      input: { orderId: 'ord-phone-24999', productId: 'prod-phone-001' },
      output: { status: 'FAILED_OUT_OF_STOCK' },
      status: 'FAILED',
      error: 'Product out of stock',
    });
    expect(toolExec.id).toBeDefined();
    expect(toolExec.status).toBe('FAILED');

    // E. Replan Agent Run
    const replannedRun = await AgentStateRepository.replanAgentRun(run.id, 'Replacement stock unavailable');
    expect(replannedRun.status).toBe('REPLANNING');
    expect(replannedRun.replanCount).toBe(1);

    // F. Record Action
    const action = await AgentStateRepository.recordAction({
      ticketId: 'tkt-damaged-phone-001',
      agentRunId: run.id,
      actionType: 'REFUND',
      amount: 24999.0,
      externalReference: 'tx-refund-991',
      metadata: { reason: 'Damaged item refund fallback' },
    });
    expect(action.id).toBeDefined();
    expect(action.actionType).toBe('REFUND');

    // G. Record Verification
    const verification = await AgentStateRepository.recordVerification({
      actionId: action.id,
      agentRunId: run.id,
      status: 'SUCCESS',
      expectedState: 'REFUNDED',
      actualState: 'REFUNDED',
      message: 'Refund transaction confirmed in database',
    });
    expect(verification.id).toBeDefined();
    expect(verification.status).toBe('SUCCESS');

    // H. Complete Agent Run
    const completedRun = await AgentStateRepository.completeAgentRun(run.id, 'Case resolved via fallback store refund');
    expect(completedRun.status).toBe('COMPLETED');
    expect(completedRun.currentStep).toBe('CASE_RESOLVED');

    // I. Retrieve Full Hydrated Run
    const hydratedRun = await AgentStateRepository.getAgentRun(run.id);
    expect(hydratedRun?.traces.length).toBeGreaterThan(0);
    expect(hydratedRun?.toolExecutions.length).toBeGreaterThan(0);
    expect(hydratedRun?.actionRecords.length).toBeGreaterThan(0);
    expect(hydratedRun?.verificationResults.length).toBeGreaterThan(0);
  });
});
