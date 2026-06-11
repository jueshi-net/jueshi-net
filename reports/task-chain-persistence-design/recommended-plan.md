# Recommended Plan — 推荐方案

**版本**: v1.20.42.6.41
**日期**: 2026-06-11

---

## 推荐方案：B（新增 TaskChainDraft）+ 分阶段实施

### 推荐理由

1. **语义清晰**：任务链是独立概念，应有独立模型
2. **架构合理**：不污染现有 ToolDocumentDraft 系统
3. **支持匿名用户**：userId 可空，支持 localStorage → 后端过渡
4. **跨草稿关联**：可通过 taskChainId 关联多个 ToolDocumentDraft
5. **完整生命周期**：status / archivedAt / completedAt 字段齐全
6. **独立展示**：Workspace 可独立展示任务区

### 不推荐方案 A 的理由

- 语义不清（任务链 ≠ 工具草稿）
- 污染现有草稿列表
- 无法按字段查询
- 不支持匿名用户
- 无法关联后续草稿
- 长期维护成本高

### 不推荐方案 C（长期使用）的理由

- localStorage 数据不可靠
- 无法跨设备同步
- 用户体验缺口大
- 只是过渡方案，最终还是要做后端

---

## 分阶段实施计划

### Phase 1: v1.20.42.6.42 — localStorage 登录导入

**目标**：登录后检测 localStorage 任务链数据，提示导入

**范围**：
- 登录成功后检测 localStorage
- 弹窗提示「检测到未保存的任务数据，是否导入？」
- 用户确认 → 暂存到内存（等待 Phase 2 API）
- 用户拒绝 → 保留 localStorage

**不做**：
- 不做后端持久化
- 不新增 API
- 不新增模型

**验收标准**：
- 未登录用户使用任务链 → localStorage 存储
- 用户登录 → 弹窗提示导入
- 用户确认 → 数据暂存内存（控制台日志）
- 用户拒绝 → localStorage 保留

**预计工期**：0.5 周

---

### Phase 2: v1.20.42.6.43 — TaskChainDraft 模型 + API

**目标**：新增 TaskChainDraft 模型和 CRUD API

**范围**：

1. **Prisma Schema**：
```prisma
model TaskChainDraft {
  id                  String    @id @default(cuid())
  userId              String?   @map("user_id")
  sessionId           String?   @map("session_id")
  sourceTool          String    @map("source_tool")
  title               String?
  productName         String?   @map("product_name")
  hsCode              String?   @map("hs_code")
  productDescription  String?   @map("product_description")
  declaredValue       String?   @map("declared_value")
  currency            String?
  exchangeRate        String?   @map("exchange_rate")
  convertedValue      String?   @map("converted_value")
  originCountry       String?   @map("origin_country")
  destinationCountry  String?   @map("destination_country")
  postalCode          String?   @map("postal_code")
  addressText         String?   @map("address_text")
  shippingEstimate    String?   @map("shipping_estimate")
  nextStep            String?   @map("next_step")
  status              String    @default("draft")
  archivedAt          DateTime? @map("archived_at")
  completedAt         DateTime? @map("completed_at")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  @@index([userId])
  @@index([sessionId])
  @@index([status])
  @@map("task_chain_drafts")
}
```

2. **ToolDocumentDraft 新增字段**：
```prisma
model ToolDocumentDraft {
  // ... existing ...
  taskChainId String? @map("task_chain_id")
  @@index([taskChainId])
}
```

3. **API**：
- `GET /api/me/task-chains` — 列出任务链
- `POST /api/me/task-chains` — 创建任务链
- `GET /api/me/task-chains/[id]` — 获取单个
- `PUT /api/me/task-chains/[id]` — 更新
- `DELETE /api/me/task-chains/[id]` — 删除
- `POST /api/me/task-chains/import-local` — 从 localStorage 导入

4. **EventLog**：
- `task_chain_save_to_workspace` — 保存到工作台
- `task_chain_import_local` — 从本地导入
- `task_chain_archive` — 归档
- `task_chain_resume` — 继续任务

**不做**：
- 不做 Workspace UI
- 不做关联草稿展示

**验收标准**：
- Migration 成功执行
- API CRUD 正常
- 从 localStorage 导入成功
- EventLog 记录完整

**预计工期**：1 周

---

### Phase 3: v1.20.42.6.44 — Workspace UI + 关联草稿

