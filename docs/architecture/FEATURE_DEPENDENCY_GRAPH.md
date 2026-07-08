# Feature Dependency Graph

> 功能依赖关系图 — 每个 Feature 的完整技术栈链路  
> 最后更新: 2026-07-09

---

## 图例

```
Pages → Components → API → Database → Permissions → Admin → SEO → Related → Design System
```

---

## 1. Home

```
Pages
  /
    ↓
Components
  JueshiV4HomeCandidateV4Shell
  ├── JueshiV4Header
  ├── JueshiV4Footer
  └── JueshiV4BottomTab
    ↓
API
  /api/user/stats
  /api/checkin
  /api/homepage/config
    ↓
Database
  User
  DailyCheckIn
  PointLedger
  ToolFavorite
  Resource
    ↓
Permissions
  Public (无需登录)
  签到需登录
    ↓
Admin
  /admin/homepage
  /admin/homepage/config
    ↓
SEO
  title: 绝世百宝箱 - 海外华人的实用工具箱
  Open Graph + Twitter Card
  JSON-LD: WebSite
    ↓
Related Features
  Tools, Resources, Community, Topics, Workspace
    ↓
Design System
  ❌ 未使用
```

---

## 2. Workspace

```
Pages
  /workspace
  /workspace/favorites
  /workspace/memos
  /workspace/documents
  /workspace/products
  /workspace/company-profiles
  /workspace/task-chains
  /workspace/templates
  /workspace/invites
  /workspace/notifications
  /workspace/settings
  /workspace/member
    ↓
Components
  WorkspaceLayout
  ├── WorkspaceTopbar
  └── WorkspaceSidebar
  ├── TaskChainList
  ├── EmptyState (workspace/)
  └── DeleteDocButton
    ↓
API
  /api/workspace/*
  /api/workbench/*
  /api/me/*
    ↓
Database
  Workspace
  WorkspaceMember
  Memo
  Favorite
  WorkbenchLink
  ToolFavorite
  UserPreference
  UserSubscription
    ↓
Permissions
  🔒 需登录 (NextAuth JWT)
  用户只能访问自己的数据
    ↓
Admin
  /admin/users (间接)
    ↓
SEO
  noindex (需登录页面)
    ↓
Related Features
  Dashboard, Tools, Documents, Task Chain
    ↓
Design System
  ❌ 未使用
```

---

## 3. Resources

```
Pages
  /resources
  /resources/[slug]
  /resources/site/[id]
    ↓
Components
  JueshiV4PublicShell
  ├── JueshiV4Header
  └── JueshiV4Footer
  ResourceDirectoryClient
    ↓
API
  /api/resources
  /api/resources/[id]
  /api/resources/featured
  /api/resources/[id]/check-link
    ↓
Database
  Resource
  Category
  Tag
    ↓
Permissions
  Public (无需登录)
    ↓
Admin
  /admin/resources
  /admin/resources/import
  /admin/resources/featured
  /admin/resources/quality-check
    ↓
SEO
  generateMetadata per page
  BreadcrumbList
  JSON-LD: ItemList
    ↓
Related Features
  Home, Tools, Destinations
    ↓
Design System
  ❌ 未使用
```

---

## 4. Tools

```
Pages
  /tools
  /tools/shipping-calculator
  /tools/exchange-rate
  /tools/postal-code
  /tools/hs-code
  /tools/commercial-invoice
  /tools/shipping-label
  /tools/template-studio
  /tools/documents/*
  /ai-tools/*
  ... (20+ tools)
    ↓
Components
  JueshiV4PublicShell
  ├── JueshiV4Header
  └── JueshiV4Footer
  ToolGrid (tools/)
  ToolFilterBar
  ToolCard
  ToolEmptyState
  ToolReviewPanel
    ↓
API
  /api/tools/*
  /api/calculations
  /api/exchange-rate
  /api/postal-codes
  /api/hs-codes
  /api/template-studio/*
  /api/ai/generate
    ↓
Database
  ToolReview
  ToolFavorite
  PostalCode
  HSCode
  AIUsageLog
    ↓
Permissions
  Public (无需登录)
  收藏需登录
    ↓
Admin
  /admin/tool-reviews
    ↓
SEO
  generateMetadata per tool
  JSON-LD: SoftwareApplication
    ↓
Related Features
  Workspace, Resources, Task Chain, Documents
    ↓
Design System
  ❌ 未使用
```

---

## 5. Guides

```
Pages
  /guides
  /guides/[slug]
  /guides/hs-code-basics
  /guides/commercial-invoice
  /guides/shipping-from-china-to-usa
  ... (15+ static guides)
    ↓
Components
  JueshiV4PublicShell
  ├── JueshiV4Header
  └── JueshiV4Footer
  ArticleLayoutClient
    ↓
API
  /api/articles
  /api/articles/[slug]
  /api/checklists (共用)
    ↓
Database
  Article
  ArticleTag
  Category
    ↓
Permissions
  Public (无需登录)
    ↓
Admin
  /admin/content/guides
  /admin/content/guides/new
  /admin/content/guides/[id]/edit
    ↓
SEO
  generateMetadata per guide
  BreadcrumbList
  JSON-LD: Article, HowTo
    ↓
Related Features
  Checklists, Topics, Resources, Tools
    ↓
Design System
  ❌ 未使用
```

