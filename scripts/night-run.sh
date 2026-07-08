#!/usr/bin/env bash
# night-run.sh — Orchestrate a full night pipeline run
#
# Usage:
#   ./scripts/night-run.sh                     # run next task from queue
#   ./scripts/night-run.sh --status            # show pipeline status
#   ./scripts/night-run.sh --enqueue <desc>    # add task to queue
#   ./scripts/night-run.sh --list              # list queue
#   ./scripts/night-run.sh --dry-run           # simulate without applying
#
# Flow:
#   1. Health check
#   2. Dequeue next task
#   3. Generate patch (via claude-generate-patch.sh)
#   4. Apply patch (via ai-patch-runner.sh)
#   5. Deploy staging
#   6. curl verify
#   7. Update state
#
# Idempotent: safe to re-run. Will skip already-completed tasks.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PIPELINE_DIR="$REPO_ROOT/.hermes/pipeline"
STATE_FILE="$PIPELINE_DIR/state.json"
QUEUE_FILE="$PIPELINE_DIR/queue.json"
COMPLETED_FILE="$PIPELINE_DIR/completed.json"
LOCKS_DIR="$PIPELINE_DIR/locks"

# ─── Colors ───
if [ -t 1 ]; then
  RED='\033[0;31m'; YELLOW='\033[0;33m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'
else
  RED=''; YELLOW=''; GREEN=''; CYAN=''; NC=''
fi

