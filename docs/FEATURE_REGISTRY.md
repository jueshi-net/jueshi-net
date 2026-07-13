# FEATURE_REGISTRY.md (升级版)

> 业务功能注册表 — 每个 Feature 的完整技术档案  
> 最后更新: 2026-07-09

---

## 使用说明

每个 Feature 包含以下信息：

| 字段 | 说明 |
|------|------|
| **页面** | 前端页面路由 |
| **Layout** | 使用的布局组件 |
| **API** | 后端 API 路由 |
| **Database** | 数据库 Model |
| **Admin** | 后台管理页面 |
| **Components** | 使用的组件 |
| **Design System** | 使用的 DS 组件 |
| **Dependencies** | 外部依赖 |
| **Status** | 当前状态 |
| **Owner** | 负责人 |
| **Priority** | 优先级 |
| **Related Features** | 关联功能 |
| **TODO** | 待办事项 |

---

## 1. Home (首页)

| 字段 | 值 |
|------|-----|
| **页面** | `/` |
| **Layout** | 自带 Shell（跳过 Public Layout） |
| **API** | `/api/homepage`, `/api/homepage/config`, `/api/user/stats`, `/api/checkin` |
| **Database** | `User`, `DailyCheckIn`, `ToolFavorite`, `Resource`, `Article` |
| **Admin** | `/admin/homepage`, `/admin/homepage/config` |
| **Components** | `JueshiV4HomeCandidateV4Shell`, `JueshiV4Header`, `JueshiV4Footer`, `JueshiV4BottomTab`, `JueshiV4AdInventoryGroup` |
| **Design System** | ❌ 未使用 |
| **Dependencies** | NextAuth (session), Prisma (数据查询) |
| **Status** | ✅ Production |
| **Owner** | 开发团队 |
| **Priority** | P0 |
| **Related Features** | Tools, Resources, Community, Checkin |
| **TODO** | 应用 Design System 组件；清理 UI Lab 旧版本 |

---

## 2. Resources (资源目录)

| 字段 | 值 |
|------|-----|
| **页面** | `/resources`, `/resources/[slug]`, `/resources/site/[id]` |
| **Layout** | V4PublicShell（跳过 Public Layout） |
| **API** | `/api/resources`, `/api/resources/[id]`, `/api/resources/featured`, `/api/resources/[id]/check-link` |
| **Database** | `Resource`, `Category`, `Tag` |
| **Admin** | `/admin/resources`, `/admin/resources/import`, `/admin/resources/featured`, `/admin/resources/quality-check` |
| **Components** | `JueshiV4PublicShell`, `ResourceDirectoryClient` |
| **Design System** | ❌ 未使用 |
| **Dependencies** | Prisma, cheerio (链接检查) |
| **Status** | ✅ Production |
| **Owner** | 开发团队 |
| **Priority** | P0 |
| **Related Features** | Home, Tools, Destinations |
| **TODO** | 应用 Design System 组件；清理 resources-v2 废弃路由 |

---

## 3. Workspace (工作区)

| 字段 | 值 |
|------|-----|
| **页面** | `/workspace`, `/workspace/favorites`, `/workspace/memos`, `/workspace/documents`, `/workspace/products`, `/workspace/company-profiles`, `/workspace/task-chains`, `/workspace/templates`, `/workspace/invites`, `/workspace/notifications`, `/workspace/settings`, `/workspace/member`, `/workspace/ad-entitlements` |
| **Layout** | WorkspaceLayout（需登录） |
| **API** | `/api/workspace/*`, `/api/workbench/*`, `/api/me/*` |
| **Database** | `Workspace`, `WorkspaceMember`, `Memo`, `Favorite`, `WorkbenchLink`, `ToolFavorite`, `UserPreference` |
| **Admin** | `/admin/users`, `/admin/workspace` (间接) |
| **Components** | `WorkspaceSidebar`, `WorkspaceTopbar`, `WorkspacePageHeader`, `EmptyState`, `StatusBadge`, `ActionCard` |
| **Design System** | ❌ 未使用 |
| **Dependencies** | NextAuth (认证), Prisma, Stripe (订阅) |
| **Status** | ✅ Production |
| **Owner** | 开发团队 |
| **Priority** | P1 |
| **Related Features** | Dashboard, Tools, Documents |
| **TODO** | 应用 Design System 组件；统一 workspace 路由分组 |

---

## 4. Guides (指南)

| 字段 | 值 |
|------|-----|
| **页面** | `/guides`, `/guides/[slug]`, 15+ 静态指南页面 |
| **Layout** | V4PublicShell（跳过 Public Layout） |
| **API** | `/api/checklists` (共用), `/api/articles`, `/api/articles/[slug]` |
| **Database** | `Article`, `ArticleTag`, `Category` |
| **Admin** | `/admin/content/guides`, `/admin/content/guides/new`, `/admin/content/guides/[id]/edit` |
| **Components** | `JueshiV4PublicShell`, `ArticleLayoutClient` |
| **Design System** | ❌ 未使用 |
| **Dependencies** | Prisma, gray-matter (Markdown) |
| **Status** | 🟡 Staging（待用户验收） |
| **Owner** | 开发团队 |
| **Priority** | P0 |
| **Related Features** | Checklists, Topics, Resources |
| **TODO** | 用户验收；应用 Design System 组件 |

---

## 5. Checklists (清单)

