# ContentOps 当前运行态拓扑图

> 生成时间: 2026-07-22
> BASE_COMMIT: 39f40b261f9b80427adb96e342c5a26a61c2f3c8
> 审计范围: Mac mini Bot + staging 服务器

---

## 一、运行组件清单

### Mac mini 端 (192.168.x.x)

| 组件 | PID | 入口文件 | 状态 |
|------|-----|----------|------|
| Telegram Bot | 30414 | scripts/contentops/contentops-telegram-bot.ts | ✅ 运行中 |
| Notification Dispatcher | 47988 | scripts/contentops/notification-dispatcher.js | ✅ 运行中 |
| LaunchAgent | 30398 | ai.hermes.contentops | ✅ 注册 |
| Worker (TS) | - | scripts/contentops/hermes-contentops-worker.ts | ❌ 未运行 |
| Worker (JS) | - | scripts/contentops/hermes-contentops-worker.js | ❌ 未运行 |
| Worker (Mac JS) | - | scripts/contentops/hermes-contentops-worker-mac.js | ❌ 未运行 |

### Staging 服务器 (192.129.155.149)

| 组件 | PM2 | 入口 | 状态 |
|------|-----|------|------|
| Web Runtime | xixiong-staging | Next.js | ✅ 运行中 |
| Bridge API | xixiong-staging | /api/internal/contentops/drafts | ✅ 可用 |

---

## 二、当前调用链

