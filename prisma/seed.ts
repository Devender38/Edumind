import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('🌱 Starting ResolveX Deterministic Database Seed...');

  // Clean existing demo data safely
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
  await prisma.policy.deleteMany();

  // 1. Seed Business Policies
  const policyRefundLimit = await prisma.policy.create({
    data: {
      name: 'Auto-Refund Threshold Policy',
      issueType: 'DAMAGED',
      actionType: 'REFUND',
      conditions: JSON.stringify({ maxAutoRefundAmount: 10000, requiresApprovalAbove: true }),
      approvalRequired: true,
      priority: 1,
      active: true,
    },
  });

  const policyReplacementPref = await prisma.policy.create({
    data: {
      name: 'Damaged Item Replacement Preference Policy',
      issueType: 'DAMAGED',
      actionType: 'REPLACEMENT',
      conditions: JSON.stringify({ preferReplacementFirst: true, maxDaysPostDelivery: 14 }),
      approvalRequired: false,
      priority: 2,
      active: true,
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

  const altPhoneProduct = await prisma.product.create({
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

  const tabletProduct = await prisma.product.create({
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

  const highRiskCustomer = await prisma.customer.create({
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
  const refundOrder = await prisma.order.create({
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

  const cancelOrder = await prisma.order.create({
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
  const primaryTicket = await prisma.ticket.create({
    data: {
      id: 'tkt-damaged-phone-001',
      customerId: primaryCustomer.id,
      orderId: primaryOrder.id,
      issueType: 'DAMAGED',
      customerMessage: 'My ₹24,999 phone arrived damaged. I want a refund.',
      status: 'OPEN',
      priority: 'HIGH',
    },
  });

  console.log('✅ Deterministic Seed Completed Successfully!');
}

if (process.argv[1]?.includes('seed')) {
  seedDatabase()
    .catch((e) => {
      console.error('❌ Seed Error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

