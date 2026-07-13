# Jueshi Design System v1 - 组件索引

## 概览

Jueshi Design System v1 是一套基于 React + TypeScript + Tailwind CSS 的组件库，为 jueshi.net 提供统一的 UI 基础能力。

**核心特性**：
- ✅ TypeScript 类型安全
- ✅ Tailwind CSS 响应式设计
- ✅ Dark Mode 支持
- ✅ 完整的 JSDoc 注释
- ✅ 无障碍访问（ARIA）

---

## 组件清单

### 1. PageContainer

**用途**：页面主容器，提供标准化的布局包裹

**Props**：
- `children: ReactNode` - 页面内容
- `className?: string` - 自定义类名
- `paddingTop?: boolean` - 是否添加顶部内边距（默认 true）
- `paddingBottom?: boolean` - 是否添加底部内边距（默认 true）

**依赖关系**：无

**未来替换**：所有页面的根容器

---

### 2. PageHero

**用途**：页面英雄区域，展示标题、副标题和描述

**Props**：
- `title: string` - 主标题
- `subtitle?: string` - 副标题
- `description?: string` - 描述文本
- `className?: string` - 自定义类名

**依赖关系**：无

**未来替换**：
- `/guides` 页面顶部
- `/checklists` 页面顶部
- `/tools` 页面顶部
- `/destinations` 页面顶部

---

### 3. SectionHeader

**用途**：章节标题，统一页面内各区块的标题样式

**Props**：
- `title: string` - 标题文本
- `subtitle?: string` - 副标题
- `align?: 'left' | 'center' | 'right'` - 对齐方式（默认 left）
- `className?: string` - 自定义类名

**依赖关系**：无

**未来替换**：
- `/guides` 分类筛选区标题
- `/checklists` 清单列表标题
- `/tools` 工具分类标题

---

### 4. ContentSection

**用途**：内容区块容器，提供统一的间距和背景

**Props**：
- `children: ReactNode` - 区块内容
- `spacing?: 'sm' | 'md' | 'lg'` - 间距大小（默认 md）
- `background?: 'default' | 'gray' | 'dark'` - 背景色（默认 default）
- `className?: string` - 自定义类名

**依赖关系**：无

**未来替换**：
- `/guides` 文章列表区块
- `/checklists` 清单卡片区块
- `/tools` 工具网格区块

---

### 5. StatsGrid

**用途**：统计数据网格布局

**Props**：
- `children: ReactNode` - StatsCard 组件
- `columns?: 2 | 3 | 4` - 列数（默认 3）
- `gap?: 'sm' | 'md' | 'lg'` - 间距（默认 md）
- `className?: string` - 自定义类名

**依赖关系**：StatsCard

**未来替换**：
- `/guides` 页面统计区
- `/checklists` 页面统计区

---

### 6. StatsCard

**用途**：统计卡片，展示数值、标签和趋势

**Props**：
- `value: string | number` - 数值
- `label: string` - 标签文本
- `trend?: 'up' | 'down' | 'neutral'` - 趋势方向
- `trendValue?: string` - 趋势值（如 "+12%"）
- `icon?: ReactNode` - 图标
- `className?: string` - 自定义类名

**依赖关系**：无

**未来替换**：
- `/guides` 文章数量统计
- `/checklists` 清单数量统计
- `/tools` 工具数量统计

---

### 7. ActionCard

**用途**：行动卡片，引导用户执行特定操作

**Props**：
- `title: string` - 标题
- `description: string` - 描述
- `icon?: ReactNode` - 图标
- `href?: string` - 链接地址
- `onClick?: () => void` - 点击事件
- `variant?: 'primary' | 'secondary'` - 变体（默认 primary）
- `className?: string` - 自定义类名

**依赖关系**：无

**未来替换**：
- `/guides` 推荐操作卡片
- `/checklists` 快速操作卡片
- `/tools` 热门工具卡片

---

### 8. EmptyState

**用途**：空状态提示，当无数据时展示

**Props**：
- `title: string` - 标题
- `description?: string` - 描述
- `icon?: ReactNode` - 图标
- `action?: { label: string; href: string }` - 操作按钮
- `className?: string` - 自定义类名

**依赖关系**：无

