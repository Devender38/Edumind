// ResolveX Production Execution Coordinator — Phase 18 Engine

import { ExecutionRepository } from '../db/repositories/executionRepository.js';
import { PrismaExecutionStore } from './executionStore.js';
import { AgentOrchestrator } from '../agents/orchestrator/AgentOrchestrator.js';
import { AgentStateRepository } from '../db/repositories/agentStateRepository.js';
import { Logger } from '../utils/logger.js';
import { FailureInjector } from '../utils/failureInjector.js';
import { ExecutionMetrics, WorkerPoolConfig } from './types.js';

export class ExecutionCoordinator {
  private static instance: ExecutionCoordinator | null = null;

  private workerId: string;
  private concurrency: number;
  private leaseDurationMs: number;
  private heartbeatIntervalMs: number;
  private shutdownGraceMs: number;
  private staleCheckIntervalMs: number;

  private activeJobs: Set<string> = new Set();
  private activeJobGenerations: Map<string, number> = new Map();
  private heartbeatTimers: Map<string, NodeJS.Timeout> = new Map();
  private staleCheckTimer: NodeJS.Timeout | null = null;
  private isShuttingDown: boolean = false;
  private isRunning: boolean = false;
  private store = PrismaExecutionStore.getInstance();

  private constructor(config?: Partial<WorkerPoolConfig>) {
    this.workerId = config?.workerId || `worker-${process.pid}-${Math.random().toString(36).substring(2, 7)}`;
    this.concurrency = config?.concurrency || Number(process.env.RESOLVEX_WORKER_CONCURRENCY) || 5;
    this.leaseDurationMs = config?.leaseDurationMs || 30000;
    this.heartbeatIntervalMs = config?.heartbeatIntervalMs || 5000;
    this.shutdownGraceMs = config?.shutdownGraceMs || 10000;
    this.staleCheckIntervalMs = config?.staleCheckIntervalMs || 10000;
  }

  public static getInstance(config?: Partial<WorkerPoolConfig>): ExecutionCoordinator {
    if (!this.instance) {
      this.instance = new ExecutionCoordinator(config);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    if (this.instance) {
      this.instance.stopTimers();
      this.instance = null;
    }
  }

  public getWorkerId(): string {
    return this.workerId;
  }

  public isReady(): boolean {
    return !this.isShuttingDown;
  }

  /**
   * Starts background worker loop and periodic stale job recovery
   */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isShuttingDown = false;

    Logger.info({
      event: 'WORKER_STARTING',
      message: `Worker [${this.workerId}] started with concurrency limit ${this.concurrency}`,
      metadata: { workerId: this.workerId, concurrency: this.concurrency },
    });

    // Start background stale lease recovery interval
    this.staleCheckTimer = setInterval(() => {
      this.recoverStaleJobs().catch((err) => {
        Logger.error({
          event: 'EXECUTION_FAILED',
          message: `Stale job recovery loop failed: ${err.message}`,
          metadata: { error: err.message },
        });
      });
    }, this.staleCheckIntervalMs);
    if (this.staleCheckTimer && typeof this.staleCheckTimer.unref === 'function') {
      this.staleCheckTimer.unref();
    }
  }

  /**
   * Stops worker timers without graceful drain
   */
  private stopTimers(): void {
    if (this.staleCheckTimer) {
      clearInterval(this.staleCheckTimer);
      this.staleCheckTimer = null;
    }
    for (const [jobId, timer] of this.heartbeatTimers.entries()) {
      clearInterval(timer);
    }
    this.heartbeatTimers.clear();
    this.activeJobGenerations.clear();
    this.isRunning = false;
  }

