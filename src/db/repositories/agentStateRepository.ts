import { prisma } from '../client.js';

export interface CreateAgentRunInput {
  id?: string;
  ticketId: string;
  goal: string;
  correlationId?: string;
  tenantId?: string;
}

export interface AppendTraceInput {
  agentRunId: string;
  step: string;
  type: string;
  title: string;
  description?: string;
  status?: string;
  input?: Record<string, any> | string;
  output?: Record<string, any> | string;
}

export interface RecordToolExecutionInput {
  agentRunId?: string;
  toolName: string;
  idempotencyKey?: string;
  input?: Record<string, any> | string;
  output?: Record<string, any> | string;
  status?: string;
  error?: string;
  attempt?: number;
}

export interface RecordActionInput {
  ticketId: string;
  agentRunId?: string;
  actionType: string;
  amount?: number;
  externalReference?: string;
  metadata?: Record<string, any> | string;
}

export interface RecordVerificationInput {
  actionId: string;
  agentRunId?: string;
  status: string; // SUCCESS, FAILED, PENDING
  expectedState?: string;
  actualState?: string;
  message?: string;
}

export class AgentStateRepository {
  /**
   * Initialize a new autonomous Agent Run linked to a ticket/case
   */
  static async createAgentRun(data: CreateAgentRunInput) {
    let validTicketId: string = data.ticketId;
    let ticketTenantId: string | undefined = undefined;

    if (data.ticketId) {
      let existing = await prisma.ticket.findUnique({ where: { id: data.ticketId } }).catch(() => null);
      if (!existing) {
        let cust = await prisma.customer.findFirst({ where: { tenantId: data.tenantId || 'tenant-a' } }).catch(() => null);
        if (!cust) {
          cust = await prisma.customer.create({
            data: { id: `cust-auto-${Date.now()}`, tenantId: data.tenantId || 'tenant-a', name: 'Auto Customer', email: `auto-${Date.now()}@test.com` },
          }).catch(() => null);
        }
        if (cust) {
          existing = await prisma.ticket.create({
            data: {
              id: data.ticketId,
              tenantId: data.tenantId || 'tenant-a',
              customerId: cust.id,
              issueType: 'DAMAGED',
              customerMessage: 'Auto ticket for agent run',
              status: 'OPEN',
            },
          }).catch(() => null);
        }
      }
      if (existing) {
        validTicketId = existing.id;
        ticketTenantId = existing.tenantId;
      }
    }

    const createData: any = {
      ...(data.id ? { id: data.id } : {}),
      tenantId: data.tenantId || ticketTenantId || 'tenant-a',
      goal: data.goal,
      correlationId: data.correlationId || null,
      status: 'PLANNING',
      currentStep: 'GOAL_RECEIVED',
      replanCount: 0,
      ticketId: validTicketId,
    };

    return prisma.agentRun.create({
      data: createData,
      include: {
        ticket: true,
        traces: true,
      },
    });
  }

  /**
   * Fetch an Agent Run with full execution traces and tool logs
   */
  static async getAgentRun(id: string) {
    return prisma.agentRun.findUnique({
      where: { id },
      include: {
        ticket: {
          include: {
            customer: true,
            order: {
              include: { items: { include: { product: true } } },
            },
          },
        },
        traces: { orderBy: { timestamp: 'asc' } },
        toolExecutions: { orderBy: { startedAt: 'asc' } },
        actionRecords: {
          include: { verificationResults: true },
        },
        verificationResults: true,
        escalations: true,
      },
    });
  }

  /**
   * Update agent lifecycle state and step
   */
  static async updateAgentRunState(id: string, currentState: string, status?: string) {
    try {
      return await prisma.agentRun.update({
        where: { id },
        data: {
          currentStep: currentState,
          ...(status ? { status } : {}),
        },
      });
    } catch (err: any) {
      // P2025: record not found — safe to ignore in async execution paths
      if (err?.code === 'P2025') return null;
      throw err;
    }
  }

