# Step 1 — PostgreSQL Production Infrastructure, Deployment & Maintenance Manual

## 1. Overview & Deployment Architecture

**Tech Zypher — ResolveX** is deployed as a containerized, production-hardened Node.js application backed by PostgreSQL.

```text
+-------------------------------------------------------------------------+
|                  Reverse Proxy / Ingress Controller                     |
+-------------------------------------------------------------------------+
                                    |
          HTTP GET /api/v1/health (Liveness Probe)
          HTTP GET /api/v1/health/readiness (Readiness Probe: DB SELECT 1)
          HTTP GET /api/v1/info (Safe Non-Sensitive Build Info)
                                    |
                                    v
+-------------------------------------------------------------------------+
|                      ResolveX Production Container                      |
|                Non-Root User (`appuser`), Exposed Port 5000            |
+-------------------------------------------------------------------------+
       |                                                 |
       v                                                 v
+------------------------------------+   +------------------------------------+
|         Express Web Server         |   |        ExecutionCoordinator        |
|  Strict RBAC & Tenant Isolation    |   |     Worker Lease & Polling     |
+------------------------------------+   +------------------------------------+
       \                                                 /
        v                                               v
+-------------------------------------------------------------------------+
|                        PostgreSQL 18.4 Database                         |
|   Schema: prisma/schema.pg.prisma (provider = "postgresql")             |
|   Durable State: Ticket, AgentRun, PolicyVersion, Incident, etc.       |
+-------------------------------------------------------------------------+
```

---

## 2. Environment Configuration & PostgreSQL Requirement

All production environment variables are validated at startup by `src/config/validation.ts`. When `NODE_ENV` is set to `production` or `staging`, the process **fails fast** if `DATABASE_URL` or `DATABASE_URL_PG` is missing, points to local SQLite (`file:./dev.db`), or uses a non-PostgreSQL connection string.

### Required Environment Variables

| Variable Name | Required | Description | Constraint / Example |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | Environment stage | `production` / `staging` |
| `PORT` | Yes | HTTP listening port | `5000` |
| `DATABASE_URL_PG` | Yes | PostgreSQL connection string | `postgresql://postgres:resolvex_dev_2026@127.0.0.1:5432/resolvex_test?schema=public` |
| `RESOLVEX_AUTH_SECRET` | Yes | HMAC signing secret | **Minimum 32 chars** |
| `CLIENT_URL` | Yes | Client application origin | Must not point to `localhost` in production |
| `RESOLVEX_WORKER_CONCURRENCY` | Yes | Max concurrent execution workers | `5` |
| `SHUTDOWN_GRACE_MS` | Yes | Max shutdown draining timeout | `30000` |

---

## 3. Database Migration Strategy & Deployment Order

### Certified Topology & Scope
- **Certified Deployment Topology**: Single-node or active-passive deployment topology.
- **Datasource Requirement**: PostgreSQL 18.4+ is **REQUIRED** in production, using `prisma/schema.pg.prisma` with `provider = "postgresql"`. SQLite (`file:./dev.db`) is restricted to local development and unit testing.
- **Migration Execution**:
  ```bash
  # Deploy pending Prisma migrations to PostgreSQL (non-destructive)
  npx prisma migrate deploy
  ```
  > ⚠️ Never execute `npx prisma db push` or `prisma migrate reset` in production environments.

### Sequential Production Deployment Order
1. Execute database backup snapshot (`pg_dump`).
2. Verify PostgreSQL network connectivity and credentials.
3. Deploy pending database schema migrations via `npx prisma migrate deploy`.
4. Deploy application container image (`docker compose -f docker-compose.prod.yml up -d`).
5. Execute HTTP readiness probe (`GET /api/v1/health/readiness`).
6. Run smoke verification suite.

---

## 4. Maintenance, Backup & Disaster Recovery Reference

For detailed PostgreSQL backup (`pg_dump`), restore (`pg_restore`), disaster recovery, and point-in-time recovery operational runbooks, refer to [`DATABASE_OPERATIONS.md`](file:///c:/Users/Devender/OneDrive/Documents/Project-1/DATABASE_OPERATIONS.md).

---

## 5. Containerization & CI/CD Pipeline

- **Docker Multi-Stage Build**: ResolveX uses multi-stage Docker builds to compile TypeScript backend and React frontend assets into a minimal production runtime image (`Dockerfile.prod`).
- **CI/CD Pipeline**: GitHub Actions workflows run automated linting, test suites, multi-node concurrency tests, and build verification on every pull request.

---

## 6. External Integrations & Health Monitoring (Step 2)

- **Integration Mode**: Set `INTEGRATION_MODE` (`INTEGRATIONS_SANDBOX` for testing/staging, `INTEGRATIONS_PRODUCTION` for live services).
- **Health Check Probe**: Ops health check endpoint available at `GET /api/v1/ops/integrations/health`:
  - Returns `HEALTHY` when all integration circuit breakers are `CLOSED`.
  - Returns `DEGRADED` if any breaker is `HALF_OPEN`.
  - Returns `UNHEALTHY` if any breaker is `OPEN`.
- **Documentation Reference**: For full adapter specs, circuit breaker thresholds, and out-of-band DB transaction design, see [`INTEGRATIONS.md`](file:///c:/Users/Devender/OneDrive/Documents/Project-1/INTEGRATIONS.md).

---

## 7. Real AI / LLM Layer Integration (Step 3)

- **AI Provider Modes**: Controlled via `AI_PROVIDER_MODE` (`AI_DISABLED`, `AI_SANDBOX`, `AI_PRODUCTION`).
- **Production Configuration**:
  ```env
  AI_PROVIDER_MODE=AI_SANDBOX # Set to AI_PRODUCTION for live OpenAI API
  OPENAI_API_KEY=sk-... # Required when AI_PROVIDER_MODE=AI_PRODUCTION
  OPENAI_MODEL_NAME=gpt-4o
  AI_CONFIDENCE_THRESHOLD=0.7
  MAX_AI_CALLS_PER_RUN=3
  ```
- **Safety Architecture Reference**: Full architecture specifications, prompt injection guardrail design, and secret redaction rules available in [`AI_ARCHITECTURE.md`](file:///c:/Users/Devender/OneDrive/Documents/Project-1/AI_ARCHITECTURE.md).

### Real AI / LLM Provider Capability & Status Matrix

| Capability | Status |
|---|---|
| AI abstraction | IMPLEMENTED |
| Sandbox AI | VERIFIED |
| OpenAI provider code | IMPLEMENTED |
| Mocked OpenAI tests | VERIFIED |
| Real OpenAI connectivity | NOT VERIFIED |
| Production credentials | NOT CONFIGURED |
| Production AI end-to-end | NOT VERIFIED |

