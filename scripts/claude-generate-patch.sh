#!/usr/bin/env bash
# claude-generate-patch.sh — V3: Full-file proposal mode
#
# V3 Changes (full-file proposal mode):
#   - Claude outputs complete file contents, not patches
#   - Format: <<<FILE:path/to/file>>> ... <<<END_FILE>>>
#   - Script saves proposals to .hermes/pipeline/proposals/<task-id>/<path>
#   - Script generates unified diff using diff -u
#   - Eliminates corrupt patch issues from V2
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
#   127 — missing file in proposal (FULL_FILE_PROPOSAL_MISSING_FILE)
#   128 — file outside allowlist (FULL_FILE_PROPOSAL_OUTSIDE_ALLOWLIST)
#   129 — empty patch (FULL_FILE_PROPOSAL_EMPTY_PATCH)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ─── Configuration ───
CLAUDE_SAFE="${CLAUDE_SAFE:-$HOME/bin/claude-safe}"
CLAUDE_BIN="${CLAUDE_BIN:-claude}"
TIMEOUT_SEC="${CLAUDE_TIMEOUT:-300}"
MAX_RETRIES="${CLAUDE_RETRIES:-2}"
PIPELINE_DIR="$REPO_ROOT/.hermes/pipeline"
PROPOSALS_DIR="$PIPELINE_DIR/proposals"

# Readonly-only tools: Claude can read files but NOT write them
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

V3 Full-File Proposal Mode:
  Claude Code reads actual repo files, then outputs complete file contents.
  Script generates unified diff patch from proposals.

Arguments:
  task-id              Unique task identifier (e.g. "night2-guides")
  task-description     What needs to be done
  allowed-files-json   JSON array of files Claude may modify

Output Format (Claude must output):
  <<<FILE:path/to/file>>>
  [complete file content]
  <<<END_FILE>>>

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
TASK_PROPOSALS_DIR="$PROPOSALS_DIR/$TASK_ID"

# ─── 6. Build prompt (V3: full-file proposal mode) ───
PROMPT="You are a code modification assistant for a Next.js project.

TASK:
${TASK_DESC}

ALLOWED FILES TO MODIFY (only these files, you must output ALL of them):
${ALLOWED_FILES_JSON}

CRITICAL INSTRUCTIONS:
1. FIRST: Use the Read tool to read each target file listed above. You MUST see the actual file contents before generating any output.
2. Analyze the real code structure, imports, and patterns.
3. Output the COMPLETE NEW CONTENT of each modified file using the exact format below.
4. Do NOT use Write, Edit, or any file-modification tools.
5. Do NOT output unified diff patches.
6. Do NOT add explanations, markdown code blocks, or commentary outside the file markers.

OUTPUT FORMAT (you MUST output every file in the allowed list):
<<<FILE:path/to/file>>>
[complete file content here — the entire file, not just changed parts]
<<<END_FILE>>>

<<<FILE:path/to/another/file>>>
[complete file content here]
<<<END_FILE>>>

RULES:
- You MUST output ALL files listed in ALLOWED FILES TO MODIFY.
- Each file MUST be wrapped in <<<FILE:path>>> and <<<END_FILE>>> markers.
- The path in <<<FILE:path>>> MUST exactly match one of the allowed files.
- The content between markers MUST be the COMPLETE file content, not a partial diff.
- Do NOT output any text outside of the <<<FILE>>> / <<<END_FILE>>> blocks.
- Preserve all existing code that should not change.
- Only make the modifications described in the TASK.

JSX COMPONENT WRAPPING RULES (if task involves wrapping with a component):
When wrapping a page with a component like <JueshiV4PublicShell>:
- Add the import at the top: import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';
- Wrap the return JSX: return ( <JueshiV4PublicShell> ... </JueshiV4PublicShell> );
- Indent the existing JSX content inside the wrapper.
- Do NOT duplicate return statements or closing braces.

