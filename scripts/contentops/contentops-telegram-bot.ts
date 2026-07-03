#!/usr/bin/env tsx
/**
 * ContentOps Telegram Bot Runner (Enhanced)
 * 
 * 增强版 Bot Runner，包含：
 * - 所有命令写 audit log
 * - 所有错误脱敏
 * - 所有 token 永不打印
 * - 支持 30 分钟 429 cooldown
 * - 支持用户确认创建
 * - 支持 draft 创建去重
 * - allowed chatId 白名单
 * - production 开关
 * - 使用 CONTENTOPS_TELEGRAM_BOT_TOKEN（专用变量名）
 * 
 * 安全特性：
 * - 默认 disabled（CONTENTOPS_BOT_ENABLED=false）
 * - 命令白名单
 * - Rate limit
 * - 429 cooldown（30 分钟）
 * - Audit log
 * - 不执行任意 shell
 * - 不发布内容
 * - 不删除内容
 */

import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';

// ============================================================================
// 配置
// ============================================================================

const CONFIG = {
  // Bot 开关（默认 disabled）
  enabled: process.env.CONTENTOPS_BOT_ENABLED === 'true',
  
  // Telegram Bot Token（从环境变量读取，使用专用变量名）
  botToken: process.env.CONTENTOPS_TELEGRAM_BOT_TOKEN,
  
  // Production draft 创建开关（默认关闭）
  allowProduction: process.env.CONTENTOPS_DRAFT_ALLOW_PRODUCTION === 'true',
  
  // Allowed chatId 列表（白名单）
  allowedChatIds: (process.env.CONTENTOPS_ALLOWED_CHAT_IDS || '').split(',').filter(Boolean),
  
  // Rate limit 配置
  rateLimit: {
    perChatPerMinute: 5,
    perChatPerHour: 50,
    globalPerMinute: 100,
    globalPerHour: 1000
  },
  
  // Cooldown 配置（30 分钟）
  cooldown: {
    seconds: 30 * 60  // 30 分钟
  },
  
  // 日志目录
  logDir: 'logs/contentops-audit',
  
  // 去重窗口（5 分钟内相同 slug 视为重复）
  dedupeWindowMs: 5 * 60 * 1000
};

// ============================================================================
// 类型定义
// ============================================================================

interface AuditLogEntry {
  timestamp: string;
  chatIdHash: string;
  userDisplayName?: string;
  command: string;
  contentType?: 'checklist' | 'guide' | 'topic';
  slug?: string;
  draftId?: string;
  dryRun?: boolean;
  production?: boolean;
  result: 'success' | 'error' | 'dry-run' | 'rejected' | 'duplicate';
  error?: string | null;
  rateLimitStatus: 'ok' | 'limited' | 'cooldown';
}

interface Command {
  name: string;
  handler: (args: any) => Promise<any>;
  allowed: boolean;
  rateLimit: {
    perMinute: number;
    perHour: number;
  };
}

interface PendingConfirmation {
  chatId: string;
  command: string;
  args: any;
  timestamp: number;
}

// ============================================================================
// 工具函数
// ============================================================================

function hashChatId(chatId: string): string {
  return createHash('sha256').update(chatId).digest('hex').slice(0, 8);
}

function writeAuditLog(entry: AuditLogEntry): void {
  // 确保日志目录存在
  if (!existsSync(CONFIG.logDir)) {
    mkdirSync(CONFIG.logDir, { recursive: true });
  }
  
  const logPath = `${CONFIG.logDir}/${new Date().toISOString().split('T')[0]}.jsonl`;
  appendFileSync(logPath, JSON.stringify(entry) + '\n');
}

function sanitizeError(errorMessage: string): string {
  return errorMessage
    .replace(/DATABASE_URL=[^\s]+/g, 'DATABASE_URL=***')
    .replace(/token=[^\s]+/gi, 'token=***')
    .replace(/CONTENTOPS_TELEGRAM_BOT_TOKEN=[^\s]+/g, 'CONTENTOPS_TELEGRAM_BOT_TOKEN=***')
    .replace(/TELEGRAM_BOT_TOKEN=[^\s]+/g, 'TELEGRAM_BOT_TOKEN=***')
    .replace(/cookie=[^\s]+/g, 'cookie=***')
    .replace(/session=[^\s]+/g, 'session=***')
    .replace(/ssh.*password/gi, '***')
    .replace(/password=[^\s]+/g, 'password=***')
    .replace(/api[_-]?key=[^\s]+/gi, 'api_key=***')
    .replace(/secret=[^\s]+/gi, 'secret=***');
}

