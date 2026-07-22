# ContentOps 核心重构设计

> 版本: v1.0
> 日期: 2026-07-22
> 状态: 设计中

---

## 一、重构目标

### 核心原则

1. **唯一入口**: 只有一个任务创建入口
2. **唯一 Contract**: 只有一个任务响应格式
3. **唯一队列**: 只有一个 Job 队列（数据库）
4. **唯一 Worker**: 只有一个正式 Worker
5. **唯一通知器**: 只有一个通知发送器
6. **测试即生产**: 测试和真实运行使用同一代码路径
7. **全链路追踪**: Task、Job、Content、Notification 全部可追踪
8. **自动恢复**: 不再依赖用户手工重试
9. **真实部署**: 不再使用文件复制冒充部署
10. **完整 E2E**: 不再使用局部 smoke 冒充完整 E2E

### 量化目标

- DUPLICATE_WORKER_IMPLEMENTATION_COUNT = 0
- DUPLICATE_ENQUEUE_IMPLEMENTATION_COUNT = 0
- FILE_QUEUE_RUNTIME_ENABLED = false
- SECONDARY_CONTENTOPS_API_COUNT = 0
- UNSAFE_TASK_ID_PROPERTY_ACCESS_COUNT = 0
- CONTRACT_DUPLICATE_DEFINITION_COUNT = 0
- CONTENTOPS_E2E_EXIT_CODE = 0

---

## 二、目标架构

