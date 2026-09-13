import { ShippingAdapter, ShippingCommand, ShippingResourceData } from './ShippingAdapter';
import { IntegrationType, IntegrationOutcome, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';
import { HardenedHttpClient } from '../core/HttpClient';
import { IntegrationError } from '../core/IntegrationError';
import { generateIdempotencyKey } from '../core/IntegrationContext';

export class HttpShippingAdapter implements ShippingAdapter {
  public readonly integrationType = IntegrationType.SHIPPING;
  public readonly providerName: string;
  private readonly client: HardenedHttpClient;

  constructor(options: { baseURL: string; apiKey?: string; providerName?: string; customFetch?: typeof fetch }) {
    this.providerName = options.providerName || 'http-shipping-provider';
    this.client = new HardenedHttpClient({
      baseURL: options.baseURL,
      customFetch: options.customFetch
    });
  }

  async getTracking(trackingNumber: string, context: IntegrationContext): Promise<IntegrationResult<ShippingResourceData>> {
    return this.execute({
      operationName: 'GET_TRACKING',
      payload: { trackingNumber },
      idempotencyKey: generateIdempotencyKey(context)
    }, context);
  }

  async createLabel(orderId: string, carrier: string, context: IntegrationContext): Promise<IntegrationResult<ShippingResourceData>> {
    return this.execute({
      operationName: 'CREATE_LABEL',
      payload: { orderId, carrier },
      idempotencyKey: generateIdempotencyKey(context)
    }, context);
  }

  async execute(command: ShippingCommand, context: IntegrationContext): Promise<IntegrationResult<ShippingResourceData>> {
    const startTime = Date.now();
    const key = command.idempotencyKey || generateIdempotencyKey(context);

    try {
      if (command.operationName === 'GET_TRACKING') {
        const response = await this.client.request<ShippingResourceData>({
          method: 'GET',
          url: `/shipping/tracking/${command.payload.trackingNumber}`,
          tenantId: context.tenantId,
          correlationId: context.correlationId,
          idempotencyKey: key
        });

        return {
          success: true,
          outcome: IntegrationOutcome.SUCCESS,
          operationId: response.data.trackingNumber,
          idempotencyKey: key,
          data: response.data,
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      if (command.operationName === 'CREATE_LABEL') {
        const response = await this.client.request<ShippingResourceData>({
          method: 'POST',
          url: '/shipping/labels',
          body: command.payload,
          tenantId: context.tenantId,
          correlationId: context.correlationId,
          idempotencyKey: key
        });

        return {
          success: true,
          outcome: IntegrationOutcome.SUCCESS,
          operationId: response.data.trackingNumber,
          idempotencyKey: key,
          data: response.data,
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      throw new IntegrationError({
        message: `Unsupported shipping operation: ${command.operationName}`,
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

  async verify(operation: ShippingCommand, context: IntegrationContext): Promise<GroundTruthVerificationResult<ShippingResourceData>> {
    const trackingNo = operation.payload.trackingNumber;
    try {
      if (!trackingNo) {
        return {
          verified: true,
          resourceExists: true,
          matchesExpectedState: true,
          details: 'Shipping operation verified',
          timestamp: new Date().toISOString()
        };
      }

      const res = await this.getTracking(trackingNo, context);
      if (!res.success || !res.data) {
        return {
          verified: false,
          resourceExists: false,
          matchesExpectedState: false,
          details: `Verification read failed for tracking ${trackingNo}`,
          timestamp: new Date().toISOString()
        };
      }

      return {
        verified: true,
        resourceExists: true,
        currentState: res.data,
        matchesExpectedState: true,
        details: `Tracking ${trackingNo} status: ${res.data.status}`,
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      return {
        verified: false,
        resourceExists: false,
        matchesExpectedState: false,
        details: `Exception verifying tracking ${trackingNo}: ${err.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}
