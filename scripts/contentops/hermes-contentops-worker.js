#!/usr/bin/env node
/**
 * Hermes ContentOps Worker
 * 
 * Listens to jobs/inbox, calls Hermes Agent, writes results to jobs/outbox.
 * 
 * V2-MVP: v1.20.42.18.6.16.6.84.4.8.2
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================================
// Configuration
// ============================================================================

const JOBS_DIR = process.env.HERMES_JOBS_DIR || '/var/lib/jueshi-contentops/jobs';
const INBOX_DIR = path.join(JOBS_DIR, 'inbox');
const OUTBOX_DIR = path.join(JOBS_DIR, 'outbox');
const PROCESSING_DIR = path.join(JOBS_DIR, 'processing');
const FAILED_DIR = path.join(JOBS_DIR, 'failed');
const LOG_DIR = '/var/log/jueshi-contentops';
const POLL_INTERVAL_MS = parseInt(process.env.HERMES_JOB_POLL_INTERVAL_MS || '2000');
const JOB_TIMEOUT_MS = parseInt(process.env.HERMES_JOB_TIMEOUT_MS || '180000');
const HERMES_AGENT_PATH = process.env.HERMES_AGENT_PATH || '/home/deploy/hermes-agent/venv/bin/hermes';

// ============================================================================
// Logging
// ============================================================================

function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data,
  };
  
  // Sanitize sensitive data
  const sanitized = JSON.stringify(logEntry).replace(
    /(DATABASE_URL|API_KEY|TOKEN|PASSWORD|SECRET)[^"]*"([^"]*)"/gi,
    '$1":"[REDACTED]"'
  );
  
  console.log(sanitized);
  
  // Write to log file
  const logFile = path.join(LOG_DIR, `worker-${timestamp.split('T')[0]}.log`);
  fs.appendFileSync(logFile, sanitized + '\n');
}

// ============================================================================
// Job Processing
// ============================================================================

function listJobs() {
  try {
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
  const hermesRunId = `hermes-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
  
  // Build prompt based on job type
  let prompt = '';
  
  if (job.jobType === 'contentops_generate') {
    prompt = buildGeneratePrompt(job);
  } else if (job.jobType === 'contentops_modify') {
    prompt = buildModifyPrompt(job);
  } else {
    throw new Error(`Unknown job type: ${job.jobType}`);
  }
  
  // Write prompt to temp file
  const promptFile = path.join(PROCESSING_DIR, `${path.basename(job.jobFile)}.prompt`);
  fs.writeFileSync(promptFile, prompt);
  
  try {
    // Call Hermes Agent
    const command = `${HERMES_AGENT_PATH} chat -q "$(cat ${promptFile})" -Q --max-turns 5`;
    log('info', 'Calling Hermes Agent', { jobId: job.jobId, hermesRunId });
    
    const result = execSync(command, {
      encoding: 'utf-8',
      timeout: JOB_TIMEOUT_MS,
      cwd: '/home/deploy/xixiong-saas',
    });
    
    // Parse result
    let parsed;
    try {
      // Remove markdown code blocks if present
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      log('error', 'Failed to parse Hermes response as JSON', { jobId: job.jobId, response: result.substring(0, 500) });
      throw new Error('Hermes response is not valid JSON');
    }
    
    // Add metadata
    parsed.hermesRunId = hermesRunId;
    parsed.gatewayUsed = true;
    parsed.planningUsed = true;
    parsed.fallbackUsed = false;
    parsed.timestamp = new Date().toISOString();
    
    log('info', 'Hermes Agent call successful', { jobId: job.jobId, hermesRunId });
    
    return parsed;
  } catch (error) {
    log('error', 'Hermes Agent call failed', { jobId: job.jobId, hermesRunId, error: error.message });
    throw error;
  } finally {
    // Clean up prompt file
    try {
      fs.unlinkSync(promptFile);
    } catch (e) {
      // Ignore
    }
  }
}

function buildGeneratePrompt(job) {
  return `You are a content planning AI for a Chinese website targeting overseas Chinese and international students.

Analyze the following user input and create a structured content plan.

User input:
${job.rawUserInput}

You must respond with valid JSON only, no markdown, no explanation.

The JSON structure must include:
{
  "inputMode": "long_text" | "reference_rewrite" | "messy_notes",
  "contentType": "checklist" | "guide" | "topic",
  "schemaType": "checklist" | "guide" | "topic",
  "title": "SEO-friendly title in Chinese, max 24 chars",
  "targetAudience": "target audience description",
  "targetCountries": ["country1", "country2"],
  "audienceStage": "beginner" | "intermediate" | "advanced",
  "searchIntent": "informational" | "navigational" | "transactional",
  "sourceFacts": [{"id": "fact1", "text": "fact text", "category": "category"}],
  "content": { ... schema-specific content ... },
  "seo": {
    "primaryKeyword": "primary keyword",
    "secondaryKeywords": ["keyword1", "keyword2"],
    "metaTitle": "meta title",
    "metaDescription": "meta description",
    "metaKeywords": ["keyword1", "keyword2"]
  },
  "geo": {
    "targetAudience": "audience",
    "targetCountries": ["country1"],
    "audienceStage": "stage",
    "searchIntent": "intent"
  },
  "structuredData": {
    "@context": "https://schema.org",
    "@type": "Article" | "ItemList",
    "name": "title",
    "description": "intro"
  }
}

Content type selection rules:
- checklist: preparation items, material lists, step-by-step checklists
- guide: process explanation, operation guides, knowledge tutorials
- topic: resource recommendations, APP recommendations, tool collections, topic reviews, multi-scenario comparisons

For reference_rewrite with APP/tool content, choose "topic".
For long_text with process/steps, choose "guide".
For messy_notes with items/lists, choose "checklist".

Topic content structure:
{
  "intro": "introduction >= 300 chars",
  "categories": ["category1", "category2", "category3", "category4"],
  "resources": [
    {
      "name": "resource name",
      "category": "category",
      "ratingTier": "S" | "A" | "B" | "C",
      "recommendationLevel": "highly recommended" | "recommended" | "optional" | "not recommended",
      "suitableFor": ["audience1", "audience2"],
      "scenario": "usage scenario",
      "reason": "recommendation reason",
      "caution": "caution or warning",
      "countries": ["country1", "country2"],
      "officialOrSafeDownloadNote": "download note"
    }
  ],
  "scenarioMap": [
    {
      "scenario": "scenario name",
      "recommendedResources": ["resource1", "resource2"],
      "priority": "high" | "medium" | "low"
    }
  ],
  "comparisonTable": {
    "headers": ["feature", "resource1", "resource2"],
    "rows": [{"feature": "feature name", "resources": {"resource1": "value1", "resource2": "value2"}}]
  },
  "ratingTierExplanation": "explanation of S/A/B/C rating system",
  "faq": [{"question": "Q", "answer": "A"}],
  "pitfalls": [{"title": "title", "description": "description", "severity": "high" | "medium" | "low"}],
  "internalLinks": [{"url": "/path", "title": "title", "context": "context"}],
  "relatedTools": [{"name": "name", "url": "https://...", "description": "description"}]
}

Requirements:
- Topic must have >= 8 resources with S/A/B/C rating
- Include scenarioMap, comparisonTable, FAQ >= 5, pitfalls >= 5
- All content must be in Chinese
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

function writeResult(job, result) {
  const resultFile = path.join(OUTBOX_DIR, `${job.jobId}.json`);
  
  try {
    fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
    log('info', 'Result written to outbox', { jobId: job.jobId });
    
    // Clean up processing file
    try {
      fs.unlinkSync(job.jobFile);
    } catch (e) {
      // Ignore
    }
  } catch (error) {
    log('error', 'Failed to write result', { jobId: job.jobId, error: error.message });
    throw error;
  }
}

function processJob(jobPath) {
  const processingPath = moveToProcessing(jobPath);
  if (!processingPath) return;
  
  let job;
  try {
    job = JSON.parse(fs.readFileSync(processingPath, 'utf-8'));
    job.jobFile = processingPath;
  } catch (error) {
    log('error', 'Failed to parse job', { jobPath, error: error.message });
    moveToFailed(processingPath, error.message);
    return;
  }
  
  try {
    const result = callHermesAgent(job);
    writeResult(job, result);
  } catch (error) {
    moveToFailed(processingPath, error.message);
  }
}

// ============================================================================
// Main Loop
// ============================================================================

function main() {
  log('info', 'Hermes ContentOps Worker started', {
    jobsDir: JOBS_DIR,
    pollIntervalMs: POLL_INTERVAL_MS,
    jobTimeoutMs: JOB_TIMEOUT_MS,
    hermesAgentPath: HERMES_AGENT_PATH,
  });
  
  // Ensure directories exist
  [INBOX_DIR, OUTBOX_DIR, PROCESSING_DIR, FAILED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Poll loop
  setInterval(() => {
    const jobs = listJobs();
    if (jobs.length > 0) {
      log('info', 'Found jobs in inbox', { count: jobs.length });
      jobs.forEach(processJob);
    }
  }, POLL_INTERVAL_MS);
}

main();
