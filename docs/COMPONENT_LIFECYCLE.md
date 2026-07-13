# COMPONENT_LIFECYCLE.md

> 组件生命周期管理 — 所有组件的状态分类  
> 最后更新: 2026-07-09

---

## 生命周期阶段定义

| 阶段 | 定义 | 维护策略 |
|------|------|----------|
| **Production** | 已上线，稳定运行 | 正常维护，优先修复 |
| **Shared** | 被多个页面/组件共享 | 谨慎修改，充分测试 |
| **DesignSystem** | Design System 基础组件 | 最高优先级维护 |
| **Feature** | 特定功能专用组件 | 随功能迭代 |
| **Legacy** | 旧版本，仍在使用 | 逐步迁移 |
| **UILab** | UI Lab 实验组件 | 不用于 Production |
| **Experimental** | 实验性质 | 随时可能废弃 |
| **Deprecated** | 已废弃，待删除 | 停止开发，计划删除 |
| **Dead** | 无引用，可安全删除 | 立即删除 |

---

## Production 组件

### Layout 组件 (4)

| 组件 | 文件 | 引用页面 | 状态 |
|------|------|----------|------|
| Header | `layout/header.tsx` | ~116 Public Layout 页面 | ✅ Production |
| FooterNew | `layout/footer-new.tsx` | ~116 Public Layout 页面 | ✅ Production |
| JueshiV4PublicShell | `layout/JueshiV4PublicShell.tsx` | 7 V4 Shell 页面 | ✅ Production |
| PublicLayoutClient | `(public)/public-layout-client.tsx` | 所有 Public 页面 | ✅ Production |

### 核心业务组件

| 组件 | 目录 | 用途 | 状态 |
|------|------|------|------|
| ToolGrid | `tools/` | 工具网格 | ✅ Production |
| ToolFilterBar | `tools/` | 工具筛选 | ✅ Production |
| ToolCard | `tools/` | 工具卡片 | ✅ Production |
| ResourceDirectoryClient | `(public)/resources/` | 资源目录 | ✅ Production |
| PostCard | `bbs/` | 论坛帖子卡 | ✅ Production |
| CommentSection | `bbs/` | 评论区 | ✅ Production |
| CheckinButton | `user/` | 签到按钮 | ✅ Production |
| CommandPalette | `command-palette.tsx` | 命令面板 | ✅ Production |

---

## Shared 组件

被多个页面或组件引用的共享组件。

| 组件 | 文件 | 引用次数 | 状态 |
|------|------|----------|------|
| Providers | `providers.tsx` | 全局 | ✅ Shared |
| ThemeProvider | `theme-provider.tsx` | 全局 | ✅ Shared |
| IntlProvider | `IntlProvider.tsx` | 全局 | ✅ Shared |
| SessionWrapper | `auth/session-wrapper.tsx` | 全局 | ✅ Shared |
| AnalyticsProvider | `analytics/AnalyticsProvider.tsx` | 全局 | ✅ Shared |
| CookieConsent | `common/cookie-consent.tsx` | 全局 | ✅ Shared |
| PWARegister | `PWARegister.tsx` | 全局 | ✅ Shared |

---

## DesignSystem 组件 (14)

| 组件 | 文件 | 引用页面 | 状态 |
|------|------|----------|------|
| PageContainer | `design-system/PageContainer.tsx` | 0 | ✅ 已建立，未应用 |
| PageHero | `design-system/PageHero.tsx` | 0 | ✅ 已建立，未应用 |
| SectionHeader | `design-system/SectionHeader.tsx` | 0 | ✅ 已建立，未应用 |
| ContentSection | `design-system/ContentSection.tsx` | 0 | ✅ 已建立，未应用 |
| StatsGrid | `design-system/StatsGrid.tsx` | 0 | ✅ 已建立，未应用 |
| StatsCard | `design-system/StatsCard.tsx` | 0 | ✅ 已建立，未应用 |
| ActionCard | `design-system/ActionCard.tsx` | 0 | ✅ 已建立，未应用 |
| EmptyState | `design-system/EmptyState.tsx` | 0 | ✅ 已建立，未应用 |
| PageCTA | `design-system/PageCTA.tsx` | 0 | ✅ 已建立，未应用 |
| StickySidebar | `design-system/StickySidebar.tsx` | 0 | ✅ 已建立，未应用 |
| FilterToolbar | `design-system/FilterToolbar.tsx` | 0 | ✅ 已建立，未应用 |
| BreadcrumbBar | `design-system/BreadcrumbBar.tsx` | 0 | ✅ 已建立，未应用 |
| TagGroup | `design-system/TagGroup.tsx` | 0 | ✅ 已建立，未应用 |
| StatusBadge | `design-system/StatusBadge.tsx` | 0 | ✅ 已建立，未应用 |

