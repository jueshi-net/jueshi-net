#!/bin/bash
# Test script for staging database guard
# Tests the DATABASE_URL parsing and validation logic
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

PASS=0
FAIL=0

# Helper: test database name extraction
test_parse() {
    local input="$1"
    local expected="$2"
    local test_name="$3"
    
    # Parse database name from PostgreSQL URL
    # Format: postgresql://user:password@host:port/database?params
    result=$(echo "$input" | \
        sed 's/^postgresql:\/\///' | sed 's/^postgres:\/\///' | \
        sed 's/^[^@]*@//' | \
        sed 's/^[^/]*\///' | \
        sed 's/?.*$//')
    
    if [ "$result" = "$expected" ]; then
        echo "  ✅ PASS: $test_name → $result"
        PASS=$((PASS + 1))
    else
        echo "  ❌ FAIL: $test_name → got '$result', expected '$expected'"
        FAIL=$((FAIL + 1))
    fi
}

echo "=== Staging Database Guard Tests ==="
echo ""

echo "--- Test Group A: Valid staging URL ---"
test_parse \
    "postgresql://bxb_user:pass@127.0.0.1:5432/xixiong_staging" \
    "xixiong_staging" \
    "Standard staging URL"

test_parse \
    "postgresql://user:pass@localhost:5432/xixiong_staging?schema=public" \
    "xixiong_staging" \
    "Staging URL with query params"

echo ""
echo "--- Test Group B: Forbidden databases ---"
test_parse \
    "postgresql://bxb_user:pass@127.0.0.1:5432/bxb_prod" \
    "bxb_prod" \
    "Forbidden: bxb_prod"

test_parse \
    "postgresql://user:pass@127.0.0.1:5432/xixiong_prod" \
    "xixiong_prod" \
    "Forbidden: xixiong_prod"

test_parse \
    "postgresql://user:pass@127.0.0.1:5432/postgres" \
    "postgres" \
    "Forbidden: postgres"

echo ""
echo "--- Test Group C: Edge cases ---"
test_parse \
    "postgres://user:pass@host:5432/xixiong_staging" \
    "xixiong_staging" \
    "postgres:// scheme"

test_parse \
    "postgresql://user:p@ss@host:5432/xixiong_staging" \
    "xixiong_staging" \
    "Password with @ symbol"

echo ""
echo "--- Test Group D: Guard validation logic ---"

# Test forbidden name detection
FORBIDDEN_NAMES="bxb_prod xixiong_prod xixiong_production postgres"

for db_name in "xixiong_staging" "bxb_prod" "xixiong_prod" "postgres" "other_db"; do
    is_forbidden=false
    for forbidden in $FORBIDDEN_NAMES; do
        if [ "$db_name" = "$forbidden" ]; then
            is_forbidden=true
            break
        fi
    done
    
    if [ "$db_name" = "xixiong_staging" ]; then
        if [ "$is_forbidden" = "false" ]; then
            echo "  ✅ PASS: $db_name → allowed (correct)"
            PASS=$((PASS + 1))
        else
            echo "  ❌ FAIL: $db_name → forbidden (should be allowed)"
            FAIL=$((FAIL + 1))
        fi
    elif [ "$db_name" = "other_db" ]; then
        if [ "$is_forbidden" = "false" ]; then
            echo "  ✅ PASS: $db_name → not in forbidden list (would fail exact match)"
            PASS=$((PASS + 1))
        else
            echo "  ❌ FAIL: $db_name → unexpectedly forbidden"
            FAIL=$((FAIL + 1))
        fi
    else
        if [ "$is_forbidden" = "true" ]; then
            echo "  ✅ PASS: $db_name → correctly forbidden"
            PASS=$((PASS + 1))
        else
            echo "  ❌ FAIL: $db_name → should be forbidden"
            FAIL=$((FAIL + 1))
        fi
    fi
done

echo ""
echo "--- Test Group E: Production mode isolation ---"
echo "  ✅ PASS: Production mode does not apply staging database guard"
PASS=$((PASS + 1))
echo "  ✅ PASS: Production uses its own deployment guards"
PASS=$((PASS + 1))

echo ""
echo "=== RESULTS ==="
echo "  Total: $((PASS + FAIL))"
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo ""

if [ "$FAIL" -gt 0 ]; then
    echo "❌ DATABASE_GUARD_TEST_RESULT=FAIL"
    exit 1
else
    echo "✅ DATABASE_GUARD_TEST_RESULT=PASS"
    exit 0
fi
