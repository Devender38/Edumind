import { NotificationAdapter, NotificationCommand, NotificationResourceData } from './NotificationAdapter';
import { IntegrationType, IntegrationOutcome, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';
import { generateIdempotencyKey } from '../core/IntegrationContext';

export class FakeNotificationAdapter implements NotificationAdapter {
  public readonly integrationType = IntegrationType.NOTIFICATION;
  public readonly providerName = 'fake-notification-provider';

  private notifications: Map<string, NotificationResourceData> = new Map();
  private executedIdempotencyKeys: Map<string, IntegrationResult<NotificationResourceData>> = new Map();
  public simulateFailure: boolean = false;

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

    if (this.executedIdempotencyKeys.has(key)) {
      const cached = this.executedIdempotencyKeys.get(key)!;
      return { ...cached, durationMs: Date.now() - startTime };
    }

    if (this.simulateFailure) {
      const result: IntegrationResult<NotificationResourceData> = {
        success: false,
        outcome: IntegrationOutcome.FAILED,
        idempotencyKey: key,
        error: { code: 'NOTIFICATION_PROVIDER_ERROR', message: 'Simulated Notification Gateway failure', retryable: true },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
    }

    if (command.operationName === 'SEND_NOTIFICATION') {
      const notifId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const notifData: NotificationResourceData = {
        notificationId: notifId,
        recipient: command.payload.recipient,
        channel: command.payload.channel,
        status: 'DELIVERED',
        sentAt: new Date().toISOString(),
        tenantId: context.tenantId
      };

      this.notifications.set(notifId, notifData);

      const result: IntegrationResult<NotificationResourceData> = {
        success: true,
        outcome: IntegrationOutcome.SUCCESS,
        operationId: notifId,
        idempotencyKey: key,
        data: notifData,
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
    }

    if (command.operationName === 'GET_DELIVERY_STATUS') {
      const notifId = command.payload.notificationId || '';
      const match = this.notifications.get(notifId);
      if (!match) {
        return {
          success: false,
          outcome: IntegrationOutcome.FAILED,
          idempotencyKey: key,
          error: { code: 'NOTIFICATION_NOT_FOUND', message: `Notification ${notifId} not found`, retryable: false },
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        outcome: IntegrationOutcome.SUCCESS,
        operationId: notifId,
        idempotencyKey: key,
        data: match,
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
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

  async verify(operation: NotificationCommand, context: IntegrationContext): Promise<GroundTruthVerificationResult<NotificationResourceData>> {
    const notifId = operation.payload.notificationId;
    if (notifId && this.notifications.has(notifId)) {
      const match = this.notifications.get(notifId)!;
      return {
        verified: true,
        resourceExists: true,
        currentState: match,
        matchesExpectedState: true,
        details: `Notification ${notifId} status: ${match.status}`,
        timestamp: new Date().toISOString()
      };
    }

    return {
      verified: true,
      resourceExists: true,
      matchesExpectedState: true,
      details: 'Notification delivery verified',
      timestamp: new Date().toISOString()
    };
  }
}
