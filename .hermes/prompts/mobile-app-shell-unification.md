# 全站移动端 App Shell 统一任务

## 任务目标
统一公共站点和 Workspace 的移动端 App Shell，创建一致的移动端导航体验。

## 当前状态
- 公共站点使用 `Header` 组件（src/components/layout/header.tsx）
- Workspace 使用 `UserNavSidebar` 组件（src/components/user/UserSidebar.tsx）
- UserSidebar 中有 `MobileNavTabs` 组件（横向滚动标签）
- 缺少统一的移动端底部导航和优化的移动端头部

## 需要创建/修改的文件

### 1. 创建统一的移动端底部导航组件
**文件**: `src/components/mobile/MobileBottomNav.tsx`

**要求**:
- 5个主要导航项：首页、工具、工作台、社区、我的
- 使用 Lucide 图标
- 固定定位在底部
- 支持 active 状态高亮
- 响应式：仅在移动端显示（< lg）
- 使用现有设计系统颜色（teal-600）
- 安全区域适配（safe-area-inset-bottom）

**导航项**:
```typescript
const NAV_ITEMS = [
  { href: '/', label: '首页', icon: Home },
  { href: '/tools', label: '工具', icon: Wrench },
  { href: '/workspace', label: '工作台', icon: LayoutDashboard },
  { href: '/bbs', label: '社区', icon: Users },
  { href: '/workspace/member', label: '我的', icon: User },
];
```

### 2. 创建优化的移动端头部组件
**文件**: `src/components/mobile/MobileHeader.tsx`

**要求**:
- 简化版头部，仅显示 Logo 和必要操作
- 固定定位在顶部
- 响应式：仅在移动端显示（< lg）
- 支持返回按钮（可选）
- 高度 56px（14 * 4）
- 使用现有设计系统样式

### 3. 修改公共站点布局
**文件**: `src/app/(public)/public-layout-client.tsx`

**修改内容**:
- 在移动端隐藏桌面版 Header
- 添加 MobileHeader 和 MobileBottomNav
- 确保内容区域有足够的 padding-bottom 避免被底部导航遮挡

### 4. 修改 Workspace 布局
**文件**: `src/app/(workspace)/layout.tsx`

**修改内容**:
- 在移动端隐藏桌面版 Sidebar
- 添加 MobileHeader 和 MobileBottomNav
- 移除或优化现有的 MobileNavTabs（横向滚动标签）
- 确保内容区域有足够的 padding-bottom

### 5. 修改 Workspace 首页
**文件**: `src/app/(workspace)/workspace/page.tsx`

**修改内容**:
- 移除 MobileNavTabs 的调用（如果有的话）
- 确保页面内容与新的底部导航不冲突

## 设计约束

### 颜色系统
- 主色：teal-600（#0d9488）
- 背景：white
- 边框：gray-200
- 文字：gray-900（主）、gray-600（次）
- Active 状态：teal-600

### 尺寸规范
- 底部导航高度：64px（16 * 4）
- 顶部导航高度：56px（14 * 4）
- 图标大小：24px（6 * 4）
- 文字大小：12px（3 * 4）
- 安全区域：使用 env(safe-area-inset-bottom)

### 响应式断点
- 移动端：< 1024px（显示 MobileHeader 和 MobileBottomNav）
- 桌面端：>= 1024px（显示原有 Header 和 Sidebar）

### 交互规范
- 底部导航点击区域：最小 44x44px
- Active 状态：图标和文字变为 teal-600
- 非 Active 状态：图标和文字为 gray-600
- 过渡动画：150ms ease-in-out

## 验证清单

### 公共站点（移动端）
- [ ] MobileHeader 显示正常
- [ ] MobileBottomNav 显示正常
- [ ] 5个导航项都可点击
- [ ] Active 状态正确高亮
- [ ] 内容不被底部导航遮挡
- [ ] 滚动流畅，无卡顿
- [ ] 安全区域适配正确

### Workspace（移动端）
- [ ] MobileHeader 显示正常
- [ ] MobileBottomNav 显示正常
- [ ] "工作台" 项 Active 高亮
- [ ] 内容不被底部导航遮挡
- [ ] 原有功能不受影响
- [ ] 签到、任务等组件正常显示

### 桌面端
- [ ] 原有 Header 正常显示
- [ ] 原有 Sidebar 正常显示
- [ ] MobileHeader 和 MobileBottomNav 不显示
- [ ] 布局无变化

## 禁止事项
- 不修改业务逻辑
- 不修改 API 调用
- 不修改数据库查询
- 不修改认证逻辑
- 不修改现有桌面端组件
- 不引入新的依赖包
- 不使用 inline styles（使用 Tailwind）

## 完成标准
- 所有文件修改完成
- 无 TypeScript 错误
- 无 ESLint 错误
- 移动端导航体验一致
- 桌面端布局无变化
- 代码符合项目规范