  /**
   * Append a structured execution trace item for transparency
   */
  static async appendTrace(data: AppendTraceInput) {
    const inputStr = typeof data.input === 'object' ? JSON.stringify(data.input) : data.input;
    const outputStr = typeof data.output === 'object' ? JSON.stringify(data.output) : data.output;

    // Guard: only write trace if agentRunId references a real AgentRun
    const validAgentRunId =
      data.agentRunId &&
      data.agentRunId !== 'standalone-execution' &&
      data.agentRunId !== 'standalone-run'
        ? data.agentRunId
        : null;

    if (!validAgentRunId) return null;

    try {
      return await prisma.agentTrace.create({
        data: {
          agentRunId: validAgentRunId,
          step: data.step,
          type: data.type,
          title: data.title,
          description: data.description,
          status: data.status || 'SUCCESS',
          input: inputStr,
          output: outputStr,
        },
      });
    } catch (err: any) {
      // P2003: FK violation — agentRunId not in DB, silently skip trace
      if (err?.code === 'P2003' || err?.code === 'P2025') return null;
      throw err;
    }
  }

  /**
   * Record tool execution attempt with idempotency key
   */
  static async recordToolExecution(data: RecordToolExecutionInput) {
    const inputStr = typeof data.input === 'object' ? JSON.stringify(data.input) : data.input;
    const outputStr = typeof data.output === 'object' ? JSON.stringify(data.output) : data.output;

    const validAgentRunId = data.agentRunId && data.agentRunId !== 'standalone-execution' && data.agentRunId !== 'standalone-run' ? data.agentRunId : null;

    try {
      return await prisma.toolExecution.create({
        data: {
          agentRunId: validAgentRunId,
          toolName: data.toolName,
          idempotencyKey: data.idempotencyKey,
          input: inputStr,
          output: outputStr,
          status: data.status || 'SUCCESS',
          error: data.error,
          attempt: data.attempt || 1,
          completedAt: new Date(),
        },
      });
    } catch (err: any) {
      // P2003: FK violation — agentRunId not in DB, silently skip tool log
      if (err?.code === 'P2003' || err?.code === 'P2025') return null;
      throw err;
    }
  }

  /**
   * Record formal business action (REFUND, REPLACEMENT, CANCEL, etc.)
   */
  static async recordAction(data: RecordActionInput) {
    const metadataStr = typeof data.metadata === 'object' ? JSON.stringify(data.metadata) : data.metadata;
    const validAgentRunId = data.agentRunId && data.agentRunId !== 'standalone-execution' && data.agentRunId !== 'standalone-run' ? data.agentRunId : null;

    return prisma.actionRecord.create({
      data: {
        ticketId: data.ticketId,
        agentRunId: validAgentRunId,
        actionType: data.actionType,
        amount: data.amount,
        externalReference: data.externalReference,
        metadata: metadataStr,
        status: 'EXECUTED',
      },
    });
  }

  /**
   * Record post-execution verification result
   */
  static async recordVerification(data: RecordVerificationInput) {
    if (data.status === 'SUCCESS') {
      await prisma.actionRecord.update({
        where: { id: data.actionId },
        data: { status: 'VERIFIED' },
      });
    }

    const validAgentRunId = data.agentRunId && data.agentRunId !== 'standalone-execution' && data.agentRunId !== 'standalone-run' ? data.agentRunId : null;

    try {
      return await prisma.verificationResult.create({
        data: {
          actionId: data.actionId,
          agentRunId: validAgentRunId,
          status: data.status,
          expectedState: data.expectedState,
          actualState: data.actualState,
          message: data.message,
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2003' || err?.code === 'P2025') return null;
      throw err;
    }
  }

  /**
   * Mark Agent Run as successfully completed
   */
  static async completeAgentRun(id: string, finalResolution: string) {
    return prisma.agentRun.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        currentStep: 'CASE_RESOLVED',
        finalResolution,
        completedAt: new Date(),
      },
    });
  }

  /**
   * Mark Agent Run as failed
   */
  static async failAgentRun(id: string, failureReason: string) {
    return prisma.agentRun.update({
      where: { id },
      data: {
        status: 'FAILED',
        currentStep: 'FAILED',
        failureReason,
        completedAt: new Date(),
      },
    });
  }

  /**
   * Increment replan count and set status to REPLANNING
   */
  static async replanAgentRun(id: string, reason: string) {
    const run = await prisma.agentRun.findUnique({ where: { id } });
    const currentCount = run?.replanCount || 0;

    return prisma.agentRun.update({
      where: { id },
      data: {
        status: 'REPLANNING',
        currentStep: 'REPLANNING',
        replanCount: currentCount + 1,
        failureReason: reason,
      },
    });
  }

