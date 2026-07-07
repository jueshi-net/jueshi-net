# Night Pipeline v1

> 夜间自动化 patch-based 长链路基础设施  
> 版本: v1.0  
> 创建时间: 2026-07-08

---

## 1. 概述

Night Pipeline 是一个自动化的 patch-based 长链路执行系统，用于在夜间自动完成 V4 Shell 页面迁移等低风险 UI 统一任务。

### 核心原则

1. **Claude Code 只生成 patch** — 不直接写文件
2. **Hermes 只验证和应用** — 通过 ai-patch-runner 确定性执行
3. **安全优先** — 硬禁止文件永远不被修改
4. **可重复执行** — 所有脚本幂等（idempotent）
5. **失败自动回滚** — build 失败时 git reset --hard

---

## 2. 架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Night Pipeline v1                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  night-run.sh (编排器)                                       │
│    │                                                         │
│    ├── 1. hermes-health-check.sh   (健康检查)                │
│    ├── 2. dequeue task              (从 queue.json 取任务)   │
│    ├── 3. claude-generate-patch.sh  (Claude 生成 patch)      │
│    ├── 4. ai-patch-runner.sh        (验证 + apply + build)   │
│    ├── 5. deploy-staging.sh         (部署 staging)           │
│    ├── 6. curl verify               (HTTP 验证)              │
│    └── 7. update state              (更新 state.json)        │
│                                                              │
│  State files (.hermes/pipeline/):                            │
│    ├── state.json      (当前状态)                             │
│    ├── queue.json      (待执行任务队列)                       │
│    ├── completed.json  (已完成任务记录)                       │
│    ├── locks/          (运行锁)                               │
│    └── patches/        (生成的 patch 存档)                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 文件清单

### 脚本

| 脚本 | 作用 |
|------|------|
| `scripts/hermes-health-check.sh` | FD/进程/锁文件健康检查（只读，不杀进程） |
| `scripts/ai-patch-runner.sh` | 确定性 patch 应用器（allowlist + 硬禁止 + 自动回滚） |
| `scripts/claude-generate-patch.sh` | 调用 Claude Code 生成 unified diff patch |
| `scripts/night-run.sh` | 编排器：串联所有步骤，管理状态 |

### 状态文件

| 文件 | 作用 |
|------|------|
| `.hermes/pipeline/state.json` | 当前运行状态（IDLE/RUNNING/COMPLETED/FAILED） |
| `.hermes/pipeline/queue.json` | 待执行任务队列 |
| `.hermes/pipeline/completed.json` | 已完成任务记录 |
| `.hermes/pipeline/locks/` | 运行锁目录 |
| `.hermes/pipeline/patches/` | 生成的 patch 存档 |

### 文档

| 文件 | 作用 |
|------|------|
| `docs/NIGHT_PIPELINE.md` | 本文档 |
| `docs/PATCH_BASED_CLAUDE_PIPELINE.md` | Patch-based 流程详细说明 |
| `docs/nightly-task-state.md` | 夜间任务状态追踪 |

---

## 4. 使用方法

### 4.1 查看状态

```bash
./scripts/night-run.sh --status
```

### 4.2 添加任务到队列

```bash
./scripts/night-run.sh --enqueue "将 /guides 页面包裹为 JueshiV4PublicShell"
./scripts/night-run.sh --enqueue "将 /checklists 页面包裹为 JueshiV4PublicShell"
```

### 4.3 Dry Run（模拟执行）

```bash
./scripts/night-run.sh --dry-run
```

### 4.4 执行下一个任务

```bash
./scripts/night-run.sh
```

### 4.5 单独生成 patch

```bash
./scripts/claude-generate-patch.sh \
  "将 /guides 页面包裹为 JueshiV4PublicShell" \
  /tmp/guides-v4.patch
```

### 4.6 单独应用 patch

```bash
./scripts/ai-patch-runner.sh /tmp/guides-v4.patch
```

### 4.7 健康检查

```bash
./scripts/hermes-health-check.sh
./scripts/hermes-health-check.sh <PID>  # 检查特定进程
```

---

## 5. 状态码

### Pipeline 状态

| 状态 | 含义 |
|------|------|
| `IDLE` | 空闲，等待任务 |
| `RUNNING` | 正在执行任务 |
| `COMPLETED` | 任务完成 |
| `BLOCKED_BY_HEALTH_CHECK` | 健康检查阻塞 |
| `PATCH_GENERATION_FAILED` | Patch 生成失败 |
| `PATCH_APPLY_FAILED` | Patch 应用失败 |

