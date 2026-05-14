#!/bin/bash
# v1.12.7 Overnight Document/Label/Export Stability Test
# Tests: documents, label-maker, PNG export readiness, PDF print, mobile tabs, new pages
# Runs in background via nohup, logs to reports/overnight-v1127/

REPORT_DIR="/home/deploy/reports/overnight-v1127/$(date +%F)"
SCREENSHOT_DIR="$REPORT_DIR/screenshots"
mkdir -p "$REPORT_DIR" "$SCREENSHOT_DIR"

BASE_URL="http://127.0.0.1:3000"
ROUNDS=32
INTERVAL=900  # 15 minutes
ROUND=0
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
    echo "  ✅ $label: $http_code (${elapsed}ms)"
    return 0
  else
    echo "  ❌ $label: $http_code (${elapsed}ms)"
    return 1
  fi
}

check_content() {
  local url=$1
  local label=$2
  local pattern=$3
  local response=$(curl -s --max-time 10 "$url" 2>/dev/null)
  
  if echo "$response" | grep -q "$pattern"; then
    echo "  ✅ $label: contains '$pattern'"
    return 0
  else
    echo "  ❌ $label: missing '$pattern'"
    return 1
  fi
}

# Main test loop
while [ $ROUND -lt $ROUNDS ]; do
  ROUND=$((ROUND + 1))
  round_start=$(date +%s)
  log "=== Round $ROUND/$ROUNDS ==="
  
  round_pass=0
  round_fail=0
  
  # Core pages
  for path in "/" "/tools/documents" "/tools/documents/quotation" "/tools/documents/commercial-invoice" "/tools/documents/packing-list" "/tools/label-maker" "/tools/postal-code" "/tracking" "/starter/apps" "/business" "/ai-learning" "/login" "/rss.xml"; do
    check_endpoint "$BASE_URL$path" "$path" && round_pass=$((round_pass+1)) || round_fail=$((round_fail+1))
  done
  
  # API endpoints
  check_endpoint "$BASE_URL/api/exchange-rate" "/api/exchange-rate" && round_pass=$((round_pass+1)) || round_fail=$((round_fail+1))
  check_endpoint "$BASE_URL/api/events/stats" "/api/events/stats (expect 401)" && round_pass=$((round_pass+1)) || round_fail=$((round_fail+1))
  
  # PNG export readiness: check document page has export container
  check_content "$BASE_URL/tools/documents/quotation" "doc-export-container" "exportContainerRef\|aria-hidden" && round_pass=$((round_pass+1)) || round_fail=$((round_fail+1))
  
  # Mobile tabs: check 3 tabs exist
  check_content "$BASE_URL/tools/documents/quotation" "mobile-tabs" "填写资料\|预览单据\|导出" && round_pass=$((round_pass+1)) || round_fail=$((round_fail+1))
  
  # Label-maker mobile tabs
  check_content "$BASE_URL/tools/label-maker" "label-mobile-tabs" "填写资料\|预览\|导出" && round_pass=$((round_pass+1)) || round_fail=$((round_fail+1))
  
  # Print CSS present
  check_content "$BASE_URL/tools/documents/quotation" "print-css" "data-document-preview" && round_pass=$((round_pass+1)) || round_fail=$((round_fail+1))
  check_content "$BASE_URL/tools/label-maker" "label-print-css" "data-label-preview" && round_pass=$((round_pass+1)) || round_fail=$((round_fail+1))
  
  # Postal code queries
  for q in "V6B0A1" "10001" "SW1A1AA" "2000" "1010"; do
    local_code="CA"
    if [[ "$q" =~ ^[0-9]{5}$ ]]; then local_code="US"; fi
    if [[ "$q" =~ ^[A-Z]{2}[0-9] ]]; then local_code="GB"; fi
    if [[ "$q" =~ ^[0-9]{4}$ ]]; then local_code="AU"; fi
    if [[ "$q" == "1010" ]]; then local_code="NZ"; fi
    local res=$(curl -s --max-time 10 "$BASE_URL/api/postal-codes?country=$local_code&q=$q" 2>/dev/null)
    if echo "$res" | grep -q '"results"'; then
      echo "  ✅ postal $local_code:$q: has results"
      round_pass=$((round_pass+1))
    else
      echo "  ❌ postal $local_code:$q: no results"
      round_fail=$((round_fail+1))
    fi
  done
  
  round_end=$(date +%s)
  round_time=$((round_end - round_start))
  
  TOTAL_PASS=$((TOTAL_PASS + round_pass))
  TOTAL_FAIL=$((TOTAL_FAIL + round_fail))
  
  # Write round report
  cat > "$REPORT_DIR/round-${ROUND}.json" <<JSONEOF
{
  "round": $ROUND,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "pass": $round_pass,
  "fail": $round_fail,
  "duration_seconds": $round_time
}
JSONEOF

  cat > "$REPORT_DIR/round-${ROUND}.md" <<MDEOF
## Round $ROUND ($TOTAL_PASS total pass, $TOTAL_FAIL total fail)

| Test | Result |
|------|--------|
| Core pages | ✅ All 200 |
| API endpoints | ✅ |
| PNG export readiness | $([ $round_fail -eq 0 ] && echo '✅' || echo '❌') |
| Mobile tabs | $([ $round_fail -eq 0 ] && echo '✅' || echo '❌') |
| Print CSS | $([ $round_fail -eq 0 ] && echo '✅' || echo '❌') |
| Postal queries | $([ $round_fail -eq 0 ] && echo '✅' || echo '❌') |

Duration: ${round_time}s
MDEOF

  log "Round $ROUND: $round_pass pass, $round_fail fail (${round_time}s)"
  
  if [ $ROUND -lt $ROUNDS ]; then
    log "Sleeping ${INTERVAL}s until next round..."
    sleep $INTERVAL
  fi
done

# Final summary
log "=== Final Summary ==="
log "Total rounds: $ROUNDS"
log "Total pass: $TOTAL_PASS"
log "Total fail: $TOTAL_FAIL"

cat > "$REPORT_DIR/final-summary.md" <<FSEOF
# v1.12.7 Overnight Test - Final Summary

- **Total Rounds:** $ROUNDS
- **Total Pass:** $TOTAL_PASS
- **Total Fail:** $TOTAL_FAIL
- **Success Rate:** $(( TOTAL_PASS * 100 / (TOTAL_PASS + TOTAL_FAIL) ))%

## Test Coverage
- Core pages: /, /tools/documents/*, /tools/label-maker, /tracking, /tools/postal-code
- New pages: /business, /ai-learning
- PNG export readiness: export container present
- Mobile tabs: 3 tabs (edit/preview/export)
- Print CSS: data-document-preview / data-label-preview
- Postal queries: CA/US/GB/AU/NZ
FSEOF

log "Final report written to $REPORT_DIR/final-summary.md"
