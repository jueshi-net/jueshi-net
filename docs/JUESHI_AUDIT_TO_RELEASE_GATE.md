# Jueshi Audit → Release Gate

> **READ FIRST:** `docs/HERMES_ALWAYS_READ.md` and `docs/STAGING_FIRST_POLICY.md`.
> **Tool reference:** `tools/jueshi-audit/README.md`

**Version:** v1.20.42.18.6.6.5.2
**Date:** 2026-06-23

---

## Purpose

This document defines the flow from staging audit completion to production release. The `tools/jueshi-audit` tool produces one of four verdicts. Each verdict maps to a specific release-gate action. **No production release may proceed without a valid audit verdict backed by evidence.**

### Core rules

- **Run `tools/jueshi-audit` before production release.** This is mandatory.
- **Audit results without evidence paths cannot be used as a pass basis.** A verdict without evidence in `tools/jueshi-audit/evidence/<run-id>/` is invalid.
- **P0/P1 not cleared cannot enter OPS production release.** The user cannot exempt P0 or P1.
- **The user can exempt P2/P3** (recorded with reason in `verdict.json`), but not P0/P1.

---

## Verdicts

The audit tool emits exactly one verdict per run (stored in `reports/<run-id>/verdict.json`):

| Verdict | Meaning |
|---------|---------|
| `STAGING_AUDIT_READY_NO_P0P1` | No P0, no P1. P2 ≤ 5, P3 recorded. Core pages 100%. Production smoke passed. Staging writable flows passed. Mobile 375 no overflow. |
| `STAGING_AUDIT_FOUND_ISSUES` | No P0/P1, but P2 > 5 or non-core failures exceeding tolerance. Usable with user exemptions for P2/P3. |
| `STAGING_AUDIT_BLOCKED` | P0 or P1 found. OR core page pass rate < 90%. OR production smoke failed. OR staging writable core flows failed. |
| `FAILED` | Audit itself could not complete (crash, missing config, missing evidence, environment unreachable). |

---

## Flow: `STAGING_AUDIT_READY_NO_P0P1`

**This is the only verdict that unconditionally allows production release.**

```
STAGING_AUDIT_READY_NO_P0P1
  → Verify evidence dir exists and is non-empty (evidence/<run-id>/)
  → Verify verdict.json p0_count=0, p1_count=0
  → Present audit summary + report path + evidence path to user
  → User confirms production release
  → Switch to CURRENT_MODE=OPS
  → Execute production release (backup → deploy → smoke test → observe)
  → Post-deploy: run production smoke test
  → Report final status
```

### Conditions

- Evidence directory MUST exist and contain at least one file per phase executed.
- `verdict.json` MUST be present and parseable.
- User MUST explicitly confirm before OPS release begins.
- All existing OPS rules apply (backup, smoke test, rollback plan, observation).

### What the agent reports to the user

> "Staging audit complete. Verdict: **STAGING_AUDIT_READY_NO_P0P1**. No P0, no P1 found. P2: N, P3: N. Evidence at `tools/jueshi-audit/evidence/<run-id>/`. Report at `tools/jueshi-audit/reports/<run-id>/audit-summary.md`. Ready for OPS production release — confirm to proceed?"

---

## Flow: `STAGING_AUDIT_FOUND_ISSUES`

**Conditional. User may exempt P2/P3, then proceed. P0/P1 cannot be present in this verdict (if they were, it would be BLOCKED).**

```
STAGING_AUDIT_FOUND_ISSUES
  → Verify no P0/P1 sneaked in (if any P0/P1, escalate to BLOCKED)
  → Present bug list (P2/P3) + evidence to user
  → User decides:
      Option A: Exempt P2/P3 (with reason) → proceed to OPS release
      Option B: Request fixes → fix on staging → re-audit
  → If Option A:
      - Record exemptions in verdict.json exemptions[]
      - User confirms production release
      - Proceed to OPS release flow (same as READY_NO_P0P1)
  → If Option B:
      - Switch to CURRENT_MODE=DEV
      - Fix P2/P3 issues on staging
      - Re-run audit
      - New verdict required before release
```

### Exemption rules

- ✅ User CAN exempt P2 (UI, copy, mobile, minor function).
- ✅ User CAN exempt P3 (minor visual, spacing).
- ❌ User CANNOT exempt P0.
- ❌ User CANNOT exempt P1.
- Each exemption MUST include: bug ID, severity, and reason.
- Exemptions are recorded in `verdict.json` → `exemptions` array.

### What the agent reports to the user

> "Staging audit complete. Verdict: **STAGING_AUDIT_FOUND_ISSUES**. No P0/P1. P2: N (list), P3: N (list). You may exempt P2/P3 to proceed, or request fixes. Evidence at `tools/jueshi-audit/evidence/<run-id>/`. P0/P1 cannot be exempted — none found. How would you like to proceed?"

---

## Flow: `STAGING_AUDIT_BLOCKED`

**Hard block. Production release is forbidden.**

```
STAGING_AUDIT_BLOCKED
  → Identify blocking reason:
      - P0 found → immediate stop, report only
      - P1 found → must fix to 0
      - Core page pass rate < 90%
      - Production smoke failed
      - Staging writable core flows failed
  → Present blocker details + evidence to user
  → DO NOT proceed to production release under any circumstance
  → Switch to CURRENT_MODE=DEV
  → Fix blocking issues on staging
  → Re-run full audit (or affected phases + regression)
  → New verdict required:
      - STAGING_AUDIT_READY_NO_P0P1 → unblock, proceed
      - STAGING_AUDIT_FOUND_ISSUES → conditional, see above
      - STAGING_AUDIT_BLOCKED again → still blocked
      - FAILED → investigate
```

