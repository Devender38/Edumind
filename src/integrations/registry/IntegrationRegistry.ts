import { BaseIntegrationAdapter, IntegrationType, IntegrationMode } from '../core/IntegrationTypes';
import { CircuitBreaker } from '../core/CircuitBreaker';
import { FakeOrderAdapter } from '../orders/FakeOrderAdapter';
import { HttpOrderAdapter } from '../orders/HttpOrderAdapter';
import { FakePaymentAdapter } from '../payments/FakePaymentAdapter';
import { HttpPaymentAdapter } from '../payments/HttpPaymentAdapter';
import { FakeInventoryAdapter } from '../inventory/FakeInventoryAdapter';
import { HttpInventoryAdapter } from '../inventory/HttpInventoryAdapter';
import { FakeShippingAdapter } from '../shipping/FakeShippingAdapter';
import { HttpShippingAdapter } from '../shipping/HttpShippingAdapter';
import { FakeCrmAdapter } from '../crm/FakeCrmAdapter';
import { HttpCrmAdapter } from '../crm/HttpCrmAdapter';
import { FakeNotificationAdapter } from '../notifications/FakeNotificationAdapter';
import { HttpNotificationAdapter } from '../notifications/HttpNotificationAdapter';

export class IntegrationRegistry {
  private static instance: IntegrationRegistry;
  private adapters: Map<IntegrationType, BaseIntegrationAdapter> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private currentMode: IntegrationMode = IntegrationMode.INTEGRATIONS_SANDBOX;

  private constructor() {
    this.initializeDefaultAdapters();
  }

  public static getInstance(): IntegrationRegistry {
    if (!IntegrationRegistry.instance) {
      IntegrationRegistry.instance = new IntegrationRegistry();
    }
    return IntegrationRegistry.instance;
  }

  public setMode(mode: IntegrationMode): void {
    this.currentMode = mode;
    this.initializeDefaultAdapters();
  }

  public getMode(): IntegrationMode {
    return this.currentMode;
  }

  public registerAdapter(type: IntegrationType, adapter: BaseIntegrationAdapter): void {
    this.adapters.set(type, adapter);
    if (!this.circuitBreakers.has(adapter.providerName)) {
      this.circuitBreakers.set(adapter.providerName, new CircuitBreaker(adapter.providerName));
    }
  }

  public getAdapter<T extends BaseIntegrationAdapter>(type: IntegrationType): T {
    const adapter = this.adapters.get(type);
    if (!adapter) {
      throw new Error(`No integration adapter registered for type: ${type}`);
    }
    return adapter as T;
  }

  public getCircuitBreaker(providerName: string): CircuitBreaker {
    let cb = this.circuitBreakers.get(providerName);
    if (!cb) {
      cb = new CircuitBreaker(providerName);
      this.circuitBreakers.set(providerName, cb);
    }
    return cb;
  }

  public getAllCircuitBreakers(): Map<string, CircuitBreaker> {
    return this.circuitBreakers;
  }

  public getAllAdapters(): Map<IntegrationType, BaseIntegrationAdapter> {
    return this.adapters;
  }

  public resetAll(): void {
    this.adapters.clear();
    this.circuitBreakers.clear();
    this.initializeDefaultAdapters();
  }

  private initializeDefaultAdapters(): void {
    const mode = (process.env.INTEGRATION_MODE as IntegrationMode) || this.currentMode;

    if (mode === IntegrationMode.INTEGRATIONS_PRODUCTION) {
      // Register HTTP Production Adapters with configured base URLs
      const orderUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:8080/api/v1/orders';
      const paymentUrl = process.env.PAYMENT_GATEWAY_URL || 'http://localhost:8080/api/v1/payments';
      const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://localhost:8080/api/v1/inventory';
      const shippingUrl = process.env.SHIPPING_CARRIER_URL || 'http://localhost:8080/api/v1/shipping';
      const crmUrl = process.env.CRM_SYSTEM_URL || 'http://localhost:8080/api/v1/crm';
      const notifUrl = process.env.NOTIFICATION_GATEWAY_URL || 'http://localhost:8080/api/v1/notifications';

      this.registerAdapter(IntegrationType.ORDER, new HttpOrderAdapter({ baseURL: orderUrl, providerName: 'prod-http-order' }));
      this.registerAdapter(IntegrationType.PAYMENT, new HttpPaymentAdapter({ baseURL: paymentUrl, providerName: 'prod-http-payment' }));
      this.registerAdapter(IntegrationType.INVENTORY, new HttpInventoryAdapter({ baseURL: inventoryUrl, providerName: 'prod-http-inventory' }));
      this.registerAdapter(IntegrationType.SHIPPING, new HttpShippingAdapter({ baseURL: shippingUrl, providerName: 'prod-http-shipping' }));
      this.registerAdapter(IntegrationType.CRM, new HttpCrmAdapter({ baseURL: crmUrl, providerName: 'prod-http-crm' }));
      this.registerAdapter(IntegrationType.NOTIFICATION, new HttpNotificationAdapter({ baseURL: notifUrl, providerName: 'prod-http-notification' }));
    } else {
      // Register Fake Adapters for Sandbox & Testing
      this.registerAdapter(IntegrationType.ORDER, new FakeOrderAdapter());
      this.registerAdapter(IntegrationType.PAYMENT, new FakePaymentAdapter());
      this.registerAdapter(IntegrationType.INVENTORY, new FakeInventoryAdapter());
      this.registerAdapter(IntegrationType.SHIPPING, new FakeShippingAdapter());
      this.registerAdapter(IntegrationType.CRM, new FakeCrmAdapter());
      this.registerAdapter(IntegrationType.NOTIFICATION, new FakeNotificationAdapter());
    }
  }
}
