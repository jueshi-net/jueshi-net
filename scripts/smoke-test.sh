#!/bin/bash
# Smoke test — supports --base-url
# Usage: bash scripts/smoke-test.sh --base-url https://jueshi.net
#        bash scripts/smoke-test.sh --base-url https://i.jueshi.net
#        bash scripts/smoke-test.sh --base-url http://192.129.155.149
set -euo pipefail

BASE_URL="https://jueshi.net"
while [[ $# -gt 0 ]]; do
    case "$1" in
        --base-url) BASE_URL="$2"; shift 2;;
        *) echo "Unknown arg: $1"; exit 1;;
    esac
done

PASS=0; FAIL=0
ok() { echo "  ✅ $1"; PASS=$((PASS+1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL+1)); }

echo "=== Smoke Test: $BASE_URL ==="

# Public pages
for path in "/" "/destinations" "/destinations/canada" "/destinations/united-states" "/tools/postal-code" "/bbs" "/bbs/new" "/admin" "/login"; do
    CODE=$(curl -sI -o /dev/null -w "%{http_code}" "${BASE_URL}${path}" 2>/dev/null || echo "000")
    if [ "$CODE" = "200" ]; then ok "$path → $CODE"
    else fail "$path → $CODE (expected 200)"; fi
done

# Redirects
for path in "/destinations/usa" "/countries"; do
    CODE=$(curl -sI -o /dev/null -w "%{http_code}" "${BASE_URL}${path}" 2>/dev/null || echo "000")
    if [ "$CODE" = "308" ]; then ok "$path → $CODE (redirect)"
    else fail "$path → $CODE (expected 308)"; fi
done

# Static assets
HTML=$(curl -s "${BASE_URL}/" 2>/dev/null)
CSS=$(echo "$HTML" | grep -oE 'href="[^"]*\.css"' | head -1 | sed 's/href="//;s/"//')
JS=$(echo "$HTML" | grep -oE 'src="[^"]*\.js"' | head -1 | sed 's/src="//;s/"//')
if [ -n "$CSS" ]; then
    CODE=$(curl -sI -o /dev/null -w "%{http_code}" "${BASE_URL}${CSS}" 2>/dev/null || echo "000")
    [ "$CODE" = "200" ] && ok "CSS → $CODE" || fail "CSS → $CODE"
fi
if [ -n "$JS" ]; then
    CODE=$(curl -sI -o /dev/null -w "%{http_code}" "${BASE_URL}${JS}" 2>/dev/null || echo "000")
    [ "$CODE" = "200" ] && ok "JS → $CODE" || fail "JS → $CODE"
fi

# Deploy version
VERSION=$(curl -s "${BASE_URL}/deploy-version.json" 2>/dev/null)
if echo "$VERSION" | grep -q "version"; then ok "deploy-version.json valid"; else fail "deploy-version.json invalid"; fi

# Summary
echo ""
echo "=== SUMMARY ==="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
if [ "$FAIL" -gt 0 ]; then exit 1; fi
echo "  All checks passed ✅"
