#!/usr/bin/env tsx
/**
 * ContentOps Telegram Bot - Production Runtime
 * 
 * Connects to Telegram and handles draft creation commands.
 */

import TelegramBot from 'node-telegram-bot-api';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  enabled: process.env.CONTENTOPS_BOT_ENABLED === 'true',
  botToken: process.env.CONTENTOPS_TELEGRAM_BOT_TOKEN,
  allowProduction: process.env.CONTENTOPS_DRAFT_ALLOW_PRODUCTION === 'true',
  allowedChatIds: (process.env.CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS || '').split(',').filter(Boolean),
  publicationAllowed: process.env.CONTENTOPS_PUBLICATION_ALLOWED === 'true',
  cooldown: {
    seconds: 1800, // 30 minutes
  },
};

// ============================================================================
// Audit Logger
// ============================================================================

const AUDIT_LOG_DIR = '/home/deploy/xixiong-saas/logs/contentops-audit';

function ensureAuditLogDir(): void {
  if (!existsSync(AUDIT_LOG_DIR)) {
    mkdirSync(AUDIT_LOG_DIR, { recursive: true });
  }
}

function writeAuditLog(entry: Record<string, any>): void {
  ensureAuditLogDir();
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, ...entry };
  const logFile = `${AUDIT_LOG_DIR}/audit-${timestamp.split('T')[0]}.log`;
  appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

// ============================================================================
// Command Router
// ============================================================================

interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

class CommandRouter {
  private cooldowns = new Map<string, number>();

  async route(chatId: string, command: string, args: any): Promise<CommandResult> {
    // Check if chat is allowed
    if (CONFIG.allowedChatIds.length > 0 && !CONFIG.allowedChatIds.includes(chatId)) {
      writeAuditLog({ action: 'unauthorized_access', chatId, command });
      return { success: false, message: 'Unauthorized' };
    }

    // Check cooldown
    const lastCommand = this.cooldowns.get(chatId) || 0;
    const now = Date.now();
    if (now - lastCommand < CONFIG.cooldown.seconds * 1000) {
      const remaining = Math.ceil((CONFIG.cooldown.seconds * 1000 - (now - lastCommand)) / 1000 / 60);
      return { success: false, message: `Rate limit. Try again in ${remaining} minutes.` };
    }

    // Forbidden commands
    const forbiddenCommands = ['deploy', 'restart', 'migrate', 'db_push', 'sql', 'delete', 'publish', 'git_pull', 'build', 'env', 'shell'];
    if (forbiddenCommands.includes(command)) {
      writeAuditLog({ action: 'blocked_command', chatId, command });
      return { success: false, message: `Command /${command} is not allowed` };
    }

    // Update cooldown
    this.cooldowns.set(chatId, now);

    // Route commands
    switch (command) {
      case 'create_draft':
        return await this.handleCreateDraft(chatId, args);
      case 'confirm':
        return await this.handleConfirm(chatId, args);
      case 'status':
        return this.handleStatus();
      default:
        return { success: false, message: `Unknown command: /${command}` };
    }
  }

  private async handleCreateDraft(chatId: string, args: any): Promise<CommandResult> {
    const { type, title, slug, content } = args;
    
    if (!type || !title || !slug) {
      return { success: false, message: 'Missing required fields: type, title, slug' };
    }

    // Generate dry-run summary
    const summary = {
      type,
      title,
      slug,
      status: 'draft',
      robots: 'noindex,nofollow',
      seo: args.seo || {},
      faq: args.faq || [],
      internalLinks: args.internalLinks || [],
    };

    writeAuditLog({
      action: 'draft_dry_run',
      chatId,
      type,
      slug,
      summary,
    });

    return {
      success: true,
      message: `Dry-run summary:\n\nType: ${type}\nTitle: ${title}\nSlug: ${slug}\nStatus: draft\nRobots: noindex,nofollow\n\nReply /confirm to create this draft.`,
      data: summary,
    };
  }

