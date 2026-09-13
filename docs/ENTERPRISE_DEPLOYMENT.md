# RESOLVEX STEP 9 — ENTERPRISE DEPLOYMENT & ZERO-DOWNTIME SAFETY RUNBOOK

## 1. Zero-Downtime Rolling Deployment Architecture
ResolveX supports zero-downtime rolling deployments across stateless API nodes and distributed background workers.

```
Step 1: Signal API Node A -> DRAINING (/api/v1/ops/drain)
Step 2: Stop Traffic Routing to Node A (Readiness Probe returns 503)
Step 3: Deploy New Application Artifact to Node A
Step 4: Execute Database Schema Migration (Backward Compatible)
Step 5: Health Check & Readiness Probe Pass on Node A
Step 6: Resume Traffic to Node A & Repeat for Node B/C
```

---

## 2. Safe Worker Replacement & Drain Protocol
- **Graceful Worker Drain:** On `SIGTERM` / `SIGINT`, worker triggers `ExecutionCoordinator.stopGracefully()`.
- **Active Job Protection:** In-flight jobs are allowed up to 10 seconds (`shutdownGraceMs`) to complete.
- **Heartbeat Expiry Recovery:** If a worker node crashes mid-execution, its active job leases expire after `leaseUntil` (30s) and are automatically claimed by surviving workers with incremented `leaseGeneration`.

---

## 3. Database Migration Invariants
- **Backward Compatibility:** All Prisma schema additions must be backward-compatible (non-null fields require default values).
- **Zero Lock Contention:** Index creation uses concurrent non-blocking locks where supported.
