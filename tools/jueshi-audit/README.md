# jueshi-audit — Staging Audit Tool

> **READ FIRST:** `docs/HERMES_ALWAYS_READ.md` and `docs/STAGING_FIRST_POLICY.md` before running this tool.
> **CURRENT_MODE:** This tool runs under `AUDIT` mode (read-only against production) or `DEV` mode (write tests on staging only). It MUST NEVER run under `OPS` mode.

**Project:** jueshi.net / xixiong-saas
**Version:** v1.20.42.18.6.6.5.2

---

## 1. Audit Goal

This tool performs an automated + semi-automated quality audit of the **staging environment** (`i.jueshi.net`) before any code or content is promoted to **production** (`jueshi.net`).

The audit verifies:

- Core page health (200 status, key elements visible, no blocking JS errors)
- Production read-only smoke (Phase 0 — read-only against jueshi.net)
- Staging writable flows (login, BBS post/reply, postal-code tool, admin CRUD, task chain, file upload, permission boundaries)
- Mobile viewport (375px no horizontal overflow)
- SEO/security (canonical, index status, upload safety, permission escalation checks)
- OPS readiness (backup script exists, rollback script exists, SSL > 30 days, disk < 80%)

The audit produces a **verdict** that acts as a release gate. See `docs/JUESHI_AUDIT_TO_RELEASE_GATE.md` for the full gate flow.

---

## 2. Install

The audit tool is a set of scripts (Node.js / shell) that live in this directory. It depends on the project's existing Node.js toolchain.

```bash
# From repo root
cd /Users/chq/xixiong-saas

# Use the project's existing node_modules — no separate install needed.
# If running on a staging server, ensure node_modules is present:
npm ci
```

The tool reuses the project's root `package.json` dependencies. There is no separate `package.json` for the audit tool itself.

---

## 3. Environment Variables

The audit tool reads environment variables. **Never commit secrets.** Copy `.env.example` to `.env.local` and fill in values locally; the `.gitignore` already excludes `.env.local`.

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `AUDIT_STAGING_URL` | yes | Staging base URL (writable tests run here) | `https://i.jueshi.net` |
| `AUDIT_PRODUCTION_URL` | yes | Production base URL (read-only smoke only) | `https://jueshi.net` |
| `AUDIT_TESTER_EMAIL` | yes | Staging test user email | `audit-tester@jueshi.net` |
| `AUDIT_TESTER_PASSWORD` | yes | Staging test user password (sent via private chat, **never committed**) | (private) |
| `AUDIT_ADMIN_EMAIL` | yes | Staging test admin email | `audit-admin@jueshi.net` |
| `AUDIT_ADMIN_PASSWORD` | yes | Staging test admin password (private chat, **never committed**) | (private) |
| `AUDIT_EVIDENCE_DIR` | no | Directory for screenshots/logs (default: `./evidence`) | `./evidence` |
| `AUDIT_REPORT_DIR` | no | Directory for audit reports (default: `./reports`) | `./reports` |
| `AUDIT_RATE_LIMIT_MS` | no | Min ms between requests (default: `1000` = 1 req/sec) | `1000` |
| `AUDIT_AUTO_CLEANUP` | no | If `true`, auto-delete test accounts after run. **Default: `false` (no auto-cleanup).** | `false` |
| `AUDIT_PRODUCTION_READONLY` | no | Enforce production read-only (default: `true`). If `false`, still no writes are performed — this is a hard guard. | `true` |

### Secret safety

- ❌ **Never** put passwords, tokens, or `DATABASE_URL` in any committed file.
- ❌ **Never** echo secrets in audit output or reports.
- ✅ Test account passwords are delivered via private chat (Telegram) and loaded from `.env.local` at runtime.

---

## 4. Run Commands

All commands are run from the `tools/jueshi-audit/` directory (or repo root with adjusted paths).

```bash
# Full audit — all phases (Phase 0 through Phase 7)
node run-audit.js --full

# Production read-only health check only (Phase 0)
node run-audit.js --phase 0

# Staging writable core flows only (Phase 2)
node run-audit.js --phase 2

# Specific phase
node run-audit.js --phase 5

# Smoke test only (Phase 0 + Phase 1)
node run-audit.js --smoke

# Regression — re-run previously failed test cases
node run-audit.js --regression

# Dry run — list what would be tested, execute nothing
node run-audit.js --dry-run

# Generate report from last run's evidence
node run-audit.js --report
```

