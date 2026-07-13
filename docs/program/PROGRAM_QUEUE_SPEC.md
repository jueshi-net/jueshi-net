# Program Queue Specification

> 最后更新: 2026-07-09  
> 版本: v2.0 (Program Manager V2)

---

## 0. 服务器环境永久规则

### 0.1 环境分离模式

当前采用开发/预览服务器与生产服务器分离模式。

### 0.2 Staging / 开发预览环境

| 项目 | 值 |
|------|-----|
| SSH | `deploy@192.129.155.149` |
| PM2 | `xixiong-staging` |
| 域名 | `i.jueshi.net` |
| 目录 | `/home/deploy/xixiong-saas-staging` |
| 权限 | 仅允许 staging build / staging deploy / staging DB |

### 0.3 Production / 生产环境

| 项目 | 值 |
|------|-----|
| SSH | 必须单独确认后才能操作 |
| PM2 | 必须单独确认后才能操作 |
| 域名 | `jueshi.net` |
| 目录 | 必须单独确认后才能操作 |

**生产环境操作前提**：
- 必须单独确认生产服务器 SSH、PM2、目录、域名后才能操作
- 未经用户在当前对话明确授权，禁止连接 production
- 禁止生产 DB migration / db push / 数据修改

### 0.4 SSH 连接故障诊断

遇到 SSH banner/kex/timeout 时：
1. **第一优先级**检查是否连错用户、连错服务器、连错环境
2. 不得默认判定服务器故障

### 0.5 永久禁止

- ❌ 不得用 root/admin/chq 等用户替代 deploy
- ❌ 不得混用 staging 与 production
- ❌ 不得触碰 9833416@qq.com

---

## 0. SSH 部署永久规则

**xixiong-saas staging/production SSH 连接必须使用 `deploy@192.129.155.149`。**

遇到 banner/kex 超时，先核对用户名，不得尝试 root/admin/chq。

**禁止使用的用户名**：
- ❌ root
- ❌ admin
- ❌ chq
- ❌ 其他任何用户名

**唯一允许的用户名**：
- ✅ deploy

**服务器地址**：
- Staging: `192.129.155.149`
- Production: `192.129.155.149` (同一服务器，不同 PM2 应用)

---

## 概述

Program Queue 是 Hermes 执行任务的核心数据结构。它定义了从 Program 到 Task 的完整执行路径，包括允许的文件、验证规则、回滚策略等。

**核心原则**:
- 每个 Task 必须明确定义允许修改的文件
- 每个 Task 必须定义验证规则
- 每个 Task 必须定义回滚策略
- 每个 Batch 必须定义完成标准
- 每个 Epic 必须定义验收标准

---

## Queue 结构

### 层级关系

```
Program Queue
├── Program: Design System Migration
│   ├── Epic: DS-01 Foundation (✅ 完成)
│   ├── Epic: DS-02 Public Pages (🟡 进行中)
│   │   ├── Batch: DS-02-B1 (✅ 完成)
│   │   ├── Batch: DS-02-B2 (✅ 完成)
│   │   ├── Batch: DS-02-B3 (🔴 待执行)
│   │   ├── Batch: DS-02-B4 (🔴 待执行)
│   │   └── Batch: DS-02-B5 (🔴 待执行)
│   ├── Epic: DS-03 Workspace Pages (🔴 未开始)
│   ├── Epic: DS-04 Admin Pages (🔴 未开始)
│   └── Epic: DS-05 Component Consolidation (🟡 进行中)
│       ├── Batch: DS-05-B1 (✅ 完成)
│       ├── Batch: DS-05-B2 (✅ 完成)
│       ├── Batch: DS-05-B3 (✅ 完成)
│       ├── Batch: DS-05-B4 (🔴 待执行)
│       └── Batch: DS-05-B5 (🔴 待执行)
└── Program: V4 Shell Unification
    ├── Epic: V4-01 Core Pages (✅ 完成)
    ├── Epic: V4-02 Content Pages (🟡 进行中)
    ├── Epic: V4-03 Community Pages (🔴 未开始)
    └── Epic: V4-04 Destination Pages (🔴 未开始)
```

---

## Task 定义规范

### Task 结构

