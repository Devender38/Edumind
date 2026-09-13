/**
 * ResolveX Step 8 — Intelligent Failure Classification & Retry Optimization
 * 
 * Categorizes operational errors into:
 *  - TRANSIENT (e.g. Network timeout, Rate limit, 503 Service Unavailable)
 *  - PERMANENT (e.g. 404 Not Found, 400 Bad Request, Syntax error)
 *  - UNKNOWN_OUTCOME (Crash window ambiguity)
 *  - VALIDATION (Invalid input)
 *  - AUTHORIZATION (401/403 Permission denied)
 *  - POLICY (Policy threshold block)
 * 
 * ONLY TRANSIENT errors are eligible for automated bounded retries with exponential backoff & jitter.
 */

export type FailureCategory = 'TRANSIENT' | 'PERMANENT' | 'UNKNOWN_OUTCOME' | 'VALIDATION' | 'AUTHORIZATION' | 'POLICY';

export interface RetryPolicyResult {
  shouldRetry: boolean;
  category: FailureCategory;
  nextDelayMs: number;
  reason: string;
}

export class IntelligentRetryClassifier {
  public static classifyFailure(error: any): FailureCategory {
    const msg = String(error?.message || error || '').toLowerCase();
    const statusCode = error?.statusCode || error?.status || 500;

    if (statusCode === 429 || statusCode === 502 || statusCode === 503 || statusCode === 504 || msg.includes('timeout') || msg.includes('etimedout') || msg.includes('econnreset') || msg.includes('rate limit') || msg.includes('429')) {
      return 'TRANSIENT';
    }

    if (statusCode === 401 || statusCode === 403 || msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('permission denied')) {
      return 'AUTHORIZATION';
    }

    if (statusCode === 400 || msg.includes('validation') || msg.includes('invalid input') || msg.includes('bad request')) {
      return 'VALIDATION';
    }

    if (statusCode === 422 || msg.includes('policy') || msg.includes('threshold') || msg.includes('human_gate')) {
      return 'POLICY';
    }

    if (msg.includes('unknown_outcome') || msg.includes('unconfirmed')) {
      return 'UNKNOWN_OUTCOME';
    }

    return 'PERMANENT'; // Default safety fallback
  }


  public static evaluateRetry(error: any, currentAttempt: number, maxAttempts: number = 3): RetryPolicyResult {
    const category = this.classifyFailure(error);

    if (category !== 'TRANSIENT') {
      return {
        shouldRetry: false,
        category,
        nextDelayMs: 0,
        reason: `Non-transient failure category '${category}' MUST NOT be retried automatically.`,
      };
    }

    if (currentAttempt >= maxAttempts) {
      return {
        shouldRetry: false,
        category,
        nextDelayMs: 0,
        reason: `Max retry attempt limit (${maxAttempts}) exhausted for transient failure.`,
      };
    }

    // Exponential backoff with random jitter
    const baseDelay = 100 * Math.pow(2, currentAttempt - 1);
    const jitter = Math.random() * 50;
    const nextDelayMs = Math.round(baseDelay + jitter);

    return {
      shouldRetry: true,
      category,
      nextDelayMs,
      reason: `Transient failure eligible for retry attempt ${currentAttempt + 1}/${maxAttempts} with backoff ${nextDelayMs}ms.`,
    };
  }
}

export class IntelligentRetryEngine {
  private static instance: IntelligentRetryEngine;
  private transientRetries = 0;
  private permanentFailures = 0;

  private constructor() {}

  public static getInstance(): IntelligentRetryEngine {
    if (!IntelligentRetryEngine.instance) {
      IntelligentRetryEngine.instance = new IntelligentRetryEngine();
    }
    return IntelligentRetryEngine.instance;
  }

  public reset(): void {
    this.transientRetries = 0;
    this.permanentFailures = 0;
  }

  public classifyError(error: any): { category: FailureCategory; isRetryable: boolean } {
    const category = IntelligentRetryClassifier.classifyFailure(error);
    const isTransient = category === 'TRANSIENT';
    return {
      category: isTransient ? 'TRANSIENT' : 'PERMANENT',
      isRetryable: isTransient
    };
  }

  public calculateBackoffMs(attempt: number, baseMs: number = 100, maxMs: number = 2000): number {
    const delay = baseMs * Math.pow(2, attempt - 1);
    return Math.min(delay, maxMs);
  }

  public shouldRetry(error: any, attempt: number, maxAttempts: number = 3): boolean {
    const res = IntelligentRetryClassifier.evaluateRetry(error, attempt, maxAttempts);
    return res.shouldRetry;
  }

  public recordAttempt(error: any, isRetry: boolean): void {
    const category = IntelligentRetryClassifier.classifyFailure(error);
    if (category === 'TRANSIENT' && isRetry) this.transientRetries++;
    else if (category !== 'TRANSIENT') this.permanentFailures++;
  }


  public getRetryStats(): { transientRetries: number; permanentFailures: number } {
    return {
      transientRetries: this.transientRetries,
      permanentFailures: this.permanentFailures
    };
  }
}

