/**
 * ContentOps API Contract
 * 
 * 统一的 API 请求和响应结构
 * Bot、API 都必须使用这个 Contract
 */

import { ContentType } from './content-types';
import { ExecutionMode } from './execution-modes';
import { ContentOpsTask, TaskStatus } from './task-contract';
import { ContentOpsJob, JobStatus } from './job-contract';

/**
 * API Actions
 */
export const API_ACTIONS = {
  CREATE_TASK: 'create_task',
  GET_TASK: 'get_task',
  CANCEL_TASK: 'cancel_task',
  RETRY_TASK: 'retry_task',
  CLAIM_JOB: 'claim_job',
  HEARTBEAT_JOB: 'heartbeat_job',
  COMPLETE_JOB: 'complete_job',
  FAIL_JOB: 'fail_job',
  SAVE_CONTENT: 'save_content',
  SCHEDULE_CONTENT: 'schedule_content',
  PUBLISH_CONTENT: 'publish_content',
  LIST_NOTIFICATIONS: 'list_notifications',
  MARK_NOTIFICATION_SENT: 'mark_notification_sent',
} as const;

export type ApiAction = typeof API_ACTIONS[keyof typeof API_ACTIONS];

/**
 * Create Task Request
 */
export interface CreateTaskRequest {
  action: typeof API_ACTIONS.CREATE_TASK;
  chatId: number;
  messageId: number;
  rawInput: string;
  contentType: ContentType;
  executionMode: ExecutionMode;
  targetEnvironment: 'staging' | 'production';
  idempotencyKey?: string;
  archivedTest?: boolean;
}

/**
 * Create Task Response (Success)
 */
export interface CreateTaskSuccessResponse {
  ok: true;
  data: {
    task: {
      id: string;
      status: TaskStatus;
      contentType: ContentType;
      executionMode: ExecutionMode;
      targetEnvironment: string;
      createdAt: string;
    };
    job: {
      id: string;
      status: JobStatus;
    };
  };
}

/**
 * Create Task Response (Failure)
 */
export interface CreateTaskFailureResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}

/**
 * Create Task Response (Union)
 */
export type CreateTaskResponse = CreateTaskSuccessResponse | CreateTaskFailureResponse;

/**
 * Validate create task response schema
 */
export function validateCreateTaskResponse(response: any): response is CreateTaskResponse {
  if (!response || typeof response !== 'object') {
    return false;
  }
  
  if (response.ok === true) {
    // Success response
    return (
      response.data !== undefined &&
      response.data.task !== undefined &&
      response.data.task.id !== undefined &&
      response.data.job !== undefined &&
      response.data.job.id !== undefined
    );
  } else if (response.ok === false) {
    // Failure response
    return (
      response.error !== undefined &&
      response.error.code !== undefined &&
      response.error.message !== undefined
    );
  }
  
  return false;
}

/**
 * Extract task ID from response safely
 */
export function extractTaskId(response: CreateTaskResponse): string | null {
  if (response.ok && response.data.task.id) {
    return response.data.task.id;
  }
  return null;
}

/**
 * Extract job ID from response safely
 */
export function extractJobId(response: CreateTaskResponse): string | null {
  if (response.ok && response.data.job.id) {
    return response.data.job.id;
  }
  return null;
}

/**
 * Get error message from response
 */
export function getErrorMessage(response: CreateTaskResponse): string {
  if (!response.ok && response.error) {
    return response.error.message;
  }
  return 'Unknown error';
}

/**
 * Get error code from response
 */
export function getErrorCode(response: CreateTaskResponse): string {
  if (!response.ok && response.error) {
    return response.error.code;
  }
  return 'UNKNOWN_ERROR';
}
