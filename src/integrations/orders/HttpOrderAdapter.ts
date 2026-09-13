import { OrderAdapter, OrderCommand, OrderResourceData } from './OrderAdapter';
import { IntegrationType, IntegrationOutcome, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';
import { HardenedHttpClient } from '../core/HttpClient';
import { IntegrationError } from '../core/IntegrationError';
import { generateIdempotencyKey } from '../core/IntegrationContext';

export class HttpOrderAdapter implements OrderAdapter {
  public readonly integrationType = IntegrationType.ORDER;
  public readonly providerName: string;
  private readonly client: HardenedHttpClient;

  constructor(options: { baseURL: string; apiKey?: string; providerName?: string; customFetch?: typeof fetch }) {
    this.providerName = options.providerName || 'http-order-provider';
    this.client = new HardenedHttpClient({
      baseURL: options.baseURL,
      customFetch: options.customFetch
    });
  }

  async getOrder(orderId: string, context: IntegrationContext): Promise<IntegrationResult<OrderResourceData>> {
    return this.execute({
      operationName: 'GET_ORDER',
      payload: { orderId },
      idempotencyKey: generateIdempotencyKey(context)
    }, context);
  }

  async cancelOrder(orderId: string, reason: string, context: IntegrationContext): Promise<IntegrationResult<OrderResourceData>> {
    return this.execute({
      operationName: 'CANCEL_ORDER',
      payload: { orderId, reason },
      idempotencyKey: generateIdempotencyKey(context)
    }, context);
  }

  async execute(command: OrderCommand, context: IntegrationContext): Promise<IntegrationResult<OrderResourceData>> {
    const startTime = Date.now();
    const key = command.idempotencyKey || generateIdempotencyKey(context);

    try {
      if (command.operationName === 'GET_ORDER') {
        const response = await this.client.request<OrderResourceData>({
          method: 'GET',
          url: `/orders/${command.payload.orderId}`,
          tenantId: context.tenantId,
          correlationId: context.correlationId,
          idempotencyKey: key
        });

        return {
          success: true,
          outcome: IntegrationOutcome.SUCCESS,
          operationId: (response.data as any)?.id || `op-${Date.now()}`,
          idempotencyKey: key,
          data: response.data,
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      if (command.operationName === 'CANCEL_ORDER') {
        const response = await this.client.request<OrderResourceData>({
          method: 'POST',
          url: `/orders/${command.payload.orderId}/cancel`,
          body: { reason: command.payload.reason },
          tenantId: context.tenantId,
          correlationId: context.correlationId,
          idempotencyKey: key
        });

        return {
          success: true,
          outcome: IntegrationOutcome.SUCCESS,
          operationId: (response.data as any)?.id || `op-cancel-${Date.now()}`,
          idempotencyKey: key,
          data: response.data,
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      throw new IntegrationError({
        message: `Unsupported order operation: ${command.operationName}`,
        code: 'UNSUPPORTED_OPERATION',
        retryable: false
      });

    } catch (err: any) {
      const isUnknown = err.isUnknownOutcome ?? (err.isTimeout || !err.rawStatus || err.rawStatus >= 500);
      return {
        success: false,
        outcome: isUnknown ? IntegrationOutcome.UNKNOWN_OUTCOME : IntegrationOutcome.FAILED,
        idempotencyKey: key,
        error: {
          code: err.code || 'HTTP_ERROR',
          message: err.message,
          retryable: err.retryable ?? true,
          rawStatus: err.rawStatus
        },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
    }
  }

  async verify(operation: OrderCommand, context: IntegrationContext): Promise<GroundTruthVerificationResult<OrderResourceData>> {
    const orderId = operation.payload.orderId;
    try {
      const getRes = await this.getOrder(orderId, context);
      if (!getRes.success || !getRes.data) {
        return {
          verified: false,
          resourceExists: false,
          matchesExpectedState: false,
          details: `Verification read failed for order ${orderId}: ${getRes.error?.message}`,
          timestamp: new Date().toISOString()
        };
      }

      const orderData = getRes.data;
      if (operation.operationName === 'CANCEL_ORDER') {
        const isCancelled = orderData.status === 'CANCELLED';
        return {
          verified: isCancelled,
          resourceExists: true,
          currentState: orderData,
          matchesExpectedState: isCancelled,
          details: isCancelled ? `Order ${orderId} verified CANCELLED in HTTP provider` : `Order ${orderId} is currently ${orderData.status}`,
          timestamp: new Date().toISOString()
        };
      }

      return {
        verified: true,
        resourceExists: true,
        currentState: orderData,
        matchesExpectedState: true,
        details: `Order ${orderId} exists with status ${orderData.status}`,
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      return {
        verified: false,
        resourceExists: false,
        matchesExpectedState: false,
        details: `Exception verifying order ${orderId}: ${err.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}
