# ADAPTIVE OPERATIONS ENGINE

## Overview
The Adaptive Operations Engine dynamically manages backpressure, intelligent failure retries, and tenant fairness to keep ResolveX resilient under heavy burst loads.

## Key Subsystems
- **Intelligent Retry Engine (`src/observability/intelligentRetry.ts`)**:
  - Classifies failures into `transient` (network timeout, rate limit, DB deadlock) vs `permanent` (validation error, unauthorized, non-retryable policy rejection).
  - Enforces exponential backoff with full jitter for transient errors.
  - Prevents retry storms by checking failure budgets before attempting retries.
- **Adaptive Backpressure (`src/observability/adaptiveBackpressure.ts`)**:
  - Monitors global system pressure (queue depth, worker utilization, retry rate, circuit breaker state).
  - Sheds optional background work (e.g. non-critical analytical investigations) when system load exceeds 85%.
  - Preserves critical high-priority customer runs under severe load.
- **Tenant Fairness Manager (`src/observability/tenantFairness.ts`)**:
  - Implements per-tenant token bucket rate limiters and active concurrency caps.
  - Prevents single high-volume tenant ("noisy neighbor") from starving resources of other tenants.

## Observability & Metrics
- `resolvex_backpressure_state{level}`
- `resolvex_retry_attempts_total{reason, retryable}`
- `resolvex_tenant_concurrency_active{tenant_id}`
- `resolvex_tenant_shed_total{tenant_id, reason}`
