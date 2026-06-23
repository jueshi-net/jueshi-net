#!/bin/bash
# Production smoke tests — verifies key routes, redirects, and security on jueshi.net
# Usage: bash scripts/smoke-test.sh [base_url]
# Default: https://jueshi.net
set -euo pipefail

BASE_URL="${1:-https://jueshi.net}"
VPS="deploy@192.129.155.149"
APP_DIR="/home/deploy/xixiong-saas"
PASS=0; FAIL=0

ok() { echo "  ✅ $1"; PASS=$((PASS+1)); }
no() { echo "  ❌ $1"; FAIL=$((FAIL+1)); }

echo "═══ Production Smoke Tests ═══"
echo "Target: $BASE_URL"
echo ""

# --- Routes ---
echo "[1/12] Key routes..."
for path in "/" "/destinations" "/destinations/canada" "/destinations/united-states" "/tools/postal-code" "/bbs"; do
  CODE=$(curl -sI -o /dev/null -w "%{http_code}" "$BASE_URL$path" 2>/dev/null || echo "000")
  [ "$CODE" = "200" ] && ok "$path → $CODE" || no "$path → $CODE"
done

# --- Redirects ---
echo "[2/12] Redirects..."
CODE=$(curl -sI -o /dev/null -w "%{http_code}" "$BASE_URL/destinations/usa" 2>/dev/null)
[ "$CODE" = "308" ] && ok "/destinations/usa → 308" || no "/destinations/usa → $CODE"

CODE=$(curl -sI -o /dev/null -w "%{http_code}" "$BASE_URL/countries" 2>/dev/null)
[ "$CODE" = "308" ] && ok "/countries → 308" || no "/countries → $CODE"

# --- Admin protection ---
echo "[3/12] Admin protection..."
CODE=$(curl -sI -o /dev/null -w "%{http_code}" "$BASE_URL/admin" 2>/dev/null)
([ "$CODE" = "200" ] || [ "$CODE" = "307" ] || [ "$CODE" = "302" ]) && ok "/admin → $CODE (protected)" || no "/admin → $CODE (unexpected)"

# --- PM2 status ---
echo "[4/12] PM2..."
STATUS=$(ssh "$VPS" "pm2 jlist 2>/dev/null" | python3 -c "import json,sys; d=json.load(sys.stdin); print(next(p['pm2_env']['status'] for p in d if p['name']=='xixiong-saas'))" 2>/dev/null || echo "unknown")
[ "$STATUS" = "online" ] && ok "PM2 online" || no "PM2 status: $STATUS"

# --- Security ---
echo "[5/12] Security..."
MEMBER_COUNT=$(ssh "$VPS" "cd $APP_DIR && set -a && source .env.production && set +a && psql \"\$DATABASE_URL\" -t -c \"SELECT COUNT(*) FROM users WHERE role='member'\"" 2>/dev/null | xargs)
[ "$MEMBER_COUNT" = "0" ] && ok "role=member: 0" || no "role=member: $MEMBER_COUNT"

ADMIN_ROLE=$(ssh "$VPS" "cd $APP_DIR && set -a && source .env.production && set +a && psql \"\$DATABASE_URL\" -t -c \"SELECT role FROM users WHERE email='9833416@qq.com'\"" 2>/dev/null | xargs)
[ "$ADMIN_ROLE" = "admin" ] && ok "9833416@qq.com: admin" || no "9833416@qq.com: $ADMIN_ROLE"

# --- Deploy version ---
echo "[6/12] Deploy version..."
VERSION=$(curl -s "$BASE_URL/deploy-version.json" 2>/dev/null | python3 -c "import json,sys; print(json.load(sys.stdin).get('version','unknown'))" 2>/dev/null || echo "unknown")
[ "$VERSION" != "unknown" ] && ok "Deploy version: $VERSION" || no "Cannot read deploy-version.json"

# --- Error log ---
echo "[7/12] Error log..."
ERR_COUNT=$(ssh "$VPS" "wc -l < /home/deploy/.pm2/logs/xixiong-saas-error.log 2>/dev/null" || echo "0")
[ "$ERR_COUNT" -lt 100 ] && ok "Error log: $ERR_COUNT lines (low)" || no "Error log: $ERR_COUNT lines (high)"

echo ""
echo "═══ Results: $PASS passed, $FAIL failed ═══"
[ "$FAIL" -eq 0 ] && echo "✅ ALL SMOKE TESTS PASSED" || echo "❌ SOME TESTS FAILED"
exit "$FAIL"
