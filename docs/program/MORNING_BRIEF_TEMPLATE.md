# Morning Brief 模板

> 用途：每日早晨向用户汇报项目状态和今日计划  
> 生成时间：每日 08:00-09:00  
> 触发方式：Cron Job 自动执行

---

## 模板结构

```markdown
# 🌅 Morning Brief - {日期}

## 📊 Program 概览

| Program | 进度 | 状态 | 关键指标 |
|---------|------|------|----------|
| {program_name_1} | {progress}% | {status} | {metrics} |
| {program_name_2} | {progress}% | {status} | {metrics} |

## ✅ 昨夜完成

### {program_name}
- **Batch**: {batch_id} - {batch_name}
  - Task 1: {task_name} ✅
  - Task 2: {task_name} ✅
- **进度**: {old_progress}% → {new_progress}%
- **耗时**: {duration}
- **Commit**: {commit_hash}

### 关键成果
- {achievement_1}
- {achievement_2}

## 🎯 今日计划

### P0 - 必须完成
1. **{batch_id}**: {batch_name}
   - 预计耗时: {duration}
   - 风险: {risk_level}
   - 依赖: {dependencies}

2. **{batch_id}**: {batch_name}
   - 预计耗时: {duration}
   - 风险: {risk_level}
   - 依赖: {dependencies}

### P1 - 计划完成
1. **{batch_id}**: {batch_name}
   - 预计耗时: {duration}
   - 风险: {risk_level}

### P2 - 可选完成
1. **{batch_id}**: {batch_name}
   - 预计耗时: {duration}
   - 风险: {risk_level}

## ⚠️ 阻塞问题

### 需要人工决策
- **问题**: {issue_description}
- **影响**: {impact}
- **建议**: {recommendation}
- **截止时间**: {deadline}

### 技术债务
- **债务**: {debt_description}
- **优先级**: {priority}
- **建议处理时间**: {timeline}

## 🚨 风险提醒

### 🔴 高风险
- {risk_description}
- 影响: {impact}
- 缓解措施: {mitigation}

### 🟡 中风险
- {risk_description}
- 影响: {impact}
- 缓解措施: {mitigation}

## 📈 关键指标

### 覆盖率指标
- V4 Shell 覆盖率: {current}% → {target}% ({delta}%)
- Design System 覆盖率: {current}% → {target}% ({delta}%)
- 组件整合率: {current}% → {target}% ({delta}%)

### 质量指标
- Build 成功率: {success_rate}%
- Deploy 成功率: {success_rate}%
- Runtime Error 数量: {count}

## 💡 建议

### 优先级调整建议
- {suggestion_1}
- {suggestion_2}

### 资源需求
- {resource_need_1}
- {resource_need_2}

## 📝 今日待确认事项

- [ ] {confirmation_1}
- [ ] {confirmation_2}
- [ ] {confirmation_3}

---

**生成时间**: {timestamp}  
**下次更新**: 明日 08:00  
**紧急联系**: 如有紧急问题，请回复此消息
```

---

## 数据收集规则

### 自动收集的数据

1. **Program 进度**
   - 从 `docs/program/PROGRAM_PROGRESS.md` 读取
   - 计算各 Program 的完成百分比

2. **昨夜完成**
   - 从 `git log --since="yesterday"` 获取
   - 从 `docs/nightly/` 目录读取 Night Report

3. **今日计划**
   - 从 `docs/program/PROGRAM_QUEUE_SPEC.md` 读取
   - 按优先级排序

4. **阻塞问题**
   - 从 `docs/program/PROGRAM_PROGRESS.md` 的 "阻塞问题" 章节读取
   - 从最近的 Night Report 读取

5. **风险提醒**
   - 从 `docs/program/PROGRAM_PROGRESS.md` 的 "风险与问题" 章节读取

6. **关键指标**
   - 从 `PROJECT_MEMORY.md` 读取覆盖率数据
   - 从最近的 Night Report 读取质量指标

### 需要人工确认的数据

1. **优先级调整**
   - 检查是否有新的业务需求
   - 确认当前优先级是否合理

2. **资源需求**
   - 检查是否需要额外的开发资源
   - 检查是否需要用户验收

---

## 自动化执行流程

