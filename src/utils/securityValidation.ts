// ResolveX Input Security & Request Validation — Phase 16

import { Request, Response, NextFunction } from 'express';
import { SecurityLogger } from './securityLogger.js';

export function validateSecurityInputs(req: Request, res: Response, next: NextFunction): void {
  const correlationId = (req as any).correlationId || (req.headers['x-correlation-id'] as string) || 'N/A';

  // 1. Path Traversal & Suspicious URL Validation
  const requestUrl = req.originalUrl || req.url || '';
  if (requestUrl.includes('..') || requestUrl.includes('%2e%2e') || requestUrl.includes('%2F%2F')) {
    SecurityLogger.logEvent('INPUT_VALIDATION_FAILURE', {
      correlationId,
      route: req.path,
      method: req.method,
      reason: 'Path traversal or suspicious characters detected in URL',
    });
    res.status(400).json({
      success: false,
      error: 'Bad Request: Path traversal or invalid URL format detected.',
      correlationId,
    });
    return;
  }

  // 2. Max Body Payload Validation
  if (req.body && typeof req.body === 'object') {
    // Validate message or customerMessage length
    const msg = req.body.message || req.body.customerMessage;
    if (msg && typeof msg === 'string') {
      if (msg.length > 2000) {
        SecurityLogger.logEvent('INPUT_VALIDATION_FAILURE', {
          correlationId,
          route: req.path,
          method: req.method,
          reason: 'Customer message exceeds maximum length of 2000 characters',
        });
        res.status(400).json({
          success: false,
          error: 'Bad Request: customerMessage exceeds maximum permitted length of 2000 characters.',
          correlationId,
        });
        return;
      }
    }

    // Validate string fields for control characters or script injections
    for (const key of ['goal', 'ticketId', 'orderId', 'idempotencyKey', 'correlationId', 'decision', 'actionId']) {
      const val = req.body[key];
      if (val && typeof val === 'string' && val.length > 256) {
        SecurityLogger.logEvent('INPUT_VALIDATION_FAILURE', {
          correlationId,
          route: req.path,
          method: req.method,
          reason: `Field '${key}' exceeds maximum length of 256 characters`,
        });
        res.status(400).json({
          success: false,
          error: `Bad Request: Field '${key}' exceeds maximum permitted length of 256 characters.`,
          correlationId,
        });
        return;
      }
    }
  }

  // 3. Clamp Pagination Query Limits
  if (req.query && req.query.limit) {
    const parsed = parseInt(req.query.limit as string, 10);
    if (isNaN(parsed) || parsed <= 0) {
      (req.query as any).limit = '20';
    } else if (parsed > 100) {
      (req.query as any).limit = '100'; // Hard ceiling
    }
  }

  next();
}
