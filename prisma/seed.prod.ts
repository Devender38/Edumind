// ResolveX Phase 22 — Safe Idempotent Production Data Initialization Script

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedProductionDatabase() {
  console.log('🌱 [PROD_SEED] Running safe, non-destructive production database initialization...');

  // 1. Upsert Default Auto-Refund Threshold Policy
  await prisma.policy.upsert({
    where: { id: 'pol-auto-refund-001' },
    update: { active: true, status: 'ACTIVE' },
    create: {
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
            createdBy: 'system-prod-init',
            approvedBy: 'system-prod-init',
            approvedAt: new Date(),
            activatedBy: 'system-prod-init',
            activatedAt: new Date(),
            changeSummary: 'Initialized production auto-refund threshold policy v1',
          },
        ],
      },
    },
  });

  // 2. Upsert Default Replacement Preference Policy
  await prisma.policy.upsert({
    where: { id: 'pol-replacement-pref-001' },
    update: { active: true, status: 'ACTIVE' },
    create: {
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
            createdBy: 'system-prod-init',
            approvedBy: 'system-prod-init',
            approvedAt: new Date(),
            activatedBy: 'system-prod-init',
            activatedAt: new Date(),
            changeSummary: 'Initialized production replacement preference policy v1',
          },
        ],
      },
    },
  });

  console.log('✅ [PROD_SEED] Safe production database initialization completed cleanly!');
}

if (process.argv[1]?.includes('seed.prod')) {
  seedProductionDatabase()
    .catch((e) => {
      console.error('❌ Production Seed Error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