  /**
   * Enqueues an AgentRun for execution
   */
  public async enqueueRun(params: {
    agentRunId: string;
    tenantId?: string;
    correlationId?: string;
    idempotencyKey?: string;
    syncExecute?: boolean;
    orchestrationInput?: any;
  }) {
    let targetRunId = params.agentRunId;

    // Ensure target AgentRun exists in DB to prevent foreign key constraint violation
    const existingRun = await AgentStateRepository.getAgentRun(targetRunId).catch(() => null);
    if (!existingRun && params.orchestrationInput?.ticketId) {
      const createdRun = await AgentStateRepository.createAgentRun({
        id: targetRunId,
        ticketId: params.orchestrationInput.ticketId,
        goal: params.orchestrationInput.goal || 'Customer Resolution Request',
        tenantId: params.tenantId || 'tenant-a',
        correlationId: params.correlationId,
      });
      targetRunId = createdRun.id;
    }

    const job = await this.store.enqueueJob({
      agentRunId: targetRunId,
      tenantId: params.tenantId,
      correlationId: params.correlationId,
      idempotencyKey: params.idempotencyKey,
    });

    Logger.info({
      event: 'EXECUTION_QUEUED',
      correlationId: params.correlationId || job.correlationId || undefined,
      agentRunId: targetRunId,
      message: `ExecutionJob [${job.id}] queued for AgentRun [${targetRunId}]`,
      metadata: { jobId: job.id, workerId: this.workerId, tenantId: job.tenantId, idempotencyKey: job.idempotencyKey },
    });

    // If synchronous execution is explicitly requested
    if (params.syncExecute) {
      return this.executeJobLocally(job.id, params.orchestrationInput);
    }

    // Trigger async processing if capacity available
    this.processNextAvailableJobs().catch(() => null);

    return { job, runId: params.agentRunId };
  }

  /**
   * Process loop to acquire and execute queued jobs within concurrency limits
   */
  private async processNextAvailableJobs(): Promise<void> {
    if (this.isShuttingDown || this.activeJobs.size >= this.concurrency) {
      return;
    }

    const job = await this.store.acquireNextJobAtomically(this.workerId, this.leaseDurationMs);
    if (!job) {
      return; // No queued jobs available or capacity full
    }

    this.activeJobGenerations.set(job.id, job.leaseGeneration);

    // Execute job asynchronously
    this.executeJobLocally(job.id).catch(() => null);

    // Recursively check for next available job if capacity permits
    if (this.activeJobs.size < this.concurrency) {
      this.processNextAvailableJobs().catch(() => null);
    }
  }

