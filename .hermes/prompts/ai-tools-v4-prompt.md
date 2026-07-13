CURRENT_TASK=HERMES_AI_TOOLS_V4_SHELL_INTEGRATION
ROUTE=/ai-tools
FILE=src/app/(public)/ai-tools/page.tsx
GOAL=将 AI 工具页面接入 V4 Public Shell，统一页面布局风格

你是本任务的代码执行者。

请先读取 FILE 指定的精确文件，确认其确实实现 ROUTE 对应页面。

仅允许编辑权限文件明确允许的 1 至 2 个文件。

必须保留：
- 业务逻辑（AI 工具展示、功能描述）
- 数据（工具列表、描述文案）
- 链接（工具详情链接）
- 路由（/ai-tools）
- SEO 语义

禁止：
- 修改其他页面
- 创建不存在的页面
- 修改 Header/Footer 公共实现
- 新增颜色 Token
- 使用 Bash 或 Git
- 部署
- 向用户询问工作流目的

具体任务：
1. 导入 JueshiV4PublicShell 组件：`import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell'`
2. 用 JueshiV4PublicShell 包裹整个页面内容
3. 移除不必要的 min-h-screen（Shell 已提供）
4. 保持页面布局和样式
5. 保持响应式设计

请直接完成 GOAL。

完成后重新读取目标文件并回复：

PAGE_EDIT_COMPLETE
ACTUAL_CHANGED_FILES=src/app/(public)/ai-tools/page.tsx

如果目标文件无效，回复：

SELECTED_TARGET_INVALID
