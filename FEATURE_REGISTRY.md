# Feature Registry — jueshi.net / xixiong-saas

> **Audit Date**: 2026-06-07
> **Version**: v1.20.41
>
> **Status Legend**: `DONE_PROTECTED` = Complete & Protected | `DONE` = Complete | `PARTIAL` = Partially implemented | `STUB` = Scaffold only

---

## DONE_PROTECTED — Production-Ready & Protected

| Feature | Module | Notes |
|---|---|---|
| **Authentication** | Auth | Login, registration, session management. Protected (L3). |
| **Draft System** | ToolDocumentDraft | Document creation, review workflow, status lifecycle. Protected (L3). |
| **Company Profile** | UserCompanyProfile | Company data, associations, verification. Protected (L3). |
| **Doc Tools (×7)** | Tool Ecosystem | Seven protected document-generation tools. Protected (L2). |

## DONE_VERIFIED — Production-Ready & Verified (v1.20.42.3)

| Feature | Module | Verification |
|---|---|---|
| **Dynamic Tool Center** | `/tools` | ✅ VERIFIED — Real clicks, mobile layout (375px+), search/filter/sort, no fake data. |
| **ToolMetrics Write Chain** | `/api/events` & `ToolMetricDaily` | ✅ VERIFIED — UI click triggers `Tool_Click` with `source: tool_center`. |
| **Homepage Config DB** | `/api/homepage/config` & `homepage_configs` | ✅ VERIFIED — 6 rows, PUT write & GET read confirmed via real API |
| **Event Tracking** | `/api/events` & `event_logs` | ✅ VERIFIED — 88+ records, ingestion & analytics aggregation working |
| **Analytics API** | `/api/admin/analytics/home` | ✅ FIXED & VERIFIED — Supports `?range=today/7d/30d`, BigInt/Prisma mapping fixed |
| **Ads Dispatch** | `/api/ads/dispatch` | ✅ VERIFIED — Returns `{ad:null}` when empty, 400 on missing params |

## DASHBOARD — VERIFIED (v1.20.42.6.7)

