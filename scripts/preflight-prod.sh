#!/bin/bash
# Pre-deployment checks for production
# Usage: bash scripts/preflight-prod.sh
set -euo pipefail

VPS="deploy@192.129.155.149"
APP_DIR="/home/deploy/xixiong-saas"
PASS=0; FAIL=0

ok() { echo "  ✅ $1"; PASS=$((PASS+1)); }
no() { echo "  ❌ $1"; FAIL=$((FAIL+1)); }

echo "═══ Pre-Flight Production Checks ═══"
echo ""

# 1. Git status clean
echo "[1/8] Git status..."
if git diff --quiet && git diff --cached --quiet; then ok "Working tree clean"; else no "Uncommitted changes"; fi

# 2. Branch = main
echo "[2/8] Branch check..."
BRANCH=$(git branch --show-current)
if [ "$BRANCH" = "main" ]; then ok "On main branch"; else no "On $BRANCH, expected main"; fi

# 3. .env files exist locally
echo "[3/8] Local env..."
[ -f .env.local ] && ok ".env.local exists" || no ".env.local missing"

# 4. Build check
echo "[4/8] Build check..."
if npm run build >/dev/null 2>&1; then ok "Build succeeds"; else no "Build fails"; fi

# 5. Migrate status
echo "[5/8] Migration status..."
ssh "$VPS" "cd $APP_DIR && set -a && source .env.production && set +a && npx prisma migrate status 2>&1 | grep -q 'up to date'" && ok "Migrations up to date" || no "Migration drift"

# 6. Disk space
echo "[6/8] Disk space..."
DISK_PCT=$(ssh "$VPS" "df / | tail -1 | awk '{print \$5}' | tr -d '%'")
if [ "$DISK_PCT" -lt 90 ]; then ok "Disk usage ${DISK_PCT}%"; else no "Disk usage ${DISK_PCT}% — critical"; fi

# 7. Security checks
echo "[7/8] Security..."
MEMBER_COUNT=$(ssh "$VPS" "cd $APP_DIR && set -a && source .env.production && set +a && psql \"\$DATABASE_URL\" -t -c \"SELECT COUNT(*) FROM users WHERE role='member'\"" 2>/dev/null | xargs)
[ "$MEMBER_COUNT" = "0" ] && ok "role=member count: 0" || no "role=member count: $MEMBER_COUNT"

ADMIN_ROLE=$(ssh "$VPS" "cd $APP_DIR && set -a && source .env.production && set +a && psql \"\$DATABASE_URL\" -t -c \"SELECT role FROM users WHERE email='9833416@qq.com'\"" 2>/dev/null | xargs)
[ "$ADMIN_ROLE" = "admin" ] && ok "9833416@qq.com is admin" || no "9833416@qq.com role: $ADMIN_ROLE"

# 8. No db push in scripts
echo "[8/8] No db push..."
if grep -r "db push" scripts/ 2>/dev/null | grep -v "no db push" | grep -v "# "; then no "Found 'db push' in scripts"; else ok "No db push in scripts"; fi

echo ""
echo "═══ Results: $PASS passed, $FAIL failed ═══"
[ "$FAIL" -eq 0 ] && echo "✅ READY FOR DEPLOYMENT" || echo "❌ FIX ISSUES BEFORE DEPLOYMENT"
exit "$FAIL"
