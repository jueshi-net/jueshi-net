#!/usr/bin/env tsx
/**
 * Internal Runtime Smoke Test
 * 
 * Creates a draft_only guide task via the real pipeline.
 * Marks as ARCHIVED_TEST after completion.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

const HOME_DIR = os.homedir();
const JOBS_DIR = path.join(HOME_DIR, '.jueshi-contentops/jobs');
const INBOX_DIR = path.join(JOBS_DIR, 'inbox');
const OUTBOX_DIR = path.join(JOBS_DIR, 'outbox');

// Ensure directories exist
[JOBS_DIR, INBOX_DIR, OUTBOX_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate task ID
const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(7)}`;
const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
const idempotencyKey = `idempotency_${Date.now()}_${Math.random().toString(36).substring(7)}`;

console.log('[Internal Smoke] Creating task:', taskId);
console.log('[Internal Smoke] Creating job:', jobId);

// Create job payload
const jobPayload = {
  jobId,
  jobType: 'contentops_generate',
  contentType: 'guide',
  rawUserInput: '[INTERNAL_SMOKE_TEST] 创建一个简单的操作指南，标题为"内部烟雾测试指南"',
  task: {
    id: taskId,
    taskId,
    contentType: 'guide',
    executionMode: 'draft_only',
    targetEnvironment: 'staging',
    rawInput: '[INTERNAL_SMOKE_TEST] 创建一个简单的操作指南，标题为"内部烟雾测试指南"',
    status: 'QUEUED',
    idempotencyKey,
    archivedTest: true,
    source: 'internal_runtime_smoke',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
};

// Write to inbox atomically
const tmpFile = path.join(JOBS_DIR, 'tmp', `${jobId}.tmp`);
const inboxFile = path.join(INBOX_DIR, `${jobId}.json`);

// Ensure tmp directory exists
const tmpDir = path.join(JOBS_DIR, 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

fs.writeFileSync(tmpFile, JSON.stringify(jobPayload, null, 2));
fs.renameSync(tmpFile, inboxFile);

console.log('[Internal Smoke] Job written to inbox:', inboxFile);
console.log('[Internal Smoke] Task ID:', taskId);
console.log('[Internal Smoke] Job ID:', jobId);

// Wait for worker to process
console.log('[Internal Smoke] Waiting for worker to process...');

// Check for outbox file (indicates completion)
const maxWait = 600000; // 10 minutes
const checkInterval = 5000; // 5 seconds
const startTime = Date.now();

let completed = false;
let outboxFile = '';

while (Date.now() - startTime < maxWait) {
  const files = fs.readdirSync(OUTBOX_DIR).filter(f => f.includes(taskId));
  if (files.length > 0) {
    outboxFile = path.join(OUTBOX_DIR, files[0]);
    completed = true;
    break;
  }
  
  // Also check if task was archived
  const archivedDir = path.join(JOBS_DIR, 'archived');
  if (fs.existsSync(archivedDir)) {
    const archivedFiles = fs.readdirSync(archivedDir).filter(f => f.includes(taskId));
    if (archivedFiles.length > 0) {
      console.log('[Internal Smoke] Task archived');
      completed = true;
      break;
    }
  }
  
  console.log('[Internal Smoke] Waiting...');
  execSync(`sleep ${checkInterval / 1000}`, { stdio: 'ignore' });
}

if (completed) {
  console.log('[Internal Smoke] ✅ Task completed');
  console.log('[Internal Smoke] Task ID:', taskId);
  console.log('[Internal Smoke] Job ID:', jobId);
  console.log('[Internal Smoke] Outbox file:', outboxFile);
  
  // Read outbox data
  if (outboxFile && fs.existsSync(outboxFile)) {
    const outboxData = JSON.parse(fs.readFileSync(outboxFile, 'utf-8'));
    console.log('[Internal Smoke] Content type:', outboxData.contentType);
    console.log('[Internal Smoke] Status:', outboxData.status);
    console.log('[Internal Smoke] Archived test:', outboxData.archivedTest);
  }
  
  process.exit(0);
} else {
  console.error('[Internal Smoke] ❌ Task did not complete within timeout');
  process.exit(1);
}
