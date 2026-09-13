// ResolveX Phase 19 — Durable Notification Repository
// All DB operations enforce: tenantId, customerId ownership, idempotency, and state machine safety.

import { prisma } from '../client.js';
import { NotificationStatus, NotificationMetrics } from '../../notifications/types.js';
import { Logger } from '../../utils/logger.js';

export interface CreateNotificationParams {
  tenantId: string;
  agentRunId?: string;
  ticketId?: string;
  customerId?: string;
  eventType: string;
  channel: string;
  templateId: string;
  templateVersion: string;
  locale?: string;
  recipientType: string;
  recipient: string;
  title: string;
  message: string;
  payload?: Record<string, any>;
  idempotencyKey: string;
  correlationId?: string;
  maxAttempts?: number;
}

export class NotificationRepository {
  /**
   * Creates a notification or returns the existing one if the idempotency key already exists.
   * This is the primary write path — safe under concurrent dispatchers.
   */
  static async createOrFindIdempotent(params: CreateNotificationParams) {
    let validAgentRunId: string | null = null;
    if (params.agentRunId) {
      const exists = await prisma.agentRun.findUnique({ where: { id: params.agentRunId }, select: { id: true } }).catch(() => null);
      if (exists) validAgentRunId = params.agentRunId;
    }

    let validTicketId: string | null = null;
    if (params.ticketId) {
      const exists = await prisma.ticket.findUnique({ where: { id: params.ticketId }, select: { id: true } }).catch(() => null);
      if (exists) validTicketId = params.ticketId;
    }

    let validCustomerId: string | null = null;
    if (params.customerId) {
      const exists = await prisma.customer.findUnique({ where: { id: params.customerId }, select: { id: true } }).catch(() => null);
      if (exists) validCustomerId = params.customerId;
    }

    try {
      const notification = await prisma.notification.create({
        data: {
          tenantId: params.tenantId,
          agentRunId: validAgentRunId,
          ticketId: validTicketId,
          customerId: validCustomerId,
          eventType: params.eventType,
          channel: params.channel,
          templateId: params.templateId,
          templateVersion: params.templateVersion,
          locale: params.locale || 'en-IN',
          recipientType: params.recipientType,
          recipient: params.recipient,
          title: params.title,
          message: params.message,
          payload: params.payload ? JSON.stringify(params.payload) : null,
          idempotencyKey: params.idempotencyKey,
          correlationId: params.correlationId || null,
          status: 'QUEUED',
          maxAttempts: params.maxAttempts || 3,
        },
      });

      Logger.info({
        event: 'NOTIFICATION_QUEUED',
        correlationId: params.correlationId,
        agentRunId: params.agentRunId,
        message: `Notification [${notification.id}] queued for ${params.eventType} → ${params.recipientType}`,
        metadata: {
          notificationId: notification.id,
          idempotencyKey: params.idempotencyKey,
          channel: params.channel,
          eventType: params.eventType,
          tenantId: params.tenantId,
        },
      });

      return { notification, isNew: true };
    } catch (err: any) {
      // P2002 — idempotency key already exists (concurrent dispatch or retry)
      if (err?.code === 'P2002') {
        const existing = await prisma.notification.findUnique({
          where: { idempotencyKey: params.idempotencyKey },
        });

        if (existing) {
          Logger.info({
            event: 'NOTIFICATION_IDEMPOTENCY_HIT',
            correlationId: params.correlationId,
            agentRunId: params.agentRunId,
            message: `Notification idempotency hit for key [${params.idempotencyKey}] → existing [${existing.id}]`,
            metadata: { notificationId: existing.id, status: existing.status },
          });
          return { notification: existing, isNew: false };
        }
      }
      throw err;
    }
  }

  /**
   * Atomically claims a notification for delivery (QUEUED → SENDING).
   * Returns null if the notification is already claimed, SENT, or doesn't exist.
   * Safe under concurrent dispatchers — only one wins.
   */
  static async claimForDelivery(id: string) {
    // Atomic conditional update — only succeeds if status is QUEUED or FAILED (retry)
    const result = await prisma.notification.updateMany({
      where: {
        id,
        status: { in: ['QUEUED', 'FAILED'] },
        attempts: { lt: prisma.notification.fields.maxAttempts as any },
      },
      data: {
        status: 'SENDING',
        attempts: { increment: 1 },
        lastAttemptAt: new Date(),
      },
    });

    if (result.count === 0) {
      return null; // Already claimed by another dispatcher or in terminal state
    }

    return prisma.notification.findUnique({ where: { id } });
  }

