# Save-to-Workspace 规划文档

**版本**: v1.20.42.6.40
**状态**: 规划中（暂不实施）
**创建时间**: 2026-06-11

---

## 一、为什么不能现在直接做数据库持久化

### 1.1 当前阶段限制
- 本轮（6.40）明确禁止新增 Prisma schema / migration
- 本轮禁止修改 Workspace / Dashboard 业务逻辑
- 任务链 MVP 刚完成验收，需先稳定 UX 再考虑持久化

### 1.2 技术依赖
- 需要先确定数据模型（新表 or 复用现有表）
- 需要设计 API 接口（CRUD）
- 需要处理并发冲突（多设备同步）
- 需要考虑数据迁移（现有 localStorage 数据）

### 1.3 产品验证
- 当前 localStorage 方案已能满足基本需求
- 需要先验证用户使用频率和场景
- 需要收集用户反馈再决定持久化优先级

---

## 二、未来需要保存哪些字段

### 2.1 核心字段（来自 TaskChainContext）

| 字段 | 类型 | 说明 |
|---|---|---|
| productName | string | 商品名称 |
| hsCode | string | HS 编码 |
| productDescription | string | 商品描述（英文） |
| declaredValue | string | 申报价值 |
| currency | string | 币种 |
| exchangeRate | string | 汇率 |
| convertedValue | string | 换算后金额 |
| originCountry | string | 原产国 |
| destinationCountry | string | 目的国 |
| postalCode | string | 邮编 |
| addressText | string | 地址文本 |
| shippingEstimate | string | 运费估算 |
| nextStep | string | 下一步路径 |

### 2.2 元数据字段

| 字段 | 类型 | 说明 |
|---|---|---|
| sourceTool | string | 来源工具 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |
| status | enum | draft / active / completed / archived |
| userId | string | 用户 ID（关联 User 表） |
| sessionId | string | 会话 ID（用于匿名用户临时存储） |

---

## 三、是否需要新模型

### 3.1 方案 A：新建 TaskChainDraft 模型（推荐）

```prisma
model TaskChainDraft {
  id                  String   @id @default(cuid())
  userId              String?  // 关联 User（可空，支持匿名用户）
  sessionId           String?  // 匿名用户会话 ID
  
  // 任务链数据
  sourceTool          String
  productName         String?
  hsCode              String?
  productDescription  String?
  declaredValue       String?
  currency            String?
  exchangeRate        String?
  convertedValue      String?
  originCountry       String?
  destinationCountry  String?
  postalCode          String?
  addressText         String?
  shippingEstimate    String?
  nextStep            String?
  
  // 关联单据
  commercialInvoiceId String?  // 关联 Commercial Invoice draft
  quotationId         String?  // 关联 Quotation draft
  
  // 元数据
  status              String   @default("draft") // draft / active / completed / archived
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@index([userId])
  @@index([sessionId])
  @@index([status])
}
```

**优点**：
- 独立模型，不影响现有表
- 支持匿名用户（通过 sessionId）
- 可关联 Commercial Invoice / Quotation 草稿
- 状态管理清晰

**缺点**：
- 新增一张表
- 需要新增 migration

### 3.2 方案 B：复用 ToolDocumentDraft 模型

现有 `ToolDocumentDraft` 模型已有 `toolKey` / `data` / `userId` 字段。

**优点**：
- 不新增表
- 复用现有基础设施

**缺点**：
- `data` 字段是 JSON，查询不便
- 不支持匿名用户
- 与现有工具草稿混在一起，管理复杂

### 3.3 推荐方案

**方案 A（新建 TaskChainDraft）**，理由：
- 任务链是独立概念，应有独立模型
- 支持匿名用户是刚需
- 关联单据草稿是未来需求
- 新增一张表的成本可控

---

## 四、与现有 ToolDocument 的关系

### 4.1 当前 ToolDocument 模型

```prisma
model ToolDocumentDraft {
  id        String   @id @default(cuid())
  userId    String
  toolKey   String   // 如 "commercial-invoice", "quotation"
  data      Json     // 表单数据
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 4.2 关系设计

```
TaskChainDraft (1) ←→ (0..1) ToolDocumentDraft (commercialInvoiceId)
TaskChainDraft (1) ←→ (0..1) ToolDocumentDraft (quotationId)
```

- 一个任务链可以关联 0 或 1 个 Commercial Invoice 草稿
- 一个任务链可以关联 0 或 1 个 Quotation 草稿
- 任务链是"上下文"，单据草稿是"产出物"

### 4.3 数据流

```
用户在 HS 编码页查询 → 保存 TaskChainDraft (productName, hsCode)
  ↓
用户点击"填入商业发票" → 跳转 Commercial Invoice 页
  ↓
用户填写表单 → 保存 ToolDocumentDraft (关联 taskChainDraftId)
  ↓
任务链状态更新 nextStep = "shipping-calculator"
```

---

## 五、与 Workspace 的展示关系

### 5.1 Workspace 页面结构

```
/workspace
  ├── 我的任务链 (新增)
  │   ├── 任务链列表
  │   └── 任务链详情
  ├── 我的单据
  ├── 收藏夹
  └── ...
