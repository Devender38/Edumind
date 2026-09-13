# RESOLVEX STEP 9 — ENTERPRISE HORIZONTAL SCALABILITY ARCHITECTURE

## 1. Horizontal API Layer Scaling
- **Stateless Design:** Express API nodes do not rely on local session memory or sticky sessions.
- **Shared State Management:** Rate limits, tenant quotas, and durable job queues operate statelessly against shared database / storage backends (`DurableWorkQueue`, `DistributedRateLimiter`).
- **Cross-Instance Continuity:** A request initialized on API Instance A can be queried or completed on API Instance B with full data continuity via `AgentRun` persistence.

---

## 2. Distributed Worker Pool Scaling
- **Worker Pool Sizing:** Scales dynamically from 1 to 10+ concurrent worker processes.
- **Atomic Lease Claiming:** Workers claim jobs using conditional database updates (`UPDATE ExecutionJob SET workerId = ?, leaseGeneration = leaseGeneration + 1 WHERE status = 'QUEUED' AND leaseUntil < NOW()`).
- **Fencing Counter Protection:** Stale workers attempting to commit results after lease expiration are fenced out because their `expectedGeneration` does not match the current database `leaseGeneration`.

---

## 3. Database & Connection Governance
- **Connection Pool Bounds:** Configured via `RESOLVEX_DB_POOL_MAX` (default 20 connections per node).
- **Query Timeout Bounds:** Hard query timeout (5000ms) prevents runaway locks.
- **Keyset Pagination:** High-volume endpoints use cursor/keyset pagination to prevent unbounded dataset memory allocation.