**目标**：Workspace 展示任务链，支持继续任务，关联草稿展示

**范围**：

1. **Workspace 主页面**：
- 新增"我的任务"区域（与"单据历史"并列）
- 展示最近 5 个活跃任务
- 「查看全部」链接到 `/workspace/task-chains`

2. **任务链列表页**（`/workspace/task-chains`）：
- 任务列表（按状态过滤）
- 搜索
- 归档/删除
- 继续任务按钮

3. **任务链详情页**（`/workspace/task-chains/[id]`）（可选）：
- 任务上下文展示
- 关联草稿列表
- 继续任务按钮
- 归档/删除

4. **继续任务流程**：
- 点击「继续任务」→ 跳转到最后一个活跃工具
- URL 带 `?taskChainId=xxx`
- 工具页面检测 taskChainId → 从 API 加载上下文
- 填充空字段（不覆盖已有）

5. **关联草稿展示**：
- ToolDocumentDraft 创建时可关联 taskChainId
- Workspace 任务详情展示「已创建 N 个草稿」
- 草稿列表展示「属于任务 #xxx」

6. **权限控制**：
- 免费用户：5 个活跃任务
- 会员用户：50 个活跃任务
- 超出限制提示升级

**验收标准**：
- Workspace 主页面展示任务区
- 任务链列表页正常
- 继续任务流程通畅
- 关联草稿正确展示
- 权限控制生效

**预计工期**：1-1.5 周

---

## 最小实现路径

如果只能做最小实现，推荐：

1. **Phase 1**（6.42）：登录导入提示 — 0.5 周
2. **Phase 2**（6.43）：模型 + API — 1 周
3. **Phase 3 精简版**（6.44）：
   - Workspace 主页面新增任务区（只展示最近 3 个）
   - 继续任务按钮（跳转到工具页面）
   - 不做详情页
   - 不做关联草稿展示
   - 不做权限控制

**精简版总成本**：约 2 周

---

## 数据库变更

### 需要 Migration

| 变更 | 类型 | 影响 |
|---|---|---|
| 新增 `task_chain_drafts` 表 | CREATE TABLE | 无数据迁移 |
| ToolDocumentDraft 新增 `task_chain_id` | ALTER TABLE | 可空，无数据迁移 |

### Migration 脚本（预计）

```sql
-- 新增 TaskChainDraft 表
CREATE TABLE "task_chain_drafts" (
  "id" TEXT NOT NULL,
  "user_id" TEXT,
  "session_id" TEXT,
  "source_tool" TEXT NOT NULL,
  "title" TEXT,
  "product_name" TEXT,
  "hs_code" TEXT,
  "product_description" TEXT,
  "declared_value" TEXT,
  "currency" TEXT,
  "exchange_rate" TEXT,
  "converted_value" TEXT,
  "origin_country" TEXT,
  "destination_country" TEXT,
  "postal_code" TEXT,
  "address_text" TEXT,
  "shipping_estimate" TEXT,
  "next_step" TEXT,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "archived_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "task_chain_drafts_pkey" PRIMARY KEY ("id")
);

-- 索引
CREATE INDEX "task_chain_drafts_user_id_idx" ON "task_chain_drafts"("user_id");
CREATE INDEX "task_chain_drafts_session_id_idx" ON "task_chain_drafts"("session_id");
CREATE INDEX "task_chain_drafts_status_idx" ON "task_chain_drafts"("status");

-- ToolDocumentDraft 新增字段
ALTER TABLE "tool_document_drafts" ADD COLUMN "task_chain_id" TEXT;
CREATE INDEX "tool_document_drafts_task_chain_id_idx" ON "tool_document_drafts"("task_chain_id");
```

### 数据迁移

**不需要数据迁移**。新表为空，新增字段可空。

---

## Auth / Workspace 风险

### Auth 风险

| 风险 | 等级 | 缓解 |
|---|---|---|
| Session 劫持 | 🟢 低 | 不改 Auth 逻辑 |
| 权限绕过 | 🟢 低 | API 层校验 userId |
| 匿名用户冒充 | 🟡 中 | sessionId 需验证 |

### Workspace 风险

| 风险 | 等级 | 缓解 |
|---|---|---|
| 首屏加载变慢 | 🟢 低 | 新增查询数据量小 |
| 展示混乱 | 🟢 低 | 独立区域，不影响现有 |
| 用户困惑 | 🟢 低 | 文案明确「我的任务」 |

---

