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
  // Allowlist for basic bot usage (create, edit, review)
  allowedChatIds: (process.env.CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS || '').split(',').filter(Boolean),
  // Reviewer allowlist for approve/reject (separate from basic allowlist)
  reviewerChatIds: (process.env.CONTENTOPS_TELEGRAM_REVIEWER_CHAT_IDS || '').split(',').filter(Boolean),
  // Bridge URL for staging
  bridgeUrl: process.env.CONTENTOPS_BRIDGE_URL || 'https://i.jueshi.net/api/internal/contentops/drafts',
};

const RUNTIME_INFO = {
  botRuntimeId: `pid-${process.pid}`,
  gitCommit: (() => { try { return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim(); } catch { return 'unknown'; } })(),
  version: 'v1.3',
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

function isReviewer(chatId: number): boolean {
  // Strict check: only users in reviewerChatIds can approve/reject/publish
  // No fallback to allowedChatIds - reviewer allowlist must be explicitly configured
  return CONFIG.reviewerChatIds.includes(String(chatId));
}

// Helper function to generate next step suggestions based on draft state
function getNextStepsForState(state: string, chatId: number): string {
  const isReviewerUser = isReviewer(chatId);
  
  switch (state) {
    case 'DRAFT':
    case 'CHANGES_REQUESTED':
      return `下一步：
/edit - 编辑草稿
/review - 质量检查
/submit - 提交审核`;
    case 'NEEDS_REVIEW':
      if (isReviewerUser) {
        return `下一步：
/approve - 批准草稿
/reject <原因> - 拒绝草稿`;
      } else {
        return `当前状态：等待审核
请联系审核人处理`;
      }
    case 'APPROVED':
      if (isReviewerUser) {
        return `下一步：
/publish - 发布到 staging`;
      } else {
        return `当前状态：已批准，等待发布`;
      }
    case 'PUBLISHED':
      return `草稿已发布`;
    case 'FAILED':
      if (isReviewerUser) {
        return `下一步：
/publish - 重试发布`;
      } else {
        return `当前状态：发布失败，请联系审核人`;
      }
    default:
      return `当前状态：${state}`;
  }
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
🤖 ContentOps Bot V1.3 (AI Authoring)

命令:
/new <选题> - AI 自动生成完整文章
/revise <要求> - AI 修改当前草稿
/brief - 查看写作 Brief
/outline - 查看文章大纲
/drafts - 列出草稿
/open <id> - 打开草稿
/status - 查看状态
/review [id] - 质量检查
/edit [id] - 手动编辑草稿
/submit [id] - 提交审核
/approve [id] - 批准（审核人）
/reject [id] <原因> - 拒绝（审核人）
/publish [id] - 发布到 staging
/cancel - 取消当前操作

⚠️ Production 发布已禁用
    `.substring(0, 4000));
  });

  // Handle /new — AI auto-generates complete content from topic
  bot.onText(/\/new(?:@\w+)?(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    if (!match) return;
    const topic = match[1]?.trim();
    
    if (!topic) {
      bot.sendMessage(chatId, '请提供选题: /new <选题>\n\n示例：/new 新加坡敏感货清关运输指南');
      return;
    }

    // Immediately acknowledge — generation takes time
    const ackMsg = await bot.sendMessage(chatId, `⏳ 正在为选题生成完整内容...\n\n选题：${topic}\n\n步骤：\n1. 分析选题 → 生成写作 Brief\n2. 生成文章大纲\n3. 撰写完整正文\n4. 生成 SEO 字段\n5. 质量检查\n\n请稍候（约 30-60 秒）...`);

    try {
      const res = await fetchBridgeApi({
        action: 'generate',
        topic,
        contentType: 'guide',
        createdBy: `telegram:${chatId}`,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Unknown error', code: 'UNKNOWN' }));
        console.error('[ContentOps Bot] Generate failed:', error);
        
        if (error.code === 'AI_NOT_CONFIGURED') {
          bot.sendMessage(chatId, `❌ AI 内容生成未配置\n\n错误编号：CONTENTOPS-GENERATE-503\n原因：AI 模型服务未启用\n\n请联系管理员配置 AI_API_KEY`);
        } else if (error.code === 'CONTENTOPS-MODEL-PROVIDER-UNAVAILABLE') {
          bot.sendMessage(chatId, `❌ AI 模型服务不可用\n\n错误编号：CONTENTOPS-MODEL-PROVIDER-UNAVAILABLE\n原因：真实 AI 模型无法调用\n详情：${(error.providerError || 'DeepSeek API 余额不足或网络错误').substring(0, 200)}\n\n当前状态：\n- 生成任务已暂停\n- 等待模型服务恢复后可重试\n\n请联系管理员检查 AI_API_KEY 配置或充值 API 余额`);
        } else {
          bot.sendMessage(chatId, `❌ 内容生成失败\n\n错误编号：${error.code || 'CONTENTOPS-GENERATE-500'}\n原因：${(error.error || '').substring(0, 200)}`);
        }
        return;
      }

      const result = await res.json();

      if (result.status === 'COMPLETED' && result.draftId) {
        // Persist currentDraftId
        updateSession(chatId, { currentDraftId: result.draftId, currentTitle: result.content?.title || topic });

        const qualityInfo = result.qualityResult ? 
          `\n质量评分：\n- 内容质量：${result.qualityResult.qualityScore}/100\n- SEO：${result.qualityResult.seoScore}/100\n- GEO：${result.qualityResult.geoScore}/100` : '';

        const message = `✅ 内容生成完成

📝 标题：${result.content?.title || topic}
Draft ID：\`${result.draftId}\`
版本：v1
字数：${result.content?.wordCount || 0} 字
Job ID：\`${result.jobId}\`

内容摘要：
${(result.content?.summary || '').substring(0, 200)}

📊 生成统计：
- FAQ：${result.content?.faqCount || 0} 条
- 来源：${result.content?.sourceCount || 0} 条
- 内链建议：${result.content?.internalLinkCount || 0} 条
- 自动修订轮数：${result.revisionCount || 0}
- 模型耗时：${result.totalLatencyMs || 0}ms
${qualityInfo}

下一步：
/review - 质量检查
/brief - 查看写作 Brief
/outline - 查看文章大纲
/revise <修改要求> - AI 改稿
/submit - 提交审核`;
        bot.sendMessage(chatId, message.substring(0, 4000), { parse_mode: 'Markdown' });
      } else if (result.status === 'PAUSED_RATE_LIMIT') {
        bot.sendMessage(chatId, `⏸️ 内容生成已暂停（遇到速率限制）

Job ID：\`${result.jobId}\`
步骤：${result.failedStep}
重试次数：${result.retryCount}
恢复时间：${result.resumeAt ? new Date(result.resumeAt).toLocaleString('zh-CN') : '30 分钟后'}

系统将在恢复后自动继续。`);
      } else {
        bot.sendMessage(chatId, `❌ 内容生成失败

Job ID：\`${result.jobId}\`
状态：${result.status}
步骤：${result.failedStep || '未知'}
错误：${(result.error || '').substring(0, 200)}
错误编号：${result.errorCode || 'CONTENTOPS-GENERATE-001'}`);
      }
    } catch (error) {
      console.error('[ContentOps Bot] Generate error:', error);
      bot.sendMessage(chatId, '❌ 内容生成执行失败\n\n错误编号：CONTENTOPS-GENERATE-EXCEPTION\n请稍后重试');
    }
  });

  // Handle /revise <instructions> — AI revises current draft
  bot.onText(/\/revise(?:@\w+)?(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    if (!match || !match[1]?.trim()) {
      bot.sendMessage(chatId, '请提供修改要求：/revise <修改要求>\n\n示例：/revise 增加酒水、液体和电池三类敏感货的分别说明');
      return;
    }

    const instructions = match[1].trim();
    const session = getSession(chatId);
    const draftId = session.currentDraftId;

    if (!draftId) {
      bot.sendMessage(chatId, '❌ 没有当前草稿\n\n请先使用 /new <选题> 创建草稿，或 /open <draftId> 打开草稿');
      return;
    }

    const ackMsg = await bot.sendMessage(chatId, `⏳ 正在修改草稿...\n\nDraft ID：\`${draftId}\`\n修改要求：${instructions.substring(0, 100)}${instructions.length > 100 ? '...' : ''}\n\n请稍候...`);

    try {
      const res = await fetchBridgeApi({
        action: 'revise',
        id: draftId,
        instructions,
        createdBy: `telegram:${chatId}`,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Unknown error', code: 'UNKNOWN' }));
        bot.sendMessage(chatId, `❌ 修改失败\n\n错误编号：${error.code || 'CONTENTOPS-REVISE-500'}\n原因：${(error.error || '').substring(0, 200)}`);
        return;
      }

      const result = await res.json();

      if (result.status === 'COMPLETED') {
        const message = `✅ 已完成修改

Draft ID：\`${draftId}\`
上一版本：v${result.previousVersion}
新版本：v${result.version}
主要修改：${result.revisionSummary || '已按要求修改'}
当前字数：${result.wordCount || 0} 字
Job ID：\`${result.jobId}\`

下一步：
/review - 质量检查
/revise <修改要求> - 继续修改
/submit - 提交审核`;
        bot.sendMessage(chatId, message.substring(0, 4000), { parse_mode: 'Markdown' });
      } else {
        bot.sendMessage(chatId, `❌ 修改失败\n\nJob ID：\`${result.jobId}\`\n状态：${result.status}\n错误：${(result.error || '').substring(0, 200)}`);
      }
    } catch (error) {
      console.error('[ContentOps Bot] Revise error:', error);
      bot.sendMessage(chatId, '❌ 修改执行失败\n\n错误编号：CONTENTOPS-REVISE-EXCEPTION\n请稍后重试');
    }
  });

  // Handle /brief — show writing brief for current draft
  bot.onText(/\/brief(?:@\w+)?/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    const session = getSession(chatId);
    if (!session.currentDraftId) {
      bot.sendMessage(chatId, '❌ 没有当前草稿\n\n请先使用 /new <选题> 创建草稿');
      return;
    }

    try {
      // Get generation job for this draft
      const res = await fetchBridgeGet(`?action=generation_jobs&limit=5`);
      if (!res.ok) {
        bot.sendMessage(chatId, '❌ 无法获取写作 Brief');
        return;
      }

      const data = await res.json();
      const job = (data.jobs || []).find((j: any) => j.draftId === session.currentDraftId);

      if (!job) {
        bot.sendMessage(chatId, '❌ 未找到写作 Brief\n\n该草稿可能不是通过 /new 自动生成的');
        return;
      }

      // Get full job details with brief
      const jobRes = await fetchBridgeGet(`?action=generation_job_status&jobId=${encodeURIComponent(job.id)}`);
      if (!jobRes.ok) {
        bot.sendMessage(chatId, '❌ 无法获取 Brief 详情');
        return;
      }

      const jobDetail = await jobRes.json();
      const brief = jobDetail.brief;

      if (!brief) {
        bot.sendMessage(chatId, '❌ 该 Job 没有写作 Brief');
        return;
      }

      const message = `📋 写作 Brief

主题：${brief.topic}
内容类型：${brief.contentType}
目标读者：${brief.targetAudience}
搜索意图：${brief.searchIntent}
语调：${brief.tone}
语言：${brief.language}
目标国家：${brief.country || '未指定'}

🔑 关键词：
- 主要：${brief.primaryKeyword}
- 次要：${(brief.secondaryKeywords || []).join(', ')}

📏 要求：
- 字数：${brief.requestedLength}
- 必须章节：${(brief.requiredSections || []).join(', ')}
- 排除内容：${(brief.excludedClaims || []).join(', ') || '无'}

Job ID：\`${job.id}\``;
      bot.sendMessage(chatId, message.substring(0, 4000), { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('[ContentOps Bot] Brief error:', error);
      bot.sendMessage(chatId, '❌ 获取 Brief 失败');
    }
  });

  // Handle /outline — show article outline
  bot.onText(/\/outline(?:@\w+)?/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    const session = getSession(chatId);
    if (!session.currentDraftId) {
      bot.sendMessage(chatId, '❌ 没有当前草稿\n\n请先使用 /new <选题> 创建草稿');
      return;
    }

    try {
      const res = await fetchBridgeGet(`?action=generation_jobs&limit=5`);
      if (!res.ok) {
        bot.sendMessage(chatId, '❌ 无法获取文章大纲');
        return;
      }

      const data = await res.json();
      const job = (data.jobs || []).find((j: any) => j.draftId === session.currentDraftId);

      if (!job) {
        bot.sendMessage(chatId, '❌ 未找到文章大纲\n\n该草稿可能不是通过 /new 自动生成的');
        return;
      }

      const jobRes = await fetchBridgeGet(`?action=generation_job_status&jobId=${encodeURIComponent(job.id)}`);
      if (!jobRes.ok) {
        bot.sendMessage(chatId, '❌ 无法获取大纲详情');
        return;
      }

      const jobDetail = await jobRes.json();
      const outline = jobDetail.outline;

      if (!outline || outline.length === 0) {
        bot.sendMessage(chatId, '❌ 该 Job 没有文章大纲');
        return;
      }

      const outlineText = outline.map((section: any, i: number) => {
        const prefix = section.level === 2 ? `${i + 1}.` : '  -';
        const points = section.keyPoints ? `\n     要点：${section.keyPoints.join('、')}` : '';
        return `${prefix} ${section.heading}${points}`;
      }).join('\n');

      const message = `📑 文章大纲\n\n${outlineText}\n\nJob ID：\`${job.id}\``;
      bot.sendMessage(chatId, message.substring(0, 4000), { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('[ContentOps Bot] Outline error:', error);
      bot.sendMessage(chatId, '❌ 获取大纲失败');
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

      const nextSteps = getNextStepsForState(draft.state, chatId);
      const message = `✅ 已打开草稿

标题：${draft.title}
Draft ID：\`${draft.id}\`
状态：${draft.state}
版本：v${draft.version}

${nextSteps}`;
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
      const nextSteps = getNextStepsForState(statusText, chatId);

      if (data.passed) {
        const message = `✅ 质量检查通过

草稿：${data.draftId || draftId}
版本：v${data.draftVersion || 1}

评分：
- 内容质量：${data.qualityScore ?? '-'}/100
- SEO：${data.seoScore ?? '-'}/100
- GEO：${data.geoScore ?? '-'}/100

当前状态：${statusText}
${nextSteps}`;
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
${nextSteps}`;
        bot.sendMessage(chatId, message.substring(0, 4000));
      }
    } catch (error) {
      console.error('[ContentOps Bot] Review error:', error);
      const errMsg = error instanceof Error ? error.message : 'Unknown';
      bot.sendMessage(chatId, `❌ 质量检查执行失败\n错误编号：CONTENTOPS-REVIEW-EXCEPTION\n详情：${errMsg.substring(0, 200)}`.substring(0, 4000));
    }
  });

  // Handle /submit [draftId] - Submit for review (DRAFT → NEEDS_REVIEW)
  bot.onText(/\/submit(?:@\w+)?(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    if (!match) return;
    const explicitId = match[1]?.trim();
    const { draftId, error } = resolveDraftId(chatId, explicitId);
    
    if (!draftId) {
      bot.sendMessage(chatId, error || '请先使用 /open <id> 打开草稿，或 /submit <draftId>');
      return;
    }

    try {
      const res = await fetchBridgeApi({
        action: 'submit_for_review',
        id: draftId,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Unknown', code: 'UNKNOWN' }));
        const errorCode = `CONTENTOPS-SUBMIT-${res.status}`;
        bot.sendMessage(chatId, `❌ 提交审核失败\n错误编号：${errorCode}\n原因：${(errData.error || '').substring(0, 200)}`.substring(0, 4000));
        return;
      }

      const data = await res.json();
      const nextSteps = getNextStepsForState(data.state, chatId);
      const message = `📤 已提交审核

Draft ID：\`${draftId}\`
状态：${data.state}
版本：v${data.version}

${nextSteps}`;
      bot.sendMessage(chatId, message.substring(0, 4000), { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('[ContentOps Bot] Submit error:', error);
      bot.sendMessage(chatId, '❌ 提交审核失败，请稍后重试');
    }
  });

  // Handle /approve [draftId] - Approve draft (NEEDS_REVIEW → APPROVED)
  bot.onText(/\/approve(?:@\w+)?(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    // Check reviewer permission
    if (!isReviewer(chatId)) {
      bot.sendMessage(chatId, `❌ 无审批权限\n错误编号：CONTENTOPS-APPROVE-403\n原因：您的账号不在审核人列表中`);
      return;
    }

    if (!match) return;
    const explicitId = match[1]?.trim();
    const { draftId, error } = resolveDraftId(chatId, explicitId);
    
    if (!draftId) {
      bot.sendMessage(chatId, error || '请先使用 /open <id> 打开草稿，或 /approve <draftId>');
      return;
    }

    try {
      // First check quality gate
      const qualityRes = await fetchBridgeApi({
        action: 'quality_check',
        id: draftId,
      });

      if (!qualityRes.ok) {
        const errData = await qualityRes.json().catch(() => ({ error: 'Unknown' }));
        bot.sendMessage(chatId, `❌ 质量检查失败\n错误编号：CONTENTOPS-APPROVE-QUALITY\n原因：${(errData.error || '').substring(0, 200)}`.substring(0, 4000));
        return;
      }

      const qualityData = await qualityRes.json();
      
      if (!qualityData.passed) {
        bot.sendMessage(chatId, `❌ 无法批准\n错误编号：CONTENTOPS-APPROVE-409\n原因：质量门禁未通过或当前状态不是 NEEDS_REVIEW\n\n质量评分：${qualityData.qualityScore}/100\n当前状态：${qualityData.draftState}\n\n请先使用 /edit 修改内容后重新 /review`.substring(0, 4000));
        return;
      }

      // Get current version for binding
      const getRes = await fetchBridgeGet(`?id=${encodeURIComponent(draftId)}`);
      if (!getRes.ok) {
        bot.sendMessage(chatId, '❌ 无法获取草稿信息');
        return;
      }
      const draft = await getRes.json();

      // Check state is NEEDS_REVIEW
      if (draft.state !== 'NEEDS_REVIEW' && draft.state !== 'APPROVED') {
        bot.sendMessage(chatId, `❌ 无法批准\n错误编号：CONTENTOPS-APPROVE-409\n原因：状态必须是 NEEDS_REVIEW，当前为 ${draft.state}`.substring(0, 4000));
        return;
      }

      // Execute approval
      const res = await fetchBridgeApi({
        action: 'approve',
        id: draftId,
        approvedBy: `telegram:${chatId}`,
        reviewerChatId: String(chatId),
        approvalSource: 'telegram',
        expectedVersion: draft.version,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Unknown', code: 'UNKNOWN' }));
        const errorCode = `CONTENTOPS-APPROVE-${res.status}`;
        bot.sendMessage(chatId, `❌ 批准失败\n错误编号：${errorCode}\n原因：${(errData.error || '').substring(0, 200)}`.substring(0, 4000));
        return;
      }

      const data = await res.json();

      if (data.alreadyApproved) {
        bot.sendMessage(chatId, `ℹ️ 草稿已批准

Draft ID：\`${draftId}\`
批准版本：v${data.version}
当前状态：APPROVED

（重复审批，未创建新记录）`.substring(0, 4000), { parse_mode: 'Markdown' });
      } else {
        const nextSteps = getNextStepsForState('APPROVED', chatId);
        const message = `✅ 草稿已批准

Draft ID：\`${draftId}\`
批准版本：v${data.version}
当前状态：APPROVED

${nextSteps}`;
        bot.sendMessage(chatId, message.substring(0, 4000), { parse_mode: 'Markdown' });
      }
    } catch (error) {
      console.error('[ContentOps Bot] Approve error:', error);
      const errMsg = error instanceof Error ? error.message : 'Unknown';
      bot.sendMessage(chatId, `❌ 批准执行失败\n错误编号：CONTENTOPS-APPROVE-EXCEPTION\n详情：${errMsg.substring(0, 200)}`.substring(0, 4000));
    }
  });

  // Handle /reject <draftId> <reason> - Reject draft (NEEDS_REVIEW → CHANGES_REQUESTED)
  bot.onText(/\/reject(?:@\w+)?(?:\s+(\S+))?(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    // Check reviewer permission
    if (!isReviewer(chatId)) {
      bot.sendMessage(chatId, `❌ 无审批权限\n错误编号：CONTENTOPS-REJECT-403\n原因：您的账号不在审核人列表中`);
      return;
    }

    if (!match) return;
    const explicitId = match[1]?.trim();
    const reason = match[2]?.trim() || '审核人要求修改';
    
    const { draftId, error } = resolveDraftId(chatId, explicitId);
    
    if (!draftId) {
      bot.sendMessage(chatId, error || '请先使用 /open <id> 打开草稿，或 /reject <draftId> <原因>');
      return;
    }

    try {
      const res = await fetchBridgeApi({
        action: 'reject',
        id: draftId,
        rejectedBy: `telegram:${chatId}`,
        reviewerChatId: String(chatId),
        reason,
        rejectionSource: 'telegram',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Unknown', code: 'UNKNOWN' }));
        const errorCode = `CONTENTOPS-REJECT-${res.status}`;
        bot.sendMessage(chatId, `❌ 拒绝失败\n错误编号：${errorCode}\n原因：${(errData.error || '').substring(0, 200)}`.substring(0, 4000));
        return;
      }

      const data = await res.json();
      const nextSteps = getNextStepsForState(data.state, chatId);
      const message = `🔙 草稿已拒绝

Draft ID：\`${draftId}\`
版本：v${data.version}
状态：${data.state}
原因：${reason}

${nextSteps}`;
      bot.sendMessage(chatId, message.substring(0, 4000), { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('[ContentOps Bot] Reject error:', error);
      bot.sendMessage(chatId, '❌ 拒绝执行失败，请稍后重试');
    }
  });

  // Handle /publish [draftId]
  bot.onText(/\/publish(?:@\w+)?(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    
    if (!isAllowedChat(chatId)) {
      bot.sendMessage(chatId, '⛔ 未授权的访问');
      return;
    }

    // Check reviewer permission for publish
    if (!isReviewer(chatId)) {
      bot.sendMessage(chatId, `❌ 无发布权限\n错误编号：CONTENTOPS-PUBLISH-403\n原因：您的账号不在审核人列表中`);
      return;
    }

    const explicitId = match![1]?.trim();
    const { draftId, error } = resolveDraftId(chatId, explicitId);
    
    if (!draftId) {
      bot.sendMessage(chatId, error || '请先使用 /open <id> 打开草稿，或 /publish <draftId>');
      return;
    }

    try {
      const res = await fetchBridgeApi({
        id: draftId,
        action: 'publish',
        publishedBy: `telegram:${chatId}`,
        publishSource: 'telegram',
      });

      if (!res.ok) {
        const data = await res.json();
        let errorMsg = '❌ 发布失败';
        if (data.code === 'INVALID_STATE') {
          errorMsg = `❌ 无法发布\n\n原因：${data.error}\n\n当前状态不允许发布。需要先通过质量检查并审批。`;
        } else if (data.code === 'VERSION_MISMATCH') {
          errorMsg = `❌ 版本不匹配\n\n${data.error}`;
        } else if (data.code === 'DRAFT_NOT_FOUND') {
          errorMsg = `❌ 草稿不存在\n\nDraft ID：\`${draftId}\``;
        }
        bot.sendMessage(chatId, errorMsg.substring(0, 4000));
        return;
      }

      const data = await res.json();

      if (data.alreadyPublished) {
        bot.sendMessage(chatId, `
ℹ️ 草稿已发布

Draft ID：\`${draftId}\`
发布版本：v${data.version}
发布 URL：${data.publishedUrl || data.publishRecord?.publishedUrl}
Content ID：${data.contentId || data.publishRecord?.contentId}
当前状态：PUBLISHED

（重复发布，返回已有记录）
        `.substring(0, 4000));
      } else {
        bot.sendMessage(chatId, `
✅ 草稿已发布到 staging

Draft ID：\`${draftId}\`
发布版本：v${data.version}
发布 URL：${data.publishedUrl || data.publishRecord?.publishedUrl}
Content ID：${data.contentId || data.publishRecord?.contentId}
当前状态：PUBLISHED

⚠️ Production 发布已禁用
        `.substring(0, 4000));
      }
    } catch (err: any) {
      bot.sendMessage(chatId, `❌ 发布执行失败\n错误编号：CONTENTOPS-PUBLISH-500`);
    }
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
          
          // Add next steps based on state
          const nextSteps = getNextStepsForState(draft.state, chatId);
          statusMsg += `\n\n${nextSteps}`;
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
  bot.onText(/\/cancel/, async (msg) => {
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
    } else if (session.currentDraftId) {
      // Try to cancel any active generation job for this draft
      try {
        const res = await fetchBridgeGet(`?action=generation_jobs&limit=5`);
        if (res.ok) {
          const data = await res.json();
          const activeJob = (data.jobs || []).find(
            (j: any) => j.draftId === session.currentDraftId && 
            !['COMPLETED', 'FAILED', 'CANCELLED'].includes(j.status)
          );
          
          if (activeJob) {
            await fetchBridgeApi({
              action: 'cancel_generation',
              jobId: activeJob.id,
            });
            bot.sendMessage(chatId, `✅ 已取消生成任务\n\nJob ID：\`${activeJob.id}\`\n草稿指针保留`);
            return;
          }
        }
      } catch {
        // Ignore errors, fall through to default cancel
      }
      
      // Default: clear session
      clearSession(chatId);
      bot.sendMessage(chatId, '✅ 已取消当前操作（草稿指针已清除，草稿本身未删除）');
    } else {
      clearSession(chatId);
      bot.sendMessage(chatId, '✅ 已取消当前操作');
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
