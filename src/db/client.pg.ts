// ResolveX — PostgreSQL-Specific PrismaClient
// Used exclusively for PostgreSQL integration tests and production verification.
// This client connects to the real PostgreSQL instance via DATABASE_URL_PG env var.
// DO NOT use this client in regular application code — use src/db/client.ts instead.

// @ts-ignore — generated client-pg is outside normal module resolution
import { PrismaClient } from '../../node_modules/.prisma/client-pg';


let _prismaPgInstance: any = null;

export function getPrismaPgClient() {
  if (_prismaPgInstance) return _prismaPgInstance;
  const pgDatabaseUrl = process.env.DATABASE_URL_PG || process.env.DATABASE_URL;
  if (!pgDatabaseUrl || (!pgDatabaseUrl.startsWith('postgresql://') && !pgDatabaseUrl.startsWith('postgres://'))) {
    return null;
  }
  _prismaPgInstance = new PrismaClient({
    datasources: {
      db: {
        url: pgDatabaseUrl,
      },
    },
    log: ['error'],
  });
  return _prismaPgInstance;
}

export const prismaPg = new Proxy({}, {
  get(_target, prop) {
    const client = getPrismaPgClient();
    if (!client) {
      throw new Error('[pg-client] DATABASE_URL_PG is not set or not a valid PostgreSQL connection string.');
    }
    return client[prop];
  }
});
