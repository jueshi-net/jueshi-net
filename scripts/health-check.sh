#!/bin/bash
# Health check script for jueshi.net with alerting, dedup, and reminder cycle
# Usage: bash scripts/health-check.sh
#
# Dedup logic:
# - Same failure state: alert once, then silent for 60 minutes (reminder cycle)
# - State change (new failure, escalation, recovery): immediate alert
# - Recovery: one-time notification, no repeat

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
NGINX_OFFSET_FILE="$LOG_DIR/nginx-offset.txt"

mkdir -p "$LOG_DIR"

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
EPOCH=$(date +%s)
HOSTNAME=$(hostname)

# Reminder cycle: 60 minutes = 3600 seconds
REMINDER_INTERVAL=3600

# Initialize state file if not exists
if [ ! -f "$STATE_FILE" ]; then
    echo '{}' > "$STATE_FILE"
fi

# Read previous state
PREV_STATE=$(cat "$STATE_FILE")

# Current state to build
CURRENT_STATE="{}"

# Arrays for this run
declare -A CHECK_STATUS   # name -> status (ok/warning/critical)
declare -A CHECK_MESSAGE  # name -> message
ALERTS=()                 # names of non-ok checks
ALERT_DETAILS=()          # "name: message" for non-ok checks

echo "=== Health Check: $TIMESTAMP ===" >> "$LOG_FILE"

# Helper: record check result
record_check() {
    local name="$1"
    local status="$2"  # ok, warning, critical
    local message="$3"

    echo "[$status] $name: $message" >> "$LOG_FILE"

    CHECK_STATUS["$name"]="$status"
    CHECK_MESSAGE["$name"]="$message"

    if [ "$status" != "ok" ]; then
        ALERTS+=("$name")
        ALERT_DETAILS+=("$name: $message")
    fi

    # Update current state JSON
    CURRENT_STATE=$(echo "$CURRENT_STATE" | jq \
        --arg name "$name" \
        --arg status "$status" \
        --arg msg "$message" \
        --argjson time "$EPOCH" \
        '.[$name] = {"status": $status, "message": $msg, "time": $time}')
}

# === CHECKS ===

# 1. HTTPS homepage
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://jueshi.net 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    record_check "homepage" "ok" "HTTP 200"
else
    record_check "homepage" "critical" "HTTP $HTTP_CODE"
fi

# 2. /resources
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://jueshi.net/resources 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    record_check "resources" "ok" "HTTP 200"
else
    record_check "resources" "critical" "HTTP $HTTP_CODE"
fi

# 3. /tracking
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://jueshi.net/tracking 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    record_check "tracking" "ok" "HTTP 200"
else
    record_check "tracking" "critical" "HTTP $HTTP_CODE"
fi

# 4. PM2 status
cd /home/deploy/xixiong-saas
PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="xixiong-saas") | .pm2_env.status' 2>/dev/null || echo "unknown")
if [ "$PM2_STATUS" = "online" ]; then
    record_check "pm2" "ok" "online"
else
    record_check "pm2" "critical" "status: $PM2_STATUS"
fi

# 5. PostgreSQL connection
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    record_check "postgresql" "ok" "connection successful"
else
    record_check "postgresql" "critical" "connection failed"
fi

# 6. Disk usage with tiered thresholds
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ] 2>/dev/null; then
    record_check "disk" "ok" "${DISK_USAGE}% used"
elif [ "$DISK_USAGE" -lt 90 ] 2>/dev/null; then
    record_check "disk" "warning" "${DISK_USAGE}% used"
elif [ "$DISK_USAGE" -lt 95 ] 2>/dev/null; then
    record_check "disk" "critical" "${DISK_USAGE}% used"
else
    record_check "disk" "critical" "${DISK_USAGE}% used (EMERGENCY)"
fi

# 7. SSL certificate expiry
EXPIRY_DATE=$(echo | openssl s_client -servername jueshi.net -connect jueshi.net:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2 || echo "")
if [ -n "$EXPIRY_DATE" ]; then
    EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s 2>/dev/null || echo "0")
    CURRENT_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
    if [ "$DAYS_LEFT" -gt 14 ]; then
        record_check "ssl" "ok" "${DAYS_LEFT} days remaining"
    elif [ "$DAYS_LEFT" -gt 7 ]; then
        record_check "ssl" "warning" "${DAYS_LEFT} days remaining"
    else
        record_check "ssl" "critical" "${DAYS_LEFT} days remaining"
    fi
else
    record_check "ssl" "critical" "cannot read certificate"
fi

