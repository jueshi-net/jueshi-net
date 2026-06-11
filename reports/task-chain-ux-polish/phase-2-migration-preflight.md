# Phase 2 Migration Preflight — TaskChainDraft 数据库持久化前置检查

**版本**: v1.20.42.6.42
**日期**: 2026-06-11
**性质**: 前置规划文档，非实施指令
**状态**: 待用户确认后执行

---

## 一、为什么 Phase 2 需要 Migration

### 1.1 当前 localStorage 方案的局限

- **数据不可靠**：用户清除浏览器缓存/数据后，任务链丢失
- **无法跨设备**：换手机/电脑后无法访问之前的任务
- **无法关联草稿**：localStorage 无法与后端 ToolDocumentDraft 建立关联
- **无法权限控制**：无法区分免费用户/会员用户的保存上限
- **无法审计**：管理员无法查看/协助用户处理任务

### 1.2 为什么不能继续用 ToolDocumentDraft

- **语义不同**：任务链是跨工具工作流，不是单个工具的表单草稿
- **污染现有系统**：`toolKey = "task_chain_shipping"` 会混入工具草稿列表
- **无法按字段查询**：`dataJson` 是字符串，无法过滤 `hsCode` / `destinationCountry`
- **不支持匿名用户**：`userId` 必填，无法支持未登录用户的过渡
- **无状态管理**：缺少 `status` / `archivedAt` / `completedAt` 字段

### 1.3 结论

必须新增独立的 `TaskChainDraft` 模型，并执行 Prisma migration。

---

## 二、TaskChainDraft 初步字段草案

```prisma
model TaskChainDraft {
  id                  String    @id @default(cuid())
  userId              String?   @map("user_id")           // 可空：支持匿名用户过渡
  sessionId           String?   @map("session_id")        // 匿名用户标识
  
  // 任务链核心数据
  sourceTool          String    @map("source_tool")       // 来源工具标识
  title               String?                             // 自动/手动标题
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
  
  // 生命周期
  status              String    @default("draft")         // draft / active / completed / archived
  archivedAt          DateTime? @map("archived_at")
  completedAt         DateTime? @map("completed_at")
  
  // 时间戳
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  
  @@index([userId])
  @@index([sessionId])
  @@index([status])
  @@index([createdAt])
  @@map("task_chain_drafts")
}
```

同时需要在 ToolDocumentDraft 中新增可选关联字段：

```prisma
model ToolDocumentDraft {
  // ... existing fields ...
  taskChainId String? @map("task_chain_id")  // 关联任务链（可空）
  @@index([taskChainId])
}
```

---

## 三、是否允许匿名 userId=null

### 3.1 允许的理由

- 当前 localStorage 方案支持匿名用户
- 登录后导入需要过渡期
- 降低用户使用门槛

### 3.2 风险

| 风险 | 等级 | 说明 |
|---|---|---|
| 数据归属不清 | 🟡 中 | 匿名用户数据无法关联到具体用户 |
| 存储膨胀 | 🟡 中 | 匿名用户可能创建大量数据 |
| 隐私合规 | 🟡 中 | 需要明确告知数据存储策略 |
| 清理困难 | 🟢 低 | 可定时清理过期的匿名数据 |

### 3.3 推荐方案

**允许 `userId=null`，但限制匿名用户数据：**

- 匿名用户只能创建 1 条任务链（通过 sessionId 标识）
- 登录后提示导入，导入后清除匿名数据
- 匿名数据 30 天未登录自动清理

---

## 四、是否应该只允许登录用户保存到数据库

### 4.1 方案 A：只允许登录用户

**优点**：
- 数据归属清晰
- 无匿名数据清理问题
- 权限控制简单

**缺点**：
- 用户体验断层：未登录时无法保存
- 与当前 localStorage 方案不兼容
- 降低转化率

### 4.2 方案 B：允许匿名 + 登录导入

**优点**：
- 用户体验连贯
- 与当前方案兼容
- 提高转化率

**缺点**：
- 需要处理匿名数据清理
- 需要导入逻辑
- 权限控制复杂

### 4.3 推荐

**方案 B**，但限制匿名用户只能创建 1 条任务链。

---

## 五、localStorage 如何导入 TaskChainDraft

### 5.1 导入流程

```
1. 用户登录成功
2. 前端检测 localStorage 有任务链数据
3. 弹窗提示「检测到未保存的任务数据，是否导入到工作台？」
4. 用户确认
5. 前端调用 POST /api/me/task-chains/import-local
6. 后端验证 sessionId，创建 TaskChainDraft
7. 前端清除 localStorage
8. 提示「导入成功」
```

### 5.2 API 设计