**未来替换**：
- `/guides` 无文章时的提示
- `/checklists` 无清单时的提示
- `/tools` 无工具时的提示
- `/workspace/favorites` 无收藏时的提示

---

### 9. PageCTA

**用途**：页面级行动号召，引导用户完成关键转化

**Props**：
- `title: string` - 标题
- `description: string` - 描述
- `primaryAction: { label: string; href: string }` - 主要操作
- `secondaryAction?: { label: string; href: string }` - 次要操作
- `variant?: 'default' | 'dark' | 'gradient'` - 变体（默认 default）
- `className?: string` - 自定义类名

**依赖关系**：无

**未来替换**：
- `/guides` 底部订阅 CTA
- `/checklists` 底部注册 CTA
- `/tools` 底部升级 CTA

---

### 10. StickySidebar

**用途**：粘性侧边栏，滚动时保持可见

**Props**：
- `children: ReactNode` - 侧边栏内容
- `position?: 'left' | 'right'` - 位置（默认 right）
- `offset?: number` - 顶部偏移量（默认 80）
- `className?: string` - 自定义类名

**依赖关系**：无

**未来替换**：
- `/guides` 文章详情页侧边栏
- `/resources` 资源详情页侧边栏

---

### 11. FilterToolbar

**用途**：筛选工具栏，提供分类和搜索功能

**Props**：
- `filters: Array<{ label: string; value: string; count?: number }>` - 筛选项
- `activeFilter?: string` - 当前激活的筛选
- `onFilterChange: (value: string) => void` - 筛选变更回调
- `searchPlaceholder?: string` - 搜索框占位符
- `searchValue?: string` - 搜索值
- `onSearchChange?: (value: string) => void` - 搜索变更回调
- `className?: string` - 自定义类名

**依赖关系**：无

**未来替换**：
- `/guides` 分类筛选栏
- `/tools` 工具分类筛选栏
- `/resources` 资源分类筛选栏

---

### 12. BreadcrumbBar

**用途**：面包屑导航，展示页面层级

**Props**：
- `items: Array<{ label: string; href?: string }>` - 面包屑项
- `className?: string` - 自定义类名

**依赖关系**：无

**未来替换**：
- `/guides/[slug]` 文章详情页
- `/checklists/[slug]` 清单详情页
- `/resources/[slug]` 资源详情页
- `/tools/[slug]` 工具详情页

---

### 13. TagGroup

**用途**：标签组，展示多个标签

**Props**：
- `tags: Array<{ label: string; value: string; variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' }>` - 标签列表
- `onTagClick?: (value: string) => void` - 标签点击回调
- `className?: string` - 自定义类名

**依赖关系**：无

**未来替换**：
- `/guides` 文章标签
- `/tools` 工具标签
- `/resources` 资源标签

---

### 14. StatusBadge

**用途**：状态徽章，展示状态信息

**Props**：
- `status: string` - 状态文本
- `variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'` - 变体（默认 default）
- `size?: 'sm' | 'md' | 'lg'` - 大小（默认 md）
- `className?: string` - 自定义类名

**依赖关系**：无

**未来替换**：
- `/workspace` 任务状态
- `/workspace/task-chains` 任务链状态
- `/resources` 资源状态

---

## 组件依赖关系图

```
PageContainer (基础容器)
├── PageHero (英雄区域)
├── SectionHeader (章节标题)
├── ContentSection (内容区块)
│   ├── StatsGrid (统计网格)
│   │   └── StatsCard (统计卡片)
│   ├── ActionCard (行动卡片)
│   └── EmptyState (空状态)
├── PageCTA (行动号召)
├── StickySidebar (粘性侧边栏)
├── FilterToolbar (筛选工具栏)
├── BreadcrumbBar (面包屑导航)
├── TagGroup (标签组)
└── StatusBadge (状态徽章)
```

---

## 使用示例

### 基础页面结构

```tsx
import PageContainer from '@/components/design-system/PageContainer';
import PageHero from '@/components/design-system/PageHero';
import ContentSection from '@/components/design-system/ContentSection';
import SectionHeader from '@/components/design-system/SectionHeader';

export default function GuidesPage() {
  return (
    <PageContainer>
      <PageHero
        title="实用指南"
        subtitle="跨境寄送、海外生活、出海经营"
        description="面向出海商家、海外华人、留学生的工具教程、避坑指南与实操经验"
      />
      
      <ContentSection spacing="lg">
        <SectionHeader title="最新文章" subtitle="最近更新的内容" />
        {/* 文章内容 */}
      </ContentSection>
    </PageContainer>
  );
}
```

