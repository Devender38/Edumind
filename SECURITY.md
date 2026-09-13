# ResolveX — Production Security, Authentication, Authorization & Tenant Isolation (Phase 16)

This document describes the security architecture, threat model, authorization matrix, tenant boundary, secret protection, rate limiting, and auditing controls implemented in **Phase 16** for the **ResolveX Autonomous Customer Resolution Agent**.

---

## 1. Security Architecture Overview

Phase 16 establishes a explicit security perimeter around ResolveX. Previously, endpoints and operations relied on trusted internal access. Now, all API routes (except public health checks) require explicit authentication and role-based authorization with tenant-level boundary enforcement.

```
       HTTP Request
            │
            ▼
┌───────────────────────┐
│ Security Headers &    │ (CORS, X-Content-Type-Options, X-Frame-Options)
│ Request Validation    │ (Length limits, ID bounds, enum checks)
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Authentication        │ (HMAC-SHA256 Bearer Tokens / Configured Keys)
│ Middleware            │ (Verifies signature, expiration, principal payload)
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Authorization &       │ (Enforces CUSTOMER, OPERATOR, APPROVER, ADMIN, SERVICE)
│ RBAC Middleware       │ (Blocks unauthorized role access with 403 Forbidden)
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Customer Ownership &  │ (Ensures principal.customerId === run.customerId)
│ Tenant Isolation      │ (Ensures principal.tenantId === run.tenantId)
└───────────┬───────────┘ (Hides cross-tenant resources with 404 Not Found)
            │
            ▼
┌───────────────────────┐
│ Autonomous Engine &   │ (Existing Phase 1-15 Policy, Action & Verification)
│ Verification Gates    │
└───────────────────────┘
```

---

## 2. Principal & Identity Model

Every authenticated request resolves to a `Principal` object attached to the Express request (`req.principal`):

```ts
export type PrincipalType = 'CUSTOMER' | 'USER' | 'SERVICE';
export type PrincipalRole = 'CUSTOMER' | 'OPERATOR' | 'APPROVER' | 'ADMIN' | 'SERVICE';

export interface Principal {
  id: string;
  type: PrincipalType;
  role: PrincipalRole;
  tenantId: string;
  customerId?: string;
  scopes?: string[];
}
```

### Roles & Capabilities

| Role | Description | Core Capabilities | Prohibitions |
| :--- | :--- | :--- | :--- |
| **`CUSTOMER`** | End customer requesting resolution | Create runs for self, view own runs, grant consent for own runs | Cannot view other customers' runs, cannot access operator APIs, cannot approve manager actions |
| **`OPERATOR`** | Support agent / system operator | View tenant runs, inspect traces, run diagnostics, trigger safe reconciliation | Cannot perform manager-level approval unless assigned `APPROVER`, cannot cross tenant boundaries |
| **`APPROVER`** | Manager authorized for high-value approvals | Approve or reject manager-level refund/replacement gates for authorized tenant | Cannot bypass customer consent, cannot force resolution, cannot cross tenant boundaries |
| **`ADMIN`** | System administrator | Full tenant-scoped operational administration and configuration | Cannot bypass ground-truth verification or safety invariants |
| **`SERVICE`** | Trusted internal background orchestrator | System-to-system orchestration, replanning, internal tool execution | Bound by tenant scope and structured audit logging |

---

## 3. Endpoint Authorization Matrix

| Endpoint Route | Method | Allowed Roles | Access Scope | Verification / Behavior |
| :--- | :---: | :--- | :--- | :--- |
| `/api/v1/health` | `GET` | Public | Global | Health & readiness status |
| `/api/v1/agents/run` | `POST` | `CUSTOMER`, `SERVICE` | Scoped to principal customer & tenant | Creates resolution run |
| `/api/v1/agent-runs/:id` | `GET` | `CUSTOMER`, `OPERATOR`, `APPROVER`, `ADMIN`, `SERVICE` | `CUSTOMER` = own run only; `OPERATOR/APPROVER/ADMIN` = tenant scope | Retrieves run state & traces |
| `/api/v1/agents/runs/:id/approve` | `POST` | `APPROVER`, `ADMIN`, `SERVICE` | Tenant scope | Resumes run paused at `WAITING_FOR_APPROVAL` |
| `/api/v1/agents/runs/:id/consent` | `POST` | `CUSTOMER`, `SERVICE` | Own run only (`customerId` match) | Resumes run paused at `WAITING_FOR_CUSTOMER_CONSENT` |
| `/api/v1/ops/runs` | `GET` | `OPERATOR`, `APPROVER`, `ADMIN`, `SERVICE` | Tenant scope | Lists operational runs |
| `/api/v1/ops/runs/:id` | `GET` | `OPERATOR`, `APPROVER`, `ADMIN`, `SERVICE` | Tenant scope | Operational detail & mutation audit |
| `/api/v1/ops/health/runs` | `GET` | `OPERATOR`, `APPROVER`, `ADMIN`, `SERVICE` | Tenant scope | Stale/suspicious run diagnostics |
| `/api/v1/ops/runs/:id/reconcile` | `POST` | `OPERATOR`, `ADMIN`, `SERVICE` | Tenant scope | Reconciles stuck run with DB ground truth |
| `/api/v1/agents/recovery/replan` | `POST` | `SERVICE`, `ADMIN` | Tenant scope | Internal failure recovery & replanning |
| `/api/v1/tools` | `GET` | `OPERATOR`, `APPROVER`, `ADMIN`, `SERVICE` | Global read-only | Lists registered tools |

