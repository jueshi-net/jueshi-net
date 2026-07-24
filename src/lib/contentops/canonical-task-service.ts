/**
 * Canonical Task Service - Unified Task Creation and Enqueue
 * 
 * This is the SINGLE source of truth for creating ContentOps tasks.
 * Both Telegram Handler and Bridge API MUST use this service.
 * 
 * Responsibilities:
 * 1. Validate input and idempotencyKey
 * 2. Create or read existing Task
 * 3. Generate Job payload
 * 4. Atomic write to jobs/inbox (tmp -> fsync -> rename)
 * 5. Verify inbox file exists and JSON schema is valid
 * 6. Auto-wakeup Worker
 * 7. Return taskId and enqueue status
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { taskManager } from './task-manager';
import type { CreateTaskInput, ContentOpsTask } from './task-types';
import {
  generateIdempotencyKey,
} from './idempotency-key';
import {
  atomicClaim,
  readClaim,
  handleReplay,
  markEnqueued,
  markProcessing,
  markContentCreated,
  markCompleted,
  markFailed,
} from './idempotency-claim';

// ============================================================================
// Configuration
// ============================================================================

const JOBS_DIR = process.env.HERMES_JOBS_DIR || path.join(os.homedir(), '.jueshi-contentops/jobs');
const INBOX_DIR = path.join(JOBS_DIR, 'inbox');
const TMP_DIR = path.join(JOBS_DIR, 'tmp');

// ============================================================================
// Types
// ============================================================================

export interface CanonicalTaskResult {
  ok: boolean;
  taskId?: string;
  task?: ContentOpsTask;
  enqueueStatus?: 'QUEUED' | 'FAILED_ENQUEUE';
  recoverable?: boolean;
  /** Whether this was a replay (existing task returned, no new task created) */
  isReplay?: boolean;
  /** Existing contentId if the replay found one */
  existingContentId?: string;
  /** Idempotency key hash */
  keyHash?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface JobPayload {
  jobId: string;
  jobType: 'contentops_generate';
  contentType: string;
  rawUserInput: string;
  task: ContentOpsTask;
  createdAt: string;
  // Trusted metadata for internal smoke test detection
  source?: string;
  provider?: string;
  internalAuthorized?: boolean;
  // === IDEMPOTENCY FIELDS (propagated to Worker -> Adapter -> Backend) ===
  idempotencyKeyHash: string;
  idempotencyKeyVersion: number;
  idempotencySource: 'telegram' | 'internal';
}

// ============================================================================
// Canonical Task Service
// ============================================================================

