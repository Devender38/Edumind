// ResolveX Core Domain & Agent Types

export type AgentStep = 
  | 'GOAL_RECEIVED'
  | 'INTENT_CLASSIFICATION'
  | 'INVESTIGATION'
  | 'POLICY_EVALUATION'
  | 'DECISION_FORMULATION'
  | 'TOOL_EXECUTION'
  | 'ACTION_VERIFICATION'
  | 'REPLANNING'
  | 'CASE_RESOLVED'
  | 'HUMAN_ESCALATION';

export type AgentRunStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'VERIFYING'
  | 'REPLANNING'
  | 'COMPLETED'
  | 'ESCALATED'
  | 'FAILED';

export interface Customer {
  id: string;
  email: string;
  name: string;
  tier: 'STANDARD' | 'VIP' | 'PREMIUM';
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  totalAmount: number;
  status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  deliveredAt?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface Ticket {
  id: string;
  customerId: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
}

export interface AgentTraceItem {
  id: string;
  agentRunId: string;
  step: AgentStep;
  thought?: string;
  dataPayload?: Record<string, any>;
  timestamp: string;
}

export interface AgentRun {
  id: string;
  ticketId: string;
  currentState: AgentStep;
  status: AgentRunStatus;
  replanCount: number;
  createdAt: string;
  updatedAt: string;
  traces: AgentTraceItem[];
}

export interface HealthCheckResponse {
  status: 'ok' | 'error' | 'DRAINING';
  service: string;
  version: string;
  timestamp: string;
}

export interface ToolError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface ToolMetadata {
  toolName: string;
  executionId?: string;
  idempotencyKey?: string;
}

export interface ToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: ToolError;
  metadata?: ToolMetadata;
}

// Phase 5: Intent & Investigation Agent Types

export type IssueType =
  | 'DAMAGED_ITEM'
  | 'DEFECTIVE_ITEM'
  | 'MISSING_ITEM'
  | 'WRONG_ITEM'
  | 'LATE_DELIVERY'
  | 'CANCELLATION_REQUEST'
  | 'REFUND_REQUEST'
  | 'REPLACEMENT_REQUEST'
  | 'COUPON_REQUEST'
  | 'PAYMENT_ISSUE'
  | 'ORDER_STATUS'
  | 'GENERAL_SUPPORT'
  | 'UNKNOWN';

export type RequestedResolution =
  | 'REFUND'
  | 'REPLACEMENT'
  | 'CANCELLATION'
  | 'COUPON'
  | 'INFORMATION'
  | 'ESCALATION'
  | 'NONE'
  | 'UNKNOWN';

export interface IntentEntities {
  customerId?: string;
  orderId?: string;
  productId?: string;
  amount?: number;
  currency?: string;
  productName?: string;
}

export interface StructuredIntent {
  issueType: IssueType;
  requestedResolution: RequestedResolution;
  entities: IntentEntities;
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'FRUSTRATED';
  confidence: number;
  reasoningSummary: string;
  missingInformation: string[];
}

export interface EvidenceItem {
  source: string;
  toolUsed: string;
  entity: string;
  fact: string;
  isObservedFact: boolean;
  timestamp?: string;
}

export interface EligibilitySignal {
  signal: string;
  status: 'ELIGIBLE' | 'INELIGIBLE' | 'REQUIRES_APPROVAL';
  details: string;
}

export interface StructuredInvestigationResult {
  intent: StructuredIntent;
  customer?: any;
  order?: any;
  products?: any[];
  evidence: EvidenceItem[];
  eligibilitySignals: EligibilitySignal[];
  missingInformation: string[];
  investigationSummary: string;
  confidence: number;
  nextStep: 'POLICY_EVALUATION' | 'NEEDS_INFORMATION' | 'ESCALATION';
}

// Phase 6: Policy Engine & Decision Engine Types

export interface PolicyConditions {
  maxAutoRefundAmount?: number;
  requiresApprovalAbove?: boolean;
  preferReplacementFirst?: boolean;
  maxDaysPostDelivery?: number;
  allowedCustomerTiers?: string[];
  [key: string]: any;
}

