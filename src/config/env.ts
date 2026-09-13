// ResolveX Phase 22 — Centralized Production Environment Configuration Engine

import dotenv from 'dotenv';
import { validateProductionConfig } from './validation.js';

dotenv.config();

export type Environment = 'development' | 'test' | 'staging' | 'production';

export interface AppConfig {
  env: Environment;
  port: number;
  databaseUrl: string;
  authSecret: string;
  workerConcurrency: number;
  shutdownGraceMs: number;
  version: string;
  commitSha: string;
  clientUrl: string;
  autoRefundLimitInr: number;
  maxReplanAttempts: number;
  enableVerificationCheck: boolean;
  openaiApiKey?: string;
  geminiApiKey?: string;
}

export function loadConfig(): AppConfig {
  const env = (process.env.NODE_ENV || 'development').toLowerCase() as Environment;
  const port = parseInt(process.env.PORT || '5000', 10);
  const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
  const authSecret = process.env.RESOLVEX_AUTH_SECRET || 'resolvex-production-security-secret-key-32bytes-min';
  const workerConcurrency = parseInt(process.env.RESOLVEX_WORKER_CONCURRENCY || '5', 10);
  const shutdownGraceMs = parseInt(process.env.SHUTDOWN_GRACE_MS || '30000', 10);
  const version = process.env.RESOLVEX_VERSION || '22.0.0';
  const commitSha = process.env.RESOLVEX_COMMIT_SHA || process.env.GIT_COMMIT || 'development-local-build';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const autoRefundLimitInr = parseInt(process.env.AUTO_REFUND_LIMIT_INR || '10000', 10);
  const maxReplanAttempts = parseInt(process.env.MAX_REPLAN_ATTEMPTS || '3', 10);
  const enableVerificationCheck = process.env.ENABLE_VERIFICATION_CHECK !== 'false';

  const config: AppConfig = {
    env,
    port,
    databaseUrl,
    authSecret,
    workerConcurrency,
    shutdownGraceMs,
    version,
    commitSha,
    clientUrl,
    autoRefundLimitInr,
    maxReplanAttempts,
    enableVerificationCheck,
    openaiApiKey: process.env.OPENAI_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
  };

  // Perform strict production validation
  validateProductionConfig(config);

  return config;
}

let activeConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!activeConfig) {
    activeConfig = loadConfig();
  }
  return activeConfig;
}

export function resetConfigForTesting(): void {
  activeConfig = null;
}
