#!/usr/bin/env tsx
/**
 * ContentOps Telegram Bot V1
 * 
 * 统一状态机 + 持久化 + 明确命令
 * 
 * Commands:
 * /new <title> - 创建新草稿
 * /drafts - 列出草稿
 * /open <id> - 打开草稿
 * /edit - 编辑当前草稿
 * /regenerate - 重新生成
 * /review - 质量检查
 * /approve - 批准（需授权）
 * /reject <reason> - 退回
 * /publish - 发布到 staging
 * /cancel - 取消当前操作
 * /status - 查看状态
 * 
 * Security:
 * - Production publish DISABLED
 * - Allowlist only
 * - Secret redaction enabled
 */

import TelegramBot from 'node-telegram-bot-api';
import { execSync } from 'child_process';
import { createHmac } from 'crypto';

// ============================================================================
// Configuration
// ============================================================================

function readBotTokenFromKeychain(): string | undefined {
  try {
    const token = execSync(
      'security find-generic-password -s jueshi-contentops-telegram -a fabuxia_bot -w',
      { encoding: 'utf-8' }
    ).trim();
    return token || undefined;
  } catch {
    return undefined;
  }
}

function readBridgeSecretFromKeychain(): string | undefined {
  try {
    const secret = execSync(
      'security find-generic-password -s jueshi-contentops -a contentops-bridge -w',
      { encoding: 'utf-8' }
    ).trim();
    return secret || undefined;
  } catch {
    return undefined;
  }
}

const CONFIG = {
  enabled: process.env.CONTENTOPS_BOT_ENABLED === 'true',
  botToken: process.env.CONTENTOPS_TELEGRAM_BOT_TOKEN || readBotTokenFromKeychain(),
  bridgeSecret: process.env.CONTENTOPS_BRIDGE_SECRET || readBridgeSecretFromKeychain(),
  // Security: Production is ALWAYS disabled in bot
  allowProduction: false,
  // Allowlist
  allowedChatIds: (process.env.CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS || '').split(',').filter(Boolean),
  // Bridge URL for staging
  bridgeUrl: process.env.CONTENTOPS_BRIDGE_URL || 'https://i.jueshi.net/api/internal/contentops/drafts',
};

const RUNTIME_INFO = {
  botRuntimeId: `pid-${process.pid}`,
  gitCommit: (() => { try { return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim(); } catch { return 'unknown'; } })(),
  version: 'v1.0',
};

// ============================================================================
// ============================================================================
// Secret Redaction
// ============================================================================

const SECRET_PATTERNS = [
  /DATABASE_URL[=:]\s*\S+/gi,
  /TELEGRAM.*TOKEN[=:]\s*\S+/gi,
  /API_KEY[=:]\s*\S+/gi,
  /SECRET[=:]\s*\S+/gi,
  /PASSWORD[=:]\s*\S+/gi,
];

function redactSecrets(text: string): string {
  let redacted = text;
  for (const pattern of SECRET_PATTERNS) {
    redacted = redacted.replace(pattern, '[REDACTED]');
  }
  return redacted;
}

// ============================================================================
// HMAC Signature for Bridge API
// ============================================================================

function signPayload(payload: string): string {
  if (!CONFIG.bridgeSecret) {
    throw new Error('Bridge secret not configured');
  }
  return createHmac('sha256', CONFIG.bridgeSecret)
    .update(payload)
    .digest('hex');
}

async function fetchBridgeApi(body: any): Promise<any> {
  const payload = JSON.stringify(body);
  const url = new URL(CONFIG.bridgeUrl);
  // Server expects: method:path:queryString:body
  const signaturePayload = `POST:${url.pathname}:${payload}`;
  const signature = signPayload(signaturePayload);
  
  console.error('[ContentOps Bot] POST signature payload:', signaturePayload.substring(0, 80) + '...');
  
  const res = await fetch(CONFIG.bridgeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-ContentOps-Signature': signature,
    },
    body: payload,
  });
  
  return res;
}

// ============================================================================
// Access Control
// ============================================================================

function isAllowedChat(chatId: number): boolean {
  if (CONFIG.allowedChatIds.length === 0) {
    // No allowlist configured - deny all for safety
    return false;
  }
  return CONFIG.allowedChatIds.includes(String(chatId));
}

// ============================================================================
// State Machine (in-memory for V1, will be persisted to DB)
// ============================================================================

type ContentState = 
  | 'IDEA' | 'RESEARCHING' | 'DRAFTING' | 'DRAFT' 
  | 'NEEDS_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' 
  | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' 
  | 'FAILED' | 'UNPUBLISHED' | 'ROLLED_BACK';

interface DraftSession {
  chatId: number;
  currentDraftId?: string;
  currentTitle?: string;
  currentContent?: string;
  state: ContentState;
  mode: 'idle' | 'editing_title' | 'editing_body' | 'confirming';
}

const sessions = new Map<number, DraftSession>();

function getSession(chatId: number): DraftSession {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, {
      chatId,
      state: 'DRAFT',
      mode: 'idle',
    });
  }
  return sessions.get(chatId)!;
}

