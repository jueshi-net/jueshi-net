# UI 模板架构路由地图

生成时间: 2026-07-14
基线提交: fc236e5

## 路由统计概览

- **总路由数**: 213
- **业务区域分布**:
  - PUBLIC: 132 个路由
  - WORKSPACE: 24 个路由
  - ADMIN: 57 个路由

- **模板类型分布**:
  - PUBLIC_CATEGORY: 14 个路由
  - PUBLIC_LANDING: 42 个路由
  - WORKSPACE: 4 个路由
  - ADMIN: 27 个路由
  - REDIRECT: 57 个路由
  - PLACEHOLDER: 43 个路由
  - SPECIAL_EXCEPTION: 26 个路由

## 目标模板架构

### 1. JueshiV4PublicShell (已建立)
- 负责: 公共 Header, Footer, Mobile Bottom Nav, safe area
- 适用范围: 所有 PUBLIC 页面

### 2. PublicCategoryPageFrame (待建立)
- 负责: 分类标题区, 分类导航/筛选, 主列表/卡片区域
- 适用范围: PUBLIC_CATEGORY 类型页面

### 3. PublicLandingPageFrame (待建立)
- 负责: 面包屑, 标题/说明/操作区, 主内容, CTA
- 变体: content, tool, form
- 适用范围: PUBLIC_LANDING 类型页面

### 4. WorkspacePageFrame (已完成)
- 状态: 16/16 路由已完成迁移
- 适用范围: WORKSPACE 类型页面

### 5. AdminPageFrame (待建立)
- 负责: 后台页面标题, 操作区, 筛选工具栏, 主内容区
- 变体: table, form, detail
- 适用范围: ADMIN 类型页面

## 详细路由清单


### ADMIN - ADMIN (27 个路由)

| 路由 | 文件 | 行数 | 状态 |
|------|------|------|------|
| /(admin)/admin/ad-creatives | page.tsx | 12 | 待迁移 |
| /(admin)/admin/ad-entitlements | page.tsx | 12 | 待迁移 |
| /(admin)/admin/ad-placements | page.tsx | 12 | 待迁移 |
| /(admin)/admin/analytics | page.tsx | 175 | 待迁移 |
| /(admin)/admin/analytics/dashboard | page.tsx | 724 | 待迁移 |
| /(admin)/admin/analytics/task-chains | page.tsx | 453 | 待迁移 |
| /(admin)/admin/backup | page.tsx | 82 | 待迁移 |
| /(admin)/admin/beta | page.tsx | 323 | 待迁移 |
| /(admin)/admin/content | page.tsx | 160 | 待迁移 |
| /(admin)/admin/content/checklists | page.tsx | 26 | 待迁移 |
| /(admin)/admin/content/checklists/[id]/edit | page.tsx | 24 | 待迁移 |
| /(admin)/admin/content/guides | page.tsx | 26 | 待迁移 |
| /(admin)/admin/content/guides/[id]/edit | page.tsx | 24 | 待迁移 |
| /(admin)/admin/content/topics/[id]/edit | page.tsx | 30 | 待迁移 |
| /(admin)/admin/feedback | page.tsx | 154 | 待迁移 |
| /(admin)/admin/forum | page.tsx | 98 | 待迁移 |
| /(admin)/admin/growth-logs | page.tsx | 68 | 待迁移 |
| /(admin)/admin/health | page.tsx | 119 | 待迁移 |
| /(admin)/admin/import | page.tsx | 188 | 待迁移 |
| /(admin)/admin/import-bookmarks | page.tsx | 309 | 待迁移 |
| /(admin)/admin/invites/rewards/grants | page.tsx | 277 | 待迁移 |
| /(admin)/admin/landing-pages | page.tsx | 12 | 待迁移 |
| /(admin)/admin/levels | page.tsx | 16 | 待迁移 |
| /(admin)/admin/link-health | page.tsx | 136 | 待迁移 |
| /(admin)/admin/tool-reviews | page.tsx | 197 | 待迁移 |
| /(admin)/admin/topics | page.tsx | 23 | 待迁移 |
| /(admin)/admin/topics/[id]/edit | page.tsx | 23 | 待迁移 |

