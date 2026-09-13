# Tech Zypher — ResolveX Service Level Objectives (SLOs) & Error Budget Policy

## 1. Overview
ResolveX continuously evaluates critical system SLOs, error budget consumption, and burn rates via `sloEngine`.

## 2. Defined Service Level Objectives

| SLO Name | Target | Metric Source | Error Budget (Window) |
|---|---|---|---|
| **System Availability** | 99.9% | Health check & HTTP successful responses | 0.1% over 30 days |
| **Execution Success Rate** | 98.0% | Agent runs completed / total runs | 2.0% over 30 days |
| **Safety Invariants Integrity** | 100.0% | `resolvex_safety_*` total violations = 0 | 0.00% (Zero tolerance) |
| **False Resolution Prevention** | 100.0% | `resolvex_safety_false_resolutions_total` = 0 | 0.00% (Zero tolerance) |
| **Approval Gate Integrity** | 100.0% | `resolvex_safety_approval_bypasses_total` = 0 | 0.00% (Zero tolerance) |
| **Customer Consent Integrity** | 100.0% | `resolvex_safety_customer_consent_bypasses_total` = 0 | 0.00% (Zero tolerance) |
| **Verification Gate Integrity** | 100.0% | `resolvex_safety_verification_bypasses_total` = 0 | 0.00% (Zero tolerance) |

## 3. Burn Rate Calculation & Alert Triggering
- **Normal Burn Rate (1.0x)**: Standard baseline budget consumption.
- **Elevated Burn Rate (>2.0x)**: Triggers WARNING alert state.
- **Critical Burn Rate (>5.0x or Safety Invariant Violation > 0)**: Triggers CRITICAL alert & automatic Incident creation.

## 4. API Endpoints
- `GET /api/v1/ops/slo`: Returns current SLO status, current values, remaining error budgets, and burn rate status.
