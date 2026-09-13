// ResolveX Security & Principal Architecture — Phase 16

export type PrincipalType = 'CUSTOMER' | 'USER' | 'SERVICE';
export type PrincipalRole = 'CUSTOMER' | 'OPERATOR' | 'APPROVER' | 'ADMIN' | 'SERVICE';

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