### 统计展示

```tsx
import StatsGrid from '@/components/design-system/StatsGrid';
import StatsCard from '@/components/design-system/StatsCard';

<StatsGrid columns={3}>
  <StatsCard value="20" label="已发布文章" trend="up" trendValue="+5" />
  <StatsCard value="4" label="分类数量" />
  <StatsCard value="2026-07" label="最近更新" />
</StatsGrid>
```

### 筛选工具栏

```tsx
import FilterToolbar from '@/components/design-system/FilterToolbar';

<FilterToolbar
  filters={[
    { label: '全部', value: 'all', count: 20 },
    { label: '跨境寄送', value: 'shipping', count: 15 },
    { label: '海外生活', value: 'life', count: 3 },
    { label: '出海经营', value: 'business', count: 2 }
  ]}
  activeFilter={activeCategory}
  onFilterChange={setActiveCategory}
  searchPlaceholder="搜索指南..."
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
/>
```

---

## 设计规范

### 颜色系统

- **Primary**: `teal-600` / `dark:teal-500`
- **Secondary**: `gray-600` / `dark:gray-400`
- **Success**: `green-600` / `dark:green-500`
- **Warning**: `amber-600` / `dark:amber-500`
- **Danger**: `red-600` / `dark:red-500`
- **Info**: `blue-600` / `dark:blue-500`

### 间距系统

- **sm**: `py-4` / `gap-2`
- **md**: `py-6` / `gap-4`
- **lg**: `py-8` / `gap-6`

### 响应式断点

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

### Dark Mode

所有组件均支持 `dark:` 前缀，自动适配系统主题。

---

## 迁移计划

### Phase 3: 基础页面替换

**目标**：将 `/guides`、`/checklists`、`/tools` 页面替换为 Design System 组件

**范围**：
- 替换页面容器为 `PageContainer`
- 替换英雄区域为 `PageHero`
- 替换章节标题为 `SectionHeader`
- 替换筛选栏为 `FilterToolbar`

**风险评估**：
- 低风险：仅替换 UI 组件，不改变业务逻辑
- 需要视觉验收：确保样式一致性

### Phase 4: 详情页替换

**目标**：将详情页替换为 Design System 组件

**范围**：
- 添加 `BreadcrumbBar` 面包屑导航
- 添加 `StickySidebar` 侧边栏
- 替换标签为 `TagGroup`
- 替换状态为 `StatusBadge`

**风险评估**：
- 中风险：涉及页面布局调整
- 需要充分测试：确保响应式正常

### Phase 5: 工作区替换

**目标**：将 `/workspace` 页面替换为 Design System 组件

**范围**：
- 替换任务卡片为 `ActionCard`
- 替换状态为 `StatusBadge`
- 添加空状态 `EmptyState`

**风险评估**：
- 高风险：涉及复杂业务逻辑
- 需要逐步替换：先替换简单页面

---

## 维护指南

### 添加新组件

1. 在 `src/components/design-system/` 创建组件文件
2. 遵循 TypeScript + Tailwind CSS 规范
3. 添加完整的 JSDoc 注释
4. 支持响应式和 Dark Mode
5. 在 `index.ts` 中导出
6. 更新本文档

### 修改现有组件

1. 确保向后兼容
2. 更新 Props 类型定义
3. 更新 JSDoc 注释
4. 更新本文档
5. 运行 `npm run build` 验证

### 废弃组件

1. 在组件上添加 `@deprecated` JSDoc 标签
2. 说明替代方案
3. 在下一个大版本移除

---

## 版本历史

### v1.0.0 (2026-07-08)

- ✅ 初始版本
- ✅ 14 个基础组件
- ✅ TypeScript 类型定义
- ✅ Tailwind CSS 样式
- ✅ 响应式设计
- ✅ Dark Mode 支持
- ✅ 完整文档

---

**文档维护者**：jueshi.net 团队  
**最后更新**：2026-07-08