---

## 4. Tenant Isolation & IDOR Protection

1. **Prisma Schema Tenant Scope**: `Customer`, `Order`, `Ticket`, and `AgentRun` models contain `tenantId String @default("tenant-a")`.
2. **Server-Side Enforcement**: All database queries incorporate `tenantId` filtered strictly from `req.principal.tenantId`. Tenant ID provided in request body is ignored.
3. **No Resource Existence Leakage**: When Tenant A attempts to access Tenant B's run, order, or ticket, the system returns `404 Not Found` (rather than `403 Forbidden` with a message like "Resource belongs to another tenant").

---

## 5. Elimination of Insecure Universal Tokens

- **Eliminated**: `VALID_TOKEN`, `approvalToken: "MANAGER_APPROVAL_TOKEN_VALID"` as magic strings.
- **Enforced**: Manager approvals now require an authenticated request bearing a valid signed token for a principal with `APPROVER`, `ADMIN`, or `SERVICE` role.
- **Safety Intact**: Approval authorization is an *additional* security layer. It does not bypass existing policy checks, consent requirements, or post-action verification.

---

## 6. Input Hardening & Abuse Protection

1. **Request Validation**:
   - `customerMessage`: Max 2,000 characters.
   - Resource IDs (`ticketId`, `orderId`, `agentRunId`, `correlationId`, `idempotencyKey`): Max 256 characters.
   - `limit` (pagination): Clamped to max 100.
   - Enum validation: Rejects invalid decision (`APPROVE` / `REJECT`) or consent values cleanly with `400 Bad Request`.
2. **Rate Limiting**:
   - Process-local in-memory sliding window rate limiter protects sensitive endpoints (`/approve`, `/consent`, `/run`, authentication attempts).
   - Rate limited calls return `429 Too Many Requests`.
   - **Production Requirement**: In multi-instance production deployments, the process-local rate limiter must be replaced with a distributed store such as Redis.

---

## 7. Security Audit Logging & Redaction

Security events are emitted with correlation IDs and safe operational context (`AUTH_SUCCESS`, `AUTH_FAILURE`, `AUTHZ_DENIED`, `CROSS_TENANT_ACCESS_DENIED`, `APPROVAL_ATTEMPT`, `CONSENT_ATTEMPT`, `RATE_LIMITED_REQUEST`).

**Zero Credential Leakage**: `Logger.sanitizeMetadata` redacts passwords, bearer tokens, API keys, approval tokens, authorization headers, and secrets before writing to logs.

---

## 8. Environment & Configuration Requirements

| Environment Variable | Description | Production Requirement |
| :--- | :--- | :--- |
| `RESOLVEX_AUTH_SECRET` | Secret key for signing/verifying HMAC SHA-256 tokens | Must be set to a high-entropy secret (>= 32 bytes). Server fails startup if absent in production. |
| `RESOLVEX_ENV` | Environment identifier (`production`, `development`, `test`) | Determines auth enforcement strictness and error stack trace hiding. |
| `RESOLVEX_ALLOWED_ORIGINS` | Allowed CORS origins | Restrictive whitelist for cross-origin web app access. |

---

## 9. Security Invariants Summary

1. **Unauthenticated callers cannot perform protected operations.**
2. **Customers cannot access or mutate other customers' runs (IDOR protected).**
3. **Tenants cannot access or discover other tenants' records (Tenant Isolated).**
4. **Universal approval tokens are eliminated; approval requires `APPROVER` role.**
5. **Authentication never bypasses business policy, consent, or verification gates.**
6. **No API endpoint can directly force a run state to `RESOLVED`.**
7. **Secrets, bearer tokens, and credentials are zero-logged.**
8. **Security audit logs preserve Correlation IDs throughout the request pipeline.**

---

## 10. Phase Boundary Statement

> **Phase 16 implemented.** Phase 17+ was **NOT** implemented.
