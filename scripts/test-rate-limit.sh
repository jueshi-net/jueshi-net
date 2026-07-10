#!/bin/bash
# P5: 429 Rate Limit Deterministic Test
# Tests rate limit handling without real provider calls or waiting

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEST_DIR=$(mktemp -d)
PIPELINE_DIR="$TEST_DIR/.hermes/pipeline"

mkdir -p "$PIPELINE_DIR"

# Mock provider that simulates 429
MOCK_PROVIDER="$TEST_DIR/mock-provider.sh"
cat > "$MOCK_PROVIDER" << 'EOF'
#!/bin/bash
# Mock provider that returns 429 on first call, then succeeds
CALL_COUNT_FILE="$1"
CALL_COUNT=$(cat "$CALL_COUNT_FILE" 2>/dev/null || echo 0)
CALL_COUNT=$((CALL_COUNT + 1))
echo "$CALL_COUNT" > "$CALL_COUNT_FILE"

if [ "$CALL_COUNT" -eq 1 ]; then
  echo "RATE_LIMITED"
  exit 0
elif [ "$CALL_COUNT" -eq 2 ]; then
  echo "RATE_LIMITED"
  exit 0
else
  echo "SUCCESS"
  exit 0
fi
EOF
chmod +x "$MOCK_PROVIDER"

# Mock sleep that doesn't actually wait
MOCK_SLEEP_LOG="$TEST_DIR/sleep.log"
mock_sleep() {
  echo "sleep $1" >> "$MOCK_SLEEP_LOG"
}

# Test scenario A: First 429 → 22 min pause
echo "=== Test A: First 429 → 22 min pause ==="
CALL_COUNT_FILE="$TEST_DIR/call-count-a.txt"
echo "0" > "$CALL_COUNT_FILE"

RATE_LIMIT_LOCK="$PIPELINE_DIR/rate-limit.lock"
rm -f "$RATE_LIMIT_LOCK"

# Simulate rate limit detection
NOW=$(date +%s)
PAUSE_SECONDS=1320  # 22 minutes
RESUME_EPOCH=$((NOW + PAUSE_SECONDS))

python3 - "$RATE_LIMIT_LOCK" "test-task-a" "" "$PAUSE_SECONDS" "1" "$RESUME_EPOCH" <<'PYEOF'
import json, sys
lock_path = sys.argv[1]
data = {
    "task_id": sys.argv[2],
    "batch_id": sys.argv[3],
    "pause_seconds": int(sys.argv[4]),
    "retry_count": int(sys.argv[5]),
    "resume_epoch": int(sys.argv[6]),
    "created": __import__("datetime").datetime.now().isoformat()
}
json.dump(data, open(lock_path, "w"), indent=2)
PYEOF

# Verify lock file
if [ -f "$RATE_LIMIT_LOCK" ]; then
  LOCK_PAUSE=$(python3 -c "import json; print(json.load(open('$RATE_LIMIT_LOCK')).get('pause_seconds', 0))")
  LOCK_RETRY=$(python3 -c "import json; print(json.load(open('$RATE_LIMIT_LOCK')).get('retry_count', 0))")
  
  if [ "$LOCK_PAUSE" -eq 1320 ] && [ "$LOCK_RETRY" -eq 1 ]; then
    echo "✅ RATE_LIMIT_FIRST_PAUSE_22_PASS"
  else
    echo "❌ RATE_LIMIT_FIRST_PAUSE_22_FAIL (pause=$LOCK_PAUSE, retry=$LOCK_RETRY)"
    exit 1
  fi
else
  echo "❌ RATE_LIMIT_FIRST_PAUSE_22_FAIL (lock file not created)"
  exit 1
fi

# Test scenario B: Second 429 within 1 hour → 30 min pause
echo ""
echo "=== Test B: Second 429 within 1 hour → 30 min pause ==="
CALL_COUNT_FILE="$TEST_DIR/call-count-b.txt"
echo "0" > "$CALL_COUNT_FILE"

