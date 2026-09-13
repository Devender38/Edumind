# PRODUCTION INTELLIGENCE & METRICS ENGINE

## Overview
The Production Intelligence & Metrics Engine provides real-time, low-cardinality telemetry for latency distributions, quality signals, and system health across the ResolveX platform.

## Architecture
- **Performance Engine (`src/observability/performanceEngine.ts`)**: Tracks p50, p90, p95, p99 latency distributions across operations, agent steps, LLM calls, DB queries, and external integrations.
- **Label Sanitization**: Automatically scrubs high-cardinality and sensitive labels (order IDs, customer emails, secret tokens, payment IDs) into low-cardinality tags (e.g. `cust-*` -> `REDACTED_ID`).
- **Quality Intelligence (`src/observability/qualityIntelligence.ts`)**: Aggregates resolution success rates, clarification ratios, human escalation rates, policy rejection rates, verification failures, unknown outcome frequency, and duplicate mutation attempts per tenant.
- **Anomaly Detection (`src/observability/anomalyDetector.ts`)**: Applies deterministic thresholding and dynamic statistical anomaly detection (z-score / IQR) for latency spikes, error rate jumps, retry storms, and UNKNOWN_OUTCOME surges.

## Metrics Exposed
- `resolvex_performance_latency_ms{op, status}`
- `resolvex_quality_resolution_success_total{tenant_id}`
- `resolvex_quality_clarification_total{tenant_id}`
- `resolvex_quality_escalation_total{tenant_id}`
- `resolvex_quality_unknown_outcome_total{tenant_id}`
- `resolvex_anomaly_detected_total{type, severity}`

## Control Plane Integration
`GET /api/v1/ops/optimization/performance` (Requires RBAC: `READ_ONLY_OPERATOR`, `OPERATOR`, `ADMIN`).