### ADMIN - PLACEHOLDER (19 个路由)

| 路由 | 文件 | 行数 | 状态 |
|------|------|------|------|
| /(admin)/admin/ads | page.tsx | 767 | 已完成/跳过 |
| /(admin)/admin/audit | page.tsx | 152 | 已完成/跳过 |
| /(admin)/admin/categories | page.tsx | 191 | 已完成/跳过 |
| /(admin)/admin/cms | page.tsx | 459 | 已完成/跳过 |
| /(admin)/admin/content/checklists/new | page.tsx | 267 | 已完成/跳过 |
| /(admin)/admin/content/guides/new | page.tsx | 220 | 已完成/跳过 |
| /(admin)/admin/destinations | page.tsx | 192 | 已完成/跳过 |
| /(admin)/admin/destinations/[slug]/edit | page.tsx | 646 | 已完成/跳过 |
| /(admin)/admin/invites | page.tsx | 383 | 已完成/跳过 |
| /(admin)/admin/invites/rewards | page.tsx | 453 | 已完成/跳过 |
| /(admin)/admin/links | page.tsx | 526 | 已完成/跳过 |
| /(admin)/admin/newsletter | page.tsx | 187 | 已完成/跳过 |
| /(admin)/admin/resources | page.tsx | 825 | 已完成/跳过 |
| /(admin)/admin/resources/import | page.tsx | 398 | 已完成/跳过 |
| /(admin)/admin/settings | page.tsx | 310 | 已完成/跳过 |
| /(admin)/admin/short-links | page.tsx | 166 | 已完成/跳过 |
| /(admin)/admin/tags | page.tsx | 128 | 已完成/跳过 |
| /(admin)/admin/users | page.tsx | 462 | 已完成/跳过 |
| /(admin)/admin/webhooks | page.tsx | 244 | 已完成/跳过 |

### ADMIN - REDIRECT (11 个路由)

| 路由 | 文件 | 行数 | 状态 |
|------|------|------|------|
| /(admin)/admin/community | page.tsx | 76 | 已完成/跳过 |
| /(admin)/admin/community/badges | page.tsx | 37 | 已完成/跳过 |
| /(admin)/admin/community/comments | page.tsx | 40 | 已完成/跳过 |
| /(admin)/admin/community/flagged | page.tsx | 35 | 已完成/跳过 |
| /(admin)/admin/community/posts | page.tsx | 64 | 已完成/跳过 |
| /(admin)/admin/community/reputation | page.tsx | 50 | 已完成/跳过 |
| /(admin)/admin/community/users | page.tsx | 6 | 已完成/跳过 |
| /(admin)/admin/community/users/[id] | page.tsx | 67 | 已完成/跳过 |
| /(admin)/admin/notifications | page.tsx | 51 | 已完成/跳过 |
| /(admin)/admin/rewards/items | page.tsx | 46 | 已完成/跳过 |
| /(admin)/admin/rewards/redemptions | page.tsx | 13 | 已完成/跳过 |

### PUBLIC - PLACEHOLDER (24 个路由)

