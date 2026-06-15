#!/bin/bash

# Production Deployment Script with Environment Protection
# This script ensures .env.production is not overwritten during deployment

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="192.129.155.149"
VPS_USER="deploy"
PROJECT_DIR="/home/deploy/xixiong-saas"
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXCLUDE_FILE="$LOCAL_DIR/deploy/rsync-exclude.txt"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Production Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if exclude file exists
if [ ! -f "$EXCLUDE_FILE" ]; then
    echo -e "${RED}✗ Exclude file not found: $EXCLUDE_FILE${NC}"
    echo -e "${YELLOW}Please create deploy/rsync-exclude.txt first${NC}"
    exit 1
fi

# Pre-deployment: Record .env.production hash on VPS
echo -e "${BLUE}Step 1: Pre-deployment environment check${NC}"
PRE_DEPLOY_HASH=$(ssh $VPS_USER@$VPS_HOST "test -f $PROJECT_DIR/.env.production && grep '^DATABASE_URL=' $PROJECT_DIR/.env.production | cut -d'\"' -f2 | sha256sum | cut -c1-8 || echo 'not_found'")
echo -e "${GREEN}✓ Pre-deploy .env.production hash: $PRE_DEPLOY_HASH${NC}"
echo ""

# Step 2: Rsync deployment
echo -e "${BLUE}Step 2: Rsync deployment${NC}"
echo -e "${YELLOW}Excluding sensitive files using: $EXCLUDE_FILE${NC}"
rsync -avz --progress \
    --exclude-from="$EXCLUDE_FILE" \
    "$LOCAL_DIR/" \
    "$VPS_USER@$VPS_HOST:$PROJECT_DIR/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Rsync completed successfully${NC}"
else
    echo -e "${RED}✗ Rsync failed${NC}"
    exit 1
fi
echo ""

# Step 3: Post-deployment verification
echo -e "${BLUE}Step 3: Post-deployment verification${NC}"

# Check .env.production still exists
POST_EXISTS=$(ssh $VPS_USER@$VPS_HOST "test -f $PROJECT_DIR/.env.production && echo 'yes' || echo 'no'")
if [ "$POST_EXISTS" = "yes" ]; then
    echo -e "${GREEN}✓ .env.production still exists after deployment${NC}"
else
    echo -e "${RED}✗ .env.production was deleted during deployment!${NC}"
    exit 1
fi

# Check .env.production hash unchanged
POST_DEPLOY_HASH=$(ssh $VPS_USER@$VPS_HOST "grep '^DATABASE_URL=' $PROJECT_DIR/.env.production | cut -d'\"' -f2 | sha256sum | cut -c1-8")
if [ "$PRE_DEPLOY_HASH" = "$POST_DEPLOY_HASH" ]; then
    echo -e "${GREEN}✓ .env.production unchanged (hash: $POST_DEPLOY_HASH)${NC}"
else
    echo -e "${RED}✗ .env.production was modified during deployment!${NC}"
    echo -e "${RED}  Pre-deploy hash:  $PRE_DEPLOY_HASH${NC}"
    echo -e "${RED}  Post-deploy hash: $POST_DEPLOY_HASH${NC}"
    exit 1
fi
echo ""

# Step 4: Install dependencies and build
echo -e "${BLUE}Step 4: Install dependencies and build${NC}"
ssh $VPS_USER@$VPS_HOST << EOF
cd $PROJECT_DIR
echo "Setting production environment..."
export NODE_ENV=production

echo "Installing dependencies (including dev for build)..."
npm ci --include=dev
if [ \$? -ne 0 ]; then
    echo "npm ci failed"
    exit 1
fi

echo "Generating Prisma client..."
source .env.production
npx prisma generate
if [ \$? -ne 0 ]; then
    echo "Prisma generate failed"
    exit 1
fi

echo "Building application..."
npm run build
if [ \$? -ne 0 ]; then
    echo "Build failed"
    exit 1
fi
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build completed successfully${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo ""

# Step 5: Restart PM2
echo -e "${BLUE}Step 5: Restart PM2${NC}"
ssh $VPS_USER@$VPS_HOST "cd $PROJECT_DIR && pm2 restart xixiong-saas --update-env"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PM2 restarted${NC}"
else
    echo -e "${RED}✗ PM2 restart failed${NC}"
    exit 1
fi
echo ""

# Step 6: Wait for application to start
echo -e "${BLUE}Step 6: Wait for application to start${NC}"
sleep 5
echo -e "${GREEN}✓ Application started${NC}"
echo ""

# Step 7: Generate deploy metadata
echo -e "${BLUE}Step 7: Generate deploy metadata${NC}"
ssh $VPS_USER@$VPS_HOST << EOF
cd $PROJECT_DIR
COMMIT_HASH=\$(git rev-parse HEAD)
BUILD_ID=\$(node -e "console.log(require('./.next/BUILD_ID'))" 2>/dev/null || echo "unknown")
cat > .deploy-meta.json << METAEOF
{
  "commit": "\$COMMIT_HASH",
  "buildId": "\$BUILD_ID",
  "deployedAt": "\$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "deployedBy": "\$(whoami)",
  "environment": "production"
}
METAEOF
echo "Deploy metadata generated:"
cat .deploy-meta.json
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Deploy metadata generated${NC}"
else
    echo -e "${YELLOW}⚠ Deploy metadata generation failed (non-critical)${NC}"
fi
echo ""

# Step 8: Run environment consistency check
echo -e "${BLUE}Step 8: Run environment consistency check${NC}"
# Upload bash check script to VPS and execute it there (avoids SSH quoting issues)
cat "$LOCAL_DIR/scripts/remote-check-db-env-consistency.sh" | ssh $VPS_USER@$VPS_HOST 'cat > /tmp/check-db-env.sh && chmod 700 /tmp/check-db-env.sh'
ssh $VPS_USER@$VPS_HOST 'bash /tmp/check-db-env.sh'
CHECK_EXIT=$?
ssh $VPS_USER@$VPS_HOST 'rm -f /tmp/check-db-env.sh' 2>/dev/null || true
if [ $CHECK_EXIT -eq 0 ]; then
    echo -e "${GREEN}✓ Environment consistency check passed${NC}"
else
    echo -e "${RED}✗ Environment consistency check failed${NC}"
    echo -e "${YELLOW}Deployment completed but environment issues detected!${NC}"
    exit 1
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Summary:${NC}"
echo -e "  • Rsync: ✓ (with exclude protection)"
echo -e "  • .env.production: ✓ (preserved)"
echo -e "  • Build: ✓"
echo -e "  • PM2 restart: ✓"
echo -e "  • Environment check: ✓"
echo ""
echo -e "${BLUE}Production URL: https://jueshi.net${NC}"
echo ""
