# Current System Audit

**版本**: v1.20.42.6.41
**日期**: 2026-06-11
**审查范围**: Prisma schema, Workspace, ToolDocument, Task Chain, Document History

---

## 一、Prisma Schema 关键模型

### 1.1 ToolDocumentDraft（核心草稿系统）

```prisma
model ToolDocumentDraft {
  id               String              @id @default(cuid())
  userId           String              @map("user_id")
  companyProfileId String?             @map("company_profile_id")
  toolKey          String              @map("tool_key")
  title            String
  dataJson         String              @map("data_json")      // JSON 字符串
  previewJson      String?             @map("preview_json")
  createdAt        DateTime            @default(now())
  updatedAt        DateTime            @updatedAt

  history ToolDocumentHistory[]

  @@index([userId])
  @@index([toolKey])
  @@index([companyProfileId])
  @@map("tool_document_drafts")
}
```

**toolKey 枚举值（25+）**：
- `quote_sheet` / `commercial_invoice` / `proforma_invoice` / `packing_list`
- `shipping_label` / `inbound_receipt` / `handover_note` / `debit_note`
- `video_script_sop` / `sales_contract` / `booking_instruction`
- `customs_declaration_authorization` / `delivery_note` / `freight_statement`
- `consolidation_inbound_receipt` / `consolidation_packing_list`
- `express_declaration` / `quotation` / `shipping_instruction`
- `trucking_dispatch_order` / `shipping_mark` / `container_loading_list`
- `return_packing_list` / `certificate_of_origin_template`
- `fumigation_certificate_template` / `letter_of_credit_info_sheet`
- `label_maker`

**关键特征**：
- `dataJson` 是 **字符串**（非 Json 类型），存储完整表单 JSON
- `title` 必填，至少 2 字
- 关联 `UserCompanyProfile`（可选）
- 有完整 history 追踪（ToolDocumentHistory）

### 1.2 ToolDocumentHistory（草稿历史）

```prisma
model ToolDocumentHistory {
  id           String   @id @default(cuid())
  userId       String
  documentId   String              // 关联 ToolDocumentDraft.id
  snapshotJson String              // 快照 JSON
  action       String              // create / update / restore / export
  createdAt    DateTime @default(now())
}
```

### 1.3 DocumentHistory（单据历史 - 独立系统）

```prisma
model DocumentHistory {
  id           String   @id @default(cuid())
  userId       String
  documentType String              // pi / ci / packing-list / label...
  documentData String   @db.Text   // JSON string
  documentNo   String?
  createdAt    DateTime @default(now())
}
```

**注意**：这是独立于 ToolDocumentDraft 的系统，用于 Workspace 首页"单据历史"展示和"复用"功能。

### 1.4 UserCompanyProfile（公司资料）

```prisma
model UserCompanyProfile {
  id              String   @id @default(cuid())
  userId          String
  profileName     String
  companyName     String
  companyNameEn   String?
  contactName     String?
  phone           String?
  email           String?
  website         String?
  address         String?
  cityPostal      String?
  taxId           String?
  bankCnyInfo     String?
  bankUsdInfo     String?
  defaultCurrency String   @default("USD")
  logoDataUrl     String?   // base64, max ~500KB
  logoText        String?
  isDefault       Boolean  @default(false)
}
```

### 1.5 EventLog（匿名事件追踪）

```prisma
model EventLog {
  id        String   @id @default(cuid())
  eventType String              // tool_click / tool_copy / Document_Save / task_chain_*
  toolName  String?
  action    String?             // JSON 字符串
  path      String?
  sessionId String?
  createdAt DateTime @default(now())
}
```

### 1.6 Workspace（团队工作区 - 非个人工作台）

```prisma
model Workspace {
  id          String   @id @default(cuid())
  name        String
  description String?
  ownerId     String?
  isPublic    Boolean  @default(false)
  slug        String   @unique
}
```

**注意**：这个 Workspace 模型是团队共享空间概念，与用户的个人工作台（/workspace）无关。个人工作台页面直接查询多个表聚合展示。

---

## 二、现有 API 接口

### 2.1 Tool Documents API

| 方法 | 路径 | 功能 |
|---|---|---|
| GET | `/api/me/tool-documents` | 列出草稿（可过滤 toolKey） |
| POST | `/api/me/tool-documents` | 创建草稿 |
| GET | `/api/me/tool-documents/[id]` | 获取单个草稿 |
| PUT | `/api/me/tool-documents/[id]` | 更新草稿 |
| DELETE | `/api/me/tool-documents/[id]` | 删除草稿 |
| GET | `/api/me/tool-documents/[id]/history` | 获取历史版本 |
| POST | `/api/me/tool-documents/[id]/restore` | 恢复历史版本 |

### 2.2 Company Profiles API

| 方法 | 路径 | 功能 |
|---|---|---|
| GET | `/api/me/company-profiles` | 列出公司资料 |
| POST | `/api/me/company-profiles` | 创建公司资料 |
| GET | `/api/me/company-profiles/[id]` | 获取单个 |
| PUT | `/api/me/company-profiles/[id]` | 更新 |
| DELETE | `/api/me/company-profiles/[id]` | 删除 |

