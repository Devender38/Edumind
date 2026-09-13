# ResolveX Final Operations & Control-Plane Runbook

## 1. Incident Triage & UNKNOWN_OUTCOME Handling

### A. UNKNOWN_OUTCOME Protocol
When an external mutation request (e.g. payment gateway refund or ERP order cancellation) experiences a network timeout or dropped connection:
1. State machine marks job status as `UNKNOWN_OUTCOME`.
2. Automated retry is **strictly halted** to prevent duplicate financial execution.
3. System logs event `EXECUTION_UNKNOWN_OUTCOME` with correlation ID and idempotency key.
4. Background `ReconciliationEngine` queries external provider ground truth:
   - If provider records transaction: State updated to `COMPLETED` / `VERIFIED`.
   - If provider has no record: Job requeued for clean execution.

### B. Control-Plane Reconciliation Command
```bash
# Query all UNKNOWN_OUTCOME records for a tenant
curl -X GET "http://localhost:3000/api/v1/enterprise/reconciliation?tenantId=tenant-alpha" \
  -H "Authorization: Bearer <OPERATOR_TOKEN>"

# Trigger explicit ground-truth reconciliation for a specific run
curl -X POST "http://localhost:3000/api/v1/enterprise/reconcile/run-101" \
  -H "Authorization: Bearer <OPERATOR_TOKEN>"
```

---

## 2. Telemetry & Observability Monitoring

### Metric Alerts Checklist:
- `resolvex_unknown_outcome_total > 0`: Warning — investigation required.
- `resolvex_fencing_conflicts_total > 10`: Warning — stale worker detection / network latency spike.
- `resolvex_rate_limit_rejections_total > 100`: Notice — potential DDOS or tenant quota breach.
- `resolvex_ai_circuit_breaker_state == 1`: Critical — AI provider outage; system on heuristic fallback.

### Prometheus Metrics Exporter:
- Endpoint: `GET /metrics`
- Scraped every 15 seconds.
- Metric label values are automatically scrubbed for PII (emails, credit cards, phones).

---

## 3. Quota Management & Feature Flag Operations

### Updating Tenant Quotas (SECURITY_ADMIN or SYSTEM_ADMIN):
```bash
curl -X POST "http://localhost:3000/api/v1/enterprise/quotas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SECURITY_ADMIN_TOKEN>" \
  -d '{"tenantId": "tenant-alpha", "maxConcurrentRuns": 20, "tokenRatePerSec": 200}'
```

### Safety Feature Flags:
- Flags `circuit_breaker_enabled` and `approval_gate_enabled` are protected. Attempts to disable them return `HTTP 403 Forbidden` (`PROTECTED_SAFETY_CONTROL`).