### Common flags

| Flag | Purpose |
|------|---------|
| `--full` | Run all phases |
| `--phase N` | Run a single phase (0-7) |
| `--smoke` | Run Phase 0 + Phase 1 |
| `--regression` | Re-run failed cases from last report |
| `--dry-run` | Print test plan, do not execute |
| `--report` | Generate markdown report from existing evidence |
| `--base-url <url>` | Override staging/production URL for a single run |
| `--no-cleanup` | Explicitly disable test data cleanup (default behavior) |
| `--cleanup` | Explicitly enable test data cleanup after run |

---

## 5. Account Safety

This is critical. Violating these rules is treated as a production incident.

### Protected account — 9833416@qq.com

- ❌ **Forever forbidden** to modify, delete, reset, or repurpose `9833416@qq.com`.
- ❌ **Forever forbidden** to reset its password.
- This account is admin on production. The audit may log in **read-only** on production but MUST NOT save any form, change any setting, or trigger any write.

### Staging test accounts

| Account | Role | Environment | Purpose |
|---------|------|-------------|---------|
| `audit-tester@jueshi.net` | user | staging only | Normal user flows |
| `audit-admin@jueshi.net` | admin | staging only | Admin flows |

- These accounts exist **only on staging** (`i.jueshi.net`). They do not exist on production.
- Passwords are delivered via private chat (Telegram), never stored in the repo.
- If a staging test account can access admin on production → **P0 permission vulnerability**.

### Production account rules

- ❌ No new accounts created on production.
- ❌ No existing production account modified or deleted.
- ❌ No password resets on production.
- ❌ No `prisma db push`.
- ❌ No destructive SQL (DROP / DELETE / TRUNCATE) on production data.

---

## 6. Staging-Only Policy

All writable tests (login, post, reply, upload, admin CRUD) run **on staging only** (`i.jueshi.net`).

- Production (`jueshi.net`) is **read-only** during audit. Browse, curl, view source, check viewport — nothing more.
- If a test requires a write operation, it is redirected to staging.
- Staging data may be overwritten and does not represent production state.
- **Staging pass does NOT equal production pass.** Staging audit readiness is a prerequisite, not a substitute, for production release.

---

## 7. Evidence Paths

Every test case MUST produce evidence. **Audit results without evidence paths cannot be used as a pass basis.**

Evidence is stored under `tools/jueshi-audit/evidence/` (configurable via `AUDIT_EVIDENCE_DIR`).

```
tools/jueshi-audit/evidence/
├── <YYYY-MM-DD>_<run-id>/
│   ├── phase0/
│   │   ├── prod-home-200.png
│   │   ├── prod-destinations-200.png
│   │   ├── prod-pm2-status.txt
│   │   └── prod-ssl-check.txt
│   ├── phase1/
│   │   ├── smoke-home-desktop.png
│   │   └── smoke-home-mobile-375.png
│   ├── phase2/
│   │   ├── staging-login-success.png
│   │   ├── staging-bbs-post-create.png
│   │   ├── staging-postal-code-query.png
│   │   └── console-errors.log
│   ├── phase3/
│   │   └── admin-save-badge.png
│   ├── phase5/
│   │   ├── seo-canonical-check.txt
│   │   └── upload-rejected-executable.png
│   └── bugs/
│       ├── BUG-001-p0-login-broken.png
│       └── BUG-001-console.log
```

### Evidence requirements per bug

Each bug record MUST include:

- Screenshot (PNG) of the failure
- URL where the failure occurred
- Console error text (if any)
- Network error (request URL + status code, if any)
- Backend log excerpt (if accessible on staging)
- Reproducibility (YES / NO / intermittent)

A bug report **without** an evidence path is invalid and cannot block or pass the gate.

---

## 8. Report Paths

Audit reports are generated under `tools/jueshi-audit/reports/` (configurable via `AUDIT_REPORT_DIR`).

```
tools/jueshi-audit/reports/
├── <YYYY-MM-DD>_<run-id>/
│   ├── audit-summary.md          # Human-readable summary with verdict
│   ├── test-execution-record.md  # Filled test execution record (per QA template)
│   ├── bug-list.md               # All bugs found, sorted by severity
│   ├── exit-criteria-check.md    # Pass/fail against QA_EXIT_CRITERIA
│   └── verdict.json              # Machine-readable verdict for gate automation
```

### `verdict.json` structure

