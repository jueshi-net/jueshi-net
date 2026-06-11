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

## 二、TaskChainDraft 字段草案（v6.42.1 优化版）

### 2.1 设计原则

- **MVP 只允许登录用户**（userId 必填，不允许 null）
- **不修改 ToolDocumentDraft schema**（关联通过 linkedDraftHints JSON 实现）
- **context 用 JSON 存储**（灵活扩展，避免频繁 migration）
- **最小字段集**（减少隐私风险和存储成本）

### 2.2 MVP 字段草案

```prisma
model TaskChainDraft {
  // 主键
  id                  String    @id @default(cuid())
  
  // 用户归属（MVP 必填，不允许 null）
  userId              String    @map("user_id")
  
  // 任务链核心数据
  sourceTool          String    @map("source_tool")       // 来源工具标识
  title               String?                             // 自动/手动标题
  status              String    @default("active")        // active / completed / archived
  
  // 上下文数据（JSON 格式，灵活扩展）
  context             Json                                // 任务链上下文
  // context 示例:
  // {
  //   "productName": "phone case",
  //   "hsCode": "3926.90",
  //   "declaredValue": "100",
  //   "currency": "USD",
  //   "destinationCountry": "CA",
  //   "postalCode": "M5V 3L9",
  //   "addressText": "123 Main St, Toronto, ON"
  // }
  
  // 关联草稿提示（轻量关联，不修改 ToolDocument schema）
  linkedDraftHints    Json?     @map("linked_draft_hints")
  // linkedDraftHints 示例:
  // [
  //   { "toolKey": "commercial_invoice", "draftId": "xxx", "createdAt": "..." },
  //   { "toolKey": "quote_sheet", "draftId": "yyy", "createdAt": "..." }
  // ]
  
  // 时间戳
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  completedAt         DateTime? @map("completed_at")
  archivedAt          DateTime? @map("archived_at")
  
  // 索引
  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("task_chain_drafts")
}
```

### 2.3 字段分类

**MVP 必需字段**（6.42.2 修正：completedAt/archivedAt 改为可选）

| 字段 | MVP 必需 | 索引 | 隐私风险 | 说明 |
|---|---|---|---|---|
| id | ✅ | PK | 无 | 主键 |
| userId | ✅ | ✅ | 低 | 用户归属（必填） |
| sourceTool | ✅ | - | 无 | 来源工具 |
| title | ✅ | - | 无 | 任务标题 |
| status | ✅ | ✅ | 无 | 生命周期状态 |
| context | ✅ | - | 🟡 中 | 任务链上下文（可能含地址等） |
| linkedDraftHints | ✅ | - | 无 | 关联草稿提示 |
| createdAt | ✅ | ✅ | 无 | 创建时间 |
| updatedAt | ✅ | - | 无 | 更新时间 |

**MVP 可选字段**（6.42.2 修正：生命周期结束字段不强制）

| 字段 | MVP 可选 | 索引 | 隐私风险 | 说明 |
|---|---|---|---|---|
| completedAt | ✅ 可选 | - | 无 | 只有任务完成后才有值 |
| archivedAt | ✅ 可选 | - | 无 | 只有归档后才有值 |
| lastActiveTool | ✅ 可选 | - | 无 | 最后活跃工具（可从 context 推导但冗余存储更快） |

### 2.4 暂缓字段（不在 MVP 中）

| 字段 | 暂缓原因 |
|---|---|
| sessionId / anonymousId | MVP 不支持匿名用户 |
| currentStep | 可从 context 推导 |
| expiresAt | 后续版本再加 |
| deletedAt | 使用硬删除 |

### 2.5 隐私风险说明

**context 字段**可能包含：
- 商品名称（低风险）
- HS 编码（低风险）
- 申报价值（中风险）
- 目的地国家（低风险）
- 邮编（中风险）
- 地址文本（🟡 中高风险）

**缓解措施**：
- 隐私政策明确告知数据存储范围
- 提供删除功能
- 管理员查看需审计日志
- 数据保留策略（90 天未活跃自动归档）

### 2.6 不修改 ToolDocumentDraft Schema

**Phase 2 MVP 不在 ToolDocumentDraft 中新增 taskChainId 字段。**

关联通过 TaskChainDraft.linkedDraftHints JSON 实现，避免修改现有表的 migration 风险。

