# Safe Deployment Runbook — JueShi.net / xixiong-saas

**Last updated:** 2026-06-21 (v1.20.42.18.5.0)
**VPS:** `deploy@192.129.155.149`
**Project dir:** `/home/deploy/xixiong-saas`

---

## 1. Critical Rules (NEVER violate)

| Rule | Enforcement |
|------|-------------|
| Never `prisma db push` | Use `prisma migrate deploy` only |
| Never overwrite `.env.production` | rsync-exclude.txt blocks `.env*` |
| Never sync `node_modules` | rsync-exclude.txt blocks it |
| Never sync `.next/` | rsync-exclude.txt blocks it; VPS rebuilds |
| Never use trailing-slash rsync for `prisma/` | Use `./` as source, not `prisma/` |
| Never restart PM2 if build failed | deploy-production.sh exits on build failure |
| Never update deploy-version.json before build passes | deploy-safe.sh updates it post-build |
| Never delete `backups/` or `uploads/` | rsync-exclude.txt blocks them |
| Never use root/admin/chq SSH | Always `deploy@192.129.155.149` |

## 2. Pre-deployment Checklist

Run `bash scripts/predeploy-check.sh` locally. It verifies:

- ✅ Project root has `package.json`, `src/`, `prisma/schema.prisma`, `prisma/migrations/`
- ✅ `scripts/check-build-env.mjs` exists (build script dependency)
- ✅ No stale root-level `app/`, `components/`, `lib/`, `hooks/`, `migrations/`, `schema.prisma`
- ✅ `.env` files are in rsync-exclude (won't be synced)
- ✅ Git working tree status (warn if dirty)
- ✅ Local build passes (warning if fails — VPS build is authoritative)
- ✅ Unit tests pass (failure = abort)

## 3. Deployment Steps

### Standard deployment (no new migration)

```bash
# 1. Ensure git is clean and pushed
git status --short  # should be empty or only reports/screenshots
git push origin main

# 2. Run safe deployment
VERSION=v1.20.42.18.x DEPLOY_COMMIT=$(git rev-parse --short HEAD) \
  bash scripts/deploy-safe.sh
```

`deploy-safe.sh` does:
1. Runs `predeploy-check.sh`
2. Runs `deploy-production.sh` (rsync + VPS build + PM2 restart)
3. Gets BUILD_ID from VPS `.next/BUILD_ID`
4. Updates `public/deploy-version.json` on VPS
5. Verifies PM2 online
6. Verifies production deploy-version via curl
7. Verifies key pages (200) and admin API (401)
8. Checks PM2 error log

### Deployment with new migration

```bash
# 1. Create migration locally
npx prisma migrate dev --name your_migration_name

# 2. Audit migration SQL — MUST be non-destructive
cat prisma/migrations/<timestamp>_your_migration_name/migration.sql
# ✅ ALLOWED: CREATE TABLE, CREATE INDEX, ALTER TABLE ADD COLUMN
# ❌ FORBIDDEN: DROP TABLE, DROP COLUMN, DELETE, TRUNCATE

# 3. Commit and push
git add prisma/
git commit -m "feat: add migration for X"
git push origin main

# 4. Run predeploy check
bash scripts/predeploy-check.sh

# 5. Rsync code to VPS (via deploy-safe.sh or deploy-production.sh)
# 6. On VPS, run migrate deploy (NOT db push!)
ssh deploy@192.129.155.149 'cd /home/deploy/xixiong-saas && \
  set -a && source .env.production && set +a && \
  npx prisma migrate deploy'

# 7. Verify migration status
ssh deploy@192.129.155.149 'cd /home/deploy/xixiong-saas && \
  set -a && source .env.production && set +a && \
  npx prisma migrate status'

# 8. Continue with build + PM2 restart via deploy-safe.sh
```

## 4. rsync Exclude List

File: `deploy/rsync-exclude.txt`

Key exclusions:
- `.env*` (except `.env.example`) — **NEVER sync secrets**
- `node_modules/` — VPS keeps its own
- `.next/` — VPS rebuilds
- `.git/` — not needed on VPS
- `test-results/`, `screenshots/`, `playwright-report/` — QA artifacts
- `backups/` — production backups
- `*.test.*`, `*.spec.*` — test files not needed in production

## 5. Post-deployment Verification

After `deploy-safe.sh` completes, manually verify:

```bash
# 1. deploy-version matches
curl -s https://jueshi.net/deploy-version.json

# 2. Key pages
curl -s -o /dev/null -w "%{http_code}" https://jueshi.net/
curl -s -o /dev/null -w "%{http_code}" https://jueshi.net/countries/canada
curl -s -o /dev/null -w "%{http_code}" https://jueshi.net/api/admin/guides  # should be 401

# 3. PM2 status + logs
ssh deploy@192.129.155.149 'pm2 status xixiong-saas'
ssh deploy@192.129.155.149 'pm2 logs xixiong-saas --lines 50 --nostream'

# 4. Database safety
ssh deploy@192.129.155.149 'cd /home/deploy/xixiong-saas && \
  set -a && source .env.production && set +a && \
  psql "$DATABASE_URL" -t -c "SELECT email, role FROM users WHERE email='\''9833416@qq.com'\'';"'
# Must show: 9833416@qq.com | admin
```

## 6. Rollback Procedure

If deployment fails or causes issues:

```bash
# 1. Do NOT panic-delete anything
# 2. Check if PM2 is running the old build (it may still be)
ssh deploy@192.129.155.149 'pm2 status xixiong-saas'

# 3. If new build is broken, rebuild from last known good commit:
#    - Identify last good commit from deploy-version.json history
#    - git checkout <good_commit>
#    - rsync + build + restart

# 4. If migration caused issues, do NOT rollback migration without backup
#    - Restore from pre-migration backup
#    - Contact user before any database rollback
```

## 7. Common Pitfalls

| Pitfall | Prevention |
|---------|------------|
| rsync `prisma/` trailing slash scatters files | Use `./` as rsync source, not individual dirs |
| Build fails locally (no DB tunnel) | VPS build is authoritative; local build is advisory |
| PM2 restarted with broken build | deploy-production.sh exits before PM2 restart |
| deploy-version.json shows wrong BUILD_ID | deploy-safe.sh reads BUILD_ID from VPS after build |
| .env.production overwritten | rsync-exclude.txt blocks `.env*` |
| Old app/ dir coexists with src/ | predeploy-check.sh verifies no stale dirs |

## 8. File Inventory

| File | Purpose |
|------|---------|
| `scripts/predeploy-check.sh` | Local pre-deployment safety checks |
| `scripts/deploy-safe.sh` | End-to-end safe deployment wrapper |
| `scripts/deploy-production.sh` | Core rsync + build + PM2 restart script |
| `deploy/rsync-exclude.txt` | rsync exclusion list |
| `ecosystem.config.js` | PM2 process configuration |
| `scripts/pm2-start.sh` | PM2 wrapper that sources .env.production |
| `scripts/check-build-env.mjs` | Build environment guardrail |
| `docs/deployment-safe-runbook.md` | This document |
