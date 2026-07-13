# Night Report 模板

> 用途：每晚向用户汇报当日完成的工作和次日计划  
> 生成时间：每晚 22:00-23:00  
> 触发方式：手动执行或 Cron Job 自动执行

---

## 模板结构

```markdown
# 🌙 Night Report - {日期}

## 📊 今日执行摘要

| 指标 | 数值 |
|------|------|
| 执行 Batch 数 | {batch_count} |
| 完成 Task 数 | {task_count} |
| 修改文件数 | {file_count} |
| 删除文件数 | {deleted_count} |
| 新增文件数 | {added_count} |
| 总耗时 | {duration} |
| 成功率 | {success_rate}% |

## ✅ 完成的工作

### Batch {batch_id}: {batch_name}

**状态**: ✅ 完成  
**耗时**: {duration}  
**Commit**: {commit_hash}

**执行的 Tasks**:
1. {task_id}: {task_name}
   - 修改文件: {file_count}
   - 验证: ✅ 通过
   - 耗时: {duration}
   
2. {task_id}: {task_name}
   - 修改文件: {file_count}
   - 验证: ✅ 通过
   - 耗时: {duration}

**修改的文件**:
- `{file_path_1}` - {change_description}
- `{file_path_2}` - {change_description}

**验证结果**:
- Build: ✅ 成功
- Deploy: ✅ 成功
- HTTP Status: ✅ 200
- Runtime Check: ✅ 无错误
- Visual Check: {status}

**关键成果**:
- {achievement_1}
- {achievement_2}

### Batch {batch_id}: {batch_name}

（同上结构）

## 📈 进度更新

### Program 进度变化

| Program | 旧进度 | 新进度 | 变化 |
|---------|--------|--------|------|
| {program_name_1} | {old}% | {new}% | +{delta}% |
| {program_name_2} | {old}% | {new}% | +{delta}% |

### Epic 进度变化

| Epic | 旧进度 | 新进度 | 变化 |
|------|--------|--------|------|
| {epic_id} | {old}% | {new}% | +{delta}% |

### 覆盖率指标

| 指标 | 旧值 | 新值 | 变化 |
|------|------|------|------|
| V4 Shell 覆盖率 | {old}% | {new}% | +{delta}% |
| Design System 覆盖率 | {old}% | {new}% | +{delta}% |
| 重复组件数 | {old} | {new} | {delta} |

## ⚠️ 遇到的问题

### 已解决的问题

**问题 1**: {problem_description}
- **原因**: {root_cause}
- **解决方案**: {solution}
- **耗时**: {duration}
- **影响**: {impact}

### 未解决的问题

**问题 1**: {problem_description}
- **影响**: {impact}
- **建议**: {recommendation}
- **优先级**: {priority}

## 🚨 识别的风险

### 🔴 高风险

**风险 1**: {risk_description}
- **影响**: {impact}
- **概率**: {probability}
- **缓解措施**: {mitigation}
- **需要决策**: {decision_needed}

### 🟡 中风险

**风险 1**: {risk_description}
- **影响**: {impact}
- **概率**: {probability}
- **缓解措施**: {mitigation}

## 🎯 下一步计划

### 明日 P0 任务

1. **{batch_id}**: {batch_name}
   - 预计耗时: {duration}
   - 风险: {risk_level}
   - 依赖: {dependencies}
   - 优先级: P0

2. **{batch_id}**: {batch_name}
   - 预计耗时: {duration}
   - 风险: {risk_level}
   - 依赖: {dependencies}
   - 优先级: P0

### 明日 P1 任务

1. **{batch_id}**: {batch_name}
   - 预计耗时: {duration}
   - 风险: {risk_level}
   - 优先级: P1

### 需要人工确认的事项

- [ ] {confirmation_1}
- [ ] {confirmation_2}
- [ ] {confirmation_3}

## 💡 技术债务

### 新增债务

- **债务**: {debt_description}
- **原因**: {reason}
- **优先级**: {priority}
- **建议处理时间**: {timeline}

### 解决的债务

- **债务**: {debt_description}
- **解决方案**: {solution}

## 📝 Git 提交记录

```
{commit_hash_1} - {commit_message_1}
{commit_hash_2} - {commit_message_2}
{commit_hash_3} - {commit_message_3}
```

## 🔗 相关文档

- Program Progress: `docs/program/PROGRAM_PROGRESS.md`
- Program Queue: `docs/program/PROGRAM_QUEUE_SPEC.md`
- Night Report: `docs/nightly/{date}-night-report.md`

---

**生成时间**: {timestamp}  
**下次执行**: 明日 22:00  
**紧急联系**: 如有紧急问题，请回复此消息
```

