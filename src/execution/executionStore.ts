// ResolveX Storage-Agnostic Execution Store — Phase 18 Production Implementation

import { prisma } from '../db/client.js';
import { Logger } from '../utils/logger.js';
import {
  AcquireLeaseResult,
  EnqueueJobParams,
  ExecutionJobPayload,
  ExecutionMetrics,
  ExecutionStore,
  ExecutionJobStatus,
} from './types.js';

export class ExecutionStateMachine {
  private static VALID_TRANSITIONS: Record<ExecutionJobStatus, ExecutionJobStatus[]> = {
    QUEUED: ['RUNNING', 'CANCELLED'],
    RUNNING: ['WAITING', 'COMPLETED', 'FAILED', 'QUEUED'],
    WAITING: ['RUNNING', 'CANCELLED', 'FAILED'],
    COMPLETED: [],
    FAILED: [],
    CANCELLED: [],
  };

  public static canTransition(from: ExecutionJobStatus, to: ExecutionJobStatus): boolean {
    const allowed = this.VALID_TRANSITIONS[from];
    return Boolean(allowed && allowed.includes(to));
  }

  public static validateTransition(from: ExecutionJobStatus, to: ExecutionJobStatus): void {
    if (!this.canTransition(from, to)) {
      throw new Error(`ILLEGAL_EXECUTION_JOB_TRANSITION: Cannot transition ExecutionJob from '${from}' to '${to}'`);
    }
  }
}

export class PrismaExecutionStore implements ExecutionStore {
  private static instance: PrismaExecutionStore | null = null;
  private fencingConflicts: number = 0;
  private leaseLossEvents: number = 0;
  private duplicateClaimAttempts: number = 0;

  public static getInstance(): PrismaExecutionStore {
    if (!this.instance) {
      this.instance = new PrismaExecutionStore();
    }
    return this.instance;
  }

  /**
   * Database-backed transactional enqueue for ExecutionJob
   */
  public async enqueueJob(params: EnqueueJobParams): Promise<ExecutionJobPayload> {
    const tenantId = params.tenantId || 'tenant-a';

    // Check by idempotencyKey if provided
    if (params.idempotencyKey) {
      const existingKey = await prisma.executionJob.findUnique({
        where: { idempotencyKey: params.idempotencyKey },
      });
      if (existingKey) {
        Logger.info({
          event: 'EXECUTION_IDEMPOTENCY_HIT',
          correlationId: params.correlationId || existingKey.correlationId || undefined,
          agentRunId: params.agentRunId,
          message: `Idempotent duplicate enqueue request matched job [${existingKey.id}]`,
          metadata: { idempotencyKey: params.idempotencyKey, jobId: existingKey.id },
        });
        return existingKey as ExecutionJobPayload;
      }
    }

    // Check for an existing active job (QUEUED, RUNNING, or WAITING) for the same AgentRun
    const existingRunJob = await prisma.executionJob.findFirst({
      where: {
        agentRunId: params.agentRunId,
        status: { in: ['QUEUED', 'RUNNING', 'WAITING'] },
      },
    });

    if (existingRunJob) {
      return existingRunJob as ExecutionJobPayload;
    }

    // Execute atomic creation with race condition handling
    try {
      const job = await prisma.executionJob.create({
        data: {
          agentRunId: params.agentRunId,
          tenantId,
          correlationId: params.correlationId || null,
          idempotencyKey: params.idempotencyKey || null,
          status: 'QUEUED',
          maxAttempts: params.maxAttempts || 3,
          leaseGeneration: 0,
        },
      });
      return job as ExecutionJobPayload;
    } catch (err: any) {
      if (err.code === 'P2002' || err.code === 'P2003') {
        // P2002: unique constraint (idempotency key conflict)
        // P2003: FK violation (agentRunId not yet in DB — race condition or test synthetic ID)
        const existing = await prisma.executionJob.findFirst({
          where: {
            OR: [
              ...(params.idempotencyKey ? [{ idempotencyKey: params.idempotencyKey }] : []),
              { agentRunId: params.agentRunId, status: { in: ['QUEUED', 'RUNNING', 'WAITING', 'COMPLETED'] } },
            ],
          },
        });
        if (existing) {
          return existing as ExecutionJobPayload;
        }
        // FK violation with no existing job — agentRunId genuinely missing, throw
        if (err.code === 'P2003') throw err;
      }
      throw err;
    }
  }

