#!/bin/bash
# ContentOps Bot Startup Script with Whitelist
# Fail-closed: only whitelisted Chat IDs can use the bot

# Read secrets from Keychain
BRIDGE_SECRET=$(security find-generic-password -s 'jueshi-contentops-bridge' -a 'staging' -w 2>/dev/null)
BOT_TOKEN=$(security find-generic-password -s 'jueshi-contentops-telegram' -a 'fabuxia_bot' -w 2>/dev/null)

if [ -z "$BRIDGE_SECRET" ]; then
  echo "ERROR: Could not read bridge secret from Keychain"
  exit 1
fi

if [ -z "$BOT_TOKEN" ]; then
  echo "ERROR: Could not read bot token from Keychain"
  exit 1
fi

# Whitelist: only authorized Chat IDs (fail-closed)
# User's Telegram Chat ID from Hermes memory
export CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS="8602323654"
export CONTENTOPS_BRIDGE_SECRET=*** export CONTENTOPS_BOT_TOKEN=*** export CONTENTOPS_BRIDGE_URL="https://i.jueshi.net/api/internal/contentops/drafts"
export LOCAL_HERMES_ENABLED="true"
export LOCAL_HERMES_PATH="/Users/chq/.hermes/hermes-agent/venv/bin/hermes"

echo "ContentOps Bot starting with whitelist: $CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS"

cd /Users/chq/xixiong-saas
exec npx tsx scripts/contentops/contentops-telegram-bot.ts
