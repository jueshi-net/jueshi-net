CURRENT_TASK=WORKSPACE_MOBILE_FOUNDATION_REPAIR_V1
ROUTE=/workspace
GOAL=修复移动端工作台基础布局与横向溢出

你是本任务的代码执行者。

请先读取以下文件确认结构：
- src/app/(workspace)/workspace/page.tsx
- src/components/workspace/WorkspaceRightRail.tsx

仅允许编辑权限文件明确允许的文件。

必须保留：
- 全部业务逻辑和数据查询
- 登录态和权限检查
- 签到、任务、单据等功能
- 用户数据展示

禁止：
- 修改其他页面
- 修改 Header/Footer 公共实现
- 新增颜色 Token
- 使用 Bash 或 Git
- 部署
- 向用户询问工作流目的
- 使用 JueshiV4PublicShell（工作台使用 Workspace/SaaS Shell）
- 修改 Auth/Middleware/API/Prisma
- 修改用户业务数据逻辑

## 根因分析

审计发现以下问题：

1. **workspace/page.tsx 第131行**: 
   ```tsx
   <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-6 pb-8">
   ```
   问题：固定300px右侧栏，移动端不响应，导致主内容被挤压

2. **WorkspaceRightRail.tsx 第20行**:
   ```tsx
   <aside className="w-[300px] border-l border-[#E8ECF3] bg-[#F6F8FC]">
   ```
   问题：固定宽度 w-[300px] 无响应式处理

3. **WorkspaceRightRail.tsx 第21行**:
   ```tsx
   <div className="sticky top-14 h-[calc(100vh-3.5rem-4rem)] overflow-y-auto py-5 px-4 pb-8 space-y-4">
   ```
   问题：sticky定位在移动端可能导致布局问题

## 修复任务（必须全部完成）

### 任务1: 修复 workspace/page.tsx 网格布局

将第131行的固定网格改为响应式：

**修改前**:
```tsx
<div className="grid grid-cols-[minmax(0,1fr)_300px] gap-6 pb-8">
```

**修改后**:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 pb-8">
```

这样：
- 移动端 (<lg): 单列布局，右侧栏移到下方或隐藏
- 桌面端 (>=lg): 保持原有两列布局

同时确保主内容区域有 `min-w-0` 防止溢出：
```tsx
<div className="min-w-0 space-y-5 pb-4">
```

### 任务2: 修复 WorkspaceRightRail.tsx 响应式

**修改前 (第20行)**:
```tsx
<aside className="w-[300px] border-l border-[#E8ECF3] bg-[#F6F8FC]">
```

**修改后**:
```tsx
<aside className="w-full lg:w-[300px] lg:border-l border-[#E8ECF3] bg-[#F6F8FC]">
```

**修改前 (第21行)**:
```tsx
<div className="sticky top-14 h-[calc(100vh-3.5rem-4rem)] overflow-y-auto py-5 px-4 pb-8 space-y-4">
```

**修改后**:
```tsx
<div className="lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem-4rem)] overflow-y-auto py-5 px-4 pb-8 space-y-4">
```

这样：
- 移动端：右侧栏全宽显示，非sticky，自然流式布局
- 桌面端：保持原有300px宽度和sticky行为

### 任务3: 确保无横向溢出

检查并确保所有容器：
- 使用 `min-w-0` 在flex/grid子元素上
- 不使用固定宽度（除桌面端lg+）
- 不使用可能导致溢出的绝对定位

完成后重新读取目标文件并回复：

WORKSPACE_MOBILE_FOUNDATION_EDIT_COMPLETE
ACTUAL_CHANGED_FILES=<文件列表>
ROOT_CAUSES_FIXED=<原因列表>

如果目标文件无效，回复：

SELECTED_TARGET_INVALID
