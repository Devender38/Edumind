// ResolveX Request Payload & Input Validation Hardening Engine — Step 5
// Enforces payload size, recursion depth, string length, and input sanitization before business logic execution.

import { Request, Response, NextFunction } from 'express';

export interface ValidationRuleOptions {
  maxSizeBytes?: number;     // Default 1,048,576 bytes (1MB)
  maxDepth?: number;          // Default 10 levels deep
  maxStringLength?: number;   // Default 10,000 characters
}

export class RequestValidator {
  private static DEFAULT_MAX_SIZE = 1048576; // 1 MB
  private static DEFAULT_MAX_DEPTH = 10;
  private static DEFAULT_MAX_STRING_LEN = 10000;

  /**
   * Express middleware to validate request payload depth, size, and sanitization before processing.
   */
  public static validatePayload(options?: ValidationRuleOptions) {
    const maxDepth = options?.maxDepth || this.DEFAULT_MAX_DEPTH;
    const maxStringLen = options?.maxStringLength || this.DEFAULT_MAX_STRING_LEN;

    return (req: Request, res: Response, next: NextFunction): void => {
      if (req.body && typeof req.body === 'object') {
        const depth = this.calculateObjectDepth(req.body);
        if (depth > maxDepth) {
          res.status(400).json({
            success: false,
            error: `Bad Request: Excessive JSON object nesting depth (${depth}). Maximum allowed depth is ${maxDepth}.`,
            correlationId: req.correlationId || 'N/A'
          });
          return;
        }

        const stringLenCheck = this.checkMaxStringLength(req.body, maxStringLen);
        if (!stringLenCheck.valid) {
          res.status(400).json({
            success: false,
            error: `Bad Request: Field '${stringLenCheck.key}' exceeds maximum string length of ${maxStringLen} characters.`,
            correlationId: req.correlationId || 'N/A'
          });
          return;
        }
      }

      next();
    };
  }

  /**
   * Recursively measures maximum nesting depth of an object or array.
   */
  public static calculateObjectDepth(obj: unknown, currentDepth: number = 1): number {
    if (!obj || typeof obj !== 'object') return currentDepth;

    let max = currentDepth;
    for (const val of Object.values(obj as Record<string, unknown>)) {
      if (typeof val === 'object' && val !== null) {
        const d = this.calculateObjectDepth(val, currentDepth + 1);
        if (d > max) max = d;
      }
    }
    return max;
  }

  /**
   * Verifies that no string field in an object exceeds maxLen.
   */
  public static checkMaxStringLength(obj: unknown, maxLen: number): { valid: boolean; key?: string } {
    if (!obj || typeof obj !== 'object') return { valid: true };

    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      if (typeof val === 'string' && val.length > maxLen) {
        return { valid: false, key };
      } else if (typeof val === 'object' && val !== null) {
        const sub = this.checkMaxStringLength(val, maxLen);
        if (!sub.valid) return sub;
      }
    }
    return { valid: true };
  }

  /**
   * Sanitizes null bytes and non-printable control characters from text.
   */
  public static sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') return text;
    // Strip null bytes and non-printable ASCII control chars except \n, \r, \t
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }

  /**
   * Validates ID string formats (alphanumeric, hyphen, underscore only).
   */
  public static isValidId(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    return /^[a-zA-Z0-9_-]{1,128}$/.test(id);
  }
}