  /**
   * Directly executes a job with atomic lease management, heartbeats, and safety invariant preservation
   */
  public async executeJobLocally(jobId: string, orchestrationInputOverride?: any) {
    if (this.isShuttingDown) {
      Logger.warn({
        event: 'EXECUTION_LEASE_REJECTED',
        message: `Rejecting execution of Job [${jobId}] because worker is shutting down`,
      });
      return null;
    }

    FailureInjector.checkAndInject('BEFORE_LEASE_CLAIM', jobId);

    // Atomically acquire lease if not already acquired
    let leaseGeneration = this.activeJobGenerations.get(jobId);
    if (leaseGeneration === undefined || !this.activeJobs.has(jobId)) {
      const result = await this.store.acquireLeaseAtomically(jobId, this.workerId, this.leaseDurationMs);
      if (!result.acquired || !result.job) {
        Logger.warn({
          event: 'EXECUTION_LEASE_REJECTED',
          message: `Failed to acquire atomic lease for ExecutionJob [${jobId}]. Job is owned by another worker or completed.`,
          metadata: { jobId, workerId: this.workerId },
        });
        return null;
      }
      leaseGeneration = result.leaseGeneration;
      this.activeJobGenerations.set(jobId, leaseGeneration);
    }

    FailureInjector.checkAndInject('AFTER_LEASE_CLAIM', jobId, { leaseGeneration });

    this.activeJobs.add(jobId);
    this.startHeartbeat(jobId, leaseGeneration);

    Logger.info({
      event: 'EXECUTION_STARTED',
      message: `Worker [${this.workerId}] started executing Job [${jobId}] (Gen: ${leaseGeneration})`,
      metadata: { jobId, workerId: this.workerId, leaseGeneration },
    });

    try {
      const dbJob = await this.store.getJobById(jobId);
      const agentRunId = dbJob?.agentRunId || jobId;

      // Read current AgentRun details
      const existingRun = await AgentStateRepository.getAgentRun(agentRunId).catch(() => null);

      if (!existingRun) {
        if (orchestrationInputOverride) {
          const result = await AgentOrchestrator.run(orchestrationInputOverride);
          if (['WAITING_FOR_APPROVAL', 'WAITING_FOR_CUSTOMER_CONSENT'].includes(result.status)) {
            await this.store.markWaiting(jobId, this.workerId, leaseGeneration);
          } else {
            await this.store.markCompleted(jobId, this.workerId, leaseGeneration);
          }
          return result;
        }
        throw new Error(`AgentRun '${agentRunId}' not found for execution`);
      }

      // If AgentRun is already in a terminal state (RESOLVED, ESCALATED, FAILED), complete execution cleanly
      if (['RESOLVED', 'ESCALATED', 'FAILED'].includes(existingRun.status)) {
        await this.store.markCompleted(jobId, this.workerId, leaseGeneration);
        return { status: existingRun.status, agentRunId };
      }

      // Execute Autonomous Orchestration or Resume paused run
      let result: any;
      if (orchestrationInputOverride?.resumeInput || orchestrationInputOverride?.approvalToken || orchestrationInputOverride?.customerConsentGiven !== undefined) {
        FailureInjector.checkAndInject('BEFORE_RESUME', agentRunId);
        const resumeData = orchestrationInputOverride.resumeInput || orchestrationInputOverride;
        result = await AgentOrchestrator.resumeRun(agentRunId, resumeData);
        FailureInjector.checkAndInject('AFTER_RESUME', agentRunId);
      } else {
        const input = orchestrationInputOverride
          ? { agentRunId, ...orchestrationInputOverride }
          : {
              ticketId: existingRun.ticketId,
              goal: existingRun.goal,
              correlationId: existingRun.correlationId || dbJob?.correlationId || undefined,
              agentRunId: existingRun.id,
            };
        result = await AgentOrchestrator.run(input);
      }

      FailureInjector.checkAndInject('BEFORE_FINAL_EXECUTION_STATE', jobId, { status: result.status });

      // Handle Waiting States (WAITING_FOR_APPROVAL, WAITING_FOR_CUSTOMER_CONSENT)
      if (['WAITING_FOR_APPROVAL', 'WAITING_FOR_CUSTOMER_CONSENT'].includes(result.status)) {
        const marked = await this.store.markWaiting(jobId, this.workerId, leaseGeneration);
        if (!marked) {
          Logger.warn({
            event: 'EXECUTION_FENCING_CONFLICT',
            message: `Stale worker [${this.workerId}] prevented from marking Job [${jobId}] WAITING due to generation mismatch`,
          });
        } else {
          Logger.info({
            event: 'EXECUTION_WAITING',
            correlationId: result.correlationId,
            agentRunId,
            message: `ExecutionJob [${jobId}] paused at business waiting state: ${result.status}`,
            metadata: { jobId, status: result.status },
          });
        }
        return result;
      }

      // Handle Terminal Resolution/Escalation/Failure
      const completed = await this.store.markCompleted(jobId, this.workerId, leaseGeneration);
      if (!completed) {
        Logger.warn({
          event: 'EXECUTION_FENCING_CONFLICT',
          message: `Stale worker [${this.workerId}] prevented from marking Job [${jobId}] COMPLETED due to generation mismatch`,
        });
      } else {
        Logger.info({
          event: 'EXECUTION_COMPLETED',
          correlationId: result.correlationId,
          agentRunId,
          message: `ExecutionJob [${jobId}] completed successfully with status: ${result.status}`,
          metadata: { jobId, status: result.status },
        });
      }

      return result;
    } catch (err: any) {
      Logger.error({
        event: 'EXECUTION_FAILED',
        message: `ExecutionJob [${jobId}] failed: ${err.message}`,
        metadata: { jobId, error: err.message },
      });

      await this.store.markFailed(jobId, this.workerId, leaseGeneration, 'EXECUTION_ERROR', err.message);
      throw err;
    } finally {
      this.stopHeartbeat(jobId);
      this.activeJobs.delete(jobId);
      this.activeJobGenerations.delete(jobId);
      // Trigger next job if capacity available
      this.processNextAvailableJobs().catch(() => null);
    }
  }

