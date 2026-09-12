import { prisma } from '../client.js';

export interface CreateAgentRunInput {
  ticketId: string;
  goal: string;
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
    return prisma.agentRun.create({
      data: {
        ticketId: data.ticketId,
        goal: data.goal,
        status: 'PLANNING',
        currentStep: 'GOAL_RECEIVED',
        replanCount: 0,
      },
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
    return prisma.agentRun.update({
      where: { id },
      data: {
        currentStep: currentState,
        ...(status ? { status } : {}),
      },
    });
  }

  /**
   * Append a structured execution trace item for transparency
   */
  static async appendTrace(data: AppendTraceInput) {
    const inputStr = typeof data.input === 'object' ? JSON.stringify(data.input) : data.input;
    const outputStr = typeof data.output === 'object' ? JSON.stringify(data.output) : data.output;

    return prisma.agentTrace.create({
      data: {
        agentRunId: data.agentRunId,
        step: data.step,
        type: data.type,
        title: data.title,
        description: data.description,
        status: data.status || 'SUCCESS',
        input: inputStr,
        output: outputStr,
      },
    });
  }

  /**
   * Record tool execution attempt with idempotency key
   */
  static async recordToolExecution(data: RecordToolExecutionInput) {
    const inputStr = typeof data.input === 'object' ? JSON.stringify(data.input) : data.input;
    const outputStr = typeof data.output === 'object' ? JSON.stringify(data.output) : data.output;

    const validAgentRunId = data.agentRunId && data.agentRunId !== 'standalone-execution' && data.agentRunId !== 'standalone-run' ? data.agentRunId : null;

    return prisma.toolExecution.create({
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

    return prisma.verificationResult.create({
      data: {
        actionId: data.actionId,
        agentRunId: validAgentRunId,
        status: data.status,
        expectedState: data.expectedState,
        actualState: data.actualState,
        message: data.message,
      },
    });
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
}
