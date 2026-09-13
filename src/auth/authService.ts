// ResolveX Token & Principal Authentication Engine — Phase 16

import crypto from 'crypto';
import { Principal, PrincipalRole } from './types.js';

const AUTH_SECRET = process.env.RESOLVEX_AUTH_SECRET || 'resolvex-production-security-secret-key-32bytes-min';

export class AuthService {
  /**
   * Deterministic test tokens for automated test fixtures and CLI evaluation.
   */
  private static readonly PRESET_TOKENS: Record<string, Principal> = {
    'customer-a-token': {
      id: 'cust-primary-001',
      type: 'CUSTOMER',
      role: 'CUSTOMER',
      tenantId: 'tenant-a',
      customerId: 'cust-primary-001',
    },
    'customer-b-token': {
      id: 'cust-tenant-b-001',
      type: 'CUSTOMER',
      role: 'CUSTOMER',
      tenantId: 'tenant-b',
      customerId: 'cust-tenant-b-001',
    },
    'operator-a-token': {
      id: 'op-001',
      type: 'USER',
      role: 'OPERATOR',
      tenantId: 'tenant-a',
    },
    'approver-a-token': {
      id: 'appr-001',
      type: 'USER',
      role: 'APPROVER',
      tenantId: 'tenant-a',
    },
    'admin-a-token': {
      id: 'admin-001',
      type: 'USER',
      role: 'ADMIN',
      tenantId: 'tenant-a',
    },
    'admin-b-token': {
      id: 'admin-002',
      type: 'USER',
      role: 'ADMIN',
      tenantId: 'tenant-b',
    },
    'service-resolver-token': {
      id: 'service-001',
      type: 'SERVICE',
      role: 'SERVICE',
      tenantId: 'tenant-a',
    },
  };

  /**
   * Generates a signed Bearer Token for a principal with optional ttlMs
   */
  public static generateToken(principal: Principal, ttlMs: number = 24 * 60 * 60 * 1000): string {
    const payload = JSON.stringify({
      ...principal,
      iat: Date.now(),
      exp: Date.now() + ttlMs,
    });
    const base64Payload = Buffer.from(payload).toString('base64url');
    const signature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(base64Payload)
      .digest('base64url');
    return `${base64Payload}.${signature}`;
  }

  /**
   * Verifies and resolves an incoming token or preset key into a validated Principal
   */
  public static verifyToken(token: string): Principal | null {
    if (!token || typeof token !== 'string') return null;

    const trimmed = token.replace(/^Bearer\s+/i, '').trim();

    // Check preset deterministic test tokens
    if (this.PRESET_TOKENS[trimmed]) {
      return { ...this.PRESET_TOKENS[trimmed] };
    }

    const parts = trimmed.split('.');
    if (parts.length !== 2) return null;

    const [base64Payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(base64Payload)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    try {
      const decoded = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
      if (!decoded.id || !decoded.role || !decoded.tenantId) {
        return null;
      }
      if (decoded.exp && decoded.exp < Date.now()) {
        return null; // Expired token
      }
      return {
        id: decoded.id,
        type: decoded.type || 'USER',
        role: decoded.role as PrincipalRole,
        tenantId: decoded.tenantId,
        customerId: decoded.customerId,
        scopes: decoded.scopes || [],
      };
    } catch {
      return null;
    }
  }
}
