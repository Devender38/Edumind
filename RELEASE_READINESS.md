# Tech Zypher — ResolveX Production Release Readiness Manual & Deployment Guide

## 1. Executive Overview
This document specifies the production deployment architecture, security model, configuration parameters, health check specifications, rollback procedures, and operational runbooks for **Tech Zypher — ResolveX Autonomous Customer Resolution Agent** (Release Candidate 1.0.0).

---

## 2. Production Prerequisites & Environment Setup
- **Runtime Node.js**: Node.js v20.x LTS or v22.x LTS (tested on Node v25.4.0).
- **Database Infrastructure**: PostgreSQL 18.4+ is **REQUIRED** for production/staging environments (`prisma/schema.pg.prisma` with `provider = "postgresql"`). SQLite (`file:./dev.db`) is supported strictly for local unit/regression testing.
- **Port Requirement**: Exposed TCP port (default `5000` or environment-configured `PORT`).
- **Containerization**: Docker & Docker Compose v2.x.

---

## 3. Environment Variables & Secret Configuration

| Environment Variable | Required | Description | Production Constraint / Default |
|---|---|---|---|
| `NODE_ENV` | Yes | Application environment | `production` or `staging` |
| `PORT` | Yes | HTTP listening port | `5000` (valid range 1–65535) |
| `DATABASE_URL_PG` | Yes | Database connection string | PostgreSQL URL (e.g. `postgresql://user:pass@host:5432/db`) |
| `RESOLVEX_AUTH_SECRET` | Yes | HMAC-SHA256 signing secret | **Minimum 32 characters**, non-default |
| `CLIENT_URL` | Yes | Frontend client URL | Cannot point to `localhost` in production |
| `RESOLVEX_WORKER_CONCURRENCY` | No | Parallel execution worker count | `5` (minimum 1) |
| `SHUTDOWN_GRACE_MS` | No | Graceful shutdown timeout (ms) | `30000` (minimum 1000ms) |
| `RESOLVEX_VERSION` | No | Version string format `X.Y.Z` | `1.0.0` |
| `RESOLVEX_COMMIT_SHA` | No | Git commit SHA | `release-candidate-1.0.0` |

---

## 4. Database Requirements & Migration Workflow
- **Prisma ORM**: All database access governed by Prisma Client v6.4.1. Production client generated at `node_modules/.prisma/client-pg`.
- **Migration Strategy**: Run `npm run db:migrate:prod` (`npx prisma migrate deploy --schema=prisma/schema.pg.prisma`).
- **Indexing Strategy**: 48 physical indexes across 19 PostgreSQL tables verified via `pg_indexes`.

---

## 5. Deployment Topology & Boundary Certification
- **Certified Topology**: Certified for **single-node** or **active-passive** deployment topologies.
- **Active-Active Boundary**: **NOT certified for multi-node active-active deployment** without external distributed lock coordination (e.g. Redis / PostgreSQL advisory locks).
- **Side-Effect Semantics**: Side effects (refunds, replacements, cancellations) provide **effectively-once** semantics backed by idempotency keys, database uniqueness constraints, and ground-truth verification. No external distributed exactly-once guarantee is claimed beyond these mechanisms.

### Deployment Procedure
1. Build production containers: `docker compose -f docker-compose.prod.yml build`
2. Run database migrations: `docker compose -f docker-compose.prod.yml run --rm backend npx prisma db push`
3. Launch services: `docker compose -f docker-compose.prod.yml up -d`
4. Probe readiness endpoint: `GET http://localhost:5000/api/v1/health/readiness` (Expect `status: "READY"`).

### Rollback Procedure
1. Stop running containers: `docker compose -f docker-compose.prod.yml down`
2. Restore database backup snapshot if migration altered schema destructively.
3. Deploy previous image tag: `IMAGE_TAG=previous-version docker compose -f docker-compose.prod.yml up -d`

---

## 6. Health & Readiness Semantics
- `GET /api/v1/health`: Liveness probe. Returns HTTP 200 `{ status: "ok" }` unless server is in `DRAINING` state.
- `GET /api/v1/health/readiness`: Readiness probe. Returns HTTP 200 `{ status: "READY", readiness: true }` when database connectivity probe (`SELECT 1`) succeeds and `ExecutionCoordinator` is ready. Returns HTTP 503 if database is unreachable or backend is shutting down.

---

## 7. Graceful Shutdown Workflow
- Listens for `SIGTERM` and `SIGINT` OS signals.
- Marks server in `DRAINING` state (`isDraining = true`) to reject new ingress traffic on health probes.
- Stops `ExecutionCoordinator` worker poll loops cleanly.
- Waits up to `SHUTDOWN_GRACE_MS` (default 30s) for in-flight tasks to terminate before disconnecting Prisma DB pool.

---

