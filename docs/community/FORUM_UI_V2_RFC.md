# Forum UI V2 设计方案 (RFC)

> **状态**: 待确认
> **日期**: 2026-07-19
> **范围**: 论坛社区模块视觉统一，遵循 jueshi.net 整站 UI 规范
> **模式**: DEV (staging only)

---

## 1. 背景与问题

### 1.1 当前状态审计

对现有论坛页面逐页审计后发现以下系统性问题：

| 问题 | 影响页面 | 严重度 |
|------|----------|--------|
| 未使用 `PageContainer`，手写 `max-w-*` | 全部 | P1 |
| 背景色 `bg-gray-50` 而非 `--color-bg` | 全部 | P2 |
| 未使用 `PageHero` / `SectionHeader` | 全部 | P1 |
| 边框色混用 `border-gray-200` / `border-slate-200` | 全部 | P2 |
| 卡片阴影缺失或用 `shadow-sm` 而非 `--shadow-card` | 全部 | P2 |
| 排序/筛选未用 `FilterToolbar` | 首页、分类页 | P2 |
| 统计数据未用 `StatsCard` | 首页 | P3 |
| 空状态混用 `ForumEmptyState` 和 `EmptyState` | 多页 | P3 |
| 侧边栏未用 `StickySidebar` | 首页 | P3 |
| 用户主页 (`/u/[id]`) 未包裹 `JueshiV4PublicShell` | 用户主页 | P0 |
| 用户主页宽度 `max-w-2xl` 与其他页面不一致 | 用户主页 | P1 |
| `PostCard` 样式与设计系统 Card 不一致 | 首页、分类页 | P2 |

### 1.2 页面宽度不一致

| 页面 | 当前 max-width | 设计系统标准 |
|------|---------------|-------------|
| 论坛首页 `/bbs` | `max-w-[1400px]` | `max-w-[1400px]` (PageContainer) |
| 帖子详情 `/bbs/[slug]` | `max-w-[1200px]` | 应统一 |
| 分类页 `/bbs/category/[key]` | `max-w-6xl` (1152px) | 应统一 |
| 排行榜 `/bbs/leaderboard` | `max-w-[1200px]` | 应统一 |
| 我的勋章 `/bbs/my-badges` | `max-w-[1200px]` | 应统一 |
| 用户主页 `/u/[id]` | `max-w-2xl` (672px) | 应统一 |

**目标**: 论坛列表型页面统一为 `max-w-[1400px]`（PageContainer），内容型页面（帖子详情、用户主页）统一为 `max-w-[1200px]`。

---

## 2. 设计 Token 规范（已有，不新建）

以下 Token 定义于 `src/app/globals.css` 的 `@theme` 块，**Forum UI V2 必须严格使用这些 Token**：

### 2.1 色彩

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-brand` | `#0F3D5E` | 主品牌色（按钮、链接、标题强调） |
| `--color-brand-dark` | `#0A2E47` | 品牌色悬停态 |
| `--color-brand-light` | `#1E5A8C` | 品牌色浅色态 |
| `--color-accent` | `#14B8A6` | 强调色（图标、点缀） |
| `--color-accent-dark` | `#0D9488` | 强调色悬停态 |
| `--color-growth` | `#F59E0B` | 成长值/等级相关 |
| `--color-bg` | `#F4F8FB` | 页面背景 |
| `--color-title` | `#102A43` | 主标题文字 |
| `--color-subtitle` | `#666666` | 副标题/描述文字 |
| `--color-border` | `#e5e7eb` | 标准边框 |
| `--color-border-light` | `#f0f0f0` | 轻量分割线 |

**Tailwind 映射**: `bg-brand`, `text-brand`, `border-border`, `bg-bg`, `text-title`, `text-subtitle`

### 2.2 阴影

| Token | 值 | 用途 |
|-------|-----|------|
| `--shadow-card` | `0 2px 12px rgba(0,0,0,0.04)` | 卡片默认 |
| `--shadow-card-hover` | `0 4px 20px rgba(0,0,0,0.08)` | 卡片悬停 |

**Tailwind 映射**: `shadow-card`, `shadow-card-hover`

### 2.3 字体层级

