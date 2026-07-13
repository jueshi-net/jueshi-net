# Program Queue Spec

## Current Task
Task: TOOLS_MOBILE_VISUAL_SAMPLE_V2

## Task Priority
P0: Mobile visual sample for /tools page

## Task Requirements
1. Create mobile visual sample for /tools page only
2. User acceptance via real screenshots required before expanding
3. Do NOT modify other public pages until /tools is accepted

## Task Status
Pending: Awaiting user to switch to DEV mode and execute

---

## Completed Tasks

### PROGRAM_MANAGER_V4_BOOTSTRAP_LOCK (COMPLETED)
- P0: Bootstrap System ✅
- P1: SSH Check Script ✅
- P2: Deploy Guard ✅
- P3: Memory Lock ✅
- P4: 429 Recovery ✅
- P5: Checkpoint System ✅
- P6: Report Quality ✅

### Remediation (COMPLETED)
- Bootstrap lock scope violation audit ✅
- 4 violation commits reverted ✅
- Safety branch created ✅
- Development branch reconciled ✅
- All 11 checkpoint states integrated ✅
- 429 deterministic tests passed ✅
- Deploy guard production isolation verified ✅

---

## Paused Tasks

### COMPONENT_CONSOLIDATION_RETRY_WITH_CLAUDE_V3 (PAUSED)
**Status**: PAUSED - Requires Claude Code pipeline

**Scope**:
- MetricCard → StatsCard merge
- Workspace EmptyState → Design System EmptyState
- StatusBadge merge

**Requirements**:
- Must use Claude Code (not Hermes direct edit)
- Full-file proposal required
- Patch Runner application required
- Allowlist verification required
- Build + staging + runtime verification required
- User confirmation required

**Reason for pause**: Previous attempt violated BOOTSTRAP_LOCK scope by using Hermes direct edit instead of Claude Code pipeline.

---

## Next Business Task

### TOOLS_MOBILE_VISUAL_SAMPLE_V2 (PENDING)
**Goal**: Create mobile visual sample for /tools page only

**Scope**:
- Mobile responsive design for /tools page
- Visual consistency with design system
- User acceptance via real screenshots

**NOT in scope**:
- Other public pages (/resources, /guides, etc.)
- Workspace pages
- Admin pages

**Acceptance criteria**:
- User reviews real screenshots on mobile device
- Visual consistency confirmed
- Explicit user approval to expand to other pages
