# ResolveX — Step 2 Real External Integrations Documentation

## Overview

ResolveX Step 2 introduces a production-grade, provider-agnostic integration framework. The integration engine sits under `src/integrations/` and decouples autonomous decision logic from external infrastructure (Orders, Payments, Inventory, Shipping, CRM, Notifications).

---

## Architecture & Integration Design

### 1. Dual Contract Specification: `execute()` and `verify()`

Every integration adapter implements a provider-agnostic interface enforcing two mandatory methods:

* **`execute(command, context)`**: Dispatches the external mutation or read request to the provider system. Returns structured outcome, operation ID, idempotency key, latency metrics, and error classification.
* **`verify(operation, context)`**: Queries the provider ground truth directly to verify actual resource state after an execution or ambiguous outcome (`UNKNOWN_OUTCOME`).

### 2. Supported Domain Adapters

| Domain | Interface | Sandbox / Fake Provider | Production Provider Adapter |
|---|---|---|---|
| **Orders** | `OrderAdapter` | `FakeOrderAdapter` | `HttpOrderAdapter` |
| **Payments** | `PaymentAdapter` | `FakePaymentAdapter` | `HttpPaymentAdapter` |
| **Inventory** | `InventoryAdapter` | `FakeInventoryAdapter` | `HttpInventoryAdapter` |
| **Shipping** | `ShippingAdapter` | `FakeShippingAdapter` | `HttpShippingAdapter` |
| **CRM** | `CrmAdapter` | `FakeCrmAdapter` | `HttpCrmAdapter` |
| **Notifications** | `NotificationAdapter` | `FakeNotificationAdapter` | `HttpNotificationAdapter` |

### 3. Deterministic Idempotency Key Specification

Every integration request derives a deterministic idempotency key using the format:
```
${tenantId}-${agentRunId || 'standalone'}-${actionType}-${businessResourceId}-${sequence}
```
This guarantees identical retry identity across retry attempts and prevents duplicate external mutations.

### 4. Out-of-band Database Transactions

External HTTP network calls are strictly executed **outside** database transactions:
1. Pre-write `IntegrationOperation` as `PENDING`.
2. Execute HTTP call to external provider system.
3. Post-write result state and ground truth verification to `IntegrationOperation` table.

### 5. Circuit Breaker & Health Probes

* **Circuit Breakers**: Independent per-provider breaker tracking `CLOSED`, `OPEN`, and `HALF_OPEN` states.
  * **Thresholds**: 5 consecutive failures trips state to `OPEN`.
  * **Cooldown**: 10,000ms reset timeout before transitioning to `HALF_OPEN`.
  * **Recovery**: 2 consecutive successes in `HALF_OPEN` closes the circuit.
* **Health API**: `GET /api/v1/ops/integrations/health` returns operational status (`HEALTHY`, `DEGRADED`, `UNHEALTHY`) and individual provider metrics.

### 6. CRM Chain-of-Thought Redaction & Notification Isolation

* **CRM Sync**: Sensitive fields, API keys, internal tokens, and internal LLM `chainOfThought` reasoning traces are automatically redacted (`[REDACTED]`) prior to CRM ticket synchronization.
* **Notification Isolation**: Failure of customer notification delivery logged as `NOTIFICATION_FAILED`, but does **NOT** abort or roll back successful business resolutions (such as order cancellations or refunds).

---

## Environment Configuration

```env
# Integration Mode: INTEGRATIONS_DISABLED | INTEGRATIONS_SANDBOX | INTEGRATIONS_PRODUCTION
INTEGRATION_MODE=INTEGRATIONS_SANDBOX

# External Service Endpoints (Used in INTEGRATIONS_PRODUCTION mode)
ORDER_SERVICE_URL=http://localhost:8080/api/v1/orders
PAYMENT_GATEWAY_URL=http://localhost:8080/api/v1/payments
INVENTORY_SERVICE_URL=http://localhost:8080/api/v1/inventory
SHIPPING_CARRIER_URL=http://localhost:8080/api/v1/shipping
CRM_SYSTEM_URL=http://localhost:8080/api/v1/crm
NOTIFICATION_GATEWAY_URL=http://localhost:8080/api/v1/notifications
```

---

## Verification & Telemetry

* **Integration Operations Table**: `IntegrationOperation` model persists operation parameters, idempotency keys, verification state, and error logs in both SQLite and PostgreSQL.
* **Metrics**: Exposes `resolvex_integration_operations_total`, `resolvex_integration_duration_seconds`, `resolvex_integration_circuit_state`, and `resolvex_integration_unknown_outcomes_total`.

---

## Step 3 — Real AI / LLM Layer Integration

ResolveX Step 3 introduces provider-independent AI abstractions supporting advisory intent classification, prompt injection defense, secret redaction, and response drafting:

* **AI Provider Modes**: `AI_DISABLED`, `AI_SANDBOX` (`FakeAIProvider`), `AI_PRODUCTION` (`OpenAIProvider`).
* **Environment Configuration**:
  ```env
  AI_PROVIDER_MODE=AI_SANDBOX # AI_DISABLED | AI_SANDBOX | AI_PRODUCTION
  OPENAI_API_KEY=sk-... # Required for AI_PRODUCTION mode
  OPENAI_MODEL_NAME=gpt-4o # Default LLM model
  AI_CONFIDENCE_THRESHOLD=0.7 # Low-confidence fallback threshold
  MAX_AI_CALLS_PER_RUN=3 # Cost bounding max AI calls per run
  ```
* **Security & Verification**: The LLM operates in an **advisory capacity only**. Deterministic Policy and Decision engines remain authoritative. All extracted entities undergo ground-truth database verification before processing. Full details available in [`AI_ARCHITECTURE.md`](file:///c:/Users/Devender/OneDrive/Documents/Project-1/AI_ARCHITECTURE.md).

### Real AI / LLM Provider Capability & Status Matrix

| Capability | Status |
|---|---|
| AI abstraction | IMPLEMENTED |
| Sandbox AI | VERIFIED |
| OpenAI provider code | IMPLEMENTED |
| Mocked OpenAI tests | VERIFIED |
| Real OpenAI connectivity | NOT VERIFIED |
| Production credentials | NOT CONFIGURED |
| Production AI end-to-end | NOT VERIFIED |
