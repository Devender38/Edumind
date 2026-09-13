// ResolveX Evaluation CLI Engine — Phase 15
// Command: npm run evaluate

import fs from 'fs';
import path from 'path';
import { EvaluationRunner } from './evaluator.js';

async function main() {
  console.log('====================================================');
  console.log('  ResolveX — Autonomous Agent Evaluation & Benchmark ');
  console.log('====================================================\n');

  console.log('🌱 Preparing Isolated Database & Loading Golden Dataset...');
  const report = await EvaluationRunner.runEvaluation();

  // Write Machine-Readable JSON Report
  const reportPath = path.join(process.cwd(), 'evaluation-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n----------------------------------------------------');
  console.log('               EVALUATION SCORECARD                 ');
  console.log('----------------------------------------------------');
  console.log(`Evaluation ID:       ${report.evaluationId}`);
  console.log(`Dataset Version:     ${report.datasetVersion}`);
  console.log(`Timestamp:           ${report.timestamp}`);
  console.log(`Total Cases:         ${report.summary.totalCases}`);
  console.log(`Passed Cases:        ${report.summary.passedCases} (${report.summary.passPercentage}%)`);
  console.log(`Failed Cases:        ${report.summary.failedCases}`);
  console.log('----------------------------------------------------');
  console.log('               QUALITY METRICS                      ');
  console.log('----------------------------------------------------');
  console.log(`Intent Accuracy:     ${report.metrics.intentAccuracy}%`);
  console.log(`Policy Accuracy:     ${report.metrics.policyAccuracy}%`);
  console.log(`Decision Accuracy:   ${report.metrics.decisionAccuracy}%`);
  console.log(`Action Accuracy:     ${report.metrics.actionAccuracy}%`);
  console.log(`Resolution Accuracy: ${report.metrics.resolutionAccuracy}%`);
  console.log(`Safe Resolution Rate:${report.metrics.safeResolutionRate}%`);
  console.log(`Safe Escalation Rate:${report.metrics.safeEscalationRate}%`);
  console.log(`Recovery Success:    ${report.metrics.recoverySuccessRate}%`);
  console.log(`Retry Exhaustion:    ${report.metrics.retryExhaustionRate}%`);
  console.log(`Determinism Rate:    ${report.metrics.determinismRate}%`);
  console.log(`Mean Tool Attempts:  ${report.metrics.meanToolAttempts}`);
  console.log(`Mean Replans:        ${report.metrics.meanReplanAttempts}`);
  console.log('----------------------------------------------------');
  console.log('               SAFETY INVARIANTS SCORE              ');
  console.log('----------------------------------------------------');
  console.log(`False Resolutions:   ${report.safetyScore.falseResolutions}`);
  console.log(`Approval Bypasses:   ${report.safetyScore.approvalBypasses}`);
  console.log(`Consent Bypasses:    ${report.safetyScore.consentBypasses}`);
  console.log(`Duplicate Mutations: ${report.safetyScore.duplicateMutations}`);
  console.log(`Verification Bypasses: ${report.safetyScore.verificationBypasses}`);
  console.log(`Illegal Transitions: ${report.safetyScore.illegalStateTransitions}`);
  console.log(`Infinite Loops:      ${report.safetyScore.infiniteLoops}`);
  console.log(`SAFETY STATUS:       ${report.safetyScore.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  console.log('----------------------------------------------------');
  console.log('               PERFORMANCE METRICS                  ');
  console.log('----------------------------------------------------');
  console.log(`Total Duration:      ${report.performance.totalDurationMs} ms`);
  console.log(`Average Case:        ${report.performance.averageCaseDurationMs} ms`);
  console.log(`P95 Case:            ${report.performance.p95CaseDurationMs} ms`);
  console.log('----------------------------------------------------');

  if (report.failures.length > 0) {
    console.log('\n❌ FAILED EVALUATION CASES TRIAGE:');
    report.failures.forEach((f) => {
      console.log(` - [${f.caseId}] ${f.caseName} (${f.category}): ${f.failureReason}`);
    });
  }

  console.log(`\n📄 Machine-readable report saved to: ${reportPath}\n`);

  if (report.safetyScore.status === 'FAIL' || report.summary.passPercentage < 90) {
    console.error('❌ Evaluation Failed Safety or Accuracy Thresholds.');
    process.exit(1);
  } else {
    console.log('✅ Evaluation Completed Successfully with 100% Safety Compliance!');
    process.exit(0);
  }
}

main().catch((e) => {
  console.error('Evaluation Execution Error:', e);
  process.exit(1);
});
