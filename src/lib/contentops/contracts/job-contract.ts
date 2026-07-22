/**
 * ContentOps Job Contract
 * 
 * 统一的 Job 数据结构
 * Worker 和 API 都必须使用这个 Contract
 */

/**
 * Job status enum
 */
export const JOB_STATUS = {
  QUEUED: 'QUEUED',
  CLAIMED: 'CLAIMED',
  RUNNING: 'RUNNING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  RETRY_WAIT: 'RETRY_WAIT',
  DEAD_LETTER: 'DEAD_LETTER',
} as const;

export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];

/**
 * Job data structure
 */
export interface ContentOpsJob {
  id: string;
  jobId: string;
  taskId: string;
  
  status: JobStatus;
  
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt?: string;
  
  claimedAt?: string;
  claimedBy?: string;
  leaseExpiresAt?: string;
  
  startedAt?: string;
  completedAt?: string;
  
  result?: any;
  error?: any;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Job payload for enqueue
 */
export interface JobPayload {
  jobId: string;
  jobType: 'contentops_generate';
  contentType: string;
  rawUserInput: string;
  task: any;
  createdAt: string;
}

/**
 * Validate job status
 */
export function isValidJobStatus(value: string): value is JobStatus {
  return Object.values(JOB_STATUS).includes(value as JobStatus);
}

/**
 * Check if job is in terminal state
 */
export function isJobTerminal(status: JobStatus): boolean {
  return (
    status === JOB_STATUS.SUCCEEDED ||
    status === JOB_STATUS.DEAD_LETTER
  );
}

/**
 * Check if job can be retried
 */
export function canJobRetry(job: ContentOpsJob): boolean {
  return (
    job.status === JOB_STATUS.FAILED &&
    job.attemptCount < job.maxAttempts
  );
}

/**
 * Calculate next attempt time with exponential backoff
 */
export function calculateNextAttempt(attemptCount: number): Date {
  const baseDelay = 60000; // 1 minute
  const maxDelay = 3600000; // 1 hour
  const delay = Math.min(baseDelay * Math.pow(2, attemptCount), maxDelay);
  return new Date(Date.now() + delay);
}
