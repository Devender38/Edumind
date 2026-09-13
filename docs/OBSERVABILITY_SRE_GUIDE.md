# ResolveX Autonomous Agent Engine — Observability & SRE Architecture

## 1. Overview
This document specifies the production observability, distributed tracing, structured auditing, metric aggregation, and alerting architecture of the ResolveX Autonomous Agent Engine.

## 2. Core Observability Pillars

### 2.1 Distributed Tracing & Correlation ID Lifecycle
- Every incoming HTTP request (API, Webhook) is assigned a unique, W3C-compliant or UUID-v4 **`X-Correlation-ID`**.
- The `X-Correlation-ID` is stored in the async execution context (`AsyncLocalStorage`) and propagated across:
  - Internal function calls & policy evaluations
  - Prisma database records (`AgentRun`, `AgentTrace`, `ExecutionJob`)
  - Worker task queue payloads
  - Outbound HTTP requests (via `X-Correlation-ID` request headers)

### 2.2 Structured Audit Trail (`AgentTrace`)
- System actions write immutable trace events into `AgentTrace`:
  - **`ATTEMPTED`**: Intent declared before executing any side effect.
  - **`EXECUTED`**: Tool or API action performed.
  - **`VERIFIED`**: Post-mutation validation passed and confirmed.
- Audit records include step duration, input parameters (redacted), and output state.

### 2.3 Prometheus Metrics Engine
- Metric registry collects operational counters, gauges, and histograms:
  - `resolvex_agent_runs_total{status, tenant_id}`: Total agent runs by status.
  - `resolvex_tool_executions_total{tool_name, status}`: Tool call volume.
  - `resolvex_run_duration_seconds_bucket{le}`: Histogram of run latency distribution (P50, P90, P99).
  - `resolvex_policy_evaluations_total{decision}`: Policy decision counts.
  - `resolvex_slo_breach_events_total{slo_name}`: SLO violation alert events.
- Exposed via standard `/metrics` endpoint in Prometheus text format.

### 2.4 Structured Log Redaction & Security
- `Logger` automatically inspects all JSON log objects and redacts sensitive keys:
  - Redacted patterns: `password`, `token`, `secret`, `authorization`, `creditCard`, `cvv`, `apiKey`.
  - Sensitive values replaced with string `'***REDACTED***'`.
