// ResolveX Phase 23 — Core Application & Safety Metrics System

import { metricsRegistry } from './metricsRegistry.js';

// ----------------------------------------------------
// Metric Definitions Registration
// ----------------------------------------------------

export const metrics = {
  // 1. Agent Runs Metrics
  agentRunsTotal: metricsRegistry.registerCounter({
    name: 'resolvex_agent_run_total',
    help: 'Total agent runs executed by outcome',
    labelNames: ['tenant', 'status'],
  }),
  agentRunsResolvedTotal: metricsRegistry.registerCounter({
    name: 'resolvex_agent_runs_resolved_total',
    help: 'Total agent runs successfully resolved',
    labelNames: ['tenant'],
  }),
  agentRunsEscalatedTotal: metricsRegistry.registerCounter({
    name: 'resolvex_agent_runs_escalated_total',
    help: 'Total agent runs escalated to human operator',
    labelNames: ['tenant'],
  }),
  agentRunsFailedTotal: metricsRegistry.registerCounter({
    name: 'resolvex_agent_runs_failed_total',
    help: 'Total agent runs failed',
    labelNames: ['tenant'],
  }),
  agentRunsWaitingTotal: metricsRegistry.registerGauge({
    name: 'resolvex_agent_runs_waiting_total',
    help: 'Total agent runs currently waiting for human input',
    labelNames: ['tenant'],
  }),
  executionDuration: metricsRegistry.registerHistogram({
    name: 'resolvex_execution_duration_seconds',
    help: 'Execution duration seconds per phase',
    labelNames: ['phase'],
    buckets: [0.1, 0.5, 1.0, 5.0, 10.0],
  }),

  // 2. Case Lifecycle Metrics
  casesOpenTotal: metricsRegistry.registerGauge({
    name: 'resolvex_cases_open_total',
    help: 'Total customer cases currently open',
    labelNames: ['tenant'],
  }),

  // 3. Worker Health Metrics
  workerLeasesActive: metricsRegistry.registerGauge({
    name: 'resolvex_worker_leases_active',
    help: 'Active worker process count',
    labelNames: ['worker'],
  }),

  // 4. Notification Metrics
  notificationDeliveryTotal: metricsRegistry.registerCounter({
    name: 'resolvex_notification_delivery_total',
    help: 'Notification delivery counter by channel and status',
    labelNames: ['channel', 'status'],
  }),

  // 5. CRITICAL SAFETY METRICS (Target = 0)
  safetyFalseResolutions: metricsRegistry.registerCounter({
    name: 'resolvex_safety_false_resolutions_total',
    help: 'CRITICAL: False resolution safety violation count',
    labelNames: ['tenant'],
  }),
  safetyApprovalBypasses: metricsRegistry.registerCounter({
    name: 'resolvex_safety_approval_bypasses_total',
    help: 'CRITICAL: Approval gate bypass safety violation count',
    labelNames: ['tenant'],
  }),
  safetyCustomerConsentBypasses: metricsRegistry.registerCounter({
    name: 'resolvex_safety_customer_consent_bypasses_total',
    help: 'CRITICAL: Customer consent bypass safety violation count',
    labelNames: ['tenant'],
  }),
  safetyDuplicateMutations: metricsRegistry.registerCounter({
    name: 'resolvex_safety_duplicate_mutations_total',
    help: 'CRITICAL: Duplicate mutation safety violation count',
    labelNames: ['tenant'],
  }),
  safetyVerificationBypasses: metricsRegistry.registerCounter({
    name: 'resolvex_safety_verification_bypasses_total',
    help: 'CRITICAL: Action verification bypass safety violation count',
    labelNames: ['tenant'],
  }),
  safetyCrossTenantViolations: metricsRegistry.registerCounter({
    name: 'resolvex_safety_cross_tenant_violations_total',
    help: 'CRITICAL: Cross-tenant isolation violation count',
    labelNames: ['tenant'],
  }),
  safetyPolicyBypasses: metricsRegistry.registerCounter({
    name: 'resolvex_safety_policy_bypass_total',
    help: 'CRITICAL: Unauthorized policy bypass count',
    labelNames: ['tenant'],
  }),

  // 6. Integration Metrics (Step 2)
  integrationOperationsTotal: metricsRegistry.registerCounter({
    name: 'resolvex_integration_operations_total',
    help: 'Total integration operations executed by provider, operation and outcome',
    labelNames: ['provider', 'operation', 'outcome'],
  }),
  integrationDurationSeconds: metricsRegistry.registerHistogram({
    name: 'resolvex_integration_duration_seconds',
    help: 'Integration operation latency in seconds',
    labelNames: ['provider', 'operation'],
    buckets: [0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
  }),
  integrationCircuitState: metricsRegistry.registerGauge({
    name: 'resolvex_integration_circuit_state',
    help: 'Current integration circuit breaker state (0=CLOSED, 1=HALF_OPEN, 2=OPEN)',
    labelNames: ['provider'],
  }),
  integrationUnknownOutcomesTotal: metricsRegistry.registerCounter({
    name: 'resolvex_integration_unknown_outcomes_total',
    help: 'Total integration operations resulting in unknown outcome requiring ground truth verification',
    labelNames: ['provider'],
  }),

  // 7. AI / LLM Layer Metrics (Step 3)
  aiRequestsTotal: metricsRegistry.registerCounter({
    name: 'resolvex_ai_requests_total',
    help: 'Total AI requests dispatched by provider, operation and outcome',
    labelNames: ['provider', 'operation', 'outcome'],
  }),
  aiDurationSeconds: metricsRegistry.registerHistogram({
    name: 'resolvex_ai_duration_seconds',
    help: 'AI operation latency in seconds',
    labelNames: ['provider', 'operation'],
    buckets: [0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
  }),
  aiPromptInjectionTotal: metricsRegistry.registerCounter({
    name: 'resolvex_ai_prompt_injection_total',
    help: 'Total prompt injection attempts detected and blocked by AI guardrails',
    labelNames: ['tenant'],
  }),
  aiTokenUsageTotal: metricsRegistry.registerCounter({
    name: 'resolvex_ai_token_usage_total',
    help: 'Total AI token consumption by provider and token type (prompt/completion)',
    labelNames: ['provider', 'type'],
  }),
  aiCostUsdTotal: metricsRegistry.registerCounter({
    name: 'resolvex_ai_cost_usd_total',
    help: 'Total estimated AI cost in USD by provider',
    labelNames: ['provider'],
  }),
};

// Initialize default worker gauge
metrics.workerLeasesActive.set({ worker: 'default' }, 1);
