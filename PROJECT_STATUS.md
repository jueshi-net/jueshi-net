# Project Status — jueshi.net / xixiong-saas

| Field | Value |
|---|---|
| **Version** | v1.20.42.6.7 (Dashboard Acceptance Lock) |
| **State** | **HYBRID_RESTORED_VERIFIED** |
| **Last Audit** | 2026-06-08 (Dashboard acceptance passed, 7 pages + mobile screenshot verified) |
| **Dashboard State** | **HYBRID_RESTORED_VERIFIED** |

## Version History

| Version | State | Notes |
|---|---|---|
| v1.20.42.6.7 | HYBRID_RESTORED_VERIFIED | Dashboard Acceptance Lock — 7 pages + mobile verified, screenshots archived, status locked |
| v1.20.42.6.6 | COMPLETED | Hybrid Dashboard Restoration from 0528 snapshot — 7 workspace modules rebuilt |
| v1.20.42.6.5 | COMPLETED | Source recovery: found 0528 snapshot + v1.20.39 tarball |
| v1.20.42.6.4 | PARTIAL | React crash fixed, but Dashboard still hand-crafted reconstruction |
| v1.20.42.6.3 | FAILED | Dashboard was reconstructed manually, not restored from original source |
| v1.20.42.6.2 | FAILED | Hidden missing modules instead of restoring them |

## Server Access

| Field | Value |
|---|---|
| **Host** | deploy@192.129.155.149 (racknerd-bb8b78e) |
| **Old Host** | 142.171.184.179 (DEAD/TIMEOUT - DO NOT USE) |
| **App Directory** | /home/deploy/xixiong-saas |
| **Build Status** | ✅ npm run build succeeds |
| **Migration Status** | **VERIFIED & APPLIED** |
| **Backup** | `/home/deploy/backups/jueshi-before-v1.20.41.2-20260607-0422.dump` (138M) |

## v1.20.41 Feature Status

| Feature | Status | Notes |
|---|---|---|
| Homepage Config DB | ✅ Production Verified | `homepage_configs` populated, API reads/writes confirmed |
| Event Tracking | ✅ Production Verified | `event_logs` has 88+ records, ingestion working |
| Analytics API | ✅ Fixed & Verified | BigInt serialization + column naming fixed |
| ToolMetricDaily | ✅ PARTIAL_WITH_DATA | 1 row (test data), upsert chain verified. Real traffic expected. |
| Ad Campaigns | ⚠️ Table exists, 0 rows | No active campaigns yet |

## Protected Modules (L1)
Auth System, Draft System, Company Profiles, 7 Doc Tools, Middleware, Prisma Schema, Deploy Scripts.

## Future Roadmap (Locked)

| Version | Goal | Status | Notes |
|---|---|---|---|
| **v1.20.41.3** | Server Identity & Migration Baseline | ✅ DONE | Server confirmed 192.129.155.149, baseline stubs documented. |
| **v1.20.42** | Tool Center & Tool Metrics | ⏳ Pending | Dynamic /tools, ToolMetricDaily upsert, real data heat. |
| **v1.20.43** | Document Tool Engine | ⏸️ Planned | Abstract shared logic from 7 doc tools. |
| **v1.20.44** | Logistics & Shipping Tools | ⏸️ Planned | New high-frequency tools (Packing List, Volume Weight, etc). |
| **Future** | Export Document Set Generator | 🆕 PLANNED | 外贸全流程单证套打：一次录入，自动生成整套单据。详见 FEATURE_REGISTRY.md |
| **v1.20.45+** | Project Brain (AI Project Mgmt) | 🆕 PLANNED | Productize current audit/governance workflow for Vibe Coding users. |
