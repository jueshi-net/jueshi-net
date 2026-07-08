# Component Dependency Graph

> 组件依赖关系图 — 组件层级与引用关系  
> 最后更新: 2026-07-09

---

## 1. 组件层级总览

```
┌─────────────────────────────────────────────────────────────┐
│                    Component Hierarchy                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 0: Design System (14 components)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ PageContainer, PageHero, SectionHeader,              │   │
│  │ ContentSection, StatsGrid, StatsCard, ActionCard,    │   │
│  │ EmptyState, PageCTA, StickySidebar, FilterToolbar,   │   │
│  │ BreadcrumbBar, TagGroup, StatusBadge                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  引用次数: 0 (0%)                                            │
│                                                              │
│  Layer 1: V4 Shell (12 components)                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ JueshiV4PublicShell                                   │   │
│  │ ├── JueshiV4Header                                    │   │
│  │ └── JueshiV4Footer                                    │   │
│  │                                                       │   │
│  │ JueshiV4HomeCandidateV4Shell                          │   │
│  │ ├── JueshiV4Header                                    │   │
│  │ ├── JueshiV4Footer                                    │   │
│  │ ├── JueshiV4BottomTab                                 │   │
│  │ ├── JueshiV4AdInventoryGroup                          │   │
│  │ └── JueshiV4AdPlacementGrid                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  引用次数: 8 pages                                           │
│                                                              │
│  Layer 2: Shared Components (~7)                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Providers, ThemeProvider, IntlProvider,               │   │
│  │ SessionWrapper, AnalyticsProvider, CookieConsent,     │   │
│  │ PWARegister                                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  引用次数: Global (所有页面)                                  │
│                                                              │
│  Layer 3: Layout Components (4)                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ header.tsx (旧版 Header)                              │   │
│  │ footer-new.tsx (新版 Footer)                          │   │
│  │ JueshiV4PublicShell                                   │   │
│  │ public-layout-client.tsx                              │   │
│  └──────────────────────────────────────────────────────┘   │
│  引用次数: ~123 pages (旧 Header/Footer)                     │
│                                                              │
│  Layer 4: Feature Components (~70)                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ tools/ (9), workspace/ (6), user/ (7),               │   │
│  │ navigation/ (9), bbs/ (6), community/ (3),            │   │
│  │ document-tools/ (8), document-runtime/ (4),           │   │
│  │ countries/ (3), dashboard/ (7), starter/ (1),         │   │
│  │ saas/ (9)                                             │   │
│  └──────────────────────────────────────────────────────┘   │
│  引用次数: 各功能页面                                         │
│                                                              │
│  Layer 5: Home Components (37) [Legacy]                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ hero-section, hero-new, hero-search, hero-super-search│  │
│  │ popular-tools, popular-tools-new, popular-tools-      │   │
│  │   dynamic, popular-tools-section                      │   │
│  │ tool-grid, quick-tools, quick-tools-grid, tool-wall   │   │
│  │ topics-section, topics-section-new, topics-dynamic    │   │
│  │ ... (37 total)                                        │   │
│  └──────────────────────────────────────────────────────┘   │
│  引用次数: 仅首页 (部分组件已无引用)                           │
│                                                              │
│  Layer 6: UI Lab (45) [Experimental]                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ jueshi-v4/ (10) — 🔴 旧版本                          │   │
│  │ jueshi-v4-home-candidate/ (6) — 🔴 旧版本            │   │
│  │ jueshi-v4-home-candidate-v2/ (7) — 🔴 旧版本         │   │
│  │ jueshi-v4-home-candidate-v3/ (4) — 🔴 旧版本         │   │
│  │ jueshi-v4-home-candidate-v4/ (6) — ✅ 生产使用        │   │
│  │ jueshi-v4-topnav/ (8) — 🟡 待评估                     │   │
│  │ jueshi-v4-topnav-polished/ (4) — 🟡 待评估            │   │
│  └──────────────────────────────────────────────────────┘   │
│  引用次数: 7 pages (v4 only)                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. V4 Shell 依赖关系

```
JueshiV4PublicShell (layout/JueshiV4PublicShell.tsx)
│
├── imports → JueshiV4Header (ui-lab/jueshi-v4-home-candidate-v4/)
│
├── imports → JueshiV4Footer (ui-lab/jueshi-v4-home-candidate-v4/)
│
└── used by:
    ├── / (via JueshiV4HomeCandidateV4Shell)
    ├── /tools
    ├── /resources
    ├── /resources/site/[id]
    ├── /destinations
    ├── /guides
    └── /checklists

JueshiV4HomeCandidateV4Shell (ui-lab/jueshi-v4-home-candidate-v4/)
│
├── imports → JueshiV4Header
├── imports → JueshiV4Footer
├── imports → JueshiV4BottomTab
├── imports → JueshiV4AdInventoryGroup
└── imports → JueshiV4AdPlacementGrid

    used by:
    └── / (首页)
