import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('🌱 Starting ResolveX Deterministic Database Seed...');

  // Clean existing demo data safely
  await prisma.executionJob.deleteMany();
  await prisma.verificationResult.deleteMany();
  await prisma.actionRecord.deleteMany();
  await prisma.toolExecution.deleteMany();
  await prisma.agentTrace.deleteMany();
  await prisma.escalation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refundTransaction.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.agentRun.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.policyVersion.deleteMany();
  await prisma.policy.deleteMany();

  // 1. Seed Business Policies with Version 1 ACTIVE
  await prisma.policy.create({
    data: {
      id: 'pol-auto-refund-001',
      tenantId: 'tenant-a',
      policyKey: 'AUTO_REFUND_THRESHOLD',
      name: 'Auto-Refund Threshold Policy',
      issueType: 'DAMAGED',
      actionType: 'REFUND',
      conditions: JSON.stringify({ maxAutoRefundAmount: 10000, requiresApprovalAbove: true }),
      approvalRequired: true,
      priority: 1,
      active: true,
      status: 'ACTIVE',
      versions: {
        create: [
          {
            version: 1,
            status: 'ACTIVE',
            name: 'Auto-Refund Threshold Policy',
            issueType: 'DAMAGED',
            actionType: 'REFUND',
            definition: JSON.stringify({
              issueType: 'DAMAGED',
              actionType: 'REFUND',
              conditions: { maxAutoRefundAmount: 10000, requiresApprovalAbove: true },
              approvalRequired: true,
              priority: 1,
            }),
            approvalRequired: true,
            priority: 1,
            createdBy: 'admin-seed',
            approvedBy: 'approver-seed',
            approvedAt: new Date(),
            activatedBy: 'admin-seed',
            activatedAt: new Date(),
            changeSummary: 'Seeded initial production auto-refund threshold policy v1',
          },
        ],
      },
    },
  });

  await prisma.policy.create({
    data: {
      id: 'pol-replacement-pref-001',
      tenantId: 'tenant-a',
      policyKey: 'REPLACEMENT_PREFERENCE',
      name: 'Damaged Item Replacement Preference Policy',
      issueType: 'DAMAGED',
      actionType: 'REPLACEMENT',
      conditions: JSON.stringify({ preferReplacementFirst: true, maxDaysPostDelivery: 14 }),
      approvalRequired: false,
      priority: 2,
      active: true,
      status: 'ACTIVE',
      versions: {
        create: [
          {
            version: 1,
            status: 'ACTIVE',
            name: 'Damaged Item Replacement Preference Policy',
            issueType: 'DAMAGED',
            actionType: 'REPLACEMENT',
            definition: JSON.stringify({
              issueType: 'DAMAGED',
              actionType: 'REPLACEMENT',
              conditions: { preferReplacementFirst: true, maxDaysPostDelivery: 14 },
              approvalRequired: false,
              priority: 2,
            }),
            approvalRequired: false,
            priority: 2,
            createdBy: 'admin-seed',
            approvedBy: 'approver-seed',
            approvedAt: new Date(),
            activatedBy: 'admin-seed',
            activatedAt: new Date(),
            changeSummary: 'Seeded initial production replacement preference policy v1',
          },
        ],
      },
    },
  });

  // 2. Seed Products
  const phoneProduct = await prisma.product.create({
    data: {
      id: 'prod-phone-001',
      name: 'Nexus Pro 5G Smartphone (256GB)',
      category: 'Electronics',
      price: 24999.0,
      stockQuantity: 0, // OUT OF STOCK - Triggers Replan Demo Failure Scenario!
      replacementEligible: true,
    },
  });

  await prisma.product.create({
    data: {
      id: 'prod-phone-002',
      name: 'Nexus Pro 5G (Special Edition / Alternative SKU)',
      category: 'Electronics',
      price: 24999.0,
      stockQuantity: 15,
      replacementEligible: true,
    },
  });

  const earbudsProduct = await prisma.product.create({
    data: {
      id: 'prod-earbuds-001',
      name: 'Smart Audio Pods Pro',
      category: 'Audio',
      price: 4999.0,
      stockQuantity: 50,
      replacementEligible: true,
    },
  });

  await prisma.product.create({
    data: {
      id: 'prod-tablet-001',
      name: 'UltraTab 10 Tablet',
      category: 'Computers',
      price: 15000.0,
      stockQuantity: 10,
      replacementEligible: true,
    },
  });

  // 3. Seed Customers
  const primaryCustomer = await prisma.customer.create({
    data: {
      id: 'cust-primary-001',
      name: 'Devender Sharma',
      email: 'devender.sharma@example.com',
      tier: 'VIP',
      riskScore: 0.05,
    },
  });

  const standardCustomer = await prisma.customer.create({
    data: {
      id: 'cust-standard-002',
      name: 'Aarav Patel',
      email: 'aarav.patel@example.com',
      tier: 'STANDARD',
      riskScore: 0.1,
    },
  });

  await prisma.customer.create({
    data: {
      id: 'cust-risk-003',
      name: 'Vikram Singh (High Risk Fraud Flag)',
      email: 'vikram.singh@example.com',
      tier: 'STANDARD',
      riskScore: 0.85,
    },
  });

  // 4. Seed Primary Hackathon Demo Order (₹24,999 Smartphone)
  const primaryOrder = await prisma.order.create({
    data: {
      id: 'ord-phone-24999',
      customerId: primaryCustomer.id,
      status: 'DELIVERED',
      totalAmount: 24999.0,
      currency: 'INR',
      deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      shippingStatus: 'DELIVERED',
      items: {
        create: [
          {
            productId: phoneProduct.id,
            quantity: 1,
            unitPrice: 24999.0,
          },
        ],
      },
    },
  });

  // 5. Seed Additional Orders for Testing Matrix
  await prisma.order.create({
    data: {
      id: 'ord-refund-4999',
      customerId: standardCustomer.id,
      status: 'DELIVERED',
      totalAmount: 4999.0,
      currency: 'INR',
      deliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      shippingStatus: 'DELIVERED',
      items: {
        create: [
          {
            productId: earbudsProduct.id,
            quantity: 1,
            unitPrice: 4999.0,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      id: 'ord-cancel-3500',
      customerId: standardCustomer.id,
      status: 'PROCESSING',
      totalAmount: 3500.0,
      currency: 'INR',
      shippingStatus: 'PENDING',
      items: {
        create: [
          {
            productId: earbudsProduct.id,
            quantity: 1,
            unitPrice: 3500.0,
          },
        ],
      },
    },
  });

  // 6. Seed Primary Hackathon Case/Ticket
  await prisma.ticket.create({
    data: {
      id: 'tkt-damaged-phone-001',
      tenantId: 'tenant-a',
      customerId: primaryCustomer.id,
      orderId: primaryOrder.id,
      issueType: 'DAMAGED',
      customerMessage: 'My ₹24,999 phone arrived damaged. I want a refund.',
      status: 'OPEN',
      priority: 'HIGH',
    },
  });

  await prisma.ticket.create({
    data: {
      id: 'tkt-refund-4999',
      tenantId: 'tenant-a',
      customerId: standardCustomer.id,
      orderId: 'ord-refund-4999',
      issueType: 'REFUND_REQUEST',
      customerMessage: 'I want a refund for my ₹4,999 earbuds order.',
      status: 'OPEN',
      priority: 'MEDIUM',
    },
  });

  // 7. Seed Tenant B Isolated Data for Cross-Tenant Isolation Testing
  const customerB = await prisma.customer.create({
    data: {
      id: 'cust-tenant-b-001',
      tenantId: 'tenant-b',
      name: 'Rohan Gupta (Tenant B)',
      email: 'rohan.gupta.tenantb@example.com',
      tier: 'STANDARD',
      riskScore: 0.1,
    },
  });

  const orderB = await prisma.order.create({
    data: {
      id: 'ord-tenant-b-999',
      tenantId: 'tenant-b',
      customerId: customerB.id,
      status: 'DELIVERED',
      totalAmount: 12000.0,
      currency: 'INR',
      deliveryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      shippingStatus: 'DELIVERED',
      items: {
        create: [
          {
            productId: earbudsProduct.id,
            quantity: 2,
            unitPrice: 6000.0,
          },
        ],
      },
    },
  });

  const ticketB = await prisma.ticket.create({
    data: {
      id: 'tkt-tenant-b-001',
      tenantId: 'tenant-b',
      customerId: customerB.id,
      orderId: orderB.id,
      issueType: 'DAMAGED',
      customerMessage: 'Tenant B damaged product complaint',
      status: 'OPEN',
      priority: 'HIGH',
    },
  });

  await prisma.agentRun.create({
    data: {
      id: 'run-primary-001',
      tenantId: 'tenant-a',
      ticketId: 'tkt-damaged-phone-001',
      goal: 'Primary tenant-a run goal',
      status: 'INVESTIGATING',
      currentStep: 'INVESTIGATION',
      correlationId: 'corr-primary-001',
      replanCount: 0,
    },
  });

  await prisma.agentRun.create({
    data: {
      id: 'run-tenant-b-001',
      tenantId: 'tenant-b',
      ticketId: ticketB.id,
      goal: 'Tenant B isolated run goal',
      status: 'WAITING_FOR_APPROVAL',
      currentStep: 'DECISION_FORMULATION',
      decision: 'REQUIRES_APPROVAL',
      correlationId: 'corr-tenant-b-001',
      replanCount: 0,
    },
  });

  // 8. Seed Phase 19 Notification for Demo/Testing
  await prisma.notification.create({
    data: {
      id: 'notif-seed-001',
      tenantId: 'tenant-a',
      ticketId: 'tkt-damaged-phone-001',
      customerId: primaryCustomer.id,
      eventType: 'CASE_CREATED',
      channel: 'IN_APP',
      templateId: 'tmpl-case-created-cust-v1',
      templateVersion: 'v1',
      locale: 'en-IN',
      recipientType: 'CUSTOMER',
      recipient: primaryCustomer.id,
      title: 'Support Case Received',
      message: 'Your support request for Order #ord-primary-24999 has been received.',
      status: 'SENT',
      idempotencyKey: 'seed:CASE_CREATED:IN_APP:v1:CUSTOMER:cust-primary-001',
      correlationId: 'corr-seed-001',
      sentAt: new Date(),
    },
  }).catch(() => null);

  console.log('✅ Deterministic Seed Completed Successfully!');
}