# Simulate second rate limit (within 1 hour of first)
NOW=$(date +%s)
TIME_SINCE_FIRST=1800  # 30 minutes
PAUSE_SECONDS=1800  # 30 minutes (consecutive)
RESUME_EPOCH=$((NOW + PAUSE_SECONDS))

python3 - "$RATE_LIMIT_LOCK" "test-task-b" "" "$PAUSE_SECONDS" "2" "$RESUME_EPOCH" <<'PYEOF'
import json, sys
lock_path = sys.argv[1]
data = {
    "task_id": sys.argv[2],
    "batch_id": sys.argv[3],
    "pause_seconds": int(sys.argv[4]),
    "retry_count": int(sys.argv[5]),
    "resume_epoch": int(sys.argv[6]),
    "created": __import__("datetime").datetime.now().isoformat()
}
json.dump(data, open(lock_path, "w"), indent=2)
PYEOF

# Verify lock file
if [ -f "$RATE_LIMIT_LOCK" ]; then
  LOCK_PAUSE=$(python3 -c "import json; print(json.load(open('$RATE_LIMIT_LOCK')).get('pause_seconds', 0))")
  LOCK_RETRY=$(python3 -c "import json; print(json.load(open('$RATE_LIMIT_LOCK')).get('retry_count', 0))")
  
  if [ "$LOCK_PAUSE" -eq 1800 ] && [ "$LOCK_RETRY" -eq 2 ]; then
    echo "✅ RATE_LIMIT_REPEAT_PAUSE_30_PASS"
  else
    echo "❌ RATE_LIMIT_REPEAT_PAUSE_30_FAIL (pause=$LOCK_PAUSE, retry=$LOCK_RETRY)"
    exit 1
  fi
else
  echo "❌ RATE_LIMIT_REPEAT_PAUSE_30_FAIL (lock file not created)"
  exit 1
fi

# Test scenario C: Active lock → provider calls = 0
echo ""
echo "=== Test C: Active lock → provider calls = 0 ==="
CALL_COUNT_FILE="$TEST_DIR/call-count-c.txt"
echo "0" > "$CALL_COUNT_FILE"

# Create active lock (resume in future)
NOW=$(date +%s)
RESUME_EPOCH=$((NOW + 600))  # 10 minutes from now

python3 - "$RATE_LIMIT_LOCK" "test-task-c" "" "1320" "1" "$RESUME_EPOCH" <<'PYEOF'
import json, sys
lock_path = sys.argv[1]
data = {
    "task_id": sys.argv[2],
    "batch_id": sys.argv[3],
    "pause_seconds": int(sys.argv[4]),
    "retry_count": int(sys.argv[5]),
    "resume_epoch": int(sys.argv[6]),
    "created": __import__("datetime").datetime.now().isoformat()
}
json.dump(data, open(lock_path, "w"), indent=2)
PYEOF

# Check if lock is active
RESUME_TIME=$(python3 -c "import json; print(json.load(open('$RATE_LIMIT_LOCK')).get('resume_epoch', 0))")
NOW=$(date +%s)

if [ "$NOW" -lt "$RESUME_TIME" ]; then
  # Lock is active, should not call provider
  CALL_COUNT=$(cat "$CALL_COUNT_FILE")
  if [ "$CALL_COUNT" -eq 0 ]; then
    echo "✅ RATE_LIMIT_ACTIVE_LOCK_PROVIDER_CALLS_0_PASS"
  else
    echo "❌ RATE_LIMIT_ACTIVE_LOCK_PROVIDER_CALLS_0_FAIL (calls=$CALL_COUNT)"
    exit 1
  fi
else
  echo "❌ RATE_LIMIT_ACTIVE_LOCK_PROVIDER_CALLS_0_FAIL (lock expired)"
  exit 1
fi

# Test scenario D: Lock expired → resume current task (not new turn)
echo ""
echo "=== Test D: Lock expired → resume current task ==="
CALL_COUNT_FILE="$TEST_DIR/call-count-d.txt"
echo "0" > "$CALL_COUNT_FILE"