```yaml
task:
  id: "ds-02-b3-topics-search"
  name: "Apply Design System to /topics and /search"
  batch: "DS-02-B3"
  epic: "DS-02 Public Pages"
  program: "Design System Migration"
  
  # 执行配置
  execution:
    mode: "full-file-proposal"  # full-file-proposal | patch-only | manual
    priority: "P1"  # P0 | P1 | P2 | P3
    estimated_duration: "30-45min"
    risk_level: "low"  # low | medium | high
    
  # 允许修改的文件
  allowed_files:
    - "src/app/(public)/topics/page.tsx"
    - "src/app/(public)/search/page.tsx"
    - "src/app/(public)/public-layout-client.tsx"
  
  # 禁止修改的文件
  forbidden_files:
    - "src/components/**"
    - "prisma/**"
    - "package.json"
    - "package-lock.json"
  
  # 验证规则
  verification:
    build: true
    deploy_staging: true
    http_status: 200
    runtime_check: true
    visual_check: false  # 需要人工
    
  # 回滚策略
  rollback:
    strategy: "git-reset"  # git-reset | file-revert | manual
    trigger: "build-fail | deploy-fail | runtime-error"
    auto_rollback: true
    
  # 依赖关系
  dependencies:
    requires: []
    blocks: []
    
  # 状态
  status: "pending"  # pending | running | completed | failed | rolled-back
  completed_at: null
  commit_hash: null
```

---

## Batch 定义规范

### Batch 结构

```yaml
batch:
  id: "DS-02-B3"
  name: "Topics & Search Design System"
  epic: "DS-02 Public Pages"
  
  # 目标
  objective: "将 /topics 和 /search 页面迁移到 Design System"
  
  # 包含的 Tasks
  tasks:
    - "ds-02-b3-topics-search"
  
  # 完成标准
  completion_criteria:
    - "所有 Task 状态为 completed"
    - "Build 成功"
    - "Staging 部署成功"
    - "HTTP 200 验证通过"
    - "无 Runtime Error"
  
  # 验收标准
  acceptance_criteria:
    - "页面视觉一致性检查通过"
    - "功能测试通过"
    - "性能指标无退化"
    
  # 状态
  status: "pending"  # pending | running | completed | failed
  progress: 0  # 0-100
  started_at: null
  completed_at: null
```

---

## Epic 定义规范

### Epic 结构

```yaml
epic:
  id: "DS-02"
  name: "Public Pages Design System"
  program: "Design System Migration"
  
  # 目标
  objective: "将所有公共页面迁移到 Design System"
  
  # 包含的 Batches
  batches:
    - "DS-02-B1"
    - "DS-02-B2"
    - "DS-02-B3"
    - "DS-02-B4"
    - "DS-02-B5"
  
  # 完成标准
  completion_criteria:
    - "所有 Batch 状态为 completed"
    - "所有页面使用 Design System 组件"
    - "Design System 覆盖率达到目标值"
    
  # 验收标准
  acceptance_criteria:
    - "所有页面视觉一致性检查通过"
    - "所有页面功能测试通过"
    - "性能指标无退化"
    - "用户验收通过"
    
  # 状态
  status: "in-progress"  # not-started | in-progress | completed | blocked
  progress: 30  # 0-100
  started_at: "2026-07-09T00:00:00Z"
  completed_at: null
```

---

## Program 定义规范

### Program 结构

```yaml
program:
  id: "design-system-migration"
  name: "Design System Migration"
  
  # 目标
  objective: "统一 UI 组件库，提升开发效率和用户体验"
  
  # 成功指标
  success_metrics:
    - "Design System 覆盖率达到 80%"
    - "重复组件数量降至 0"
    - "开发效率提升 30%"
    
  # 包含的 Epics
  epics:
    - "DS-01"
    - "DS-02"
    - "DS-03"
    - "DS-04"
    - "DS-05"
  
  # 完成标准
  completion_criteria:
    - "所有 Epic 状态为 completed"
    - "所有成功指标达成"
    
  # 状态
  status: "in-progress"  # not-started | in-progress | completed | paused | cancelled
  progress: 27.5  # 0-100
  started_at: "2026-07-09T00:00:00Z"
  completed_at: null
  
  # 时间线
  timeline:
    estimated_completion: "2026-07-20"
    actual_completion: null
```

---

## 当前 Program Queue

### Program: Design System Migration

**状态**: 🟡 进行中  
**进度**: 27.5%

#### Epic: DS-02 Public Pages

**状态**: 🟡 进行中  
**进度**: 30%

**Batch: DS-02-B3 Topics & Search**

