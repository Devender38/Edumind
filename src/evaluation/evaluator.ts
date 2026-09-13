// ResolveX Core Evaluation & Quality Benchmark Engine — Phase 15

import { AgentOrchestrator } from '../agents/orchestrator/AgentOrchestrator.js';
import { AgentStateRepository } from '../db/repositories/agentStateRepository.js';
import { prisma } from '../db/client.js';
import { seedDatabase } from '../db/seedDatabase.js';
import { FailureInjector } from '../utils/failureInjector.js';
import { GOLDEN_DATASET, DATASET_VERSION } from './dataset.js';
import { SafetyHarness } from './harness.js';
import { DeterminismEvaluator } from './determinism.js';
import { AIProviderRegistry } from '../ai/providers/AIProviderRegistry.js';
import { AIProviderMode } from '../ai/types/AITypes.js';
import {
  GroundTruthCase,
  CaseEvaluationResult,
  EvaluationMetrics,
  EvaluationReport,
  PerformanceMetrics,
} from './types.js';

export class EvaluationRunner {
  private static cachedLatestReport: EvaluationReport | null = null;

  public static getLatestReport(): EvaluationReport | null {
    return this.cachedLatestReport;
  }

  /**
   * Executes full evaluation suite against the golden dataset
   */
  public static async runEvaluation(
    dataset: GroundTruthCase[] = GOLDEN_DATASET,
    options?: { runDeterminism?: boolean; determinismRuns?: number }
  ): Promise<EvaluationReport> {
    const evaluationId = `eval-${Date.now()}`;
    const startTime = Date.now();
    const caseResults: CaseEvaluationResult[] = [];

    // Ensure AI registry is reset to SANDBOX mode for deterministic evaluation
    AIProviderRegistry.getInstance().resetAll();
    AIProviderRegistry.getInstance().setMode(AIProviderMode.AI_SANDBOX);

    // Ensure baseline DB state before starting evaluation
    await seedDatabase();

    for (const testCase of dataset) {
      // 1. Database Isolation: Seed DB prior to every evaluation case
      await seedDatabase().catch(() => null);
      await new Promise((r) => setTimeout(r, 10));
      FailureInjector.reset();

      // 2. Setup Failure Injection if configured for test case
      if (testCase.input.failureInjection) {
        const fi = testCase.input.failureInjection;
        FailureInjector.enable({
          point: fi.point as any,
          target: fi.target,
          failOnce: fi.failOnce ?? true,
        });
      }

      const caseStart = Date.now();
      let orchResult: any = null;
      let executionError: any = null;

      // 3. Execute Case via Real Agent Orchestrator
      try {
        orchResult = await AgentOrchestrator.run({
          ticketId: testCase.input.ticketId,
          orderId: testCase.input.orderId,
          customerId: testCase.input.customerId,
          message: testCase.input.message,
          approvalToken: testCase.input.approvalToken,
          customerConsentGiven: testCase.input.customerConsentGiven,
          idempotencyKey: testCase.input.idempotencyKey || `eval-${testCase.id}-${Date.now()}`,
        });
      } catch (err: any) {
        executionError = err;
      } finally {
        FailureInjector.reset();
      }

      const durationMs = Date.now() - caseStart;
      const agentRunId = orchResult?.agentRunId;

      // 4. Ground-Truth Database Inspection for Actual Mutation & State Verification
      let actualMutations = 0;
      let actualVerificationStatus = orchResult?.execution?.verificationStatus || 'NONE';

      if (testCase.input.orderId) {
        const refundCount = await prisma.refundTransaction.count({ where: { orderId: testCase.input.orderId } });
        const replacementCount = await prisma.order.count({ where: { shippingStatus: 'PROCESSING', totalAmount: { gt: 0 } } });
        actualMutations = refundCount + replacementCount;
      }

      // If AgentRun was created, read DB state metrics
      let runSummary: any = null;
      if (agentRunId) {
        runSummary = await AgentStateRepository.getOperatorRunDetail(agentRunId).catch(() => null);
        if (runSummary?.mutations) {
          actualMutations = runSummary.mutations.executed;
        }
      }

      const actualStatus = orchResult?.status || (executionError ? 'FAILED' : 'UNKNOWN');
      const actualIntent = orchResult?.intent?.issueType;
      const actualPolicyEligible = orchResult?.decision?.decision ? orchResult.decision.decision !== 'BLOCKED' : (orchResult?.investigation?.policyEligible ?? true);
      const actualSelectedAction = orchResult?.decision?.selectedAction;
      const actualReplanCount = orchResult?.replanCount || 0;
      const actualToolAttempts = orchResult?.execution?.toolAttempts || 1;

      // 5. Evaluate Granular Step Accuracy Matches
      const intentMatched = !testCase.expected.intentIssueType || actualIntent === testCase.expected.intentIssueType;
      const policyMatched = testCase.expected.policyEligible === undefined || actualPolicyEligible === testCase.expected.policyEligible;
      const decisionMatched = !testCase.expected.selectedAction || actualSelectedAction === testCase.expected.selectedAction;
      const actionMatched = actualStatus !== 'FAILED';
      const resolutionMatched = actualStatus === testCase.expected.finalStatus;
      const verificationMatched = !testCase.expected.verificationStatus || actualVerificationStatus === testCase.expected.verificationStatus;

      const casePassed = intentMatched && policyMatched && decisionMatched && resolutionMatched && (actualMutations === testCase.expected.expectedMutations);

      // 6. Validate Safety Invariants via SafetyHarness
      const { safetyViolated, violations } = SafetyHarness.validateCaseSafety(
        actualStatus,
        actualMutations,
        testCase.expected.approvalRequired || false,
        testCase.expected.consentRequired || false,
        Boolean(testCase.input.approvalToken),
        Boolean(testCase.input.customerConsentGiven),
        actualVerificationStatus,
        actualReplanCount,
        actualToolAttempts
      );

      caseResults.push({
        caseId: testCase.id,
        caseName: testCase.name,
        category: testCase.category,
        passed: casePassed && !safetyViolated,
        durationMs,
        intentMatched,
        policyMatched,
        decisionMatched,
        actionMatched,
        resolutionMatched,
        verificationMatched,
        actualIntent,
        actualPolicyEligible,
        actualSelectedAction,
        actualStatus,
        actualMutations,
        actualVerificationStatus,
        actualReplanCount,
        actualToolAttempts,
        safetyViolated,
        safetyViolations: violations,
        failureReason: !casePassed ? `Expected status '${testCase.expected.finalStatus}' but got '${actualStatus}' (Mutations: ${actualMutations}/${testCase.expected.expectedMutations})` : undefined,
        correlationId: orchResult?.correlationId,
        agentRunId,
      });
    }

    const totalDurationMs = Date.now() - startTime;

    // 7. Calculate Aggregate Quality Metrics
    const totalCases = caseResults.length;
    const passedCases = caseResults.filter((c) => c.passed).length;
    const failedCases = totalCases - passedCases;

    const intentAccuracy = Math.round((caseResults.filter((c) => c.intentMatched).length / totalCases) * 100);
    const policyAccuracy = Math.round((caseResults.filter((c) => c.policyMatched).length / totalCases) * 100);
    const decisionAccuracy = Math.round((caseResults.filter((c) => c.decisionMatched).length / totalCases) * 100);
    const actionAccuracy = Math.round((caseResults.filter((c) => c.actionMatched).length / totalCases) * 100);
    const resolutionAccuracy = Math.round((caseResults.filter((c) => c.resolutionMatched).length / totalCases) * 100);

    const safeResolvedCount = caseResults.filter((c) => c.actualStatus === 'RESOLVED' && !c.safetyViolated).length;
    const totalResolvedCount = caseResults.filter((c) => c.actualStatus === 'RESOLVED').length;
    const safeResolutionRate = totalResolvedCount > 0 ? Math.round((safeResolvedCount / totalResolvedCount) * 100) : 100;

    const safeEscalatedCount = caseResults.filter((c) => c.actualStatus === 'ESCALATED' && !c.safetyViolated).length;
    const totalEscalatedCount = caseResults.filter((c) => c.actualStatus === 'ESCALATED').length;
    const safeEscalationRate = totalEscalatedCount > 0 ? Math.round((safeEscalatedCount / totalEscalatedCount) * 100) : 100;

    const toolFailureCases = caseResults.filter((c) => c.category === 'TOOL_FAILURE' || c.category === 'ACTION_AMBIGUITY');
    const recoverySuccessRate = toolFailureCases.length > 0 ? Math.round((toolFailureCases.filter((c) => c.passed).length / toolFailureCases.length) * 100) : 100;

    const retryExhaustionRate = Math.round((caseResults.filter((c) => c.category === 'RETRY_EXHAUSTION').length / totalCases) * 100);

    const meanToolAttempts = Number((caseResults.reduce((acc, c) => acc + c.actualToolAttempts, 0) / totalCases).toFixed(2));
    const meanReplanAttempts = Number((caseResults.reduce((acc, c) => acc + c.actualReplanCount, 0) / totalCases).toFixed(2));

    // 8. Determinism Evaluation (5 repeated runs per critical case if enabled)
    let determinismRate = 100;
    if (options?.runDeterminism !== false) {
      const sampleCase = dataset[0];
      const detRes = await DeterminismEvaluator.evaluateCaseDeterminism(
        sampleCase.id,
        sampleCase.input.message,
        sampleCase.input.ticketId,
        sampleCase.input.orderId,
        sampleCase.input.approvalToken,
        sampleCase.input.customerConsentGiven,
        options?.determinismRuns || 5
      );
      determinismRate = detRes.deterministic ? 100 : 0;
    }

    // 9. Calculate Safety Score
    const safetyScore = await SafetyHarness.evaluateAggregateSafetyScore(caseResults);

    // 10. Performance Metrics
    const sortedDurations = [...caseResults.map((c) => c.durationMs)].sort((a, b) => a - b);
    const averageCaseDurationMs = Math.round(totalDurationMs / totalCases);
    const p95Index = Math.floor(totalCases * 0.95);
    const p95CaseDurationMs = sortedDurations[p95Index] || sortedDurations[totalCases - 1] || 0;
    const slowestCases = [...caseResults]
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, 3)
      .map((c) => ({ caseId: c.caseId, durationMs: c.durationMs }));

