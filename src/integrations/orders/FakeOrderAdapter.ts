import { OrderAdapter, OrderCommand, OrderResourceData } from './OrderAdapter';
import { IntegrationType, IntegrationOutcome, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';
import { generateIdempotencyKey } from '../core/IntegrationContext';

export class FakeOrderAdapter implements OrderAdapter {
  public readonly integrationType = IntegrationType.ORDER;
  public readonly providerName = 'fake-order-provider';

  private orders: Map<string, OrderResourceData> = new Map();
  private executedIdempotencyKeys: Map<string, IntegrationResult<OrderResourceData>> = new Map();
  public simulateFailure: boolean = false;
  public simulateTimeout: boolean = false;
  public simulateUnknownOutcome: boolean = false;

  constructor() {
    this.seedDefaults();
  }

  public seedDefaults() {
    this.orders.set('ORD-1001', {
      orderId: 'ORD-1001',
      status: 'PENDING',
      totalAmount: 149.99,
      currency: 'USD',
      items: [{ sku: 'SKU-001', quantity: 1, price: 149.99 }],
      tenantId: 'tenant-default'
    });
    this.orders.set('ORD-1002', {
      orderId: 'ORD-1002',
      status: 'SHIPPED',
      totalAmount: 89.50,
      currency: 'USD',
      items: [{ sku: 'SKU-002', quantity: 2, price: 44.75 }],
      tenantId: 'tenant-default'
    });
    this.orders.set('ORD-CAN-01', {
      orderId: 'ORD-CAN-01',
      status: 'CANCELLED',
      totalAmount: 50.00,
      currency: 'USD',
      items: [{ sku: 'SKU-003', quantity: 1, price: 50.00 }],
      cancelledAt: new Date().toISOString(),
      cancelReason: 'Customer request',
      tenantId: 'tenant-default'
    });
  }

  public setOrder(order: OrderResourceData) {
    this.orders.set(order.orderId, order);
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

    if (this.executedIdempotencyKeys.has(key)) {
      const cached = this.executedIdempotencyKeys.get(key)!;
      return { ...cached, durationMs: Date.now() - startTime };
    }

    if (this.simulateTimeout) {
      const result: IntegrationResult<OrderResourceData> = {
        success: false,
        outcome: IntegrationOutcome.UNKNOWN_OUTCOME,
        idempotencyKey: key,
        error: { code: 'INTEGRATION_TIMEOUT', message: 'Simulated Order API timeout', retryable: true },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
    }

    if (this.simulateFailure) {
      const result: IntegrationResult<OrderResourceData> = {
        success: false,
        outcome: IntegrationOutcome.FAILED,
        idempotencyKey: key,
        error: { code: 'ORDER_SERVICE_ERROR', message: 'Simulated Order API error', retryable: true },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
    }

    const { orderId, reason } = command.payload;
    const existing = this.orders.get(orderId);

    if (command.operationName === 'GET_ORDER') {
      if (!existing) {
        return {
          success: false,
          outcome: IntegrationOutcome.FAILED,
          idempotencyKey: key,
          error: { code: 'ORDER_NOT_FOUND', message: `Order ${orderId} not found`, retryable: false },
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }
      return {
        success: true,
        outcome: IntegrationOutcome.SUCCESS,
        operationId: `op-get-${Date.now()}`,
        idempotencyKey: key,
        data: { ...existing },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
    }

    if (command.operationName === 'CANCEL_ORDER') {
      if (!existing) {
        return {
          success: false,
          outcome: IntegrationOutcome.FAILED,
          idempotencyKey: key,
          error: { code: 'ORDER_NOT_FOUND', message: `Order ${orderId} not found`, retryable: false },
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      if (existing.status === 'SHIPPED' || existing.status === 'DELIVERED') {
        return {
          success: false,
          outcome: IntegrationOutcome.FAILED,
          idempotencyKey: key,
          error: { code: 'ORDER_CANNOT_BE_CANCELLED', message: `Order ${orderId} in state ${existing.status} cannot be cancelled`, retryable: false },
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      const updated: OrderResourceData = {
        ...existing,
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString(),
        cancelReason: reason || 'Customer request'
      };
      this.orders.set(orderId, updated);

      if (this.simulateUnknownOutcome) {
        const result: IntegrationResult<OrderResourceData> = {
          success: false,
          outcome: IntegrationOutcome.UNKNOWN_OUTCOME,
          idempotencyKey: key,
          data: updated,
          error: { code: 'CONNECTION_RESET', message: 'Connection reset after mutation', retryable: true },
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
        this.executedIdempotencyKeys.set(key, result);
        return result;
      }

      const result: IntegrationResult<OrderResourceData> = {
        success: true,
        outcome: IntegrationOutcome.SUCCESS,
        operationId: `op-cancel-${Date.now()}`,
        idempotencyKey: key,
        data: updated,
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

  async verify(operation: OrderCommand, context: IntegrationContext): Promise<GroundTruthVerificationResult<OrderResourceData>> {
    const orderId = operation.payload.orderId;
    const existing = this.orders.get(orderId);

    if (!existing) {
      return {
        verified: false,
        resourceExists: false,
        matchesExpectedState: false,
        details: `Order ${orderId} does not exist in provider system`,
        timestamp: new Date().toISOString()
      };
    }

    if (operation.operationName === 'CANCEL_ORDER') {
      const isCancelled = existing.status === 'CANCELLED';
      return {
        verified: isCancelled,
        resourceExists: true,
        currentState: { ...existing },
        matchesExpectedState: isCancelled,
        details: isCancelled ? `Order ${orderId} is confirmed CANCELLED` : `Order ${orderId} is currently ${existing.status}`,
        timestamp: new Date().toISOString()
      };
    }

    return {
      verified: true,
      resourceExists: true,
      currentState: { ...existing },
      matchesExpectedState: true,
      details: `Order ${orderId} exists with status ${existing.status}`,
      timestamp: new Date().toISOString()
    };
  }
}
