# ResolveX Autonomous Customer Resolution System — Privacy & Data Classification

## Overview
This document defines the data classification schema, handling rules, PII minimization policies, and payment data safety protocols enforced across ResolveX.

---

## 1. Data Classification Schema

| Classification Level | Definition | Examples | Storage & Handling Rules | Transmission & Redaction |
|---|---|---|---|---|
| **Public** | Information approved for public disclosure. | Public policy names, product catalog descriptions, general support documentation. | Stored in DB / public API endpoints. No encryption required. | Exposed via public GET endpoints. |
| **Internal** | Operational data for internal system functioning. | Agent trace titles, step names, system feature flags, execution job IDs, non-sensitive logs. | Stored in internal database tables (`agent_traces`, `execution_jobs`). | Exposed to authenticated operators only. |
| **Confidential** | Customer business & case data. | Customer email, ticket messages, order totals, shipping addresses, customer tier. | Stored in PostgreSQL with tenant isolation (`tenant_id`). | Accessible only to authorized tenant principals. PII minimized before AI layer. |
| **Restricted** | Highly sensitive credentials, PII, payment info, auth secrets. | Passwords, API keys, JWT secrets, HMAC keys, credit card numbers, CVVs, SSNs, Bearer tokens. | Stored in environment variables / encrypted vaults. Never stored in plain-text logs or AI prompts. | **100% Redacted** from logs, traces, prompts, notifications, and error outputs via `Redactor`. |

---

## 2. PII Minimization & AI Layer Data Safety

1. **AI Prompt Context Minimization**:
   - Customer messages and context objects passed to `AIService` undergo mandatory processing via `Redactor.redactString` and `Redactor.redactObject`.
   - Sensitive keys (`password`, `secret`, `token`, `authorization`, `creditcard`, `ssn`, `dburl`, `hmac`) are automatically replaced with `[REDACTED]`.
   - Credit card regex patterns (`\b(?:\d[ -]*?){13,16}\b`) and SSNs (`\b\d{3}-\d{2}-\d{4}\b`) are scrubbed from free text before prompt assembly.

2. **Payment Data Safety**:
   - Full credit card numbers, CVVs, and payment gateway secret keys are **NEVER** stored in database tables or passed to AI models.
   - Only safe references (e.g. `RefundTransaction.id` or `externalReference`) and currency amounts (`totalAmount`) are stored.

3. **Notification & CRM Data Protection**:
   - Outbound notifications (`NotificationRepository`) and CRM synchronization adapters contain no restricted secrets or full payment credentials.
   - Notifications contain high-level case updates (e.g., "Your refund for Order #ORD-101 has been approved").

4. **Production Error Response Sanitization**:
   - External HTTP 500 error responses return generic error messages:
     ```json
     {
       "success": false,
       "error": "Internal Server Error: An unexpected error occurred.",
       "correlationId": "corr-12345"
     }
     ```
   - Database connection strings, SQL query details, filesystem paths, and internal stack traces are stripped from external responses.

---

## 3. Data Classification Compliance Audit Results

- **AI Prompts**: Verified 0 raw passwords, zero credit cards, zero Bearer tokens in outbound LLM payloads.
- **Observability Traces**: `SecurityLogger` sanitizes audit events to ensure zero secrets in logs.
- **Database Storage**: Parameterized Prisma queries prevent SQL injection; sensitive columns encrypted/redacted.
- **Secrets Management**: Source code, test fixtures, and config files contain 0 hardcoded production credentials.
