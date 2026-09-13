// ResolveX Phase 21 — Case Repository for High-Performance Tenant-Isolated Case Queries

import { prisma } from '../client.js';
import { CaseDetail, CaseFilterOptions, CaseSearchResult, TimelineEntry } from '../../cases/types.js';
import { CaseManager } from '../../cases/CaseManager.js';
import { TimelineEngine } from '../../cases/TimelineEngine.js';

export class CaseRepository {
  /**
   * Search and list cases with pagination, filtering, search, and tenant isolation.
   */
  public async listCases(options: CaseFilterOptions): Promise<CaseSearchResult> {
    const { tenantId, customerId, status, search, page = 1, limit = 10 } = options;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      tenantId,
    };

    if (customerId) {
      where.customerId = customerId;
    }

    if (search && search.trim()) {
      const query = search.trim();
      where.OR = [
        { id: { contains: query } },
        { orderId: { contains: query } },
        { customerId: { contains: query } },
        { customerMessage: { contains: query } },
        { issueType: { contains: query } },
      ];
    }

    // Fetch tickets with associated relations
    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        customer: true,
        order: true,
        agentRuns: {
          orderBy: { startedAt: 'desc' },
          take: 1,
          include: {
            actionRecords: true,
            escalations: true,
          },
        },
        actionRecords: true,
        escalations: true,
        notifications: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Map each ticket to CaseDetail & calculate status
    const allCases: CaseDetail[] = tickets.map((t: any) => {
      const latestRun = t.agentRuns && t.agentRuns.length > 0 ? t.agentRuns[0] : null;
      const computedStatus = CaseManager.mapStatus(t, latestRun);
      const resolutionSummary = CaseManager.getResolutionSummary(computedStatus, t, latestRun);

      return {
        id: t.id,
        tenantId: t.tenantId,
        customerId: t.customerId,
        customerName: t.customer?.name,
        customerEmail: t.customer?.email,
        orderId: t.orderId,
        issueType: t.issueType,
        customerMessage: t.customerMessage,
        status: computedStatus,
        priority: t.priority,
        resolutionType: t.resolutionType,
        resolutionSummary,
        requiresCustomerAction: computedStatus === 'WAITING_FOR_CUSTOMER',
        requiresOperatorApproval: computedStatus === 'WAITING_FOR_APPROVAL',
        currentRunId: latestRun?.id || null,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        order: t.order,
        latestRun,
      };
    });

    // Filter by status if provided
    let filteredCases = allCases;
    if (status && status.trim()) {
      const targetStatus = status.trim().toUpperCase();
      filteredCases = allCases.filter((c) => c.status.toUpperCase() === targetStatus);
    }

    const total = filteredCases.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const paginatedCases = filteredCases.slice(skip, skip + limitNum);

    return {
      cases: paginatedCases,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }

  /**
   * Get single case details enforcing tenant isolation and customer authorization (IDOR protection).
   */
  public async getCaseById(caseId: string, tenantId: string, customerId?: string): Promise<CaseDetail | null> {
    if (!caseId || !tenantId) return null;

    const ticket = await prisma.ticket.findUnique({
      where: { id: caseId },
      include: {
        customer: true,
        order: true,
        agentRuns: {
          orderBy: { startedAt: 'desc' },
          include: {
            traces: { orderBy: { timestamp: 'asc' } },
            actionRecords: true,
            escalations: true,
          },
        },
        actionRecords: true,
        escalations: true,
        notifications: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!ticket) return null;

    // Tenant Isolation Check
    if (ticket.tenantId !== tenantId) {
      return null;
    }

    // IDOR Check for Customer Scope
    if (customerId && ticket.customerId !== customerId) {
      return null;
    }

    const latestRun = ticket.agentRuns && ticket.agentRuns.length > 0 ? ticket.agentRuns[0] : null;
    const computedStatus = CaseManager.mapStatus(ticket, latestRun);
    const resolutionSummary = CaseManager.getResolutionSummary(computedStatus, ticket, latestRun);

    return {
      id: ticket.id,
      tenantId: ticket.tenantId,
      customerId: ticket.customerId,
      customerName: ticket.customer?.name,
      customerEmail: ticket.customer?.email,
      orderId: ticket.orderId,
      issueType: ticket.issueType,
      customerMessage: ticket.customerMessage,
      status: computedStatus,
      priority: ticket.priority,
      resolutionType: ticket.resolutionType,
      resolutionSummary,
      requiresCustomerAction: computedStatus === 'WAITING_FOR_CUSTOMER',
      requiresOperatorApproval: computedStatus === 'WAITING_FOR_APPROVAL',
      currentRunId: latestRun?.id || null,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      order: ticket.order,
      latestRun,
      notifications: ticket.notifications,
      actionRecords: ticket.actionRecords,
    };
  }

  /**
   * Get redacted timeline for a case enforcing RBAC and visibility boundaries.
   */
  public async getCaseTimeline(
    caseId: string,
    tenantId: string,
    customerId?: string,
    isOperator: boolean = false
  ): Promise<TimelineEntry[] | null> {
    const ticket = await prisma.ticket.findUnique({
      where: { id: caseId },
      include: {
        customer: true,
        order: true,
        agentRuns: {
          orderBy: { startedAt: 'asc' },
          include: {
            traces: { orderBy: { timestamp: 'asc' } },
            actionRecords: true,
            escalations: true,
          },
        },
        actionRecords: true,
        escalations: true,
        notifications: true,
      },
    });

    if (!ticket) return null;

    // Security Checks
    if (ticket.tenantId !== tenantId) return null;
    if (customerId && ticket.customerId !== customerId) return null;

    return TimelineEngine.generateTimeline(ticket, isOperator);
  }
}

export const caseRepository = new CaseRepository();
