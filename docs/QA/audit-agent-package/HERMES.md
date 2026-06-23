# Hermes Execution Entry — jueshi.net / xixiong-saas

> **READ FIRST: `docs/HERMES_ALWAYS_READ.md`** — this is the mandatory entry point for ALL Hermes tasks.
> If you have not read it, STOP and read it now.

---

## Hermes Identity

Hermes is the AI agent operating this project. Hermes can work in three modes. Every task MUST declare which mode.

---

## READ_FIRST Standard Block

Every Hermes task MUST begin by reading:

1. `docs/HERMES_ALWAYS_READ.md`
2. `docs/HERMES_ROLE_POLICY.md`
3. `docs/STAGING_FIRST_POLICY.md`

---

## CURRENT_MODE — Mandatory

Every task MUST declare `CURRENT_MODE` at the start. No exceptions.

### Mode Quick Reference

| Mode | Target | Can deploy? | Can write DB? | Can switch DNS? | Needs user approval? |
|------|--------|-------------|---------------|-----------------|---------------------|
| **DEV** | staging (192.129.155.149 / i.jueshi.net) | staging only | staging DB only | no | no |
| **OPS** | production (104.250.109.99 / jueshi.net) | production only | production DB | yes (with confirmation) | **yes** |
| **AUDIT** | any (read-only) | **no** | **no** | **no** | no |

### If CURRENT_MODE is missing → DEFAULT TO AUDIT

- Read-only only
- No deploy
- No DB write
- No DNS change
- No file deletion
- Ask user to confirm mode before doing anything beyond read-only

---

## Minimal Task Template

```
READ_FIRST:
  - docs/HERMES_ALWAYS_READ.md
  - docs/HERMES_ROLE_POLICY.md
  - docs/STAGING_FIRST_POLICY.md

CURRENT_MODE=DEV|OPS|AUDIT
TARGET_ENV=staging|production|N/A
TARGET_SERVER=192.129.155.149|104.250.109.99
TARGET_DOMAIN=i.jueshi.net|jueshi.net
```

---

## Permanent Bans (ALL modes)

- ❌ `prisma db push`
- ❌ Destructive SQL (DROP / DELETE / TRUNCATE production data)
- ❌ Output secrets (DATABASE_URL, password, token, cookie, session, SSH key, API key)
- ❌ Modify / delete / reset 9833416@qq.com
- ❌ Publish to production without staging acceptance
- ❌ Switch DNS without explicit user confirmation
- ❌ Claim user is satisfied

---

## Environment Topology

```
Production:
  Server: 104.250.109.99
  Domain: https://jueshi.net
  Branch: main
  PM2: xixiong-saas (port 3000)
  Path: /home/deploy/xixiong-saas

Staging:
  Server: 192.129.155.149
  Domain: https://i.jueshi.net
  Branch: staging
  PM2: xixiong-staging (port 3001)
  Path: /home/deploy/xixiong-saas-staging
```

---

## Final Report Requirements

Every Hermes final report MUST include:

- `CURRENT_MODE`
- `TARGET_ENV`
- Whether `docs/HERMES_ALWAYS_READ.md` was read
- Whether production was affected (must be no unless OPS)
- Whether `prisma db push` was executed (must be no)
- Whether destructive SQL was executed (must be no)
- Whether secrets were output (must be no)
- Whether 9833416@qq.com was modified (must be no)
- Final verdict — one of: `READY_FOR_STAGING_USE`, `READY_FOR_USER_VISUAL_REVIEW`, `READY_FOR_OBSERVATION`, `WAITING_FOR_DNS_CHANGE`, `BLOCKED_NEEDS_USER_DECISION`, `FAILED`
- **MUST NOT write `PASSED`**

---

## Conflict Resolution

If `HERMES.md` or `AGENTS.md` conflicts with `docs/HERMES_ALWAYS_READ.md`, the **stricter** rule in `docs/HERMES_ALWAYS_READ.md` wins.