---

## 数据收集规则

### 自动收集的数据

1. **执行摘要**
   - 从 `git log --since="today"` 获取提交记录
   - 从 `docs/nightly/` 目录读取今日执行记录
   - 统计修改、删除、新增文件数

2. **完成的工作**
   - 从 `docs/program/PROGRAM_PROGRESS.md` 读取今日完成的 Batch
   - 从 Git 提交记录获取详细信息
   - 验证 Build/Deploy/Runtime 结果

3. **进度更新**
   - 从 `docs/program/PROGRAM_PROGRESS.md` 读取进度变化
   - 计算 Program/Epic 进度变化
   - 计算覆盖率指标变化

4. **遇到的问题**
   - 从执行日志中提取错误信息
   - 从 Git 提交记录中提取回滚记录
   - 从 Night Report 中提取问题描述

5. **识别的风险**
   - 从 `docs/program/PROGRAM_PROGRESS.md` 的 "风险与问题" 章节读取
   - 从执行日志中提取警告信息

6. **下一步计划**
   - 从 `docs/program/PROGRAM_QUEUE_SPEC.md` 读取明日计划
   - 按优先级排序

### 需要人工确认的数据

1. **未解决的问题**
   - 检查是否有需要用户决策的问题
   - 确认问题优先级

2. **风险缓解措施**
   - 确认风险缓解方案
   - 确认是否需要用户介入

3. **技术债务处理**
   - 确认技术债务优先级
   - 确认处理时间

---

## 自动化执行流程

```bash
#!/bin/bash
# night-report.sh

# 1. 收集数据
echo "收集今日执行数据..."
# 读取 git log
# 读取 PROGRAM_PROGRESS.md
# 读取执行日志

# 2. 生成报告
echo "生成 Night Report..."
# 使用模板填充数据
# 输出到 docs/nightly/{date}-night-report.md

# 3. 发送通知
echo "发送 Night Report..."
# 通过 Telegram/Discord 发送给用户

# 4. 更新 Program Progress
echo "更新 Program Progress..."
# 更新 docs/program/PROGRAM_PROGRESS.md
```

---

## 示例输出

