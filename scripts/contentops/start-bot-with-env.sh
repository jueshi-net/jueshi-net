#!/bin/bash
# ContentOps Bot Startup Script
# Bot uses SSH helper client for each request (no long-lived tunnel)
#
set -e

echo "Starting ContentOps Bot with SSH helper client..."

# Enable Bot
export CONTENTOPS_BOT_ENABLED=true

# Start Bot
cd /Users/chq/xixiong-saas
exec npm exec tsx scripts/contentops/contentops-telegram-bot.ts
