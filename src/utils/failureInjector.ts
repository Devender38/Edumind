// ResolveX Failure Injection Framework for Reliability & Hardening Verification — Phase 18 Integration

import { Logger } from './logger.js';

export type FailurePoint =
  | 'BEFORE_TOOL'
  | 'AFTER_TOOL'
  | 'BEFORE_ACTION'
  | 'AFTER_ACTION_MUTATION'
  | 'BEFORE_VERIFICATION'
  | 'AFTER_VERIFICATION'
  | 'BEFORE_STATE_PERSIST'
  | 'AFTER_STATE_PERSIST'
  | 'BEFORE_LEASE_CLAIM'
  | 'AFTER_LEASE_CLAIM'
  | 'BEFORE_HEARTBEAT'
  | 'AFTER_HEARTBEAT'
  | 'BEFORE_RECOVERY'
  | 'AFTER_RECOVERY_CLAIM'
  | 'BEFORE_RESUME'
  | 'AFTER_RESUME'
  | 'BEFORE_FINAL_EXECUTION_STATE'
  | 'BEFORE_NOTIFICATION_CREATE'
  | 'AFTER_NOTIFICATION_CREATE'
  | 'BEFORE_NOTIFICATION_CLAIM'
  | 'AFTER_NOTIFICATION_CLAIM'
  | 'BEFORE_DELIVERY'
  | 'AFTER_DELIVERY'
  | 'BEFORE_NOTIFICATION_FINALIZE'
  | 'BEFORE_POLICY_SELECTION'
  | 'AFTER_POLICY_SELECTION'
  | 'BEFORE_POLICY_PERSIST'
  | 'AFTER_POLICY_PERSIST'
  | 'BEFORE_POLICY_ACTIVATION'
  | 'AFTER_POLICY_ACTIVATION'
  | 'BEFORE_POLICY_AUDIT'
  | 'AFTER_POLICY_AUDIT';

export interface FailureConfig {
  point: FailurePoint;
  target?: string; // e.g. toolName ('issueRefund'), actionType ('REFUND'), stepName
  errorToThrow?: Error;
  failOnce?: boolean;
}

export class FailureInjector {
  private static activeConfig: FailureConfig | null = null;
  private static injectionHistory: Array<{ point: FailurePoint; target?: string; timestamp: string }> = [];

  /**
   * Enables failure injection with a specific configuration (Test Mode Only).
   */
  public static enable(config: FailureConfig): void {
    this.activeConfig = {
      failOnce: true,
      errorToThrow: new Error(`INJECTED_FAILURE at ${config.point}${config.target ? ` (${config.target})` : ''}`),
      ...config,
    };
  }

  /**
   * Alias method for setting failure point with options.
   */
  public static setFailurePoint(point: FailurePoint, options?: { shouldFail?: boolean; errorMessage?: string }): void {
    if (options && options.shouldFail === false) {
      this.disable();
      return;
    }
    this.enable({
      point,
      errorToThrow: new Error(options?.errorMessage || `Injected DB Failure at ${point}`),
    });
  }

  /**
   * Disables failure injection and clears configuration.
   */
  public static disable(): void {
    this.activeConfig = null;
  }

  /**
   * Clears injection history and resets state.
   */
  public static reset(): void {
    this.activeConfig = null;
    this.injectionHistory = [];
  }

  /**
   * Returns whether failure injection is currently active.
   */
  public static isEnabled(): boolean {
    return this.activeConfig !== null || process.env.FAILURE_INJECTION_ENABLED === 'true';
  }

  /**
   * Returns injection history log for verification assertions.
   */
  public static getHistory() {
    return [...this.injectionHistory];
  }

  /**
   * Intercepts execution point. If a failure rule matches, injects failure and throws.
   */
  public static checkAndInject(point: FailurePoint, target?: string, metadata?: Record<string, any>): void {
    if (!this.activeConfig) return;

    // Disabled in normal production unless explicitly enabled via environment or test config
    if (process.env.NODE_ENV === 'production' && process.env.FAILURE_INJECTION_ENABLED !== 'true') {
      return;
    }

    const pointMatch = this.activeConfig.point === point;
    const targetMatch = !this.activeConfig.target || this.activeConfig.target === target;

    if (pointMatch && targetMatch) {
      const errorStr = this.activeConfig.errorToThrow?.message || `INJECTED_FAILURE at ${point}`;
      
      this.injectionHistory.push({
        point,
        target,
        timestamp: new Date().toISOString(),
      });

      Logger.warn({
        event: 'FAILURE_INJECTED' as any,
        message: `Failure Injection Triggered: ${errorStr}`,
        metadata: { point, target, ...metadata },
      });

      const err = this.activeConfig.errorToThrow || new Error(errorStr);

      if (this.activeConfig.failOnce) {
        this.activeConfig = null; // Auto-disable after single injection
      }

      throw err;
    }
  }
}
