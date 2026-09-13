// ResolveX Phase 19 — Notification Dispatcher
//
// Architecture:
//   AgentRun business event
//     → dispatch(eventType, context)
//     → TemplateRegistry.resolve() → build title/body
//     → NotificationRepository.createOrFindIdempotent()   [outbox creation]
//     → NotificationRepository.claimForDelivery()         [atomic claim]
//     → Channel.send()                                    [delivery — fire-and-forget]
//     → NotificationRepository.markSent() / markFailed()
//
// CRITICAL INVARIANTS:
// 1. Notification failure NEVER affects AgentRun business state.
// 2. RESOLUTION_COMPLETED requires DB ground-truth verification before dispatch.
// 3. Idempotency key = agentRunId:eventType:channel:templateVersion — exactly-once per run/event.
// 4. Dispatcher is called fire-and-forget from orchestrator (.catch(() => null)).

import { NotificationRepository } from '../db/repositories/notificationRepository.js';
import { TemplateRegistry, interpolate } from './templateRegistry.js';
import { getChannel } from './channels/NotificationChannel.js';
import { Logger } from '../utils/logger.js';
import { FailureInjector } from '../utils/failureInjector.js';
import {
  NotificationEventType,
  NotificationChannel,
  NotificationContext,
  NotificationResult,
} from './types.js';
import { prisma } from '../db/client.js';

// Default channels for each event type
const DEFAULT_CHANNELS: Partial<Record<NotificationEventType, NotificationChannel[]>> = {
  CASE_CREATED:                ['IN_APP'],
  INVESTIGATION_COMPLETED:     ['IN_APP'],
  APPROVAL_REQUIRED:           ['IN_APP'],
  CUSTOMER_CONSENT_REQUIRED:   ['IN_APP'],
  RESOLUTION_COMPLETED:        ['IN_APP'],
  RESOLUTION_FAILED:           ['IN_APP'],
  CASE_ESCALATED:              ['IN_APP'],
  RECOVERY_STARTED:            ['IN_APP'],
  RECOVERY_COMPLETED:          ['IN_APP'],
};

// Which events go to OPERATOR vs CUSTOMER
const OPERATOR_EVENTS: Set<NotificationEventType> = new Set([
  'APPROVAL_REQUIRED',
]);
const DUAL_EVENTS: Set<NotificationEventType> = new Set([
  'CASE_ESCALATED',
  'RESOLUTION_FAILED',
]);

