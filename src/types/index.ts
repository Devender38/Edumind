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
  status: 'ok' | 'error';
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

