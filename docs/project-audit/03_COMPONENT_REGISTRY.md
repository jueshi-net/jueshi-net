# 03 - 组件注册表

**审计日期**: 2026-07-08  
**总组件数**: 213

---

## 组件分类统计

| 分类 | 数量 | 说明 |
|------|------|------|
| Design System | 14 | 基础设计系统组件 |
| UI Lab | 45 | 实验性 UI 组件 |
| Home | 37 | 首页相关组件 |
| Layout | 4 | 布局组件 |
| SaaS | 9 | SaaS 业务组件 |
| UI | 8 | 基础 UI 组件 |
| Workspace | 6 | 工作区组件 |
| User | 7 | 用户相关组件 |
| Tools | 9 | 工具页面组件 |
| Navigation | 9 | 导航组件 |
| BBS | 6 | 论坛组件 |
| Community | 3 | 社区组件 |
| Document Tools | 8 | 文档工具组件 |
| Document Runtime | 4 | 文档运行时组件 |
| Countries | 3 | 国家信息组件 |
| Dashboard | 7 | 仪表盘组件 |
| Starter | 1 | 新手引导组件 |
| Ads | 2 | 广告组件 |
| Analytics | 1 | 分析组件 |
| Auth | 1 | 认证组件 |
| CMS | 1 | 内容管理组件 |
| Common | 1 | 通用组件 |
| Content | 1 | 内容组件 |
| Home Live | 1 | 首页直播组件 |
| Blog | 1 | 博客组件 |

---

## Design System 组件 (14)

| 组件 | 文件 | 用途 | 状态 |
|------|------|------|------|
| PageContainer | `design-system/PageContainer.tsx` | 页面容器 | ✅ 已建立 |
| PageHero | `design-system/PageHero.tsx` | 页面英雄区域 | ✅ 已建立 |
| SectionHeader | `design-system/SectionHeader.tsx` | 章节标题 | ✅ 已建立 |
| ContentSection | `design-system/ContentSection.tsx` | 内容区块 | ✅ 已建立 |
| StatsGrid | `design-system/StatsGrid.tsx` | 统计网格 | ✅ 已建立 |
| StatsCard | `design-system/StatsCard.tsx` | 统计卡片 | ✅ 已建立 |
| ActionCard | `design-system/ActionCard.tsx` | 行动卡片 | ✅ 已建立 |
| EmptyState | `design-system/EmptyState.tsx` | 空状态 | ✅ 已建立 |
| PageCTA | `design-system/PageCTA.tsx` | 页面行动号召 | ✅ 已建立 |
| StickySidebar | `design-system/StickySidebar.tsx` | 粘性侧边栏 | ✅ 已建立 |
| FilterToolbar | `design-system/FilterToolbar.tsx` | 筛选工具栏 | ✅ 已建立 |
| BreadcrumbBar | `design-system/BreadcrumbBar.tsx` | 面包屑导航 | ✅ 已建立 |
| TagGroup | `design-system/TagGroup.tsx` | 标签组 | ✅ 已建立 |
| StatusBadge | `design-system/StatusBadge.tsx` | 状态徽章 | ✅ 已建立 |

**覆盖率**: 0/221 页面使用 (0%)

---

## UI Lab 组件 (45)

### jueshi-v4 (10)
- JueshiV4Shell.tsx
- JueshiV4Hero.tsx
- JueshiV4Header.tsx
- JueshiV4BottomNav.tsx
- JueshiV4Sidebar.tsx
- JueshiV4Topbar.tsx
- JueshiV4ProfileRail.tsx
- JueshiV4ToolGrid.tsx
- JueshiV4ContentSection.tsx
- JueshiV4ScenarioSection.tsx
- JueshiV4MobileProfileCard.tsx

### jueshi-v4-home-candidate (6)
- JueshiV4HomeCandidateShell.tsx
- JueshiV4HomeCandidateHero.tsx
- JueshiV4HomeCandidateHeader.tsx
- JueshiV4HomeCandidateFooter.tsx
- JueshiV4HomeCandidateBottomTab.tsx
- JueshiV4HomeCandidateWorkspace.tsx

### jueshi-v4-home-candidate-v2 (7)
- JueshiV4HomeCandidateV2Shell.tsx
- JueshiV4HomeCandidateV2Hero.tsx
- JueshiV4HomeCandidateV2ResourceNav.tsx
- JueshiV4HomeCandidateV2ToolGrid.tsx
- JueshiV4HomeCandidateV2TaskChains.tsx
- JueshiV4HomeCandidateV2Workspace.tsx
- JueshiV4HomeCandidateV2BottomTab.tsx

