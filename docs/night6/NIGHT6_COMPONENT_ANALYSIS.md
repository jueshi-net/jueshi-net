# NIGHT6_COMPONENT_ANALYSIS.md

## 1. 所有 Card 组件

### Design System Cards (2)
- **ActionCard**: `src/components/design-system/ActionCard.tsx`
  - 用途: 展示具有操作功能的卡片
  - 引用次数: 0 (Design System 组件暂未应用)
  - 引用页面: 无

- **StatsCard**: `src/components/design-system/StatsCard.tsx`
  - 用途: 展示单个统计数据卡片
  - 引用次数: 0 (Design System 组件暂未应用)
  - 引用页面: 无

### SaaS Cards (3)
- **ActionCard**: `src/components/saas/ActionCard.tsx`
  - 用途: SaaS 业务行动卡片 (重复组件)
  - 引用次数: 2 (在自身文件和引用处)
  - 引用页面: 多个 SaaS 页面

- **MetricCard**: `src/components/saas/MetricCard.tsx`
  - 用途: SaaS 指标卡片
  - 引用次数: 1
  - 引用页面: Dashboard 等

- **SectionCard**: `src/components/saas/SectionCard.tsx`
  - 用途: SaaS 章节卡片
  - 引用次数: 1
  - 引用页面: 各种内容区块

### Tool Cards (2)
- **tool-card.tsx**: `src/components/tools/tool-card.tsx`
  - 用途: 工具展示卡片
  - 引用次数: 在 `tool-grid.tsx` 中引用
  - 引用页面: 工具相关页面

- **tool-grid.tsx**: `src/components/tools/tool-grid.tsx` (包含 ToolCard)
  - 用途: 工具网格布局
  - 引用次数: 多个页面引用
  - 引用页面: `/tools`, 首页等

### UI Cards (1)
- **base-card.tsx**: `src/components/ui/base-card.tsx`
  - 用途: 基础卡片组件
  - 引用次数: 1
  - 引用页面: 通用界面

### Specialized Cards (10)
- **post-card.tsx**: `src/components/bbs/post-card.tsx`
  - 用途: 论坛帖子卡片
  - 引用次数: 在多个 BBS 相关组件中引用
  - 引用页面: 社区页面

- **membership-card.tsx**: `src/components/dashboard/membership-card.tsx`
  - 用途: 会员信息卡片
  - 引用次数: 在 Dashboard 相关组件中引用
  - 引用页面: 仪表盘页面

- **notification-summary-card.tsx**: `src/components/dashboard/notification-summary-card.tsx`
  - 用途: 通知摘要卡片
  - 引用次数: 在 Dashboard 相关组件中引用
  - 引用页面: 仪表盘页面

- **my-tools.tsx**: `src/components/dashboard/my-tools.tsx`
  - 用途: 我的工具卡片
  - 引用次数: 在 Dashboard 相关组件中引用
  - 引用页面: 仪表盘页面

- **country-local-time-card.tsx**: `src/components/countries/country-local-time-card.tsx`
  - 用途: 国家本地时间卡片
  - 引用次数: 在国家信息相关组件中引用
  - 引用页面: 国家信息页面

- **user-trust-card.tsx**: `src/components/community/user-trust-card.tsx`
  - 用途: 用户信任度卡片
  - 引用次数: 在社区相关组件中引用
  - 引用页面: 社区页面

- **JueshiV4MobileProfileCard.tsx**: `src/components/ui-lab/jueshi-v4/JueshiV4MobileProfileCard.tsx`
  - 用途: UI Lab 移动端用户资料卡片 (实验)
  - 引用次数: 在 V4 相关组件中引用
  - 引用页面: UI Lab 测试页面

- **JueshiV4WorkspaceCard.tsx**: `src/components/ui-lab/jueshi-v4-topnav/JueshiV4WorkspaceCard.tsx`
  - 用途: UI Lab 工作区卡片 (实验)
  - 引用次数: 在 V4 TopNav 相关组件中引用
  - 引用页面: UI Lab 测试页面

