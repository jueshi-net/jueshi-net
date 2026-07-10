#!/bin/bash
# Staging Environment Check Script
# Usage: scripts/check-staging.sh
# Must output STAGING_ENV_OK to allow deployment

set -e

STAGING_SERVER="deploy@192.129.155.149"
STAGING_DIR="/home/deploy/xixiong-saas-staging"
PM2_APP="xixiong-staging"

echo "=== Staging Environment Check ==="

# 1. SSH Connection Test
echo "[1/4] Testing SSH connection..."
if ! ssh -o BatchMode=yes -o ConnectTimeout=10 -o ServerAliveInterval=5 -o ServerAliveCountMax=2 "$STAGING_SERVER" 'echo SSH_OK' > /dev/null 2>&1; then
    echo "❌ SSH connection failed"
    echo "STAGING_ENV_FAILED"
    exit 1
fi
echo "✅ SSH connection OK"

# 2. Working Directory Check
echo "[2/4] Checking working directory..."
ACTUAL_DIR=$(ssh "$STAGING_SERVER" 'pwd' 2>/dev/null)
if [ "$ACTUAL_DIR" != "$STAGING_DIR" ]; then
    echo "❌ Working directory mismatch"
    echo "   Expected: $STAGING_DIR"
    echo "   Actual: $ACTUAL_DIR"
    echo "STAGING_ENV_FAILED"
    exit 1
fi
echo "✅ Working directory OK: $STAGING_DIR"

# 3. PM2 Process Check
echo "[3/4] Checking PM2 process..."
PM2_STATUS=$(ssh "$STAGING_SERVER" "pm2 status 2>/dev/null | grep -c '$PM2_APP'" || echo "0")
if [ "$PM2_STATUS" -eq 0 ]; then
    echo "❌ PM2 process '$PM2_APP' not found"
    echo "STAGING_ENV_FAILED"
    exit 1
fi
echo "✅ PM2 process OK: $PM2_APP"

# 4. Directory Existence Check
echo "[4/4] Checking staging directory..."
if ! ssh "$STAGING_SERVER" "test -d '$STAGING_DIR'" 2>/dev/null; then
    echo "❌ Staging directory does not exist"
    echo "STAGING_ENV_FAILED"
    exit 1
fi
echo "✅ Staging directory OK"

echo ""
echo "=== All checks passed ==="
echo "STAGING_ENV_OK"
exit 0