## 8. Worker Execution & Crash Recovery
- **Lease Fencing**: Jobs claimed with atomic SQL updates updating `leaseUntil` and incrementing `leaseGeneration`.
- **Stale Worker Recovery**: `ExecutionCoordinator` periodic worker reconciles expired worker leases and safely re-enqueues jobs.
- **Atomic Mutations**: Business mutations enforce idempotency keys (`ActionRecord.actionKey`) to prevent duplicate transactions if worker crashes mid-execution.

---

## 9. Authentication, RBAC & Tenant Isolation
- **Authentication Protocol**: HTTP Authorization Bearer tokens signed and verified using **HMAC-SHA256 signature verification** in `AuthService`. Token payloads include user ID, role, tenant ID, and expiration timestamp.
- **Roles**: `CUSTOMER`, `OPERATOR`, `APPROVER`, `ADMIN`, `SERVICE`.
- **Tenant Isolation**: Principal `tenantId` is immutable and enforced from the authenticated security context. Caller-supplied `x-tenant-id` headers cannot override authenticated principal identity. Cross-tenant access returns HTTP 404 (hides resource existence).

---

## 10. Business Safety Guarantees (14 Zero-Tolerance Invariants)
1. **False Resolutions**: 0 allowed. Ground-truth verification required.
2. **Approval Bypasses**: 0 allowed. High-value mutations strictly gated.
3. **Consent Bypasses**: 0 allowed. Customer replacements/returns strictly gated.
4. **Duplicate Mutations**: 0 allowed. Unique constraint & idempotency enforced.
5. **Verification Bypasses**: 0 allowed. Ground-truth status probe mandatory.
6. **Illegal State Transitions**: 0 allowed. Strict state machine transition validation.
7. **Infinite Loops / Unbounded Retries**: Max replan & retry caps strictly enforced.
8. **Tenant Isolation Leakage**: Strict tenant filtering on all queries.
9. **RBAC Escalation Vulnerabilities**: Strict role validation on all endpoints.
10. **Unhandled Async Crashing**: Top-level try-catch on all async handlers.
11. **Timing Safe Verification**: Constant-time signature comparison before length check.
12. **Fail-Fast Misconfigurations**: Immediate process crash on invalid config.
13. **Database Concurrency Race Protection**: Unique fingerprint and idempotency indexes.
14. **Unauthorized Incident Override**: Incident closure requires explicit `ADMIN` role.

---

## 11. Observability, Metrics & Incident Management
- **Prometheus Endpoint**: `GET /api/v1/metrics` exposes application metrics and zero-tolerance safety counters.
- **Label Minimization**: High-cardinality values (`correlationId`, customer message, bearer tokens) are sanitized.
- **SLO Monitoring**: `GET /api/v1/ops/slo` tracks availability, execution success, and safety invariant compliance.
- **Alert Deduplication**: Alerts are deduplicated via SHA-256 fingerprints (`sha256(defId:tenantId:component)`).
- **Incident Lifecycle**: States (`OPEN` → `ACKNOWLEDGED` → `INVESTIGATING` → `MITIGATING` → `RESOLVED` → `CLOSED`) logged in durable audit history.

---

## 12. Backup, Recovery & Disaster Recovery
- **Database Backup**: Periodic automated SQLite database snapshotting or PostgreSQL WAL archiving.
- **Restore Procedure**: Stop application server, copy backup file to `DATABASE_URL` location, execute `npx prisma db push`, verify `GET /api/v1/health/readiness`.

---

## 13. Dependency & Supply-Chain Audit Summary
- Audit Tool: `npm audit`
- Total Direct Production Dependencies: 96
- Total Development Dependencies: 269
- High/Critical Development Findings: `vitest` (GHSA-5xrq-8626-4rwp), `vite` (GHSA-fx2h-pf6j-xcff).
- Production Inclusion: **EXCLUDED**. Build and test tools are pruned during production bundle/container compilation (`npm prune --omit=dev`).
- Production Runtime Status: **0 High or Critical runtime blockers**.

---

## 14. Known Limitations
1. **Deployment Boundary**: Process locking and lease fencing certified for single-node or active-passive topologies. Multi-node active-active deployments require external distributed locking (Redis / PostgreSQL).
2. **Rate Limiting Scope**: Rate limiting is process-local in single-instance deployments.

---

## 15. Final Certification Summary

| Pipeline Check | Result | Details |
|---|---|---|
| **Phase 24 Hardening Suite** | **PASS** | 62 / 62 Tests Passed |
| **Live HTTP & Certification Suite** | **PASS** | 15 / 15 Tests Passed |
| **Full Regression Suite** | **PASS** | 501 / 501 Tests Passed (23 Files) |
| **Backend & Frontend Build** | **PASS** | TypeScript & Vite Builds Clean |
| **Database Seed** | **PASS** | Deterministic Seed Clean |
| **Golden Benchmark** | **PASS** | 50/50 Passed (100% Quality, 100% Safety Compliance) |
| **Safety Invariants Scorecard** | **PASS** | 0 Violations across 16 Safety Metrics |

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

**FINAL RELEASE DECISION**: `STEP 3 NOT CERTIFIED — REAL PROVIDER CONNECTIVITY PENDING`
