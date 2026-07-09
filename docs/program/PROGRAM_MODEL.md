# Program Model - 项目管理四层模型

> 最后更新: 2026-07-09  
> 版本: v3.0 (Program Manager V3 - Checkpoint Engine)

---

## 模型层级

```
Program (项目)
  └─ Epic (史诗)
      └─ Batch (批次)
          └─ Task (任务)
              └─ Checkpoint (检查点)
                  └─ Resume (恢复)
```

---

## 层级定义

### 1. Program（项目）

**定义**: 跨越多周/月的大型战略目标，包含多个 Epic。

**特征**:
- 持续时间: 2-8 周
- 包含 3-10 个 Epic
- 有明确的业务目标和成功指标
- 需要跨团队协作

**当前 Programs**:

| Program | 目标 | 状态 | 进度 |
|---------|------|------|------|
| **Design System Migration** | 统一 UI 组件库，提升开发效率和用户体验 | 🟡 进行中 | 12% |
| **V4 Shell Unification** | 将所有公共页面迁移到 V4 Shell | 🟡 进行中 | 5% |
| **Workspace Enhancement** | 提升工作区功能和用户体验 | 🔴 未开始 | 0% |
| **Performance Optimization** | 优化页面加载速度和 SEO | 🔴 未开始 | 0% |

---

### 2. Epic（史诗）

**定义**: Program 下的主要工作单元，通常持续 1-2 周。

**特征**:
- 持续时间: 1-2 周
- 包含 3-8 个 Batch
- 有明确的交付物
- 可以独立验收

**当前 Epics**:

#### Program: Design System Migration

| Epic | 目标 | 状态 | 进度 |
|------|------|------|------|
| **DS-01: Foundation** | 建立 Design System 基础组件 | ✅ 完成 | 100% |
| **DS-02: Public Pages** | 将公共页面迁移到 Design System | 🟡 进行中 | 15% |
| **DS-03: Workspace Pages** | 将工作区页面迁移到 Design System | 🔴 未开始 | 0% |
| **DS-04: Admin Pages** | 将管理页面迁移到 Design System | 🔴 未开始 | 0% |
| **DS-05: Component Consolidation** | 合并重复组件 | 🟡 进行中 | 30% |

#### Program: V4 Shell Unification

| Epic | 目标 | 状态 | 进度 |
|------|------|------|------|
| **V4-01: Core Pages** | 统一核心公共页面（/, /tools, /resources） | ✅ 完成 | 100% |
| **V4-02: Content Pages** | 统一内容页面（/guides, /checklists, /topics） | 🟡 进行中 | 60% |
| **V4-03: Community Pages** | 统一社区页面（/community, /bbs） | 🔴 未开始 | 0% |
| **V4-04: Destination Pages** | 统一目的地页面（/destinations, /countries） | 🔴 未开始 | 0% |

---

### 3. Batch（批次）

**定义**: Epic 下的工作批次，通常在一个 Night Pipeline 中完成。

**特征**:
- 持续时间: 1 个 Night（2-4 小时）
- 包含 3-10 个 Task
- 有明确的验收标准
- 可以独立部署和验证

**当前 Batches**:

#### Epic: DS-02 Public Pages

| Batch | 目标 | 状态 | 完成时间 |
|-------|------|------|----------|
| **DS-02-B1: Starter & Pricing** | 应用 Design System 到 /starter, /pricing | ✅ 完成 | Night 5 |
| **DS-02-B2: Guides & Checklists** | 应用 Design System 到 /guides, /checklists | ✅ 完成 | Night 5 |
| **DS-02-B3: Topics & Search** | 应用 Design System 到 /topics, /search | 🔴 未开始 | - |
| **DS-02-B4: Resources** | 应用 Design System 到 /resources | 🔴 未开始 | - |

#### Epic: V4-02 Content Pages

| Batch | 目标 | 状态 | 完成时间 |
|-------|------|------|----------|
| **V4-02-B1: Guides** | 统一 /guides 到 V4 Shell | ✅ 完成 | Night 5 |
| **V4-02-B2: Checklists** | 统一 /checklists 到 V4 Shell | ✅ 完成 | Night 5 |
| **V4-02-B3: Topics** | 统一 /topics 到 V4 Shell | ✅ 完成 | Night 4 |
| **V4-02-B4: Search** | 统一 /search 到 V4 Shell | ✅ 完成 | Night 4 |

#### Epic: DS-05 Component Consolidation

| Batch | 目标 | 状态 | 完成时间 |
|-------|------|------|----------|
| **DS-05-B1: ActionCard** | 合并 ActionCard 组件 | ✅ 完成 | Night 6 |
| **DS-05-B2: StatusBadge** | 合并 StatusBadge 组件 | ✅ 完成 | Night 6 |
| **DS-05-B3: EmptyState** | 合并 EmptyState 组件 | ✅ 完成 | Night 6 |
| **DS-05-B4: WorkspaceSidebar** | 合并 WorkspaceSidebar 组件 | 🔴 未开始 | - |
| **DS-05-B5: ToolGrid** | 合并 ToolGrid 组件 | 🔴 未开始 | - |

