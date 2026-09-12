import { ToolResult } from '../types/index.js';
import { prisma } from '../db/client.js';
import { AgentStateRepository } from '../db/repositories/agentStateRepository.js';

export interface BaseToolOptions {
  agentRunId?: string;
  idempotencyKey?: string;
}

export class BaseTool {
  /**
   * Check if an idempotency key has already been executed
   */
  static async checkIdempotency(idempotencyKey: string, toolName: string): Promise<ToolResult | null> {
    if (!idempotencyKey) return null;

    const existingExec = await prisma.toolExecution.findUnique({
      where: { idempotencyKey },
    });

    if (existingExec) {
      const outputData = existingExec.output ? JSON.parse(existingExec.output) : undefined;
      return {
        success: existingExec.status === 'SUCCESS',
        data: outputData,
        error: existingExec.error
          ? {
              code: 'IDEMPOTENT_DUPLICATE',
              message: existingExec.error,
              retryable: false,
            }
          : undefined,
        metadata: {
          toolName,
          executionId: existingExec.id,
          idempotencyKey,
        },
      };
    }

    return null;
  }

  /**
   * Helper to format successful tool response and log ToolExecution
   */
  static async formatSuccess<T>(
    toolName: string,
    data: T,
    options?: BaseToolOptions,
    inputPayload?: any
  ): Promise<ToolResult<T>> {
    let executionId: string | undefined;

    if (options?.agentRunId || options?.idempotencyKey) {
      const record = await AgentStateRepository.recordToolExecution({
        agentRunId: options?.agentRunId || 'standalone-execution',
        toolName,
        idempotencyKey: options?.idempotencyKey,
        input: inputPayload,
        output: data as any,
        status: 'SUCCESS',
      }).catch(() => null); // Silent fallback if standalone run without valid agentRunId FK

      if (record) executionId = record.id;
    }

    return {
      success: true,
      data,
      metadata: {
        toolName,
        executionId,
        idempotencyKey: options?.idempotencyKey,
      },
    };
  }

  /**
   * Helper to format failed tool response and log ToolExecution
   */
  static async formatError<T = any>(
    toolName: string,
    code: string,
    message: string,
    retryable: boolean = false,
    options?: BaseToolOptions,
    inputPayload?: any
  ): Promise<ToolResult<T>> {
    let executionId: string | undefined;

    if (options?.agentRunId || options?.idempotencyKey) {
      const record = await AgentStateRepository.recordToolExecution({
        agentRunId: options?.agentRunId || 'standalone-execution',
        toolName,
        idempotencyKey: options?.idempotencyKey,
        input: inputPayload,
        output: { code, message },
        status: 'FAILED',
        error: `${code}: ${message}`,
      }).catch(() => null);

      if (record) executionId = record.id;
    }

    return {
      success: false,
      error: {
        code,
        message,
        retryable,
      },
      metadata: {
        toolName,
        executionId,
        idempotencyKey: options?.idempotencyKey,
      },
    };
  }
}
