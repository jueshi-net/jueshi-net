#!/usr/bin/env node
/**
 * @deprecated This worker is deprecated. Use hermes-contentops-worker.ts instead.
 * This file is preserved for rollback purposes only.
 * 
 * Hermes ContentOps Worker — Mac mini Edition
 * 
 * One-shot worker that processes jobs from inbox and exits.
 * Designed for Mac mini LaunchAgent environment.
 * 
 * V2-MVP: v1.20.42.18.6.21.12.0
 */

console.warn('[DEPRECATED] hermes-contentops-worker-mac.js is deprecated. Use hermes-contentops-worker.ts instead.');

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

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

const HERMES_AGENT_PATH = process.env.HERMES_AGENT_PATH || path.join(HOME_DIR, '.hermes/hermes-agent/venv/bin/hermes');
const WORKING_DIR = process.env.HERMES_WORKING_DIR || path.join(HOME_DIR, 'xixiong-saas');

// ============================================================================
// Singleton Lock
// ============================================================================

function acquireLock() {
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
  } catch (error) {
    console.error('[Worker] Failed to acquire lock:', error.message);
    return false;
  }
}

// ============================================================================
// Logging
// ============================================================================

function log(level, message, data = {}) {
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
    /(DATABASE_URL|API_KEY|TOKEN|PASSWORD|SECRET|TELEGRAM_BOT_TOKEN)[^\"]*\"([^\"]*)\"/gi,
    '$1\":\"[REDACTED]\"'
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

function listJobs() {
  try {
    if (!fs.existsSync(INBOX_DIR)) {
      return [];
    }
    const files = fs.readdirSync(INBOX_DIR);
    return files.filter(f => f.endsWith('.json')).map(f => path.join(INBOX_DIR, f));
  } catch (error) {
    log('error', 'Failed to list jobs', { error: error.message });
    return [];
  }
}

function moveToProcessing(jobPath) {
  const jobId = path.basename(jobPath);
  const processingPath = path.join(PROCESSING_DIR, jobId);
  
  try {
    fs.renameSync(jobPath, processingPath);
    log('info', 'Job moved to processing', { jobId });
    return processingPath;
  } catch (error) {
    log('error', 'Failed to move job to processing', { jobId, error: error.message });
    return null;
  }
}

function moveToFailed(jobPath, error) {
  const jobId = path.basename(jobPath);
  const failedPath = path.join(FAILED_DIR, jobId);
  
  try {
    const job = JSON.parse(fs.readFileSync(jobPath, 'utf-8'));
    job.failedAt = new Date().toISOString();
    job.error = error;
    fs.writeFileSync(failedPath, JSON.stringify(job, null, 2));
    fs.unlinkSync(jobPath);
    log('error', 'Job moved to failed', { jobId, error });
  } catch (e) {
    log('error', 'Failed to move job to failed', { jobId, error: e.message });
  }
}

function callHermesAgent(job) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const hermesRunId = `hermes-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    const jobId = job.jobId || 'unknown';
    
    // Build prompt based on job type
    let prompt = '';
    
    if (job.jobType === 'contentops_generate') {
      prompt = buildGeneratePrompt(job);
    } else if (job.jobType === 'contentops_modify') {
      prompt = buildModifyPrompt(job);
    } else {
      reject(new Error(`Unknown job type: ${job.jobType}`));
      return;
    }
    
    log('info', 'WORKER_STARTED', { jobId, hermesRunId, contentType: job.contentType });
    
    // Use spawn with detached process group for proper cleanup
    const args = ['chat', '-q', prompt, '-Q', '--max-turns', '1'];
    const child = spawn(HERMES_AGENT_PATH, args, {
      cwd: WORKING_DIR,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true // Create new process group for cleanup
    });
    
    let stdout = '';
    let stderr = '';
    let firstOutputReceived = false;
    let processClosed = false;
    
    // Track first output
    child.stdout.on('data', (data) => {
      if (!firstOutputReceived) {
        firstOutputReceived = true;
        const elapsedMs = Date.now() - startTime;
        log('info', 'HERMES_FIRST_OUTPUT_RECEIVED', { jobId, elapsedMs });
        clearTimeout(firstOutputTimeout);
      }
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      if (!firstOutputReceived) {
        firstOutputReceived = true;
        const elapsedMs = Date.now() - startTime;
        log('info', 'HERMES_FIRST_OUTPUT_RECEIVED', { jobId, elapsedMs, source: 'stderr' });
        clearTimeout(firstOutputTimeout);
      }
      stderr += data.toString();
    });
    
    // Process start timeout
    const startTimeout = setTimeout(() => {
      if (!firstOutputReceived) {
        log('error', 'HERMES_PROCESS_START_TIMEOUT', { jobId, timeoutMs: HERMES_PROCESS_START_TIMEOUT_MS });
        cleanupAndReject('HERMES_PROCESS_START_TIMEOUT');
      }
    }, HERMES_PROCESS_START_TIMEOUT_MS);
    
    // First output timeout
    const firstOutputTimeout = setTimeout(() => {
      if (!firstOutputReceived) {
        log('error', 'HERMES_FIRST_OUTPUT_TIMEOUT', { jobId, timeoutMs: HERMES_FIRST_OUTPUT_TIMEOUT_MS });
        cleanupAndReject('HERMES_FIRST_OUTPUT_TIMEOUT');
      }
    }, HERMES_FIRST_OUTPUT_TIMEOUT_MS);
    
    // Total timeout
    const totalTimeout = setTimeout(() => {
      log('error', 'HERMES_TOTAL_TIMEOUT', { jobId, timeoutMs: HERMES_TOTAL_TIMEOUT_MS, elapsedMs: Date.now() - startTime });
      cleanupAndReject('HERMES_TOTAL_TIMEOUT');
    }, HERMES_TOTAL_TIMEOUT_MS);
    
    function cleanupAndReject(errorCode) {
      if (processClosed) return;
      processClosed = true;
      
      clearTimeout(startTimeout);
      clearTimeout(firstOutputTimeout);
      clearTimeout(totalTimeout);
      
      // Kill process group
      try {
        if (child.pid) {
          process.kill(-child.pid, 'SIGTERM');
          // Wait 5 seconds, then SIGKILL
          setTimeout(() => {
            try {
              process.kill(-child.pid, 'SIGKILL');
            } catch (e) {
              // Process already exited
            }
          }, 5000);
        }
      } catch (e) {
        // Process group may not exist
      }
      
      reject(new Error(errorCode));
    }
    
    child.on('close', (code, signal) => {
      if (processClosed) return;
      processClosed = true;
      
      clearTimeout(startTimeout);
      clearTimeout(firstOutputTimeout);
      clearTimeout(totalTimeout);
      
      const elapsedMs = Date.now() - startTime;
      log('info', 'HERMES_PROCESS_CLOSED', { jobId, code, signal, elapsedMs });
      
      if (code !== 0 && code !== null) {
        reject(new Error(`HERMES_CLI_EXIT_${code}: ${stderr.substring(0, 500)}`));
        return;
      }
      
      // Remove warning lines before parsing
      const cleanedOutput = stdout
        .split('\n')
        .filter(line => !line.startsWith('Warning:'))
        .join('\n')
        .trim();
      
      resolve({
        content: cleanedOutput,
        latencyMs: elapsedMs
      });
    });
    
    child.on('error', (error) => {
      if (processClosed) return;
      processClosed = true;
      
      clearTimeout(startTimeout);
      clearTimeout(firstOutputTimeout);
      clearTimeout(totalTimeout);
      
      log('error', 'HERMES_SPAWN_FAILED', { jobId, error: error.message });
      reject(new Error(`HERMES_CLI_SPAWN_FAILED: ${error.message}`));
    });
    
    log('info', 'HERMES_PROCESS_STARTED', { jobId, pid: child.pid });
  });
}

function buildGeneratePrompt(job) {
  const contentType = job.contentType || 'guide';
  const userInput = job.rawUserInput || '';
  
  // Content-type specific prompts
  if (contentType === 'checklist') {
    return `Generate a checklist in Chinese for overseas Chinese audience.

Topic: ${userInput}

Return ONLY valid JSON (no markdown, no explanation):
{
  "title": "清单标题(≤24字)",
  "slug": "url-slug",
  "summary": "摘要",
  "contentType": "checklist",
  "audience": "目标受众",
  "groups": [
    {
      "name": "分组名称",
      "description": "分组描述",
      "items": [
        {
          "title": "检查项标题",
          "description": "详细说明",
          "required": true,
          "completionCondition": "完成条件",
          "riskNote": "风险提示",
          "sortOrder": 1
        }
      ]
    }
  ],
  "seo": {
    "primaryKeyword": "主关键词",
    "secondaryKeywords": ["词1", "词2"],
    "metaTitle": "SEO标题",
    "metaDescription": "SEO描述"
  },
  "geo": {
    "targetAudience": "受众",
    "targetCountries": ["国家"]
  },
  "sources": [{"url": "https://...", "title": "标题", "publisher": "来源"}],
  "faq": [{"question": "问题", "answer": "答案"}]
}

Requirements:
- Chinese content only
- At least 4 groups
- At least 20 total items across all groups
- Each item must have: title, description, required, completionCondition
- Real sources when possible
- No deployment/DB/shell commands`;
  }
  
  // Default guide prompt
  return `Generate ${contentType} content in Chinese for overseas Chinese audience.

Topic: ${userInput}

Return ONLY valid JSON (no markdown, no explanation):
{
  "title": "SEO标题(≤24字)",
  "slug": "url-slug",
  "summary": "摘要",
  "contentType": "${contentType}",
  "content": {
    "body": "Markdown正文(≥1800字)",
    "audience": "目标受众",
    "steps": ["步骤1", "步骤2"],
    "pitfalls": ["注意事项"]
  },
  "seo": {
    "primaryKeyword": "主关键词",
    "secondaryKeywords": ["词1", "词2"],
    "metaTitle": "SEO标题",
    "metaDescription": "SEO描述"
  },
  "geo": {
    "targetAudience": "受众",
    "targetCountries": ["国家"]
  },
  "sources": [{"url": "https://...", "title": "标题", "publisher": "来源"}],
  "faq": [{"question": "问题", "answer": "答案"}]
}

Requirements:
- Chinese content only
- Body ≥1800 characters
- 5+ FAQ items
- Real sources when possible
- No deployment/DB/shell commands`;
}

function buildModifyPrompt(job) {
  return `You are a content modification AI.

The user has a content plan and wants to modify it based on their request.

Current plan:
${JSON.stringify(job.currentPlan, null, 2)}

User modification request:
${job.userInstruction}

You must respond with valid JSON only, no markdown, no explanation.

Return the modified plan with the same structure as the original.

Requirements:
- Maintain the same JSON structure
- Apply the user's modifications
- Do not publish content
- Do not execute database operations
- Do not execute deployment
- Do not execute shell commands`;
}

async function processJob(jobPath) {
  const processingPath = moveToProcessing(jobPath);
  if (!processingPath) return false;
  
  let job;
  try {
    job = JSON.parse(fs.readFileSync(processingPath, 'utf-8'));
    job.jobFile = processingPath;
  } catch (error) {
    log('error', 'Failed to parse job', { jobPath, error: error.message });
    moveToFailed(processingPath, error.message);
    return false;
  }
  
  const jobId = job.jobId || 'unknown';
  const startTime = Date.now();
  
  try {
    log('info', 'JOB_PROCESSING_STARTED', { jobId, jobType: job.jobType, contentType: job.contentType });
    
    const result = await callHermesAgent(job);
    
    const hermesDurationMs = Date.now() - startTime;
    log('info', 'HERMES_JSON_PARSED', { jobId, durationMs: hermesDurationMs, contentLength: result.content.length });
    
    // Write result to outbox
    const resultFile = path.join(OUTBOX_DIR, `${jobId}.json`);
    fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
    log('info', 'JOB_COMPLETED', { jobId, durationMs: hermesDurationMs });
    
    // Clean up processing file
    try {
      fs.unlinkSync(processingPath);
    } catch (e) {
      // Ignore
    }
    
    return true;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    log('error', 'JOB_FAILED', { jobId, durationMs, error: error.message, retryable: isRetryableError(error.message) });
    moveToFailed(processingPath, error.message);
    return false;
  }
}

function isRetryableError(errorMessage) {
  const retryablePatterns = [
    'HERMES_PROCESS_START_TIMEOUT',
    'HERMES_FIRST_OUTPUT_TIMEOUT',
    'HERMES_TOTAL_TIMEOUT',
    'HERMES_CLI_SPAWN_FAILED',
    'ECONNREFUSED',
    'ETIMEDOUT'
  ];
  return retryablePatterns.some(pattern => errorMessage.includes(pattern));
}

// ============================================================================
// Main — One-shot execution
// ============================================================================

async function main() {
  log('info', 'Hermes ContentOps Worker (Mac mini) started', {
    jobsDir: JOBS_DIR,
    hermesAgentPath: HERMES_AGENT_PATH,
    workingDir: WORKING_DIR,
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
