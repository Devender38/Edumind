// ResolveX Phase 23 — Deduplicated Alert Engine & Safety Fingerprinting

import crypto from 'crypto';
import { AlertDefinition, AlertStateRecord, AlertSeverity, AlertStatus } from './types.js';
import { metricsRegistry } from './metricsRegistry.js';
import { prisma } from '../db/client.js';

export class AlertEngine {
  private static alertDefinitions: AlertDefinition[] = [
    // 1. Safety Alerts (Highest Priority - Immediate Fingerprint Firing)
    {
      id: 'ALERT-SAFETY-FALSE-RESOLUTION',
      name: 'SafetyInvariantViolation',
      severity: 'CRITICAL',
      metricName: 'resolvex_safety_false_resolutions_total',
      condition: 'GT',
      threshold: 0,
      windowMinutes: 1,
      enabled: true,
      affectedComponent: 'RESOLUTION_SAFETY_GATE',
      isSafetyAlert: true,
    },
    {
      id: 'ALERT-SAFETY-APPROVAL-BYPASS',
      name: 'SafetyInvariantViolation',
      severity: 'CRITICAL',
      metricName: 'resolvex_safety_approval_bypasses_total',
      condition: 'GT',
      threshold: 0,
      windowMinutes: 1,
      enabled: true,
      affectedComponent: 'APPROVAL_GOVERNANCE_GATE',
      isSafetyAlert: true,
    },
    {
      id: 'ALERT-SAFETY-CONSENT-BYPASS',
      name: 'SafetyInvariantViolation',
      severity: 'CRITICAL',
      metricName: 'resolvex_safety_customer_consent_bypasses_total',
      condition: 'GT',
      threshold: 0,
      windowMinutes: 1,
      enabled: true,
      affectedComponent: 'CUSTOMER_CONSENT_GATE',
      isSafetyAlert: true,
    },
    {
      id: 'ALERT-SAFETY-DUPLICATE-MUTATION',
      name: 'SafetyInvariantViolation',
      severity: 'CRITICAL',
      metricName: 'resolvex_safety_duplicate_mutations_total',
      condition: 'GT',
      threshold: 0,
      windowMinutes: 1,
      enabled: true,
      affectedComponent: 'ACTION_EXECUTOR_IDEMPOTENCY',
      isSafetyAlert: true,
    },

    // 2. Operational & Execution Alerts
    {
      id: 'ALERT-EXEC-FAILURES-HIGH',
      name: 'Elevated Durable Execution Job Failure Rate',
      severity: 'WARNING',
      metricName: 'resolvex_execution_jobs_failed_total',
      condition: 'GTE',
      threshold: 5,
      windowMinutes: 5,
      enabled: true,
      affectedComponent: 'EXECUTION_COORDINATOR',
    },
    {
      id: 'ALERT-WORKER-LEASE-EXPIRATIONS',
      name: 'High Worker Lease Expiration Rate',
      severity: 'WARNING',
      metricName: 'resolvex_worker_lease_expirations_total',
      condition: 'GTE',
      threshold: 3,
      windowMinutes: 5,
      enabled: true,
      affectedComponent: 'WORKER_POOL',
    },
  ];

  /**
   * Generates a deterministic alert fingerprint SHA-256 hex string.
   */
  public static computeFingerprint(defId: string, tenantId: string, component: string): string {
    return crypto.createHash('sha256').update(`${defId}:${tenantId}:${component}`).digest('hex');
  }

  /**
   * Evaluates all registered alert definitions for a tenant.
   */
  public static evaluateAlerts(tenantId: string = 'tenant-a'): AlertStateRecord[] {
    const activeAlerts: AlertStateRecord[] = [];

    for (const def of AlertEngine.alertDefinitions) {
      if (!def.enabled) continue;

      let metricVal = metricsRegistry.getValue(def.metricName, { tenant: tenantId });
      if (metricVal === 0 && def.metricName.includes('bypasses')) {
        // Fallback check without tenant label
        metricVal = metricsRegistry.getValue(def.metricName);
      }

      let isTriggered = false;

      switch (def.condition) {
        case 'GT':
          isTriggered = metricVal > def.threshold;
          break;
        case 'GTE':
          isTriggered = metricVal >= def.threshold;
          break;
        case 'LT':
          isTriggered = metricVal < def.threshold;
          break;
        case 'LTE':
          isTriggered = metricVal <= def.threshold;
          break;
        case 'EQ':
          isTriggered = metricVal === def.threshold;
          break;
      }

      const fingerprint = AlertEngine.computeFingerprint(def.id, tenantId, def.affectedComponent);

      activeAlerts.push({
        id: `alert-rec-${def.id}`,
        tenantId,
        fingerprint,
        alertKey: def.id,
        definitionName: def.name,
        severity: def.severity,
        status: isTriggered ? def.severity : 'NORMAL',
        isFiring: isTriggered,
        lastFiredAt: new Date().toISOString(),
        resolvedAt: isTriggered ? null : new Date().toISOString(),
      });
    }

    return activeAlerts;
  }

  public static getDefinitions(): AlertDefinition[] {
    return AlertEngine.alertDefinitions;
  }
}

export const alertEngine = AlertEngine;
