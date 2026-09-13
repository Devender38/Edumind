// ResolveX Express Security, RBAC & Zero-Trust Tenant Isolation Middleware — Step 5 Hardened

import { Request, Response, NextFunction } from 'express';
import { AuthService } from './authService.js';
import { PrincipalRole } from './types.js';
import { SecurityLogger } from '../utils/securityLogger.js';
import { RateLimiter } from '../utils/rateLimiter.js';

/**
 * Authentication Middleware — Validates HTTP Authorization Bearer token / API key
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const correlationId = req.correlationId || (req.headers['x-correlation-id'] as string) || 'N/A';
  const authHeader = req.headers.authorization || (req.headers['x-api-key'] as string);

  // Rate Limiting check per IP for auth attempts
  const clientIp = req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';
  const limitCheck = RateLimiter.checkRateLimit(`auth:${clientIp}`, 100, 60000);

  if (!limitCheck.allowed) {
    SecurityLogger.logEvent('RATE_LIMITED_REQUEST', {
      correlationId,
      ip: clientIp,
      route: req.path,
      method: req.method,
      reason: 'Rate limit exceeded on authentication boundary',
    });
    res.status(429).json({
      success: false,
      error: 'Too Many Requests: Rate limit exceeded. Please try again later.',
      correlationId,
    });
    return;
  }

  if (!authHeader) {
    SecurityLogger.logEvent('AUTH_FAILURE', {
      correlationId,
      ip: clientIp,
      route: req.path,
      method: req.method,
      reason: 'Missing Authorization header or API key',
    });
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing authentication credentials.',
      correlationId,
    });
    return;
  }

  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : String(authHeader);

  const principal = AuthService.verifyToken(token);

  if (!principal) {
    SecurityLogger.logEvent('AUTH_FAILURE', {
      correlationId,
      ip: clientIp,
      route: req.path,
      method: req.method,
      reason: 'Invalid or expired token',
    });
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired authentication token.',
      correlationId,
    });
    return;
  }

  req.principal = principal;
  SecurityLogger.logEvent('AUTH_SUCCESS', {
    correlationId,
    principalId: principal.id,
    role: principal.role,
    tenantId: principal.tenantId,
    route: req.path,
    method: req.method,
  });

  next();
}

/**
 * Role-Based Access Control (RBAC) Middleware
 */
export function requireRole(allowedRoles: PrincipalRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const correlationId = req.correlationId || 'N/A';
    const principal = req.principal;

    if (!principal) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required.',
        correlationId,
      });
      return;
    }

    if (!allowedRoles.includes(principal.role)) {
      SecurityLogger.logEvent('AUTHZ_DENIED', {
        correlationId,
        principalId: principal.id,
        role: principal.role,
        tenantId: principal.tenantId,
        route: req.path,
        method: req.method,
        reason: `Role '${principal.role}' is not in allowed roles [${allowedRoles.join(', ')}]`,
      });
      res.status(403).json({
        success: false,
        error: `Forbidden: Insufficient privileges. Required role: ${allowedRoles.join(' or ')}.`,
        correlationId,
      });
      return;
    }

    next();
  };
}

/**
 * Zero-Trust Tenant Isolation Middleware — Rejects request body/query/header tenant overrides
 */
export function requireTenantIsolation(req: Request, res: Response, next: NextFunction): void {
  const correlationId = req.correlationId || 'N/A';
  const principal = req.principal;

  if (!principal) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication required.',
      correlationId,
    });
    return;
  }

  // Check requested tenantId in body, query, or path parameters against authenticated identity
  const requestedTenant = req.body?.tenantId || req.query?.tenantId || req.params?.tenantId || req.headers['x-tenant-id'];

  if (requestedTenant && requestedTenant !== principal.tenantId) {
    SecurityLogger.logEvent('TENANT_VIOLATION', {
      correlationId,
      principalId: principal.id,
      principalTenant: principal.tenantId,
      requestedTenant: String(requestedTenant),
      route: req.path,
      method: req.method,
      reason: 'Cross-tenant access attempt detected and blocked',
    });
    res.status(403).json({
      success: false,
      error: `Forbidden: Cross-tenant access denied. Principal tenant '${principal.tenantId}' cannot access requested tenant '${requestedTenant}'.`,
      correlationId,
    });
    return;
  }

  // Strictly enforce principal tenantId on request body/query
  if (req.body && typeof req.body === 'object') {
    req.body.tenantId = principal.tenantId;
  }

  next();
}

/**
 * Customer Self-Or-Admin Authorization Guard — Prevents Customer A from reading/writing Customer B resources
 */
export function requireSelfOrAdmin(customerIdParam: string = 'customerId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const correlationId = req.correlationId || 'N/A';
    const principal = req.principal;

    if (!principal) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required.',
        correlationId,
      });
      return;
    }

    const targetCustomerId = req.params[customerIdParam] || req.body?.customerId || req.query?.customerId;

    if (principal.role === 'CUSTOMER') {
      if (targetCustomerId && principal.customerId !== targetCustomerId) {
        SecurityLogger.logEvent('IDOR_DENIED', {
          correlationId,
          principalId: principal.id,
          principalCustomerId: principal.customerId,
          targetCustomerId: String(targetCustomerId),
          route: req.path,
          method: req.method,
          reason: 'Customer attempted IDOR access to another customer resource',
        });
        res.status(403).json({
          success: false,
          error: 'Forbidden: IDOR protection prevented access to another customer resource.',
          correlationId,
        });
        return;
      }
    }

    next();
  };
}