export class CanonicalTaskService {
  /**
   * Create task and enqueue job atomically.
   * This is the ONLY way to create a ContentOps task.
   *
   * Idempotency flow:
   * 1. Generate or receive idempotency key hash
   * 2. Atomically claim the key (file-system exclusive create)
   * 3. If new claim: create task, enqueue job
   * 4. If existing claim:
   *    a. COMPLETED/CONTENT_CREATED: return existing taskId and contentId
   *    b. PROCESSING/CLAIMED/ENQUEUED: return existing taskId (in-progress)
   *    c. FAILED: reuse same taskId, increment attemptCount, re-enqueue
   */
  async createAndEnqueueContentOpsTask(input: CreateTaskInput): Promise<CanonicalTaskResult> {
    console.log('[CanonicalTaskService] Creating task and enqueueing job');

    // === STEP 0: Generate idempotency key if not provided ===
    let keyHash = input.idempotencyKeyHash;
    let keyVersion = input.idempotencyKeyVersion || 1;
    let keySource = input.idempotencySource || 'telegram';

    if (!keyHash) {
      // Auto-generate based on source
      try {
        if (input.internalAuthorized || input.source?.startsWith('internal_')) {
          // Internal acceptance/smoke test
          const caseId = input.internalCaseId || input.source || 'internal';
          const keyResult = generateIdempotencyKey({
            source: 'internal',
            internalSource: input.source || 'internal',
            caseId,
          });
          keyHash = keyResult.keyHash;
          keyVersion = keyResult.keyVersion;
          keySource = 'internal';
        } else {
          // Telegram message
          const keyResult = generateIdempotencyKey({
            source: 'telegram',
            chatId: input.chatId,
            messageId: input.messageId,
          });
          keyHash = keyResult.keyHash;
          keyVersion = keyResult.keyVersion;
          keySource = 'telegram';
        }
      } catch (keyError) {
        return {
          ok: false,
          error: {
            code: 'IDEMPOTENCY_KEY_GENERATION_FAILED',
            message: keyError instanceof Error ? keyError.message : 'Unknown error',
          },
        };
      }
    }

    // Enrich input with idempotency fields
    const enrichedInput: CreateTaskInput = {
      ...input,
      idempotencyKeyHash: keyHash,
      idempotencyKeyVersion: keyVersion,
      idempotencySource: keySource,
    };

    // === STEP 1: Atomic claim ===
    let taskId: string;
    let isReplay = false;

    // Try to claim with a provisional taskId
    const provisionalTaskId = `task_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const claimResult = atomicClaim(
      keyHash,
      keyVersion,
      provisionalTaskId,
      provisionalTaskId, // jobId = taskId
      input.contentType || 'guide'
    );

    if (claimResult.isNew) {
      // New claim - proceed to create task
      taskId = provisionalTaskId;
      console.log('[CanonicalTaskService] New idempotency claim:', keyHash);
    } else {
      // Existing claim - check status
      const existingClaim = claimResult.claim;
      isReplay = true;

      if (existingClaim.status === 'COMPLETED' || existingClaim.status === 'CONTENT_CREATED') {
        // Already done - return existing result
        console.log('[CanonicalTaskService] Replay: task already completed:', existingClaim.taskId);
        const existingTask = await taskManager.getTask(existingClaim.taskId);
        return {
          ok: true,
          taskId: existingClaim.taskId,
          task: existingTask || undefined,
          enqueueStatus: 'QUEUED',
          isReplay: true,
          existingContentId: existingClaim.contentId,
          keyHash,
        };
      }

      if (existingClaim.status === 'PROCESSING' || existingClaim.status === 'CLAIMED' || existingClaim.status === 'ENQUEUED') {
        // In progress - return existing task
        console.log('[CanonicalTaskService] Replay: task in progress:', existingClaim.taskId);
        const existingTask = await taskManager.getTask(existingClaim.taskId);
        return {
          ok: true,
          taskId: existingClaim.taskId,
          task: existingTask || undefined,
          enqueueStatus: 'QUEUED',
          isReplay: true,
          keyHash,
        };
      }

      if (existingClaim.status === 'FAILED') {
        // Retry - reuse same taskId, increment attempt
        console.log('[CanonicalTaskService] Replay: retrying failed task:', existingClaim.taskId);
        handleReplay(keyHash); // Increments attemptCount, resets to CLAIMED
        taskId = existingClaim.taskId;
        // Load existing task to get retryCount
        const failedTask = await taskManager.getTask(taskId);
        await taskManager.updateTaskStatus(taskId, 'QUEUED', undefined, {
          retryCount: (failedTask?.retryCount || 0) + 1,
        });
      } else {
        // Unknown status - treat as new
        taskId = provisionalTaskId;
      }
    }

    // === STEP 2: Create or reuse task ===
    let task: ContentOpsTask;
    try {
      if (isReplay) {
        // Reuse existing task for retry
        task = (await taskManager.getTask(taskId)) as ContentOpsTask;
        if (!task) {
          // Task was lost but claim exists - create new with same ID
          task = await taskManager.createTask(enrichedInput, taskId);
        }
      } else {
        // Pass pre-generated taskId to ensure claim.taskId === task.id === job.jobId
        task = await taskManager.createTask(enrichedInput, taskId);
      }
      console.log('[CanonicalTaskService] Task ready:', task.id);
    } catch (error) {
      markFailed(keyHash, error instanceof Error ? error.message : 'Task creation failed');
      return {
        ok: false,
        error: {
          code: 'CONTENTOPS_TASK_CREATE_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }

    // === STEP 3: Generate job payload with idempotency fields ===
    const jobPayload: JobPayload = {
      jobId: task.id,
      jobType: 'contentops_generate',
      contentType: task.contentType,
      rawUserInput: task.rawInput,
      task,
      createdAt: new Date().toISOString(),
      source: input.source,
      provider: input.provider,
      internalAuthorized: input.internalAuthorized,
      // Propagate idempotency fields
      idempotencyKeyHash: task.idempotencyKeyHash,
      idempotencyKeyVersion: task.idempotencyKeyVersion,
      idempotencySource: task.idempotencySource,
    };

    // === STEP 4: Atomic write to inbox ===
    const enqueueResult = await this.atomicEnqueueJob(jobPayload);

    if (!enqueueResult.success) {
      markFailed(keyHash, enqueueResult.error || 'Enqueue failed');
      await taskManager.updateTaskStatus(task.id, 'FAILED_ENQUEUE', undefined, {
        errorCode: 'CONTENTOPS_JOB_ENQUEUE_FAILED',
        errorMessage: enqueueResult.error || 'Unknown enqueue error',
      });

      return {
        ok: false,
        taskId: task.id,
        task,
        enqueueStatus: 'FAILED_ENQUEUE',
        recoverable: true,
        keyHash,
        error: {
          code: 'CONTENTOPS_JOB_ENQUEUE_FAILED',
          message: enqueueResult.error || 'Failed to enqueue job',
        },
      };
    }

    // === STEP 5: Mark task as QUEUED and update claim ===
    await taskManager.updateTaskStatus(task.id, 'QUEUED');
    markEnqueued(keyHash);
    console.log('[CanonicalTaskService] Task queued successfully:', task.id);

    // === STEP 6: Auto-wakeup Worker ===
    await this.wakeupWorker();

    return {
      ok: true,
      taskId: task.id,
      task,
      enqueueStatus: 'QUEUED',
      keyHash,
    };
  }

  /**
   * Resume existing task by re-enqueueing job
   * Used for recovery when task exists but job was not enqueued
   */
  async resumeExistingTask(taskId: string): Promise<CanonicalTaskResult> {
    console.log('[CanonicalTaskService] Resuming existing task:', taskId);

    // Step 1: Load existing task
    const task = await taskManager.getTask(taskId);
    if (!task) {
      return {
        ok: false,
        error: {
          code: 'CONTENTOPS_TASK_NOT_FOUND',
          message: `Task ${taskId} not found`,
        },
      };
    }

    // Step 2: Check if job already exists in inbox
    const inboxPath = path.join(INBOX_DIR, `${taskId}.json`);
    if (fs.existsSync(inboxPath)) {
      console.log('[CanonicalTaskService] Job already exists in inbox:', taskId);
      return {
        ok: true,
        taskId: task.id,
        task,
        enqueueStatus: 'QUEUED',
      };
    }

    // Step 3: Generate job payload with idempotency fields
    const jobPayload: JobPayload = {
      jobId: task.id,
      jobType: 'contentops_generate',
      contentType: task.contentType,
      rawUserInput: task.rawInput,
      task,
      createdAt: new Date().toISOString(),
      // Propagate idempotency fields from existing task
      idempotencyKeyHash: task.idempotencyKeyHash || '',
      idempotencyKeyVersion: task.idempotencyKeyVersion || 1,
      idempotencySource: task.idempotencySource || 'telegram',
    };

    // Step 4: Atomic write to inbox
    const enqueueResult = await this.atomicEnqueueJob(jobPayload);

    if (!enqueueResult.success) {
      return {
        ok: false,
        taskId: task.id,
        task,
        enqueueStatus: 'FAILED_ENQUEUE',
        recoverable: true,
        error: {
          code: 'CONTENTOPS_JOB_ENQUEUE_FAILED',
          message: enqueueResult.error || 'Failed to enqueue job',
        },
      };
    }

    // Step 5: Mark task as QUEUED
    await taskManager.updateTaskStatus(task.id, 'QUEUED');
    console.log('[CanonicalTaskService] Task resumed and queued:', task.id);

    // Step 6: Auto-wakeup Worker
    await this.wakeupWorker();

    return {
      ok: true,
      taskId: task.id,
      task,
      enqueueStatus: 'QUEUED',
    };
  }

  /**
   * Atomic write job to inbox
   * Uses tmp file -> fsync -> rename pattern
   */
  private async atomicEnqueueJob(payload: JobPayload): Promise<{ success: boolean; error?: string }> {
    // Ensure directories exist
    if (!fs.existsSync(TMP_DIR)) {
      fs.mkdirSync(TMP_DIR, { recursive: true, mode: 0o750 });
    }
    if (!fs.existsSync(INBOX_DIR)) {
      fs.mkdirSync(INBOX_DIR, { recursive: true, mode: 0o750 });
    }

    const tmpPath = path.join(TMP_DIR, `${payload.jobId}.tmp`);
    const inboxPath = path.join(INBOX_DIR, `${payload.jobId}.json`);

    try {
      // Step 1: Write to tmp file
      const jsonContent = JSON.stringify(payload, null, 2);
      fs.writeFileSync(tmpPath, jsonContent, { mode: 0o640 });

      // Step 2: fsync (ensure data is written to disk)
      const fd = fs.openSync(tmpPath, 'r');
      fs.fsyncSync(fd);
      fs.closeSync(fd);

      // Step 3: Atomic rename
      fs.renameSync(tmpPath, inboxPath);

      // Step 4: Verify file exists and is valid JSON
      if (!fs.existsSync(inboxPath)) {
        throw new Error('Inbox file does not exist after rename');
      }

      const verifyContent = fs.readFileSync(inboxPath, 'utf-8');
      const verifyPayload = JSON.parse(verifyContent);

      // Step 5: Validate JSON schema
      if (!verifyPayload.jobId || !verifyPayload.jobType || !verifyPayload.task) {
        throw new Error('Job payload schema validation failed');
      }

      console.log('[CanonicalTaskService] Job enqueued atomically:', payload.jobId);
      return { success: true };
    } catch (error) {
      console.error('[CanonicalTaskService] Failed to enqueue job:', error);
      
      // Cleanup tmp file if it exists
      try {
        if (fs.existsSync(tmpPath)) {
          fs.unlinkSync(tmpPath);
        }
      } catch (cleanupError) {
        console.error('[CanonicalTaskService] Failed to cleanup tmp file:', cleanupError);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Auto-wakeup Worker
   * Uses launchctl kickstart or direct spawn with detached mode
   */
  private async wakeupWorker(): Promise<void> {
    const { spawn } = await import('child_process');
    const cwd = process.cwd() || path.join(os.homedir(), 'xixiong-saas');
    const workerScript = path.join(cwd, 'scripts/contentops/hermes-contentops-worker.ts');
    const tsxBin = path.join(cwd, 'node_modules/.bin/tsx');

    try {
      const uid = typeof process.getuid === 'function' ? process.getuid() : 0;
      const { execSync } = await import('child_process');
      execSync(`launchctl kickstart -k gui/${uid}/ai.hermes.contentops-worker 2>/dev/null`, {
        stdio: 'ignore',
        timeout: 5000,
      });
      console.log('[CanonicalTaskService] Worker kickstarted via launchctl');
    } catch (kickstartError) {
      // If launchctl fails, spawn worker directly with detached mode
      try {
        const child = spawn(tsxBin, [workerScript], {
          detached: true,
          stdio: 'ignore',
          cwd: cwd,
          env: {
            ...process.env,
            HERMES_JOBS_DIR: path.join(os.homedir(), '.jueshi-contentops/jobs'),
          },
        });
        child.unref();
        console.log('[CanonicalTaskService] Worker spawned in background, PID:', child.pid);
      } catch (spawnError) {
        console.error('[CanonicalTaskService] Failed to spawn worker:', spawnError);
      }
    }
  }
}

// ============================================================================
// Singleton
// ============================================================================

export const canonicalTaskService = new CanonicalTaskService();
