/**
 * Integration error handling & classification
 */

export class IntegrationError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly isTimeout: boolean;
  public readonly isAuthError: boolean;
  public readonly isRateLimit: boolean;
  public readonly isUnknownOutcome: boolean;
  public readonly rawStatus?: number;

  constructor(options: {
    message: string;
    code: string;
    retryable?: boolean;
    isTimeout?: boolean;
    isAuthError?: boolean;
    isRateLimit?: boolean;
    isUnknownOutcome?: boolean;
    rawStatus?: number;
    cause?: Error;
  }) {
    super(options.message);
    this.name = 'IntegrationError';
    this.code = options.code;
    this.retryable = options.retryable ?? false;
    this.isTimeout = options.isTimeout ?? false;
    this.isAuthError = options.isAuthError ?? false;
    this.isRateLimit = options.isRateLimit ?? false;
    this.isUnknownOutcome = options.isUnknownOutcome ?? false;
    this.rawStatus = options.rawStatus;

    if (options.cause) {
      this.cause = options.cause;
    }
    Object.setPrototypeOf(this, IntegrationError.prototype);
  }

  static fromHttpStatus(status: number, message: string, rawBody?: string): IntegrationError {
    if (status === 401 || status === 403) {
      return new IntegrationError({
        message: `Authentication/Authorization failed (${status}): ${message}`,
        code: 'INTEGRATION_AUTH_FAILED',
        retryable: false,
        isAuthError: true,
        rawStatus: status
      });
    }

    if (status === 429) {
      return new IntegrationError({
        message: `Rate limit exceeded (429): ${message}`,
        code: 'INTEGRATION_RATE_LIMIT',
        retryable: true,
        isRateLimit: true,
        rawStatus: status
      });
    }

    if (status === 408 || status === 504) {
      return new IntegrationError({
        message: `Integration timeout (${status}): ${message}`,
        code: 'INTEGRATION_TIMEOUT',
        retryable: true,
        isTimeout: true,
        isUnknownOutcome: true,
        rawStatus: status
      });
    }

    if (status >= 500) {
      return new IntegrationError({
        message: `Server error (${status}): ${message}`,
        code: 'INTEGRATION_SERVER_ERROR',
        retryable: true,
        rawStatus: status
      });
    }

    return new IntegrationError({
      message: `Integration request failed (${status}): ${message}`,
      code: 'INTEGRATION_CLIENT_ERROR',
      retryable: false,
      rawStatus: status
    });
  }
}
