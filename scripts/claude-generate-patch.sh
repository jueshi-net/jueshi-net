#!/usr/bin/env bash
# claude-generate-patch.sh — V2: Claude Code reads repo, outputs patch to stdout
#
# V2 Changes (readonly Claude patch mode):
#   - Uses -p (headless) so Claude runs full agent loop with tool access
#   - Claude reads actual files via Read tool (no more hallucinated content)
#   - Claude is restricted to readonly tools only (no Write/Edit)
#   - Patch output goes to stdout, saved by this script
#   - ai-patch-runner.sh is the sole writer
#
# Usage:
#   ./scripts/claude-generate-patch.sh <task-id> <task-description> <allowed-files-json>
#
# Example:
#   ./scripts/claude-generate-patch.sh \
#     "night2-guides" \
#     "将 /guides 页面包裹为 JueshiV4PublicShell" \
#     '["src/app/(public)/guides/page.tsx","src/app/(public)/public-layout-client.tsx"]'
#
# Exit codes:
#   0   — patch generated successfully
#   1   — missing arguments
#   2   — claude binary not found
#   75  — rate limited (CLAUDE_CODE_RATE_LIMITED_PAUSED)
#   76  — cooldown / concurrent block (CLAUDE_CODE_COOLDOWN_OR_CONCURRENT_BLOCKED)
#   124 — timeout (CLAUDE_PATCH_GENERATION_TIMEOUT)
#   125 — invalid output (PATCH_GENERATION_INVALID_OUTPUT)
#   126 — blocked (CLAUDE_PATCH_GENERATION_BLOCKED)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ─── Configuration ───
CLAUDE_SAFE="${CLAUDE_SAFE:-$HOME/bin/claude-safe}"
CLAUDE_BIN="${CLAUDE_BIN:-claude}"
TIMEOUT_SEC="${CLAUDE_TIMEOUT:-300}"
MAX_RETRIES="${CLAUDE_RETRIES:-2}"
PIPELINE_DIR="$REPO_ROOT/.hermes/pipeline"

# Readonly-only tools: Claude can read files but NOT write them
# Format: comma-separated tool names for --allowedTools
READONLY_TOOLS="Read,Grep,Glob,ListDirectory,Bash(git diff:*),Bash(git status:*),Bash(git show:*),Bash(git log:*),Bash(cat:*),Bash(head:*),Bash(tail:*),Bash(wc:*),Bash(find:*),Bash(sed -n:*),Bash(awk:*),Bash(grep:*),Bash(rg:*)"

# ─── Colors ───
if [ -t 1 ]; then
  RED='\033[0;31m'; YELLOW='\033[0;33m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'
else
  RED=''; YELLOW=''; GREEN=''; BLUE=''; NC=''
fi

