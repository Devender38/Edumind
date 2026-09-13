import { BaseIntegrationAdapter, IntegrationCommand, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';

export interface InventoryCommand extends IntegrationCommand {
  operationName: 'RESERVE_STOCK' | 'CHECK_STOCK' | 'RELEASE_STOCK';
  payload: {
    sku: string;
    quantity: number;
    reservationId?: string;
    locationId?: string;
  };
}

export interface InventoryResourceData {
  sku: string;
  availableStock: number;
  reservedStock: number;
  reservationId?: string;
  status: 'AVAILABLE' | 'RESERVED' | 'OUT_OF_STOCK';
  tenantId: string;
}

export interface InventoryAdapter extends BaseIntegrationAdapter<InventoryCommand, InventoryResourceData> {
  checkStock(sku: string, context: IntegrationContext): Promise<IntegrationResult<InventoryResourceData>>;
  reserveStock(sku: string, quantity: number, context: IntegrationContext): Promise<IntegrationResult<InventoryResourceData>>;
  releaseStock(reservationId: string, context: IntegrationContext): Promise<IntegrationResult<InventoryResourceData>>;
}
