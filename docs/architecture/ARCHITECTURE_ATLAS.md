# Architecture Atlas — 绝世百宝箱系统架构地图

> 最后更新: 2026-07-09  
> 状态: ✅ Phase C 完成

---

## 1. 系统总览

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │   Home   │  │  Tools   │  │Resources │  │  Community   │   │
│  │   (/)    │  │ (/tools) │  │(/resour.)│  │ (/community) │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │              │              │                │           │
│  ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐  ┌──────┴───────┐   │
│  │  Guides  │  │Checklist │  │  Topics  │  │ Destinations │   │
│  │(/guides) │  │(/checks) │  │(/topics) │  │(/destin.)    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │              │              │                │           │
├───────┴──────────────┴──────────────┴────────────────┴──────────┤
│                                                                  │
│                    Public Layout / V4 Shell                       │
│         ┌─────────────────────────────────────────┐             │
│         │  Header ← public-layout-client.tsx → Footer │          │
│         │  (V4 Shell 页面跳过，自带 Header/Footer)     │          │
│         └─────────────────────────────────────────┘             │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │    Workspace     │  │      Admin       │                     │
│  │  (/workspace/*)  │  │   (/admin/*)     │                     │
│  │  (/dashboard/*)  │  │                  │                     │
│  │  需认证 (JWT)    │  │  需认证 (Admin)  │                     │
│  └────────┬─────────┘  └────────┬─────────┘                     │
│           │                      │                               │
├───────────┴──────────────────────┴───────────────────────────────┤
│                                                                  │
│                       Next.js API Routes                         │
│                    (/api/* — 234 routes)                         │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Prisma ORM                            │    │
│  │                  (90 Models)                             │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│                              │                                   │
│  ┌──────────────────────────┴──────────────────────────────┐    │
│  │              PostgreSQL Database                         │    │
│  │         (Staging: xixiong_staging)                       │    │
│  │         (Production: xixiong_prod)                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 模块关系图

### 2.1 Home（首页）

```
Home (/)
│
├── Shell: JueshiV4HomeCandidateV4Shell
│   ├── JueshiV4Header
│   ├── JueshiV4Footer
│   └── JueshiV4BottomTab
│
├── 数据源
│   ├── /api/user/stats → User, DailyCheckIn
│   ├── /api/checkin → DailyCheckIn, PointLedger
│   └── /api/homepage/config → 首页配置
│
├── 导航到
│   ├── → Tools (/tools)
│   ├── → Resources (/resources)
│   ├── → Community (/community)
│   ├── → Topics (/topics)
│   └── → Workspace (/workspace) [需登录]
│
├── Admin: /admin/homepage, /admin/homepage/config
│
└── Related: Tools, Resources, Community, Checkin
```

### 2.2 Workspace（工作区）

```
Workspace (/workspace/*)
│
├── Layout: WorkspaceLayout (需认证)
│   ├── WorkspaceTopbar
│   └── WorkspaceSidebar
│
├── 子模块
│   ├── Favorites → /api/workbench/favorites → WorkbenchLink, ToolFavorite
│   ├── Memos → /api/workspace/memos → Memo
│   ├── Documents → /api/workspace/document-drafts → Document
│   ├── Products → /api/workspace/products → Product (via Resource)
│   ├── Company Profiles → /api/me/company-profiles → CompanyProfile
│   ├── Task Chains → /api/me/task-chains → TaskChain
│   ├── Templates → /api/template-studio/templates → Template
│   ├── Invites → /api/workspace/invites → InviteCode
│   ├── Notifications → /api/me/notifications → Notification
│   ├── Settings → /api/preferences → UserPreference
│   └── Member → /api/me/membership → UserSubscription
│
├── 导航到
│   ├── → Tools (使用工具)
│   ├── → Documents (文档工具)
│   └── → Dashboard (仪表盘)
│
├── Admin: /admin/users (间接管理)
│
└── Related: Dashboard, Tools, Documents, Task Chain
```

### 2.3 Resources（资源目录）

```
Resources (/resources)
│
├── Shell: JueshiV4PublicShell
│
├── 页面
│   ├── /resources → 资源列表
│   ├── /resources/[slug] → 资源分类
│   └── /resources/site/[id] → 资源详情
│
├── 数据源
│   ├── /api/resources → Resource, Category, Tag
│   ├── /api/resources/[id] → Resource (详情)
│   ├── /api/resources/featured → Resource (推荐)
│   └── /api/resources/[id]/check-link → 链接检查 (cheerio)
│
├── Admin: /admin/resources, /admin/resources/import
│
├── SEO: 每页 generateMetadata, JSON-LD
│
└── Related: Home, Tools, Destinations
```

### 2.4 Tools（工具中心）

```
Tools (/tools)
│
├── Shell: JueshiV4PublicShell
│
├── 工具分类
│   ├── 物流工具
│   │   ├── /tools/shipping-calculator
│   │   ├── /tools/shipping-estimator
│   │   ├── /tools/container
│   │   └── /tools/sensitive-goods
│   │
│   ├── 文档工具
│   │   ├── /tools/commercial-invoice
│   │   ├── /tools/shipping-label
│   │   ├── /tools/customs-generator
│   │   └── /tools/documents/*
│   │
│   ├── 查询工具
│   │   ├── /tools/postal-code → /api/postal-codes → PostalCode
│   │   ├── /tools/hs-code → /api/tools/hs-code → HSCode
│   │   ├── /tools/exchange-rate → /api/exchange-rate
│   │   └── /tools/qrcode
│   │
│   ├── AI 工具
│   │   ├── /ai-tools/product-copy → /api/ai/generate
│   │   ├── /ai-tools/translate-polish → /api/ai/generate
│   │   └── /ai-tools/document-summary → /api/ai/generate
│   │
│   └── Template Studio
│       ├── /tools/template-studio → /api/template-studio/templates
│       └── /tools/template-studio/canvas/*
│
├── 数据源
│   ├── /api/tools/* → ToolReview, ToolFavorite
│   ├── /api/calculations → 计算引擎
│   └── /api/template-studio/* → Template
│
├── Admin: /admin/tool-reviews
│
└── Related: Workspace, Resources, Task Chain
```

### 2.5 Guides（指南）

```
Guides (/guides)
│
├── Shell: JueshiV4PublicShell
│
├── 页面
│   ├── /guides → 指南列表
│   ├── /guides/[slug] → 指南详情 (动态)
│   └── 15+ 静态指南页面
│       ├── /guides/hs-code-basics
│       ├── /guides/commercial-invoice
│       ├── /guides/shipping-from-china-to-usa
│       └── ...
│
├── 数据源
│   ├── /api/articles → Article, ArticleTag
│   └── /api/checklists → Article (共用)
│
├── Admin: /admin/content/guides
│
├── SEO: generateMetadata, BreadcrumbList
│
└── Related: Checklists, Topics, Tools
```

### 2.6 Checklists（清单）

```
Checklists (/checklists)
│
├── Shell: JueshiV4PublicShell
│
├── 页面
│   ├── /checklists → 清单列表
│   └── /checklists/[slug] → 清单详情
│
├── 数据源
│   └── /api/checklists → Article (共用)
│
├── Admin: /admin/content/checklists
│
└── Related: Guides, Tools
```

### 2.7 Topics（专题）

```
Topics (/topics)
│
├── Layout: PublicLayoutClient (旧 Header/Footer)
│
├── 页面
│   ├── /topics → 专题列表
│   └── /topics/[slug] → 专题详情
│
├── 数据源
│   └── /api/topics → Topic
│
├── Admin: /admin/content/topics, /admin/topics
│
└── Related: Guides, Resources, Community
```

### 2.8 Search（搜索）

```
Search (/search)
│
├── Layout: PublicLayoutClient (旧 Header/Footer)
│
├── 页面
│   └── /search → 搜索结果
│
├── 数据源
│   └── /api/search → 全文搜索 (跨 Model)
│
├── 搜索范围
│   ├── Articles (Guides, Checklists)
│   ├── Resources
│   ├── Topics
│   └── Tools
│
└── Related: All content features
```

### 2.9 Community（社区）

```
Community (/community)
│
├── Layout: PublicLayoutClient (旧 Header/Footer)
│
├── 页面
│   ├── /community → 帖子列表
│   ├── /community/[slug] → 帖子详情
│   ├── /community/new → 发帖
│   ├── /community/c/[slug] → 分类浏览
│   ├── /community/t/[slug] → 标签浏览
│   ├── /bbs/* → BBS 论坛
│   └── /u/[id] → 用户主页
│
├── 数据源
│   ├── /api/forum/* → ForumPost, ForumComment
│   ├── /api/forum/posts/[slug]/like → 点赞
│   ├── /api/forum/posts/[slug]/bookmark → 收藏
│   └── /api/community/* → Badge, UserBadge
│
├── Admin: /admin/community/*, /admin/forum/*
│
└── Related: Home, Topics
```

### 2.10 Destinations（目的地）

```
Destinations (/destinations)
│
├── Shell: JueshiV4PublicShell
│
├── 页面
│   ├── /destinations → 目的地列表
│   ├── /destinations/[slug] → 国家详情
│   ├── /countries → 国家列表
│   ├── /countries/[country] → 国家信息
│   └── /cities/[city] → 城市信息
│
├── 数据源
│   └── 静态数据 + Prisma (Resource 部分)
│
├── Admin: /admin/destinations
│
└── Related: Resources, Guides, Tools
```

### 2.11 Landing Pages

```
Landing Pages
│
├── /pricing → 定价页
│   └── /api/plans → SubscriptionPlan
│
├── /packages/[id] → 套餐详情
│   └── /api/subscription → UserSubscription
│
├── /starter → 新手指南
│   ├── /starter/[slug] → 场景详情
│   ├── /starter/student → 学生出国
│   └── /starter/apps → 应用推荐
│
├── /business → 企业服务
│
├── /lp/[slug] → 动态 Landing Page
│   └── /api/admin/landing-pages
│
└── Related: Workspace (转化目标)
```

### 2.12 ContentOps

```
ContentOps (内容运营)
│
├── 内容类型
│   ├── Guides → Article Model
│   ├── Checklists → Article Model
│   ├── Blog → Article Model
│   ├── Topics → Topic Model
│   └── Resources → Resource Model
│
├── 管理后台
│   ├── /admin/content/guides
│   ├── /admin/content/checklists
│   ├── /admin/content/topics
│   ├── /admin/resources
│   └── /admin/destinations
│
├── API
│   ├── /api/articles (CRUD)
│   ├── /api/checklists (CRUD)
│   ├── /api/topics (CRUD)
│   ├── /api/resources (CRUD)
│   └── /api/admin/cms/import (批量导入)
│
├── 内部 API
│   └── /api/internal/contentops/drafts → 草稿管理
│
└── Related: Guides, Checklists, Topics, Resources
```

### 2.13 Task Chain（任务链）

```
Task Chain
│
├── 页面
│   ├── /workspace/task-chains → 任务链列表
│   ├── /workspace/task-chains/shipping/new → 新建物流链
│   └── /workspace/task-chains/shipping/[id] → 物流链详情
│
├── 数据源
│   ├── /api/me/task-chains → TaskChain
│   ├── /api/me/task-chains/[id] → TaskChain (详情)
│   └── /api/task-chains → TaskChain (通用)
│
├── 组件
│   ├── TaskChainList (workspace/)
│   ├── TaskChainGeneratorButton (tools/)
│   └── TaskChainNextStep (tools/)
│
├── Admin: /admin/analytics/task-chains
│
└── Related: Workspace, Tools, Documents
```

### 2.14 Admin（管理后台）

```
Admin (/admin/*)
│
├── Layout: AdminLayout (需 Admin 权限)
│
├── 内容管理
│   ├── /admin/content/guides → 指南管理
│   ├── /admin/content/checklists → 清单管理
│   ├── /admin/content/topics → 专题管理
│   ├── /admin/resources → 资源管理
│   └── /admin/destinations → 目的地管理
│
├── 用户管理
│   ├── /admin/users → 用户列表
│   ├── /admin/community/users → 社区用户
│   ├── /admin/invites → 邀请码
│   └── /admin/rewards → 奖励管理
│
├── 运营管理
│   ├── /admin/analytics → 数据分析
│   ├── /admin/ads → 广告管理
│   ├── /admin/notifications → 通知管理
│   └── /admin/newsletter → 邮件订阅
│
├── 系统管理
│   ├── /admin/settings → 系统设置
│   ├── /admin/audit → 审计日志
│   ├── /admin/backup → 备份管理
│   └── /admin/health → 健康检查
│
├── API: /api/admin/* (90+ routes)
│
└── Related: All features (管理所有功能)
```

---

## 3. 跨模块依赖矩阵

| 模块 | Home | Tools | Resources | Guides | Checklists | Topics | Community | Destinations | Workspace | Admin |
|------|------|-------|-----------|--------|------------|--------|-----------|--------------|-----------|-------|
| **Home** | — | → | → | → | → | → | → | → | → | |
| **Tools** | ← | — | → | → | | | | | → | |
| **Resources** | ← | ← | — | | | | | | | |
| **Guides** | ← | ← | | — | → | → | | | | |
| **Checklists** | ← | | | ← | — | | | | | |
| **Topics** | ← | | | → | | — | → | | | |
| **Community** | ← | | | | | ← | — | | | |
| **Destinations** | ← | ← | → | → | | | | — | | |
| **Workspace** | → | → | | | | | | | — | |
| **Admin** | → | → | → | → | → | → | → | → | → | — |

---

## 4. 技术层关系

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Presentation                                       │
│ ├── V4 Shell (JueshiV4PublicShell, JueshiV4HomeCandidateV4) │
│ ├── Public Layout (Header + FooterNew)                      │
│ ├── Workspace Layout (WorkspaceTopbar + Sidebar)            │
│ └── Admin Layout                                            │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: Components                                         │
│ ├── Design System (14 components, 0% applied)               │
│ ├── Feature Components (tools, workspace, community, etc.)  │
│ ├── UI Lab (45 experimental, 27 cleanable)                  │
│ └── Legacy (home/, old hero/tools/topics)                   │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: Data Fetching                                      │
│ ├── Server Components (82 async pages)                      │
│ ├── API Routes (234 routes)                                 │
│ └── Server Actions (1 file)                                 │
├─────────────────────────────────────────────────────────────┤
│ Layer 4: Data Layer                                         │
│ ├── Prisma ORM (90 models)                                  │
│ ├── PostgreSQL                                              │
│ └── External APIs (exchange rate, AI, etc.)                 │
├─────────────────────────────────────────────────────────────┤
│ Layer 5: Infrastructure                                     │
│ ├── Next.js 16.2.4 (App Router)                             │
│ ├── NextAuth v5 (JWT)                                       │
│ ├── Stripe (payments)                                       │
│ ├── Resend (email)                                          │
│ └── Night Pipeline V3 (automation)                          │
└─────────────────────────────────────────────────────────────┘
```

---

**文档状态**: ARCHITECTURE_ATLAS_COMPLETED  
**生成时间**: 2026-07-09
