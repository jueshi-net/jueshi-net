# ContentOps 重复路径清单

> 生成时间: 2026-07-22
> BASE_COMMIT: 39f40b261f9b80427adb96e342c5a26a61c2f3c8

---

## 一、Worker 重复实现

### 1.1 hermes-contentops-worker.ts

**位置**: `scripts/contentops/hermes-contentops-worker.ts`
**语言**: TypeScript
**状态**: 未运行
**行数**: 352

**功能**:
- 文件队列读取 (inbox/processing/outbox/failed)
- Hermes CLI 调用
- 内容规范化
- 质量检查
- 发布适配器

**问题**: 与 JS 版本重复，未被使用

### 1.2 hermes-contentops-worker.js

**位置**: `scripts/contentops/hermes-contentops-worker.js`
**语言**: JavaScript
**状态**: 未运行
**行数**: 约 300

**功能**: 与 TS 版本相似

**问题**: 与 TS 版本重复，未被使用

### 1.3 hermes-contentops-worker-mac.js

**位置**: `scripts/contentops/hermes-contentops-worker-mac.js`
**语言**: JavaScript
**状态**: 未运行
**行数**: 约 500

**功能**: Mac 专用变体

**问题**: 与标准 Worker 重复，未被使用

**建议**: 只保留一份 TypeScript Worker，标记其他为 deprecated

---

## 二、Task 创建入口重复

### 2.1 Telegram Bot 直接调用

**位置**: `scripts/contentops/contentops-telegram-bot.ts:1595-1620`
**调用方式**: `fetchBridgeApi()` → `stagingHelperClient.request()`

**代码片段**:
```typescript
const taskResult = await fetchBridgeApi({
  action: 'create_task',
  contentType,
  executionMode,
  rawInput: normalizedTitle,
  idempotencyKey,
});

const taskId = taskResult.data.task.id; // ❌ 期望 data.task.id
```

**问题**: 期望响应格式 `{ ok, data: { task, job } }`

### 2.2 Bridge API create_task

**位置**: `src/app/api/internal/contentops/drafts/route.ts:200-280`
**调用方式**: `canonicalTaskService.createAndEnqueueContentOpsTask()`

**返回格式**:
```typescript
return {
  ok: true,
  taskId: task.id,
  status: task.status,
  enqueueStatus: enqueueResult.success ? 'QUEUED' : 'FAILED_ENQUEUE',
};
```

**问题**: 返回格式 `{ ok, taskId, status, enqueueStatus }`，与 Bot 期望不匹配

**建议**: 统一响应格式，Bridge 返回 `{ ok, data: { task, job } }`

---

## 三、文件队列 vs 数据库队列

### 3.1 文件队列

**位置**: `~/.jueshi-contentops/jobs/`
**结构**:
```
jobs/
├── tmp/          # 临时写入
├── inbox/        # 待处理
├── processing/   # 处理中
├── outbox/       # 已完成
├── failed/       # 失败
└── worker.lock   # Worker 锁
```

**问题**:
- 无事务保证
- 无重试机制
- 无死信队列
- Worker 崩溃后无法恢复
- 与数据库状态不同步

### 3.2 数据库 Task

**位置**: PostgreSQL `contentops_tasks` 表 (通过 taskManager)
**功能**: 只存储 Task 元数据

**问题**: 不存储 Job 信息，无法追踪 Job 状态

### 3.3 数据库 Job (缺失)

**问题**: 数据库没有 Job 表，无法实现：
- Job 认领
- Job 心跳
- Job 重试
- Job 死信

**建议**: 
1. 创建 `contentops_jobs` 表
2. 实现数据库 Job 队列
3. 淘汰文件队列

---

## 四、HMAC 签名实现重复

### 4.1 bridge-local-helper.ts (staging 端)

**位置**: `src/lib/contentops/bridge-local-helper.ts`
**功能**: staging 服务器端 HMAC 签名

**状态**: ✅ 当前使用

### 4.2 Bot 端签名 (已删除)

**位置**: 曾存在于 `scripts/contentops/contentops-telegram-bot.ts`
**功能**: Mac 端 HMAC 签名

**状态**: ❌ 已删除

**历史问题**: 
- Bot 和 staging 各持有一份 Secret
- 签名算法不一致
- 导致签名验证失败

**建议**: 只在 staging 端签名，Bot 不持有 Secret

---

## 五、Notification 发送重复

### 5.1 Bot 直接发送

**位置**: `scripts/contentops/contentops-telegram-bot.ts:95-111`
**函数**: `sendContentOpsPlainText()`

**调用时机**: 任务创建后立即发送

**问题**: 与 Notification Dispatcher 重复

### 5.2 Notification Dispatcher

**位置**: `scripts/contentops/notification-dispatcher.js`
**PID**: 47988
**功能**: 轮询 outbox/ 目录，发送通知

**问题**: 与 Bot 直接发送重复

**建议**: 
1. 统一使用 Notification Dispatcher
2. Bot 只写 Notification Outbox
3. Dispatcher 负责发送

---

## 六、API 路由重复

### 6.1 /api/internal/contentops/drafts

**位置**: `src/app/api/internal/contentops/drafts/route.ts`
**功能**: 草稿管理 + 任务创建 + 内容保存

**Actions**:
- create_task
- get_task
- save_content
- update_content_status
- audit_contentops_task
- ...