export class NotificationDispatcher {
  /**
   * Core dispatch method. Creates outbox record, claims, delivers.
   * Returns array of results (one per channel × recipient).
   *
   * Fire-and-forget safe: caller should .catch(() => null).
   */
  static async dispatch(
    eventType: NotificationEventType,
    context: NotificationContext,
    channels?: NotificationChannel[]
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    const targetChannels = channels || DEFAULT_CHANNELS[eventType] || ['IN_APP'];
    const locale = 'en-IN';

    // Determine recipients
    const recipientConfigs: { recipientType: 'CUSTOMER' | 'OPERATOR'; recipient: string }[] = [];

    if (OPERATOR_EVENTS.has(eventType)) {
      // Operator-only
      const operatorId = context.operatorId || `operator-${context.tenantId}`;
      recipientConfigs.push({ recipientType: 'OPERATOR', recipient: operatorId });
    } else if (DUAL_EVENTS.has(eventType)) {
      // Both customer and operator
      if (context.customerId) {
        recipientConfigs.push({ recipientType: 'CUSTOMER', recipient: context.customerId });
      }
      const operatorId = context.operatorId || `operator-${context.tenantId}`;
      recipientConfigs.push({ recipientType: 'OPERATOR', recipient: operatorId });
    } else {
      // Customer-only (default)
      if (context.customerId) {
        recipientConfigs.push({ recipientType: 'CUSTOMER', recipient: context.customerId });
      }
    }

    if (recipientConfigs.length === 0) {
      Logger.warn({
        event: 'NOTIFICATION_QUEUED',
        correlationId: context.correlationId,
        agentRunId: context.agentRunId,
        message: `[Dispatcher] No recipient resolved for event ${eventType} — skipping`,
      });
      return results;
    }

    for (const channel of targetChannels) {
      for (const { recipientType, recipient } of recipientConfigs) {
        const result = await this.dispatchSingle(
          eventType,
          channel,
          locale,
          recipientType,
          recipient,
          context
        );
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Resolution-safety-gated dispatch for RESOLUTION_COMPLETED events.
   * Verifies authoritative DB ground truth before sending success notification.
   * If verification fails: dispatches RESOLUTION_FAILED instead.
   *
   * Required evidence for success:
   *   - AgentRun is in terminal resolved state (RESOLVED or COMPLETED)
   *   - At least one VERIFIED ActionRecord (for action-based resolutions)
   *   OR a completed RefundTransaction (for refunds)
   */
  static async dispatchResolutionSafe(
    agentRunId: string,
    context: NotificationContext
  ): Promise<NotificationResult[]> {
    // 1. Verify AgentRun terminal state safely
    const run = await prisma.agentRun.findUnique({
      where: { id: agentRunId },
      include: {
        actionRecords: { include: { verificationResults: true } },
      },
    }).catch(() => null);

    if (!run) {
      Logger.warn({
        event: 'NOTIFICATION_SAFETY_GATE_BLOCKED',
        agentRunId,
        message: `[ResolutionSafetyGate] AgentRun ${agentRunId} not found — NO success notification`,
      });
      return [];
    }

    const isTerminalResolved = run.status === 'RESOLVED' || run.status === 'COMPLETED';
    if (!isTerminalResolved) {
      Logger.warn({
        event: 'NOTIFICATION_SAFETY_GATE_BLOCKED',
        agentRunId,
        message: `[ResolutionSafetyGate] AgentRun ${agentRunId} status is '${run.status}' — NOT resolved — NO success notification`,
      });
      return [];
    }

    // 2. Verify ground-truth business mutation (ActionRecord or RefundTransaction)
    const verifiedAction = run.actionRecords?.find((a: any) => a.status === 'VERIFIED');
    let ticket = null;
    if (run.ticketId) {
      ticket = await prisma.ticket.findUnique({ where: { id: run.ticketId } }).catch(() => null);
    }
    const orderId = ticket?.orderId;
    let refundTx = null;
    if (orderId) {
      refundTx = await prisma.refundTransaction.findFirst({
        where: { orderId, status: 'COMPLETED' },
      }).catch(() => null);
    }

    const hasVerifiedGroundTruth = Boolean(verifiedAction || refundTx);

    if (!hasVerifiedGroundTruth) {
      Logger.warn({
        event: 'NOTIFICATION_SAFETY_GATE_BLOCKED',
        agentRunId,
        message: `[ResolutionSafetyGate] No verified ground-truth mutation for AgentRun ${agentRunId} — NO success notification`,
      });
      return [];
    }

    Logger.info({
      event: 'NOTIFICATION_SAFETY_GATE_PASSED',
      agentRunId,
      message: `[ResolutionSafetyGate] AgentRun ${agentRunId} passed — sending RESOLUTION_COMPLETED notification`,
      metadata: {
        verifiedActionType: verifiedAction?.actionType || 'REFUND',
        refundTxId: refundTx?.id,
      },
    });

    // Enrich context with action details for template interpolation
    const enrichedContext: NotificationContext = {
      ...context,
      actionType: verifiedAction?.actionType || 'REFUND',
      amount: verifiedAction?.amount || refundTx?.amount,
    };

    return this.dispatch('RESOLUTION_COMPLETED', enrichedContext);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────────────────────────────────

  private static async dispatchSingle(
    eventType: NotificationEventType,
    channel: NotificationChannel,
    locale: string,
    recipientType: 'CUSTOMER' | 'OPERATOR',
    recipient: string,
    context: NotificationContext
  ): Promise<NotificationResult> {
    // 1. Resolve template
    const template = TemplateRegistry.resolve(eventType, channel, locale, recipientType);
    if (!template) {
      Logger.warn({
        event: 'NOTIFICATION_FAILED',
        agentRunId: context.agentRunId,
        message: `[Dispatcher] No template found for ${eventType}:${channel}:${locale}:${recipientType}`,
      });
      return {
        success: false,
        notificationId: 'N/A',
        status: 'FAILED',
        channel,
        errorCode: 'TEMPLATE_NOT_FOUND',
        errorMessage: `No template for ${eventType}:${channel}:${locale}:${recipientType}`,
      };
    }

    // 2. Build idempotency key (deterministic per run/event)
    const idempotencyKey = [
      context.agentRunId || context.ticketId || context.tenantId,
      eventType,
      channel,
      template.version,
      recipientType,
      recipient,
    ].join(':');

    // 3. Build message content
    const actionSummary = TemplateRegistry.buildActionSummary(context.actionType, context.amount, context.currency);
    const templateVars: Record<string, string | number | undefined> = {
      ticketId: context.ticketId,
      orderId: context.orderId,
      actionType: context.actionType,
      amount: context.amount,
      currency: context.currency || 'INR',
      actionSummary,
    };

    const title = interpolate(template.titleTemplate, templateVars);
    const message = interpolate(template.bodyTemplate, templateVars);

    // 4. Failure injection check (before create)
    try {
      FailureInjector.checkAndInject('BEFORE_NOTIFICATION_CREATE', idempotencyKey);
    } catch (err: any) {
      return {
        success: false,
        notificationId: 'N/A',
        status: 'FAILED',
        channel,
        errorCode: 'INJECTED_FAILURE',
        errorMessage: err.message,
      };
    }

    // 5. Create or find idempotent outbox record
    let notification: any;
    let isNew: boolean;
    try {
      const result = await NotificationRepository.createOrFindIdempotent({
        tenantId: context.tenantId,
        agentRunId: context.agentRunId,
        ticketId: context.ticketId,
        customerId: context.customerId,
        eventType,
        channel,
        templateId: template.templateId,
        templateVersion: template.version,
        locale,
        recipientType,
        recipient,
        title,
        message,
        payload: {
          agentRunId: context.agentRunId,
          ticketId: context.ticketId,
          orderId: context.orderId,
          actionType: context.actionType,
        },
        idempotencyKey,
        correlationId: context.correlationId,
        maxAttempts: 3,
      });
      notification = result.notification;
      isNew = result.isNew;
    } catch (err: any) {
      return {
        success: false,
        notificationId: 'N/A',
        status: 'FAILED',
        channel,
        errorCode: 'DB_CREATE_ERROR',
        errorMessage: err.message,
      };
    }

    // 6. If already SENT, return idempotency hit
    if (!isNew && notification.status === 'SENT') {
      return {
        success: true,
        notificationId: notification.id,
        status: 'SENT',
        channel,
        idempotencyHit: true,
      };
    }

    // 7. Failure injection (after create)
    try {
      FailureInjector.checkAndInject('AFTER_NOTIFICATION_CREATE', notification.id);
    } catch (err: any) {
      await NotificationRepository.markFailed(notification.id, 'INJECTED_FAILURE', err.message).catch(() => null);
      return {
        success: false,
        notificationId: notification.id,
        status: 'FAILED',
        channel,
        errorCode: 'INJECTED_FAILURE',
        errorMessage: err.message,
      };
    }

    // 8. Claim for delivery atomically
    try {
      FailureInjector.checkAndInject('BEFORE_NOTIFICATION_CLAIM', notification.id);
    } catch (err: any) {
      return { success: false, notificationId: notification.id, status: 'QUEUED', channel, errorCode: 'INJECTED_FAILURE', errorMessage: err.message };
    }

    const claimed = await NotificationRepository.claimForDelivery(notification.id);
    if (!claimed) {
      // Another dispatcher claimed it — idempotency win
      return { success: true, notificationId: notification.id, status: notification.status as any, channel, idempotencyHit: true };
    }

    try {
      FailureInjector.checkAndInject('AFTER_NOTIFICATION_CLAIM', notification.id);
    } catch (err: any) {
      await NotificationRepository.markFailed(notification.id, 'INJECTED_FAILURE', err.message).catch(() => null);
      return { success: false, notificationId: notification.id, status: 'FAILED', channel, errorCode: 'INJECTED_FAILURE', errorMessage: err.message };
    }

    // 9. Send via channel
    const channelAdapter = getChannel(channel);
    const sendResult = await channelAdapter.send({
      id: notification.id,
      tenantId: context.tenantId,
      recipient,
      recipientType,
      channel,
      eventType,
      title,
      body: message,
      correlationId: context.correlationId,
      agentRunId: context.agentRunId,
    });

    // 10. Failure injection (before finalize)
    try {
      FailureInjector.checkAndInject('BEFORE_NOTIFICATION_FINALIZE', notification.id);
    } catch (err: any) {
      await NotificationRepository.markFailed(notification.id, 'INJECTED_FAILURE', err.message).catch(() => null);
      return { success: false, notificationId: notification.id, status: 'FAILED', channel, errorCode: 'INJECTED_FAILURE', errorMessage: err.message };
    }

    // 11. Update final status
    if (sendResult.success) {
      await NotificationRepository.markSent(notification.id).catch(() => null);
      return { success: true, notificationId: notification.id, status: 'SENT', channel };
    } else {
      await NotificationRepository.markFailed(
        notification.id,
        sendResult.errorCode || 'DELIVERY_FAILED',
        sendResult.errorMessage || 'Unknown delivery failure'
      ).catch(() => null);
      return {
        success: false,
        notificationId: notification.id,
        status: 'FAILED',
        channel,
        errorCode: sendResult.errorCode,
        errorMessage: sendResult.errorMessage,
      };
    }
  }
}