  /**
   * Resumes an existing run paused at an approval or consent gate
   */
  public async resumeRun(params: {
    agentRunId: string;
    tenantId?: string;
    correlationId?: string;
    idempotencyKey?: string;
    syncExecute?: boolean;
    resumeInput: any;
  }) {
    const job = await this.store.enqueueJob({
      agentRunId: params.agentRunId,
      tenantId: params.tenantId,
      correlationId: params.correlationId,
      idempotencyKey: params.idempotencyKey,
    });

    Logger.info({
      event: 'EXECUTION_STARTED',
      correlationId: params.correlationId,
      agentRunId: params.agentRunId,
      message: `Resuming ExecutionJob [${job.id}] for AgentRun [${params.agentRunId}]`,
      metadata: { jobId: job.id, workerId: this.workerId },
    });

    if (params.syncExecute) {
      return this.executeJobLocally(job.id, params.resumeInput);
    }

    this.processNextAvailableJobs().catch(() => null);
    return { job, runId: params.agentRunId };
  }

  /**
   * Heartbeat timer for actively running jobs
   */
  private startHeartbeat(jobId: string, leaseGeneration: number): void {
    this.stopHeartbeat(jobId);

    const timer = setInterval(async () => {
      try {
        FailureInjector.checkAndInject('BEFORE_HEARTBEAT', jobId, { leaseGeneration });

        const renewed = await this.store.renewLease(jobId, this.workerId, leaseGeneration, this.leaseDurationMs);
        if (!renewed) {
          Logger.warn({
            event: 'EXECUTION_LEASE_LOST',
            message: `Heartbeat failed: Worker [${this.workerId}] lost lease for Job [${jobId}] (Gen: ${leaseGeneration})`,
          });
          this.stopHeartbeat(jobId);
        } else {
          FailureInjector.checkAndInject('AFTER_HEARTBEAT', jobId, { leaseGeneration });
          Logger.debug({
            event: 'EXECUTION_HEARTBEAT',
            message: `Heartbeat updated for Job [${jobId}] by Worker [${this.workerId}]`,
          });
        }
      } catch (err: any) {
        // Log heartbeat error silently
      }
    }, this.heartbeatIntervalMs);

    this.heartbeatTimers.set(jobId, timer);
    if (timer && typeof timer.unref === 'function') timer.unref();
  }

  private stopHeartbeat(jobId: string): void {
    const timer = this.heartbeatTimers.get(jobId);
    if (timer) {
      clearInterval(timer);
      this.heartbeatTimers.delete(jobId);
    }
  }

