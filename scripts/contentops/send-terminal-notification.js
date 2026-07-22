#!/usr/bin/env node
/**
 * Send terminal Telegram notification for completed guide task
 */

const https = require('https');

// Read Bot Token from Keychain
const BOT_TOKEN = require('child_process').execSync(
  'security find-generic-password -s jueshi-contentops-telegram -a fabuxia_bot -w',
  { encoding: 'utf-8' }
).trim();
const CHAT_ID='8602323654'; // User's Telegram chat ID from memory

const message = `✅ 任务处理完成

内容类型：操作指南
标题：第一次用国际集运？超详细新手避坑指南
任务 ID：task_1784645450775_1agn2d
后台内容 ID：draft_1784650550677_m2g9l8
内容长度：2318 字符
质量检查：通过
当前状态：等待人工审核
后台入口：https://i.jueshi.net/admin/contentops`;

function sendTelegramMessage() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/sendMessage`,
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
        console.log('[Telegram] Response status:', res.statusCode);
        console.log('[Telegram] Response:', data.substring(0, 300));
        try {
          const result = JSON.parse(data);
          if (result.ok) {
            console.log('[Telegram] Message sent successfully');
            console.log('[Telegram] Message ID:', result.result.message_id);
            resolve(result);
          } else {
            console.error('[Telegram] Failed:', result.description);
            reject(new Error(result.description));
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

sendTelegramMessage()
  .then(() => {
    console.log('[Telegram] Terminal notification sent');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Telegram] Failed to send:', error.message);
    process.exit(1);
  });