### P0 handling

- If P0 is found, the audit **immediately stops**. No further phases run.
- The agent outputs only the P0 bug report with full evidence.
- Verdict is `STAGING_AUDIT_BLOCKED`.
- Production release is blocked until P0 is fixed and a re-audit produces `STAGING_AUDIT_READY_NO_P0P1`.

### P1 handling

- P1 must be 0 to pass. Any P1 > 0 → `STAGING_AUDIT_BLOCKED`.
- Fix all P1 issues, re-audit.

### What the agent reports to the user

> "Staging audit complete. Verdict: **STAGING_AUDIT_BLOCKED**. Blocking reason: [P0: N / P1: N / core pass rate: X% / smoke failed / writable flow failed]. Production release is BLOCKED. Details: [bug list]. Evidence at `tools/jueshi-audit/evidence/<run-id>/`. Fix required on staging, then re-audit. P0/P1 cannot be exempted."

---

## Flow: `FAILED`

**The audit itself did not complete. No verdict about release readiness can be made.**

```
FAILED
  → Identify failure reason:
      - Audit script crashed
      - Missing environment variables / config
      - Staging or production unreachable
      - Evidence directory missing or empty after run
      - verdict.json missing or unparseable
  → DO NOT make any release decision
  → Report failure + cause to user
  → Fix audit tool / environment / connectivity
  → Re-run audit
  → New verdict required
```

### Critical rule

- A `FAILED` verdict means **no information** about release readiness.
- ❌ Do NOT treat `FAILED` as "probably fine."
- ❌ Do NOT proceed to production release.
- ✅ Treat as "audit inconclusive — re-run required."

### What the agent reports to the user

> "Staging audit FAILED. Reason: [crash / config missing / unreachable / no evidence]. No release decision can be made. Evidence at `tools/jueshi-audit/evidence/<run-id>/` (if any). Investigate and re-run the audit before any production release."

---

## Decision Matrix

```
                        ┌─────────────────────────────────────┐
                        │  Run tools/jueshi-audit             │
                        │  (before production release)        │
                        └──────────────┬──────────────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────┐
                        │  Evidence present?        │
                        │  (evidence/<run-id>/)     │
                        └──────┬─────────┬─────────┘
                          NO  │         │  YES
                              ▼         │
                        ┌──────────┐    │
                        │ FAILED   │    │
                        │ (no pass │    │
                        │  basis)  │    │
                        └──────────┘    │
                                        ▼
                        ┌──────────────────────────┐
                        │  Verdict?                │
                        └──┬────────┬────────┬─────┘
                           │        │        │
              READY_NO_P0P1│  FOUND │  BLOCKED│  FAILED
                           ▼        ▼        ▼        ▼
                     ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
                     │ ✅   │ │ ⚠️   │ │ ❌   │ │ ❌   │
                     │ Pro- │ │ User │ │ Fix  │ │ Re-  │
                     │ ceed │ │ exemp│ │ P0/P1│ │ run  │
                     │ to   │ │ P2/P3│ │ re-  │ │ audit│
                     │ OPS  │ │ or   │ │ audit│ │      │
                     │      │ │ fix  │ │      │ │      │
                     └──────┘ └──────┘ └──────┘ └──────┘
```

---

## Evidence Requirement

**Audit results without evidence paths cannot be used as a pass basis.**

Before accepting any verdict as a release gate:

1. Check `tools/jueshi-audit/evidence/<run-id>/` exists and is non-empty.
2. Check `tools/jueshi-audit/reports/<run-id>/verdict.json` exists and parses.
3. For each bug reported, verify a corresponding evidence file exists (screenshot, log).
4. If evidence is missing → treat as `FAILED` regardless of the verdict string.

---

## P0/P1 Enforcement

**P0/P1 not cleared cannot enter OPS production release.**

- P0 = 0 is mandatory. No exemptions.
- P1 = 0 is mandatory. No exemptions.
- If any P0 or P1 is present → verdict is `STAGING_AUDIT_BLOCKED` → no release.
- User exemption applies ONLY to P2 and P3.
- Even with user confirmation, the agent MUST NOT proceed to OPS release if P0/P1 > 0.

---

## Relationship to Existing Verdicts

The audit verdicts are distinct from the Hermes final-report verdicts. They map as follows:

| Audit verdict | Hermes final report verdict (typical) |
|---------------|---------------------------------------|
| `STAGING_AUDIT_READY_NO_P0P1` | `READY_FOR_OBSERVATION` (after OPS deploy) |
| `STAGING_AUDIT_FOUND_ISSUES` | `BLOCKED_NEEDS_USER_DECISION` (awaiting exemption or fix) |
| `STAGING_AUDIT_BLOCKED` | `BLOCKED_NEEDS_USER_DECISION` (fix required) |
| `FAILED` | `FAILED` |

The audit verdict gates the **transition from DEV to OPS**. The Hermes final-report verdict describes the **end state of the task**.

---

## Related Documents

- `tools/jueshi-audit/README.md` — audit tool full documentation
- `docs/HERMES_ALWAYS_READ.md` — mandatory read-first rules
- `docs/STAGING_FIRST_POLICY.md` — staging-first enforcement
- `docs/HERMES_ROLE_POLICY.md` — DEV / OPS mode definitions
- `docs/QA/QA_EXIT_CRITERIA.md` — QA exit criteria
- `docs/QA/BUG_REPORT_TEMPLATE.md` — bug report template
