import { InventoryAdapter, InventoryCommand, InventoryResourceData } from './InventoryAdapter';
import { IntegrationType, IntegrationOutcome, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';
import { generateIdempotencyKey } from '../core/IntegrationContext';

export class FakeInventoryAdapter implements InventoryAdapter {
  public readonly integrationType = IntegrationType.INVENTORY;
  public readonly providerName = 'fake-inventory-provider';

  private stock: Map<string, InventoryResourceData> = new Map();
  private reservations: Map<string, { sku: string; quantity: number }> = new Map();
  private executedIdempotencyKeys: Map<string, IntegrationResult<InventoryResourceData>> = new Map();
  public simulateFailure: boolean = false;
  public simulateTimeout: boolean = false;

  constructor() {
    this.seedDefaults();
  }

  public seedDefaults() {
    this.stock.set('SKU-001', {
      sku: 'SKU-001',
      availableStock: 50,
      reservedStock: 0,
      status: 'AVAILABLE',
      tenantId: 'tenant-default'
    });
    this.stock.set('SKU-002', {
      sku: 'SKU-002',
      availableStock: 5,
      reservedStock: 0,
      status: 'AVAILABLE',
      tenantId: 'tenant-default'
    });
    this.stock.set('SKU-OUT-OF-STOCK', {
      sku: 'SKU-OUT-OF-STOCK',
      availableStock: 0,
      reservedStock: 0,
      status: 'OUT_OF_STOCK',
      tenantId: 'tenant-default'
    });
  }

  async checkStock(sku: string, context: IntegrationContext): Promise<IntegrationResult<InventoryResourceData>> {
    return this.execute({
      operationName: 'CHECK_STOCK',
      payload: { sku, quantity: 1 },
      idempotencyKey: generateIdempotencyKey(context)
    }, context);
  }

  async reserveStock(sku: string, quantity: number, context: IntegrationContext): Promise<IntegrationResult<InventoryResourceData>> {
    return this.execute({
      operationName: 'RESERVE_STOCK',
      payload: { sku, quantity },
      idempotencyKey: generateIdempotencyKey(context)
    }, context);
  }

  async releaseStock(reservationId: string, context: IntegrationContext): Promise<IntegrationResult<InventoryResourceData>> {
    return this.execute({
      operationName: 'RELEASE_STOCK',
      payload: { sku: '', quantity: 0, reservationId },
      idempotencyKey: generateIdempotencyKey(context)
    }, context);
  }

  async execute(command: InventoryCommand, context: IntegrationContext): Promise<IntegrationResult<InventoryResourceData>> {
    const startTime = Date.now();
    const key = command.idempotencyKey || generateIdempotencyKey(context);

    if (this.executedIdempotencyKeys.has(key)) {
      const cached = this.executedIdempotencyKeys.get(key)!;
      return { ...cached, durationMs: Date.now() - startTime };
    }

    if (this.simulateTimeout) {
      const result: IntegrationResult<InventoryResourceData> = {
        success: false,
        outcome: IntegrationOutcome.UNKNOWN_OUTCOME,
        idempotencyKey: key,
        error: { code: 'INTEGRATION_TIMEOUT', message: 'Simulated Inventory API timeout', retryable: true },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
    }

    if (this.simulateFailure) {
      const result: IntegrationResult<InventoryResourceData> = {
        success: false,
        outcome: IntegrationOutcome.FAILED,
        idempotencyKey: key,
        error: { code: 'INVENTORY_SERVICE_ERROR', message: 'Simulated inventory service error', retryable: true },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
    }

    const { sku, quantity, reservationId } = command.payload;

    if (command.operationName === 'CHECK_STOCK') {
      const item = this.stock.get(sku);
      if (!item) {
        return {
          success: false,
          outcome: IntegrationOutcome.FAILED,
          idempotencyKey: key,
          error: { code: 'SKU_NOT_FOUND', message: `SKU ${sku} not found`, retryable: false },
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }
      return {
        success: true,
        outcome: IntegrationOutcome.SUCCESS,
        operationId: `op-check-${Date.now()}`,
        idempotencyKey: key,
        data: { ...item },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
    }

    if (command.operationName === 'RESERVE_STOCK') {
      const item = this.stock.get(sku);
      if (!item || item.availableStock < quantity) {
        return {
          success: false,
          outcome: IntegrationOutcome.FAILED,
          idempotencyKey: key,
          error: { code: 'INSUFFICIENT_STOCK', message: `Insufficient stock for SKU ${sku}`, retryable: false },
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      item.availableStock -= quantity;
      item.reservedStock += quantity;
      if (item.availableStock === 0) item.status = 'OUT_OF_STOCK';

      const resId = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      this.reservations.set(resId, { sku, quantity });

      const resultData: InventoryResourceData = {
        ...item,
        reservationId: resId,
        status: 'RESERVED'
      };

      const result: IntegrationResult<InventoryResourceData> = {
        success: true,
        outcome: IntegrationOutcome.SUCCESS,
        operationId: resId,
        idempotencyKey: key,
        data: resultData,
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
    }

    if (command.operationName === 'RELEASE_STOCK') {
      const res = this.reservations.get(reservationId || '');
      if (!res) {
        return {
          success: false,
          outcome: IntegrationOutcome.FAILED,
          idempotencyKey: key,
          error: { code: 'RESERVATION_NOT_FOUND', message: `Reservation ${reservationId} not found`, retryable: false },
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      const item = this.stock.get(res.sku);
      if (item) {
        item.availableStock += res.quantity;
        item.reservedStock -= res.quantity;
        if (item.availableStock > 0) item.status = 'AVAILABLE';
      }
      this.reservations.delete(reservationId || '');

      const result: IntegrationResult<InventoryResourceData> = {
        success: true,
        outcome: IntegrationOutcome.SUCCESS,
        operationId: reservationId,
        idempotencyKey: key,
        data: item || { sku: res.sku, availableStock: 0, reservedStock: 0, status: 'AVAILABLE', tenantId: context.tenantId },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
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

  async verify(operation: InventoryCommand, context: IntegrationContext): Promise<GroundTruthVerificationResult<InventoryResourceData>> {
    const sku = operation.payload.sku;
    const item = this.stock.get(sku);

    if (!item && operation.operationName !== 'RELEASE_STOCK') {
      return {
        verified: false,
        resourceExists: false,
        matchesExpectedState: false,
        details: `SKU ${sku} not found in inventory provider`,
        timestamp: new Date().toISOString()
      };
    }

    if (operation.operationName === 'RESERVE_STOCK') {
      const resId = operation.payload.reservationId;
      const hasReservation = resId ? this.reservations.has(resId) : true;
      return {
        verified: hasReservation,
        resourceExists: true,
        currentState: item,
        matchesExpectedState: hasReservation,
        details: hasReservation ? `Reservation verified for SKU ${sku}` : `Reservation ${resId} not found`,
        timestamp: new Date().toISOString()
      };
    }

    return {
      verified: true,
      resourceExists: !!item,
      currentState: item,
      matchesExpectedState: true,
      details: `Inventory state verified for SKU ${sku}`,
      timestamp: new Date().toISOString()
    };
  }
}
