#!/usr/bin/env bash
# claude-generate-patch.sh — Generate a unified diff patch via Claude Code
#
# Usage:
#   ./scripts/claude-generate-patch.sh <task-description> <output-patch-path>
#
# Example:
#   ./scripts/claude-generate-patch.sh \
#     "将 /guides 页面包裹为 JueshiV4PublicShell" \
#     /tmp/guides-v4.patch
#
# Exit codes:
#   0  — patch generated successfully
#   1  — missing arguments
#   2  — claude-safe not found
#   75 — rate limited (CLAUDE_CODE_RATE_LIMITED_PAUSED)
#   76 — cooldown / concurrent block (CLAUDE_CODE_COOLDOWN_OR_CONCURRENT_BLOCKED)
#   124 — timeout (NIGHT2_CLAUDE_PATCH_TIMEOUT)
#   125 — no patch found in output (NIGHT_PATCH_NOT_FOUND)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ─── Configuration ───
CLAUDE_SAFE="${CLAUDE_SAFE:-$HOME/bin/claude-safe}"
TIMEOUT_SEC="${CLAUDE_TIMEOUT:-180}"
PIPELINE_DIR="$REPO_ROOT/.hermes/pipeline"

# ─── Colors ───
if [ -t 1 ]; then
  RED='\033[0;31m'; YELLOW='\033[0;33m'; GREEN='\033[0;32m'; NC='\033[0m'
else
  RED=''; YELLOW=''; GREEN=''; NC=''
fi

info() { echo "[INFO] $*"; }
ok()   { echo -e "${GREEN}[OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*"; }

# ─── 0. Check arguments ───
if [ $# -lt 2 ]; then
  err "Usage: $0 <task-description> <output-patch-path>"
  exit 1
fi

TASK_DESC="$1"
OUTPUT_PATCH="$2"
STDOUT_LOG="${OUTPUT_PATCH%.patch}.stdout.txt"
STDERR_LOG="${OUTPUT_PATCH%.patch}.stderr.txt"

# ─── 1. Check claude-safe exists ───
if [ ! -x "$CLAUDE_SAFE" ]; then
  err "claude-safe not found or not executable: $CLAUDE_SAFE"
  err "Set CLAUDE_SAFE env var to override path"
  exit 2
fi
ok "claude-safe found: $CLAUDE_SAFE"

# ─── 2. Check not already running ───
RUNNING_LOCK="$PIPELINE_DIR/locks/claude-running.lock"
if [ -f "$RUNNING_LOCK" ]; then
  LOCK_PID=$(cat "$RUNNING_LOCK" 2>/dev/null || echo "?")
  if kill -0 "$LOCK_PID" 2>/dev/null; then
    err "Claude Code already running (PID=$LOCK_PID)"
    echo "CLAUDE_CODE_COOLDOWN_OR_CONCURRENT_BLOCKED"
    exit 76
  else
    warn "Stale lock found (PID=$LOCK_PID not running), removing"
    rm -f "$RUNNING_LOCK"
  fi
fi

# ─── 3. Check rate limit ───
RATE_LIMIT_LOCK="$HOME/.claude-code-bridge/rate-limit.lock"
if [ -f "$RATE_LIMIT_LOCK" ]; then
  warn "rate-limit.lock exists — Claude may be rate limited"
  cat "$RATE_LIMIT_LOCK" 2>/dev/null | sed 's/^/  /'
fi

# ─── 4. Acquire running lock ───
echo "$$" > "$RUNNING_LOCK"
trap 'rm -f "$RUNNING_LOCK"' EXIT

# ─── 5. Build prompt ───
PROMPT="请为以下任务生成 unified diff patch（只输出 diff，不要解释）：

${TASK_DESC}

要求：
- 只输出 unified diff，以 'diff --git' 开头
- 不修改业务逻辑
- 不修改 API/schema/package
- 保持原有内容与链接
- 不引入假链接
- 不新增依赖"

# ─── 6. Call claude-safe ───
info "Calling claude-safe..."
info "Task: ${TASK_DESC:0:80}..."
info "Output: $OUTPUT_PATCH"
info "Timeout: ${TIMEOUT_SEC}s"

START_TIME=$(date +%s)

set +e
"$CLAUDE_SAFE" --print --output-format=text "$PROMPT" \
  > "$STDOUT_LOG" 2> "$STDERR_LOG"
EXIT_CODE=$?
set -e

END_TIME=$(date +%s)
ELAPSED=$(( END_TIME - START_TIME ))

info "Elapsed: ${ELAPSED}s"
info "Exit code: $EXIT_CODE"

# ─── 7. Handle exit codes ───
case "$EXIT_CODE" in
  0)
    ok "claude-safe completed successfully"
    ;;
  75)
    err "Rate limited"
    echo "CLAUDE_CODE_RATE_LIMITED_PAUSED"
    exit 75
    ;;
  76)
    err "Cooldown / concurrent block"
    echo "CLAUDE_CODE_COOLDOWN_OR_CONCURRENT_BLOCKED"
    exit 76
    ;;
  124)
    err "Timeout after ${TIMEOUT_SEC}s"
    echo "CLAUDE_PATCH_TIMEOUT"
    exit 124
    ;;
  *)
    err "Unexpected exit code: $EXIT_CODE"
    err "Check stderr: $STDERR_LOG"
    exit "$EXIT_CODE"
    ;;
esac

# ─── 8. Extract patch from stdout ───
if command -v python3 >/dev/null 2>&1; then
  python3 - "$STDOUT_LOG" "$OUTPUT_PATCH" <<'PYEOF'
import sys
from pathlib import Path

stdout_path = sys.argv[1]
output_path = sys.argv[2]

content = Path(stdout_path).read_text(encoding="utf-8", errors="ignore")
idx = content.find("diff --git ")
if idx < 0:
    print("NIGHT_PATCH_NOT_FOUND")
    sys.exit(125)

patch = content[idx:].strip() + "\n"
Path(output_path).write_text(patch, encoding="utf-8")
print(f"PATCH_EXTRACTED: {output_path}")
print(f"PATCH_SIZE: {len(patch)} bytes")
PYEOF
  EXTRACT_RC=$?
else
  # Fallback: grep-based extraction
  if grep -q '^diff --git ' "$STDOUT_LOG"; then
    sed -n '/^diff --git /,$p' "$STDOUT_LOG" > "$OUTPUT_PATCH"
    EXTRACT_RC=0
    echo "PATCH_EXTRACTED (grep fallback): $OUTPUT_PATCH"
  else
    echo "NIGHT_PATCH_NOT_FOUND"
    EXTRACT_RC=125
  fi
fi

if [ "$EXTRACT_RC" -ne 0 ]; then
  err "No patch found in Claude output"
  echo "NIGHT_PATCH_NOT_FOUND"
  exit 125
fi

ok "Patch saved: $OUTPUT_PATCH"
echo "CLAUDE_GENERATED_PATCH"
exit 0
