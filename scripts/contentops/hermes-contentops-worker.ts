#!/usr/bin/env node
/**
 * Hermes ContentOps Worker — Mac mini Edition (TypeScript)
 * 
 * One-shot worker that processes jobs from inbox and exits.
 * Uses HermesContentExecutor with full Runtime Pipeline.
 * 
 * V2-MVP: v1.20.42.18.6.21.12.2
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

import * as fs from 'fs';
import * as os from 'os';
import { HermesContentExecutor } from '../../src/lib/contentops/hermes-content-executor';
import { getContentPublishAdapter } from '../../src/lib/contentops/content-publish-adapters';
import { finalizeContentOpsTask } from '../../src/lib/contentops/task-finalizer';
import type { ContentOpsTask } from '../../src/lib/contentops/contracts/task-contract';
import { TASK_STATUS, isValidTaskStatus } from '../../src/lib/contentops/contracts/task-contract';
import { JOB_STATUS, isValidJobStatus } from '../../src/lib/contentops/contracts/job-contract';
import { isValidContentType } from '../../src/lib/contentops/contracts/content-types';
import { isValidExecutionMode } from '../../src/lib/contentops/contracts/execution-modes';

// ============================================================================
// Configuration — Mac mini paths
// ============================================================================

const HOME_DIR = os.homedir();
const JOBS_DIR = process.env.HERMES_JOBS_DIR || path.join(HOME_DIR, '.jueshi-contentops/jobs');
const INBOX_DIR = path.join(JOBS_DIR, 'inbox');
const OUTBOX_DIR = path.join(JOBS_DIR, 'outbox');
const PROCESSING_DIR = path.join(JOBS_DIR, 'processing');
const FAILED_DIR = path.join(JOBS_DIR, 'failed');
const LOG_DIR = path.join(HOME_DIR, '.jueshi-contentops/logs');
const LOCK_FILE = path.join(JOBS_DIR, 'worker.lock');

// Tiered timeouts
const HERMES_PROCESS_START_TIMEOUT_MS = parseInt(process.env.HERMES_PROCESS_START_TIMEOUT_MS || '30000'); // 30s
const HERMES_FIRST_OUTPUT_TIMEOUT_MS = parseInt(process.env.HERMES_FIRST_OUTPUT_TIMEOUT_MS || '120000'); // 2min
const HERMES_TOTAL_TIMEOUT_MS = parseInt(process.env.HERMES_TOTAL_TIMEOUT_MS || '600000'); // 10min
const JOB_TIMEOUT_MS = parseInt(process.env.HERMES_JOB_TIMEOUT_MS || '900000'); // 15min total

// ============================================================================
// Singleton Lock
// ============================================================================

function acquireLock(): boolean {
  try {
    // Check if lock file exists
    if (fs.existsSync(LOCK_FILE)) {
      const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf-8'));
      const lockAge = Date.now() - new Date(lockData.acquiredAt).getTime();
      
      // If lock is older than 10 minutes, consider it stale
      if (lockAge < 600000) {
        console.error('[Worker] Another worker is already running');
        console.error(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'Worker already running',
          existingPid: lockData.pid,
          lockAge: lockAge
        }));
        process.exit(1);
      } else {
        console.log('[Worker] Stale lock detected, removing');
        fs.unlinkSync(LOCK_FILE);
      }
    }
    
    // Create lock file
    const lockData = {
      pid: process.pid,
      acquiredAt: new Date().toISOString(),
      hostname: os.hostname()
    };
    fs.writeFileSync(LOCK_FILE, JSON.stringify(lockData, null, 2));
    
    // Clean up lock on exit
    process.on('exit', () => {
      try {
        if (fs.existsSync(LOCK_FILE)) {
          fs.unlinkSync(LOCK_FILE);
        }
      } catch (e) {
        // Ignore
      }
    });
    
    process.on('SIGTERM', () => {
      try {
        if (fs.existsSync(LOCK_FILE)) {
          fs.unlinkSync(LOCK_FILE);
        }
      } catch (e) {
        // Ignore
      }
      process.exit(0);
    });
    
    return true;
  } catch (error: any) {
    console.error('[Worker] Failed to acquire lock:', error.message);
    return false;
  }
}

// ============================================================================
// Logging
// ============================================================================

function log(level: string, message: string, data: any = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    pid: process.pid,
    ...data,
  };
  
  // Sanitize sensitive data
  const sanitized = JSON.stringify(logEntry).replace(
    /(DATABASE_URL|API_KEY|TOKEN|PASSWORD|SECRET|TELEGRAM_BOT_TOKEN)[^"]*"([^"]*)"/gi,
    '$1":"[REDACTED]"'
  );
  
  console.log(sanitized);
  
  // Write to log file
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    const logFile = path.join(LOG_DIR, `worker-${timestamp.split('T')[0]}.log`);
    fs.appendFileSync(logFile, sanitized + '\n');
  } catch (e) {
    // Ignore log file errors
  }
}

// ============================================================================
// Job Processing
// ============================================================================

function listJobs(): string[] {
  try {
    if (!fs.existsSync(INBOX_DIR)) {
      return [];
    }
    const files = fs.readdirSync(INBOX_DIR);
    return files.filter(f => f.endsWith('.json')).map(f => path.join(INBOX_DIR, f));
  } catch (error: any) {
    log('error', 'Failed to list jobs', { error: error.message });
    return [];
  }
}

function moveToProcessing(jobPath: string): string | null {
  const jobId = path.basename(jobPath);
  const processingPath = path.join(PROCESSING_DIR, jobId);
  
  try {
    fs.renameSync(jobPath, processingPath);
    log('info', 'Job moved to processing', { jobId });
    return processingPath;
  } catch (error: any) {
    log('error', 'Failed to move job to processing', { jobId, error: error.message });
    return null;
  }
}

function moveToFailed(jobPath: string, error: string, job?: any) {
  const jobId = path.basename(jobPath, '.json');
  const failedPath = path.join(FAILED_DIR, path.basename(jobPath));
  
  try {
    const jobData = job || JSON.parse(fs.readFileSync(jobPath, 'utf-8'));
    jobData.failedAt = new Date().toISOString();
    jobData.error = error;
    fs.writeFileSync(failedPath, JSON.stringify(jobData, null, 2));
    fs.unlinkSync(jobPath);
    log('error', 'Job moved to failed', { jobId, error });
    
    // Use Finalizer for failure terminal notification (replaces emitFailureNotification)
    // Extract source and transport from job data
    const source = jobData.source || jobData.task?.source;
    const transport = (source === 'internal_runtime_smoke' || source === 'internal_runtime_acceptance') ? 'internal_test' : 'telegram';
    
    // For internal smoke tests, chatId can be null; for telegram, chatId is required
    const chatId = transport === 'internal_test' ? null : (jobData.chatId || jobData.task?.chatId);
    
    // Fail closed: if chatId is missing for telegram transport, log error and skip notification
    if (transport === 'telegram' && !chatId) {
      log('error', 'MISSING_TARGET_CHAT_ID: Cannot send telegram notification without chatId', { jobId });
      return;
    }
    
    finalizeContentOpsTask({
      success: false,
      taskId: jobId,
      chatId: chatId || '',  // Empty string if null (will be converted to null by Finalizer)
      contentType: jobData.contentType || jobData.task?.contentType || 'unknown',
      executionMode: jobData.executionMode || jobData.task?.executionMode || 'review_required',
      error: error,
      errorCode: error.startsWith('CONTRACT_') ? 'CONTRACT_VALIDATION_FAILED' :
                 error.startsWith('NORMALIZER_') ? 'NORMALIZER_BLOCKING' :
                 error.startsWith('ADAPTER_') ? 'ADAPTER_PUBLISH_FAILED' :
                 error.startsWith('FAKE_DRAFT_') ? 'FAKE_DRAFT_ID' :
                 error.startsWith('FINALIZER_') ? 'FINALIZER_FAILED' :
                 'UNKNOWN_ERROR',
      failureStage: error.startsWith('CONTRACT_') ? 'contract-validation' :
                    error.startsWith('NORMALIZER_') ? 'normalizer' :
                    error.startsWith('ADAPTER_') ? 'adapter' :
                    error.startsWith('FAKE_DRAFT_') ? 'finalizer' :
                    error.startsWith('FINALIZER_') ? 'finalizer' :
                    'worker',
      transport,
      source,
    }).catch(e => {
      log('error', 'Finalizer failure notification failed', { jobId, error: e.message });
    });
  } catch (e: any) {
    log('error', 'Failed to move job to failed', { jobId, error: e.message });
  }
}

function emitFailureNotification(job: any, error: string) {
  try {
    const taskId = job.jobId || job.id || job.task?.id || 'unknown';
    
    // Extract source and determine transport
    const source = job.source || job.task?.source;
    const transport = (source === 'internal_runtime_smoke' || source === 'internal_runtime_acceptance') ? 'internal_test' : 'telegram';
    
    // For internal smoke tests, chatId is null; for telegram, chatId is required
    const chatId = transport === 'internal_test' ? null : (job.chatId || job.task?.chatId);
    
    // Fail closed: if chatId is missing for telegram transport, log error and skip notification
    if (transport === 'telegram' && !chatId) {
      log('error', 'MISSING_TARGET_CHAT_ID: Cannot send telegram notification without chatId', { taskId });
      return;
    }
    
    const contentType = job.contentType || job.task?.contentType || 'unknown';
    const notificationId = `terminal:${taskId}`;
    
    const outboxPayload = {
      // Schema version for startup protection
      schemaVersion: 2,
      createdAt: new Date().toISOString(),
      // Notification dispatcher fields
      notificationId,
      transport,  // Explicit transport routing
      chatId,     // null for internal_test
      backendContentId: null,
      content: JSON.stringify({
        contentType,
        title: job.topic || job.task?.topic || 'Untitled',
        executionMode: job.executionMode || job.task?.executionMode || 'review_required',
        status: 'FAILED',
        error: error,
      }),
      jobId: taskId,
      success: false,
      contentType,
      draftId: null,
      publishedUrl: null,
      executionMode: job.executionMode || job.task?.executionMode || 'review_required',
      error,
      failedAt: new Date().toISOString(),
    };
    
    const resultFile = path.join(OUTBOX_DIR, `${taskId}.json`);
    fs.writeFileSync(resultFile, JSON.stringify(outboxPayload, null, 2));
    log('info', 'Failure notification written to outbox', { taskId, notificationId, transport });
  } catch (e: any) {
    log('error', 'Failed to emit failure notification', { error: e.message });
  }
}

async function processJob(jobPath: string): Promise<boolean> {
  const processingPath = moveToProcessing(jobPath);
  if (!processingPath) return false;
  
  let job: any;
  try {
    job = JSON.parse(fs.readFileSync(processingPath, 'utf-8'));
    job.jobFile = processingPath;
  } catch (error: any) {
    log('error', 'Failed to parse job', { jobPath, error: error.message });
    moveToFailed(processingPath, error.message);
    return false;
  }
  
  try {
    log('info', 'Processing job', { 
      jobId: job.jobId, 
      contentType: job.contentType,
      jobType: job.jobType 
    });
    
    // Convert job to ContentOpsTask
    const task: ContentOpsTask = {
      id: job.jobId,
      chatId: job.chatId || 'worker',
      messageId: job.messageId || 0,
      contentType: job.contentType || 'guide',
      executionMode: job.executionMode || (job as any).task?.executionMode || 'review_required',
      targetEnvironment: job.targetEnvironment || (job as any).task?.targetEnvironment || 'staging',
      rawInput: job.rawUserInput || job.userInstruction || (job as any).task?.rawInput || '',
      topic: job.topic || (job as any).task?.topic || '',
      // Trusted metadata for internal smoke test detection
      // Read from job directly first, then from job.task (backward compatibility)
      source: job.source || (job as any).task?.source,
      provider: job.provider || (job as any).task?.provider,
      internalAuthorized: job.internalAuthorized || (job as any).task?.internalAuthorized,
      status: TASK_STATUS.RUNNING,
      currentStep: 'hermes-execution',
      stepHistory: [],
      executor: 'hermes-agent',
      retryCount: 0,
      maxRetries: 3,
      createdAt: job.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Call HermesContentExecutor with full Runtime Pipeline
    // SMOKE TEST MODE: Use deterministic fixture instead of calling Hermes
    // Only enable via trusted metadata - NOT via rawInput text (security risk)
    let result: any;
    
    // Debug: Log task metadata for smoke test detection
    log('info', 'Checking smoke test mode', {
      jobId: job.jobId,
      taskSource: task.source,
      taskProvider: task.provider,
      taskInternalAuthorized: task.internalAuthorized,
      envSmokeMode: process.env.CONTENTOPS_SMOKE_TEST_MODE
    });
    
    const isSmokeTest = process.env.CONTENTOPS_SMOKE_TEST_MODE === 'true' || 
                        ((task.source === 'internal_runtime_smoke' || task.source === 'internal_runtime_acceptance') && 
                         task.provider === 'deterministic_fixture' && 
                         task.internalAuthorized === true);
    
    log('info', 'Smoke test detection result', {
      jobId: job.jobId,
      isSmokeTest,
      taskSource: task.source,
      taskProvider: task.provider,
      taskInternalAuthorized: task.internalAuthorized
    });
    
    if (isSmokeTest) {
      log('info', 'SMOKE TEST MODE: Using deterministic fixture', { 
        jobId: job.jobId, 
        source: task.source,
        provider: task.provider,
        internalAuthorized: task.internalAuthorized,
        forceFailure: job.forceFailure
      });
      
      // Check for forced failure trigger
      if (job.forceFailure === true) {
        log('info', 'FORCED FAILURE: Deterministic fixture triggered failure', { jobId: job.jobId });
        result = {
          success: false,
          error: 'FORCED_FAILURE: Deterministic fixture explicitly triggered failure for acceptance testing',
          contentType: task.contentType,
          title: `Forced Failure Test: ${task.normalizedTitle || 'Acceptance Test'}`,
          slug: `forced-failure-${task.id}`,
          summary: 'Deterministic fixture for forced failure acceptance testing.',
          content: null,
          faq: [],
          seo: { title: 'Forced Failure', description: 'Forced failure test', keywords: [] },
          geo: { country: 'Test', city: 'Test' },
          structuredData: {},
          hermesRunId: 'forced-failure-fixture',
          latencyMs: 50,
          contractValidationPassed: false,
          contractErrors: ['FORCED_FAILURE_TRIGGER'],
          normalizerFixedCount: 0,
          normalizerRemainingBlockingIssues: 1,
        };
      } else {
        // Normal smoke test - return success
        result = {
          success: true,
          contentType: task.contentType,
          title: `Smoke Test: ${task.normalizedTitle || 'Internal Runtime Test'}`,
          slug: `smoke-test-${task.id}`,
          summary: 'Deterministic fixture for smoke testing the ContentOps runtime path.',
          content: {
            hero: 'Smoke Test Content',
            subtopics: ['Topic 1', 'Topic 2'],
            relatedTools: [],
            relatedGuides: [],
            relatedChecklists: [],
            relatedResources: [],
            cta: 'Test CTA',
            blockConfiguration: [],
          },
          faq: [],
          seo: { title: 'Smoke Test', description: 'Smoke test', keywords: [] },
          geo: { country: 'Test', city: 'Test' },
          structuredData: {},
          hermesRunId: 'smoke-test-fixture',
          latencyMs: 50,
          contractValidationPassed: true,
          normalizerFixedCount: 0,
          normalizerRemainingBlockingIssues: 0,
        };
      }
    } else {
      const executor = new HermesContentExecutor();
      result = await executor.execute(task);
    }
    
    if (!result.success) {
      throw new Error(result.error || 'HERMES_EXECUTOR_FAILED');
    }
    
    log('info', 'Hermes execution completed', {
      jobId: job.jobId,
      contentType: result.contentType,
      hermesRunId: result.hermesRunId,
      latencyMs: result.latencyMs,
      contractValidationPassed: result.contractValidationPassed,
      normalizerFixedCount: result.normalizerFixedCount,
      normalizerRemainingBlockingIssues: result.normalizerRemainingBlockingIssues,
    });
    
    // Save raw model output for debugging (if available)
    if (result.rawModelOutput) {
      const rawOutputFile = path.join(FAILED_DIR, `${job.jobId}.raw-output.json`);
      fs.writeFileSync(rawOutputFile, JSON.stringify(result.rawModelOutput, null, 2));
      log('info', 'Raw model output saved', { jobId: job.jobId, file: rawOutputFile });
    }
    
    // Check if contract validation passed
    if (!result.contractValidationPassed) {
      throw new Error('CONTRACT_VALIDATION_FAILED: ' + result.contractErrors.join(', '));
    }
    
    // Check if normalizer has remaining blocking issues (skip for draft_only mode)
    if (result.normalizerRemainingBlockingIssues > 0 && task.executionMode !== 'draft_only') {
      throw new Error('NORMALIZER_BLOCKING_ISSUES: ' + result.normalizerRemainingBlockingIssues);
    }
    
    // Call appropriate adapter based on content type
    const adapter = getContentPublishAdapter(result.contentType);
    const publishResult = await adapter.publish(result, task.id, task.executionMode);
    
    if (!publishResult.success) {
      throw new Error(publishResult.error || 'ADAPTER_PUBLISH_FAILED');
    }
    
    log('info', 'Content published successfully', {
      jobId: job.jobId,
      draftId: publishResult.draftId,
      publishedUrl: publishResult.publishedUrl,
    });
    
    // ========================================================================
    // Use Finalizer for atomic terminal state (replaces direct outbox write)
    // ========================================================================
    
    // Validate adapter response — reject fake draft IDs (except draft_only mode)
    // Real staging draft IDs have format: draft_<timestamp>_<random>
    // Fake draft IDs have format: draft_<taskId>
    if (!publishResult.draftId) {
      throw new Error(`NO_DRAFT_ID_RETURNED`);
    }
    if (publishResult.draftId.startsWith('draft_') && task.executionMode !== 'draft_only') {
      // Check if it's a fake draft ID (format: draft_<taskId>)
      // Real staging draft IDs have timestamp and random suffix
      const isFakeDraftId = publishResult.draftId === `draft_${job.jobId}` || 
                            publishResult.draftId.match(/^draft_task_\d+_[a-z0-9]+$/);
      if (isFakeDraftId) {
        throw new Error(`FAKE_DRAFT_ID_REJECTED: ${publishResult.draftId}`);
      }
      // Otherwise, it's a real staging draft ID, allow it
    }
    
    // Extract source and determine transport
    const source = job.source || job.task?.source;
    const transport = (source === 'internal_runtime_smoke' || source === 'internal_runtime_acceptance') ? 'internal_test' : 'telegram';
    
    // For internal smoke tests, chatId can be null; for telegram, chatId is required
    const chatId = transport === 'internal_test' ? null : (job.task?.chatId || job.chatId);
    
    // Fail closed: if chatId is missing for telegram transport, fail the task
    if (transport === 'telegram' && !chatId) {
      throw new Error('MISSING_TARGET_CHAT_ID: Cannot complete task without chatId');
    }
    
    const finalizerResult = await finalizeContentOpsTask({
      success: true,
      taskId: job.jobId,
      chatId: chatId || '',  // Empty string if null (will be converted to null by Finalizer)
      contentType: result.contentType,
      executionMode: task.executionMode,
      backendContentId: publishResult.draftId,
      title: result.title || job.topic || 'Untitled',
      hermesRunId: result.hermesRunId,
      latencyMs: result.latencyMs,
      normalizerFixedCount: result.normalizerFixedCount,
      normalizerRemainingBlockingIssues: result.normalizerRemainingBlockingIssues,
      transport,
      source,
    });
    
    if (!finalizerResult.ok) {
      throw new Error(`FINALIZER_FAILED: ${finalizerResult.error}`);
    }
    
    log('info', 'Finalizer completed successfully', { jobId: job.jobId, taskStatus: finalizerResult.taskStatus });
    
    // Clean up processing file
    try {
      fs.unlinkSync(processingPath);
    } catch (e) {
      // Ignore
    }
    
    return true;
  } catch (error: any) {
    moveToFailed(processingPath, error.message);
    return false;
  }
}

// ============================================================================
// Main — One-shot execution
// ============================================================================

async function main() {
  log('info', 'Hermes ContentOps Worker (Mac mini, TypeScript) started', {
    jobsDir: JOBS_DIR,
    workingDir: process.cwd(),
    pid: process.pid
  });
  
  // Ensure directories exist
  [INBOX_DIR, OUTBOX_DIR, PROCESSING_DIR, FAILED_DIR, LOG_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Process all jobs in inbox
  const jobs = listJobs();
  
  if (jobs.length === 0) {
    log('info', 'No jobs in inbox, exiting');
    process.exit(0);
  }
  
  log('info', 'Found jobs in inbox', { count: jobs.length });
  
  let successCount = 0;
  let failCount = 0;
  
  for (const jobPath of jobs) {
    const success = await processJob(jobPath);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  log('info', 'Worker completed', { successCount, failCount, totalJobs: jobs.length });
  
  // Exit after processing all jobs
  process.exit(failCount > 0 ? 1 : 0);
}

// Acquire lock and run
if (acquireLock()) {
  main().catch(error => {
    log('error', 'Worker crashed', { error: error.message, stack: error.stack });
    process.exit(1);
  });
} else {
  process.exit(1);
}
