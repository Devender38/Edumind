// ResolveX Phase 22 — Production Deployment, Infrastructure & Health Test Suite

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import fs from 'fs';
import path from 'path';
import app, { setDrainingState, getDrainingState } from '../src/backend/server.js';
import { loadConfig, resetConfigForTesting, getRuntimeMetadata } from '../src/config/index.js';
import { validateProductionConfig } from '../src/config/validation.js';
import { seedProductionDatabase } from '../prisma/seed.prod.js';
import { ExecutionCoordinator } from '../src/execution/executionCoordinator.js';

let server: http.Server;
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address() as any;
      baseUrl = `http://localhost:${addr.port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  setDrainingState(false);
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

describe('Phase 22 — Configuration & Secret Validation Engine', () => {
  it('1. loadConfig parses default environment configuration', () => {
    resetConfigForTesting();
    const config = loadConfig();
    expect(config.env).toBeDefined();
    expect(config.port).toBeGreaterThan(0);
    expect(config.authSecret).toBeDefined();
  });

  it('2. validateProductionConfig permits safe defaults in development mode', () => {
    const devConfig = {
      env: 'development' as const,
      port: 5000,
      databaseUrl: 'file:./dev.db',
      authSecret: 'resolvex-production-security-secret-key-32bytes-min',
      workerConcurrency: 5,
      shutdownGraceMs: 30000,
      version: '22.0.0',
      commitSha: 'local',
      clientUrl: 'http://localhost:3000',
      autoRefundLimitInr: 10000,
      maxReplanAttempts: 3,
      enableVerificationCheck: true,
    };
    expect(() => validateProductionConfig(devConfig)).not.toThrow();
  });

  it('3. validateProductionConfig throws error in production when authSecret is default placeholder', () => {
    const prodConfig = {
      env: 'production' as const,
      port: 5000,
      databaseUrl: 'postgresql://user:pass@localhost:5432/resolvex?schema=public',
      authSecret: 'resolvex-production-security-secret-key-32bytes-min',
      workerConcurrency: 5,
      shutdownGraceMs: 30000,
      version: '22.0.0',
      commitSha: 'local',
      clientUrl: 'https://app.resolvex.tech',
      autoRefundLimitInr: 10000,
      maxReplanAttempts: 3,
      enableVerificationCheck: true,
    };
    expect(() => validateProductionConfig(prodConfig)).toThrow(/default placeholder secret/);
  });

  it('4. validateProductionConfig throws error in production when authSecret is under 32 characters', () => {
    const prodConfig = {
      env: 'production' as const,
      port: 5000,
      databaseUrl: 'postgresql://user:pass@localhost:5432/resolvex?schema=public',
      authSecret: 'too-short-secret',
      workerConcurrency: 5,
      shutdownGraceMs: 30000,
      version: '22.0.0',
      commitSha: 'local',
      clientUrl: 'https://app.resolvex.tech',
      autoRefundLimitInr: 10000,
      maxReplanAttempts: 3,
      enableVerificationCheck: true,
    };
    expect(() => validateProductionConfig(prodConfig)).toThrow(/at least 32 characters long/);
  });

  it('5. validateProductionConfig accepts valid 32+ char secret in production mode', () => {
    const prodConfig = {
      env: 'production' as const,
      port: 5000,
      databaseUrl: 'postgresql://user:pass@localhost:5432/resolvex?schema=public',
      authSecret: 'super-secure-production-auth-secret-key-32chars-minimum!',
      workerConcurrency: 5,
      shutdownGraceMs: 30000,
      version: '22.0.0',
      commitSha: 'local',
      clientUrl: 'https://app.resolvex.tech',
      autoRefundLimitInr: 10000,
      maxReplanAttempts: 3,
      enableVerificationCheck: true,
    };
    expect(() => validateProductionConfig(prodConfig)).not.toThrow();
  });

  it('6. validateProductionConfig throws error when PORT is invalid', () => {
    const badConfig = {
      env: 'production' as const,
      port: -1,
      databaseUrl: 'postgresql://user:pass@localhost:5432/resolvex?schema=public',
      authSecret: 'super-secure-production-auth-secret-key-32chars-minimum!',
      workerConcurrency: 5,
      shutdownGraceMs: 30000,
      version: '22.0.0',
      commitSha: 'local',
      clientUrl: 'https://app.resolvex.tech',
      autoRefundLimitInr: 10000,
      maxReplanAttempts: 3,
      enableVerificationCheck: true,
    };
    expect(() => validateProductionConfig(badConfig)).toThrow(/Invalid PORT/);
  });

  it('7. validateProductionConfig throws error when SHUTDOWN_GRACE_MS is under 1000ms', () => {
    const badConfig = {
      env: 'production' as const,
      port: 5000,
      databaseUrl: 'postgresql://user:pass@localhost:5432/resolvex?schema=public',
      authSecret: 'super-secure-production-auth-secret-key-32chars-minimum!',
      workerConcurrency: 5,
      shutdownGraceMs: 500,
      version: '22.0.0',
      commitSha: 'local',
      clientUrl: 'https://app.resolvex.tech',
      autoRefundLimitInr: 10000,
      maxReplanAttempts: 3,
      enableVerificationCheck: true,
    };
    expect(() => validateProductionConfig(badConfig)).toThrow(/Invalid SHUTDOWN_GRACE_MS/);
  });
});

describe('Phase 22 — Runtime Metadata & Info Endpoint', () => {
  it('8. getRuntimeMetadata formats non-sensitive runtime information', () => {
    const meta = getRuntimeMetadata('production', '22.0.0', 'sha123');
    expect(meta.service).toContain('ResolveX');
    expect(meta.version).toBe('22.0.0');
    expect(meta.environment).toBe('production');
    expect(meta.commitSha).toBe('sha123');
    expect(meta.nodeVersion).toBe(process.version);
  });

  it('9. GET /api/v1/info returns HTTP 200 and runtime metadata', async () => {
    const res = await fetch(`${baseUrl}/api/v1/info`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.info.service).toBeDefined();
    expect(data.info.version).toBeDefined();
  });

  it('10. GET /api/v1/info output does NOT expose secret keys or database URLs', async () => {
    const res = await fetch(`${baseUrl}/api/v1/info`);
    const text = await res.text();
    expect(text).not.toContain('RESOLVEX_AUTH_SECRET');
    expect(text).not.toContain('DATABASE_URL');
    expect(text).not.toContain('supersecret');
  });
});

describe('Phase 22 — Health & Readiness Probe Hardening', () => {
  it('11. GET /api/v1/health returns 200 OK when service is live', async () => {
    setDrainingState(false);
    const res = await fetch(`${baseUrl}/api/v1/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
  });

  it('12. GET /api/v1/health/readiness returns 200 OK when database & coordinator are ready', async () => {
    setDrainingState(false);
    const res = await fetch(`${baseUrl}/api/v1/health/readiness`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.readiness).toBe(true);
    expect(data.status).toBe('READY');
  });

  it('13. GET /api/v1/health/readiness returns 503 when draining state is enabled', async () => {
    setDrainingState(true);
    const res = await fetch(`${baseUrl}/api/v1/health/readiness`);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.readiness).toBe(false);
    expect(data.status).toBe('SHUTTING_DOWN');
    setDrainingState(false); // Reset
  });

  it('14. GET /api/v1/health returns DRAINING status when draining state is enabled', async () => {
    setDrainingState(true);
    const res = await fetch(`${baseUrl}/api/v1/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('DRAINING');
    setDrainingState(false); // Reset
  });

  it('15. ExecutionCoordinator isReady returns true when active', () => {
    const coordinator = ExecutionCoordinator.getInstance();
    expect(coordinator.isReady()).toBe(true);
  });
});

describe('Phase 22 — Containerization & Deployment Artifacts', () => {
  it('16. Dockerfile exists in project root', () => {
    const dockerfilePath = path.join(process.cwd(), 'Dockerfile');
    expect(fs.existsSync(dockerfilePath)).toBe(true);
  });

  it('17. Dockerfile includes multi-stage build instructions', () => {
    const dockerfile = fs.readFileSync(path.join(process.cwd(), 'Dockerfile'), 'utf-8');
    expect(dockerfile).toContain('FROM node:20-alpine AS builder');
    expect(dockerfile).toContain('FROM node:20-alpine AS production');
  });

  it('18. Dockerfile configures non-root user execution', () => {
    const dockerfile = fs.readFileSync(path.join(process.cwd(), 'Dockerfile'), 'utf-8');
    expect(dockerfile).toContain('USER appuser');
  });

  it('19. Dockerfile contains HEALTHCHECK probe command', () => {
    const dockerfile = fs.readFileSync(path.join(process.cwd(), 'Dockerfile'), 'utf-8');
    expect(dockerfile).toContain('HEALTHCHECK');
    expect(dockerfile).toContain('/api/v1/health');
  });

  it('20. .dockerignore exists and excludes node_modules and .env files', () => {
    const ignore = fs.readFileSync(path.join(process.cwd(), '.dockerignore'), 'utf-8');
    expect(ignore).toContain('node_modules');
    expect(ignore).toContain('.env');
  });

  it('21. docker-compose.yml development manifest exists', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'docker-compose.yml'))).toBe(true);
  });

  it('22. docker-compose.prod.yml production manifest exists and contains restart policy', () => {
    const composeProd = fs.readFileSync(path.join(process.cwd(), 'docker-compose.prod.yml'), 'utf-8');
    expect(composeProd).toContain('restart: unless-stopped');
    expect(composeProd).toContain('healthcheck:');
  });

  it('23. .nvmrc file specifies Node version v20.14.0', () => {
    const nvmrc = fs.readFileSync(path.join(process.cwd(), '.nvmrc'), 'utf-8');
    expect(nvmrc).toContain('v20.14.0');
  });
});

describe('Phase 22 — Secret & Source Control Protection', () => {
  it('24. .gitignore excludes .env files', () => {
    const gitignore = fs.readFileSync(path.join(process.cwd(), '.gitignore'), 'utf-8');
    expect(gitignore).toContain('.env');
  });

  it('25. .gitignore excludes database files', () => {
    const gitignore = fs.readFileSync(path.join(process.cwd(), '.gitignore'), 'utf-8');
    expect(gitignore).toContain('*.db');
  });

  it('26. .env.example exists and contains safe placeholders', () => {
    const example = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf-8');
    expect(example).toContain('NODE_ENV=development');
    expect(example).toContain('RESOLVEX_AUTH_SECRET=');
  });
});

describe('Phase 22 — Database Lifecycle & Migration Strategy', () => {
  it('27. seedProductionDatabase runs non-destructively', async () => {
    await expect(seedProductionDatabase()).resolves.not.toThrow();
  });

  it('28. package.json contains production database scripts', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
    expect(pkg.scripts['db:seed:prod']).toBeDefined();
    expect(pkg.scripts['db:migrate:prod']).toBeDefined();
  });
});

describe('Phase 22 — CI/CD Pipeline Configuration', () => {
  it('29. .github/workflows/ci.yml exists', () => {
    const ciPath = path.join(process.cwd(), '.github', 'workflows', 'ci.yml');
    expect(fs.existsSync(ciPath)).toBe(true);
  });

  it('30. ci.yml includes type checking step', () => {
    const ciContent = fs.readFileSync(path.join(process.cwd(), '.github', 'workflows', 'ci.yml'), 'utf-8');
    expect(ciContent).toContain('npx tsc --noEmit');
  });

  it('31. ci.yml includes build step', () => {
    const ciContent = fs.readFileSync(path.join(process.cwd(), '.github', 'workflows', 'ci.yml'), 'utf-8');
    expect(ciContent).toContain('npm run build');
  });

  it('32. ci.yml includes vitest test execution step', () => {
    const ciContent = fs.readFileSync(path.join(process.cwd(), '.github', 'workflows', 'ci.yml'), 'utf-8');
    expect(ciContent).toContain('npx vitest run');
  });

  it('33. ci.yml includes golden evaluation runner step', () => {
    const ciContent = fs.readFileSync(path.join(process.cwd(), '.github', 'workflows', 'ci.yml'), 'utf-8');
    expect(ciContent).toContain('npm run evaluate');
  });
});

describe('Phase 22 — Documentation Completeness', () => {
  it('34. DEPLOYMENT.md exists and documents deployment steps', () => {
    const depPath = path.join(process.cwd(), 'DEPLOYMENT.md');
    expect(fs.existsSync(depPath)).toBe(true);
    const content = fs.readFileSync(depPath, 'utf-8');
    expect(content).toContain('Docker Multi-Stage');
    expect(content).toContain('CI/CD Pipeline');
  });

  it('35. PRODUCTION.md exists and documents health and shutdown runbook', () => {
    const prodPath = path.join(process.cwd(), 'PRODUCTION.md');
    expect(fs.existsSync(prodPath)).toBe(true);
    const content = fs.readFileSync(prodPath, 'utf-8');
    expect(content).toContain('Health & Readiness Probes');
    expect(content).toContain('Graceful Shutdown');
  });
});
