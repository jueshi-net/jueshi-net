# Options Comparison — 三方案对比

**版本**: v1.20.42.6.41
**日期**: 2026-06-11

---

## 方案 A：复用 ToolDocumentDraft

### 特点

- 不新增数据库表
- 将任务链作为一种特殊 ToolDocumentDraft
- `toolKey = "task_chain_shipping"`
- `dataJson` 存储 TaskChainContext JSON
- Workspace 复用现有草稿列表展示

### 需要改动的代码

| 文件 | 改动 |
|---|---|
| `src/components/tools/task-chain-next-step.tsx` | "保存到工作台"调用 `/api/me/tool-documents` POST |
| `src/app/(workspace)/workspace/documents/documents-client-inner.tsx` | 过滤 `toolKey = "task_chain_*"` 单独展示 |
| `src/app/(workspace)/workspace/page.tsx` | 新增"任务链草稿"统计卡片 |

### 风险评估

| 风险 | 等级 | 说明 |
|---|---|---|
| 污染现有草稿列表 | 🔴 高 | 任务链与工具草稿混在一起 |
| Quote Sheet 回归 | 🟡 中 | 不改核心逻辑，但列表可能混淆 |
| 无法按字段查询 | 🔴 高 | dataJson 是字符串，无法过滤 |
| 无匿名用户支持 | 🔴 高 | ToolDocumentDraft.userId 必填 |
| 无跨草稿关联 | 🔴 高 | 无法关联后续创建的 CI/Quote 草稿 |
| 无状态管理 | 🟡 中 | 无 status 字段，无法区分 active/archived |

### 避免 Quote Sheet 回归

- 不修改 `use-draft-loader.ts`
- 不修改 Quote Sheet 保存/恢复逻辑
- 只在列表展示层过滤

### 优点

- ✅ 零 migration
- ✅ 零 schema 变更
- ✅ 复用现有 API
- ✅ 最快实现

### 缺点

- ❌ 语义不清（任务链 ≠ 工具草稿）
- ❌ 污染现有草稿列表
- ❌ 无法按字段查询
- ❌ 不支持匿名用户
- ❌ 无法关联后续草稿
- ❌ 无状态管理
- ❌ Workspace 展示混乱

---

## 方案 B：新增 TaskChainDraft 模型

### 特点

- 新增独立模型 `TaskChainDraft`
- 任务链拥有独立生命周期
- 可关联多个 ToolDocumentDraft
- 更像工作流系统

### 需要新增的字段

```prisma
model TaskChainDraft {
  id                  String   @id @default(cuid())
  userId              String?  @map("user_id")        // 可空（匿名用户）
  sessionId           String?  @map("session_id")     // 匿名用户标识
  
  // 任务链数据
  sourceTool          String   @map("source_tool")    // 来源工具
  productName         String?  @map("product_name")
  hsCode              String?  @map("hs_code")
  productDescription  String?  @map("product_description")
  declaredValue       String?  @map("declared_value")
  currency            String?
  exchangeRate        String?  @map("exchange_rate")
  convertedValue      String?  @map("converted_value")
  originCountry       String?  @map("origin_country")
  destinationCountry  String?  @map("destination_country")
  postalCode          String?  @map("postal_code")
  addressText         String?  @map("address_text")
  shippingEstimate    String?  @map("shipping_estimate")
  nextStep            String?  @map("next_step")
  
  // 元数据
  status              String   @default("draft")      // draft / active / completed / archived
  title               String?                         // 自动/手动标题
  archivedAt          DateTime? @map("archived_at")
  completedAt         DateTime? @map("completed_at")
  
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")
  
  @@index([userId])
  @@index([sessionId])
  @@index([status])
  @@index([createdAt])
  @@map("task_chain_drafts")
}
```

同时需要在 ToolDocumentDraft 中新增：

```prisma
model ToolDocumentDraft {
  // ... existing fields ...
  taskChainId String? @map("task_chain_id")  // 关联任务链
  @@index([taskChainId])
}
```

### 需要新增的 API

| 方法 | 路径 | 功能 |
|---|---|---|
| GET | `/api/me/task-chains` | 列出任务链 |
| POST | `/api/me/task-chains` | 创建任务链 |
| GET | `/api/me/task-chains/[id]` | 获取单个 |
| PUT | `/api/me/task-chains/[id]` | 更新 |
| DELETE | `/api/me/task-chains/[id]` | 删除 |
| POST | `/api/me/task-chains/[id]/archive` | 归档 |
| POST | `/api/me/task-chains/import-local` | 从 localStorage 导入 |

### 需要新增的 Workspace UI

| 路径 | 功能 |
|---|---|
| `/workspace` 主页面 | 新增"我的任务"区域 |
| `/workspace/task-chains` | 任务链列表页 |
| `/workspace/task-chains/[id]` | 任务链详情页（可选） |

### 风险评估

| 风险 | 等级 | 说明 |
|---|---|---|
| Migration 风险 | 🟡 中 | 需要新增表 + 修改 ToolDocumentDraft |
| Workspace 首屏加载 | 🟢 低 | 新增查询，但数据量小 |
| Auth session 风险 | 🟢 低 | 不改 Auth 逻辑 |
| 数据污染 | 🟢 低 | 独立模型，不污染现有 |
| 维护复杂度 | 🟡 中 | 新增一套 API + UI |

### 为什么不能先复用 ToolDocument

- 语义不同（任务链 ≠ 工具草稿）
- 需要独立生命周期（status / archivedAt / completedAt）
- 需要支持匿名用户（userId 可空）
- 需要跨草稿关联（taskChainId 反向引用）
- 需要独立展示（Workspace 任务区 vs 单据区）