  /**
   * Recovers stale jobs with expired leases using Phase 14 ground-truth reconciliation before resuming
   */
  public async recoverStaleJobs(): Promise<number> {
    FailureInjector.checkAndInject('BEFORE_RECOVERY');

    const expiredJobs = await this.store.recoverExpiredLeases();
    if (expiredJobs.length === 0) return 0;

    let recoveredCount = 0;

    for (const job of expiredJobs) {
      Logger.warn({
        event: 'EXECUTION_LEASE_EXPIRED',
        correlationId: job.correlationId || undefined,
        agentRunId: job.agentRunId,
        message: `Stale lease expired for Job [${job.id}] (Worker: ${job.workerId || 'UNKNOWN'}, Gen: ${job.leaseGeneration})`,
        metadata: { jobId: job.id, lastWorkerId: job.workerId, leaseGeneration: job.leaseGeneration },
      });

      // 1. Inspect ground truth state via AgentStateRepository
      const detail = await AgentStateRepository.getOperatorRunDetail(job.agentRunId).catch(() => null);

      // 2. If business mutations were already executed & verified before the crash, reconcile run to RESOLVED
      if (detail && detail.mutationAudit.executed > 0 && detail.mutationAudit.verified > 0) {
        await AgentStateRepository.reconcileAgentRun(job.agentRunId);
        await this.store.markCompleted(job.id, job.workerId || this.workerId, job.leaseGeneration);
        Logger.info({
          event: 'EXECUTION_STALE_RECOVERY',
          agentRunId: job.agentRunId,
          message: `Stale Job [${job.id}] recovered and reconciled to RESOLVED based on verified DB ground truth`,
        });
        recoveredCount++;
        continue;
      }

      // 3. Otherwise, re-enqueue job for safe retry if attempts remain
      if (job.attempt < job.maxAttempts) {
        const claimResult = await this.store.acquireLeaseAtomically(job.id, this.workerId, this.leaseDurationMs, job.leaseGeneration);
        if (claimResult.acquired && claimResult.job) {
          FailureInjector.checkAndInject('AFTER_RECOVERY_CLAIM', job.id, { newGen: claimResult.leaseGeneration });
          Logger.info({
            event: 'EXECUTION_STALE_RECOVERY',
            agentRunId: job.agentRunId,
            message: `Stale Job [${job.id}] recovered by Worker [${this.workerId}] for safe retry (New Gen: ${claimResult.leaseGeneration})`,
          });
          recoveredCount++;
          this.activeJobGenerations.set(job.id, claimResult.leaseGeneration);
          this.activeJobs.add(job.id);
          // Execute recovered job to completion
          await this.executeJobLocally(job.id).catch(() => null);
        }
      } else {
        await this.store.markFailed(job.id, undefined, job.leaseGeneration, 'MAX_ATTEMPTS_EXCEEDED', 'Stale job exceeded maximum lease attempts');
      }
    }

    return recoveredCount;
  }

  /**
   * Graceful process shutdown handling:
   * 1. Rejects new work (readiness = false).
   * 2. Stops acquiring queued jobs.
   * 3. Drains in-flight jobs up to `shutdownGraceMs`.
   * 4. Cleans up heartbeat and stale timers.
   */
  public async shutdown(): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    Logger.info({
      event: 'WORKER_SHUTTING_DOWN',
      message: `Worker [${this.workerId}] initiating graceful shutdown with ${this.activeJobs.size} in-flight jobs (Grace: ${this.shutdownGraceMs}ms)`,
      metadata: { activeJobsCount: this.activeJobs.size },
    });

    const startTime = Date.now();

    // Wait for in-flight active jobs to finish or grace period to expire
    while (this.activeJobs.size > 0 && Date.now() - startTime < this.shutdownGraceMs) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Stop timers
    this.stopTimers();

    if (this.activeJobs.size > 0) {
      Logger.warn({
        event: 'WORKER_STOPPED',
        message: `Shutdown grace period expired with ${this.activeJobs.size} jobs still in-flight. Expiring leases for recovery.`,
        metadata: { inFlightJobs: Array.from(this.activeJobs) },
      });
    } else {
      Logger.info({
        event: 'WORKER_STOPPED',
        message: `Worker [${this.workerId}] shutdown completed cleanly with 0 in-flight jobs`,
      });
    }
  }

  /**
   * Operational metrics for control plane and readiness checks
   */
  public async getMetrics(tenantId?: string): Promise<ExecutionMetrics> {
    const baseMetrics = await this.store.getMetrics(tenantId);
    return {
      ...baseMetrics,
      isShuttingDown: this.isShuttingDown,
    };
  }
}
