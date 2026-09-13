import { prisma } from '../client';
import { prismaPg } from '../client.pg';
import { IntegrationOutcome } from '../../integrations/core/IntegrationTypes';

function getClient() {
  if (process.env.USE_PG_CLIENT === 'true' || process.env.DATABASE_URL_PG) {
    return prismaPg as any;
  }
  return prisma as any;
}

export interface RecordOperationParams {
  tenantId: string;
  agentRunId?: string;
  integrationType: string;
  providerName: string;
  operationName: string;
  idempotencyKey: string;
  correlationId?: string;
  status: string;
  outcome?: string;
  requestPayload?: any;
  responsePayload?: any;
  errorCode?: string;
  errorMessage?: string;
  durationMs?: number;
  attempts?: number;
}

export interface RecordVerificationParams {
  operationId: string;
  groundTruthVerified: boolean;
  groundTruthState?: any;
  groundTruthDetails?: string;
}

export class IntegrationRepository {
  /**
   * Persists a new IntegrationOperation record (or updates if idempotencyKey exists)
   */
  public static async recordOperation(params: RecordOperationParams) {
    const client = getClient();
    try {
      let validAgentRunId: string | null = null;
      if (params.agentRunId) {
        const runExists = await client.agentRun.findUnique({ where: { id: params.agentRunId } }).catch(() => null);
        if (runExists) validAgentRunId = params.agentRunId;
      }

      return await client.integrationOperation.upsert({
        where: { idempotencyKey: params.idempotencyKey },
        create: {
          tenantId: params.tenantId || 'tenant-a',
          agentRunId: validAgentRunId,
          integrationType: params.integrationType,
          provider: params.providerName || 'unknown',
          operationType: params.operationName || 'EXECUTE',
          idempotencyKey: params.idempotencyKey,
          status: params.status,
          attempt: params.attempts ?? 1,
          requestPayload: params.requestPayload ? JSON.stringify(params.requestPayload) : null,
          responsePayload: params.responsePayload ? JSON.stringify(params.responsePayload) : null,
          lastErrorClass: params.errorCode,
          lastErrorMessage: params.errorMessage
        },
        update: {
          status: params.status,
          responsePayload: params.responsePayload ? JSON.stringify(params.responsePayload) : null,
          lastErrorClass: params.errorCode,
          lastErrorMessage: params.errorMessage,
          attempt: { increment: 1 }
        }
      });
    } catch (err: any) {
      console.warn(`[IntegrationRepository] Error recording operation (${params.idempotencyKey}):`, err.message);
      return null;
    }
  }

  /**
   * Updates ground truth verification status for an existing IntegrationOperation record
   */
  public static async updateVerification(params: RecordVerificationParams) {
    const client = getClient();
    try {
      return await client.integrationOperation.update({
        where: { id: params.operationId },
        data: {
          verificationStatus: params.groundTruthVerified ? 'PASSED' : 'FAILED',
          verifiedAt: new Date(),
          responsePayload: params.groundTruthState ? JSON.stringify(params.groundTruthState) : undefined
        }
      });
    } catch (err: any) {
      console.warn(`[IntegrationRepository] Error updating verification for operation ${params.operationId}:`, err.message);
      return null;
    }
  }

  /**
   * Retrieves an operation by idempotencyKey
   */
  public static async findByIdempotencyKey(idempotencyKey: string) {
    const client = getClient();
    try {
      return await client.integrationOperation.findUnique({
        where: { idempotencyKey }
      });
    } catch (err: any) {
      return null;
    }
  }

  /**
   * Saves or updates Circuit Breaker state
   */
  public static async recordCircuitState(params: {
    providerName: string;
    state: string;
    failureCount: number;
    lastFailureAt?: Date;
    lastStateChangeAt?: Date;
  }) {
    const client = getClient();
    try {
      return await client.integrationCircuitState.upsert({
        where: { provider: params.providerName },
        create: {
          provider: params.providerName,
          state: params.state,
          consecutiveFailures: params.failureCount,
          lastFailureAt: params.lastFailureAt,
          lastStateChange: params.lastStateChangeAt || new Date()
        },
        update: {
          state: params.state,
          consecutiveFailures: params.failureCount,
          lastFailureAt: params.lastFailureAt,
          lastStateChange: params.lastStateChangeAt || new Date()
        }
      });
    } catch (err: any) {
      console.warn(`[IntegrationRepository] Error recording circuit state for ${params.providerName}:`, err.message);
      return null;
    }
  }

  /**
   * Retrieves Circuit Breaker state for a provider
   */
  public static async getCircuitState(providerName: string) {
    const client = getClient();
    try {
      return await client.integrationCircuitState.findUnique({
        where: { provider: providerName }
      });
    } catch (err: any) {
      return null;
    }
  }

  /**
   * Queries operations for a given tenant / agentRunId
   */
  public static async listOperations(params: { tenantId?: string; agentRunId?: string; limit?: number }) {
    const client = getClient();
    try {
      const where: any = {};
      if (params.tenantId) where.tenantId = params.tenantId;
      if (params.agentRunId) where.agentRunId = params.agentRunId;

      return await client.integrationOperation.findMany({
        where,
        take: params.limit || 50,
        orderBy: { createdAt: 'desc' }
      });
    } catch (err: any) {
      return [];
    }
  }
}
