CURRENT_TASK=EXPANDED_BATCH_AI_LEARNING_OPTIMIZATION
ROUTE=/ai-learning
FILE=src/app/(public)/ai-learning/page.tsx
GOAL=优化 AI 学习导航页面的布局和信息层级

你是本任务的代码执行者。

请先读取 FILE 指定的精确文件，确认其确实实现 ROUTE 对应页面。

仅允许编辑权限文件明确允许的 1 至 2 个文件。

必须保留：
- 所有 AI 工具分类和链接
- 工具图标和描述
- 外部链接功能

禁止：
- 修改其他页面
- 创建不存在的页面
- 修改 Header/Footer 公共实现
- 新增颜色 Token
- 使用 Bash 或 Git
- 部署
- 向用户询问工作流目的

具体任务（必须完成至少三项）：

1. **接入 V4 Public Shell**
   - 导入 JueshiV4PublicShell 组件：`import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell'`
   - 用 JueshiV4PublicShell 包裹整个页面内容
   - 移除不必要的 min-h-screen

2. **优化页面标题和描述层级**
   - 改进 H1 标题的视觉层级和间距
   - 优化副标题和说明文字的可读性
   - 调整分类标题的对齐和间距

3. **改进工具卡片布局**
   - 优化工具链接的网格间距
   - 改进工具图标和文字的对齐
   - 调整卡片内边距和悬停效果

4. **优化移动端体验**
   - 改进移动端的左右间距
   - 优化触摸目标大小（至少 44px）
   - 调整网格在移动端的列数

5. **改进 Section 间距和节奏**
   - 优化各个分类之间的垂直间距
   - 改进分类标题和工具列表的间距
   - 调整整体页面的内边距

请直接完成 GOAL。

完成后重新读取目标文件并回复：

PUBLIC_PAGE_BODY_EDIT_COMPLETE
ACTUAL_CHANGED_FILES=src/app/(public)/ai-learning/page.tsx
COMPLETED_UI_IMPROVEMENTS=<至少三项具体改进>

如果目标文件无效，回复：

SELECTED_TARGET_INVALID
