// ResolveX Test Authorization Helpers — Phase 16

import { AuthService } from '../../src/auth/authService.js';
import { PrincipalRole } from '../../src/auth/types.js';

export function getAuthHeaders(role: PrincipalRole = 'SERVICE', customerId?: string, tenantId: string = 'tenant-a'): Record<string, string> {
  if (role === 'CUSTOMER') {
    if (tenantId === 'tenant-b' || customerId === 'cust-tenant-b-001') {
      return { Authorization: 'Bearer customer-b-token' };
    }
    return { Authorization: 'Bearer customer-a-token' };
  }

  if (role === 'OPERATOR') {
    return { Authorization: 'Bearer operator-a-token' };
  }

  if (role === 'APPROVER') {
    return { Authorization: 'Bearer approver-a-token' };
  }

  if (role === 'ADMIN') {
    if (tenantId === 'tenant-b') {
      return { Authorization: 'Bearer admin-b-token' };
    }
    return { Authorization: 'Bearer admin-a-token' };
  }

  if (role === 'SERVICE') {
    return { Authorization: 'Bearer service-resolver-token' };
  }

  // Generate dynamic signed token for custom combinations
  const token = AuthService.generateToken({
    id: `test-user-${Date.now()}`,
    type: 'USER',
    role,
    tenantId,
    customerId,
  });

  return { Authorization: `Bearer ${token}` };
}
