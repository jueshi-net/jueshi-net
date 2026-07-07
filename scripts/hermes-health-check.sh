#!/usr/bin/env bash
# hermes-health-check.sh — Read-only health check for Hermes/Claude/node processes
# Checks: FD limits, process counts, rate-limit locks, FD usage per PID
# Does NOT kill any process. Does NOT modify any state.
#
# Usage:
#   ./scripts/hermes-health-check.sh           # full check
#   ./scripts/hermes-health-check.sh <PID>     # check specific PID FD count

set -euo pipefail

# ─── Thresholds ───
FD_WARNING=500
FD_CRITICAL=1000

# ─── Colors (if terminal) ───
if [ -t 1 ]; then
  RED='\033[0;31m'
  YELLOW='\033[0;33m'
  GREEN='\033[0;32m'
  NC='\033[0m'
else
  RED=''
  YELLOW=''
  GREEN=''
  NC=''
fi

STATUS="HEALTH_OK"

warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
crit() { echo -e "${RED}[CRIT]${NC} $*"; STATUS="HERMES_FD_CRITICAL"; }
info() { echo "[INFO] $*"; }
ok()   { echo -e "${GREEN}[OK]${NC} $*"; }

echo "═══════════════════════════════════════════════"
echo "  Hermes Health Check"
echo "═══════════════════════════════════════════════"
echo ""

# ─── 1. Time ───
info "Time: $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo ""

# ─── 2. FD Limits ───
info "ulimit -n (soft limit): $(ulimit -n 2>/dev/null || echo 'N/A')"

if command -v launchctl >/dev/null 2>&1; then
  info "launchctl limit maxfiles:"
  launchctl limit maxfiles 2>/dev/null | sed 's/^/  /' || info "  (launchctl not available or failed)"
else
  info "launchctl: not available (not macOS)"
fi
echo ""