  private async handleConfirm(chatId: string, args: any): Promise<CommandResult> {
    if (!CONFIG.allowProduction) {
      return { success: false, message: 'Production draft creation is disabled' };
    }

    const { type, title, slug, content, seo, faq, internalLinks } = args;

    if (!type || !title || !slug) {
      return { success: false, message: 'Missing required fields' };
    }

    // Create draft in database
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const draftId = createHash('sha256').update(`${type}-${slug}-${Date.now()}`).digest('hex').substring(0, 16);

      let result;
      if (type === 'checklist') {
        result = await prisma.checklist.create({
          data: {
            id: draftId,
            slug,
            title,
            content: content || {},
            status: 'draft',
            robots: 'noindex,nofollow',
            publishedAt: null,
            metadataJson: {
              contentOps: {
                seo: seo || {},
                faq: faq || [],
                internalLinks: internalLinks || [],
              },
            },
          },
        });
      } else if (type === 'guide') {
        result = await prisma.guide.create({
          data: {
            id: draftId,
            slug,
            title,
            content: content || {},
            status: 'draft',
            robots: 'noindex,nofollow',
            publishedAt: null,
            metadataJson: {
              contentOps: {
                seo: seo || {},
                faq: faq || [],
                internalLinks: internalLinks || [],
              },
            },
          },
        });
      } else if (type === 'topic') {
        result = await prisma.topic.create({
          data: {
            id: draftId,
            slug,
            title,
            content: content || {},
            status: 'draft',
            robots: 'noindex,nofollow',
            publishedAt: null,
            metadataJson: {
              contentOps: {
                seo: seo || {},
                faq: faq || [],
                internalLinks: internalLinks || [],
              },
            },
          },
        });
      } else {
        return { success: false, message: `Unknown type: ${type}` };
      }

      await prisma.$disconnect();

      writeAuditLog({
        action: 'draft_created',
        chatId,
        type,
        slug,
        draftId,
        production: true,
      });

      const adminUrl = `https://jueshi.net/admin/content/${type}s/${draftId}/edit`;
      const previewUrl = `https://jueshi.net/${type}s/${slug}?preview=true`;

      return {
        success: true,
        message: `Draft created successfully!\n\nDraft ID: ${draftId}\nAdmin: ${adminUrl}\nPreview: ${previewUrl}`,
        data: { draftId, adminUrl, previewUrl },
      };
    } catch (error: any) {
      writeAuditLog({
        action: 'draft_creation_failed',
        chatId,
        type,
        slug,
        error: error.message,
      });
      return { success: false, message: `Failed to create draft: ${error.message}` };
    }
  }

  private handleStatus(): CommandResult {
    return {
      success: true,
      message: `ContentOps Bot Status:\n- Enabled: ${CONFIG.enabled}\n- Production Draft: ${CONFIG.allowProduction ? 'ENABLED' : 'DISABLED'}\n- Publication: ${CONFIG.publicationAllowed ? 'ALLOWED' : 'DISABLED'}\n- Allowed Chat IDs: ${CONFIG.allowedChatIds.length > 0 ? CONFIG.allowedChatIds.join(', ') : 'ALL'}`,
    };
  }
}

// ============================================================================
// Bot Entry Point
// ============================================================================

async function startBot(): Promise<void> {
  // Check if enabled
  if (!CONFIG.enabled) {
    console.log('ContentOps Bot is disabled. Set CONTENTOPS_BOT_ENABLED=true to enable.');
    return;
  }

  // Check token
  if (!CONFIG.botToken) {
    console.error('CONTENTOPS_TELEGRAM_BOT_TOKEN is required');
    process.exit(1);
  }

  console.log('Starting ContentOps Bot...');
  console.log(`Production draft creation: ${CONFIG.allowProduction ? 'ENABLED' : 'DISABLED'}`);
  console.log(`Allowed chatIds: ${CONFIG.allowedChatIds.length > 0 ? CONFIG.allowedChatIds.join(', ') : 'ALL'}`);
  console.log(`Cooldown: ${CONFIG.cooldown.seconds / 60} minutes`);

  // Create Telegram bot instance
  const bot = new TelegramBot(CONFIG.botToken, { polling: true });
  const router = new CommandRouter();

  // Store pending drafts for confirmation
  const pendingDrafts = new Map<string, any>();

  // Handle messages
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id.toString();
    const text = msg.text || '';

    // Check if chat is allowed
    if (CONFIG.allowedChatIds.length > 0 && !CONFIG.allowedChatIds.includes(chatId)) {
      return;
    }

    console.log(`Message from ${chatId}: ${text}`);

    // Parse commands
    if (text.startsWith('/create_draft')) {
      // Extract JSON args from message
      const argsMatch = text.match(/\/create_draft\s+(.*)/s);
      if (!argsMatch) {
        await bot.sendMessage(chatId, 'Usage: /create_draft {type, title, slug, content, seo, faq, internalLinks}');
        return;
      }

      try {
        const args = JSON.parse(argsMatch[1]);
        const result = await router.route(chatId, 'create_draft', args);
        
        if (result.success) {
          pendingDrafts.set(chatId, args);
          await bot.sendMessage(chatId, result.message);
        } else {
          await bot.sendMessage(chatId, result.message);
        }
      } catch (error: any) {
        await bot.sendMessage(chatId, `Error: ${error.message}`);
      }
    } else if (text.startsWith('/confirm')) {
      const pending = pendingDrafts.get(chatId);
      if (!pending) {
        await bot.sendMessage(chatId, 'No pending draft. Use /create_draft first.');
        return;
      }

      const result = await router.route(chatId, 'confirm', pending);
      await bot.sendMessage(chatId, result.message);
      
      if (result.success) {
        pendingDrafts.delete(chatId);
      }
    } else if (text.startsWith('/status')) {
      const result = await router.route(chatId, 'status', {});
      await bot.sendMessage(chatId, result.message);
    } else if (text.startsWith('/')) {
      const command = text.split(' ')[0].substring(1);
      const result = await router.route(chatId, command, {});
      await bot.sendMessage(chatId, result.message);
    }
  });

  console.log('ContentOps Bot started successfully');
  console.log('Listening for Telegram messages...');
}

// ============================================================================
// Entry
// ============================================================================

startBot().catch((error) => {
  console.error('Bot failed to start:', error);
  process.exit(1);
});
