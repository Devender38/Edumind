// ResolveX In-Memory Rate Limiter & Abuse Protection Engine — Phase 16
// NOTE: Process-local in-memory rate limiter for single instance / demo execution.
// MUST be replaced with a distributed store (e.g. Redis / Memcached) for multi-instance production deployment.

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private static store: Map<string, RateLimitRecord> = new Map();

  /**
   * Checks whether a request key (IP/Principal ID) exceeds the allowed window threshold.
   */
  public static checkRateLimit(
    key: string,
    maxRequests: number = 60,
    windowMs: number = 60000
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      const resetTime = now + windowMs;
      this.store.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: maxRequests - 1, resetTime };
    }

    if (record.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count += 1;
    this.store.set(key, record);
    return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
  }

  /**
   * Reset store (used for test setup)
   */
  public static resetStore(): void {
    this.store.clear();
  }

  public static clearAll(): void {
    this.resetStore();
  }
}
