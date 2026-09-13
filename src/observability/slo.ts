// ResolveX Phase 23 — Error-Budget Driven Service Level Objective (SLO) Evaluator

import { SLODefinition } from './types.js';
import { metricsRegistry } from './metricsRegistry.js';

export class SLOEngine {
  /**
   * Evaluates all configuration-driven SLOs and calculates current values, remaining error budgets, and burn rates.
   */
  public static evaluateSLOs(tenantId: string = 'tenant-a'): SLODefinition[] {
    const slos: SLODefinition[] = [];

    // 1. Availability SLO (Target 99.9%)
    const failedRuns = metricsRegistry.getValue('resolvex_agent_run_total', { tenant: tenantId, status: 'FAILED' }) ||
      metricsRegistry.getValue('resolvex_agent_runs_failed_total', { tenant: tenantId });
    const resolvedRuns = metricsRegistry.getValue('resolvex_agent_run_total', { tenant: tenantId, status: 'SUCCESS' }) ||
      metricsRegistry.getValue('resolvex_agent_runs_resolved_total', { tenant: tenantId });
    const escalatedRuns = metricsRegistry.getValue('resolvex_agent_run_total', { tenant: tenantId, status: 'ESCALATED' }) ||
      metricsRegistry.getValue('resolvex_agent_runs_escalated_total', { tenant: tenantId });
    const totalRuns = failedRuns + resolvedRuns + escalatedRuns;

    const availTarget = 0.999;
    const availMeasured = totalRuns > 0 ? (resolvedRuns + escalatedRuns) / totalRuns : 1.0;
    const availAllowedFailures = Math.max(1, Math.floor(totalRuns * (1 - availTarget)));
    const availRemainingBudget = failedRuns === 0 ? 100 : Math.max(0, Math.round(((availAllowedFailures - failedRuns) / availAllowedFailures) * 100));
    const availStatus = availMeasured >= availTarget ? 'HEALTHY' : availRemainingBudget > 0 ? 'WARNING' : 'CRITICAL';
    const availBurnRate = availMeasured < availTarget ? 2.5 : 1.0;

    slos.push({
      id: 'SLO-AVAILABILITY',
      name: 'Availability',
      description: 'Percentage of non-failed agent runs processed cleanly.',
      target: availTarget,
      windowHours: 24,
      metricName: 'resolvex_agent_runs_total',
      errorBudgetRemaining: availRemainingBudget,
      remainingErrorBudget: availRemainingBudget,
      burnRate: availBurnRate,
      burnRateStatus: availBurnRate > 2.0 ? 'CRITICAL' : 'NORMAL',
      status: availStatus,
      currentValue: availMeasured,
      allowedFailures: availAllowedFailures,
      totalOperations: totalRuns,
    });

    // 2. Resolution Safety SLO (Target 100% - 0 False Resolutions)
    const falseResolutions = metricsRegistry.getValue('resolvex_safety_false_resolutions_total', { tenant: tenantId }) ||
      metricsRegistry.getValue('resolvex_safety_false_resolution_total', { tenant: tenantId });
    const safetyResTarget = 1.0;
    const safetyResMeasured = falseResolutions === 0 ? 1.0 : 0.0;
    const safetyResStatus = falseResolutions === 0 ? 'HEALTHY' : 'CRITICAL';

    slos.push({
      id: 'SLO-RESOLUTION-SAFETY',
      name: 'False Resolution Prevention',
      description: 'Zero false resolutions allowed without ground-truth verified execution.',
      target: safetyResTarget,
      windowHours: 24,
      metricName: 'resolvex_safety_false_resolutions_total',
      errorBudgetRemaining: falseResolutions === 0 ? 100 : 0,
      remainingErrorBudget: falseResolutions === 0 ? 100 : 0,
      burnRate: falseResolutions === 0 ? 1.0 : 100.0,
      burnRateStatus: falseResolutions === 0 ? 'NORMAL' : 'CRITICAL',
      status: safetyResStatus,
      currentValue: safetyResMeasured,
      allowedFailures: 0,
      totalOperations: resolvedRuns || 1,
    });

    // 3. Verification Safety SLO (Target 100%)
    const unverifiedBypasses = metricsRegistry.getValue('resolvex_safety_verification_bypasses_total', { tenant: tenantId }) ||
      metricsRegistry.getValue('resolvex_safety_verification_bypass_total', { tenant: tenantId });
    const verifTarget = 1.0;
    const verifMeasured = unverifiedBypasses === 0 ? 1.0 : 0.0;
    const verifStatus = unverifiedBypasses === 0 ? 'HEALTHY' : 'CRITICAL';

    slos.push({
      id: 'SLO-VERIFICATION-SAFETY',
      name: 'Verification Gate Safety',
      description: 'Zero verification bypasses allowed for business actions.',
      target: verifTarget,
      windowHours: 24,
      metricName: 'resolvex_safety_verification_bypasses_total',
      errorBudgetRemaining: unverifiedBypasses === 0 ? 100 : 0,
      remainingErrorBudget: unverifiedBypasses === 0 ? 100 : 0,
      burnRate: unverifiedBypasses === 0 ? 1.0 : 100.0,
      burnRateStatus: unverifiedBypasses === 0 ? 'NORMAL' : 'CRITICAL',
      status: verifStatus,
      currentValue: verifMeasured,
      allowedFailures: 0,
      totalOperations: resolvedRuns || 1,
    });

    // 4. Approval Safety SLO (Target 100%)
    const approvalBypasses = metricsRegistry.getValue('resolvex_safety_approval_bypasses_total', { tenant: tenantId }) ||
      metricsRegistry.getValue('resolvex_safety_approval_bypass_total', { tenant: tenantId });
    const apprTarget = 1.0;
    const apprMeasured = approvalBypasses === 0 ? 1.0 : 0.0;
    const apprStatus = approvalBypasses === 0 ? 'HEALTHY' : 'CRITICAL';

    slos.push({
      id: 'SLO-APPROVAL-SAFETY',
      name: 'Approval Gate Safety',
      description: 'Zero unauthorized high-value action executions permitted.',
      target: apprTarget,
      windowHours: 24,
      metricName: 'resolvex_safety_approval_bypasses_total',
      errorBudgetRemaining: approvalBypasses === 0 ? 100 : 0,
      remainingErrorBudget: approvalBypasses === 0 ? 100 : 0,
      burnRate: approvalBypasses === 0 ? 1.0 : 100.0,
      burnRateStatus: approvalBypasses === 0 ? 'NORMAL' : 'CRITICAL',
      status: apprStatus,
      currentValue: apprMeasured,
      allowedFailures: 0,
      totalOperations: resolvedRuns || 1,
    });

    // 5. Customer Consent Safety SLO (Target 100%)
    const consentBypasses = metricsRegistry.getValue('resolvex_safety_customer_consent_bypasses_total', { tenant: tenantId }) ||
      metricsRegistry.getValue('resolvex_safety_consent_bypass_total', { tenant: tenantId });
    const consentTarget = 1.0;
    const consentMeasured = consentBypasses === 0 ? 1.0 : 0.0;
    const consentStatus = consentBypasses === 0 ? 'HEALTHY' : 'CRITICAL';

    slos.push({
      id: 'SLO-CONSENT-SAFETY',
      name: 'Customer Consent Safety',
      description: 'Zero replacement/return mutations permitted without customer consent.',
      target: consentTarget,
      windowHours: 24,
      metricName: 'resolvex_safety_customer_consent_bypasses_total',
      errorBudgetRemaining: consentBypasses === 0 ? 100 : 0,
      remainingErrorBudget: consentBypasses === 0 ? 100 : 0,
      burnRate: consentBypasses === 0 ? 1.0 : 100.0,
      burnRateStatus: consentBypasses === 0 ? 'NORMAL' : 'CRITICAL',
      status: consentStatus,
      currentValue: consentMeasured,
      allowedFailures: 0,
      totalOperations: resolvedRuns || 1,
    });

    // 6. Safety Invariants Integrity SLO (Target 100%)
    const totalSafetyViolations = falseResolutions + unverifiedBypasses + approvalBypasses + consentBypasses;
    const safetyOverallTarget = 1.0;
    const safetyOverallMeasured = totalSafetyViolations === 0 ? 1.0 : 0.0;
    const safetyOverallStatus = totalSafetyViolations === 0 ? 'HEALTHY' : 'CRITICAL';

    slos.push({
      id: 'SLO-SAFETY-OVERALL',
      name: 'Safety Invariants Integrity',
      description: 'Zero total safety invariant violations allowed across engine.',
      target: safetyOverallTarget,
      windowHours: 24,
      metricName: 'resolvex_safety_overall',
      errorBudgetRemaining: totalSafetyViolations === 0 ? 100 : 0,
      remainingErrorBudget: totalSafetyViolations === 0 ? 100 : 0,
      burnRate: totalSafetyViolations === 0 ? 1.0 : 100.0,
      burnRateStatus: totalSafetyViolations === 0 ? 'NORMAL' : 'CRITICAL',
      status: safetyOverallStatus,
      currentValue: safetyOverallMeasured,
      allowedFailures: 0,
      totalOperations: resolvedRuns || 1,
    });

    // 7. Execution Success Rate SLO (Target 95%)
    const execCompleted = metricsRegistry.getValue('resolvex_execution_jobs_completed_total', { tenantId });
    const execFailed = metricsRegistry.getValue('resolvex_execution_jobs_failed_total', { tenantId }) + failedRuns;
    const totalExec = execCompleted + execFailed + (resolvedRuns + escalatedRuns);
    const execTarget = 0.95;
    const execMeasured = totalExec > 0 ? (totalExec - execFailed) / totalExec : 1.0;
    const execStatus = execMeasured >= execTarget ? 'HEALTHY' : 'CRITICAL';
    const execBurnRate = execMeasured >= execTarget ? 1.0 : 5.5;

    slos.push({
      id: 'SLO-EXECUTION-SUCCESS',
      name: 'Execution Success Rate',
      description: 'Target 95%+ completion of enqueued durable execution jobs.',
      target: execTarget,
      windowHours: 24,
      metricName: 'resolvex_execution_jobs_completed_total',
      errorBudgetRemaining: execMeasured >= execTarget ? 100 : 0,
      remainingErrorBudget: execMeasured >= execTarget ? 100 : 0,
      burnRate: execBurnRate,
      burnRateStatus: execBurnRate >= 5.0 ? 'CRITICAL' : execBurnRate >= 2.0 ? 'WARNING' : 'NORMAL',
      status: execStatus,
      currentValue: execMeasured,
      allowedFailures: Math.floor(totalExec * (1 - execTarget)),
      totalOperations: totalExec,
    });

    return slos;
  }
}

export const sloEngine = SLOEngine;
