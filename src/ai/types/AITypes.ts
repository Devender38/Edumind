/**
 * Core type definitions for Step 3 Real AI / LLM Layer.
 */

export enum AIProviderMode {
  AI_DISABLED = 'AI_DISABLED',
  AI_SANDBOX = 'AI_SANDBOX',
  AI_LOCAL = 'AI_LOCAL',
  AI_PRODUCTION = 'AI_PRODUCTION'
}

export enum AIProductionState {
  AI_DISABLED = 'AI_DISABLED',
  AI_SANDBOX = 'AI_SANDBOX',
  AI_PRODUCTION_CONFIGURED = 'AI_PRODUCTION_CONFIGURED',
  AI_PRODUCTION_UNAVAILABLE = 'AI_PRODUCTION_UNAVAILABLE',
  AI_PRODUCTION_REQUEST_FAILED = 'AI_PRODUCTION_REQUEST_FAILED',
  AI_PRODUCTION_REQUEST_SUCCEEDED = 'AI_PRODUCTION_REQUEST_SUCCEEDED'
}

export enum AIOperationType {
  INTENT_CLASSIFICATION = 'INTENT_CLASSIFICATION',
  INVESTIGATION_ASSIST = 'INVESTIGATION_ASSIST',
  CUSTOMER_RESPONSE_DRAFT = 'CUSTOMER_RESPONSE_DRAFT'
}

export interface AIContext {
  tenantId: string;
  agentRunId?: string;
  correlationId: string;
  customerId?: string;
  orderId?: string;
  ticketId?: string;
  allowedPolicyMetadata?: string[];
  maxCallsPerRun?: number;
}

export interface AIRequest<T = Record<string, unknown>> {
  operationType: AIOperationType;
  promptVersion: string;
  systemPrompt: string;
  userMessage: string;
  contextData?: T;
  temperature?: number;
  maxTokens?: number;
  expectedSchemaName: string;
}

export interface AITokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd?: number;
}

export interface AIResponse<T = Record<string, unknown>> {
  success: boolean;
  provider: string;
  model: string;
  modelVersion?: string;
  promptVersion: string;
  data?: T;
  rawOutput?: string;
  confidence: number;
  tokenUsage?: AITokenUsage;
  latencyMs: number;
  injectionDetected?: boolean;
  injectionReason?: string;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
  timestamp: string;
}

export interface IntentLLMOutput {
  intent: 'REFUND' | 'REPLACEMENT' | 'CANCELLATION' | 'ORDER_STATUS' | 'SHIPPING' | 'PAYMENT' | 'DAMAGED_ITEM' | 'DEFECTIVE_ITEM' | 'MISSING_ITEM' | 'WRONG_ITEM' | 'LATE_DELIVERY' | 'COUPON' | 'GENERAL_SUPPORT' | 'UNKNOWN';
  confidence: number;
  entities: {
    orderId?: string;
    customerId?: string;
    productId?: string;
    productName?: string;
    amount?: number;
    currency?: string;
    reason?: string;
  };
  ambiguity: boolean;
  missingInformation?: string[];
  reasoning: string;
}

export interface CustomerResponseLLMOutput {
  message: string;
  tone: 'EMPATHETIC' | 'PROFESSIONAL' | 'DIRECT' | 'INFORMATIONAL';
  claims: string[];
  requiresClarification: boolean;
}