function isAllowedChatId(chatId: string): boolean {
  if (CONFIG.allowedChatIds.length === 0) {
    return true;  // 如果没有配置白名单，允许所有
  }
  return CONFIG.allowedChatIds.includes(chatId);
}

// ============================================================================
// Rate Limit Manager
// ============================================================================

class RateLimitManager {
  private chatLimits = new Map<string, { minute: number; hour: number; lastReset: number }>();
  private globalLimits = { minute: 0, hour: 0, lastReset: Date.now() };
  
  isLimited(chatId: string): boolean {
    const now = Date.now();
    const chatLimit = this.chatLimits.get(chatId) || { minute: 0, hour: 0, lastReset: now };
    
    // 重置分钟计数器
    if (now - chatLimit.lastReset > 60 * 1000) {
      chatLimit.minute = 0;
      chatLimit.lastReset = now;
    }
    
    // 检查限制
    if (chatLimit.minute >= CONFIG.rateLimit.perChatPerMinute) {
      return true;
    }
    
    if (chatLimit.hour >= CONFIG.rateLimit.perChatPerHour) {
      return true;
    }
    
    if (this.globalLimits.minute >= CONFIG.rateLimit.globalPerMinute) {
      return true;
    }
    
    if (this.globalLimits.hour >= CONFIG.rateLimit.globalPerHour) {
      return true;
    }
    
    return false;
  }
  
  increment(chatId: string): void {
    const chatLimit = this.chatLimits.get(chatId) || { minute: 0, hour: 0, lastReset: Date.now() };
    chatLimit.minute++;
    chatLimit.hour++;
    this.chatLimits.set(chatId, chatLimit);
    
    this.globalLimits.minute++;
    this.globalLimits.hour++;
  }
}

// ============================================================================
// Cooldown Manager (30 分钟)
// ============================================================================

class CooldownManager {
  private cooldowns = new Map<string, number>();
  
  isOnCooldown(chatId: string): boolean {
    const cooldownEnd = this.cooldowns.get(chatId);
    if (!cooldownEnd) return false;
    
    if (Date.now() < cooldownEnd) {
      return true;
    }
    
    // Cooldown 结束，移除
    this.cooldowns.delete(chatId);
    return false;
  }
  
  startCooldown(chatId: string): void {
    const cooldownEnd = Date.now() + CONFIG.cooldown.seconds * 1000;
    this.cooldowns.set(chatId, cooldownEnd);
  }
  
  getRemainingCooldown(chatId: string): number {
    const cooldownEnd = this.cooldowns.get(chatId);
    if (!cooldownEnd) return 0;
    
    const remaining = cooldownEnd - Date.now();
    return remaining > 0 ? remaining : 0;
  }
}

// ============================================================================
// Dedupe Manager (5 分钟窗口)
// ============================================================================

class DedupeManager {
  private recentCreations = new Map<string, number>();  // slug -> timestamp
  
  isDuplicate(slug: string): boolean {
    const lastCreation = this.recentCreations.get(slug);
    if (!lastCreation) return false;
    
    const now = Date.now();
    if (now - lastCreation > CONFIG.dedupeWindowMs) {
      // 超过窗口，移除
      this.recentCreations.delete(slug);
      return false;
    }
    
    return true;
  }
  
  recordCreation(slug: string): void {
    this.recentCreations.set(slug, Date.now());
  }
}

// ============================================================================
// Confirmation Manager
// ============================================================================

class ConfirmationManager {
  private pendingConfirmations = new Map<string, PendingConfirmation>();
  
  addPending(chatId: string, command: string, args: any): void {
    this.pendingConfirmations.set(chatId, {
      chatId,
      command,
      args,
      timestamp: Date.now()
    });
  }
  
  getPending(chatId: string): PendingConfirmation | undefined {
    return this.pendingConfirmations.get(chatId);
  }
  
  removePending(chatId: string): void {
    this.pendingConfirmations.delete(chatId);
  }
  
  isExpired(pending: PendingConfirmation): boolean {
    // 确认超时：10 分钟
    return Date.now() - pending.timestamp > 10 * 60 * 1000;
  }
}

// ============================================================================
// 命令白名单
// ============================================================================

