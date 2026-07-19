#!/usr/bin/env tsx
/**
 * ContentOps Telegram Bot V1.1
 * 
 * 统一状态机 + 持久化 + 明确命令
 * 
 * Commands (FROZEN protocol):
 * /new <title> - 创建新草稿
 * /drafts - 列出草稿
 * /open <draftId> - 打开草稿
 * /status - 查看状态
 * /review [draftId] - 质量检查
 * /edit [draftId] - 编辑草稿
 * /approve [draftId] - 批准
 * /publish [draftId] - 发布到 staging
 * /cancel - 取消当前操作
 * 
 * Security:
 * - Production publish DISABLED
 * - Allowlist only
 * - Secret redaction enabled
 */

import TelegramBot from 'node-telegram-bot-api';
import { execSync } from 'child_process';
import { createHmac } from 'crypto';
import { getSession, updateSession, clearSession } from './session-store';

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
  version: 'v1.1',
};

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

async function fetchBridgeGet(queryString: string): Promise<any> {
  const url = new URL(CONFIG.bridgeUrl);
  const fullUrl = `${CONFIG.bridgeUrl}${queryString}`;
  // Server expects: method:path:queryString:body (body is empty for GET)
  const signaturePayload = `GET:${url.pathname}${queryString}:`;
  const signature = signPayload(signaturePayload);
  
  console.error('[ContentOps Bot] GET URL:', fullUrl);
  
  const res = await fetch(fullUrl, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'X-ContentOps-Signature': signature,
    },
  });
  
  return res;
}

