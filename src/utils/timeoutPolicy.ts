// ResolveX Centralized Timeout Policy Engine

import { ResolveXError } from './errors.js';

export class TimeoutPolicy {
  public static readonly DEFAULT_TIMEOUT_MS = 15000; // 15 seconds

  /**
   * Wraps an async promise execution in a bounded timeout.
   */
  public static async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = this.DEFAULT_TIMEOUT_MS,
    operationName: string = 'Operation'
  ): Promise<T> {
    let timeoutTimer: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutTimer = setTimeout(() => {
        reject(
          new ResolveXError(
            `${operationName} timed out after ${timeoutMs}ms`,
            'TIMEOUT',
            504,
            { timeoutMs, operationName }
          )
        );
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutTimer!);
      return result;
    } catch (err) {
      clearTimeout(timeoutTimer!);
      throw err;
    }
  }
}