## Quote Sheet / Commercial Invoice 风险

| 风险 | 等级 | 缓解 |
|---|---|---|
| draftId 恢复失败 | 🟢 无 | 不改 use-draft-loader.ts |
| 保存逻辑变更 | 🟢 无 | 不改核心保存逻辑 |
| 导出逻辑变更 | 🟢 无 | 不改导出逻辑 |
| 数据污染 | 🟢 无 | taskChainId 可空，不影响现有 |

**结论**：对 Quote Sheet / Commercial Invoice 零影响。

---

## localStorage 与后端同步风险

| 风险 | 等级 | 缓解 |
|---|---|---|
| 重复导入 | 🟡 中 | 导入后清除 localStorage |
| 数据冲突 | 🟡 中 | 后端优先，覆盖本地 |
| 多设备不同步 | 🔴 高 | Phase 2 后使用后端数据 |
| 清除缓存丢失 | 🔴 高 | 提示用户保存到工作台 |

### 同步策略

1. **导入后清除**：localStorage → 后端成功后，立即 `clearTaskChain()`
2. **后端优先**：如果后端有数据，忽略 localStorage
3. **冲突处理**：后端数据为准，本地数据丢弃
4. **提示用户**：「建议保存到工作台，避免数据丢失」

---

## 权限与会员策略

### 保存上限

| 用户类型 | 活跃任务上限 | 已归档上限 |
|---|---|---|
| 未登录 | 0（仅 localStorage） | 0 |
| 免费用户 | 5 | 20 |
| 会员用户 | 50 | 200 |
| 管理员 | 无限 | 无限 |

### 权益差异

| 功能 | 免费用户 | 会员用户 |
|---|---|---|
| 保存任务链 | ✅（5 个） | ✅（50 个） |
| 跨设备同步 | ✅ | ✅ |
| 关联草稿 | ✅ | ✅ |
| 导出资料包 | ❌ | ✅ |
| PDF 打印 | ❌ | ✅ |
| 管理员查看 | - | - |

---

## 数据保留策略

| 状态 | 保留期限 | 处理 |
|---|---|---|
| draft | 90 天无更新 → archived | 定时任务自动归档 |
| active | 无限制 | 用户活跃使用 |
| completed | 180 天 | 定时任务自动归档 |
| archived | 365 天 | 定时任务自动删除 |

### 定时任务（未来）

```typescript
// cron: 每天凌晨 3 点执行
// 1. draft 超过 90 天 → archived
// 2. completed 超过 180 天 → archived
// 3. archived 超过 365 天 → 删除
```

---

## 回滚方案

### Phase 1 回滚

- 删除登录导入提示组件
- 无后端变更，无需回滚

### Phase 2 回滚

- 删除 `task_chain_drafts` 表
- 删除 ToolDocumentDraft.task_chain_id 字段
- 删除相关 API
- 保留 EventLog 数据（不影响）

### Phase 3 回滚

- 隐藏 Workspace 任务区
- 删除任务链列表页
- 保留后端数据（不删除）

### 回滚影响

- **用户数据**：已保存的任务链数据会丢失（Phase 2+）
- **关联草稿**：ToolDocumentDraft.taskChainId 变为孤立数据
- **EventLog**：保留，不影响

---

## 后续版本拆分建议

| 版本 | 目标 | 工期 |
|---|---|---|
| v1.20.42.6.42 | localStorage 登录导入 | 0.5 周 |
| v1.20.42.6.43 | TaskChainDraft 模型 + API | 1 周 |
| v1.20.42.6.44 | Workspace UI + 关联草稿 | 1-1.5 周 |
| v1.20.42.6.45 | 权限控制 + 会员权益 | 0.5 周 |
| v1.20.42.6.46 | 导出资料包 + PDF | 1 周 |
| v1.20.42.6.47 | 定时归档 + 数据保留 | 0.5 周 |

**总计**：约 5 周（可根据优先级调整）

---

## 是否可以进入 v1.20.42.6.42

**可以进入，但需用户确认。**

确认事项：
1. ✅ 推荐方案 B（新增 TaskChainDraft）
2. ✅ 分阶段实施（Phase 1 → 2 → 3）
3. ✅ Phase 1 只做登录导入提示，不做后端
4. ✅ Phase 2 需要 migration（用户需确认）
5. ✅ Phase 3 需要 Workspace UI 改动

**等待用户确认后，方可进入 6.42。**
