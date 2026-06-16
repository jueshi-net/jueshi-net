#!/bin/bash
# Quick Telegram config - run this ONCE via SSH
# Usage: bash /tmp/config-telegram.sh

ENV_FILE="/home/deploy/xixiong-saas/.env.production"

echo "=== Telegram Alert Configuration ==="
echo ""
echo "Please enter your Telegram Bot Token (from @BotFather):"
echo "(input will be hidden)"
read -s BOT_TOKEN
echo ""

if [ -z "$BOT_TOKEN" ]; then
    echo "❌ Empty token, aborting"
    exit 1
fi

echo "Please enter your Telegram Chat ID (e.g., 8602323654):"
read CHAT_ID

if [ -z "$CHAT_ID" ]; then
    echo "❌ Empty chat ID, aborting"
    exit 1
fi

# Backup
cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Remove existing Telegram config
sed -i '/# Telegram Alert/,/TELEGRAM_CHAT_ID/d' "$ENV_FILE"

# Add new config
echo "" >> "$ENV_FILE"
echo "# Telegram Alert Configuration" >> "$ENV_FILE"
echo "ALERT_CHANNEL=telegram" >> "$ENV_FILE"
echo "TELEGRAM_BOT_TOKEN=$BOT_TOKEN" >> "$ENV_FILE"
echo "TELEGRAM_CHAT_ID=$CHAT_ID" >> "$ENV_FILE"

# Fix permissions
chmod 600 "$ENV_FILE"

# Verify
TOKEN_LEN=$(grep "^TELEGRAM_BOT_TOKEN=" "$ENV_FILE" | cut -d= -f2 | wc -c)
CHAT_LEN=$(grep "^TELEGRAM_CHAT_ID=" "$ENV_FILE" | cut -d= -f2 | wc -c)

echo ""
echo "✅ Configuration complete"
echo "   TELEGRAM_BOT_TOKEN: ${TOKEN_LEN} chars"
echo "   TELEGRAM_CHAT_ID: ${CHAT_LEN} chars"
echo "   .env.production permissions: 600"
echo ""
echo "Testing Telegram connection..."

# Test message
RESULT=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    -d "chat_id=${CHAT_ID}&text=✅ jueshi.net 告警系统配置成功" | grep -o '"ok":true')

if [ "$RESULT" = '"ok":true' ]; then
    echo "✅ Telegram test message sent successfully!"
else
    echo "❌ Telegram test failed. Please check your token and chat ID."
fi

echo ""
echo "Next steps:"
echo "1. Configure Resend API Key: bash /tmp/secure-env-input.sh"
echo "2. Restart PM2: cd /home/deploy/xixiong-saas && pm2 restart xixiong-saas --update-env"
echo "3. Delete this script: rm /tmp/config-telegram.sh"