export interface PolicyEvaluationItem {
  policyId: string;
  policyName: string;
  issueType: string;
  actionType: string;
  applicable: boolean;
  conditionsMatched: string[];
  conditionsFailed: string[];
  constraints: string[];
  approvalRequired: boolean;
  priority: number;
  reason: string;
}

export type CandidateActionType =
  | 'REFUND'
  | 'REPLACEMENT'
  | 'CANCELLATION'
  | 'COUPON'
  | 'ESCALATION'
  | 'INFORMATION'
  | 'NONE';

export type CandidateActionFeasibility =
  | 'FEASIBLE'
  | 'APPROVAL_REQUIRED'
  | 'BLOCKED'
  | 'REQUIRES_CUSTOMER_CONSENT';

export interface CandidateAction {
  actionType: CandidateActionType;
  eligible: boolean;
  feasibility: CandidateActionFeasibility;
  approvalRequired: boolean;
  priority: number;
  reason: string;
  supportingPolicies: string[];
  blockingReasons: string[];
  parameters?: Record<string, any>;
}

export interface PolicyEvaluationResult {
  applicablePolicies: PolicyEvaluationItem[];
  candidateActions: CandidateAction[];
  constraints: string[];
  approvalRequirements: string[];
  investigationSummary: string;
}

export type DecisionStatus =
  | 'AUTONOMOUSLY_ALLOWED'
  | 'APPROVAL_REQUIRED'
  | 'BLOCKED'
  | 'ESCALATION_REQUIRED'
  | 'INFORMATION_REQUIRED';

export interface DecisionExplanation {
  customerIntentSummary: string;
  policyEvaluationSummary: string;
  actionSelectionJustification: string;
  inventoryOrConstraintNote?: string;
}

export interface DecisionResult {
  decision: DecisionStatus;
  selectedAction: CandidateActionType;
  approvalRequired: boolean;
  confidence: number;
  reason: string;
  explanation: DecisionExplanation;
  supportingEvidence: EvidenceItem[];
  supportingPolicies: string[];
  blockedActions: { actionType: CandidateActionType; reason: string }[];
  alternatives: CandidateAction[];
}

// Phase 7: Action Execution & Ground-Truth Verification Types

export type ExecutionStatus =
  | 'EXECUTED'
  | 'APPROVAL_REQUIRED'
  | 'CUSTOMER_CONSENT_REQUIRED'
  | 'BLOCKED'
  | 'FAILED'
  | 'VERIFICATION_FAILED'
  | 'ALREADY_COMPLETED';

export interface ExecutionOptions {
  agentRunId?: string;
  correlationId?: string;
  idempotencyKey?: string;
  approvalToken?: string;
  customerConsentGiven?: boolean;
}

export interface ExecutionResult {
  status: ExecutionStatus;
  actionType: CandidateActionType;
  executed: boolean;
  toolName?: string;
  actionId?: string;
  externalReference?: string;
  error?: ToolError;
  reason?: string;
  approvalRequired?: boolean;
  customerConsentRequired?: boolean;
  verificationStatus?: 'SUCCESS' | 'FAILED' | 'PENDING';
  verificationDetails?: any;
  nextStep?: string;
  idempotencyKey?: string;
  timestamp: string;
}

// Phase 8: Failure Recovery & Autonomous Replanning Types

export type ReplanStatus =
  | 'RESOLVED'
  | 'WAIT_FOR_APPROVAL'
  | 'WAIT_FOR_CUSTOMER_CONSENT'
  | 'REPLANNED'
  | 'ESCALATION_REQUIRED'
  | 'UNRESOLVED';

export type FailureType =
  | 'APPROVAL_REQUIRED'
  | 'CUSTOMER_CONSENT_REQUIRED'
  | 'BLOCKED'
  | 'OUT_OF_STOCK'
  | 'TOOL_FAILURE'
  | 'VALIDATION_FAILURE'
  | 'ACTION_NOT_FOUND'
  | 'VERIFICATION_FAILED'
  | 'UNKNOWN_FAILURE';

