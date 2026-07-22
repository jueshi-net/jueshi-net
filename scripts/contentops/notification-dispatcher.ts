#!/usr/bin/env node
/**
 * ContentOps Notification Dispatcher (TypeScript)
 * 
 * Watches outbox directory and sends terminal Telegram notifications
 * when tasks complete.
 * 
 * Uses shared Notification Contract for validation.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as https from 'https';
import {
  ContentOpsNotification,
  TaskNotificationPayload,
  isValidNotificationType,
  isValidNotificationStatus,
  isNotificationTerminal,
  canNotificationRetry,
  getNotificationMessage,
  NOTIFICATION_STATUS,
} from '../../src/lib/contentops/contracts/notification-contract';

const HOME_DIR = require('os').homedir();
const OUTBOX_DIR = path.join(HOME_DIR, '.jueshi-contentops/jobs/outbox');
const NOTIFIED_FILE = path.join(HOME_DIR, '.jueshi-contentops/jobs/notified.json');
const FAILED_DIR = path.join(HOME_DIR, '.jueshi-contentops/jobs/failed-notifications');

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

// Validate notification against shared contract
function validateNotification(notification: any): { valid: boolean; error?: string } {
  if (!notification.taskId) {
    return { valid: false, error: 'Missing taskId' };
  }
  if (!notification.type) {
    return { valid: false, error: 'Missing notification type' };
  }
  if (!isValidNotificationType(notification.type)) {
    return { valid: false, error: `Invalid notification type: ${notification.type}` };
  }
  if (notification.status && !isValidNotificationStatus(notification.status)) {
    return { valid: false, error: `Invalid notification status: ${notification.status}` };
  }
  return { valid: true };
}

// Send Telegram message
function sendTelegramMessage(token: string, chatId: string, text: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
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

// Move failed notification to failed queue
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
    console.error(`[Notification] Moved to failed queue: ${file}`);
  } catch (moveError) {
    console.error(`[Notification] Failed to move to failed queue:`, moveError);
  }
}

// Process outbox files
async function processOutbox(token: string, notified: Record<string, any>): Promise<void> {
  if (!fs.existsSync(OUTBOX_DIR)) {
    return;
  }

  const files = fs.readdirSync(OUTBOX_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const taskId = path.basename(file, '.json');
    
    // Skip if already notified
    if (notified[taskId]) {
      continue;
    }

    try {
      const outboxData = JSON.parse(fs.readFileSync(path.join(OUTBOX_DIR, file), 'utf-8'));
      
      // Validate notification against shared contract
      const validation = validateNotification(outboxData);
      if (!validation.valid) {
        console.error(`[Notification] Validation failed for ${file}: ${validation.error}`);
        moveToFailedQueue(file, validation.error || 'Validation failed');
        continue;
      }

      const payload: TaskNotificationPayload = outboxData.payload || {
        taskId: outboxData.taskId,
        contentType: outboxData.contentType || 'unknown',
        executionMode: outboxData.executionMode || 'unknown',
        targetEnvironment: outboxData.targetEnvironment || 'unknown',
        status: outboxData.status || 'unknown',
      };

      // Extract chatId from job data or use default
      const chatId = outboxData.chatId || '8602323654';
      
      // Build notification message using shared contract
      const message = getNotificationMessage(outboxData.type, payload);

      // Send notification
      await sendTelegramMessage(token, chatId, message);
      
      // Mark as notified
      notified[taskId] = {
        notifiedAt: new Date().toISOString(),
        notificationType: outboxData.type,
        backendContentId: payload.contentId,
        attemptCount: 1,
        status: NOTIFICATION_STATUS.SENT,
      };
      
      console.log(`[Notification] Sent for task: ${taskId}`);
      
    } catch (error: any) {
      console.error(`[Notification] Failed for ${file}:`, error.message);
      moveToFailedQueue(file, error.message);
    }
  }
  
  saveNotifiedTasks(notified);
}

// Main loop
async function main() {
  const token = readBotToken();
  if (!token) {
    console.error('[Notification Dispatcher] Bot token not found in Keychain');
    process.exit(1);
  }

  console.log('[Notification Dispatcher] Started');
  console.log('[Notification Dispatcher] Watching:', OUTBOX_DIR);
  console.log('[Notification Dispatcher] Using shared Notification Contract');

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
