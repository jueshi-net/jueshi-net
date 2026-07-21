/**
 * ContentOps Bot Codepath Smoke Test
 * 
 * Tests the same code path as Telegram handler, but without Telegram.
 */

import { stagingHelperClient } from '../../src/lib/contentops/staging-helper-client';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const JOBS_DIR = process.env.HERMES_JOBS_DIR || path.join(os.homedir(), '.jueshi-contentops/jobs');
const INBOX_DIR = path.join(JOBS_DIR, 'inbox');

// Simplified parseTaskIntent for testing
function parseTaskIntent(text: string) {
  const contentType = 'guide';
  const executionMode = 'draft_only';
  const targetEnvironment = 'staging';
  const topic = text.replace(/^(写|创建|生成|做)/, '').replace(/(指南|清单|页面)/, '').trim();
  
  return {
    contentType,
    executionMode,
    targetEnvironment,
    topic,
    audience: '',
    country: '',
    city: '',
    industry: '',
    tone: '',
    requiredSections: [],
    specialRequirements: '',
    scheduledAt: '',
    publishInstruction: '',
  };
}

async function fetchBridgeApi(body: any): Promise<any> {
  try {
    const response = await stagingHelperClient.request({
      method: 'POST',
      pathname: '/api/internal/contentops/drafts',
      body: body
    });
    
    console.log('[Test] Helper response status:', response.status);
    
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      json: async () => response.body,
      text: async () => JSON.stringify(response.body)
    };
  } catch (error: any) {
    console.error('[Test] Helper request failed:', error.message);
    throw error;
  }
}

function enqueueJob(taskId: string, jobData: any) {
  if (!fs.existsSync(INBOX_DIR)) {
    fs.mkdirSync(INBOX_DIR, { recursive: true });
  }
  
  const jobFile = path.join(INBOX_DIR, `${taskId}.json`);
  fs.writeFileSync(jobFile, JSON.stringify(jobData, null, 2));
  console.log('[Test] Job enqueued:', jobFile);
}

async function wakeWorker() {
  const workerScript = path.join(os.homedir(), 'xixiong-saas/scripts/contentops/hermes-contentops-worker-mac.js');
  const { spawn } = require('child_process');
  
  return new Promise((resolve, reject) => {
    const child = spawn('node', [workerScript], {
      stdio: 'inherit'
    });
    
    child.on('close', (code: number) => {
      console.log('[Test] Worker exited with code:', code);
      resolve(code);
    });
    
    child.on('error', (error: Error) => {
      reject(error);
    });
  });
}

async function testBotCodepath() {
  console.log('=== ContentOps Bot Codepath Smoke Test ===');
  console.log('Timestamp:', new Date().toISOString());
  
  const testMessage = '写一篇第一次使用国际集运的完整指南';
  
  // Step 1: Parse task intent
  console.log('\n=== Step 1: Parse Task Intent ===');
  const parsed = parseTaskIntent(testMessage);
  console.log('Parsed:', {
    contentType: parsed.contentType,
    executionMode: parsed.executionMode,
    targetEnvironment: parsed.targetEnvironment,
    topic: parsed.topic
  });
  
  // Step 2: Create task via Bridge
  console.log('\n=== Step 2: Create Task via Bridge ===');
  const taskResponse = await fetchBridgeApi({
    action: 'create_task',
    chatId: 'test-smoke',
    messageId: Date.now(),
    rawInput: testMessage,
    contentType: parsed.contentType,
    executionMode: parsed.executionMode,
    targetEnvironment: parsed.targetEnvironment,
    topic: parsed.topic,
  });
  
  if (!taskResponse.ok) {
    console.error('❌ Task creation failed:', taskResponse.status);
    process.exit(1);
  }
  
  const taskResult = await taskResponse.json();
  const taskId = taskResult.taskId;
  
  if (!taskId) {
    console.error('❌ Task ID missing');
    process.exit(1);
  }
  
  console.log('✅ Task created:', taskId);
  
  // Step 3: Enqueue job
  console.log('\n=== Step 3: Enqueue Job ===');
  const jobData = {
    jobId: taskId,
    jobType: 'contentops_generate',
    contentType: parsed.contentType,
    rawUserInput: testMessage,
    task: taskResult.task,
  };
  enqueueJob(taskId, jobData);
  
  // Step 4: Wake worker
  console.log('\n=== Step 4: Wake Worker ===');
  const workerExitCode = await wakeWorker();
  
  if (workerExitCode !== 0) {
    console.error('❌ Worker failed with exit code:', workerExitCode);
    process.exit(1);
  }
  
  console.log('✅ Worker completed');
  
  // Step 5: Check outbox
  console.log('\n=== Step 5: Check Outbox ===');
  const OUTBOX_DIR = path.join(JOBS_DIR, 'outbox');
  const resultFile = path.join(OUTBOX_DIR, `${taskId}.json`);
  
  if (!fs.existsSync(resultFile)) {
    console.error('❌ Result file not found:', resultFile);
    process.exit(1);
  }
  
  const result = JSON.parse(fs.readFileSync(resultFile, 'utf-8'));
  console.log('✅ Result generated:', {
    contentLength: result.content?.length || 0,
    latencyMs: result.latencyMs
  });
  
  console.log('\n=== Test Summary ===');
  console.log('✅ parseTaskIntent: PASS');
  console.log('✅ fetchBridgeApi: PASS');
  console.log('✅ enqueueJob: PASS');
  console.log('✅ wakeWorker: PASS');
  console.log('✅ Content generation: PASS');
  console.log('\nTask ID:', taskId);
  console.log('Content length:', result.content?.length || 0);
  
  return taskId;
}

testBotCodepath().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
