# Automation Boundary Specification

> 最后更新: 2026-07-09  
> 版本: v1.0

---

## 概述

本文档定义了 Program Manager V2 中各角色的职责边界和自动化规则。明确哪些工作可以自动执行，哪些需要人工介入。

**核心原则**:
- 自动化优先：能自动执行的不人工执行
- 安全第一：涉及生产环境的必须人工确认
- 透明可控：所有自动化行为可追溯、可回滚

---

## 角色定义

### 1. Claude (Lead Frontend Engineer)

**职责**:
- 代码分析和方案设计
- 生成完整的文件 Proposal
- 代码审查和质量检查
- 技术文档编写

**自动化边界**:
- ✅ **可以自动执行**:
  - 读取代码文件并分析
  - 生成完整的文件 Proposal（full-file-proposal 模式）
  - 生成技术文档
  - 代码审查报告
  
- ❌ **禁止自动执行**:
  - 直接修改 src/** 文件
  - 执行 build/deploy
  - 修改 prisma/** 文件
  - 修改 package.json
  - 访问生产环境

**工作模式**:
```
输入: 任务描述 + 允许修改的文件列表
输出: 完整的文件 Proposal（<<<FILE:path>>> 格式）
```

**示例**:
```bash
# Claude 被调用
~/bin/claude-safe -p \
  --allowedTools "Read,Grep,Glob,ListDirectory" \
  -- "生成 /topics 页面的 Design System 迁移方案"

# Claude 输出
<<<FILE:src/app/(public)/topics/page.tsx>>>
import { PageHero, ContentSection } from '@/components/design-system';
// ... 完整的文件内容
<<<END_FILE>>>
```

---

### 2. Hermes (Project Manager + Patch Runner)

**职责**:
- 管理 Program Queue
- 调用 Claude 生成 Proposal
- 生成和执行 Patch
- 执行 Build 和 Deploy
- 验证结果
- 更新文档和状态

**自动化边界**:
- ✅ **可以自动执行**:
  - 读取和更新 Program Queue
  - 调用 Claude Code（只读模式）
  - 生成 Patch（diff -u）
  - 执行 Patch（git apply）
  - 执行 Build（npm run build）
  - 执行 Deploy（deploy-staging.sh）
  - 执行验证（curl, pm2 logs）
  - 自动回滚（失败时）
  - 更新文档（docs/**）
  - 提交代码（git commit）
  
- ❌ **禁止自动执行**:
  - 修改生产环境
  - 修改 prisma/** 文件
  - 修改 package.json
  - 删除文件（除非明确允许）
  - 跳过验证步骤

**工作模式**:
```
1. 读取 Program Queue
2. 选择下一个 Task
3. 调用 Claude 生成 Proposal
4. 生成 Patch
5. 执行 Patch
6. Build 验证
7. Deploy Staging
8. Runtime 验证
9. 更新状态
10. 继续下一个 Task
```

**自动推进规则**:
```yaml
auto_advance:
  conditions:
    - "Task 状态为 pending"
    - "前一个 Task 已完成"
    - "无阻塞依赖"
    - "在允许的文件范围内"
  actions:
    - "自动创建 Proposal"
    - "自动执行 Patch"
    - "自动验证"
    - "自动更新状态"
```

**暂停规则**:
```yaml
pause_conditions:
  - "Build 失败"
  - "Deploy 失败"
  - "Runtime Error"
  - "验证失败"
  - "超出允许文件范围"
  - "连续 3 次失败"
actions:
  - "停止执行"
  - "自动回滚"
  - "发送告警"
  - "等待人工介入"
```

**恢复规则**:
```yaml
resume_conditions:
  - "人工修复问题"
  - "确认可以继续"
  - "更新 Queue 状态"
actions:
  - "从失败的 Task 重新开始"
  - "继续执行后续 Task"
```

---

### 3. OpenClaw (Gateway Service)

**职责**:
- 提供 Hermes Agent 通信通道
- 监控 FD（File Descriptor）
- 维护服务健康

**自动化边界**:
- ✅ **可以自动执行**:
  - 监控 FD 使用量
  - 自动重启服务（如果 FD > 500）
  - 记录日志
  
- ❌ **禁止自动执行**:
  - 修改代码
  - 执行任务
  - 访问数据库

**监控规则**:
```yaml
monitoring:
  fd_threshold: 500
  check_interval: 60s
  actions:
    - "FD > 500: 发送告警"
    - "FD > 800: 自动重启"
    - "FD > 1000: 紧急停止所有任务"
```

---

### 4. ChatGPT (Research & Analysis)

**职责**:
- 技术调研
- 方案对比
- 文档撰写
- 问题分析

**自动化边界**:
- ✅ **可以自动执行**:
  - 技术调研
  - 生成分析报告
  - 撰写文档
  
- ❌ **禁止自动执行**:
  - 直接修改代码
  - 执行任务
  - 访问生产环境

**使用场景**:
```
场景 1: 技术调研
输入: "对比 Tailwind CSS 和 CSS Modules 的优缺点"
输出: 详细的对比报告

场景 2: 方案设计
输入: "设计一个组件库迁移方案"
输出: 完整的迁移方案文档
```

---

### 5. 用户 (Product Owner)

**职责**:
- 定义产品需求
- 验收功能
- 决策关键问题
- 批准生产发布

**自动化边界**:
- ✅ **可以自动执行**:
  - 查看进度报告
  - 查看验证结果
  
- ❌ **必须人工执行**:
  - 验收功能（视觉检查）
  - 批准生产发布
  - 决策关键问题
  - 处理异常情况

**介入时机**:
```yaml
user_intervention_required:
  - "功能验收"
  - "生产发布批准"
  - "异常情况处理"
  - "关键决策"
  - "风险确认"
```

---

## 自动化工作流

### 1. Night Pipeline 执行流程

```
用户启动 Night Pipeline
│
├─ Hermes: 读取 Program Queue
│
├─ Hermes: 选择下一个 Batch
│  │
│  ├─ Hermes: 选择下一个 Task
│  │  │
│  │  ├─ Hermes: 调用 Claude 生成 Proposal
│  │  │  │
│  │  │  └─ Claude: 输出完整文件内容
│  │  │
│  │  ├─ Hermes: 生成 Patch
│  │  │
│  │  ├─ Hermes: 执行 Patch (git apply)
│  │  │
│  │  ├─ Hermes: Build 验证
│  │  │  │
│  │  │  ├─ 成功 → 继续
│  │  │  └─ 失败 → 自动回滚 → 停止 → 告警用户
│  │  │
│  │  ├─ Hermes: Deploy Staging
│  │  │
│  │  ├─ Hermes: Runtime 验证
│  │  │  │
│  │  │  ├─ 成功 → 继续
│  │  │  └─ 失败 → 自动回滚 → 停止 → 告警用户
│  │  │
│  │  └─ Hermes: 更新 Task 状态
│  │
│  └─ Hermes: 更新 Batch 状态
│
├─ Hermes: 生成 Night Report
│
└─ 用户: 查看报告，决定是否继续
```

### 2. 自动推进规则

```yaml
auto_advance_rules:
  task_level:
    conditions:
      - "Task.status == 'pending'"
      - "previous_task.status == 'completed'"
      - "no blocking dependencies"
      - "files within allowed scope"
    actions:
      - "auto create proposal"
      - "auto execute patch"
      - "auto verify"
      - "auto update status"
  
  batch_level:
    conditions:
      - "all tasks completed"
      - "all verifications passed"
    actions:
      - "auto update batch status"
      - "auto proceed to next batch"
  
  epic_level:
    conditions:
      - "all batches completed"
      - "acceptance criteria met"
    actions:
      - "auto update epic status"
      - "notify user for acceptance"
```

### 3. 暂停和恢复规则

```yaml
pause_rules:
  triggers:
    - "build failed"
    - "deploy failed"
    - "runtime error detected"
    - "verification failed"
    - "file scope exceeded"
    - "consecutive failures >= 3"
  actions:
    - "stop execution immediately"
    - "auto rollback to last stable state"
    - "send alert to user"
    - "wait for manual intervention"

resume_rules:
  triggers:
    - "user confirms issue resolved"
    - "queue status updated"
  actions:
    - "resume from failed task"
    - "continue execution"
```

---

## 人工介入场景

### 1. 功能验收

**场景**: Design System 组件应用后，需要视觉检查

**流程**:
```
Hermes: 完成 Batch 执行
  ↓
Hermes: 生成验收清单
  ↓
用户: 访问 staging 环境
  ↓
用户: 检查视觉一致性
  ↓
用户: 确认通过/提出修改意见
  ↓
Hermes: 根据反馈调整
```

**验收清单示例**:
```markdown
## 验收清单 - DS-02-B3

### /topics 页面
- [ ] 页面加载正常
- [ ] V4 Header 显示正确
- [ ] V4 Footer 显示正确
- [ ] Design System 组件样式正确
- [ ] 响应式布局正常
- [ ] 无 Console Error

### /search 页面
- [ ] 页面加载正常
- [ ] V4 Header 显示正确
- [ ] V4 Footer 显示正确
- [ ] Design System 组件样式正确
- [ ] 搜索功能正常
- [ ] 无 Console Error
```

### 2. 生产发布

**场景**: Staging 验收通过，准备发布到 Production

**流程**:
```
用户: 确认 staging 验收通过
  ↓
Hermes: 执行 Audit (tools/jueshi-audit)
  ↓
Hermes: 生成 Audit Report
  ↓
用户: 确认 P0/P1 问题已清除
  ↓
用户: 批准生产发布
  ↓
Hermes: 执行生产发布流程
  ↓
Hermes: 执行 Smoke Test
  ↓
用户: 确认生产环境正常
```

### 3. 异常处理

**场景**: Night Pipeline 执行失败

**流程**:
```
Hermes: 检测到失败
  ↓
Hermes: 自动回滚
  ↓
Hermes: 发送告警
  ↓
用户: 查看失败原因
  ↓
用户: 决定修复方案
  ├─ 方案 A: 修复代码 → 重新执行
  ├─ 方案 B: 跳过 Task → 继续执行
  └─ 方案 C: 停止 Pipeline → 人工处理
  ↓
Hermes: 根据决策执行
```

---

## 自动化程度评估

### 高自动化（90%+）

**任务类型**:
- V4 Shell 统一
- Design System 组件应用
- 组件整合
- 文档更新

**原因**:
- 规则明确
- 验证标准清晰
- 回滚策略完善
- 风险可控

### 中自动化（50-90%）

**任务类型**:
- 复杂页面重构
- 功能开发
- 性能优化

**原因**:
- 需要部分人工决策
- 需要视觉验收
- 需要功能测试

### 低自动化（<50%）

**任务类型**:
- 产品设计
- 架构决策
- 生产发布
- 异常处理

**原因**:
- 需要人工判断
- 需要业务理解
- 需要风险评估

---

## 文档状态

**状态**: AUTOMATION_BOUNDARY_ESTABLISHED  
**版本**: v1.0  
**创建时间**: 2026-07-09  
**下次更新**: 角色职责变更时
