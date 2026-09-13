// ResolveX Centralized Bounded Retry Policy Engine

import { Logger } from './logger.js';
import { AgentStateRepository } from '../db/repositories/agentStateRepository.js';

export interface RetryOptions {
  maxAttempts?: number; // Default 3
  operationName: string;
  agentRunId?: string;
  correlationId?: string;
  verifyFirst?: () => Promise<{ verified: boolean; data?: any }>;
}

export class RetryPolicy {
  public static readonly DEFAULT_MAX_ATTEMPTS = 3;

  /**
   * Evaluates whether an error is retryable according to Phase 14 criteria.
   */
  public static isRetryable(error: any): boolean {
    if (!error) return false;
    const msg = (error?.message || String(error)).toLowerCase();
    const code = error?.code;

    // Non-retryable error categories
    if (
      code === 'POLICY_BLOCK' ||
      code === 'HUMAN_GATE' ||
      code === 'VALIDATION_ERROR' ||
      code === 'VERIFICATION_FAILURE' ||
      code === 'CONCURRENCY_CONFLICT' ||
      code === 'IDEMPOTENCY_CONFLICT' ||
      msg.includes('approval_required') ||
      msg.includes('consent_required') ||
      msg.includes('policy_block') ||
      msg.includes('verification_failed') ||
      msg.includes('illegal_state_transition')
    ) {
      return false;
    }

    // Retryable error categories
    if (
      code === 'TOOL_FAILURE' ||
      code === 'TIMEOUT' ||
      code === 'INFRASTRUCTURE_ERROR' ||
      msg.includes('timeout') ||
      msg.includes('transient') ||
      msg.includes('network') ||
      msg.includes('econnreset') ||
      msg.includes('injected_failure')
    ) {
      return true;
    }

    return true;
  }

  /**
   * Bounded retry execution wrapper with Verification-First handling.
   */
  public static async executeWithRetry<T>(
    fn: (attempt: number) => Promise<T>,
    options: RetryOptions
  ): Promise<T> {
    const maxAttempts = options.maxAttempts ?? this.DEFAULT_MAX_ATTEMPTS;
    let attempt = 1;

    while (attempt <= maxAttempts) {
      try {
        if (attempt > 1) {
          Logger.info({
            event: 'RETRY_STARTED' as any,
            correlationId: options.correlationId,
            agentRunId: options.agentRunId,
            message: `Retrying operation '${options.operationName}' (Attempt ${attempt}/${maxAttempts})`,
          });

          if (options.agentRunId) {
            await AgentStateRepository.appendTrace({
              agentRunId: options.agentRunId,
              step: 'TOOL_EXECUTION',
              type: 'ACTION',
              title: `Retry Attempt ${attempt}/${maxAttempts} Started`,
              description: `Retrying operation '${options.operationName}' after failure.`,
              input: { operationName: options.operationName, attempt, maxAttempts },
            }).catch(() => null);
          }
        }

        const result = await fn(attempt);

        if (attempt > 1) {
          Logger.info({
            event: 'RETRY_COMPLETED' as any,
            correlationId: options.correlationId,
            agentRunId: options.agentRunId,
            outcome: 'SUCCESS',
            message: `Operation '${options.operationName}' succeeded on attempt ${attempt}`,
          });

          if (options.agentRunId) {
            await AgentStateRepository.appendTrace({
              agentRunId: options.agentRunId,
              step: 'TOOL_EXECUTION',
              type: 'RESULT',
              title: `Retry Attempt ${attempt} Succeeded`,
              description: `Operation '${options.operationName}' succeeded on retry attempt ${attempt}.`,
              output: { attempt, status: 'SUCCESS' },
            }).catch(() => null);
          }
        }

        return result;
      } catch (err: any) {
        const retryable = this.isRetryable(err);

        Logger.warn({
          event: 'RETRY_SCHEDULED' as any,
          correlationId: options.correlationId,
          agentRunId: options.agentRunId,
          outcome: 'FAILED',
          message: `Attempt ${attempt}/${maxAttempts} for '${options.operationName}' failed: ${err.message}`,
          metadata: { attempt, maxAttempts, retryable, error: err.message },
        });

        // Verification-First check before deciding next retry
        if (options.verifyFirst) {
          try {
            const check = await options.verifyFirst();
            if (check.verified) {
              Logger.info({
                event: 'AMBIGUOUS_ACTION_OUTCOME' as any,
                correlationId: options.correlationId,
                agentRunId: options.agentRunId,
                message: `Ground-truth verification confirmed operation '${options.operationName}' succeeded despite exception.`,
              });

              if (options.agentRunId) {
                await AgentStateRepository.appendTrace({
                  agentRunId: options.agentRunId,
                  step: 'ACTION_VERIFICATION',
                  type: 'VERIFICATION',
                  title: 'Verification-First Ground Truth Confirmed',
                  description: `Ground-truth verification confirmed operation '${options.operationName}' succeeded. Skipping further retries.`,
                  output: { verified: true, data: check.data },
                }).catch(() => null);
              }

              return check.data as T;
            }
          } catch (vErr) {
            // Ignore verification error and proceed with standard policy
          }
        }

        if (!retryable || attempt >= maxAttempts) {
          Logger.error({
            event: 'RETRY_EXHAUSTED' as any,
            correlationId: options.correlationId,
            agentRunId: options.agentRunId,
            outcome: 'FAILED',
            message: `Retry policy exhausted for '${options.operationName}' after ${attempt} attempt(s).`,
            metadata: { totalAttempts: attempt, maxAttempts, finalError: err.message },
          });

          if (options.agentRunId) {
            await AgentStateRepository.appendTrace({
              agentRunId: options.agentRunId,
              step: 'TOOL_EXECUTION',
              type: 'FAILURE',
              title: `Retry Policy Exhausted (${options.operationName})`,
              description: `Failed after ${attempt} attempt(s): ${err.message}`,
              status: 'FAILED',
              output: { attempts: attempt, maxAttempts, error: err.message },
            }).catch(() => null);
          }

          throw err;
        }

        attempt += 1;
      }
    }

    throw new Error(`RETRY_EXHAUSTED: Operation '${options.operationName}' failed after ${maxAttempts} attempts`);
  }
}
