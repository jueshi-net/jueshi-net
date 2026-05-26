#!/bin/bash
# browser-e2e-supervisor.sh — 通宵浏览器 E2E 测试守护脚本
# 默认运行 8 小时，每 15 分钟跑一轮
# 用法: BASE_URL=http://localhost:3000 HEADLESS=true ./scripts/qa/browser-e2e-supervisor.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORT_DATE=$(date +%Y-%m-%d)
REPORT_DIR="$ROOT_DIR/reports/browser-qa/$REPORT_DATE"
LOG_FILE="$REPORT_DIR/browser-overnight.log"

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
HEADLESS="${HEADLESS:-true}"
INTERVAL_SECONDS="${INTERVAL_SECONDS:-900}"  # 15 minutes
MAX_HOURS="${MAX_HOURS:-8}"
MOBILE="${MOBILE:-1}"  # 1=iPhone, 2=Android

# Calculate max rounds
MAX_ROUNDS=$((MAX_HOURS * 60 / (INTERVAL_SECONDS / 60)))

# Create directories
mkdir -p "$REPORT_DIR"/{screenshots,videos,traces}

# Initialize log
echo "========================================" >> "$LOG_FILE"
echo "Browser E2E Supervisor Started" >> "$LOG_FILE"
echo "Date: $(date -Iseconds)" >> "$LOG_FILE"
echo "BASE_URL=$BASE_URL" >> "$LOG_FILE"
echo "HEADLESS=$HEADLESS" >> "$LOG_FILE"
echo "INTERVAL=${INTERVAL_SECONDS}s" >> "$LOG_FILE"
echo "MAX_HOURS=$MAX_HOURS" >> "$LOG_FILE"
echo "MAX_ROUNDS=$MAX_ROUNDS" >> "$LOG_FILE"
echo "MOBILE=$MOBILE" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

log() {
  local msg="[$(date -Iseconds)] $1"
  echo "$msg"
  echo "$msg" >> "$LOG_FILE"
}

log "Starting Browser E2E Supervisor"
log "Report directory: $REPORT_DIR"
log "Will run up to $MAX_ROUNDS rounds over $MAX_HOURS hours"

ROUND=0
START_TIME=$(date +%s)
FAILURES=0

cleanup() {
  log "Received shutdown signal. Cleaning up..."
  log "Final stats: $ROUND rounds completed, $FAILURES failures"
  
  # Generate summary
  if [ -f "$SCRIPT_DIR/browser-e2e-summary.mjs" ]; then
    node "$SCRIPT_DIR/browser-e2e-summary.mjs" "$REPORT_DATE" >> "$LOG_FILE" 2>&1
  fi
  
  log "Supervisor stopped at $(date -Iseconds)"
  exit 0
}

trap cleanup SIGTERM SIGINT

while [ $ROUND -lt $MAX_ROUNDS ]; do
  ROUND=$((ROUND + 1))
  ROUND_START=$(date +%s)
  
  log "========== Round $ROUND / $MAX_ROUNDS START =========="
  
  # Run the E2E test
  MOBILE=$MOBILE BASE_URL=$BASE_URL HEADLESS=$HEADLESS node "$SCRIPT_DIR/browser-e2e-runner.mjs" --round=$ROUND 2>&1 | tee -a "$LOG_FILE"
  EXIT_CODE=${PIPESTATUS[0]}
  
  ROUND_END=$(date +%s)
  ROUND_DURATION=$((ROUND_END - ROUND_START))
  
  if [ $EXIT_CODE -eq 0 ]; then
    log "✅ Round $ROUND completed in ${ROUND_DURATION}s"
  else
    FAILURES=$((FAILURES + 1))
    log "❌ Round $ROUND failed (exit code: $EXIT_CODE) after ${ROUND_DURATION}s"
  fi
  
  # Check if we should stop early (too many consecutive failures)
  if [ $FAILURES -ge 5 ]; then
    log "⚠️  Too many consecutive failures ($FAILURES). Stopping supervisor."
    break
  fi
  
  # Sleep until next round
  if [ $ROUND -lt $MAX_ROUNDS ]; then
    SLEEP_TIME=$((INTERVAL_SECONDS - ROUND_DURATION))
    if [ $SLEEP_TIME -gt 0 ]; then
      log "⏳ Sleeping ${SLEEP_TIME}s until next round..."
      sleep $SLEEP_TIME
    else
      log "⚠️ Round took longer than interval. Starting next round immediately."
    fi
  fi
done

END_TIME=$(date +%s)
TOTAL_DURATION=$((END_TIME - START_TIME))

log "========================================"
log "Supervisor Complete"
log "Rounds: $ROUND / $MAX_ROUNDS"
log "Failures: $FAILURES"
log "Total time: ${TOTAL_DURATION}s ($((TOTAL_DURATION / 3600))h $(( (TOTAL_DURATION % 3600) / 60 ))m)"
log "========================================"

# Generate final summary
if [ -f "$SCRIPT_DIR/browser-e2e-summary.mjs" ]; then
  log "Generating final summary..."
  node "$SCRIPT_DIR/browser-e2e-summary.mjs" "$REPORT_DATE" >> "$LOG_FILE" 2>&1
fi

log "Final report: $REPORT_DIR/final-summary.md"
log "Logs: $LOG_FILE"
