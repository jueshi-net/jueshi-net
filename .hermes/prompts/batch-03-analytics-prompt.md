CURRENT_TASK=CONTROLLED_BATCH_03_ANALYTICS_BODY_UI
ROUTE=/analytics
FILE=src/app/(public)/analytics/page.tsx
GOAL=对 /analytics 页面进行主体级 UI 优化，接入 V4 Public Shell 并改进数据可视化布局

你是本任务的代码执行者。

请先读取 FILE 指定的精确文件，确认其确实实现 ROUTE 对应页面。

仅允许编辑权限文件明确允许的 1 至 2 个文件。

必须保留：
- 全部业务逻辑（数据获取、状态管理、图表渲染）
- 数据来源（API 调用和 fallback 数据生成）
- 查询参数（timeRange 状态）
- 链接（导出按钮等）
- SEO 语义

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
   - 导入 JueshiV4PublicShell 组件
   - 用 JueshiV4PublicShell 包裹整个页面内容
   - 移除自定义的 sticky header（第 85-115 行），因为 V4 Shell 已提供统一的 header
   - 保留时间范围选择器和导出按钮，但将它们移到页面内容区域的顶部

2. **优化统计卡片布局**
   - 改进统计卡片的视觉层级（第 119-140 行）
   - 优化卡片间距和响应式布局
   - 改进图标和数值的对齐方式
   - 确保移动端卡片堆叠时仍有良好的可读性

3. **改进图表区域响应式**
   - 优化主图表行的布局（第 143-196 行）
   - 确保移动端图表垂直堆叠，桌面端保持网格布局
   - 改进图表容器的内边距和阴影效果
   - 优化图表标题和图标的对齐

4. **优化次要图表和列表**
   - 改进热门链接列表的视觉表现（第 201-218 行）
   - 优化设备分布图表的布局（第 221-232 行）
   - 改进 24 小时流量分布和转化漏斗的布局（第 236-274 行）
   - 优化周对比分析的图表布局（第 277-290 行）

5. **改进加载状态**
   - 优化加载状态的视觉表现（第 64-73 行）
   - 使用更符合 V4 设计系统的加载动画
   - 确保加载状态在移动端和桌面端都有良好的视觉表现

6. **优化整体间距和节奏**
   - 改进各个 section 之间的垂直间距
   - 确保页面底部与 Footer 之间有足够的空间
   - 优化容器宽度，确保在不同屏幕尺寸下都有良好的表现

请直接完成 GOAL。

完成后重新读取目标文件并回复：

PAGE_BODY_UI_EDIT_COMPLETE
ACTUAL_CHANGED_FILES=src/app/(public)/analytics/page.tsx
COMPLETED_UI_IMPROVEMENTS=<至少三项具体改进>

如果目标文件无效，回复：

SELECTED_TARGET_INVALID
