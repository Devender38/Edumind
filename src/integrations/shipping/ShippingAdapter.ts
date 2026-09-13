import { BaseIntegrationAdapter, IntegrationCommand, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';

export interface ShippingCommand extends IntegrationCommand {
  operationName: 'GET_TRACKING' | 'CREATE_LABEL' | 'CANCEL_SHIPMENT';
  payload: {
    trackingNumber?: string;
    orderId?: string;
    carrier?: string;
    address?: Record<string, string>;
  };
}

export interface ShippingResourceData {
  trackingNumber: string;
  orderId: string;
  carrier: string;
  status: 'LABEL_CREATED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  estimatedDelivery?: string;
  tenantId: string;
}

export interface ShippingAdapter extends BaseIntegrationAdapter<ShippingCommand, ShippingResourceData> {
  getTracking(trackingNumber: string, context: IntegrationContext): Promise<IntegrationResult<ShippingResourceData>>;
  createLabel(orderId: string, carrier: string, context: IntegrationContext): Promise<IntegrationResult<ShippingResourceData>>;
}
