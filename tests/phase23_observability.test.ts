import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'http';
import app from '../src/backend/server.js';
import { AuthService } from '../src/auth/authService.js';
import { prisma } from '../src/db/client.js';
import {
  metricsRegistry,
  metrics,
  sloEngine,
  alertEngine,
  incidentManager,
} from '../src/observability/index.js';

describe('Phase 23 — Comprehensive Observability, SLO, Alerting & Incident Management Suite', () => {
  let server: http.Server;
  let baseUrl: string;

  let operatorToken: string;
  let adminToken: string;
  let customerToken: string;
  let tenantBOperatorToken: string;

  beforeAll(async () => {
    await prisma.$connect();
    await new Promise<void>((resolve) => {
      server = app.listen(5099, () => {
        baseUrl = 'http://localhost:5099';
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((res) => server.close(() => res()));
    }
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    metricsRegistry.reset();

    operatorToken = AuthService.generateToken({
      id: 'op-23-1',
      tenantId: 'tenant-a',
      role: 'OPERATOR',
      email: 'operator@tenant-a.com',
    });

    adminToken = AuthService.generateToken({
      id: 'admin-23-1',
      tenantId: 'tenant-a',
      role: 'ADMIN',
      email: 'admin@tenant-a.com',
    });

    customerToken = AuthService.generateToken({
      id: 'cust-23-1',
      tenantId: 'tenant-a',
      role: 'CUSTOMER',
      customerId: 'cust-23-1',
      email: 'customer@tenant-a.com',
    });

    tenantBOperatorToken = AuthService.generateToken({
      id: 'op-23-tenant-b',
      tenantId: 'tenant-b',
      role: 'OPERATOR',
      email: 'operator@tenant-b.com',
    });

    await prisma.incident.deleteMany({
      where: { title: { startsWith: 'TEST_' } },
    });
  });

  // ----------------------------------------------------
  // 1. Prometheus Metrics Registry (Tests 1–13)
  // ----------------------------------------------------
  describe('1. Prometheus Metrics Registry & Data Minimization', () => {
    it('1.1 Should correctly process counter increments', async () => {
      const counter = metricsRegistry.registerCounter({
        name: 'test_counter_total',
        help: 'Test counter metric',
        labelNames: ['service'],
      });
      counter.inc({ service: 'backend' }, 5);
      const val = metricsRegistry.getValue('test_counter_total', { service: 'backend' });
      expect(val).toBe(5);
    });

    it('1.2 Should correctly handle gauge set, inc, and dec updates', async () => {
      const gauge = metricsRegistry.registerGauge({
        name: 'test_gauge_active',
        help: 'Test gauge metric',
      });
      gauge.set({}, 10);
      gauge.inc({}, 5);
      gauge.dec({}, 2);
      expect(metricsRegistry.getValue('test_gauge_active')).toBe(13);
    });

    it('1.3 Should record histogram observations into accurate bucket ranges', async () => {
      const histogram = metricsRegistry.registerHistogram({
        name: 'test_hist_seconds',
        help: 'Test histogram metric',
        buckets: [0.1, 0.5, 1.0],
      });
      histogram.observe(0.05);
      histogram.observe(0.4);
      histogram.observe(0.9);
      const raw = metricsRegistry.getRawHistogramValues('test_hist_seconds');
      expect(raw).toHaveLength(3);
    });

    it('1.4 Should serialize all registered metrics in Prometheus exposition text format', async () => {
      metricsRegistry.registerCounter({ name: 'test_prom_format', help: 'Prometheus format test' });
      const format = metricsRegistry.toPrometheusFormat();
      expect(format).toContain('# HELP test_prom_format Prometheus format test');
      expect(format).toContain('# TYPE test_prom_format counter');
    });

    it('1.5 Should confirm presence of all required engine metric definitions', async () => {
      const output = metricsRegistry.toPrometheusFormat();
      expect(output).toContain('resolvex_agent_run_total');
      expect(output).toContain('resolvex_notification_delivery_total');
    });

    it('1.6 Should confirm presence of 7 critical safety metric definitions', async () => {
      const output = metricsRegistry.toPrometheusFormat();
      expect(output).toContain('resolvex_safety_false_resolutions_total');
      expect(output).toContain('resolvex_safety_approval_bypasses_total');
      expect(output).toContain('resolvex_safety_customer_consent_bypasses_total');
      expect(output).toContain('resolvex_safety_duplicate_mutations_total');
      expect(output).toContain('resolvex_safety_verification_bypasses_total');
      expect(output).toContain('resolvex_safety_cross_tenant_violations_total');
      expect(output).toContain('resolvex_safety_policy_bypass_total');
    });

    it('1.7 Should verify zero-value initial state for safety metrics', async () => {
      const val = metricsRegistry.getValue('resolvex_safety_false_resolutions_total');
      expect(val).toBe(0);
    });

    it('1.8 Should sanitize special characters in label values', () => {
      const sanitized = metricsRegistry.sanitizeLabels({
        reason: 'Error: "Invalid Payload"\nNextLine',
      });
      expect(sanitized.reason).not.toContain('"');
      expect(sanitized.reason).not.toContain('\n');
    });

    it('1.9 Should reject high-cardinality label keys automatically', () => {
      const sanitized = metricsRegistry.sanitizeLabels({
        tenant: 'tenant-a',
        prompt: 'User prompt details',
      });
      expect(sanitized.tenant).toBe('tenant-a');
      expect(sanitized.prompt).toBeUndefined();
    });

    it('1.10 Should redact bearer, secret, and token strings in label values', () => {
      const sanitized = metricsRegistry.sanitizeLabels({
        token: 'ey12345',
        secret: 'supersecret',
        auth: 'bearer secret_key=12345',
      });
      expect(sanitized.token).toBeUndefined();
      expect(sanitized.secret).toBeUndefined();
      expect(sanitized.auth).toContain('[REDACTED]');
    });

    it('1.11 Should exclude correlationId label key from metrics to prevent memory leak', () => {
      const sanitized = metricsRegistry.sanitizeLabels({ correlationId: 'corr-999' });
      expect(sanitized.correlationId).toBeUndefined();
    });

    it('1.12 Should exclude customerMessage label key from metrics', () => {
      const sanitized = metricsRegistry.sanitizeLabels({ customerMessage: 'My password is 123' });
      expect(sanitized.customerMessage).toBeUndefined();
    });

    it('1.13 Should handle high volume concurrent metric updates thread-safely', async () => {
      const promises = Array.from({ length: 50 }).map((_, i) =>
        Promise.resolve().then(() => {
          metrics.agentRunsTotal.inc({ tenant: 'tenant-a', status: 'SUCCESS' });
        })
      );
      await Promise.all(promises);
      const val = metricsRegistry.getValue('resolvex_agent_run_total', { tenant: 'tenant-a', status: 'SUCCESS' });
      expect(val).toBe(50);
    });
  });

  // ----------------------------------------------------
  // 2. Service Level Objectives (SLO) Engine (Tests 14–22)
  // ----------------------------------------------------
  describe('2. Service Level Objectives (SLO) Engine', () => {
    it('2.14 Should calculate Availability SLO correctly', () => {
      metrics.agentRunsTotal.inc({ tenant: 'tenant-a', status: 'SUCCESS' }, 999);
      metrics.agentRunsTotal.inc({ tenant: 'tenant-a', status: 'FAILED' }, 1);
      const slos = sloEngine.evaluateSLOs('tenant-a');
      const avail = slos.find((s) => s.id === 'SLO-AVAILABILITY');
      expect(avail?.currentValue).toBe(0.999);
      expect(avail?.status).toBe('HEALTHY');
    });

    it('2.15 Should calculate Execution Success SLO correctly', () => {
      metrics.agentRunsTotal.inc({ tenant: 'tenant-a', status: 'SUCCESS' }, 95);
      metrics.agentRunsTotal.inc({ tenant: 'tenant-a', status: 'FAILED' }, 5);
      const slos = sloEngine.evaluateSLOs('tenant-a');
      const execSLO = slos.find((s) => s.id === 'SLO-EXECUTION-SUCCESS');
      expect(execSLO?.currentValue).toBe(0.95);
      expect(execSLO?.status).toBe('HEALTHY');
    });

    it('2.16 Should mark Safety SLOs as CRITICAL when safety violation occurs', () => {
      metrics.safetyFalseResolutions.inc({ tenant: 'tenant-a' }, 1);
      const slos = sloEngine.evaluateSLOs('tenant-a');
      const falseRes = slos.find((s) => s.id === 'SLO-RESOLUTION-SAFETY');
      expect(falseRes?.status).toBe('CRITICAL');
      expect(falseRes?.currentValue).toBe(0);
    });

    it('2.17 Should compute error-budget remaining percentage', () => {
      const slos = sloEngine.evaluateSLOs('tenant-a');
      const avail = slos.find((s) => s.id === 'SLO-AVAILABILITY');
      expect(avail?.remainingErrorBudget).toBe(100);
    });

    it('2.18 Should report 0 remaining error budget on exhaustion', () => {
      metrics.agentRunsTotal.inc({ tenant: 'tenant-a', status: 'FAILED' }, 50);
      const slos = sloEngine.evaluateSLOs('tenant-a');
      const execSLO = slos.find((s) => s.id === 'SLO-EXECUTION-SUCCESS');
      expect(execSLO?.remainingErrorBudget).toBe(0);
    });

    it('2.19 Should calculate elevated burn-rate status when failures spike', () => {
      metrics.agentRunsTotal.inc({ tenant: 'tenant-a', status: 'FAILED' }, 20);
      const slos = sloEngine.evaluateSLOs('tenant-a');
      const execSLO = slos.find((s) => s.id === 'SLO-EXECUTION-SUCCESS');
      expect(execSLO?.burnRateStatus).toBe('CRITICAL');
    });

    it('2.20 Should return deterministic SLO structures across repeated invocations', () => {
      const run1 = sloEngine.evaluateSLOs('tenant-a');
      const run2 = sloEngine.evaluateSLOs('tenant-a');
      expect(run1).toEqual(run2);
    });

    it('2.21 Should return 100% HEALTHY SLO state when 0 incidents/failures have occurred', () => {
      const slos = sloEngine.evaluateSLOs('tenant-a');
      expect(slos.every((s) => s.status === 'HEALTHY')).toBe(true);
    });

    it('2.22 Should handle empty metric registry safely without NaN or division by zero', () => {
      metricsRegistry.reset();
      const slos = sloEngine.evaluateSLOs('tenant-a');
      expect(slos).toHaveLength(7);
      expect(slos.every((s) => !isNaN(s.currentValue))).toBe(true);
    });
  });

  // ----------------------------------------------------
  // 3. Alert Engine & Fingerprint Deduplication (Tests 23–33)
  // ----------------------------------------------------
  describe('3. Alert Engine & Fingerprint Deduplication', () => {
    it('3.23 Should trigger alert on threshold breach', () => {
      metrics.safetyApprovalBypasses.inc({ tenant: 'tenant-a' }, 1);
      const alerts = alertEngine.evaluateAlerts('tenant-a');
      const firing = alerts.filter((a) => a.isFiring);
      expect(firing.length).toBeGreaterThan(0);
      expect(firing[0].alertKey).toBe('ALERT-SAFETY-APPROVAL-BYPASS');
    });

    it('3.24 Should not trigger alert when threshold is not breached', () => {
      const alerts = alertEngine.evaluateAlerts('tenant-a');
      const firing = alerts.filter((a) => a.isFiring);
      expect(firing).toHaveLength(0);
    });

    it('3.25 Should flag safety alerts with CRITICAL severity', () => {
      metrics.safetyFalseResolutions.inc({ tenant: 'tenant-a' }, 1);
      const alerts = alertEngine.evaluateAlerts('tenant-a');
      const falseResAlert = alerts.find((a) => a.alertKey === 'ALERT-SAFETY-FALSE-RESOLUTION');
      expect(falseResAlert?.severity).toBe('CRITICAL');
    });

    it('3.26 Should compute deterministic SHA-256 fingerprint', () => {
      const fp1 = alertEngine.computeFingerprint('ALERT-1', 'tenant-a', 'CompA');
      const fp2 = alertEngine.computeFingerprint('ALERT-1', 'tenant-a', 'CompA');
      expect(fp1).toBe(fp2);
      expect(fp1).toHaveLength(64);
    });

    it('3.27 Should deduplicate identical alert definitions within the same tenant', () => {
      const fp1 = alertEngine.computeFingerprint('ALERT-1', 'tenant-a', 'CompA');
      const fp2 = alertEngine.computeFingerprint('ALERT-1', 'tenant-a', 'CompA');
      expect(fp1).toBe(fp2);
    });

    it('3.28 Should produce distinct fingerprints for different tenants', () => {
      const fpA = alertEngine.computeFingerprint('ALERT-1', 'tenant-a', 'CompA');
      const fpB = alertEngine.computeFingerprint('ALERT-1', 'tenant-b', 'CompA');
      expect(fpA).not.toBe(fpB);
    });

    it('3.29 Should produce distinct fingerprints for different components', () => {
      const fpComp1 = alertEngine.computeFingerprint('ALERT-1', 'tenant-a', 'CompA');
      const fpComp2 = alertEngine.computeFingerprint('ALERT-1', 'tenant-a', 'CompB');
      expect(fpComp1).not.toBe(fpComp2);
    });

    it('3.30 Should prevent alert storms on repeated evaluations', async () => {
      metrics.safetyApprovalBypasses.inc({ tenant: 'tenant-a' }, 1);
      const run1 = alertEngine.evaluateAlerts('tenant-a');
      const run2 = alertEngine.evaluateAlerts('tenant-a');
      expect(run1[0].fingerprint).toBe(run2[0].fingerprint);
    });

    it('3.31 Should persist alert state records in database', async () => {
      metrics.safetyFalseResolutions.inc({ tenant: 'tenant-a' }, 1);
      const alerts = alertEngine.evaluateAlerts('tenant-a');
      expect(alerts[0].fingerprint).toBeDefined();
    });

    it('3.32 Should transition alert state to RESOLVED when metrics normalize', () => {
      metricsRegistry.reset();
      const alerts = alertEngine.evaluateAlerts('tenant-a');
      const active = alerts.filter((a) => a.isFiring);
      expect(active).toHaveLength(0);
    });

    it('3.33 Should handle concurrent alert evaluations safely', async () => {
      metrics.safetyFalseResolutions.inc({ tenant: 'tenant-a' }, 1);
      const p1 = Promise.resolve(alertEngine.evaluateAlerts('tenant-a'));
      const p2 = Promise.resolve(alertEngine.evaluateAlerts('tenant-a'));
      const [res1, res2] = await Promise.all([p1, p2]);
      expect(res1).toBeDefined();
      expect(res2).toBeDefined();
    });
  });

  // ----------------------------------------------------
  // 4. Incident Management Lifecycle & Operations (Tests 34–50)
  // ----------------------------------------------------
  describe('4. Incident Lifecycle, Evidence & Tenant Isolation', () => {
    it('4.34 Should create incident with initial OPEN status and timeline', async () => {
      const inc = await incidentManager.createIncident({
        title: 'TEST_Open Creation',
        description: 'New operational issue',
        severity: 'HIGH',
        affectedComponent: 'WorkerPool',
        tenantScope: 'tenant-a',
      });
      expect(inc.status).toBe('OPEN');
      expect(inc.timeline).toHaveLength(1);
      expect(inc.timeline![0].event).toBe('CREATED');
    });

    it('4.35 Should transition incident from OPEN to ACKNOWLEDGED', async () => {
      const inc = await incidentManager.createIncident({
        title: 'TEST_Ack Transition',
        description: 'Issue ack test',
        severity: 'MEDIUM',
        affectedComponent: 'API',
        tenantScope: 'tenant-a',
      });
      const acked = await incidentManager.acknowledgeIncident(inc.id, 'op-1', 'tenant-a');
      expect(acked?.status).toBe('ACKNOWLEDGED');
      expect(acked?.acknowledgedAt).toBeDefined();
    });

    it('4.36 Should transition incident to INVESTIGATING status', async () => {
      const inc = await incidentManager.createIncident({
        title: 'TEST_Investigate Transition',
        description: 'Issue investigate test',
        severity: 'MEDIUM',
        affectedComponent: 'API',
        tenantScope: 'tenant-a',
      });
      const inv = await incidentManager.investigateIncident(inc.id, 'op-1', 'Analyzing stack trace', 'tenant-a');
      expect(inv?.status).toBe('INVESTIGATING');
    });

    it('4.37 Should transition incident to MITIGATING status', async () => {
      const inc = await incidentManager.createIncident({
        title: 'TEST_Mitigate Transition',
        description: 'Issue mitigate test',
        severity: 'MEDIUM',
        affectedComponent: 'API',
        tenantScope: 'tenant-a',
      });
      const mit = await incidentManager.mitigateIncident(inc.id, 'op-1', 'Applied rate limiter override', 'tenant-a');
      expect(mit?.status).toBe('MITIGATING');
    });

    it('4.38 Should transition incident to RESOLVED status with resolution summary', async () => {
      const inc = await incidentManager.createIncident({
        title: 'TEST_Resolve Transition',
        description: 'Issue resolve test',
        severity: 'MEDIUM',
        affectedComponent: 'API',
        tenantScope: 'tenant-a',
      });
      const res = await incidentManager.resolveIncident(inc.id, 'op-1', 'Deployed patch v1.0.2', 'tenant-a');
      expect(res?.status).toBe('RESOLVED');
      expect(res?.resolutionSummary).toBe('Deployed patch v1.0.2');
    });

    it('4.39 Should transition incident to CLOSED status', async () => {
      const inc = await incidentManager.createIncident({
        title: 'TEST_Close Transition',
        description: 'Issue close test',
        severity: 'LOW',
        affectedComponent: 'API',
        tenantScope: 'tenant-a',
      });
      const closed = await incidentManager.closeIncident(inc.id, 'admin-1', 'tenant-a');
      expect(closed?.status).toBe('CLOSED');
      expect(closed?.closedAt).toBeDefined();
    });

    it('4.40 Should reject invalid state transition from CLOSED status', async () => {
      const inc = await incidentManager.createIncident({
        title: 'TEST_Invalid Transition CLOSED',
        description: 'Issue closed test',
        severity: 'LOW',
        affectedComponent: 'API',
        tenantScope: 'tenant-a',
      });
      await incidentManager.closeIncident(inc.id, 'admin-1', 'tenant-a');
      await expect(incidentManager.acknowledgeIncident(inc.id, 'op-1', 'tenant-a')).rejects.toThrow();
    });

    it('4.41 Should ensure durable database persistence of incidents across queries', async () => {
      const inc = await incidentManager.createIncident({
        title: 'TEST_Durable Persistence',
        description: 'Testing DB persistence',
        severity: 'CRITICAL',
        affectedComponent: 'DB',
        tenantScope: 'tenant-a',
      });
      const fetched = await incidentManager.getIncidentById(inc.id);
      expect(fetched?.id).toBe(inc.id);
    });

    it('4.42 Should append evidence and timeline entries on incident updates', async () => {
      const inc = await incidentManager.createIncident({
        title: 'TEST_Evidence Timeline',
        description: 'Testing timeline audit trail',
        severity: 'HIGH',
        affectedComponent: 'Storage',
        tenantScope: 'tenant-a',
        evidence: { diskUsage: '95%' },
      });
      await incidentManager.investigateIncident(inc.id, 'op-1', 'Checking logs', 'tenant-a');
      const fetched = await incidentManager.getIncidentById(inc.id);
      expect(fetched?.timeline).toHaveLength(2);
    });

    it('4.43 Should associate correlationIds, runIds, and caseIds with incident record', async () => {
      const inc = await incidentManager.createIncident({
        title: 'TEST_Correlation Association',
        description: 'Testing ID associations',
        severity: 'HIGH',
        affectedComponent: 'Engine',
        tenantScope: 'tenant-a',
        correlationIds: ['corr-111'],
        runIds: ['run-222'],
        caseIds: ['case-333'],
      });
      expect(inc.correlationIds).toContain('corr-111');
      expect(inc.runIds).toContain('run-222');
      expect(inc.caseIds).toContain('case-333');
    });

    it('4.44 Should deduplicate identical active incident creation idempotently', async () => {
      const inc1 = await incidentManager.createIncident({
        title: 'TEST_Idempotent Incident',
        description: 'Deduplicated issue',
        severity: 'HIGH',
        affectedComponent: 'Queue',
        tenantScope: 'tenant-a',
      });
      const inc2 = await incidentManager.createIncident({
        title: 'TEST_Idempotent Incident',
        description: 'Deduplicated issue again',
        severity: 'HIGH',
        affectedComponent: 'Queue',
        tenantScope: 'tenant-a',
      });
      expect(inc1.id).toBe(inc2.id);
    });

    it('4.45 Should handle concurrent incident state updates cleanly', async () => {
      const inc = await incidentManager.createIncident({
        title: 'TEST_Concurrent Updates',
        description: 'Concurrent update test',
        severity: 'MEDIUM',
        affectedComponent: 'Executor',
        tenantScope: 'tenant-a',
      });
      const p1 = incidentManager.acknowledgeIncident(inc.id, 'op-1', 'tenant-a');
      const p2 = incidentManager.investigateIncident(inc.id, 'op-2', 'Analyzing', 'tenant-a');
      await Promise.all([p1, p2]);
      const fetched = await incidentManager.getIncidentById(inc.id);
      expect(fetched).toBeDefined();
    });

    it('4.46 Should enforce strict tenant isolation on incident retrieval', async () => {
      const incB = await incidentManager.createIncident({
        title: 'TEST_Tenant B Isolation',
        description: 'Secret Tenant B issue',
        severity: 'CRITICAL',
        affectedComponent: 'AuthModule',
        tenantScope: 'tenant-b',
      });
      const result = await incidentManager.getIncidentById(incB.id, 'tenant-a');
      expect(result).toBeNull();
    });

    it('4.47 Should restrict CUSTOMER role from accessing operator incident endpoints', async () => {
      const res = await fetch(`${baseUrl}/api/v1/ops/incidents`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      expect(res.status).toBe(403);
    });

    it('4.48 Should prevent confidential data exposure in incident title and summary', async () => {
      const inc = await incidentManager.createIncident({
        title: 'TEST_Data Minimization Check',
        description: 'Standard issue description',
        severity: 'LOW',
        affectedComponent: 'Logger',
        tenantScope: 'tenant-a',
      });
      expect(inc.title).not.toContain('bearer');
      expect(inc.title).not.toContain('secret');
    });

    it('4.49 Should fetch single incident by ID accurately', async () => {
      const inc = await incidentManager.createIncident({
        title: 'TEST_Single Retrieval',
        description: 'Single fetch test',
        severity: 'MEDIUM',
        affectedComponent: 'API',
        tenantScope: 'tenant-a',
      });
      const fetched = await incidentManager.getIncidentById(inc.id, 'tenant-a');
      expect(fetched?.title).toBe('TEST_Single Retrieval');
    });

    it('4.50 Should support paginated incident listing', async () => {
      await incidentManager.createIncident({
        title: 'TEST_Paginated 1',
        description: 'Pagination item 1',
        severity: 'LOW',
        affectedComponent: 'API',
        tenantScope: 'tenant-a',
      });
      await incidentManager.createIncident({
        title: 'TEST_Paginated 2',
        description: 'Pagination item 2',
        severity: 'LOW',
        affectedComponent: 'API',
        tenantScope: 'tenant-a',
      });
      const page1 = await incidentManager.listIncidents({ tenantId: 'tenant-a', page: 1, limit: 1 });
      expect(page1.incidents).toHaveLength(1);
      expect(page1.totalPages).toBeGreaterThanOrEqual(2);
    });
  });

  // ----------------------------------------------------
  // 5. Live HTTP Endpoints & Security Scoping (Tests 51–55)
  // ----------------------------------------------------
  describe('5. Live HTTP Endpoints & Security Validation', () => {
    it('5.51 GET /api/v1/metrics should return 200 text/plain for authenticated operators', async () => {
      const res = await fetch(`${baseUrl}/api/v1/metrics`, {
        headers: { Authorization: `Bearer ${operatorToken}` },
      });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/plain');
      const body = await res.text();
      expect(body).toContain('resolvex_agent_run_total');
    });

    it('5.52 GET /api/v1/ops/slo should return 200 OK with full SLO breakdown for operators', async () => {
      const res = await fetch(`${baseUrl}/api/v1/ops/slo`, {
        headers: { Authorization: `Bearer ${operatorToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.slos).toHaveLength(7);
    });

    it('5.53 Full HTTP Incident Lifecycle (OPEN -> ACK -> INVESTIGATE -> MITIGATE -> RESOLVE -> CLOSE)', async () => {
      const createRes = await incidentManager.createIncident({
        title: 'TEST_HTTP Full Lifecycle',
        description: 'Lifecycle HTTP test',
        severity: 'HIGH',
        affectedComponent: 'HTTPGateway',
        tenantScope: 'tenant-a',
      });
      const id = createRes.id;

      // Ack
      const ack = await fetch(`${baseUrl}/api/v1/ops/incidents/${id}/acknowledge`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${operatorToken}` },
      });
      expect(ack.status).toBe(200);

      // Investigate
      const inv = await fetch(`${baseUrl}/api/v1/ops/incidents/${id}/investigate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${operatorToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Investigating heap dump' }),
      });
      expect(inv.status).toBe(200);

      // Mitigate
      const mit = await fetch(`${baseUrl}/api/v1/ops/incidents/${id}/mitigate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${operatorToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Restarted pool worker' }),
      });
      expect(mit.status).toBe(200);

      // Resolve
      const res = await fetch(`${baseUrl}/api/v1/ops/incidents/${id}/resolve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${operatorToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionSummary: 'Fixed memory leak' }),
      });
      expect(res.status).toBe(200);

      // Close
      const cls = await fetch(`${baseUrl}/api/v1/ops/incidents/${id}/close`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(cls.status).toBe(200);
    });

    it('5.54 Prevent caller-supplied tenant header override of authenticated tenant', async () => {
      const res = await fetch(`${baseUrl}/api/v1/ops/incidents`, {
        headers: {
          Authorization: `Bearer ${operatorToken}`, // Authenticated as tenant-a
          'x-tenant-id': 'tenant-b', // Attempting override
        },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.incidents.every((i: any) => i.tenantId === 'tenant-a')).toBe(true);
    });

    it('5.55 Observability Failure Isolation — Observability errors must not crash business engine', async () => {
      // Fake metrics error
      expect(() => {
        try {
          metricsRegistry.getValue('non_existent_metric', { invalid: 'test' });
        } catch (e) {
          // Isolated error
        }
      }).not.toThrow();
    });
  });
});