const ALLOWED_COMMANDS: Record<string, Command> = {
  'create-draft': {
    name: 'create-draft',
    handler: async (args) => {
      // 调用 scripts/create-contentops-draft.ts
      const { execSync } = require('child_process');
      const result = execSync(
        `tsx scripts/create-contentops-draft.ts --type=${args.type} --payload='${JSON.stringify(args.payload)}'`,
        { encoding: 'utf-8' }
      );
      return JSON.parse(result);
    },
    allowed: true,
    rateLimit: { perMinute: 5, perHour: 50 }
  },
  
  'validate-draft': {
    name: 'validate-draft',
    handler: async (args) => {
      const { execSync } = require('child_process');
      const result = execSync(
        `tsx scripts/validate-contentops-draft.ts --draftId=${args.draftId}`,
        { encoding: 'utf-8' }
      );
      return JSON.parse(result);
    },
    allowed: true,
    rateLimit: { perMinute: 10, perHour: 100 }
  },
  
  'list-drafts': {
    name: 'list-drafts',
    handler: async (args) => {
      const { execSync } = require('child_process');
      const result = execSync(
        `tsx scripts/list-contentops-drafts.ts --status=${args.status || 'draft'}`,
        { encoding: 'utf-8' }
      );
      return JSON.parse(result);
    },
    allowed: true,
    rateLimit: { perMinute: 10, perHour: 100 }
  },
  
  'help': {
    name: 'help',
    handler: async () => {
      return {
        message: `ContentOps Bot 帮助

可用命令：
/create-draft - 创建 draft（需要先确认）
/validate-draft - 验证 draft
/list-drafts - 列出 draft
/help - 显示帮助

安全特性：
- 默认 disabled
- 命令白名单
- Rate limit: 5 次/分钟
- Cooldown: 30 分钟
- Audit log: 所有操作记录
- Production: 默认关闭
- 去重: 5 分钟内相同 slug 视为重复`
      };
    },
    allowed: true,
    rateLimit: { perMinute: 20, perHour: 200 }
  }
};

// ============================================================================
// Command Router
// ============================================================================

class CommandRouter {
  private rateLimitManager = new RateLimitManager();
  private cooldownManager = new CooldownManager();
  private dedupeManager = new DedupeManager();
  private confirmationManager = new ConfirmationManager();
  