| 字段 | 值 |
|------|-----|
| **页面** | `/checklists`, `/checklists/[slug]` |
| **Layout** | V4PublicShell（跳过 Public Layout） |
| **API** | `/api/checklists` |
| **Database** | `Article` (共用) |
| **Admin** | `/admin/content/checklists`, `/admin/content/checklists/new`, `/admin/content/checklists/[id]/edit` |
| **Components** | `JueshiV4PublicShell` |
| **Design System** | ❌ 未使用 |
| **Dependencies** | Prisma |
| **Status** | 🟡 Staging（待用户验收） |
| **Owner** | 开发团队 |
| **Priority** | P0 |
| **Related Features** | Guides, Tools |
| **TODO** | 用户验收；应用 Design System 组件 |

---

## 6. Tools (工具中心)

| 字段 | 值 |
|------|-----|
| **页面** | `/tools`, `/tools/[tool-name]` (20+ 工具), `/tools/documents/*`, `/tools/template-studio/*` |
| **Layout** | V4PublicShell（跳过 Public Layout） |
| **API** | `/api/tools/*`, `/api/calculations`, `/api/exchange-rate`, `/api/postal-codes`, `/api/hs-codes`, `/api/template-studio/*` |
| **Database** | `ToolReview`, `ToolFavorite`, `PostalCode`, `HSCode`, `AIUsageLog` |
| **Admin** | `/admin/tool-reviews` |
| **Components** | `JueshiV4PublicShell`, `ToolGrid`, `ToolFilterBar`, `ToolCard`, `ToolEmptyState`, `ToolReviewPanel` |
| **Design System** | ❌ 未使用 |
| **Dependencies** | Prisma, axios (外部 API), cheerio (数据抓取) |
| **Status** | ✅ Production |
| **Owner** | 开发团队 |
| **Priority** | P0 |
| **Related Features** | Resources, Workspace, Documents |
| **TODO** | 应用 Design System 组件；统一工具页面 Shell |

---

## 7. Topics (专题)

| 字段 | 值 |
|------|-----|
| **页面** | `/topics`, `/topics/[slug]` |
| **Layout** | JueshiV4PublicShell（Night 4 统一） |
| **API** | `/api/topics` |
| **Database** | `Topic` |
| **Admin** | `/admin/content/topics`, `/admin/content/topics/[id]/edit`, `/admin/topics` |
| **Components** | JueshiV4PublicShell, TopicCard |
| **Design System** | ❌ 未使用 |
| **Dependencies** | Prisma |
| **Status** | ✅ Production（V4 Shell 已统一） |
| **Owner** | 开发团队 |
| **Priority** | P0 |
| **Related Features** | Guides, Resources, Community |
| **TODO** | ✅ V4 Shell 已统一（Night 4 完成） |

---

## 8. Search (搜索)

| 字段 | 值 |
|------|-----|
| **页面** | `/search` |
| **Layout** | JueshiV4PublicShell（Night 4 统一） |
| **API** | `/api/search` |
| **Database** | 全文搜索（跨多个 Model） |
| **Admin** | 无 |
| **Components** | JueshiV4PublicShell, SearchBar, SearchResults |
| **Design System** | ❌ 未使用 |
| **Dependencies** | Prisma (全文搜索) |
| **Status** | ✅ Production（V4 Shell 已统一） |
| **Owner** | 开发团队 |
| **Priority** | P0 |
| **Related Features** | Tools, Resources, Guides |
| **TODO** | ✅ V4 Shell 已统一（Night 4 完成） |

---

## 9. Community (社区)

| 字段 | 值 |
|------|-----|
| **页面** | `/community`, `/community/[slug]`, `/community/new`, `/community/c/[slug]`, `/community/t/[slug]`, `/bbs/*` |
| **Layout** | PublicLayoutClient（旧 Header/Footer） |
| **API** | `/api/forum/*`, `/api/community/*` |
| **Database** | `ForumPost`, `ForumComment`, `Badge`, `UserBadge` |
| **Admin** | `/admin/community/*`, `/admin/forum/*` |
| **Components** | `PostCard`, `PostContent`, `CommentSection`, `CategoryBadge`, `BbsComposer` |
| **Design System** | ❌ 未使用 |
| **Dependencies** | NextAuth (认证), Prisma |
| **Status** | ✅ Production |
| **Owner** | 开发团队 |
| **Priority** | P1 |
| **Related Features** | Home, Topics |
| **TODO** | V4 Shell 统一；清理 community-preview-v2/v3 废弃页面 |

---

## 10. Destinations (目的地)

| 字段 | 值 |
|------|-----|
| **页面** | `/destinations`, `/destinations/[slug]`, `/countries`, `/countries/[country]`, `/cities/[city]` |
| **Layout** | V4PublicShell（跳过 Public Layout） |
| **API** | `/api/admin/destinations`, `/api/admin/destinations/generate` |
| **Database** | `Resource` (部分), 静态数据 |
| **Admin** | `/admin/destinations`, `/admin/destinations/[slug]/edit` |
| **Components** | `JueshiV4PublicShell`, `DestinationHeroClient`, `CountriesIndexClient`, `CountryHeroIntelligence` |
| **Design System** | ❌ 未使用 |
| **Dependencies** | Prisma |
| **Status** | ✅ Production |
| **Owner** | 开发团队 |
| **Priority** | P1 |
| **Related Features** | Resources, Guides, Tools |
| **TODO** | 应用 Design System 组件 |

---

## 统计摘要

| 指标 | 数值 |
|------|------|
| 总 Feature 数 | 10（核心） |
| 使用 V4 Shell | 5 (Home, Resources, Guides, Checklists, Tools, Destinations) |
| 使用 Public Layout | 4 (Topics, Search, Community, 其他) |
| 使用 Design System | 0 |
| Production 状态 | 8 |
| Staging 状态 | 2 (Guides, Checklists) |
| 待验收 | 2 (Guides, Checklists) |

---

**文档状态**: FEATURE_REGISTRY_UPGRADED  
**生成时间**: 2026-07-09  
**下次更新**: 功能变更时
