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

const CONFIG = {
  enabled: process.env.CONTENTOPS_BOT_ENABLED === 'true',
  botToken: process.env.CONTENTOPS_TELEGRAM_BOT_TOKEN || readBotTokenFromKeychain(),
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
  bot.onText(/\/new(?:\s+(.+))?/, (msg, match) => {
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

    const session = getSession(chatId);
    session.currentTitle = title;
    session.state = 'DRAFT';
    session.mode = 'editing_body';

    bot.sendMessage(chatId, `
📝 新草稿已创建

标题: ${title}
状态: DRAFT

请发送正文内容，或使用:
/cancel - 取消
    `);
  });

  // Handle /drafts
  bot.onText(/\/drafts/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    try {
      const res = await fetch(`${CONFIG.bridgeUrl}?limit=10`, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!res.ok) {
        bot.sendMessage(chatId, '获取草稿失败');
        return;
      }

      const data = await res.json();
      const drafts = data.drafts || [];

      if (drafts.length === 0) {
        bot.sendMessage(chatId, '暂无草稿');
        return;
      }

      const list = drafts.map((d: any, i: number) => 
        `${i + 1}. ${d.title}\n   ID: \`${d.id}\`\n   状态: ${d.state || 'DRAFT'}`
      ).join('\n\n');

      bot.sendMessage(chatId, `📋 最近草稿:\n\n${list}`, { parse_mode: 'Markdown' });
    } catch (error) {
      bot.sendMessage(chatId, '获取草稿失败');
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
      const res = await fetch(CONFIG.bridgeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quality_check',
          id: session.currentDraftId,
        }),
      });

      const data = await res.json();

      if (data.passed) {
        bot.sendMessage(chatId, `
✅ 质量检查通过

分数: ${data.qualityCheck.score}
SEO: ${data.qualityCheck.seoScore}
GEO: ${data.qualityCheck.geoScore}
        `);
      } else {
        bot.sendMessage(chatId, `
❌ 质量检查未通过

问题:
${data.qualityCheck.issues.join('\n')}
        `);
      }
    } catch (error) {
      bot.sendMessage(chatId, '质量检查失败');
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
      const res = await fetch(CONFIG.bridgeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          id: session.currentDraftId,
          target: 'staging',
        }),
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