    const metrics: EvaluationMetrics = {
      totalCases,
      passedCases,
      failedCases,
      intentAccuracy,
      policyAccuracy,
      decisionAccuracy,
      actionAccuracy,
      resolutionAccuracy,
      safeResolutionRate,
      safeEscalationRate,
      recoverySuccessRate,
      retryExhaustionRate,
      meanToolAttempts,
      meanReplanAttempts,
      determinismRate,
    };

    const performance: PerformanceMetrics = {
      totalDurationMs,
      averageCaseDurationMs,
      p95CaseDurationMs,
      slowestCases,
    };

    const report: EvaluationReport = {
      evaluationId,
      timestamp: new Date().toISOString(),
      datasetVersion: DATASET_VERSION,
      summary: {
        totalCases,
        passedCases,
        failedCases,
        passPercentage: Math.round((passedCases / totalCases) * 100),
        safetyStatus: safetyScore.status,
      },
      metrics,
      safetyScore,
      performance,
      failures: caseResults
        .filter((c) => !c.passed)
        .map((c) => ({
          caseId: c.caseId,
          caseName: c.caseName,
          category: c.category,
          failureReason: c.failureReason || 'Evaluation assertion failed',
          safetyViolated: c.safetyViolated,
          actualStatus: c.actualStatus,
          expectedStatus: dataset.find((d) => d.id === c.caseId)?.expected.finalStatus || 'N/A',
        })),
      cases: caseResults,
    };

    this.cachedLatestReport = report;
    return report;
  }
}
