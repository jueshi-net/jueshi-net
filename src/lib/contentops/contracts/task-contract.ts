/**
 * ContentOps Task Contract
 * 
 * 统一的 Task 数据结构
 * Bot、API、Worker 都必须使用这个 Contract
 */

import { ContentType } from './content-types';
import { ExecutionMode } from './execution-modes';

/**
 * Task status enum
 */
export const TASK_STATUS = {
  RECEIVED: 'RECEIVED',
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  NORMALIZING: 'NORMALIZING',
  QUALITY_CHECK: 'QUALITY_CHECK',
  AWAITING_REVIEW: 'AWAITING_REVIEW',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  ARCHIVED_TEST: 'ARCHIVED_TEST',
  FAILED_ENQUEUE: 'FAILED_ENQUEUE',
  MISCLASSIFIED_REQUEST: 'MISCLASSIFIED_REQUEST',
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

/**
 * Task data structure
 */
export interface ContentOpsTask {
  id: string;
  taskId: string;
  contentType: ContentType;
  executionMode: ExecutionMode;
  targetEnvironment: 'staging' | 'production';
  rawInput: string;
  normalizedTitle?: string;
  status: TaskStatus;
  
  idempotencyKey?: string;
  archivedTest?: boolean;
  
  contentId?: string;
  contentSlug?: string;
  
  qualityScore?: number;
  qualityIssues?: any;
  
  failureStage?: string;
  failureReason?: string;
  recoverable?: boolean;
  
  metadata?: any;
  
  // Trusted metadata for internal smoke test detection
  source?: string;
  provider?: string;
  internalAuthorized?: boolean;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Create task input
 */
export interface CreateTaskInput {
  chatId: number;
  messageId: number;
  rawInput: string;
  contentType: ContentType;
  executionMode: ExecutionMode;
  targetEnvironment: 'staging' | 'production';
  
  // Optional fields
  topic?: string;
  audience?: string;
  country?: string;
  city?: string;
  industry?: string;
  tone?: string;
  requiredSections?: string[];
  specialRequirements?: string;
  scheduledAt?: string;
  publishInstruction?: string;
  sourceRequirement?: string;
  idempotencyKey?: string;
  archivedTest?: boolean;
  
  // Trusted metadata for internal smoke test detection
  source?: string;
  provider?: string;
  internalAuthorized?: boolean;
}

/**
 * Validate task status
 */
export function isValidTaskStatus(value: string): value is TaskStatus {
  return Object.values(TASK_STATUS).includes(value as TaskStatus);
}

/**
 * Check if task is in terminal state
 */
export function isTaskTerminal(status: TaskStatus): boolean {
  return (
    status === TASK_STATUS.PUBLISHED ||
    status === TASK_STATUS.FAILED ||
    status === TASK_STATUS.CANCELLED ||
    status === TASK_STATUS.ARCHIVED_TEST ||
    status === TASK_STATUS.FAILED_ENQUEUE ||
    status === TASK_STATUS.MISCLASSIFIED_REQUEST
  );
}

/**
 * Check if task can be retried
 */
export function canTaskRetry(status: TaskStatus): boolean {
  return status === TASK_STATUS.FAILED && !isTaskTerminal(status);
}