Remember: Read the files FIRST, then output the complete modified file contents.\""

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
      echo "RATE_LIMITED"
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
      # Check for rate limit patterns in stderr/stdout even if exit code is not 75
      if grep -qiE '(429|rate.limit|rate_limit|provider.rate|too.many.request|throttl)' "$STDERR_LOG" "$STDOUT_LOG" 2>/dev/null; then
        err "Rate limit detected in output (exit code: $EXIT_CODE)"
        echo "RATE_LIMITED"
        exit 75
      fi
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

  # Also check for rate limit patterns in successful exit (Claude may output error but exit 0)
  if [ "$EXIT_CODE" -eq 0 ] && grep -qiE '(429|rate.limit|rate_limit|provider.rate|too.many.request|throttl)' "$STDERR_LOG" "$STDOUT_LOG" 2>/dev/null; then
    err "Rate limit detected in output despite exit code 0"
    echo "RATE_LIMITED"
    exit 75
  fi

  # ─── 8. Extract proposals and generate patch (V3: full-file proposal mode) ───
  if grep -q '^<<<FILE:' "$STDOUT_LOG"; then
    # Clean proposals directory for this task
    rm -rf "$TASK_PROPOSALS_DIR"
    mkdir -p "$TASK_PROPOSALS_DIR"
    
    # Extract proposals using Python
    python3 - "$STDOUT_LOG" "$TASK_PROPOSALS_DIR" "$ALLOWED_FILES_JSON" <<'PYEOF'
import sys, re, json
from pathlib import Path

stdout_path = sys.argv[1]
proposals_dir = sys.argv[2]
allowed_files_json = sys.argv[3]

# Parse allowed files
allowed_files = set(json.loads(allowed_files_json))

# Read stdout
content = Path(stdout_path).read_text(encoding="utf-8", errors="ignore")

# Extract all <<<FILE:path>>> ... <<<END_FILE>>> blocks
pattern = r'<<<FILE:([^>]+)>>>\s*\n(.*?)\n\s*<<<END_FILE>>>'
matches = re.findall(pattern, content, re.DOTALL)

if not matches:
    print("ERROR: No <<<FILE:...>>> blocks found in output", file=sys.stderr)
    sys.exit(1)

# Track which files were output
output_files = set()

for file_path, file_content in matches:
    file_path = file_path.strip()
    output_files.add(file_path)
    
    # Check if file is in allowlist
    if file_path not in allowed_files:
        print(f"ERROR: File '{file_path}' is not in allowlist", file=sys.stderr)
        print(f"FULL_FILE_PROPOSAL_OUTSIDE_ALLOWLIST")
        sys.exit(128)
    
    # Save proposal file
    proposal_path = Path(proposals_dir) / file_path
    proposal_path.parent.mkdir(parents=True, exist_ok=True)
    proposal_path.write_text(file_content, encoding="utf-8")
    print(f"Saved proposal: {proposal_path}")

# Check if all allowed files were output
missing_files = allowed_files - output_files
if missing_files:
    print(f"ERROR: Missing proposals for files: {missing_files}", file=sys.stderr)
    print(f"FULL_FILE_PROPOSAL_MISSING_FILE")
    sys.exit(127)

print(f"OK: All {len(allowed_files)} allowed files have proposals")
PYEOF
    
    EXTRACT_RC=$?
    if [ $EXTRACT_RC -ne 0 ]; then
      if [ $EXTRACT_RC -eq 127 ]; then
        err "Missing file proposals"
        echo "FULL_FILE_PROPOSAL_MISSING_FILE"
        exit 127
      elif [ $EXTRACT_RC -eq 128 ]; then
        err "File outside allowlist"
        echo "FULL_FILE_PROPOSAL_OUTSIDE_ALLOWLIST"
        exit 128
      else
        warn "Proposal extraction failed"
        if [ "$ATTEMPT" -lt "$MAX_RETRIES" ]; then
          warn "Retrying in 5s..."
          sleep 5
          continue
        fi
      fi
    else
      # ─── 9. Generate unified diff from proposals ───
      info "Generating unified diff from proposals"
      
      # Generate patch using diff -u
      > "$OUTPUT_PATCH"
      
      # Read allowed files and generate diff for each
      python3 - "$TASK_PROPOSALS_DIR" "$REPO_ROOT" "$ALLOWED_FILES_JSON" "$OUTPUT_PATCH" <<'PYEOF'