| 路由 | 文件 | 行数 | 状态 |
|------|------|------|------|
| /ai-learning | page.tsx | 262 | 已完成/跳过 |
| /ai-tools | page.tsx | 121 | 已完成/跳过 |
| /bbs | page.tsx | 525 | 已完成/跳过 |
| /bbs/[slug]/edit | page.tsx | 226 | 已完成/跳过 |
| /bbs/category/[key] | page.tsx | 294 | 已完成/跳过 |
| /business | page.tsx | 232 | 已完成/跳过 |
| /design-system | page.tsx | 323 | 已完成/跳过 |
| /packages/[id] | page.tsx | 324 | 已完成/跳过 |
| /resources/site/[id] | page.tsx | 500 | 已完成/跳过 |
| /search | page.tsx | 347 | 已完成/跳过 |
| /tools/address-formatter | page.tsx | 788 | 已完成/跳过 |
| /tools/container | page.tsx | 822 | 已完成/跳过 |
| /tools/customs-generator | page.tsx | 525 | 已完成/跳过 |
| /tools/documents/[type] | page.tsx | 1728 | 已完成/跳过 |
| /tools/exchange-rate | page.tsx | 1590 | 已完成/跳过 |
| /tools/hs-code | page.tsx | 1051 | 已完成/跳过 |
| /tools/inbound | page.tsx | 124 | 已完成/跳过 |
| /tools/inbound-receipt | page.tsx | 270 | 已完成/跳过 |
| /tools/memo | page.tsx | 710 | 已完成/跳过 |
| /tools/qrcode | page.tsx | 160 | 已完成/跳过 |
| /tools/receipt | page.tsx | 195 | 已完成/跳过 |
| /tools/shipping-calculator | page.tsx | 1301 | 已完成/跳过 |
| /topics | page.tsx | 204 | 已完成/跳过 |
| /tracking | page.tsx | 669 | 已完成/跳过 |

### PUBLIC - PUBLIC_CATEGORY (14 个路由)

| 路由 | 文件 | 行数 | 状态 |
|------|------|------|------|
| /checklists | page.tsx | 203 | 待迁移 |
| /checklists/[slug] | page.tsx | 600 | 待迁移 |
| /checklists/[slug] | page.tsx.orig | 470 | 待迁移 |
| /cities/[city] | page.tsx | 262 | 待迁移 |
| /destinations | page.tsx | 224 | 待迁移 |
| /destinations/[slug] | page.tsx | 658 | 待迁移 |
| /resources-v2/scenarios/company | page.tsx | 191 | 待迁移 |
| /resources-v2/scenarios/invoice | page.tsx | 180 | 待迁移 |
| /resources-v2/scenarios/life | page.tsx | 193 | 待迁移 |
| /resources-v2/scenarios/official | page.tsx | 166 | 待迁移 |
| /resources-v2/scenarios/payment | page.tsx | 193 | 待迁移 |
| /resources-v2/scenarios/shipping | page.tsx | 184 | 待迁移 |
| /resources/[slug] | page.tsx | 380 | 待迁移 |
| /topics/[slug] | page.tsx | 964 | 待迁移 |

### PUBLIC - PUBLIC_LANDING (42 个路由)