**注意**: 14 个组件已建立但 0 个页面引用。覆盖率 0%。

---

## Feature 组件

按功能模块分类的专用组件。

### Home (37)

首页专用组件。部分组件存在重复模式。

| 组件 | 用途 | 状态 |
|------|------|------|
| hero-section.tsx | Hero 区域（旧版） | 🟡 Legacy |
| hero-new.tsx | Hero 区域（新版） | 🟡 Legacy |
| hero-search.tsx | 搜索 Hero | 🟡 Legacy |
| hero-super-search.tsx | 超级搜索 Hero | 🟡 Legacy |
| popular-tools.tsx | 热门工具（旧版） | 🟡 Legacy |
| popular-tools-new.tsx | 热门工具（新版） | 🟡 Legacy |
| popular-tools-dynamic.tsx | 热门工具（动态） | 🟡 Legacy |
| popular-tools-section.tsx | 热门工具（区块） | 🟡 Legacy |
| tool-grid.tsx | 工具网格 | 🟡 Legacy（与 tools/tool-grid 重复） |
| quick-tools.tsx | 快速工具 | 🟡 Legacy |
| quick-tools-grid.tsx | 快速工具网格 | 🟡 Legacy |
| tool-wall.tsx | 工具墙 | 🟡 Legacy |
| featured-slider.tsx | 推荐轮播 | ✅ Feature |
| featured-topics.tsx | 推荐专题 | ✅ Feature |
| topic-showcase.tsx | 专题展示 | ✅ Feature |
| topics-section-new.tsx | 专题区块（新版） | 🟡 Legacy |
| topics-dynamic.tsx | 专题（动态） | 🟡 Legacy |
| community-section.tsx | 社区区块 | ✅ Feature |
| community-fireworks.tsx | 社区烟花效果 | ✅ Feature |
| document-tools-section.tsx | 文档工具区块 | ✅ Feature |
| ai-tools-section.tsx | AI 工具区块 | ✅ Feature |
| category-cards.tsx | 分类卡片 | ✅ Feature |
| identity-cards.tsx | 身份卡片 | ✅ Feature |
| market-overview.tsx | 市场概览 | ✅ Feature |
| platform-stats.tsx | 平台统计 | ✅ Feature |
| partner-logos.tsx | 合作伙伴 | ✅ Feature |
| mega-footer.tsx | 大型页脚 | 🟡 Legacy（未使用） |
| main-content-grid.tsx | 主内容网格 | ✅ Feature |
| resource-nav.tsx | 资源导航 | ✅ Feature |
| seo-section.tsx | SEO 区块 | ✅ Feature |
| starter-resources.tsx | 新手资源 | ✅ Feature |
| workflow-path.tsx | 工作流路径 | ✅ Feature |
| promo-section.tsx | 促销区块 | ✅ Feature |
| premium-section.tsx | 高级区块 | ✅ Feature |
| ad-banner.tsx | 广告横幅 | 🟡 Legacy（与 cms/ad-banner 重复） |
| banner-ad.tsx | 横幅广告 | ✅ Feature |
| home-ad.tsx | 首页广告 | ✅ Feature |

### SaaS (9)

| 组件 | 用途 | 状态 |
|------|------|------|
| ActionCard.tsx | 行动卡片 | 🔴 Duplicate（与 DS 重复） |
| CompactTable.tsx | 紧凑表格 | ✅ Feature |
| MetricCard.tsx | 指标卡片 | ✅ Feature |
| SaasEmptyState.tsx | 空状态 | 🔴 Duplicate（与 DS 重复） |
| SectionCard.tsx | 区块卡片 | ✅ Feature |
| StatusBadge.tsx | 状态徽章 | 🔴 Duplicate（与 DS 重复） |
| WorkspacePageHeader.tsx | 工作区页头 | ✅ Feature |
| WorkspaceSidebar.tsx | 工作区侧边栏 | 🟡 Duplicate（与 workspace/ 重复） |
| WorkspaceTopbar.tsx | 工作区顶栏 | ✅ Feature |

### Workspace (6)

