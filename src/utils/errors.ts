// ResolveX Operational Error Classification Helper

import { ErrorCode } from '../types/index.js';

export class ResolveXError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, code: ErrorCode = 'INTERNAL_ERROR', statusCode = 500, details?: any) {
    super(message);
    this.name = 'ResolveXError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function classifyError(error: any): { code: ErrorCode; statusCode: number; message: string } {
  if (error instanceof ResolveXError) {
    return {
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  const msg = error?.message || String(error);
  const lowerMsg = msg.toLowerCase();

  if (lowerMsg.includes('validation') || msg.includes('AGENT_RUN_NOT_FOUND') || lowerMsg.includes('not found') || lowerMsg.includes('missing')) {
    return { code: 'VALIDATION_ERROR', statusCode: 400, message: msg };
  }

  if (msg.includes('INVALID_STATE') || msg.includes('ILLEGAL_STATE_TRANSITION') || lowerMsg.includes('cannot resume') || lowerMsg.includes('concurrent')) {
    return { code: 'CONCURRENCY_CONFLICT', statusCode: 409, message: msg };
  }

  if (lowerMsg.includes('idempotency') || msg.includes('IDEMPOTENT')) {
    return { code: 'IDEMPOTENCY_CONFLICT', statusCode: 409, message: msg };
  }

  if (msg.includes('APPROVAL_REQUIRED') || msg.includes('CONSENT_REQUIRED')) {
    return { code: 'HUMAN_GATE', statusCode: 200, message: msg };
  }

  if (lowerMsg.includes('verification') || msg.includes('VERIFICATION_FAILED')) {
    return { code: 'VERIFICATION_FAILURE', statusCode: 422, message: msg };
  }

  if (lowerMsg.includes('policy') || lowerMsg.includes('threshold') || lowerMsg.includes('limit')) {
    return { code: 'POLICY_BLOCK', statusCode: 422, message: msg };
  }

  if (lowerMsg.includes('tool') || msg.includes('OUT_OF_STOCK')) {
    return { code: 'TOOL_FAILURE', statusCode: 500, message: msg };
  }

  return { code: 'INTERNAL_ERROR', statusCode: 500, message: msg };
}