---

## 三、匿名保存策略（v6.42.1 明确结论）

### 3.1 明确结论

**Phase 2 MVP 不允许匿名用户直接写数据库。**

- 未登录用户继续使用 localStorage
- 登录后才允许保存到 TaskChainDraft
- 登录后提示导入 localStorage 数据

### 3.2 理由

| 理由 | 说明 |
|---|---|
| 数据归属清晰 | 所有数据都有明确的 userId |
| 无清理负担 | 不需要定时清理匿名数据 |
| 权限控制简单 | 只需考虑登录用户的权限 |
| 隐私风险低 | 所有数据都关联到具体用户 |
| 实现成本低 | 不需要处理匿名用户的识别、防刷、清理 |

### 3.3 原方案（保留供参考）

原方案考虑过允许 `userId=null`，但经复核后决定 MVP 不支持：

- 匿名用户只能创建 1 条任务链（通过 sessionId 标识）
- 登录后提示导入，导入后清除匿名数据
- 匿名数据 30 天未登录自动清理

### 3.4 未来扩展

如果未来需要支持匿名用户保存到数据库：

1. 新增 `sessionId` 字段
2. 限制匿名用户只能创建 1 条任务链
3. 30 天未登录自动清理
4. 需要额外的防刷机制
5. 需要额外的隐私告知

**但这不在 Phase 2 MVP 范围内。**

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

## 七、ToolDocument 关联策略（v6.42.1 明确结论）

### 7.1 明确结论

**Phase 2 MVP 不修改 ToolDocumentDraft schema。**

- 不在 ToolDocumentDraft 中新增 `taskChainId` 字段
- 在 TaskChainDraft.linkedDraftHints 中保存轻量关联提示
- 正式关联放到后续 Phase

### 7.2 理由

| 理由 | 说明 |
|---|---|
| 减少 migration 风险 | 不修改现有表 |
| 降低回归风险 | 不影响 Quote Sheet / Commercial Invoice |
| 实现成本低 | 只需在 TaskChainDraft 中保存 hints |
| 灵活性高 | hints 可以包含任意元数据 |

### 7.3 linkedDraftHints 结构

```json
[
  {
    "toolKey": "commercial_invoice",
    "draftId": "cmq...",
    "title": "Commercial Invoice - phone case",
    "createdAt": "2026-06-11T..."
  },
  {
    "toolKey": "quote_sheet",
    "draftId": "cmr...",
    "title": "Quotation - phone case",
    "createdAt": "2026-06-11T..."
  }
]
```

### 7.4 Quote Sheet / Commercial Invoice 关联策略

**Phase 2 MVP 不立即关联 taskChainId。**

- Quote Sheet 保存时不传递 taskChainId
- Commercial Invoice 保存时不传递 taskChainId
- 任务链保存时，前端记录 linkedDraftHints
- Workspace 展示时，从 hints 中读取关联草稿

### 7.5 原方案（保留供参考）

原方案考虑过在 ToolDocumentDraft 中新增 `taskChainId` 字段：

```prisma
model ToolDocumentDraft {
  // ... existing fields ...
  taskChainId String? @map("task_chain_id")
  @@index([taskChainId])
}
```

但经复核后决定 MVP 不采用此方案，避免修改现有表的 migration 风险。

### 7.6 未来扩展

如果未来需要正式关联：

1. ToolDocumentDraft 新增 `taskChainId` 字段
2. 新增 migration
3. 修改保存 API，支持传递 taskChainId
4. Workspace 展示正式关联关系

**但这不在 Phase 2 MVP 范围内。**

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

## 十、用户确认事项最终清单（v6.42.2 定稿）

### 10.1 必须确认的事项

| # | 事项 | 默认值 | 风险 |
|---|---|---|---|
| 1 | 是否批准进入 6.43？ | 待确认 | 高 |
| 2 | 是否批准新增 TaskChainDraft Prisma model？ | 待确认 | 高 |
| 3 | 是否批准执行 migration？ | 待确认 | 高 |
| 4 | 是否确认 Phase 2 只允许登录用户保存？ | 是 | 中 |
| 5 | 是否确认未登录用户继续只用 localStorage？ | 是 | 中 |
| 6 | 是否确认不修改 ToolDocumentDraft schema？ | 是 | 中 |
| 7 | 是否确认免费用户任务链保存上限为 5？ | 5 | 低 |
| 8 | 是否确认会员用户任务链保存上限为 50？ | 50 | 低 |
| 9 | 是否确认数据保留策略先采用 180 天？ | 180 天 | 中 |
| 10 | 是否确认 6.43 不做复杂 Workspace 重构？ | 是 | 中 |
| 11 | 是否确认上线前必须 pg_dump 备份成功？ | 是 | 高 |
| 12 | 是否确认备份失败则不得执行 migration？ | 是 | 高 |

