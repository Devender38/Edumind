/**
 * ResolveX Step 8 — Continuous Quality Intelligence
 * 
 * Aggregates operational quality metrics:
 *  - Resolution success rate
 *  - Clarification rate
 *  - Human escalation rate
 *  - Policy rejection rate
 *  - Verification failure rate
 *  - UNKNOWN_OUTCOME rate
 *  - Duplicate mutation rate (must remain 0%)
 *  - AI fallback rate
 *  - Prompt injection block rate
 */

export interface QualityReport {
  timestamp: string;
  totalEvaluatedRuns: number;
  resolutionSuccessRatePct: number;
  clarificationRatePct: number;
  humanEscalationRatePct: number;
  policyRejectionRatePct: number;
  verificationFailureRatePct: number;
  unknownOutcomeRatePct: number;
  duplicateMutationRatePct: number;
  aiFallbackRatePct: number;
  promptInjectionBlockRatePct: number;
  safetyStatus: 'COMPLIANT' | 'DEGRADED' | 'VIOLATED';
}

export class QualityIntelligence {
  private static instance: QualityIntelligence;

  private totalRuns: number = 0;
  private resolvedRuns: number = 0;
  private clarificationRuns: number = 0;
  private humanEscalatedRuns: number = 0;
  private policyRejectedRuns: number = 0;
  private verificationFailures: number = 0;
  private unknownOutcomes: number = 0;
  private duplicateMutations: number = 0;
  private aiFallbacks: number = 0;
  private promptInjectionsBlocked: number = 0;

  private constructor() {}

  public static getInstance(): QualityIntelligence {
    if (!QualityIntelligence.instance) {
      QualityIntelligence.instance = new QualityIntelligence();
    }
    return QualityIntelligence.instance;
  }

  public recordRunOutcome(outcome: {
    resolved?: boolean;
    clarification?: boolean;
    humanEscalated?: boolean;
    policyRejected?: boolean;
    verificationFailed?: boolean;
    unknownOutcome?: boolean;
    duplicateMutation?: boolean;
    aiFallback?: boolean;
    promptInjectionBlocked?: boolean;
  }): void {
    this.totalRuns++;
    if (outcome.resolved) this.resolvedRuns++;
    if (outcome.clarification) this.clarificationRuns++;
    if (outcome.humanEscalated) this.humanEscalatedRuns++;
    if (outcome.policyRejected) this.policyRejectedRuns++;
    if (outcome.verificationFailed) this.verificationFailures++;
    if (outcome.unknownOutcome) this.unknownOutcomes++;
    if (outcome.duplicateMutation) this.duplicateMutations++;
    if (outcome.aiFallback) this.aiFallbacks++;
    if (outcome.promptInjectionBlocked) this.promptInjectionsBlocked++;
  }

  public generateReport(): QualityReport {
    const total = Math.max(1, this.totalRuns);

    const resolutionSuccessRate = (this.resolvedRuns / total) * 100;
    const clarificationRate = (this.clarificationRuns / total) * 100;
    const humanEscalationRate = (this.humanEscalatedRuns / total) * 100;
    const policyRejectionRate = (this.policyRejectedRuns / total) * 100;
    const verificationFailureRate = (this.verificationFailures / total) * 100;
    const unknownOutcomeRate = (this.unknownOutcomes / total) * 100;
    const duplicateMutationRate = (this.duplicateMutations / total) * 100;
    const aiFallbackRate = (this.aiFallbacks / total) * 100;
    const promptInjectionBlockRate = (this.promptInjectionsBlocked / total) * 100;

    let safetyStatus: 'COMPLIANT' | 'DEGRADED' | 'VIOLATED' = 'COMPLIANT';
    if (this.duplicateMutations > 0 || unknownOutcomeRate > 5.0) {
      safetyStatus = 'VIOLATED';
    } else if (verificationFailureRate > 10.0 || aiFallbackRate > 25.0) {
      safetyStatus = 'DEGRADED';
    }

    return {
      timestamp: new Date().toISOString(),
      totalEvaluatedRuns: this.totalRuns,
      resolutionSuccessRatePct: Number(resolutionSuccessRate.toFixed(2)),
      clarificationRatePct: Number(clarificationRate.toFixed(2)),
      humanEscalationRatePct: Number(humanEscalationRate.toFixed(2)),
      policyRejectionRatePct: Number(policyRejectionRate.toFixed(2)),
      verificationFailureRatePct: Number(verificationFailureRate.toFixed(2)),
      unknownOutcomeRatePct: Number(unknownOutcomeRate.toFixed(2)),
      duplicateMutationRatePct: Number(duplicateMutationRate.toFixed(2)),
      aiFallbackRatePct: Number(aiFallbackRate.toFixed(2)),
      promptInjectionBlockRatePct: Number(promptInjectionBlockRate.toFixed(2)),
      safetyStatus,
    };
  }

