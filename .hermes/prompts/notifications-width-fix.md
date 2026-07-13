# Workspace Notifications 内容宽度修复

## 任务
修复 /workspace/notifications 页面的内容宽度问题，使其充分利用中间栏的可用宽度。

## 当前问题
- 页面根元素使用了 `max-w-6xl mx-auto`，导致内容在中间栏内居中
- 中间栏本身已经是 `minmax(0, 1fr)`，但内容被限制在 6xl 宽度内
- 结果：内容两侧出现大量空白

## 目标
移除不必要的宽度限制，让内容充分利用中间栏宽度。

## 允许修改的文件
- `src/app/(workspace)/workspace/notifications/page.tsx`
- `src/app/(workspace)/workspace/notifications/notifications-client.tsx`

## 禁止修改
- 任何 layout 文件
- UserSidebar 组件
- WorkspaceRightRail 组件
- 业务逻辑
- API 调用
- 数据库查询

## 具体修改

### notifications-client.tsx
找到第 120 行附近的：
```tsx
<div className="max-w-6xl mx-auto">
```

修改为：
```tsx
<div className="w-full">
```

### page.tsx
检查是否有类似的宽度限制，如果有则移除。

## 验证标准
- 内容宽度应该接近中间栏的 100%（允许正常 padding）
- 不应该出现明显的左右空白
- 移动端布局保持不变
- 所有功能正常工作

## 完成标记
修改完成后，回复：
```
WORKSPACE_NOTIFICATIONS_WIDTH_FIX_COMPLETE
```