| 组件 | 用途 | 状态 |
|------|------|------|
| DeleteDocButton.tsx | 删除文档按钮 | ✅ Feature |
| EmptyState.tsx | 空状态 | 🔴 Duplicate（与 DS 重复） |
| PageHeader.tsx | 页头 | ✅ Feature |
| TaskChainList.tsx | 任务链列表 | ✅ Feature |
| WorkspaceRightRail.tsx | 右侧栏 | ✅ Feature |
| WorkspaceSidebar.tsx | 侧边栏 | 🟡 Duplicate（与 saas/ 重复） |

### User (7)

| 组件 | 用途 | 状态 |
|------|------|------|
| CheckinButton.tsx | 签到按钮 | ✅ Production |
| RecentTools.tsx | 最近工具 | ✅ Feature |
| TodayTasks.tsx | 今日任务 | ✅ Feature |
| TodoWidget.tsx | 待办组件 | ✅ Feature |
| UserPreferencesContext.tsx | 用户偏好 | ✅ Feature |
| UserSidebar.tsx | 用户侧边栏 | ✅ Feature |
| WorkspaceProviders.tsx | 工作区提供者 | ✅ Feature |

### Navigation (9)

| 组件 | 用途 | 状态 |
|------|------|------|
| CategorySection.tsx | 分类区块 | ✅ Feature |
| CategoryTabs.tsx | 分类标签 | ✅ Feature |
| FavoriteLinkCard.tsx | 收藏链接卡 | ✅ Feature |
| HighlightText.tsx | 高亮文本 | ✅ Feature |
| LinkCard.tsx | 链接卡片 | ✅ Feature |
| NavSidebar.tsx | 导航侧边栏 | ✅ Feature |
| ScrollToTop.tsx | 回到顶部 | ✅ Feature |
| SearchBar.tsx | 搜索栏 | ✅ Feature |
| ThemeToggle.tsx | 主题切换 | ✅ Feature（与根目录 theme-toggle 重复） |

### Document Tools (8)

| 组件 | 用途 | 状态 |
|------|------|------|
| BbsToolLinkage.tsx | 论坛工具关联 | ✅ Feature |
| CompanyProfilePicker.tsx | 公司档案选择器 | ✅ Feature |
| DocumentChainActions.tsx | 文档链操作 | ✅ Feature |
| DocumentToolHeader.tsx | 文档工具页头 | ✅ Feature |
| DocumentToolLayout.tsx | 文档工具布局 | ✅ Feature |
| DocumentToolStatusAlerts.tsx | 文档状态提醒 | ✅ Feature |
| ToolContentSection.tsx | 工具内容区块 | ✅ Feature |
| ToolHistoryPanel.tsx | 工具历史面板 | ✅ Feature |

---

## UILab 组件 (45)

### jueshi-v4 (10) — 🔴 旧版本，可清理

- JueshiV4Shell.tsx
- JueshiV4Hero.tsx
- JueshiV4Header.tsx (与 v4 目录下的不同)
- JueshiV4BottomNav.tsx
- JueshiV4Sidebar.tsx
- JueshiV4Topbar.tsx
- JueshiV4ProfileRail.tsx
- JueshiV4ToolGrid.tsx
- JueshiV4ContentSection.tsx
- JueshiV4ScenarioSection.tsx
- JueshiV4MobileProfileCard.tsx

### jueshi-v4-home-candidate (6) — 🔴 旧版本，可清理

- JueshiV4HomeCandidateShell.tsx
- JueshiV4HomeCandidateHero.tsx
- JueshiV4HomeCandidateHeader.tsx
- JueshiV4HomeCandidateFooter.tsx
- JueshiV4HomeCandidateBottomTab.tsx
- JueshiV4HomeCandidateWorkspace.tsx

### jueshi-v4-home-candidate-v2 (7) — 🔴 旧版本，可清理

- JueshiV4HomeCandidateV2Shell.tsx
- JueshiV4HomeCandidateV2Hero.tsx
- JueshiV4HomeCandidateV2ResourceNav.tsx
- JueshiV4HomeCandidateV2ToolGrid.tsx
- JueshiV4HomeCandidateV2TaskChains.tsx
- JueshiV4HomeCandidateV2Workspace.tsx
- JueshiV4HomeCandidateV2BottomTab.tsx

### jueshi-v4-home-candidate-v3 (4) — 🔴 旧版本，可清理

