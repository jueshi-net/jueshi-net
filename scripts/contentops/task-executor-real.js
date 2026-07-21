#!/usr/bin/env node
/**
 * ContentOps Hermes Agent Task Executor — Real Hermes CLI Version
 * 
 * This script runs as a Hermes cron job on Mac mini.
 * It picks up pending tasks and processes them using Hermes CLI.
 * 
 * Architecture:
 * - Calls Hermes CLI directly via subprocess
 * - No template fallback
 * - Real model generation
 * - Results saved back via Bridge API
 * 
 * V2-MVP: v1.20.42.18.6.21.12.1
 */

const https = require('https');
const http = require('http');
const { createHmac } = require('crypto');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// ============================================================================
// Configuration
// ============================================================================

const BRIDGE_URL = process.env.CONTENTOPS_BRIDGE_URL || 'http://127.0.0.1:3001/api/internal/contentops/drafts';
const BRIDGE_SECRET = process.env.CONTENTOPS_BRIDGE_SECRET || '';
const BOT_TOKEN = process.env.CONTENTOPS_TELEGRAM_BOT_TOKEN || '';
const ALLOWED_CHAT_IDS = (process.env.CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS || '').split(',').filter(Boolean);

// Hermes CLI Configuration
const HERMES_CLI_PATH = process.env.HERMES_CLI_PATH || path.join(os.homedir(), '.hermes/hermes-agent/venv/bin/hermes');
const HERMES_WORKING_DIR = process.env.HERMES_WORKING_DIR || path.join(os.homedir(), 'xixiong-saas');
const HERMES_TIMEOUT_MS = parseInt(process.env.HERMES_TIMEOUT_MS || '180000'); // 3 minutes
const HERMES_MAX_TURNS = parseInt(process.env.HERMES_MAX_TURNS || '5');

// ============================================================================
// Bridge API Client
// ============================================================================

function signPayload(method, path, body) {
  const payload = `${method}:${path}:${body}`;
  return createHmac('sha256', BRIDGE_SECRET).update(payload).digest('hex');
}

async function bridgeApi(action, data = {}) {
  const body = JSON.stringify({ action, ...data });
  const url = new URL(BRIDGE_URL);
  const signature = signPayload('POST', url.pathname, body);
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-ContentOps-Signature': signature,
      },
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ============================================================================
// Telegram Notification
// ============================================================================

async function notifyTelegram(chatId, text) {
  if (!BOT_TOKEN || !chatId) return;
  
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body = JSON.stringify({
    chat_id: chatId,
    text: text.substring(0, 4000),
    parse_mode: 'Markdown',
  });

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ============================================================================
// Hermes CLI Client
// ============================================================================

async function callHermesCLI(prompt) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const args = ['chat', '-q', prompt, '-Q', '--max-turns', HERMES_MAX_TURNS.toString()];
    
    const child = spawn(HERMES_CLI_PATH, args, {
      cwd: HERMES_WORKING_DIR,
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
    }, HERMES_TIMEOUT_MS);
    
    child.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code !== 0) {
        reject(new Error(`HERMES_CLI_EXIT_${code}: ${stderr.substring(0, 500)}`));
        return;
      }
      
      resolve({
        content: stdout,
        latencyMs: Date.now() - startTime
      });
    });
    
    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`HERMES_CLI_SPAWN_FAILED: ${error.message}`));
    });
  });
}

// ============================================================================
// Content Generation (using Hermes CLI)
// ============================================================================

function buildStructuredPrompt(contentType, task) {
  const basePrompt = `You are a content generation AI for a Chinese website targeting overseas Chinese and international students.

Generate ${contentType} content based on the following user input.

User input:
${task.rawInput || task.topic}

You must respond with valid JSON only, no markdown, no explanation.

The JSON structure must include:
{
  "title": "SEO-friendly title in Chinese, max 24 chars",
  "slug": "url-friendly-slug",
  "summary": "brief summary",
  "contentType": "${contentType}",
  "seo": {
    "title": "SEO title",
    "description": "SEO description",
    "keywords": ["keyword1", "keyword2"]
  },
  "geo": {
    "targetCountry": "country",
    "targetAudience": "audience",
    "searchIntent": "intent"
  },
  "sources": [{"url": "https://...", "title": "source title", "publisher": "publisher", "sourceType": "official"}],
  "faq": [{"question": "Q", "answer": "A"}],
  "internalLinks": [{"url": "/path", "title": "title", "reason": "reason"}]
}`;

  if (contentType === 'guide') {
    return basePrompt + `

For GUIDE, the content must include:
{
  "content": {
    "body": "full markdown body with H2/H3 sections, at least 1800 Chinese characters",
    "audience": "target audience description",
    "steps": ["step1", "step2"],
    "pitfalls": ["pitfall1", "pitfall2"]
  }
}

Requirements:
- Body must be at least 1800 Chinese characters
- Include at least 5 FAQ items
- Include real, verifiable sources when possible
- All content must be in Chinese`;
  }
  
  if (contentType === 'checklist') {
    return basePrompt + `

For CHECKLIST, the content must include:
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

Requirements:
- Must have at least 4 groups
- Each group must have at least 5 items
- Total items must be at least 20
- All content must be in Chinese`;
  }
  
  if (contentType === 'topic') {
    return basePrompt + `

For TOPIC, the content must include:
{
  "content": {
    "hero": "hero section content",
    "subtopics": [{"title": "title", "description": "description"}],
    "relatedTools": [{"name": "name", "url": "https://...", "description": "description"}],
    "relatedGuides": [{"title": "title", "url": "/guides/slug"}],
    "relatedChecklists": [{"title": "title", "url": "/checklists/slug"}],
    "relatedResources": [{"title": "title", "url": "https://..."}],
    "blockConfiguration": [{"type": "block type", "content": "..."}],
    "cta": "call to action"
  }
}

Requirements:
- Must have at least 5 blocks
- Include real tool links when possible
- All content must be in Chinese`;
  }
  
  return basePrompt;
}

