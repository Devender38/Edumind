# Tech Zypher — ResolveX Observability & Metrics Architecture

## 1. Overview
ResolveX implements a thread-safe, structured, Prometheus-compatible telemetry registry.
All metrics are exported in standard Prometheus text format via `GET /api/v1/metrics`.

## 2. Key Metrics Categories

### 2.1 Resolution Engine Metrics
- `resolvex_agent_run_total{tenant, status}`: Counter of total agent execution runs by outcome.
- `resolvex_agent_run_duration_seconds{tenant}`: Histogram of run execution latency.
- `resolvex_execution_duration_seconds{phase}`: Phase execution duration (Intent, Investigation, Policy, Execution).
- `resolvex_worker_leases_active{worker}`: Active execution worker leases.

### 2.2 System & Communication Metrics
- `resolvex_retries_total{component, reason}`: Total automatic recovery retry attempts.
- `resolvex_action_executions_total{action, status}`: Action execution attempts and results.
- `resolvex_notification_delivery_total{channel, status}`: Notification delivery counters.
- `resolvex_policy_evaluations_total{tenant, outcome}`: Policy evaluation engine results.

### 2.3 Safety Invariant Metrics (100% Target Integrity)
- `resolvex_safety_false_resolutions_total`: Track any false positive resolutions. Must always be 0.
- `resolvex_safety_approval_bypasses_total`: Track unapproved high-risk mutations. Must always be 0.
- `resolvex_safety_customer_consent_bypasses_total`: Track unconsented customer actions. Must always be 0.
- `resolvex_safety_duplicate_mutations_total`: Track non-idempotent duplicate executions. Must always be 0.
- `resolvex_safety_verification_bypasses_total`: Track unverified action completion. Must always be 0.
- `resolvex_safety_cross_tenant_violations_total`: Track cross-tenant access attempts. Must always be 0.
- `resolvex_safety_policy_bypass_total`: Track unauthorized policy bypasses. Must always be 0.

## 3. High-Cardinality & Security Safeguards
- High-cardinality keys (`correlationId`, `customerMessage`, `secret`, `token`, `bearerToken`) are automatically stripped/redacted by `metricsRegistry.sanitizeLabels`.
- Access to `/api/v1/metrics` requires authentication and `OPERATOR`, `ADMIN`, or `SERVICE` RBAC role.
