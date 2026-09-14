import { PrismaClient as SqlitePrismaClient } from '@prisma/client';

let activeProvider: 'sqlite' | 'postgres' | 'mongodb' = 'sqlite';

export function createPrismaClient(): any {
  const provider = (process.env.DB_PROVIDER || '').toLowerCase();
  const mongoUri = process.env.MONGODB_URI;

  // ----------------------------------------------------
  // 1. MONGODB ATLAS PROVIDER BRANCH
  // ----------------------------------------------------
  if (provider === 'mongodb' || (mongoUri && mongoUri.trim().startsWith('mongodb'))) {
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

/**
 * Safely inspects the structure of MONGODB_URI without exposing credentials.
 */
export function getMongoUriDiagnostic(): {
  provider: string;
  hasUri: boolean;
  startsWithProtocol: boolean;
  hasLeadingTrailingQuotes: boolean;
  hasLeadingTrailingWhitespace: boolean;
  databasePathName: string;
  hasAuthSourceParam: boolean;
  authSourceValue: string | null;
  hasUnencodedSpecialChars: boolean;
  recommendation: string;
} {
  const provider = (process.env.DB_PROVIDER || 'sqlite').toLowerCase();
  const rawUri = process.env.MONGODB_URI || '';

  if (!rawUri) {
    return {
      provider,
      hasUri: false,
      startsWithProtocol: false,
      hasLeadingTrailingQuotes: false,
      hasLeadingTrailingWhitespace: false,
      databasePathName: 'none',
      hasAuthSourceParam: false,
      authSourceValue: null,
      hasUnencodedSpecialChars: false,
      recommendation: 'MONGODB_URI environment variable is missing in Render environment.',
    };
  }

  const hasLeadingTrailingQuotes = /^["'].*["']$/.test(rawUri.trim());
  const hasLeadingTrailingWhitespace = rawUri !== rawUri.trim();
  const cleanUri = rawUri.trim().replace(/^["']|["']$/g, '');

  const startsWithProtocol = cleanUri.startsWith('mongodb+srv://') || cleanUri.startsWith('mongodb://');
  
  let databasePathName = 'missing';
  let hasAuthSourceParam = false;
  let authSourceValue: string | null = null;
  let hasUnencodedSpecialChars = false;
  const recommendations: string[] = [];

  if (hasLeadingTrailingQuotes) {
    recommendations.push('Remove quotes around MONGODB_URI in Render environment.');
  }

  if (hasLeadingTrailingWhitespace) {
    recommendations.push('Remove leading/trailing spaces in MONGODB_URI in Render environment.');
  }

  try {
    const parts = cleanUri.split('://');
    if (parts.length === 2) {
      const authAndRest = parts[1];
      const firstSlash = authAndRest.indexOf('/');
      const firstQuestion = authAndRest.indexOf('?');

      if (firstSlash !== -1) {
        const pathEnd = firstQuestion !== -1 ? firstQuestion : authAndRest.length;
        const dbPath = authAndRest.substring(firstSlash + 1, pathEnd);
        databasePathName = dbPath || 'empty';
      } else {
        databasePathName = 'empty';
      }

      if (firstQuestion !== -1) {
        const queryString = authAndRest.substring(firstQuestion + 1);
        const searchParams = new URLSearchParams(queryString);
        hasAuthSourceParam = searchParams.has('authSource');
        authSourceValue = searchParams.get('authSource');
      }

      const atIndex = authAndRest.lastIndexOf('@');
      if (atIndex !== -1) {
        const creds = authAndRest.substring(0, atIndex);
        const colonIndex = creds.indexOf(':');
        if (colonIndex !== -1) {
          const pass = creds.substring(colonIndex + 1);
          if (pass.includes('@') || pass.includes('#') || pass.includes(':') || pass.includes('/')) {
            hasUnencodedSpecialChars = true;
            recommendations.push('Password contains unencoded special characters. URL-encode them (e.g. @ -> %40).');
          }
        }
      }
    }
  } catch {
    recommendations.push('URI parsing check warning.');
  }

  if (databasePathName === 'empty' || databasePathName === 'missing') {
    recommendations.push('Database name is missing before query parameters. Append /resolvex before ?');
  }

  if (!hasAuthSourceParam) {
    recommendations.push('Atlas users require authSource=admin query parameter in MONGODB_URI (e.g. ?authSource=admin&retryWrites=true&w=majority).');
  }

  return {
    provider,
    hasUri: true,
    startsWithProtocol,
    hasLeadingTrailingQuotes,
    hasLeadingTrailingWhitespace,
    databasePathName,
    hasAuthSourceParam,
    authSourceValue,
    hasUnencodedSpecialChars,
    recommendation: recommendations.length > 0 ? recommendations.join(' | ') : 'URI format structure looks valid.',
  };
}
