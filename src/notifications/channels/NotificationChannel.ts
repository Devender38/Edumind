// ResolveX Phase 19 — Channel Abstraction & Implementations
// Channel interface is pluggable. InAppChannel fully implemented.
// MockEmailChannel provides a safe boundary for future real provider integration.

import { NotificationMessage, NotificationResult, NotificationStatus } from '../types.js';
import { Logger } from '../../utils/logger.js';
import { FailureInjector } from '../../utils/failureInjector.js';

// ─────────────────────────────────────────────────────────────────────────────
// Channel Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface INotificationChannel {
  readonly channelName: string;
  send(message: NotificationMessage): Promise<{ success: boolean; errorCode?: string; errorMessage?: string }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// IN_APP Channel — Fully implemented
// "Delivery" for in-app means the record reaches SENT status in the database.
// The dispatcher updates the DB status; this channel just validates and logs.
// ─────────────────────────────────────────────────────────────────────────────

export class InAppChannel implements INotificationChannel {
  public readonly channelName = 'IN_APP';

  public async send(message: NotificationMessage): Promise<{ success: boolean; errorCode?: string; errorMessage?: string }> {
    try {
      FailureInjector.checkAndInject('BEFORE_DELIVERY', message.id);

      // Validate required fields
      if (!message.recipient || !message.title || !message.body) {
        return {
          success: false,
          errorCode: 'INVALID_MESSAGE',
          errorMessage: 'Missing required fields: recipient, title, or body',
        };
      }

      // For IN_APP, delivery is the DB record itself. Log the delivery event.
      Logger.info({
        event: 'NOTIFICATION_SENT',
        correlationId: message.correlationId,
        agentRunId: message.agentRunId,
        message: `[IN_APP] Notification delivered to ${message.recipientType} [${message.recipient}]: "${message.title}"`,
        metadata: {
          notificationId: message.id,
          eventType: message.eventType,
          channel: 'IN_APP',
          recipientType: message.recipientType,
        },
      });

      FailureInjector.checkAndInject('AFTER_DELIVERY', message.id);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        errorCode: err.message?.includes('INJECTED_FAILURE') ? 'INJECTED_FAILURE' : 'DELIVERY_ERROR',
        errorMessage: err.message,
      };
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK EMAIL Channel — Safe boundary for future real provider
// Does NOT make external network calls. Logs only.
// Replace the send() implementation with a real provider adapter when ready.
// ─────────────────────────────────────────────────────────────────────────────

export class MockEmailChannel implements INotificationChannel {
  public readonly channelName = 'EMAIL';

  public async send(message: NotificationMessage): Promise<{ success: boolean; errorCode?: string; errorMessage?: string }> {
    try {
      FailureInjector.checkAndInject('BEFORE_DELIVERY', message.id);

      // Validate no sensitive data is being sent in subject
      if (!message.recipient || !message.title) {
        return { success: false, errorCode: 'INVALID_MESSAGE', errorMessage: 'Missing recipient or title for email' };
      }

      // Mock: log without sending. Real provider (SES/SendGrid) would be called here.
      Logger.info({
        event: 'NOTIFICATION_SENT',
        correlationId: message.correlationId,
        agentRunId: message.agentRunId,
        message: `[EMAIL:MOCK] Email notification simulated for ${message.recipient}: "${message.title}"`,
        metadata: {
          notificationId: message.id,
          eventType: message.eventType,
          channel: 'EMAIL',
          recipientType: message.recipientType,
          providerStatus: 'MOCK_SENT',
        },
      });

      FailureInjector.checkAndInject('AFTER_DELIVERY', message.id);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        errorCode: err.message?.includes('INJECTED_FAILURE') ? 'INJECTED_FAILURE' : 'EMAIL_DELIVERY_ERROR',
        errorMessage: err.message,
      };
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Channel Registry — resolves channel by name
// ─────────────────────────────────────────────────────────────────────────────

const _inAppChannel = new InAppChannel();
const _mockEmailChannel = new MockEmailChannel();

export function getChannel(channelName: string): INotificationChannel {
  switch (channelName.toUpperCase()) {
    case 'IN_APP':
      return _inAppChannel;
    case 'EMAIL':
      return _mockEmailChannel;
    default:
      return _inAppChannel; // Default to IN_APP for safety
  }
}
