// ResolveX Security Audit & Event Logging Engine — Phase 16

import { Logger } from './logger.js';

export type SecurityEventType =
  | 'AUTH_SUCCESS'
  | 'AUTH_FAILURE'
  | 'AUTHZ_DENIED'
  | 'CROSS_TENANT_ACCESS_DENIED'
  | 'APPROVAL_ATTEMPT'
  | 'CONSENT_ATTEMPT'
  | 'SESSION_OR_TOKEN_ISSUED'
  | 'RATE_LIMITED_REQUEST'
  | 'INPUT_VALIDATION_FAILURE';

export interface SecurityEventData {
  correlationId?: string;
  principalId?: string;
  role?: string;
  tenantId?: string;
  route?: string;
  method?: string;
  ip?: string;
  reason?: string;
  targetResourceId?: string;
}

export class SecurityLogger {
  /**
   * Log a security event while ensuring tokens/secrets are NEVER logged.
   */
  public static logEvent(event: SecurityEventType, data: SecurityEventData = {}): void {
    const correlationId = data.correlationId || 'N/A';

    // Redact any potential secret properties from metadata
    const safeMetadata: Record<string, any> = {
      event,
      principalId: data.principalId || 'UNAUTHENTICATED',
      role: data.role || 'NONE',
      tenantId: data.tenantId || 'UNKNOWN',
      route: data.route,
      method: data.method,
      ip: data.ip,
      reason: data.reason,
      targetResourceId: data.targetResourceId,
    };

    if (event === 'AUTH_FAILURE' || event === 'AUTHZ_DENIED' || event === 'CROSS_TENANT_ACCESS_DENIED') {
      Logger.warn({
        event: 'STATE_TRANSITION',
        correlationId,
        message: `SECURITY_AUDIT: ${event} [${data.method || ''} ${data.route || ''}] - ${data.reason || 'Access denied'}`,
        metadata: safeMetadata,
      });
    } else {
      Logger.info({
        event: 'STATE_TRANSITION',
        correlationId,
        message: `SECURITY_AUDIT: ${event} [Principal: ${data.principalId || 'N/A'}, Role: ${data.role || 'N/A'}]`,
        metadata: safeMetadata,
      });
    }
  }
}
