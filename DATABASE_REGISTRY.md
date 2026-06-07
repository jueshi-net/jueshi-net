# Database Registry — jueshi.net / xixiong-saas

> **Audit Date**: 2026-06-07
> **ORM**: Prisma
> **Total Models**: 60+
>
> **Status Legend**: `✅ Prod` = Table exists on production | `❌ Missing` = Schema defined, table NOT on prod | `🔒 Protected` = Protected module

---

## Core Models

| Model | Status | Module | Notes |
|---|---|---|---|
| `User` | ✅ Prod | Auth | 🔒 Protected. Core user accounts. |
| `Session` | ✅ Prod | Auth | 🔒 Protected. Session tokens. |
| `Account` | ✅ Prod | Auth | 🔒 Protected. OAuth/social accounts. |

## New in v1.20.41 (✅ Migrated v1.20.41.2)

| Model | Schema | Prod | Module | Notes |
|---|---|---|---|---|
| `HomepageConfig` | ✅ Yes | ✅ Prod | Homepage | ✅ 6 rows populated. PUT/GET verified. Prisma `@map("created_at")` applied to match DB. |
| `Tool` | ✅ Yes | ✅ Prod | Tools | ✅ 7 core tools seeded. Used by `PopularToolsDynamic` and `/tools`. |
| `ToolMetricDaily` | ✅ Yes | ✅ Prod | Analytics | ✅ Upsert chain verified via `/api/events`. 1 row test data. |
| `ToolFavorite` | ✅ Yes | ✅ Prod | User | 0 rows. Schema supports userId, toolKey, toolId. |
| `ToolReview` | ✅ Yes | ✅ Prod | User | 7 rows. Schema supports rating, status, content. |

## Other Models

| Model | Status | Module | Notes |
|---|---|---|---|
| `AdCampaign` | ✅ Prod | Ads | Campaign data. 0 active campaigns. |
| `AdDispatch` | ✅ Prod | Ads | Dispatch records. |
| `EventLog` | ✅ Prod | Analytics | ✅ 88+ records. Analytics API fixed (BigInt/column naming). |

## Draft System (Protected)

| Model | Status | Module | Notes |
|---|---|---|---|
| `ToolDocumentDraft` | ✅ Prod | Draft System | 🔒 Protected. User document drafts. |
| `DocumentReview` | ✅ Prod | Draft System | 🔒 Protected. Review records. |
| `DocumentStatus` | ✅ Prod | Draft System | 🔒 Protected. Status enum/tracking. |

## Company Profiles (Protected)

| Model | Status | Module | Notes |
|---|---|---|---|
| `UserCompanyProfile` | ✅ Prod | Company Profile | 🔒 Protected. Company data per user. |
| `CompanyVerification` | ✅ Prod | Company Profile | 🔒 Protected. Verification records. |

## Tool Ecosystem (Protected)

| Model | Status | Module | Notes |
|---|---|---|---|
| `ToolDefinition` | ✅ Prod | Tools | 🔒 Protected. Tool metadata & config. |
| `ToolExecution` | ✅ Prod | Tools | 🔒 Protected. Execution history. |
| `ToolTemplate` | ✅ Prod | Tools | 🔒 Protected. Document templates (7 tools). |

## Other Models

| Model | Status | Module | Notes |
|---|---|---|---|
| `AdCampaign` | ✅ Prod | Ads | Campaign data. |
| `AdDispatch` | ✅ Prod | Ads | Dispatch records. |
| `ForumPost` | ✅ Prod | Forum | BBS posts. |
| `ForumThread` | ✅ Prod | Forum | BBS threads. |
| `EventLog` | ✅ Prod | Analytics | Raw event log (analytics pipeline TBD). |

## Migration Status

| Migration | Applied to Prod? | Tables Affected |
|---|---|---|
| v1.20.41 | ✅ Yes (v1.20.41.2) | `HomepageConfig`, `ToolMetricDaily` |
| Historical (1-17) | ⚠️ Baseline Stubs | `SELECT 1;` placeholders. See `docs/PRISMA_MIGRATION_RECOVERY.md`. |

> ⚠️ **Migration Baseline Risk**: 17 historical migrations were recovered as `SELECT 1;` stubs. Fresh DB bootstrap requires `docs/current-production-schema-baseline.sql` restore.

---

> **Action Required**: Run `prisma migrate deploy` on VPS (deploy@192.129.155.149) to apply v1.20.41 migration before any feature relying on `HomepageConfig` or `ToolMetricDaily` is used in production.