```json
{
  "run_id": "2026-06-23_001",
  "timestamp": "2026-06-23T18:00:00Z",
  "verdict": "STAGING_AUDIT_READY_NO_P0P1",
  "p0_count": 0,
  "p1_count": 0,
  "p2_count": 2,
  "p3_count": 4,
  "core_page_pass_rate": 1.0,
  "staging_writable_pass_rate": 1.0,
  "production_smoke_pass": true,
  "mobile_375_no_overflow": true,
  "evidence_dir": "evidence/2026-06-23_001",
  "exemptions": []
}
```

---

## 9. How to Judge Production Release

The audit verdict determines whether staging code may proceed to production. See `docs/JUESHI_AUDIT_TO_RELEASE_GATE.md` for the full flow.

### Quick reference

| Verdict | Meaning | Can proceed to production? |
|---------|---------|---------------------------|
| `STAGING_AUDIT_READY_NO_P0P1` | No P0, no P1. P2/P3 within tolerance. | ✅ Yes — proceed to OPS release (with user confirmation) |
| `STAGING_AUDIT_FOUND_ISSUES` | P2/P3 exceed tolerance, or non-critical failures. | ⚠️ Conditional — user may exempt P2/P3, then proceed |
| `STAGING_AUDIT_BLOCKED` | P0 or P1 found, OR core page pass rate < 90%, OR production smoke failed. | ❌ No — fix issues, re-audit |
| `FAILED` | Audit itself crashed, could not complete, or evidence missing. | ❌ No — investigate, re-run |

### Severity definitions

| Level | Definition |
|-------|------------|
| **P0** | Production down, login/admin unavailable, data loss, permission bypass, production DB risk, payment/email/security critical |
| **P1** | Core function broken, postal-code query error, BBS post/reply failure, admin save failure, country page key module error, severe SEO error |
| **P2** | UI misalignment, copy error, mobile experience issue, minor function anomaly |
| **P3** | Minor copy, spacing, non-critical visual detail |

### Tolerance

- **P0 = 0** (mandatory)
- **P1 = 0** (mandatory)
- **P2 ≤ 5** (acceptable, must not affect core function)
- **P3 = recorded, does not block**

---

## 10. How to Handle P0 / P1

P0 and P1 are **hard blockers**. The user CANNOT exempt P0 or P1.

### When a P0 is found

1. **Immediately stop** all high-risk tests.
2. Output the P0 bug report only — do not continue to subsequent phases.
3. Record: URL, steps, actual result, expected result, screenshot, console/network errors.
4. Set verdict to `STAGING_AUDIT_BLOCKED`.
5. Notify the user: **P0 found, production release blocked until fixed and re-audited.**

### When a P1 is found

1. **Stop** the current phase if the P1 prevents further meaningful testing.
2. Record full evidence for the P1.
3. If P1 count ≤ 3 but > 0: verdict is `STAGING_AUDIT_BLOCKED` (P1 must be 0 to pass).
4. Notify the user: **P1 found, must be fixed and re-audited before release.**

### Re-audit after fix

- After P0/P1 is fixed, re-run the full audit (or at minimum the affected phase + regression).
- The re-audit must produce its own evidence and report.
- Only a new `STAGING_AUDIT_READY_NO_P0P1` verdict unblocks the release.

### User exemption scope

- ✅ User **can** exempt P2 and P3 (record exemption in `verdict.json` `exemptions` array with reason).
- ❌ User **cannot** exempt P0 or P1. These are forever-blocking until fixed.

---

## 11. How to Hand Results to User

After the audit completes, deliver the following to the user:

1. **Verdict** — state the exact verdict string (`STAGING_AUDIT_READY_NO_P0P1`, `STAGING_AUDIT_FOUND_ISSUES`, `STAGING_AUDIT_BLOCKED`, or `FAILED`).
2. **Summary counts** — P0/P1/P2/P3 counts, core page pass rate, staging writable pass rate, production smoke pass/fail.
3. **Report path** — `tools/jueshi-audit/reports/<run-id>/audit-summary.md` (and offer to send the file).
4. **Evidence path** — `tools/jueshi-audit/evidence/<run-id>/` so the user can verify any finding.
5. **Bug list** — if any bugs found, point to `bug-list.md` and highlight any P0/P1.
6. **Next action** — explicitly state what the user needs to decide or confirm:
   - If `STAGING_AUDIT_READY_NO_P0P1`: "Ready for OPS production release. Confirm to proceed?"
   - If `STAGING_AUDIT_FOUND_ISSUES`: "P2/P3 found. You may exempt them or request fixes. P0/P1 cannot be exempted."
   - If `STAGING_AUDIT_BLOCKED`: "P0/P1 found. Production release blocked. Fix and re-audit required."
   - If `FAILED`: "Audit could not complete. Investigate and re-run."
