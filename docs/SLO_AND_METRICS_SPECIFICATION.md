# ResolveX Autonomous Agent Engine — Service Level Objectives (SLOs) & Metrics Spec

## 1. Service Level Indicators (SLIs) & Target SLOs

| Service Metric | SLI Definition | Target SLO | Error Budget |
| :--- | :--- | :---: | :---: |
| **Autonomous Resolution Accuracy** | % of cases correctly resolved without human error | **$\ge 99.0\%$** | $1.0\%$ |
| **System Safety Invariants** | % of cases with 0 policy/approval/consent bypasses | **$100.0\%$** | **$0.0\%$** (Strict) |
| **API P95 Latency** | P95 latency for agent run decision formulation | **$\le 500\text{ms}$** | $5.0\%$ above threshold |
| **Worker Queue Drain Latency** | Time for enqueued job to be claimed by worker | **$\le 1000\text{ms}$** | $2.0\%$ |
| **Ground-Truth Reconciliation** | % of UNKNOWN_OUTCOME jobs safely reconciled | **$100.0\%$** | **$0.0\%$** |

---

## 2. Prometheus Metric Registry Schema

### 2.1 Counters
- `resolvex_agent_runs_total{status, tenant_id}`: Counter of total agent run creations.
- `resolvex_tool_executions_total{tool_name, status}`: Counter of executed tool actions.
- `resolvex_policy_evaluations_total{decision}`: Policy engine decisions (`APPROVED`, `REJECTED`, `REQUIRES_APPROVAL`).
- `resolvex_slo_breach_events_total{slo_name}`: Count of SLO breach events.

### 2.2 Gauges
- `resolvex_active_worker_leases`: Current number of active worker job leases.
- `resolvex_queue_depth`: Number of jobs currently queued in `ExecutionJob`.
- `resolvex_circuit_breaker_state{provider}`: Gauge encoding state ($0=\text{CLOSED}, 1=\text{HALF\_OPEN}, 2=\text{OPEN}$).

### 2.3 Histograms
- `resolvex_run_duration_seconds_bucket{le}`: Bucketed latency of complete agent runs.
- `resolvex_tool_duration_seconds_bucket{tool_name, le}`: Bucketed latency per tool call.
