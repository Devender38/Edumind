# ResolveX Autonomous Customer Resolution System — Security Operations Guide

## Overview
This document describes security operations, operational trust boundaries, incident response procedures, monitoring protocols, credential rotation, and emergency procedures for ResolveX.

---

## 1. Trust Boundaries & Security Architecture

1. **Perimeter Layer**:
   - HTTP Security Headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Content-Security-Policy`).
   - Restrictive CORS configuration (no wildcard `*` origins on authenticated production routes).
   - Inbound IP & Tenant Rate Limiting.

2. **Authentication & Identity Layer**:
   - HMAC-SHA256 signed Bearer tokens generated via `AuthService.generateToken`.
   - Timing-safe signature comparison using `crypto.timingSafeEqual`.
   - Validation of `iat` (issued at), `exp` (expiration), `nbf` (not before), and token structure.
   - Algorithm confusion protection (rejection of tampered headers or unapproved algorithms).

3. **Tenant Isolation & Zero Trust**:
   - Authenticated principal identity (`req.principal.tenantId`) is authoritative.
   - Any attempt to pass a conflicting `tenantId` in request bodies, query params, or headers is overridden/rejected.
   - Database queries strictly enforce `where: { tenantId }` filters.

4. **Advisory AI Guardrail Layer**:
   - Prompt Injection Detection (`PromptInjectionDetector`).
   - PII & Secret Redaction (`Redactor`).
   - AI outputs are purely advisory and cannot directly trigger business state mutations.

5. **Action Executor & Idempotency Layer**:
   - All mutations require policy validation and human approval/consent where required.
   - Action execution utilizes PostgreSQL unique idempotency constraints to prevent duplicate financial actions.

---

## 2. Incident Response & Threat Mitigation

### Incident Playbook A: Credential / Secret Leakage
1. **Identify**: Monitor `SecurityLogger` events for `SECRET_LEAK_DETECTED` or unauthorized token attempts.
2. **Contain**: Invalidate the affected HMAC signing secret or API key by rotating `RESOLVEX_AUTH_SECRET` or `AI_API_KEY` in environment configuration.
3. **Eradicate**: Force re-authentication for all active sessions.
4. **Recover**: Re-issue fresh signed tokens to authenticated users.

### Incident Playbook B: SSRF Attempt Detected
1. **Identify**: `SSRFGuard` logs `SSRF_BLOCKED` event when an outbound HTTP call targets private/internal IPs or metadata endpoints.
2. **Contain**: Incoming request or integration call is immediately terminated with HTTP 400/403.
3. **Investigate**: Audit source context and user payload for injected internal URLs.

### Incident Playbook C: Malicious Webhook Attack
1. **Identify**: `WebhookSecurity` logs `WEBHOOK_INVALID_SIGNATURE` or `WEBHOOK_REPLAY_ATTEMPT`.
2. **Contain**: Webhook processing halts immediately without triggering business mutations.
3. **Block**: Temporary rate-limiting or IP block applied to unverified webhook sources.

---

## 3. Credential Rotation Procedures

- **Auth Signing Secret (`RESOLVEX_AUTH_SECRET`)**: Rotated quarterly or immediately upon suspected breach. Old secret invalidated upon service restart.
- **AI Provider API Keys (`OPENAI_API_KEY`)**: Rotated via secrets manager. Zero downtime key updates via environment variable reloads.
- **Webhook HMAC Secrets (`WEBHOOK_SECRET`)**: Tenant-specific webhook secrets configured in database and rotated on demand.

---

## 4. Emergency Disable Procedures

- **Disable AI Provider**: Set `AI_PROVIDER_MODE=DISABLED` to immediately halt all outbound LLM inferencing. System safely falls back to deterministic rule-based handling.
- **Pause Worker Execution**: Set `WORKER_ENABLED=false` to pause autonomous background job consumption while maintaining read-only API access.
- **Emergency Circuit Breaker Trigger**: Force `CircuitBreaker.recordFailure()` to open circuit for failing downstream adapters.
