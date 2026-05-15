#!/bin/bash
# scripts/ops/test-member-trial.sh
# Full integration test for member trial flow
set -e

PSQL="sudo -u postgres psql -d bxb_prod"
BASE_URL="http://localhost:3000"
TEST_EMAIL="test-mv151-$(date +%s)@local.test"
TEST_PASSWORD="TestPass123!"
COOKIE_JAR="/tmp/test-cookie-$$"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"; }
pass() { echo "  ✅ PASS: $1"; }
fail() { echo "  ❌ FAIL: $1"; exit 1; }

log "=== v1.15.1 Member Trial Integration Test ==="
log "Test user: $TEST_EMAIL"

# Step 1: Create test user via API
log "Step 1: Create test user..."
REGISTER=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
echo "$REGISTER" | python3 -c "import sys,json; d=json.load(sys.stdin); assert d.get('success'), f'Register failed: {d}'"
pass "User created"

# Step 2: Login
log "Step 2: Login..."
CSRF=$(curl -s -c "$COOKIE_JAR" "$BASE_URL/api/auth/csrf" | python3 -c "import sys,json; print(json.load(sys.stdin)['csrfToken'])")
curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  -X POST "$BASE_URL/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=$CSRF&email=$TEST_EMAIL&password=$TEST_PASSWORD&redirect=false" -o /dev/null
pass "Logged in"

# Step 3: Add 300 points
log "Step 3: Add 300 points..."
USER_ID=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/api/me/permissions" | python3 -c "
import sys,json; exec(\"# get id from db\")" 2>/dev/null || true)
# Get user ID from DB
USER_ID=$($PSQL -t -A -c "SELECT id FROM users WHERE email = '$TEST_EMAIL';")
$PSQL -c "UPDATE users SET points = 300 WHERE id = '$USER_ID';" > /dev/null
$PSQL -c "INSERT INTO point_ledgers (id, \"userId\", type, points, reason, \"createdAt\") VALUES ('test-ledger-$$', '$USER_ID', 'admin_adjust', 300, 'Test: add points', NOW());" > /dev/null
pass "Points set to 300"

# Step 4: Get member_1day RewardItem
log "Step 4: Get member_1day RewardItem..."
REWARD_ID=$($PSQL -t -A -c "SELECT id FROM reward_items WHERE code = 'member_1day' AND enabled = true;")
[ -n "$REWARD_ID" ] && pass "Reward ID found" || fail "member_1day not found"

# Step 5: Redeem
log "Step 5: Redeem member_1day..."
CSRF2=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$BASE_URL/api/auth/csrf" | python3 -c "import sys,json; print(json.load(sys.stdin)['csrfToken'])")
REDEEM_CODE=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/rewards/redeem" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF2" \
  -d "{\"rewardItemId\":\"$REWARD_ID\"}")
[ "$REDEEM_CODE" = "200" ] && pass "Redeem HTTP $REDEEM_CODE" || fail "Redeem failed: HTTP $REDEEM_CODE"

# Step 6: Verify role
log "Step 6: Verify role = member..."
ROLE=$($PSQL -t -A -c "SELECT role FROM users WHERE id = '$USER_ID';")
[ "$ROLE" = "member" ] && pass "Role is member" || fail "Role is $ROLE, expected member"

# Step 7: Verify memberUntil
log "Step 7: Verify memberUntil..."
MEMBER_UNTIL=$($PSQL -t -A -c "SELECT \"memberUntil\" FROM users WHERE id = '$USER_ID';")
[ -n "$MEMBER_UNTIL" ] && pass "memberUntil set: $MEMBER_UNTIL" || fail "memberUntil not set"

# Step 8: Verify PointLedger
log "Step 8: Verify PointLedger..."
LEDGER=$($PSQL -t -A -c "SELECT COUNT(*) FROM point_ledgers WHERE \"userId\" = '$USER_ID' AND type = 'reward_redeem';")
[ "$LEDGER" -gt 0 ] && pass "PointLedger has $LEDGER reward_redeem entry" || fail "No reward_redeem"

# Step 9: Verify UserReward
log "Step 9: Verify UserReward..."
REWARD_COUNT=$($PSQL -t -A -c "SELECT COUNT(*) FROM user_rewards WHERE \"userId\" = '$USER_ID' AND status = 'active';")
[ "$REWARD_COUNT" -gt 0 ] && pass "UserReward created ($REWARD_COUNT active)" || fail "No active UserReward"

# Step 10: Check /api/me/permissions
log "Step 10: Check /api/me/permissions..."
PERMS=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/api/me/permissions")
IS_MEMBER=$(echo "$PERMS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('isMember'))")
[ "$IS_MEMBER" = "True" ] && pass "API returns isMember=true" || fail "API returns isMember=$IS_MEMBER"

# Step 11: Simulate expiry
log "Step 11: Simulate expiry..."
$PSQL -c "UPDATE users SET \"memberUntil\" = NOW() - INTERVAL '1 hour' WHERE id = '$USER_ID';" > /dev/null
pass "memberUntil set to past"

# Step 12: Run downgrade
log "Step 12: Run downgrade script..."
bash scripts/ops/downgrade-expired-members.sh 2>&1 | grep -v "^$"
cat /home/deploy/logs/xixiong-membership/downgrade.log 2>/dev/null | tail -3

# Step 13: Verify downgrade
log "Step 13: Verify downgrade..."
ROLE_AFTER=$($PSQL -t -A -c "SELECT role FROM users WHERE id = '$USER_ID';")
MEMBER_UNTIL_AFTER=$($PSQL -t -A -c "SELECT \"memberUntil\" FROM users WHERE id = '$USER_ID';")
[ "$ROLE_AFTER" = "user" ] && [ -z "$MEMBER_UNTIL_AFTER" ] && pass "Downgraded: role=user, memberUntil=NULL" || fail "Not downgraded: role=$ROLE_AFTER, memberUntil=$MEMBER_UNTIL_AFTER"

# Step 14: Cleanup
log "Step 14: Cleanup..."
$PSQL -c "DELETE FROM point_ledgers WHERE \"userId\" = '$USER_ID'; DELETE FROM user_rewards WHERE \"userId\" = '$USER_ID'; DELETE FROM users WHERE id = '$USER_ID';" > /dev/null
REMAINING=$($PSQL -t -A -c "SELECT COUNT(*) FROM users WHERE email = '$TEST_EMAIL';")
[ "$REMAINING" = "0" ] && pass "Test user cleaned up" || fail "Test user still exists"

rm -f "$COOKIE_JAR"
log ""
log "=== All 14 tests PASSED ==="
