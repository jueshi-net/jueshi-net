# ContentOps Database Migration Review Package

> 版本: v1.0
> 日期: 2026-07-22
> 状态: 待审查（未执行）

---

## 一、Migration 概览

### 1.1 目标

创建以下表：
- `contentops_jobs` - Job 队列
- `contentops_notifications` - 通知 Outbox
- `contentops_audit_events` - 审计事件

### 1.2 原则

- **Additive only**: 只添加新表，不修改现有表
- **Backward compatible**: 旧系统可以继续运行
- **Rollback ready**: 提供完整的回滚 SQL
- **Staging first**: 先在 staging 验证

---

## 二、Schema 设计

### 2.1 contentops_jobs

```prisma
model ContentOpsJob {
  id              String   @id @default(cuid())
  jobId           String   @unique @map("job_id")
  taskId          String   @map("task_id")
  
  status          String   @default("QUEUED")
  // QUEUED / CLAIMED / RUNNING / SUCCEEDED / FAILED / RETRY_WAIT / DEAD_LETTER
  
  attemptCount    Int      @default(0) @map("attempt_count")
  maxAttempts     Int      @default(3) @map("max_attempts")
  nextAttemptAt   DateTime? @map("next_attempt_at")
  
  claimedAt       DateTime? @map("claimed_at")
  claimedBy       String?  @map("claimed_by")
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

**字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| jobId | String | Job 唯一标识，格式：job_xxx |
| taskId | String | 关联的 Task ID |
| status | String | Job 状态 |
| attemptCount | Int | 当前尝试次数 |
| maxAttempts | Int | 最大尝试次数 |
| nextAttemptAt | DateTime? | 下次重试时间 |
| claimedAt | DateTime? | Worker 认领时间 |
| claimedBy | String? | Worker 实例 ID |
| leaseExpiresAt | DateTime? | 租约过期时间 |
| startedAt | DateTime? | 开始执行时间 |
| completedAt | DateTime? | 完成时间 |
| result | Json? | 执行结果 |
| error | Json? | 错误信息 |

### 2.2 contentops_notifications

```prisma
model ContentOpsNotification {
  id              String   @id @default(cuid())
  notificationId  String   @unique @map("notification_id")
  taskId          String   @map("task_id")
  
  type            String
  // TASK_ACCEPTED / TASK_QUEUED / GENERATION_STARTED / NORMALIZATION_COMPLETED
  // QUALITY_PASSED / QUALITY_FAILED / CONTENT_SAVED / CONTENT_SCHEDULED
  // CONTENT_PUBLISHED / TASK_FAILED
  
  status          String   @default("PENDING")
  // PENDING / SENDING / SENT / FAILED
  
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

### 2.3 contentops_audit_events

```prisma
model ContentOpsAuditEvent {
  id              String   @id @default(cuid())
  taskId          String?  @map("task_id")
  jobId           String?  @map("job_id")
  
  eventType       String   @map("event_type")
  eventData       Json     @map("event_data")
  
  actor           String
  actorId         String?  @map("actor_id")
  
  createdAt       DateTime @default(now()) @map("created_at")
  
  task            ContentOpsTask? @relation(fields: [taskId], references: [id])
  
  @@index([taskId, createdAt])
  @@map("contentops_audit_events")
}
```

---

## 三、Migration SQL

### 3.1 migration.sql

```sql
-- Create contentops_jobs table
CREATE TABLE "contentops_jobs" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "next_attempt_at" TIMESTAMP(3),
    "claimed_at" TIMESTAMP(3),
    "claimed_by" TEXT,
    "lease_expires_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "result" JSONB,
    "error" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contentops_jobs_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "contentops_jobs_job_id_key" ON "contentops_jobs"("job_id");
CREATE INDEX "contentops_jobs_status_next_attempt_at_idx" ON "contentops_jobs"("status", "next_attempt_at");
CREATE INDEX "contentops_jobs_task_id_idx" ON "contentops_jobs"("task_id");

-- Add foreign key
ALTER TABLE "contentops_jobs" ADD CONSTRAINT "contentops_jobs_task_id_fkey" 
    FOREIGN KEY ("task_id") REFERENCES "contentops_tasks"("id") ON DELETE CASCADE;

-- Create contentops_notifications table
CREATE TABLE "contentops_notifications" (
    "id" TEXT NOT NULL,
    "notification_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "sent_at" TIMESTAMP(3),
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contentops_notifications_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "contentops_notifications_notification_id_key" ON "contentops_notifications"("notification_id");
CREATE INDEX "contentops_notifications_status_created_at_idx" ON "contentops_notifications"("status", "created_at");
CREATE INDEX "contentops_notifications_task_id_idx" ON "contentops_notifications"("task_id");

-- Add foreign key
ALTER TABLE "contentops_notifications" ADD CONSTRAINT "contentops_notifications_task_id_fkey" 
    FOREIGN KEY ("task_id") REFERENCES "contentops_tasks"("id") ON DELETE CASCADE;

-- Create contentops_audit_events table
CREATE TABLE "contentops_audit_events" (
    "id" TEXT NOT NULL,
    "task_id" TEXT,
    "job_id" TEXT,
    "event_type" TEXT NOT NULL,
    "event_data" JSONB NOT NULL,
    "actor" TEXT NOT NULL,
    "actor_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contentops_audit_events_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "contentops_audit_events_task_id_created_at_idx" ON "contentops_audit_events"("task_id", "created_at");

-- Add foreign key
ALTER TABLE "contentops_audit_events" ADD CONSTRAINT "contentops_audit_events_task_id_fkey" 
    FOREIGN KEY ("task_id") REFERENCES "contentops_tasks"("id") ON DELETE SET NULL;
```

### 3.2 rollback.sql

```sql
-- Drop tables in reverse order
DROP TABLE IF EXISTS "contentops_audit_events";
DROP TABLE IF EXISTS "contentops_notifications";
DROP TABLE IF EXISTS "contentops_jobs";
```

### 3.3 preflight.sql

```sql
-- Check if tables already exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NULL THEN 'NOT EXISTS'
        ELSE 'EXISTS'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('contentops_jobs', 'contentops_notifications', 'contentops_audit_events');

-- Check if contentops_tasks table exists (required for foreign keys)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'contentops_tasks'
        ) THEN 'contentops_tasks EXISTS'
        ELSE 'contentops_tasks NOT FOUND - Migration will fail'
    END as prerequisite_check;
```

### 3.4 postflight.sql

```sql
-- Verify tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
    AND table_name IN ('contentops_jobs', 'contentops_notifications', 'contentops_audit_events');

-- Verify indexes
SELECT 
    indexname,
    tablename
FROM pg_indexes
WHERE tablename IN ('contentops_jobs', 'contentops_notifications', 'contentops_audit_events');

-- Verify foreign keys
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('contentops_jobs', 'contentops_notifications', 'contentops_audit_events');
```

---

## 四、Staging Dry-Run Procedure

### 4.1 准备阶段

```bash
# 1. 连接到 staging 服务器
ssh deploy@192.129.155.149

# 2. 备份当前数据库
pg_dump -U deploy -d xixiong_staging > backup_before_migration.sql

# 3. 验证备份
ls -lh backup_before_migration.sql
```

### 4.2 执行阶段

```bash
# 1. 运行 preflight 检查
psql -U deploy -d xixiong_staging -f preflight.sql

# 2. 执行 migration
psql -U deploy -d xixiong_staging -f migration.sql

# 3. 运行 postflight 验证
psql -U deploy -d xixiong_staging -f postflight.sql
```

### 4.3 验证阶段

```bash
# 1. 检查表结构
psql -U deploy -d xixiong_staging -c "\d contentops_jobs"
psql -U deploy -d xixiong_staging -c "\d contentops_notifications"
psql -U deploy -d xixiong_staging -c "\d contentops_audit_events"

# 2. 检查索引
psql -U deploy -d xixiong_staging -c "\di contentops_*"

# 3. 检查外键
psql -U deploy -d xixiong_staging -c "
SELECT tc.constraint_name, tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name LIKE 'contentops_%';
"
```

---

## 五、Queue Migration ADR

### 5.1 背景

当前 ContentOps 使用文件队列（`~/.jueshi-contentops/jobs/`）管理 Job。文件队列存在以下问题：

1. **无事务保证**: 文件写入和数据库状态不同步
2. **无重试机制**: Worker 崩溃后无法恢复
3. **无死信队列**: 失败的 Job 无法追踪
4. **多 Worker 冲突**: 文件锁机制不可靠

### 5.2 决策

迁移到数据库队列，使用 PostgreSQL 的 `SELECT ... FOR UPDATE SKIP LOCKED` 实现可靠的 Job 认领。

### 5.3 双写策略

迁移期间同时写入文件队列和数据库队列：

```
Task Creation
  ↓
  ├─→ File Queue (legacy)
  └─→ Database Queue (new)
  
Worker
  ↓
  ├─→ Read from Database Queue (primary)
  └─→ Fallback to File Queue (if database empty)
```

### 5.4 迁移步骤

1. **Phase 1**: 创建数据库表，启用双写
2. **Phase 2**: Worker 切换到数据库队列
3. **Phase 3**: 验证数据库队列稳定
4. **Phase 4**: 停止文件队列写入
5. **Phase 5**: 删除文件队列代码

### 5.5 回滚方案

如果数据库队列出现问题：
1. Worker 切换回文件队列
2. 停止数据库队列写入
3. 从文件队列恢复处理

---

## 六、Dual-Write Design

### 6.1 写入流程

```typescript
async function createTaskAndJob(input: CreateTaskInput) {
  // 1. Create task in database
  const task = await prisma.contentOpsTask.create({ data: input });
  
  // 2. Create job in database (new)
  const job = await prisma.contentOpsJob.create({
    data: {
      jobId: `job_${task.id}`,
      taskId: task.id,
      status: 'QUEUED',
    }
  });
  
  // 3. Write to file queue (legacy, during migration)
  if (DUAL_WRITE_ENABLED) {
    await writeFileQueueJob(job);
  }
  
  return { task, job };
}
```

### 6.2 读取流程

```typescript
async function claimJob(workerId: string) {
  // Try database queue first
  const dbJob = await prisma.contentOpsJob.findFirst({
    where: { status: 'QUEUED' },
    orderBy: { createdAt: 'asc' },
  });
  
  if (dbJob) {
    // Claim job with row lock
    const claimed = await prisma.$transaction(async (tx) => {
      const job = await tx.contentOpsJob.findUnique({
        where: { id: dbJob.id },
      });
      
      if (job && job.status === 'QUEUED') {
        return await tx.contentOpsJob.update({
          where: { id: job.id },
          data: {
            status: 'CLAIMED',
            claimedAt: new Date(),
            claimedBy: workerId,
            leaseExpiresAt: new Date(Date.now() + 300000), // 5 min lease
          }
        });
      }
      
      return null;
    });
    
    if (claimed) return claimed;
  }
  
  // Fallback to file queue
  if (FILE_QUEUE_FALLBACK_ENABLED) {
    return await claimFileQueueJob();
  }
  
  return null;
}
```

---

## 七、Rollback Runbook

### 7.1 触发条件

- 数据库表创建失败
- 外键约束错误
- 索引创建超时
- 数据不一致

### 7.2 回滚步骤

```bash
# 1. 停止所有 Worker
launchctl unload ~/Library/LaunchAgents/ai.hermes.contentops.plist

# 2. 连接到 staging 数据库
ssh deploy@192.129.155.149
psql -U deploy -d xixiong_staging

# 3. 执行回滚 SQL
\i rollback.sql

# 4. 验证表已删除
\dt contentops_*

# 5. 恢复文件队列
# (如果已经停止)

# 6. 重启 Worker
launchctl load ~/Library/LaunchAgents/ai.hermes.contentops.plist
```

### 7.3 验证回滚

```bash
# 1. 检查表不存在
psql -U deploy -d xixiong_staging -c "\dt contentops_*"
# Should show: contentops_tasks, contentops_schedules (no jobs/notifications/audit)

# 2. 检查 Worker 正常启动
ps aux | grep contentops

# 3. 检查文件队列正常
ls -la ~/.jueshi-contentops/jobs/inbox/
```

---

## 八、审查清单

### 8.1 Schema 审查

- [ ] 所有字段类型正确
- [ ] 索引设计合理
- [ ] 外键约束正确
- [ ] 默认值设置合理

### 8.2 Migration 审查

- [ ] SQL 语法正确
- [ ] 幂等性（可重复执行）
- [ ] 回滚 SQL 完整
- [ ] preflight/postflight 检查完整

### 8.3 双写审查

- [ ] 双写开关可控
- [ ] 失败回退机制
- [ ] 数据一致性保证

### 8.4 回滚审查

- [ ] 回滚步骤清晰
- [ ] 回滚验证完整
- [ ] 回滚时间可控

---

## 九、下一步

1. **审查本包**: 确认 Schema 设计和 Migration SQL
2. **授权执行**: 用户确认后在 staging 执行
3. **验证结果**: 运行 postflight 检查
4. **启用双写**: 开启数据库队列写入
5. **切换 Worker**: Worker 使用数据库队列
6. **淘汰文件队列**: 停止文件队列写入

---

## 十、联系信息

- **审查人**: 用户
- **执行人**: AI Agent
- **回滚负责人**: AI Agent + 用户确认
