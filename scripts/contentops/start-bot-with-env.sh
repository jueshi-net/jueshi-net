#!/bin/bash
# ContentOps Telegram Bot V1.1 启动脚本
# 安全配置：从 Keychain 读取敏感信息

cd /Users/chq/xixiong-saas

# ============================================================================
# Security Configuration
# ============================================================================

# Bot Token from Keychain (plaintext-free)
export CONTENTOPS_TELEGRAM_BOT_TOKEN=$(security find-generic-password -s jueshi-contentops-telegram -a fabuxia_bot -w 2>/dev/null || echo "")

# Bridge Secret from Keychain
export CONTENTOPS_BRIDGE_SECRET=$(security find-generic-password -s jueshi-contentops -a contentops-bridge -w 2>/dev/null || echo "")

# Bridge URL (staging only)
export CONTENTOPS_BRIDGE_URL=https://i.jueshi.net/api/internal/contentops/drafts

# ============================================================================
# Security Locks (hardcoded, cannot be overridden)
# ============================================================================

# Production publish is ALWAYS disabled
export CONTENTOPS_PRODUCTION_PUBLISH_ENABLED=false
export CONTENTOPS_DRAFT_ALLOW_PRODUCTION=false

# Bot enabled
export CONTENTOPS_BOT_ENABLED=true

# ============================================================================
# Allowlist Configuration
# ============================================================================

# Telegram allowlist - MUST be configured before starting
# Format: chat_id1,chat_id2
# Empty = deny all access
export CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS="${CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS:-}"

# ============================================================================
# Validation
# ============================================================================

if [ -z "$CONTENTOPS_TELEGRAM_BOT_TOKEN" ]; then
  echo "[ContentOps] ERROR: Bot token not found in Keychain"
  exit 1
fi

if [ -z "$CONTENTOPS_BRIDGE_SECRET" ]; then
  echo "[ContentOps] ERROR: Bridge secret not found in Keychain"
  exit 1
fi

if [ -z "$CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS" ]; then
  echo "[ContentOps] WARNING: Allowlist is empty - all access will be denied"
  echo "[ContentOps] Set CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS to enable access"
fi

echo "[ContentOps] Starting bot with secure configuration..."
echo "[ContentOps] Production: DISABLED"
echo "[ContentOps] Allowlist: ${CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS:+configured}"

# ============================================================================
# Launch Bot
# ============================================================================

exec /Users/chq/.hermes/node/bin/npx tsx scripts/contentops/contentops-telegram-bot.ts
