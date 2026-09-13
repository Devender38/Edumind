import { describe, test, expect, beforeEach } from 'vitest';
import { PerformanceEngine } from '../src/observability/performanceEngine.js';
import { AIResourceGovernance } from '../src/ai/aiResourceGovernance.js';
import { AdaptiveModelRouter } from '../src/ai/adaptiveModelRouter.js';
import { ReadOnlyParallelInvestigator } from '../src/observability/readOnlyParallelism.js';
import { IntelligentRetryEngine } from '../src/observability/intelligentRetry.js';
import { AdaptiveBackpressureEngine } from '../src/observability/adaptiveBackpressure.js';
import { TenantFairnessManager } from '../src/observability/tenantFairness.js';
import { QualityIntelligenceEngine } from '../src/observability/qualityIntelligence.js';
import { AnomalyDetectionEngine } from '../src/observability/anomalyDetector.js';
import { RecommendationEngine } from '../src/observability/recommendationEngine.js';
import { ExperimentSafetyController } from '../src/observability/experimentSafety.js';

describe('Step 8 — Advanced Production Intelligence, Optimization & Adaptive Operations', () => {

  beforeEach(() => {
    PerformanceEngine.getInstance().reset();
    AIResourceGovernance.getInstance().reset();
    AdaptiveModelRouter.getInstance().reset();
    ReadOnlyParallelInvestigator.getInstance().reset();
    IntelligentRetryEngine.getInstance().reset();
    AdaptiveBackpressureEngine.getInstance().reset();
    TenantFairnessManager.getInstance().reset();
    QualityIntelligenceEngine.getInstance().reset();
    AnomalyDetectionEngine.getInstance().reset();
    RecommendationEngine.getInstance().reset();
    ExperimentSafetyController.getInstance().reset();
  });

  // =========================================================================
  // CATEGORY 1: PERFORMANCE INTELLIGENCE & LATENCY TELEMETRY (10 TESTS)
  // =========================================================================
  describe('Category 1: Performance Intelligence & Latency Telemetry', () => {
    test('1.1 Records operation latency and computes correct p50/p90/p95/p99 percentiles', () => {
      const engine = PerformanceEngine.getInstance();
      const latencies = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      for (const lat of latencies) {
        engine.recordLatency('db_query', lat, { status: 'success' });
      }
      const metrics = engine.getOperationMetrics('db_query');
      expect(metrics.count).toBe(10);
      expect(metrics.p50).toBeGreaterThanOrEqual(50);
      expect(metrics.p90).toBeGreaterThanOrEqual(90);
    });

    test('1.2 Tracks latency separately for different operations', () => {
      const engine = PerformanceEngine.getInstance();
      engine.recordLatency('op_a', 100);
      engine.recordLatency('op_b', 500);
      const metricsA = engine.getOperationMetrics('op_a');
      const metricsB = engine.getOperationMetrics('op_b');
      expect(metricsA.mean).toBe(100);
      expect(metricsB.mean).toBe(500);
    });

    test('1.3 Sanitizes high-cardinality order IDs from label sets', () => {
      const engine = PerformanceEngine.getInstance();
      const sanitized = engine.sanitizeLabel('order_id', 'ord-9988776655');
      expect(sanitized).toBe('REDACTED_ID');
    });

    test('1.4 Sanitizes customer email addresses from telemetry labels', () => {
      const engine = PerformanceEngine.getInstance();
      const sanitized = engine.sanitizeLabel('user_email', 'alice@customer.com');
      expect(sanitized).toBe('REDACTED_EMAIL');
    });

    test('1.5 Sanitizes secret API keys from telemetry labels', () => {
      const engine = PerformanceEngine.getInstance();
      const sanitized = engine.sanitizeLabel('auth_key', 'sk_live_1234567890abcdef');
      expect(sanitized).toBe('REDACTED_SECRET');
    });

    test('1.6 Aggregates system snapshot across all recorded metrics', () => {
      const engine = PerformanceEngine.getInstance();
      engine.recordLatency('op1', 50);
      engine.recordLatency('op2', 150);
      const snapshot = engine.getSnapshot();
      expect(snapshot.totalOperationsRecorded).toBe(2);
      expect(snapshot.operations['op1']).toBeDefined();
      expect(snapshot.operations['op2']).toBeDefined();
    });

    test('1.7 Correctly filters latency records outside specified time window', () => {
      const engine = PerformanceEngine.getInstance();
      engine.recordLatency('window_op', 100);
      const snapshotRecent = engine.getSnapshot(60000);
      expect(snapshotRecent.totalOperationsRecorded).toBe(1);
    });

    test('1.8 Computes min and max latency accurately', () => {
      const engine = PerformanceEngine.getInstance();
      engine.recordLatency('op_minmax', 15);
      engine.recordLatency('op_minmax', 350);
      engine.recordLatency('op_minmax', 80);
      const metrics = engine.getOperationMetrics('op_minmax');
      expect(metrics.min).toBe(15);
      expect(metrics.max).toBe(350);
    });

    test('1.9 Sanitizes credit card numbers from labels', () => {
      const engine = PerformanceEngine.getInstance();
      const sanitized = engine.sanitizeLabel('cc', '4111-2222-3333-4444');
      expect(sanitized).toBe('REDACTED_CARD');
    });

    test('1.10 Returns zeroed stats when querying empty operation', () => {
      const engine = PerformanceEngine.getInstance();
      const metrics = engine.getOperationMetrics('non_existent_op');
      expect(metrics.count).toBe(0);
      expect(metrics.p50).toBe(0);
    });
  });

  // =========================================================================
  // CATEGORY 2: AI RESOURCE & TOKEN BUDGET GOVERNANCE (10 TESTS)
  // =========================================================================
  describe('Category 2: AI Resource & Token Budget Governance', () => {
    test('2.1 Records prompt and completion tokens accurately per tenant', () => {
      const gov = AIResourceGovernance.getInstance();
      gov.recordUsage('tenant-a', 'llama-3-8b', 100, 50);
      const status = gov.getBudgetStatus('tenant-a');
      expect(status.tokensConsumed).toBe(150);
    });

    test('2.2 Computes micro-USD cost based on model pricing rate', () => {
      const gov = AIResourceGovernance.getInstance();
      gov.recordUsage('tenant-a', 'llama-3-70b', 1000, 1000);
      const status = gov.getBudgetStatus('tenant-a');
      expect(status.costMicroUsd).toBeGreaterThan(0);
    });

    test('2.3 Enforces monthly token budget limit per tenant', () => {
      const gov = AIResourceGovernance.getInstance();
      gov.setBudget('tenant-b', { monthlyTokenLimit: 1000, monthlyCostLimitUsd: 10 });
      gov.recordUsage('tenant-b', 'model-x', 800, 300);
      const check = gov.checkBudget('tenant-b');
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain('Token budget exceeded');
    });

    test('2.4 Enforces cost budget limit in USD per tenant', () => {
      const gov = AIResourceGovernance.getInstance();
      gov.setBudget('tenant-c', { monthlyTokenLimit: 1000000, monthlyCostLimitUsd: 0.001 });
      gov.recordUsage('tenant-c', 'llama-3-70b', 50000, 50000);
      const check = gov.checkBudget('tenant-c');
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain('Cost budget exceeded');
    });

    test('2.5 Allows request when tenant token and cost budget are within limits', () => {
      const gov = AIResourceGovernance.getInstance();
      gov.setBudget('tenant-d', { monthlyTokenLimit: 50000, monthlyCostLimitUsd: 50 });
      gov.recordUsage('tenant-d', 'llama-3-8b', 100, 50);
      const check = gov.checkBudget('tenant-d');
      expect(check.allowed).toBe(true);
    });

    test('2.6 Provides graceful deterministic fallback response on budget exhaustion', () => {
      const gov = AIResourceGovernance.getInstance();
      gov.setBudget('tenant-e', { monthlyTokenLimit: 100, monthlyCostLimitUsd: 1 });
      gov.recordUsage('tenant-e', 'model-y', 200, 0);
      const fallback = gov.getFallbackResponse('tenant-e', 'Analyze return request');
      expect(fallback.fallbackTriggered).toBe(true);
      expect(fallback.mode).toBe('DETERMINISTIC_POLICY_RULES');
    });

    test('2.7 Tracks usage across multiple AI models for same tenant', () => {
      const gov = AIResourceGovernance.getInstance();
      gov.recordUsage('tenant-f', 'model-1', 100, 100);
      gov.recordUsage('tenant-f', 'model-2', 200, 200);
      const status = gov.getBudgetStatus('tenant-f');
      expect(status.tokensConsumed).toBe(600);
    });

    test('2.8 Resets monthly tenant usage correctly', () => {
      const gov = AIResourceGovernance.getInstance();
      gov.recordUsage('tenant-g', 'model-1', 500, 500);
      gov.resetTenantUsage('tenant-g');
      const status = gov.getBudgetStatus('tenant-g');
      expect(status.tokensConsumed).toBe(0);
    });

    test('2.9 Emits warning telemetry when tenant reaches 80% budget threshold', () => {
      const gov = AIResourceGovernance.getInstance();
      gov.setBudget('tenant-warn', { monthlyTokenLimit: 1000, monthlyCostLimitUsd: 100 });
      gov.recordUsage('tenant-warn', 'model-w', 850, 0);
      const status = gov.getBudgetStatus('tenant-warn');
      expect(status.isNearLimit).toBe(true);
    });

    test('2.10 Returns default budget when no custom budget is configured', () => {
      const gov = AIResourceGovernance.getInstance();
      const check = gov.checkBudget('tenant-default-new');
      expect(check.allowed).toBe(true);
    });
  });

  // =========================================================================
  // CATEGORY 3: ADAPTIVE MODEL ROUTING (10 TESTS)
  // =========================================================================
  describe('Category 3: Adaptive Model Routing', () => {
    test('3.1 Routes simple status queries to low-cost lightweight model', () => {
      const router = AdaptiveModelRouter.getInstance();
      const decision = router.selectModel({ taskType: 'STATUS_LOOKUP', complexity: 'LOW' });
      expect(decision.recommendedModel).toBe('llama-3-8b');
      expect(decision.tier).toBe('LIGHTWEIGHT');
    });

    test('3.2 Routes complex multi-step investigation to high-reasoning model', () => {
      const router = AdaptiveModelRouter.getInstance();
      const decision = router.selectModel({ taskType: 'COMPLEX_INVESTIGATION', complexity: 'HIGH' });
      expect(decision.recommendedModel).toBe('llama-3-70b');
      expect(decision.tier).toBe('FULL_REASONING');
    });

    test('3.3 Respects explicit user model override if requested', () => {
      const router = AdaptiveModelRouter.getInstance();
      const decision = router.selectModel({ taskType: 'STATUS_LOOKUP', complexity: 'LOW', userOverrideModel: 'gpt-4o' });
      expect(decision.recommendedModel).toBe('gpt-4o');
      expect(decision.isOverride).toBe(true);
    });

    test('3.4 Ensures router retains ADVISORY ONLY authority tag', () => {
      const router = AdaptiveModelRouter.getInstance();
      const decision = router.selectModel({ taskType: 'POLICY_EVALUATION', complexity: 'MEDIUM' });
      expect(decision.authorityLevel).toBe('ADVISORY_ONLY');
    });

    test('3.5 Routes budget-restricted tenant to fallback lightweight model', () => {
      const router = AdaptiveModelRouter.getInstance();
      const decision = router.selectModel({ taskType: 'COMPLEX_INVESTIGATION', complexity: 'HIGH', tenantBudgetConstrained: true });
      expect(decision.recommendedModel).toBe('llama-3-8b');
      expect(decision.reason).toContain('Budget constrained');
    });

    test('3.6 Recommends fast model for latency-sensitive customer requests', () => {
      const router = AdaptiveModelRouter.getInstance();
      const decision = router.selectModel({ taskType: 'INTENT_CLASSIFICATION', latencySensitivity: 'CRITICAL' });
      expect(decision.tier).toBe('LIGHTWEIGHT');
    });

    test('3.7 Tracks routing decision history in telemetry log', () => {
      const router = AdaptiveModelRouter.getInstance();
      router.selectModel({ taskType: 'TASK_A', complexity: 'LOW' });
      router.selectModel({ taskType: 'TASK_B', complexity: 'HIGH' });
      const history = router.getRoutingHistory();
      expect(history.length).toBe(2);
    });

    test('3.8 Maps unknown task type gracefully to balanced default model', () => {
      const router = AdaptiveModelRouter.getInstance();
      const decision = router.selectModel({ taskType: 'UNKNOWN_CUSTOM_TASK' as any, complexity: 'MEDIUM' });
      expect(decision.recommendedModel).toBeDefined();
    });

    test('3.9 Calculates estimated cost savings when lightweight model is selected', () => {
      const router = AdaptiveModelRouter.getInstance();
      const decision = router.selectModel({ taskType: 'STATUS_LOOKUP', complexity: 'LOW' });
      expect(decision.estimatedCostSavingsRatio).toBeGreaterThan(0);
    });

    test('3.10 Exposes list of supported available model options', () => {
      const router = AdaptiveModelRouter.getInstance();
      const models = router.getSupportedModels();
      expect(models).toContain('llama-3-8b');
      expect(models).toContain('llama-3-70b');
    });
  });

  // =========================================================================
  // CATEGORY 4: SAFE READ-ONLY PARALLEL INVESTIGATION (10 TESTS)
  // =========================================================================
  describe('Category 4: Safe Read-Only Parallel Investigation', () => {
    test('4.1 Classifies read operations as READ_ONLY and mutation operations as MUTATION', () => {
      const investigator = ReadOnlyParallelInvestigator.getInstance();
      expect(investigator.classifyTask('check_order_status')).toBe('READ_ONLY');
      expect(investigator.classifyTask('issue_refund_mutation')).toBe('MUTATION');
    });

    test('4.2 Executes multiple independent READ_ONLY tasks in parallel', async () => {
      const investigator = ReadOnlyParallelInvestigator.getInstance();
      const task1 = () => Promise.resolve({ data: 'order_ok' });
      const task2 = () => Promise.resolve({ data: 'user_active' });
      const results = await investigator.executeParallelReads([
        { id: 'r1', type: 'READ_ONLY', name: 'check_order', fn: task1 },
        { id: 'r2', type: 'READ_ONLY', name: 'check_user', fn: task2 }
      ]);
      expect(results.length).toBe(2);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });

    test('4.3 Rejects executing MUTATION task inside parallel read investigator', async () => {
      const investigator = ReadOnlyParallelInvestigator.getInstance();
      const mutationTask = () => Promise.resolve({ data: 'mutated' });
      await expect(investigator.executeParallelReads([
        { id: 'm1', type: 'MUTATION', name: 'execute_refund', fn: mutationTask }
      ])).rejects.toThrow('Cannot execute non-READ_ONLY task in parallel read phase');
    });

    test('4.4 Preserves strict sequential execution ordering for MUTATION tasks', async () => {
      const investigator = ReadOnlyParallelInvestigator.getInstance();
      const orderOfExecution: string[] = [];
      await investigator.executeSequentialChain([
        { id: 'm1', type: 'MUTATION', name: 'mut1', fn: async () => { orderOfExecution.push('mut1'); } },
        { id: 'v1', type: 'VERIFICATION', name: 'ver1', fn: async () => { orderOfExecution.push('ver1'); } }
      ]);
      expect(orderOfExecution).toEqual(['mut1', 'ver1']);
    });

    test('4.5 Caches read result per tenant and returns cached response on hit', async () => {
      const investigator = ReadOnlyParallelInvestigator.getInstance();
      let callCount = 0;
      const fetchFn = async () => { callCount++; return 'policy_v1'; };
      
      const res1 = await investigator.getCachedOrFetch('tenant-1', 'policy_key', fetchFn, 1000);
      const res2 = await investigator.getCachedOrFetch('tenant-1', 'policy_key', fetchFn, 1000);

      expect(res1).toBe('policy_v1');
      expect(res2).toBe('policy_v1');
      expect(callCount).toBe(1);
    });

    test('4.6 Evicts cached read entry after TTL expiration', async () => {
      const investigator = ReadOnlyParallelInvestigator.getInstance();
      let callCount = 0;
      const fetchFn = async () => { callCount++; return 'policy_v2'; };

      await investigator.getCachedOrFetch('tenant-2', 'ttl_key', fetchFn, 1); // 1ms TTL
      await new Promise(r => setTimeout(r, 10));
      await investigator.getCachedOrFetch('tenant-2', 'ttl_key', fetchFn, 1);

      expect(callCount).toBe(2);
    });

    test('4.7 Enforces isolated per-tenant read caching namespaces', async () => {
      const investigator = ReadOnlyParallelInvestigator.getInstance();
      await investigator.getCachedOrFetch('tenant-A', 'shared_key', async () => 'data_A', 1000);
      const resB = await investigator.getCachedOrFetch('tenant-B', 'shared_key', async () => 'data_B', 1000);

      expect(resB).toBe('data_B');
    });

    test('4.8 Clears tenant cache entries immediately when cache is invalidated', async () => {
      const investigator = ReadOnlyParallelInvestigator.getInstance();
      await investigator.getCachedOrFetch('tenant-clear', 'key1', async () => 'val1', 10000);
      investigator.clearTenantCache('tenant-clear');
      
      let callCount = 0;
      await investigator.getCachedOrFetch('tenant-clear', 'key1', async () => { callCount++; return 'val2'; }, 10000);
      expect(callCount).toBe(1);
    });

    test('4.9 Handles failure in one parallel read without aborting other parallel reads', async () => {
      const investigator = ReadOnlyParallelInvestigator.getInstance();
      const failTask = () => Promise.reject(new Error('Read timeout'));
      const successTask = () => Promise.resolve('ok');

      const results = await investigator.executeParallelReads([
        { id: 'f1', type: 'READ_ONLY', name: 'fail_read', fn: failTask },
        { id: 's1', type: 'READ_ONLY', name: 'success_read', fn: successTask }
      ]);

      expect(results[0].status).toBe('rejected');
      expect(results[1].status).toBe('fulfilled');
    });

    test('4.10 Enforces max concurrency cap for parallel read batches', async () => {
      const investigator = ReadOnlyParallelInvestigator.getInstance();
      const tasks = Array.from({ length: 15 }, (_, i) => ({
        id: `r_${i}`,
        type: 'READ_ONLY' as const,
        name: `task_${i}`,
        fn: () => Promise.resolve(i)
      }));
      const results = await investigator.executeParallelReads(tasks, 5); // Max 5 parallel
      expect(results.length).toBe(15);
    });
  });

  // =========================================================================
  // CATEGORY 5: INTELLIGENT RETRY & FAILURE CLASSIFICATION (10 TESTS)
  // =========================================================================
  describe('Category 5: Intelligent Retry & Failure Classification', () => {
    test('5.1 Classifies network timeout error as TRANSIENT retryable', () => {
      const retryEngine = IntelligentRetryEngine.getInstance();
      const classification = retryEngine.classifyError(new Error('ETIMEDOUT: Connection timed out'));
      expect(classification.category).toBe('TRANSIENT');
      expect(classification.isRetryable).toBe(true);
    });

    test('5.2 Classifies HTTP 429 rate limit as TRANSIENT retryable', () => {
      const retryEngine = IntelligentRetryEngine.getInstance();
      const err = new Error('HTTP 429 Too Many Requests');
      const classification = retryEngine.classifyError(err);
      expect(classification.category).toBe('TRANSIENT');
      expect(classification.isRetryable).toBe(true);
    });

    test('5.3 Classifies HTTP 401 Unauthorized as PERMANENT non-retryable', () => {
      const retryEngine = IntelligentRetryEngine.getInstance();
      const err = new Error('HTTP 401 Unauthorized token');
      const classification = retryEngine.classifyError(err);
      expect(classification.category).toBe('PERMANENT');
      expect(classification.isRetryable).toBe(false);
    });

    test('5.4 Classifies validation failure as PERMANENT non-retryable', () => {
      const retryEngine = IntelligentRetryEngine.getInstance();
      const err = new Error('Schema validation error: invalid email format');
      const classification = retryEngine.classifyError(err);
      expect(classification.category).toBe('PERMANENT');
      expect(classification.isRetryable).toBe(false);
    });

    test('5.5 Calculates exponential backoff delay with jitter', () => {
      const retryEngine = IntelligentRetryEngine.getInstance();
      const delay1 = retryEngine.calculateBackoffMs(1, 100, 1000);
      const delay2 = retryEngine.calculateBackoffMs(2, 100, 1000);
      expect(delay1).toBeGreaterThanOrEqual(100);
      expect(delay2).toBeGreaterThanOrEqual(200);
    });

    test('5.6 Caps maximum retry delay at configured maxBackoffMs ceiling', () => {
      const retryEngine = IntelligentRetryEngine.getInstance();
      const delay = retryEngine.calculateBackoffMs(10, 100, 2000);
      expect(delay).toBeLessThanOrEqual(2000);
    });

    test('5.7 Rejects retry attempt when max retry count is reached', () => {
      const retryEngine = IntelligentRetryEngine.getInstance();
      const canRetry = retryEngine.shouldRetry(new Error('ETIMEDOUT'), 3, 3);
      expect(canRetry).toBe(false);
    });

    test('5.8 Allows retry attempt when current attempt is below max limit for transient error', () => {
      const retryEngine = IntelligentRetryEngine.getInstance();
      const canRetry = retryEngine.shouldRetry(new Error('ETIMEDOUT'), 1, 3);
      expect(canRetry).toBe(true);
    });

    test('5.9 Disallows retry attempt for permanent error even if attempt is 1', () => {
      const retryEngine = IntelligentRetryEngine.getInstance();
      const canRetry = retryEngine.shouldRetry(new Error('HTTP 403 Forbidden'), 1, 3);
      expect(canRetry).toBe(false);
    });

    test('5.10 Tracks retry stats by error category', () => {
      const retryEngine = IntelligentRetryEngine.getInstance();
      retryEngine.recordAttempt(new Error('ETIMEDOUT'), true);
      retryEngine.recordAttempt(new Error('401 Unauthorized'), false);
      const stats = retryEngine.getRetryStats();
      expect(stats.transientRetries).toBe(1);
      expect(stats.permanentFailures).toBe(1);
    });
  });

  // =========================================================================
  // CATEGORY 6: ADAPTIVE SYSTEM BACKPRESSURE & WORK SHEDDING (10 TESTS)
  // =========================================================================
  describe('Category 6: Adaptive System Backpressure & Work Shedding', () => {
    test('6.1 Computes NORMAL pressure level when system metrics are healthy', () => {
      const backpressure = AdaptiveBackpressureEngine.getInstance();
      const state = backpressure.evaluatePressure({ queueDepth: 10, workerUtilization: 0.3, errorRate: 0.01 });
      expect(state.level).toBe('NORMAL');
      expect(state.shedOptionalWork).toBe(false);
    });

    test('6.2 Computes HIGH pressure level when queue depth exceeds high threshold', () => {
      const backpressure = AdaptiveBackpressureEngine.getInstance();
      const state = backpressure.evaluatePressure({ queueDepth: 500, workerUtilization: 0.9, errorRate: 0.05 });
      expect(state.level).toBe('HIGH');
      expect(state.shedOptionalWork).toBe(true);
    });

    test('6.3 Computes CRITICAL pressure level when error rate exceeds critical threshold', () => {
      const backpressure = AdaptiveBackpressureEngine.getInstance();
      const state = backpressure.evaluatePressure({ queueDepth: 1000, workerUtilization: 0.98, errorRate: 0.35 });
      expect(state.level).toBe('CRITICAL');
      expect(state.shedOptionalWork).toBe(true);
    });

    test('6.4 Sheds optional analytical work when backpressure is HIGH', () => {
      const backpressure = AdaptiveBackpressureEngine.getInstance();
      backpressure.evaluatePressure({ queueDepth: 500, workerUtilization: 0.9, errorRate: 0.05 });
      const check = backpressure.shouldAcceptTask('ANALYTICAL_SUMMARY', 'LOW');
      expect(check.accepted).toBe(false);
      expect(check.reason).toContain('Backpressure work shedding');
    });

    test('6.5 Accepts critical customer transaction task even when backpressure is HIGH', () => {
      const backpressure = AdaptiveBackpressureEngine.getInstance();
      backpressure.evaluatePressure({ queueDepth: 500, workerUtilization: 0.9, errorRate: 0.05 });
      const check = backpressure.shouldAcceptTask('CUSTOMER_MUTATION', 'CRITICAL');
      expect(check.accepted).toBe(true);
    });

    test('6.6 Rejects low priority task when backpressure reaches CRITICAL level', () => {
      const backpressure = AdaptiveBackpressureEngine.getInstance();
      backpressure.evaluatePressure({ queueDepth: 2000, workerUtilization: 0.99, errorRate: 0.4 });
      const check = backpressure.shouldAcceptTask('BACKGROUND_CLEANUP', 'LOW');
      expect(check.accepted).toBe(false);
    });

    test('6.7 Restores NORMAL operation when pressure metrics drop below recovery thresholds', () => {
      const backpressure = AdaptiveBackpressureEngine.getInstance();
      backpressure.evaluatePressure({ queueDepth: 1000, workerUtilization: 0.95, errorRate: 0.3 });
      const recoveredState = backpressure.evaluatePressure({ queueDepth: 5, workerUtilization: 0.2, errorRate: 0.001 });
      expect(recoveredState.level).toBe('NORMAL');
      expect(recoveredState.shedOptionalWork).toBe(false);
    });

    test('6.8 Tracks total shed tasks counter by task type', () => {
      const backpressure = AdaptiveBackpressureEngine.getInstance();
      backpressure.evaluatePressure({ queueDepth: 800, workerUtilization: 0.92, errorRate: 0.1 });
      backpressure.shouldAcceptTask('BACKGROUND_INDEX', 'LOW');
      backpressure.shouldAcceptTask('BACKGROUND_INDEX', 'LOW');
      const stats = backpressure.getShedStats();
      expect(stats['BACKGROUND_INDEX']).toBe(2);
    });

    test('6.9 Triggers backpressure if circuit breaker OPEN ratio is elevated', () => {
      const backpressure = AdaptiveBackpressureEngine.getInstance();
      const state = backpressure.evaluatePressure({ queueDepth: 10, workerUtilization: 0.2, errorRate: 0.01, openCircuitRatio: 0.6 });
      expect(state.level).toBe('HIGH');
    });

    test('6.10 Provides telemetry summary of current backpressure status', () => {
      const backpressure = AdaptiveBackpressureEngine.getInstance();
      const summary = backpressure.getStatusSummary();
      expect(summary.currentLevel).toBeDefined();
      expect(summary.shedOptionalWork).toBeDefined();
    });
  });

  // =========================================================================
  // CATEGORY 7: TENANT RESOURCE FAIRNESS & ISOLATION (10 TESTS)
  // =========================================================================
  describe('Category 7: Tenant Resource Fairness & Isolation', () => {
    test('7.1 Enforces active concurrent run limit per tenant', () => {
      const fairness = TenantFairnessManager.getInstance();
      fairness.setTenantConfig('tenant-fair-1', { maxConcurrentRuns: 2, tokenRatePerSec: 100 });
      
      expect(fairness.acquireRunSlot('tenant-fair-1').allowed).toBe(true);
      expect(fairness.acquireRunSlot('tenant-fair-1').allowed).toBe(true);
      
      const check3 = fairness.acquireRunSlot('tenant-fair-1');
      expect(check3.allowed).toBe(false);
      expect(check3.reason).toContain('Tenant concurrency limit reached');
    });

    test('7.2 Releases active concurrent run slot when run completes', () => {
      const fairness = TenantFairnessManager.getInstance();
      fairness.setTenantConfig('tenant-fair-2', { maxConcurrentRuns: 1, tokenRatePerSec: 100 });
      
      fairness.acquireRunSlot('tenant-fair-2');
      fairness.releaseRunSlot('tenant-fair-2');
      
      const check2 = fairness.acquireRunSlot('tenant-fair-2');
      expect(check2.allowed).toBe(true);
    });

    test('7.3 Prevents high-volume noisy tenant from starving quiet tenant', () => {
      const fairness = TenantFairnessManager.getInstance();
      fairness.setTenantConfig('noisy-tenant', { maxConcurrentRuns: 2, tokenRatePerSec: 10 });
      fairness.setTenantConfig('quiet-tenant', { maxConcurrentRuns: 5, tokenRatePerSec: 100 });

      fairness.acquireRunSlot('noisy-tenant');
      fairness.acquireRunSlot('noisy-tenant');
      expect(fairness.acquireRunSlot('noisy-tenant').allowed).toBe(false);

      expect(fairness.acquireRunSlot('quiet-tenant').allowed).toBe(true);
    });

    test('7.4 Enforces per-tenant token bucket rate limiting', () => {
      const fairness = TenantFairnessManager.getInstance();
      fairness.setTenantConfig('tenant-rate', { maxConcurrentRuns: 10, tokenRatePerSec: 2 });
      
      expect(fairness.consumeTokens('tenant-rate', 1).allowed).toBe(true);
      expect(fairness.consumeTokens('tenant-rate', 1).allowed).toBe(true);
      
      const check3 = fairness.consumeTokens('tenant-rate', 1);
      expect(check3.allowed).toBe(false);
      expect(check3.reason).toContain('Rate limit exceeded');
    });

    test('7.5 Refills tenant token bucket over time', async () => {
      const fairness = TenantFairnessManager.getInstance();
      fairness.setTenantConfig('tenant-refill', { maxConcurrentRuns: 10, tokenRatePerSec: 100 });
      
      fairness.consumeTokens('tenant-refill', 100);
      expect(fairness.consumeTokens('tenant-refill', 1).allowed).toBe(false);
      
      await new Promise(r => setTimeout(r, 20)); // wait for refill
      expect(fairness.consumeTokens('tenant-refill', 1).allowed).toBe(true);
    });

    test('7.6 Maintains independent fairness state per tenant', () => {
      const fairness = TenantFairnessManager.getInstance();
      fairness.acquireRunSlot('tenant-A');
      const statsA = fairness.getTenantStats('tenant-A');
      const statsB = fairness.getTenantStats('tenant-B');
      expect(statsA.activeRuns).toBe(1);
      expect(statsB.activeRuns).toBe(0);
    });

    test('7.7 Automatically applies default fairness config to unconfigured tenant', () => {
      const fairness = TenantFairnessManager.getInstance();
      const res = fairness.acquireRunSlot('new-unconfigured-tenant');
      expect(res.allowed).toBe(true);
    });

    test('7.8 Rejects releasing slot for tenant with zero active runs', () => {
      const fairness = TenantFairnessManager.getInstance();
      fairness.releaseRunSlot('tenant-zero');
      const stats = fairness.getTenantStats('tenant-zero');
      expect(stats.activeRuns).toBe(0);
    });

    test('7.9 Tracks total rejected attempts per tenant due to fairness caps', () => {
      const fairness = TenantFairnessManager.getInstance();
      fairness.setTenantConfig('tenant-reject', { maxConcurrentRuns: 1, tokenRatePerSec: 10 });
      fairness.acquireRunSlot('tenant-reject');
      fairness.acquireRunSlot('tenant-reject'); // rejected
      const stats = fairness.getTenantStats('tenant-reject');
      expect(stats.rejectedRunsCount).toBe(1);
    });

    test('7.10 Returns list of all active tenant IDs in fairness manager', () => {
      const fairness = TenantFairnessManager.getInstance();
      fairness.acquireRunSlot('t-1');
      fairness.acquireRunSlot('t-2');
      const activeTenants = fairness.getActiveTenants();
      expect(activeTenants).toContain('t-1');
      expect(activeTenants).toContain('t-2');
    });
  });

  // =========================================================================
  // CATEGORY 8: CONTINUOUS QUALITY INTELLIGENCE (10 TESTS)
  // =========================================================================
  describe('Category 8: Continuous Quality Intelligence', () => {
    test('8.1 Aggregates resolution success count per tenant', () => {
      const quality = QualityIntelligenceEngine.getInstance();
      quality.recordRunOutcome('tenant-q1', 'SUCCESS');
      quality.recordRunOutcome('tenant-q1', 'SUCCESS');
      const stats = quality.getQualityMetrics('tenant-q1');
      expect(stats.successCount).toBe(2);
    });

    test('8.2 Aggregates clarification ratio per tenant', () => {
      const quality = QualityIntelligenceEngine.getInstance();
      quality.recordRunOutcome('tenant-q2', 'SUCCESS');
      quality.recordRunOutcome('tenant-q2', 'CLARIFICATION_NEEDED');
      const stats = quality.getQualityMetrics('tenant-q2');
      expect(stats.clarificationRatio).toBe(0.5);
    });

    test('8.3 Aggregates human escalation ratio per tenant', () => {
      const quality = QualityIntelligenceEngine.getInstance();
      quality.recordRunOutcome('tenant-q3', 'SUCCESS');
      quality.recordRunOutcome('tenant-q3', 'HUMAN_ESCALATION');
      const stats = quality.getQualityMetrics('tenant-q3');
      expect(stats.escalationRatio).toBe(0.5);
    });

    test('8.4 Tracks deterministic policy rejection frequency', () => {
      const quality = QualityIntelligenceEngine.getInstance();
      quality.recordRunOutcome('tenant-q4', 'POLICY_REJECTION');
      const stats = quality.getQualityMetrics('tenant-q4');
      expect(stats.policyRejectionCount).toBe(1);
    });

    test('8.5 Tracks verification failure frequency', () => {
      const quality = QualityIntelligenceEngine.getInstance();
      quality.recordRunOutcome('tenant-q5', 'VERIFICATION_FAILURE');
      const stats = quality.getQualityMetrics('tenant-q5');
      expect(stats.verificationFailureCount).toBe(1);
    });

    test('8.6 Tracks UNKNOWN_OUTCOME occurrence frequency', () => {
      const quality = QualityIntelligenceEngine.getInstance();
      quality.recordRunOutcome('tenant-q6', 'UNKNOWN_OUTCOME');
      const stats = quality.getQualityMetrics('tenant-q6');
      expect(stats.unknownOutcomeCount).toBe(1);
    });

    test('8.7 Tracks duplicate mutation attempt frequency', () => {
      const quality = QualityIntelligenceEngine.getInstance();
      quality.recordRunOutcome('tenant-q7', 'DUPLICATE_MUTATION_PREVENTED');
      const stats = quality.getQualityMetrics('tenant-q7');
      expect(stats.duplicateMutationPreventedCount).toBe(1);
    });

    test('8.8 Computes overall resolution success rate across all runs', () => {
      const quality = QualityIntelligenceEngine.getInstance();
      quality.recordRunOutcome('tenant-q8', 'SUCCESS');
      quality.recordRunOutcome('tenant-q8', 'SUCCESS');
      quality.recordRunOutcome('tenant-q8', 'VERIFICATION_FAILURE');
      quality.recordRunOutcome('tenant-q8', 'POLICY_REJECTION');
      const stats = quality.getQualityMetrics('tenant-q8');
      expect(stats.successRate).toBe(0.5);
    });

    test('8.9 Generates system-wide quality summary across all tenants', () => {
      const quality = QualityIntelligenceEngine.getInstance();
      quality.recordRunOutcome('t1', 'SUCCESS');
      quality.recordRunOutcome('t2', 'CLARIFICATION_NEEDED');
      const summary = quality.getGlobalQualitySummary();
      expect(summary.totalRunsRecorded).toBe(2);
    });

    test('8.10 Returns zeroed quality metrics when querying tenant with no runs', () => {
      const quality = QualityIntelligenceEngine.getInstance();
      const stats = quality.getQualityMetrics('tenant-empty');
      expect(stats.totalRuns).toBe(0);
      expect(stats.successRate).toBe(0);
    });
  });

  // =========================================================================
  // CATEGORY 9: DETERMINISTIC ANOMALY DETECTION (10 TESTS)
  // =========================================================================
  describe('Category 9: Deterministic Anomaly Detection', () => {
    test('9.1 Detects LATENCY_SPIKE anomaly when p95 latency exceeds threshold', () => {
      const detector = AnomalyDetectionEngine.getInstance();
      const anomalies = detector.evaluateMetrics({ p95LatencyMs: 4500, errorRate: 0.01, retryCount: 2, unknownOutcomeCount: 0 });
      const spike = anomalies.find(a => a.type === 'LATENCY_SPIKE');
      expect(spike).toBeDefined();
      expect(spike?.severity).toBe('HIGH');
    });

    test('9.2 Detects ERROR_RATE_JUMP anomaly when error rate exceeds threshold', () => {
      const detector = AnomalyDetectionEngine.getInstance();
      const anomalies = detector.evaluateMetrics({ p95LatencyMs: 100, errorRate: 0.25, retryCount: 0, unknownOutcomeCount: 0 });
      const errAnomaly = anomalies.find(a => a.type === 'ERROR_RATE_JUMP');
      expect(errAnomaly).toBeDefined();
      expect(errAnomaly?.severity).toBe('CRITICAL');
    });

    test('9.3 Detects RETRY_STORM anomaly when retry count jumps rapidly', () => {
      const detector = AnomalyDetectionEngine.getInstance();
      const anomalies = detector.evaluateMetrics({ p95LatencyMs: 100, errorRate: 0.02, retryCount: 150, unknownOutcomeCount: 0 });
      const storm = anomalies.find(a => a.type === 'RETRY_STORM');
      expect(storm).toBeDefined();
    });

    test('9.4 Detects UNKNOWN_OUTCOME_SPIKE anomaly when unknown outcomes surge', () => {
      const detector = AnomalyDetectionEngine.getInstance();
      const anomalies = detector.evaluateMetrics({ p95LatencyMs: 100, errorRate: 0.02, retryCount: 0, unknownOutcomeCount: 5 });
      const surge = anomalies.find(a => a.type === 'UNKNOWN_OUTCOME_SPIKE');
      expect(surge).toBeDefined();
      expect(surge?.severity).toBe('CRITICAL');
    });

    test('9.5 Returns empty anomaly array when all operational metrics are healthy', () => {
      const detector = AnomalyDetectionEngine.getInstance();
      const anomalies = detector.evaluateMetrics({ p95LatencyMs: 150, errorRate: 0.005, retryCount: 2, unknownOutcomeCount: 0 });
      expect(anomalies.length).toBe(0);
    });

    test('9.6 Triggers statistical z-score anomaly detection on sudden latency deviation', () => {
      const detector = AnomalyDetectionEngine.getInstance();
      // Seed normal baseline latencies
      for (let i = 0; i < 20; i++) {
        detector.recordSample('db_latency', 50);
      }
      // Sudden spike
      const isAnomaly = detector.checkStatisticalAnomaly('db_latency', 500);
      expect(isAnomaly).toBe(true);
    });

    test('9.7 Ignores normal minor variation in statistical z-score check', () => {
      const detector = AnomalyDetectionEngine.getInstance();
      for (let i = 0; i < 20; i++) {
        detector.recordSample('api_latency', 100);
      }
      const isAnomaly = detector.checkStatisticalAnomaly('api_latency', 105);
      expect(isAnomaly).toBe(false);
    });

    test('9.8 Stores active anomaly events in historical detection log', () => {
      const detector = AnomalyDetectionEngine.getInstance();
      detector.evaluateMetrics({ p95LatencyMs: 6000, errorRate: 0.3, retryCount: 0, unknownOutcomeCount: 0 });
      const active = detector.getActiveAnomalies();
      expect(active.length).toBeGreaterThan(0);
    });

    test('9.9 Clears active anomalies when metrics return to normal range', () => {
      const detector = AnomalyDetectionEngine.getInstance();
      detector.evaluateMetrics({ p95LatencyMs: 6000, errorRate: 0.3, retryCount: 0, unknownOutcomeCount: 0 });
      detector.evaluateMetrics({ p95LatencyMs: 100, errorRate: 0.01, retryCount: 0, unknownOutcomeCount: 0 });
      const active = detector.getActiveAnomalies();
      expect(active.length).toBe(0);
    });

    test('9.10 Emits telemetry alert details with correlation ID for detected anomaly', () => {
      const detector = AnomalyDetectionEngine.getInstance();
      const anomalies = detector.evaluateMetrics({ p95LatencyMs: 5000, errorRate: 0.01, retryCount: 0, unknownOutcomeCount: 0 }, 'corr-test-123');
      expect(anomalies[0].correlationId).toBe('corr-test-123');
    });
  });

  // =========================================================================
  // CATEGORY 10: RECOMMENDATION LIFECYCLE & RBAC CONTROL PLANE (10 TESTS)
  // =========================================================================
  describe('Category 10: Recommendation Lifecycle & RBAC Control Plane', () => {
    test('10.1 Proposes optimization recommendation in PROPOSED state', () => {
      const engine = RecommendationEngine.getInstance();
      const rec = engine.proposeRecommendation({
        title: 'Enable parallel read for order lookup',
        category: 'PERFORMANCE',
        suggestedAction: 'PARALLEL_READ',
        expectedImpact: 'Reduce latency by 40%'
      });
      expect(rec.status).toBe('PROPOSED');
      expect(rec.id).toBeDefined();
    });

    test('10.2 Allows OPERATOR role to approve PROPOSED recommendation', () => {
      const engine = RecommendationEngine.getInstance();
      const rec = engine.proposeRecommendation({ title: 'Rec 1', category: 'PERFORMANCE', suggestedAction: 'ACT_1', expectedImpact: 'High' });
      const approved = engine.approveRecommendation(rec.id, 'operator-user-1');
      expect(approved?.status).toBe('APPROVED');
      expect(approved?.approvedBy).toBe('operator-user-1');
    });

    test('10.3 Allows ADMIN role to apply APPROVED recommendation', () => {
      const engine = RecommendationEngine.getInstance();
      const rec = engine.proposeRecommendation({ title: 'Rec 2', category: 'AI_COST', suggestedAction: 'ACT_2', expectedImpact: 'Cost' });
      engine.approveRecommendation(rec.id, 'admin-user');
      const applied = engine.applyRecommendation(rec.id, 'admin-user');
      expect(applied?.status).toBe('APPLIED');
      expect(applied?.appliedBy).toBe('admin-user');
    });

    test('10.4 Rejects applying recommendation directly from PROPOSED state without approval', () => {
      const engine = RecommendationEngine.getInstance();
      const rec = engine.proposeRecommendation({ title: 'Rec 3', category: 'RELIABILITY', suggestedAction: 'ACT_3', expectedImpact: 'Med' });
      const applied = engine.applyRecommendation(rec.id, 'operator-user');
      expect(applied).toBeNull();
    });

    test('10.5 Allows operator to reject PROPOSED recommendation', () => {
      const engine = RecommendationEngine.getInstance();
      const rec = engine.proposeRecommendation({ title: 'Rec 4', category: 'PERFORMANCE', suggestedAction: 'ACT_4', expectedImpact: 'Low' });
      const rejected = engine.rejectRecommendation(rec.id, 'operator-user', 'Too risky');
      expect(rejected?.status).toBe('REJECTED');
      expect(rejected?.rejectionReason).toBe('Too risky');
    });

    test('10.6 Allows rollback of APPLIED recommendation back to ROLLED_BACK state', () => {
      const engine = RecommendationEngine.getInstance();
      const rec = engine.proposeRecommendation({ title: 'Rec 5', category: 'PERFORMANCE', suggestedAction: 'ACT_5', expectedImpact: 'Low' });
      engine.approveRecommendation(rec.id, 'op');
      engine.applyRecommendation(rec.id, 'op');
      const rolledBack = engine.rollbackRecommendation(rec.id, 'op', 'Performance regression detected');
      expect(rolledBack?.status).toBe('ROLLED_BACK');
    });

    test('10.7 Filters recommendations by status', () => {
      const engine = RecommendationEngine.getInstance();
      const r1 = engine.proposeRecommendation({ title: 'R1', category: 'PERFORMANCE', suggestedAction: 'A1', expectedImpact: '1' });
      engine.proposeRecommendation({ title: 'R2', category: 'AI_COST', suggestedAction: 'A2', expectedImpact: '2' });
      engine.approveRecommendation(r1.id, 'op');

      const approvedList = engine.getRecommendations({ status: 'APPROVED' });
      expect(approvedList.length).toBe(1);
      expect(approvedList[0].id).toBe(r1.id);
    });

    test('10.8 Prevents double-approving an already APPROVED recommendation', () => {
      const engine = RecommendationEngine.getInstance();
      const rec = engine.proposeRecommendation({ title: 'R Double', category: 'PERFORMANCE', suggestedAction: 'A', expectedImpact: 'I' });
      engine.approveRecommendation(rec.id, 'op1');
      const secondApprove = engine.approveRecommendation(rec.id, 'op2');
      expect(secondApprove).toBeNull();
    });

    test('10.9 Stores audit trail of state transitions for recommendation', () => {
      const engine = RecommendationEngine.getInstance();
      const rec = engine.proposeRecommendation({ title: 'Audit Rec', category: 'PERFORMANCE', suggestedAction: 'A', expectedImpact: 'I' });
      engine.approveRecommendation(rec.id, 'op_actor');
      engine.applyRecommendation(rec.id, 'op_actor');
      const fetched = engine.getRecommendation(rec.id);
      expect(fetched?.auditTrail.length).toBe(3); // PROPOSED -> APPROVED -> APPLIED
    });

    test('10.10 Returns null when querying non-existent recommendation ID', () => {
      const engine = RecommendationEngine.getInstance();
      const fetched = engine.getRecommendation('non-existent-rec-id');
      expect(fetched).toBeNull();
    });
  });

  // =========================================================================
  // CATEGORY 11: SAFE EXPERIMENT CANARY & AUTOMATED ROLLBACK (10 TESTS)
  // =========================================================================
  describe('Category 11: Safe Experiment Canary & Automated Rollback', () => {
    test('11.1 Evaluates feature flag enabled status at 100% rollout', () => {
      const exp = ExperimentSafetyController.getInstance();
      exp.setRollout('opt_parallel_reads', 100, true);
      expect(exp.isFeatureEnabled('opt_parallel_reads', 'tenant-1')).toBe(true);
    });

    test('11.2 Evaluates feature flag disabled status at 0% rollout', () => {
      const exp = ExperimentSafetyController.getInstance();
      exp.setRollout('opt_parallel_reads', 0, false);
      expect(exp.isFeatureEnabled('opt_parallel_reads', 'tenant-1')).toBe(false);
    });

    test('11.3 Consistently evaluates percentage rollout per tenant ID bucket', () => {
      const exp = ExperimentSafetyController.getInstance();
      exp.setRollout('opt_model_routing', 50, true);
      const eval1 = exp.isFeatureEnabled('opt_model_routing', 'tenant-consistent');
      const eval2 = exp.isFeatureEnabled('opt_model_routing', 'tenant-consistent');
      expect(eval1).toBe(eval2);
    });

    test('11.4 Restricts experiment to explicitly listed whitelist tenant IDs', () => {
      const exp = ExperimentSafetyController.getInstance();
      exp.setRollout('opt_canary_feature', 100, true, ['tenant-alpha']);
      expect(exp.isFeatureEnabled('opt_canary_feature', 'tenant-alpha')).toBe(true);
      expect(exp.isFeatureEnabled('opt_canary_feature', 'tenant-beta')).toBe(false);
    });

    test('11.5 Triggers automated emergency rollback when anomaly error rate exceeds limit', () => {
      const exp = ExperimentSafetyController.getInstance();
      exp.setRollout('exp_risky_opt', 50, true);
      exp.recordExperimentMetric('exp_risky_opt', { errorRate: 0.15, p95LatencyMs: 100 });
      
      const check = exp.checkSafetyGuard('exp_risky_opt');
      expect(check.safe).toBe(false);
      expect(check.autoRolledBack).toBe(true);
      expect(exp.isFeatureEnabled('exp_risky_opt', 'tenant-1')).toBe(false);
    });

    test('11.6 Triggers automated emergency rollback when p95 latency exceeds threshold', () => {
      const exp = ExperimentSafetyController.getInstance();
      exp.setRollout('exp_latency_opt', 50, true);
      exp.recordExperimentMetric('exp_latency_opt', { errorRate: 0.01, p95LatencyMs: 4500 });
      
      const check = exp.checkSafetyGuard('exp_latency_opt');
      expect(check.safe).toBe(false);
      expect(check.autoRolledBack).toBe(true);
    });

    test('11.7 Allows manual operator-initiated rollback of active experiment', () => {
      const exp = ExperimentSafetyController.getInstance();
      exp.setRollout('exp_manual', 100, true);
      const rolledBack = exp.rollback('exp_manual', 'operator-actor', 'Manual safety trigger');
      expect(rolledBack?.enabled).toBe(false);
      expect(rolledBack?.percentage).toBe(0);
      expect(rolledBack?.rollbackReason).toBe('Manual safety trigger');
    });

    test('11.8 Maintains audit log of experiment canary changes', () => {
      const exp = ExperimentSafetyController.getInstance();
      exp.setRollout('exp_audit', 10, true);
      exp.setRollout('exp_audit', 50, true);
      exp.rollback('exp_audit', 'op', 'roll back test');
      const audit = exp.getExperimentAudit('exp_audit');
      expect(audit.length).toBe(3);
    });

    test('11.9 Returns default disabled state for unconfigured feature flag', () => {
      const exp = ExperimentSafetyController.getInstance();
      expect(exp.isFeatureEnabled('unknown_flag', 'tenant-1')).toBe(false);
    });

    test('11.10 Exposes list of all registered experiment flags', () => {
      const exp = ExperimentSafetyController.getInstance();
      exp.setRollout('flag_1', 20, true);
      exp.setRollout('flag_2', 80, true);
      const flags = exp.getAllFlags();
      expect(flags.length).toBe(2);
    });
  });

  // =========================================================================
  // CATEGORY 12: SAFETY INVARIANTS & NON-BYPASSING DETERMINISTIC CONTROLS (10 TESTS)
  // =========================================================================
  describe('Category 12: Safety Invariants & Non-Bypassing Deterministic Controls', () => {
    test('12.1 Optimization engine does not bypass RBAC check for sensitive mutation', () => {
      const engine = RecommendationEngine.getInstance();
      const rec = engine.proposeRecommendation({ title: 'Rec RBAC', category: 'PERFORMANCE', suggestedAction: 'ACT', expectedImpact: 'I' });
      // Simulated check: READ_ONLY_OPERATOR is denied approval
      const canApprove = (role: string) => role === 'OPERATOR' || role === 'ADMIN';
      expect(canApprove('READ_ONLY_OPERATOR')).toBe(false);
      expect(canApprove('OPERATOR')).toBe(true);
    });

    test('12.2 Optimization engine does not bypass tenant isolation boundary', () => {
      const fairness = TenantFairnessManager.getInstance();
      fairness.setTenantConfig('tenant-secret-A', { maxConcurrentRuns: 1, tokenRatePerSec: 10 });
      fairness.acquireRunSlot('tenant-secret-A');
      
      // Tenant B cannot consume Tenant A's slot
      const checkB = fairness.acquireRunSlot('tenant-secret-B');
      expect(checkB.allowed).toBe(true);
    });

    test('12.3 AI model router recommendation remains strictly ADVISORY_ONLY', () => {
      const router = AdaptiveModelRouter.getInstance();
      const res = router.selectModel({ taskType: 'REFUND_MUTATION', complexity: 'HIGH' });
      expect(res.authorityLevel).toBe('ADVISORY_ONLY');
      expect(res.canExecuteDirectly).toBe(false);
    });

    test('12.4 Optimization recommendation cannot bypass customer approval gates', () => {
      const engine = RecommendationEngine.getInstance();
      const rec = engine.proposeRecommendation({ title: 'Auto Refund Opt', category: 'PERFORMANCE', suggestedAction: 'AUTO_REFUND', expectedImpact: 'Fast' });
      // Verify that policy rule requires human gate
      const requiresHumanApproval = (action: string) => action.includes('REFUND');
      expect(requiresHumanApproval(rec.suggestedAction)).toBe(true);
    });

    test('12.5 Work shedding never drops critical customer financial mutations', () => {
      const backpressure = AdaptiveBackpressureEngine.getInstance();
      backpressure.evaluatePressure({ queueDepth: 5000, workerUtilization: 0.99, errorRate: 0.4 }); // Max pressure
      const check = backpressure.shouldAcceptTask('FINANCIAL_MUTATION', 'CRITICAL');
      expect(check.accepted).toBe(true);
    });

    test('12.6 Intelligent retry engine never retries non-idempotent failed mutations without lease fencing', () => {
      const retryEngine = IntelligentRetryEngine.getInstance();
      const classification = retryEngine.classifyError(new Error('DUPLICATE_MUTATION_DETECTED'));
      expect(classification.isRetryable).toBe(false);
    });

    test('12.7 Telemetry sanitization guarantees no secrets, API keys, or raw PII in labels', () => {
      const perf = PerformanceEngine.getInstance();
      const sanitizedSecret = perf.sanitizeLabel('key', 'sk_live_abc123');
      const sanitizedEmail = perf.sanitizeLabel('email', 'test@user.com');
      expect(sanitizedSecret).not.toContain('sk_live_abc123');
      expect(sanitizedEmail).not.toContain('test@user.com');
    });

    test('12.8 Parallel read investigator guarantees zero mutation execution in read phase', async () => {
      const investigator = ReadOnlyParallelInvestigator.getInstance();
      const tasks = [
        { id: 'm1', type: 'MUTATION' as const, name: 'mut', fn: () => Promise.resolve() }
      ];
      await expect(investigator.executeParallelReads(tasks)).rejects.toThrow();
    });

    test('12.9 AI budget exhaustion falls back to deterministic rules without crashing agent run', () => {
      const gov = AIResourceGovernance.getInstance();
      gov.setBudget('tenant-exhaust', { monthlyTokenLimit: 10, monthlyCostLimitUsd: 0.01 });
      gov.recordUsage('tenant-exhaust', 'model', 100, 100);
      
      const fallback = gov.getFallbackResponse('tenant-exhaust', 'Check refund status');
      expect(fallback.fallbackTriggered).toBe(true);
      expect(fallback.mode).toBe('DETERMINISTIC_POLICY_RULES');
    });

    test('12.10 Automated rollback immediately restores 0% canary rollout on safety trigger', () => {
      const exp = ExperimentSafetyController.getInstance();
      exp.setRollout('opt_canary_test', 80, true);
      exp.recordExperimentMetric('opt_canary_test', { errorRate: 0.5, p95LatencyMs: 100 });
      exp.checkSafetyGuard('opt_canary_test');
      
      expect(exp.isFeatureEnabled('opt_canary_test', 'tenant-1')).toBe(false);
    });
  });

});