| 层级 | Tailwind 类 | 用途 |
|------|------------|------|
| 页面标题 | `text-2xl sm:text-3xl font-bold` | PageHero / h1 |
| 区块标题 | `text-xl font-bold` | SectionHeader / h2 |
| 卡片标题 | `text-base md:text-lg font-semibold` | PostCard / ActionCard |
| 正文 | `text-sm leading-relaxed` | 帖子内容、描述 |
| 辅助文字 | `text-xs text-subtitle` | 时间、统计数字 |
| 微文字 | `text-[10px] font-bold` | Badge 标签 |

### 2.4 间距规范

| 用途 | 值 |
|------|-----|
| 页面水平 padding | `px-4 sm:px-6 lg:px-8` (PageContainer 内置) |
| 页面垂直 padding | `py-6 sm:py-8` |
| 区块间距 | `mb-6 sm:mb-8` |
| 卡片间距 | `space-y-3` (列表) / `gap-6` (网格) |
| 卡片内 padding | `p-4 md:p-5` (紧凑) / `p-5 md:p-6` (标准) |
| 元素间距 | `gap-2` (紧密) / `gap-3` (标准) / `gap-4` (宽松) |

### 2.5 圆角规范

| 用途 | Tailwind 类 |
|------|------------|
| 卡片 | `rounded-xl` (12px) |
| 按钮 | `rounded-lg` (8px) |
| Badge/标签 | `rounded-full` |
| 输入框 | `rounded-lg` (8px) |
| 小标签 | `rounded` (4px) |

---

## 3. 设计系统组件使用规范

### 3.1 可用组件清单

从 `@/components/design-system` 导入：

| 组件 | 用途 | 论坛使用场景 |
|------|------|-------------|
| `PageContainer` | 页面最外层容器，统一 max-width 和 padding | 所有论坛页面 |
| `PageHero` | 页面标题区，含 title/subtitle/actions | 首页、分类页、排行榜、勋章页 |
| `SectionHeader` | 区块标题，含 title/description/actions | 帖子列表区、侧边栏区块 |
| `ContentSection` | 区块包裹器，含 SectionHeader + 内容 | 侧边栏区块、内容分区 |
| `BreadcrumbBar` | 面包屑导航 | 所有论坛页面（已使用） |
| `FilterToolbar` | 筛选/排序工具栏 | 首页排序、分类页搜索 |
| `StatsCard` | 单个统计数据卡片 | 首页统计栏 |
| `StatsGrid` | 统计卡片网格 | 首页统计栏 |
| `EmptyState` | 空状态占位 | 无帖子、无评论等 |
| `ActionCard` | 带操作按钮的卡片 | 发帖引导、规则提示 |
| `StickySidebar` | 粘性侧边栏布局 | 首页三栏布局 |
| `TagGroup` | 标签组 | 热门标签 |
| `StatusBadge` | 状态徽章 | 帖子状态（置顶/精华/锁定） |
| `PageCTA` | 页面底部行动号召 | 发帖引导 |

### 3.2 组件使用约束

- **禁止**新建与设计系统组件功能重叠的组件
- **禁止**修改设计系统组件本身的代码
- 如果设计系统组件不完全满足需求，在论坛组件目录内封装 wrapper，不修改原组件
- `ForumEmptyState` 保留为论坛专用空状态（含论坛特定 variant），但底层样式对齐 `EmptyState`

---

## 4. 页面设计方案

### 4.1 论坛首页 `/bbs`

#### 当前问题
- 手写 `max-w-[1400px]` 而非 `PageContainer`
- 页面标题手写 `<h1>` 而非 `PageHero`
- 背景色 `bg-gray-50` 而非 `bg-bg`
- 侧边栏手写 `<aside>` 而非 `StickySidebar`
- 排序 Tab 手写 `<Link>` 而非 `FilterToolbar`
- 统计栏手写 `<div>` 而非 `StatsCard`
- 卡片边框 `border-gray-200` 而非 `border-border`

#### 目标布局

