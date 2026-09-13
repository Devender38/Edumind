// ResolveX Phase 19 — Versioned Notification Template Registry
// Templates are deterministic: same eventType + channel + locale → same title/body pattern.
// Customer-visible content NEVER exposes internal agent reasoning, policy IDs, or worker details.

import { NotificationEventType, NotificationChannel, NotificationTemplate } from './types.js';

// Template variable interpolation helper
export function interpolate(template: string, vars: Record<string, string | number | undefined>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    return val !== undefined && val !== null ? String(val) : '';
  });
}

// Registry key: eventType:channel:locale
type TemplateKey = string;

const TEMPLATES: Record<TemplateKey, NotificationTemplate> = {
  // ── CUSTOMER NOTIFICATIONS ────────────────────────────────────────────────

  'CASE_CREATED:IN_APP:en-IN:CUSTOMER': {
    templateId: 'case-created-inapp-customer',
    version: 'v1',
    eventType: 'CASE_CREATED',
    channel: 'IN_APP',
    locale: 'en-IN',
    titleTemplate: 'Your case has been received',
    bodyTemplate:
      'We have received your request and our resolution team is now investigating. We will update you shortly.',
  },
  'INVESTIGATION_COMPLETED:IN_APP:en-IN:CUSTOMER': {
    templateId: 'investigation-completed-inapp-customer',
    version: 'v1',
    eventType: 'INVESTIGATION_COMPLETED',
    channel: 'IN_APP',
    locale: 'en-IN',
    titleTemplate: 'Investigation complete',
    bodyTemplate: 'We have completed the investigation of your case and are now formulating a resolution.',
  },
  'CUSTOMER_CONSENT_REQUIRED:IN_APP:en-IN:CUSTOMER': {
    templateId: 'consent-required-inapp-customer',
    version: 'v1',
    eventType: 'CUSTOMER_CONSENT_REQUIRED',
    channel: 'IN_APP',
    locale: 'en-IN',
    titleTemplate: 'Your confirmation is needed',
    bodyTemplate:
      'Before we can proceed with an alternative resolution for your case, we need your confirmation. Please review and respond.',
  },
  'RESOLUTION_COMPLETED:IN_APP:en-IN:CUSTOMER': {
    templateId: 'resolution-completed-inapp-customer',
    version: 'v1',
    eventType: 'RESOLUTION_COMPLETED',
    channel: 'IN_APP',
    locale: 'en-IN',
    titleTemplate: 'Your case has been resolved',
    bodyTemplate:
      '{{actionSummary}} Your case has been successfully resolved. If you have any questions, please contact our support team.',
  },
  'RESOLUTION_FAILED:IN_APP:en-IN:CUSTOMER': {
    templateId: 'resolution-failed-inapp-customer',
    version: 'v1',
    eventType: 'RESOLUTION_FAILED',
    channel: 'IN_APP',
    locale: 'en-IN',
    titleTemplate: 'We were unable to resolve your case automatically',
    bodyTemplate:
      'We were unable to complete an automated resolution for your case. Our support team will follow up with you shortly.',
  },
  'CASE_ESCALATED:IN_APP:en-IN:CUSTOMER': {
    templateId: 'case-escalated-inapp-customer',
    version: 'v1',
    eventType: 'CASE_ESCALATED',
    channel: 'IN_APP',
    locale: 'en-IN',
    titleTemplate: 'Your case needs further review',
    bodyTemplate:
      'We are escalating your case to our specialist team for further assistance. You will hear from us soon.',
  },
  'RECOVERY_STARTED:IN_APP:en-IN:CUSTOMER': {
    templateId: 'recovery-started-inapp-customer',
    version: 'v1',
    eventType: 'RECOVERY_STARTED',
    channel: 'IN_APP',
    locale: 'en-IN',
    titleTemplate: 'We are retrying your resolution',
    bodyTemplate:
      'We encountered a temporary issue and are retrying your resolution automatically. We will keep you updated.',
  },
  'RECOVERY_COMPLETED:IN_APP:en-IN:CUSTOMER': {
    templateId: 'recovery-completed-inapp-customer',
    version: 'v1',
    eventType: 'RECOVERY_COMPLETED',
    channel: 'IN_APP',
    locale: 'en-IN',
    titleTemplate: 'Resolution retry completed',
    bodyTemplate: 'We have successfully completed a retry of your case resolution. Your case is now resolved.',
  },

  // ── OPERATOR NOTIFICATIONS ────────────────────────────────────────────────

  'APPROVAL_REQUIRED:IN_APP:en-IN:OPERATOR': {
    templateId: 'approval-required-inapp-operator',
    version: 'v1',
    eventType: 'APPROVAL_REQUIRED',
    channel: 'IN_APP',
    locale: 'en-IN',
    titleTemplate: 'Approval required for case {{ticketId}}',
    bodyTemplate:
      'A high-value resolution action ({{actionType}}) requires manager approval before it can proceed. Please review and decide.',
  },
  'CASE_ESCALATED:IN_APP:en-IN:OPERATOR': {
    templateId: 'case-escalated-inapp-operator',
    version: 'v1',
    eventType: 'CASE_ESCALATED',
    channel: 'IN_APP',
    locale: 'en-IN',
    titleTemplate: 'Case escalated — action required',
    bodyTemplate:
      'Case {{ticketId}} has been escalated and requires operator attention. Please review the case details.',
  },
  'RESOLUTION_FAILED:IN_APP:en-IN:OPERATOR': {
    templateId: 'resolution-failed-inapp-operator',
    version: 'v1',
    eventType: 'RESOLUTION_FAILED',
    channel: 'IN_APP',
    locale: 'en-IN',
    titleTemplate: 'Case resolution failed — review required',
    bodyTemplate: 'Case {{ticketId}} failed automated resolution. Operator review and manual intervention may be required.',
  },

  // ── MOCK EMAIL CHANNEL (future pluggable boundary) ────────────────────────

  'RESOLUTION_COMPLETED:EMAIL:en-IN:CUSTOMER': {
    templateId: 'resolution-completed-email-customer',
    version: 'v1',
    eventType: 'RESOLUTION_COMPLETED',
    channel: 'EMAIL',
    locale: 'en-IN',
    titleTemplate: 'Your case has been resolved — ResolveX',
    bodyTemplate:
      '{{actionSummary}} Your case has been successfully resolved. Thank you for your patience.',
  },
  'CASE_ESCALATED:EMAIL:en-IN:CUSTOMER': {
    templateId: 'case-escalated-email-customer',
    version: 'v1',
    eventType: 'CASE_ESCALATED',
    channel: 'EMAIL',
    locale: 'en-IN',
    titleTemplate: 'Your case needs further review — ResolveX',
    bodyTemplate: 'We are escalating your case to our specialist team for further assistance. You will hear from us soon.',
  },
};

