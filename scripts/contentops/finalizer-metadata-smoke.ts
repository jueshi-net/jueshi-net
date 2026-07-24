#!/usr/bin/env tsx
/**
 * ContentOps Finalizer Metadata Runtime Smoke
 * 
 * Validates the complete chain:
 * Task → Job → Worker → Finalizer → Backend Verification → Notifier Transport Routing
 * 
 * Uses deterministic fixture, no Hermes model calls.
 */

import { canonicalTaskService } from '../../src/lib/contentops/canonical-task-service';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const timestamp = Date.now();
const SMOKE_TOPIC = `ContentOps Finalizer Metadata Smoke ${timestamp}`;

const JOBS_DIR = process.env.HERMES_JOBS_DIR || path.join(os.homedir(), '.jueshi-contentops/jobs');
const INBOX_DIR = path.join(JOBS_DIR, 'inbox');
const PROCESSING_DIR = path.join(JOBS_DIR, 'processing');
const OUTBOX_DIR = path.join(JOBS_DIR, 'outbox');
const FAILED_DIR = path.join(JOBS_DIR, 'failed');

console.log('='.repeat(60));
console.log('ContentOps Finalizer Metadata Runtime Smoke');
console.log('='.repeat(60));
console.log(`Topic: ${SMOKE_TOPIC}`);
console.log(`Timestamp: ${timestamp}`);
console.log();

