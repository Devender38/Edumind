import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Checks database connectivity with optional retry logic.
 */
export async function checkDatabaseHealth(maxRetries: number = 3, retryDelayMs: number = 200): Promise<boolean> {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (err) {
      if (attempt >= maxRetries) {
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, retryDelayMs * Math.pow(2, attempt - 1)));
    }
  }
  return false;
}

/**
 * Executes a database operation with automatic transient failure retry.
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseBackoffMs: number = 100
): Promise<T> {
  let attempt = 0;
  let lastError: any;

  while (attempt < maxRetries) {
    attempt++;
    try {
      return await operation();
    } catch (err: any) {
      lastError = err;
      // Retry transient database connection or deadlock errors
      const isTransient =
        err?.code === 'P1001' || // Cannot reach DB
        err?.code === 'P1002' || // DB timeout
        err?.code === 'P2024' || // Connection pool timeout
        err?.message?.includes('Connection') ||
        err?.message?.includes('locked');

      if (!isTransient || attempt >= maxRetries) {
        throw err;
      }

      const delay = baseBackoffMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
