/**
 * ContentOps Pipeline Batch Test
 * 
 * Runs 3 complete pipeline tests sequentially.
 */

import { stagingHelperClient } from '../../src/lib/contentops/staging-helper-client';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const JOBS_DIR = process.env.HERMES_JOBS_DIR || path.join(os.homedir(), '.jueshi-contentops/jobs');
const INBOX_DIR = path.join(JOBS_DIR, 'inbox');
const OUTBOX_DIR = path.join(JOBS_DIR, 'outbox');

function parseTaskIntent(text: string) {
  return {
    contentType: 'guide',
    executionMode: 'draft_only',
    targetEnvironment: 'staging',
    topic: text.replace(/^(写|创建|生成|做)/, '').replace(/(指南|清单|页面)/, '').trim(),
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
  const response = await stagingHelperClient.request({
    method: 'POST',
    pathname: '/api/internal/contentops/drafts',
    body: body
  });
  
  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    json: async () => response.body,
  };
}

function enqueueJob(taskId: string, jobData: any) {
  if (!fs.existsSync(INBOX_DIR)) {
    fs.mkdirSync(INBOX_DIR, { recursive: true });
  }
  const jobFile = path.join(INBOX_DIR, `${taskId}.json`);
  fs.writeFileSync(jobFile, JSON.stringify(jobData, null, 2));
}

async function wakeWorker() {
  const workerScript = path.join(os.homedir(), 'xixiong-saas/scripts/contentops/hermes-contentops-worker-mac.js');
  const { spawn } = require('child_process');
  
  return new Promise<number>((resolve, reject) => {
    const child = spawn('node', [workerScript], { stdio: 'pipe' });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
    child.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
    
    child.on('close', (code: number) => resolve(code));
    child.on('error', (error: Error) => reject(error));
  });
}

async function runSingleTest(testIndex: number, topic: string): Promise<{ success: boolean; taskId: string; contentLength: number; durationMs: number }> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST ${testIndex}/3: ${topic}`);
  console.log(`${'='.repeat(60)}`);
  
  const startTime = Date.now();
  
  try {
    // Parse
    const parsed = parseTaskIntent(topic);
    
    // Create task
    const taskResponse = await fetchBridgeApi({
      action: 'create_task',
      chatId: 'test-batch',
      messageId: Date.now(),
      rawInput: topic,
      contentType: parsed.contentType,
      executionMode: parsed.executionMode,
      targetEnvironment: parsed.targetEnvironment,
      topic: parsed.topic,
    });
    
    if (!taskResponse.ok) {
      throw new Error(`Task creation failed: ${taskResponse.status}`);
    }
    
    const taskResult = await taskResponse.json();
    const taskId = taskResult.taskId;
    
    if (!taskId) {
      throw new Error('Task ID missing');
    }
    
    console.log(`✅ Task created: ${taskId}`);
    
    // Enqueue
    enqueueJob(taskId, {
      jobId: taskId,
      jobType: 'contentops_generate',
      contentType: parsed.contentType,
      rawUserInput: topic,
      task: taskResult.task,
    });
    
    // Wake worker
    const workerExitCode = await wakeWorker();
    
    if (workerExitCode !== 0) {
      throw new Error(`Worker failed with exit code: ${workerExitCode}`);
    }
    
    // Check outbox
    const resultFile = path.join(OUTBOX_DIR, `${taskId}.json`);
    
    if (!fs.existsSync(resultFile)) {
      throw new Error('Result file not found');
    }
    
    const result = JSON.parse(fs.readFileSync(resultFile, 'utf-8'));
    const durationMs = Date.now() - startTime;
    
    console.log(`✅ Content generated: ${result.content?.length || 0} chars in ${durationMs}ms`);
    
    return {
      success: true,
      taskId,
      contentLength: result.content?.length || 0,
      durationMs,
    };
  } catch (error: any) {
    console.error(`❌ Test failed: ${error.message}`);
    return {
      success: false,
      taskId: '',
      contentLength: 0,
      durationMs: Date.now() - startTime,
    };
  }
}

async function main() {
  console.log('=== ContentOps Pipeline Batch Test ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Running 3 complete pipeline tests...\n');
  
  const topics = [
    '写一篇第一次使用国际集运的完整指南',
    '创建一份新加坡留学生租房检查清单',
    '生成海外华人回国发展政策解读指南',
  ];
  
  const results = [];
  
  for (let i = 0; i < 3; i++) {
    const result = await runSingleTest(i + 1, topics[i]);
    results.push(result);
    
    // Clean up outbox for next test
    if (result.taskId) {
      const resultFile = path.join(OUTBOX_DIR, `${result.taskId}.json`);
      try {
        fs.unlinkSync(resultFile);
      } catch (e) {
        // Ignore
      }
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('BATCH TEST SUMMARY');
  console.log(`${'='.repeat(60)}`);
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  console.log(`Total: ${results.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Failure: ${failureCount}`);
  console.log(`Success Rate: ${((successCount / results.length) * 100).toFixed(1)}%`);
  
  console.log('\nTask IDs:');
  results.forEach((r, i) => {
    console.log(`  Test ${i + 1}: ${r.taskId} (${r.success ? '✅' : '❌'})`);
  });
  
  if (successCount === 3) {
    console.log('\n✅ ALL TESTS PASSED');
    process.exit(0);
  } else {
    console.log('\n❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Batch test failed:', error);
  process.exit(1);
});
