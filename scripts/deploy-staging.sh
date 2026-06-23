#!/bin/bash
# Deploy to staging server (192.129.155.149)
# Usage: bash scripts/deploy-staging.sh
# MUST only run on staging server
set -euo pipefail

STAGING_SERVER="deploy@192.129.155.149"
STAGING_DIR="/home/deploy/xixiong-saas-staging"
PM2_APP="xixiong-staging"

# Environment guard
ENV_MARKER=$(ssh "$STAGING_SERVER" "cat /etc/jueshi-environment 2>/dev/null || echo 'MISSING'")
if ! echo "$ENV_MARKER" | grep -q "environment=staging"; then
    echo "❌ FATAL: Target server is NOT staging. Aborting."
    echo "   Expected: environment=staging"
    echo "   Got: $ENV_MARKER"
    exit 1
fi
echo "✅ Environment check: staging confirmed"

# Check PM2 app name
if echo "$ENV_MARKER" | grep -q "allowed_pm2=$PM2_APP"; then
    echo "✅ PM2 app check: $PM2_APP allowed"
else
    echo "❌ FATAL: PM2 app $PM2_APP not allowed on this server"
    exit 1
fi

echo "=== [1/5] Sync code to staging ==="
rsync -avz --progress \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='reports/screenshots' \
    --exclude='.env.local' \
    --exclude='.env.production' \
    --exclude='.env.staging' \
    --exclude='public/uploads' \
    --exclude='.git' \
    --exclude='.deploy-meta.json' \
    --exclude='backups' \
    -e "ssh" \
    ./ "$STAGING_SERVER:$STAGING_DIR/"

echo "=== [2/5] Install dependencies ==="
ssh "$STAGING_SERVER" "cd $STAGING_DIR && npm ci --ignore-scripts && npm install --include=dev"

echo "=== [3/5] Prisma generate ==="
ssh "$STAGING_SERVER" "cd $STAGING_DIR && set -a && source .env.staging && set +a && npx prisma generate"

echo "=== [4/5] Build ==="
ssh "$STAGING_SERVER" "cd $STAGING_DIR && set -a && source .env.staging && set +a && unset NODE_ENV && npm run build"

echo "=== [5/5] Restart PM2 ==="
ssh "$STAGING_SERVER" "cd $STAGING_DIR && set -a && source .env.staging && set +a && PORT=3001 pm2 restart $PM2_APP --update-env && pm2 save"

echo ""
echo "=== DEPLOY SUMMARY ==="
echo "  Server: $STAGING_SERVER (staging)"
echo "  PM2 app: $PM2_APP"
echo "  PM2 restarts: $(ssh "$STAGING_SERVER" "pm2 jlist 2>/dev/null | python3 -c 'import sys,json;d=json.load(sys.stdin);[print(p[\"restart_time\"]) for p in d if p[\"name\"]==\"$PM2_APP\"]'" 2>/dev/null || echo 'unknown')"
echo "  Build: $(ssh "$STAGING_SERVER" "cat $STAGING_DIR/.next/BUILD_ID" 2>/dev/null || echo 'unknown')"
echo "  Health: $(ssh "$STAGING_SERVER" "curl -sI http://127.0.0.1:3001/ | head -1" 2>/dev/null || echo 'unknown')"