import sys, json, subprocess
from pathlib import Path

proposals_dir = sys.argv[1]
repo_root = sys.argv[2]
allowed_files_json = sys.argv[3]
output_patch = sys.argv[4]

allowed_files = json.loads(allowed_files_json)
patch_lines = []

for file_path in allowed_files:
    original_path = Path(repo_root) / file_path
    proposal_path = Path(proposals_dir) / file_path
    
    if not proposal_path.exists():
        print(f"WARNING: Proposal not found for {file_path}", file=sys.stderr)
        continue
    
    # Generate diff using diff -u
    result = subprocess.run(
        ['diff', '-u', str(original_path), str(proposal_path)],
        capture_output=True,
        text=True
    )
    
    # diff returns 0 if no changes, 1 if differences, 2 if error
    if result.returncode == 0:
        # No changes to this file
        continue
    elif result.returncode == 1:
        # Differences found - convert to git-style patch
        diff_output = result.stdout
        
        # Convert diff output to git patch format
        lines = diff_output.split('\n')
        if len(lines) >= 3:
            # Add git diff header
            patch_lines.append(f"diff --git a/{file_path} b/{file_path}")
            patch_lines.append(f"--- a/{file_path}")
            patch_lines.append(f"+++ b/{file_path}")
            
            # Skip first 2 lines (--- and +++) from diff output, keep the rest
            for line in lines[2:]:
                patch_lines.append(line)
            
            patch_lines.append("")  # Empty line between files
    else:
        print(f"ERROR: diff failed for {file_path}: {result.stderr}", file=sys.stderr)
        sys.exit(1)

# Write patch file
Path(output_patch).write_text('\n'.join(patch_lines), encoding="utf-8")

# Check if patch is empty
if not patch_lines or all(line.strip() == '' for line in patch_lines):
    print("ERROR: Generated patch is empty", file=sys.stderr)
    print("FULL_FILE_PROPOSAL_EMPTY_PATCH")
    sys.exit(129)

print(f"Generated patch: {output_patch} ({len(patch_lines)} lines)")
PYEOF
      
      DIFF_RC=$?
      if [ $DIFF_RC -eq 129 ]; then
        err "Generated patch is empty"
        echo "FULL_FILE_PROPOSAL_EMPTY_PATCH"
        exit 129
      elif [ $DIFF_RC -ne 0 ]; then
        warn "Patch generation failed"
        if [ "$ATTEMPT" -lt "$MAX_RETRIES" ]; then
          warn "Retrying in 5s..."
          sleep 5
          continue
        fi
      else
        # Validate patch
        if [ -s "$OUTPUT_PATCH" ] && grep -qF -- "+++ b/" "$OUTPUT_PATCH"; then
          PATCH_SIZE=$(wc -c < "$OUTPUT_PATCH" | tr -d ' ')
          PATCH_FILES=$(grep '^diff --git ' "$OUTPUT_PATCH" | wc -l | tr -d ' ')
          ok "Patch generated: $OUTPUT_PATCH (${PATCH_SIZE} bytes, ${PATCH_FILES} files)"
          SUCCESS=true
          break
        else
          warn "Generated patch is invalid"
          if [ "$ATTEMPT" -lt "$MAX_RETRIES" ]; then
            warn "Retrying in 5s..."
            sleep 5
            continue
          fi
        fi
      fi
    fi
  else
    warn "No '<<<FILE:' markers found in Claude output"
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
# Use grep -qF (fixed string) to avoid regex issues with +++ and ---
# Use -- to prevent patterns starting with - from being treated as options
REQUIRED_PATTERNS=("diff --git " "--- a/" "+++ b/" "@@ ")
for pattern in "${REQUIRED_PATTERNS[@]}"; do
  if ! grep -qF -- "$pattern" "$OUTPUT_PATCH"; then
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