```markdown
# 🌙 Night Report - 2026-07-09

## 📊 今日执行摘要

| 指标 | 数值 |
|------|------|
| 执行 Batch 数 | 3 |
| 完成 Task 数 | 9 |
| 修改文件数 | 21 |
| 删除文件数 | 4 |
| 新增文件数 | 0 |
| 总耗时 | 2h 15min |
| 成功率 | 100% |

## ✅ 完成的工作

### Batch DS-05-B1: ActionCard 组件整合

**状态**: ✅ 完成  
**耗时**: 30min  
**Commit**: 7e43a62

**执行的 Tasks**:
1. ds-05-b1-1: 删除 saas/ActionCard.tsx
   - 删除文件: 1
   - 验证: ✅ 通过
   - 耗时: 5min
   
2. ds-05-b1-2: 更新 4 个文件的导入路径
   - 修改文件: 4
   - 验证: ✅ 通过
   - 耗时: 25min

**修改的文件**:
- `src/app/(workspace)/workspace/page.tsx` - 更新 ActionCard 导入路径
- `src/app/(workspace)/workspace/settings/page.tsx` - 更新 ActionCard 导入路径
- `src/app/(workspace)/workspace/tasks/page.tsx` - 更新 ActionCard 导入路径
- `src/app/(workspace)/workspace/memos/page.tsx` - 更新 ActionCard 导入路径

**删除的文件**:
- `src/components/saas/ActionCard.tsx` - 重复组件，已迁移到 design-system

**验证结果**:
- Build: ✅ 成功
- Deploy: ✅ 成功
- HTTP Status: ✅ 200
- Runtime Check: ✅ 无错误
- Visual Check: 待用户验收

**关键成果**:
- 完成 ActionCard 组件整合
- 统一使用 design-system/ActionCard.tsx
- 减少 1 组重复组件

### Batch DS-05-B2: StatusBadge 组件整合

（同上结构）

### Batch DS-05-B3: EmptyState 组件整合

（同上结构）

## 📈 进度更新

### Program 进度变化

| Program | 旧进度 | 新进度 | 变化 |
|---------|--------|--------|------|
| Design System Migration | 20% | 27.5% | +7.5% |
| V4 Shell Unification | 40% | 40% | 0% |

### Epic 进度变化

| Epic | 旧进度 | 新进度 | 变化 |
|------|--------|--------|------|
| DS-05 Component Consolidation | 0% | 60% | +60% |

### 覆盖率指标

| 指标 | 旧值 | 新值 | 变化 |
|------|------|------|------|
| V4 Shell 覆盖率 | 5.9% | 5.9% | 0% |
| Design System 覆盖率 | 0% | 0.9% | +0.9% |
| 重复组件数 | 7 | 4 | -3 |

## ⚠️ 遇到的问题

### 已解决的问题

**问题 1**: 导入路径更新后 Build 失败
- **原因**: 部分文件使用了 SaasEmptyState 而非 EmptyState
- **解决方案**: 批量替换所有 SaasEmptyState 为 EmptyState
- **耗时**: 15min
- **影响**: 无

### 未解决的问题

无

## 🚨 识别的风险

### 🟡 中风险

**风险 1**: Workspace 页面改造风险
- **影响**: 涉及用户核心功能
- **概率**: 中
- **缓解措施**: 先完成组件整合，再进行页面改造
- **需要决策**: 无

## 🎯 下一步计划

### 明日 P0 任务

1. **DS-02-B3**: Topics & Search Design System 应用
   - 预计耗时: 30-45min
   - 风险: 🟢 低
   - 依赖: 无
   - 优先级: P0

2. **DS-05-B4**: WorkspaceSidebar 组件整合
   - 预计耗时: 30min
   - 风险: 🟡 中
   - 依赖: 无
   - 优先级: P0

### 明日 P1 任务

1. **DS-05-B5**: ToolGrid 组件整合
   - 预计耗时: 1h
   - 风险: 🟡 中
   - 优先级: P1

### 需要人工确认的事项

- [ ] 确认昨夜完成的组件整合（ActionCard, StatusBadge, EmptyState）
- [ ] 确认 Workspace Enhancement Program 的规划时间
- [ ] 确认 Community Pages 迁移方案

## 💡 技术债务

### 新增债务

无

### 解决的债务

- **债务**: ActionCard 组件重复
- **解决方案**: 整合到 design-system/ActionCard.tsx

- **债务**: StatusBadge 组件重复
- **解决方案**: 整合到 design-system/StatusBadge.tsx

- **债务**: EmptyState 组件重复
- **解决方案**: 整合到 design-system/EmptyState.tsx

## 📝 Git 提交记录

```
7e43a62 - refactor: consolidate duplicate components to design-system
```

## 🔗 相关文档

- Program Progress: `docs/program/PROGRAM_PROGRESS.md`
- Program Queue: `docs/program/PROGRAM_QUEUE_SPEC.md`
- Night Report: `docs/nightly/2026-07-09-night-report.md`

---

**生成时间**: 2026-07-09 22:00  
**下次执行**: 2026-07-10 22:00  
**紧急联系**: 如有紧急问题，请回复此消息
```

---

## 文档状态

**状态**: TEMPLATE_ESTABLISHED  
**版本**: v1.0  
**创建时间**: 2026-07-09  
**下次更新**: 模板优化时
