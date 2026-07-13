CURRENT_TASK=EXPANDED_BATCH_04_SHIPPING
ROUTE=/shipping
FILE=src/app/(public)/shipping/page.tsx
PAGE_TYPE=static_content
GOAL=优化 /shipping 页面的 UI 布局和移动端体验

你是本任务的代码执行者。

请先读取这个精确文件：src/app/(public)/shipping/page.tsx

任务要求：
1. 保留现有业务逻辑、文案、链接和数据。
2. 使用现有品牌 Token（不新增 HEX 或颜色 Token）。
3. 不新增渐变或公共组件。
4. 按该页面本身用途优化：
   - 标题和描述层级
   - 内容容器宽度和移动端 gutter
   - 工具卡片网格布局（移动端单列/双列，桌面端三列）
   - 外部链接列表布局
   - Section 节奏
   - 触摸区域（≥44px）
   - Bottom Nav 前的安全间距（pb-20 移动端）
   - 免责声明区域优化
5. 不修改其他页面。
6. 不运行 Bash。
7. 不提交 Git。
8. 不部署。
9. 修改完成后重新读取目标文件确认。

禁止：
- 新增 HEX 颜色值
- 新增颜色 Token
- 新增渐变
- 虚假统计
- 修改共享组件
- 修改 Header/Footer
- 修改 globals.css

最终必须回复：
PUBLIC_PAGE_BODY_EDIT_COMPLETE
ACTUAL_CHANGED_FILES=<实际文件>
COMPLETED_UI_IMPROVEMENTS=<至少三项>

如果目标文件无效，回复：
SELECTED_TARGET_INVALID
