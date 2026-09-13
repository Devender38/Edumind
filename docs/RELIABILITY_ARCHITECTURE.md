# ResolveX Autonomous Agent Engine — Reliability & Resilience Architecture

## 1. Overview
This document specifies the production reliability, operational resilience, and fault-tolerance architecture of the ResolveX Autonomous Agent Engine. The engine is architected to guarantee zero data loss, zero duplicate financial mutations, and uninterrupted execution state recovery under process crashes, database failovers, worker node deaths, and outbound network interruptions.

## 2. Core Architectural Principles
- **Advisory-Only LLM**: High-level AI models (LLM) formulate decisions and recommendations but possess **0 direct database mutation authority**. All state changes pass through strict deterministic Policy Engine rules and execution stores.
- **Write-Ahead Log (WAL) & Durable State Machine**: Every state transition and proposed tool call is written durably to database state (`AgentTrace` and `AgentRun`) prior to side-effect execution.
- **Fencing Tokens & Distributed Leases**: Work execution uses lease timeouts (`leaseUntil`) and incrementing fencing tokens (`version`/`fencingToken`) to guarantee at-most-once execution even in split-brain worker conditions.
- **Ground-Truth Reconciliation**: Outbound mutations returning unknown status (5xx, timeouts, connection drops) are marked `UNKNOWN_OUTCOME`. Subsequent retries must query the external provider's status endpoint using the deterministic idempotency key before re-issuing any action.

## 3. Resilience Subsystems

### 3.1 Lease Engine & Worker Failover
- Workers acquire jobs by renewing leases (`leaseUntil = now() + 30s`).
- If a worker crashes or loses network connectivity, its heartbeat ceases.
- Upon lease expiration, `recoverExpiredLeases()` releases the lock and allows standby workers to safely claim the job.
- Late writes from partitioned/zombie workers are rejected via strict fencing token checking.

### 3.2 Database Resilience & Connection Pool Management
- Database interactions use `withDatabaseRetry()`, wrapping transient Prisma connection errors (`P1001`, `P1002`, `P2024`, lock timeouts).
- Automatic linear and exponential backoff with jitter prevents thundering herd on DB node restart.
- Read/Write splitting: Health probes monitor replica lag and route critical state writes exclusively to the primary node.

### 3.3 Outbound Network & Circuit Breaker Pattern
- All outbound HTTP calls pass through `SSRFGuard` and per-hop redirect validation (up to 5 redirects max, blocking internal metadata endpoints `169.254.169.254`, loopback, and private IPs).
- HTTP requests enforce exponential backoff for transient 5xx errors and 429 rate limits (respecting `Retry-After`).
- Consecutive outbound failures trip the `CircuitBreaker` (`CLOSED` -> `OPEN` -> `HALF_OPEN` -> `CLOSED`), preventing downstream cascading outages.

### 3.4 Webhook Idempotency & Deduplication
- Inbound webhooks compute a deterministic SHA-256 hash of `tenantId + eventType + payloadHash + idempotencyKey`.
- Hashes are cached in an atomic deduplication store with a configurable window (e.g., 24 hours).
- Duplicate deliveries within the window are acknowledged as HTTP 200/202 but skipped without triggering duplicate pipeline runs.

---

## 4. Operational Health & Telemetry
- `/health/liveness`: Returns 200 OK if HTTP server thread loop is responsive.
- `/health/readiness`: Performs active database connectivity ping (`checkDatabaseHealth`). Returns 503 Service Unavailable if database is unreachable or engine is undergoing graceful shutdown drain.
- `SIGTERM / SIGINT` Handling: Initiates 30-second graceful drain window. Stops accepting new webhooks, allows active in-flight worker tasks to complete, and flushes telemetry buffers prior to shutdown.