# ─── 3. Specific PID check ───
if [ $# -ge 1 ]; then
  TARGET_PID="$1"
  if [ -d "/proc/$TARGET_PID/fd" ]; then
    FD_COUNT=$(ls "/proc/$TARGET_PID/fd" 2>/dev/null | wc -l | tr -d ' ')
  elif command -v lsof >/dev/null 2>&1; then
    FD_COUNT=$(lsof -p "$TARGET_PID" 2>/dev/null | wc -l | tr -d ' ')
  else
    FD_COUNT="N/A"
  fi
  info "PID $TARGET_PID FD count: $FD_COUNT"
  if [ "$FD_COUNT" != "N/A" ]; then
    if [ "$FD_COUNT" -gt "$FD_CRITICAL" ] 2>/dev/null; then
      crit "PID $TARGET_PID FD=$FD_COUNT > $FD_CRITICAL (CRITICAL)"
    elif [ "$FD_COUNT" -gt "$FD_WARNING" ] 2>/dev/null; then
      warn "PID $TARGET_PID FD=$FD_COUNT > $FD_WARNING (WARNING)"
      if [ "$STATUS" = "HEALTH_OK" ]; then STATUS="HERMES_FD_WARNING"; fi
    else
      ok "PID $TARGET_PID FD=$FD_COUNT (within limits)"
    fi
  fi
  echo ""
fi

# ─── 4. Hermes / Claude / node / tsserver processes ───
info "Relevant processes (hermes/claude/node/tsserver):"
echo "───────────────────────────────────────────────"
if command -v ps >/dev/null 2>&1; then
  PS_OUTPUT=$(ps aux 2>/dev/null | grep -iE '(hermes|claude|node|tsserver)' | grep -v grep || true)
  if [ -n "$PS_OUTPUT" ]; then
    echo "$PS_OUTPUT" | head -30 | sed 's/^/  /'
    PROC_COUNT=$(echo "$PS_OUTPUT" | wc -l | tr -d ' ')
    info "Total matching processes: $PROC_COUNT"
  else
    ok "No hermes/claude/node/tsserver processes found"
  fi
else
  warn "ps command not available"
fi
echo ""

# ─── 5. Top 20 PIDs by FD count ───
info "Top 20 PIDs by FD count:"
echo "───────────────────────────────────────────────"
if [ -d /proc ]; then
  # Linux: count /proc/*/fd
  for pid_dir in /proc/[0-9]*; do
    pid=$(basename "$pid_dir")
    if [ -d "$pid_dir/fd" ]; then
      count=$(ls "$pid_dir/fd" 2>/dev/null | wc -l | tr -d ' ')
      cmd=$(cat "$pid_dir/comm" 2>/dev/null || echo "?")
      echo "$count $pid $cmd"
    fi
  done 2>/dev/null | sort -rn | head -20 | while read -r cnt pid cmd; do
    if [ "$cnt" -gt "$FD_CRITICAL" ] 2>/dev/null; then
      crit "  PID=$pid FD=$cnt CMD=$cmd"
    elif [ "$cnt" -gt "$FD_WARNING" ] 2>/dev/null; then
      warn "  PID=$pid FD=$cnt CMD=$cmd"
    else
      echo "  PID=$pid FD=$cnt CMD=$cmd"
    fi
  done
elif command -v lsof >/dev/null 2>&1; then
  # macOS: use lsof
  lsof 2>/dev/null | awk '{print $1, $2}' | sort | uniq -c | sort -rn | head -20 | while read -r cnt cmd pid; do
    if [ "$cnt" -gt "$FD_CRITICAL" ] 2>/dev/null; then
      crit "  PID=$pid FD=$cnt CMD=$cmd"
    elif [ "$cnt" -gt "$FD_WARNING" ] 2>/dev/null; then
      warn "  PID=$pid FD=$cnt CMD=$cmd"
    else
      echo "  PID=$pid FD=$cnt CMD=$cmd"
    fi
  done
else
  warn "Cannot enumerate FDs (no /proc, no lsof)"
fi
echo ""

# ─── 6. Hermes-related PID FD check ───
info "Hermes-related PID FD summary:"
echo "───────────────────────────────────────────────"
if command -v ps >/dev/null 2>&1; then
  HERMES_PIDS=$(ps aux 2>/dev/null | grep -iE '(hermes|claude)' | grep -v grep | awk '{print $2}' || true)
  if [ -n "$HERMES_PIDS" ]; then
    for pid in $HERMES_PIDS; do
      if [ -d "/proc/$pid/fd" ]; then
        FD_COUNT=$(ls "/proc/$pid/fd" 2>/dev/null | wc -l | tr -d ' ')
      elif command -v lsof >/dev/null 2>&1; then
        FD_COUNT=$(lsof -p "$pid" 2>/dev/null | wc -l | tr -d ' ')
      else
        FD_COUNT="N/A"
      fi
      CMD=$(ps -p "$pid" -o comm= 2>/dev/null || echo "?")
      if [ "$FD_COUNT" != "N/A" ]; then
        if [ "$FD_COUNT" -gt "$FD_CRITICAL" ] 2>/dev/null; then
          crit "Hermes PID=$pid FD=$FD_COUNT CMD=$CMD (CRITICAL)"
        elif [ "$FD_COUNT" -gt "$FD_WARNING" ] 2>/dev/null; then
          warn "Hermes PID=$pid FD=$FD_COUNT CMD=$CMD (WARNING)"
          if [ "$STATUS" = "HEALTH_OK" ]; then STATUS="HERMES_FD_WARNING"; fi
        else
          ok "Hermes PID=$pid FD=$FD_COUNT CMD=$CMD"
        fi
      else
        info "Hermes PID=$pid FD=N/A CMD=$CMD"
      fi
    done
  else
    ok "No Hermes/Claude processes running"
  fi
fi
echo ""

# ─── 7. Claude Code Bridge locks ───
info "Claude Code Bridge lock files:"
echo "───────────────────────────────────────────────"
RATE_LIMIT_LOCK="$HOME/.claude-code-bridge/rate-limit.lock"
RUNNING_LOCK="$HOME/.claude-code-bridge/claude-safe-running.lock"

if [ -f "$RATE_LIMIT_LOCK" ]; then
  LOCK_AGE_SEC=$(( $(date +%s) - $(stat -f %m "$RATE_LIMIT_LOCK" 2>/dev/null || stat -c %Y "$RATE_LIMIT_LOCK" 2>/dev/null || echo 0) ))
  warn "rate-limit.lock EXISTS (age: ${LOCK_AGE_SEC}s)"
  cat "$RATE_LIMIT_LOCK" 2>/dev/null | sed 's/^/  /'
  if [ "$STATUS" = "HEALTH_OK" ]; then STATUS="CLAUDE_RATE_LIMIT_ACTIVE"; fi
else
  ok "rate-limit.lock: not present"
fi

if [ -f "$RUNNING_LOCK" ]; then
  LOCK_AGE_SEC=$(( $(date +%s) - $(stat -f %m "$RUNNING_LOCK" 2>/dev/null || stat -c %Y "$RUNNING_LOCK" 2>/dev/null || echo 0) ))
  warn "claude-safe-running.lock EXISTS (age: ${LOCK_AGE_SEC}s)"
  cat "$RUNNING_LOCK" 2>/dev/null | sed 's/^/  /'
  if [ "$STATUS" = "HEALTH_OK" ] || [ "$STATUS" = "CLAUDE_RATE_LIMIT_ACTIVE" ]; then
    STATUS="CLAUDE_RUNNING_LOCK_ACTIVE"
  fi
else
  ok "claude-safe-running.lock: not present"
fi
echo ""

# ─── 8. Final status ───
echo "═══════════════════════════════════════════════"
echo "  HEALTH STATUS: $STATUS"
echo "═══════════════════════════════════════════════"

# Exit code: 0 for OK/WARNING, 1 for CRITICAL
case "$STATUS" in
  HEALTH_OK|CLAUDE_RATE_LIMIT_ACTIVE|CLAUDE_RUNNING_LOCK_ACTIVE)
    exit 0
    ;;
  HERMES_FD_WARNING)
    exit 0
    ;;
  HERMES_FD_CRITICAL)
    exit 1
    ;;
  *)
    exit 0
    ;;
esac