```
┌─────────────────────────────────────────────────────────────────┐
│ Telegram Update                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ contentops-telegram-bot.ts (Mac PID 30414)                       │
│  - parseTaskIntent()                                            │
│  - fetchBridgeApi() via stagingHelperClient                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ staging-helper-client.ts                                         │
│  - SSH 到 staging 服务器                                         │
│  - 执行 bridge-local-helper.ts                                   │
│  - HMAC 签名在 staging 端完成                                    │
└────────────────────┬────────────────────────────────────────────┘
                     │ SSH
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ bridge-local-helper.ts (staging)                                 │
│  - 接收 stdin JSON                                              │
│  - 计算 HMAC 签名                                               │
│  - POST /api/internal/contentops/drafts                         │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ /api/internal/contentops/drafts/route.ts (staging)               │
│  - verifySignature()                                            │
│  - create_task action                                           │
│  - 调用 canonicalTaskService.createAndEnqueueContentOpsTask()   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ canonical-task-service.ts                                        │
│  - taskManager.createTask() → 本地 JSON 文件                    │
│  - atomicEnqueueJob() → ~/.jueshi-contentops/jobs/inbox/        │
│  - 返回 { taskId, enqueueStatus }                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 文件队列 ~/.jueshi-contentops/jobs/                              │
│  - tmp/ → inbox/ → processing/ → outbox/ → failed/              │
│  - worker.lock                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ hermes-contentops-worker.ts/js (Mac, 需要手动启动)               │
│  - acquireLock()                                                │
│  - 读取 inbox/ 文件                                             │
│  - HermesContentExecutor 调用 Hermes CLI                        │
│  - ContentNormalizer                                            │
│  - QualityChecker                                               │
│  - publishAdapter                                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ publish-adapter.ts                                               │
│  - publishGuide() → stagingHelperClient                         │
│  - publishChecklist() → stagingHelperClient                     │
│  - publishTopic() → stagingHelperClient                         │
└────────────────────┬────────────────────────────────────────────┘
                     │ SSH
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ staging Bridge API (save_content action)                         │
│  - Guide/Checklist/Topic Application Service                    │
│  - Prisma → PostgreSQL                                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ notification-dispatcher.js (Mac PID 47988)                       │
│  - 轮询 outbox/ 目录                                            │
│  - 发送 Telegram 通知                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、重复实现清单

### 1. Worker 实现 (3 份)

| 文件 | 语言 | 状态 | 问题 |
|------|------|------|------|
| hermes-contentops-worker.ts | TypeScript | 未运行 | 与 JS 版本重复 |
| hermes-contentops-worker.js | JavaScript | 未运行 | 与 TS 版本重复 |
| hermes-contentops-worker-mac.js | JavaScript | 未运行 | Mac 专用变体 |

**问题**: 三套 Worker 代码，逻辑相似但实现细节不同，维护成本高。

### 2. Task 创建入口 (2 处)

| 位置 | 调用方式 | 问题 |
|------|----------|------|
| contentops-telegram-bot.ts | 直接调用 fetchBridgeApi | 响应解析不一致 |
| Bridge API create_task | canonicalTaskService | 响应格式与 Bot 期望不匹配 |

**问题**: Bot 期望 `{ ok, data: { task, job } }`，Bridge 返回 `{ ok, taskId, ... }`。

### 3. 文件队列 vs 数据库队列

| 队列类型 | 位置 | 问题 |
|----------|------|------|
| 文件队列 | ~/.jueshi-contentops/jobs/ | 无事务、无重试、无死信 |
| 数据库 Task | PostgreSQL | 只存元数据，不存 Job |
| 数据库 Job | 不存在 | 缺失 |

**问题**: 文件队列与数据库状态不同步，Worker 崩溃后无法恢复。

### 4. HMAC 签名实现 (2 处)

| 位置 | 实现 | 问题 |
|------|------|------|
| bridge-local-helper.ts | staging 端签名 | 正确 |
| (已删除) Bot 端签名 | Mac 端签名 | 曾导致签名不匹配 |

**问题**: 曾经 Bot 和 staging 各持有一份 Secret，导致签名不一致。

### 5. Notification 发送 (2 处)

| 位置 | 方式 | 问题 |
|------|------|------|
| contentops-telegram-bot.ts | 直接 sendContentOpsPlainText | 任务创建后立即发送 |
| notification-dispatcher.js | 轮询 outbox/ | 异步发送 |

**问题**: 两种通知机制并存，可能导致重复发送或遗漏。

---

## 四、过期实现

| 组件 | 状态 | 建议 |
|------|------|------|
| hermes-contentops-worker.js | 未使用 | 标记 deprecated |
| hermes-contentops-worker-mac.js | 未使用 | 标记 deprecated |
| draft-bridge-client.ts | 未使用 | 标记 deprecated |
| local-hermes-agent-client.ts | 未使用 | 标记 deprecated |
| hermes-gateway-client.ts | 未使用 | 标记 deprecated |
| hermes-job-bridge.ts | 未使用 | 标记 deprecated |

---

## 五、手工补丁

| 补丁 | 位置 | 问题 |
|------|------|------|
| 手工 resume 脚本 | scripts/contentops/ | 绕过正常流程 |
| 手工 save-checklist 脚本 | scripts/contentops/ | 绕过 Adapter |
| 手工 publish-existing-guide 脚本 | scripts/contentops/ | 绕过 Worker |

---

## 六、测试专用路径

| 测试 | 位置 | 问题 |
|------|------|------|
| test-contentops-simple.py | scripts/contentops/ | 独立测试，不走真实 Handler |
| execute-test-cases.py | scripts/contentops/ | 独立测试，不走真实 Handler |
| autonomous-agent-e2e.ts | scripts/contentops/ | 独立测试，不走真实 Handler |

**问题**: 测试与真实运行使用不同代码路径，无法验证真实行为。

---

## 七、运行环境差异

| 环境 | Bot | Worker | Bridge | 问题 |
|------|-----|--------|--------|------|
| Mac mini | ✅ 运行 | ❌ 未运行 | N/A | Worker 需要手动启动 |
| Staging | N/A | N/A | ✅ 运行 | 无法运行 Mac 专用组件 |

**问题**: Mac 和 staging 职责边界不清，Worker 只能在 Mac 运行但无法自动启动。

---

## 八、Contract 不一致

### 1. Task 创建响应

**Bot 期望**:
```json
{
  "ok": true,
  "data": {
    "task": { "id": "task_xxx", "status": "QUEUED" },
    "job": { "id": "job_xxx", "status": "QUEUED" }
  }
}
```

**Bridge 实际返回**:
```json
{
  "ok": true,
  "taskId": "task_xxx",
  "status": "QUEUED",
  "enqueueStatus": "QUEUED"
}
```

**问题**: 字段结构不匹配，导致 `Cannot read properties of undefined (reading 'taskId')`。

### 2. Job ID vs Task ID

**当前实现**: Job ID = Task ID (同一个 ID)

**问题**: Job 和 Task 是不同实体，应该有不同的 ID。

---

## 九、状态漂移风险

| 风险 | 描述 | 影响 |
|------|------|------|
| 文件队列与数据库不同步 | Task 在数据库，Job 在文件 | Worker 崩溃后无法恢复 |
| Task 状态与 Job 状态不一致 | Task=QUEUED, Job 不存在 | 无法追踪真实进度 |
| Notification 状态不持久 | 内存中状态，重启丢失 | 可能重复发送或遗漏 |

---

## 十、关键发现

1. **Worker 未自动启动**: LaunchAgent 只启动 Bot，不启动 Worker
2. **文件队列无事务**: 原子写入只保证文件完整性，不保证与数据库一致
3. **响应 Contract 不一致**: Bot 和 Bridge 使用不同的响应格式
4. **三套 Worker 代码**: 维护成本高，容易引入不一致
5. **测试与生产分离**: 无法验证真实运行行为
6. **Notification 双通道**: 可能导致重复或遗漏
7. **Job 实体缺失**: 数据库只有 Task，没有 Job 表

---

## 十一、下一步重构方向

1. 统一 Worker 实现（只保留一份）
2. 建立数据库 Job 队列（替代文件队列）
3. 统一 Task/Job 响应 Contract
4. 统一 Notification 发送通道
5. 建立自动 E2E 测试（覆盖真实运行路径）
6. 明确 Mac 与 staging 的职责边界
