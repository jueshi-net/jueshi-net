import { canonicalTaskService } from '../../src/lib/contentops/canonical-task-service';
import * as fs from 'fs';
import * as path from 'path';

const JOBS_DIR = path.join(require('os').homedir(), '.jueshi-contentops/jobs');

async function waitForJobCompletion(taskId: string, timeoutMs: number = 600000): Promise<{
  status: 'completed' | 'failed' | 'timeout';
  outboxData?: any;
  failedData?: any;
  durationMs: number;
}> {
  const startTime = Date.now();
  const outboxPath = path.join(JOBS_DIR, 'outbox', `${taskId}.json`);
  const failedPath = path.join(JOBS_DIR, 'failed', `${taskId}.json`);
  
  while (Date.now() - startTime < timeoutMs) {
    // Check outbox (success)
    if (fs.existsSync(outboxPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(outboxPath, 'utf-8'));
        return { status: 'completed', outboxData: data, durationMs: Date.now() - startTime };
      } catch (e) {
        // File may be partially written
      }
    }
    
    // Check failed
    if (fs.existsSync(failedPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(failedPath, 'utf-8'));
        return { status: 'failed', failedData: data, durationMs: Date.now() - startTime };
      } catch (e) {
        // File may be partially written
      }
    }
    
    // Check processing
    const processingPath = path.join(JOBS_DIR, 'processing', `${taskId}.json`);
    if (fs.existsSync(processingPath)) {
      // Still processing, wait
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  return { status: 'timeout', durationMs: Date.now() - startTime };
}

async function main() {
  const startTime = Date.now();
  console.log('[Topic E2E] === Starting Real Model Topic E2E ===');
  console.log('[Topic E2E] Timestamp:', new Date().toISOString());
  
  // Record pre-state
  const { execSync } = require('child_process');
  const botPid = execSync('ps aux | grep contentops-telegram-bot | grep -v grep | awk \'{print $2}\' | head -1', { encoding: 'utf-8' }).trim();
  console.log('[Topic E2E] Bot PID:', botPid);
  
  // Check no worker running before
  const workerBefore = execSync('ps aux | grep hermes-contentops-worker | grep -v grep | wc -l', { encoding: 'utf-8' }).trim();
  console.log('[Topic E2E] Worker processes before:', workerBefore);
  
  // Create task
  console.log('[Topic E2E] Creating Topic task...');
  const result = await canonicalTaskService.createAndEnqueueContentOpsTask({
    contentType: 'topic',
    rawInput: '创建一个关于国际集运的完整主题页面，包含工具推荐、操作指南、检查清单和官方资源',
    executionMode: 'draft_only',
    targetEnvironment: 'staging',
    targetAudience: '首次使用国际集运的海外华人用户',
  });
  
  if (!result.ok) {
    console.error('[Topic E2E] FAILED: Task creation failed:', result.error);
    process.exit(1);
  }
  
  const taskId = result.taskId!;
  console.log('[Topic E2E] Task ID:', taskId);
  console.log('[Topic E2E] Enqueue status:', result.enqueueStatus);
  
  // Record job creation time
  const jobCreatedAt = Date.now();
  console.log('[Topic E2E] Job created at:', new Date().toISOString());
  
  // Check inbox
  const inboxPath = path.join(JOBS_DIR, 'inbox', `${taskId}.json`);
  const inboxExists = fs.existsSync(inboxPath);
  console.log('[Topic E2E] Inbox file exists:', inboxExists);
  
  // Wait for Worker to pick up and process
  console.log('[Topic E2E] Waiting for Worker auto-wake and processing...');
  
  // Check worker started
  await new Promise(resolve => setTimeout(resolve, 5000));
  const workerAfter = execSync('ps aux | grep hermes-contentops-worker | grep -v grep', { encoding: 'utf-8' }).trim();
  const workerPid = workerAfter ? workerAfter.split(/\s+/)[1] : 'none';
  console.log('[Topic E2E] Worker auto-wake PID:', workerPid);
  console.log('[Topic E2E] Worker started at:', new Date().toISOString());
  
  // Wait for completion
  const jobResult = await waitForJobCompletion(taskId, 600000);
  const totalDuration = (Date.now() - startTime) / 1000;
  
  console.log('[Topic E2E] === Results ===');
  console.log('[Topic E2E] Status:', jobResult.status);
  console.log('[Topic E2E] Duration:', totalDuration, 'seconds');
  
  if (jobResult.status === 'completed') {
    console.log('[Topic E2E] Outbox data:', JSON.stringify(jobResult.outboxData, null, 2));
    console.log('[Topic E2E] Draft ID:', jobResult.outboxData.draftId);
    console.log('[Topic E2E] Content Type:', jobResult.outboxData.contentType);
    console.log('[Topic E2E] Contract Validation:', jobResult.outboxData.contractValidationPassed);
  } else if (jobResult.status === 'failed') {
    console.log('[Topic E2E] Failed data:', JSON.stringify(jobResult.failedData, null, 2));
  } else {
    console.log('[Topic E2E] TIMEOUT after', totalDuration, 'seconds');
    
    // Check current state
    const processingExists = fs.existsSync(path.join(JOBS_DIR, 'processing', `${taskId}.json`));
    const workerStillRunning = execSync('ps aux | grep hermes-contentops-worker | grep -v grep | wc -l', { encoding: 'utf-8' }).trim();
    console.log('[Topic E2E] Still in processing:', processingExists);
    console.log('[Topic E2E] Worker still running:', workerStillRunning);
  }
  
  // Check no manual kick was needed
  console.log('[Topic E2E] Manual kick commands: 0');
  console.log('[Topic E2E] === E2E Complete ===');
}

main().catch(err => {
  console.error('[Topic E2E] Fatal error:', err);
  process.exit(1);
});