**问题**: 一个路由承载太多功能

### 6.2 临时脚本 API

**位置**: `scripts/contentops/`
**脚本**:
- save-checklist-final.js
- save-checklist-to-staging.js
- save-checklist-via-ssh.js
- publish-existing-guide-direct.js
- publish-existing-guide.ts
- publish-guide-simple.js

**问题**: 绕过正常 API，直接操作数据库

**建议**: 
1. 统一使用 `/api/internal/contentops`
2. 删除临时脚本
3. 所有操作通过 API

---

## 七、测试路径重复

### 7.1 独立测试脚本

**位置**: `scripts/contentops/`
**脚本**:
- test-contentops-simple.py
- execute-test-cases.py
- autonomous-agent-e2e.ts
- run-e2e-test.sh

**问题**: 
- 不走真实 Telegram Handler
- 不走真实 Worker
- 不走真实 Bridge
- 无法验证真实运行行为

### 7.2 真实运行路径

**路径**:
```
Telegram → Bot → Bridge → Task → Job → Worker → Content → Notification
```

**问题**: 测试与真实运行使用不同代码路径

**建议**: 
1. 建立统一 E2E 测试框架
2. 测试使用真实代码路径
3. 使用 archivedTest=true 标记测试数据

---

## 八、Client 实现重复

### 8.1 staging-helper-client.ts

**位置**: `src/lib/contentops/staging-helper-client.ts`
**功能**: Mac 端 SSH 客户端，调用 staging helper

**状态**: ✅ 当前使用

### 8.2 draft-bridge-client.ts

**位置**: `scripts/contentops/draft-bridge-client.ts`
**功能**: 直接调用 Bridge API

**状态**: ❌ 未使用

### 8.3 local-hermes-agent-client.ts

**位置**: `scripts/contentops/local-hermes-agent-client.ts`
**功能**: 调用本地 Hermes Agent

**状态**: ❌ 未使用

### 8.4 hermes-gateway-client.ts

**位置**: `scripts/contentops/hermes-gateway-client.ts`
**功能**: 调用 Hermes Gateway

**状态**: ❌ 未使用

### 8.5 hermes-job-bridge.ts

**位置**: `scripts/contentops/hermes-job-bridge.ts`
**功能**: Job 桥接

**状态**: ❌ 未使用

**建议**: 只保留 staging-helper-client.ts，标记其他为 deprecated

---

## 九、Contract 定义重复

### 9.1 types.ts

**位置**: `src/lib/contentops/types.ts`
**功能**: 通用类型定义

### 9.2 task-types.ts

**位置**: `src/lib/contentops/task-types.ts`
**功能**: Task 类型定义

### 9.3 Bot 内联类型

**位置**: `scripts/contentops/contentops-telegram-bot.ts`
**功能**: Bot 内部类型定义

**问题**: 类型定义分散在多个文件，容易不一致

**建议**: 
1. 创建 `src/lib/contentops/contracts/` 目录
2. 统一所有 Contract 定义
3. Bot、API、Worker 都引用同一套类型

---

## 十、重复统计

| 类别 | 重复数量 | 建议 |
|------|----------|------|
| Worker 实现 | 3 | 保留 1，删除 2 |
| Task 创建入口 | 2 | 统一为 1 |
| 队列实现 | 2 (文件 + 数据库) | 保留数据库，删除文件 |
| HMAC 签名 | 2 (历史) | 保留 1 |
| Notification 发送 | 2 | 保留 Dispatcher |
| API 路由 | 1 + 临时脚本 | 统一为 1 |
| 测试路径 | 4 + 真实路径 | 统一为 1 |
| Client 实现 | 5 | 保留 1，删除 4 |
| Contract 定义 | 3 | 统一为 1 |

**总计**: 23 个重复实现

---

## 十一、退役清单

### 11.1 立即标记 deprecated

- [ ] hermes-contentops-worker.js
- [ ] hermes-contentops-worker-mac.js
- [ ] draft-bridge-client.ts
- [ ] local-hermes-agent-client.ts
- [ ] hermes-gateway-client.ts
- [ ] hermes-job-bridge.ts
- [ ] test-contentops-simple.py
- [ ] execute-test-cases.py
- [ ] autonomous-agent-e2e.ts
- [ ] run-e2e-test.sh
- [ ] save-checklist-final.js
- [ ] save-checklist-to-staging.js
- [ ] save-checklist-via-ssh.js
- [ ] publish-existing-guide-direct.js
- [ ] publish-existing-guide.ts
- [ ] publish-guide-simple.js

### 11.2 新系统稳定后删除

- [ ] 文件队列 ~/.jueshi-contentops/jobs/
- [ ] 旧 Worker 代码
- [ ] 旧 Client 代码
- [ ] 临时脚本

---

## 十二、迁移优先级

| 优先级 | 项目 | 原因 |
|--------|------|------|
| P0 | 统一 Task 响应 Contract | 导致真实测试失败 |
| P0 | 创建数据库 Job 表 | 无法追踪 Job 状态 |
| P1 | 统一 Worker 实现 | 维护成本高 |
| P1 | 淘汰文件队列 | 无事务保证 |
| P2 | 统一 Notification | 可能重复发送 |
| P2 | 删除临时脚本 | 绕过正常流程 |
| P3 | 删除 deprecated 代码 | 清理代码库 |