7. **Account cleanup reminder** — remind the user whether test accounts still exist on staging and whether cleanup is pending (see section 12).

### Format

Present results in the Hermes final report format, including `CURRENT_MODE`, `TARGET_ENV`, and the audit verdict. Do **not** write `PASSED` — use the exact verdict strings above.

---

## 12. How to Clean Up Test Data

**Default: NO auto-cleanup.** The audit does not delete test data or test accounts unless explicitly instructed.

### What test data is created

- Staging test accounts: `audit-tester@jueshi.net`, `audit-admin@jueshi.net` (created via SQL INSERT on staging DB, if not already present).
- Staging test content: BBS posts, replies, badge uploads, content drafts created during writable tests.

### Cleanup options

| Option | When to use | Command |
|--------|-------------|---------|
| **No cleanup (default)** | Audit will be re-run soon, or user wants to inspect test data | Do nothing. `AUDIT_AUTO_CLEANUP=false` |
| **Account cleanup only** | Audit complete, user confirms | Run cleanup SQL on **staging DB only** (see below) |
| **Full cleanup** | Audit complete, user wants staging reset | Account cleanup + request staging data refresh from production snapshot |

### Account cleanup SQL (staging DB ONLY)

```sql
-- ⚠️ Execute on STAGING DB (xixiong_staging) ONLY. NEVER on production.
DELETE FROM users WHERE email IN (
  'audit-tester@jueshi.net',
  'audit-admin@jueshi.net'
);

-- Verify deletion
SELECT email, role FROM users WHERE email LIKE 'audit-%';
-- Expected: 0 rows

-- Verify role=member still 0
SELECT COUNT(*) FROM users WHERE role = 'member';
-- Expected: 0

-- Verify 9833416@qq.com unaffected
SELECT email, role FROM users WHERE email = '9833416@qq.com';
-- Expected: admin
```

### Cleanup execution requirements

- `CURRENT_MODE` must be `OPS` (or `DEV` if user permits staging-only cleanup).
- `TARGET_ENV` must be `staging`.
- User must explicitly confirm before cleanup.
- **Never** run cleanup SQL on production.
- **Never** delete or modify `9833416@qq.com`.

### After cleanup, verify

| Check | Expected |
|-------|----------|
| `audit-tester@jueshi.net` does not exist | ✅ |
| `audit-admin@jueshi.net` does not exist | ✅ |
| `role=member` count still 0 | ✅ |
| `9833416@qq.com` still admin | ✅ |
| No residual sessions for audit accounts | ✅ |

---

## 13. Related Documents

- `docs/JUESHI_AUDIT_TO_RELEASE_GATE.md` — release gate flow for each verdict
- `docs/HERMES_ALWAYS_READ.md` — mandatory read-first rules
- `docs/STAGING_FIRST_POLICY.md` — staging-first enforcement
- `docs/QA/AUDIT_AGENT_BRIEF.md` — audit agent brief
- `docs/QA/QA_EXIT_CRITERIA.md` — exit criteria
- `docs/QA/BUG_REPORT_TEMPLATE.md` — bug report template
- `docs/QA/PRODUCTION_TEST_ACCOUNT_LIMITS.md` — test account limits and cleanup

---

## 14. Forbidden Actions (Audit Tool)

| # | Forbidden |
|---|-----------|
| 1 | `prisma db push` |
| 2 | Destructive SQL (DROP / DELETE / TRUNCATE) on production |
| 3 | Modify production DB |
| 4 | Modify / delete / reset `9833416@qq.com` |
| 5 | Reset `9833416@qq.com` password |
| 6 | Restart PM2 |
| 7 | Reload / restart Nginx |
| 8 | Modify `.env` |
| 9 | Switch DNS |
| 10 | Output secrets (DATABASE_URL, password, token, key) |
| 11 | Expand Beta |
| 12 | Public promotion |
| 13 | Use staging pass as substitute for production verification |
| 14 | Treat curl result as human test pass |
| 15 | Run without evidence and claim pass |
