# ResolveX Production Architecture — Distributed Execution, Fencing & Coordination Spec

## 1. Overview & System Boundary

ResolveX employs a **storage-agnostic, multi-worker execution architecture** that guarantees business mutation safety under process crashes, network delays, multi-worker concurrency, and lease expiration.

```text
HTTP / Client API
       ↓
Authentication & Security Context (Phase 16)
       ↓
Tenant Isolation & Idempotency Check (Phase 16 & 18)
       ↓
AgentRun Persistence (Prisma / SQL DB)
       ↓
ExecutionJob Enqueue (ExecutionStore)
       ↓
Worker Pool Execution Coordinator (ExecutionCoordinator)
       ↓
Monotonic Lease Claim & Fencing Token Generation
       ↓
AgentOrchestrator Execution Loop
       ↓
Tool Execution & Idempotent Financial/Inventory Action
       ↓
Ground Truth Inspection & Reconciliation (Phase 14)
       ↓
Verified Terminal State (RESOLVED / ESCALATED / FAILED)
```

---

## 2. Infrastructure Guarantee Matrix

The system explicitly distinguishes the guarantees available at each deployment tier:

| Guarantee Tier | Current SQLite Single-DB Stack | Production Relational DB (PostgreSQL / MySQL) | Distributed Queue (Redis / BullMQ / Temporal) |
|---|---|---|---|
| **Multi-Worker Concurrency** | Atomic conditional update (`updateMany` with generation checks) | Native row locking (`SELECT FOR UPDATE SKIP LOCKED`) | Distributed queue message dispatch & worker lock |
| **Monotonic Fencing** | `leaseGeneration` field incremented atomically | `leaseGeneration` field incremented atomically | Fencing tokens passed via lock manager |
| **Idempotent Enqueue** | Unique DB constraint (`idempotencyKey`) | Unique DB constraint (`idempotencyKey`) | Unique message key deduplication |
| **Delivery Model** | At-least-once delivery | At-least-once delivery | At-least-once delivery |
| **Mutation Integrity** | **Effectively-Once** (DB Idempotency + Verification) | **Effectively-Once** (DB Idempotency + Verification) | **Effectively-Once** (DB Idempotency + Verification) |

> [!IMPORTANT]
> **Distributed Exactly-Once vs. Effectively-Once**: Distributed systems cannot achieve raw "exactly-once delivery" across unreliable networks. ResolveX guarantees **effectively-once business mutation** via:
> $$\text{At-Least-Once Delivery} + \text{DB Idempotency} + \text{Monotonic Fencing} + \text{Ground-Truth Verification} = \text{Effectively-Once Mutation}$$

---

## 3. Monotonic Fencing Token Mechanism

To eliminate split-brain execution bugs (e.g., a worker stalling due to a garbage collection pause, losing its lease to a second worker, and then attempting to finalize the job), ResolveX uses a monotonic fencing token: `leaseGeneration`.

### Lease Claim Algorithm
1. Candidate jobs are fetched ordered by `createdAt ASC`, `id ASC`.
2. Worker attempts an atomic claim:
   $$\text{UPDATE ExecutionJob SET status='RUNNING', workerId}=W, \text{leaseGeneration}=\text{leaseGeneration}+1, \text{leaseUntil}=T_{\text{now}} + \Delta t$$
   $$\text{WHERE id}=J \text{ AND leaseGeneration}=G \text{ AND (status='QUEUED' OR status='WAITING' OR (status='RUNNING' AND leaseUntil} < T_{\text{now}}))$$
3. If `updateCount == 0`, lease acquisition fails (`EXECUTION_CLAIM_CONFLICT`).
4. On every heartbeat or state transition (`markCompleted`, `markWaiting`, `markFailed`), the worker MUST provide the exact `leaseGeneration` acquired during step 2.
5. If the database row generation has been incremented by another worker, the query matches 0 rows and rejects the update (`EXECUTION_FENCING_CONFLICT`).

---

## 4. Formal Job State Machine

```text
       [QUEUED] ───────────────────┐
          │ (claim)                 │ (cancel)
          ▼                         ▼
      [RUNNING] ────────────► [CANCELLED]
       │   │  ▲ (resume)
(pause)│   │  │
       │   │  └─── [WAITING]
       │   ▼
       │  [FAILED]
       ▼
  [COMPLETED]
```

### Allowed Transitions:
- `QUEUED` $\rightarrow$ `RUNNING`, `CANCELLED`
- `RUNNING` $\rightarrow$ `WAITING`, `COMPLETED`, `FAILED`, `QUEUED` (stale retry)
- `WAITING` $\rightarrow$ `RUNNING`, `CANCELLED`, `FAILED`

Illegal transitions (e.g. `COMPLETED` $\rightarrow$ `RUNNING`, `FAILED` $\rightarrow$ `RUNNING`) are strictly rejected by `ExecutionStateMachine`.

---

## 5. Storage Abstraction (`ExecutionStore`)

The execution layer communicates through `ExecutionStore`, allowing seamless migration from SQLite to PostgreSQL/MySQL or BullMQ without modifying `AgentOrchestrator` or business logic:

```typescript
export interface ExecutionStore {
  enqueueJob(params: EnqueueJobParams): Promise<ExecutionJobPayload>;
  acquireLeaseAtomically(jobId: string, workerId: string, leaseDurationMs: number, expectedGeneration?: number): Promise<AcquireLeaseResult>;
  acquireNextJobAtomically(workerId: string, leaseDurationMs: number, tenantId?: string): Promise<ExecutionJobPayload | null>;
  renewLease(jobId: string, workerId: string, leaseGeneration: number, leaseDurationMs: number): Promise<boolean>;
  markCompleted(jobId: string, workerId: string, leaseGeneration: number): Promise<boolean>;
  markWaiting(jobId: string, workerId: string, leaseGeneration: number): Promise<boolean>;
  markFailed(jobId: string, workerId?: string, leaseGeneration?: number, errorCode?: string, errorMessage?: string): Promise<boolean>;
  recoverExpiredLeases(): Promise<ExecutionJobPayload[]>;
  getJobById(jobId: string): Promise<ExecutionJobPayload | null>;
  getMetrics(tenantId?: string): Promise<ExecutionMetrics>;
}
```

---

## 6. Operational Telemetry & Control Plane

The operator control plane endpoint `GET /api/v1/ops/execution/status` exposes structured telemetry:

```json
{
  "totalJobs": 42,
  "queuedJobs": 0,
  "runningJobs": 1,
  "waitingJobs": 2,
  "completedJobs": 37,
  "failedJobs": 2,
  "activeWorkers": 3,
  "configuredConcurrency": 5,
  "isShuttingDown": false,
  "fencingConflicts": 0,
  "leaseLossEvents": 0,
  "recoveredJobs": 1,
  "duplicateClaimAttempts": 0
}
```

---

## 7. Migration Path to Relational DB & Distributed Queues

When upgrading from single-database SQLite to high-throughput production cloud infrastructure:
1. **Database Migration (PostgreSQL / MySQL)**:
   - Update `schema.prisma` provider to `postgresql`.
   - Replace conditional `findMany` + `updateMany` in `PrismaExecutionStore` with native `SELECT FOR UPDATE SKIP LOCKED`.
2. **Distributed Queue Integration (Redis / BullMQ / Temporal)**:
   - Implement `BullMQExecutionStore` satisfying the `ExecutionStore` interface.
   - Enqueue jobs directly to Redis streams/queues while retaining Prisma `AgentRun` and `ActionRecord` ground-truth tracking.