```yaml
batch:
  id: "DS-02-B3"
  name: "Topics & Search Design System"
  status: "pending"
  progress: 0
  
  tasks:
    - id: "ds-02-b3-topics"
      name: "Apply Design System to /topics"
      status: "pending"
      allowed_files:
        - "src/app/(public)/topics/page.tsx"
      verification:
        build: true
        deploy_staging: true
        http_status: 200
        runtime_check: true
        
    - id: "ds-02-b3-search"
      name: "Apply Design System to /search"
      status: "pending"
      allowed_files:
        - "src/app/(public)/search/page.tsx"
      verification:
        build: true
        deploy_staging: true
        http_status: 200
        runtime_check: true
```

**Batch: DS-02-B4 Resources**

```yaml
batch:
  id: "DS-02-B4"
  name: "Resources Design System"
  status: "pending"
  progress: 0
  
  tasks:
    - id: "ds-02-b4-resources"
      name: "Apply Design System to /resources"
      status: "pending"
      allowed_files:
        - "src/app/(public)/resources/page.tsx"
        - "src/app/(public)/resources/[slug]/page.tsx"
      verification:
        build: true
        deploy_staging: true
        http_status: 200
        runtime_check: true
```

**Batch: DS-02-B5 Tools**

```yaml
batch:
  id: "DS-02-B5"
  name: "Tools Design System"
  status: "pending"
  progress: 0
  
  tasks:
    - id: "ds-02-b5-tools"
      name: "Apply Design System to /tools"
      status: "pending"
      allowed_files:
        - "src/app/(public)/tools/page.tsx"
        - "src/app/(public)/tools/[tool-name]/page.tsx"
      verification:
        build: true
        deploy_staging: true
        http_status: 200
        runtime_check: true
```

#### Epic: DS-05 Component Consolidation

**状态**: 🟡 进行中  
**进度**: 60%

**Batch: DS-05-B4 WorkspaceSidebar**

```yaml
batch:
  id: "DS-05-B4"
  name: "WorkspaceSidebar Consolidation"
  status: "pending"
  progress: 0
  
  tasks:
    - id: "ds-05-b4-workspace-sidebar"
      name: "Consolidate WorkspaceSidebar"
      status: "pending"
      allowed_files:
        - "src/components/workspace/WorkspaceSidebar.tsx"
        - "src/components/saas/WorkspaceSidebar.tsx"
        - "src/app/(workspace)/**/page.tsx"
      verification:
        build: true
        deploy_staging: true
        runtime_check: true
      rollback:
        strategy: "git-reset"
        auto_rollback: true
```

**Batch: DS-05-B5 ToolGrid**

```yaml
batch:
  id: "DS-05-B5"
  name: "ToolGrid Consolidation"
  status: "pending"
  progress: 0
  
  tasks:
    - id: "ds-05-b5-tool-grid"
      name: "Consolidate ToolGrid"
      status: "pending"
      allowed_files:
        - "src/components/design-system/ToolGrid.tsx"
        - "src/components/home/tool-grid.tsx"
        - "src/components/tools/tool-grid.tsx"
        - "src/app/(public)/page.tsx"
        - "src/app/(public)/tools/page.tsx"
      verification:
        build: true
        deploy_staging: true
        runtime_check: true
      rollback:
        strategy: "git-reset"
        auto_rollback: true
```

---

## Queue 执行规则

### 执行命令

```bash
# 查看帮助
bash scripts/night-run.sh --help

# 查看状态
bash scripts/night-run.sh --status

# 查看队列
bash scripts/night-run.sh --list

# 模拟运行（不实际执行）
bash scripts/night-run.sh --dry-run

# 运行下一个任务
bash scripts/night-run.sh

# Program Manager V2 命令
bash scripts/night-run.sh --batch DS-02-B3 --dry-run
bash scripts/night-run.sh --task ds-05-b4-1 --dry-run
bash scripts/night-run.sh --batch DS-02-B3
bash scripts/night-run.sh --task ds-05-b4-1
```

### 可用 Batch 列表

- `DS-02-B3` — Topics & Search Design System
- `DS-05-B4` — WorkspaceSidebar 整合
- `DS-05-B5` — ToolGrid 整合

### 可用 Task 列表

- `ds-02-b3-topics` — Apply Design System to /topics
- `ds-02-b3-search` — Apply Design System to /search
- `ds-05-b4-1` — Consolidate WorkspaceSidebar
- `ds-05-b5-1` — Create unified ToolGrid

### 执行顺序

1. **优先级排序**: P0 > P1 > P2 > P3
2. **依赖检查**: 检查 dependencies.requires
3. **文件检查**: 验证 allowed_files 存在
4. **状态检查**: 确认前一个 Task 已完成

### 执行流程

```
1. 读取 Queue
2. 选择下一个 Task
3. 验证前置条件
4. 执行 Task
5. 验证结果
6. 更新状态
7. 继续下一个 Task
```