```

---

## 3. Public Layout 依赖关系

```
public-layout-client.tsx
│
├── imports → Header (layout/header.tsx)
│   └── imports → lucide-react icons
│       ├── useSession (next-auth)
│       └── signOut (next-auth)
│
├── imports → FooterNew (layout/footer-new.tsx)
│   └── imports → lucide-react icons
│
├── imports → usePathname (next/navigation)
│
└── used by:
    └── All (public)/layout.tsx pages
        ├── /topics
        ├── /search
        ├── /blog/*
        ├── /community/*
        ├── /countries/*
        ├── /starter/*
        ├── /pricing
        ├── /feedback
        ├── /privacy, /terms
        └── ~116 more pages
```

---

## 4. Design System 依赖关系

```
design-system/index.ts
│
├── exports → PageContainer
├── exports → PageHero
├── exports → SectionHeader
├── exports → ContentSection
├── exports → StatsGrid
├── exports → StatsCard
├── exports → ActionCard
├── exports → EmptyState
├── exports → PageCTA
├── exports → StickySidebar
├── exports → FilterToolbar
├── exports → BreadcrumbBar
├── exports → TagGroup
└── exports → StatusBadge

    used by:
    └── ❌ 无 (0 引用)
```

---

## 5. 重复组件依赖关系

```
┌─────────────────────────────────────────────────────────┐
│                    Duplicate Groups                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Group 1: ActionCard                                     │
│  ├── design-system/ActionCard.tsx ✅ 保留                │
│  └── saas/ActionCard.tsx 🔴 待删除                       │
│                                                          │
│  Group 2: EmptyState                                     │
│  ├── design-system/EmptyState.tsx ✅ 保留                │
│  └── workspace/EmptyState.tsx 🔴 待删除                  │
│                                                          │
│  Group 3: StatusBadge                                    │
│  ├── design-system/StatusBadge.tsx ✅ 保留               │
│  └── saas/StatusBadge.tsx 🔴 待删除                      │
│                                                          │
│  Group 4: WorkspaceSidebar                               │
│  ├── saas/WorkspaceSidebar.tsx 🟡 待评估                 │
│  └── workspace/WorkspaceSidebar.tsx 🟡 待评估            │
│                                                          │
│  Group 5: ad-banner                                      │
│  ├── cms/ad-banner.tsx 🟡 待评估 (async, DB)             │
│  └── home/ad-banner.tsx 🟡 待评估 (static)               │
│                                                          │
│  Group 6: theme-toggle                                   │
│  ├── navigation/theme-toggle.tsx ✅ 保留                 │
│  └── theme-toggle.tsx (root) 🔴 待删除                   │
│                                                          │
│  Group 7: tool-grid                                      │
│  ├── home/tool-grid.tsx 🟡 待评估 (no props)             │
│  └── tools/tool-grid.tsx 🟡 待评估 (with props)          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Home 组件依赖关系 (Legacy)

```
Home Components (37)
│
├── Hero 系列 (4) — 重复模式
│   ├── hero-section.tsx → 旧版
│   ├── hero-new.tsx → 新版
│   ├── hero-search.tsx → 搜索变体
│   └── hero-super-search.tsx → 超级搜索变体
│
├── Tools 系列 (6) — 重复模式
│   ├── popular-tools.tsx → 旧版
│   ├── popular-tools-new.tsx → 新版
│   ├── popular-tools-dynamic.tsx → 动态版
│   ├── popular-tools-section.tsx → 区块版
│   ├── tool-grid.tsx → 网格 (与 tools/ 重复)
│   └── quick-tools-grid.tsx → 快速网格
│
├── Topics 系列 (3) — 重复模式
│   ├── topics-section.tsx → 旧版
│   ├── topics-section-new.tsx → 新版
│   └── topics-dynamic.tsx → 动态版
│
├── 独立组件 (~24)
│   ├── community-section.tsx
│   ├── community-fireworks.tsx
│   ├── document-tools-section.tsx
│   ├── ai-tools-section.tsx
│   ├── category-cards.tsx
│   ├── identity-cards.tsx
│   ├── market-overview.tsx
│   ├── platform-stats.tsx
│   ├── partner-logos.tsx
│   ├── main-content-grid.tsx
│   ├── resource-nav.tsx
│   ├── seo-section.tsx
│   ├── starter-resources.tsx
│   ├── workflow-path.tsx
│   ├── promo-section.tsx
│   ├── premium-section.tsx
│   ├── featured-slider.tsx
│   ├── featured-topics.tsx
│   ├── topic-showcase.tsx
│   ├── mega-footer.tsx (未使用)
│   ├── ad-banner.tsx (与 cms/ 重复)
│   ├── banner-ad.tsx
│   └── home-ad.tsx
│
└── used by:
    └── / (首页) — 部分组件已无引用
```

---

## 7. 组件引用统计

| 层级 | 组件数 | 引用页面数 | 健康度 |
|------|--------|------------|--------|
| Design System | 14 | 0 | 🔴 未应用 |
| V4 Shell | 12 | 8 | ✅ 健康 |
| Shared | 7 | All | ✅ 健康 |
| Layout | 4 | ~123 | ✅ 健康 |
| Feature | ~70 | ~100 | ✅ 健康 |
| Home (Legacy) | 37 | 1 | 🟡 部分冗余 |
| UI Lab | 45 | 7 | 🟡 27 可清理 |

---

**文档状态**: COMPONENT_DEPENDENCY_GRAPH_COMPLETED  
**生成时间**: 2026-07-09
