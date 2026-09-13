# ResolveX Autonomous Agent Engine — Disaster Recovery (DR) Plan

## 1. Objective & Scope
This Disaster Recovery (DR) Plan details recovery procedures, Recovery Point Objectives (RPO), and Recovery Time Objectives (RTO) for catastrophic failures including primary database corruption, cloud region loss, total worker node cluster destruction, and external API infrastructure collapse.

## 2. Target Service Level Objectives (SLOs)
- **Recovery Point Objective (RPO)**: $\le 1$ second (Write-Ahead Logging + Continuous Postgres Point-In-Time Recovery / WAL shipping).
- **Recovery Time Objective (RTO)**: $\le 5$ minutes (Automated worker failover & database point-in-time restore).
- **Financial Mutation Safety**: `0` Duplicate Financial Mutations allowed post-recovery.

---

## 3. Disaster Recovery Scenarios & Procedures

### DR Scenario 1: Primary Database Crash & Corruption
1. **Detection**: Health probe `/health/readiness` fails with HTTP 503 (`DATABASE_UNREACHABLE`). Alert triggered via telemetry.
2. **Automated Failover**:
   - Primary DB connection pool closes.
   - Hot Standby Postgres replica promoted to Primary.
3. **State Reconciliation**:
   - Resumed worker engine reads highest durable `AgentTrace` sequence per run.
   - Any job marked `RUNNING` with expired lease is reset to `QUEUED` with incremented fencing token.
   - Any job with in-flight external API state runs Ground-Truth Status Check prior to resuming execution.

### DR Scenario 2: Total Worker Cluster Death (Mid-Flight Tasks)
1. **Impact**: All running workers terminate abruptly mid-task.
2. **Recovery Procedure**:
   - New worker instances boot and register with current DB cluster.
   - `recoverExpiredLeases()` scans for tasks where `status = RUNNING` and `leaseUntil < now()`.
   - Standby workers claim leases. Fencing tokens prevent late-arriving writes from dead workers.
   - Tasks execute ground-truth reconciliation to verify whether interrupted tool calls completed on vendor servers.

### DR Scenario 3: Complete Data Center / Region Outage
1. **Activation**: Failover to secondary DR region initiated via DNS / Global Load Balancer update.
2. **Database Restore**:
   - Promote cross-region read replica to Primary.
   - Verify latest WAL sequence number.
3. **Application Verification**:
   - Run readiness check probe `npm run evaluate`.
   - Verify all active runs resume from last durable WAL step without re-issuing past mutations.

---

## 4. Disaster Recovery Simulation & Verification
DR procedures are validated using automated chaos and recovery test scripts ([`tests/step6_reliability_resilience.test.ts`](file:///c:/Users/Devender/OneDrive/Documents/Project-1/tests/step6_reliability_resilience.test.ts)):
- **Database Drop & Restore Simulation**: Simulates DB connection kill mid-transaction, proving state safety and automatic backoff reconnection.
- **Process Termination Simulation**: Simulates `process.kill()` mid-flight, proving state recovery without duplicate refund execution.