### 失败处理

```
Task 失败
├── Build 失败 → 自动回滚 → 标记为 failed → 停止执行
├── Deploy 失败 → 自动回滚 → 标记为 failed → 停止执行
├── Runtime Error → 自动回滚 → 标记为 failed → 停止执行
├── Rate Limit (429) → 暂停 22-30 分钟 → 自动重试当前 Task（最多 3 次）
├── Cooldown (exit 76) → 等待 60 秒 → 自动重试（最多 5 次）
└── 验证失败 → 手动检查 → 决定是否继续
```

### Rate Limit 自动恢复

当 Claude Code 遇到 429 rate limit 时：

1. **第一次触发**: 暂停 22 分钟，写入 `.hermes/pipeline/rate-limit.lock`
2. **1 小时内第二次触发**: 暂停 30 分钟
3. **超过 3 次**: 输出 `PROGRAM_RATE_LIMIT_MAX_RETRY_PAUSED` 并停止

恢复后自动重试当前 Task，不会跳到下一个任务。

详见 `docs/NIGHT_PIPELINE.md` 第 12 章。

---

## Queue 文件格式

### JSON 格式

```json
{
  "version": "2.0",
  "programs": [
    {
      "id": "design-system-migration",
      "name": "Design System Migration",
      "status": "in-progress",
      "progress": 27.5,
      "epics": [
        {
          "id": "DS-02",
          "name": "Public Pages Design System",
          "status": "in-progress",
          "progress": 30,
          "batches": [
            {
              "id": "DS-02-B3",
              "name": "Topics & Search Design System",
              "status": "pending",
              "progress": 0,
              "tasks": [
                {
                  "id": "ds-02-b3-topics",
                  "name": "Apply Design System to /topics",
                  "status": "pending",
                  "allowed_files": [
                    "src/app/(public)/topics/page.tsx"
                  ],
                  "verification": {
                    "build": true,
                    "deploy_staging": true,
                    "http_status": 200,
                    "runtime_check": true
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 文档状态

**状态**: PROGRAM_QUEUE_SPEC_V3_CHECKPOINT_ENGINE  
**版本**: v3.0  
**创建时间**: 2026-07-09  
**下次更新**: Queue 结构变更时

---

## V3 Checkpoint Engine 集成（新增）

### Checkpoint 与 Queue 的集成

Program Queue 现在与 Checkpoint Engine 深度集成，每个 Task 执行时自动保存 checkpoint：

```
Task 开始
  ├── 保存 program.json checkpoint
  ├── 保存 epic.json checkpoint
  ├── 保存 batch.json checkpoint
  └── 保存 task.json checkpoint (status: in_progress)
      │
      ├── 执行 Claude Code 生成 proposal
      │   └── 更新 task.json (proposal_path, retry_count)
      │
      ├── 应用 patch
      │   └── 更新 task.json (patch_path)
      │
      ├── Build 验证
      │   └── 更新 task.json (build_status)
      │
      ├── Deploy staging
      │   └── 更新 task.json (deploy_status)
      │
      ├── Runtime 验证
      │   └── 更新 task.json (runtime_status)
      │
      └── Task 完成
          └── 更新 task.json (status: completed, completed_at)
```

### Resume 与 Queue 的集成

当 night-run.sh 启动时：

1. 检查 `.hermes/pipeline/checkpoints/task.json`
2. 如果 status 为 `in_progress` 或 `failed`，自动恢复
3. 从 checkpoint 中读取 program/epic/batch/task 信息
4. 继续执行未完成的 Task
5. 不重新执行已完成的 Task

### Program State 与 Queue 的集成

`program-state.json` 维护全局状态，与 Queue 同步更新：

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

### 新增命令

```bash
# 查看 Program 状态（含 checkpoint 信息）
bash scripts/night-run.sh --program-status

# Dry run 生成报告（不执行任务）
bash scripts/night-run.sh --program-status --dry-run
```

### 报告生成

V3 Checkpoint Engine 自动生成两种报告：

1. **Morning Brief V2** (`.hermes/reports/morning-brief.md`)
   - Program Progress
   - Yesterday Completed
   - Today's Plan
   - ETA
   - Blocked Items
   - Need Human Review
   - Next Batch

2. **Night Report V2** (`.hermes/reports/night-report.md`)
   - Completed Tasks
   - Task Details (proposal, patch, build, deploy, runtime)
   - Rate Limit / Retry 信息
   - 耗时
   - 风险
   - 下一步