- **JueshiV4TopNavPolishedWorkspaceCard.tsx**: `src/components/ui-lab/jueshi-v4-topnav-polished/JueshiV4TopNavPolishedWorkspaceCard.tsx`
  - 用途: UI Lab 精简版工作区卡片 (实验)
  - 引用次数: 在精简版 V4 TopNav 相关组件中引用
  - 引用页面: UI Lab 测试页面

- **favorite-link-card.tsx**: `src/components/navigation/favorite-link-card.tsx`
  - 用途: 收藏链接卡片
  - 引用次数: 在导航相关组件中引用
  - 引用页面: 多个页面

## 2. 所有 Badge 组件

### Design System Badges (1)
- **StatusBadge**: `src/components/design-system/StatusBadge.tsx`
  - 用途: 状态徽章组件
  - 引用次数: 0 (Design System 组件暂未应用)
  - 引用页面: 无

### SaaS Badges (1)
- **StatusBadge**: `src/components/saas/StatusBadge.tsx`
  - 用途: SaaS 状态标签组件 (重复组件)
  - 引用次数: 1
  - 引用页面: Dashboard 等 SaaS 页面

### UI Badges (1)
- **base-badge.tsx**: `src/components/ui/base-badge.tsx`
  - 用途: 基础徽章组件
  - 引用次数: 1
  - 引用页面: 通用界面

### Specialized Badges (1)
- **category-badge.tsx**: `src/components/bbs/category-badge.tsx`
  - 用途: 论坛分类徽章
  - 引用次数: 在 BBS 相关组件中引用
  - 引用页面: 社区页面

## 3. 所有 EmptyState 组件

### Design System EmptyStates (1)
- **EmptyState**: `src/components/design-system/EmptyState.tsx`
  - 用途: 空状态占位图
  - 引用次数: 0 (Design System 组件暂未应用)
  - 引用页面: 无

### SaaS EmptyStates (1)
- **SaasEmptyState**: `src/components/saas/SaasEmptyState.tsx`
  - 用途: SaaS 空状态 (重复组件)
  - 引用次数: 2
  - 引用页面: 多个 SaaS 页面

### Workspace EmptyStates (1)
- **EmptyState**: `src/components/workspace/EmptyState.tsx`
  - 用途: 工作区空状态 (重复组件)
  - 引用次数: 1
  - 引用页面: 工作区相关页面

### Tool EmptyStates (1)
- **tool-empty-state.tsx**: `src/components/tools/tool-empty-state.tsx`
  - 用途: 工具空状态
  - 引用次数: 在工具网格中引用
  - 引用页面: 工具相关页面

### UI EmptyStates (1)
- **empty-state.tsx**: `src/components/ui/empty-state.tsx`
  - 用途: 基础空状态组件
  - 引用次数: 1
  - 引用页面: 通用界面

## 4. 所有 Sidebar 组件

### Design System Sidebars (1)
- **StickySidebar**: `src/components/design-system/StickySidebar.tsx`
  - 用途: 粘性侧边栏布局
  - 引用次数: 0 (Design System 组件暂未应用)
  - 引用页面: 无

### Workspace Sidebars (2)
- **WorkspaceSidebar**: `src/components/workspace/WorkspaceSidebar.tsx`
  - 用途: 工作区左侧导航 (生产使用)
  - 引用次数: 1
  - 引用页面: `/workspace/*` 页面

- **WorkspaceSidebar**: `src/components/saas/WorkspaceSidebar.tsx`
  - 用途: SaaS 工作区左侧导航 (重复组件)
  - 引用次数: 1
  - 引用页面: 潜在 SaaS 页面

### Navigation Sidebars (1)
- **nav-sidebar.tsx**: `src/components/navigation/nav-sidebar.tsx`
  - 用途: 导航侧边栏
  - 引用次数: 在导航相关组件中引用
  - 引用页面: 多个导航页面

