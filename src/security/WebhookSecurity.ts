// ResolveX Production Webhook Security Engine — Step 5
// Enforces HMAC signature verification, timestamp freshness validation (300s window), and event replay protection.

import crypto from 'crypto';

export interface WebhookValidationInput {
  payload: string | Record<string, unknown>;
  signatureHeader?: string;
  timestampHeader?: string;
  secret: string;
  maxAgeMs?: number; // Default 300,000 ms (5 minutes)
}

export interface WebhookValidationResult {
  valid: boolean;
  reason?: string;
  eventId?: string;
  tenantId?: string;
}

export class WebhookSecurity {
  private static PROCESSED_EVENT_IDS = new Set<string>();

  /**
   * Clears processed webhook event history (for unit test isolation).
   */
  public static resetProcessedEvents(): void {
    this.PROCESSED_EVENT_IDS.clear();
  }

  /**
   * Verifies an incoming webhook's HMAC signature, timestamp, and idempotency key.
   */
  public static verifyWebhook(input: WebhookValidationInput): WebhookValidationResult {
    const { payload, signatureHeader, timestampHeader, secret, maxAgeMs = 300000 } = input;

    if (!secret || secret.trim() === '') {
      return { valid: false, reason: 'Missing webhook signing secret configuration' };
    }

    if (!signatureHeader || signatureHeader.trim() === '') {
      return { valid: false, reason: 'Missing webhook signature header' };
    }

    const payloadStr = typeof payload === 'object' ? JSON.stringify(payload) : String(payload);

    // 1. Timestamp Freshness Check (Replay Prevention)
    if (timestampHeader) {
      const ts = Number(timestampHeader);
      if (isNaN(ts)) {
        return { valid: false, reason: 'Invalid non-numeric webhook timestamp header' };
      }
      const age = Math.abs(Date.now() - ts);
      if (age > maxAgeMs) {
        return { valid: false, reason: `Stale webhook timestamp. Age ${Math.round(age / 1000)}s exceeds maximum allowed ${Math.round(maxAgeMs / 1000)}s window` };
      }
    }

    // 2. Compute Expected HMAC-SHA256 Signature
    const signatureContent = timestampHeader ? `${timestampHeader}.${payloadStr}` : payloadStr;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signatureContent)
      .digest('hex');

    // Support both raw hex signature and `v1=<hex>` format
    const cleanedHeader = signatureHeader.replace(/^v1=/i, '').trim();

    const sigBuf = Buffer.from(cleanedHeader, 'hex');
    const expBuf = Buffer.from(expectedSignature, 'hex');

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, reason: 'HMAC signature verification failed' };
    }

    // 3. Extract Event & Tenant Metadata if present
    let eventId: string | undefined;
    let tenantId: string | undefined;
    try {
      const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
      eventId = parsed.eventId || parsed.id || parsed.event_id;
      tenantId = parsed.tenantId || parsed.tenant_id;
    } catch {
      // Ignored for non-JSON payloads
    }

    // 4. Duplicate Event Replay Check
    if (eventId) {
      if (this.PROCESSED_EVENT_IDS.has(eventId)) {
        return { valid: false, reason: `Duplicate webhook event ID '${eventId}' already processed`, eventId, tenantId };
      }
      this.PROCESSED_EVENT_IDS.add(eventId);
    }

    return { valid: true, eventId, tenantId };
  }
}
