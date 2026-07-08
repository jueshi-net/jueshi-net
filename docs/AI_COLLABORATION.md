# AI_COLLABORATION.md

> AI Agent 协作规范 — Claude Code / Hermes / OpenClaw 角色定义  
> 最后更新: 2026-07-09

---

## 概述

jueshi.net 项目使用三个 AI Agent 协作完成开发和运维任务：

| Agent | 角色 | 核心职责 |
|-------|------|----------|
| **Claude Code** | 代码理解 + Proposal 生成 | 阅读代码、理解项目、输出完整文件 Proposal |
| **Hermes** | 任务编排 + Pipeline 执行 | 调度任务、生成 Patch、构建验证、部署 |
| **OpenClaw** | Gateway + 健康监控 | 通信网关、Telegram 集成、进程管理 |

---

## Claude Code

### 角色定义

**只读 Proposal Generator** — 阅读代码，理解项目，输出完整文件 Proposal。

### 职责

- ✅ 阅读代码（Read, Grep, Glob, ListDirectory）
- ✅ 理解项目结构和业务逻辑
- ✅ 输出完整文件 Proposal（`<<<FILE:path>>>` 格式）
- ✅ 分析代码问题，提供改进建议
- ❌ **不直接修改业务代码**
- ❌ 不使用 Write/Edit/MultiEdit
- ❌ 不使用 acceptEdits/bypassPermissions
- ❌ 不执行构建或部署命令

### 调用方式

```bash
# 只读模式（推荐）
~/bin/claude-safe -p \
  --allowedTools "Read,Grep,Glob,ListDirectory,Bash(git diff:*),Bash(git status:*)" \
  -- "任务描述"

# Night Pipeline 调用
claude -p \
  --allowedTools "Read,Grep,Glob,ListDirectory,Bash(git diff:*),Bash(git status:*),Bash(git show:*),Bash(git log:*),Bash(cat:*),Bash(head:*),Bash(tail:*),Bash(wc:*),Bash(find:*),Bash(grep:*),Bash(rg:*)" \
  --disallowedTools "Write,Edit,MultiEdit,Bash(npm:*),Bash(git add:*),Bash(git commit:*),Bash(deploy-*)" \
  "$PROMPT"
```

### 输出格式

```
<<<FILE:src/app/(public)/topics/page.tsx>>>
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';

export default function TopicsPage() {
  return (
    <JueshiV4PublicShell>
      {/* page content */}
    </JueshiV4PublicShell>
  );
}
<<<END_FILE>>>
```

### 限制

| 限制 | 原因 |
|------|------|
| 不直接修改代码 | 无法审计，无法回滚 |
| 不执行命令 | 防止意外操作 |
| 只读工具 | 最小权限原则 |
| 输出 Proposal | 可审查，可修改 |

### 最佳实践

1. **明确任务描述** — 告诉 Claude 具体要做什么
2. **指定 allowed_files** — 限制修改范围
3. **审查 Proposal** — 应用前检查 Proposal 内容
4. **迭代优化** — 不满意可以重新生成

---

## Hermes Agent

### 角色定义

**Task Orchestrator + Pipeline Runner** — 调度任务，执行 Pipeline，验证结果。

### 职责

- ✅ 读取任务队列（queue.json）
- ✅ 调用 Claude Code 生成 Proposal
- ✅ 提取 Proposal 文件
- ✅ 使用 `diff -u` 生成 Patch
- ✅ 验证 Patch（allowlist + 硬禁止）
- ✅ 应用 Patch（`git apply`）
- ✅ 构建验证（`npm run build`）
- ✅ 部署 Staging（`deploy-staging.sh`）
- ✅ curl 验证（HTTP 200）
- ✅ 失败回滚（`git reset --hard`）
- ✅ 更新状态（state.json, completed.json）
- ✅ 项目审计和文档维护
- ✅ 用户沟通和任务协调

### 工具集

| 工具 | 用途 |
|------|------|
| `terminal` | 执行命令 |
| `read_file` / `write_file` | 文件操作 |
| `patch` | 代码修改 |
| `web_search` / `web_extract` | 网络搜索 |
| `browser_*` | 浏览器操作 |
| `delegate_task` | 子任务委派 |
| `memory` | 持久记忆 |
| `skill_*` | 技能管理 |
| `cronjob` | 定时任务 |

### 工作流程

```
1. 接收用户任务
2. 阅读 PROJECT_MEMORY.md 了解项目状态
3. 阅读相关 Registry 文档
4. 制定执行计划
5. 调用 Claude Code 生成 Proposal
6. 生成 Patch
7. 应用 Patch
8. 构建验证
9. 部署 Staging
10. 验证部署
11. 报告结果
12. 更新文档
```

### 限制

