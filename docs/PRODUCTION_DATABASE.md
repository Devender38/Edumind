# ResolveX — Production Database Specification & Runbook

This document specifies the PostgreSQL production database architecture, connection pool governance, migration procedures, backup policy, and disaster recovery strategies for ResolveX.

---

## 🗄️ Database Architecture

* **Engine**: PostgreSQL 15+ (AWS RDS PostgreSQL / GCP Cloud SQL / Managed PostgreSQL)
* **Schema Definition**: `prisma/schema.pg.prisma`
* **Datasource Provider**: `postgresql`
* **TLS/SSL Requirement**: `sslmode=require` (Mandatory in production)

---

## 🔄 Prisma Migration & Schema Deployment

### 1. Production Migration Execution
In production environments, destructive commands (`npx prisma db push`, `npx prisma migrate reset`) are strictly prohibited. Production migrations are deployed deterministically using:

```bash
# Safe, idempotent production migration deployment
npx prisma migrate deploy --schema=prisma/schema.pg.prisma
```

### 2. Migration Invariants
- **No Automatic Seed**: Production deployment scripts do NOT execute `seed.ts`. Seed scripts are restricted to local development and unit test harnesses.
- **Transactional Schema Changes**: Schema migrations are wrapped in PostgreSQL DDL transactions where supported.

---

## ⚡ Connection Pooling & Governance

To prevent database connection exhaustion across distributed backend pods:

```text
DATABASE_URL="postgresql://user:pass@pg-host:5432/resolvex_prod?connection_limit=20&pool_timeout=10&sslmode=require"
```

- **Connection Limit**: 20 pooled connections per application instance.
- **Pool Timeout**: 10 seconds timeout before backpressure rejection.
- **Graceful Failure Handling**: If PostgreSQL is temporarily unreachable, health probes degrade readiness from 200 to 503 (`/api/v1/health/readiness`), and active workers hold background jobs without crashing.

---

## 🛡️ Backup & Restore Strategy

1. **Point-In-Time Recovery (PITR)**: Enable 35-day continuous WAL archive logging on AWS RDS / Cloud SQL.
2. **Automated Daily Snapshots**: Daily encrypted database snapshots taken at 02:00 UTC.
3. **Rollback Strategy**:
   - In case of a failed migration, revert application code to the prior container version (`v1.0.0`).
   - If DDL changes were applied, apply forward-fix migrations or restore the pre-migration PITR snapshot to a secondary database instance, verify ground truth, and swap DNS endpoints.