| 路由 | 文件 | 行数 | 状态 |
|------|------|------|------|
| / | page.tsx.backup.v3 | 54 | 待迁移 |
| / | page.tsx | 13 | 待迁移 |
| /feedback | page.tsx | 24 | 待迁移 |
| /guides/[slug] | page.tsx | 605 | 待迁移 |
| /guides/address-format | page.tsx | 329 | 待迁移 |
| /guides/battery-shipping-notice | page.tsx | 138 | 待迁移 |
| /guides/cbm-calculation | page.tsx | 311 | 待迁移 |
| /guides/commercial-invoice | page.tsx | 340 | 待迁移 |
| /guides/cross-border-shipping-checklist | page.tsx | 346 | 待迁移 |
| /guides/export-documents-checklist | page.tsx | 362 | 待迁移 |
| /guides/hs-code-basics | page.tsx | 289 | 待迁移 |
| /guides/international-shipping-documents | page.tsx | 289 | 待迁移 |
| /guides/msds-un38-3-basics | page.tsx | 168 | 待迁移 |
| /guides/packing-list | page.tsx | 393 | 待迁移 |
| /guides/shipping-from-china-to-canada | page.tsx | 306 | 待迁移 |
| /guides/shipping-from-china-to-germany | page.tsx | 115 | 待迁移 |
| /guides/shipping-from-china-to-usa | page.tsx | 338 | 待迁移 |
| /guides/shipping-quote-template | page.tsx | 206 | 待迁移 |
| /help | page.tsx | 140 | 待迁移 |
| /lp/[slug] | page.tsx | 435 | 待迁移 |
| /pricing | page.tsx | 24 | 待迁移 |
| /privacy | page.tsx | 100 | 待迁移 |
| /scenario/[role] | page.tsx | 113 | 待迁移 |
| /starter | page.tsx | 205 | 待迁移 |
| /starter/[slug] | page.tsx | 19 | 待迁移 |
| /starter/apps | page.tsx | 324 | 待迁移 |
| /starter/student | page.tsx | 201 | 待迁移 |
| /terms | page.tsx | 78 | 待迁移 |
| /tools/debit-note | page.tsx | 25 | 待迁移 |
| /tools/document-runtime-demo | page.tsx | 236 | 待迁移 |
| /tools/documents | page.tsx | 337 | 待迁移 |
| /tools/documents/quotation | page.tsx | 30 | 待迁移 |
| /tools/documents/settings/role-switcher | page.tsx | 127 | 待迁移 |
| /tools/documents/shipping-label | page.tsx | 124 | 待迁移 |
| /tools/handover-note | page.tsx | 25 | 待迁移 |
| /tools/invoice | page.tsx | 34 | 待迁移 |
| /tools/postal-code | page.tsx | 34 | 待迁移 |
| /tools/sensitive-goods | page.tsx | 289 | 待迁移 |
| /tools/shipping-label | page.tsx | 13 | 待迁移 |
| /tools/template-studio/[id]/edit | page.tsx | 13 | 待迁移 |
| /tools/template-studio/canvas/[id]/edit | page.tsx | 21 | 待迁移 |
| /tools/video-script-sop | page.tsx | 14 | 待迁移 |

### PUBLIC - REDIRECT (26 个路由)

| 路由 | 文件 | 行数 | 状态 |
|------|------|------|------|
| /bbs/new | page.tsx | 171 | 已完成/跳过 |
| /blog | page.tsx | 2 | 已完成/跳过 |
| /blog/[slug] | page.tsx | 7 | 已完成/跳过 |
| /community | page.tsx | 8 | 已完成/跳过 |
| /community/[slug] | page.tsx | 13 | 已完成/跳过 |
| /community/c/[slug] | page.tsx | 13 | 已完成/跳过 |
| /community/new | page.tsx | 8 | 已完成/跳过 |
| /community/t/[slug] | page.tsx | 13 | 已完成/跳过 |
| /countries | page.tsx | 6 | 已完成/跳过 |
| /countries/[country] | page.tsx | 22 | 已完成/跳过 |
| /favorites | page.tsx | 3 | 已完成/跳过 |
| /logistics | page.tsx | 6 | 已完成/跳过 |
| /profile | page.tsx | 179 | 已完成/跳过 |
| /tools/calculator | page.tsx | 6 | 已完成/跳过 |
| /tools/commercial-invoice | page.tsx | 7 | 已完成/跳过 |
| /tools/document-tools | page.tsx | 6 | 已完成/跳过 |
| /tools/documents/drafts | page.tsx | 6 | 已完成/跳过 |
| /tools/quote | page.tsx | 11 | 已完成/跳过 |
| /tools/quote-sheet | page.tsx | 12 | 已完成/跳过 |
| /tools/shipping-estimator | page.tsx | 6 | 已完成/跳过 |
| /tools/shipping-mark | page.tsx | 6 | 已完成/跳过 |
| /tools/template-studio | page.tsx | 8 | 已完成/跳过 |
| /tools/template-studio/canvas/new | page.tsx | 9 | 已完成/跳过 |
| /tools/template-studio/new | page.tsx | 8 | 已完成/跳过 |
| /tools/zip | page.tsx | 6 | 已完成/跳过 |
| /workspace/community | page.tsx | 135 | 已完成/跳过 |

### PUBLIC - SPECIAL_EXCEPTION (26 个路由)

