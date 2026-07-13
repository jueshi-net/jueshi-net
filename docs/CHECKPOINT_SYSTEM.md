# Checkpoint System

## Purpose
实时记录每个 Task 的完成状态，确保进度可追溯。

## Checkpoint Types

### 1. Task Checkpoint
每个 Task 完成后立即写入：
- Task ID
- 完成时间
- 状态（completed/failed/partial）
- 关键输出（commit hash, 文件列表）

### 2. Phase Checkpoint
每个 Phase 完成后写入：
- Phase ID
- 完成时间
- 包含的 Tasks
- 总体状态

### 3. Session Checkpoint
每个 Session 结束时写入：
- Session ID
- 开始/结束时间
- 完成的 Phases
- 遗留问题

## Checkpoint File Format

```yaml
checkpoint_id: "2026-07-10-001"
timestamp: "2026-07-10 14:30:00"
type: "task"
task_id: "P0-Bootstrap"
status: "completed"
outputs:
  - file: "scripts/project-bootstrap.sh"
  - file: "scripts/check-staging.sh"
notes: "Bootstrap system implemented and tested"
```

## Checkpoint Location

所有 checkpoints 存储在：
- `docs/checkpoints/` - 按日期组织
- 文件名格式：`YYYY-MM-DD-HH-MM-SS-{type}-{id}.md`

## Usage

### 创建 Checkpoint
```bash
bash scripts/create-checkpoint.sh task P0-Bootstrap completed
```

### 查看 Checkpoints
```bash
ls -la docs/checkpoints/
cat docs/checkpoints/latest.md
```

### Checkpoint 验证
```bash
bash scripts/verify-checkpoints.sh
```

## Rules

1. **必须实时写入** - Task 完成后立即创建 checkpoint，不要等到 Session 结束
2. **必须包含输出** - 记录 commit hash、修改的文件、测试结果
3. **必须标注状态** - completed/failed/partial/blocked
4. **必须可追溯** - 每个 checkpoint 必须能关联到具体的 Task 和代码变更
5. **禁止批量创建** - 不允许在 Session 结束时批量创建多个 checkpoints
