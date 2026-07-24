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
}

// ============================================================================
// Canonical Task Service
// ============================================================================

export class CanonicalTaskService {
  /**
   * Create task and enqueue job atomically
   * This is the ONLY way to create a ContentOps task
   */
  async createAndEnqueueContentOpsTask(input: CreateTaskInput): Promise<CanonicalTaskResult> {
    console.log('[CanonicalTaskService] Creating task and enqueueing job');

    // Step 1: Create task record
    let task: ContentOpsTask;
    try {
      task = await taskManager.createTask(input);
      console.log('[CanonicalTaskService] Task created:', task.id);
    } catch (error) {
      console.error('[CanonicalTaskService] Failed to create task:', error);
      return {
        ok: false,
        error: {
          code: 'CONTENTOPS_TASK_CREATE_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }

    // Step 2: Generate job payload
    const jobPayload: JobPayload = {
      jobId: task.id,
      jobType: 'contentops_generate',
      contentType: task.contentType,
      rawUserInput: task.rawInput,
      task,
      createdAt: new Date().toISOString(),
      // Pass trusted metadata from input to job
      source: input.source,
      provider: input.provider,
      internalAuthorized: input.internalAuthorized,
    };

    // Step 3: Atomic write to inbox
    const enqueueResult = await this.atomicEnqueueJob(jobPayload);

    if (!enqueueResult.success) {
      // Task created but job enqueue failed - mark as FAILED_ENQUEUE
      console.error('[CanonicalTaskService] Job enqueue failed, marking task as FAILED_ENQUEUE');
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
        error: {
          code: 'CONTENTOPS_JOB_ENQUEUE_FAILED',
          message: enqueueResult.error || 'Failed to enqueue job',
        },
      };
    }

    // Step 4: Mark task as QUEUED
    await taskManager.updateTaskStatus(task.id, 'QUEUED');
    console.log('[CanonicalTaskService] Task queued successfully:', task.id);

    // Step 5: Auto-wakeup Worker
    await this.wakeupWorker();

    return {
      ok: true,
      taskId: task.id,
      task,
      enqueueStatus: 'QUEUED',
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

    // Step 3: Generate job payload
    const jobPayload: JobPayload = {
      jobId: task.id,
      jobType: 'contentops_generate',
      contentType: task.contentType,
      rawUserInput: task.rawInput,
      task,
      createdAt: new Date().toISOString(),
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