```
JueshiV4PublicShell
└── PageContainer (max-w-[1400px])
    ├── BreadcrumbBar [首页 > 社区]
    ├── PageHero
    │   ├── title: "社区论坛"
    │   ├── subtitle: "交流出海工具、海外生活、物流经验 · {N} 帖 · {N} 分类"
    │   └── actions: Button [发布帖子 / 登录后发帖]
    │
    ├── 三栏布局 (grid)
    │   ├── 左侧栏 (220px) - hidden lg:block
    │   │   ├── ContentSection: 社区导航
    │   │   │   └── 分类列表 Link (active = brand bg)
    │   │   ├── ContentSection: 社区规则
    │   │   │   └── 规则列表 + 查看完整规则链接
    │   │   └── ActionCard: Beta 反馈
    │   │
    │   ├── 中间主区域 (1fr)
    │   │   ├── 移动端搜索 + 分类滚动 (lg:hidden)
    │   │   ├── 桌面端搜索 (hidden lg:block)
    │   │   ├── CommunityOnboarding
    │   │   ├── StatsGrid: 3 列统计
    │   │   │   ├── StatsCard: 帖子数
    │   │   │   ├── StatsCard: 分类数
    │   │   │   └── StatsCard: 最新更新
    │   │   ├── FilterToolbar: 排序 (最新/热门/最多回复/精华)
    │   │   ├── PostCard 列表 (space-y-3)
    │   │   └── 分页
    │   │
    │   └── 右侧栏 (300px) - hidden xl:block
    │       ├── ContentSection: 活跃用户 (Top 5)
    │       ├── ContentSection: 热门标签
    │       └── ActionCard: 发布帖子引导
    │
    └── (底部由 Shell Footer 处理)
```

#### 具体变更

| 变更项 | 当前 | 目标 |
|--------|------|------|
| 外层容器 | `<div className="max-w-[1400px] mx-auto px-4 py-6">` | `<PageContainer>` |
| 背景 | `bg-gray-50` | `bg-bg` |
| 页面标题 | 手写 `<h1>` + `<p>` | `<PageHero title="..." subtitle="..." actions={...} />` |
| 统计栏 | 手写 3 个 `<div>` | `<StatsGrid>` + 3 个 `<StatsCard>` |
| 排序 Tab | 手写 `<Link>` 列表 | `<FilterToolbar filters={...} />` |
| 卡片边框 | `border-gray-200` | `border-border` |
| 卡片阴影 | 无 | `shadow-card` |
| 卡片悬停 | `hover:shadow-md` | `hover:shadow-card-hover` |
| 侧边栏区块 | 手写 `<div className="bg-white rounded-xl border border-gray-200 p-4">` | `<ContentSection>` 或统一 Card wrapper |

---

### 4.2 帖子详情 `/bbs/[slug]`

#### 当前问题
- `max-w-[1200px]` 可接受（内容型页面）
- 背景色 `bg-gray-50` 而非 `bg-bg`
- 面包屑在白色条带中，与首页不一致
- 帖子头部、内容区、评论区各自手写 `<div>` 而非统一 Card 组件
- 作者信息区缺少等级/勋章展示
- 边框色 `border-slate-200` 而非 `border-border`

#### 目标布局

```
JueshiV4PublicShell
├── 面包屑条 (bg-white border-b border-border-light)
│   └── BreadcrumbBar [首页 > 社区论坛 > 分类 > 帖子标题]
│
└── 内容区 (max-w-[1200px] mx-auto px-4 py-6)
    ├── 两栏布局 (grid-cols-1 lg:grid-cols-[1fr_300px])
    │
    ├── 左侧: 帖子主体
    │   ├── 帖子头部 Card
    │   │   ├── 状态 Badge 行 (CategoryBadge + Pin/Lock/Featured/Solved)
    │   │   ├── 标题 (text-xl md:text-2xl font-extrabold)
    │   │   ├── 作者信息行
    │   │   │   ├── Avatar (品牌色底)
    │   │   │   ├── 昵称 + 等级标签
    │   │   │   ├── 荣誉值 (Award icon + 数值)
    │   │   │   ├── 成长值 (TrendingUp icon + 数值)
    │   │   │   └── 发布时间
    │   │   └── (border-b border-border-light 分割)
    │   │
    │   ├── 帖子内容 Card
    │   │   ├── PostContent (prose)
    │   │   ├── 标签列表
    │   │   └── PostDetailActions (点赞/收藏/分享/举报)
    │   │
    │   ├── 评论区 Card
    │   │   ├── SectionHeader: "回复 ({N})"
    │   │   ├── 楼层式评论列表
    │   │   └── CommentSection (回复表单)
    │   │
    │   └── 相关帖子 Card (RelatedPosts)
    │
    └── 右侧: 侧边栏 (hidden lg:block)
        ├── 作者名片 Card
        │   ├── Avatar + 昵称 + 等级
        │   ├── 荣誉/成长/帖子/评论 统计
        │   ├── 勋章预览 (前 3 枚)
        │   └── 查看主页链接
        ├── 帖子信息 Card
        │   ├── 浏览量/评论数/点赞数
        │   └── 发布时间/最后编辑
        └── PostTimeline (如有)
```

