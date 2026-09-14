import { PrismaClient as SqlitePrismaClient } from '@prisma/client';

let activeProvider: 'sqlite' | 'postgres' | 'mongodb' = 'sqlite';

export function createPrismaClient(): any {
  const provider = (process.env.DB_PROVIDER || '').toLowerCase();
  const mongoUri = process.env.MONGODB_URI;

  // ----------------------------------------------------
  // 1. MONGODB ATLAS PROVIDER BRANCH
  // ----------------------------------------------------
  if (provider === 'mongodb' || (mongoUri && mongoUri.trim().startsWith('mongodb'))) {
    const isPlaceholder = mongoUri && (mongoUri.includes('<username>') || mongoUri.includes('<cluster>') || mongoUri.includes('<password>'));
    if (isPlaceholder && process.env.NODE_ENV !== 'production') {
      console.warn('[DB CLIENT] MONGODB_URI contains placeholder credentials. Falling back to local SQLite for local development.');
    } else {
      if (!mongoUri || !mongoUri.trim()) {
        throw new Error('[FATAL DB ERROR] DB_PROVIDER is set to "mongodb" but MONGODB_URI environment variable is missing. Production cannot fallback to SQLite.');
      }
      activeProvider = 'mongodb';

      let MongoPrismaClient: any = null;
      let loadError: string = '';

      try {
        // @ts-ignore — primary generated package @prisma/client-mongodb in node_modules
        MongoPrismaClient = require('@prisma/client-mongodb').PrismaClient;
      } catch (e1: any) {
        loadError += `[Path 1 @prisma/client-mongodb error: ${e1.message}] `;
        try {
          // @ts-ignore — secondary generated client inside node_modules/.prisma/client-mongodb
          MongoPrismaClient = require('.prisma/client-mongodb').PrismaClient;
        } catch (e2: any) {
          loadError += `[Path 2 .prisma/client-mongodb error: ${e2.message}] `;
        }
      }

      if (!MongoPrismaClient) {
        throw new Error(`[FATAL DB ERROR] Failed to load MongoDB Prisma Client. Cannot fallback to SQLite. Details: ${loadError}`);
      }

      return new MongoPrismaClient({
        datasources: {
          db: {
            url: mongoUri,
          },
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
  }

  // ----------------------------------------------------
  // 2. POSTGRESQL PRODUCTION PROVIDER BRANCH
  // ----------------------------------------------------
  if (provider === 'postgres' || provider === 'postgresql') {
    const pgUrl = process.env.DATABASE_URL_PG || process.env.DATABASE_URL;
    if (!pgUrl || (!pgUrl.startsWith('postgresql://') && !pgUrl.startsWith('postgres://'))) {
      throw new Error('[FATAL DB ERROR] DB_PROVIDER is set to "postgres" but DATABASE_URL is missing or invalid.');
    }
    activeProvider = 'postgres';

    let PgPrismaClient: any = null;
    let loadError: string = '';

    try {
      // @ts-ignore
      PgPrismaClient = require('.prisma/client-pg').PrismaClient;
    } catch (e1: any) {
      loadError += `[Path .prisma/client-pg error: ${e1.message}] `;
      try {
        // @ts-ignore
        PgPrismaClient = require('./generated/client-pg').PrismaClient;
      } catch (e2: any) {
        loadError += `[Path ./generated/client-pg error: ${e2.message}] `;
      }
    }

    if (!PgPrismaClient) {
      throw new Error(`[FATAL DB ERROR] Failed to load PostgreSQL Prisma Client. Details: ${loadError}`);
    }

    return new PgPrismaClient({
      datasources: {
        db: {
          url: pgUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  // ----------------------------------------------------
  // 3. DEFAULT SQLITE LOCAL DEVELOPMENT & TEST BRANCH
  // ----------------------------------------------------
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
        try {
          await (prisma as any).$runCommandRaw({ ping: 1 });
        } catch {
          await (prisma as any).customer.findFirst();
        }
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