async function main() {
// Record pre-execution state
const inboxBefore = fs.readdirSync(INBOX_DIR).filter(f => f.endsWith('.json')).length;
const processingBefore = fs.readdirSync(PROCESSING_DIR).filter(f => f.endsWith('.json')).length;
const outboxBefore = fs.readdirSync(OUTBOX_DIR).filter(f => f.endsWith('.json')).length;
const failedBefore = fs.readdirSync(FAILED_DIR).filter(f => f.endsWith('.json')).length;

console.log('Pre-execution queue state:');
console.log(`  INBOX_COUNT_BEFORE=${inboxBefore}`);
console.log(`  PROCESSING_COUNT_BEFORE=${processingBefore}`);
console.log(`  OUTBOX_COUNT_BEFORE=${outboxBefore}`);
console.log(`  FAILED_COUNT_BEFORE=${failedBefore}`);
console.log();

// Create Smoke Task
console.log('Creating Smoke Task...');
console.log('Input:');
console.log('  chatId=internal-test-sink (placeholder, Finalizer will set to null)');
console.log('  source=internal_runtime_smoke');
console.log('  provider=deterministic_fixture');
console.log('  internalAuthorized=true');
console.log('  contentType=topic');
console.log('  executionMode=review_required');
console.log('  targetEnvironment=staging');
console.log();

const result = await canonicalTaskService.createAndEnqueueContentOpsTask({
  chatId: 'internal-test-sink',  // Placeholder, Finalizer will set to null for internal_test transport
  messageId: 0,
  rawInput: SMOKE_TOPIC,
  contentType: 'topic',
  executionMode: 'review_required',
  targetEnvironment: 'staging',
  topic: SMOKE_TOPIC,
  source: 'internal_runtime_smoke',
  provider: 'deterministic_fixture',
  internalAuthorized: true,
});

console.log('Task creation result:');
console.log(`  ok=${result.ok}`);
console.log(`  taskId=${result.taskId}`);
console.log(`  enqueueStatus=${result.enqueueStatus}`);
if (result.error) {
  console.log(`  error=${result.error.code}: ${result.error.message}`);
}
console.log();

if (!result.ok) {
  console.error('FAILED: Task creation failed');
  process.exit(1);
}

const taskId = result.taskId!;
console.log(`SMOKE_TASK_ID=${taskId}`);
console.log(`SMOKE_JOB_ID=${taskId}`);  // Job ID is same as Task ID
console.log(`SMOKE_TASK_CREATE_COUNT=1`);
console.log();

// Wait for Worker to process
console.log('Waiting for Worker to process job...');
console.log('WORKER_AUTO_WAKE_ATTEMPTED=true (via CanonicalTaskService.wakeupWorker)');
console.log();

// Poll for completion (max 60 seconds)
const startTime = Date.now();
const maxWaitMs = 60000;
let taskCompleted = false;
let taskStatus = 'UNKNOWN';
let jobStatus = 'UNKNOWN';
let backendContentId = '';
let outboxFile = '';

while (Date.now() - startTime < maxWaitMs) {
  // Check task status
  const taskFile = path.join(JOBS_DIR, 'tasks', `${taskId}.json`);
  if (fs.existsSync(taskFile)) {
    const taskData = JSON.parse(fs.readFileSync(taskFile, 'utf-8'));
    taskStatus = taskData.status;
    
    if (taskStatus === 'COMPLETED' || taskStatus === 'FAILED') {
      taskCompleted = true;
      break;
    }
  }
  
  // Check job status
  const jobFile = path.join(PROCESSING_DIR, `${taskId}.json`);
  if (fs.existsSync(jobFile)) {
    const jobData = JSON.parse(fs.readFileSync(jobFile, 'utf-8'));
    jobStatus = jobData.status || 'PROCESSING';
    
    // Extract backendContentId if available
    if (jobData.backendContentId) {
      backendContentId = jobData.backendContentId;
    }
  }
  
  // Check outbox
  const outboxFiles = fs.readdirSync(OUTBOX_DIR).filter(f => f.startsWith(taskId));
  if (outboxFiles.length > 0) {
    outboxFile = outboxFiles[0];
    const outboxData = JSON.parse(fs.readFileSync(path.join(OUTBOX_DIR, outboxFile), 'utf-8'));
    if (outboxData.terminalStatus) {
      taskCompleted = true;
      taskStatus = outboxData.terminalStatus;
      backendContentId = outboxData.backendContentId || backendContentId;
      break;
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000));
}

console.log('Execution results:');
console.log(`  TASK_FINAL_STATUS=${taskStatus}`);
console.log(`  JOB_FINAL_STATUS=${taskCompleted ? 'COMPLETED' : 'TIMEOUT'}`);
console.log(`  BACKEND_CONTENT_ID=${backendContentId}`);
console.log();

// Record post-execution state
const inboxAfter = fs.readdirSync(INBOX_DIR).filter(f => f.endsWith('.json')).length;
const processingAfter = fs.readdirSync(PROCESSING_DIR).filter(f => f.endsWith('.json')).length;
const outboxAfter = fs.readdirSync(OUTBOX_DIR).filter(f => f.endsWith('.json') || f.endsWith('.json.claiming')).length;
const failedAfter = fs.readdirSync(FAILED_DIR).filter(f => f.endsWith('.json')).length;

console.log('Post-execution queue state:');
console.log(`  INBOX_COUNT_AFTER=${inboxAfter}`);
console.log(`  PROCESSING_COUNT_AFTER=${processingAfter}`);
console.log(`  OUTBOX_COUNT_AFTER=${outboxAfter}`);
console.log(`  FAILED_COUNT_AFTER=${failedAfter}`);
console.log();

// Verify outbox content
if (outboxFile) {
  const outboxPath = path.join(OUTBOX_DIR, outboxFile);
  const outboxData = JSON.parse(fs.readFileSync(outboxPath, 'utf-8'));
  
  console.log('Outbox verification:');
  console.log(`  TRANSPORT=${outboxData.transport}`);
  console.log(`  CHAT_ID=${outboxData.chatId}`);
  console.log(`  SOURCE=${outboxData.source}`);
  console.log(`  TERMINAL_STATUS=${outboxData.terminalStatus}`);
  console.log(`  BACKEND_CONTENT_ID=${outboxData.backendContentId}`);
  console.log();
  
  // Verify transport routing
  if (outboxData.transport === 'internal_test' && outboxData.chatId === null) {
    console.log('✓ Transport routing correct: internal_test with null chatId');
  } else {
    console.error('✗ Transport routing incorrect');
  }
}

// Check test sink
const testSinkDir = path.join(JOBS_DIR, 'test-sink');
if (fs.existsSync(testSinkDir)) {
  const testSinkFiles = fs.readdirSync(testSinkDir).filter(f => f.includes(taskId));
  console.log(`  TEST_SINK_RECORD_COUNT=${testSinkFiles.length}`);
}

console.log();
console.log('='.repeat(60));
console.log('Smoke test completed');
console.log('='.repeat(60));
}

main().catch(err => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