export interface ReplanResult {
  status: ReplanStatus;
  reason: string;
  failureType?: FailureType;
  previousActionType?: CandidateActionType;
  nextActionType?: CandidateActionType;
  nextActionFeasibility?: CandidateActionFeasibility;
  requiresApproval?: boolean;
  requiresCustomerConsent?: boolean;
  shouldExecuteNextAction?: boolean;
  investigation?: StructuredInvestigationResult;
  decision?: DecisionResult;
  replannedFrom?: string;
  traceId?: string;
  nextStep?: string;
  replanCount?: number;
  executionResult?: ExecutionResult;
}

// Phase 9: Advanced Agent Orchestration Types

export type OrchestrationStatus =
  | 'RESOLVED'
  | 'WAITING_FOR_APPROVAL'
  | 'WAITING_FOR_CUSTOMER_CONSENT'
  | 'ESCALATED'
  | 'FAILED'
  | 'UNRESOLVED';

export interface OrchestrationInput {
  ticketId?: string;
  customerId?: string;
  orderId?: string;
  message?: string;
  goal?: string;
  agentRunId?: string;
  correlationId?: string;
  approvalToken?: string;
  customerConsentGiven?: boolean;
  idempotencyKey?: string;
  maxLoops?: number;
  tenantId?: string;
}

export interface AgentOrchestrationResult {
  status: OrchestrationStatus;
  currentStep: AgentStep;
  agentRunId?: string;
  correlationId?: string;
  ticketId?: string;
  intent?: StructuredIntent;
  investigation?: StructuredInvestigationResult;
  decision?: DecisionResult;
  execution?: ExecutionResult;
  recovery?: ReplanResult;
  resolution?: {
    confirmed: boolean;
    actionType?: CandidateActionType;
    actionId?: string;
    externalReference?: string;
    message?: string;
  };
  loopCount: number;
  replanCount: number;
  reason?: string;
}

// Phase 13: Operational Error Classification & Observability Types

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'POLICY_BLOCK'
  | 'HUMAN_GATE'
  | 'TOOL_FAILURE'
  | 'ACTION_FAILURE'
  | 'VERIFICATION_FAILURE'
  | 'RECOVERY_FAILURE'
  | 'CONCURRENCY_CONFLICT'
  | 'IDEMPOTENCY_CONFLICT'
  | 'TIMEOUT'
  | 'RECONCILIATION_REQUIRED'
  | 'INTERNAL_ERROR';

export interface OperatorRunFilter {
  status?: string;
  currentStep?: string;
  correlationId?: string;
  ticketId?: string;
  orderId?: string;
  staleOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface MutationSummary {
  attempted: number;
  executed: number;
  verified: number;
  verificationFailed: number;
}

export interface OperatorRunSummary {
  id: string;
  correlationId: string;
  ticketId: string;
  orderId?: string;
  status: string;
  currentStep: string;
  goal: string;
  replanCount: number;
  startedAt: string;
  completedAt?: string;
  updatedAt: string;
  pendingHumanGate?: 'WAITING_FOR_APPROVAL' | 'WAITING_FOR_CUSTOMER_CONSENT' | 'NONE';
  waitingReason?: string;
  mutations: MutationSummary;
}

export interface OperatorRunDetail extends OperatorRunSummary {
  traces: any[];
  actionRecords: any[];
  toolExecutions: any[];
  verificationResults: any[];
  escalations: any[];
  humanGateDetails?: {
    approvalRequired: boolean;
    customerConsentRequired: boolean;
    approvalGranted?: boolean;
    consentGranted?: boolean;
  };
}

export type StaleRunCategory = 'healthy' | 'waiting' | 'stale' | 'suspicious' | 'escalated';

export interface StaleRunHealthReport {
  summary: {
    totalRuns: number;
    healthy: number;
    waiting: number;
    stale: number;
    suspicious: number;
    escalated: number;
  };
  categorizedRuns: {
    staleRuns: OperatorRunSummary[];
    suspiciousRuns: OperatorRunSummary[];
    waitingRuns: OperatorRunSummary[];
  };
}







