# Hermes Always-Read Execution Policy for jueshi.net / xixiong-saas

> **THIS FILE IS THE FIRST THING HERMES MUST READ BEFORE EXECUTING ANY TASK.**
> If you have not read this file, you may not proceed.
> Version: v1.20.42.18.6.6.5.1
> Date: 2026-06-23

---

## 0. MUST READ FIRST

Every Hermes task must begin by reading these files in order:

1. **This file** — `docs/HERMES_ALWAYS_READ.md`
2. `docs/HERMES_ROLE_POLICY.md`
3. `docs/STAGING_FIRST_POLICY.md`

If any of these files are missing, Hermes must stop and report the missing file before proceeding.

---

## 1. CURRENT_MODE — Mandatory Declaration

Every task MUST declare `CURRENT_MODE` at the very beginning. `CURRENT_MODE` can only be:

- **DEV** — development, UI, content drafts, staging deployment
- **OPS** — production deployment, backup, rollback, SSL/Nginx/PM2 maintenance
- **AUDIT** — read-only inspection, status checks, planning, risk assessment

### Default Mode

If `CURRENT_MODE` is not declared:
- Hermes MUST default to **AUDIT** mode (read-only).
- Hermes MUST NOT execute any high-risk operations.
- Hermes MUST ask the user to confirm the mode before doing anything beyond read-only.

### Mode Selection Rules

| Task involves | Required mode |
|---|---|
| Development, pages, UI, content drafts, bug fixes | **DEV** |
| Production deploy, backup, rollback, Nginx, PM2, SSL, DNS, production DB | **OPS** (requires explicit user confirmation) |
| Uncertain environment | **AUDIT** first, then ask user |

---

## 2. DEV MODE Rules

### Purpose
- New feature development
- UI adjustments / page redesign
- Bug fixes
- Backend / admin feature development
- Content draft generation (articles, topics, checklists, FAQs)
- Staging deployment
- Staging smoke test
- User preview acceptance