---

## 6. Checklists

```
Pages
  /checklists
  /checklists/[slug]
    ↓
Components
  JueshiV4PublicShell
  ├── JueshiV4Header
  └── JueshiV4Footer
    ↓
API
  /api/checklists
    ↓
Database
  Article (共用)
    ↓
Permissions
  Public (无需登录)
    ↓
Admin
  /admin/content/checklists
  /admin/content/checklists/new
  /admin/content/checklists/[id]/edit
    ↓
SEO
  generateMetadata per checklist
  BreadcrumbList
  JSON-LD: ItemList
    ↓
Related Features
  Guides, Tools
    ↓
Design System
  ❌ 未使用
```

---

## 7. Topics

```
Pages
  /topics
  /topics/[slug]
    ↓
Components
  PublicLayoutClient (旧 Header/Footer)
  ├── Header (layout/header.tsx)
  └── FooterNew (layout/footer-new.tsx)
    ↓
API
  /api/topics
    ↓
Database
  Topic
    ↓
Permissions
  Public (无需登录)
    ↓
Admin
  /admin/content/topics
  /admin/content/topics/[id]/edit
  /admin/topics
    ↓
SEO
  generateMetadata
  JSON-LD: CollectionPage
    ↓
Related Features
  Guides, Resources, Community
    ↓
Design System
  ❌ 未使用
```

---

## 8. Search

```
Pages
  /search
    ↓
Components
  PublicLayoutClient (旧 Header/Footer)
  ├── Header
  └── FooterNew
    ↓
API
  /api/search
    ↓
Database
  全文搜索 (跨 Model)
  ├── Article
  ├── Resource
  ├── Topic
  └── ToolReview
    ↓
Permissions
  Public (无需登录)
    ↓
Admin
  无
    ↓
SEO
  noindex (搜索结果页)
    ↓
Related Features
  All content features
    ↓
Design System
  ❌ 未使用
```

---

## 9. Community

```
Pages
  /community
  /community/[slug]
  /community/new
  /community/c/[slug]
  /community/t/[slug]
  /bbs/*
  /u/[id]
    ↓
Components
  PublicLayoutClient (旧 Header/Footer)
  ├── Header
  └── FooterNew
  PostCard (bbs/)
  PostContent (bbs/)
  CommentSection (bbs/)
  CategoryBadge (bbs/)
  BbsComposer (bbs/)
    ↓
API
  /api/forum/*
  /api/forum/posts/[slug]/like
  /api/forum/posts/[slug]/bookmark
  /api/forum/posts/[slug]/comments
  /api/community/*
    ↓
Database
  ForumPost (via Article or dedicated)
  ForumComment
  Badge
  UserBadge
    ↓
Permissions
  浏览: Public
  发帖/评论: 🔒 需登录
    ↓
Admin
  /admin/community/*
  /admin/forum/*
    ↓
SEO
  generateMetadata
  JSON-LD: DiscussionForumPosting
    ↓
Related Features
  Home, Topics
    ↓
Design System
  ❌ 未使用
```

---

## 10. Destinations

```
Pages
  /destinations
  /destinations/[slug]
  /countries
  /countries/[country]
  /cities/[city]
    ↓
Components
  JueshiV4PublicShell
  ├── JueshiV4Header
  └── JueshiV4Footer
  DestinationHeroClient
  CountriesIndexClient
  CountryHeroIntelligence
  CountryLocalTimeCard
    ↓
API
  /api/admin/destinations
  /api/admin/destinations/generate
    ↓
Database
  Resource (部分)
  静态数据 (country info)
    ↓
Permissions
  Public (无需登录)
    ↓
Admin
  /admin/destinations
  /admin/destinations/[slug]/edit
    ↓
SEO
  generateMetadata
  JSON-LD: Country, Place
    ↓
Related Features
  Resources, Guides, Tools
    ↓
Design System
  ❌ 未使用
```

---

## 依赖关系总览

```
                    ┌──────────┐
                    │   Home   │
                    └────┬─────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────┴────┐    ┌─────┴─────┐   ┌────┴─────┐
    │  Tools  │    │ Resources │   │Community │
    └────┬────┘    └─────┬─────┘   └────┬─────┘
         │               │               │
    ┌────┴────┐    ┌─────┴─────┐   ┌────┴─────┐
    │Documents│    │Destinations│   │  Topics  │
    └────┬────┘    └───────────┘   └────┬─────┘
         │                               │
    ┌────┴─────┐                   ┌─────┴──────┐
    │Task Chain│                   │   Guides   │
    └────┬─────┘                   └─────┬──────┘
         │                               │
    ┌────┴─────┐                   ┌─────┴──────┐
    │Workspace │ ←──────────────── │ Checklists │
    └──────────┘                   └────────────┘
         │
    ┌────┴─────┐
    │  Admin   │ (管理所有功能)
    └──────────┘
```

---

**文档状态**: FEATURE_DEPENDENCY_GRAPH_COMPLETED  
**生成时间**: 2026-07-09
