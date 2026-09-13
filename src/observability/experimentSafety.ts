/**
 * ResolveX Step 8 — Experiment & Canary Rollback Safety Controller
 * 
 * Supports safe optimization experiments:
 *  - Feature flags
 *  - Percentage rollout
 *  - Tenant-scoped canary rollout
 *  - Emergency rollback
 *  - Kill switch integration
 * 
 * NEVER performs uncontrolled production experimentation.
 */

export interface ExperimentRecord {
  experimentId: string;
  featureFlag: string;
  targetTenantId?: string;
  rolloutPercentage: number;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ROLLED_BACK';
  startTime: string;
  endTime?: string;
  metrics: {
    samplesEvaluated: number;
    successRatePct: number;
    latencyDeltaMs: number;
  };
}

export class ExperimentSafetyController {
  private static instance: ExperimentSafetyController;
  private experiments: Map<string, ExperimentRecord> = new Map();

  private constructor() {}

  public static getInstance(): ExperimentSafetyController {
    if (!ExperimentSafetyController.instance) {
      ExperimentSafetyController.instance = new ExperimentSafetyController();
    }
    return ExperimentSafetyController.instance;
  }

  public createExperiment(record: Omit<ExperimentRecord, 'status' | 'startTime' | 'metrics'>): ExperimentRecord {
    const exp: ExperimentRecord = {
      ...record,
      status: 'ACTIVE',
      startTime: new Date().toISOString(),
      metrics: {
        samplesEvaluated: 0,
        successRatePct: 100.0,
        latencyDeltaMs: 0,
      },
    };

    this.experiments.set(exp.experimentId, exp);
    return exp;
  }

  public getExperiment(id: string): ExperimentRecord | null {
    return this.experiments.get(id) || null;
  }

  public recordExperimentSample(id: string, success: boolean, latencyMs: number): void {
    const exp = this.experiments.get(id);
    if (!exp || exp.status !== 'ACTIVE') return;

    exp.metrics.samplesEvaluated++;
    if (!success) {
      exp.metrics.successRatePct = Number((((exp.metrics.samplesEvaluated - 1) * exp.metrics.successRatePct) / exp.metrics.samplesEvaluated).toFixed(2));
    }

    // Auto-trigger rollback if canary success rate drops below 90%
    if (exp.metrics.samplesEvaluated >= 5 && exp.metrics.successRatePct < 90.0) {
      this.rollbackExperiment(id, 'Auto-rollback triggered by canary degradation (success rate < 90%)');
    }
  }

  public rollbackExperiment(id: string, reason: string): { success: boolean; experiment?: ExperimentRecord; reason: string } {
    const exp = this.experiments.get(id);
    if (!exp) {
      return { success: false, reason: `Experiment '${id}' not found.` };
    }

    exp.status = 'ROLLED_BACK';
    exp.endTime = new Date().toISOString();
    this.experiments.set(id, exp);

    return {
      success: true,
      experiment: exp,
      reason: `Rolled back experiment '${id}': ${reason}`,
    };
  }

  public isFeatureEnabledForTenant(featureFlag: string, tenantId: string): boolean {
    for (const exp of this.experiments.values()) {
      if (exp.featureFlag === featureFlag && exp.status === 'ACTIVE') {
        if (!exp.targetTenantId || exp.targetTenantId === tenantId) {
          return true;
        }
      }
    }
    return false;
  }

  public reset(): void {
    this.experiments.clear();
    this.flags.clear();
    this.auditLogs.clear();
  }

  // Test & Control Plane API Compatibility Methods
  private flags: Map<string, { key: string; percentage: number; enabled: boolean; tenantIds?: string[]; rollbackReason?: string }> = new Map();
  private auditLogs: Map<string, any[]> = new Map();

  public setRollout(flagKey: string, percentage: number, enabled: boolean = true, tenantIds?: string[]): any {
    const item = { key: flagKey, percentage, enabled, tenantIds };
    this.flags.set(flagKey, item);

    const log = this.auditLogs.get(flagKey) || [];
    log.push({ action: 'SET_ROLLOUT', percentage, enabled, timestamp: new Date().toISOString() });
    this.auditLogs.set(flagKey, log);

    // Sync with experiment record
    this.createExperiment({
      experimentId: flagKey,
      featureFlag: flagKey,
      targetTenantId: tenantIds?.[0],
      rolloutPercentage: percentage
    });

    return item;
  }

  public isFeatureEnabled(flagKey: string, tenantId: string): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag || !flag.enabled || flag.percentage === 0) return false;
    if (flag.tenantIds && flag.tenantIds.length > 0) {
      return flag.tenantIds.includes(tenantId);
    }
    if (flag.percentage === 100) return true;
    
    // Hash tenantId to deterministic percentage bucket (0..99)
    let hash = 0;
    for (let i = 0; i < tenantId.length; i++) {
      hash = (hash * 31 + tenantId.charCodeAt(i)) % 100;
    }
    return hash < flag.percentage;
  }

  public recordExperimentMetric(flagKey: string, metrics: { errorRate?: number; p95LatencyMs?: number }): void {
    if ((metrics.errorRate && metrics.errorRate > 0.10) || (metrics.p95LatencyMs && metrics.p95LatencyMs > 4000)) {
      this.rollback(flagKey, 'system-guard', `Auto-rollback triggered by metric degradation (errorRate=${metrics.errorRate}, p95=${metrics.p95LatencyMs})`);
    }
  }

  public checkSafetyGuard(flagKey: string): { safe: boolean; autoRolledBack: boolean } {
    const flag = this.flags.get(flagKey);
    if (!flag || !flag.enabled) {
      return { safe: false, autoRolledBack: true };
    }
    return { safe: true, autoRolledBack: false };
  }

  public rollback(flagKey: string, actorId: string, reason: string): any {
    const flag = this.flags.get(flagKey);
    if (!flag) return null;

    flag.enabled = false;
    flag.percentage = 0;
    flag.rollbackReason = reason;

    const log = this.auditLogs.get(flagKey) || [];
    log.push({ action: 'ROLLBACK', actorId, reason, timestamp: new Date().toISOString() });
    this.auditLogs.set(flagKey, log);

    this.rollbackExperiment(flagKey, reason);
    return flag;
  }

  public getExperimentAudit(flagKey: string): any[] {
    return this.auditLogs.get(flagKey) || [];
  }

  public getAllFlags(): any[] {
    return Array.from(this.flags.values());
  }
}

