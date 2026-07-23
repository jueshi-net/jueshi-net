#!/usr/bin/env node
/**
 * ContentOps Notification Dispatcher
 * 
 * Watches outbox directory and sends terminal Telegram notifications
 * when tasks complete.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const HOME_DIR = require('os').homedir();
const OUTBOX_DIR = path.join(HOME_DIR, '.jueshi-contentops/jobs/outbox');
const NOTIFIED_FILE = path.join(HOME_DIR, '.jueshi-contentops/jobs/notified.json');

// Read Bot Token from Keychain
function readBotToken() {
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
function loadNotifiedTasks() {
  try {
    if (fs.existsSync(NOTIFIED_FILE)) {
      return JSON.parse(fs.readFileSync(NOTIFIED_FILE, 'utf-8'));
    }
  } catch {}
  return {};
}

// Save notified task IDs
function saveNotifiedTasks(notified) {
  fs.writeFileSync(NOTIFIED_FILE, JSON.stringify(notified, null, 2));
}

// Send Telegram message
function sendTelegramMessage(token, chatId, text) {
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

// Process outbox files
async function processOutbox(token, notified) {
  if (!fs.existsSync(OUTBOX_DIR)) {
    return;
  }

  const files = fs.readdirSync(OUTBOX_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const fileTaskId = path.basename(file, '.json');
    
    try {
      const outboxData = JSON.parse(fs.readFileSync(path.join(OUTBOX_DIR, file), 'utf-8'));
      
      // Use notificationId for idempotency (new schema) or fall back to taskId (old schema)
      const notificationId = outboxData.notificationId || `terminal:${fileTaskId}:completed`;
      const taskId = outboxData.jobId || fileTaskId;
      
      // Skip if already notified (idempotent)
      if (notified[notificationId]) {
        continue;
      }
      
      // Parse content — handle both new schema (content as JSON string) and old schema
      let content;
      try {
        content = typeof outboxData.content === 'string' ? JSON.parse(outboxData.content) : outboxData.content;
      } catch {
        content = { contentType: outboxData.contentType || 'unknown', title: 'Untitled' };
      }
      
      if (!content) {
        content = { contentType: outboxData.contentType || 'unknown', title: 'Untitled' };
      }
      
      // Extract chatId
      const chatId = outboxData.chatId || '8602323654';
      const backendContentId = outboxData.backendContentId || outboxData.draftId || 'N/A';
      const executionMode = outboxData.executionMode || content.executionMode || 'review_required';
      
      // Determine status text based on executionMode
      let statusText;
      let statusEmoji;
      switch (executionMode) {
        case 'publish_now':
          statusText = '已发布';
          statusEmoji = '🚀';
          break;
        case 'draft_only':
          statusText = '已保存为草稿';
          statusEmoji = '📝';
          break;
        case 'review_required':
        default:
          statusText = '等待人工审核';
          statusEmoji = '✅';
          break;
      }
      
      // Content type display name
      const contentTypeName = {
        'guide': '操作指南',
        'checklist': '检查清单',
        'topic': '专题',
        'tool': '工具',
      }[content.contentType] || content.contentType || '内容';
      
      // Build notification message
      const message = `${statusEmoji} 任务处理完成

内容类型：${contentTypeName}
标题：${content.title || 'N/A'}
任务 ID：${taskId}
后台内容 ID：${backendContentId}
当前状态：${statusText}
公开状态：${executionMode === 'publish_now' ? '已发布' : '未发布'}
后台入口：https://i.jueshi.net/admin/content-ops`;

      // Send notification
      await sendTelegramMessage(token, chatId, message);
      
      // Mark as notified using notificationId for idempotency
      notified[notificationId] = {
        notifiedAt: new Date().toISOString(),
        taskId: taskId,
        backendContentId: backendContentId,
        executionMode: executionMode,
      };
      
      console.log(`[Notification] Sent: ${notificationId} for task: ${taskId}`);
      
    } catch (error) {
      console.error(`[Notification] Failed for ${file}:`, error.message);
      // Don't mark as notified — will retry on next cycle
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