### jueshi-v4-home-candidate-v3 (4)
- JueshiV4HomeCandidateV3Shell.tsx
- JueshiV4HomeCandidateV3Hero.tsx
- JueshiV4CommunitySection.tsx
- JueshiV4AdSlot.tsx

### jueshi-v4-home-candidate-v4 (5)
- JueshiV4HomeCandidateV4Shell.tsx ✅ 生产使用
- JueshiV4Header.tsx ✅ 生产使用
- JueshiV4Footer.tsx ✅ 生产使用
- JueshiV4BottomTab.tsx
- JueshiV4AdInventoryGroup.tsx
- JueshiV4AdPlacementGrid.tsx

### jueshi-v4-topnav (8)
- JueshiV4TopNavShell.tsx
- JueshiV4TopNavHeader.tsx
- JueshiV4TopNavHero.tsx
- JueshiV4TopNavBottomNav.tsx
- JueshiV4ResourceNav.tsx
- JueshiV4TaskChains.tsx
- JueshiV4RecommendedContent.tsx
- JueshiV4WorkspaceCard.tsx

### jueshi-v4-topnav-polished (4)
- JueshiV4TopNavPolishedShell.tsx
- JueshiV4TopNavPolishedHeader.tsx
- JueshiV4TopNavPolishedHero.tsx
- JueshiV4TopNavPolishedWorkspaceCard.tsx

**状态**: 🟡 实验阶段，部分组件已投产

---

## Home 组件 (37)

首页相关组件，包括：
- Hero 区域 (hero-section, hero-new, hero-search, hero-super-search)
- 工具展示 (popular-tools, tool-grid, quick-tools, tool-wall)
- 专题展示 (featured-topics, topics-section, topic-showcase)
- 社区区域 (community-section, community-fireworks)
- 文档工具 (document-tools-section)
- AI 工具 (ai-tools-section)
- 其他 (category-cards, identity-cards, market-overview, etc.)

**状态**: 🟡 部分组件重复，需要整合

---

## Layout 组件 (4)

| 组件 | 用途 | 状态 |
|------|------|------|
| header.tsx | 公共页头 | ✅ 生产使用 |
| footer.tsx | 公共页脚（旧版） | 🟡 待替换 |
| footer-new.tsx | 公共页脚（新版） | ✅ 生产使用 |
| JueshiV4PublicShell.tsx | V4 公共外壳 | ✅ 生产使用 |

---

## SaaS 组件 (9)

| 组件 | 用途 | 状态 |
|------|------|------|
| ActionCard.tsx | 行动卡片 | 🟡 与 Design System 重复 |
| CompactTable.tsx | 紧凑表格 | ✅ 使用 |
| MetricCard.tsx | 指标卡片 | ✅ 使用 |
| SaasEmptyState.tsx | 空状态 | 🟡 与 Design System 重复 |
| SectionCard.tsx | 章节卡片 | ✅ 使用 |
| StatusBadge.tsx | 状态徽章 | 🟡 与 Design System 重复 |
| WorkspacePageHeader.tsx | 工作区页头 | ✅ 使用 |
| WorkspaceSidebar.tsx | 工作区侧边栏 | 🟡 与 workspace 重复 |
| WorkspaceTopbar.tsx | 工作区顶栏 | ✅ 使用 |

---

## 重复组件 (7 组)

| 组件名 | 位置 | 建议 |
|--------|------|------|
| ActionCard | design-system/, saas/ | 保留 design-system，删除 saas |
| EmptyState | design-system/, workspace/ | 保留 design-system，删除 workspace |
| StatusBadge | design-system/, saas/ | 保留 design-system，删除 saas |
| WorkspaceSidebar | saas/, workspace/ | 保留 workspace，删除 saas |
| ad-banner | cms/, home/ | 合并为统一组件 |
| theme-toggle | navigation/, root | 保留 navigation，删除 root |
| tool-grid | home/, tools/ | 合并为统一组件 |

---

## 组件健康度

| 类别 | 数量 | 健康度 |
|------|------|--------|
| Design System | 14 | ✅ 已建立，未应用 |
| UI Lab | 45 | 🟡 实验阶段，部分投产 |
| Home | 37 | 🟡 重复较多 |
| Legacy | ~50 | 🔴 需要迁移 |
| 重复 | 7 组 | 🔴 需要清理 |

---

**文档状态**: COMPONENT_REGISTRY_COMPLETED  
**生成时间**: 2026-07-08 23:25 CST
