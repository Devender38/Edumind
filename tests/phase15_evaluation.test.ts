import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'http';
import { prisma } from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';
import app from '../src/backend/server.js';
import { GOLDEN_DATASET, DATASET_VERSION } from '../src/evaluation/dataset.js';
import { EvaluationRunner } from '../src/evaluation/evaluator.js';
import { SafetyHarness } from '../src/evaluation/harness.js';
import { DeterminismEvaluator } from '../src/evaluation/determinism.js';
import { getAuthHeaders } from './helpers/authHelper.js';

describe('Phase 15: Evaluation, Benchmarking & Autonomous Agent Quality Measurement Suite', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    await prisma.$connect();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as any;
        baseUrl = `http://localhost:${address.port}`;
        resolve();
      });
    });
  });

  beforeEach(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((res) => server.close(() => res()));
    }
    await prisma.$disconnect();
  });

  describe('1. Golden Evaluation Dataset Criteria', () => {
    it('1. Golden dataset contains at least 30 deterministic cases (Target: 50)', () => {
      expect(GOLDEN_DATASET.length).toBeGreaterThanOrEqual(30);
      expect(GOLDEN_DATASET.length).toBe(50);
    });

    it('2. Dataset version is defined and deterministic', () => {
      expect(DATASET_VERSION).toBe('15.0.0-golden');
    });

    it('3. Dataset covers all required category types', () => {
      const categories = new Set(GOLDEN_DATASET.map((c) => c.category));
      expect(categories.has('LOW_VALUE_REFUND')).toBe(true);
      expect(categories.has('HIGH_VALUE_REFUND')).toBe(true);
      expect(categories.has('HIGH_VALUE_REJECTED')).toBe(true);
      expect(categories.has('REPLACEMENT_CONSENT')).toBe(true);
      expect(categories.has('CONSENT_GRANTED')).toBe(true);
      expect(categories.has('CANCELLATION')).toBe(true);
      expect(categories.has('IDEMPOTENCY_DUPLICATE')).toBe(true);
      expect(categories.has('TOOL_FAILURE')).toBe(true);
      expect(categories.has('RETRY_EXHAUSTION')).toBe(true);
      expect(categories.has('ACTION_AMBIGUITY')).toBe(true);
      expect(categories.has('VERIFICATION_FAILURE')).toBe(true);
      expect(categories.has('POLICY_BLOCK')).toBe(true);
      expect(categories.has('INVALID_INPUT')).toBe(true);
      expect(categories.has('FRAUD_RISK')).toBe(true);
    });

    it('4. Every golden case has explicit expected ground-truth outcomes', () => {
      for (const c of GOLDEN_DATASET) {
        expect(c.id).toBeDefined();
        expect(c.input.message).toBeDefined();
        expect(c.expected.finalStatus).toBeDefined();
        expect(typeof c.expected.expectedMutations).toBe('number');
      }
    });
  });

  describe('2. Evaluation Runner & Metrics Engine', () => {
    it('1. EvaluationRunner executes golden cases and returns comprehensive report', async () => {
      // Run evaluation on a subset of 5 cases for speed in unit test suite
      const subset = GOLDEN_DATASET.slice(0, 5);
      const report = await EvaluationRunner.runEvaluation(subset, { runDeterminism: false });

      expect(report.evaluationId).toBeDefined();
      expect(report.datasetVersion).toBe(DATASET_VERSION);
      expect(report.summary.totalCases).toBe(5);
      expect(report.summary.safetyStatus).toBe('PASS');
      expect(report.metrics.intentAccuracy).toBeGreaterThanOrEqual(80);
      expect(report.metrics.policyAccuracy).toBeGreaterThanOrEqual(80);
      expect(report.metrics.decisionAccuracy).toBeGreaterThanOrEqual(80);
      expect(report.metrics.resolutionAccuracy).toBeGreaterThanOrEqual(80);
    });

    it('2. Metrics accurately measure performance duration (mean & p95)', async () => {
      const subset = GOLDEN_DATASET.slice(0, 3);
      const report = await EvaluationRunner.runEvaluation(subset, { runDeterminism: false });

      expect(report.performance.totalDurationMs).toBeGreaterThan(0);
      expect(report.performance.averageCaseDurationMs).toBeGreaterThan(0);
      expect(report.performance.slowestCases.length).toBeGreaterThan(0);
    });
  });

  describe('3. Hard Safety Invariant Test Harness Assertions', () => {
    it('1. SafetyHarness detects approval bypass safety violation', () => {
      const check = SafetyHarness.validateCaseSafety(
        'RESOLVED',
        1, // 1 mutation executed
        true, // expectedApprovalRequired = true
        false,
        false, // hasApprovalToken = false (BYPASS!)
        false
      );
      expect(check.safetyViolated).toBe(true);
      expect(check.violations.some((v) => v.includes('APPROVAL_BYPASS'))).toBe(true);
    });

    it('2. SafetyHarness detects customer consent bypass safety violation', () => {
      const check = SafetyHarness.validateCaseSafety(
        'RESOLVED',
        1, // 1 mutation executed
        false,
        true, // expectedConsentRequired = true
        false,
        false // hasCustomerConsent = false (BYPASS!)
      );
      expect(check.safetyViolated).toBe(true);
      expect(check.violations.some((v) => v.includes('CONSENT_BYPASS'))).toBe(true);
    });

    it('3. SafetyHarness detects false resolution when verification status is FAILED', () => {
      const check = SafetyHarness.validateCaseSafety(
        'RESOLVED', // Status claims RESOLVED
        1,
        false,
        false,
        false,
        false,
        'FAILED' // Verification FAILED!
      );
      expect(check.safetyViolated).toBe(true);
      expect(check.violations.some((v) => v.includes('FALSE_RESOLUTION'))).toBe(true);
    });

    it('4. SafetyHarness passes valid safe execution clean', () => {
      const check = SafetyHarness.validateCaseSafety(
        'RESOLVED',
        1,
        false,
        false,
        false,
        false,
        'SUCCESS'
      );
      expect(check.safetyViolated).toBe(false);
      expect(check.violations.length).toBe(0);
    });
  });

  describe('4. Determinism & Replay Engine', () => {
    it('1. DeterminismEvaluator performs 5 repeated runs and verifies 100% output stability', async () => {
      const c = GOLDEN_DATASET[0];
      const res = await DeterminismEvaluator.evaluateCaseDeterminism(
        c.id,
        c.input.message,
        c.input.ticketId,
        c.input.orderId,
        c.input.approvalToken,
        c.input.customerConsentGiven,
        5
      );

      expect(res.runsCount).toBe(5);
      expect(res.deterministic).toBe(true);
      expect(res.statuses.length).toBe(5);
      expect(new Set(res.statuses).size).toBe(1); // 100% identical final status
    });
  });

  describe('5. Read-Only Evaluation API & Control Plane Integration', () => {
    it('1. GET /api/v1/evaluation/latest returns read-only evaluation report', async () => {
      const res = await fetch(`${baseUrl}/api/v1/evaluation/latest`, {
        headers: getAuthHeaders('OPERATOR')
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.report).toBeDefined();
      expect(data.report.metrics).toBeDefined();
      expect(data.report.safetyScore).toBeDefined();
      expect(data.report.safetyScore.status).toBe('PASS');
    });
  });
});
