# Workspace 全量路由盘点

Generated: 2026-07-13T19:00+08:00
Base: 81ce169

## 路由总表

| # | ROUTE | PAGE_FAMILY | MIGRATION_STATUS | RISK | WAVE |
|---|-------|-------------|-----------------|------|------|
| 1 | /workspace | DASHBOARD | ✅ MIGRATED | - | - |
| 2 | /workspace/notifications | NOTIFICATIONS | ✅ MIGRATED | - | - |
| 3 | /workspace/documents | DOCUMENTS | ✅ MIGRATED | - | - |
| 4 | /workspace/favorites | FAVORITES | ✅ MIGRATED | - | - |
| 5 | /workspace/memos | LIST | ✅ MIGRATED | - | - |
| 6 | /workspace/tasks | LIST | ✅ MIGRATED | - | - |
| 7 | /workspace/member | PROFILE | ✅ MIGRATED | - | - |
| 8 | /workspace/company-profiles | LIST | ❌ NOT_MIGRATED | LOW | WAVE_02 |
| 9 | /workspace/task-chains | LIST | ❌ NOT_MIGRATED | LOW | WAVE_02 |
| 10 | /workspace/ad-entitlements | LIST | ❌ NOT_MIGRATED | LOW | WAVE_02 |
| 11 | /workspace/settings | SETTINGS | ❌ NOT_MIGRATED | LOW | WAVE_02 |
| 12 | /workspace/invites | LIST | ❌ NOT_MIGRATED | MEDIUM | WAVE_03 |
| 13 | /workspace/templates | LIST | ❌ NOT_MIGRATED | MEDIUM | WAVE_03 |
| 14 | /workspace/products | LIST | ❌ NOT_MIGRATED | HIGH | WAVE_04+ |
| 15 | /workspace/task-chains/shipping/[id] | DETAIL | ❌ NOT_MIGRATED | MEDIUM | WAVE_04+ |
| 16 | /workspace/task-chains/shipping/new | FORM | ❌ NOT_MIGRATED | MEDIUM | WAVE_04+ |
| 17 | /dashboard/* | REDIRECT | ⏭️ REDIRECT | - | SKIP |
| 18 | /workbench | REDIRECT | ⏭️ REDIRECT | - | SKIP |
| 19 | /my-links | PLACEHOLDER | ⏭️ PLACEHOLDER | - | SKIP |
| 20 | /dashboard/points | OTHER | ⏭️ LEGACY | - | SKIP |
| 21 | /dashboard/stats | OTHER | ⏭️ LEGACY | - | SKIP |
| 22 | /dashboard/notifications | OTHER | ⏭️ LEGACY | - | SKIP |

## 详细路由记录

### 已迁移 (7)

#### /workspace
- PAGE_FILE=src/app/(workspace)/workspace/page.tsx
- USES_WORKSPACE_PAGE_FRAME=true
- USES_RIGHT_RAIL=true
- PAGE_FAMILY=DASHBOARD
- MIGRATION_STATUS=MIGRATED

#### /workspace/notifications
- PAGE_FILE=src/app/(workspace)/workspace/notifications/page.tsx
- USES_WORKSPACE_PAGE_FRAME=true
- USES_RIGHT_RAIL=true
- PAGE_FAMILY=NOTIFICATIONS
- MIGRATION_STATUS=MIGRATED
- DUPLICATE_BLOCK_RISK=HIGH (RightRail "通知提醒" 与页面主体重复)

#### /workspace/documents
- PAGE_FILE=src/app/(workspace)/workspace/documents/page.tsx
- USES_WORKSPACE_PAGE_FRAME=true
- USES_RIGHT_RAIL=true
- PAGE_FAMILY=DOCUMENTS
- MIGRATION_STATUS=MIGRATED

#### /workspace/favorites
- PAGE_FILE=src/app/(workspace)/workspace/favorites/page.tsx
- USES_WORKSPACE_PAGE_FRAME=true
- USES_RIGHT_RAIL=true
- PAGE_FAMILY=FAVORITES
- MIGRATION_STATUS=MIGRATED

#### /workspace/memos
- PAGE_FILE=src/app/(workspace)/workspace/memos/page.tsx
- CLIENT_FILE=memos-client.tsx
- USES_WORKSPACE_PAGE_FRAME=true
- USES_RIGHT_RAIL=true
- PAGE_FAMILY=LIST
- MIGRATION_STATUS=MIGRATED
- DUPLICATE_BLOCK_RISK=HIGH (RightRail "最近备忘录" 与页面主体重复)

#### /workspace/tasks
- PAGE_FILE=src/app/(workspace)/workspace/tasks/page.tsx
- CLIENT_FILE=tasks-client.tsx
- USES_WORKSPACE_PAGE_FRAME=true
- USES_RIGHT_RAIL=true
- PAGE_FAMILY=LIST
- MIGRATION_STATUS=MIGRATED

#### /workspace/member
- PAGE_FILE=src/app/(workspace)/workspace/member/page.tsx
- CLIENT_FILE=member-client.tsx
- USES_WORKSPACE_PAGE_FRAME=true
- USES_RIGHT_RAIL=true
- PAGE_FAMILY=PROFILE
- MIGRATION_STATUS=MIGRATED
- DUPLICATE_BLOCK_RISK=MEDIUM (RightRail "成长路径" 与页面主体部分重复)

### 未迁移 — WAVE_02 候选 (4)

#### /workspace/company-profiles
- PAGE_FILE=src/app/(workspace)/workspace/company-profiles/page.tsx
- CLIENT_FILE=company-profiles-client.tsx
- PAGE_FAMILY=LIST
- USES_WORKSPACE_PAGE_FRAME=false
- USES_RIGHT_RAIL=false
- IS_REDIRECT=false
- IS_PLACEHOLDER=false
- HAS_FORM=true (创建/编辑公司资料)
- HAS_API_WRITE=true
- HAS_DELETE_ACTION=false
- HAS_PAYMENT_ACTION=false
- HAS_AUTH_CHANGE=false
- RISK=LOW
- RECOMMENDED_WAVE=WAVE_02
- NOTES=thin server wrapper (24 lines), 仅传递 props 给 client

#### /workspace/task-chains
- PAGE_FILE=src/app/(workspace)/workspace/task-chains/page.tsx
- CLIENT_FILE=task-chains-client.tsx
- PAGE_FAMILY=LIST
- USES_WORKSPACE_PAGE_FRAME=false
- USES_RIGHT_RAIL=false
- IS_REDIRECT=false
- IS_PLACEHOLDER=false
- HAS_FORM=false (list only, sub-pages handle forms)
- HAS_API_WRITE=false (read-only list)
- HAS_DELETE_ACTION=false
- HAS_PAYMENT_ACTION=false
- HAS_AUTH_CHANGE=false
- RISK=LOW
- RECOMMENDED_WAVE=WAVE_02
- NOTES=thin server wrapper (18 lines), 纯列表

#### /workspace/ad-entitlements
- PAGE_FILE=src/app/(workspace)/workspace/ad-entitlements/page.tsx
- PAGE_FAMILY=LIST
- USES_WORKSPACE_PAGE_FRAME=false
- USES_RIGHT_RAIL=false
- IS_REDIRECT=false
- IS_PLACEHOLDER=false
- HAS_FORM=false (只读列表 + 申请状态)
- HAS_API_WRITE=false
- HAS_DELETE_ACTION=false
- HAS_PAYMENT_ACTION=false
- HAS_AUTH_CHANGE=false
- RISK=LOW
- RECOMMENDED_WAVE=WAVE_02
- NOTES=server component (197 lines), 使用 SectionCard/MetricCard, 只读展示

#### /workspace/settings
- PAGE_FILE=src/app/(workspace)/workspace/settings/page.tsx
- CLIENT_FILE=settings-client.tsx
- PAGE_FAMILY=SETTINGS
- USES_WORKSPACE_PAGE_FRAME=false
- USES_RIGHT_RAIL=false
- IS_REDIRECT=false
- IS_PLACEHOLDER=false
- HAS_FORM=true
- HAS_API_WRITE=true
- HAS_DELETE_ACTION=false
- HAS_PAYMENT_ACTION=false
- HAS_AUTH_CHANGE=true (密码修改在 client 中)
- RISK=LOW (迁移本身不改业务逻辑)
- RECOMMENDED_WAVE=WAVE_02
- NOTES=thin server wrapper (18 lines), rightRail=false (表单页不需要标准右栏)

### 未迁移 — WAVE_03 候选 (2)

#### /workspace/invites
- PAGE_FILE=src/app/(workspace)/workspace/invites/page.tsx
- PAGE_FAMILY=LIST
- USES_WORKSPACE_PAGE_FRAME=false
- IS_REDIRECT=false
- HAS_API_WRITE=true (生成邀请码)
- RISK=MEDIUM
- RECOMMENDED_WAVE=WAVE_03
- NOTES='use client (329 lines), 需要拆分为 server+client

#### /workspace/templates
- PAGE_FILE=src/app/(workspace)/workspace/templates/page.tsx
- PAGE_FAMILY=LIST
- USES_WORKSPACE_PAGE_FRAME=false
- IS_REDIRECT=false
- HAS_API_WRITE=true
- HAS_DELETE_ACTION=true
- RISK=MEDIUM
- RECOMMENDED_WAVE=WAVE_03
- NOTES='use client (185 lines), 需要拆分为 server+client

### 未迁移 — WAVE_04+ (高风险/复杂)

#### /workspace/products
- PAGE_FILE=src/app/(workspace)/workspace/products/page.tsx
- PAGE_FAMILY=LIST
- RISK=HIGH
- RECOMMENDED_WAVE=WAVE_04+
- NOTES='use client (737 lines), 完整 CRUD, 复杂表单

#### /workspace/task-chains/shipping/[id]
- PAGE_FAMILY=DETAIL
- RISK=MEDIUM
- RECOMMENDED_WAVE=WAVE_04+
- NOTES=动态路由详情页

#### /workspace/task-chains/shipping/new
- PAGE_FAMILY=FORM
- RISK=MEDIUM
- RECOMMENDED_WAVE=WAVE_04+
- NOTES=表单页

### 跳过 (redirect/placeholder/legacy)

- /dashboard/* → redirect to /workspace/*
- /workbench → redirect to /workspace
- /my-links → placeholder (空壳)
- /dashboard/points → legacy (独立页面)
- /dashboard/stats → legacy (独立页面)
- /dashboard/notifications → legacy (独立页面)