```
┌─────────────────────────────────────────────────────────────────┐
│ Telegram Update                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Mac ContentOps Runtime                                           │
│  - Telegram Bot (唯一入口)                                       │
│  - Worker (单一 Worker)                                         │
│  - Notification Dispatcher (唯一通知器)                          │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTPS (单一网络边界)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Staging ContentOps API                                           │
│  - /api/internal/contentops (唯一 API)                          │
│  - Task Service                                                 │
│  - Job Service                                                  │
│  - Content Application Services                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ PostgreSQL                                                       │
│  - contentops_tasks                                             │
│  - contentops_jobs                                              │
│  - contentops_notifications                                     │
│  - contentops_audit_events                                      │
│  - guides / checklists / topics                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、数据模型设计

### 3.1 contentops_tasks

```prisma
model ContentOpsTask {
  id              String   @id @default(cuid())
  taskId          String   @unique @map("task_id") // task_xxx
  contentType     String   @map("content_type") // guide/checklist/topic
  executionMode   String   @map("execution_mode") // draft_only/review_required/publish_when_validated/...
  targetEnvironment String @default("staging") @map("target_environment")
  rawInput        String   @map("raw_input")
  normalizedTitle String?  @map("normalized_title")
  
  status          String   @default("RECEIVED") // RECEIVED/QUEUED/RUNNING/NORMALIZING/QUALITY_CHECK/AWAITING_REVIEW/SCHEDULED/PUBLISHED/CHANGES_REQUESTED/FAILED/CANCELLED/ARCHIVED_TEST
  
  idempotencyKey  String?  @unique @map("idempotency_key")
  archivedTest    Boolean  @default(false) @map("archived_test")
  
  contentId       String?  @map("content_id") // 关联到 guides/checklists/topics
  contentSlug     String?  @map("content_slug")
  
  qualityScore    Int?     @map("quality_score")
  qualityIssues   Json?    @map("quality_issues")
  
  failureStage    String?  @map("failure_stage")
  failureReason   String?  @map("failure_reason")
  recoverable     Boolean? 
  
  metadata        Json?
  
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  jobs            ContentOpsJob[]
  notifications   ContentOpsNotification[]
  auditEvents     ContentOpsAuditEvent[]
  
  @@map("contentops_tasks")
}
```

### 3.2 contentops_jobs

```prisma
model ContentOpsJob {
  id              String   @id @default(cuid())
  jobId           String   @unique @map("job_id") // job_xxx
  taskId          String   @map("task_id")
  
  status          String   @default("QUEUED") // QUEUED/CLAIMED/RUNNING/SUCCEEDED/FAILED/RETRY_WAIT/DEAD_LETTER
  
  attemptCount    Int      @default(0) @map("attempt_count")
  maxAttempts     Int      @default(3) @map("max_attempts")
  nextAttemptAt   DateTime? @map("next_attempt_at")
  
  claimedAt       DateTime? @map("claimed_at")
  claimedBy       String?  @map("claimed_by") // worker instance ID
  leaseExpiresAt  DateTime? @map("lease_expires_at")
  
  startedAt       DateTime? @map("started_at")
  completedAt     DateTime? @map("completed_at")
  
  result          Json?
  error           Json?
  
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  task            ContentOpsTask @relation(fields: [taskId], references: [id])
  
  @@index([status, nextAttemptAt])
  @@index([taskId])
  @@map("contentops_jobs")
}
```

### 3.3 contentops_notifications

```prisma
model ContentOpsNotification {
  id              String   @id @default(cuid())
  notificationId  String   @unique @map("notification_id")
  taskId          String   @map("task_id")
  
  type            String   // TASK_ACCEPTED/TASK_QUEUED/GENERATION_STARTED/NORMALIZATION_COMPLETED/QUALITY_PASSED/QUALITY_FAILED/CONTENT_SAVED/CONTENT_SCHEDULED/CONTENT_PUBLISHED/TASK_FAILED
  
  status          String   @default("PENDING") // PENDING/SENDING/SENT/FAILED
  
  payload         Json
  sentAt          DateTime? @map("sent_at")
  attemptCount    Int      @default(0) @map("attempt_count")
  maxAttempts     Int      @default(3) @map("max_attempts")
  lastError       String?  @map("last_error")
  
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  task            ContentOpsTask @relation(fields: [taskId], references: [id])
  
  @@index([status, createdAt])
  @@index([taskId])
  @@map("contentops_notifications")
}
```

### 3.4 contentops_audit_events

```prisma
model ContentOpsAuditEvent {
  id              String   @id @default(cuid())
  taskId          String?  @map("task_id")
  jobId           String?  @map("job_id")
  
  eventType       String   @map("event_type")
  eventData       Json     @map("event_data")
  
  actor           String   // bot/worker/api/system
  actorId         String?  @map("actor_id")
  
  createdAt       DateTime @default(now()) @map("created_at")
  
  task            ContentOpsTask? @relation(fields: [taskId], references: [id])
  
  @@index([taskId, createdAt])
  @@map("contentops_audit_events")
}
```

---

## 四、API Contract 设计

### 4.1 统一 API 入口

```
POST /api/internal/contentops
```

### 4.2 Actions

| Action | 描述 | 请求 | 响应 |
|--------|------|------|------|
| create_task | 创建任务 | CreateTaskRequest | CreateTaskResponse |
| get_task | 查询任务 | GetTaskRequest | GetTaskResponse |
| cancel_task | 取消任务 | CancelTaskRequest | CancelTaskResponse |
| claim_job | Worker 认领 Job | ClaimJobRequest | ClaimJobResponse |
| heartbeat_job | Worker 心跳 | HeartbeatJobRequest | HeartbeatJobResponse |
| complete_job | Worker 完成 Job | CompleteJobRequest | CompleteJobResponse |
| fail_job | Worker 失败 Job | FailJobRequest | FailJobResponse |
| save_content | 保存内容 | SaveContentRequest | SaveContentResponse |
| list_notifications | 列出通知 | ListNotificationsRequest | ListNotificationsResponse |
| mark_notification_sent | 标记通知已发送 | MarkNotificationSentRequest | MarkNotificationSentResponse |

### 4.3 Create Task Contract

**Request**:
```typescript
interface CreateTaskRequest {
  action: 'create_task';
  contentType: 'guide' | 'checklist' | 'topic';
  executionMode: 'draft_only' | 'review_required' | 'publish_when_validated' | 'schedule_when_validated' | 'publish_now';
  targetEnvironment: 'staging' | 'production';
  rawInput: string;
  idempotencyKey?: string;
  archivedTest?: boolean;
}
```

**Response (Success)**:
```typescript
interface CreateTaskResponse {
  ok: true;
  data: {
    task: {
      id: string; // task_xxx
      status: 'RECEIVED' | 'QUEUED';
      contentType: string;
    };
    job: {
      id: string; // job_xxx
      status: 'QUEUED';
    };
  };
}
```

**Response (Failure)**:
```typescript
interface CreateTaskResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}
```

---

## 五、状态机设计

### 5.1 Task 状态机

```
RECEIVED
  ↓
QUEUED (Job 创建成功)
  ↓
RUNNING (Worker 认领)
  ↓
NORMALIZING (内容规范化)
  ↓
QUALITY_CHECK (质量检查)
  ↓
