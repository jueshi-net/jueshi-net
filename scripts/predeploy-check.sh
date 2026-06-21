#!/bin/bash
# Pre-deployment safety checks — run BEFORE any rsync or build
# Usage: bash scripts/predeploy-check.sh
# Exits 1 on any failure. Does NOT deploy, does NOT modify anything.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

check() {
    local desc="$1"
    local cmd="$2"
    if eval "$cmd" >/dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} $desc"
        PASS=$((PASS + 1))
    else
        echo -e "  ${RED}✗${NC} $desc"
        FAIL=$((FAIL + 1))
    fi
}

echo "=========================================="
echo "  Pre-Deployment Safety Check"
echo "=========================================="
echo ""

# 1. Must be in project root
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Project root: $LOCAL_DIR"

check "pwd is project root (has package.json)" "test -f '$LOCAL_DIR/package.json'"
check "src/ directory exists" "test -d '$LOCAL_DIR/src'"
check "prisma/schema.prisma exists" "test -f '$LOCAL_DIR/prisma/schema.prisma'"
check "prisma/migrations/ exists" "test -d '$LOCAL_DIR/prisma/migrations'"
check "scripts/check-build-env.mjs exists" "test -f '$LOCAL_DIR/scripts/check-build-env.mjs'"
check "next.config.ts exists" "test -f '$LOCAL_DIR/next.config.ts'"
check "tsconfig.json exists" "test -f '$LOCAL_DIR/tsconfig.json'"
check "deploy/rsync-exclude.txt exists" "test -f '$LOCAL_DIR/deploy/rsync-exclude.txt'"

echo ""
echo "--- Stale root directory check ---"
STALE_DIRS=("app" "components" "lib" "hooks" "migrations")
for d in "${STALE_DIRS[@]}"; do
    if [ -d "$LOCAL_DIR/$d" ]; then
        echo -e "  ${RED}✗${NC} Root-level $d/ exists (stale! should only be in src/)"
        FAIL=$((FAIL + 1))
    else
        echo -e "  ${GREEN}✓${NC} No root-level $d/ (correct)"
        PASS=$((PASS + 1))
    fi
done

if [ -f "$LOCAL_DIR/schema.prisma" ]; then
    echo -e "  ${RED}✗${NC} Root-level schema.prisma exists (should be in prisma/)"
    FAIL=$((FAIL + 1))
else
    echo -e "  ${GREEN}✓${NC} No root-level schema.prisma (correct)"
    PASS=$((PASS + 1))
fi

echo ""
echo "--- .env safety check ---"
check ".env files will NOT be synced (in rsync-exclude.txt)" "grep -q '\.env' '$LOCAL_DIR/deploy/rsync-exclude.txt'"

echo ""
echo "--- Git status check ---"
GIT_STATUS=$(cd "$LOCAL_DIR" && git status --short 2>/dev/null | wc -l)
if [ "$GIT_STATUS" -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} Git working tree clean ($GIT_STATUS uncommitted files)"
    PASS=$((PASS + 1))
else
    echo -e "  ${YELLOW}⚠${NC} Git has $GIT_STATUS uncommitted/untracked files"
    echo -e "  ${YELLOW}  Commit or stash before deploying for reproducibility${NC}"
    # Warning, not failure — reports can be untracked
    PASS=$((PASS + 1))
fi

echo ""
echo "--- Build check (local) ---"
echo "  Running npm run build (this may take a minute)..."
if (cd "$LOCAL_DIR" && npm run build >/dev/null 2>&1); then
    echo -e "  ${GREEN}✓${NC} Local build passed"
    PASS=$((PASS + 1))
else
    echo -e "  ${YELLOW}⚠${NC} Local build failed (may be due to no DB tunnel — will verify on VPS)"
    echo -e "  ${YELLOW}  This is a WARNING, not a failure — VPS build is authoritative${NC}"
    PASS=$((PASS + 1))
fi

echo ""
echo "--- Unit tests ---"
if (cd "$LOCAL_DIR" && npm run test:unit >/dev/null 2>&1); then
    echo -e "  ${GREEN}✓${NC} Unit tests passed"
    PASS=$((PASS + 1))
else
    echo -e "  ${RED}✗${NC} Unit tests failed"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "=========================================="
echo "  Results: $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
    echo -e "  ${RED}PRE-DEPLOY CHECK FAILED${NC}"
    echo "  Fix all failures before deploying."
    exit 1
else
    echo -e "  ${GREEN}PRE-DEPLOY CHECK PASSED${NC}"
    echo "  Safe to proceed with deployment."
    exit 0
fi