info()    { echo "[INFO] $*"; }
ok()      { echo -e "${GREEN}[OK]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()     { echo -e "${RED}[ERROR]${NC} $*"; }

# ─── Usage ───
usage() {
  cat <<EOF
Usage: $0 <task-id> <task-description> <allowed-files-json>

V2 Readonly Claude Patch Mode:
  Claude Code reads actual repo files via Read tool, then outputs
  unified diff patch to stdout. No file writing. No acceptEdits.

Arguments:
  task-id              Unique task identifier (e.g. "night2-guides")
  task-description     What needs to be done
  allowed-files-json   JSON array of files Claude may modify

Environment:
  CLAUDE_SAFE          Path to claude-safe wrapper (default: ~/bin/claude-safe)
  CLAUDE_BIN           Path to claude binary (fallback: claude)
  CLAUDE_TIMEOUT       Timeout in seconds (default: 300)
  CLAUDE_RETRIES       Max retries (default: 2)
EOF
  exit 1
}

# ─── 0. Check arguments ───
if [ $# -lt 3 ]; then
  err "Missing arguments"
  usage
fi

TASK_ID="$1"
TASK_DESC="$2"
ALLOWED_FILES_JSON="$3"

# ─── 1. Find Claude binary ───
CLAUDE_CMD=""
if [ -x "$CLAUDE_SAFE" ]; then
  CLAUDE_CMD="$CLAUDE_SAFE"
  info "Using claude-safe: $CLAUDE_CMD"
elif command -v "$CLAUDE_BIN" &>/dev/null; then
  CLAUDE_CMD="$CLAUDE_BIN"
  info "Using claude: $CLAUDE_CMD"
else
  err "Neither claude-safe ($CLAUDE_SAFE) nor claude ($CLAUDE_BIN) found"
  exit 2
fi
ok "Claude binary: $CLAUDE_CMD"

# ─── 2. Check not already running ───
RUNNING_LOCK="$PIPELINE_DIR/locks/claude-running.lock"
mkdir -p "$PIPELINE_DIR/locks"
if [ -f "$RUNNING_LOCK" ]; then
  LOCK_PID=$(cat "$RUNNING_LOCK" 2>/dev/null || echo "?")
  if kill -0 "$LOCK_PID" 2>/dev/null; then
    err "Claude already running (PID=$LOCK_PID)"
    echo "CLAUDE_CODE_COOLDOWN_OR_CONCURRENT_BLOCKED"
    exit 76
  else
    warn "Stale lock (PID=$LOCK_PID not running), removing"
    rm -f "$RUNNING_LOCK"
  fi
fi

# ─── 3. Check rate limit ───
RATE_LIMIT_LOCK="$HOME/.claude-code-bridge/rate-limit.lock"
if [ -f "$RATE_LIMIT_LOCK" ]; then
  LOCK_AGE=$(( $(date +%s) - $(stat -f %m "$RATE_LIMIT_LOCK" 2>/dev/null || stat -c %Y "$RATE_LIMIT_LOCK" 2>/dev/null || echo 0) ))
  if [ "$LOCK_AGE" -lt 1320 ]; then
    err "Rate limit active (age: ${LOCK_AGE}s)"
    echo "CLAUDE_CODE_RATE_LIMITED_PAUSED"
    exit 75
  else
    warn "Stale rate limit lock (${LOCK_AGE}s old), removing"
    rm -f "$RATE_LIMIT_LOCK"
  fi
fi

# ─── 4. Acquire running lock ───
echo "$$" > "$RUNNING_LOCK"
trap 'rm -f "$RUNNING_LOCK"' EXIT

# ─── 5. Setup output paths ───
PATCH_DIR="$PIPELINE_DIR/patches"
mkdir -p "$PATCH_DIR"
OUTPUT_PATCH="$PATCH_DIR/${TASK_ID}.patch"
STDOUT_LOG="$PATCH_DIR/${TASK_ID}.stdout.txt"
STDERR_LOG="$PATCH_DIR/${TASK_ID}.stderr.txt"

# ─── 6. Build prompt ───
# Key V2 change: Claude MUST read actual files before generating patch
PROMPT="You are a patch generator for a Next.js project.

TASK:
${TASK_DESC}

ALLOWED FILES TO MODIFY (only these files):
${ALLOWED_FILES_JSON}

CRITICAL INSTRUCTIONS:
1. FIRST: Use the Read tool to read each target file listed above. You MUST see the actual file contents before generating any patch.
2. Analyze the real code structure, imports, and patterns.
3. Generate a unified diff patch that implements the requested changes.
4. The patch context lines MUST match the actual file contents you read.
5. Output ONLY the raw unified diff patch to stdout.
6. Do NOT use Write, Edit, or any file-modification tools.
7. Do NOT add explanations, markdown code blocks, or commentary.
8. Start your output directly with 'diff --git' — no preamble.

OUTPUT FORMAT (raw unified diff, nothing else):
diff --git a/path/to/file b/path/to/file
index abc1234..def5678 100644
--- a/path/to/file
+++ b/path/to/file
@@ -line,count +line,count @@
 context line
-removed line
+added line
 context line

Remember: Read the files FIRST, then generate the patch based on what you actually see."

# ─── 7. Call Claude with readonly tools ───
info "Task ID: $TASK_ID"
info "Task: ${TASK_DESC:0:100}..."
info "Allowed files: $ALLOWED_FILES_JSON"
info "Timeout: ${TIMEOUT_SEC}s"
info "Retries: $MAX_RETRIES"

ATTEMPT=0
SUCCESS=false

while [ "$ATTEMPT" -lt "$MAX_RETRIES" ]; do
  ATTEMPT=$((ATTEMPT + 1))
  info "Attempt $ATTEMPT/$MAX_RETRIES"

  START_TIME=$(date +%s)

  set +e
  # -p = headless mode (full agent loop with tool access including Read)
  # --allowedTools = restrict to readonly tools only
  # NO --acceptEdits, NO --bypassPermissions
  # macOS has no `timeout` command; use perl alarm as portable alternative
  export TIMEOUT="$TIMEOUT_SEC"
  perl -e 'alarm $ENV{TIMEOUT}; exec @ARGV' -- \
    "$CLAUDE_CMD" \
    -p \
    --allowedTools "$READONLY_TOOLS" \
    --output-format text \
    "$PROMPT" \
    > "$STDOUT_LOG" 2> "$STDERR_LOG"
  EXIT_CODE=$?
  set -e

  END_TIME=$(date +%s)
  ELAPSED=$((END_TIME - START_TIME))
  info "Elapsed: ${ELAPSED}s, Exit code: $EXIT_CODE"

  # Handle exit codes
  case "$EXIT_CODE" in
    0)
      ok "Claude completed successfully"
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
      echo "CLAUDE_PATCH_GENERATION_TIMEOUT"
      exit 124
      ;;
    1)
      # Claude may have been blocked by user
      err "Claude blocked or rejected (exit 1)"
      echo "CLAUDE_PATCH_GENERATION_BLOCKED"
      exit 126
      ;;
    *)
      err "Unexpected exit code: $EXIT_CODE"
      if [ "$ATTEMPT" -lt "$MAX_RETRIES" ]; then
        warn "Retrying in 5s..."
        sleep 5
        continue
      fi
      echo "CLAUDE_PATCH_GENERATION_BLOCKED"
      exit 126
      ;;
  esac

  # ─── 8. Extract patch from stdout ───
  if grep -q '^diff --git ' "$STDOUT_LOG"; then
    # Extract from first "diff --git" to end of file
    sed -n '/^diff --git /,$p' "$STDOUT_LOG" > "$OUTPUT_PATCH"

    # Validate patch is non-empty and has expected structure
    if [ -s "$OUTPUT_PATCH" ] && grep -q '^+++ b/' "$OUTPUT_PATCH"; then
      PATCH_SIZE=$(wc -c < "$OUTPUT_PATCH" | tr -d ' ')
      PATCH_FILES=$(grep '^diff --git ' "$OUTPUT_PATCH" | wc -l | tr -d ' ')
      ok "Patch extracted: $OUTPUT_PATCH (${PATCH_SIZE} bytes, ${PATCH_FILES} files)"
      SUCCESS=true
      break
    else
      warn "Patch extracted but invalid (missing +++ lines)"
    fi
  else
    warn "No 'diff --git' found in Claude output"
    info "Stdout preview (first 500 chars):"
    head -c 500 "$STDOUT_LOG" | sed 's/^/  /'
  fi

  if [ "$ATTEMPT" -lt "$MAX_RETRIES" ]; then
    warn "Retrying in 5s..."
    sleep 5
  fi
done

if [ "$SUCCESS" = false ]; then
  err "Failed to generate valid patch after $MAX_RETRIES attempts"
  echo "PATCH_GENERATION_INVALID_OUTPUT"
  exit 125
fi

# ─── 9. Final validation ───
# Check patch has valid unified diff structure
REQUIRED_PATTERNS=("^diff --git " "^--- a/" "^+++ b/" "^@@ ")
for pattern in "${REQUIRED_PATTERNS[@]}"; do
  if ! grep -qE "$pattern" "$OUTPUT_PATCH"; then
    err "Patch validation failed: missing '$pattern'"
    echo "PATCH_GENERATION_INVALID_OUTPUT"
    exit 125
  fi
done

# List files in patch
info "Patch modifies these files:"
grep '^diff --git ' "$OUTPUT_PATCH" | sed 's|diff --git a/.* b/|  |' | sed 's/$//'

ok "Patch generation complete: $OUTPUT_PATCH"
echo "CLAUDE_GENERATED_PATCH"
echo "$OUTPUT_PATCH"
exit 0
