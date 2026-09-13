export type PrincipalType = 'CUSTOMER' | 'USER' | 'SERVICE';

export type PrincipalRole =
  | 'CUSTOMER'
  | 'OPERATOR'
  | 'READ_ONLY_OPERATOR'
  | 'APPROVER'
  | 'ADMIN'
  | 'SERVICE'
  | 'SYSTEM_ADMIN'
  | 'TENANT_ADMIN'
  | 'SECURITY_ADMIN'
  | 'SUPPORT_AGENT'
  | 'AUDITOR'
  | 'SERVICE_ACCOUNT';

export interface Principal {
  id: string;
  type: PrincipalType;
  role: PrincipalRole;
  tenantId: string;
  customerId?: string;
  scopes?: string[];
}

declare global {
  namespace Express {
    interface Request {
      principal?: Principal;
      correlationId?: string;
    }
  }
}