#### 具体变更

| 变更项 | 当前 | 目标 |
|--------|------|------|
| 背景 | `bg-gray-50` | `bg-bg` |
| 边框色 | `border-slate-200` | `border-border` |
| 卡片阴影 | 无 | `shadow-card` |
| 面包屑条 | `border-b border-slate-200` | `border-b border-border-light` |
| 帖子头部 | `border border-slate-200` | `border border-border shadow-card` |
| 作者信息 | 仅文字 | 增加等级标签 + 荣誉/成长值 icon |
| 侧边栏 | TrendingSidebar (热门帖) | 改为作者名片 + 帖子信息 |

---

### 4.3 分类页 `/bbs/category/[key]`

#### 当前问题
- `max-w-6xl` (1152px) 与其他页面不一致
- 背景色 `bg-gray-50`
- 页面标题手写
- 搜索栏手写
- 边框色混用 `border-gray-200`

#### 目标布局

```
JueshiV4PublicShell
├── 页面头部条 (bg-white border-b border-border-light)
│   └── BreadcrumbBar [首页 > 社区论坛 > 分类名]
│       + 分类图标 + 分类名 + 分类描述
│
└── PageContainer (max-w-[1200px])
    ├── 搜索 + 发帖栏 (Card)
    │   ├── FilterToolbar
    │   │   └── 搜索输入框 + 搜索按钮
    │   └── actions: Button [发布帖子]
    │
    ├── 统计栏
    │   └── "共 {N} 个帖子" + 返回首页链接
    │
    ├── PostCard 列表 (space-y-3)
    │
    └── 分页
```

#### 具体变更

| 变更项 | 当前 | 目标 |
|--------|------|------|
| max-width | `max-w-6xl` (1152px) | `max-w-[1200px]` |
| 背景 | `bg-gray-50` | `bg-bg` |
| 边框色 | `border-gray-200` | `border-border` |
| 卡片阴影 | `shadow-sm` | `shadow-card` |
| 搜索栏 | 手写 `<form>` | 包裹在统一 Card 中 |

---

### 4.4 用户社区主页 `/u/[id]`

#### 当前问题 (P0)
- **未包裹 `JueshiV4PublicShell`** — 无 Header/Footer/BottomTab
- `max-w-2xl` (672px) 过窄
- 无面包屑
- 背景色缺失（依赖 body 默认）
- 完全独立于论坛视觉体系

#### 目标布局

```
JueshiV4PublicShell
├── 面包屑条 (bg-white border-b border-border-light)
│   └── BreadcrumbBar [首页 > 社区论坛 > 用户名片]
│
└── 内容区 (max-w-[1200px] mx-auto px-4 py-6)
    ├── 返回链接 (ArrowLeft + "返回社区")
    │
    ├── 两栏布局 (grid-cols-1 lg:grid-cols-[300px_1fr])
    │
    ├── 左侧: 用户名片
    │   ├── UserTrustCard (增强)
    │   │   ├── Avatar (大尺寸) + 昵称 + 等级标签
    │   │   ├── 公开头衔 / Bio
    │   │   ├── 地区
    │   │   ├── 加入时间
    │   │   └── 统计网格 (帖子/评论/采纳/精华)
    │   │
    │   ├── 勋章展示 Card
    │   │   ├── SectionHeader: "勋章 ({N})"
    │   │   └── 勋章网格 (已获得高亮，未获得灰色)
    │   │
    │   └── (自己的主页) 积分说明 Card
    │       └── 积分/成长值/荣誉值 区别说明
    │
    └── 右侧: 用户内容
        ├── ContentSection: "TA的帖子 ({N})"
        │   ├── PostCard 列表 (紧凑模式)
        │   └── 分页
        │
        └── ContentSection: "TA的回复 ({N})" (如有)
            └── 回复列表
```

#### 具体变更

| 变更项 | 当前 | 目标 |
|--------|------|------|
| Shell | 无 | `JueshiV4PublicShell` |
| max-width | `max-w-2xl` (672px) | `max-w-[1200px]` |
| 背景 | 无 | `bg-bg` |
| 面包屑 | 无 | `BreadcrumbBar` |
| 布局 | 单栏 | 两栏 (名片 + 内容) |
| 卡片边框 | `border-gray-200` | `border-border` |
| 卡片阴影 | 无 | `shadow-card` |

---

### 4.5 排行榜页面 `/bbs/leaderboard`