| 限制 | 原因 |
|------|------|
| 不碰 Production | 必须 staging-first |
| 不碰 9833416@qq.com | 永久保护 |
| 不执行 prisma db push | 永远禁止 |
| 不输出密钥 | 安全原则 |
| 不直接修改 src/**（默认） | 使用 Pipeline |

### 最佳实践

1. **先阅读文档** — 了解项目状态和规则
2. **使用 Pipeline** — 默认使用 V3 Full-file Proposal
3. **充分验证** — build + deploy + curl
4. **及时更新文档** — 保持项目记忆准确
5. **小步快跑** — 每个任务独立提交

---

## OpenClaw

### 角色定义

**Gateway + Health Monitor** — 通信网关，健康监控，进程管理。

### 职责

- ✅ 运行 Gateway 服务（port 18789）
- ✅ 提供 Hermes Agent 通信通道
- ✅ Telegram 集成
- ✅ 健康监控（FD 检查）
- ✅ 进程重启
- ✅ 会话管理

### 技术细节

| 属性 | 值 |
|------|-----|
| 进程 | Node.js |
| 端口 | 18789 |
| FD 限制 | 256 (soft) |
| 健康阈值 | FD < 500 (OK), FD > 1000 (CRITICAL) |

### 监控指标

| 指标 | 正常 | 警告 | 严重 |
|------|------|------|------|
| FD 数量 | < 500 | 500-1000 | > 1000 |
| 内存使用 | < 512MB | 512MB-1GB | > 1GB |
| 响应时间 | < 100ms | 100-500ms | > 500ms |

### 故障处理

1. **FD 泄漏** — 检查进程，必要时重启
2. **内存泄漏** — 定期重启
3. **XPC 连接中断** — macOS 系统级问题，需人工干预
4. **进程崩溃** — 自动重启（如配置）

---

## 协作流程

### 标准开发流程

```
用户 → Hermes → Claude Code → Hermes → Staging → 用户验收
         │           │            │
         │           │            ├── 生成 Proposal
         │           │            └── 输出完整文件
         │           └── 阅读代码
         ├── 调度任务
         ├── 生成 Patch
         ├── 应用 Patch
         ├── 构建验证
         ├── 部署 Staging
         └── 报告结果
```

### Night Pipeline 流程

```
Hermes (night-run.sh)
  │
  ├── 1. 健康检查 (hermes-health-check.sh)
  │      └── OpenClaw 监控进程状态
  │
  ├── 2. 读取任务队列 (queue.json)
  │
  ├── 3. 调用 Claude Code (claude-generate-patch.sh)
  │      └── Claude Code 输出 Proposal
  │
  ├── 4. 生成 Patch (diff -u)
  │
  ├── 5. 验证 Patch (ai-patch-runner.sh)
  │      ├── allowlist 检查
  │      └── 硬禁止检查
  │
  ├── 6. 应用 Patch (git apply)
  │
  ├── 7. 构建验证 (npm run build)
  │      └── 失败 → 回滚 (git reset --hard)
  │
  ├── 8. 部署 Staging (deploy-staging.sh)
  │
  ├── 9. curl 验证 (HTTP 200)
  │
  └── 10. 更新状态 (state.json, completed.json)
```

### 紧急响应流程

```
问题发现 → Hermes 诊断 → OpenClaw 健康检查
              │
              ├── 代码问题 → Claude Code 分析 → Proposal → Patch → 修复
              │
              ├── 进程问题 → OpenClaw 重启
              │
              └── Production 问题 → 回滚 → 诊断 → 修复 → 重新部署
```

---

## 权限矩阵

| 操作 | Claude Code | Hermes | OpenClaw |
|------|-------------|--------|----------|
| 读取代码 | ✅ | ✅ | ❌ |
| 修改代码 | ❌ | ✅ (via Pipeline) | ❌ |
| 执行命令 | ❌ (只读) | ✅ | ✅ (自身) |
| 构建 | ❌ | ✅ | ❌ |
| 部署 Staging | ❌ | ✅ | ❌ |
| 部署 Production | ❌ | ❌ (需用户确认) | ❌ |
| 数据库操作 | ❌ | ❌ (禁止 db push) | ❌ |
| 进程管理 | ❌ | ❌ | ✅ |
| 用户沟通 | ❌ | ✅ | ✅ (Telegram) |

---

## 安全原则

### 最小权限

- 每个 Agent 只拥有必要的权限
- Claude Code: 只读
- Hermes: 编排 + Pipeline（不直接修改 Production）
- OpenClaw: Gateway + 监控

### 分离关注点

- Claude Code 不执行命令
- Hermes 不直接修改代码（通过 Pipeline）
- OpenClaw 不访问业务代码

### 可审计

- 所有操作可追踪
- Proposal 文件保存
- Patch 文件保存
- 状态文件记录

### 可回滚

- 所有修改可撤销
- Patch 应用失败自动回滚
- Production 部署可回滚

---

## 禁止事项

### 所有 Agent

- ❌ 不碰 Production（除非用户确认）
- ❌ 不碰 9833416@qq.com
- ❌ 不执行 prisma db push
- ❌ 不输出密钥
- ❌ 不声称用户满意

### Claude Code

- ❌ 不直接修改 src/**
- ❌ 不使用 Write/Edit/MultiEdit
- ❌ 不使用 acceptEdits/bypassPermissions

### Hermes

- ❌ 不直接部署 Production
- ❌ 不跳过 Audit Gate
- ❌ 不使用 git add .

### OpenClaw

- ❌ 不访问业务数据
- ❌ 不修改代码
- ❌ 不执行业务逻辑

---

## 故障排查

### Claude Code 问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 未输出完整文件 | Prompt 不清晰 | 明确指定 allowed_files |
| 输出格式错误 | 未遵循格式要求 | 在 Prompt 中强调格式 |
| 限流 (429) | 调用频率过高 | 等待冷却后重试 |
| 超时 | 任务过于复杂 | 拆分为多个小任务 |

### Hermes 问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| Patch 应用失败 | 文件已变更 | 重新生成 Proposal |
| Build 失败 | 代码错误 | 检查 Proposal，修复后重试 |
| 部署失败 | 网络/权限问题 | 检查连接和权限 |
| FD 泄漏 | 长时间运行 | 重启进程 |

### OpenClaw 问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 进程崩溃 | 内存/FD 问题 | 重启进程 |
| 连接中断 | 网络/XPC 问题 | 检查网络，重启 |
| Telegram 断开 | Token/网络问题 | 检查 Token，重启 |

---

**文档状态**: AI_COLLABORATION_ESTABLISHED  
**生成时间**: 2026-07-09  
**下次更新**: Agent 角色变更时
