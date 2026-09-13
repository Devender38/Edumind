# OPTIMIZATION SAFETY & EXPERIMENT GUARD

## Overview
The Optimization Safety & Experiment Guard guarantees that no AI recommendation or operational optimization can ever compromise system security, tenant boundaries, or deterministic policy enforcement.

## Governance Principles & Safety Invariants
1. **AI Advisory Boundary**:
   - AI recommendations are strictly advisory (`PROPOSED`).
   - Transitioning recommendations to `APPROVED` or `APPLIED` requires explicit privileged operator interaction (`OPERATOR` or `ADMIN` RBAC role).
   - Read-only operators (`READ_ONLY_OPERATOR`) cannot approve or apply recommendations (`403 Forbidden`).
2. **Immutable Policy Authority**:
   - Deterministic policy enforcement, RBAC, tenant isolation, human approval gates, idempotency keys, and fencing leases take precedence over all optimization logic.
3. **Experiment Canary & Safety Controller (`src/observability/experimentSafety.ts`)**:
   - Manages feature flags and percentage rollouts (0% - 100%) for performance tweaks.
   - Automatically monitors error rates and latency during canary rollouts.
   - Triggers automated emergency rollback if error thresholds are exceeded or an anomaly is detected.
4. **Audit Logging**:
   - All recommendation proposals, approvals, applications, canary percentage updates, and rollbacks generate immutable audit events with actor, correlation ID, and timestamp telemetry.

## Control Plane Endpoints
- `GET /api/v1/ops/optimization/recommendations`
- `POST /api/v1/ops/optimization/recommendations/:id/approve`
- `POST /api/v1/ops/optimization/recommendations/:id/apply`
- `POST /api/v1/ops/optimization/experiments/rollout`
- `POST /api/v1/ops/optimization/experiments/:flagKey/rollback`
