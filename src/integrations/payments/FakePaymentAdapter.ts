import { PaymentAdapter, PaymentCommand, PaymentResourceData } from './PaymentAdapter';
import { IntegrationType, IntegrationOutcome, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';
import { generateIdempotencyKey } from '../core/IntegrationContext';

export class FakePaymentAdapter implements PaymentAdapter {
  public readonly integrationType = IntegrationType.PAYMENT;
  public readonly providerName = 'fake-payment-provider';

  private refunds: Map<string, PaymentResourceData> = new Map();
  private executedIdempotencyKeys: Map<string, IntegrationResult<PaymentResourceData>> = new Map();
  public simulateFailure: boolean = false;
  public simulateTimeout: boolean = false;
  public simulateUnknownOutcome: boolean = false;

  constructor() {
    this.seedDefaults();
  }

  public seedDefaults() {
    this.refunds.set('REF-EXISTING-01', {
      refundId: 'REF-EXISTING-01',
      paymentId: 'PAY-1001',
      orderId: 'ORD-1001',
      amount: 149.99,
      currency: 'USD',
      status: 'SUCCEEDED',
      reason: 'Prior return',
      processedAt: new Date().toISOString(),
      tenantId: 'tenant-default'
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

    // Strict Idempotency Check
    if (this.executedIdempotencyKeys.has(key)) {
      const cached = this.executedIdempotencyKeys.get(key)!;
      return { ...cached, durationMs: Date.now() - startTime };
    }

    if (this.simulateTimeout) {
      const result: IntegrationResult<PaymentResourceData> = {
        success: false,
        outcome: IntegrationOutcome.UNKNOWN_OUTCOME,
        idempotencyKey: key,
        error: { code: 'INTEGRATION_TIMEOUT', message: 'Simulated Gateway Timeout', retryable: true },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
    }

    if (this.simulateFailure) {
      const result: IntegrationResult<PaymentResourceData> = {
        success: false,
        outcome: IntegrationOutcome.FAILED,
        idempotencyKey: key,
        error: { code: 'PAYMENT_DECLINED', message: 'Simulated payment failure', retryable: true },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
    }

    if (command.operationName === 'PROCESS_REFUND') {
      const refundId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const refundData: PaymentResourceData = {
        refundId,
        paymentId: command.payload.paymentId || `PAY-${command.payload.orderId}`,
        orderId: command.payload.orderId || 'UNKNOWN',
        amount: command.payload.amount,
        currency: command.payload.currency || 'USD',
        status: 'SUCCEEDED',
        reason: command.payload.reason || 'Automated customer resolution',
        processedAt: new Date().toISOString(),
        tenantId: context.tenantId
      };

      this.refunds.set(refundId, refundData);

      if (this.simulateUnknownOutcome) {
        const result: IntegrationResult<PaymentResourceData> = {
          success: false,
          outcome: IntegrationOutcome.UNKNOWN_OUTCOME,
          idempotencyKey: key,
          data: refundData,
          error: { code: 'GATEWAY_TIMEOUT', message: 'Gateway timed out while processing refund', retryable: true },
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
        this.executedIdempotencyKeys.set(key, result);
        return result;
      }

      const result: IntegrationResult<PaymentResourceData> = {
        success: true,
        outcome: IntegrationOutcome.SUCCESS,
        operationId: refundId,
        idempotencyKey: key,
        data: refundData,
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
    }

    if (command.operationName === 'GET_PAYMENT_STATUS') {
      const match = Array.from(this.refunds.values()).find(r => r.paymentId === command.payload.paymentId);
      if (match) {
        return {
          success: true,
          outcome: IntegrationOutcome.SUCCESS,
          operationId: match.refundId,
          idempotencyKey: key,
          data: match,
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }
      return {
        success: false,
        outcome: IntegrationOutcome.FAILED,
        idempotencyKey: key,
        error: { code: 'REFUND_NOT_FOUND', message: `No refund record for payment ${command.payload.paymentId}`, retryable: false },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: false,
      outcome: IntegrationOutcome.FAILED,
      idempotencyKey: key,
      error: { code: 'UNSUPPORTED_OPERATION', message: `Operation ${command.operationName} unsupported`, retryable: false },
      durationMs: Date.now() - startTime,
      provider: this.providerName,
      timestamp: new Date().toISOString()
    };
  }

  async verify(operation: PaymentCommand, context: IntegrationContext): Promise<GroundTruthVerificationResult<PaymentResourceData>> {
    const paymentId = operation.payload.paymentId || `PAY-${operation.payload.orderId}`;
    const orderId = operation.payload.orderId;

    const existingRefund = Array.from(this.refunds.values()).find(
      r => (paymentId && r.paymentId === paymentId) || (orderId && r.orderId === orderId)
    );

    if (!existingRefund) {
      return {
        verified: false,
        resourceExists: false,
        matchesExpectedState: false,
        details: `No refund record found in Payment gateway for paymentId ${paymentId} / orderId ${orderId}`,
        timestamp: new Date().toISOString()
      };
    }

    const isSucceeded = existingRefund.status === 'SUCCEEDED';
    const amountMatches = existingRefund.amount === operation.payload.amount;

    return {
      verified: isSucceeded && amountMatches,
      resourceExists: true,
      currentState: existingRefund,
      matchesExpectedState: isSucceeded && amountMatches,
      details: isSucceeded && amountMatches
        ? `Refund ${existingRefund.refundId} of ${existingRefund.amount} ${existingRefund.currency} confirmed SUCCEEDED`
        : `Refund exists but status=${existingRefund.status}, amount=${existingRefund.amount} vs expected=${operation.payload.amount}`,
      timestamp: new Date().toISOString()
    };
  }
}
