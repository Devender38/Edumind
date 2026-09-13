import { BaseIntegrationAdapter, IntegrationCommand, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';

export interface NotificationCommand extends IntegrationCommand {
  operationName: 'SEND_NOTIFICATION' | 'GET_DELIVERY_STATUS';
  payload: {
    recipient: string;
    channel: 'EMAIL' | 'SMS' | 'PUSH' | 'WEBHOOK';
    subject?: string;
    body: string;
    notificationId?: string;
  };
}

export interface NotificationResourceData {
  notificationId: string;
  recipient: string;
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'WEBHOOK';
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
  sentAt: string;
  tenantId: string;
}

export interface NotificationAdapter extends BaseIntegrationAdapter<NotificationCommand, NotificationResourceData> {
  sendNotification(recipient: string, channel: 'EMAIL' | 'SMS' | 'PUSH' | 'WEBHOOK', subject: string, body: string, context: IntegrationContext): Promise<IntegrationResult<NotificationResourceData>>;
  getDeliveryStatus(notificationId: string, context: IntegrationContext): Promise<IntegrationResult<NotificationResourceData>>;
}
