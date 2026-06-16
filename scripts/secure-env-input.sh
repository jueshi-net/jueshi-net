#!/bin/bash
# Secure secret input script for jueshi.net production config
# Usage: bash /tmp/secure-env-input.sh
# This script uses read -s to hide input and prevents shell history logging.

set -e
ENV_FILE="/home/deploy/xixiong-saas/.env.production"
BACKUP="${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

echo "=== jueshi.net Secure Environment Configuration ==="
echo ""
echo "This script will securely add/update environment variables."
echo "Input will be hidden (no echo)."
echo "Nothing will be saved to shell history."
echo ""

# Backup
cp "$ENV_FILE" "$BACKUP"
echo "✅ Backup created: $BACKUP"
echo ""

# Function to add or update a variable
set_var() {
    local var_name="$1"
    local prompt="$2"
    
    # Check if variable already exists
    if grep -q "^${var_name}=" "$ENV_FILE" 2>/dev/null; then
        echo "⚠️  $var_name already exists. Replace? [y/N]"
        read -r answer
        if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
            sed -i "/^${var_name}=/d" "$ENV_FILE"
        else
            echo "   Skipped $var_name"
            return
        fi
    fi
    
    echo ""
    echo "$prompt"
    echo "(input hidden, press Enter when done)"
    read -s -r secret_value
    echo ""
    
    if [ -z "$secret_value" ]; then
        echo "   ⚠️  Empty input, skipped $var_name"
        return
    fi
    
    echo "${var_name}=${secret_value}" >> "$ENV_FILE"
    echo "✅ $var_name configured"
    unset secret_value
}

# Configure variables
set_var "ALERT_CHANNEL" "1. Alert channel (default: telegram):"
# If user just presses enter, set default
if ! grep -q "^ALERT_CHANNEL=" "$ENV_FILE" 2>/dev/null; then
    echo "ALERT_CHANNEL=telegram" >> "$ENV_FILE"
    echo "✅ ALERT_CHANNEL set to telegram (default)"
fi

set_var "TELEGRAM_BOT_TOKEN" "2. Telegram Bot Token (from @BotFather):"
set_var "TELEGRAM_CHAT_ID" "3. Telegram Chat ID:"
set_var "RESEND_API_KEY" "4. Resend API Key (from resend.com):"

# Set static values
if ! grep -q "^MAIL_FROM=" "$ENV_FILE" 2>/dev/null; then
    echo "MAIL_FROM=hello@jueshi.net" >> "$ENV_FILE"
    echo "✅ MAIL_FROM set to hello@jueshi.net"
fi

if ! grep -q "^MAIL_FROM_NAME=" "$ENV_FILE" 2>/dev/null; then
    echo "MAIL_FROM_NAME=绝世百宝箱" >> "$ENV_FILE"
    echo "✅ MAIL_FROM_NAME set to 绝世百宝箱"
fi

# Fix permissions
chmod 600 "$ENV_FILE"
echo ""
echo "✅ .env.production permissions set to 600"

# Verify
echo ""
echo "=== Verification ==="
echo "Configured variables:"
for var in ALERT_CHANNEL TELEGRAM_BOT_TOKEN TELEGRAM_CHAT_ID RESEND_API_KEY MAIL_FROM MAIL_FROM_NAME; do
    if grep -q "^${var}=" "$ENV_FILE" 2>/dev/null; then
        val=$(grep "^${var}=" "$ENV_FILE" | cut -d= -f2-)
        len=${#val}
        if [ "$len" -gt 8 ]; then
            echo "  ✅ $var = ${val:0:4}...${val: -4} (${len} chars)"
        else
            echo "  ✅ $var = configured (${len} chars)"
        fi
    else
        echo "  ❌ $var = NOT CONFIGURED"
    fi
done

echo ""
echo "=== Done ==="
echo "Next step: restart PM2 to load new env vars"
echo "  cd /home/deploy/xixiong-saas && pm2 restart xixiong-saas --update-env"
