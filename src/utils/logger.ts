// ResolveX Production Observability — Structured Server Logger

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export type LogEventType =
  | 'RUN_STARTED'
  | 'RUN_RESUMED'
  | 'STATE_TRANSITION'
  | 'AGENT_STARTED'
  | 'AGENT_COMPLETED'
  | 'TOOL_STARTED'
  | 'TOOL_COMPLETED'
  | 'POLICY_EVALUATED'
  | 'DECISION_FORMULATED'
  | 'HUMAN_GATE_REACHED'
  | 'APPROVAL_GRANTED'
  | 'APPROVAL_REJECTED'
  | 'CONSENT_GRANTED'
  | 'CONSENT_DENIED'
  | 'ACTION_ATTEMPTED'
  | 'ACTION_EXECUTED'
  | 'ACTION_VERIFICATION_PASSED'
  | 'ACTION_VERIFICATION_FAILED'
  | 'RECOVERY_STARTED'
  | 'RECOVERY_COMPLETED'
  | 'RUN_RESOLVED'
  | 'RUN_ESCALATED'
  | 'RUN_FAILED'
  | 'TICKET_NOT_FOUND'
  | 'EXECUTION_QUEUED'
  | 'EXECUTION_STARTED'
  | 'EXECUTION_LEASE_ACQUIRED'
  | 'EXECUTION_LEASE_REJECTED'
  | 'EXECUTION_HEARTBEAT'
  | 'EXECUTION_WAITING'
  | 'EXECUTION_COMPLETED'
  | 'EXECUTION_FAILED'
  | 'EXECUTION_LEASE_EXPIRED'
  | 'EXECUTION_RECOVERED'
  | 'EXECUTION_CLAIM_CONFLICT'
  | 'EXECUTION_LEASE_LOST'
  | 'EXECUTION_FENCING_CONFLICT'
  | 'EXECUTION_STALE_RECOVERY'
  | 'EXECUTION_IDEMPOTENCY_HIT'
  | 'EXECUTION_TRANSACTION_ROLLBACK'
  | 'EXECUTION_RESUME_CONFLICT'
  | 'POLICY_CREATED'
  | 'POLICY_VERSION_CREATED'
  | 'POLICY_SUBMITTED'
  | 'POLICY_APPROVED'
  | 'POLICY_REJECTED'
  | 'POLICY_ACTIVATED'
  | 'POLICY_RETIRED'
  | 'POLICY_ROLLBACK'
  | 'POLICY_SELECTED'
  | 'POLICY_VERSION_PINNED'
  | 'POLICY_CHANGE_DENIED'
  | 'AFTER_POLICY_ACTIVATION_FAILURE'
  | 'EXECUTION_DUPLICATE_CLAIM'
  | 'WORKER_STARTING'
  | 'DURABLE_QUEUE_ENQUEUE'
  | 'DURABLE_QUEUE_ACK'
  | 'WORKER_SHUTTING_DOWN'
  | 'WORKER_STOPPED'
  | 'NOTIFICATION_QUEUED'
  | 'NOTIFICATION_CLAIMED'
  | 'NOTIFICATION_SENT'
  | 'NOTIFICATION_FAILED'
  | 'NOTIFICATION_RETRY'
  | 'NOTIFICATION_IDEMPOTENCY_HIT'
  | 'NOTIFICATION_ACCESS_DENIED'
  | 'NOTIFICATION_MARKED_READ'
  | 'NOTIFICATION_SAFETY_GATE_BLOCKED'
  | 'NOTIFICATION_SAFETY_GATE_PASSED'
  | 'INTEGRATION_EXECUTE_ATTEMPT'
  | 'INTEGRATION_EXECUTE_SUCCESS'
  | 'INTEGRATION_EXECUTE_FAILED'
  | 'INTEGRATION_UNKNOWN_OUTCOME'
  | 'INTEGRATION_VERIFY_ATTEMPT'
  | 'INTEGRATION_VERIFY_SUCCESS'
  | 'INTEGRATION_VERIFY_FAILED'
  | 'INTEGRATION_CIRCUIT_OPEN'
  | 'INTEGRATION_CIRCUIT_HALF_OPEN'
  | 'INTEGRATION_CIRCUIT_CLOSED'
  | 'INTEGRATION_RATE_LIMITED'
  | 'INTEGRATION_CRM_REDACTED'
  | 'AI_REQUESTED'
  | 'AI_COMPLETED'
  | 'AI_FAILED'
  | 'AI_TIMEOUT'
  | 'AI_INVALID_OUTPUT'
  | 'AI_SAFETY_REJECTED'
  | 'AI_LOW_CONFIDENCE'
  | 'AI_PROMPT_INJECTION_DETECTED'
  | 'AI_RECOMMENDATION_ACCEPTED'
  | 'AI_RECOMMENDATION_REJECTED'
  | 'AI_COST_LIMIT_EXCEEDED';