  /**
   * Atomically claims or renews an execution lease on a specific job with monotonic leaseGeneration fencing
   */
  public async acquireLeaseAtomically(
    jobId: string,
    workerId: string,
    leaseDurationMs: number,
    expectedGeneration?: number
  ): Promise<AcquireLeaseResult> {
    const now = new Date();
    const leaseUntil = new Date(now.getTime() + leaseDurationMs);

    const currentJob = await prisma.executionJob.findUnique({ where: { id: jobId } });
    if (!currentJob) {
      return { acquired: false, job: null, leaseGeneration: 0 };
    }

    // Verify expected generation if supplied
    if (expectedGeneration !== undefined && currentJob.leaseGeneration !== expectedGeneration) {
      this.fencingConflicts++;
      Logger.warn({
        event: 'EXECUTION_FENCING_CONFLICT',
        message: `Fencing conflict on Job [${jobId}]: Expected generation ${expectedGeneration}, but database has ${currentJob.leaseGeneration}`,
        metadata: { jobId, expectedGeneration, currentGeneration: currentJob.leaseGeneration, workerId },
      });
      return { acquired: false, job: currentJob as ExecutionJobPayload, leaseGeneration: currentJob.leaseGeneration };
    }

    // Verify state machine transition
    if (currentJob.status !== 'QUEUED' && currentJob.status !== 'WAITING' && currentJob.status !== 'RUNNING') {
      return { acquired: false, job: currentJob as ExecutionJobPayload, leaseGeneration: currentJob.leaseGeneration };
    }

    // Atomic update condition: QUEUED, WAITING, or RUNNING with an expired lease
    const updated = await prisma.executionJob.updateMany({
      where: {
        id: jobId,
        leaseGeneration: currentJob.leaseGeneration,
        OR: [
          { status: 'QUEUED' },
          { status: 'WAITING' },
          {
            status: 'RUNNING',
            leaseUntil: { lt: now },
          },
        ],
      },
      data: {
        status: 'RUNNING',
        workerId,
        leaseUntil,
        lastHeartbeatAt: now,
        startedAt: currentJob.startedAt ? currentJob.startedAt : now,
        attempt: { increment: 1 },
        leaseGeneration: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      this.duplicateClaimAttempts++;
      const refreshed = await prisma.executionJob.findUnique({ where: { id: jobId } });
      return {
        acquired: false,
        job: refreshed as ExecutionJobPayload,
        leaseGeneration: refreshed?.leaseGeneration || currentJob.leaseGeneration,
      };
    }

    const claimedJob = await prisma.executionJob.findUnique({ where: { id: jobId } });
    return {
      acquired: true,
      job: claimedJob as ExecutionJobPayload,
      leaseGeneration: claimedJob!.leaseGeneration,
    };
  }

  /**
   * Atomically claims the next available QUEUED or expired RUNNING job deterministically by createdAt ASC, id ASC
   */
  public async acquireNextJobAtomically(
    workerId: string,
    leaseDurationMs: number,
    tenantId?: string
  ): Promise<ExecutionJobPayload | null> {
    const now = new Date();

    const candidates = await prisma.executionJob.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        OR: [
          { status: 'QUEUED' },
          {
            status: 'RUNNING',
            leaseUntil: { lt: now },
          },
        ],
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: 10,
    });

    for (const candidate of candidates) {
      const result = await this.acquireLeaseAtomically(candidate.id, workerId, leaseDurationMs, candidate.leaseGeneration);
      if (result.acquired && result.job) {
        return result.job;
      }
    }

    return null;
  }

  /**
   * Extends active worker lease if workerId and leaseGeneration match authoritative DB state
   */
  public async renewLease(
    jobId: string,
    workerId: string,
    leaseGeneration: number,
    leaseDurationMs: number
  ): Promise<boolean> {
    const now = new Date();
    const leaseUntil = new Date(now.getTime() + leaseDurationMs);

    const updated = await prisma.executionJob.updateMany({
      where: {
        id: jobId,
        workerId,
        leaseGeneration,
        status: 'RUNNING',
      },
      data: {
        lastHeartbeatAt: now,
        leaseUntil,
      },
    });

    if (updated.count === 0) {
      this.leaseLossEvents++;
      Logger.warn({
        event: 'EXECUTION_LEASE_LOST',
        message: `Worker [${workerId}] lost lease for Job [${jobId}] at generation ${leaseGeneration}`,
        metadata: { jobId, workerId, leaseGeneration },
      });
      return false;
    }

    return true;
  }

