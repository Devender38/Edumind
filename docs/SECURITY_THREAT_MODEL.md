# ResolveX Autonomous Customer Resolution System — Security Threat Model

## Executive Overview
This document outlines the formal security threat model for ResolveX Production Track Step 5. ResolveX operates an autonomous customer resolution engine enforcing a zero-trust, deterministic architecture:
`Customer Request → Authentication → Tenant Isolation → AI Advisory Layer → Deterministic Policy → Authorization → Human Approval / Consent → Action Executor → External Integration → Ground-Truth Verification → Resolution`

The AI/LLM layer is strictly **Advisory** with 0 direct mutation authority over business state.

---

## Threat Matrix & Mitigation Catalogue (29 Standard Threats)

| Threat ID | Attack Vector | Affected Component | Prevention Mechanism | Detection Strategy | Mitigation Strategy | Test Coverage |
|---|---|---|---|---|---|---|
| **T-01** | Credential Theft | Auth Engine / API Gateway | Strong HMAC token signing (`RESOLVEX_AUTH_SECRET`), timing-safe verification, short token TTLs | Auth failure rate metrics, IP anomaly logging | Immediate token revocation, credential rotation | `step5_security.test.ts` (Cat 1) |
| **T-02** | API Key Leakage | Configuration / Environment | Environment variable loading (`process.env`), zero hardcoded secrets in source/fixtures | Secret scanner audit scripts, static analysis | Emergency key rotation via secrets manager | `step5_security.test.ts` (Cat 11) |
| **T-03** | JWT / Session Abuse | Authentication Middleware | Signature validation, algorithm confusion protection (reject `none` alg), `iat`/`exp`/`nbf` verification | Invalid token attempt telemetry | Token revocation, timing-safe rejection (401) | `step5_security.test.ts` (Cat 2) |
| **T-04** | Tenant Breakout | API / Database Layer | Zero-trust tenant enforcement (`req.principal.tenantId` overrides untrusted request data) | Cross-tenant data attempt logs | Mandatory database query tenant filtering (403/404) | `step5_security.test.ts` (Cat 4, Attack A) |
| **T-05** | IDOR (Insecure Direct Object Reference) | Case / Order / Customer API | Strict `requireTenantIsolation` & `requireSelfOrAdmin` boundary checks | Unauthorized resource ID access logs | Direct query isolation in Prisma repository (404) | `step5_security.test.ts` (Cat 5, Attack A) |
| **T-06** | Privilege Escalation | RBAC Middleware | Enforce `requireRole` at service boundary; ignore user role field in JSON payload | Unauthorized endpoint access alerts | Strict RBAC matrix enforcement (403) | `step5_security.test.ts` (Cat 3, Attack B) |
| **T-07** | Replay Attacks | Action Executor / Webhooks | Unique idempotency key constraints in PostgreSQL, 300s webhook timestamp window | Duplicate idempotency key logs | Reject duplicate execution requests | `step5_security.test.ts` (Cat 9, Attack D) |
| **T-08** | Request Tampering | Express Middleware | HMAC payload verification, schema validation before processing | Schema validation failure logs | Reject tampered request body (400) | `step5_security.test.ts` (Cat 6, Attack C) |
| **T-09** | Malicious Customer Input | Input Validation | Input sanitizer stripping script tags & illegal control characters | Sanitization event counters | Reject malformed inputs before business logic | `step5_security.test.ts` (Cat 6) |
| **T-10** | Prompt Injection | AI Guardrail Layer | `PromptInjectionDetector` pattern matching ("ignore previous", "god mode") | `PROMPT_INJECTION_DETECTED` metric | Refuse AI call, halt agent execution safely | `step5_security.test.ts` (Cat 19, Attack G) |
| **T-11** | Tool Injection | AI Guardrail Layer | Reject tool call syntax in user message (`execute_tool(...)`); advisory LLM authority | AI output validation errors | LLM has 0 direct tool execution capabilities | `step5_security.test.ts` (Cat 19) |
| **T-12** | Webhook Spoofing | Integration Webhook Endpoint | HMAC-SHA256 signature check using shared webhook secret | Webhook signature failure alerts | Reject unverified webhook payload (401) | `step5_security.test.ts` (Cat 8, Attack E) |
| **T-13** | Webhook Replay | Integration Webhook Endpoint | Idempotency key tracking in DB, 300-second timestamp freshness window | Duplicate webhook event logs | Reject stale or duplicate webhook events | `step5_security.test.ts` (Cat 8) |
| **T-14** | SSRF (Server-Side Request Forgery) | Integration HTTP Client | `SSRFGuard` inspecting outbound URLs; block private IPs (`10.0.0.0/8`, `127.0.0.1`, cloud metadata) | SSRF block telemetry alerts | Block outbound request before socket opening | `step5_security.test.ts` (Cat 7, Attack F) |
| **T-15** | Malicious URLs | Integration HTTP Client | Strict URL scheme validation (`http:`, `https:` only); block IP literals & metadata hosts | Invalid URL protocol logs | Reject request before execution | `step5_security.test.ts` (Cat 7) |
| **T-16** | Oversized Requests | Express Body Parser | Payload size limits (1MB max), object nesting limit ($\le 10$ levels) | Payload size limit errors | HTTP 413 Payload Too Large | `step5_security.test.ts` (Cat 6, Attack H) |
| **T-17** | JSON / Decompression Bombs | Request Validator | Deep object recursion depth checks ($\le 10$), string length limits | Excessive nesting detection | HTTP 400 Bad Request | `step5_security.test.ts` (Cat 6, Attack H) |
| **T-18** | Rate-Limit Abuse | Rate Limiter Middleware | Tenant & IP bounded rate limiting (Auth: 100/min, Case: 30/min, AI: 60/min) | Rate limit exceeded events | HTTP 429 Too Many Requests | `step5_security.test.ts` (Cat 10) |
| **T-19** | Brute-Force Authentication | Auth Gateway | Per-IP rate limiting on `/api/v1/auth/login` and auth routes | High auth failure rate alerts | Temporary IP block (429) | `step5_security.test.ts` (Cat 10) |
| **T-20** | Audit-Log Tampering | Security Logger | Audit logs append-only, redact sensitive tokens before writing | Log integrity check metrics | Append-only store, PII/secret scrubbing | `step5_security.test.ts` (Cat 15) |
| **T-21** | PII Leakage | Logging / AI Traces | `Redactor` scrubbing names, emails, credit cards, SSNs from prose and objects | PII redaction event logs | Scrub PII before LLM prompt transmission | `step5_security.test.ts` (Cat 12) |
| **T-22** | Secret Leakage | Logging / Telemetry | `Redactor` scrubbing API keys, JWTs, bearer tokens, HMAC secrets from logs | Secret leak audit checks | Sanitize logs and error trace outputs | `step5_security.test.ts` (Cat 11) |
| **T-23** | Database Credential Leakage | Error Handler | Global error middleware masking database errors and connection strings | Raw exception logs | Return generic HTTP 500 error to clients | `step5_security.test.ts` (Cat 14) |
| **T-24** | Insecure Error Messages | Express Error Middleware | Strip stack traces, SQL strings, internal paths from production API responses | Sanitized response logs | Return sanitized `{ success: false, error }` | `step5_security.test.ts` (Cat 14) |
| **T-25** | Notification Data Leakage | Notification Service | Redact sensitive financial and credential details from notification templates | Template audit metrics | Send non-sensitive status updates only | `step5_security.test.ts` (Cat 12) |
| **T-26** | CRM Data Leakage | CRM Adapter | Enforce tenant isolation on CRM sync; redact payment credentials | CRM sync audit logs | Strip restricted data before external sync | `step5_security.test.ts` (Cat 20) |
| **T-27** | Integration Credential Misuse | External Adapters | Secrets stored in `process.env`; SSRF guard preventing token theft | Integration failure logs | Bounded retries, timing-safe headers | `step5_security.test.ts` (Cat 20) |
| **T-28** | Unauthorized Approval / Consent | Human Gate Controller | Approval tokens bound to tenant, ticket, action, and expiration; role check | Invalid approval token alerts | Reject forged or expired approval tokens | `step5_security.test.ts` (Cat 16, Attack I) |
| **T-29** | Duplicate Mutation Attacks | Action Executor | DB transaction with idempotency key unique constraint on `RefundTransaction` | Unique constraint error logs | Return existing verified action result | `step5_security.test.ts` (Cat 9, Attack D) |

---

## Security Boundaries & Trust Zones

1. **Untrusted Zone**: Public Internet clients, incoming webhooks, customer chat inputs.
2. **Perimeter Zone**: API Gateway, Express middleware, Rate Limiter, Auth Token Validator, Request Validator.
3. **Core Application Zone**: Agent Orchestrator, Policy Engine, Human Gate Controller, Action Executor, Audit Logger.
4. **AI Advisory Zone (Isolated)**: AI Provider Registry, Local LLM / OpenAI Providers, Redactor, Prompt Injection Detector.
5. **Authoritative Persistence Zone**: PostgreSQL 18.4 Database, Prisma Client (Parameterized Queries only).
