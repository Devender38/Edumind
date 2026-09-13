// ResolveX Execution Job Repository — Phase 18 Atomic Lease & Store Integration

import { PrismaExecutionStore } from '../../execution/executionStore.js';
import { ExecutionJobStatus, ExecutionMetrics, ExecutionJobPayload } from '../../execution/types.js';

export class ExecutionRepository {
  private static store = PrismaExecutionStore.getInstance();

  /**
   * Enqueues a new ExecutionJob for an AgentRun
   */
  public static async createJob(params: {
    agentRunId: string;
    tenantId?: string;
    correlationId?: string;
    idempotencyKey?: string;
    maxAttempts?: number;
  }) {
    return this.store.enqueueJob(params);
  }

  /**
   * Atomically acquires an execution lease on a specific job for workerId with monotonic fencing
   */
  public static async acquireLeaseAtomically(
    jobId: string,
    workerId: string,
    leaseDurationMs: number,
    expectedGeneration?: number
  ): Promise<boolean> {
    const result = await this.store.acquireLeaseAtomically(jobId, workerId, leaseDurationMs, expectedGeneration);
    return result.acquired;
  }

  /**
   * Atomically claims the next available QUEUED or expired RUNNING job (createdAt ASC)
   */
  public static async acquireNextJobAtomically(
    workerId: string,
    leaseDurationMs: number,
    tenantId?: string
  ): Promise<ExecutionJobPayload | null> {
    return this.store.acquireNextJobAtomically(workerId, leaseDurationMs, tenantId);
  }

  /**
   * Updates heartbeat and extends lease duration if job is still owned by workerId and generation matches
   */
  public static async updateHeartbeat(
    jobId: string,
    workerId: string,
    leaseDurationMs: number,
    leaseGeneration?: number
  ): Promise<boolean> {
    const job = await this.store.getJobById(jobId);
    if (!job) return false;
    const generation = leaseGeneration !== undefined ? leaseGeneration : job.leaseGeneration;
    return this.store.renewLease(jobId, workerId, generation, leaseDurationMs);
  }

  /**
   * Marks execution job COMPLETED and releases worker lease
   */
  public static async markCompleted(
    jobId: string,
    workerId?: string,
    leaseGeneration?: number
  ): Promise<boolean> {
    const job = await this.store.getJobById(jobId);
    if (!job) return false;
    const wId = workerId || job.workerId || '';
    const gen = leaseGeneration !== undefined ? leaseGeneration : job.leaseGeneration;
    return this.store.markCompleted(jobId, wId, gen);
  }

  /**
   * Marks execution job WAITING and releases worker lease
   */
  public static async markWaiting(
    jobId: string,
    workerId?: string,
    leaseGeneration?: number
  ): Promise<boolean> {
    const job = await this.store.getJobById(jobId);
    if (!job) return false;
    const wId = workerId || job.workerId || '';
    const gen = leaseGeneration !== undefined ? leaseGeneration : job.leaseGeneration;
    return this.store.markWaiting(jobId, wId, gen);
  }

  /**
   * Marks execution job FAILED with error details
   */
  public static async markFailed(
    jobId: string,
    workerId?: string,
    errorCode?: string,
    errorMessage?: string,
    leaseGeneration?: number
  ): Promise<boolean> {
    return this.store.markFailed(jobId, workerId, leaseGeneration, errorCode, errorMessage);
  }

  /**
   * Scans and returns all jobs with expired leases
   */
  public static async recoverExpiredLeases() {
    return this.store.recoverExpiredLeases();
  }

  /**
   * Finds execution job by job ID
   */
  public static async getJobById(jobId: string) {
    return this.store.getJobById(jobId);
  }

  /**
   * Finds execution job by AgentRun ID
   */
  public static async getJobByAgentRunId(agentRunId: string, tenantId?: string) {
    return this.store.getJobByAgentRunId(agentRunId, tenantId);
  }

  /**
   * Returns operational metrics summary for execution jobs
   */
  public static async getMetrics(tenantId?: string): Promise<ExecutionMetrics> {
    return this.store.getMetrics(tenantId);
  }
}
