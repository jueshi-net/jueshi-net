#!/bin/bash
# Health check script for jueshi.net with alerting and dedup
# Usage: bash scripts/health-check.sh

# Load environment
if [ -f /home/deploy/xixiong-saas/.env.production ]; then
    set -a
    source /home/deploy/xixiong-saas/.env.production
    set +a
fi

LOG_DIR="/home/deploy/xixiong-saas/logs"
LOG_FILE="$LOG_DIR/health-check.log"
STATE_FILE="$LOG_DIR/health-check-state.json"
ALERT_LOG="$LOG_DIR/health-alerts.log"

mkdir -p "$LOG_DIR"

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
HOSTNAME=$(hostname)
ALERTS=()
ALERT_DETAILS=()

# Initialize state file if not exists
if [ ! -f "$STATE_FILE" ]; then
    echo '{}' > "$STATE_FILE"
fi

# Read previous state (before any updates)
ORIGINAL_PREV_STATE=$(cat "$STATE_FILE")
CURRENT_STATE="{}"

echo "=== Health Check: $TIMESTAMP ===" >> "$LOG_FILE"

# Helper function to check and record
check_and_record() {
    local name="$1"
    local status="$2"  # ok, warning, critical
    local message="$3"
    
    echo "[$status] $name: $message" >> "$LOG_FILE"
    
    if [ "$status" != "ok" ]; then
        ALERTS+=("$name")
        ALERT_DETAILS+=("$name: $message")
    fi
    
    # Update current state
    CURRENT_STATE=$(echo "$CURRENT_STATE" | jq --arg name "$name" --arg status "$status" --arg msg "$message" '.[$name] = {"status": $status, "message": $msg, "time": now | todate}')
}

# 1. Check HTTPS homepage
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://jueshi.net 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    check_and_record "homepage" "ok" "HTTP 200"
else
    check_and_record "homepage" "critical" "HTTP $HTTP_CODE"
fi

# 2. Check /resources
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://jueshi.net/resources 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    check_and_record "resources" "ok" "HTTP 200"
else
    check_and_record "resources" "critical" "HTTP $HTTP_CODE"
fi

# 3. Check /tracking
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://jueshi.net/tracking 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    check_and_record "tracking" "ok" "HTTP 200"
else
    check_and_record "tracking" "critical" "HTTP $HTTP_CODE"
fi

# 4. Check PM2 status
cd /home/deploy/xixiong-saas
PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="xixiong-saas") | .pm2_env.status' 2>/dev/null || echo "unknown")
if [ "$PM2_STATUS" = "online" ]; then
    check_and_record "pm2" "ok" "online"
else
    check_and_record "pm2" "critical" "status: $PM2_STATUS"
fi

# 5. Check PostgreSQL connection
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    check_and_record "postgresql" "ok" "connection successful"
else
    check_and_record "postgresql" "critical" "connection failed"
fi

# 6. Check disk usage
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    check_and_record "disk" "ok" "${DISK_USAGE}% used"
elif [ "$DISK_USAGE" -lt 90 ]; then
    check_and_record "disk" "warning" "${DISK_USAGE}% used (threshold: 80%)"
else
    check_and_record "disk" "critical" "${DISK_USAGE}% used (threshold: 90%)"
fi

# 7. Check SSL certificate expiry
EXPIRY_DATE=$(echo | openssl s_client -servername jueshi.net -connect jueshi.net:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2 || echo "")
if [ -n "$EXPIRY_DATE" ]; then
    EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s 2>/dev/null || echo "0")
    CURRENT_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
    if [ "$DAYS_LEFT" -gt 14 ]; then
        check_and_record "ssl" "ok" "${DAYS_LEFT} days remaining"
    elif [ "$DAYS_LEFT" -gt 7 ]; then
        check_and_record "ssl" "warning" "${DAYS_LEFT} days remaining (threshold: 14 days)"
    else
        check_and_record "ssl" "critical" "${DAYS_LEFT} days remaining (threshold: 7 days)"
    fi
else
    check_and_record "ssl" "critical" "cannot read certificate"
fi

# 8. Check Nginx 5xx errors (last 5 minutes)
ERROR_COUNT=$(sudo tail -1000 /var/log/nginx/access.log 2>/dev/null | grep -E ' HTTP/1\.[01]" 5[0-9]{2} ' 2>/dev/null | wc -l | tr -d ' ')
ERROR_COUNT=${ERROR_COUNT:-0}
if [ "$ERROR_COUNT" -lt 5 ] 2>/dev/null; then
    check_and_record "nginx_5xx" "ok" "$ERROR_COUNT errors in last 1000 requests"