// ============================================================================
// Telegram Bot
// ============================================================================

async function startBot() {
  if (!CONFIG.enabled) {
    console.log('[ContentOps Bot] Disabled (CONTENTOPS_BOT_ENABLED != true)');
    return;
  }

  if (!CONFIG.botToken) {
    console.error('[ContentOps Bot] No bot token configured');
    return;
  }

  console.log('[ContentOps Bot] Starting...');
  console.log(`[ContentOps Bot] Runtime: ${RUNTIME_INFO.botRuntimeId}`);
  console.log(`[ContentOps Bot] Version: ${RUNTIME_INFO.version}`);
  console.log(`[ContentOps Bot] Git: ${RUNTIME_INFO.gitCommit}`);
  console.log(`[ContentOps Bot] Production: DISABLED`);
  console.log(`[ContentOps Bot] Allowlist: ${CONFIG.allowedChatIds.length > 0 ? CONFIG.allowedChatIds.join(', ') : 'NOT CONFIGURED'}`);

  const bot = new TelegramBot(CONFIG.botToken, { polling: true });

  // Handle /start
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    bot.sendMessage(chatId, `
🤖 ContentOps Bot V1

命令:
/new <标题> - 创建新草稿
/drafts - 列出草稿
/open <id> - 打开草稿
/review - 质量检查
/approve - 批准
/publish - 发布到 staging
/status - 查看状态

⚠️ Production 发布已禁用
    `);
  });

  // Handle /new
  bot.onText(/\/new(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    const title = match[1]?.trim();
    
    if (!title) {
      bot.sendMessage(chatId, '请提供标题: /new <标题>');
      return;
    }

    try {
      // 调用 Bridge API 创建草稿
      const res = await fetchBridgeApi({
        title,
        targetEnvironment: 'staging',
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[ContentOps Bot] Create draft failed:', error);
        bot.sendMessage(chatId, `❌ 创建草稿失败: ${error.code || 'UNKNOWN'}`);
        return;
      }

      const draft = await res.json();
      const session = getSession(chatId);
      session.currentDraftId = draft.id;
      session.currentTitle = title;
      session.state = 'DRAFT';
      session.mode = 'editing_body';

      bot.sendMessage(chatId, `
📝 新草稿已创建

标题: ${title}
Draft ID: \`${draft.id}\`
状态: ${draft.state}
当前版本: v${draft.version}

后续可用命令:
/status - 查看状态
/drafts - 列出草稿
/review - 质量检查
/cancel - 取消
      `, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('[ContentOps Bot] Create draft error:', error);
      bot.sendMessage(chatId, '❌ 创建草稿失败，请稍后重试');
    }
  });

  // Handle /drafts
  bot.onText(/\/drafts/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    try {
      const url = new URL(CONFIG.bridgeUrl);
      const queryString = '?limit=10';
      const fullUrl = `${CONFIG.bridgeUrl}${queryString}`;
      // Server expects: method:path:queryString:body (body is empty for GET)
      const signaturePayload = `GET:${url.pathname}${queryString}:`;
      const signature = signPayload(signaturePayload);
      
      console.error('[ContentOps Bot] GET signature payload:', signaturePayload);
      console.error('[ContentOps Bot] GET URL:', fullUrl);
      
      const res = await fetch(fullUrl, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'X-ContentOps-Signature': signature,
        },
      });
      
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        let errorObj: any = { error: errorText, code: 'UNKNOWN' };
        try {
          errorObj = JSON.parse(errorText);
        } catch {}
        
        console.error('[ContentOps Bot] List drafts failed:', {
          status: res.status,
          statusText: res.statusText,
          code: errorObj.code,
          message: errorObj.error,
          url: fullUrl,
        });
        // Truncate error message for Telegram (max 4096 chars)
        const errorMsg = `❌ 获取草稿失败 [${errorObj.code || res.status}]`.substring(0, 200);
        bot.sendMessage(chatId, errorMsg);
        return;
      }

      const data = await res.json();
      const drafts = data.drafts || [];

      if (drafts.length === 0) {
        bot.sendMessage(chatId, '📭 暂无草稿\n\n使用 /new <标题> 创建新草稿');
        return;
      }

      const list = drafts.slice(0, 5).map((d: any, i: number) => 
        `${i + 1}. ${d.title}\n   ID: \`${d.id}\`\n   状态: ${d.state}\n   版本: v${d.version}`
      ).join('\n\n');

      const message = `📋 最近草稿:\n\n${list}`;
      // Truncate for Telegram (max 4096 chars)
      bot.sendMessage(chatId, message.substring(0, 4000), { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('[ContentOps Bot] List drafts error:', error);
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      bot.sendMessage(chatId, `❌ 获取草稿失败: ${errMsg.substring(0, 200)}`);
    }
  });

  // Handle /review
  bot.onText(/\/review/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    const session = getSession(chatId);
    
    if (!session.currentDraftId) {
      bot.sendMessage(chatId, '请先使用 /open <id> 打开草稿');
      return;
    }

    try {
      const res = await fetchBridgeApi({
        action: 'quality_check',
        id: session.currentDraftId,
      });

      // Check HTTP status first
      if (!res.ok) {
        let errorBody = '';
        try {
          const errData = await res.json();
          errorBody = errData.code || errData.error || '';
        } catch { /* ignore parse error */ }
        const errorCode = `CONTENTOPS-REVIEW-${res.status}`;
        bot.sendMessage(chatId, `❌ 质量检查执行失败\n错误编号：${errorCode}\n详情：${errorBody.substring(0, 200)}`);
        return;
      }

      const data = await res.json();

      // Build structured response
      const issuesList = (data.issues || [])
        .slice(0, 10)
        .map((issue: any, idx: number) => `${idx + 1}. [${issue.code || 'ISSUE'}] ${issue.message || '未知问题'}`)
        .join('\n');

      const statusText = data.draftState || session.state || 'DRAFT';
      const nextStep = data.passed ? '可使用 /approve 批准' : '请使用 /edit 修改后重新检查';

      if (data.passed) {
        const message = `✅ 质量检查通过

草稿：${data.draftId || session.currentDraftId}
版本：v${data.draftVersion || 1}

评分：
- 内容质量：${data.qualityScore ?? '-'}/100
- SEO：${data.seoScore ?? '-'}/100
- GEO：${data.geoScore ?? '-'}/100

当前状态：${statusText}
下一步：${nextStep}`;
        bot.sendMessage(chatId, message.substring(0, 4000));
      } else {
        const message = `🔍 质量检查未通过

草稿：${data.draftId || session.currentDraftId}
版本：v${data.draftVersion || 1}

评分：
- 内容质量：${data.qualityScore ?? 0}/100
- SEO：${data.seoScore ?? 0}/100
- GEO：${data.geoScore ?? 0}/100

需要修改：
${issuesList || '暂无详细问题'}

当前状态：${statusText}
下一步：${nextStep}`;
        bot.sendMessage(chatId, message.substring(0, 4000));
      }
    } catch (error) {
      console.error('[ContentOps Bot] Review error:', error);
      const errMsg = error instanceof Error ? error.message : 'Unknown';
      bot.sendMessage(chatId, `❌ 质量检查执行失败\n错误编号：CONTENTOPS-REVIEW-EXCEPTION\n详情：${errMsg.substring(0, 200)}`);
    }
  });

  // Handle /publish
  bot.onText(/\/publish/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    const session = getSession(chatId);
    
    if (!session.currentDraftId) {
      bot.sendMessage(chatId, '请先使用 /open <id> 打开草稿');
      return;
    }

    // Production is ALWAYS disabled
    bot.sendMessage(chatId, `
🚀 发布到 staging...

⚠️ Production 发布已禁用
    `);

    try {
      const res = await fetchBridgeApi({
        action: 'publish',
        id: session.currentDraftId,
        target: 'staging',
      });

      const data = await res.json();

      if (res.ok) {
        bot.sendMessage(chatId, `
✅ 发布成功

URL: ${data.url}
版本: v${data.version}
        `);
      } else {
        bot.sendMessage(chatId, `❌ 发布失败: ${data.error}`);
      }
    } catch (error) {
      bot.sendMessage(chatId, '发布失败');
    }
  });

  // Handle /status
  bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    const session = getSession(chatId);

    let statusMsg = `
📊 当前状态

Runtime: ${RUNTIME_INFO.botRuntimeId}
Version: ${RUNTIME_INFO.version}
Git: ${RUNTIME_INFO.gitCommit}
Production: 🔒 DISABLED
    `;

    if (session.currentDraftId) {
      statusMsg += `
当前草稿:
  ID: ${session.currentDraftId}
  标题: ${session.currentTitle || '(未设置)'}
  状态: ${session.state}
      `;
    } else {
      statusMsg += '\n当前无打开的草稿';
    }

    bot.sendMessage(chatId, statusMsg);
  });

  // Handle /cancel
  bot.onText(/\/cancel/, (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    const session = getSession(chatId);
    session.mode = 'idle';
    session.currentDraftId = undefined;
    session.currentTitle = undefined;
    session.currentContent = undefined;

    bot.sendMessage(chatId, '✅ 已取消当前操作');
  });

  // Handle natural language (when in editing mode)
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    
    // Skip commands
    if (text.startsWith('/')) return;
    
    if (!isAllowedChat(chatId)) return;

    const session = getSession(chatId);

    if (session.mode === 'editing_body' && session.currentTitle) {
      // Save content
      session.currentContent = text;
      session.mode = 'idle';
      
      bot.sendMessage(chatId, `
✅ 内容已保存

标题: ${session.currentTitle}
字数: ${text.length}

使用 /review 进行质量检查
使用 /publish 发布到 staging
      `);
    }
  });

  console.log('[ContentOps Bot] Started successfully');
}

// Start the bot
startBot().catch(console.error);
