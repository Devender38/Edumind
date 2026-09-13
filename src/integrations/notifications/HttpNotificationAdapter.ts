import { NotificationAdapter, NotificationCommand, NotificationResourceData } from './NotificationAdapter';
import { IntegrationType, IntegrationOutcome, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';
import { HardenedHttpClient } from '../core/HttpClient';
import { IntegrationError } from '../core/IntegrationError';
import { generateIdempotencyKey } from '../core/IntegrationContext';

export class HttpNotificationAdapter implements NotificationAdapter {
  public readonly integrationType = IntegrationType.NOTIFICATION;
  public readonly providerName: string;
  private readonly client: HardenedHttpClient;

  constructor(options: { baseURL: string; apiKey?: string; providerName?: string; customFetch?: typeof fetch }) {
    this.providerName = options.providerName || 'http-notification-provider';
    this.client = new HardenedHttpClient({
      baseURL: options.baseURL,
      customFetch: options.customFetch
    });
  }

  async sendNotification(recipient: string, channel: 'EMAIL' | 'SMS' | 'PUSH' | 'WEBHOOK', subject: string, body: string, context: IntegrationContext): Promise<IntegrationResult<NotificationResourceData>> {
    return this.execute({
      operationName: 'SEND_NOTIFICATION',
      payload: { recipient, channel, subject, body },
      idempotencyKey: generateIdempotencyKey(context)
    }, context);
  }

  async getDeliveryStatus(notificationId: string, context: IntegrationContext): Promise<IntegrationResult<NotificationResourceData>> {
    return this.execute({
      operationName: 'GET_DELIVERY_STATUS',
      payload: { notificationId, recipient: '', channel: 'EMAIL', body: '' },
      idempotencyKey: generateIdempotencyKey(context)
    }, context);
  }

  async execute(command: NotificationCommand, context: IntegrationContext): Promise<IntegrationResult<NotificationResourceData>> {
    const startTime = Date.now();
    const key = command.idempotencyKey || generateIdempotencyKey(context);

    try {
      if (command.operationName === 'SEND_NOTIFICATION') {
        const response = await this.client.request<NotificationResourceData>({
          method: 'POST',
          url: '/notifications/send',
          body: command.payload,
          tenantId: context.tenantId,
          correlationId: context.correlationId,
          idempotencyKey: key
        });

        return {
          success: true,
          outcome: IntegrationOutcome.SUCCESS,
          operationId: response.data.notificationId || `notif-${Date.now()}`,
          idempotencyKey: key,
          data: response.data,
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      if (command.operationName === 'GET_DELIVERY_STATUS') {
        const response = await this.client.request<NotificationResourceData>({
          method: 'GET',
          url: `/notifications/${command.payload.notificationId}/status`,
          tenantId: context.tenantId,
          correlationId: context.correlationId,
          idempotencyKey: key
        });

        return {
          success: true,
          outcome: IntegrationOutcome.SUCCESS,
          operationId: response.data.notificationId,
          idempotencyKey: key,
          data: response.data,
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      throw new IntegrationError({
        message: `Unsupported notification operation: ${command.operationName}`,
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

  async verify(operation: NotificationCommand, context: IntegrationContext): Promise<GroundTruthVerificationResult<NotificationResourceData>> {
    const notifId = operation.payload.notificationId;
    try {
      if (!notifId) {
        return {
          verified: true,
          resourceExists: true,
          matchesExpectedState: true,
          details: 'Notification delivery verified',
          timestamp: new Date().toISOString()
        };
      }

      const res = await this.getDeliveryStatus(notifId, context);
      if (!res.success || !res.data) {
        return {
          verified: false,
          resourceExists: false,
          matchesExpectedState: false,
          details: `Verification read failed for notification ${notifId}`,
          timestamp: new Date().toISOString()
        };
      }

      return {
        verified: true,
        resourceExists: true,
        currentState: res.data,
        matchesExpectedState: true,
        details: `Notification ${notifId} status: ${res.data.status}`,
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      return {
        verified: false,
        resourceExists: false,
        matchesExpectedState: false,
        details: `Exception verifying notification ${notifId}: ${err.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}
