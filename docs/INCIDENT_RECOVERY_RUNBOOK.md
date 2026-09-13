# ResolveX Autonomous Agent Engine — Incident Recovery Runbook

## 1. Executive Incident Response Checklist
During an operational incident (DB crash, worker node failure, network partition, or vendor outage), follow these steps in sequence:

1. **Assess Severity & Scope** (P0 = Data corruption/Financial risk, P1 = Service outage, P2 = Degraded latency).
2. **Check Operational Readiness**: Query `/health/readiness` and `/health/liveness`.
3. **Inspect Active Worker Leases**: Check for stale worker locks or runaway jobs.
4. **Execute Remediation Steps**: Follow scenario runbooks below.
5. **Perform Post-Incident Ground-Truth Audit**: Run reconciliation check on all `UNKNOWN_OUTCOME` jobs.

---

## 2. Standard Incident Runbooks

### Runbook A: Stale Worker Lease & Partitioned Worker (P1)
**Symptom**: Worker node unresponsive; jobs stuck in `RUNNING` state past SLA.

**Remediation**:
```bash
# 1. Inspect stale leases via CLI or admin script
npm run ts-node scratch/inspect_leases.ts

# 2. Trigger expired lease recovery
npm run ts-node scratch/trigger_lease_recovery.ts

# 3. Verify fencing token incremented
# Standby workers automatically take over execution safely.
```

---

### Runbook B: Outbound Vendor Outage / Circuit Breaker Tripped (P2)
**Symptom**: Vendor HTTP requests returning 503/504; Circuit Breaker state is `OPEN`.

**Remediation**:
1. Engine automatically stops sending requests to vendor and queues job steps.
2. Monitor vendor status page or health probe.
3. Once vendor recovers, Circuit Breaker moves to `HALF_OPEN` automatically upon probe success, then `CLOSED`.
4. No manual database intervention required; jobs resume in order.

---

### Runbook C: Interrupted Financial Mutation (UNKNOWN_OUTCOME) (P0)
**Symptom**: Process crashed or connection dropped while issuing refund or payment request.

**Remediation Procedure**:
1. Locate `agentRunId` in `AgentTrace` table with status `UNKNOWN_OUTCOME`.
2. Do **NOT** manually trigger refund API call.
3. Run Ground-Truth Reconciliation tool:
   ```bash
   npx ts-node scratch/reconcile_ground_truth.ts --runId=<AGENT_RUN_ID>
   ```
4. Tool queries external payment provider using the original `idempotencyKey`.
   - If payment exists on provider $\rightarrow$ marks step `COMPLETED`.
   - If payment missing on provider $\rightarrow$ marks step `RETRY_READY`.

---

## 3. Post-Incident Verification
After completing incident recovery, verify system health:
```bash
# Verify evaluation suite & safety invariants
npm run evaluate

# Verify full test suite
npm test
```
