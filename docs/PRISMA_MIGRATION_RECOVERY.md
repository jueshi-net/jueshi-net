# Prisma Migration Recovery & Baseline Report

> **Created**: 2026-06-07
> **Version**: v1.20.41.3
> **Status**: Production Structure Captured

## 1. What Happened
- During v1.20.41.2 deployment, we discovered that `prisma/migrations/` directories existed but were missing `migration.sql` files for 17 historical migrations.
- Running `npx prisma migrate status` resulted in **Error P3015** (Could not find migration file).
- To restore `migrate status` to "up to date", we created baseline stub files (`SELECT 1;`) for the 17 missing historical migrations.
- The last migration (`20260607100000_add_homepage_config_and_tool_metric_daily`) contains a real SQL script.

## 2. Current State
- **Production Database**: Structure is complete and verified via API and direct queries.
- **Prisma Migrations**: `_prisma_migrations` table and local `migrations/` folder are now synchronized (`up to date`).
- **Gap**: The 17 historical `SELECT 1;` stubs are **placeholders only**. They do not contain the DDL to reconstruct the database from scratch.

## 3. Risk Assessment
- **Fresh Bootstrap Risk**: A completely new database CANNOT be built from scratch using only the current `migrations/` folder. The 17 placeholders will not create tables.
- **Disaster Recovery**: In the event of total database loss, restoring from the binary backup (`pg_dump` custom format) or applying the schema baseline is required before running future migrations.
- **Development Environments**: New dev environments should use the schema baseline or clone from a backup, rather than relying on `migrate dev` from empty.

## 4. Current Backups & Baselines
- **Production Backup**: `/home/deploy/backups/jueshi-before-v1.20.41.2-20260607-0422.dump` (138MB, Custom Format).
- **Schema Baseline**: `docs/current-production-schema-baseline.sql` (Generated 2026-06-07, 3365 lines).
  - Command used: `pg_dump "$DATABASE_URL" --schema-only --no-owner --no-privileges`
  - Contains full DDL for all current tables, indexes, and constraints.

## 5. Future Rules
1. **No More Stubs**: Future migrations MUST contain real `migration.sql` content. Never use `SELECT 1;`.
2. **Schema Baseline Updates**: This baseline file should be regenerated periodically or after major schema changes.
3. **Protection**: Migrations are L1 Infrastructure. Changes to `schema.prisma` require `migrate dev` locally to generate real SQL before deploying.
4. **Verification**: Every deployment must run `npx prisma migrate status` and confirm "up to date".
5. **No Manual DDL**: Do not run manual `ALTER TABLE` on production. All changes must go through Prisma migration files.
