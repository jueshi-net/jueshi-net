#!/bin/bash
# Safe deployment script — wraps deploy-production.sh with pre/post checks
# Usage: bash scripts/deploy-safe.sh
#
# This script:
# 1. Runs predeploy-check.sh (local safety checks)
# 2. Runs deploy-production.sh (rsync + VPS build + PM2 restart)
# 3. Verifies deploy-version.json, BUILD_ID, PM2, key pages
# 4. Updates deploy-version.json with correct version/commit/buildId
#
# CRITICAL RULES:
# - Never uses prisma db push
# - Never overwrites .env.production
# - Never syncs node_modules or .next
# - VPS build must pass BEFORE PM2 restart
# - deploy-version.json only updated AFTER successful build + restart

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VPS_HOST="192.129.155.149"
VPS_USER="deploy"
PROJECT_DIR="/home/deploy/xixiong-saas"

# Version info (override with: VERSION=v1.x DEPLOY_COMMIT=abc123 bash scripts/deploy-safe.sh)
VERSION="${VERSION:-v1.20.42.18.5.0}"
DEPLOY_COMMIT="${DEPLOY_COMMIT:-$(git rev-parse --short HEAD)}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Safe Deployment: $VERSION${NC}"
echo -e "${BLUE}  Commit: $DEPLOY_COMMIT${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Pre-deploy check
echo -e "${BLUE}Step 1: Pre-deployment checks${NC}"
if [ -f "$LOCAL_DIR/scripts/predeploy-check.sh" ]; then
    bash "$LOCAL_DIR/scripts/predeploy-check.sh" || {
        echo -e "${RED}✗ Pre-deploy check failed. Aborting.${NC}"
        exit 1
    }
else
    echo -e "${YELLOW}⚠ predeploy-check.sh not found, skipping${NC}"
fi
echo ""

# Step 2: Run existing deploy-production.sh (rsync + build + PM2 restart)
echo -e "${BLUE}Step 2: Deploy via deploy-production.sh${NC}"
if [ -f "$LOCAL_DIR/scripts/deploy-production.sh" ]; then
    bash "$LOCAL_DIR/scripts/deploy-production.sh" || {
        echo -e "${RED}✗ deploy-production.sh failed. PM2 NOT restarted if build failed.${NC}"
        exit 1
    }
else
    echo -e "${RED}✗ deploy-production.sh not found${NC}"
    exit 1
fi
echo ""

# Step 3: Get BUILD_ID from VPS
echo -e "${BLUE}Step 3: Verify BUILD_ID${NC}"
BUILD_ID=$(ssh "$VPS_USER@$VPS_HOST" "cat $PROJECT_DIR/.next/BUILD_ID 2>/dev/null" || echo "UNKNOWN")
if [ "$BUILD_ID" = "UNKNOWN" ]; then
    echo -e "${RED}✗ BUILD_ID not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ BUILD_ID: $BUILD_ID${NC}"
echo ""

# Step 4: Update deploy-version.json on VPS
echo -e "${BLUE}Step 4: Update deploy-version.json${NC}"
BUILT_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
ssh "$VPS_USER@$VPS_HOST" "cat > $PROJECT_DIR/public/deploy-version.json << 'EOJSON'
{
  \"version\": \"$VERSION\",
  \"commit\": \"$DEPLOY_COMMIT\",
  \"buildId\": \"$BUILD_ID\",
  \"builtAt\": \"$BUILT_AT\"
}
EOJSON"
echo -e "${GREEN}✓ deploy-version.json updated${NC}"
echo ""

# Step 5: Verify PM2 online
echo -e "${BLUE}Step 5: Verify PM2${NC}"
PM2_STATUS=$(ssh "$VPS_USER@$VPS_HOST" "pm2 status xixiong-saas 2>&1" | grep -o "online" | head -1)
if [ "$PM2_STATUS" = "online" ]; then
    echo -e "${GREEN}✓ PM2 online${NC}"
else
    echo -e "${RED}✗ PM2 not online${NC}"
    exit 1
fi
echo ""

# Step 6: Verify deploy-version.json via curl
echo -e "${BLUE}Step 6: Verify production deploy-version${NC}"
CURL_VERSION=$(curl -s "https://jueshi.net/deploy-version.json" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
CURL_BUILDID=$(curl -s "https://jueshi.net/deploy-version.json" | grep -o '"buildId":"[^"]*"' | cut -d'"' -f4)
if [ "$CURL_VERSION" = "$VERSION" ] && [ "$CURL_BUILDID" = "$BUILD_ID" ]; then
    echo -e "${GREEN}✓ Production deploy-version matches${NC}"
else
    echo -e "${RED}✗ Production deploy-version mismatch: got version=$CURL_VERSION buildId=$CURL_BUILDID${NC}"
    exit 1
fi
echo ""

# Step 7: Verify key pages
echo -e "${BLUE}Step 7: Verify key pages${NC}"
for path in "/" "/countries/canada" "/guides/shipping-from-china-to-canada-guide" "/checklists/canada-shipping-checklist"; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://jueshi.net$path")
    if [ "$CODE" = "200" ]; then
        echo -e "  ${GREEN}✓${NC} $path → $CODE"
    else
        echo -e "  ${RED}✗${NC} $path → $CODE"
    fi
done

# Admin API should return 401
for path in "/api/admin/guides" "/api/admin/checklists"; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://jueshi.net$path")
    if [ "$CODE" = "401" ]; then
        echo -e "  ${GREEN}✓${NC} $path → $CODE (correct: unauthorized)"
    else
        echo -e "  ${RED}✗${NC} $path → $CODE (expected 401)"
    fi
done
echo ""

# Step 8: Check error log
echo -e "${BLUE}Step 8: Check PM2 error log${NC}"
ERR_LINES=$(ssh "$VPS_USER@$VPS_HOST" "wc -l < /home/deploy/.pm2/logs/xixiong-saas-error.log 2>/dev/null" || echo "0")
if [ "$ERR_LINES" -lt 10 ]; then
    echo -e "${GREEN}✓ Error log clean ($ERR_LINES lines)${NC}"
else
    echo -e "${YELLOW}⚠ Error log has $ERR_LINES lines — check for error loops${NC}"
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete: $VERSION${NC}"
echo -e "${GREEN}  BUILD_ID: $BUILD_ID${NC}"
echo -e "${GREEN}========================================${NC}"
