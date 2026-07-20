#!/bin/bash
# Deploy to staging server (192.129.155.149)
# Usage: bash scripts/deploy-staging.sh
# MUST only run on staging server
set -euo pipefail

STAGING_SERVER="deploy@192.129.155.149"
STAGING_DIR="/home/deploy/xixiong-saas-staging"
PM2_APP="xixiong-staging"

# P2 Deploy Guard: Check staging environment first
echo "=== [0/5] Pre-deploy staging environment check ==="
if ! bash scripts/check-staging.sh; then
    echo "❌ Staging environment check failed. Aborting deployment."
    exit 1
fi
echo "✅ Staging environment verified"
echo ""

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

# ============================================================
# STAGING DATABASE GUARD — prevents connecting to wrong database
# ============================================================
echo "=== [0.5/5] Staging database target guard ==="

# Parse DATABASE_URL from .env.staging (local copy or remote)
STAGING_ENV_FILE=".env.staging"
if [ ! -f "$STAGING_ENV_FILE" ]; then
    echo "❌ STAGING_DATABASE_GUARD_FAILED: .env.staging not found locally"
    exit 21
fi

# Extract database name from DATABASE_URL (safe: no password/user output)
STAGING_DB_NAME=$(grep '^DATABASE_URL=' "$STAGING_ENV_FILE" | \
    sed 's/^DATABASE_URL=//' | \
    sed 's/^"//' | sed 's/"$//' | \
    sed 's/^postgresql:\/\///' | sed 's/^postgres:\/\///' | \
    sed 's/^[^@]*@//' | \
    sed 's/^[^/]*\///' | \
    sed 's/?.*$//')

if [ -z "$STAGING_DB_NAME" ]; then
    echo "❌ STAGING_DATABASE_GUARD_FAILED: Could not parse database name from DATABASE_URL"
    exit 22
fi

# Forbidden database names for staging
FORBIDDEN_NAMES="bxb_prod xixiong_prod xixiong_production postgres"
for forbidden in $FORBIDDEN_NAMES; do
    if [ "$STAGING_DB_NAME" = "$forbidden" ]; then
        echo "❌ STAGING_DATABASE_GUARD_FAILED: DATABASE_URL points to forbidden database"
        echo "   Parsed database name: $STAGING_DB_NAME"
        echo "   Expected: xixiong_staging"
        echo "   Forbidden: $FORBIDDEN_NAMES"
        exit 23
    fi
done

# Must be exactly xixiong_staging
if [ "$STAGING_DB_NAME" != "xixiong_staging" ]; then
    echo "❌ STAGING_DATABASE_GUARD_FAILED: Database name mismatch"
    echo "   Parsed database name: $STAGING_DB_NAME"
    echo "   Expected: xixiong_staging"
    exit 24
fi

echo "✅ Database guard: staging DB = xixiong_staging (confirmed)"

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

echo "=== [5/5] Restart PM2 (stale-env-safe) ==="
# Delete old process and start fresh to prevent stale DATABASE_URL pollution
# This fixes the incident where PM2 retained old bxb_prod DATABASE_URL
ssh "$STAGING_SERVER" "cd $STAGING_DIR && \
    set -a && source .env.staging && set +a && \
    export NODE_ENV=production && \
    export PORT=3001 && \
    pm2 delete $PM2_APP 2>/dev/null || true && \
    pm2 start npm --name $PM2_APP -- start && \
    pm2 save"

# Verify PM2 environment after restart
echo "=== [5.5/5] Post-restart PM2 environment verification ==="
REMOTE_DB_NAME=$(ssh "$STAGING_SERVER" "cd $STAGING_DIR && \
    pm2 env \$(pm2 jlist 2>/dev/null | python3 -c 'import sys,json;d=json.load(sys.stdin);[print(p[\"pm_id\"]) for p in d if p[\"name\"]==\"$PM2_APP\"]' 2>/dev/null) 2>/dev/null | \
    grep '^DATABASE_URL:' | \
    sed 's/^DATABASE_URL:.*\\///' | sed 's/?.*$//' | sed 's/.*@//'")

if [ "$REMOTE_DB_NAME" != "xixiong_staging" ]; then
    echo "❌ POST-RESTART GUARD FAILED: PM2 DATABASE_URL still points to wrong database"
    echo "   Parsed remote DB name: $REMOTE_DB_NAME"
    echo "   Expected: xixiong_staging"
    exit 25
fi
echo "✅ Post-restart guard: PM2 DATABASE_URL → xixiong_staging (confirmed)"

echo "=== [6/6] Write deployment manifest ==="
LOCAL_COMMIT=$(git rev-parse HEAD)
DEPLOY_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BUILD_ID=$(ssh "$STAGING_SERVER" "cat $STAGING_DIR/.next/BUILD_ID" 2>/dev/null || echo 'unknown')

ssh "$STAGING_SERVER" "echo '$LOCAL_COMMIT' > $STAGING_DIR/.deployed-commit"
ssh "$STAGING_SERVER" "echo '$DEPLOY_TIME' > $STAGING_DIR/.deployed-at"
ssh "$STAGING_SERVER" "echo '$BUILD_ID' > $STAGING_DIR/.deployed-build-id"

echo ""
echo "=== DEPLOY SUMMARY ==="
echo "  Server: $STAGING_SERVER (staging)"
echo "  PM2 app: $PM2_APP"
echo "  PM2 restarts: $(ssh "$STAGING_SERVER" "pm2 jlist 2>/dev/null | python3 -c 'import sys,json;d=json.load(sys.stdin);[print(p[\"restart_time\"]) for p in d if p[\"name\"]==\"$PM2_APP\"]'" 2>/dev/null || echo 'unknown')"
echo "  Deployed commit: $LOCAL_COMMIT"
echo "  Deployed at: $DEPLOY_TIME"
echo "  Build ID: $BUILD_ID"
echo "  Health: $(ssh "$STAGING_SERVER" "curl -sI http://127.0.0.1:3001/ | head -1" 2>/dev/null || echo 'unknown')"
echo ""
echo "STAGING_GIT_HEAD_NOT_AUTHORITATIVE"
echo "Use .deployed-commit for version verification"
