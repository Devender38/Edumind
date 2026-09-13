# AI COST & TOKEN GOVERNANCE ENGINE

## Overview
The AI Cost & Token Governance Engine provides deterministic token tracking, per-tenant budget enforcement, model routing advisory, and graceful degradation fallback when budgets are exhausted.

## Architecture
- **AI Resource Governance (`src/ai/aiResourceGovernance.ts`)**:
  - Tracks prompt tokens, completion tokens, total tokens, and estimated micro-USD cost per request.
  - Enforces per-tenant monthly/daily token limits and dollar budget caps.
  - Exceeding budget transitions tenant to `SHED` state, falling back to deterministic policy-based rules without crashing the customer run.
- **Adaptive Model Router (`src/ai/adaptiveModelRouter.ts`)**:
  - Dynamically recommends low-cost lightweight models (e.g., Llama-3-8B, GPT-4o-mini) for low-complexity intent classification and simple status lookups.
  - Recommends full-reasoning models (e.g., Llama-3-70B, GPT-4o) only for high-complexity multi-step investigations or policy exceptions.
  - **AI Advisory Boundary**: The model router acts strictly as an advisory engine; execution gates, RBAC, tenant isolation, and deterministic policy checks remain mandatory.

## Metric Telemetry
- `resolvex_ai_tokens_consumed_total{tenant_id, model, type}`
- `resolvex_ai_cost_micro_usd_total{tenant_id, model}`
- `resolvex_ai_budget_exhaustion_total{tenant_id}`
- `resolvex_ai_model_routing_recommendations_total{model_recommended, path_type}`

## Control Plane Integration
`GET /api/v1/ops/optimization/ai-budget` (Requires RBAC: `READ_ONLY_OPERATOR`, `OPERATOR`, `ADMIN`).
