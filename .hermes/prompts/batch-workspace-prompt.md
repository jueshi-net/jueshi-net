CURRENT_TASK=EXPANDED_BATCH_WORKSPACE_OPTIMIZATION
ROUTE=/workspace
FILE=src/app/(workspace)/workspace/page.tsx
GOAL=优化工作台首页的布局和信息层级

你是本任务的代码执行者。

请先读取 FILE 指定的精确文件，确认其确实实现 ROUTE 对应页面。

仅允许编辑权限文件明确允许的 1 至 2 个文件。

必须保留：
- 所有用户数据和业务逻辑
- 登录态和权限检查
- 签到、任务、单据等功能
- 数据查询和展示

禁止：
- 修改其他页面
- 创建不存在的页面
- 修改 Header/Footer 公共实现
- 新增颜色 Token
- 使用 Bash 或 Git
- 部署
- 向用户询问工作流目的
- 使用 JueshiV4PublicShell（工作台使用 Workspace/SaaS Shell）

具体任务（必须完成至少三项）：

1. **优化欢迎区域布局**
   - 改进用户信息展示层级
   - 优化等级、成长值、积分的视觉呈现
   - 调整签到按钮的位置和样式

2. **改进快速操作区域**
   - 优化操作卡片的网格布局
   - 改进图标和文字的对齐
   - 调整卡片的间距和内边距

3. **优化核心数据展示**
   - 改进数据卡片的视觉层级
   - 优化数字和标签的对齐
   - 调整卡片的悬停效果

4. **改进成长运营区域**
   - 优化签到、等级、勋章、任务的布局
   - 改进进度条的视觉效果
   - 调整各个模块的间距

5. **优化最近工作区域**
   - 改进单据列表和公司资料的展示
   - 优化空状态的视觉效果
   - 调整列表项的间距和对齐

6. **优化移动端体验**
   - 改进移动端的左右间距
   - 优化触摸目标大小（至少 44px）
   - 调整网格在移动端的列数

请直接完成 GOAL。

完成后重新读取目标文件并回复：

WORKSPACE_PAGE_BODY_EDIT_COMPLETE
ACTUAL_CHANGED_FILES=src/app/(workspace)/workspace/page.tsx
COMPLETED_UI_IMPROVEMENTS=<至少三项具体改进>

如果目标文件无效，回复：

SELECTED_TARGET_INVALID
