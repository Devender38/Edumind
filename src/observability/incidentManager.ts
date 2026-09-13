// ResolveX Phase 23 — Durable Incident Lifecycle & Evidence Management Engine

import { prisma } from '../db/client.js';
import { IncidentFilterOptions, IncidentRecord, IncidentSeverity, IncidentStatus } from './types.js';

export class IncidentManager {
  private static mapRecord(r: any): IncidentRecord {
    const timeline = r.timeline ? JSON.parse(r.timeline) : [];
    const resolvedEvent = timeline.find((t: any) => t.event === 'INCIDENT_RESOLVED');
    const resolutionSummary = resolvedEvent ? resolvedEvent.resolutionSummary : undefined;

    return {
      id: r.id,
      tenantId: r.tenantId,
      tenantScope: r.tenantId,
      incidentKey: r.incidentKey,
      severity: r.severity as IncidentSeverity,
      title: r.title,
      description: r.description,
      status: r.status as IncidentStatus,
      affectedComponent: r.affectedComponent,
      resolutionSummary,
      sourceAlertId: r.sourceAlertId,
      correlationIds: r.correlationIds ? JSON.parse(r.correlationIds) : [],
      runIds: r.runIds ? JSON.parse(r.runIds) : [],
      caseIds: r.caseIds ? JSON.parse(r.caseIds) : [],
      timeline,
      openedAt: r.openedAt.toISOString(),
      acknowledgedAt: r.acknowledgedAt ? r.acknowledgedAt.toISOString() : null,
      resolvedAt: r.resolvedAt ? r.resolvedAt.toISOString() : null,
      closedAt: r.closedAt ? r.closedAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  /**
   * Create an operational incident with fingerprint deduplication & state initialization.
   */
  public static async createIncident(data: {
    title: string;
    description: string;
    severity: IncidentSeverity;
    affectedComponent: string;
    tenantScope?: string;
    tenantId?: string;
    evidence?: any;
    correlationIds?: string[];
    runIds?: string[];
    caseIds?: string[];
  }): Promise<IncidentRecord> {
    const tenantId = data.tenantScope || data.tenantId || 'tenant-a';
    const now = new Date();

    // Check fingerprint deduplication if already open
    const existing = await prisma.incident.findFirst({
      where: {
        affectedComponent: data.affectedComponent,
        title: data.title,
        tenantId,
        status: { in: ['OPEN', 'ACKNOWLEDGED', 'INVESTIGATING', 'MITIGATING'] },
      },
    });

    if (existing) {
      const timeline = existing.timeline ? JSON.parse(existing.timeline) : [];
      timeline.push({
        timestamp: now.toISOString(),
        event: 'EVIDENCE_UPDATED',
        action: 'EVIDENCE_UPDATED',
        actor: 'AUTOMATED_DEDUPLICATION',
        evidence: data.evidence,
      });

      const updated = await prisma.incident.update({
        where: { id: existing.id },
        data: {
          timeline: JSON.stringify(timeline),
          updatedAt: now,
        },
      });
      return (await IncidentManager.getIncidentById(updated.id))!;
    }

    const incidentKey = `inc-${tenantId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const initialTimeline = [
      {
        timestamp: now.toISOString(),
        event: 'CREATED',
        action: 'CREATED',
        actor: 'SYSTEM',
        evidence: data.evidence,
      },
    ];

    const record = await prisma.incident.create({
      data: {
        tenantId,
        incidentKey,
        severity: data.severity,
        title: data.title,
        description: data.description,
        status: 'OPEN',
        affectedComponent: data.affectedComponent,
        correlationIds: JSON.stringify(data.correlationIds || []),
        runIds: JSON.stringify(data.runIds || []),
        caseIds: JSON.stringify(data.caseIds || []),
        timeline: JSON.stringify(initialTimeline),
        openedAt: now,
      },
    });

    return (await IncidentManager.getIncidentById(record.id))!;
  }

  /**
   * List incidents with status/severity filters, search, pagination, and tenant isolation.
   */
  public static async listIncidents(options: IncidentFilterOptions = {}): Promise<{
    incidents: IncidentRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { tenantId, status, severity, search, page = 1, limit = 10 } = options;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }
    if (status && status.trim()) {
      where.status = status.trim().toUpperCase();
    }
    if (severity && severity.trim()) {
      where.severity = severity.trim().toUpperCase();
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { id: { contains: q } },
        { incidentKey: { contains: q } },
        { title: { contains: q } },
        { description: { contains: q } },
        { affectedComponent: { contains: q } },
      ];
    }

    const total = await prisma.incident.count({ where });
    const records = await prisma.incident.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { updatedAt: 'desc' },
    });

    const incidents: IncidentRecord[] = records.map((r: any) => IncidentManager.mapRecord(r));

    return {
      incidents,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
  }

  /**
   * Get single incident detail enforcing tenant boundary if tenantId is provided.
   */
  public static async getIncidentById(id: string, tenantId?: string): Promise<IncidentRecord | null> {
    const r = await prisma.incident.findUnique({ where: { id } });
    if (!r) return null;
    if (tenantId && r.tenantId !== tenantId) return null;

    return IncidentManager.mapRecord(r);
  }

  /**
   * Transitions incident to ACKNOWLEDGED state with timeline audit trace.
   */
  public static async acknowledgeIncident(id: string, actor: string = 'OPERATOR', tenantId?: string): Promise<IncidentRecord | null> {
    return IncidentManager.transitionIncident(id, 'ACKNOWLEDGED', actor, undefined, tenantId);
  }

  /**
   * Transitions incident to INVESTIGATING state with timeline audit trace.
   */
  public static async investigateIncident(id: string, actor: string = 'OPERATOR', note?: string, tenantId?: string): Promise<IncidentRecord | null> {
    return IncidentManager.transitionIncident(id, 'INVESTIGATING', actor, note, tenantId);
  }

  /**
   * Transitions incident to MITIGATING state with timeline audit trace.
   */
  public static async mitigateIncident(id: string, actor: string = 'OPERATOR', note?: string, tenantId?: string): Promise<IncidentRecord | null> {
    return IncidentManager.transitionIncident(id, 'MITIGATING', actor, note, tenantId);
  }

  /**
   * Transitions incident to RESOLVED state with timeline audit trace.
   */
  public static async resolveIncident(
    id: string,
    actor: string = 'OPERATOR',
    resolutionSummary?: string,
    tenantId?: string
  ): Promise<IncidentRecord | null> {
    return IncidentManager.transitionIncident(id, 'RESOLVED', actor, resolutionSummary, tenantId);
  }

  /**
   * Transitions incident to CLOSED state with timeline audit trace.
   */
  public static async closeIncident(id: string, actor: string = 'OPERATOR', tenantId?: string): Promise<IncidentRecord | null> {
    return IncidentManager.transitionIncident(id, 'CLOSED', actor, undefined, tenantId);
  }

  /**
   * Generic state machine transition with strict state validation.
   */
  public static async transitionIncident(
    id: string,
    targetStatus: IncidentStatus,
    actor: string = 'OPERATOR',
    note?: string,
    tenantId?: string
  ): Promise<IncidentRecord | null> {
    const existing = await prisma.incident.findUnique({ where: { id } });
    if (!existing) return null;
    if (tenantId && existing.tenantId !== tenantId) return null;

    if (existing.status === 'CLOSED') {
      throw new Error(`Cannot transition from CLOSED state`);
    }

    const now = new Date();
    const existingTimeline = existing.timeline ? JSON.parse(existing.timeline) : [];
    const eventName = `INCIDENT_${targetStatus}`;

    existingTimeline.push({
      timestamp: now.toISOString(),
      event: eventName,
      action: eventName,
      actor,
      resolutionSummary: targetStatus === 'RESOLVED' ? note : undefined,
      note: targetStatus !== 'RESOLVED' ? note : undefined,
    });

    const updateData: any = {
      status: targetStatus,
      timeline: JSON.stringify(existingTimeline),
      updatedAt: now,
    };

    if (targetStatus === 'ACKNOWLEDGED' && !existing.acknowledgedAt) {
      updateData.acknowledgedAt = now;
    }
    if (targetStatus === 'RESOLVED' && !existing.resolvedAt) {
      updateData.resolvedAt = now;
    }
    if (targetStatus === 'CLOSED' && !existing.closedAt) {
      updateData.closedAt = now;
    }

    const updated = await prisma.incident.update({
      where: { id },
      data: updateData,
    });

    return (await IncidentManager.getIncidentById(updated.id))!;
  }
}

export const incidentManager = IncidentManager;
