import { PrismaClient as SqlitePrismaClient } from '@prisma/client';

let activeProvider: 'sqlite' | 'postgres' | 'mongodb' = 'sqlite';

export function createPrismaClient(): any {
  const provider = (process.env.DB_PROVIDER || '').toLowerCase();

  if (provider === 'mongodb') {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri || !mongoUri.trim()) {
      throw new Error('[FATAL DB ERROR] DB_PROVIDER is set to "mongodb" but MONGODB_URI environment variable is missing. Production cannot silently fallback to SQLite.');
    }
    activeProvider = 'mongodb';
    try {
      // @ts-ignore — import generated client-mongodb
      const { PrismaClient: MongoPrismaClient } = require('../../node_modules/.prisma/client-mongodb');
      return new MongoPrismaClient({
        datasources: {
          db: {
            url: mongoUri,
          },
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    } catch (err: any) {
      throw new Error(`[FATAL DB ERROR] Failed to load MongoDB Prisma Client: ${err.message}`);
    }
  }

  if (provider === 'postgres' || provider === 'postgresql') {
    const pgUrl = process.env.DATABASE_URL_PG || process.env.DATABASE_URL;
    if (!pgUrl || (!pgUrl.startsWith('postgresql://') && !pgUrl.startsWith('postgres://'))) {
      throw new Error('[FATAL DB ERROR] DB_PROVIDER is set to "postgres" but DATABASE_URL is missing or invalid.');
    }
    activeProvider = 'postgres';
    try {
      // @ts-ignore — import generated client-pg
      const { PrismaClient: PgPrismaClient } = require('../../node_modules/.prisma/client-pg');
      return new PgPrismaClient({
        datasources: {
          db: {
            url: pgUrl,
          },
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    } catch (err: any) {
      throw new Error(`[FATAL DB ERROR] Failed to load PostgreSQL Prisma Client: ${err.message}`);
    }
  }

  // Default SQLite client for local development / testing & TypeScript type inference
  activeProvider = 'sqlite';
  return new SqlitePrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

const globalForPrisma = global as unknown as { prisma: SqlitePrismaClient };

export const prisma: SqlitePrismaClient =
  globalForPrisma.prisma ||
  createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export function getActiveDbProvider(): 'sqlite' | 'postgres' | 'mongodb' {
  return activeProvider;
}

/**
 * Checks database connectivity with provider-specific health probes.
 */
export async function checkDatabaseHealth(maxRetries: number = 3, retryDelayMs: number = 200): Promise<boolean> {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    try {
      if (activeProvider === 'mongodb') {
        await (prisma as any).$runCommandRaw({ ping: 1 });
      } else {
        await prisma.$queryRaw`SELECT 1`;
      }
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
