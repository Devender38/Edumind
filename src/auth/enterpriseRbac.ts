/**
 * ResolveX Step 9 — Enterprise RBAC & Role Hierarchy Engine
 * 
 * Supports 7 enterprise roles:
 *  - SYSTEM_ADMIN: Full system control across all tenants
 *  - TENANT_ADMIN: Full administrative control within tenant boundary
 *  - SECURITY_ADMIN: Security controls, rate limits, feature flags
 *  - OPERATOR: Execution approvals, optimization actions, rollbacks
 *  - SUPPORT_AGENT: Ticket inspection, user support actions
 *  - READ_ONLY_OPERATOR: Read-only inspection of metrics & runs
 *  - AUDITOR: Read-only compliance & audit log inspection
 * 
 * INVARIANTS:
 *  - Cross-tenant mutations strictly forbidden for non-SYSTEM_ADMIN
 *  - AUDITOR and READ_ONLY_OPERATOR cannot perform any state mutation
 *  - AI outputs cannot escalate privileges or bypass role checks
 */

export type EnterpriseRole = 
  | 'SYSTEM_ADMIN'
  | 'TENANT_ADMIN'
  | 'SECURITY_ADMIN'
  | 'OPERATOR'
  | 'SUPPORT_AGENT'
  | 'READ_ONLY_OPERATOR'
  | 'AUDITOR';

export interface SecurityUserContext {
  userId: string;
  tenantId: string;
  role: EnterpriseRole;
  email?: string;
  permissions?: string[];
}

export type ResourceAction = 
  | 'READ_RUN'
  | 'EXECUTE_RUN'
  | 'APPROVE_TRANSACTION'
  | 'APPLY_OPTIMIZATION'
  | 'MODIFY_SECURITY'
  | 'READ_AUDIT_LOG'
  | 'PURGE_TENANT_DATA'
  | 'CONFIGURE_BUDGET'
  | 'MODIFY_FEATURE_FLAGS'
  | 'CONFIGURE_RATE_LIMITS'
  | 'EXECUTE_ROLLBACK'
  | 'MANAGE_TENANT_QUOTAS'
  | 'REQUEUE_DEAD_LETTER';

export class EnterpriseRBAC {
  private static instance: EnterpriseRBAC | null = null;
  private auditTrail: Array<{
    actorId: string;
    tenantId: string;
    role: EnterpriseRole;
    userRole: EnterpriseRole;
    action: ResourceAction;
    targetResource: string;
    allowed: boolean;
    reason?: string;
    sequenceNumber: number;
    hash: string;
    timestamp: string;
  }> = [];

  private constructor() {}

  public static getInstance(): EnterpriseRBAC {
    if (!this.instance) {
      this.instance = new EnterpriseRBAC();
    }
    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Evaluates if user context has authority to perform target action on tenant resource
   */
  public authorize(
    user: SecurityUserContext,
    action: ResourceAction,
    targetTenantId: string,
    resourceId: string = 'global'
  ): { allowed: boolean; reason?: string } {
    // 1. Tenant Boundary Fencing Check
    if (user.role !== 'SYSTEM_ADMIN' && user.tenantId !== targetTenantId) {
      const result = { allowed: false, reason: `TENANT_ISOLATION_VIOLATION: User tenant '${user.tenantId}' cannot access resource tenant '${targetTenantId}'` };
      this.recordAudit(user, action, resourceId, false, result.reason);
      return result;
    }

    // 2. Read-Only / Auditor Mutation Guard
    if ((user.role === 'READ_ONLY_OPERATOR' || user.role === 'AUDITOR') && this.isMutationAction(action)) {
      const result = { allowed: false, reason: `FORBIDDEN: Role '${user.role}' is read-only and cannot perform mutation action '${action}'` };
      this.recordAudit(user, action, resourceId, false, result.reason);
      return result;
    }

    // 3. Action-Specific Role Permission Matrix
    let allowed = false;
    let reason: string | undefined;

    switch (action) {
      case 'READ_RUN':
      case 'READ_AUDIT_LOG':
        allowed = true;
        break;

      case 'EXECUTE_RUN':
        allowed = ['SYSTEM_ADMIN', 'TENANT_ADMIN', 'OPERATOR', 'SUPPORT_AGENT'].includes(user.role);
        if (!allowed) reason = `Role '${user.role}' cannot execute agent runs`;
        break;

      case 'APPROVE_TRANSACTION':
      case 'APPLY_OPTIMIZATION':
      case 'EXECUTE_ROLLBACK':
      case 'REQUEUE_DEAD_LETTER':
        allowed = ['SYSTEM_ADMIN', 'TENANT_ADMIN', 'OPERATOR'].includes(user.role);
        if (!allowed) reason = `Role '${user.role}' lacks privileged operator authority for '${action}'`;
        break;

      case 'MODIFY_SECURITY':
      case 'CONFIGURE_BUDGET':
      case 'MODIFY_FEATURE_FLAGS':
      case 'CONFIGURE_RATE_LIMITS':
        allowed = ['SYSTEM_ADMIN', 'TENANT_ADMIN', 'SECURITY_ADMIN'].includes(user.role);
        if (!allowed) reason = `Role '${user.role}' lacks security administration authority`;
        break;

      case 'PURGE_TENANT_DATA':
      case 'MANAGE_TENANT_QUOTAS':
        allowed = ['SYSTEM_ADMIN', 'TENANT_ADMIN'].includes(user.role);
        if (!allowed) reason = `Role '${user.role}' cannot execute '${action}'`;
        break;

      default:
        allowed = false;
        reason = `Unknown action '${action}'`;
    }

    this.recordAudit(user, action, resourceId, allowed, reason);
    return { allowed, reason };
  }

  private isMutationAction(action: ResourceAction): boolean {
    return [
      'EXECUTE_RUN',
      'APPROVE_TRANSACTION',
      'APPLY_OPTIMIZATION',
      'MODIFY_SECURITY',
      'PURGE_TENANT_DATA',
      'CONFIGURE_BUDGET',
      'MODIFY_FEATURE_FLAGS',
      'CONFIGURE_RATE_LIMITS',
      'EXECUTE_ROLLBACK',
      'MANAGE_TENANT_QUOTAS',
      'REQUEUE_DEAD_LETTER',
    ].includes(action);
  }

  private recordAudit(
    user: SecurityUserContext,
    action: ResourceAction,
    targetResource: string,
    allowed: boolean,
    reason?: string
  ): void {
    const sequenceNumber = this.auditTrail.length + 1;
    const prevHash = this.auditTrail.length > 0 ? this.auditTrail[this.auditTrail.length - 1].hash : '00000000';
    const hashData = `${sequenceNumber}:${user.userId}:${user.tenantId}:${action}:${targetResource}:${allowed}:${prevHash}`;

    // Simple deterministic hash calculation for audit entry integrity
    let h = 0;
    for (let i = 0; i < hashData.length; i++) {
      h = (h * 31 + hashData.charCodeAt(i)) >>> 0;
    }
    const hash = h.toString(16).padStart(8, '0');

    this.auditTrail.push({
      actorId: user.userId,
      tenantId: user.tenantId,
      role: user.role,
      userRole: user.role,
      action,
      targetResource,
      allowed,
      reason,
      sequenceNumber,
      hash,
      timestamp: new Date().toISOString(),
    });
  }

  public getAuditTrail(tenantId?: string): Array<any> {
    return tenantId ? this.auditTrail.filter((a) => a.tenantId === tenantId) : this.auditTrail;
  }

  public clearAuditTrail(): void {
    this.auditTrail = [];
  }
}