┌─────────────────┬──────────────────┬─────────────────┐
│                 │                  │                 │
▼                 ▼                  ▼                 ▼
AWAITING_REVIEW  SCHEDULED        PUBLISHED        CHANGES_REQUESTED
(等待审核)       (定时发布)       (已发布)         (需要修改)
│                 │
│                 ▼
│              PUBLISHED
│
▼
FAILED (失败)
│
▼
CANCELLED (取消)
│
▼
ARCHIVED_TEST (测试归档)
```

### 5.2 Job 状态机

```
QUEUED
  ↓
CLAIMED (Worker 认领)
  ↓
RUNNING (执行中)
  ↓
┌─────────────┬──────────────┐
│             │              │
▼             ▼              ▼
SUCCEEDED   FAILED        RETRY_WAIT
(成功)      (失败)        (等待重试)
                          ↓
                       DEAD_LETTER
                       (死信)
```

### 5.3 Notification 状态机

```
PENDING
  ↓
SENDING (发送中)
  ↓
┌─────────┬──────────┐
│         │          │
▼         ▼          ▼
SENT    FAILED     PENDING
(已发送) (失败)    (重新排队)
```

---

## 六、Worker 设计

### 6.1 单一 Worker

```typescript
class ContentOpsWorker {
  async start() {
    while (true) {
      const job = await this.claimJob();
      if (!job) {
        await this.sleep(5000);
        continue;
      }
      
      try {
        await this.processJob(job);
        await this.completeJob(job);
      } catch (error) {
        await this.failJob(job, error);
      }
    }
  }
  
  async processJob(job: ContentOpsJob) {
    const task = await this.loadTask(job.taskId);
    
    // 1. Hermes Generation
    const generated = await this.hermesGenerate(task);
    
    // 2. Content Normalizer
    const normalized = await this.normalize(generated);
    
    // 3. Contract Validator
    await this.validateContract(normalized);
    
    // 4. Fact Validator
    await this.validateFacts(normalized);
    
    // 5. Internal Link Matcher
    const withLinks = await this.matchInternalLinks(normalized);
    
    // 6. SEO Enricher
    const withSeo = await this.enrichSeo(withLinks);
    
    // 7. Quality Checker
    const quality = await this.checkQuality(withSeo);
    
    if (!quality.passed) {
      await this.handleQualityFailure(task, quality);
      return;
    }
    
    // 8. Auto Revision (if needed)
    const revised = await this.autoRevise(withSeo, quality);
    
    // 9. Adapter (Guide/Checklist/Topic)
    const content = await this.adapt(revised, task.contentType);
    
    // 10. Application Service
    const saved = await this.saveContent(content, task);
    
    // 11. Update Task
    await this.updateTask(task, saved);
    
    // 12. Notification Outbox
    await this.enqueueNotification(task, 'CONTENT_SAVED');
  }
}
```

### 6.2 Content Pipeline

```
Hermes Generation
  ↓
Content Normalizer
  ↓
Contract Validator
  ↓
Fact Validator
  ↓
Internal Link Matcher
  ↓
SEO/GEO Enricher
  ↓
Quality Checker
  ↓
Auto Revision (if needed)
  ↓
Adapter (Guide/Checklist/Topic)
  ↓
Application Service
  ↓
Content Model
  ↓
Task State Update
  ↓
Notification Outbox
```

---

## 七、Notification 设计

### 7.1 通知类型

| Type | 触发时机 | 接收者 |
|------|----------|--------|
| TASK_ACCEPTED | 任务创建成功 | 用户 |
| TASK_QUEUED | 任务入队成功 | 系统 |
| GENERATION_STARTED | 开始生成 | 系统 |
| NORMALIZATION_COMPLETED | 规范化完成 | 系统 |
| QUALITY_PASSED | 质量通过 | 系统 |
| QUALITY_FAILED | 质量失败 | 用户 |
| CONTENT_SAVED | 内容保存 | 系统 |
| CONTENT_SCHEDULED | 内容定时 | 用户 |
| CONTENT_PUBLISHED | 内容发布 | 用户 |
| TASK_FAILED | 任务失败 | 用户 |

### 7.2 Notification Dispatcher

```typescript
class NotificationDispatcher {
  async start() {
    while (true) {
      const notifications = await this.fetchPendingNotifications();
      
      for (const notification of notifications) {
        await this.sendNotification(notification);
      }
      
      await this.sleep(5000);
    }
  }
  