# 8. Nginx 5xx errors — incremental (only new errors since last check)
NGINX_LOG="/var/log/nginx/access.log"
if [ -f "$NGINX_LOG" ]; then
    # Get last read offset
    LAST_OFFSET=0
    if [ -f "$NGINX_OFFSET_FILE" ]; then
        LAST_OFFSET=$(cat "$NGINX_OFFSET_FILE" 2>/dev/null || echo "0")
    fi

    # Get current file size
    CURRENT_SIZE=$(stat -c%s "$NGINX_LOG" 2>/dev/null || echo "0")

    # If file was rotated (current size < last offset), reset
    if [ "$CURRENT_SIZE" -lt "$LAST_OFFSET" ] 2>/dev/null; then
        LAST_OFFSET=0
    fi

    # Count new 5xx errors since last offset
    if [ "$CURRENT_SIZE" -gt "$LAST_OFFSET" ] 2>/dev/null; then
        ERROR_COUNT=$(sudo tail -c +$((LAST_OFFSET + 1)) "$NGINX_LOG" 2>/dev/null | grep -cE ' HTTP/1\.[01]" 5[0-9]{2} ' 2>/dev/null || true)
    else
        ERROR_COUNT=0
    fi
    ERROR_COUNT=${ERROR_COUNT:-0}
    # Ensure it's a clean number (no newlines)
    ERROR_COUNT=$(echo "$ERROR_COUNT" | tr -d '[:space:]')

    # Save current offset
    echo "$CURRENT_SIZE" > "$NGINX_OFFSET_FILE"
else
    ERROR_COUNT=0
fi

ERROR_COUNT=${ERROR_COUNT:-0}
if [ "$ERROR_COUNT" -eq 0 ] 2>/dev/null; then
    record_check "nginx_5xx" "ok" "no new 5xx errors"
elif [ "$ERROR_COUNT" -lt 5 ] 2>/dev/null; then
    record_check "nginx_5xx" "warning" "$ERROR_COUNT new 5xx errors since last check"
else
    record_check "nginx_5xx" "critical" "$ERROR_COUNT new 5xx errors since last check"
fi

# === DEDUP LOGIC ===
# Build current alert signature (sorted list of "name:status:message")
ALERT_SIG=""
for name in "${ALERTS[@]}"; do
    ALERT_SIG+="${name}:${CHECK_STATUS[$name]}:${CHECK_MESSAGE[$name]}|"
done
# Sort for stable comparison
ALERT_SIG=$(echo "$ALERT_SIG" | tr '|' '\n' | sort | tr '\n' '|' | head -c -1)
ALERT_HASH=$(echo -n "$ALERT_SIG" | md5sum | cut -d' ' -f1)

# Determine what to send
SHOULD_SEND_ALERT=false
SEND_REASON=""