```bash
#!/bin/bash
# morning-brief.sh

# 1. 收集数据
echo "收集 Program 进度数据..."
# 读取 PROGRAM_PROGRESS.md
# 读取 git log
# 读取 PROGRAM_QUEUE_SPEC.md

# 2. 生成报告
echo "生成 Morning Brief..."
# 使用模板填充数据
# 输出到 stdout 或文件

# 3. 发送通知
echo "发送 Morning Brief..."
# 通过 Telegram/Discord 发送给用户
```

---

## 示例输出

```markdown
# 🌅 Morning Brief - 2026-07-09

## 📊 Program 概览

| Program | 进度 | 状态 | 关键指标 |
|---------|------|------|----------|
| Design System Migration | 27.5% | 🟡 进行中 | 重复组件 7→4，DS 覆盖率 0.9% |
| V4 Shell Unification | 40% | 🟡 进行中 | V4 覆盖率 5.9% |

## ✅ 昨夜完成

### Design System Migration
- **Batch**: DS-05-B3 - EmptyState 组件整合
  - Task 1: 删除 saas/SaasEmptyState.tsx ✅
  - Task 2: 删除 workspace/EmptyState.tsx ✅
  - Task 3: 更新 11 个文件的导入路径 ✅
- **进度**: 40% → 60%
- **耗时**: 45min
- **Commit**: 7e43a62

### 关键成果
- 完成 3 个组件整合（ActionCard, StatusBadge, EmptyState）
- 重复组件从 7 组减少到 4 组
- 更新了 21 个文件的导入路径

## 🎯 今日计划

### P0 - 必须完成
1. **DS-02-B3**: Topics & Search Design System 应用
   - 预计耗时: 30-45min
   - 风险: 🟢 低
   - 依赖: 无

2. **DS-05-B4**: WorkspaceSidebar 组件整合
   - 预计耗时: 30min
   - 风险: 🟡 中
   - 依赖: 无

### P1 - 计划完成
1. **DS-05-B5**: ToolGrid 组件整合
   - 预计耗时: 1h
   - 风险: 🟡 中

### P2 - 可选完成
1. **DS-02-B4**: Resources Design System 应用
   - 预计耗时: 1-2h
   - 风险: 🟡 中

## ⚠️ 阻塞问题

### 需要人工决策
- **问题**: Workspace Enhancement Program 的具体 Epics 和 Batches 未定义
- **影响**: 无法开始 Workspace 页面的 Design System 应用
- **建议**: 本周内完成 Workspace Enhancement Program 的详细规划
- **截止时间**: 2026-07-15

### 技术债务
- **债务**: Community Pages 迁移方案未确定
- **优先级**: P2
- **建议处理时间**: 下周

## 🚨 风险提醒

### 🔴 高风险
- Workspace 页面改造风险
- 影响: 涉及用户核心功能
- 缓解措施: 先完成组件整合，再进行页面改造

### 🟡 中风险
- 资源详情页复杂性
- 影响: 包含大量自定义交互
- 缓解措施: 分阶段改造

## 📈 关键指标

### 覆盖率指标
- V4 Shell 覆盖率: 5.9% → 10% (+4.1%)
- Design System 覆盖率: 0.9% → 5% (+4.1%)
- 组件整合率: 60% → 80% (+20%)

### 质量指标
- Build 成功率: 100%
- Deploy 成功率: 100%
- Runtime Error 数量: 0

## 💡 建议

### 优先级调整建议
- 建议优先完成组件整合（DS-05），再进行页面改造
- 建议本周内完成所有 P0 任务

### 资源需求
- 无需额外开发资源
- 需要用户验收昨夜完成的组件整合

## 📝 今日待确认事项

- [ ] 确认昨夜完成的组件整合（ActionCard, StatusBadge, EmptyState）
- [ ] 确认 Workspace Enhancement Program 的规划时间
- [ ] 确认 Community Pages 迁移方案

---

**生成时间**: 2026-07-09 08:00  
**下次更新**: 2026-07-10 08:00  
**紧急联系**: 如有紧急问题，请回复此消息
```

---

## 文档状态

**状态**: TEMPLATE_ESTABLISHED  
**版本**: v1.0  
**创建时间**: 2026-07-09  
**下次更新**: 模板优化时
