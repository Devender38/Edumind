import { ShippingAdapter, ShippingCommand, ShippingResourceData } from './ShippingAdapter';
import { IntegrationType, IntegrationOutcome, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';
import { generateIdempotencyKey } from '../core/IntegrationContext';

export class FakeShippingAdapter implements ShippingAdapter {
  public readonly integrationType = IntegrationType.SHIPPING;
  public readonly providerName = 'fake-shipping-provider';

  private shipments: Map<string, ShippingResourceData> = new Map();
  private executedIdempotencyKeys: Map<string, IntegrationResult<ShippingResourceData>> = new Map();
  public simulateFailure: boolean = false;
  public simulateTimeout: boolean = false;

  constructor() {
    this.seedDefaults();
  }

  public seedDefaults() {
    this.shipments.set('TRACK-1001', {
      trackingNumber: 'TRACK-1001',
      orderId: 'ORD-1002',
      carrier: 'UPS',
      status: 'IN_TRANSIT',
      estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString(),
      tenantId: 'tenant-default'
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

    if (this.executedIdempotencyKeys.has(key)) {
      const cached = this.executedIdempotencyKeys.get(key)!;
      return { ...cached, durationMs: Date.now() - startTime };
    }

    if (this.simulateTimeout) {
      const result: IntegrationResult<ShippingResourceData> = {
        success: false,
        outcome: IntegrationOutcome.UNKNOWN_OUTCOME,
        idempotencyKey: key,
        error: { code: 'INTEGRATION_TIMEOUT', message: 'Simulated Shipping API timeout', retryable: true },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
    }

    if (this.simulateFailure) {
      const result: IntegrationResult<ShippingResourceData> = {
        success: false,
        outcome: IntegrationOutcome.FAILED,
        idempotencyKey: key,
        error: { code: 'SHIPPING_CARRIER_ERROR', message: 'Carrier API unavailable', retryable: true },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
    }

    if (command.operationName === 'GET_TRACKING') {
      const trackNo = command.payload.trackingNumber || '';
      const match = this.shipments.get(trackNo);
      if (!match) {
        return {
          success: false,
          outcome: IntegrationOutcome.FAILED,
          idempotencyKey: key,
          error: { code: 'TRACKING_NOT_FOUND', message: `Tracking ${trackNo} not found`, retryable: false },
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        outcome: IntegrationOutcome.SUCCESS,
        operationId: trackNo,
        idempotencyKey: key,
        data: { ...match },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
    }

    if (command.operationName === 'CREATE_LABEL') {
      const trackingNo = `TRACK-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const shipmentData: ShippingResourceData = {
        trackingNumber: trackingNo,
        orderId: command.payload.orderId || 'ORD-UNKNOWN',
        carrier: command.payload.carrier || 'FEDEX',
        status: 'LABEL_CREATED',
        estimatedDelivery: new Date(Date.now() + 86400000 * 3).toISOString(),
        tenantId: context.tenantId
      };

      this.shipments.set(trackingNo, shipmentData);

      const result: IntegrationResult<ShippingResourceData> = {
        success: true,
        outcome: IntegrationOutcome.SUCCESS,
        operationId: trackingNo,
        idempotencyKey: key,
        data: shipmentData,
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

  async verify(operation: ShippingCommand, context: IntegrationContext): Promise<GroundTruthVerificationResult<ShippingResourceData>> {
    const trackingNo = operation.payload.trackingNumber;
    if (trackingNo && this.shipments.has(trackingNo)) {
      const item = this.shipments.get(trackingNo)!;
      return {
        verified: true,
        resourceExists: true,
        currentState: item,
        matchesExpectedState: true,
        details: `Shipment ${trackingNo} verified status=${item.status}`,
        timestamp: new Date().toISOString()
      };
    }

    return {
      verified: true,
      resourceExists: true,
      matchesExpectedState: true,
      details: 'Shipping verification checked',
      timestamp: new Date().toISOString()
    };
  }
}
