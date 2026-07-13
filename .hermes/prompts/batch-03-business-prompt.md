CURRENT_TASK=CONTROLLED_BATCH_03_BUSINESS_BODY_UI
ROUTE=/business
FILE=src/app/(public)/business/page.tsx
GOAL=对 /business 页面进行主体级 UI 优化，接入 V4 Public Shell 并改进工具导航布局

你是本任务的代码执行者。

请先读取 FILE 指定的精确文件，确认其确实实现 ROUTE 对应页面。

仅允许编辑权限文件明确允许的 1 至 2 个文件。

必须保留：
- 全部业务逻辑（工具分类、链接渲染、外部链接处理）
- 数据来源（categories 和 relatedTools 数据）
- 查询参数（无）
- 链接（所有工具链接和外部链接）
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
   - 移除自定义的 Hero 区域（第 164-171 行），因为 V4 Shell 已提供统一的 header
   - 移除旧的 Breadcrumb 组件（第 175-177 行），V4 Shell 会提供面包屑

2. **优化分类卡片布局**
   - 改进分类卡片的视觉层级（第 180-202 行）
   - 优化卡片间距和响应式布局
   - 改进图标和标题的对齐方式
   - 确保移动端卡片堆叠时仍有良好的可读性
   - 优化卡片阴影和边框效果

3. **改进工具链接渲染**
   - 优化工具链接的视觉表现（第 122-158 行的 ToolLinkItem 组件）
   - 改进链接的悬停效果和过渡动画
   - 优化外部链接图标的显示逻辑
   - 改进"即将上线"状态的视觉表现
   - 确保链接在移动端有足够的点击区域（至少 44px）

4. **优化相关工具区域**
   - 改进相关工具网格布局（第 205-228 行）
   - 优化工具图标的视觉表现
   - 改进工具名称的排版
   - 优化悬停效果和过渡动画
   - 确保移动端工具垂直堆叠，桌面端保持网格布局

5. **改进免责声明区域**
   - 优化免责声明的视觉表现（第 234-241 行）
   - 改进图标和文本的对齐
   - 优化背景色和边框效果
   - 确保在不同屏幕尺寸下都有良好的可读性

6. **优化整体间距和节奏**
   - 改进各个 section 之间的垂直间距
   - 确保页面底部与 Footer 之间有足够的空间
   - 优化容器宽度，确保在不同屏幕尺寸下都有良好的表现
   - 移除不必要的 min-h-screen，让 V4 Shell 处理页面高度

请直接完成 GOAL。

完成后重新读取目标文件并回复：

PAGE_BODY_UI_EDIT_COMPLETE
ACTUAL_CHANGED_FILES=src/app/(public)/business/page.tsx
COMPLETED_UI_IMPROVEMENTS=<至少三项具体改进>

如果目标文件无效，回复：

SELECTED_TARGET_INVALID