#### 当前问题
- 页面结构过于简单（仅标题 + Client 组件）
- 排行榜条目视觉层次不够
- 缺少 Top 3 突出展示
- 无统计概览

#### 目标布局

```
JueshiV4PublicShell
├── 面包屑条 (bg-white border-b border-border-light)
│   └── BreadcrumbBar [首页 > 社区论坛 > 排行榜]
│
└── 内容区 (max-w-[1200px] mx-auto px-4 py-6)
    ├── PageHero
    │   ├── title: "社区排行榜"
    │   └── subtitle: "展示社区中最活跃、最有贡献的成员"
    │
    ├── LeaderboardClient
    │   ├── Tab 切换 (活跃作者 / 贡献榜 / 成长榜 / 热心解答)
    │   ├── 时间段切换 (本周 / 本月)
    │   │
    │   ├── Top 3 展示区 (如 >= 3 条数据)
    │   │   ├── 第 2 名 Card (左侧，稍小)
    │   │   ├── 第 1 名 Card (中间，最大，品牌色底)
    │   │   └── 第 3 名 Card (右侧，稍小)
    │   │   每张含: 排名图标 + Avatar + 昵称(脱敏) + 等级 + 核心数值
    │   │
    │   ├── 排名列表 (第 4 名起)
    │   │   └── 排名行 Card
    │   │       ├── 排名号 (text-lg font-bold)
    │   │       ├── Avatar (小)
    │   │       ├── 昵称(脱敏) + 等级标签
    │   │       ├── 核心数值 (右对齐，text-brand font-bold)
    │   │       └── 查看主页链接
    │   │
    │   └── EmptyState (无数据时)
    │
    └── 底部说明
        └── "排行榜每小时更新一次"
```

#### 视觉优化要点

| 元素 | 设计 |
|------|------|
| Top 1 | `bg-brand/5 border-2 border-brand rounded-xl p-6 text-center` |
| Top 2/3 | `bg-white border border-border rounded-xl p-4 shadow-card` |
| 排名图标 | 🥇🥈🥉 (Lucide Award/Medal icon, 非 Emoji) |
| 排名行 | `bg-white border border-border rounded-xl p-3 hover:shadow-card-hover` |
| 昵称脱敏 | `ch***` 格式（隐私保护） |
| 等级标签 | `StatusBadge` 组件 |
| 数值高亮 | `text-brand font-bold text-lg` |

---

## 5. 统一 Card 样式规范

论坛中所有卡片统一使用以下样式（不新建组件，统一 Tailwind 类名）：

### 5.1 标准 Card

```tsx
<div className="bg-white rounded-xl border border-border shadow-card p-5 md:p-6">
  {/* 内容 */}
</div>
```

### 5.2 紧凑 Card (列表项)

```tsx
<div className="bg-white rounded-xl border border-border p-4 md:p-5 hover:shadow-card-hover hover:border-accent/30 transition-all">
  {/* 内容 */}
</div>
```

### 5.3 侧边栏 Card

```tsx
<div className="bg-white rounded-xl border border-border p-4">
  {/* 内容 */}
</div>
```

### 5.4 高亮 Card (Top 1 / 引导)

```tsx
<div className="bg-brand/5 border-2 border-brand rounded-xl p-6 text-center">
  {/* 内容 */}
</div>
```

---

## 6. 实施计划

### 6.1 修改文件清单

| 文件 | 变更类型 | 优先级 |
|------|----------|--------|
| `src/app/(public)/u/[id]/page.tsx` | 重构：加 Shell + 面包屑 + 两栏 | P0 |
| `src/app/(public)/bbs/page.tsx` | 重构：PageContainer + PageHero + 统一 Card | P1 |
| `src/app/(public)/bbs/[slug]/page.tsx` | 调整：统一边框色/阴影/背景 + 侧边栏 | P1 |
| `src/app/(public)/bbs/category/[key]/page.tsx` | 调整：统一 max-width/背景/边框 | P2 |
| `src/app/(public)/bbs/leaderboard/page.tsx` | 调整：PageHero + Top 3 展示 | P2 |
| `src/app/(public)/bbs/leaderboard/leaderboard-client.tsx` | 重构：Top 3 + 排名列表样式 | P2 |
| `src/app/(public)/bbs/my-badges/page.tsx` | 调整：PageHero + 统一背景 | P3 |
| `src/components/bbs/post-card.tsx` | 调整：统一边框色/阴影 | P2 |
| `src/app/(public)/bbs/my-posts/page.tsx` | 调整：统一背景/边框 (如需) | P3 |
| `src/app/(public)/bbs/my-comments/page.tsx` | 调整：统一背景/边框 (如需) | P3 |
| `src/app/(public)/bbs/my-bookmarks/page.tsx` | 调整：统一背景/边框 (如需) | P3 |
| `src/app/(public)/bbs/my-reports/page.tsx` | 调整：统一背景/边框 (如需) | P3 |