### UI Lab Sidebars (1)
- **JueshiV4Sidebar.tsx**: `src/components/ui-lab/jueshi-v4/JueshiV4Sidebar.tsx`
  - 用途: UI Lab V4 侧边栏 (实验)
  - 引用次数: 在 V4 相关组件中引用
  - 引用页面: UI Lab 测试页面

### User Sidebars (1)
- **UserSidebar.tsx**: `src/components/user/UserSidebar.tsx`
  - 用途: 用户侧边栏
  - 引用次数: 在用户相关组件中引用
  - 引用页面: 用户相关页面

## 5. 所有 CTA 组件

### Design System CTAs (1)
- **PageCTA**: `src/components/design-system/PageCTA.tsx`
  - 用途: 页面底部的行动号召区
  - 引用次数: 0 (Design System 组件暂未应用)
  - 引用页面: 无

### Specialized CTAs (1)
- **task-chain-cta.tsx**: `src/components/content/task-chain-cta.tsx`
  - 用途: 任务链行动号召
  - 引用次数: 在内容相关组件中引用
  - 引用页面: 任务链相关页面

### Embedded CTAs (多个)
- **premium-section.tsx**: `src/components/home/premium-section.tsx`
  - 用途: 高级功能 CTA
  - 引用次数: 在首页相关组件中引用
  - 引用页面: 首页

- **starter-resources.tsx**: `src/components/home/starter-resources.tsx`
  - 用途: 新手资源 CTA
  - 引用次数: 在首页相关组件中引用
  - 引用页面: 首页

- **SafeAdSlot.tsx**: `src/components/ads/SafeAdSlot.tsx`
  - 用途: 广告位 CTA
  - 引用次数: 在广告相关组件中引用
  - 引用页面: 多个页面

## 6. 所有 Hero 组件

### Design System Heroes (1)
- **PageHero**: `src/components/design-system/PageHero.tsx`
  - 用途: 页面标题和副标题展示
  - 引用次数: 0 (Design System 组件暂未应用)
  - 引用页面: 无

### Home Heroes (4)
- **hero-section.tsx**: `src/components/home/hero-section.tsx`
  - 用途: 首页 Hero 区域 (旧版)
  - 引用次数: 在首页相关组件中引用
  - 引用页面: 首页

- **hero-new.tsx**: `src/components/home/hero-new.tsx`
  - 用途: 首页 Hero 区域 (新版)
  - 引用次数: 在首页相关组件中引用
  - 引用页面: 首页

- **hero-search.tsx**: `src/components/home/hero-search.tsx`
  - 用途: 搜索 Hero
  - 引用次数: 在首页相关组件中引用
  - 引用页面: 首页

- **hero-super-search.tsx**: `src/components/home/hero-super-search.tsx`
  - 用途: 超级搜索 Hero
  - 引用次数: 在首页相关组件中引用
  - 引用页面: 首页

### Country Heroes (1)
- **country-hero-intelligence.tsx**: `src/components/countries/country-hero-intelligence.tsx`
  - 用途: 国家情报 Hero
  - 引用次数: 在国家信息相关组件中引用
  - 引用页面: 国家信息页面

### UI Lab Heroes (7)
- **JueshiV4HomeCandidateV4Hero.tsx**: `src/components/ui-lab/jueshi-v4-home-candidate-v4/homepageConfig.ts` 中引用
  - 用途: UI Lab V4 首页 Hero (候选)
  - 引用次数: 在 V4 候选组件中引用
  - 引用页面: UI Lab 测试页面

- **JueshiV4TopNavHero.tsx**: `src/components/ui-lab/jueshi-v4-topnav/JueshiV4TopNavHero.tsx`
  - 用途: UI Lab TopNav Hero
  - 引用次数: 在 V4 TopNav 相关组件中引用
  - 引用页面: UI Lab 测试页面

