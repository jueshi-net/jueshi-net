# 修复工作台页面三栏结构

## 任务
修复 /workspace/notifications 和 /workspace/documents 页面，使其具有与 /workspace 首页相同的三栏结构。

## 当前状态
- /workspace/notifications 和 /workspace/documents 页面存在
- 缺少三栏结构（左侧导航、主内容、右侧栏）
- 参考页面：/workspace 首页已有正确的三栏结构

## 要求
1. 在 notifications 和 documents 页面中实现三栏布局
2. 左侧栏：复用 UserNavSidebar 组件
3. 主内容区：保留现有业务逻辑
4. 右侧栏：复用 WorkspaceRightRail 组件（如需要）
5. 响应式设计：移动端单列，桌面端三栏
6. 不修改现有业务逻辑和数据获取
7. 不修改其他页面

## 参考实现
参考 /workspace/page.tsx 的布局结构：
```tsx
<div className="flex min-h-screen">
  {/* 左侧导航 */}
  <UserNavSidebar userAsset={userAsset} />
  
  {/* 主内容区 */}
  <main className="flex-1">
    {/* 页面内容 */}
  </main>
  
  {/* 右侧栏（可选） */}
  <WorkspaceRightRail />
</div>
```

## 注意事项
- 保持现有的数据获取逻辑（getServerSession、prisma 查询等）
- 保持现有的业务组件和交互
- 确保移动端响应式正常
- 不修改 UserNavSidebar 和 WorkspaceRightRail 组件本身

## 验证
- 两个页面都能正常渲染
- 桌面端显示三栏结构
- 移动端显示单列布局
- 业务功能保持不变

## 成功标记
完成后输出：
```
WORKSPACE_STRUCTURE_REPAIR_COMPLETE
- /workspace/notifications: 已实现三栏结构
- /workspace/documents: 已实现三栏结构
```
