/**
 * Core type definitions for Step 2 Real External Integrations.
 */

export enum IntegrationType {
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  INVENTORY = 'INVENTORY',
  SHIPPING = 'SHIPPING',
  CRM = 'CRM',
  NOTIFICATION = 'NOTIFICATION'
}

export enum IntegrationMode {
  INTEGRATIONS_DISABLED = 'INTEGRATIONS_DISABLED',
  INTEGRATIONS_SANDBOX = 'INTEGRATIONS_SANDBOX',
  INTEGRATIONS_PRODUCTION = 'INTEGRATIONS_PRODUCTION'
}

export enum IntegrationOutcome {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  UNKNOWN_OUTCOME = 'UNKNOWN_OUTCOME',
  CIRCUIT_OPEN = 'CIRCUIT_OPEN',
  RATE_LIMITED = 'RATE_LIMITED',
  SKIPPED = 'SKIPPED'
}

export interface IntegrationContext {
  tenantId: string;
  agentRunId?: string;
  actionType: string;
  businessResourceId: string;
  sequence: number;
  correlationId: string;
  userId?: string;
  mode: IntegrationMode;
}

export interface IntegrationCommand<T = Record<string, unknown>> {
  operationName: string;
  payload: T;
  idempotencyKey: string;
}

export interface IntegrationResult<T = Record<string, unknown>> {
  success: boolean;
  outcome: IntegrationOutcome;
  operationId?: string;
  idempotencyKey: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
    rawStatus?: number;
  };
  durationMs: number;
  provider: string;
  timestamp: string;
}

export interface GroundTruthVerificationResult<T = Record<string, unknown>> {
  verified: boolean;
  resourceExists: boolean;
  currentState?: T;
  matchesExpectedState: boolean;
  details: string;
  timestamp: string;
}

export interface BaseIntegrationAdapter<C extends IntegrationCommand<any> = IntegrationCommand<any>, R = any> {
  readonly integrationType: IntegrationType;
  readonly providerName: string;

  execute(command: C, context: IntegrationContext): Promise<IntegrationResult<R>>;
  verify(operation: C, context: IntegrationContext): Promise<GroundTruthVerificationResult<R>>;
}
