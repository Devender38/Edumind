# ResolveX — Production Backup & Disaster Recovery Specification

This document details the disaster recovery objectives, database point-in-time recovery, container rollback procedures, and operational readiness metrics for ResolveX.

---

## ⏱️ Recovery Objectives

| Metric | Target Objective | Implementation Proof |
| :--- | :--- | :--- |
| **RPO (Recovery Point Objective)** | **< 5 minutes** | PostgreSQL continuous WAL archiving with AWS RDS PITR |
| **RTO (Recovery Time Objective)** | **< 15 minutes** | Automated multi-AZ failover & container rolling restart |

---

## 📊 Capability Verification Matrix

Every operational capability is classified by actual verification status:

| Capability | Status | Verification Context |
| :--- | :--- | :--- |
| Local Crash Recovery (Durable Queue) | **LOCALLY VERIFIED** | Validated in `crash_recovery.test.ts` & Demo F |
| PostgreSQL DB Connection Pooling | **LOCALLY VERIFIED** | Validated in `step9_enterprise_scale.test.ts` |
| Microsecond Lease Fencing | **LOCALLY VERIFIED** | Validated in `concurrency.test.ts` & Demo F |
| AWS RDS Multi-AZ Automatic Failover | **CLOUD CONFIGURED** | Pending AWS infrastructure deployment |
| AWS RDS Point-In-Time Recovery | **CLOUD CONFIGURED** | Pending RDS WAL archive activation |
| Live Production Provider Failover | **PRODUCTION CONFIGURED** | Pending production API keys |

---

## 🔁 Rollback & Recovery Procedures

1. **Application Code Rollback**: If a newly deployed backend version exhibits runtime errors, issue `kubectl rollout undo deployment/resolvex-backend` or revert container tag to `v1.0.0`.
2. **Database PITR Recovery**:
   - Create a DB snapshot before executing DDL migrations.
   - If data corruption occurs, restore the snapshot to a new PostgreSQL instance, verify ground truth using `ReconciliationEngine`, and update `DATABASE_URL`.
