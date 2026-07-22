# ContentOps 迁移与回滚方案

> 版本: v1.0
> 日期: 2026-07-22
> 状态: 设计中

---

## 一、迁移概览

### 1.1 迁移阶段

| 阶段 | 内容 | 风险 | 回滚难度 |
|------|------|------|----------|
| Phase 1 | 数据库 Schema | 中 | 低 |
| Phase 2 | API Contract | 高 | 中 |
| Phase 3 | Worker 迁移 | 中 | 中 |
| Phase 4 | 文件队列淘汰 | 低 | 低 |
| Phase 5 | 旧代码退役 | 低 | 低 |

### 1.2 迁移时间线

```
Week 1: Phase 1 + Phase 2
Week 2: Phase 3
Week 3: Phase 4 + 验证
Week 4: Phase 5 + 退役
```

---

## 二、Phase 1: 数据库 Schema 迁移

### 2.1 Migration 文件

**文件名**: `20260722000000_add_contentops_job_queue`

**SQL**:
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

### 2.2 数据迁移

**现有数据**:
- `contentops_tasks` 表已存在
- 需要添加 `contentops_jobs`、`contentops_notifications`、`contentops_audit_events` 表

**迁移步骤**:
1. 在 staging 执行 Migration
2. 验证表结构
3. 验证索引
4. 验证外键

### 2.3 回滚 SQL

```sql
-- Drop tables in reverse order
DROP TABLE IF EXISTS "contentops_audit_events";
DROP TABLE IF EXISTS "contentops_notifications";
DROP TABLE IF EXISTS "contentops_jobs";
```

---

## 三、Phase 2: API Contract 迁移

### 3.1 旧 Contract

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

### 3.2 新 Contract

**统一返回**:
```json
{
  "ok": true,
  "data": {
    "task": {
      "id": "task_xxx",
      "status": "QUEUED",
      "contentType": "guide"
    },
    "job": {
      "id": "job_xxx",
      "status": "QUEUED"
    }
  }
}
```

### 3.3 迁移步骤

1. Bridge API 切换到新 Contract
2. Bot 切换到新 Contract
3. 验证响应格式
4. 运行 E2E 测试

### 3.4 回滚方案

如果新 Contract 导致问题：
1. Bridge API 回滚到旧 Contract
2. Bot 回滚到旧 Contract
3. 验证旧系统正常

---

## 四、Phase 3: Worker 迁移

### 4.1 旧 Worker

**文件队列 Worker**:
- 读取 `~/.jueshi-contentops/jobs/inbox/`
- 处理 Job
- 写入 `outbox/` 或 `failed/`

### 4.2 新 Worker

**数据库队列 Worker**:
- 从 `contentops_jobs` 表认领 Job
- 处理 Job
- 更新 Job 状态

### 4.3 迁移步骤

1. 部署新 Worker 代码
2. 停止旧 Worker
3. 启动新 Worker
4. 验证 Job 处理正常
5. 监控错误率

### 4.4 回滚方案

如果新 Worker 导致问题：
1. 停止新 Worker
2. 启动旧 Worker
3. 验证文件队列处理正常

---

## 五、Phase 4: 文件队列淘汰

### 5.1 淘汰步骤

1. 确认所有 Job 已处理完成
2. 备份文件队列数据
3. 删除文件队列代码
4. 删除 `~/.jueshi-contentops/jobs/` 目录

### 5.2 回滚方案

如果淘汰后发现问题：
1. 恢复文件队列代码
2. 恢复 `~/.jueshi-contentops/jobs/` 目录
3. 从备份恢复数据

---

## 六、Phase 5: 旧代码退役

### 6.1 退役清单

- [ ] hermes-contentops-worker.js
- [ ] hermes-contentops-worker-mac.js
- [ ] draft-bridge-client.ts
- [ ] local-hermes-agent-client.ts
- [ ] hermes-gateway-client.ts
- [ ] hermes-job-bridge.ts
- [ ] 临时脚本

### 6.2 退役步骤

1. 标记为 deprecated
2. 观察 1 周
3. 确认无引用
4. 删除代码

### 6.3 回滚方案

如果删除后发现问题：
1. 从 Git 历史恢复代码
2. 重新部署

---

