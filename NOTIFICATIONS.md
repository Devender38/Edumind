# ResolveX — Phase 19 Architecture: Production Communications & Notifications

## 1. Executive Summary

Phase 19 introduces a **production-grade, durable, template-driven, and idempotent notification system** for the ResolveX Autonomous Customer Resolution Agent. Built directly on top of the Phase 17/18 distributed execution engine and Phase 16 security model, the notification architecture guarantees that every customer and operator communication is delivered reliably without ever compromising business state integrity or causing duplicate notifications.

---

## 2. Core Architecture & Outbox Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             AGENT ORCHESTRATOR                              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (Fire-and-forget .catch(() => null))
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NOTIFICATION DISPATCHER                            │
│  - Event classification (CUSTOMER / OPERATOR / DUAL)                        │
│  - Resolution Safety Gate (Ground-truth DB mutation check)                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION REPOSITORY (Outbox Store)                    │
│  - Idempotent creation (P2002 safe)                                         │
│  - Atomic status transition (QUEUED → SENDING) via status guard             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CHANNEL ADAPTERS                                │
│  - InAppChannel (Persists to DB, updates status to SENT)                     │
│  - MockEmailChannel (Logs delivery boundary safely)                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Guarantee: Outbox Pattern

Notifications are created inside the database as `QUEUED` outbox records before delivery is attempted. Delivery failure or network timeouts do **NOT** fail business state transitions. The orchestrator invokes notification dispatch using a strict **fire-and-forget pattern** (`.catch(() => null)`).

---

## 3. Data Model & Schema

The `Notification` Prisma model enforces complete tracking, multi-tenancy, and state transitions:

```prisma
model Notification {
  id              String    @id @default(uuid())
  tenantId        String    @default("tenant-a")
  agentRunId      String?
  agentRun        AgentRun? @relation(fields: [agentRunId], references: [id], onDelete: SetNull)
  ticketId        String?
  ticket          Ticket?   @relation(fields: [ticketId], references: [id], onDelete: SetNull)
  customerId      String?
  customer        Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
  eventType       String    // CASE_CREATED, INVESTIGATION_COMPLETED, APPROVAL_REQUIRED, CUSTOMER_CONSENT_REQUIRED, RESOLUTION_COMPLETED, RESOLUTION_FAILED, CASE_ESCALATED, RECOVERY_STARTED, RECOVERY_COMPLETED
  channel         String    @default("IN_APP") // IN_APP, EMAIL
  templateId      String
  templateVersion String    @default("v1")
  locale          String    @default("en-IN")
  recipientType   String    @default("CUSTOMER") // CUSTOMER, OPERATOR
  recipient       String    // customerId or operatorId
  title           String
  message         String
  payload         String?   // JSON minimal snapshot
  status          String    @default("QUEUED") // QUEUED, SENDING, SENT, FAILED, FAILED_PERMANENTLY
  idempotencyKey  String    @unique
  correlationId   String?
  isRead          Boolean   @default(false)
  readAt          DateTime?
  attempts        Int       @default(0)
  maxAttempts     Int       @default(3)
  lastAttemptAt   DateTime?
  sentAt          DateTime?
  errorCode       String?
  errorMessage    String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

---

## 4. Idempotency Key Structure

To guarantee **exactly-once notification delivery**, idempotency keys are deterministically generated per event lifecycle:

```typescript
const idempotencyKey = `${agentRunId}:${eventType}:${channel}:${templateVersion}:${recipientType}:${recipient}`;
```

If duplicate dispatch calls occur (e.g. worker retries or concurrent execution), `NotificationRepository.createOrFindIdempotent()` catches the Prisma unique constraint violation (`P2002`) and safely returns the existing notification without creating duplicate outbox items.

---

## 5. Resolution Safety Gate

A critical business safety requirement: **Resolution completion notifications are NEVER sent based purely on orchestrator state strings.**

`NotificationDispatcher.dispatchResolutionSafe()` enforces ground-truth verification:

1. Loads the target `AgentRun` from the database.
2. Asserts `agentRun.status === 'RESOLVED' || agentRun.status === 'COMPLETED'`.
3. Verifies ground-truth mutation:
   - At least one `ActionRecord` with status `VERIFIED` exists, **OR**
   - A `RefundTransaction` with status `COMPLETED` exists for the order.

If ground-truth evidence is missing, the safety gate blocks dispatch and logs a `NOTIFICATION_SAFETY_GATE_BLOCKED` audit event.

---

## 6. Template & Localization System

All notifications are generated from template definitions registered in `TemplateRegistry`.

- **Versioned Templates**: Each template has an explicit `templateVersion` (`v1`).
- **Locale Awareness**: Default locale is `en-IN`, ready for i18n expansion.
- **Safety Filtering**: Dynamic variables are sanitized using regex variable interpolation (`{{varName}}`). Standard customer messaging never exposes raw agent reasoning, internal DB IDs, or bearer tokens.
- **Action Summaries**: Built-in helper `buildActionSummary()` formats human-readable transaction evidence (e.g., `"Refund of ₹4,999 processed to original payment method"`).

---

## 7. Security, Tenant Isolation & IDOR Protection

All notification API endpoints enforce Phase 16 Authentication and Authorization standards:

- **Customer Notification APIs**:
  - `GET /api/v1/notifications` — Lists unread & read notifications strictly filtered by `tenantId` and `customerId` of the authenticated principal.
  - `POST /api/v1/notifications/:id/read` — Marks notification as read only if `tenantId` and `customerId` match ownership. Attempts by other customers return `404 Not Found` (IDOR protection).
- **Operator Notification APIs**:
  - `GET /api/v1/ops/notifications` — Lists all notifications within operator's tenant.
  - `GET /api/v1/ops/notifications/metrics` — Returns system-wide telemetry counters.
  - `POST /api/v1/ops/notifications/:id/retry` — Manual retry for failed notifications.

---

## 8. Verification & Test Coverage

Phase 19 includes **45 dedicated Vitest tests** covering:

1. **Template & Interpolation System** (1–6)
2. **Notification Idempotency & Concurrency** (7–9)
3. **Channel Adapters & Outbox Flow** (10–13)
4. **Security, RBAC & IDOR Protection** (14–20)
5. **Resolution Safety Gate Ground-Truth Enforcement** (26–30)
6. **Human Gate Notifications** (31–33)
7. **Failure Isolation & Injector Recovery** (34–37)
8. **Mark-Read & Operator API Endpoints** (38–43)
9. **Safety Invariants & Secret Stripping** (44–45)

Combined Test Suite Result: **17 test files passed, 249 total tests passing, 0 failures**.