export interface StructuredLogPayload {
  event: LogEventType;
  correlationId?: string;
  agentRunId?: string;
  ticketId?: string;
  orderId?: string;
  currentState?: string;
  nextState?: string;
  outcome?: 'SUCCESS' | 'FAILED' | 'PENDING' | 'BLOCKED';
  message?: string;
  metadata?: Record<string, any>;
}

export class Logger {
  /**
   * Sanitizes sensitive fields from metadata to enforce zero credential leakage in logs.
   */
  public static sanitizeMetadata(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeMetadata(item));
    }

    const sanitized: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('approvaltoken') || lowerKey.includes('token')) {
        sanitized['approvalTokenProvided'] = Boolean(obj[key]);
      } else if (
        lowerKey.includes('password') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('creditcard')
      ) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = this.sanitizeMetadata(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
    return sanitized;
  }

  public static redactSensitiveData(obj: any): any {
    return this.sanitizeMetadata(obj);
  }

  private static log(level: LogLevel, payload: StructuredLogPayload): void {
    const sanitizedMetadata = payload.metadata ? this.sanitizeMetadata(payload.metadata) : undefined;
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      event: payload.event,
      correlationId: payload.correlationId || 'N/A',
      agentRunId: payload.agentRunId || 'N/A',
      ticketId: payload.ticketId || 'N/A',
      orderId: payload.orderId || 'N/A',
      currentState: payload.currentState || 'N/A',
      ...(payload.nextState ? { nextState: payload.nextState } : {}),
      ...(payload.outcome ? { outcome: payload.outcome } : {}),
      ...(payload.message ? { message: payload.message } : {}),
      ...(sanitizedMetadata ? { metadata: sanitizedMetadata } : {}),
    };

    const formattedPrefix = `[${logEntry.timestamp}] [${level}] [${logEntry.event}] [CORR:${logEntry.correlationId}] [RUN:${logEntry.agentRunId}]`;

    if (process.env.NODE_ENV !== 'test' || process.env.ENABLE_VERBOSE_LOGS === 'true') {
      if (level === 'ERROR') {
        console.error(`${formattedPrefix} ${payload.message || ''}`, sanitizedMetadata || '');
      } else if (level === 'WARN') {
        console.warn(`${formattedPrefix} ${payload.message || ''}`, sanitizedMetadata || '');
      } else {
        console.log(`${formattedPrefix} ${payload.message || ''}`);
      }
    }
  }

  public static info(payload: StructuredLogPayload): void {
    this.log('INFO', payload);
  }

  public static warn(payload: StructuredLogPayload): void {
    this.log('WARN', payload);
  }

  public static error(payload: StructuredLogPayload): void {
    this.log('ERROR', payload);
  }

  public static debug(payload: StructuredLogPayload): void {
    this.log('DEBUG', payload);
  }

  public static formatLog(event: LogEventType, metadata?: Record<string, any>): string {
    const sanitizedMetadata = metadata ? this.sanitizeMetadata(metadata) : undefined;
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      event,
      ...(sanitizedMetadata ? { metadata: sanitizedMetadata } : {}),
    });
  }
}