```typescript
// POST /api/me/task-chains/import-local
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const { sessionId, taskChain } = body;

  // 验证 sessionId 格式
  if (!sessionId || !/^[\w-]+$/.test(sessionId)) {
    return NextResponse.json({ error: "无效的 sessionId" }, { status: 400 });
  }

  // 检查是否已导入过（防重复）
  const existing = await prisma.taskChainDraft.findFirst({
    where: { sessionId, userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "该数据已导入过" }, { status: 409 });
  }

  // 创建 TaskChainDraft
  const draft = await prisma.taskChainDraft.create({
    data: {
      userId: session.user.id,
      sessionId,
      sourceTool: taskChain.sourceTool || "unknown",
      title: `跨境发货任务 - ${taskChain.productName || "未命名"}`,
      productName: taskChain.productName,
      hsCode: taskChain.hsCode,
      // ... 其他字段
      status: "draft",
    },
  });

  return NextResponse.json({ success: true, data: draft });
}
```

---

## 六、如何避免用户重复保存

### 6.1 前端防重复

```typescript
// 导入成功后立即清除 localStorage
const handleImport = async () => {
  const res = await fetch('/api/me/task-chains/import-local', { ... });
  if (res.ok) {
    clearTaskChain();  // 清除 localStorage
    setShowImportPrompt(false);
  }
};
```

### 6.2 后端防重复

```typescript
// 检查 sessionId + userId 是否已导入
const existing = await prisma.taskChainDraft.findFirst({
  where: { sessionId, userId: session.user.id },
});
if (existing) {
  return NextResponse.json({ error: "该数据已导入过" }, { status: 409 });
}
```

### 6.3 导入后检测

```typescript
// 工具页面加载时
useEffect(() => {
  // 1. 先检查后端是否有任务链
  fetch('/api/me/task-chains?status=active')
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        // 后端有数据，忽略 localStorage
        setTaskChain(data[0]);
      } else {
        // 后端无数据，检查 localStorage
        const local = getTaskChain();
        if (local) setTaskChain(local);
      }
    });
}, []);
```

---

## 七、如何与 ToolDocument 关联

### 7.1 关联方式

在 ToolDocumentDraft 中新增 `taskChainId` 可选字段：

```prisma
model ToolDocumentDraft {
  // ... existing fields ...
  taskChainId String? @map("task_chain_id")
  @@index([taskChainId])
}
```

### 7.2 关联流程

```
1. 用户从任务链创建 Commercial Invoice
2. 前端传递 taskChainId 到保存 API
3. 后端创建 ToolDocumentDraft 时关联 taskChainId
4. Workspace 可展示「此发票属于任务 #123」
```

### 7.3 API 修改

```typescript
// POST /api/me/tool-documents
export async function POST(req: NextRequest) {
  // ... existing validation ...

  const { toolKey, title, companyProfileId, dataJson, previewJson, taskChainId } = body;

  // 如果提供了 taskChainId，验证归属
  if (taskChainId) {
    const tc = await prisma.taskChainDraft.findFirst({
      where: { id: taskChainId, userId: session.user.id },
    });
    if (!tc) {
      return NextResponse.json({ error: "任务链不存在或无权访问" }, { status: 404 });
    }
  }

  const draft = await prisma.toolDocumentDraft.create({
    data: {
      userId: session.user.id,
      toolKey,
      title,
      companyProfileId: companyProfileId || null,
      dataJson,
      previewJson: previewJson || null,
      taskChainId: taskChainId || null,  // 新增
    },
  });

  // ... existing response ...
}
```

---

## 八、如何回滚 Migration

### 8.1 回滚步骤

```bash
# 1. 删除 task_chain_drafts 表
psql $DATABASE_URL -c "DROP TABLE IF EXISTS task_chain_drafts;"

# 2. 删除 tool_document_drafts.task_chain_id 字段
psql $DATABASE_URL -c "ALTER TABLE tool_document_drafts DROP COLUMN IF EXISTS task_chain_id;"

# 3. 回滚代码
git revert <commit-hash>

# 4. 重新部署
npm run build && pm2 restart xixiong-saas
```

### 8.2 回滚影响

| 影响 | 说明 |
|---|---|
| 用户数据 | 已保存的任务链数据会丢失 |
| 关联草稿 | ToolDocumentDraft.taskChainId 变为孤立数据 |
| EventLog | 保留，不影响 |

### 8.3 回滚前准备

- 导出所有 TaskChainDraft 数据为 JSON
- 通知受影响用户
- 提供数据恢复方案

---

## 九、上线前是否需要数据库备份

### 9.1 必须备份

**原因**：
- Migration 不可逆（虽然可回滚，但数据会丢失）
- 新增字段可能影响现有查询
- 需要回滚时的数据快照