- **JueshiV4TopNavPolishedHero.tsx**: `src/components/ui-lab/jueshi-v4-topnav-polished/JueshiV4TopNavPolishedHero.tsx`
  - 用途: UI Lab 精简版 TopNav Hero
  - 引用次数: 在精简版 V4 TopNav 相关组件中引用
  - 引用页面: UI Lab 测试页面

- **JueshiV4HomeCandidateHero.tsx**: `src/components/ui-lab/jueshi-v4-home-candidate/JueshiV4HomeCandidateHero.tsx`
  - 用途: UI Lab V4 候选 Hero
  - 引用次数: 在 V4 候选相关组件中引用
  - 引用页面: UI Lab 测试页面

- **JueshiV4HomeCandidateV2Hero.tsx**: `src/components/ui-lab/jueshi-v4-home-candidate-v2/JueshiV4HomeCandidateV2Hero.tsx`
  - 用途: UI Lab V4 候选 V2 Hero
  - 引用次数: 在 V4 候选 V2 相关组件中引用
  - 引用页面: UI Lab 测试页面

- **JueshiV4Hero.tsx**: `src/components/ui-lab/jueshi-v4/JueshiV4Hero.tsx`
  - 用途: UI Lab V4 Hero
  - 引用次数: 在 V4 相关组件中引用
  - 引用页面: UI Lab 测试页面

- **JueshiV4HomeCandidateV3Hero.tsx**: `src/components/ui-lab/jueshi-v4-home-candidate-v3/JueshiV4HomeCandidateV3Hero.tsx`
  - 用途: UI Lab V4 候选 V3 Hero
  - 引用次数: 在 V4 候选 V3 相关组件中引用
  - 引用页面: UI Lab 测试页面

## 7. 重复组件分析

### 严重重复组件 (3 组)
1. **ActionCard**
   - 重复版本: 
     - `src/components/design-system/ActionCard.tsx` (Design System)
     - `src/components/saas/ActionCard.tsx` (SaaS 业务)
   - 哪个是 Design System 版本: `design-system/ActionCard.tsx`
   - 哪个是业务版本: `saas/ActionCard.tsx`
   - 建议保留哪个: Design System 版本
   - 原因: Design System 版本更通用，遵循组件一致性原则

2. **EmptyState**
   - 重复版本:
     - `src/components/design-system/EmptyState.tsx` (Design System)
     - `src/components/workspace/EmptyState.tsx` (工作区)
     - `src/components/saas/SaasEmptyState.tsx` (SaaS)
   - 哪个是 Design System 版本: `design-system/EmptyState.tsx`
   - 哪个是业务版本: `workspace/EmptyState.tsx`, `saas/SaasEmptyState.tsx`
   - 建议保留哪个: Design System 版本
   - 原因: Design System 版本更灵活，可配置性强，符合统一设计原则

3. **StatusBadge**
   - 重复版本:
     - `src/components/design-system/StatusBadge.tsx` (Design System)
     - `src/components/saas/StatusBadge.tsx` (SaaS 业务)
   - 哪个是 Design System 版本: `design-system/StatusBadge.tsx`
   - 哪个是业务版本: `saas/StatusBadge.tsx`
   - 建议保留哪个: Design System 版本
   - 原因: Design System 版本功能完整且遵循统一设计语言

### 中等重复组件 (1 组)
4. **WorkspaceSidebar**
   - 重复版本:
     - `src/components/workspace/WorkspaceSidebar.tsx` (工作区专用)
     - `src/components/saas/WorkspaceSidebar.tsx` (SaaS 通用)
   - 哪个是 Design System 版本: 无 (两者都是业务版本)
   - 哪个是业务版本: 两者都是业务版本，但 `workspace/` 版本为生产使用
   - 建议保留哪个: `workspace/WorkspaceSidebar.tsx`
   - 原因: 该版本为生产使用且针对工作区场景进行了优化

