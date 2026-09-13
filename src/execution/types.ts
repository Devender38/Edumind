// ResolveX Production Execution Architecture — Phase 18 Distributed Types & Store Interface

export type ExecutionJobStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface ExecutionJobPayload {
  id: string;
  agentRunId: string;
  tenantId: string;
  status: ExecutionJobStatus;
  workerId?: string | null;
  leaseUntil?: Date | null;
  lastHeartbeatAt?: Date | null;
  leaseGeneration: number;
  idempotencyKey?: string | null;
  attempt: number;
  maxAttempts: number;
  correlationId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export interface WorkerPoolConfig {
  workerId: string;
  concurrency: number;
  leaseDurationMs: number;
  heartbeatIntervalMs: number;
  shutdownGraceMs: number;
  staleCheckIntervalMs: number;
}

export interface ExecutionMetrics {
  totalJobs: number;
  queuedJobs: number;
  runningJobs: number;
  waitingJobs: number;
  completedJobs: number;
  failedJobs: number;
  activeWorkers: number;
  configuredConcurrency: number;
  isShuttingDown: boolean;
  fencingConflicts?: number;
  leaseLossEvents?: number;
  recoveredJobs?: number;
  duplicateClaimAttempts?: number;
}

export type ExecutionEventType =
  | 'EXECUTION_QUEUED'
  | 'EXECUTION_STARTED'
  | 'EXECUTION_LEASE_ACQUIRED'
  | 'EXECUTION_LEASE_REJECTED'
  | 'EXECUTION_HEARTBEAT'
  | 'EXECUTION_WAITING'
  | 'EXECUTION_COMPLETED'
  | 'EXECUTION_FAILED'
  | 'EXECUTION_LEASE_EXPIRED'
  | 'EXECUTION_RECOVERED'
  | 'EXECUTION_CLAIM_CONFLICT'
  | 'EXECUTION_LEASE_LOST'
  | 'EXECUTION_FENCING_CONFLICT'
  | 'EXECUTION_STALE_RECOVERY'
  | 'EXECUTION_IDEMPOTENCY_HIT'
  | 'EXECUTION_TRANSACTION_ROLLBACK'
  | 'EXECUTION_RESUME_CONFLICT'
  | 'EXECUTION_DUPLICATE_CLAIM'
  | 'WORKER_STARTING'
  | 'WORKER_SHUTTING_DOWN'
  | 'WORKER_STOPPED';

export interface EnqueueJobParams {
  agentRunId: string;
  tenantId?: string;
  correlationId?: string;
  idempotencyKey?: string;
  maxAttempts?: number;
}

export interface AcquireLeaseResult {
  acquired: boolean;
  job: ExecutionJobPayload | null;
  leaseGeneration: number;
}

export interface ExecutionStore {
  enqueueJob(params: EnqueueJobParams): Promise<ExecutionJobPayload>;
  acquireLeaseAtomically(jobId: string, workerId: string, leaseDurationMs: number, expectedGeneration?: number): Promise<AcquireLeaseResult>;
  acquireNextJobAtomically(workerId: string, leaseDurationMs: number, tenantId?: string): Promise<ExecutionJobPayload | null>;
  renewLease(jobId: string, workerId: string, leaseGeneration: number, leaseDurationMs: number): Promise<boolean>;
  markCompleted(jobId: string, workerId: string, leaseGeneration: number): Promise<boolean>;
  markWaiting(jobId: string, workerId: string, leaseGeneration: number): Promise<boolean>;
  markFailed(jobId: string, workerId?: string, leaseGeneration?: number, errorCode?: string, errorMessage?: string): Promise<boolean>;
  recoverExpiredLeases(): Promise<ExecutionJobPayload[]>;
  getJobById(jobId: string): Promise<ExecutionJobPayload | null>;
  getJobByAgentRunId(agentRunId: string, tenantId?: string): Promise<ExecutionJobPayload | null>;
  getMetrics(tenantId?: string): Promise<ExecutionMetrics>;
}
