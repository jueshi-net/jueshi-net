#!/usr/bin/env npx tsx
/**
 * Final Smoke Test - Transport Hard Isolation Verification
 * 
 * Creates one final smoke task with:
 * - source=internal_runtime_smoke
 * - provider=deterministic_fixture
 * - internalAuthorized=true
 * 
 * Expected behavior:
 * - Worker processes task
 * - Finalizer writes transport=internal_test, chatId=null
 * - Dispatcher routes to test sink (not Telegram)
 * - No message sent to user's real Telegram chat
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const HOME_DIR = os.homedir();
const JOBS_DIR = path.join(HOME_DIR, '.jueshi-contentops/jobs');
const INBOX_DIR = path.join(JOBS_DIR, 'inbox');

// Create smoke task
const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

const smokeTask = {
  jobId: taskId,
  jobType: 'contentops_generate',
  contentType: 'topic',
  executionMode: 'review_required',
  topic: 'Final Smoke Test: Transport Isolation',
  
  // Internal smoke test metadata
  source: 'internal_runtime_smoke',
  provider: 'deterministic_fixture',
  internalAuthorized: true,
  
  // No chatId for internal smoke test (will be null in notification)
  chatId: null,
  
  createdAt: new Date().toISOString(),
};

// Ensure inbox directory exists
if (!fs.existsSync(INBOX_DIR)) {
  fs.mkdirSync(INBOX_DIR, { recursive: true });
}

// Write task to inbox
const taskFile = path.join(INBOX_DIR, `${taskId}.json`);
fs.writeFileSync(taskFile, JSON.stringify(smokeTask, null, 2));

console.log('=== Final Smoke Test Created ===');
console.log(`Task ID: ${taskId}`);
console.log(`Task File: ${taskFile}`);
console.log(`Source: ${smokeTask.source}`);
console.log(`Provider: ${smokeTask.provider}`);
console.log(`Internal Authorized: ${smokeTask.internalAuthorized}`);
console.log(`Chat ID: ${smokeTask.chatId}`);
console.log('');
console.log('Expected behavior:');
console.log('1. Worker will auto-wake via launchctl');
console.log('2. Worker will process task with deterministic fixture');
console.log('3. Finalizer will write transport=internal_test, chatId=null');
console.log('4. Dispatcher will route to test sink (not Telegram)');
console.log('5. No message will be sent to user\'s real Telegram chat');
console.log('');
console.log('Monitoring logs...');

// Monitor logs for completion
const LOG_DIR = path.join(HOME_DIR, '.jueshi-contentops/logs');
const today = new Date().toISOString().split('T')[0];
const logFile = path.join(LOG_DIR, `worker-${today}.log`);

let attempts = 0;
const maxAttempts = 60; // 60 seconds

const monitorInterval = setInterval(() => {
  attempts++;
  
  if (attempts > maxAttempts) {
    console.error('Timeout: Worker did not complete within 60 seconds');
    clearInterval(monitorInterval);
    process.exit(1);
  }
  
  // Check if task file still exists in inbox or processing
  const inboxFile = path.join(INBOX_DIR, `${taskId}.json`);
  const processingFile = path.join(JOBS_DIR, 'processing', `${taskId}.json`);
  const completedFile = path.join(JOBS_DIR, 'completed', `${taskId}.json`);
  
  if (fs.existsSync(completedFile)) {
    console.log(`✓ Task completed: ${taskId}`);
    clearInterval(monitorInterval);
    
    // Check outbox for notification
    const outboxFile = path.join(JOBS_DIR, 'outbox', `${taskId}.json`);
    if (fs.existsSync(outboxFile)) {
      const notification = JSON.parse(fs.readFileSync(outboxFile, 'utf-8'));
      console.log('');
      console.log('=== Notification Details ===');
      console.log(`Transport: ${notification.transport}`);
      console.log(`Chat ID: ${notification.chatId}`);
      console.log(`Terminal Status: ${notification.terminalStatus}`);
      console.log(`Backend Content ID: ${notification.backendContentId}`);
      
      if (notification.transport === 'internal_test' && notification.chatId === null) {
        console.log('');
        console.log('✓ PASS: Transport isolation verified');
        console.log('✓ PASS: chatId is null');
        console.log('✓ PASS: Will route to test sink, not Telegram');
      } else {
        console.error('');
        console.error('✗ FAIL: Transport isolation NOT verified');
        console.error(`  Expected: transport=internal_test, chatId=null`);
        console.error(`  Got: transport=${notification.transport}, chatId=${notification.chatId}`);
      }
    }
    
    // Check test sink audit
    const testSinkAudit = path.join(HOME_DIR, '.jueshi-contentops/test-sink/audit.log');
    if (fs.existsSync(testSinkAudit)) {
      const auditContent = fs.readFileSync(testSinkAudit, 'utf-8');
      if (auditContent.includes(taskId)) {
        console.log('✓ PASS: Task recorded in test sink audit');
      }
    }
    
    process.exit(0);
  }
  
  // Check worker log for progress
  if (fs.existsSync(logFile)) {
    const logContent = fs.readFileSync(logFile, 'utf-8');
    if (logContent.includes(taskId)) {
      const lines = logContent.split('\n').filter(l => l.includes(taskId));
      const lastLine = lines[lines.length - 1];
      if (lastLine) {
        const logEntry = JSON.parse(lastLine);
        console.log(`[${attempts}s] ${logEntry.level}: ${logEntry.message}`);
      }
    }
  }
  
}, 1000);