### 结果码

| 码 | 含义 |
|------|------|
| `PATCH_APPLIED_BUILD_OK` | 成功 |
| `PATCH_BUILD_FAILED_ROLLED_BACK` | Build 失败已回滚 |
| `PATCH_HARD_BLOCKED_PATH` | 命中硬禁止文件 |
| `PATCH_OUTSIDE_ALLOWLIST` | 超出 allowlist |
| `NIGHT_QUEUE_EMPTY` | 队列为空 |
| `NIGHT_DRY_RUN_OK` | Dry run 成功 |
| `NIGHT_DEPLOY_FAILED` | 部署失败 |
| `CLAUDE_GENERATED_PATCH` | Claude 生成了 patch |
| `HERMES_APPLIED_PATCH` | Hermes 应用了 patch |
| `CLAUDE_CODE_RATE_LIMITED_PAUSED` | Claude 限流 |
| `CLAUDE_CODE_COOLDOWN_OR_CONCURRENT_BLOCKED` | Claude 并发阻塞 |
| `CLAUDE_PATCH_TIMEOUT` | Claude 超时 |
| `NIGHT_PATCH_NOT_FOUND` | 未找到 patch |

### 健康检查状态

| 状态 | 含义 |
|------|------|
| `HEALTH_OK` | 一切正常 |
| `HERMES_FD_WARNING` | FD > 500 |
| `HERMES_FD_CRITICAL` | FD > 1000 |
| `CLAUDE_RATE_LIMIT_ACTIVE` | Claude 限流锁存在 |
| `CLAUDE_RUNNING_LOCK_ACTIVE` | Claude 运行锁存在 |

---

## 6. 安全规则

### Allowlist（允许修改的路径）

```
src/app/(public)/**
src/components/layout/**
src/components/ui-lab/**
docs/**
```

### 硬禁止（永远不修改）

```
package.json
package-lock.json
prisma/schema.prisma
src/middleware.ts
src/app/api/**
src/lib/task-chain.ts
src/lib/destinations-db.ts
.env / .env.*
**/SKILL.md
```

### 其他红线

- ❌ 不碰 production
- ❌ 不碰 production DB
- ❌ 不碰 9833416@qq.com
- ❌ 不执行 prisma db push / migration
- ❌ 不新增依赖
- ❌ 不自动 production deploy（需用户确认）

---

## 7. 典型夜间流程

### Night 2 示例

```bash
# 1. 添加任务
./scripts/night-run.sh --enqueue "将 /guides 页面包裹为 JueshiV4PublicShell，修改 public-layout-client.tsx 添加 isGuides 跳过条件"
./scripts/night-run.sh --enqueue "将 /checklists 页面包裹为 JueshiV4PublicShell，修改 public-layout-client.tsx 添加 isChecklists 跳过条件"

# 2. 查看队列
./scripts/night-run.sh --status

# 3. Dry run
./scripts/night-run.sh --dry-run

# 4. 执行
./scripts/night-run.sh

# 5. 检查结果
./scripts/night-run.sh --status
git log --oneline -5
```

---

## 8. 故障排查

### 健康检查阻塞

```bash
./scripts/hermes-health-check.sh
# 如果 FD_CRITICAL，检查 FD 泄漏
lsof -p <PID> | wc -l
```

### Claude 限流

```bash
cat ~/.claude-code-bridge/rate-limit.lock
# 等待限流结束后重试
```

### Patch 应用失败

```bash
# 查看备份
ls .hermes/pipeline/patches/
# 手动回滚
git reset --hard HEAD
```

### 队列卡住

```bash
# 重置状态
echo '{"status":"IDLE","current_task":null,"last_run":null,"last_result":null}' > .hermes/pipeline/state.json
# 清除锁
rm -f .hermes/pipeline/locks/*
```

---

## 9. 下一步

1. ✅ 建立基础设施（本文档 + 脚本）
2. ⬜ 用户验收 `/tools` 和 `/destinations`
3. ⬜ Night 2: `/guides` + `/checklists` via patch-based pipeline
4. ⬜ Night 3: `/topics` + `/search` via patch-based pipeline
5. ⬜ 集成到 cron job 自动执行
6. ⬜ 建立 patch 模板库

---

**文档版本**: v1.0  
**创建时间**: 2026-07-08  
**关联脚本**: `scripts/night-run.sh`, `scripts/claude-generate-patch.sh`, `scripts/ai-patch-runner.sh`, `scripts/hermes-health-check.sh`
