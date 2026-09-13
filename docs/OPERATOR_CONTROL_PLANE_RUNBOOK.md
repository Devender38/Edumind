# ResolveX Autonomous Agent Engine — Operator Control Plane Runbook

## 1. Overview
The Operator Control Plane provides SREs and support engineers with real-time inspection, emergency kill-switches, manual run pauses, and human consent override capabilities.

---

## 2. Emergency Kill-Switch Protocol

### 2.1 Triggering Emergency Kill-Switch
When systemic anomalies (e.g. cascading upstream outage, database bottleneck) occur:
- **API Endpoint**: `POST /api/v1/ops/kill-switch`
- **Payload**: `{ "active": true, "reason": "Cascading vendor API outage" }`
- **SLA**: Halts all active job executions across worker nodes within **50ms**.
- **Behavior**:
  - In-flight jobs immediately halt before issuing next tool call.
  - Active runs transition to `PAUSED` state without data corruption.
  - New inbound webhook requests rejected with HTTP 503 `KILL_SWITCH_ACTIVE`.

### 2.2 Resetting Emergency Kill-Switch
- **API Endpoint**: `POST /api/v1/ops/kill-switch`
- **Payload**: `{ "active": false, "reason": "Vendor service restored" }`
- System resumes normal worker queue processing.

---

## 3. Operator Inspection & Manual Override APIs

### 3.1 Listing Active & Historical Runs
- `GET /api/v1/ops/runs?status=RUNNING&limit=50`: Lists active runs with concise trace summaries.

### 3.2 Inspecting Detailed Run State
- `GET /api/v1/ops/runs/:id`: Returns full step-by-step trace timeline, policy decision history, and verification evidence.

### 3.3 Manual Run Pause & Resume
- **Pause**: `POST /api/v1/ops/runs/:id/pause`
- **Resume**: `POST /api/v1/ops/runs/:id/resume`

### 3.4 Operator Human Consent Override
- For cases held at `WAITING_FOR_APPROVAL` or `WAITING_FOR_CUSTOMER_CONSENT`:
- `POST /api/v1/ops/runs/:id/override-consent`
- **Payload**: `{ "approved": true, "operatorId": "op-123", "notes": "Customer verified via phone call" }`
- Engine resumes task execution safely.

---

## 4. Operator Safety Invariants
- Operator override **CANNOT** bypass policy refund budget caps ($100 max auto-refund limit).
- Operator action **CANNOT** perform illegal state machine transitions (e.g., transitioning from `FAILED` directly to `COMPLETED` without re-verification).
