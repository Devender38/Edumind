// ResolveX Phase 24 — Strict Production Configuration & Secret Validation Engine

import { AppConfig } from './env.js';

export function validateProductionConfig(config: AppConfig): void {
  const isStrictEnv = config.env === 'production' || config.env === 'staging';

  if (!isStrictEnv) {
    return; // Safe defaults permitted in development and test environments
  }

  const errors: string[] = [];

  // 1. Validate Secret Integrity
  if (!config.authSecret) {
    errors.push('RESOLVEX_AUTH_SECRET environment variable is missing.');
  } else if (config.authSecret === 'resolvex-production-security-secret-key-32bytes-min') {
    errors.push('RESOLVEX_AUTH_SECRET must not use the default placeholder secret in production/staging.');
  } else if (config.authSecret.length < 32) {
    errors.push('RESOLVEX_AUTH_SECRET must be at least 32 characters long in production/staging.');
  }

  // 2. Validate Database URL & Production PostgreSQL Datasource
  if (!config.databaseUrl) {
    errors.push('DATABASE_URL environment variable is missing.');
  } else if (config.env === 'production' || config.env === 'staging') {
    const dbUrlLower = config.databaseUrl.toLowerCase();
    if (dbUrlLower.startsWith('file:') || dbUrlLower.includes('dev.db') || dbUrlLower.endsWith('.db')) {
      errors.push('DATABASE_URL must not use local SQLite file in production/staging mode. PostgreSQL is required.');
    } else if (!dbUrlLower.startsWith('postgres://') && !dbUrlLower.startsWith('postgresql://')) {
      errors.push('DATABASE_URL must be a valid PostgreSQL connection string (postgresql://...) in production/staging mode.');
    }
  }

  // 3. Validate Port Range
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    errors.push(`Invalid PORT number: ${config.port}`);
  }

  // 4. Validate Worker Concurrency
  if (isNaN(config.workerConcurrency) || config.workerConcurrency < 1) {
    errors.push(`Invalid RESOLVEX_WORKER_CONCURRENCY: ${config.workerConcurrency}`);
  }

  // 5. Validate Shutdown Grace Period
  if (isNaN(config.shutdownGraceMs) || config.shutdownGraceMs < 1000) {
    errors.push(`Invalid SHUTDOWN_GRACE_MS: ${config.shutdownGraceMs} (minimum 1000ms)`);
  }

  // 6. Validate Client URL in Production
  if (config.env === 'production' && config.clientUrl.includes('localhost')) {
    errors.push('CLIENT_URL must not point to localhost in production environment.');
  }

  if (errors.length > 0) {
    const errorMsg = `❌ [CRITICAL_CONFIG_ERROR] Fail-fast production configuration validation failed:\n  - ${errors.join(
      '\n  - '
    )}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}