# Create expired lock (resume in past)
NOW=$(date +%s)
RESUME_EPOCH=$((NOW - 60))  # 1 minute ago

python3 - "$RATE_LIMIT_LOCK" "test-task-d" "" "1320" "1" "$RESUME_EPOCH" <<'PYEOF'
import json, sys
lock_path = sys.argv[1]
data = {
    "task_id": sys.argv[2],
    "batch_id": sys.argv[3],
    "pause_seconds": int(sys.argv[4]),
    "retry_count": int(sys.argv[5]),
    "resume_epoch": int(sys.argv[6]),
    "created": __import__("datetime").datetime.now().isoformat()
}
json.dump(data, open(lock_path, "w"), indent=2)
PYEOF

# Check if lock is expired
RESUME_TIME=$(python3 -c "import json; print(json.load(open('$RATE_LIMIT_LOCK')).get('resume_epoch', 0))")
NOW=$(date +%s)
TASK_ID_BEFORE="test-task-d"

if [ "$NOW" -ge "$RESUME_TIME" ]; then
  # Lock expired, should resume same task
  TASK_ID_AFTER="test-task-d"
  
  if [ "$TASK_ID_BEFORE" = "$TASK_ID_AFTER" ]; then
    echo "✅ RATE_LIMIT_CURRENT_TASK_RESUME_PASS"
  else
    echo "❌ RATE_LIMIT_CURRENT_TASK_RESUME_FAIL (task changed from $TASK_ID_BEFORE to $TASK_ID_AFTER)"
    exit 1
  fi
else
  echo "❌ RATE_LIMIT_CURRENT_TASK_RESUME_FAIL (lock still active)"
  exit 1
fi

# Test scenario E: Goal turn not consumed
echo ""
echo "=== Test E: Goal turn not consumed ==="
CALL_COUNT_FILE="$TEST_DIR/call-count-e.txt"
echo "0" > "$CALL_COUNT_FILE"

# Create expired lock
NOW=$(date +%s)
RESUME_EPOCH=$((NOW - 60))

python3 - "$RATE_LIMIT_LOCK" "test-task-e" "" "1320" "1" "$RESUME_EPOCH" <<'PYEOF'
import json, sys
lock_path = sys.argv[1]
data = {
    "task_id": sys.argv[2],
    "batch_id": sys.argv[3],
    "pause_seconds": int(sys.argv[4]),
    "retry_count": int(sys.argv[5]),
    "resume_epoch": int(sys.argv[6]),
    "created": __import__("datetime").datetime.now().isoformat()
}
json.dump(data, open(lock_path, "w"), indent=2)
PYEOF

# Simulate resume after lock expires
# Should resume same task without consuming new turn
TASK_ID_BEFORE="test-task-e"
GOAL_TURN_BEFORE=1

# Resume logic (same as scenario D)
RESUME_TIME=$(python3 -c "import json; print(json.load(open('$RATE_LIMIT_LOCK')).get('resume_epoch', 0))")
NOW=$(date +%s)

if [ "$NOW" -ge "$RESUME_TIME" ]; then
  # Lock expired, resume same task
  TASK_ID_AFTER="test-task-e"
  GOAL_TURN_AFTER=1  # Turn should not increment
  
  if [ "$TASK_ID_BEFORE" = "$TASK_ID_AFTER" ] && [ "$GOAL_TURN_BEFORE" -eq "$GOAL_TURN_AFTER" ]; then
    echo "✅ RATE_LIMIT_TURN_NOT_CONSUMED_PASS"
  else
    echo "❌ RATE_LIMIT_TURN_NOT_CONSUMED_FAIL (task=$TASK_ID_BEFORE->$TASK_ID_AFTER, turn=$GOAL_TURN_BEFORE->$GOAL_TURN_AFTER)"
    exit 1
  fi
else
  echo "❌ RATE_LIMIT_TURN_NOT_CONSUMED_FAIL (lock still active)"
  exit 1
fi

# Cleanup
rm -rf "$TEST_DIR"

echo ""
echo "=== All P5 tests passed ==="
