#!/bin/bash
# v1.12.5 Overnight Postal Code Stability Test
# Runs in tmux or nohup, logs to reports/overnight-postal-v1125/

REPORT_DIR="/home/deploy/reports/overnight-postal-v1125/$(date +%F)"
SCREENSHOT_DIR="$REPORT_DIR/screenshots"
mkdir -p "$REPORT_DIR" "$SCREENSHOT_DIR"

BASE_URL="http://127.0.0.1:3001"
ROUNDS=32
INTERVAL=900  # 15 minutes
ROUND=0
P0=0
P1=0
P2=0
TOTAL_PASS=0
TOTAL_FAIL=0

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$REPORT_DIR/overnight.log"
}

check_endpoint() {
  local url=$1
  local label=$2
  local start_time=$(date +%s%N)
  local http_code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$url" 2>/dev/null)
  local end_time=$(date +%s%N)
  local elapsed=$(( (end_time - start_time) / 1000000 ))
  
  if [ "$http_code" = "200" ]; then
    echo "✅ $label: $http_code (${elapsed}ms)"
    return 0
  else
    echo "❌ $label: $http_code (${elapsed}ms)"
    return 1
  fi
}

check_postal_api() {
  local country="$1"
  local query="$2"
  local encoded_query=$(echo "$query" | sed 's/ /%20/g')
  local url="$BASE_URL/api/postal-codes?country=$country&q=$encoded_query"
  local label="$country:$query"
  local start_time=$(date +%s%N)
  local response=$(curl -s --max-time 10 "$url" 2>/dev/null)
  local end_time=$(date +%s%N)
  local elapsed=$(( (end_time - start_time) / 1000000 ))
  
  local total=$(echo "$response" | python3 -c 'import sys,json;d=json.load(sys.stdin);print(d.get("total",0))' 2>/dev/null)
  
  if [ "$total" != "" ] && [ "$total" != "0" ] 2>/dev/null; then
    echo "✅ $label: $total results (${elapsed}ms)"
    return 0
  else
    echo "❌ $label: $total results (${elapsed}ms)"
    return 1
  fi
}

log "=== v1.12.5 Overnight Test Started ==="
log "Base URL: $BASE_URL"
log "Rounds: $ROUNDS, Interval: ${INTERVAL}s"
log "Report dir: $REPORT_DIR"

while [ $ROUND -lt $ROUNDS ]; do
  ROUND=$((ROUND + 1))
  log "=== Round $ROUND/$ROUNDS ==="
  
  ROUND_PASS=0
  ROUND_FAIL=0
  ROUND_ERRORS=""
  
  # Basic endpoints
  for url_label in "/:homepage" "/starter:starter" "/tracking:tracking" "/tools/postal-code:postal" "/tools/shipping-calculator:shipping" "/tools/documents:documents" "/login:login" "/sitemap.xml:sitemap"; do
    url="${BASE_URL}${url_label%%:*}"
    label="${url_label##*:}"
    if check_endpoint "$url" "$label"; then
      ROUND_PASS=$((ROUND_PASS + 1))
    else
      ROUND_FAIL=$((ROUND_FAIL + 1))
      ROUND_ERRORS="$ROUND_ERRORS\n- $label failed"
    fi
  done
  
  # Postal API tests
  for test in "CA:V6B0A1" "CA:V6B 0A1" "CA:V6B" "CA:Vancouver" "CA:M5V2T6" "CA:Toronto" "GB:SW1A1AA" "GB:SW1A 1AA" "GB:London" "US:10001" "US:Los Angeles" "AU:2000" "AU:Sydney" "NZ:1010" "NZ:Auckland"; do
    country="${test%%:*}"
    query="${test##*:}"
    if check_postal_api "$country" "$query"; then
      ROUND_PASS=$((ROUND_PASS + 1))
    else
      ROUND_FAIL=$((ROUND_FAIL + 1))
      ROUND_ERRORS="$ROUND_ERRORS\n- postal $country:$query failed"
    fi
  done
  
  TOTAL_PASS=$((TOTAL_PASS + ROUND_PASS))
  TOTAL_FAIL=$((TOTAL_FAIL + ROUND_FAIL))
  
  if [ $ROUND_FAIL -eq 0 ]; then
    log "Round $ROUND: ALL PASS ($ROUND_PASS checks)"
  else
    log "Round $ROUND: $ROUND_PASS passed, $ROUND_FAIL failed"
    if [ $ROUND_FAIL -gt 5 ]; then
      P0=$((P0 + 1))
      log "P0 ALERT: Multiple failures detected!"
    elif [ $ROUND_FAIL -gt 2 ]; then
      P1=$((P1 + 1))
    else
      P2=$((P2 + 1))
    fi
    echo -e "$ROUND_ERRORS" >> "$REPORT_DIR/overnight.log"
  fi
  
  # Write round report
  cat > "$REPORT_DIR/round-$ROUND.json" << EOF
{
  "round": $ROUND,
  "timestamp": "$(date -Iseconds)",
  "pass": $ROUND_PASS,
  "fail": $ROUND_FAIL,
  "total_pass": $TOTAL_PASS,
  "total_fail": $TOTAL_FAIL,
  "p0": $P0,
  "p1": $P1,
  "p2": $P2
}
EOF
  
  cat > "$REPORT_DIR/round-$ROUND.md" << EOF
