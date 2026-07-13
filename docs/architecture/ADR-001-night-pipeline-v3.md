# ADR-001: Night Pipeline V3 (Full-file Proposal Mode)

## Status

✅ **Accepted** (2026-07-08)

## Context

We needed an automated system to apply UI changes during overnight development cycles. The requirements were:

1. Apply low-risk UI changes (V4 Shell migration, Design System adoption) without manual intervention
2. Ensure changes are safe and reversible
3. Integrate with existing development workflow
4. Minimize risk of breaking production

Previous attempts (V1, V2) failed due to:
- **V1**: Hermes Agent read file content and passed to Claude, causing information loss
- **V2**: Claude Code generated unified diff patches directly, but patch format was often incorrect (hunk header errors, context line mismatches)

## Decision

Implement **Night Pipeline V3** using a "Full-file Proposal" approach:

1. **Claude Code** reads target files using Read tool
2. **Claude Code** outputs complete new file content (not patches)
3. **Script** extracts proposals to `.hermes/pipeline/proposals/<task-id>/<path>`
4. **Script** generates unified diff using `diff -u`
5. **ai-patch-runner.sh** validates and applies patches
6. **Build verification** runs `npm run build`
7. **Auto-rollback** on failure via `git reset --hard`

### Key Components

- `scripts/night-run.sh` — Main orchestrator
- `scripts/claude-generate-patch.sh` — Claude Code integration
- `scripts/ai-patch-runner.sh` — Patch validation and application
- `.hermes/pipeline/` — State management (queue.json, state.json, completed.json)

### Safety Mechanisms

- **Allowlist validation**: Only specific paths can be modified
- **Hard blocklist**: Critical files never touched (package.json, prisma/schema.prisma, middleware.ts, etc.)
- **Build verification**: All changes must pass `npm run build`
- **Auto-rollback**: Failed builds trigger `git reset --hard`
- **No auto-commit**: Changes require manual review and commit

## Alternatives Considered

### Alternative 1: Direct Claude Code File Editing

**Approach**: Let Claude Code directly edit files using Write/Edit tools

**Pros**:
- Simpler implementation
- Faster execution

**Cons**:
- No audit trail
- Hard to review changes
- High risk of breaking changes
- No automatic rollback

**Why Rejected**: Violates safety principles, no verification step

### Alternative 2: Claude Code Generates Patches (V2)

**Approach**: Claude Code reads files and generates unified diff patches

**Pros**:
- Smaller data transfer
- More "elegant" solution

**Cons**:
- Patch format errors (hunk headers, context lines)
- High failure rate (~30%)
- Requires manual intervention

**Why Rejected**: Unreliable, requires too much manual fixing

### Alternative 3: Manual Development

**Approach**: Developer manually implements changes

**Pros**:
- Full control
- Immediate feedback

**Cons**:
- Time-consuming
- Not scalable
- Prone to human error
- No overnight automation

**Why Rejected**: Defeats the purpose of automation

## Consequences

### Positive

1. **Reliability**: Patch generation success rate ~100% (vs ~70% in V2)
2. **Safety**: All changes verified before deployment
3. **Auditability**: Complete proposal files stored for review
4. **Reversibility**: Auto-rollback on failure
5. **Scalability**: Can process multiple tasks overnight
6. **Transparency**: Clear separation between proposal generation and application

### Negative

1. **Storage**: Proposal files consume disk space (~1-2MB per task)
2. **Complexity**: More moving parts than direct editing
3. **Debugging**: When patches fail, need to inspect proposals
4. **Learning Curve**: Developers need to understand the pipeline

### Mitigations

- **Storage**: Proposals stored in `.hermes/pipeline/proposals/`, can be cleaned periodically
- **Complexity**: Well-documented in `docs/NIGHT_PIPELINE.md`
- **Debugging**: Proposals are human-readable, easy to inspect
- **Learning Curve**: `PROJECT_GOVERNANCE.md` provides step-by-step guide

## Implementation Details

### Task Queue Format

```json
{
  "id": "night3-topics-search-v4-shell",
  "title": "Apply V4 Shell to topics and search pages",
  "mode": "full-file-proposal",
  "allowed_files": [
    "src/app/(public)/topics/page.tsx",
    "src/app/(public)/search/page.tsx"
  ],
  "prompt": "Output complete new file content..."
}
```

### Claude Code Output Format

```
<<<FILE:src/app/(public)/topics/page.tsx>>>
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';

export default function TopicsPage() {
  return (
    <JueshiV4PublicShell>
      {/* page content */}
    </JueshiV4PublicShell>
  );
}
<<<END_FILE>>>
```

### Execution Flow

```bash
# 1. Prepare task queue
cat > .hermes/pipeline/queue.json << 'EOF'
[...]
EOF

# 2. Run pipeline
bash scripts/night-run.sh

# 3. Check results
bash scripts/night-run.sh --status
```

## Related Decisions

- **ADR-002**: V4 Shell architecture
- **ADR-003**: Design System adoption
- **ADR-005**: Production protection rules

## References

- `docs/NIGHT_PIPELINE.md` — Full pipeline documentation
- `scripts/night-run.sh` — Implementation
- `PROJECT_GOVERNANCE.md` — Usage guide

---

**Decision Date**: 2026-07-08  
**Decision Makers**: Development Team  
**Review Date**: 2026-10-08 (quarterly)