```

### 5.2 任务链列表页

展示字段：
- 商品名称 / HS 编码
- 来源工具
- 创建时间
- 状态（进行中 / 已完成 / 已归档）
- 关联单据数量

### 5.3 任务链详情页

展示内容：
- 任务链上下文（所有字段）
- 关联单据列表（可跳转）
- 操作按钮：继续填写 / 归档 / 删除

---

## 六、与会员体系的关系

### 6.1 权限设计

| 用户类型 | 任务链数量限制 | 持久化 | 跨设备同步 |
|---|---|---|---|
| 未登录 | 0（仅 localStorage） | ❌ | ❌ |
| 免费用户 | 5 条 | ✅ | ✅ |
| 会员用户 | 无限 | ✅ | ✅ |
| 管理员 | 无限 | ✅ | ✅ |

### 6.2 升级路径

- 未登录用户点击"保存到工作台" → 提示登录
- 免费用户达到上限 → 提示升级会员
- 会员用户 → 无限制

---

## 七、数据保留策略

### 7.1 匿名用户（localStorage）
- 保留时间：30 天
- 清理策略：浏览器清除缓存时删除
- 迁移策略：登录后提示"是否将本地数据同步到账户？"

### 7.2 登录用户（数据库）
- 保留时间：永久（除非用户手动删除）
- 归档策略：超过 90 天未更新 → 自动归档
- 清理策略：用户可手动删除

### 7.3 数据迁移

```
localStorage → 数据库（登录时）
  ↓
检查是否有同名任务链
  ↓
有 → 提示"是否覆盖？"
  ↓
无 → 自动创建
```

---

## 八、隐私风险

### 8.1 敏感数据
- 商品名称：可能包含商业机密
- HS 编码：可能暴露业务方向
- 申报价值：涉及财务信息
- 地址文本：可能包含个人信息

### 8.2 风险缓解
- 数据加密存储（AES-256）
- 访问控制（仅用户本人可访问）
- 审计日志（记录访问行为）
- 用户可手动删除

### 8.3 合规要求
- GDPR：用户有权删除数据
- CCPA：用户有权知道数据用途
- 隐私政策：需明确说明数据收集范围

---

## 九、不同工具如何恢复上下文

### 9.1 恢复流程

```
用户进入工具页
  ↓
检查 URL 参数 (?taskChainId=xxx)
  ↓
有 → 从数据库加载 TaskChainDraft
  ↓
无 → 检查 localStorage
  ↓
有 → 从 localStorage 加载
  ↓
无 → 空状态
```

### 9.2 各工具恢复逻辑

| 工具 | 恢复字段 | 恢复方式 |
|---|---|---|
| HS 编码 | productName | 自动填入搜索框 |
| 汇率换算 | declaredValue, currency | 自动填入金额和币种 |
| 邮编查询 | postalCode, destinationCountry | 自动填入邮编和国家 |
| 地址格式化 | addressText, postalCode | 自动填入地址字段 |
| 运费计算 | shippingEstimate | 显示历史估算 |
| Commercial Invoice | productName, hsCode, declaredValue | 自动填入表单 |
| Quotation | declaredValue, currency | 自动填入金额和币种 |

---

## 十、Commercial Invoice / Quotation 草稿如何关联任务链

### 10.1 关联方式

```prisma
model ToolDocumentDraft {
  // ... 现有字段
  taskChainDraftId String?  // 新增：关联任务链
  @@index([taskChainDraftId])
}
```

### 10.2 关联流程

```
用户在 Commercial Invoice 页填写表单
  ↓
点击"保存草稿"
  ↓
检查是否有当前任务链
  ↓
有 → 创建 ToolDocumentDraft (taskChainDraftId = 当前任务链 ID)
  ↓
无 → 创建 ToolDocumentDraft (taskChainDraftId = null)
```

### 10.3 查询关联

```typescript
// 查询任务链关联的单据
const invoices = await prisma.toolDocumentDraft.findMany({
  where: {
    taskChainDraftId: taskChainId,
    toolKey: 'commercial-invoice'
  }
});
```

---

## 十一、推荐下一步最小实现方案

### 11.1 Phase 1：数据模型 + API（1-2 周）

- 新增 TaskChainDraft 模型
- 新增 API：
  - POST /api/task-chains（创建）
  - GET /api/task-chains（列表）
  - GET /api/task-chains/[id]（详情）
  - PATCH /api/task-chains/[id]（更新）
  - DELETE /api/task-chains/[id]（删除）
- 数据库 migration

### 11.2 Phase 2：前端集成（1 周）

- 修改 task-chain.ts：支持 API 调用
- 修改各工具页：登录后自动同步到数据库
- 修改 Workspace：新增"我的任务链"页面

### 11.3 Phase 3：关联单据（1 周）

- 修改 ToolDocumentDraft：新增 taskChainDraftId 字段
- 修改 Commercial Invoice / Quotation：保存时关联任务链
- 修改任务链详情页：显示关联单据列表

### 11.4 Phase 4：会员权限（0.5 周）

- 实现任务链数量限制
- 实现升级提示
- 实现管理员权限

---

## 十二、总结

### 12.1 当前状态
- ✅ localStorage 方案已可用
- ✅ 任务链 MVP 已验收
- ✅ EventLog 已覆盖

### 12.2 下一步
- ⏳ 等待用户反馈
- ⏳ 收集使用数据
- ⏳ 评估持久化优先级

### 12.3 预计时间线
- Phase 1：2 周
- Phase 2：1 周
- Phase 3：1 周
- Phase 4：0.5 周
- **总计：4.5 周**

### 12.4 风险
- 数据模型设计不当 → 后期重构成本高
- 隐私合规问题 → 需要法务审核
- 性能问题 → 需要压力测试

---

*本文档为规划参考，不作为当前开发任务。实施前需与团队确认。*