| 路由 | 文件 | 行数 | 状态 |
|------|------|------|------|
| /ai-tools/document-summary | page.tsx | 19 | 待迁移 |
| /ai-tools/product-copy | page.tsx | 19 | 待迁移 |
| /ai-tools/translate-polish | page.tsx | 19 | 待迁移 |
| /analytics | page.tsx | 371 | 待迁移 |
| /api-docs | page.tsx | 216 | 待迁移 |
| /bbs/[slug] | page.tsx | 529 | 待迁移 |
| /changelog | page.tsx | 132 | 待迁移 |
| /community-preview-v2 | page.tsx | 710 | 待迁移 |
| /community-preview-v3 | page.tsx | 185 | 待迁移 |
| /export | page.tsx | 219 | 待迁移 |
| /guides | page.tsx | 258 | 待迁移 |
| /nav | page.tsx | 231 | 待迁移 |
| /payment/success | page.tsx | 111 | 待迁移 |
| /rankings | page.tsx | 147 | 待迁移 |
| /resources | page.tsx | 83 | 待迁移 |
| /resources-v2 | page.tsx | 86 | 待迁移 |
| /shipping | page.tsx | 137 | 待迁移 |
| /tools | page.tsx | 241 | 待迁移 |
| /u/[id] | page.tsx | 114 | 待迁移 |
| /ui-lab/jueshi-v4 | page.tsx | 16 | 待迁移 |
| /ui-lab/jueshi-v4-home-candidate | page.tsx | 16 | 待迁移 |
| /ui-lab/jueshi-v4-home-candidate-v2 | page.tsx | 16 | 待迁移 |
| /ui-lab/jueshi-v4-home-candidate-v3 | page.tsx | 11 | 待迁移 |
| /ui-lab/jueshi-v4-home-candidate-v4 | page.tsx | 11 | 待迁移 |
| /ui-lab/jueshi-v4-topnav | page.tsx | 16 | 待迁移 |
| /ui-lab/jueshi-v4-topnav-polished | page.tsx | 16 | 待迁移 |

### WORKSPACE - REDIRECT (20 个路由)

| 路由 | 文件 | 行数 | 状态 |
|------|------|------|------|
| /dashboard | page.tsx | 3 | 已完成/跳过 |
| /dashboard/documents | page.tsx | 3 | 已完成/跳过 |
| /dashboard/notifications | page.tsx | 41 | 已完成/跳过 |
| /dashboard/tasks | page.tsx | 3 | 已完成/跳过 |
| /workbench | page.tsx | 7 | 已完成/跳过 |
| /workspace | page.tsx | 446 | 已完成/跳过 |
| /workspace/ad-entitlements | page.tsx | 217 | 已完成/跳过 |
| /workspace/company-profiles | page.tsx | 53 | 已完成/跳过 |
| /workspace/documents | page.tsx | 62 | 已完成/跳过 |
| /workspace/favorites | page.tsx | 43 | 已完成/跳过 |
| /workspace/invites | page.tsx | 50 | 已完成/跳过 |
| /workspace/member | page.tsx | 77 | 已完成/跳过 |
| /workspace/memos | page.tsx | 48 | 已完成/跳过 |
| /workspace/notifications | page.tsx | 58 | 已完成/跳过 |
| /workspace/products | page.tsx | 35 | 已完成/跳过 |
| /workspace/settings | page.tsx | 24 | 已完成/跳过 |
| /workspace/task-chains | page.tsx | 52 | 已完成/跳过 |
| /workspace/task-chains/shipping/[id] | page.tsx | 56 | 已完成/跳过 |
| /workspace/task-chains/shipping/new | page.tsx | 24 | 已完成/跳过 |
| /workspace/tasks | page.tsx | 58 | 已完成/跳过 |

### WORKSPACE - WORKSPACE (4 个路由)

| 路由 | 文件 | 行数 | 状态 |
|------|------|------|------|
| /dashboard/points | page.tsx | 20 | 已完成/跳过 |
| /dashboard/stats | page.tsx | 152 | 已完成/跳过 |
| /my-links | page.tsx | 16 | 已完成/跳过 |
| /workspace/templates | page.tsx | 238 | 已完成/跳过 |