### 9.2 备份命令

```bash
# 在 VPS 上执行
ssh deploy@192.129.155.149

# 备份整个数据库
pg_dump -U bxb_user -h 127.0.0.1 bxb_prod > /home/deploy/backups/bxb_prod_$(date +%Y%m%d_%H%M%S).sql

# 或只备份关键表
pg_dump -U bxb_user -h 127.0.0.1 -t tool_document_drafts -t tool_document_history bxb_prod > /home/deploy/backups/tool_documents_$(date +%Y%m%d_%H%M%S).sql
```

### 9.3 备份验证

```bash
# 验证备份文件
ls -lh /home/deploy/backups/bxb_prod_*.sql

# 测试恢复（在测试环境）
psql -U test_user -h 127.0.0.1 test_db < /home/deploy/backups/bxb_prod_XXXXXXXX_XXXXXX.sql
```

---

## 十、哪些内容需要用户确认后才能执行

### 10.1 必须确认的事项

| 事项 | 说明 | 风险 |
|---|---|---|
| 是否执行 Migration | 新增 TaskChainDraft 表 + 修改 ToolDocumentDraft | 高 |
| 是否允许匿名 userId=null | 影响数据归属和清理策略 | 中 |
| 免费用户保存上限 | 5 个活跃任务是否合理 | 低 |
| 会员用户保存上限 | 50 个活跃任务是否合理 | 低 |
| 数据保留策略 | 90 天/180 天/365 天是否合理 | 中 |
| 是否开放管理员查看 | 影响隐私和审计 | 中 |
| 是否开放导出资料包 | 影响会员权益 | 低 |

### 10.2 确认流程

```
1. 用户阅读本文档
2. 用户确认上述事项
3. 用户明确同意执行 Migration
4. 执行数据库备份
5. 执行 Migration
6. 验证数据完整性
7. 部署代码
8. 验证功能正常
```

### 10.3 拒绝确认的处理

如果用户拒绝确认任何事项：
- 不执行 Migration
- 继续使用 localStorage 方案
- 保持当前功能状态

---

## 十一、Phase 2 实施检查清单

### 11.1 前置条件

- [ ] 用户确认执行 Migration
- [ ] 数据库备份完成
- [ ] 回滚方案准备就绪
- [ ] 代码 Review 完成

### 11.2 实施步骤

- [ ] 新增 TaskChainDraft 模型到 Prisma schema
- [ ] ToolDocumentDraft 新增 taskChainId 字段
- [ ] 执行 `prisma migrate dev --name add_task_chain_drafts`
- [ ] 验证 Migration 成功
- [ ] 新增 API：`/api/me/task-chains` (CRUD + import-local)
- [ ] 修改 API：`/api/me/tool-documents` (支持 taskChainId)
- [ ] 新增 Workspace UI：任务链列表页
- [ ] 修改 Workspace 主页面：新增「我的任务」区域
- [ ] 新增权限控制：免费 5 个 / 会员 50 个
- [ ] 新增 EventLog 事件
- [ ] 前端集成：登录后导入提示
- [ ] 前端集成：继续任务流程
- [ ] 测试：所有验收链路
- [ ] 部署到 VPS
- [ ] 验证生产环境

### 11.3 验收标准

- [ ] Migration 执行成功
- [ ] API CRUD 正常
- [ ] 从 localStorage 导入成功
- [ ] Workspace 展示正常
- [ ] 继续任务流程通畅
- [ ] 权限控制生效
- [ ] EventLog 记录完整
- [ ] 移动端 375px 适配
- [ ] 无回归问题

---

## 十二、预计工期

| 阶段 | 任务 | 工期 |
|---|---|---|
| 准备 | 用户确认 + 备份 | 0.5 天 |
| 实施 | Schema + API | 2 天 |
| 实施 | Workspace UI | 1.5 天 |
| 实施 | 前端集成 | 1 天 |
| 测试 | 验收链路 + 回归 | 1 天 |
| 部署 | VPS 部署 + 验证 | 0.5 天 |
| **总计** | | **6.5 天** |

---

## 十三、风险与缓解

| 风险 | 等级 | 缓解措施 |
|---|---|---|
| Migration 失败 | 🟡 中 | 备份 + 回滚方案 |
| 数据丢失 | 🔴 高 | 备份 + 验证 |
| 性能问题 | 🟢 低 | 索引优化 |
| 权限绕过 | 🟢 低 | API 层校验 |
| 用户困惑 | 🟡 中 | 文案明确 |

---

## 十四、结论

**Phase 2 需要执行 Migration，新增 TaskChainDraft 模型。**

**必须用户确认后才能执行。**

**预计工期 6.5 天。**

**等待用户确认。**