### Allowed
| Item | Value |
|---|---|
| Server | 192.129.155.149 |
| Domain | i.jueshi.net |
| Branch | feature/* or staging |
| App path | /home/deploy/xixiong-saas-staging |
| PM2 | xixiong-staging |
| DB | xixiong_staging |
| Env file | .env.staging |
| Deploy target | staging only |
| Output | staging deployment + release request report |

### Forbidden
- ❌ Must NOT operate 104.250.109.99 (production server)
- ❌ Must NOT operate jueshi.net
- ❌ Must NOT touch production DB
- ❌ Must NOT modify production .env
- ❌ Must NOT restart production PM2
- ❌ Must NOT execute production migration
- ❌ Must NOT switch DNS
- ❌ Must NOT publish unaccepted content to production
- ❌ Must NOT auto-sync staging data back to production
- ❌ Must NOT claim production deployment is complete

---

## 3. OPS MODE Rules

### Purpose
- Production backup
- Production deployment
- Production smoke test
- Production `prisma migrate deploy`
- Nginx / SSL / PM2 maintenance
- DNS switch guidance or verification
- Rollback
- Log observation
- Old server hot-standby / decommission planning
- Release report generation

### Allowed
| Item | Value |
|---|---|
| Server | 104.250.109.99 |
| Domain | jueshi.net |
| Branch | main |
| App path | /home/deploy/xixiong-saas |
| PM2 | xixiong-saas (production) |
| DB | production DB |
| Env file | production env |
| Condition | ONLY after explicit user confirmation |

### Forbidden
- ❌ Must NOT develop new features
- ❌ Must NOT do UI redesign
- ❌ Must NOT add new business modules
- ❌ Must NOT deploy unaccepted staging code to production
- ❌ Must NOT deploy without backup
- ❌ Must NOT deploy without smoke test
- ❌ Must NOT deploy without rollback plan
- ❌ Must NOT bypass staging-first
- ❌ Must NOT use `prisma db push`

---

## 4. AUDIT MODE Rules

### Purpose
- Read-only inspection
- Status viewing
- Suggestion generation
- Plan generation
- Risk assessment
- Awaiting user confirmation

### Forbidden
- ❌ Must NOT deploy
- ❌ Must NOT restart services
- ❌ Must NOT modify DB
- ❌ Must NOT modify .env
- ❌ Must NOT switch DNS
- ❌ Must NOT delete files
- ❌ Must NOT run destructive commands

---

## 5. Permanent Production Protection Rules

These rules apply to ALL modes. They can NEVER be overridden.

### Forever Forbidden
- ❌ `prisma db push`
- ❌ Destructive SQL (DROP / DELETE / TRUNCATE on production data)
- ❌ Delete production DB
- ❌ Delete production uploads
- ❌ Delete old server hot-standby data
- ❌ Output secrets (DATABASE_URL, SSH private key, password, token, cookie, session, API key)
- ❌ Modify, delete, reset, or repurpose 9833416@qq.com
- ❌ Reset 9833416@qq.com password
- ❌ Switch DNS without explicit user confirmation
- ❌ Publish to production without staging acceptance
- ❌ Claim user is satisfied
- ❌ Expand Beta
- ❌ Public promotion

---

## 6. Staging-First Flow

All new features MUST follow this flow:

```
feature/*
  → staging branch
  → i.jueshi.net (staging deployment)
  → user acceptance
  → main branch
  → jueshi.net (production deployment)
  → production smoke test
  → observation
```

**Anything not accepted on i.jueshi.net MUST NOT enter jueshi.net.**

### Exceptions
- P0 hotfix: still requires quick staging verification + backup + smoke test
- Pure data operations via admin backend (no code changes): no staging required, but must have publish record

---

## 7. Database Rules

- Production DB is ONLY for jueshi.net.
- Staging DB is ONLY for i.jueshi.net.
- Staging DB can be restored from production snapshot.
- Sync direction is ALWAYS production → staging (never staging → production).
- Staging data MUST NOT auto-flow back to production.
- Migrations MUST be validated on staging first.
- Production migration ONLY allows `prisma migrate deploy` (never `prisma db push`).
- Before production migration: MUST backup.
- After migration: MUST verify these counts:
  - users
  - admins
  - role=member (must be 0)
  - 9833416@qq.com role (must be admin)
  - ForumPost
  - ForumComment
  - Badge
  - UserBadgeAward

---

## 8. Content Publishing Rules

- Hermes can help clean, optimize, and generate drafts for articles, topics, checklists, FAQs.
- Content drafts go to staging first.
- User confirmation required before publishing to production.
- Content publishing should prioritize backend/CMS data — avoid code changes for content.
- Unconfirmed content MUST NOT go live.
- Even low-risk content must have a publish record.
- SEO title, description, canonical, and index status must be checked before publishing.

---

## 9. Script & Environment Marker Rules

### Environment Markers

All scripts MUST read the environment marker:
- `/etc/jueshi-environment` (preferred)
- `/home/deploy/.jueshi-environment` (fallback)

### Script Guardrails

| Script | Rule |
|---|---|
| `deploy-staging.sh` | MUST only run on staging server |
| `deploy-production-safe.sh` | MUST only run on production server + requires manual confirmation |
| `smoke-test.sh` | MUST support `--base-url https://i.jueshi.net` and `--base-url https://jueshi.net` |
| `backup-prod.sh` | MUST only backup production, MUST NOT run on staging |
| `rollback-production.sh` | MUST require manual confirmation |

If environment marker does not match expected environment: script MUST `exit 1`.

---

## 10. Required Elements in Every Final Report

Every final report MUST include:

- `CURRENT_MODE`
- `TARGET_ENV`
- `TARGET_SERVER`
- `TARGET_DOMAIN`
- Whether `docs/HERMES_ALWAYS_READ.md` was read
- Whether `docs/HERMES_ROLE_POLICY.md` was read
- Whether `docs/STAGING_FIRST_POLICY.md` was read
- Whether production was affected
- Whether production DB was operated on
- Whether `prisma db push` was executed (MUST be no)
- Whether destructive SQL was executed (MUST be no)
- Whether secrets were output (MUST be no)
- Whether 9833416@qq.com was modified (MUST be no)
- Whether user confirmation is needed for next step
- Final verdict — can ONLY be one of:
  - `READY_FOR_USER_VISUAL_REVIEW`
  - `READY_FOR_STAGING_USE`
  - `READY_FOR_OBSERVATION`
  - `WAITING_FOR_DNS_CHANGE`
  - `BLOCKED_NEEDS_USER_DECISION`
  - `FAILED`
  - **MUST NOT write `PASSED`**

---

## 11. Environment Topology Reference

```
Production:
  Server: 104.250.109.99
  Domain: https://jueshi.net
  Branch: main
  PM2: xixiong-saas (port 3000)
  DB: production DB
  Path: /home/deploy/xixiong-saas
  Env: .env.production
  SSH: ssh -i ~/.ssh/jueshi-prod-v2 deploy@104.250.109.99

Staging/Dev:
  Server: 192.129.155.149
  Domain: https://i.jueshi.net
  Branch: staging
  PM2: xixiong-staging (port 3001)
  DB: xixiong_staging
  Path: /home/deploy/xixiong-saas-staging
  Env: .env.staging
  SSH: ssh deploy@192.129.155.149

Hot Standby (do not touch):
  Path: /home/deploy/xixiong-saas
  PM2: xixiong-saas (port 3000, hot standby)
  DB: production DB snapshot
```

---

## 12. Related Documents

- `docs/HERMES_ROLE_POLICY.md` — DEV / OPS mode definitions
- `docs/STAGING_FIRST_POLICY.md` — staging-first enforcement
- `docs/BRANCHING_POLICY.md` — main / staging / feature / hotfix
- `docs/CONTENT_PUBLISHING_WORKFLOW.md` — content publish flow
- `docs/HERMES_TASK_TEMPLATES.md` — task templates with READ_FIRST
- `docs/HERMES_ADVISORY_RULES.md` — advisory rules