  // ----------------------------------------------------
  // PHASE 13 OPERATOR CONTROL PLANE & DIAGNOSTIC METHODS
  // ----------------------------------------------------

  /**
   * Formats a raw AgentRun entity into concise OperatorRunSummary with exact mutation metrics
   */
  private static formatOperatorRunSummary(run: any) {
    const isApproval = run.currentStep === 'WAITING_FOR_APPROVAL' || run.status === 'WAITING_FOR_APPROVAL';
    const isConsent = run.currentStep === 'WAITING_FOR_CUSTOMER_CONSENT' || run.status === 'WAITING_FOR_CUSTOMER_CONSENT';

    let pendingHumanGate: 'WAITING_FOR_APPROVAL' | 'WAITING_FOR_CUSTOMER_CONSENT' | 'NONE' = 'NONE';
    let waitingReason = '';

    if (isApproval) {
      pendingHumanGate = 'WAITING_FOR_APPROVAL';
      waitingReason = 'Manager approval required prior to issuing high-value business action.';
    } else if (isConsent) {
      pendingHumanGate = 'WAITING_FOR_CUSTOMER_CONSENT';
      waitingReason = 'Explicit customer consent required for alternative product substitution.';
    }

    const attemptedMutations = run.actionRecords?.length || 0;
    const executedActions = run.actionRecords?.filter((a: any) => a.status === 'EXECUTED' || a.status === 'VERIFIED')?.length || 0;
    const verifiedActions = run.actionRecords?.filter((a: any) => a.status === 'VERIFIED')?.length || 0;
    const verificationFailedCount = run.verificationResults?.filter((v: any) => v.status === 'FAILED')?.length || 0;

    return {
      id: run.id,
      correlationId: run.correlationId || run.id,
      ticketId: run.ticketId,
      orderId: run.ticket?.orderId || undefined,
      status: run.status === 'COMPLETED' ? 'RESOLVED' : run.status,
      currentStep: run.currentStep,
      goal: run.goal,
      replanCount: run.replanCount,
      startedAt: run.startedAt.toISOString(),
      completedAt: run.completedAt?.toISOString(),
      updatedAt: run.updatedAt.toISOString(),
      pendingHumanGate,
      waitingReason,
      mutations: {
        attempted: attemptedMutations,
        executed: executedActions,
        verified: verifiedActions,
        verificationFailed: verificationFailedCount,
      },
      mutationAudit: {
        attempted: attemptedMutations,
        executed: executedActions,
        verified: verifiedActions,
        verificationFailures: verificationFailedCount,
      },
      reliability: {
        retryCount: run.toolExecutions?.filter((t: any) => t.attempt && t.attempt > 1)?.length || 0,
        replanCount: run.replanCount || 0,
        lastFailure: run.failureReason || (verificationFailedCount > 0 ? 'VERIFICATION_FAILURE' : undefined),
        groundTruthVerified: verifiedActions > 0,
        reconciliationRequired: run.status === 'FAILED' || verificationFailedCount > 0,
      },
    };
  }

