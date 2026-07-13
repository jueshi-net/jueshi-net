CURRENT_TASK=EXPANDED_BATCH_04_DOCUMENTS
ROUTE=/workspace/documents
FILE=src/app/(workspace)/workspace/documents/documents-client-inner.tsx
PAGE_TYPE=workspace_client
GOAL=优化 /workspace/documents 页面的 UI 布局和移动端体验

你是本任务的代码执行者。

请先读取这个精确文件：src/app/(workspace)/workspace/documents/documents-client-inner.tsx

任务要求：
1. 保留现有业务逻辑、API 调用、数据查询和用户交互。
2. 使用现有品牌 Token（不新增 HEX 或颜色 Token）。
3. 不新增渐变或公共组件。
4. 按该页面本身用途优化：
   - 页面标题与主要操作区（新建单据按钮）
   - 筛选栏布局（移动端紧凑排列）
   - 单据卡片信息层级
   - 单据类型标签优化
   - 时间显示优化
   - 空状态优化
   - Loading 状态优化
   - 移动端单列布局
   - 桌面端合理网格布局
   - 触摸区域（≥44px）
   - 长文字截断
   - 底部导航安全间距（pb-20 移动端）
   - 快捷工具入口布局优化
5. 保持现有 Workspace Shell 和移动端 Header/Bottom Nav。
6. 不修改 API 接口。
7. 不修改 Auth。
8. 不修改数据库。
9. 不运行 Bash。
10. 不提交 Git。
11. 不部署。
12. 修改完成后重新读取目标文件确认。

禁止：
- 新增 HEX 颜色值
- 新增颜色 Token
- 新增渐变
- 虚假单据数据
- 修改 API 调用
- 修改共享组件
- 修改 Workspace layout

最终必须回复：
WORKSPACE_PAGE_BODY_EDIT_COMPLETE
ACTUAL_CHANGED_FILES=<实际文件>
COMPLETED_UI_IMPROVEMENTS=<至少三项>

如果目标文件无效，回复：
SELECTED_TARGET_INVALID
