#!/bin/bash
# ContentOps Telegram Bot 启动脚本
# 设置环境变量并启动 bot

cd /Users/chq/xixiong-saas

# 设置环境变量
export CONTENTOPS_BRIDGE_URL=https://i.jueshi.net/api/internal/contentops/drafts
export CONTENTOPS_BOT_ENABLED=true
export CONTENTOPS_DRAFT_ALLOW_PRODUCTION=true
export CONTENTOPS_PUBLICATION_ALLOWED=false

# 启动 bot
exec /Users/chq/.hermes/node/bin/npx tsx scripts/contentops/contentops-telegram-bot.ts