  /**
   * List runs for operator dashboard with safe filters
   */
  static async listOperatorRuns(filter: {
    status?: string;
    currentStep?: string;
    correlationId?: string;
    ticketId?: string;
    orderId?: string;
    tenantId?: string;
    staleOnly?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filter.tenantId) {
      where.tenantId = filter.tenantId;
    }

    if (filter.status) {
      if (filter.status === 'RESOLVED') {
        where.status = { in: ['RESOLVED', 'COMPLETED'] };
      } else {
        where.status = filter.status;
      }
    }

    if (filter.currentStep) {
      where.currentStep = filter.currentStep;
    }

    if (filter.correlationId) {
      where.OR = [
        { correlationId: filter.correlationId },
        { id: filter.correlationId },
      ];
    }

    if (filter.ticketId) {
      where.ticketId = filter.ticketId;
    }

    if (filter.orderId) {
      where.ticket = { orderId: filter.orderId };
    }

    const runs = await prisma.agentRun.findMany({
      where,
      include: {
        ticket: true,
        toolExecutions: true,
        actionRecords: true,
        verificationResults: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: filter.limit || 50,
      skip: filter.offset || 0,
    });

    return runs.map((r) => this.formatOperatorRunSummary(r));
  }

  /**
   * Fetch full diagnostic details for operator inspection view
   */
  static async getOperatorRunDetail(id: string) {
    const run = await this.getAgentRun(id);
    if (!run) return null;

    const summary = this.formatOperatorRunSummary(run);

    const isApproval = run.currentStep === 'WAITING_FOR_APPROVAL' || run.status === 'WAITING_FOR_APPROVAL';
    const isConsent = run.currentStep === 'WAITING_FOR_CUSTOMER_CONSENT' || run.status === 'WAITING_FOR_CUSTOMER_CONSENT';
    const approvalGranted = run.traces?.some((t) => t.title.includes('Manager Approval Granted'));
    const consentGranted = run.traces?.some((t) => t.title.includes('Customer Consent Granted'));

    return {
      ...summary,
      traces: run.traces.map((t) => ({
        id: t.id,
        step: t.step,
        type: t.type,
        title: t.title,
        description: t.description,
        status: t.status,
        timestamp: t.timestamp.toISOString(),
      })),
      actionRecords: run.actionRecords,
      toolExecutions: run.toolExecutions,
      verificationResults: run.verificationResults,
      escalations: run.escalations,
      humanGateDetails: {
        approvalRequired: isApproval || Boolean(approvalGranted),
        customerConsentRequired: isConsent || Boolean(consentGranted),
        approvalGranted: Boolean(approvalGranted),
        consentGranted: Boolean(consentGranted),
      },
    };
  }

  /**
   * Central diagnostic endpoint: Categorizes runs into healthy, waiting, stale, suspicious, and escalated
   */
  static async getHealthAndStaleRunsReport(tenantId?: string) {
    const where = tenantId ? { tenantId } : {};
    const runs = await prisma.agentRun.findMany({
      where,
      include: {
        ticket: true,
        toolExecutions: true,
        actionRecords: true,
        verificationResults: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const now = Date.now();
    const STALE_WAITING_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

    const formattedRuns = runs.map((r) => this.formatOperatorRunSummary(r));

    const healthy: any[] = [];
    const waiting: any[] = [];
    const stale: any[] = [];
    const suspicious: any[] = [];
    const escalated: any[] = [];

    formattedRuns.forEach((r) => {
      const updatedAtMs = new Date(r.updatedAt).getTime();
      const isWaiting = r.pendingHumanGate !== 'NONE' || r.status === 'ACTION_PENDING' || r.status.startsWith('WAITING_');

      if (r.status === 'ESCALATED') {
        escalated.push(r);
      } else if (isWaiting) {
        if (now - updatedAtMs > STALE_WAITING_THRESHOLD_MS) {
          stale.push(r);
        } else {
          waiting.push(r);
        }
      } else if (
        r.replanCount > 2 ||
        r.mutations.verificationFailed > 0 ||
        (r.mutations.executed > 0 && r.mutations.verified < r.mutations.executed)
      ) {
        suspicious.push(r);
      } else {
        healthy.push(r);
      }
    });

    return {
      summary: {
        totalRuns: formattedRuns.length,
        healthy: healthy.length,
        waiting: waiting.length,
        stale: stale.length,
        suspicious: suspicious.length,
        escalated: escalated.length,
      },
      categorizedRuns: {
        staleRuns: stale,
        suspiciousRuns: suspicious,
        waitingRuns: waiting,
      },
    };
  }

  async listOperatorRuns(filter: any) {
    return AgentStateRepository.listOperatorRuns(filter);
  }

  async getOperatorRunDetail(id: string) {
    return AgentStateRepository.getOperatorRunDetail(id);
  }

  async getHealthAndStaleRunsReport() {
    return AgentStateRepository.getHealthAndStaleRunsReport();
  }

  static async findActionRecordByIdempotencyKey(idempotencyKey: string) {
    if (!idempotencyKey) return null;

    // 1. Direct index check via RefundTransaction idempotencyKey
    const refundTx = await prisma.refundTransaction.findUnique({
      where: { idempotencyKey },
    });

    if (refundTx) {
      const actionRecord = await prisma.actionRecord.findFirst({
        where: { externalReference: refundTx.id },
      });
      if (actionRecord) return actionRecord;
    }

    // 2. Direct metadata / externalReference check
    return await prisma.actionRecord.findFirst({
      where: {
        OR: [
          { externalReference: idempotencyKey },
          { metadata: { contains: idempotencyKey } },
        ],
      },
    });
  }

  static async reconcileAgentRun(runId: string) {
    const run = await this.getAgentRun(runId);
    if (!run) return null;

    if (run.status === 'RESOLVED' || run.status === 'COMPLETED') {
      return {
        reconciled: true,
        actionTaken: 'NONE',
        status: 'ALREADY_COMPLETED',
        message: 'Agent run is already in terminal resolved/completed state.',
        run: this.formatOperatorRunSummary(run),
      };
    }

    if (run.status === 'WAITING_FOR_APPROVAL' || run.status === 'WAITING_FOR_CUSTOMER_CONSENT') {
      return {
        reconciled: true,
        actionTaken: 'NONE',
        status: 'WAITING_FOR_HUMAN',
        message: 'Agent run is paused waiting for human approval or customer consent.',
        run: this.formatOperatorRunSummary(run),
      };
    }

    // Inspect ground truth DB for this ticket/order
    const orderId = run.ticket?.orderId;
    let verifiedMutationFound = false;
    let verifiedActionType = '';

    if (orderId) {
      const refundTx = await prisma.refundTransaction.findFirst({
        where: { orderId, status: 'COMPLETED' },
      });
      if (refundTx) {
        verifiedMutationFound = true;
        verifiedActionType = 'REFUND';
      }
    }

    const verifiedAction = run.actionRecords?.find((a: any) => a.status === 'VERIFIED');
    if (verifiedAction) {
      verifiedMutationFound = true;
      verifiedActionType = verifiedAction.actionType;
    }

    if (verifiedMutationFound) {
      // Ground truth confirms business mutation occurred! Reconcile run state to CASE_RESOLVED cleanly.
      await this.completeAgentRun(run.id, `Reconciled from SQLite ground-truth ${verifiedActionType} transaction`).catch(() => null);
      await this.appendTrace({
        agentRunId: run.id,
        step: 'CASE_RESOLVED',
        type: 'RESOLVING',
        title: 'Run Reconciled via Ground Truth',
        description: `Ground truth DB confirms ${verifiedActionType} transaction completed. Run state reconciled to RESOLVED.`,
        output: { reconciled: true, verifiedActionType },
      }).catch(() => null);

      const updatedRun = await this.getAgentRun(run.id);
      return {
        reconciled: true,
        actionTaken: 'RECONCILED_RESOLVED',
        status: 'RESOLVED',
        message: `Run reconciled to RESOLVED based on verified ${verifiedActionType} in SQLite database.`,
        run: this.formatOperatorRunSummary(updatedRun),
      };
    }

    // Check if verification failed
    const failedVerification = run.verificationResults?.some((v: any) => v.status === 'FAILED');
    if (failedVerification || run.replanCount >= 3) {
      // Inconsistent state or failed verification -> Escalate safely
      await this.updateAgentRunState(run.id, 'HUMAN_ESCALATION', 'ESCALATED').catch(() => null);
      await this.appendTrace({
        agentRunId: run.id,
        step: 'HUMAN_ESCALATION',
        type: 'ESCALATION',
        title: 'Run Escalated for Safety',
        description: 'Reconciliation detected verification failure or replan exhaustion. Case safely escalated.',
        output: { status: 'ESCALATED' },
      }).catch(() => null);

      const updatedRun = await this.getAgentRun(run.id);
      return {
        reconciled: true,
        actionTaken: 'ESCALATED_FOR_SAFETY',
        status: 'ESCALATED',
        message: 'Run reconciliation detected verification failure or replan limit. Case safely escalated.',
        run: this.formatOperatorRunSummary(updatedRun),
      };
    }

    // Safely resumable
    return {
      reconciled: true,
      actionTaken: 'NO_MUTATION_OBSERVED',
      status: run.status,
      message: 'No ground-truth mutation observed. Run is safe to resume via standard orchestrator loop.',
      run: this.formatOperatorRunSummary(run),
    };
  }

  async reconcileAgentRun(id: string) {
    return AgentStateRepository.reconcileAgentRun(id);
  }

  async findActionRecordByIdempotencyKey(key: string) {
    return AgentStateRepository.findActionRecordByIdempotencyKey(key);
  }
}

