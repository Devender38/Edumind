# ResolveX Database Operations & PostgreSQL Maintenance Guide

## 1. Executive Summary
This document specifies operational procedures for managing the **Tech Zypher — ResolveX** PostgreSQL database infrastructure, including deployment migrations, automated backups, point-in-time recovery, disaster recovery, and schema lifecycle management.

---

## 2. Environment Architecture & Database Datasource
- **Development & Local Test Environment**: SQLite (`file:./dev.db`) supported via `prisma/schema.prisma` (`provider = "sqlite"`) for fast, zero-dependency unit and regression testing.
- **Production Infrastructure**: Genuine PostgreSQL 18.4+ is **REQUIRED** and defined via `prisma/schema.pg.prisma` (`provider = "postgresql"`).
- **PostgreSQL Client**: `src/db/client.pg.ts` imports the dedicated PostgreSQL client generated at `node_modules/.prisma/client-pg`.

---

## 3. Migration Strategy & Schema Operations

### PostgreSQL Schema & Client Generation
```bash
# Generate dedicated PostgreSQL Prisma Client (into node_modules/.prisma/client-pg)
npm run db:generate:pg

# Synchronize schema to PostgreSQL target database
npm run db:push:pg
```

### Production Deployment Migration Sequence
> ⚠️ **CRITICAL**: Never run `npx prisma db push` or `npx prisma migrate reset` in production environment deployments.

Safe production migration sequence:
1. **Pre-Migration Database Snapshot**: Take a full PostgreSQL database dump (`pg_dump`).
2. **Verify Database Connectivity**: Ensure target database port (5432) and credentials are accessible.
3. **Execute Migration Deployment**:
   ```bash
   npm run db:migrate:prod
   ```
4. **Verify Physical Schema & Indexes**:
   ```bash
   npm run test:pg
   ```
5. **Start Application Container**: Launch application service with `DATABASE_URL_PG` configured.
6. **Execute Readiness Check**: Confirm HTTP 200 on `GET /api/v1/health/readiness`.

---

## 4. PostgreSQL Backup & Restore Procedures

### Implemented Backup Procedures (Operational Standard)

#### Logical Database Dump (`pg_dump`)
Run periodic automated cron backups to create atomic SQL snapshots:
```bash
# Export custom-format database backup
pg_dump -h <DB_HOST> -U resolvex -d resolvex -Fc -f /backups/resolvex_$(date +%Y%m%d_%H%M%S).dump

# Export plain SQL text backup
pg_dump -h <DB_HOST> -U resolvex -d resolvex -Fp -f /backups/resolvex_$(date +%Y%m%d_%H%M%S).sql
```

#### Logical Database Restore (`pg_restore` / `psql`)
To restore a snapshot to a target database:
```bash
# Restore custom-format dump file
pg_restore -h <DB_HOST> -U resolvex -d resolvex --clean --if-exists /backups/resolvex_20260913_120000.dump

# Restore plain text SQL file
psql -h <DB_HOST> -U resolvex -d resolvex -f /backups/resolvex_20260913_120000.sql
```

---

## 5. Implementation Status Matrix

| Operational Capability | Implementation Status | Technical Details & Guidance |
|---|---|---|
| **PostgreSQL Datasource Support** | **IMPLEMENTED** | First-class PostgreSQL support in production. Validation rejects non-PostgreSQL URLs. |
| **Prisma Production Migrations** | **IMPLEMENTED** | `npx prisma migrate deploy` for non-destructive deployment. |
| **Fail-Fast Startup Validation** | **IMPLEMENTED** | Fails immediately on missing or SQLite URLs in production/staging. |
| **Readiness Database Connectivity Probe** | **IMPLEMENTED** | `GET /api/v1/health/readiness` executes `SELECT 1` without exposing connection string or credentials. |
| **Automated Logical Backups (`pg_dump`)** | **RECOMMENDED OPERATIONAL PRACTICE** | Scheduled daily/hourly script executing `pg_dump` to object storage (S3/GCS). |
| **Point-in-Time Recovery (PITR)** | **RECOMMENDED OPERATIONAL PRACTICE** | PostgreSQL Write-Ahead Log (WAL) archiving (e.g., `WAL-G` or AWS RDS PITR) for sub-minute RPO. |
| **Multi-Node Active-Active Replication** | **NOT CERTIFIED / FUTURE** | Requires distributed locking layer (Redis / PostgreSQL advisory locks) prior to horizontal active-active scale. |

---

## 6. Disaster Recovery & Rollback Protocol

### Rollback Decision Tree
If a migration or application deployment introduces critical failures:
1. **Stop Application Ingress**: Set server to draining state or stop container.
2. **Assess Schema Changes**:
   - If migration was non-breaking (additive columns/tables), revert application container tag to previous image version.
   - If migration altered constraints destructively, restore database snapshot from pre-migration backup before launching previous application container version.
3. **Verify Health**: Confirm `GET /api/v1/health/readiness` returns HTTP 200 `status: "READY"`.
