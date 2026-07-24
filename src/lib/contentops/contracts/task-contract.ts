/**
 * ContentOps Task Contract - RE-EXPORT from canonical task-types.ts
 *
 * This file now re-exports from the single source of truth (task-types.ts).
 * No duplicate type definitions are allowed.
 *
 * V2-IDEMPOTENCY: v1.20.42.18.6.24.1
 * Unified to single canonical definition with idempotency fields.
 */

// Re-export everything from the canonical source
export type {
  TaskStatus,
  ContentType,
  ExecutionMode,
  TargetEnvironment,
  IdempotencySource,
  ContentOpsTask,
  CreateTaskInput,
  TaskStep,
  TaskEvent,
} from '../task-types';

export { TASK_STEPS } from '../task-types';

// Legacy compatibility: keep TASK_STATUS const for existing code that references it
const TASK_STATUS = {
  RECEIVED: 'RECEIVED' as const,
  QUEUED: 'QUEUED' as const,
  RUNNING: 'PARSING' as const, // Map legacy RUNNING to PARSING
  NORMALIZING: 'CLEANING_CONTENT' as const, // Map legacy NORMALIZING
  QUALITY_CHECK: 'QUALITY_CHECKING' as const, // Map legacy QUALITY_CHECK
  AWAITING_REVIEW: 'AWAITING_REVIEW' as const,
  SCHEDULED: 'SCHEDULED' as const,
  PUBLISHED: 'PUBLISHED' as const,
  CHANGES_REQUESTED: 'AWAITING_REVIEW' as const, // Map legacy
  FAILED: 'FAILED' as const,
  CANCELLED: 'CANCELLED' as const,
  ARCHIVED_TEST: 'CANCELLED' as const, // Map legacy
  FAILED_ENQUEUE: 'FAILED_ENQUEUE' as const,
  MISCLASSIFIED_REQUEST: 'FAILED' as const, // Map legacy
} as const;

export { TASK_STATUS };

export type LegacyTaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

/**
 * Validate task status (legacy compat)
 */
export function isValidTaskStatus(value: string): value is LegacyTaskStatus {
  return Object.values(TASK_STATUS).includes(value as LegacyTaskStatus);
}

/**
 * Check if task is in terminal state
 */
export function isTaskTerminal(status: string): boolean {
  return (
    status === 'PUBLISHED' ||
    status === 'FAILED' ||
    status === 'CANCELLED' ||
    status === 'FAILED_ENQUEUE'
  );
}

/**
 * Check if task can be retried (legacy compat)
 */
export function canTaskRetry(status: string): boolean {
  return status === 'FAILED';
}
