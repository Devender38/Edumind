# ResolveX Final Production Deployment Runbook

## 1. Zero-Downtime Deployment Sequence

```mermaid
sequenceDiagram
    participant Pipeline as Deployment Pipeline
    participant DB as PostgreSQL Database
    participant NodeA as API Node A (V1)
    participant NodeB as API Node B (V2)
    participant Worker as Worker Pool

    Pipeline->>DB: 1. Execute Prisma Database Migrations (npx prisma migrate deploy)
    Pipeline->>NodeB: 2. Launch New API Instances (Version 2)
    NodeB->>NodeB: 3. Health Probe Returns 200 OK (/health/liveness)
    Pipeline->>NodeA: 4. Signal Drain to Old Instances (POST /admin/drain)
    NodeA->>NodeA: 5. Readiness Probe Returns 503 Draining (/health/readiness)
    NodeA->>NodeA: 6. Wait for In-flight Requests to Complete (Max 30s)
    Pipeline->>Worker: 7. Perform Rolling Restart of Worker Pool Nodes
    Worker->>DB: 8. Workers Claim In-flight Jobs via Monotonic Lease Fencing
    Pipeline->>NodeA: 9. Terminate Old API Instances (Version 1)
```

---

## 2. Startup & Execution Order

1. **Database Migration Step**:
   ```bash
   npx prisma migrate deploy
   ```
2. **Environment Validation**:
   - Ensure `DATABASE_URL`, `RESOLVEX_AUTH_SECRET`, `OPENAI_API_KEY` (or local Ollama host) are configured.
3. **API Node Cluster Launch**:
   ```bash
   npm run start:backend
   ```
4. **Worker Pool Launch**:
   ```bash
   npm run start:worker
   ```
5. **Health Readiness Check**:
   ```bash
   curl -i http://localhost:3000/health/readiness
   # Expected: HTTP 200 OK {"status": "READY"}
   ```

---

## 3. Graceful Draining & Rollback Procedures

### A. Node Draining Procedure
- Send `SIGTERM` or execute `POST /api/v1/enterprise/node/drain`.
- Readiness probe returns `HTTP 503 Service Unavailable`, causing load balancers to cease routing new connections.
- In-flight AgentRuns and HTTP requests complete within 30-second grace window.

### B. Automated Rollback Trigger Conditions
Rollback is automatically or manually initiated if:
- Readiness probe returns 503 for > 60 consecutive seconds.
- UNKNOWN_OUTCOME rate exceeds 1.0% over a 5-minute rolling window.
- Error rate exceeds 0.5% of total request throughput.

### C. Emergency Shutdown Protocol
```bash
# 1. Drain API Traffic
curl -X POST http://localhost:3000/api/v1/enterprise/node/drain -H "Authorization: Bearer <SYSTEM_ADMIN_TOKEN>"

# 2. Pause Durable Queue Processing
curl -X POST http://localhost:3000/api/v1/enterprise/queue/pause -H "Authorization: Bearer <SYSTEM_ADMIN_TOKEN>"

# 3. Stop Worker Processes
pm2 stop resolvex-worker || systemctl stop resolvex-worker
```
