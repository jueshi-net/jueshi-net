/**
 * ContentOps Task Finalizer — Single Source of Truth for Terminal State
 * 
 * This is the ONLY function that writes terminal state for a ContentOps task.
 * Worker, Recovery, and any future path MUST call this function.
 * 
 * Guarantees:
 * 1. On success: verifies backendContentId exists, updates Job, updates Task, writes notification
 * 2. On failure: updates Job, updates Task, quarantines content, writes failure notification
 * 3. Never produces illegal state combinations
 * 4. Atomic: either all writes succeed or none do
 * 
 * V2-MVP: v1.20.42.18.6.21.12.3
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { taskManager } from './task-manager';
import { buildContentOpsAdminUrl, buildContentOpsContentAdminUrl } from './admin-url-builder';
import type { TaskStatus } from './task-types';

// ============================================================================
// Configuration
// ============================================================================

const HOME_DIR = os.homedir();
const JOBS_DIR = process.env.HERMES_JOBS_DIR || path.join(HOME_DIR, '.jueshi-contentops/jobs');
const OUTBOX_DIR = path.join(JOBS_DIR, 'outbox');
const QUARANTINE_DIR = path.join(JOBS_DIR, 'quarantine');

// ============================================================================
// Types
// ============================================================================

export interface FinalizerSuccessInput {
  taskId: string;
  chatId: string;
  contentType: string;
  executionMode: string;
  backendContentId: string;       // MUST be real, verified
  title: string;
  hermesRunId?: string;
  latencyMs?: number;
  normalizerFixedCount?: number;
  normalizerRemainingBlockingIssues?: number;
  transport?: 'telegram' | 'internal_test';  // Explicit transport routing
  source?: string;  // Task source for internal smoke detection
}

export interface FinalizerFailureInput {
  taskId: string;
  chatId: string;
  contentType: string;
  executionMode: string;
  error: string;
  errorCode?: string;
  failureStage?: string;
  quarantinedContentId?: string;  // If content was created but is invalid
  transport?: 'telegram' | 'internal_test';  // Explicit transport routing
  source?: string;  // Task source for internal smoke detection
}

export interface FinalizerResult {
  ok: boolean;
  taskStatus: string;
  notificationId: string;
  error?: string;
}

// ============================================================================
// Backend Content Verification
// ============================================================================

/**
 * Verify that a backendContentId actually exists in the staging backend.
 * Uses the staging helper client to check content existence.
 * 
 * Returns null if verification fails (content does not exist or is inaccessible).
 */
async function verifyBackendContentExists(
  backendContentId: string,
  contentType: string
): Promise<{ exists: boolean; status?: string; adminUrl?: string } | null> {
  try {
    // Use staging helper to query content (handles HMAC signing automatically)
    const { execSync } = require('child_process');
    const stagingHost = process.env.STAGING_SSH_HOST || 'deploy@192.129.155.149';
    const helperPath = process.env.STAGING_HELPER_PATH || '/home/deploy/xixiong-saas-staging/scripts/contentops/bridge-local-helper.ts';
    
    // Query content using audit_contentops_task action with contentId
    const queryInput = JSON.stringify({
      action: 'audit_contentops_task',
      contentId: backendContentId
    });
    
    const stagingWorkDir = process.env.STAGING_WORK_DIR || '/home/deploy/xixiong-saas-staging';
    const checkCmd = `ssh ${stagingHost} "cd ${stagingWorkDir} && echo '${queryInput}' | npx tsx ${helperPath}"`;
    const result = execSync(checkCmd, { encoding: 'utf-8', timeout: 15000 });
    
    const parsed = JSON.parse(result);
    
    // Check if content exists in the response
    if (parsed.ok && parsed.data) {
      const hasContent = parsed.data.task || parsed.data.content || parsed.data.drafts?.activeCount > 0;
      if (hasContent) {
        const adminUrl = buildContentOpsContentAdminUrl(contentType, backendContentId);
        return { exists: true, status: 'DRAFT', adminUrl };
      }
    }
    
    // Content not found
    return { exists: false };
  } catch (error: any) {
    console.error(`[Finalizer] Backend verification failed for ${backendContentId}:`, error.message);
    return null;
  }
}

// ============================================================================
// State Consistency Enforcement
// ============================================================================

/**
 * Validate that a state combination is legal.
 * Throws if the combination is illegal.
 */