elif [ "$ERROR_COUNT" -lt 20 ] 2>/dev/null; then
    check_and_record "nginx_5xx" "warning" "$ERROR_COUNT errors in last 1000 requests"
else
    check_and_record "nginx_5xx" "critical" "$ERROR_COUNT errors in last 1000 requests"
fi

# Save current state
echo "$CURRENT_STATE" | jq '.' > "$STATE_FILE"

# === Send alerts for current failures ===
if [ ${#ALERTS[@]} -gt 0 ]; then
    echo "🚨 ALERTS DETECTED at $TIMESTAMP on $HOSTNAME" >> "$ALERT_LOG"
    for detail in "${ALERT_DETAILS[@]}"; do
        echo "  - $detail" >> "$ALERT_LOG"
    done
    echo "" >> "$ALERT_LOG"
    
    # Build alert text
    ALERT_TEXT="🚨 jueshi.net Health Check Alerts\nHost: $HOSTNAME\nTime: $TIMESTAMP\n\nFailures:\n"
    for detail in "${ALERT_DETAILS[@]}"; do
        ALERT_TEXT+="  • $detail\n"
    done
    ALERT_TEXT+="\nDisk: ${DISK_USAGE}%\nPM2: $PM2_STATUS"
    
    # Telegram alert
    if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=${ALERT_TEXT}" > /dev/null 2>&1
    fi
    
    # Discord webhook
    if [ -n "${DISCORD_WEBHOOK_URL:-}" ]; then
        curl -s -X POST "${DISCORD_WEBHOOK_URL}" \
            -H "Content-Type: application/json" \
            -d "{\"content\": \"$(echo -e "$ALERT_TEXT")\"}" > /dev/null 2>&1
    fi
    
    # Generic webhook
    if [ -n "${ALERT_WEBHOOK_URL:-}" ]; then
        curl -s -X POST "${ALERT_WEBHOOK_URL}" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"$(echo -e "$ALERT_TEXT")\", \"host\": \"$HOSTNAME\", \"timestamp\": \"$TIMESTAMP\", \"alerts\": $(printf '%s\n' "${ALERT_DETAILS[@]}" | jq -R . | jq -s .)}" > /dev/null 2>&1
    fi
    
    echo "Sent ${#ALERTS[@]} alerts" >> "$LOG_FILE"
else
    echo "✅ All checks passed" >> "$LOG_FILE"
fi

# === Check for recovery (items that were failing but are now OK) ===
# This runs regardless of whether there are current alerts
RECOVERED_ITEMS=()
for item in $(echo "$ORIGINAL_PREV_STATE" | jq -r 'to_entries[] | select(.value.status != "ok") | .key' 2>/dev/null); do
    CURRENT_STATUS=$(echo "$CURRENT_STATE" | jq -r --arg item "$item" '.[$item].status // "unknown"')
    if [ "$CURRENT_STATUS" = "ok" ]; then
        RECOVERED_ITEMS+=("$item")
    fi
done

if [ ${#RECOVERED_ITEMS[@]} -gt 0 ]; then
    RECOVERY_TEXT="✅ jueshi.net Health Check Recovery\nHost: $HOSTNAME\nTime: $TIMESTAMP\n\nRecovered:\n"
    for item in "${RECOVERED_ITEMS[@]}"; do
        RECOVERY_TEXT+="  • $item\n"
    done
    
    echo "✅ RECOVERY at $TIMESTAMP: ${RECOVERED_ITEMS[*]}" >> "$ALERT_LOG"
    
    # Telegram recovery notification
    if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=${RECOVERY_TEXT}" > /dev/null 2>&1
    fi
    
    # Discord recovery
    if [ -n "${DISCORD_WEBHOOK_URL:-}" ]; then
        curl -s -X POST "${DISCORD_WEBHOOK_URL}" \
            -H "Content-Type: application/json" \
            -d "{\"content\": \"$(echo -e "$RECOVERY_TEXT")\"}" > /dev/null 2>&1
    fi
    
    # Generic webhook recovery
    if [ -n "${ALERT_WEBHOOK_URL:-}" ]; then
        curl -s -X POST "${ALERT_WEBHOOK_URL}" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"$(echo -e "$RECOVERY_TEXT")\", \"host\": \"$HOSTNAME\", \"timestamp\": \"$TIMESTAMP\", \"type\": \"recovery\"}" > /dev/null 2>&1
    fi
    
    echo "Sent recovery notification for: ${RECOVERED_ITEMS[*]}" >> "$LOG_FILE"
fi

echo "---" >> "$LOG_FILE"
exit 0