  public reset(): void {
    this.totalRuns = 0;
    this.resolvedRuns = 0;
    this.clarificationRuns = 0;
    this.humanEscalatedRuns = 0;
    this.policyRejectedRuns = 0;
    this.verificationFailures = 0;
    this.unknownOutcomes = 0;
    this.duplicateMutations = 0;
    this.aiFallbacks = 0;
    this.promptInjectionsBlocked = 0;
  }
}

export class QualityIntelligenceEngine {
  private static instance: QualityIntelligenceEngine;
  private tenantOutcomes: Map<string, any> = new Map();
  private totalRunsRecorded = 0;

  private constructor() {}

  public static getInstance(): QualityIntelligenceEngine {
    if (!QualityIntelligenceEngine.instance) {
      QualityIntelligenceEngine.instance = new QualityIntelligenceEngine();
    }
    return QualityIntelligenceEngine.instance;
  }

  public reset(): void {
    this.tenantOutcomes.clear();
    this.totalRunsRecorded = 0;
    QualityIntelligence.getInstance().reset();
  }

  public recordRunOutcome(
    tenantIdOrString: string,
    outcomeType?: 'SUCCESS' | 'CLARIFICATION_NEEDED' | 'HUMAN_ESCALATION' | 'POLICY_REJECTION' | 'VERIFICATION_FAILURE' | 'UNKNOWN_OUTCOME' | 'DUPLICATE_MUTATION_PREVENTED'
  ): void {
    let tenantId = tenantIdOrString;
    let type = outcomeType;
    if (!type) {
      // Called with (outcomeObj)
      QualityIntelligence.getInstance().recordRunOutcome(tenantIdOrString as any);
      return;
    }

    this.totalRunsRecorded++;
    let stats = this.tenantOutcomes.get(tenantId);
    if (!stats) {
      stats = {
        totalRuns: 0,
        successCount: 0,
        clarificationCount: 0,
        escalationCount: 0,
        policyRejectionCount: 0,
        verificationFailureCount: 0,
        unknownOutcomeCount: 0,
        duplicateMutationPreventedCount: 0
      };
      this.tenantOutcomes.set(tenantId, stats);
    }

    stats.totalRuns++;
    if (type === 'SUCCESS') stats.successCount++;
    if (type === 'CLARIFICATION_NEEDED') stats.clarificationCount++;
    if (type === 'HUMAN_ESCALATION') stats.escalationCount++;
    if (type === 'POLICY_REJECTION') stats.policyRejectionCount++;
    if (type === 'VERIFICATION_FAILURE') stats.verificationFailureCount++;
    if (type === 'UNKNOWN_OUTCOME') stats.unknownOutcomeCount++;
    if (type === 'DUPLICATE_MUTATION_PREVENTED') stats.duplicateMutationPreventedCount++;

    QualityIntelligence.getInstance().recordRunOutcome({
      resolved: type === 'SUCCESS',
      clarification: type === 'CLARIFICATION_NEEDED',
      humanEscalated: type === 'HUMAN_ESCALATION',
      policyRejected: type === 'POLICY_REJECTION',
      verificationFailed: type === 'VERIFICATION_FAILURE',
      unknownOutcome: type === 'UNKNOWN_OUTCOME',
      duplicateMutation: type === 'DUPLICATE_MUTATION_PREVENTED'
    });
  }

  public getQualityMetrics(tenantId: string): any {
    const stats = this.tenantOutcomes.get(tenantId) || {
      totalRuns: 0,
      successCount: 0,
      clarificationCount: 0,
      escalationCount: 0,
      policyRejectionCount: 0,
      verificationFailureCount: 0,
      unknownOutcomeCount: 0,
      duplicateMutationPreventedCount: 0
    };

    const total = Math.max(1, stats.totalRuns);
    return {
      ...stats,
      successRate: stats.totalRuns === 0 ? 0 : stats.successCount / stats.totalRuns,
      clarificationRatio: stats.clarificationCount / total,
      escalationRatio: stats.escalationCount / total
    };
  }

  public getGlobalQualitySummary(): { totalRunsRecorded: number } {
    return { totalRunsRecorded: this.totalRunsRecorded };
  }
}

