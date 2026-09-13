# RESOLVEX STEP 9 — ENTERPRISE SRE & OPERATIONAL CONTROL PLANE RUNBOOK

## 1. Enterprise Control Plane Endpoints
| Endpoint | Method | Required Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/enterprise/tenant/quotas` | GET | `AUDITOR`, `OPERATOR`, `TENANT_ADMIN` | Inspect tenant resource quotas and usage |
| `/api/v1/enterprise/queue/depth` | GET | `OPERATOR`, `TENANT_ADMIN` | Durable queue depth & dead-letter counts |
| `/api/v1/enterprise/rbac/audit` | GET | `AUDITOR`, `SECURITY_ADMIN` | Compliance audit log of privileged RBAC actions |
| `/api/v1/enterprise/metrics/prometheus` | GET | `AUDITOR`, `OPERATOR` | Export telemetry in Prometheus exposition format |
| `/api/v1/enterprise/flags` | GET | `READ_ONLY_OPERATOR`, `OPERATOR` | List active feature flag rollout states |

---

## 2. Tenant Resource Fairness & Quotas
- **Concurrent Run Quotas:** Limits active AgentRuns per tenant to prevent noisy-neighbor starvation.
- **Fair Scheduling:** Queue claim queries apply tenant-aware round-robin selection.
- **No Cross-Tenant Accounting Contamination:** Telemetry, tokens, and budget counters are strictly partitioned by `tenantId`.

---

## 3. Persistent Telemetry & Metrics Persistence
- **Exporter:** `PersistentObservability.getInstance()`
- **PII Scrubbing:** All raw email addresses and customer names in metric labels are automatically scrubbed (`[REDACTED_EMAIL]`).
- **Bounded Cardinality:** Metric label keys are restricted to predefined static namespaces to prevent TSDB metric explosion.