### 优点

- ✅ 语义清晰
- ✅ 独立生命周期
- ✅ 支持匿名用户
- ✅ 可关联后续草稿
- ✅ 独立展示
- ✅ 可按字段查询
- ✅ 不污染现有系统

### 缺点

- ❌ 需要 migration
- ❌ 需要新增 API
- ❌ 需要新增 Workspace UI
- ❌ 开发成本较高（约 2-3 周）

---

## 方案 C：短期 localStorage + 登录导入

### 特点

- 继续保持 localStorage
- 登录后提示"导入到工作台"
- 后端暂不持久化（或暂存到 ToolDocumentDraft）
- 作为过渡方案

### 实现方式

**阶段 1（6.42）**：登录检测 + 导入提示

```typescript
// src/components/auth/login-success-handler.tsx
useEffect(() => {
  const taskChain = getTaskChain();
  if (taskChain && hasTaskChainData()) {
    setShowImportPrompt(true);
  }
}, []);

const handleImport = async () => {
  // 调用 API 保存到后端
  await fetch('/api/me/task-chains/import-local', {
    method: 'POST',
    body: JSON.stringify(taskChain),
  });
  clearTaskChain();
  setShowImportPrompt(false);
};
```

**阶段 2（6.43-6.44）**：后端持久化（复用方案 A 或升级到方案 B）

### 适合多长时间

- **最多 4 周**（2 个版本周期）
- 超过 4 周必须升级到后端持久化
- 原因：localStorage 数据不可靠（清除缓存/换设备丢失）

### 用户体验缺口

| 场景 | 问题 |
|---|---|
| 清除浏览器缓存 | 任务链数据丢失 |
| 换设备/浏览器 | 无法同步 |
| 无痕模式 | 关闭即丢失 |
| 多设备使用 | 数据不一致 |
| 长期保存 | 无法实现 |

### 何时必须升级到后端持久化

- 用户反馈「数据丢了」
- 会员用户要求跨设备同步
- 需要关联多个草稿
- 需要任务状态管理

### 风险评估

| 风险 | 等级 | 说明 |
|---|---|---|
| 数据丢失 | 🔴 高 | localStorage 不可靠 |
| 用户期望落差 | 🟡 中 | 「保存到工作台」但实际没保存 |
| 同步冲突 | 🟢 低 | 暂无后端数据 |
| 过渡期混乱 | 🟡 中 | 需要明确告知用户数据在哪 |

### 优点

- ✅ 零后端改动（阶段 1）
- ✅ 最快实现
- ✅ 可先验证用户需求
- ✅ 低风险

### 缺点

- ❌ 数据不可靠
- ❌ 无法跨设备
- ❌ 用户体验缺口大
- ❌ 只是过渡方案，最终还是要做后端

---

## 三方案对比表

| 维度 | 方案 A: 复用 ToolDocument | 方案 B: 新增 TaskChainDraft | 方案 C: localStorage + 导入 |
|---|---|---|---|
| **Migration** | ❌ 不需要 | ✅ 需要 | ❌ 不需要（阶段 1） |
| **新增 API** | ❌ 不需要 | ✅ 需要 7 个 | ❌ 不需要（阶段 1） |
| **新增 UI** | 🟡 小改 | ✅ 新增页面 | 🟡 弹窗提示 |
| **语义清晰度** | 🔴 差 | 🟢 好 | 🟡 中 |
| **匿名用户支持** | 🔴 不支持 | 🟢 支持 | 🟢 支持 |
| **跨草稿关联** | 🔴 不支持 | 🟢 支持 | 🔴 不支持 |
| **状态管理** | 🔴 无 | 🟢 完整 | 🔴 无 |
| **数据可靠性** | 🟢 高 | 🟢 高 | 🔴 低 |
| **跨设备同步** | 🟢 支持 | 🟢 支持 | 🔴 不支持 |
| **开发成本** | 🟢 1 周 | 🟡 2-3 周 | 🟢 0.5 周 |
| **维护成本** | 🟡 中 | 🟡 中 | 🟢 低 |
| **污染现有系统** | 🔴 高 | 🟢 无 | 🟢 无 |
| **Quote Sheet 回归** | 🟡 中 | 🟢 无 | 🟢 无 |
| **可扩展性** | 🔴 差 | 🟢 好 | 🔴 差 |
| **用户体验** | 🟡 中 | 🟢 好 | 🔴 差 |

---

## 推荐排序

### 第一推荐：方案 B（新增 TaskChainDraft）

**理由**：
- 语义最清晰
- 架构最合理
- 长期可维护
- 不污染现有系统
- 支持所有需求场景

**代价**：
- 需要 migration
- 开发成本 2-3 周

### 第二推荐：方案 C → 方案 B（渐进式）

**理由**：
- 先用方案 C 验证需求（0.5 周）
- 收集用户反馈后升级到方案 B
- 降低初期投入风险

**代价**：
- 过渡期用户体验差
- 最终还是要做方案 B

### 第三推荐：方案 A（复用 ToolDocument）

**理由**：
- 最快实现
- 零 migration

**不推荐原因**：
- 语义不清
- 污染现有系统
- 无法扩展
- 长期维护成本高

---

## 结论

**推荐方案 B**，但可分阶段实施：

1. **6.42**：方案 C 阶段 1（登录导入提示）— 0.5 周
2. **6.43**：方案 B 阶段 1（新增模型 + API）— 1 周
3. **6.44**：方案 B 阶段 2（Workspace UI + 关联草稿）— 1 周

总成本：约 2.5 周，但每阶段可独立验收。
