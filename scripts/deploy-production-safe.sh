#!/bin/bash
# Deploy to production server (104.250.109.99) — SAFE
# Usage: bash scripts/deploy-production-safe.sh
# MUST only run on production server
# REQUIRES user confirmation
set -euo pipefail

PROD_SERVER="deploy@104.250.109.99"
PROD_DIR="/home/deploy/xixiong-saas"
PM2_APP="xixiong-saas"

# Environment guard
ENV_MARKER=$(ssh "$PROD_SERVER" "cat /etc/jueshi-environment 2>/dev/null || echo 'MISSING'")
if ! echo "$ENV_MARKER" | grep -q "environment=production"; then
    echo "❌ FATAL: Target server is NOT production. Aborting."
    exit 1
fi
echo "✅ Environment check: production confirmed"

# User confirmation
echo "⚠️  You are about to deploy to PRODUCTION ($PROD_SERVER)"
echo "⚠️  Domain: jueshi.net"
read -p "Type 'DEPLOY' to confirm: " CONFIRM
if [ "$CONFIRM" != "DEPLOY" ]; then
    echo "❌ Aborted by user"
    exit 1
fi

echo "=== [1/6] Backup ==="
bash scripts/backup-prod.sh

echo "=== [2/6] Sync code ==="
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
    -e "ssh -i ~/.ssh/jueshi-prod-v2" \
    ./ "$PROD_SERVER:$PROD_DIR/"

echo "=== [3/6] Install deps ==="
ssh "$PROD_SERVER" "cd $PROD_DIR && npm ci && npm install --include=dev"

echo "=== [4/6] Prisma + Build ==="
ssh "$PROD_SERVER" "cd $PROD_DIR && set -a && source .env.production && set +a && npx prisma generate && npm run build"

echo "=== [5/6] Restart PM2 ==="
ssh "$PROD_SERVER" "cd $PROD_DIR && set -a && source .env.production && set +a && pm2 restart $PM2_APP --update-env && pm2 save"

echo "=== [6/6] Smoke test ==="
bash scripts/smoke-test.sh --base-url https://jueshi.net

echo ""
echo "=== DEPLOY SUMMARY ==="
echo "  Server: $PROD_SERVER (production)"
echo "  PM2 app: $PM2_APP"
echo "  PM2 restarts: $(ssh "$PROD_SERVER" "pm2 jlist 2>/dev/null | python3 -c 'import sys,json;d=json.load(sys.stdin);[print(p[\"restart_time\"]) for p in d if p[\"name\"]==\"$PM2_APP\"]'" 2>/dev/null || echo 'unknown')"
echo "  Build: $(ssh "$PROD_SERVER" "cat $PROD_DIR/.next/BUILD_ID" 2>/dev/null || echo 'unknown')"