- JueshiV4HomeCandidateV3Shell.tsx
- JueshiV4HomeCandidateV3Hero.tsx
- JueshiV4CommunitySection.tsx
- JueshiV4AdSlot.tsx

### jueshi-v4-home-candidate-v4 (6) — ✅ 生产使用

- JueshiV4HomeCandidateV4Shell.tsx ✅
- JueshiV4Header.tsx ✅
- JueshiV4Footer.tsx ✅
- JueshiV4BottomTab.tsx
- JueshiV4AdInventoryGroup.tsx
- JueshiV4AdPlacementGrid.tsx

### jueshi-v4-topnav (8) — 🟡 待评估

- JueshiV4TopNavShell.tsx
- JueshiV4TopNavHeader.tsx
- JueshiV4TopNavHero.tsx
- JueshiV4TopNavBottomNav.tsx
- JueshiV4ResourceNav.tsx
- JueshiV4TaskChains.tsx
- JueshiV4RecommendedContent.tsx
- JueshiV4WorkspaceCard.tsx

### jueshi-v4-topnav-polished (4) — 🟡 待评估

- JueshiV4TopNavPolishedShell.tsx
- JueshiV4TopNavPolishedHeader.tsx
- JueshiV4TopNavPolishedHero.tsx
- JueshiV4TopNavPolishedWorkspaceCard.tsx

---

## Legacy 组件

| 组件 | 文件 | 替代方案 | 状态 |
|------|------|----------|------|
| footer.tsx | `layout/footer.tsx` | footer-new.tsx | 🟡 Legacy |
| hero-section.tsx | `home/hero-section.tsx` | V4 Hero | 🟡 Legacy |
| hero-new.tsx | `home/hero-new.tsx` | V4 Hero | 🟡 Legacy |
| popular-tools.tsx | `home/popular-tools.tsx` | V4 ToolGrid | 🟡 Legacy |
| topics-section.tsx | `home/topics-section.tsx` | V4 Topics | 🟡 Legacy |

---

## Deprecated 组件

| 组件 | 文件 | 原因 | 计划 |
|------|------|------|------|
| mega-footer.tsx | `home/mega-footer.tsx` | 未使用 | 待删除 |

---

## Dead 组件（无引用，可安全删除）

需要通过 `grep` 验证确认无引用后删除。

**候选**：
- `home/mega-footer.tsx` — 未使用
- `home-live/HomeLivePage.tsx` — 需验证
- `community-analytics.tsx` — 需验证

---

## 重复组件（需合并）

| 组件名 | 位置 A | 位置 B | 保留 | 删除 |
|--------|--------|--------|------|------|
| ActionCard | design-system/ | saas/ | design-system | saas |
| EmptyState | design-system/ | workspace/ | design-system | workspace |
| StatusBadge | design-system/ | saas/ | design-system | saas |
| WorkspaceSidebar | saas/ | workspace/ | 待评估 | 待评估 |
| ad-banner | cms/ | home/ | 待评估 | 待评估 |
| theme-toggle | navigation/ | root | navigation | root |
| tool-grid | home/ | tools/ | 待评估 | 待评估 |

---

## 统计摘要

| 阶段 | 数量 | 百分比 |
|------|------|--------|
| Production | ~30 | 14% |
| Shared | ~7 | 3% |
| DesignSystem | 14 | 7% |
| Feature | ~70 | 33% |
| Legacy | ~20 | 9% |
| UILab | 45 | 21% |
| Experimental | 0 | 0% |
| Deprecated | 1 | <1% |
| Dead (候选) | ~3 | 1% |
| 重复（待合并） | 7 组 | — |
| **总计** | **213** | **100%** |

---

## 清理计划

### P0 — 立即清理

- 删除 4 个确认重复的组件（ActionCard/saas, EmptyState/workspace, StatusBadge/saas, theme-toggle/root）
- 预计减少：4 个文件

### P1 — 短期清理

- 删除 UI Lab 旧版本（v1+v2+v3）— 27 个文件
- 合并 3 组场景不同的重复组件
- 预计减少：~30 个文件

### P2 — 中期清理

- 迁移 Home 重复模式（11 个组件）
- 清理 Legacy 组件
- 预计减少：~15 个文件

### P3 — 长期清理

- 全面审查 Dead 组件
- 清理所有未使用组件
- 预计减少：~10 个文件

---

**文档状态**: COMPONENT_LIFECYCLE_ESTABLISHED  
**生成时间**: 2026-07-09  
**下次更新**: 组件状态变更时