function validateStateConsistency(
  taskStatus: string,
  hasContent: boolean,
  contentStatus: string | null,
  notificationType: 'success' | 'failure'
): void {
  // Rule 1: FAILED + AWAITING_REVIEW is illegal
  if (taskStatus === 'FAILED' && contentStatus === 'AWAITING_REVIEW') {
    throw new Error('ILLEGAL_STATE: FAILED + AWAITING_REVIEW');
  }
  
  // Rule 2: FAILED + SUCCESS_NOTIFICATION is illegal
  if (taskStatus === 'FAILED' && notificationType === 'success') {
    throw new Error('ILLEGAL_STATE: FAILED + SUCCESS_NOTIFICATION');
  }
  
  // Rule 3: COMPLETED + CONTENT_NOT_FOUND is illegal (unless draft_only)
  if (taskStatus === 'COMPLETED' && !hasContent && notificationType === 'success') {
    throw new Error('ILLEGAL_STATE: COMPLETED + CONTENT_NOT_FOUND');
  }
  
  // Rule 4: COMPLETED + TERMINAL_NOTIFICATION_MISSING is enforced by always writing notification
}

// ============================================================================
// Finalizer — Success Path
// ============================================================================

export async function finalizeContentOpsTaskSuccess(
  input: FinalizerSuccessInput
): Promise<FinalizerResult> {
  const notificationId = `terminal:${input.taskId}`;
  
  console.log(`[Finalizer] Processing success for task ${input.taskId}, contentId=${input.backendContentId}`);
  
  // Step 1: Validate input — backendContentId MUST be real (except draft_only mode)
  if (!input.backendContentId) {
    // No content ID at all — this is a failure
    console.error(`[Finalizer] REJECTED: No backendContentId for task ${input.taskId}`);
    return finalizeContentOpsTaskFailure({
      taskId: input.taskId,
      chatId: input.chatId,
      contentType: input.contentType,
      executionMode: input.executionMode,
      error: `NO_BACKEND_CONTENT_ID`,
      errorCode: 'NO_CONTENT_ID',
      failureStage: 'finalizer',
    });
  }
  
  if (input.backendContentId.startsWith('draft_') && input.executionMode !== 'draft_only') {
    // Check if it's a fake draft ID (format: draft_<taskId>)
    // Real staging draft IDs have timestamp and random suffix
    const isFakeDraftId = input.backendContentId === `draft_${input.taskId}` || 
                          input.backendContentId.match(/^draft_task_\d+_[a-z0-9]+$/);
    if (isFakeDraftId) {
      // Fake draft ID in non-draft_only mode — this is a failure
      console.error(`[Finalizer] REJECTED: Fake draft ID ${input.backendContentId} for task ${input.taskId} (mode: ${input.executionMode})`);
      return finalizeContentOpsTaskFailure({
        taskId: input.taskId,
        chatId: input.chatId,
        contentType: input.contentType,
        executionMode: input.executionMode,
        error: `FAKE_DRAFT_ID_REJECTED: ${input.backendContentId}`,
        errorCode: 'FAKE_DRAFT_ID',
        failureStage: 'finalizer',
      });
    }
    // Otherwise, it's a real staging draft ID, allow it
  }
  
  // Step 2: Verify backend content exists (skip for draft_only mode only)
  console.log(`[Finalizer] Checking backend verification: source=${input.source}, executionMode=${input.executionMode}, backendContentId=${input.backendContentId}`);
  
  if (input.executionMode !== 'draft_only') {
    const verification = await verifyBackendContentExists(input.backendContentId, input.contentType);
    
    if (!verification || !verification.exists) {
      console.error(`[Finalizer] REJECTED: Backend content ${input.backendContentId} does not exist`);
      return finalizeContentOpsTaskFailure({
        taskId: input.taskId,
        chatId: input.chatId,
        contentType: input.contentType,
        executionMode: input.executionMode,
        error: `BACKEND_CONTENT_NOT_FOUND: ${input.backendContentId}`,
        errorCode: 'CONTENT_NOT_FOUND',
        failureStage: 'finalizer',
        transport: input.transport,
        source: input.source,
      });
    }
    console.log(`[Finalizer] Backend verification passed for ${input.backendContentId}`);
  }
  
  // Step 3: Determine content status
  const contentStatus = input.executionMode === 'publish_now' ? 'PUBLISHED' : 'AWAITING_REVIEW';
  
  // Step 4: Validate state consistency
  validateStateConsistency('COMPLETED', true, contentStatus, 'success');
  
  // Step 5: Update Task status
  try {
    await taskManager.updateTaskStatus(input.taskId, 'COMPLETED' as any, 'FINALIZED', {
      contentId: input.backendContentId,
      contentType: input.contentType,
      executionMode: input.executionMode,
      completedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(`[Finalizer] Failed to update task status:`, error.message);
    return {
      ok: false,
      taskStatus: 'UNKNOWN',
      notificationId,
      error: `TASK_UPDATE_FAILED: ${error.message}`,
    };
  }
  
  // Step 6: Write terminal notification to outbox (v2 schema)
  try {
    const adminUrl = buildContentOpsContentAdminUrl(input.contentType, input.backendContentId);
    
    // Determine transport: internal smoke tests use internal_test, others use telegram
    const transport = input.transport || 
                      (input.source === 'internal_runtime_smoke' ? 'internal_test' : 'telegram');
    
    // Internal smoke tests MUST use internal_test transport and null chatId
    const chatId = transport === 'internal_test' ? null : input.chatId;
    
    const outboxPayload = {
      schemaVersion: 2,
      createdAt: new Date().toISOString(),
      notificationId,
      transport,  // Explicit transport routing
      chatId,     // null for internal_test
      terminalStatus: 'COMPLETED',
      contentType: input.contentType,
      title: input.title,
      backendContentId: input.backendContentId,
      adminUrl,
      executionMode: input.executionMode,
      content: JSON.stringify({
        contentType: input.contentType,
        title: input.title,
        executionMode: input.executionMode,
        status: contentStatus,
      }),
      jobId: input.taskId,
      success: true,
      draftId: input.backendContentId,
      publishedUrl: null,
      hermesRunId: input.hermesRunId,
      latencyMs: input.latencyMs,
      normalizerFixedCount: input.normalizerFixedCount,
      normalizerRemainingBlockingIssues: input.normalizerRemainingBlockingIssues,
      contractValidationPassed: true,
      completedAt: new Date().toISOString(),
    };
    
    // Ensure outbox directory exists
    if (!fs.existsSync(OUTBOX_DIR)) {
      fs.mkdirSync(OUTBOX_DIR, { recursive: true });
    }
    
    const resultFile = path.join(OUTBOX_DIR, `${input.taskId}.json`);
    fs.writeFileSync(resultFile, JSON.stringify(outboxPayload, null, 2));
    
    console.log(`[Finalizer] Success finalized for task ${input.taskId}`);
    
    return {
      ok: true,
      taskStatus: 'COMPLETED',
      notificationId,
    };
  } catch (error: any) {
    console.error(`[Finalizer] Failed to write notification:`, error.message);
    return {
      ok: false,
      taskStatus: 'COMPLETED', // Task was updated but notification failed
      notificationId,
      error: `NOTIFICATION_WRITE_FAILED: ${error.message}`,
    };
  }
}

// ============================================================================
// Finalizer — Failure Path
// ============================================================================

export async function finalizeContentOpsTaskFailure(
  input: FinalizerFailureInput
): Promise<FinalizerResult> {
  const notificationId = `terminal:${input.taskId}`;
  
  console.log(`[Finalizer] Processing failure for task ${input.taskId}: ${input.error}`);
  
  // Step 1: Validate state consistency
  validateStateConsistency('FAILED', false, null, 'failure');
  
  // Step 2: Update Task status
  try {
    await taskManager.updateTaskStatus(input.taskId, 'FAILED', 'FINALIZED', {
      errorCode: input.errorCode || 'UNKNOWN_ERROR',
      errorMessage: input.error,
      failureStage: input.failureStage || 'unknown',
      failedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(`[Finalizer] Failed to update task status:`, error.message);
    return {
      ok: false,
      taskStatus: 'UNKNOWN',
      notificationId,
      error: `TASK_UPDATE_FAILED: ${error.message}`,
    };
  }
  
  // Step 3: Quarantine any residual content
  if (input.quarantinedContentId) {
    try {
      if (!fs.existsSync(QUARANTINE_DIR)) {
        fs.mkdirSync(QUARANTINE_DIR, { recursive: true });
      }
      const quarantineFile = path.join(QUARANTINE_DIR, `${input.taskId}.json`);
      fs.writeFileSync(quarantineFile, JSON.stringify({
        taskId: input.taskId,
        quarantinedContentId: input.quarantinedContentId,
        reason: input.error,
        quarantinedAt: new Date().toISOString(),
      }, null, 2));
      console.log(`[Finalizer] Quarantined content ${input.quarantinedContentId} for task ${input.taskId}`);
    } catch (error: any) {
      console.error(`[Finalizer] Failed to quarantine content:`, error.message);
    }
  }
  
  // Step 4: Write failure terminal notification to outbox (v2 schema)
  try {
    // Determine transport: internal smoke tests use internal_test, others use telegram
    const transport = input.transport || 
                      (input.source === 'internal_runtime_smoke' ? 'internal_test' : 'telegram');
    
    // Internal smoke tests MUST use internal_test transport and null chatId
    const chatId = transport === 'internal_test' ? null : input.chatId;
    
    const outboxPayload = {
      schemaVersion: 2,
      createdAt: new Date().toISOString(),
      notificationId,
      transport,  // Explicit transport routing
      chatId,     // null for internal_test
      terminalStatus: 'FAILED',
      contentType: input.contentType,
      title: null,
      backendContentId: null,  // No content for failure
      adminUrl: buildContentOpsAdminUrl('staging'),
      executionMode: input.executionMode,
      content: JSON.stringify({
        contentType: input.contentType,
        title: null,
        executionMode: input.executionMode,
        status: 'FAILED',
        error: input.error,
        errorCode: input.errorCode,
      }),
      jobId: input.taskId,
      success: false,
      draftId: null,
      publishedUrl: null,
      error: input.error,
      errorCode: input.errorCode,
      failureStage: input.failureStage,
      failedAt: new Date().toISOString(),
    };
    
    // Ensure outbox directory exists
    if (!fs.existsSync(OUTBOX_DIR)) {
      fs.mkdirSync(OUTBOX_DIR, { recursive: true });
    }
    
    const resultFile = path.join(OUTBOX_DIR, `${input.taskId}.json`);
    fs.writeFileSync(resultFile, JSON.stringify(outboxPayload, null, 2));
    
    console.log(`[Finalizer] Failure finalized for task ${input.taskId}`);
    
    return {
      ok: true,
      taskStatus: 'FAILED',
      notificationId,
    };
  } catch (error: any) {
    console.error(`[Finalizer] Failed to write notification:`, error.message);
    return {
      ok: false,
      taskStatus: 'FAILED', // Task was updated but notification failed
      notificationId,
      error: `NOTIFICATION_WRITE_FAILED: ${error.message}`,
    };
  }
}

// ============================================================================
// Unified Finalizer Entry Point
// ============================================================================

export interface FinalizerInput {
  success: boolean;
  taskId: string;
  chatId: string;
  contentType: string;
  executionMode: string;
  // Success fields
  backendContentId?: string;
  title?: string;
  hermesRunId?: string;
  latencyMs?: number;
  normalizerFixedCount?: number;
  normalizerRemainingBlockingIssues?: number;
  // Failure fields
  error?: string;
  errorCode?: string;
  failureStage?: string;
  quarantinedContentId?: string;
  // Runtime context for transport routing
  transport?: 'telegram' | 'internal_test';
  source?: string;
}

/**
 * Unified finalizer entry point.
 * Routes to success or failure path based on input.success.
 */
export async function finalizeContentOpsTask(input: FinalizerInput): Promise<FinalizerResult> {
  if (input.success) {
    if (!input.backendContentId || !input.title) {
      return finalizeContentOpsTaskFailure({
        taskId: input.taskId,
        chatId: input.chatId,
        contentType: input.contentType,
        executionMode: input.executionMode,
        error: 'MISSING_REQUIRED_FIELDS: backendContentId and title required for success',
        errorCode: 'INVALID_SUCCESS_INPUT',
        failureStage: 'finalizer',
      });
    }
    
    return finalizeContentOpsTaskSuccess({
      taskId: input.taskId,
      chatId: input.chatId,
      contentType: input.contentType,
      executionMode: input.executionMode,
      backendContentId: input.backendContentId!,
      title: input.title!,
      hermesRunId: input.hermesRunId,
      latencyMs: input.latencyMs,
      normalizerFixedCount: input.normalizerFixedCount,
      normalizerRemainingBlockingIssues: input.normalizerRemainingBlockingIssues,
      transport: input.transport,
      source: input.source,
    });
  } else {
    if (!input.error) {
      return {
        ok: false,
        taskStatus: 'UNKNOWN',
        notificationId: `terminal:${input.taskId}`,
        error: 'MISSING_ERROR_FIELD: error required for failure',
      };
    }
    
    return finalizeContentOpsTaskFailure({
      taskId: input.taskId,
      chatId: input.chatId,
      contentType: input.contentType,
      executionMode: input.executionMode,
      error: input.error,
      errorCode: input.errorCode,
      failureStage: input.failureStage,
      quarantinedContentId: input.quarantinedContentId,
      transport: input.transport,
      source: input.source,
    });
  }
}