## 七、回滚触发条件

### 7.1 立即回滚

- 数据丢失
- 任务创建失败率 > 10%
- Worker 崩溃率 > 5%
- 通知发送失败率 > 10%

### 7.2 观察后回滚

- 性能下降 > 50%
- 错误率上升 > 20%
- 用户投诉增加

---

## 八、回滚命令

### 8.1 快速回滚

```bash
# 1. 停止新系统
launchctl unload ~/Library/LaunchAgents/ai.hermes.contentops.plist

# 2. 切换到旧代码
cd /Users/chq/xixiong-saas
git checkout 39f40b261f9b80427adb96e342c5a26a61c2f3c8

# 3. 重新安装依赖
npm install

# 4. 启动旧系统
launchctl load ~/Library/LaunchAgents/ai.hermes.contentops.plist

# 5. 验证旧系统正常
ps aux | grep contentops
```

### 8.2 数据库回滚

```bash
# 1. 连接到 staging 数据库
ssh deploy@192.129.155.149
psql -U deploy -d xixiong_staging

# 2. 执行回滚 SQL
DROP TABLE IF EXISTS "contentops_audit_events";
DROP TABLE IF EXISTS "contentops_notifications";
DROP TABLE IF EXISTS "contentops_jobs";

# 3. 验证表已删除
\dt contentops_*
```

### 8.3 Staging 回滚

```bash
# 1. 连接到 staging 服务器
ssh deploy@192.129.155.149

# 2. 切换到旧代码
cd /home/deploy/xixiong-saas-staging
git checkout 39f40b261f9b80427adb96e342c5a26a61c2f3c8

# 3. 重新构建
npm install
npm run build

# 4. 重启 PM2
pm2 restart xixiong-staging

# 5. 验证
pm2 status
curl https://i.jueshi.net/api/health
```

---

## 九、验证清单

### 9.1 迁移后验证

- [ ] 数据库表结构正确
- [ ] 索引已创建
- [ ] 外键已添加
- [ ] API 响应格式正确
- [ ] Worker 正常启动
- [ ] Job 处理正常
- [ ] 通知发送正常
- [ ] E2E 测试通过
- [ ] 真实 Telegram 测试通过

### 9.2 回滚后验证

- [ ] 旧系统正常启动
- [ ] 文件队列处理正常
- [ ] API 响应格式正确
- [ ] Worker 正常启动
- [ ] Job 处理正常
- [ ] 通知发送正常
- [ ] 真实 Telegram 测试通过

---

## 十、监控指标

### 10.1 迁移期间监控

| 指标 | 阈值 | 告警 |
|------|------|------|
| 任务创建成功率 | < 95% | 立即回滚 |
| Worker 崩溃率 | > 5% | 立即回滚 |
| Job 处理延迟 | > 5min | 观察 |
| 通知发送失败率 | > 10% | 立即回滚 |
| API 响应时间 | > 2s | 观察 |

### 10.2 日志检查

```bash
# Mac Bot 日志
tail -f ~/Library/Logs/ai.hermes.contentops.log

# Staging 日志
ssh deploy@192.129.155.149
pm2 logs xixiong-staging

# Worker 日志
tail -f ~/.jueshi-contentops/logs/worker.log
```

---

## 十一、联系人与升级

### 11.1 迁移负责人

- 开发: AI Agent
- 审核: 用户
- 部署: AI Agent

### 11.2 升级路径

1. 发现问题 → 立即回滚
2. 回滚失败 → 联系用户
3. 数据丢失 → 从备份恢复
4. 无法恢复 → 重建环境

---

## 十二、附录

### 12.1 相关文档

- `current-runtime-topology.md` - 当前运行态拓扑
- `refactor-design.md` - 重构设计
- `duplicate-path-inventory.md` - 重复路径清单

### 12.2 相关代码

- `src/lib/contentops/canonical-task-service.ts`
- `src/app/api/internal/contentops/drafts/route.ts`
- `scripts/contentops/contentops-telegram-bot.ts`
- `scripts/contentops/hermes-contentops-worker.ts`

### 12.3 相关配置

- `~/Library/LaunchAgents/ai.hermes.contentops.plist`
- `prisma/schema.prisma`
- `package.json`
