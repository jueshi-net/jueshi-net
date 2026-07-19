#!/bin/bash
# ContentOps Telegram Bot 启动脚本
# 设置环境变量并启动 bot

cd /Users/chq/xixiong-saas

# 设置环境变量
export CONTENTOPS_BRIDGE_URL=https://i.jueshi.net/api/internal/contentops/drafts
export CONTENTOPS_BOT_ENABLED=true

# 安全强制：禁用 production 发布
export CONTENTOPS_DRAFT_ALLOW_PRODUCTION=false
export CONTENTOPS_PRODUCTION_PUBLISH_ENABLED=false

# 发布权限
export CONTENTOPS_PUBLICATION_ALLOWED=true

# Telegram allowlist (从 Keychain 或环境变量读取)
# 格式: chat_id1,chat_id2
export CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS="${CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS:-}"

# 启动 bot
exec /Users/chq/.hermes/node/bin/npx tsx scripts/contentops/contentops-telegram-bot.ts
