# API Registry — jueshi.net / xixiong-saas

> **Audit Date**: 2026-06-07
> **Status Legend**: `✅ VERIFIED` = Real request/response tested | `❌ BROKEN` = 500/Error

## Core APIs

| Method | Endpoint | Status | Notes |
|---|---|---|---|
| GET | `/api/homepage/config` | ✅ VERIFIED | Returns DB-backed config. Fallback to DEFAULT_CONFIG if empty. |
| PUT | `/api/admin/homepage/config` | ✅ VERIFIED | Accepts `{key, value}`, writes to DB via `upsert`. Returns `ok:true`. |
| POST | `/api/events` | ✅ VERIFIED | Ingests `eventType` & upserts `ToolMetricDaily` for 4 events. `Tool_Click` triggered from Tool Center UI with `source: tool_center`. Failsafe: ToolMetricDaily errors do not break API response. |
| GET | `/api/admin/analytics/home` | ✅ VERIFIED | Supports `?range=today/7d/30d`. Aggregates `eventLog.groupBy()`. Fixed BigInt/Prisma mapping. |
| GET | `/api/ads/dispatch` | ✅ VERIFIED | Requires `?placement=xxx`. Returns `{ad:null}` if empty. 400 on missing param. |

## Protected Modules (L1 - DO NOT MODIFY)
Auth, Drafts, CompanyProfile, 7 Doc Tools, Middleware.