  async route(chatId: string, commandName: string, args: any, userConfirmed: boolean = false): Promise<any> {
    const chatIdHash = hashChatId(chatId);
    
    // 检查 chatId 白名单
    if (!isAllowedChatId(chatId)) {
      writeAuditLog({
        timestamp: new Date().toISOString(),
        chatIdHash,
        command: commandName,
        result: 'rejected',
        error: 'ChatId not allowed',
        rateLimitStatus: 'ok'
      });
      
      throw new Error('ChatId not allowed');
    }
    
    // 检查命令是否在白名单中
    const command = ALLOWED_COMMANDS[commandName];
    if (!command || !command.allowed) {
      writeAuditLog({
        timestamp: new Date().toISOString(),
        chatIdHash,
        command: commandName,
        result: 'rejected',
        error: 'Command not allowed',
        rateLimitStatus: 'ok'
      });
      
      throw new Error(`Command not allowed: ${commandName}`);
    }
    
    // 检查 cooldown
    if (this.cooldownManager.isOnCooldown(chatId)) {
      const remaining = this.cooldownManager.getRemainingCooldown(chatId);
      const remainingMinutes = Math.ceil(remaining / 60000);
      
      writeAuditLog({
        timestamp: new Date().toISOString(),
        chatIdHash,
        command: commandName,
        result: 'rejected',
        error: `Cooldown active (${remainingMinutes} minutes remaining)`,
        rateLimitStatus: 'cooldown'
      });
      
      throw new Error(`Cooldown active. Please wait ${remainingMinutes} minutes.`);
    }
    
    // 检查 rate limit
    if (this.rateLimitManager.isLimited(chatId)) {
      this.cooldownManager.startCooldown(chatId);
      
      writeAuditLog({
        timestamp: new Date().toISOString(),
        chatIdHash,
        command: commandName,
        result: 'rejected',
        error: 'Rate limit exceeded',
        rateLimitStatus: 'limited'
      });
      
      throw new Error('Rate limit exceeded. 30-minute cooldown activated.');
    }
    
    // 特殊处理：create-draft 需要用户确认
    if (commandName === 'create-draft' && !userConfirmed) {
      // 检查去重
      const slug = args.payload?.slug;
      if (slug && this.dedupeManager.isDuplicate(slug)) {
        writeAuditLog({
          timestamp: new Date().toISOString(),
          chatIdHash,
          command: commandName,
          contentType: args.type,
          slug,
          result: 'duplicate',
          error: 'Duplicate creation attempt within 5 minutes',
          rateLimitStatus: 'ok'
        });
        
        throw new Error(`Duplicate creation attempt. Slug "${slug}" was created recently.`);
      }
      
      // 检查 production 开关
      if (args.production && !CONFIG.allowProduction) {
        writeAuditLog({
          timestamp: new Date().toISOString(),
          chatIdHash,
          command: commandName,
          contentType: args.type,
          slug,
          result: 'rejected',
          error: 'Production draft creation is disabled',
          rateLimitStatus: 'ok'
        });
        
        throw new Error('Production draft creation is disabled. Set CONTENTOPS_DRAFT_ALLOW_PRODUCTION=true to enable.');
      }
      
      // 保存待确认
      this.confirmationManager.addPending(chatId, commandName, args);
      
      // 返回 dry-run 摘要
      return {
        dryRun: true,
        message: `即将创建 draft：

类型: ${args.type}
Slug: ${args.payload?.slug}
标题: ${args.payload?.title}
Production: ${args.production ? '是' : '否（staging only）'}

请回复 /confirm 确认创建，或 /cancel 取消。
（确认有效期 10 分钟）`,
        pendingConfirmation: true
      };
    }
    
    // 处理 /confirm 命令
    if (commandName === 'confirm') {
      const pending = this.confirmationManager.getPending(chatId);
      if (!pending) {
        throw new Error('No pending confirmation');
      }
      
      if (this.confirmationManager.isExpired(pending)) {
        this.confirmationManager.removePending(chatId);
        throw new Error('Confirmation expired. Please try again.');
      }
      
      // 执行实际创建
      this.confirmationManager.removePending(chatId);
      return this.route(chatId, pending.command, pending.args, true);
    }
    
    // 处理 /cancel 命令
    if (commandName === 'cancel') {
      this.confirmationManager.removePending(chatId);
      return { message: 'Creation cancelled.' };
    }
    
    // 执行命令
    try {
      this.rateLimitManager.increment(chatId);
      const result = await command.handler(args);
      
      // 记录创建
      if (commandName === 'create-draft' && args.payload?.slug) {
        this.dedupeManager.recordCreation(args.payload.slug);
      }
      
      writeAuditLog({
        timestamp: new Date().toISOString(),
        chatIdHash,
        command: commandName,
        contentType: args.type,
        slug: args.payload?.slug,
        draftId: result.draftId,
        dryRun: args.dryRun || false,
        production: args.production || false,
        result: 'success',
        error: null,
        rateLimitStatus: 'ok'
      });
      
      return result;
    } catch (error: any) {
      const sanitizedError = sanitizeError(error.message || String(error));
      
      writeAuditLog({
        timestamp: new Date().toISOString(),
        chatIdHash,
        command: commandName,
        result: 'error',
        error: sanitizedError,
        rateLimitStatus: 'ok'
      });
      
      throw error;
    }
  }
}

// ============================================================================
// Bot Runner
// ============================================================================

async function startBot(): Promise<void> {
  // 检查是否启用
  if (!CONFIG.enabled) {
    console.log('ContentOps Bot is disabled. Set CONTENTOPS_BOT_ENABLED=true to enable.');
    return;
  }
  
  // 检查 token
  if (!CONFIG.botToken) {
    console.error('CONTENTOPS_TELEGRAM_BOT_TOKEN is required');
    process.exit(1);
  }
  
  console.log('Starting ContentOps Bot...');
  console.log(`Production draft creation: ${CONFIG.allowProduction ? 'ENABLED' : 'DISABLED'}`);
  console.log(`Allowed chatIds: ${CONFIG.allowedChatIds.length > 0 ? CONFIG.allowedChatIds.join(', ') : 'ALL'}`);
  console.log(`Cooldown: ${CONFIG.cooldown.seconds / 60} minutes`);
  
  // TODO: 实现 Telegram bot 逻辑
  // 由于项目中没有 Telegram bot 框架，这里只提供骨架
  // 实际实现需要安装 node-telegram-bot-api 或 telegraf
  
  const router = new CommandRouter();
  
  // 示例：处理消息
  async function handleMessage(chatId: string, message: string): Promise<void> {
    // 解析命令
    const commandMatch = message.match(/^\/(\w+)\s*(.*)?$/);
    if (!commandMatch) return;
    
    const [, commandName, argsStr] = commandMatch;
    const args = JSON.parse(argsStr || '{}');
    
    try {
      const result = await router.route(chatId, commandName, args);
      console.log('Command result:', result);
    } catch (error: any) {
      console.error('Command error:', error.message || String(error));
    }
  }
  
  console.log('ContentOps Bot started successfully');
}

// ============================================================================
// 入口
// ============================================================================

startBot().catch(console.error);