### 10.2 确认方式

用户需明确回复：

```
"批准进入 6.43，并批准新增 TaskChainDraft migration。"

确认事项：
1. 进入 6.43：是
2. 新增 TaskChainDraft model：是
3. 执行 migration：是
4. 只允许登录用户保存：是
5. 未登录用户只用 localStorage：是
6. 不修改 ToolDocumentDraft schema：是
7. 免费用户上限：5
8. 会员用户上限：50
9. 数据保留策略：180 天
10. 不做复杂 Workspace 重构：是
11. 上线前 pg_dump 备份必须成功：是
12. 备份失败不得执行 migration：是
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

---

## 十五、6.43 实施边界草案（v6.42.2 收紧版）

### 15.1 6.43 允许范围

如果用户批准 6.43，只允许做：

| 任务 | 说明 |
|---|---|
| 新增 TaskChainDraft Prisma model | 按本文档字段草案（MVP 必需字段） |
| 新增 migration | `prisma migrate dev --name add_task_chain_drafts` |
| 新增最小 API | POST `/api/me/task-chains`（保存） |
| | GET `/api/me/task-chains`（获取我的任务链） |
| | DELETE 或 PATCH archive `/api/me/task-chains/[id]` |
| Save-to-Workspace 真实保存 | 从占位变成真实保存（调用新 API） |
| Workspace 极简入口 | 可以只加一个极简入口或极简列表，但不得重构 |

### 15.2 6.43 禁止范围

| 禁止任务 | 说明 |
|---|---|
| 重构 Workspace | 不改变现有 Workspace 结构 |
| 重构 ToolDocument | 不修改 ToolDocumentDraft schema |
| 修改 Quote Sheet 核心保存、恢复、导出逻辑 | 零影响 |
| 修改 Commercial Invoice 核心保存、恢复、导出逻辑 | 零影响 |
| 复杂任务详情页 | 只做最小列表 |
| 多设备实时同步 | 不做 |
| 会员限制真实拦截 | 除非用户另行批准，否则只做文案占位 |
| 批量修改历史数据 | 不迁移现有数据 |
| 匿名用户写数据库 | 不允许，未登录用户继续只用 localStorage |

### 15.3 6.43 验收标准

- [ ] Migration 执行成功
- [ ] API CRUD 正常
- [ ] Save-to-Workspace 真实保存（写数据库）
- [ ] Workspace 显示极简任务列表或入口
- [ ] 无回归问题（Quote Sheet / Commercial Invoice / Workspace 现有功能）
- [ ] 未登录用户点击"保存到工作台"仍提示登录
- [ ] 登录用户保存后，数据库有对应记录

---

## 十六、生产环境备份与回滚方案（v6.42.1 补充）

### 16.1 生产服务器信息

- **服务器**: `deploy@192.129.155.149`
- **项目目录**: `/home/deploy/xixiong-saas`
- **数据库**: PostgreSQL (本地 127.0.0.1:5432)
- **数据库名**: `bxb_prod`
- **数据库用户**: `bxb_user`
- **密码**: 存在于 `.env.production` 的 `DATABASE_URL` 中（不在文档中暴露）

### 16.2 备份前检查

```bash
# 1. SSH 到生产服务器
ssh deploy@192.129.155.149

# 2. 检查 DATABASE_URL（不显示密码）
cd /home/deploy/xixiong-saas
grep DATABASE_URL .env.production | sed 's/\(.*:.*@\).*\(@.*\)/\1***\2/'

