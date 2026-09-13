// ResolveX Express Security, RBAC & Tenant Isolation Middleware — Phase 16

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
