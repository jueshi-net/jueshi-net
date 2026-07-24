#!/usr/bin/env tsx
/**
 * ContentOps Bridge Local Helper
 * 
 * 只在 staging 服务器运行
 * 从 staging 安全环境读取 Secret
 * 调用 http://127.0.0.1:3001
 * 自动计算 HMAC
 * 从 stdin 读取 JSON
 * 将 JSON 原样作为 rawBody 参与签名和发送
 * 只允许预定义 ContentOps actions
 * 
 * 使用方式：
 * echo '{"action":"list_tasks"}' | tsx scripts/contentops/bridge-local-helper.ts
 */

import { createHmac } from 'crypto';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

const BRIDGE_SECRET=proces...RET;
const BRIDGE_URL = 'http://127.0.0.1:3001';
const ENDPOINT = '/api/internal/contentops/drafts';

// 允许的 action 白名单
const ALLOWED_ACTIONS = [
  'create_task',
  'resume_task',
  'list_tasks',
  'get_task',
  'update_task',
  'cancel_task',
  'list_schedules',
  'create_schedule',
  'get_schedule',
  'cancel_schedule',
  'process_due_schedules',
  'create_backend_draft',
  'publish_staging',
  'quality_check',
  'submit_for_review',
  'approve',
  'reject',
  'publish',
  'generate',
  'generation_jobs',
  'generation_job_status',
  'audit_contentops_task',
  'update_content_status',
  'update_task_metadata',
  'auto_revise_checklist',
];

function computeSignature(method: string, path: string, body: string): string {
  if (!BRIDGE_SECRET) {
    throw new Error('CONTENTOPS_BRIDGE_SECRET not configured');
  }
  const payload = `${method.toUpperCase()}:${path}:${body}`;
  return createHmac('sha256', BRIDGE_SECRET)
    .update(payload)
    .digest('hex');
}

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
    
    // 超时 10 秒
    setTimeout(() => {
      if (data === '') {
        resolve('{}');
      }
    }, 10000);
  });
}

async function main() {
  // 检查 Secret 配置
  if (!BRIDGE_SECRET) {
    console.error('Error: CONTENTOPS_BRIDGE_SECRET not configured');
    process.exit(2);
  }

  // 读取 stdin JSON
  const input = await readStdin();
  
  let data: any;
  try {
    data = JSON.parse(input);
  } catch (error) {
    console.error('Error: Invalid JSON input');
    process.exit(3);
  }

  // 验证 action
  const action = data.action;
  if (action && !ALLOWED_ACTIONS.includes(action)) {
    console.error(`Error: Action "${action}" not allowed`);
    console.error(`Allowed actions: ${ALLOWED_ACTIONS.join(', ')}`);
    process.exit(4);
  }

  // 禁止 Production target
  if (data.targetEnvironment === 'production') {
    console.error('Error: Production target not allowed');
    process.exit(5);
  }

  // 确定 HTTP 方法
  const method = input === '{}' || input === '' ? 'GET' : 'POST';
  const body = method === 'GET' ? '' : input;

  // 计算签名
  const signature = computeSignature(method, ENDPOINT, body);

  // 发送请求
  const url = `${BRIDGE_URL}${ENDPOINT}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-ContentOps-Signature': signature,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      method,
      headers,
      body: method === 'GET' ? undefined : body,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const result = await response.text();
    
    // 包装响应为统一格式
    let responseBody: any;
    try {
      responseBody = JSON.parse(result);
    } catch (error) {
      responseBody = { error: 'Invalid JSON response from Bridge' };
    }
    
    const wrappedResponse = {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      data: response.status >= 200 && response.status < 300 ? responseBody : undefined,
      error: response.status >= 400 ? {
        code: `HTTP_${response.status}`,
        message: responseBody.error || responseBody.message || 'Request failed'
      } : undefined
    };
    
    // 只输出纯 JSON 到 stdout，所有日志到 stderr
    process.stdout.write(JSON.stringify(wrappedResponse) + '\n');
    
    // 退出码反映 HTTP 状态
    if (response.status >= 200 && response.status < 300) {
      process.exit(0);
    } else if (response.status === 401) {
      process.exit(10);
    } else if (response.status === 404) {
      process.exit(11);
    } else if (response.status >= 400 && response.status < 500) {
      process.exit(12);
    } else {
      process.exit(13);
    }
  } catch (error) {
    console.error('Error: Request failed');
    console.error(error);
    
    // 输出错误 JSON 到 stdout
    const errorResponse = {
      ok: false,
      status: 500,
      error: {
        code: 'CONTENTOPS_HELPER_ERROR',
        message: 'Request to Bridge failed'
      }
    };
    process.stdout.write(JSON.stringify(errorResponse) + '\n');
    process.exit(14);
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
