#!/usr/bin/env node
/**
 * ContentOps Notification Dispatcher (TypeScript) — V2 Stabilized
 * 
 * Watches outbox directory and sends terminal Telegram notifications.
 * 
 * V2 Stabilization:
 * 1. ONLY consumes schemaVersion=2 events
 * 2. Time window guard (10 minutes max age)
 * 3. Malformed content detection (Untitled/unknown/N_A fail closed)
 * 4. Success notifications MUST have real backendContentId
 * 5. Failure notifications MUST NOT have fake backendContentId
 * 6. Does NOT infer task state — only sends what Finalizer wrote
 * 7. Atomic claim → check idempotency → send → mark sent
 * 
 * V2-MVP: v1.20.42.18.6.21.12.3
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as https from 'https';
import { buildContentOpsAdminUrl } from '../../src/lib/contentops/admin-url-builder';

const HOME_DIR = require('os').homedir();
const OUTBOX_DIR = path.join(HOME_DIR, '.jueshi-contentops/jobs/outbox');
const NOTIFIED_FILE = path.join(HOME_DIR, '.jueshi-contentops/jobs/notified.json');
const FAILED_DIR = path.join(HOME_DIR, '.jueshi-contentops/jobs/failed-notifications');
const STALE_DIR = path.join(HOME_DIR, '.jueshi-contentops/jobs/stale-notifications');
const COMPLETED_DIR = path.join(HOME_DIR, '.jueshi-contentops/jobs/completed');

// Time window: reject notifications older than 10 minutes
const MAX_NOTIFICATION_AGE_MS = 10 * 60 * 1000;

// Read Bot Token from Keychain
function readBotToken(): string | null {
  try {
    const token = execSync(
      'security find-generic-password -s jueshi-contentops-telegram -a fabuxia_bot -w',
      { encoding: 'utf-8' }
    ).trim();
    return token || null;
  } catch {
    return null;
  }
}

// Load notified task IDs
function loadNotifiedTasks(): Record<string, any> {
  try {
    if (fs.existsSync(NOTIFIED_FILE)) {
      return JSON.parse(fs.readFileSync(NOTIFIED_FILE, 'utf-8'));
    }
  } catch {}
  return {};
}

// Save notified task IDs
function saveNotifiedTasks(notified: Record<string, any>): void {
  fs.writeFileSync(NOTIFIED_FILE, JSON.stringify(notified, null, 2));
}

// ============================================================================
// V2 Schema Validation
// ============================================================================

function validateV2Schema(data: any): { valid: boolean; error?: string } {
  // Rule 1: MUST have schemaVersion=2
  if (data.schemaVersion !== 2) {
    return { valid: false, error: `SCHEMA_VERSION_INVALID: expected 2, got ${data.schemaVersion}` };
  }
  
  // Rule 2: MUST have notificationId
  if (!data.notificationId) {
    return { valid: false, error: 'MISSING_NOTIFICATION_ID' };
  }
  
  // Rule 3: MUST have terminalStatus
  if (!data.terminalStatus || !['COMPLETED', 'FAILED'].includes(data.terminalStatus)) {
    return { valid: false, error: `INVALID_TERMINAL_STATUS: ${data.terminalStatus}` };
  }
  
  // Rule 4: MUST have createdAt within time window
  if (!data.createdAt) {
    return { valid: false, error: 'MISSING_CREATED_AT' };
  }
  
  const age = Date.now() - new Date(data.createdAt).getTime();
  if (age > MAX_NOTIFICATION_AGE_MS) {
    return { valid: false, error: `STALE_NOTIFICATION: age=${Math.round(age/1000)}s > max=${MAX_NOTIFICATION_AGE_MS/1000}s` };
  }
  
  // Rule 5: Success MUST have real backendContentId
  if (data.terminalStatus === 'COMPLETED') {
    if (!data.backendContentId) {
      return { valid: false, error: 'SUCCESS_WITHOUT_CONTENT_ID' };
    }
    if (data.backendContentId.startsWith('draft_')) {
      return { valid: false, error: `FAKE_DRAFT_ID_IN_SUCCESS: ${data.backendContentId}` };
    }
  }
  
  // Rule 6: Failure MUST NOT have fake backendContentId
  if (data.terminalStatus === 'FAILED') {
    if (data.backendContentId && data.backendContentId.startsWith('draft_')) {
      return { valid: false, error: `FAKE_DRAFT_ID_IN_FAILURE: ${data.backendContentId}` };
    }
  }
  
  // Rule 7: Malformed content detection
  if (data.title && ['Untitled', 'unknown', 'N/A', 'N_A', 'null', 'undefined'].includes(data.title)) {
    return { valid: false, error: `MALFORMED_TITLE: ${data.title}` };
  }
  
  if (data.contentType && data.contentType === 'unknown') {
    return { valid: false, error: 'MALFORMED_CONTENT_TYPE: unknown' };
  }
  
  return { valid: true };
}

// ============================================================================
// Telegram Send
// ============================================================================

function sendTelegramMessage(token: string, chatId: string, text: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.ok) {
            resolve(result);
          } else {
            reject(new Error(result.description || 'Telegram API error'));
          }
        } catch (e) {
          reject(new Error('Invalid response: ' + data.substring(0, 200)));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error('Request failed: ' + e.message));
    });

    req.write(postData);
    req.end();
  });
}

// ============================================================================
// Notification Message Builder
// ============================================================================

function buildTerminalMessage(data: any): string {
  if (data.terminalStatus === 'COMPLETED') {
    const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
    const title = data.title || content?.title || 'Untitled';
    const contentType = data.contentType || content?.contentType || 'unknown';
    const adminUrl = data.adminUrl || buildContentOpsAdminUrl('staging');
    
    return [
      '✅ <b>任务处理完成</b>',
      '',
      `任务 ID：<code>${data.jobId || 'N/A'}</code>`,
      `类型：${contentType}`,
      `标题：${title}`,
      `状态：${content?.status || 'AWAITING_REVIEW'}`,
      '',
      `📋 <a href="${adminUrl}">后台查看</a>`,
    ].join('\n');
  } else {
    const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
    const error = data.error || content?.error || '未知错误';
    const contentType = data.contentType || content?.contentType || 'unknown';
    const adminUrl = data.adminUrl || buildContentOpsAdminUrl('staging');
    
    return [
      '❌ <b>任务处理失败</b>',
      '',
      `任务 ID：<code>${data.jobId || 'N/A'}</code>`,
      `类型：${contentType}`,
      `原因：${error}`,
      '',
      `内容未进入正常审核流程`,
      `未保存为可发布内容`,
      '',
      `📋 <a href="${adminUrl}">后台查看</a>`,
    ].join('\n');
  }
}

// ============================================================================
// Atomic Claim + Send
// ============================================================================

async function processOutbox(token: string, notified: Record<string, any>): Promise<void> {
  if (!fs.existsSync(OUTBOX_DIR)) {
    return;
  }

  const files = fs.readdirSync(OUTBOX_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const filePath = path.join(OUTBOX_DIR, file);
    const taskId = path.basename(file, '.json');
    
    // Step 1: Atomic claim — try to rename to .claiming
    const claimingPath = filePath + '.claiming';
    try {
      fs.renameSync(filePath, claimingPath);
    } catch (e: any) {
      // File already claimed by another process or doesn't exist
      continue;
    }
    
    try {
      const outboxData = JSON.parse(fs.readFileSync(claimingPath, 'utf-8'));
      
      // Step 2: Check idempotency — already notified?
      const notificationId = outboxData.notificationId || `terminal:${taskId}`;
      if (notified[notificationId]) {
        // Already sent — move to completed
        moveToCompleted(claimingPath);
        continue;
      }
      
      // Step 3: Validate V2 schema
      const validation = validateV2Schema(outboxData);
      if (!validation.valid) {
        console.error(`[Notification] V2 validation failed for ${file}: ${validation.error}`);
        
        if (validation.error?.startsWith('STALE_')) {
          moveToStale(claimingPath, validation.error);
        } else {
          moveToFailedQueue(claimingPath, validation.error || 'Validation failed');
        }
        continue;
      }
      
      // Step 4: Build message
      const chatId = outboxData.chatId || '8602323654';
      const message = buildTerminalMessage(outboxData);
      
      // Step 5: Send to Telegram or Test Sink
      let sendResult: any;
      if (chatId === 'internal-test-sink' || chatId === 'INTERNAL_TEST_SINK') {
        // Internal test sink - do not send to real Telegram
        const { sendToTestSink } = await import('./internal-test-transport');
        sendResult = await sendToTestSink(outboxData);
        console.log(`[Notification] Sent to test sink for task: ${taskId}`);
      } else {
        // Real Telegram send
        sendResult = await sendTelegramMessage(token, chatId, message);
        console.log(`[Notification] Sent ${outboxData.terminalStatus} for task: ${taskId}`);
      }
      
      // Step 6: Telegram success → write to notified.json
      notified[notificationId] = {
        notifiedAt: new Date().toISOString(),
        terminalStatus: outboxData.terminalStatus,
        backendContentId: outboxData.backendContentId,
        contentType: outboxData.contentType,
        schemaVersion: 2,
        telegramMessageId: sendResult.result?.message_id,
        status: 'SENT',
      };
      saveNotifiedTasks(notified);
      
      // Step 7: Move to completed
      moveToCompleted(claimingPath);
      
      console.log(`[Notification] Sent ${outboxData.terminalStatus} for task: ${taskId}`);
      
    } catch (error: any) {
      console.error(`[Notification] Failed for ${file}:`, error.message);
      
      // Telegram failed → move back to outbox for retry (do NOT mark as sent)
      try {
        fs.renameSync(claimingPath, filePath);
      } catch (e) {
        moveToFailedQueue(claimingPath, error.message);
      }
    }
  }
}

// ============================================================================
// File Movement Helpers
// ============================================================================

function moveToCompleted(file: string): void {
  try {
    if (!fs.existsSync(COMPLETED_DIR)) {
      fs.mkdirSync(COMPLETED_DIR, { recursive: true });
    }
    const destFile = path.join(COMPLETED_DIR, `${path.basename(file)}.${Date.now()}`);
    fs.renameSync(file, destFile);
  } catch (e: any) {
    // Try to clean up
    try { fs.unlinkSync(file); } catch {}
  }
}

function moveToStale(file: string, reason: string): void {
  try {
    if (!fs.existsSync(STALE_DIR)) {
      fs.mkdirSync(STALE_DIR, { recursive: true });
    }
    const destFile = path.join(STALE_DIR, `${path.basename(file)}.${Date.now()}.stale`);
    fs.writeFileSync(destFile, JSON.stringify({
      originalFile: file,
      reason,
      staleAt: new Date().toISOString(),
    }, null, 2));
    try { fs.unlinkSync(file); } catch {}
    console.error(`[Notification] Moved to stale: ${file} (${reason})`);
  } catch (e) {
    console.error(`[Notification] Failed to move to stale:`, e);
  }
}

function moveToFailedQueue(file: string, error: string): void {
  try {
    if (!fs.existsSync(FAILED_DIR)) {
      fs.mkdirSync(FAILED_DIR, { recursive: true });
    }
    const failedFile = path.join(FAILED_DIR, `${path.basename(file)}.${Date.now()}.failed`);
    fs.writeFileSync(failedFile, JSON.stringify({
      originalFile: file,
      error: error,
      failedAt: new Date().toISOString(),
    }, null, 2));
    try { fs.unlinkSync(file); } catch {}
    console.error(`[Notification] Moved to failed queue: ${file}`);
  } catch (moveError) {
    console.error(`[Notification] Failed to move to failed queue:`, moveError);
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const token = readBotToken();
  if (!token) {
    console.error('[Notification Dispatcher] Bot token not found in Keychain');
    process.exit(1);
  }

  console.log('[Notification Dispatcher] Started (V2 Stabilized)');
  console.log('[Notification Dispatcher] Watching:', OUTBOX_DIR);
  console.log('[Notification Dispatcher] Schema: v2 only');
  console.log('[Notification Dispatcher] Time window: 10 minutes');
  console.log('[Notification Dispatcher] Malformed detection: enabled');

  const notified = loadNotifiedTasks();

  // Process existing files
  await processOutbox(token, notified);

  // Watch for new files
  if (fs.existsSync(OUTBOX_DIR)) {
    fs.watch(OUTBOX_DIR, async (eventType, filename) => {
      if (filename && filename.endsWith('.json')) {
        console.log(`[Notification Dispatcher] Detected: ${filename}`);
        // Wait a bit for file to be fully written
        setTimeout(async () => {
          await processOutbox(token, loadNotifiedTasks());
        }, 1000);
      }
    });
  }

  // Keep process alive
  console.log('[Notification Dispatcher] Ready');
}

main().catch(error => {
  console.error('[Notification Dispatcher] Crashed:', error.message);
  process.exit(1);
});
