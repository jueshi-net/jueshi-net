#!/usr/bin/env bash
# ai-patch-runner.sh — Deterministic patch applier for AI-generated patches
#
# Usage:
#   ./scripts/ai-patch-runner.sh /path/to/task.patch
#   ./scripts/ai-patch-runner.sh /path/to/task.patch --dry-run
#
# Flow:
#   1. Check patch file exists
#   2. Check git worktree is clean
#   3. Parse modified files from patch
#   4. Check files against allowlist
#   5. Check files against hard-block list
#   6. git apply --check
#   7. Create backup diff
#   8. git apply
#   9. Verify post-apply diff matches allowlist
#  10. npm run build
#  11. On build failure: git reset --hard HEAD → PATCH_BUILD_FAILED_ROLLED_BACK
#  12. On success: PATCH_APPLIED_BUILD_OK (no auto-commit)

set -euo pipefail

# ─── Configuration ───
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$REPO_ROOT/.patch-backups"

# ─── Allowlist (glob patterns relative to repo root) ───
ALLOWLIST=(
  "src/app/(public)/**"
  "src/components/layout/**"
  "src/components/ui-lab/**"
  "docs/**"
)

# ─── Hard block list (exact or prefix match) ───
HARD_BLOCK=(
  "package.json"
  "package-lock.json"
  "prisma/schema.prisma"
  "src/middleware.ts"
  "src/app/api/"
  "src/lib/task-chain.ts"
  "src/lib/destinations-db.ts"
  ".env"
  ".env."
  "SKILL.md"
)

# ─── Colors ───
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

info() { echo "[INFO] $*"; }
ok()   { echo -e "${GREEN}[OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*"; }

DRY_RUN=false
if [ "${2:-}" = "--dry-run" ]; then
  DRY_RUN=true
  info "DRY RUN mode — no changes will be applied"
fi