info()  { echo "[INFO] $*"; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*"; }
step()  { echo -e "${CYAN}[STEP]${NC} $*"; }

# ─── Ensure dirs exist ───
mkdir -p "$LOCKS_DIR"

# ─── Init state files if missing ───
init_state() {
  if [ ! -f "$STATE_FILE" ]; then
    echo '{"status":"IDLE","current_task":null,"last_run":null,"last_result":null}' > "$STATE_FILE"
  fi
  if [ ! -f "$QUEUE_FILE" ]; then
    echo '[]' > "$QUEUE_FILE"
  fi
  if [ ! -f "$COMPLETED_FILE" ]; then
    echo '[]' > "$COMPLETED_FILE"
  fi
}

init_state

# ─── Subcommands ───

cmd_status() {
  echo "═══════════════════════════════════════════════"
  echo "  Night Pipeline Status"
  echo "═══════════════════════════════════════════════"
  echo ""
  echo "State:"
  python3 -c "
import json, sys
state = json.load(open('$STATE_FILE'))
for k, v in state.items():
    print(f'  {k}: {v}')
" 2>/dev/null || cat "$STATE_FILE" | sed 's/^/  /'
  echo ""
  echo "Queue:"
  python3 -c "
import json
q = json.load(open('$QUEUE_FILE'))
if not q:
    print('  (empty)')
else:
    for i, item in enumerate(q):
        print(f'  [{i}] {item}')
" 2>/dev/null || cat "$QUEUE_FILE" | sed 's/^/  /'
  echo ""
  echo "Completed:"
  python3 -c "
import json
c = json.load(open('$COMPLETED_FILE'))
if not c:
    print('  (none)')
else:
    for item in c:
        print(f'  ✅ {item}')
" 2>/dev/null || cat "$COMPLETED_FILE" | sed 's/^/  /'
  echo ""
  echo "Locks:"
  ls -la "$LOCKS_DIR/" 2>/dev/null | grep -v '^total' | sed 's/^/  /' || echo "  (none)"
}

cmd_enqueue() {
  if [ $# -lt 1 ]; then
    err "Usage: $0 --enqueue <task-description>"
    exit 1
  fi
  TASK="$*"
  python3 - "$QUEUE_FILE" "$TASK" <<'PYEOF'
import json, sys
queue_path = sys.argv[1]
task = sys.argv[2]
q = json.load(open(queue_path))
q.append({"desc": task, "added": __import__("datetime").datetime.now().isoformat()})
json.dump(q, open(queue_path, "w"), indent=2, ensure_ascii=False)
print(f"ENQUEUED: {task}")
print(f"Queue size: {len(q)}")
PYEOF
}

cmd_list() {
  cmd_status
}

cmd_dry_run() {
  info "DRY RUN — simulating night run without applying"
  DRY_RUN=true
  cmd_run_inner
}

cmd_run_inner() {
  DRY_RUN="${DRY_RUN:-false}"
  RUN_ID="night-$(date '+%Y%m%d-%H%M%S')"
  PATCH_DIR="$REPO_ROOT/.hermes/pipeline/patches"
  mkdir -p "$PATCH_DIR"

  echo "═══════════════════════════════════════════════"
  echo "  Night Run: $RUN_ID"
  echo "  Dry Run: $DRY_RUN"
  echo "═══════════════════════════════════════════════"
  echo ""

  # ─── Step 1: Health check ───
  step "1/7 Health check"
  if [ -x "$SCRIPT_DIR/hermes-health-check.sh" ]; then
    HEALTH_OUTPUT=$(bash "$SCRIPT_DIR/hermes-health-check.sh" 2>&1) || true
    if echo "$HEALTH_OUTPUT" | grep -q "HERMES_FD_CRITICAL"; then
      err "Health check FAILED: FD CRITICAL"
      python3 - "$STATE_FILE" <<'PYEOF'
import json, sys
s = json.load(open(sys.argv[1]))
s["status"] = "BLOCKED_BY_HEALTH_CHECK"
s["last_run"] = __import__("datetime").datetime.now().isoformat()
s["last_result"] = "HERMES_FD_CRITICAL"
json.dump(s, open(sys.argv[1], "w"), indent=2)
PYEOF
      echo "NIGHT_BLOCKED_BY_HEALTH_CHECK"
      exit 1
    fi
    ok "Health check passed"
  else
    warn "hermes-health-check.sh not found, skipping"
  fi
  echo ""

  # ─── Step 2: Dequeue next task ───
  step "2/7 Dequeue next task"
  
  # V2: Extract task-id, prompt, and allowed_files from queue
  eval "$(python3 - "$QUEUE_FILE" <<'PYEOF'
import json, sys, shlex
q = json.load(open(sys.argv[1]))
if not q:
    print('TASK_ID="__EMPTY__"')
    print('TASK_PROMPT=""')
    print('TASK_ALLOWED_FILES="[]"')
else:
    task = q[0]
    task_id = task.get("id", f"task-{__import__('hashlib').md5(task.get('prompt','').encode()).hexdigest()[:8]}")
    prompt = task.get("prompt") or task.get("desc") or task.get("title", "")
    allowed_files = json.dumps(task.get("allowed_files", []))
    print(f'TASK_ID={shlex.quote(task_id)}')
    print(f'TASK_PROMPT={shlex.quote(prompt)}')
    print(f'TASK_ALLOWED_FILES={shlex.quote(allowed_files)}')
PYEOF
  )"

  if [ "$TASK_ID" = "__EMPTY__" ]; then
    info "Queue is empty — nothing to do"
    python3 - "$STATE_FILE" <<'PYEOF'
import json, sys
s = json.load(open(sys.argv[1]))
s["status"] = "IDLE"
s["last_run"] = __import__("datetime").datetime.now().isoformat()
s["last_result"] = "QUEUE_EMPTY"
json.dump(s, open(sys.argv[1], "w"), indent=2)
PYEOF
    echo "NIGHT_QUEUE_EMPTY"
    exit 0
  fi

  ok "Task ID: $TASK_ID"
  ok "Task: ${TASK_PROMPT:0:100}..."
  info "Allowed files: $TASK_ALLOWED_FILES"

  # Update state
  python3 - "$STATE_FILE" "$TASK_ID" "$RUN_ID" <<'PYEOF'
import json, sys
s = json.load(open(sys.argv[1]))
s["status"] = "RUNNING"
s["current_task"] = sys.argv[2]
s["run_id"] = sys.argv[3]
s["last_run"] = __import__("datetime").datetime.now().isoformat()
json.dump(s, open(sys.argv[1], "w"), indent=2)
PYEOF
  echo ""

  PATCH_FILE="$PATCH_DIR/${TASK_ID}.patch"

  if [ "$DRY_RUN" = "true" ]; then
    info "DRY RUN: Would generate patch for task: $TASK_ID"
    info "DRY RUN: Task prompt: ${TASK_PROMPT:0:100}..."
    info "DRY RUN: Allowed files: $TASK_ALLOWED_FILES"
    info "DRY RUN: Would save to: $PATCH_FILE"
    info "DRY RUN: Would apply via ai-patch-runner.sh"
    info "DRY RUN: Would deploy staging"
    info "DRY RUN: Would curl verify"
    echo "NIGHT_DRY_RUN_OK"
    exit 0
  fi

  # ─── Step 3: Generate patch (V3: Claude outputs full files, script generates patch) ───
  step "3/7 Generate patch (V3 full-file proposal mode)"
  PROPOSALS_DIR="$REPO_ROOT/.hermes/pipeline/proposals/$TASK_ID"
  mkdir -p "$PROPOSALS_DIR"
  if [ -x "$SCRIPT_DIR/claude-generate-patch.sh" ]; then
    # V3: Pass task-id, prompt, and allowed-files to claude-generate-patch.sh
    # Claude will output complete file contents, script will generate patch
    bash "$SCRIPT_DIR/claude-generate-patch.sh" "$TASK_ID" "$TASK_PROMPT" "$TASK_ALLOWED_FILES"
    GEN_RC=$?
    if [ $GEN_RC -ne 0 ]; then
      err "Patch generation failed (exit=$GEN_RC)"
      python3 - "$STATE_FILE" "$GEN_RC" <<'PYEOF'
import json, sys
s = json.load(open(sys.argv[1]))
s["status"] = "PATCH_GENERATION_FAILED"
s["last_result"] = f"EXIT_{sys.argv[2]}"
json.dump(s, open(sys.argv[1], "w"), indent=2)
PYEOF
      exit $GEN_RC
    fi
    ok "Patch generated: $PATCH_FILE"
  else
    err "claude-generate-patch.sh not found or not executable"
    exit 2
  fi
  echo ""

  # ─── Step 4: Apply patch ───
  step "4/7 Apply patch"
  if [ -x "$SCRIPT_DIR/ai-patch-runner.sh" ]; then
    bash "$SCRIPT_DIR/ai-patch-runner.sh" "$PATCH_FILE"
    APPLY_RC=$?
    if [ $APPLY_RC -ne 0 ]; then
      err "Patch apply failed (exit=$APPLY_RC)"
      python3 - "$STATE_FILE" "$APPLY_RC" <<'PYEOF'
import json, sys
s = json.load(open(sys.argv[1]))
s["status"] = "PATCH_APPLY_FAILED"
s["last_result"] = f"EXIT_{sys.argv[2]}"
json.dump(s, open(sys.argv[1], "w"), indent=2)
PYEOF
      exit $APPLY_RC
    fi
    ok "Patch applied successfully"
  else
    err "ai-patch-runner.sh not found or not executable"
    exit 2
  fi
  echo ""

  # ─── Step 5: Deploy staging ───
  step "5/7 Deploy staging"
  if [ -x "$REPO_ROOT/scripts/deploy-staging.sh" ]; then
    bash "$REPO_ROOT/scripts/deploy-staging.sh"
    DEPLOY_RC=$?
    if [ $DEPLOY_RC -ne 0 ]; then
      err "Deploy failed (exit=$DEPLOY_RC)"
      echo "NIGHT_DEPLOY_FAILED"
      exit $DEPLOY_RC
    fi
    ok "Deploy successful"
  else
    warn "deploy-staging.sh not found, skipping deploy"
  fi
  echo ""

  # ─── Step 6: curl verify ───
  step "6/7 curl verify"
  CURL_URLS=(
    "https://i.jueshi.net/"
    "https://i.jueshi.net/tools"
    "https://i.jueshi.net/destinations"
    "https://i.jueshi.net/resources"
  )
  CURL_ALL_OK=true
  for url in "${CURL_URLS[@]}"; do
    HTTP_CODE=$(curl -sI -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
      ok "$url → $HTTP_CODE"
    else
      err "$url → $HTTP_CODE"
      CURL_ALL_OK=false
    fi
  done
  if [ "$CURL_ALL_OK" = false ]; then
    warn "Some curl checks failed"
  fi
  echo ""

  # ─── Step 7: Update state ───
  step "7/7 Update state"
  python3 - "$STATE_FILE" "$QUEUE_FILE" "$COMPLETED_FILE" "$TASK_ID" "$RUN_ID" <<'PYEOF'
import json, sys, datetime

state_path = sys.argv[1]
queue_path = sys.argv[2]
completed_path = sys.argv[3]
task_id = sys.argv[4]
run_id = sys.argv[5]

# Update state
s = json.load(open(state_path))
s["status"] = "COMPLETED"
s["current_task"] = None
s["last_result"] = "PATCH_APPLIED_BUILD_OK"
s["run_id"] = run_id
json.dump(s, open(state_path, "w"), indent=2)

# Dequeue
q = json.load(open(queue_path))
if q:
    task_id_in_queue = q[0].get("id", "")
    if task_id_in_queue == task_id:
        q.pop(0)
json.dump(q, open(queue_path, "w"), indent=2, ensure_ascii=False)

# Add to completed
c = json.load(open(completed_path))
c.append({
    "id": task_id,
    "run_id": run_id,
    "completed": datetime.datetime.now().isoformat(),
    "result": "PATCH_APPLIED_BUILD_OK"
})
json.dump(c, open(completed_path, "w"), indent=2, ensure_ascii=False)

print(f"COMPLETED: {task_id}")
PYEOF

  echo ""
  echo "═══════════════════════════════════════════════"
  echo "  NIGHT_RUN_OK: $RUN_ID"
  echo "═══════════════════════════════════════════════"
}

# ─── Main dispatch ───
case "${1:-}" in
  --status)
    cmd_status
    ;;
  --enqueue)
    shift
    cmd_enqueue "$@"
    ;;
  --list)
    cmd_list
    ;;
  --dry-run)
    cmd_dry_run
    ;;
  --help|-h)
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  (no args)         Run next task from queue"
    echo "  --status          Show pipeline status"
    echo "  --enqueue <desc>  Add task to queue"
    echo "  --list            List queue and completed"
    echo "  --dry-run         Simulate without applying"
    echo "  --help            Show this help"
    ;;
  *)
    cmd_run_inner
    ;;
esac