### 可能的重复组件 (1 组)
5. **tool-grid**
   - 重复版本:
     - `src/components/home/tool-grid.tsx` (首页版)
     - `src/components/tools/tool-grid.tsx` (工具页版)
   - 哪个是 Design System 版本: 无
   - 哪个是业务版本: 两者都是业务版本
   - 建议保留哪个: 需评估是否合并为通用组件
   - 原因: 两组件功能相似但使用场景略有不同

## 8. 无引用组件

- **home-live/HomeLivePage.tsx** - 首页直播页面组件
- **community-analytics.tsx** - 社区分析组件
- **mega-footer.tsx** (如果存在) - 巨型页脚组件
- 部分 UI Lab 组件 (如 v1-v3 旧版本)

## 9. 可删除组件

### P0 - 立即可删除 (高确定性)
- **src/components/saas/ActionCard.tsx** (重复组件)
  - 原因: 与 Design System 版本重复，功能一致
  - 风险等级: 低 (有 Design System 替代品)

- **src/components/workspace/EmptyState.tsx** (重复组件)
  - 原因: 与 Design System 版本重复
  - 风险等级: 低 (有 Design System 替代品)

- **src/components/saas/StatusBadge.tsx** (重复组件)
  - 原因: 与 Design System 版本重复
  - 风险等级: 低 (有 Design System 替代品)

- **src/components/theme-toggle.tsx** (重复组件)
  - 原因: 与 `navigation/theme-toggle.tsx` 重复
  - 风险等级: 低 (有替代品)

### P1 - 评估后可删除
- **src/components/home/ad-banner.tsx** (重复组件)
  - 原因: 与 `cms/ad-banner.tsx` 重复
  - 风险等级: 中 (需要确认引用位置)

- **home-live/HomeLivePage.tsx** - 如果无引用
  - 原因: 无引用确认
  - 风险等级: 中 (需再次确认)

### P2 - 需仔细评估
- UI Lab 旧版本组件 (v1-v3)
  - 原因: 实验性质，部分可能仍有引用
  - 风险等级: 高 (需要逐一确认引用情况)

## 10. 必须保留组件

### 核心生产组件 (高优先级)
- **src/components/design-system/\*.tsx** - 14个 Design System 基础组件
  - 原因: 项目设计系统基础，未来会广泛应用

- **src/components/layout/JueshiV4PublicShell.tsx**, **header.tsx**, **footer-new.tsx** - 核心布局组件
  - 原因: 7个生产页面正在使用

- **src/components/workspace/WorkspaceSidebar.tsx** - 工作区侧边栏
  - 原因: `/workspace/*` 页面必需

- **src/components/home/hero-\*.tsx** - 首页 Hero 组件系列
  - 原因: 首页仍在使用 (尽管是旧版本)

### 基础设施组件 (中优先级)
- **src/components/providers.tsx**, **theme-provider.tsx**, **IntlProvider.tsx** - 应用基础组件
  - 原因: 全局必需

- **src/components/auth/session-wrapper.tsx** - 认证包装器
  - 原因: 认证系统必需

- **src/components/analytics/AnalyticsProvider.tsx** - 分析提供者
  - 原因: 数据收集必需

### 功能组件 (中优先级)
- **src/components/tools/tool-card.tsx**, **tool-grid.tsx**, **tool-filter-bar.tsx** - 工具页面组件
  - 原因: 工具页面核心功能必需

- **src/components/bbs/post-card.tsx**, **comment-section.tsx** - 社区功能组件
  - 原因: 社区功能必需

- **src/components/user/CheckinButton.tsx** - 用户签到功能
  - 原因: 用户互动功能必需

### 安全保留组件
- **src/components/(与 9833416@qq.com 相关的组件)** - 永久保护账户相关代码
  - 原因: 永久保护规则

### Design System 组件 (高优先级)
- **src/components/design-system/\*** - 全部 14 个组件
  - 原因: 未来统一设计语言基础，即将大规模应用