---

## 三、Workspace 页面现状

### 3.1 主页面（/workspace）

展示内容：
- 欢迎信息 + 会员等级
- 统计卡片：单据数 / 收藏数 / 公司资料数 / 待办任务数
- 我的成长：等级 / 成长值 / 积分 / 勋章
- 常用工具/网址
- 最近备忘
- 单据历史（DocumentHistory 表）
- 快速入口
- 更多服务（含"任务链"标记为 **规划中**）

### 3.2 子页面

| 路径 | 功能 |
|---|---|
| `/workspace/documents` | 草稿列表（ToolDocumentDraft） |
| `/workspace/favorites` | 收藏管理 |
| `/workspace/company-profiles` | 公司资料管理 |
| `/workspace/memos` | 备忘录 |
| `/workspace/tasks` | 待办任务 |
| `/workspace/member` | 会员中心 |
| `/workspace/notifications` | 通知中心 |
| `/workspace/settings` | 设置 |

### 3.3 草稿中心（/workspace/documents）

功能：
- 草稿列表（按 toolKey 过滤）
- 搜索
- 分类筛选
- 删除草稿
- 跳转到对应工具编辑

**缺失**：
- 无任务链草稿展示
- 无"继续任务"入口
- 无跨工具关联展示

---

## 四、Task Chain 现状

### 4.1 数据层（src/lib/task-chain.ts）

- 存储：localStorage
- Key：`jueshi.taskChain.shippingMvp`
- 接口：`TaskChainContext`（15 个字段）
- 函数：`getTaskChain` / `saveTaskChain` / `clearTaskChain` / `hasTaskChainData`

### 4.2 UI 层（src/components/tools/task-chain-next-step.tsx）

- 卡片标题："跨境发货下一步"
- 上下文摘要展示
- 下一步按钮（最多 3 个）
- "保存到工作台"按钮
  - 未登录 → 弹窗提示登录
  - 已登录 → 弹窗提示"即将开放"
- 清除数据按钮
- Toast 状态反馈

### 4.3 预填横幅（/tools/documents/[type]）

- 检测任务链数据
- 显示字段摘要
- 使用/暂不使用/清除 三个按钮
- 只填空字段，不覆盖

### 4.4 EventLog 覆盖

7 种事件已全部实现：
- `task_chain_save_context`
- `task_chain_next_click`
- `task_chain_clear`
- `task_chain_prefill_accept`
- `task_chain_prefill_reject`
- `task_chain_workspace_click`
- `task_chain_workspace_login_prompt`

---

## 五、草稿恢复机制

### 5.1 use-draft-loader.ts

```typescript
export function useDraftLoader(
  getDraftId: () => string | null,
  loadDraftData: (dataJson: string) => void
)
```

- 从 URL 参数获取 `draftId`
- 调用 `/api/me/tool-documents/${draftId}` 获取草稿
- 调用 `loadDraftData(dataJson)` 填充表单
- 防重复加载（loadedDraftIdRef）

### 5.2 各工具集成

- Quote Sheet：通过 `?draftId=xxx` 加载草稿
- Commercial Invoice：通过 `?draftId=xxx` 加载草稿
- 其他工具：尚未集成草稿系统

---

## 六、关键发现

### 6.1 ToolDocumentDraft 能力边界

**优势**：
- 成熟的 CRUD API
- 完整的版本历史追踪
- 支持公司资料关联
- Workspace UI 已有草稿列表

**限制**：
- `toolKey` 是字符串，无枚举约束
- `dataJson` 是字符串，无法直接查询内部字段
- 必须登录（userId 必填）
- 无跨草稿关联机制
- 无"任务"或"工作流"概念

### 6.2 任务链 vs 工具草稿的本质差异

| 维度 | 工具草稿 | 任务链 |
|---|---|---|
| 生命周期 | 单个工具的表单数据 | 跨工具的上下文传递 |
| 数据范围 | 完整表单 JSON | 部分字段摘要 |
| 关联关系 | 独立 | 可能关联多个草稿 |
| 用户身份 | 必须登录 | 支持匿名用户 |
| 恢复方式 | draftId → 完整表单 | 上下文 → 填空字段 |
| 展示位置 | 工具编辑页 | 工具结果页 |

### 6.3 Workspace 页面缺口

- 无任务链展示区域
- 无"继续任务"入口
- 无跨工具关联视图
- "任务链"已标记为"规划中"

---

## 七、审计结论

1. **ToolDocumentDraft 可复用但有限制**：可以存储任务链数据，但缺乏跨草稿关联和匿名用户支持。
2. **需要新的关联机制**：任务链需要贯穿多个 ToolDocumentDraft 的能力。
3. **Workspace 需要新区域**：需要为任务链添加专门的展示和入口。
4. **匿名用户是刚需**：当前 localStorage 方案支持匿名，持久化方案需考虑。