# ─── 0. Check arguments ───
if [ $# -lt 1 ]; then
  err "Usage: $0 <patch-file> [--dry-run]"
  exit 1
fi

PATCH_FILE="$1"

# ─── 1. Check patch file exists ───
if [ ! -f "$PATCH_FILE" ]; then
  err "Patch file not found: $PATCH_FILE"
  exit 1
fi
ok "Patch file exists: $PATCH_FILE"
PATCH_SIZE=$(wc -c < "$PATCH_FILE" | tr -d ' ')
info "Patch size: ${PATCH_SIZE} bytes"

# ─── 2. Check git worktree for conflicts with patch files ───
# Only check if files the patch will touch are dirty, not the entire worktree.
# This allows pipeline state files (.hermes/pipeline/) to change during execution.
cd "$REPO_ROOT"

# Get list of files the patch will modify
PATCH_TARGETS=$(grep '^+++ b/' "$PATCH_FILE" | sed 's|^+++ b/||' | sort -u)

# Check if any of those specific files have uncommitted changes
CONFLICTING_FILES=""
for f in $PATCH_TARGETS; do
  if git status --porcelain -- "$f" 2>/dev/null | grep -q .; then
    CONFLICTING_FILES="$CONFLICTING_FILES $f"
  fi
done

if [ -n "$CONFLICTING_FILES" ]; then
  err "Git worktree has uncommitted changes to files the patch will modify:"
  echo "$CONFLICTING_FILES" | tr ' ' '\n' | grep -v '^$' | sed 's/^/  /'
  echo "PIPELINE_INFRA_BLOCKED_DIRTY_WORKTREE"
  exit 1
fi
ok "No conflicts between patch targets and worktree changes"

# ─── 3. Parse modified files from patch ───
# Extract file paths from "diff --git a/... b/..." lines
PATCH_FILES=$(grep '^diff --git' "$PATCH_FILE" | sed 's|diff --git a/.* b/||' | sort -u)

if [ -z "$PATCH_FILES" ]; then
  err "No files found in patch"
  exit 1
fi

PATCH_FILE_COUNT=$(echo "$PATCH_FILES" | wc -l | tr -d ' ')
info "Patch modifies $PATCH_FILE_COUNT file(s):"
echo "$PATCH_FILES" | sed 's/^/  /'
echo ""

# ─── 4 & 5. Check against hard-block and allowlist ───
check_hard_block() {
  local file="$1"
  for blocked in "${HARD_BLOCK[@]}"; do
    # Exact match
    if [ "$file" = "$blocked" ]; then
      return 0
    fi
    # Prefix match (for directories like src/app/api/)
    if [[ "$file" == ${blocked}* ]]; then
      return 0
    fi
    # Suffix match (for .env.*, SKILL.md)
    if [[ "$file" == *"$blocked" ]]; then
      return 0
    fi
    # Glob match for .env.*
    if [ "$blocked" = ".env." ] && [[ "$file" == .env.* ]]; then
      return 0
    fi
  done
  return 1
}

check_allowlist() {
  local file="$1"
  for pattern in "${ALLOWLIST[@]}"; do
    # Convert glob to a simple prefix check
    # "src/app/(public)/**" → starts with "src/app/(public)/"
    local prefix="${pattern%/\*\*}"
    if [[ "$file" == ${prefix}/* ]] || [ "$file" = "$prefix" ]; then
      return 0
    fi
    # Also handle "docs/**" → starts with "docs/"
    if [[ "$file" == ${prefix}/* ]]; then
      return 0
    fi
  done
  return 1
}

HARD_BLOCKED_FOUND=false
ALLOWLIST_VIOLATION=false

while IFS= read -r file; do
  # Check hard block first
  if check_hard_block "$file"; then
    err "HARD BLOCKED: $file"
    HARD_BLOCKED_FOUND=true
  fi

  # Check allowlist
  if ! check_allowlist "$file"; then
    err "OUTSIDE ALLOWLIST: $file"
    ALLOWLIST_VIOLATION=true
  fi
done <<< "$PATCH_FILES"

if [ "$HARD_BLOCKED_FOUND" = true ]; then
  echo ""
  echo "PATCH_HARD_BLOCKED_PATH"
  exit 1
fi

if [ "$ALLOWLIST_VIOLATION" = true ]; then
  echo ""
  echo "PATCH_OUTSIDE_ALLOWLIST"
  exit 1
fi

ok "All files pass hard-block and allowlist checks"
echo ""

# ─── Dry-run exit point ───
if [ "$DRY_RUN" = true ]; then
  info "DRY RUN: All checks passed. Would apply patch."
  echo "PATCH_DRY_RUN_OK"
  exit 0
fi

# ─── 6. git apply --check ───
info "Running git apply --check..."
if ! git apply --check "$PATCH_FILE" 2>&1; then
  err "git apply --check FAILED"
  echo "PATCH_APPLY_CHECK_FAILED"
  exit 1
fi
ok "git apply --check passed"

# ─── 7. Create backup diff ───
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
BACKUP_FILE="$BACKUP_DIR/pre-patch-${TIMESTAMP}.diff"
git diff HEAD > "$BACKUP_FILE" 2>/dev/null || true
ok "Backup saved: $BACKUP_FILE"

# ─── 8. git apply ───
info "Applying patch..."
if ! git apply "$PATCH_FILE" 2>&1; then
  err "git apply FAILED"
  echo "PATCH_APPLY_FAILED"
  exit 1
fi
ok "Patch applied successfully"

# ─── 9. Verify post-apply diff ───
POST_FILES=$(git diff --name-only | sort -u)
POST_FILE_COUNT=$(echo "$POST_FILES" | wc -l | tr -d ' ')
info "Post-apply diff: $POST_FILE_COUNT file(s):"
echo "$POST_FILES" | sed 's/^/  /'

# Re-check allowlist on actual diff
POST_VIOLATION=false
while IFS= read -r file; do
  # Skip pipeline state files (modified by night-run.sh itself, not business code)
  if [[ "$file" == .hermes/* ]]; then
    continue
  fi
  if check_hard_block "$file"; then
    err "POST-APPLY HARD BLOCKED: $file"
    POST_VIOLATION=true
  fi
  if ! check_allowlist "$file"; then
    err "POST-APPLY OUTSIDE ALLOWLIST: $file"
    POST_VIOLATION=true
  fi
done <<< "$POST_FILES"

if [ "$POST_VIOLATION" = true ]; then
  err "Post-apply diff violates allowlist — rolling back"
  git checkout -- . 2>/dev/null || git reset --hard HEAD
  echo "PATCH_POST_APPLY_VIOLATION_ROLLED_BACK"
  exit 1
fi
ok "Post-apply diff passes all checks"
echo ""

# ─── 10. npm run build ───
info "Running npm run build..."
BUILD_START=$(date +%s)
if ! npm run build 2>&1; then
  BUILD_END=$(date +%s)
  BUILD_DURATION=$(( BUILD_END - BUILD_START ))
  err "Build FAILED after ${BUILD_DURATION}s — rolling back"
  git reset --hard HEAD
  echo "PATCH_BUILD_FAILED_ROLLED_BACK"
  exit 1
fi
BUILD_END=$(date +%s)
BUILD_DURATION=$(( BUILD_END - BUILD_START ))
ok "Build succeeded in ${BUILD_DURATION}s"
echo ""

# ─── 11. Success ───
echo "═══════════════════════════════════════════════"
echo "  PATCH_APPLIED_BUILD_OK"
echo "═══════════════════════════════════════════════"
echo ""
info "Files modified:"
echo "$POST_FILES" | sed 's/^/  /'
echo ""
info "Backup at: $BACKUP_FILE"
info "Next steps:"
info "  1. Review: git diff"
info "  2. Stage:  git add <specific-files>"
info "  3. Commit: git commit -m '<message>'"
info "  4. Deploy: ./scripts/deploy-staging.sh"
echo ""
echo "CLAUDE_GENERATED_PATCH"
echo "HERMES_APPLIED_PATCH"

exit 0
