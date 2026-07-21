#!/usr/bin/env node
/**
 * Hermes ContentOps Worker — Mac mini Edition
 * 
 * One-shot worker that processes jobs from inbox and exits.
 * Designed for Mac mini LaunchAgent environment.
 * 
 * V2-MVP: v1.20.42.18.6.21.12.0
 */

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

const JOB_TIMEOUT_MS = parseInt(process.env.HERMES_JOB_TIMEOUT_MS || '180000'); // 3 minutes
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
    
    log('info', 'Calling Hermes Agent', { jobId: job.jobId, hermesRunId, contentType: job.contentType });
    
    // Use spawn instead of execSync to avoid shell injection and handle large prompts
    const args = ['chat', '-q', prompt, '-Q', '--max-turns', '5'];
    const child = spawn(HERMES_AGENT_PATH, args, {
      cwd: WORKING_DIR,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('HERMES_CLI_TIMEOUT'));
    }, JOB_TIMEOUT_MS);
    
    child.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code !== 0) {
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
        latencyMs: Date.now() - startTime
      });
    });
    
    child.on('error', (error) => {
      clearTimeout(timeout);
      log('error', 'Hermes Agent spawn failed', { jobId: job.jobId, error: error.message });
      reject(error);
    });
  });
}

function buildGeneratePrompt(job) {
  const contentType = job.contentType || 'guide';
  
  return `You are a content generation AI for a Chinese website targeting overseas Chinese and international students.

Generate ${contentType} content based on the following user input.

User input:
${job.rawUserInput}

You must respond with valid JSON only, no markdown, no explanation.

The JSON structure must include:
{
  "title": "SEO-friendly title in Chinese, max 24 chars",
  "slug": "url-friendly-slug",
  "summary": "brief summary",
  "contentType": "${contentType}",
  "content": { ... content specific to type ... },
  "seo": {
    "primaryKeyword": "primary keyword",
    "secondaryKeywords": ["keyword1", "keyword2"],
    "metaTitle": "meta title",
    "metaDescription": "meta description"
  },
  "geo": {
    "targetAudience": "audience",
    "targetCountries": ["country1"],
    "audienceStage": "stage"
  },
  "sources": [{"url": "https://...", "title": "source title", "publisher": "publisher"}],
  "faq": [{"question": "Q", "answer": "A"}]
}

Content type specific requirements:

For GUIDE:
{
  "content": {
    "excerpt": "brief excerpt",
    "body": "full markdown body with sections",
    "sections": [{"heading": "section title", "content": "section content"}]
  }
}

For CHECKLIST:
{
  "content": {
    "groups": [
      {
        "title": "group title",
        "items": [
          {
            "title": "item title",
            "description": "item description",
            "required": true,
            "completionCondition": "how to know it's done",
            "riskNote": "risk warning if any"
          }
        ]
      }
    ],
    "pitfalls": [{"title": "title", "description": "description"}]
  }
}

For TOPIC:
{
  "content": {
    "hero": "hero section",
    "subtopics": [{"title": "title", "description": "description"}],
    "relatedTools": [{"name": "name", "url": "https://...", "description": "description"}],
    "relatedGuides": [{"title": "title", "url": "/guides/slug"}],
    "relatedChecklists": [{"title": "title", "url": "/checklists/slug"}],
    "relatedResources": [{"title": "title", "url": "https://..."}],
    "blockConfiguration": [{"type": "block type", "content": "..."}]
  }
}

Requirements:
- All content must be in Chinese
- Include real, verifiable sources when possible
- Do not publish content
- Do not execute database operations
- Do not execute deployment
- Do not execute shell commands`;
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
  
  try {
    const result = await callHermesAgent(job);
    
    // Write result to outbox
    const resultFile = path.join(OUTBOX_DIR, `${job.jobId}.json`);
    fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
    log('info', 'Result written to outbox', { jobId: job.jobId });
    
    // Clean up processing file
    try {
      fs.unlinkSync(processingPath);
    } catch (e) {
      // Ignore
    }
    
    return true;
  } catch (error) {
    moveToFailed(processingPath, error.message);
    return false;
  }
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