if [ ${#ALERTS[@]} -gt 0 ]; then
    # Get previous alert info from state
    PREV_ALERT_HASH=$(echo "$PREV_STATE" | jq -r '._alert_hash // ""')
    PREV_ALERT_TIME=$(echo "$PREV_STATE" | jq -r '._alert_time // 0')
    PREV_REMINDER_TIME=$(echo "$PREV_STATE" | jq -r '._reminder_time // 0')

    TIME_SINCE_LAST=$((EPOCH - PREV_ALERT_TIME))
    TIME_SINCE_REMINDER=$((EPOCH - PREV_REMINDER_TIME))

    if [ "$ALERT_HASH" != "$PREV_ALERT_HASH" ]; then
        # State changed (new failure, escalation, de-escalation) — send immediately
        SHOULD_SEND_ALERT=true
        SEND_REASON="state_changed"
    elif [ "$TIME_SINCE_LAST" -ge "$REMINDER_INTERVAL" ] && [ "$TIME_SINCE_REMINDER" -ge "$REMINDER_INTERVAL" ]; then
        # Same state but 60+ minutes since last reminder — send reminder
        SHOULD_SEND_ALERT=true
        SEND_REASON="reminder"
    else
        # Same state, within reminder interval — skip
        echo "[dedup] Skipping alert: same state, last sent ${TIME_SINCE_LAST}s ago" >> "$LOG_FILE"
    fi
fi

# Save current state with alert metadata
STATE_TO_SAVE="$CURRENT_STATE"
if [ "$SHOULD_SEND_ALERT" = true ]; then
    STATE_TO_SAVE=$(echo "$STATE_TO_SAVE" | jq \
        --arg hash "$ALERT_HASH" \
        --argjson time "$EPOCH" \
        --argjson reminder "$EPOCH" \
        '._alert_hash = $hash | ._alert_time = $time | ._reminder_time = $reminder')
else
    # Preserve previous alert metadata
    STATE_TO_SAVE=$(echo "$STATE_TO_SAVE" | jq \
        --arg hash "${PREV_ALERT_HASH:-$ALERT_HASH}" \
        --argjson time "${PREV_ALERT_TIME:-$EPOCH}" \
        --argjson reminder "${PREV_REMINDER_TIME:-$EPOCH}" \
        '._alert_hash = $hash | ._alert_time = $time | ._reminder_time = $reminder')
fi
echo "$STATE_TO_SAVE" | jq '.' > "$STATE_FILE"

# === SEND ALERT (if needed) ===
if [ "$SHOULD_SEND_ALERT" = true ]; then
    echo "🚨 ALERTS [$SEND_REASON] at $TIMESTAMP on $HOSTNAME" >> "$ALERT_LOG"
    for detail in "${ALERT_DETAILS[@]}"; do
        echo "  - $detail" >> "$ALERT_LOG"
    done
    echo "" >> "$ALERT_LOG"

    # Build alert message with REAL newlines (using printf)
    ALERT_MSG="🚨 jueshi.net Health Check Alerts"
    if [ "$SEND_REASON" = "reminder" ]; then
        ALERT_MSG="⏰ jueshi.net Health Check Reminder (60min)"
    fi
    ALERT_MSG+=$'\n'"Host: $HOSTNAME"
    ALERT_MSG+=$'\n'"Time: $TIMESTAMP"
    ALERT_MSG+=$'\n'
    ALERT_MSG+=$'\n'"Failures:"
    for detail in "${ALERT_DETAILS[@]}"; do
        ALERT_MSG+=$'\n'"  • $detail"
    done
    ALERT_MSG+=$'\n'
    ALERT_MSG+=$'\n'"Disk: ${DISK_USAGE}%"
    ALERT_MSG+=$'\n'"PM2: $PM2_STATUS"

    # Telegram alert (use --data-urlencode for proper encoding)
    if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
            --data-urlencode "text=${ALERT_MSG}" > /dev/null 2>&1
        echo "[telegram] Alert sent ($SEND_REASON)" >> "$LOG_FILE"
    fi

    echo "Sent ${#ALERTS[@]} alerts ($SEND_REASON)" >> "$LOG_FILE"
elif [ ${#ALERTS[@]} -gt 0 ]; then
    echo "[dedup] ${#ALERTS[@]} alerts suppressed (same state, within reminder interval)" >> "$LOG_FILE"
else
    echo "✅ All checks passed" >> "$LOG_FILE"
fi

# === RECOVERY DETECTION ===
RECOVERED_ITEMS=()
for item in $(echo "$PREV_STATE" | jq -r 'to_entries[] | select(.key != "_alert_hash" and .key != "_alert_time" and .key != "_reminder_time") | select(.value.status != "ok") | .key' 2>/dev/null); do
    CURRENT_STATUS="${CHECK_STATUS[$item]:-unknown}"
    if [ "$CURRENT_STATUS" = "ok" ]; then
        RECOVERED_ITEMS+=("$item")
    fi
done

if [ ${#RECOVERED_ITEMS[@]} -gt 0 ]; then
    # Check if we already sent recovery for these items
    PREV_RECOVERY=$(echo "$PREV_STATE" | jq -r '._recovery_sent // ""')
    RECOVERY_KEY=$(printf '%s,' "${RECOVERED_ITEMS[@]}" | sort)

    if [ "$RECOVERY_KEY" != "$PREV_RECOVERY" ]; then
        # New recovery — send notification
        RECOVERY_MSG="✅ jueshi.net Health Check Recovery"
        RECOVERY_MSG+=$'\n'"Host: $HOSTNAME"
        RECOVERY_MSG+=$'\n'"Time: $TIMESTAMP"
        RECOVERY_MSG+=$'\n'
        RECOVERY_MSG+=$'\n'"Recovered:"
        for item in "${RECOVERED_ITEMS[@]}"; do
            RECOVERY_MSG+=$'\n'"  • $item"
        done

        echo "✅ RECOVERY at $TIMESTAMP: ${RECOVERED_ITEMS[*]}" >> "$ALERT_LOG"

        # Telegram recovery
        if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
            curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
                --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
                --data-urlencode "text=${RECOVERY_MSG}" > /dev/null 2>&1
            echo "[telegram] Recovery sent for: ${RECOVERED_ITEMS[*]}" >> "$LOG_FILE"
        fi

        # Update recovery tracking in state
        jq --arg key "$RECOVERY_KEY" '._recovery_sent = $key' "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"

        echo "Sent recovery notification for: ${RECOVERED_ITEMS[*]}" >> "$LOG_FILE"
    else
        echo "[dedup] Recovery already sent for: ${RECOVERED_ITEMS[*]}" >> "$LOG_FILE"
    fi
else
    # No recovery — clear recovery tracking if all items are ok
    ALL_OK=true
    for name in "${!CHECK_STATUS[@]}"; do
        if [ "${CHECK_STATUS[$name]}" != "ok" ]; then
            ALL_OK=false
            break
        fi
    done
    if [ "$ALL_OK" = true ]; then
        jq '._recovery_sent = ""' "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
    fi
fi

echo "---" >> "$LOG_FILE"
exit 0