---

### 4. Task（任务）

**定义**: Batch 下的最小工作单元，可以在一个 Pipeline 任务中完成。

**特征**:
- 持续时间: 15-60 分钟
- 修改 1-5 个文件
- 有明确的输入和输出
- 可以自动化执行

**Task 示例**:

```yaml
Task: Apply V4 Shell to /topics
Batch: V4-02-B3
Epic: V4-02 Content Pages
Program: V4 Shell Unification

Input:
  - src/app/(public)/topics/page.tsx
  - src/app/(public)/public-layout-client.tsx

Output:
  - 修改 topics/page.tsx，导入 JueshiV4PublicShell
  - 修改 public-layout-client.tsx，添加跳过逻辑

Verification:
  - Build 成功
  - Staging 部署成功
  - HTTP 200 验证通过
  - 无 Runtime Error

Allowed Files:
  - src/app/(public)/topics/page.tsx
  - src/app/(public)/public-layout-client.tsx

Status: ✅ 完成
Completed: Night 4
```

---

## 状态定义

### Program 状态

| 状态 | 图标 | 说明 |
|------|------|------|
| **未开始** | 🔴 | Program 已定义但未启动 |
| **进行中** | 🟡 | 至少有一个 Epic 在进行中 |
| **已完成** | ✅ | 所有 Epic 已完成 |
| **暂停** | ⏸️ | 因依赖或资源问题暂停 |
| **取消** | ❌ | Program 被取消 |

### Epic 状态

| 状态 | 图标 | 说明 |
|------|------|------|
| **未开始** | 🔴 | Epic 已定义但未启动 |
| **进行中** | 🟡 | 至少有一个 Batch 在进行中 |
| **已完成** | ✅ | 所有 Batch 已完成 |
| **阻塞** | 🚫 | 因依赖问题无法继续 |

### Batch 状态

| 状态 | 图标 | 说明 |
|------|------|------|
| **未开始** | 🔴 | Batch 已定义但未启动 |
| **进行中** | 🟡 | 正在执行 |
| **已完成** | ✅ | 所有 Task 已完成 |
| **失败** | ❌ | 执行失败，需要回滚 |
| **跳过** | ⏭️ | 因故跳过 |

### Task 状态

| 状态 | 图标 | 说明 |
|------|------|------|
| **未开始** | 🔴 | Task 已定义但未启动 |
| **进行中** | 🟡 | 正在执行 |
| **已完成** | ✅ | 执行成功 |
| **失败** | ❌ | 执行失败 |
| **跳过** | ⏭️ | 因故跳过 |

---

## 进度计算

### Program 进度

```
Program Progress = Σ(Epic Progress × Epic Weight) / Σ(Epic Weight)
```

### Epic 进度

```
Epic Progress = Σ(Batch Progress × Batch Weight) / Σ(Batch Weight)
```

### Batch 进度

```
Batch Progress = 完成的 Task 数 / 总 Task 数 × 100%
```

### 示例计算

**Program: Design System Migration**

```
DS-01 Foundation: 100% × 0.2 = 20%
DS-02 Public Pages: 15% × 0.3 = 4.5%
DS-03 Workspace Pages: 0% × 0.25 = 0%
DS-04 Admin Pages: 0% × 0.15 = 0%
DS-05 Component Consolidation: 30% × 0.1 = 3%

Total: 20% + 4.5% + 0% + 0% + 3% = 27.5%
```

---

## Program Queue 结构

```yaml
Program:
  id: program-001
  name: Design System Migration
  status: 🟡 进行中
  progress: 27.5%
  
  Epics:
    - id: epic-ds-02
      name: DS-02 Public Pages
      status: 🟡 进行中
      progress: 15%
      
      Batches:
        - id: batch-ds-02-b3
          name: DS-02-B3 Topics & Search
          status: 🔴 未开始
          progress: 0%
          
          Tasks:
            - id: task-001
              name: Apply Design System to /topics
              status: 🔴 未开始
              allowed_files:
                - src/app/(public)/topics/page.tsx
              verification:
                - build_success
                - staging_deploy
                - http_200
                - no_runtime_error
```

---

## 自动化规则

### 自动推进

**条件**:
- Task 状态为"未开始"
- 前一个 Task 已完成
- 无阻塞依赖
- 在允许的文件范围内

**动作**:
- 自动创建 Proposal
- 自动执行 Patch
- 自动验证
- 自动更新状态

### 暂停规则