### 6.2 不修改的文件

- `src/components/layout/JueshiV4PublicShell.tsx` (Shell)
- `src/components/design-system/**` (设计系统组件)
- `src/components/ui-lab/**` (Header/Footer/BottomTab)
- `src/app/globals.css` (设计 Token)
- `tailwind.config.*` (不存在，Tailwind v4 CSS 配置)
- `prisma/schema.prisma` (数据库)
- `src/app/(public)/workspace/**` (工作台)
- `src/app/(public)/tools/**` (工具页)
- ContentOps 相关文件

### 6.3 API 影响

**无 API 变更**。本次纯视觉重构，不新增、不修改、不删除任何 API 端点。

### 6.4 Schema 影响

**零 Schema 变更**。

### 6.5 测试方案

| 测试类型 | 内容 |
|----------|------|
| 视觉回归 | 每个页面截图对比（390px / 430px / desktop） |
| JS Console | 每个页面无 console error/warning |
| 响应式 | 移动端单栏 / 平板两栏 / 桌面三栏 |
| 链接检查 | 所有内部链接可正常跳转 |
| 权限检查 | 未登录/普通用户/管理员三种状态 |
| 现有测试 | 全量测试不回归 (1067+ passed) |
| Build | `next build` 成功 |

### 6.6 实施顺序

```
Phase 1 (P0): 用户主页加 Shell          → 验证 → 提交
Phase 2 (P1): 论坛首页统一              → 验证 → 提交
Phase 3 (P1): 帖子详情统一              → 验证 → 提交
Phase 4 (P2): 分类页 + 排行榜 + 勋章页   → 验证 → 提交
Phase 5 (P3): 其余 my-* 页面            → 验证 → 提交
Phase 6:     全量测试 + Build + Staging  → 验证 → 报告
```

---

## 7. 验收标准

- [ ] 所有论坛页面使用 `JueshiV4PublicShell`
- [ ] 所有论坛页面背景使用 `bg-bg` (或等效 `--color-bg`)
- [ ] 所有卡片边框使用 `border-border` (或等效 `--color-border`)
- [ ] 所有卡片使用 `shadow-card` / `shadow-card-hover`
- [ ] 页面标题使用 `PageHero` 或等效结构
- [ ] 面包屑使用 `BreadcrumbBar`
- [ ] 排序/筛选使用 `FilterToolbar` 或等效结构
- [ ] 统计数据使用 `StatsCard` 或等效结构
- [ ] 空状态使用 `EmptyState` 或 `ForumEmptyState`（样式对齐）
- [ ] 帖子详情侧边栏展示作者名片
- [ ] 排行榜有 Top 3 突出展示
- [ ] 用户主页有两栏布局（名片 + 内容）
- [ ] 全量测试通过 (0 failed)
- [ ] Build 成功
- [ ] Staging 真实数据验证
- [ ] 移动端 390px / 430px 截图无溢出

---

## 8. 风险与约束

| 风险 | 缓解措施 |
|------|----------|
| 设计系统组件不完全满足论坛需求 | 在 `src/components/bbs/` 或 `src/components/community/` 内封装 wrapper |
| Tailwind v4 CSS 配置 Token 映射不全 | 使用 `bg-[var(--color-bg)]` 等任意值语法作为后备 |
| 页面重构可能影响 SEO 结构化数据 | 保留所有 JSON-LD script 标签，仅调整可视层 |
| 帖子详情 Suspense 流式渲染 | 保持现有 Suspense 边界不变 |
| 用户主页权限检查 | 重构后保留 `isOwnProfile` / `isPublic` 逻辑 |

---

## 9. 不做的事

- 不新建设计 Token
- 不修改 `globals.css`
- 不修改设计系统组件源码
- 不新增 npm 依赖
- 不修改数据库 Schema
- 不新增/修改 API
- 不修改 Header / Footer / BottomTab
- 不修改 Workspace / ContentOps / Hermes 配置
- 不使用 Emoji 作为主图标体系（Lucide icons only）