# 3. 检查数据库连接
PGPASSWORD=$(grep DATABASE_URL .env.production | sed 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/') \
  psql -U bxb_user -h 127.0.0.1 -d bxb_prod -c "SELECT version();"

# 4. 检查备份目录
mkdir -p /home/deploy/backups
ls -lh /home/deploy/backups/
```

### 16.3 备份命令

**重要**：`-F c` (custom format) 必须使用 `.dump` 扩展名，`.sql` 仅用于 plain SQL 格式。

```bash
# 完整备份（推荐，custom format）
mkdir -p /home/deploy/backups
BACKUP_FILE="/home/deploy/backups/bxb_prod_$(date +%Y%m%d_%H%M%S).dump"
pg_dump "$DATABASE_URL" -F c -f "$BACKUP_FILE"
echo "Backup created: $BACKUP_FILE"
ls -lh "$BACKUP_FILE"

# 验证备份成功（文件大小应 > 0）
if [ ! -s "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file is empty or missing. DO NOT proceed with migration."
  exit 1
fi

# 验证备份内容（列出表）
pg_restore -l "$BACKUP_FILE" | head -20
```

**安全规则**：
- 不得把真实数据库密码写入报告或日志
- 不得在日志中 echo DATABASE_URL
- 备份失败（文件大小为 0）时，**不得执行 migration**
- 必须先 `mkdir -p /home/deploy/backups`

### 16.4 Migration 执行命令

```bash
# 1. SSH 到生产服务器
ssh deploy@192.129.155.149

# 2. 进入项目目录
cd /home/deploy/xixiong-saas

# 3. 备份数据库（必须）
# （见 16.3 备份命令）

# 4. 执行 migration
npx prisma migrate deploy

# 5. 验证 migration
PGPASSWORD=$(grep DATABASE_URL .env.production | sed 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/') \
  psql -U bxb_user -h 127.0.0.1 -d bxb_prod -c "\d task_chain_drafts"

# 6. 重新构建并部署
npm run build
pm2 restart xixiong-saas

# 7. 验证生产环境
curl -I https://jueshi.net/workspace
```

### 16.5 回滚步骤

**重要**：VPS 通过 rsync 部署（exclude .git），因此 VPS 上没有 git 历史。回滚必须从本地稳定版本 rsync 回去。

```bash
# === 代码回滚（在本地 Mac 执行）===

# 1. 在本地回退到上一个稳定 commit
cd /Users/chq/xixiong-saas
git log --oneline -5  # 找到 migration 之前的 commit
git checkout <stable-commit-hash>  # 或直接 git revert <migration-commit>

# 2. rsync 稳定版本到 VPS
rsync -az --exclude='node_modules' --exclude='.next' --exclude='.git' \
  ./ deploy@192.129.155.149:/home/deploy/xixiong-saas/

# === 数据库回滚（在 VPS 执行）===

# 3. SSH 到 VPS
ssh deploy@192.129.155.149
cd /home/deploy/xixiong-saas

# 4. 停止服务
pm2 stop xixiong-saas

# 5. 数据库回滚
# 情况 A：新表无有效用户数据 → 直接 DROP
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS \"task_chain_drafts\";"

# 情况 B：新表已有用户数据 → 先导出再 DROP
psql "$DATABASE_URL" -c "COPY task_chain_drafts TO '/home/deploy/backups/task_chain_drafts_rollback_$(date +%Y%m%d_%H%M%S).csv' WITH CSV HEADER;"
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS \"task_chain_drafts\";"

# 情况 C：如果 Prisma migration 已记录但需要回滚
# 手动删除 _prisma_migrations 中对应记录
psql "$DATABASE_URL" -c "DELETE FROM _prisma_migrations WHERE migration_name LIKE '%add_task_chain%';"

# 6. 重新构建并部署
rm -rf .next
npm run build
pm2 start xixiong-saas
pm2 status

# 7. 验证生产环境
curl -I https://jueshi.net/workspace
```

### 16.6 回滚判断标准

**可以自动回滚的情况**：
- Migration 执行成功但功能不符合预期
- 新增表无用户数据
- 前端 UI 显示异常但不影响其他功能

**必须回滚的情况**：
- Migration 执行失败
- 新增表导致现有查询报错
- 性能严重下降（>50%）
- 数据丢失或损坏

**必须停止并人工介入的情况**：
- 数据库连接失败
- 数据丢失且无备份
- 备份文件损坏无法恢复
- rsync 回滚后 build 失败
- 不确定新表是否有有效用户数据
