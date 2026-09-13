import { BaseIntegrationAdapter, IntegrationCommand, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';

export interface PaymentCommand extends IntegrationCommand {
  operationName: 'PROCESS_REFUND' | 'GET_PAYMENT_STATUS';
  payload: {
    paymentId?: string;
    orderId?: string;
    amount: number;
    currency: string;
    reason?: string;
  };
}

export interface PaymentResourceData {
  refundId: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  reason?: string;
  processedAt?: string;
  tenantId: string;
}

export interface PaymentAdapter extends BaseIntegrationAdapter<PaymentCommand, PaymentResourceData> {
  processRefund(orderId: string, paymentId: string, amount: number, currency: string, reason: string, context: IntegrationContext): Promise<IntegrationResult<PaymentResourceData>>;
  getPaymentStatus(paymentId: string, context: IntegrationContext): Promise<IntegrationResult<PaymentResourceData>>;
}
