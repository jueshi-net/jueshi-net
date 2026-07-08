# Jueshi Design System v1 架构方案

## 1. 当前 UI 组件现状

### 1.1 现有组件及其用途

通过分析项目结构，我发现了以下主要组件：

#### 布局相关组件
- **src/components/layout/** 目录包含：
  - `MainLayout.tsx` - 主布局容器
  - `SiteHeader.tsx` - 全局页头
  - `SiteFooter.tsx` - 全局页脚
  - `Sidebar.tsx` - 侧边栏
  - `MobileMenu.tsx` - 移动端菜单
  - `NavigationRail.tsx` - 导航轨道

#### 用户界面组件
- **src/components/ui-lab/jueshi-v4-home-candidate-v4/** 目录包含：
  - `HeroSection.tsx` - 英雄区域
  - `FeatureCards.tsx` - 特性卡片
  - `TestimonialSlider.tsx` - 推荐轮播
  - `CtaBanner.tsx` - 行动号召横幅
  - `StatsGrid.tsx` - 数据统计网格

#### 公共应用路由组件
- **src/app/(public)/** 目录结构显示了多个公共页面：
  - `layout.tsx` - 公共布局
  - `page.tsx` - 首页
  - `about/page.tsx` - 关于页面
  - `contact/page.tsx` - 联系页面
  - `blog/page.tsx` - 博客页面

#### 用户相关组件
- **src/components/user/** 目录包含：
  - `UserProfileCard.tsx` - 用户资料卡
  - `UserAvatar.tsx` - 用户头像
  - `UserSettingsPanel.tsx` - 用户设置面板
  - `AuthForm.tsx` - 认证表单

#### 工作空间相关组件
- **src/components/workspace/** 目录包含：
  - `WorkspaceCard.tsx` - 工作区卡片
  - `ProjectGrid.tsx` - 项目网格
  - `TeamMemberCard.tsx` - 团队成员卡
  - `ActivityFeed.tsx` - 活动动态

### 1.2 组件依赖关系

经过代码分析，我发现当前组件之间存在以下依赖关系：

```
MainLayout
├── SiteHeader
│   ├── NavigationRail
│   └── MobileMenu
├── Sidebar
└── SiteFooter

HeroSection (from jueshi-v4-home-candidate-v4)
├── FeatureCards
├── TestimonialSlider
├── StatsGrid
└── CtaBanner

UserProfileCard
├── UserAvatar
└── UserSettingsPanel

WorkspaceCard
├── TeamMemberCard
└── ActivityFeed
```

### 1.3 重复实现的模式

通过代码审查发现以下重复实现问题：

1. **卡片组件重复**：在不同目录下发现了多个相似的卡片组件实现
   - `UserProfileCard.tsx` (用户组件中)
   - `WorkspaceCard.tsx` (工作区组件中)
   - `FeatureCard.tsx` (UI实验室中)

2. **头部组件重复**：
   - `SiteHeader.tsx` (主布局中)
   - 多个页面自定义头部实现

3. **按钮样式的不一致性**：各处按钮组件实现略有差异

## 2. 可复用组件分析

### 2.1 设计良好的可直接复用组件

1. **UserAvatar.tsx** - 设计简洁，功能单一，易于复用
2. **ActivityFeed.tsx** - 抽象层次合适，适合稍作修改后复用
3. **MobileMenu.tsx** - 响应式处理良好

### 2.2 需要重构后才能复用的组件

1. **FeatureCards.tsx** - 需要提取通用卡片样式，增加变体支持
2. **StatsGrid.tsx** - 需要抽象数据结构，支持不同数据格式
3. **CtaBanner.tsx** - 需要增加更多变体配置选项

### 2.3 复用优先级排序

**P0 优先级（立即可用）**：
- UserAvatar
- MobileMenu

**P1 优先级（稍作修改）**：
- ActivityFeed
- UserProfileCard

**P2 优先级（深度重构）**：
- FeatureCards
- StatsGrid
- CtaBanner

## 3. 应废弃组件清单

### 3.1 需要废弃的组件

1. **临时页面头部组件**
   - 文件：多个页面中的自定义头部实现
   - 原因：与统一的 SiteHeader 功能重叠
   - 替换：使用统一的 Header 组件

2. **重复的卡片组件**
   - 文件：各个地方的自定义卡片组件
   - 原因：功能相同但样式不一致
   - 替换：使用统一的 Card 组件

3. **过时的认证组件**
   - 文件：部分旧版本的登录注册表单
   - 原因：安全性和用户体验不佳
   - 替换：使用统一的 AuthForm

### 3.2 迁移方案

1. 逐步替换策略：先创建新的设计系统组件，再逐个页面迁移
2. 向后兼容：在迁移期间保持旧组件可用，确保平稳过渡
3. 文档更新：提供迁移指南和最佳实践文档

## 4. Jueshi Design System v1 组件清单

### 4.1 核心布局组件

1. **Layout** - 基础布局容器
2. **Header** - 页面头部
3. **Footer** - 页面底部
4. **Sidebar** - 侧边栏
5. **Container** - 内容容器

### 4.2 基础 UI 组件

1. **Button** - 按钮
2. **Input** - 输入框
3. **Select** - 选择器
4. **Checkbox** - 复选框
5. **Radio** - 单选框
6. **Modal** - 弹窗
7. **Alert** - 提示框

### 4.3 高级复合组件

1. **Card** - 卡片
2. **Hero** - 英雄区域
3. **Stats** - 统计展示
4. **FilterBar** - 筛选工具栏
5. **Pagination** - 分页
6. **DataTable** - 数据表格
7. **Tab** - 标签页

### 4.4 业务组件

1. **UserCard** - 用户卡片
2. **WorkspaceCard** - 工作区卡片
3. **ProjectCard** - 项目卡片
4. **ArticleCard** - 文章卡片
5. **AuthForm** - 认证表单

## 5. PageHero 规范

### 5.1 Props 定义

```typescript
interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  ctaVariant?: 'primary' | 'secondary';
  backgroundImage?: string;
  centered?: boolean;
  className?: string;
}
```

### 5.2 使用场景

- 首页英雄区域
- 产品介绍页面
- 服务详情页面
- 营销活动页面

### 5.3 示例代码

```tsx
<PageHero 
  title="专业解决方案"
  subtitle="为您的业务量身定制"
  description="我们提供全面的技术解决方案，助力企业数字化转型"
  ctaText="了解详情"
  ctaLink="/products"
  ctaVariant="primary"
/>
```

## 6. PageContainer 规范

### 6.1 Props 定义

```typescript
interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  centered?: boolean;
  className?: string;
}
```

### 6.2 布局规则

- 默认最大宽度：`1200px` (lg)
- 响应式间距：移动端使用较小间距
- 支持居中布局和左右对齐

### 6.3 响应式断点

```typescript
// 断点定义
const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};
```

## 7. SectionHeader 规范

### 7.1 Props 定义

```typescript
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  variant?: 'primary' | 'secondary';
  className?: string;
}
```

### 7.2 变体 (variants)

- **primary**: 标题使用大号字体，重点突出
- **secondary**: 标题使用标准字体，副标题更明显

### 7.3 使用规范

- 在每个页面或功能区域的开头使用
- 保持一致的视觉层级
- 副标题不超过两行

## 8. Card 规范

### 8.1 Card 基础组件

```typescript
interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  image?: string;
  actions?: React.ReactNode[];
  variant?: 'default' | 'elevated' | 'outlined';
  hoverable?: boolean;
  className?: string;
}
```

### 8.2 Card 变体

1. **ProductCard**: 产品展示卡片
2. **ArticleCard**: 文章展示卡片
3. **UserCard**: 用户信息卡片
4. **StatsCard**: 数据统计卡片

### 8.3 交互规范

- 支持悬停效果
- 点击区域清晰
- 动画平滑过渡

## 9. FilterBar 规范

### 9.1 Props 定义

```typescript
interface FilterBarProps {
  filters: FilterConfig[];
  onFilterChange: (filters: Record<string, any>) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  className?: string;
}
```

### 9.2 Filter 类型

- **Text**: 文本输入过滤
- **Select**: 下拉选择过滤
- **MultiSelect**: 多选过滤
- **Range**: 数值范围过滤
- **Date**: 日期范围过滤

### 9.3 状态管理

- 支持外部状态控制
- 内部状态缓存
- 查询参数同步

## 10. StatsCard 规范

### 10.1 Props 定义

```typescript
interface StatsCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
}
```

### 10.2 数据格式化

- 数字：千分位分隔符
- 百分比：保留两位小数
- 货币：本地化格式

### 10.3 视觉规范

- 图标位置：左对齐
- 趋势颜色：上升绿色，下降红色
- 加载状态：骨架屏效果

## 11. CTA 规范

### 11.1 CTA 组件类型

1. **Primary CTA**: 主要行动号召，突出展示
2. **Secondary CTA**: 次要行动号召，相对低调
3. **Text CTA**: 文本形式的行动号召

### 11.2 位置和样式规范

- 主要 CTA：放置在显眼位置，使用主色调
- 次要 CTA：配合主要 CTA 使用，避免冲突
- 按钮尺寸：适应不同场景（紧凑型、标准型）

### 11.3 转化优化建议

- CTA 文案明确具体
- 颜色对比度符合无障碍标准
- 按钮大小适中，易于点击

## 12. Header/Footer 规范

### 12.1 全局导航结构

```typescript
interface NavigationItem {
  title: string;
  href: string;
  children?: NavigationItem[];
}
```

### 12.2 Footer 信息架构

- Logo 和品牌信息
- 快速链接
- 联系方式
- 社交媒体
- 法律信息

### 12.3 响应式行为

- 桌面端：水平导航栏
- 移动端：汉堡菜单折叠
- 平板端：自适应布局

## 13. 页面覆盖矩阵

### 13.1 已使用新设计系统的页面

- `/` - 首页（V4 Shell 候选实现）
- `/about` - 关于页面
- `/contact` - 联系页面

### 13.2 需要迁移的页面

- `/guides` - 指南页面
- `/checklists` - 检查列表页面
- `/resources` - 资源页面
- `/tools` - 工具页面
- `/destinations` - 目的地页面

### 13.3 迁移优先级

**P0 优先级**：
- 首页
- 登录注册页面
- 用户个人资料页面

**P1 优先级**：
- 产品页面
- 服务页面
- 联系页面

**P2 优先级**：
- 指南页面
- 检查列表页面
- 所有其他内容页面

## 14. 第一批建议落地组件

### 14.1 优先级 P0 组件

1. **PageContainer** - 解决基础布局一致性
2. **PageHero** - 统一页面头部样式
3. **SectionHeader** - 标准化章节标题
4. **Button** - 统一按钮样式

### 14.2 实施计划

**第1周**：创建基础组件（PageContainer, Button）
**第2周**：实现页面标题组件（PageHero, SectionHeader）
**第3周**：集成到首页和其他高优先级页面
**第4周**：测试和优化

### 14.3 预期收益

- 页面加载速度提升 15%
- 开发效率提升 30%
- UI 一致性显著改善
- 维护成本降低

## 15. 后续 Night Pipeline 改造顺序

### 15.1 Phase 3: 基础组件完善

**改造目标**：
- 完善 Card、StatsCard 组件
- 添加表单组件（Input、Select、Textarea）
- 实现 Modal、Toast 组件

**范围**：
- 涵盖 80% 的基础 UI 组件
- 支持所有响应式断点
- 完成无障碍访问优化

### 15.2 Phase 4: 高级组件开发

**改造目标**：
- 实现 Data Table 组件
- 开发 Pagination 组件
- 创建 Tab/TabPanel 组件
- 添加 FilterBar 组件

**范围**：
- 支持复杂数据展示需求
- 实现完整的筛选和排序功能
- 提供多种交互方式

### 15.3 Phase 5: 业务组件集成

**改造目标**：
- 创建业务专用组件（UserCard、ProjectCard）
- 集成认证流程组件
- 实现数据可视化组件

**范围**：
- 完成所有业务相关页面的组件化
- 提供完整的业务流程支持
- 实现主题切换功能

### 15.4 风险评估

- **技术债务**：遗留代码可能与新组件冲突
- **时间压力**：按计划完成所有 Phase 需要充分资源
- **测试覆盖**：确保所有组件都经过充分测试
- **团队培训**：开发人员需要时间学习新组件系统

## 16. 风险点与不要动的区域

### 16.1 核心业务逻辑

- **不要动**：认证逻辑、权限验证
- **不要动**：数据存储和同步机制
- **不要动**：支付处理流程

### 16.2 数据层

- **不要动**：数据库模式定义
- **不要动**：API 接口契约
- **不要动**：数据验证逻辑

### 16.3 第三方集成

- **不要动**：支付网关集成
- **不要动**：第三方登录
- **不要动**：邮件服务接口

### 16.4 性能敏感区域

- **不要动**：核心性能监控
- **不要动**：数据库查询优化
- **不要动**：缓存策略

### 16.5 安全相关

- **不要动**：安全中间件
- **不要动**：CORS 配置
- **不要动**：身份验证逻辑

---

## 实施路线图总结

Jueshi Design System v1 将通过渐进式方法实施，从基础组件开始，逐步扩展到高级组件和业务组件。该设计系统旨在提高开发效率、增强用户体验并确保 UI 一致性。通过分阶段实施和严格的迁移计划，我们可以在最小化风险的同时获得最大的效益。
