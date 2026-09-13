# ResolveX — Production Job Execution, Concurrency & Graceful Shutdown (Phase 17)

This document details the production job execution architecture, lease mechanism, heartbeat, stale job recovery, graceful process shutdown, concurrency bounds, and database-backed worker pool implemented in **Phase 17** for the **ResolveX Autonomous Customer Resolution Agent**.

---

## 1. Architecture Overview

Phase 17 introduces a durable, database-backed execution coordinator (`ExecutionCoordinator`) around the autonomous engine. It ensures that process crashes, worker restarts, duplicate HTTP requests, or concurrent execution attempts never cause duplicate business mutations or corrupt `AgentRun` state.

```
       HTTP Request
            │
            ▼
┌───────────────────────────┐
│ Authentication &          │ (Phase 16 RBAC & Tenant Isolation)
│ Security Boundary         │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ AgentRun Persistence      │ (AgentStateRepository.createAgentRun)
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ ExecutionJob Persistence  │ (ExecutionRepository.createJob)
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ ExecutionCoordinator      │ (Atomic Lease Acquisition, Worker ID,
│ Worker Pool               │  Concurrency Limits, Heartbeat, Recovery)
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Autonomous Orchestration  │ (Existing Phase 1-16 Policy, Decision,
│ & Verification Engine     │  Action, Verification, Replan)
└───────────────────────────┘
```

---

## 2. Execution Job & Lease Persistence Model

Persistence for execution jobs is managed via the `ExecutionJob` table in SQLite/Prisma ([prisma/schema.prisma](file:///c:/Users/Devender/OneDrive/Documents/Project-1/prisma/schema.prisma)):

```prisma
model ExecutionJob {
  id              String    @id @default(uuid())
  agentRunId      String
  agentRun        AgentRun  @relation(fields: [agentRunId], references: [id], onDelete: Cascade)
  tenantId        String    @default("tenant-a")
  status          String    @default("QUEUED") // QUEUED, RUNNING, WAITING, COMPLETED, FAILED, CANCELLED
  workerId        String?
  leaseUntil      DateTime?
  lastHeartbeatAt DateTime?
  attempt         Int       @default(0)
  maxAttempts     Int       @default(3)
  correlationId   String?
  errorCode       String?
  errorMessage    String?
  createdAt       DateTime  @default(now())
  startedAt       DateTime?
  completedAt     DateTime?
  updatedAt       DateTime  @updatedAt
}
```

### Execution States vs. Business AgentRun States

| `ExecutionJob.status` | Description | Corresponding `AgentRun.status` |
| :--- | :--- | :--- |
| **`QUEUED`** | Job enqueued and waiting for an available worker | `PLANNING`, `INVESTIGATING` |
| **`RUNNING`** | Worker holds lease and actively executing orchestration | `INVESTIGATING`, `DECIDING`, `ACTING`, `VERIFYING` |
| **`WAITING`** | Job paused at human gate; worker lease released | `WAITING_FOR_APPROVAL`, `WAITING_FOR_CUSTOMER_CONSENT` |
| **`COMPLETED`** | Orchestration completed successfully | `RESOLVED`, `COMPLETED` |
| **`FAILED`** | Max attempts exceeded or unrecoverable error | `ESCALATED`, `FAILED` |

---

## 3. Atomic Lease Acquisition & Concurrency Control

To ensure that the same `AgentRun` is never executed concurrently by multiple workers or processes:

1. **Atomic Lease Condition**: A worker can only claim a job if `status == 'QUEUED'`, `status == 'WAITING'`, or (`status == 'RUNNING'` AND `leaseUntil < now`).
2. **Worker Identification**: Each worker process generates a unique identifier on startup (`worker-<pid>-<random>`).
3. **Atomic DB Update**: `ExecutionRepository.acquireLeaseAtomically` uses an atomic `updateMany` condition. If worker B attempts to acquire a job currently leased by worker A, the update returns `count = 0` and worker B's acquisition is rejected.

---

## 4. Heartbeat & Lease Expiration

- **Lease Duration**: Default `LEASE_DURATION_MS = 30,000ms` (30 seconds).
- **Heartbeat Interval**: Default `HEARTBEAT_INTERVAL_MS = 5,000ms` (5 seconds).
- **Behavior**: While an `ExecutionJob` is `RUNNING`, the worker periodically updates `lastHeartbeatAt = now()` and extends `leaseUntil = now + 30s`. When the job completes or enters a waiting state, the heartbeat timer is cleared immediately.

---

## 5. Crash Recovery & Ground-Truth Verification

If a worker process crashes while executing a job (`RUNNING` with `leaseUntil < now`):

1. **Stale Lease Identification**: `ExecutionCoordinator` periodically scans for expired leases (`staleCheckIntervalMs = 10,000ms`).
2. **Ground-Truth Database Verification**: Before re-executing any action, `recoverStaleJobs` inspects SQLite ground truth via `AgentStateRepository.getOperatorRunDetail`.
3. **Zero Duplicate Mutations**:
   - If business mutations (`RefundTransaction`, `Order` replacement) were already executed and verified before the crash, the run is reconciled to `RESOLVED` and the job is marked `COMPLETED` without re-running actions.
   - If no verified mutations exist, the job lease is safely recovered for retry.

---

## 6. Graceful Process Shutdown

Upon receiving `SIGTERM` or `SIGINT`:

1. **Readiness Endpoint**: `GET /api/v1/health/readiness` transitions from `200 READY` to `503 Service Unavailable`.
2. **New Work Rejection**: `ExecutionCoordinator` stops accepting or claiming queued jobs (`isShuttingDown = true`).
3. **Bounded In-Flight Drain**: In-flight jobs are allowed up to `SHUTDOWN_GRACE_MS = 10,000ms` (10 seconds) to complete.
4. **Lease Expiration on Timeout**: If in-flight work exceeds the grace period, active leases are released (`leaseUntil = null`) so other workers can safely recover them later.
5. **Clean Exit**: Heartbeat timers are cleared, HTTP server closes, and Prisma disconnects cleanly before exiting.

---

## 7. Controlled Worker Concurrency

- **Configurable Limit**: Environment variable `RESOLVEX_WORKER_CONCURRENCY` (default: 5).
- **Capacity Enforcement**: Worker pool tracks `activeJobs.size <= concurrency`.
- **Waiting States Free Capacity**: Jobs entering `WAITING_FOR_APPROVAL` or `WAITING_FOR_CUSTOMER_CONSENT` release their worker lease and do not consume worker concurrency.

---

## 8. Limitations & Distributed Migration Strategy

> **Local / Single-Database Execution Notice**:
> The current database-backed execution coordinator is designed for single-process local deployment, local development, and deterministic evaluation benchmarking. Multi-instance production deployments should transition the persistence backend to a distributed queue (such as Redis/BullMQ or Temporal) in a future phase.

---

## 9. Phase Boundary Statement

> **Phase 17 implemented.** Phase 18+ was **NOT** implemented.
