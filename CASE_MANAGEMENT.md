# Phase 21 — Advanced Customer Experience & Case Management System

## 1. Overview & Architecture

The **Phase 21 Case Management System** transforms ResolveX from a run-oriented debugging interface into a production-grade, customer-centric Case Portal. It builds a high-level `Case` abstraction on top of existing `Ticket` and `AgentRun` entities without schema migration churn or database duplication.

```text
+-------------------------------------------------------------------------+
|                        Customer / Operator Client                       |
+-------------------------------------------------------------------------+
                                    |
          HTTP GET /api/v1/cases (Search, Filter, Pagination)
          HTTP GET /api/v1/cases/:id (Detail & IDOR Protection)
          HTTP GET /api/v1/cases/:id/timeline (Redacted & RBAC Scoped)
                                    |
                                    v
+-------------------------------------------------------------------------+
|                        CaseRepository Query Layer                       |
|           Enforces Tenant Isolation & Customer Authorization            |
+-------------------------------------------------------------------------+
                   /                                   \
                  v                                     v
+------------------------------------+   +------------------------------------+
|            CaseManager             |   |           TimelineEngine           |
| Deterministic Status & Resolution  |   | Sensitive Data Redaction Engine    |
| Safety (Ground-Truth Verified Only)|   | (Hides Thought, Prompts, Secrets)  |
+------------------------------------+   +------------------------------------+
                   \                                   /
                    v                                 v
+-------------------------------------------------------------------------+
|                           Prisma / SQLite DB                            |
|             Backing Entities: Ticket, AgentRun, ActionRecord            |
+-------------------------------------------------------------------------+
```

---

## 2. Customer Case Status Lifecycle

The `CaseManager` deterministically maps raw execution step statuses to 8 clear, customer-friendly case states:

1. **`OPEN`**: Case submitted, queued for initial processing.
2. **`INVESTIGATING`**: ResolveX agent actively inspecting order state, customer history, and eligibility.
3. **`WAITING_FOR_CUSTOMER`**: Action required by customer (e.g. confirming replacement vs refund preference).
4. **`WAITING_FOR_APPROVAL`**: Case exceeds automated threshold; pending human operator approval.
5. **`PROCESSING`**: Executing business mutations and verifying external transactions.
6. **`RESOLVED`**: Ground-truth verified resolution completed successfully.
7. **`ESCALATED`**: Case routed to human specialist (triggered by policy, verification failure, or risk).
8. **`FAILED`**: Automated execution encountered an error; routed for operator support.

### Ground-Truth Resolution Safety Invariant
> **CRITICAL:** A case MUST NOT report `RESOLVED` status unless all executed business actions are explicitly **VERIFIED**. If an action was executed but verification failed or is incomplete, `CaseManager` automatically safe-falls to `ESCALATED`.

---

## 3. Case Timeline Engine & Redaction Security

The `TimelineEngine` generates a unified chronological view of case milestones from `AgentRun`, `AgentTrace`, `ActionRecord`, `Escalation`, and `Notification` streams.

### Redaction Rules:
- **Internal Chain-of-Thought**: Hidden from customer view (`isCustomerVisible: false`).
- **System Prompts & Model Reasoning**: Excluded from customer timelines.
- **Sensitive Credentials**: Tokens (`bearer ...`), API keys (`api_key=...`), passwords, and secret keys are automatically sanitized using regex pattern matching (`CaseManager.redactSensitiveText`).
- **Operator Access**: Support operators see all timeline entries, with secrets masked.

---

## 4. API Specification & RBAC

All endpoints enforce **JWT Authentication**, **Tenant Isolation** (`x-tenant-id`), and **RBAC Scoping**.

### 1. List Cases
`GET /api/v1/cases`
- **Query Parameters**: `status`, `search` (ID, Order ID, Issue), `page` (default 1), `limit` (default 10)
- **Roles**: `CUSTOMER`, `OPERATOR`, `APPROVER`, `ADMIN`, `SERVICE`
- **Behavior**: Customers automatically restricted to their own `customerId`. Operators view all tenant cases.

### 2. Get Case Details
`GET /api/v1/cases/:id`
- **Roles**: `CUSTOMER`, `OPERATOR`, `APPROVER`, `ADMIN`, `SERVICE`
- **Behavior**: Enforces tenant boundary. If a customer attempts to access another customer's case ID (IDOR), returns `404 Not Found`.

### 3. Get Case Timeline
`GET /api/v1/cases/:id/timeline`
- **Roles**: `CUSTOMER`, `OPERATOR`, `APPROVER`, `ADMIN`, `SERVICE`
- **Behavior**: Returns redacted, customer-visible timeline for `CUSTOMER` role, and complete timeline for `OPERATOR`/`ADMIN` roles.

---

## 5. Summary of Safety Guarantees

| Invariant / Safety Control | Enforcement Mechanism |
| :--- | :--- |
| **No False Resolutions** | `CaseManager.mapStatus` requires `action.verified === true` for executed actions before returning `RESOLVED`. |
| **IDOR Protection** | `caseRepository.getCaseById` matches `customerId` when caller role is `CUSTOMER`. |
| **Tenant Isolation** | All queries strictly filter on `tenantId`. |
| **Credential Safety** | `CaseManager.redactSensitiveText` strips bearer tokens, API keys, and passwords. |
| **No Schema Corruption** | Operates on top of existing `Ticket` and `AgentRun` models. |