**条件**:
- Build 失败
- Runtime Error
- 验证失败
- 超出允许文件范围

**动作**:
- 停止执行
- 发送告警
- 等待人工介入

### 恢复规则

**条件**:
- 人工修复问题
- 确认可以继续

**动作**:
- 从失败的 Task 重新开始
- 继续执行后续 Task

---

## 报告模板

### Morning Brief

```markdown
# Morning Brief - {日期}

## Program 概览

| Program | 进度 | 状态 |
|---------|------|------|
| Design System Migration | 27.5% | 🟡 进行中 |
| V4 Shell Unification | 5% | 🟡 进行中 |

## 昨夜完成

- ✅ Batch: DS-02-B2 Guides & Checklists
- ✅ Batch: V4-02-B1 Guides

## 今日计划

- 🟡 Batch: DS-02-B3 Topics & Search
- 🔴 Batch: DS-02-B4 Resources

## 阻塞问题

- 无

## 风险提醒

- 无
```

### Night Report

```markdown
# Night Report - {日期}

## 执行摘要

- 开始时间: {时间}
- 结束时间: {时间}
- 总耗时: {时长}

## 完成的工作

### Batch: DS-02-B3 Topics & Search

**Task 1**: Apply Design System to /topics
- 状态: ✅ 完成
- 修改文件: 2
- 验证: 通过

**Task 2**: Apply Design System to /search
- 状态: ✅ 完成
- 修改文件: 2
- 验证: 通过

## 进度更新

- Epic DS-02: 15% → 30%
- Program Design System Migration: 27.5% → 32%

## 问题与风险

- 无

## 下一步

- Batch: DS-02-B4 Resources
```

---

## 6. Checkpoint Engine（V3 新增）

### 6.1 概述

Checkpoint Engine 是 Program Manager V3 的核心特性，提供四级 checkpoint 保存和恢复能力。

### 6.2 Checkpoint 层级

```
Program Checkpoint (.hermes/pipeline/checkpoints/program.json)
├── Epic Checkpoint (epic.json)
├── Batch Checkpoint (batch.json)
└── Task Checkpoint (task.json)
```

### 6.3 Checkpoint 文件结构

**program.json**
```json
{
  "program_id": "design-system-migration",
  "status": "in_progress",
  "progress": 27.5,
  "started_at": "2026-07-09T00:00:00Z",
  "updated_at": "2026-07-09T12:00:00Z"
}
```

**epic.json**
```json
{
  "epic_id": "DS-02",
  "program_id": "design-system-migration",
  "status": "in_progress",
  "progress": 30,
  "started_at": "2026-07-09T00:00:00Z",
  "updated_at": "2026-07-09T12:00:00Z"
}
```

**batch.json**
```json
{
  "batch_id": "DS-02-B3",
  "epic_id": "DS-02",
  "status": "in_progress",
  "progress": 0,
  "started_at": "2026-07-09T12:00:00Z",
  "updated_at": "2026-07-09T12:00:00Z"
}
```

**task.json**
```json
{
  "task_id": "ds-02-b3-topics",
  "batch_id": "DS-02-B3",
  "status": "completed",
  "proposal_path": ".hermes/pipeline/proposals/ds-02-b3-topics",
  "patch_path": ".hermes/pipeline/patches/ds-02-b3-topics.patch",
  "build_status": "ok",
  "deploy_status": "ok",
  "runtime_status": "ok",
  "retry_count": 0,
  "rate_limit_status": null,
  "started_at": "2026-07-09T12:00:00Z",
  "completed_at": "2026-07-09T12:15:00Z"
}
```

### 6.4 Checkpoint 保存时机

Checkpoint 在以下时机自动保存：

1. **Task 开始执行时** - 保存 in_progress 状态
2. **Task 执行失败时** - 保存 failed 状态和错误信息
3. **Task 执行成功时** - 保存 completed 状态和完成时间
4. **Rate limit 暂停时** - 保存 rate_limit_status
5. **Retry 发生时** - 更新 retry_count

### 6.5 Resume Engine

Resume Engine 在 night-run.sh 启动时自动检测 checkpoint：

```bash
# 启动时自动检查
if [ -f "$CHECKPOINT_DIR/task.json" ]; then
  task_status=$(jq -r '.status' "$CHECKPOINT_DIR/task.json")
  if [ "$task_status" = "in_progress" ] || [ "$task_status" = "failed" ]; then
    # 自动恢复
    resume_from_checkpoint
  fi
fi
```

**恢复策略**：
- 如果 task 状态为 `in_progress` 或 `failed`，自动恢复到该 task
- 不会重新执行已完成的 task
- 不会重新分析，直接从 checkpoint 恢复

### 6.6 Program State

Program State 文件 (`.hermes/pipeline/program-state.json`) 维护全局状态：

