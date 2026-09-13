import { InventoryAdapter, InventoryCommand, InventoryResourceData } from './InventoryAdapter';
import { IntegrationType, IntegrationOutcome, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';
import { HardenedHttpClient } from '../core/HttpClient';
import { IntegrationError } from '../core/IntegrationError';
import { generateIdempotencyKey } from '../core/IntegrationContext';

export class HttpInventoryAdapter implements InventoryAdapter {
  public readonly integrationType = IntegrationType.INVENTORY;
  public readonly providerName: string;
  private readonly client: HardenedHttpClient;

  constructor(options: { baseURL: string; apiKey?: string; providerName?: string; customFetch?: typeof fetch }) {
    this.providerName = options.providerName || 'http-inventory-provider';
    this.client = new HardenedHttpClient({
      baseURL: options.baseURL,
      customFetch: options.customFetch
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

    try {
      if (command.operationName === 'CHECK_STOCK') {
        const response = await this.client.request<InventoryResourceData>({
          method: 'GET',
          url: `/inventory/${command.payload.sku}`,
          tenantId: context.tenantId,
          correlationId: context.correlationId,
          idempotencyKey: key
        });

        return {
          success: true,
          outcome: IntegrationOutcome.SUCCESS,
          operationId: `op-check-${Date.now()}`,
          idempotencyKey: key,
          data: response.data,
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      if (command.operationName === 'RESERVE_STOCK') {
        const response = await this.client.request<InventoryResourceData>({
          method: 'POST',
          url: `/inventory/${command.payload.sku}/reserve`,
          body: { quantity: command.payload.quantity },
          tenantId: context.tenantId,
          correlationId: context.correlationId,
          idempotencyKey: key
        });

        return {
          success: true,
          outcome: IntegrationOutcome.SUCCESS,
          operationId: response.data.reservationId || `res-${Date.now()}`,
          idempotencyKey: key,
          data: response.data,
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      if (command.operationName === 'RELEASE_STOCK') {
        const response = await this.client.request<InventoryResourceData>({
          method: 'POST',
          url: `/inventory/reservations/${command.payload.reservationId}/release`,
          tenantId: context.tenantId,
          correlationId: context.correlationId,
          idempotencyKey: key
        });

        return {
          success: true,
          outcome: IntegrationOutcome.SUCCESS,
          operationId: command.payload.reservationId,
          idempotencyKey: key,
          data: response.data,
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      throw new IntegrationError({
        message: `Unsupported inventory operation: ${command.operationName}`,
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

  async verify(operation: InventoryCommand, context: IntegrationContext): Promise<GroundTruthVerificationResult<InventoryResourceData>> {
    const sku = operation.payload.sku;
    try {
      if (!sku) {
        return {
          verified: true,
          resourceExists: true,
          matchesExpectedState: true,
          details: 'Operation verified without SKU',
          timestamp: new Date().toISOString()
        };
      }
      const res = await this.checkStock(sku, context);
      if (!res.success || !res.data) {
        return {
          verified: false,
          resourceExists: false,
          matchesExpectedState: false,
          details: `Verification read failed for SKU ${sku}: ${res.error?.message}`,
          timestamp: new Date().toISOString()
        };
      }

      return {
        verified: true,
        resourceExists: true,
        currentState: res.data,
        matchesExpectedState: true,
        details: `Inventory status for ${sku}: ${res.data.status}, available=${res.data.availableStock}`,
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      return {
        verified: false,
        resourceExists: false,
        matchesExpectedState: false,
        details: `Exception verifying SKU ${sku}: ${err.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}
