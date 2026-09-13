import { PaymentAdapter, PaymentCommand, PaymentResourceData } from './PaymentAdapter';
import { IntegrationType, IntegrationOutcome, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';
import { HardenedHttpClient } from '../core/HttpClient';
import { IntegrationError } from '../core/IntegrationError';
import { generateIdempotencyKey } from '../core/IntegrationContext';

export class HttpPaymentAdapter implements PaymentAdapter {
  public readonly integrationType = IntegrationType.PAYMENT;
  public readonly providerName: string;
  private readonly client: HardenedHttpClient;

  constructor(options: { baseURL: string; apiKey?: string; providerName?: string; customFetch?: typeof fetch }) {
    this.providerName = options.providerName || 'http-payment-provider';
    this.client = new HardenedHttpClient({
      baseURL: options.baseURL,
      customFetch: options.customFetch
    });
  }

  async processRefund(orderId: string, paymentId: string, amount: number, currency: string, reason: string, context: IntegrationContext): Promise<IntegrationResult<PaymentResourceData>> {
    return this.execute({
      operationName: 'PROCESS_REFUND',
      payload: { orderId, paymentId, amount, currency, reason },
      idempotencyKey: generateIdempotencyKey(context)
    }, context);
  }

  async getPaymentStatus(paymentId: string, context: IntegrationContext): Promise<IntegrationResult<PaymentResourceData>> {
    return this.execute({
      operationName: 'GET_PAYMENT_STATUS',
      payload: { paymentId, amount: 0, currency: 'USD' },
      idempotencyKey: generateIdempotencyKey(context)
    }, context);
  }

  async execute(command: PaymentCommand, context: IntegrationContext): Promise<IntegrationResult<PaymentResourceData>> {
    const startTime = Date.now();
    const key = command.idempotencyKey || generateIdempotencyKey(context);

    try {
      if (command.operationName === 'PROCESS_REFUND') {
        const response = await this.client.request<PaymentResourceData>({
          method: 'POST',
          url: '/payments/refund',
          body: command.payload,
          tenantId: context.tenantId,
          correlationId: context.correlationId,
          idempotencyKey: key
        });

        return {
          success: true,
          outcome: IntegrationOutcome.SUCCESS,
          operationId: response.data.refundId || `ref-${Date.now()}`,
          idempotencyKey: key,
          data: response.data,
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      if (command.operationName === 'GET_PAYMENT_STATUS') {
        const response = await this.client.request<PaymentResourceData>({
          method: 'GET',
          url: `/payments/${command.payload.paymentId}/refunds`,
          tenantId: context.tenantId,
          correlationId: context.correlationId,
          idempotencyKey: key
        });

        return {
          success: true,
          outcome: IntegrationOutcome.SUCCESS,
          operationId: response.data.refundId || `ref-read-${Date.now()}`,
          idempotencyKey: key,
          data: response.data,
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      throw new IntegrationError({
        message: `Unsupported payment operation: ${command.operationName}`,
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

  async verify(operation: PaymentCommand, context: IntegrationContext): Promise<GroundTruthVerificationResult<PaymentResourceData>> {
    const paymentId = operation.payload.paymentId || `PAY-${operation.payload.orderId}`;
    try {
      const res = await this.getPaymentStatus(paymentId, context);
      if (!res.success || !res.data) {
        return {
          verified: false,
          resourceExists: false,
          matchesExpectedState: false,
          details: `Verification query failed for payment ${paymentId}: ${res.error?.message}`,
          timestamp: new Date().toISOString()
        };
      }

      const refundData = res.data;
      const isSucceeded = refundData.status === 'SUCCEEDED';
      return {
        verified: isSucceeded,
        resourceExists: true,
        currentState: refundData,
        matchesExpectedState: isSucceeded,
        details: isSucceeded
          ? `Refund ${refundData.refundId} verified SUCCEEDED in HTTP payment gateway`
          : `Refund status is ${refundData.status}`,
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      return {
        verified: false,
        resourceExists: false,
        matchesExpectedState: false,
        details: `Exception verifying payment ${paymentId}: ${err.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}