async function fetchBridgePut(queryString: string, body: any): Promise<any> {
  const payload = JSON.stringify(body);
  const url = new URL(CONFIG.bridgeUrl);
  const fullUrl = `${CONFIG.bridgeUrl}${queryString}`;
  // Server expects: method:path:queryString:body
  const signaturePayload = `PUT:${url.pathname}${queryString}:${payload}`;
  const signature = signPayload(signaturePayload);
  
  console.error('[ContentOps Bot] PUT URL:', fullUrl);
  
  const res = await fetch(fullUrl, {
    method: 'PUT',
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
// Helper: resolve draftId from argument or session
// ============================================================================

function resolveDraftId(chatId: number, explicitId?: string): { draftId: string | null; error?: string } {
  if (explicitId && explicitId.trim()) {
    return { draftId: explicitId.trim() };
  }
  const session = getSession(chatId);
  if (session.currentDraftId) {
    return { draftId: session.currentDraftId };
  }
  return { draftId: null, error: '请先使用 /open <id> 打开草稿，或提供 Draft ID' };
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
🤖 ContentOps Bot V1.1

命令:
/new <标题> - 创建新草稿
/drafts - 列出草稿
/open <id> - 打开草稿
/status - 查看状态
/review [id] - 质量检查
/edit [id] - 编辑草稿
/approve [id] - 批准
/publish [id] - 发布到 staging
/cancel - 取消当前操作

⚠️ Production 发布已禁用
    `.substring(0, 4000));
  });

  // Handle /new
  bot.onText(/\/new(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    if (!match) return;
    const title = match[1]?.trim();
    
    if (!title) {
      bot.sendMessage(chatId, '请提供标题: /new <标题>');
      return;
    }

    try {
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
      // Persist currentDraftId
      updateSession(chatId, { currentDraftId: draft.id, currentTitle: title });

      const message = `📝 新草稿已创建

标题: ${title}
Draft ID: \`${draft.id}\`
状态: ${draft.state}
当前版本: v${draft.version}

后续可用命令:
/status - 查看状态
/drafts - 列出草稿
/review - 质量检查
/cancel - 取消`;
      bot.sendMessage(chatId, message.substring(0, 4000), { parse_mode: 'Markdown' });
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
      const res = await fetchBridgeGet('?limit=10');
      
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        let errorObj: any = { error: errorText, code: 'UNKNOWN' };
        try { errorObj = JSON.parse(errorText); } catch {}
        
        console.error('[ContentOps Bot] List drafts failed:', {
          status: res.status,
          code: errorObj.code,
        });
        bot.sendMessage(chatId, `❌ 获取草稿失败 [${errorObj.code || res.status}]`.substring(0, 200));
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
      bot.sendMessage(chatId, message.substring(0, 4000), { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('[ContentOps Bot] List drafts error:', error);
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      bot.sendMessage(chatId, `❌ 获取草稿失败: ${errMsg.substring(0, 200)}`);
    }
  });

  // Handle /open <draftId>
  bot.onText(/\/open(?:@\w+)?\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    if (!match) return;
    const draftId = match![1]?.trim();
    
    if (!draftId) {
      bot.sendMessage(chatId, '请提供 Draft ID: /open <draftId>');
      return;
    }

    try {
      // Fetch draft from Bridge API
      const res = await fetchBridgeGet(`?id=${encodeURIComponent(draftId)}`);
      
      if (!res.ok) {
        let errorObj: any = { code: 'UNKNOWN', error: 'Unknown error' };
        try { errorObj = await res.json(); } catch {}
        
        console.error('[ContentOps Bot] Open draft failed:', {
          status: res.status,
          code: errorObj.code,
          draftId,
        });
        
        const errorCode = `CONTENTOPS-OPEN-${res.status}`;
        const reason = errorObj.code === 'DRAFT_NOT_FOUND' ? '草稿不存在' : 
                       errorObj.code === 'INVALID_SIGNATURE' ? '签名验证失败' :
                       errorObj.error || '未知错误';
        bot.sendMessage(chatId, `❌ 无法打开草稿\n错误编号：${errorCode}\n原因：${reason}`.substring(0, 4000));
        return;
      }

      const draft = await res.json();
      
      // Persist currentDraftId
      updateSession(chatId, { currentDraftId: draft.id, currentTitle: draft.title });
      
      console.error('[ContentOps Bot] Opened draft:', { draftId: draft.id, chatId });

      const message = `✅ 已打开草稿

标题：${draft.title}
Draft ID：\`${draft.id}\`
状态：${draft.state}
版本：v${draft.version}

下一步：
/status - 查看状态
/review - 质量检查
/edit - 编辑草稿`;
      bot.sendMessage(chatId, message.substring(0, 4000), { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('[ContentOps Bot] Open draft error:', error);
      const errMsg = error instanceof Error ? error.message : 'Unknown';
      bot.sendMessage(chatId, `❌ 无法打开草稿\n错误编号：CONTENTOPS-OPEN-EXCEPTION\n原因：${errMsg.substring(0, 200)}`.substring(0, 4000));
    }
  });

  // Handle /open without argument
  bot.onText(/\/open(?:@\w+)?\s*$/, (msg) => {
    const chatId = msg.chat.id;
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }
    bot.sendMessage(chatId, '请提供 Draft ID: /open <draftId>\n\n使用 /drafts 查看可用草稿');
  });

  // Handle /edit [draftId]
  bot.onText(/\/edit(?:@\w+)?(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    if (!match) return;
    const explicitId = match[1]?.trim();
    const { draftId, error } = resolveDraftId(chatId, explicitId);
    
    if (!draftId) {
      bot.sendMessage(chatId, error || '请先使用 /open <id> 打开草稿，或 /edit <draftId>');
      return;
    }

    try {
      // Fetch draft to confirm it exists and get current version
      const res = await fetchBridgeGet(`?id=${encodeURIComponent(draftId)}`);
      
      if (!res.ok) {
        let errorObj: any = { code: 'UNKNOWN', error: 'Unknown error' };
        try { errorObj = await res.json(); } catch {}
        
        const errorCode = `CONTENTOPS-EDIT-${res.status}`;
        const reason = errorObj.code === 'DRAFT_NOT_FOUND' ? '草稿不存在' : 
                       errorObj.error || '未知错误';
        bot.sendMessage(chatId, `❌ 无法进入编辑模式\n错误编号：${errorCode}\n原因：${reason}`.substring(0, 4000));
        return;
      }

      const draft = await res.json();
      
      // Set editing mode
      updateSession(chatId, { 
        mode: 'EDITING', 
        editingDraftId: draftId,
        currentDraftId: draftId,
        currentTitle: draft.title,
      });
      
      console.error('[ContentOps Bot] Edit mode entered:', { draftId, chatId, version: draft.version });

      const message = `✏️ 已进入编辑模式

标题：${draft.title}
Draft ID：\`${draft.id}\`
当前版本：v${draft.version}

请发送新的完整正文。
/cancel - 退出编辑`;
      bot.sendMessage(chatId, message.substring(0, 4000), { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('[ContentOps Bot] Edit error:', error);
      const errMsg = error instanceof Error ? error.message : 'Unknown';
      bot.sendMessage(chatId, `❌ 无法进入编辑模式\n错误编号：CONTENTOPS-EDIT-EXCEPTION\n原因：${errMsg.substring(0, 200)}`.substring(0, 4000));
    }
  });

  // Handle /review [draftId]
  bot.onText(/\/review(?:@\w+)?(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    const explicitId = match![1]?.trim();
    const { draftId, error } = resolveDraftId(chatId, explicitId);
    
    if (!draftId) {
      bot.sendMessage(chatId, error || '请先使用 /open <id> 打开草稿，或 /review <draftId>');
      return;
    }

    try {
      const res = await fetchBridgeApi({
        action: 'quality_check',
        id: draftId,
      });

      // Check HTTP status first
      if (!res.ok) {
        let errorBody = '';
        try {
          const errData = await res.json();
          errorBody = errData.code || errData.error || '';
        } catch { /* ignore parse error */ }
        const errorCode = `CONTENTOPS-REVIEW-${res.status}`;
        bot.sendMessage(chatId, `❌ 质量检查执行失败\n错误编号：${errorCode}\n详情：${errorBody.substring(0, 200)}`.substring(0, 4000));
        return;
      }

      const data = await res.json();

      // Build structured response
      const issuesList = (data.issues || [])
        .slice(0, 10)
        .map((issue: any, idx: number) => `${idx + 1}. [${issue.code || 'ISSUE'}] ${issue.message || '未知问题'}`)
        .join('\n');

      const statusText = data.draftState || 'DRAFT';
      const nextStep = data.passed ? '可使用 /approve 批准' : '请使用 /edit 修改后重新检查';

      if (data.passed) {
        const message = `✅ 质量检查通过

草稿：${data.draftId || draftId}
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

草稿：${data.draftId || draftId}
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
      bot.sendMessage(chatId, `❌ 质量检查执行失败\n错误编号：CONTENTOPS-REVIEW-EXCEPTION\n详情：${errMsg.substring(0, 200)}`.substring(0, 4000));
    }
  });

  // Handle /publish [draftId]
  bot.onText(/\/publish(?:@\w+)?(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    const explicitId = match![1]?.trim();
    const { draftId, error } = resolveDraftId(chatId, explicitId);
    
    if (!draftId) {
      bot.sendMessage(chatId, error || '请先使用 /open <id> 打开草稿，或 /publish <draftId>');
      return;
    }

    // Production is ALWAYS disabled
    bot.sendMessage(chatId, `
🚀 发布到 staging...

⚠️ Production 发布已禁用

草稿：${draftId}
目标：staging only
    `.substring(0, 4000));
  });

  // Handle /status
  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    const session = getSession(chatId);

    let statusMsg = `📊 当前状态

Runtime: ${RUNTIME_INFO.botRuntimeId}
Version: ${RUNTIME_INFO.version}
Git: ${RUNTIME_INFO.gitCommit}
Production: 🔒 DISABLED`;

    if (session.currentDraftId) {
      statusMsg += `

当前草稿:
  ID: ${session.currentDraftId}
  标题: ${session.currentTitle || '(未设置)'}`;
      
      // Fetch latest state from server
      try {
        const res = await fetchBridgeGet(`?id=${encodeURIComponent(session.currentDraftId)}`);
        if (res.ok) {
          const draft = await res.json();
          statusMsg += `
  状态: ${draft.state}
  版本: v${draft.version}`;
        } else {
          statusMsg += '\n  (无法获取最新状态)';
        }
      } catch {
        statusMsg += '\n  (无法获取最新状态)';
      }
    } else {
      statusMsg += '\n\n当前无打开的草稿';
    }

    bot.sendMessage(chatId, statusMsg.substring(0, 4000));
  });

  // Handle /cancel
  bot.onText(/\/cancel/, (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    const session = getSession(chatId);
    
    if (session.mode === 'EDITING') {
      // Just exit editing mode, keep currentDraftId
      updateSession(chatId, { 
        mode: 'IDLE',
        editingDraftId: undefined,
      });
      bot.sendMessage(chatId, '✅ 已退出编辑模式（草稿未修改，指针保留）');
    } else {
      // Clear everything
      clearSession(chatId);
      bot.sendMessage(chatId, '✅ 已取消当前操作（草稿指针已清除，草稿本身未删除）');
    }
  });

  // Handle natural language (when in editing mode)
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    
    // Skip commands
    if (text.startsWith('/')) return;
    
    if (!isAllowedChat(chatId)) return;

    const session = getSession(chatId);

    // Only process text if in EDITING mode
    if (session.mode !== 'EDITING' || !session.editingDraftId) {
      return;
    }

    const draftId = session.editingDraftId;
    const previousVersion = session.currentTitle ? undefined : undefined; // We'll get this from server

    try {
      // Update draft body via PUT
      const res = await fetchBridgePut(
        `?id=${encodeURIComponent(draftId)}`,
        { body: text }
      );

      if (!res.ok) {
        let errorObj: any = { code: 'UNKNOWN', error: 'Unknown error' };
        try { errorObj = await res.json(); } catch {}
        
        const errorCode = `CONTENTOPS-SAVE-${res.status}`;
        const reason = errorObj.error || '保存失败';
        bot.sendMessage(chatId, `❌ 草稿保存失败\n错误编号：${errorCode}\n原因：${reason}`.substring(0, 4000));
        return;
      }

      const updated = await res.json();
      const newVersion = updated.version;
      const previousVersion = updated.previousVersion;
      
      // Handle duplicate detection
      if (updated.isDuplicate) {
        bot.sendMessage(chatId, `⚠️ 内容未变更

Draft ID：\`${draftId}\`
当前版本：v${newVersion}

未创建新版本（内容与当前版本相同）。

下一步：
/review - 质量检查
/status - 查看状态`.substring(0, 4000), { parse_mode: 'Markdown' });
        return;
      }
      
      // Exit editing mode, keep currentDraftId
      updateSession(chatId, { 
        mode: 'IDLE',
        editingDraftId: undefined,
      });

      console.error('[ContentOps Bot] Draft saved:', { draftId, newVersion, previousVersion, chatId });

      const message = `✅ 草稿已保存

Draft ID：\`${draftId}\`
新版本：v${newVersion}
上一版本：v${previousVersion}
状态：DRAFT

下一步：
/review - 质量检查
/status - 查看状态`;
      bot.sendMessage(chatId, message.substring(0, 4000), { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('[ContentOps Bot] Save draft error:', error);
      const errMsg = error instanceof Error ? error.message : 'Unknown';
      bot.sendMessage(chatId, `❌ 草稿保存失败\n错误编号：CONTENTOPS-SAVE-EXCEPTION\n原因：${errMsg.substring(0, 200)}`.substring(0, 4000));
    }
  });

  console.log('[ContentOps Bot] Started successfully');
}

// Start the bot
startBot().catch(console.error);
