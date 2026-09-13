import { BaseIntegrationAdapter, IntegrationCommand, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';

export interface OrderCommand extends IntegrationCommand {
  operationName: 'GET_ORDER' | 'CANCEL_ORDER' | 'MODIFY_ORDER';
  payload: {
    orderId: string;
    reason?: string;
    items?: Array<{ sku: string; quantity: number }>;
  };
}

export interface OrderResourceData {
  orderId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'CANCELLED' | 'DELIVERED';
  totalAmount: number;
  currency: string;
  items: Array<{ sku: string; quantity: number; price: number }>;
  cancelledAt?: string;
  cancelReason?: string;
  tenantId: string;
}

export interface OrderAdapter extends BaseIntegrationAdapter<OrderCommand, OrderResourceData> {
  getOrder(orderId: string, context: IntegrationContext): Promise<IntegrationResult<OrderResourceData>>;
  cancelOrder(orderId: string, reason: string, context: IntegrationContext): Promise<IntegrationResult<OrderResourceData>>;
}
