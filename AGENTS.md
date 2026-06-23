<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# AGENTS.md — jueshi.net / xixiong-saas Root Agent Entry

> **FIRST PRIORITY: Read `docs/HERMES_ALWAYS_READ.md` before executing any task.**
> If you have not read it, stop and read it now.

**Project:** jueshi.net / xixiong-saas
**Version:** v1.20.42.18.6.6.5.2

---

## Environment Topology

| Role | Server | Domain | Branch | PM2 | DB | Path |
|------|--------|--------|--------|-----|-----|------|
| Production | 104.250.109.99 | jueshi.net | main | xixiong-saas | production DB | /home/deploy/xixiong-saas |
| Staging | 192.129.155.149 | i.jueshi.net | staging | xixiong-staging | xixiong_staging | /home/deploy/xixiong-saas-staging |
| Hot Standby | 192.129.155.149 | — | — | xixiong-saas | production snapshot | /home/deploy/xixiong-saas (do not touch) |

---

## CURRENT_MODE — Mandatory

Every task MUST declare `CURRENT_MODE` at the start. Only three values allowed:

- **DEV** — staging only (192.129.155.149, i.jueshi.net, xixiong-staging, xixiong_staging)
- **OPS** — production only (104.250.109.99, jueshi.net, xixiong-saas, production DB). **Requires explicit user approval.**
- **AUDIT** — read-only. No deploy, no DB write, no DNS change.

**If CURRENT_MODE is not declared → default to AUDIT (read-only only).**

---

## Permanent Production Protection

These rules apply to ALL modes. They can NEVER be overridden.

- ❌ **prisma db push** — forever forbidden
- ❌ **Destructive SQL** (DROP / DELETE / TRUNCATE on production data) — forever forbidden
- ❌ **Unaccepted content to production** — must pass staging-first
- ❌ **Output secrets** (DATABASE_URL, SSH key, password, token, cookie, session, API key) — forever forbidden
- ❌ **Modify / delete / reset / repurpose 9833416@qq.com** — forever protected
- ❌ **Reset 9833416@qq.com password** — forever forbidden
- ❌ **Switch DNS without user confirmation** — forever forbidden
- ❌ **Claim user is satisfied** — forever forbidden
- ❌ **Expand Beta** — forever forbidden
- ❌ **Public promotion** — forever forbidden

---

## Staging-First Flow

```
feature/* → staging branch → i.jueshi.net → user acceptance → main → jueshi.net → smoke test → observation
```

Anything not accepted on i.jueshi.net MUST NOT enter jueshi.net.

---

## Script Environment Guardrails

All deploy/backup/rollback scripts MUST read the environment marker:

- `/etc/jueshi-environment` (preferred)
- `/home/deploy/.jueshi-environment` (fallback)

| Script | Rule |
|--------|------|
| `deploy-staging.sh` | Only on staging server |
| `deploy-production-safe.sh` | Only on production server + manual confirmation |
| `smoke-test.sh` | Supports `--base-url https://i.jueshi.net` and `--base-url https://jueshi.net` |
| `backup-prod.sh` | Only backs up production |
| `rollback-production.sh` | Requires manual confirmation |

If environment marker does not match → `exit 1`.

---

## Related Documents

- `docs/HERMES_ALWAYS_READ.md` — **MUST READ FIRST** (authoritative, strictest rules)
- `docs/HERMES_ROLE_POLICY.md` — DEV / OPS mode definitions
- `docs/STAGING_FIRST_POLICY.md` — staging-first enforcement
- `docs/BRANCHING_POLICY.md` — branch strategy
- `docs/HERMES_TASK_TEMPLATES.md` — task templates
- `docs/CONTENT_PUBLISHING_WORKFLOW.md` — content publish flow

**If AGENTS.md conflicts with docs/HERMES_ALWAYS_READ.md, the stricter rule in HERMES_ALWAYS_READ.md wins.**
