# ResolveX — Production Configuration Specification

This document provides a comprehensive audit of all environment variables, configuration parameters, and classification boundaries for the ResolveX Autonomous Customer Resolution System.

---

## 📋 Configuration Classification Matrix

Every configuration variable is classified into functional categories and strict security boundaries:

| Variable Name | Description | Environment Scope | Security Level | Production Requirement | Default / Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Application runtime mode (`development`, `test`, `staging`, `production`) | **PRODUCTION REQUIRED** | **NON-SECRET** | Must be `production` or `staging` | `production` |
| `PORT` | HTTP server binding port | **PRODUCTION REQUIRED** | **NON-SECRET** | Must be a valid TCP port (e.g. 5000) | `5000` |
| `CLIENT_URL` | Frontend origin for CORS and webhooks | **PRODUCTION REQUIRED** | **NON-SECRET** | HTTPS URL required; `localhost` prohibited | `https://dashboard.resolvex.ai` |
| `DATABASE_URL` | PostgreSQL connection string | **PRODUCTION REQUIRED** | **SECRET** | PostgreSQL string with `sslmode=require` | `postgresql://user:pass@host:5432/resolvex_prod?sslmode=require` |
| `RESOLVEX_AUTH_SECRET` | HMAC SHA-256 JWT signing secret | **PRODUCTION REQUIRED** | **SECRET** | 32+ char random string; default placeholder prohibited | `32+ random characters` |
| `RESOLVEX_WORKER_CONCURRENCY` | Maximum concurrent worker leases per process | **PRODUCTION REQUIRED** | **NON-SECRET** | Minimum 1 worker | `10` |
| `SHUTDOWN_GRACE_MS` | Graceful SIGTERM drain timeout (ms) | **PRODUCTION REQUIRED** | **NON-SECRET** | Minimum 1000ms | `30000` |
| `AUTO_REFUND_LIMIT_INR` | Hard monetary threshold for auto-approval (INR) | **PRODUCTION REQUIRED** | **NON-SECRET** | Must not exceed business risk limit | `10000` |
| `MAX_REPLAN_ATTEMPTS` | Maximum autonomous replan loops per case | **PRODUCTION REQUIRED** | **NON-SECRET** | Maximum 3 loops | `3` |
| `ENABLE_VERIFICATION_CHECK` | Enforce ground-truth verification guard | **PRODUCTION REQUIRED** | **NON-SECRET** | Must be `true` | `true` |
| `AI_PROVIDER_MODE` | Selected LLM deployment mode (`ollama`, `openai`, `hybrid`) | **PRODUCTION REQUIRED** | **NON-SECRET** | Must select valid AI model mode | `ollama` |
| `OLLAMA_BASE_URL` | Self-hosted Ollama GPU endpoint | **OPTIONAL** (Self-hosted) | **NON-SECRET** | Valid internal GPU host URL | `http://ollama-gpu.internal:11434` |
| `OLLAMA_MODEL` | Ollama model identifier | **OPTIONAL** (Self-hosted) | **NON-SECRET** | Tested model tag | `llama3.2:latest` |
| `OPENAI_API_KEY` | OpenAI API Secret Key | **OPTIONAL** (Cloud API) | **SECRET** | Required if AI Cloud mode active | `sk-proj-****************` |
| `TWILIO_AUTH_TOKEN` | Twilio SMS API Key | **OPTIONAL** (Notifications) | **SECRET** | Required if Twilio active | `tw-secret-****************` |
| `SENDGRID_API_KEY` | SendGrid Email API Key | **OPTIONAL** (Notifications) | **SECRET** | Required if SendGrid active | `SG.****************` |
| `STRIPE_SECRET_KEY` | Production Payment Provider Key | **OPTIONAL** (Integrations) | **SECRET** | Required if Stripe active | `sk_live_****************` |
| `SHOPIFY_ADMIN_API_TOKEN` | Production E-Commerce CRM Token | **OPTIONAL** (Integrations) | **SECRET** | Required if Shopify active | `shpat_****************` |
| `RESOLVEX_VERSION` | Version release tag | **DEVELOPMENT / TEST** | **NON-SECRET** | Set by build pipeline | `1.0.0` |
| `RESOLVEX_COMMIT_SHA` | Deployment Git commit hash | **DEVELOPMENT / TEST** | **NON-SECRET** | Set by CI/CD runner | `4fb0362` |

---

## 🔒 Secret Handling & Log Redaction Invariants

1. **Zero Secret Leakage in Logs**: All application loggers (`logger.ts`, `securityLogger.ts`) filter out passwords, tokens, API keys, database connection strings, and authorization headers using strict regex scrubbers.
2. **Zero Hardcoded Credentials**: Source code, test fixtures, documentation, and Dockerfiles contain placeholder values only.
3. **Fail-Fast Startup Validation**: In `production` mode, `validateProductionConfig()` halts process execution immediately if mandatory secrets or production PostgreSQL connection strings are missing or default.
