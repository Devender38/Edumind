import { IntegrationContext, IntegrationMode } from './IntegrationTypes';

/**
 * Generates a deterministic idempotency key derived from:
 * tenantId + agentRunId + actionType + businessResourceId + sequence
 */
export function generateIdempotencyKey(context: IntegrationContext): string {
  const agentRun = context.agentRunId || 'standalone';
  const resource = context.businessResourceId || 'global';
  const seq = context.sequence ?? 1;
  return `${context.tenantId}-${agentRun}-${context.actionType}-${resource}-${seq}`;
}

/**
 * Creates an integration context with sensible defaults.
 */
export function createIntegrationContext(params: {
  tenantId: string;
  actionType: string;
  businessResourceId: string;
  agentRunId?: string;
  sequence?: number;
  correlationId?: string;
  userId?: string;
  mode?: IntegrationMode;
}): IntegrationContext {
  const envMode = process.env.INTEGRATION_MODE as IntegrationMode;
  const mode = params.mode || envMode || IntegrationMode.INTEGRATIONS_SANDBOX;

  return {
    tenantId: params.tenantId,
    agentRunId: params.agentRunId,
    actionType: params.actionType,
    businessResourceId: params.businessResourceId,
    sequence: params.sequence ?? 1,
    correlationId: params.correlationId || `corr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    userId: params.userId,
    mode
  };
}

/**
 * Sensitive field redaction utility for CRM chain-of-thought and payloads.
 */
export function redactSensitiveData<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item)) as unknown as T;
  }

  const sensitiveKeys = [
    'authorization',
    'bearer',
    'apikey',
    'api_key',
    'token',
    'secret',
    'password',
    'cardnumber',
    'card_number',
    'cvv',
    'ssn',
    'chainofthought',
    'chain_of_thought',
    'reasoning_internal'
  ];

  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(k => lowerKey.includes(k))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted as T;
}
