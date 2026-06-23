#!/bin/bash
# Pre-deployment checks for production
# Usage: bash scripts/preflight-prod.sh
# GUARD: Only runs on production server
set -euo pipefail

# Environment guard
ENV_FILE="/etc/jueshi-environment"
if [ -f "$ENV_FILE" ]; then
    ENV_ROLE=$(grep "^environment=" "$ENV_FILE" | cut -d= -f2)
    if [ "$ENV_ROLE" != "production" ]; then
        echo "❌ FATAL: This script can only run on production server."
        echo "   Current environment: $ENV_ROLE"
        echo "   Expected: production"
        exit 1
    fi
else
    echo "⚠️  Warning: No environment marker found at $ENV_FILE"
fi

VPS="deploy@104.250.109.99"
APP_DIR="/home/deploy/xixiong-saas"
PASS=0; FAIL=0

ok() { echo "  ✅ $1"; PASS=$((PASS+1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL+1)); }

echo "=== Production Pre-Flight Check ==="
echo "Server: $VPS"
echo "App: $APP_DIR"
echo "PM2: xixiong-saas (production)"
echo ""

# Check SSH
if ssh -o ConnectTimeout=5 "$VPS" "echo ok" >/dev/null 2>&1; then
    ok "SSH connection"
else
    fail "SSH connection"
    exit 1
fi

# Check PM2
PM2_STATUS=$(ssh "$VPS" "pm2 jlist" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['pm2_env']['status'])" 2>/dev/null || echo "error")
if [ "$PM2_STATUS" = "online" ]; then
    ok "PM2 xixiong-saas online"
else
    fail "PM2 status: $PM2_STATUS"
fi

# Check Nginx
NGINX_STATUS=$(ssh "$VPS" "sudo systemctl is-active nginx" 2>/dev/null || echo "error")
if [ "$NGINX_STATUS" = "active" ]; then
    ok "Nginx active"
else
    fail "Nginx status: $NGINX_STATUS"
fi

# Check disk
DISK_FREE=$(ssh "$VPS" "df / | tail -1 | awk '{print \$4}'" 2>/dev/null || echo "0")
if [ "$DISK_FREE" -gt 5242880 ]; then
    ok "Disk space (>5GB free)"
else
    fail "Disk space low: ${DISK_FREE}KB"
fi

# Check HTTPS
HTTP_CODE=$(curl -sI -o /dev/null -w "%{http_code}" "https://jueshi.net/" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    ok "HTTPS jueshi.net → 200"
else
    fail "HTTPS jueshi.net → $HTTP_CODE"
fi

# Check admin protection
ADMIN_CODE=$(curl -sI -o /dev/null -w "%{http_code}" "https://jueshi.net/admin" 2>/dev/null || echo "000")
if [ "$ADMIN_CODE" = "200" ]; then
    ok "Admin route accessible (login redirect)"
else
    fail "Admin route → $ADMIN_CODE"
fi

echo ""
echo "=== Summary: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
