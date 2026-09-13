# RESOLVEX STEP 9 — ENTERPRISE DATA GOVERNANCE & PRIVACY SPECIFICATION

## 1. PII Classification Matrix
ResolveX classifies all ingested data into 4 distinct security tiers:
- **TIER 1 (RESTRICTED):** Passwords, auth tokens, API keys, full payment card numbers, credit card CVVs. (STRICTLY PROHIBITED FROM LOGS & TRACES)
- **TIER 2 (CONFIDENTIAL):** Customer email addresses, phone numbers, full customer names, delivery addresses. (REDACTED/ANONYMIZED IN TELEMETRY)
- **TIER 3 (INTERNAL OPERATIONAL):** Order IDs, Ticket IDs, AgentRun IDs, policy version numbers, latency metrics. (TENANT-FENCED)
- **TIER 4 (PUBLIC):** Product catalog names, standard policy rule names, API status codes.

---

## 2. Retention Schedule & Categories
| Category | Retention Window | Storage Medium | Deletion Strategy |
| :--- | :--- | :--- | :--- |
| **AgentTraces** | 90 Days | Database (`AgentTrace`) | Automated TTL Purge |
| **AI Telemetry** | 30 Days | Persistent Observability Store | Aggregated & Truncated |
| **Customer Interactions** | 180 Days | Database (`Ticket`, `AgentRun`) | Anonymized PII Scrubbing |
| **Audit & Compliance Logs** | 365 Days | Immutable Compliance Audit Log | Legal Retention Lock |

---

## 3. Tenant Data Boundary & Isolation
- **Tenant Fencing:** Every deletion query MUST include explicit `tenantId` filtering (`WHERE tenantId = ?`).
- **Zero Cross-Tenant Deletion:** Mass deletion or GDPR purge requests for `Tenant A` cannot touch or cascade to `Tenant B` data.
- **GDPR Right to be Forgotten:** Customer PII is scrubbed using `DataGovernanceManager.anonymizePII()`, replacing email addresses with `[ANONYMIZED_EMAIL]` and phone numbers with `[ANONYMIZED_PHONE]`.