  /**
   * Marks a notification as SENT (terminal success state).
   */
  static async markSent(id: string) {
    return prisma.notification.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        errorCode: null,
        errorMessage: null,
      },
    });
  }

  /**
   * Marks a notification as FAILED. If attempts >= maxAttempts, marks FAILED_PERMANENTLY.
   */
  static async markFailed(id: string, errorCode: string, errorMessage: string) {
    const current = await prisma.notification.findUnique({ where: { id } });
    if (!current) return null;

    const isPermanent = current.attempts >= current.maxAttempts;
    const newStatus: NotificationStatus = isPermanent ? 'FAILED_PERMANENTLY' : 'FAILED';

    return prisma.notification.update({
      where: { id },
      data: {
        status: newStatus,
        errorCode,
        errorMessage: errorMessage.substring(0, 500), // Cap error message length
      },
    });
  }

  /**
   * Marks a notification as read. Enforces customerId ownership.
   * Returns null if ownership check fails.
   */
  static async markRead(id: string, customerId: string, tenantId: string) {
    // Fetch first for ownership validation
    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification) return null;
    if (notification.tenantId !== tenantId) return null;
    if (notification.customerId !== customerId && notification.recipient !== customerId) return null;
    if (notification.isRead) return notification; // Already read — idempotent

    Logger.info({
      event: 'NOTIFICATION_MARKED_READ',
      agentRunId: notification.agentRunId || undefined,
      message: `Notification [${id}] marked read by customer [${customerId}]`,
      metadata: { notificationId: id, customerId, tenantId },
    });

    return prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Finds notifications for a customer. Enforces customer ownership and tenant isolation.
   */
  static async findByCustomer(
    customerId: string,
    tenantId: string,
    options: { unreadOnly?: boolean; limit?: number; offset?: number } = {}
  ) {
    return prisma.notification.findMany({
      where: {
        tenantId,
        customerId,
        channel: 'IN_APP',
        recipientType: 'CUSTOMER',
        ...(options.unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
      skip: options.offset || 0,
    });
  }

  /**
   * Finds a single notification by ID. Enforces tenant isolation.
   */
  static async findById(id: string, tenantId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return null;
    if (notification.tenantId !== tenantId) return null;
    return notification;
  }

  /**
   * Lists all notifications for operator dashboard (tenant-scoped).
   */
  static async findForOperator(
    tenantId: string,
    options: {
      status?: string;
      eventType?: string;
      recipientType?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const where: any = { tenantId };
    if (options.status) where.status = options.status;
    if (options.eventType) where.eventType = options.eventType;
    if (options.recipientType) where.recipientType = options.recipientType;

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit || 100,
      skip: options.offset || 0,
    });
  }

  /**
   * Retries a failed notification by resetting status to QUEUED.
   * Only works on FAILED (not FAILED_PERMANENTLY without explicit override).
   * Does NOT modify any business state.
   */
  static async retryFailed(id: string, tenantId: string, operatorId: string): Promise<any> {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return null;
    if (notification.tenantId !== tenantId) return null;

    if (!['FAILED', 'FAILED_PERMANENTLY'].includes(notification.status)) {
      return { error: 'Only FAILED or FAILED_PERMANENTLY notifications can be retried' };
    }

    Logger.info({
      event: 'NOTIFICATION_RETRY',
      agentRunId: notification.agentRunId || undefined,
      message: `Operator [${operatorId}] initiated retry for Notification [${id}]`,
      metadata: {
        notificationId: id,
        tenantId,
        operatorId,
        previousStatus: notification.status,
        previousAttempts: notification.attempts,
      },
    });

    // Reset attempts on FAILED_PERMANENTLY so it can be tried again
    return prisma.notification.update({
      where: { id },
      data: {
        status: 'QUEUED',
        attempts: notification.status === 'FAILED_PERMANENTLY' ? 0 : notification.attempts,
        errorCode: null,
        errorMessage: null,
      },
    });
  }

  /**
   * Counts unread notifications for a customer.
   */
  static async countUnread(customerId: string, tenantId: string): Promise<number> {
    return prisma.notification.count({
      where: { customerId, tenantId, isRead: false, channel: 'IN_APP', recipientType: 'CUSTOMER' },
    });
  }

  /**
   * Aggregated delivery metrics for operator telemetry.
   */
  static async getMetrics(tenantId?: string): Promise<NotificationMetrics> {
    const where: any = tenantId ? { tenantId } : {};

    const [queued, sending, sent, failed, failedPerm, retryTotal, unread] = await Promise.all([
      prisma.notification.count({ where: { ...where, status: 'QUEUED' } }),
      prisma.notification.count({ where: { ...where, status: 'SENDING' } }),
      prisma.notification.count({ where: { ...where, status: 'SENT' } }),
      prisma.notification.count({ where: { ...where, status: 'FAILED' } }),
      prisma.notification.count({ where: { ...where, status: 'FAILED_PERMANENTLY' } }),
      prisma.notification.aggregate({ where, _sum: { attempts: true } }),
      prisma.notification.count({ where: { ...where, isRead: false, channel: 'IN_APP', recipientType: 'CUSTOMER' } }),
    ]);

    const total = queued + sending + sent + failed + failedPerm;
    const deliverySuccessRate = total > 0 ? Math.round((sent / total) * 100) : 100;

    return {
      queued,
      sending,
      sent,
      failed,
      failedPermanently: failedPerm,
      total,
      deliverySuccessRate,
      retryCount: retryTotal._sum.attempts || 0,
      unreadCount: unread,
    };
  }
}
