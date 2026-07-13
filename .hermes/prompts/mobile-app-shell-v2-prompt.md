# 移动端 App Shell 统一任务

## 任务目标
统一绝世百宝箱移动端 App Shell，使所有公共页面和 Workspace 移动端使用首页现有的 V4 导航组件。

## 当前状态
- 首页使用 `JueshiV4Header` 和 `JueshiV4BottomTab` 组件
- 这些组件位于 `src/components/ui-lab/jueshi-v4-home-candidate-v4/`
- 其他公共页面和 Workspace 移动端未集成这些组件

## 需要修改的文件

### 1. src/components/ui-lab/jueshi-v4-home-candidate-v4/homepageConfig.ts
**修改内容**：在 `headerNav` 数组中添加"我的工作台"导航项
- 在现有导航项后添加一项：
  ```typescript
  {
    label: '我的工作台',
    href: '/workspace',
    icon: 'LayoutDashboard',  // 或 'User'
    enabled: true
  }
  ```
- 确保桌面导航和移动菜单都能访问

### 2. src/components/layout/JueshiV4PublicShell.tsx
**修改内容**：集成 `JueshiV4BottomTab` 组件
- 导入 `JueshiV4BottomTab` 组件
- 在页面底部添加该组件
- 使用 `usePathname()` 获取当前路径，根据路径设置 `activeTab`：
  - `/` → 'home'
  - `/tools` 开头 → 'tools'
  - `/checklists` 开头 → 'checklists'
  - `/workspace` 开头 → 'profile'
  - 其他 → 'home' (默认)
- 添加底部 padding 防止内容被遮挡：`pb-20` (移动端)

### 3. src/app/(workspace)/layout.tsx
**修改内容**：移动端集成 V4 导航
- 导入 `JueshiV4Header` 和 `JueshiV4BottomTab`
- 在移动端（`lg:hidden`）显示这两个组件
- 桌面端（`hidden lg:block`）保持现有布局
- 添加顶部和底部 padding：`pt-16 pb-20` (移动端)
- `JueshiV4BottomTab` 的 `activeTab` 固定为 'profile'

## 禁止事项
- 不修改业务逻辑
- 不修改 API 调用
- 不修改数据库查询
- 不修改认证逻辑
- 不修改现有桌面端组件
- 不引入新的依赖包
- 不使用 inline styles
- 不创建新的导航组件

## 验证清单
- [ ] 所有公共页面移动端显示底部导航
- [ ] 底部导航 active 状态正确
- [ ] 顶部导航包含"我的工作台"
- [ ] Workspace 移动端显示 V4 导航
- [ ] Workspace 桌面端布局不变
- [ ] 无内容被导航遮挡
- [ ] 无横向滚动

## 完成标准
修改完成后，回复：
```
MOBILE_APP_SHELL_UNIFICATION_COMPLETE
ACTUAL_CHANGED_FILES=<文件列表>
SHARED_COMPONENTS_REUSED=<组件列表>
```
