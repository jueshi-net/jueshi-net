#!/bin/bash
# Health check script for jueshi.net
# Usage: bash scripts/health-check.sh

LOG_DIR="/home/deploy/xixiong-saas/logs"
LOG_FILE="$LOG_DIR/health-check.log"
ALERT_FILE="$LOG_DIR/health-alerts.log"

mkdir -p "$LOG_DIR"

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
ALERTS=()

echo "=== Health Check: $TIMESTAMP ===" >> "$LOG_FILE"

# 1. Check HTTPS homepage
echo -n "Checking https://jueshi.net... " >> "$LOG_FILE"
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://jueshi.net)
if [ "$HTTP_CODE" = "200" ]; then
    echo "OK (200)" >> "$LOG_FILE"
else
    echo "FAIL ($HTTP_CODE)" >> "$LOG_FILE"
    ALERTS+=("Homepage returned $HTTP_CODE")
fi

# 2. Check /resources
echo -n "Checking https://jueshi.net/resources... " >> "$LOG_FILE"
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://jueshi.net/resources)
if [ "$HTTP_CODE" = "200" ]; then
    echo "OK (200)" >> "$LOG_FILE"
else
    echo "FAIL ($HTTP_CODE)" >> "$LOG_FILE"
    ALERTS+=("/resources returned $HTTP_CODE")
fi

# 3. Check /tracking
echo -n "Checking https://jueshi.net/tracking... " >> "$LOG_FILE"
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://jueshi.net/tracking)
if [ "$HTTP_CODE" = "200" ]; then
    echo "OK (200)" >> "$LOG_FILE"
else
    echo "FAIL ($HTTP_CODE)" >> "$LOG_FILE"
    ALERTS+=("/tracking returned $HTTP_CODE")
fi

# 4. Check PM2 status
echo -n "Checking PM2 xixiong-saas... " >> "$LOG_FILE"
PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="xixiong-saas") | .pm2_env.status')
if [ "$PM2_STATUS" = "online" ]; then
    echo "OK (online)" >> "$LOG_FILE"
else
    echo "FAIL ($PM2_STATUS)" >> "$LOG_FILE"
    ALERTS+=("PM2 status: $PM2_STATUS")
fi

# 5. Check PostgreSQL connection
echo -n "Checking PostgreSQL... " >> "$LOG_FILE"
cd /home/deploy/xixiong-saas
source .env.production 2>/dev/null
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "OK" >> "$LOG_FILE"
else
    echo "FAIL" >> "$LOG_FILE"
    ALERTS+=("PostgreSQL connection failed")
fi

# 6. Check disk usage
echo -n "Checking disk usage... " >> "$LOG_FILE"
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 85 ]; then
    echo "OK (${DISK_USAGE}%)" >> "$LOG_FILE"
else
    echo "WARNING (${DISK_USAGE}%)" >> "$LOG_FILE"
    ALERTS+=("Disk usage: ${DISK_USAGE}%")
fi

# 7. Check SSL certificate expiry
echo -n "Checking SSL certificate... " >> "$LOG_FILE"
EXPIRY_DATE=$(echo | openssl s_client -servername jueshi.net -connect jueshi.net:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$EXPIRY_DATE" ]; then
    EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s 2>/dev/null)
    CURRENT_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
    if [ "$DAYS_LEFT" -gt 14 ]; then
        echo "OK (${DAYS_LEFT} days)" >> "$LOG_FILE"
    else
        echo "WARNING (${DAYS_LEFT} days)" >> "$LOG_FILE"
        ALERTS+=("SSL expires in ${DAYS_LEFT} days")
    fi
else
    echo "FAIL (cannot read)" >> "$LOG_FILE"
    ALERTS+=("Cannot read SSL certificate")
fi

# 8. Check Nginx 5xx errors (last 5 minutes)
echo -n "Checking Nginx 5xx errors... " >> "$LOG_FILE"
ERROR_COUNT=$(sudo tail -1000 /var/log/nginx/access.log 2>/dev/null | grep -E ' HTTP/1\.[01]" 5[0-9]{2} ' | wc -l)
if [ "$ERROR_COUNT" -lt 10 ]; then
    echo "OK ($ERROR_COUNT errors)" >> "$LOG_FILE"
else
    echo "WARNING ($ERROR_COUNT errors)" >> "$LOG_FILE"
    ALERTS+=("Nginx 5xx errors: $ERROR_COUNT")
fi

# Send alerts if any
if [ ${#ALERTS[@]} -gt 0 ]; then
    echo "🚨 ALERTS DETECTED:" >> "$ALERT_FILE"
    echo "Time: $TIMESTAMP" >> "$ALERT_FILE"
    for alert in "${ALERTS[@]}"; do
        echo "  - $alert" >> "$ALERT_FILE"
    done
    echo "" >> "$ALERT_FILE"
    
    # TODO: Add alert notification here (Telegram/Email/Webhook)
    # Example: curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
    #   -d "chat_id=<CHAT_ID>&text=Health check alerts: ${ALERTS[*]}"
fi

echo "Health check completed. Alerts: ${#ALERTS[@]}" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"