| Feature | Module | Verification |
|---|---|---|
| **Dashboard Layout & Sidebar** | `layout.tsx`, `UserSidebar.tsx` | ✅ VERIFIED — 7 pages + mobile screenshot accepted. Unified /workspace/* routes. |
| **Dashboard Tasks** | `/workspace/tasks` | ✅ VERIFIED — Growth tasks, checkin, level progress. Screenshot: 02-tasks.png |
| **Dashboard Member** | `/workspace/member` | ✅ VERIFIED — Identity card, quotas, benefits comparison. Screenshot: 03-member.png |
| **Dashboard Documents** | `/workspace/documents` | ✅ VERIFIED — Draft list, search, CRUD. Screenshot: 04-documents.png |
| **Dashboard Company Profiles** | `/workspace/company-profiles` | ✅ VERIFIED — Company CRUD modal, member gate. Screenshot: 05-company-profiles.png |
| **Dashboard Favorites** | `/workspace/favorites` | ✅ VERIFIED — Saved tools filter, card grid. Screenshot: 06-favorites.png |
| **Dashboard Settings** | `/workspace/settings` | ✅ VERIFIED — Profile form, theme selector, logout. Screenshot: 07-settings.png |

## PLANNED — Future Features (Backlog)

| Feature | Module | Priority | Target Version | Status |
|---|---|---|---|---|
| **Document Tool Engine** | `useDocumentToolEngine`, Layouts | P1 | v1.20.43.1 → v1.20.43.3.2 | ✅ PILOT_AUTH_VERIFIED (Handover/Debit Notes Authenticated. Save/Restore/Print OK. Slug Fixed) |
| **Header Auth State** | `header.tsx`, `useSession` | P0 | v1.20.42.5 | ✅ FIXED_VERIFIED (Login state correctly reflects session, user menu added) |
| **Tool IA Cleanup** | Header/Footer Nav, `/tools/documents` positioning | P0 | v1.20.42.5 | ✅ P0_IMPLEMENTED (工具中心 / 单据模板 naming corrected, legacy page positioned as template hub) |
| **Dashboard Layout & Sidebar** | `layout.tsx`, `UserSidebar.tsx` | P0 | v1.20.42.6.7 | ✅ HYBRID_RESTORED_VERIFIED — 7 pages + mobile screenshot accepted. |
| **Legacy Document Tools Data Bridge** | `/api/events` bridge + Tool table upsert | P1 | v1.20.42.6.8.2 | ✅ VERIFIED_AFTER_SAVE_EVENT_FIX — 17 legacy tools upserted (16 + shipping-mark), 4 canonical duplicates skipped. Full event chain verified: Tool_Click (from tool_center), Tool_View (page load), Document_Save (localStorage, saveMode field), Document_Export (png/word, exportType field). ToolMetricDaily populated (views/clicks/saves). |
| **Homepage Document Tools** | `document-tools-section.tsx` | P2 | v1.20.42.6.8.2 | ✅ DYNAMICIZED — reads Tool table category=documents, modern-first order, max 12 displayed, safe fallback on DB failure, CTA → /tools?cat=documents |
|| **Quote Sheet** | `/tools/quote-sheet` | P0 | v1.20.43.4.1 | ⚠️ ENGINE_MIGRATED_PENDING_FIX — 拆分 page.tsx + quote-sheet-client.tsx + quote-sheet-types.ts + quote-sheet-preview.tsx，使用 useDocumentToolEngine。保存 UI / 事件埋点 / draftId 恢复 / 导出均待修复验证 |
|| **Quote Sheet Export PNG** | `/tools/quote-sheet` | P1 | v1.20.43.4.1 | ⚠️ PENDING_VERIFICATION — html2canvas 依赖需确认 |
|| **Quote Sheet Export Word** | `/tools/quote-sheet` | P1 | v1.20.43.4.1 | ⚠️ PENDING_VERIFICATION — Blob .doc 方案存在，未实测 |
|| **Quote Sheet Events** | `/api/events` | P1 | v1.20.43.4.1 | ⚠️ BROKEN — event_logs 中 0 条 quote-sheet 记录，ToolMetricDaily saves=0 |
|| **Homepage Hero Search** | `/ → /tools?q=` | P0 | v1.20.42.6.8.4 | ✅ VERIFIED — Hero search box functional (onChange + onClick + onKeyDown), 5 CN keywords tested, all redirect to /tools?q= with correct results |
| **Export Document Set Generator** | Product Planning | P2 | Future | 🆕 PLANNED (See below) |
| **Project Brain** | AI Project Management | P1 | v1.20.45+ | PLANNED (登记中) |

> **Project Brain / AI 项目推进表**
> 核心目标：帮助用户记录项目规则、功能状态、版本路线图、受保护模块、UI 规范、开发前审计、验收报告和下一步 AI 指令，避免重复造轮子、误删功能、上下文丢失和项目失控。
> MVP 模块：项目总览、硬性规则库、功能登记表、版本路线图、变更申请、AI 上下文包生成器、验收报告归档。
> 禁止在 v1.20.42/43/44 中开发，不干扰当前路线。

## EXPORT DOCUMENT SET GENERATOR — PLANNED

**Core Logic**:
用户创建一个 Shipment Case / 出口订单档案，填写一次基础信息，自动生成整套外贸单据。

**Document Classification Strategy**:

### P0: Online Tools (High Freq, Structural)
Suitable for online generation, save/export/reuse.
- packing-list
- proforma-invoice
- sales-contract
- sales-confirmation
- booking-instruction
- shipping-instruction
- shipping-mark
- delivery-note
- shipping-notice
- bill-of-exchange
- beneficiary-certificate
- insurance-application
- container-loading-list
- freight-statement

### P1: Draft/Aux Tools (Evaluate Later)
Suitable for drafts or auxiliary support.
- customs-declaration-authorization
- inspection-authorization
- export-cargo-booking
- container-preallocation-list
- shipping-entrustment
- freight-confirmation
- weight-certificate-draft
- volume-certificate-draft
- canada-customs-invoice
- hungary-invoice
- lc-amendment-letter
- lc-urge-letter

### P2: Content/Guides (No Gen Tool)
Official/Regulated docs. Suitable for templates, checklists, or SEO content only.
- bill-of-lading
- air-waybill
- insurance-policy
- insurance-certificate
- letter-of-credit
- certificate-of-origin
- gsp-certificate
- plant-quarantine-certificate
- health-certificate
- customs-clearance-form
- export-tax-refund-forms
- vat-invoice
- export-verification-form

**Status**: PLANNED. Do NOT develop yet. Do NOT seed to Tool table. Do NOT modify /tools.

| Status | Count |
|---|---|
| DONE_PROTECTED | 4 (Auth, Drafts, Company Profile, 7 Doc Tools) |
| DONE | 4 (Homepage Config DB, Events, Analytics API, Ads Dispatch) |
| PARTIAL | 1 (ToolMetrics - table exists, aggregation pending) |