  async sendNotification(notification: ContentOpsNotification) {
    try {
      await this.markSending(notification);
      
      // 根据 type 发送不同类型的通知
      switch (notification.type) {
        case 'CONTENT_PUBLISHED':
          await this.sendTelegramNotification(notification);
          break;
        // ...
      }
      
      await this.markSent(notification);
    } catch (error) {
      await this.markFailed(notification, error);
    }
  }
}
```

---

## 八、E2E 测试设计

### 8.1 测试命令

```bash
npm run contentops:e2e
```

### 8.2 测试场景

| 场景 | 描述 | 验证点 |
|------|------|--------|
| Guide E2E | 完整 Guide 流程 | Task → Job → Worker → Guide → Notification |
| Checklist E2E | 完整 Checklist 流程 | Task → Job → Worker → Checklist → Notification |
| Topic E2E | 完整 Topic 流程 | Task → Job → Worker → Topic → Notification |
| Failure Path | 任务失败路径 | Task → Job → Failed → Notification |
| Idempotency | 幂等重放 | 相同 idempotencyKey 不创建重复 Task |
| Retry | 重试机制 | Job 失败后自动重试 |
| Worker Crash | Worker 崩溃恢复 | Worker 重启后继续处理 |
| Quality Gate | 质量门禁 | 质量失败不进入 PUBLISHED |
| Scheduler | 定时发布 | scheduledAt 到达后自动发布 |
| Notification Failure | 通知失败 | 通知失败不影响内容任务 |
| Duplicate Update | 重复 Telegram Update | 不创建重复 Task |

### 8.3 测试架构

```typescript
describe('ContentOps E2E', () => {
  it('should create and process Guide', async () => {
    // 1. Create Task via API
    const task = await createTask({
      contentType: 'guide',
      executionMode: 'draft_only',
      rawInput: '测试指南',
    });
    
    // 2. Wait for Job to be claimed
    const job = await waitForJobStatus(task.jobId, 'RUNNING');
    
    // 3. Wait for content to be saved
    const content = await waitForContent(task.taskId);
    
    // 4. Verify database state
    expect(content.status).toBe('draft');
    expect(content.contentType).toBe('guide');
    
    // 5. Verify notification
    const notification = await getNotification(task.taskId, 'CONTENT_SAVED');
    expect(notification.status).toBe('SENT');
  });
});
```

---

## 九、迁移策略

### 9.1 Phase 1: 基础设施 (Week 1)

1. 创建数据库 Migration
2. 实现 Task/Job/Notification Service
3. 实现统一 API
4. 实现单一 Worker

### 9.2 Phase 2: 迁移 (Week 2)

1. Bot 切换到新 API
2. Worker 切换到新队列
3. Notification 切换到新 Outbox
4. 标记旧代码 deprecated

### 9.3 Phase 3: 验证 (Week 3)

1. 运行 E2E 测试
2. 真实 Telegram 测试
3. 性能测试
4. 回滚测试

### 9.4 Phase 4: 退役 (Week 4)

1. 删除旧 Worker
2. 删除文件队列
3. 删除旧 API
4. 清理临时脚本

---

## 十、回滚方案

### 10.1 回滚触发条件

- 新系统故障率 > 5%
- 数据丢失
- 性能下降 > 50%

### 10.2 回滚步骤

1. 停止新 Worker
2. 切换 Bot 到旧 API
3. 启动旧 Worker
4. 验证旧系统正常

### 10.3 回滚命令

```bash
# 停止新系统
launchctl unload ~/Library/LaunchAgents/ai.hermes.contentops.plist

# 切换到旧代码
git checkout 39f40b261f9b80427adb96e342c5a26a61c2f3c8

# 启动旧系统
launchctl load ~/Library/LaunchAgents/ai.hermes.contentops.plist
```

---

## 十一、风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 数据库 Migration 失败 | 高 | 先在 staging 测试，准备回滚 SQL |
| Worker 崩溃 | 中 | Job 自动重试，死信队列 |
| Notification 丢失 | 低 | 重试机制，最大尝试次数 |
| API 性能下降 | 中 | 数据库索引，连接池优化 |
| 数据不一致 | 高 | 事务，幂等性检查 |

---

## 十二、成功标准

- [ ] 所有 E2E 测试通过
- [ ] 真实 Telegram 测试通过
- [ ] 性能指标达标
- [ ] 旧系统已退役
- [ ] 文档完整
- [ ] 回滚测试通过