```json
{
  "current_program": "design-system-migration",
  "current_epic": "DS-02",
  "current_batch": "DS-02-B3",
  "current_task": "ds-02-b3-topics",
  "progress": 27.5,
  "last_success": "2026-07-09T12:15:00Z",
  "last_failure": null,
  "eta": "2026-07-10T00:00:00Z",
  "remaining_tasks": 5,
  "remaining_batches": 2
}
```

### 6.7 命令

**查看 Program 状态**
```bash
bash scripts/night-run.sh --program-status
```

输出：
```
═══════════════════════════════════════════════
  Program Manager V3 — Program Status
═══════════════════════════════════════════════

Program State:
  Program:        design-system-migration
  Epic:           DS-02
  Batch:          DS-02-B3
  Task:           ds-02-b3-topics
  Progress:       27.5%
  Last Success:   2026-07-09T12:15:00Z
  Last Failure:   None
  ETA:            2026-07-10T00:00:00Z
  Remaining Tasks: 5
  Remaining Batches: 2
  Updated:        2026-07-09T12:15:00Z

Checkpoints:
  ✅ program.json         design-system-migration    status=in_progress   updated=2026-07-09T12:15:00Z
  ✅ epic.json            DS-02                      status=in_progress   updated=2026-07-09T12:15:00Z
  ✅ batch.json           DS-02-B3                   status=in_progress   updated=2026-07-09T12:15:00Z
  ✅ task.json            ds-02-b3-topics            status=completed     updated=2026-07-09T12:15:00Z | completed: 2026-07-09T12:15:00Z

Rate Limit: OK (no active rate limit)

Reports:
  ✅ morning-brief.md (updated: 2026-07-09 12:15:00)
  ✅ night-report.md (updated: 2026-07-09 12:15:00)
```

### 6.8 Morning Brief V2

自动生成 `.hermes/reports/morning-brief.md`：

```markdown
# Morning Brief V2

**Generated:** 2026-07-09 08:00:00

## Program Progress

- **Current Program:** design-system-migration
- **Current Epic:** DS-02
- **Current Batch:** DS-02-B3
- **Current Task:** ds-02-b3-topics
- **Progress:** 27.5%
- **Last Success:** 2026-07-09T00:15:00Z
- **Last Failure:** None
- **ETA:** 2026-07-10T00:00:00Z
- **Remaining Tasks:** 5
- **Remaining Batches:** 2

## Yesterday Completed

- ✅ ds-02-b3-topics - PATCH_APPLIED_BUILD_OK
- ✅ ds-02-b3-search - PATCH_APPLIED_BUILD_OK

## Today's Plan

- Continue with: ds-02-b4-resources
- Target progress: 35%

## Blocked Items

- No blocked items

## Need Human Review

- Check staging environment for visual verification

## Next Batch

- DS-02-B4
```

### 6.9 Night Report V2

自动生成 `.hermes/reports/night-report.md`：

```markdown
# Night Report V2

**Run ID:** night-20260709-120000
**Generated:** 2026-07-09 12:15:00

## Completed Tasks

- ✅ ds-02-b3-topics
  - Result: PATCH_APPLIED_BUILD_OK
  - Completed: 2026-07-09T12:15:00Z

## Task Details

- **Task ID:** ds-02-b3-topics
- **Status:** completed
- **Proposal Path:** .hermes/pipeline/proposals/ds-02-b3-topics
- **Patch Path:** .hermes/pipeline/patches/ds-02-b3-topics.patch
- **Build Status:** ok
- **Deploy Status:** ok
- **Runtime Status:** ok
- **Retry Count:** 0
- **Rate Limit Status:** None

## Program State

- **Progress:** 27.5%
- **Current Batch:** DS-02-B3
- **Remaining Tasks:** 5

## Risks

- No risks detected

## Next Steps

- Continue with: ds-02-b4-resources
```

### 6.10 Crash Recovery

如果 Hermes 或系统崩溃，checkpoint 会自动恢复：

```bash
# 场景：执行到一半时系统崩溃
# 重启后运行：
bash scripts/night-run.sh

# 输出：
[INFO] Found incomplete task: ds-02-b3-topics (status: in_progress)
[INFO] Resuming from checkpoint: design-system-migration/DS-02/DS-02-B3/ds-02-b3-topics
[STEP] 1/7 Health check
[OK] Health check passed
[STEP] 2/7 Dequeue next task
[OK] Task ID: ds-02-b3-topics
...
```

**恢复保证**：
- 不会重新执行已完成的 task
- 不会重新分析，直接从 checkpoint 恢复
- 保留所有中间状态（proposal、patch、retry count 等）

---

**文档状态**: PROGRAM_MODEL_V3_CHECKPOINT_ENGINE  
**版本**: v3.0  
**创建时间**: 2026-07-09  
**下次更新**: Program 状态变更时
