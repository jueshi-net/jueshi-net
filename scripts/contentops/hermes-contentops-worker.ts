#!/usr/bin/env node
/**
 * Hermes ContentOps Worker — Mac mini Edition (TypeScript)
 * 
 * One-shot worker that processes jobs from inbox and exits.
 * Uses HermesContentExecutor with full Runtime Pipeline.
 * 
 * V2-MVP: v1.20.42.18.6.21.12.2
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { HermesContentExecutor } from '../../src/lib/contentops/hermes-content-executor';
import { getContentPublishAdapter } from '../../src/lib/contentops/content-publish-adapters';
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

function moveToFailed(jobPath: string, error: string) {
  const jobId = path.basename(jobPath);
  const failedPath = path.join(FAILED_DIR, jobId);
  
  try {
    const job = JSON.parse(fs.readFileSync(jobPath, 'utf-8'));
    job.failedAt = new Date().toISOString();
    job.error = error;
    fs.writeFileSync(failedPath, JSON.stringify(job, null, 2));
    fs.unlinkSync(jobPath);
    log('error', 'Job moved to failed', { jobId, error });
  } catch (e: any) {
    log('error', 'Failed to move job to failed', { jobId, error: e.message });
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
      executionMode: job.executionMode || 'review_required',
      targetEnvironment: job.targetEnvironment || 'staging',
      rawInput: job.rawUserInput || job.userInstruction || '',
      topic: job.topic || '',
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
    const executor = new HermesContentExecutor();
    const result = await executor.execute(task);
    
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
    
    // Check if contract validation passed
    if (!result.contractValidationPassed) {
      throw new Error('CONTRACT_VALIDATION_FAILED: ' + result.contractErrors.join(', '));
    }
    
    // Check if normalizer has remaining blocking issues
    if (result.normalizerRemainingBlockingIssues > 0) {
      throw new Error('NORMALIZER_BLOCKING_ISSUES: ' + result.normalizerRemainingBlockingIssues);
    }
    
    // Call appropriate adapter based on content type
    const adapter = getContentPublishAdapter(result.contentType);
    const publishResult = await adapter.publish(result, task.id);
    
    if (!publishResult.success) {
      throw new Error(publishResult.error || 'ADAPTER_PUBLISH_FAILED');
    }
    
    log('info', 'Content published successfully', {
      jobId: job.jobId,
      draftId: publishResult.draftId,
      publishedUrl: publishResult.publishedUrl,
    });
    
    // Write result to outbox
    const resultFile = path.join(OUTBOX_DIR, `${job.jobId}.json`);
    fs.writeFileSync(resultFile, JSON.stringify({
      jobId: job.jobId,
      success: true,
      contentType: result.contentType,
      draftId: publishResult.draftId,
      publishedUrl: publishResult.publishedUrl,
      hermesRunId: result.hermesRunId,
      latencyMs: result.latencyMs,
      normalizerFixedCount: result.normalizerFixedCount,
      normalizerRemainingBlockingIssues: result.normalizerRemainingBlockingIssues,
      contractValidationPassed: result.contractValidationPassed,
      completedAt: new Date().toISOString(),
    }, null, 2));
    
    log('info', 'Result written to outbox', { jobId: job.jobId });
    
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