async function generateContent(task) {
  const { contentType } = task;
  
  console.log(`[TaskExecutor] Calling Hermes CLI for ${contentType}...`);
  
  // Build prompt
  const prompt = buildStructuredPrompt(contentType, task);
  
  // Call Hermes CLI
  const { content: rawOutput, latencyMs } = await callHermesCLI(prompt);
  
  console.log(`[TaskExecutor] Hermes CLI completed in ${latencyMs}ms`);
  
  // Parse JSON output
  let parsed;
  try {
    const cleaned = rawOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (parseError) {
    throw new Error('HERMES_CLI_INVALID_JSON: ' + rawOutput.substring(0, 500));
  }
  
  // Add metadata
  parsed.hermesRunId = `hermes-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
  parsed.provider = 'hermes-cli';
  parsed.model = 'hermes-agent';
  parsed.latencyMs = latencyMs;
  
  return parsed;
}

// ============================================================================
// Main Execution Loop
// ============================================================================

async function processTask(task) {
  console.log(`[TaskExecutor] Processing task ${task.id}: ${task.topic}`);

  try {
    // Step 1: Update status to GENERATING_CONTENT
    await bridgeApi('update_task', {
      taskId: task.id,
      status: 'GENERATING_CONTENT',
      step: 'GENERATING_CONTENT',
    });

    await notifyTelegram(task.chatId, `🔄 正在生成内容：${task.topic}`);

    // Step 2: Generate content using Hermes CLI
    const content = await generateContent(task);

    // Step 3: Update with generated content
    await bridgeApi('update_task', {
      taskId: task.id,
      status: 'CLEANING_CONTENT',
      step: 'CLEANING_CONTENT',
      data: { content },
    });

    // Step 4: Create backend draft
    const draftResult = await bridgeApi('', {
      title: content.title,
      body: JSON.stringify(content),
      targetEnvironment: task.targetEnvironment || 'staging',
      qualityMetadata: {
        hermesRunId: content.hermesRunId,
        provider: content.provider,
        model: content.model,
        latencyMs: content.latencyMs,
      },
    });

    // Step 5: Update task with draft ID
    await bridgeApi('update_task', {
      taskId: task.id,
      status: 'AWAITING_REVIEW',
      step: 'COMPLETED',
      data: { draftId: draftResult.draftId },
    });

    await notifyTelegram(
      task.chatId,
      `✅ 内容已生成并提交后台\n\n任务：${task.topic}\n草稿 ID：${draftResult.draftId}\n\n请在后台查看并审核。`
    );

    console.log(`[TaskExecutor] Task ${task.id} completed successfully`);
    return { success: true, draftId: draftResult.draftId };

  } catch (error) {
    console.error(`[TaskExecutor] Task ${task.id} failed:`, error.message);

    // Update task status to FAILED
    await bridgeApi('update_task', {
      taskId: task.id,
      status: 'FAILED',
      step: 'FAILED',
      error: error.message,
      errorCode: error.message.startsWith('HERMES_') ? error.message : 'TASK_EXECUTOR_ERROR',
    });

    await notifyTelegram(
      task.chatId,
      `❌ 内容生成失败\n\n任务：${task.topic}\n错误：${error.message.substring(0, 200)}`
    );

    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('[TaskExecutor] Starting task executor...');

  try {
    // Fetch pending tasks
    const tasksResult = await bridgeApi('list_tasks', { status: 'RECEIVED' });
    const tasks = tasksResult.tasks || [];

    if (tasks.length === 0) {
      console.log('[TaskExecutor] No pending tasks');
      return;
    }

    console.log(`[TaskExecutor] Found ${tasks.length} pending tasks`);

    // Process each task
    for (const task of tasks) {
      await processTask(task);
    }

    console.log('[TaskExecutor] All tasks processed');

  } catch (error) {
    console.error('[TaskExecutor] Fatal error:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('[TaskExecutor] Unhandled error:', error);
  process.exit(1);
});
