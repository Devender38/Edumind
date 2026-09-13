# Tech Zypher — ResolveX Incident Management & Alerting Protocol

## 1. Overview
ResolveX features a durable, automated Incident Management Engine. Incidents are created automatically upon safety invariant violations or critical SLO burn rates, or created manually by operators.

## 2. Fingerprint Deduplication
To prevent alert fatigue and duplicate notifications, incidents are deduplicated by fingerprint:
`sha256(alertDefinitionName + tenantScope + affectedComponent)`

If an active (OPEN, ACKNOWLEDGED, or INVESTIGATING) incident with the same fingerprint exists, repeated triggers append timeline events and update evidence without spawning duplicate incidents.

## 3. Incident Lifecycle State Machine

```
[ OPEN ]
   │
   ▼ (Acknowledge by Operator)
[ ACKNOWLEDGED ]
   │
   ▼ (Investigate)
[ INVESTIGATING ]
   │
   ▼ (Apply Fix)
[ MITIGATING ]
   │
   ▼ (Verify Stability)
[ RESOLVED ]
   │
   ▼ (Post-Mortem & Audit)
[ CLOSED ]
```

## 4. Operational API Endpoints
- `GET /api/v1/ops/incidents`: Filtered and paginated listing of incidents.
- `GET /api/v1/ops/incidents/:id`: Detailed incident record with timeline audit trail.
- `POST /api/v1/ops/incidents/:id/acknowledge`: Acknowledge incident ownership.
- `POST /api/v1/ops/incidents/:id/resolve`: Mark incident resolved with summary.
- `POST /api/v1/ops/incidents/:id/close`: Close incident after verification.