export class TemplateRegistry {
  /**
   * Resolves a template by eventType, channel, locale, and recipient type.
   * Falls back to CUSTOMER if OPERATOR template is missing.
   * Falls back to en-IN if locale is missing.
   */
  public static resolve(
    eventType: NotificationEventType,
    channel: NotificationChannel,
    locale: string,
    recipientType: 'CUSTOMER' | 'OPERATOR'
  ): NotificationTemplate | null {
    // Try exact match
    let key: TemplateKey = `${eventType}:${channel}:${locale}:${recipientType}`;
    if (TEMPLATES[key]) return TEMPLATES[key];

    // Fallback: try en-IN locale
    key = `${eventType}:${channel}:en-IN:${recipientType}`;
    if (TEMPLATES[key]) return TEMPLATES[key];

    // Fallback: try CUSTOMER if OPERATOR not found
    if (recipientType === 'OPERATOR') {
      key = `${eventType}:${channel}:en-IN:CUSTOMER`;
      if (TEMPLATES[key]) return TEMPLATES[key];
    }

    return null;
  }

  /**
   * Returns all registered templates (for audit/observability).
   */
  public static listAll(): NotificationTemplate[] {
    return Object.values(TEMPLATES);
  }

  /**
   * Builds action summary string from context fields for resolution messages.
   * Never exposes internal IDs or policy details.
   */
  public static buildActionSummary(actionType?: string, amount?: number, currency?: string): string {
    if (!actionType) return 'Your resolution';
    const curr = currency || 'INR';
    switch (actionType.toUpperCase()) {
      case 'REFUND':
        return amount ? `A refund of ${curr} ${amount.toLocaleString('en-IN')}` : 'Your refund';
      case 'REPLACEMENT':
        return 'A replacement order';
      case 'CANCELLATION':
      case 'CANCEL':
        return 'Your order cancellation';
      case 'COUPON':
        return 'A goodwill coupon';
      default:
        return 'Your resolution';
    }
  }
}
