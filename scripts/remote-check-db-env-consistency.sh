#!/usr/bin/env bash
# Remote DB Environment Consistency Check
# This script runs ENTIRELY on the VPS — uploaded via SSH heredoc by deploy-production.sh
# It avoids all quoting issues by being a standalone file.
#
# Exit codes:
#   0 = all checks passed
#   1 = one or more checks failed

set -uo pipefail

PROJECT_DIR="/home/deploy/xixiong-saas"
ENV_FILE="$PROJECT_DIR/.env.production"
PM2_APP="xixiong-saas"

PASS=0
FAIL=0

pass() { echo "  PASS: $1"; PASS=$((PASS+1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
info() { echo "  INFO: $1"; }

# Extract connection info fields from a postgresql:// URL (no password output)
# URL format:***@host:port/database?params
extract_user() { echo "$1" | sed -n 's|postgresql://\([^:]*\):.*@.*|\1|p'; }
extract_host() { echo "$1" | sed -n 's|.*@\([^:]*\):[0-9]*/.*|\1|p'; }
extract_port() { echo "$1" | sed -n 's|.*:[0-9]*@\([^:]*\):\([0-9]*\)/.*|\2|p'; }
extract_db()   { echo "$1" | sed -n 's|.*/\([^?]*\).*|\1|p'; }

echo "========================================"
echo "Post-deploy DB Environment Consistency Check"
echo "========================================"
echo ""

# --- Check 1: .env.production exists ---
echo "[1/8] .env.production exists"
if [ -f "$ENV_FILE" ]; then
  pass "file exists"
else
  fail "file not found: $ENV_FILE"
  echo ""
  echo "RESULT: FAIL (env file missing, cannot continue)"
  exit 1
fi

# --- Check 2: .env.production permissions ---
echo "[2/8] .env.production permissions"
PERMS=$(stat -c "%a" "$ENV_FILE" 2>/dev/null || echo "unknown")
if [ "$PERMS" = "600" ] || [ "$PERMS" = "400" ] || [ "$PERMS" = "000" ]; then
  pass "permissions: $PERMS (secure)"
else
  fail "permissions: $PERMS (should be 600 or stricter)"
fi

# --- Check 3: Extract DATABASE_URL from .env.production ---
echo "[3/8] .env.production DATABASE_URL"
ENV_DB_LINE=$(grep '^DATABASE_URL=' "$ENV_FILE" 2>/dev/null || echo "")
ENV_DB_URL=""
ENV_DB_HASH="missing"
if [ -n "$ENV_DB_LINE" ]; then
  # Remove DATABASE_URL= prefix and surrounding quotes
  ENV_DB_URL=$(echo "$ENV_DB_LINE" | sed 's/^DATABASE_URL=//' | sed 's/^"//' | sed 's/"$//')
  ENV_DB_HASH=$(printf '%s' "$ENV_DB_URL" | sha256sum | cut -c1-8)
  E_USER=$(extract_user "$ENV_DB_URL")
  E_HOST=$(extract_host "$ENV_DB_URL")
  E_PORT=$(extract_port "$ENV_DB_URL")
  E_DB=$(extract_db "$ENV_DB_URL")
  pass ".env DATABASE_URL hash: $ENV_DB_HASH"
  info "  user=$E_USER host=$E_HOST port=$E_PORT db=$E_DB"
else
  fail ".env DATABASE_URL not found"
fi

# --- Check 4: Extract DATABASE_URL from PM2 process ---
echo "[4/8] PM2 DATABASE_URL"
PM2_PID=$(pm2 pid "$PM2_APP" 2>/dev/null || echo "")
PM2_DB_URL=""
PM2_DB_HASH="missing"
if [ -n "$PM2_PID" ] && [ "$PM2_PID" != "0" ] && [ -f "/proc/$PM2_PID/environ" ]; then
  PM2_DB_URL=$(tr '\0' '\n' < /proc/"$PM2_PID"/environ | grep '^DATABASE_URL=' | cut -d'=' -f2- || echo "")
  if [ -n "$PM2_DB_URL" ]; then
    PM2_DB_HASH=$(printf '%s' "$PM2_DB_URL" | sha256sum | cut -c1-8)
    P_USER=$(extract_user "$PM2_DB_URL")
    P_HOST=$(extract_host "$PM2_DB_URL")
    P_PORT=$(extract_port "$PM2_DB_URL")
    P_DB=$(extract_db "$PM2_DB_URL")
    pass "PM2 DATABASE_URL hash: $PM2_DB_HASH"
    info "  user=$P_USER host=$P_HOST port=$P_PORT db=$P_DB"
  else
    fail "PM2 process has no DATABASE_URL"
  fi
else
  fail "PM2 process not running or pid invalid (pid: ${PM2_PID:-none})"
fi

# --- Check 5: Compare hashes ---
echo "[5/8] DATABASE_URL consistency"
if [ "$ENV_DB_HASH" = "$PM2_DB_HASH" ] && [ "$ENV_DB_HASH" != "missing" ]; then
  pass "hashes match: $ENV_DB_HASH"
else
  fail "hash mismatch: env=$ENV_DB_HASH pm2=$PM2_DB_HASH"
fi

# --- Check 6: Test DB connection with .env.production ---
echo "[6/8] DB connection test (.env.production)"
if [ -n "$ENV_DB_URL" ]; then
  SELECT1_ENV=$(psql "$ENV_DB_URL" -c "SELECT 1;" 2>&1 || true)
  if echo "$SELECT1_ENV" | grep -q "1 row"; then
    pass ".env SELECT 1: ok"
  else
    fail ".env SELECT 1: failed"
    info "  error: $(echo "$SELECT1_ENV" | head -1)"
  fi
else
  fail "no DATABASE_URL to test"
fi

# --- Check 7: Test DB connection with PM2 env ---
echo "[7/8] DB connection test (PM2)"
if [ -n "$PM2_DB_URL" ]; then
  SELECT1_PM2=$(psql "$PM2_DB_URL" -c "SELECT 1;" 2>&1 || true)
  if echo "$SELECT1_PM2" | grep -q "1 row"; then
    pass "PM2 SELECT 1: ok"
  else
    fail "PM2 SELECT 1: failed"
    info "  error: $(echo "$SELECT1_PM2" | head -1)"
  fi
else
  fail "no PM2 DATABASE_URL to test"
fi

# --- Check 8: Verify application data access ---
echo "[8/8] Application data access (TW postal codes)"
if [ -n "$ENV_DB_URL" ]; then
  TW_COUNT=$(psql "$ENV_DB_URL" -t -A -c "SELECT COUNT(*) FROM postal_codes WHERE \"countryCode\" = 'TW';" 2>/dev/null || echo "0")
  if [ "$TW_COUNT" -gt 0 ] 2>/dev/null; then
    pass "TW postal_codes count: $TW_COUNT"
  else
    fail "TW postal_codes count: $TW_COUNT (expected > 0)"
  fi
else
  fail "no DATABASE_URL to query"
fi

# --- Summary ---
echo ""
echo "========================================"
echo "Results: $PASS passed, $FAIL failed"
echo "========================================"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: ALL CHECKS PASSED"
  exit 0
else
  echo "RESULT: SOME CHECKS FAILED"
  exit 1
fi
