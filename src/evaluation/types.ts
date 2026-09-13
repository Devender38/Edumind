// ResolveX Evaluation & Benchmarking System Types — Phase 15

import { AgentStep, ErrorCode } from '../types/index.js';

export interface GroundTruthCase {
  id: string;
  name: string;
  category:
    | 'LOW_VALUE_REFUND'
    | 'HIGH_VALUE_REFUND'
    | 'HIGH_VALUE_REJECTED'
    | 'REPLACEMENT_CONSENT'
    | 'CONSENT_GRANTED'
    | 'CONSENT_DENIED'
    | 'CANCELLATION'
    | 'VERIFICATION_FAILURE'
    | 'IDEMPOTENCY_DUPLICATE'
    | 'CONCURRENT_RESUME'
    | 'TOOL_FAILURE'
    | 'RETRY_EXHAUSTION'
    | 'ACTION_AMBIGUITY'
    | 'PROCESS_RESTART'
    | 'POLICY_BLOCK'
    | 'INVALID_INPUT'
    | 'FRAUD_RISK';
  input: {
    message: string;
    ticketId?: string;
    orderId?: string;
    customerId?: string;
    idempotencyKey?: string;
    approvalToken?: string;
    customerConsentGiven?: boolean;
    failureInjection?: {
      point: string;
      target?: string;
      failOnce?: boolean;
    };
  };
  expected: {
    intentIssueType?: string;
    requestedResolution?: string;
    policyEligible?: boolean;
    approvalRequired?: boolean;
    consentRequired?: boolean;
    selectedAction?: string;
    finalStatus: 'RESOLVED' | 'WAITING_FOR_APPROVAL' | 'WAITING_FOR_CUSTOMER_CONSENT' | 'ESCALATED' | 'FAILED';
    expectedMutations: number;
    verificationStatus?: 'SUCCESS' | 'FAILED' | 'NONE';
    replanCountMax?: number;
  };
}

export interface CaseEvaluationResult {
  caseId: string;
  caseName: string;
  category: string;
  passed: boolean;
  durationMs: number;

  // Granular Step Matches
  intentMatched: boolean;
  policyMatched: boolean;
  decisionMatched: boolean;
  actionMatched: boolean;
  resolutionMatched: boolean;
  verificationMatched: boolean;

  // Actual Observed Outputs
  actualIntent?: string;
  actualPolicyEligible?: boolean;
  actualSelectedAction?: string;
  actualStatus: string;
  actualMutations: number;
  actualVerificationStatus?: string;
  actualReplanCount: number;
  actualToolAttempts: number;

  // Safety Invariants Check
  safetyViolated: boolean;
  safetyViolations: string[];

  failureReason?: string;
  correlationId?: string;
  agentRunId?: string;
}

export interface EvaluationMetrics {
  totalCases: number;
  passedCases: number;
  failedCases: number;

  intentAccuracy: number; // %
  policyAccuracy: number; // %
  decisionAccuracy: number; // %
  actionAccuracy: number; // %
  resolutionAccuracy: number; // %

  safeResolutionRate: number; // %
  safeEscalationRate: number; // %
  recoverySuccessRate: number; // %
  retryExhaustionRate: number; // %

  meanToolAttempts: number;
  meanReplanAttempts: number;
  determinismRate: number; // %
}

export interface SafetyScore {
  status: 'PASS' | 'FAIL';
  falseResolutions: number;
  approvalBypasses: number;
  consentBypasses: number;
  duplicateMutations: number;
  verificationBypasses: number;
  illegalStateTransitions: number;
  infiniteLoops: number;
  violations: string[];
}

export interface PerformanceMetrics {
  totalDurationMs: number;
  averageCaseDurationMs: number;
  p95CaseDurationMs: number;
  slowestCases: Array<{ caseId: string; durationMs: number }>;
}

export interface EvaluationReport {
  evaluationId: string;
  timestamp: string;
  datasetVersion: string;
  summary: {
    totalCases: number;
    passedCases: number;
    failedCases: number;
    passPercentage: number;
    safetyStatus: 'PASS' | 'FAIL';
  };
  metrics: EvaluationMetrics;
  safetyScore: SafetyScore;
  performance: PerformanceMetrics;
  failures: Array<{
    caseId: string;
    caseName: string;
    category: string;
    failureReason: string;
    safetyViolated: boolean;
    actualStatus: string;
    expectedStatus: string;
  }>;
  cases: CaseEvaluationResult[];
}