  /**
   * Marks job COMPLETED if lease generation matches
   */
  public async markCompleted(
    jobId: string,
    workerId: string,
    leaseGeneration: number
  ): Promise<boolean> {
    const now = new Date();
    const updated = await prisma.executionJob.updateMany({
      where: {
        id: jobId,
        workerId,
        leaseGeneration,
        status: 'RUNNING',
      },
      data: {
        status: 'COMPLETED',
        completedAt: now,
        leaseUntil: null,
      },
    });

    if (updated.count === 0) {
      this.fencingConflicts++;
      Logger.warn({
        event: 'EXECUTION_FENCING_CONFLICT',
        message: `Cannot complete Job [${jobId}]: Fencing generation mismatch or lease lost for Worker [${workerId}]`,
        metadata: { jobId, workerId, leaseGeneration },
      });
      return false;
    }

    return true;
  }

  /**
   * Marks job WAITING and releases worker lease if generation matches
   */
  public async markWaiting(
    jobId: string,
    workerId: string,
    leaseGeneration: number
  ): Promise<boolean> {
    const updated = await prisma.executionJob.updateMany({
      where: {
        id: jobId,
        workerId,
        leaseGeneration,
        status: 'RUNNING',
      },
      data: {
        status: 'WAITING',
        workerId: null,
        leaseUntil: null,
      },
    });

    if (updated.count === 0) {
      this.fencingConflicts++;
      return false;
    }

    return true;
  }

  /**
   * Marks job FAILED with error code if generation matches
   */
  public async markFailed(
    jobId: string,
    workerId?: string,
    leaseGeneration?: number,
    errorCode?: string,
    errorMessage?: string
  ): Promise<boolean> {
    const now = new Date();
    const updated = await prisma.executionJob.updateMany({
      where: {
        id: jobId,
        ...(workerId ? { workerId } : {}),
        ...(leaseGeneration !== undefined ? { leaseGeneration } : {}),
      },
      data: {
        status: 'FAILED',
        completedAt: now,
        errorCode: errorCode || 'EXECUTION_FAILED',
        errorMessage: errorMessage || 'Execution terminated with error',
        leaseUntil: null,
      },
    });

    return updated.count > 0;
  }

  /**
   * Scans for all RUNNING jobs with expired leaseUntil timestamps
   */
  public async recoverExpiredLeases(): Promise<ExecutionJobPayload[]> {
    const now = new Date();
    const jobs = await prisma.executionJob.findMany({
      where: {
        status: 'RUNNING',
        leaseUntil: { lt: now },
      },
    });
    return jobs as ExecutionJobPayload[];
  }

  public async getJobById(jobId: string): Promise<ExecutionJobPayload | null> {
    const job = await prisma.executionJob.findUnique({
      where: { id: jobId },
    });
    return job as ExecutionJobPayload | null;
  }

  public async getJobByAgentRunId(agentRunId: string, tenantId?: string): Promise<ExecutionJobPayload | null> {
    const job = await prisma.executionJob.findFirst({
      where: {
        agentRunId,
        ...(tenantId ? { tenantId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return job as ExecutionJobPayload | null;
  }

  public async getMetrics(tenantId?: string): Promise<ExecutionMetrics> {
    const tenantFilter = tenantId ? { tenantId } : {};

    const [totalJobs, queuedJobs, runningJobs, waitingJobs, completedJobs, failedJobs, activeWorkers] =
      await Promise.all([
        prisma.executionJob.count({ where: tenantFilter }),
        prisma.executionJob.count({ where: { ...tenantFilter, status: 'QUEUED' } }),
        prisma.executionJob.count({
          where: {
            ...tenantFilter,
            status: 'RUNNING',
            leaseUntil: { gte: new Date() },
          },
        }),
        prisma.executionJob.count({ where: { ...tenantFilter, status: 'WAITING' } }),
        prisma.executionJob.count({ where: { ...tenantFilter, status: 'COMPLETED' } }),
        prisma.executionJob.count({ where: { ...tenantFilter, status: 'FAILED' } }),
        prisma.executionJob
          .findMany({
            where: {
              ...tenantFilter,
              status: 'RUNNING',
              leaseUntil: { gte: new Date() },
            },
            select: { workerId: true },
            distinct: ['workerId'],
          })
          .then((res) => res.length),
      ]);

    return {
      totalJobs,
      queuedJobs,
      runningJobs,
      waitingJobs,
      completedJobs,
      failedJobs,
      activeWorkers,
      configuredConcurrency: Number(process.env.RESOLVEX_WORKER_CONCURRENCY) || 5,
      isShuttingDown: false,
      fencingConflicts: this.fencingConflicts,
      leaseLossEvents: this.leaseLossEvents,
      duplicateClaimAttempts: this.duplicateClaimAttempts,
    };
  }
}
