import { seedDatabase } from '../src/db/seedDatabase.js';
import { prisma } from '../src/db/client.js';

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  console.warn('⚠️ [SAFETY_GUARD] Development seed execution blocked in production/staging environment.');
  console.warn('   Use "npm run db:seed:prod" for non-destructive production data initialization.');
  process.exit(0);
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

export { seedDatabase };