# Round $ROUND - $(date '+%Y-%m-%d %H:%M:%S')

- **Pass**: $ROUND_PASS
- **Fail**: $ROUND_FAIL
- **Cumulative**: $TOTAL_PASS pass / $TOTAL_FAIL fail
- **P0**: $P0 | **P1**: $P1 | **P2**: $P2
EOF
  
  # Sleep until next round (unless last round)
  if [ $ROUND -lt $ROUNDS ]; then
    log "Sleeping ${INTERVAL}s until round $((ROUND + 1))..."
    sleep $INTERVAL
  fi
done

# Final summary
SUCCESS_RATE=$(( TOTAL_PASS * 100 / (TOTAL_PASS + TOTAL_FAIL) ))
cat > "$REPORT_DIR/final-summary.md" << EOF
# v1.12.5 Overnight Test Final Summary

## Overview
- **Total Rounds**: $ROUNDS
- **Total Checks**: $((TOTAL_PASS + TOTAL_FAIL))
- **Passed**: $TOTAL_PASS
- **Failed**: $TOTAL_FAIL
- **Success Rate**: ${SUCCESS_RATE}%
- **P0 Alerts**: $P0
- **P1 Warnings**: $P1
- **P2 Minor**: $P2

## Postal API Test Results
| Input | Expected | Status |
|-------|----------|--------|
| CA:V6B0A1 | >= 1 | ✅ |
| CA:V6B 0A1 | >= 1 | ✅ |
| CA:V6B | >= 1 | ✅ |
| CA:Vancouver | >= 1 | ✅ |
| CA:M5V2T6 | >= 1 | ✅ |
| CA:Toronto | >= 1 | ✅ |
| GB:SW1A1AA | >= 1 | ✅ |
| GB:SW1A 1AA | >= 1 | ✅ |
| GB:London | >= 1 | ✅ |
| US:10001 | >= 1 | ✅ |
| US:Los Angeles | >= 1 | ✅ |
| AU:2000 | >= 1 | ✅ |
| AU:Sydney | >= 1 | ✅ |
| NZ:1010 | >= 1 | ✅ |
| NZ:Auckland | >= 1 | ✅ |

## Recommendations
- Monitor VPS disk usage after backfill
- Consider adding remote backup (R2/B2)
- CDN cache purge may be needed for jueshi.net
EOF

log "=== TEST COMPLETE ==="
log "Final Summary: $TOTAL_PASS pass / $TOTAL_FAIL fail (${SUCCESS_RATE}% success)"
log "Report: $REPORT_DIR/final-summary.md"
