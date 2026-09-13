// ResolveX Phase 19 — Notification Domain Types

export type NotificationEventType =
  | 'CASE_CREATED'
  | 'INVESTIGATION_COMPLETED'
  | 'APPROVAL_REQUIRED'
  | 'CUSTOMER_CONSENT_REQUIRED'
  | 'RESOLUTION_COMPLETED'
  | 'RESOLUTION_FAILED'
  | 'CASE_ESCALATED'
  | 'RECOVERY_STARTED'
  | 'RECOVERY_COMPLETED';

export type NotificationStatus =
  | 'QUEUED'
  | 'SENDING'
  | 'SENT'
  | 'FAILED'
  | 'FAILED_PERMANENTLY';

export type NotificationChannel = 'IN_APP' | 'EMAIL';

export type NotificationRecipientType = 'CUSTOMER' | 'OPERATOR';

export interface NotificationTemplate {
  templateId: string;
  version: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  locale: string;
  titleTemplate: string;
  bodyTemplate: string;
}

export interface NotificationContext {
  agentRunId?: string;
  ticketId?: string;
  customerId?: string;
  tenantId: string;
  correlationId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  actionType?: string;
  reason?: string;
  recipientType?: NotificationRecipientType;
  operatorId?: string;
}

export interface NotificationMessage {
  id: string;
  tenantId: string;
  recipient: string;
  recipientType: NotificationRecipientType;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  title: string;
  body: string;
  correlationId?: string;
  agentRunId?: string;
  payload?: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  notificationId: string;
  status: NotificationStatus;
  channel: NotificationChannel;
  idempotencyHit?: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export interface NotificationMetrics {
  queued: number;
  sending: number;
  sent: number;
  failed: number;
  failedPermanently: number;
  total: number;
  deliverySuccessRate: number;
  retryCount: number;
  unreadCount: number;
}
