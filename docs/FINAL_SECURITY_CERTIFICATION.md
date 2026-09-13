# ResolveX Final Security Certification Audit

## 1. Authentication & Integrity Controls

### A. HMAC SHA-256 Webhook Authentication
- All incoming webhook payloads require `X-Signature-256` headers calculated using shared tenant secret keys (`crypto.createHmac('sha256', secret)`).
- Timestamps outside the 300-second window are strictly rejected to prevent replay attacks (`TIMESTAMP_OUT_OF_BOUNDS`).

### B. JWT Bearer Token Security
- API endpoints authenticate requests using JWT Bearer tokens signed with RS256 / HS256 algorithms.
- Claims include `sub` (User/Principal ID), `tenantId`, `role`, `exp` (Expiry), and `scopes`.
- Invalid or expired tokens return `HTTP 401 Unauthorized`. Tampered token headers return `HTTP 401`.

### C. Error Handling & Secret Leakage Prevention
- Global error handlers format all exceptions into standard JSON structured error responses.
- Database connection strings (`DATABASE_URL`), API secrets (`OPENAI_API_KEY`, `RESOLVEX_AUTH_SECRET`), internal IP addresses, and stack traces are stripped before returning responses to clients.

---

## 2. Enterprise RBAC & Role Hierarchy Audit

The system enforces 7 enterprise roles with strict privilege fencing:

| Role | Permitted Actions | Blocked Actions |
| :--- | :--- | :--- |
| `SYSTEM_ADMIN` | Global system control, cross-tenant management | None |
| `TENANT_ADMIN` | Full tenant configuration, user management within tenant | Cross-tenant resource access, global system flag modification |
| `SECURITY_ADMIN` | Feature flag governance, rate limit tuning, audit inspection | Financial refund approvals, direct AgentRun state mutation |
| `OPERATOR` | AgentRun execution approvals, action rollbacks | Quota manipulation, security flag modification, cross-tenant access |
| `SUPPORT_AGENT` | Read-only ticket inspection, customer case escalation | Approval of high-value refunds (>₹10,000), policy alteration |
| `READ_ONLY_OPERATOR` | Inspection of agent runs, traces, system metrics | **ALL state mutations** (HTTP 403 Forbidden) |
| `AUDITOR` | Read-only audit log inspection, compliance reporting | **ALL state mutations** (HTTP 403 Forbidden) |

Every authorization evaluation generates an immutable audit record containing sequence number, timestamp, principal ID, action, resource, tenant ID, and cryptographic hash.

---

## 3. Multi-Tenant Fencing Audit

### A. Database Isolation
- Every Prisma query includes explicit `where: { tenantId }` constraints.
- Foreign key relationships cascade within tenant boundaries. Cross-tenant FK association is impossible.

### B. Queue & Worker Fencing
- Workers claim jobs scoped to authorized tenant IDs or global pool worker configurations.
- Workers cannot claim or acknowledge jobs belonging to foreign tenants (`TENANT_ISOLATION_VIOLATION`).

### C. Telemetry & Audit Isolation
- Prometheus metrics, audit trails, and execution traces are partitioned by `tenantId`.
- PII scrubbing automatically redacts customer emails, credit cards, and phone numbers before writing metric labels (`[REDACTED_LABEL]`).

---

## 4. SSRF & Input Sanitization Audit

### A. SSRF Protection (`SSRFProtection`)
The SSRF validation engine inspects all outgoing webhooks and URL references:
- **Blocked Ranges**: `127.0.0.1`, `localhost`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.169.254` (AWS IMDS), `::1` (IPv6 loopback), `0.0.0.0`.
- **DNS Pinning**: Resolves hostnames prior to outbound request execution; rejects internal IP resolution.

### B. Input Security & Sanitization
- **String Length Limits**: Incoming JSON payload string parameters limited to 10,000 characters (returns `HTTP 400 Bad Request` if exceeded).
- **JSON Nesting Depth**: Object nesting limited to 10 levels (returns `HTTP 400 Bad Request` if exceeded).
- **Prompt Injection Defense**: `PromptInjectionDetector` scans incoming text for instructions attempting system prompt overrides, secret extraction, or tool injection.

---

## 5. Repository Secrets Audit

A repository-wide scan confirmed:
- Zero real production API keys, production passwords, or private key files are committed.
- Environment templates (`.env.example`) contain safe placeholder strings (`your-secret-key-here`).
- Failure-safe checks trigger startup crash if `NODE_ENV=production` is set without required secrets.
