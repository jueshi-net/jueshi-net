#!/bin/bash
# Load production environment first, then bot-specific overrides
set -a

# Load main app production env (includes DATABASE_URL)
[ -f .env.production ] && source .env.production

# Save DATABASE_URL from production
PROD_DATABASE_URL=$DATABASE_URL

# Load bot-specific overrides (must NOT override DATABASE_URL)
[ -f .env.contentops ] && source .env.contentops

# Restore production DATABASE_URL (bot must use same DB as main app)
export DATABASE_URL=$PROD_DATABASE_URL

set +a
export NODE_ENV=production

echo "Bot starting with production DATABASE_URL"
echo "CONTENTOPS_DRAFT_ALLOW_PRODUCTION=$CONTENTOPS_DRAFT_ALLOW_PRODUCTION"

# Start the bot
exec npx tsx scripts/contentops/contentops-telegram-bot.ts
