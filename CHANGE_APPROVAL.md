# Change Approval Rules — jueshi.net / xixiong-saas

## Dashboard 核心用户资产区保护规则

> **v1.20.42.6.7 新增** — Dashboard 属于核心用户资产区。

1. **Dashboard 是核心用户资产区**
   - `/workspace/*` 是用户的第一触点，任何修改必须严格管控。
   - 以后任何 Dashboard 修改必须：
     1. 先创建 Git commit，明确修改范围
     2. 不得隐藏菜单（7 个菜单必须始终完整可见）
     3. 不得用空页面冒充恢复（必须有真实内容和清晰空状态）
     4. 必须提供 7 页面 + 移动端截图验收
     5. 未通过截图验收不得标记 VERIFIED

2. **截图验证完整菜单和 7 个子页面**
   - 每次 Dashboard 改动后，必须逐页截图验证 `/workspace`、`/workspace/tasks`、`/workspace/member`、`/workspace/documents`、`/workspace/company-profiles`、`/workspace/favorites`、`/workspace/settings`。
   - 截图必须包含 Sidebar 和主内容区。
   - 不允许仅凭 HTTP 状态码或构建通过就标记 VERIFIED。

2. **禁止通过隐藏菜单来规避坏页面**
   - 不允许将未完成模块从 Sidebar 中移除来"假装修复"。
   - 如果某模块暂时没有复杂功能，必须有正式页面和清晰空状态（CTA + 说明文字）。
   - 不允许 `href="#"` 死链。
   - 不允许多个菜单指向同一页面。

3. **React Error 排查要求**
   - 生产出现 Minified React Error 必须先在本地 dev 模式复现完整错误堆栈。
   - 重点排查：动态组件变量（必须大写开头 PascalCase）、import/export 混用、lucide-react 图标名不存在。
   - 修复后必须在 VPS 上 grep 确认修复代码已部署，不能仅信任本地 git status。

4. **Dashboard 验收必须截图**
   - 每次 Dashboard 改动后，必须逐页截图验证 `/workspace`、`/workspace/tasks`、`/workspace/member`、`/workspace/documents`、`/workspace/company-profiles`、`/workspace/favorites`、`/workspace/settings`。
   - 截图必须包含 Sidebar 和主内容区。
   - 不允许仅凭 HTTP 状态码或构建通过就标记 VERIFIED。
   - 不允许通过隐藏菜单或临时拼页方式"修复"。必须截图验收 7 个完整模块。

5. **版本发布门禁**
   - 同一 tag 名必须在本地和 VPS 指向相同 commit。
   - 发布前执行 release hygiene：git status clean、tag consistency、关键文件 md5 比对。
   - 禁止 dual-tag 情况。

6. **Canonical 去重规则（v1.20.42.6.8.1 修正）**
   - 以下旧版工具与现代工具功能重叠，**不得**在 /tools 中重复展示：
     - `commercial-invoice` → canonical: `commercial-invoice` (现代工具)
     - `quotation` → canonical: `quote-sheet` (现代工具)
     - `consolidation-inbound-receipt` → canonical: `inbound-receipt` (现代工具)
     - `label-maker` → canonical: `shipping-label` (现代工具，route 相同)
   - `shipping-mark`: 经确认为非重复工具，/tools/documents/shipping-mark 页面可用，已 upsert 到 Tool 表 active。
   - 任何新增工具必须检查 canonical map，禁止重复工具污染 /tools。

6. **登录态验证**
   - 必须用真实测试账号（user-test@jueshi.net、admin-test@jueshi.net）验证。
   - 未登录访问所有 /workspace/* 必须 307 跳转 /login。
   - admin 登录必须看到管理后台入口。

7. **Legacy Document Tool Events（v1.20.42.6.8.2）**
   - 旧版单据工具（/tools/documents/[type]）的保存/导出必须触发事件：
     - 保存草稿（localStorage）→ `Document_Save` with `saveMode: "localStorage"`, `source: "legacy_documents"`
     - PNG 导出 → `Document_Export` with `exportType: "png"`, `source: "legacy_documents"`
     - Word 导出 → `Document_Export` with `exportType: "word"`, `source: "legacy_documents"`
   - 事件写入 EventLog，即使保存失败也不影响保存操作。
   - Document_Save 和 Tool_Click/Tool_View 进入 ToolMetricDaily（views/clicks/saves）。
   - Document_Export 仅进入 EventLog，暂不进入 ToolMetricDaily。

8. **Homepage Document Tools Dynamicization（v1.20.42.6.8.2）**
   - `document-tools-section.tsx` 改为 Server Component，动态读取 Tool 表 `category=documents` 且 `isActive=true` 的工具。
   - 展示规则：现代工具优先（6 个），然后 legacy tools，最多显示 12 个。
   - DB 查询失败时显示安全空状态（6 个现代工具 fallback），不显示假数据。
   - 不破坏首页布局，不引入客户端 JS。

9. **Tool Center Chinese Search（v1.20.42.6.8.3）**
   - 面向海外华人的工具，搜索必须支持中文关键词，不得只支持英文 slug/name。
   - 使用 `src/lib/tool-search-aliases.ts` 维护 24 个工具的中文关键词 + 英文别名映射，不修改数据库结构。
   - `/tools?q=发票` 应命中 Commercial Invoice + Proforma Invoice。
   - 英文搜索必须完全回归（invoice, packing, sales 等不能变差）。

10. **Homepage Hero Search（v1.20.42.6.8.4）**
   - 首页 Hero 搜索框必须是功能组件（use client + onChange + onClick + onKeyDown），不得为死 UI。
   - 输入关键词 → `router.push(/tools?q=关键词)` → /tools 搜索结果页正确展示。
   - 任何首页布局调整不得破坏 Hero 搜索交互。
