# Night Pipeline v3

> 夜间自动化 patch-based 长链路基础设施  
> 版本: v3.0 (Full-file Proposal Mode)  
> 创建时间: 2026-07-08  
> 更新时间: 2026-07-09

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

## 1. 概述

Night Pipeline 是一个自动化的 patch-based 长链路执行系统，用于在夜间自动完成 V4 Shell 页面迁移等低风险 UI 统一任务。

### 核心原则

1. **Claude Code 只读仓库 + 输出完整文件** — 自己读文件，输出完整的新文件内容
2. **脚本生成 patch** — 使用 `diff -u` 对比原始文件和 proposal 文件
3. **Hermes 只验证和应用** — 通过 ai-patch-runner 确定性执行
4. **安全优先** — 硬禁止文件永远不被修改
5. **可重复执行** — 所有脚本幂等（idempotent）
6. **失败自动回滚** — build 失败时 git reset --hard

---

## 1.1 版本演进

### V1 失败原因：Hermes 转述文件内容

**问题**：
- Hermes 把文件内容转述给 Claude，导致信息丢失
- Claude 无法看到真实代码结构，生成的 patch context lines 不匹配
- `git apply --check` 拒绝无效 patch（corrupt patch at line X）
- 无法处理复杂业务逻辑的页面

**结果**：Patch 生成失败率高，无法用于生产环境。

---

### V2 失败原因：Claude 手写 unified diff

**改进**：
- Claude Code 自己读仓库（使用 `-p` headless 模式）
- Claude Code 使用 Read 工具直接读取目标文件
- Claude Code 输出 unified diff patch

**问题**：
- Claude 手写 unified diff 格式容易出错
- hunk header 行数计算错误（`@@ -1,5 +1,6 @@` 中的数字经常不对）
- context lines 与实际文件不完全匹配
- `git apply --check` 经常报 "corrupt patch" 或 "patch does not apply"
- 即使 Claude 看到了真实文件，仍然无法正确生成 diff 格式

**结果**：Patch 格式错误率高，需要大量人工干预。

**案例**：
- Night 2 执行时，Claude 生成的 patch 有 3 处 hunk header 错误
- 手动修复后仍然有 context line 不匹配问题
- 最终需要人工重写 patch 才能应用

---

### V3 解决方案：Claude 输出完整文件，脚本生成 patch

**核心改进**：
- **Claude 不再输出 patch** — 只输出完整的新文件内容
- **脚本生成 patch** — 使用 `diff -u` 对比原始文件和 proposal 文件
- **消除格式错误** — diff 工具生成的 patch 格式 100% 正确
- **简化 Claude 任务** — 从"理解 diff 格式 + 生成 patch"简化为"理解需求 + 输出文件"

**工作流程**：
```
1. Claude Code 读取目标文件（Read 工具）
2. Claude Code 输出完整的新文件内容（<<<FILE:path>>> 格式）
3. 脚本提取文件内容到 .hermes/pipeline/proposals/<task-id>/<path>
4. 脚本使用 diff -u 对比原始文件和 proposal 文件
5. 脚本生成 unified diff patch 到 .hermes/pipeline/patches/<task-id>.patch
6. ai-patch-runner.sh 验证并应用 patch
7. build + deploy + curl 验证
```

**优势**：
- ✅ 消除 Claude 生成 corrupt patch 的问题
- ✅ diff 工具保证 patch 格式 100% 正确
- ✅ Claude 任务简化，成功率提高
- ✅ 可以人工审查 proposal 文件（在应用 patch 前）
- ✅ 可以手动修改 proposal 文件后重新生成 patch

**结果**：Patch 生成成功率接近 100%，可用于生产环境。

---

## 1.2 V3: Full-file Proposal Mode

### Claude Code 能力边界

| 能力 | V1 | V2 | V3 |
|------|----|----|-----|
| 读取文件 | ❌ 由 Hermes 转述 | ✅ 自己用 Read 工具读 | ✅ 自己用 Read 工具读 |
| 输出格式 | ❌ 基于 Hermes 描述 | ⚠️ 手写 unified diff（易错） | ✅ 完整文件内容（简单） |
| 写入文件 | ❌ 禁止 | ❌ 禁止 | ❌ 禁止 |
| 执行命令 | ❌ 禁止 | ⚠️ 只允许只读命令 | ⚠️ 只允许只读命令 |
| 修改代码 | ❌ 禁止 | ❌ 禁止 | ❌ 禁止 |
| Patch 生成 | ❌ 失败率高 | ⚠️ 格式错误率高 | ✅ 100% 正确（diff 工具） |

### V3 调用方式

```bash
# claude-generate-patch.sh 使用 -p 模式 + 只读工具
claude -p \
  --allowedTools "Read,Grep,Glob,ListDirectory,Bash(git diff:*),Bash(git status:*),Bash(git show:*),Bash(git log:*),Bash(cat:*),Bash(head:*),Bash(tail:*),Bash(wc:*),Bash(find:*),Bash(grep:*),Bash(rg:*)" \
  --disallowedTools "Write,Edit,MultiEdit,Bash(npm:*),Bash(git add:*),Bash(git commit:*),Bash(deploy-*)" \
  "$PROMPT"
```

### V3 输出格式

Claude Code 必须使用以下格式输出完整文件内容：

```
<<<FILE:src/app/(public)/guides/page.tsx>>>
[完整的文件内容，不是 diff，不是部分代码]
<<<END_FILE>>>

<<<FILE:src/app/(public)/checklists/page.tsx>>>
[完整的文件内容]
<<<END_FILE>>>

<<<FILE:src/app/(public)/public-layout-client.tsx>>>
[完整的文件内容]
<<<END_FILE>>>
```

**关键要求**：
- 每个文件必须用 `<<<FILE:path>>>` 和 `<<<END_FILE>>>` 包裹
- path 必须是相对于项目根目录的完整路径
- 文件内容必须是完整的，不能是 diff 或部分代码
- 必须输出所有 allowed_files 中的文件
- 不能输出 allowed_files 之外的文件

### V3 任务队列格式

```json
[
  {
    "id": "night2-guides-checklists-v4-shell",
    "title": "Apply V4 Shell to guides and checklists pages",
    "mode": "patch",
    "allowed_files": [
      "src/app/(public)/guides/page.tsx",
      "src/app/(public)/checklists/page.tsx",
      "src/app/(public)/public-layout-client.tsx"
    ],
    "prompt": "输出完整的新文件内容，不要输出 patch。目标：1. 修改 src/app/(public)/guides/page.tsx，导入 JueshiV4PublicShell，并用 <JueshiV4PublicShell> 包裹原页面内容。..."
  }
]
```

### V3 流程

```
1. night-run.sh 从 queue.json 读取任务 (id, prompt, allowed_files)
2. claude-generate-patch.sh 调用 Claude Code (-p 模式 + 只读工具)
3. Claude Code 自己读取目标文件 (Read 工具)
4. Claude Code 输出完整的新文件内容 (<<<FILE:path>>> 格式)
5. claude-generate-patch.sh 提取文件内容到 .hermes/pipeline/proposals/<task-id>/<path>
6. claude-generate-patch.sh 使用 diff -u 生成 patch 到 .hermes/pipeline/patches/<task-id>.patch
7. ai-patch-runner.sh 验证 patch (allowlist, 硬禁止, git apply --check)
8. ai-patch-runner.sh 应用 patch (git apply)
9. ai-patch-runner.sh 构建验证 (npm run build)
10. 如果 build 失败，自动回滚 (git reset --hard)
11. night-run.sh 部署 staging (deploy-staging.sh)
12. night-run.sh curl 验证 (HTTP 200)
13. night-run.sh 更新状态 (state.json, completed.json)
```

### V3 状态码

| 状态码 | 含义 |
|--------|------|
| `CLAUDE_GENERATED_PROPOSALS` | Claude 成功输出完整文件内容 |
| `SCRIPT_GENERATED_PATCH` | 脚本成功生成 patch |
| `HERMES_APPLIED_PATCH` | Hermes 成功应用 patch |
| `FULL_FILE_PROPOSAL_MISSING_FILE` | Claude 未输出某个 allowed_file |
| `FULL_FILE_PROPOSAL_OUTSIDE_ALLOWLIST` | Claude 输出了 allowed_files 之外的文件 |
| `FULL_FILE_PROPOSAL_EMPTY_PATCH` | 生成的 patch 为空（文件无变化） |
| `PATCH_GENERATION_INVALID_OUTPUT` | Claude 输出格式错误 |
| `CLAUDE_PATCH_GENERATION_BLOCKED` | Claude 调用被阻止 |
| `CLAUDE_CODE_RATE_LIMITED_PAUSED` | Claude 触发 429 限流 |
| `PATCH_APPLIED_BUILD_OK` | Patch 应用 + build 成功 |
| `PATCH_BUILD_FAILED_ROLLED_BACK` | Build 失败，已自动回滚 |

### V3 安全保证

1. **Claude Code 不能写文件** — `--disallowedTools` 禁止 Write/Edit/MultiEdit
2. **Claude Code 不能执行危险命令** — 禁止 npm/git add/git commit/deploy-*
3. **脚本验证 allowed_files** — 只允许输出指定路径的文件
4. **Patch Runner 验证 allowlist** — 只允许修改指定路径
5. **Patch Runner 硬禁止** — package/schema/API/middleware/SKILL.md 永远不被修改
6. **Build 失败自动回滚** — git reset --hard 恢复到 patch 前状态
7. **不自动 commit** — 由用户或上层脚本决定是否提交

### V3 文件结构

```
.hermes/pipeline/
├── state.json                    # 当前运行状态
├── queue.json                    # 待执行任务队列
├── completed.json                # 已完成任务记录
├── locks/                        # 运行锁
│   └── claude-running.lock
├── proposals/                    # Claude 输出的完整文件内容
│   └── <task-id>/
│       ├── src/app/(public)/guides/page.tsx
│       ├── src/app/(public)/checklists/page.tsx
│       └── src/app/(public)/public-layout-client.tsx
└── patches/                      # 脚本生成的 patch
    └── <task-id>.patch
```

### V3 调试流程

如果 patch 应用失败，可以：

1. **查看 proposal 文件**：
   ```bash
   cat .hermes/pipeline/proposals/<task-id>/src/app/\(public\)/guides/page.tsx
   ```

2. **手动修改 proposal 文件**：
   ```bash
   vim .hermes/pipeline/proposals/<task-id>/src/app/\(public\)/guides/page.tsx
   ```

3. **重新生成 patch**：
   ```bash
   # 脚本会自动从 proposals/ 重新生成 patch
   ./scripts/night-run.sh
   ```

4. **手动生成 patch**：
   ```bash
   diff -u src/app/\(public\)/guides/page.tsx \
          .hermes/pipeline/proposals/<task-id>/src/app/\(public\)/guides/page.tsx \
          > /tmp/manual.patch
   ```

---

## 2. 架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Night Pipeline v3                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  night-run.sh (编排器)                                       │
│    │                                                         │
│    ├── 1. hermes-health-check.sh   (健康检查)                │
│    ├── 2. dequeue task              (从 queue.json 取任务)   │
│    ├── 3. claude-generate-patch.sh  (Claude 输出完整文件)    │
│    │       └── 提取 proposals + diff -u 生成 patch           │
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
│    ├── proposals/      (Claude 输出的完整文件)                │
│    └── patches/        (脚本生成的 patch 存档)                │
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
| `scripts/claude-generate-patch.sh` | 调用 Claude Code 输出完整文件，生成 patch |
| `scripts/night-run.sh` | 编排器：串联所有步骤，管理状态 |

### 状态文件

| 文件 | 作用 |
|------|------|
| `.hermes/pipeline/state.json` | 当前运行状态（IDLE/RUNNING/COMPLETED/FAILED） |
| `.hermes/pipeline/queue.json` | 待执行任务队列 |
| `.hermes/pipeline/completed.json` | 已完成任务记录 |
| `.hermes/pipeline/locks/` | 运行锁目录 |
| `.hermes/pipeline/proposals/` | Claude 输出的完整文件内容 |
| `.hermes/pipeline/patches/` | 脚本生成的 patch 存档 |

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
| `CLAUDE_GENERATED_PROPOSALS` | Claude 输出了完整文件 |
| `SCRIPT_GENERATED_PATCH` | 脚本生成了 patch |
| `HERMES_APPLIED_PATCH` | Hermes 应用了 patch |
| `FULL_FILE_PROPOSAL_MISSING_FILE` | Claude 未输出某个文件 |
| `FULL_FILE_PROPOSAL_OUTSIDE_ALLOWLIST` | Claude 输出了额外文件 |
| `FULL_FILE_PROPOSAL_EMPTY_PATCH` | 生成的 patch 为空 |
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

### Claude 未输出完整文件

```bash
# 查看 Claude 输出
cat .hermes/pipeline/patches/<task-id>.stdout.txt

# 检查 proposals 目录
ls -la .hermes/pipeline/proposals/<task-id>/

# 如果缺少某个文件，重新执行
./scripts/night-run.sh
```

### Patch 应用失败

```bash
# 查看 proposal 文件
cat .hermes/pipeline/proposals/<task-id>/src/app/\(public\)/guides/page.tsx

# 手动修改 proposal 文件
vim .hermes/pipeline/proposals/<task-id>/src/app/\(public\)/guides/page.tsx

# 重新生成 patch（脚本会自动从 proposals/ 生成）
./scripts/night-run.sh

# 或手动生成 patch
diff -u src/app/\(public\)/guides/page.tsx \
       .hermes/pipeline/proposals/<task-id>/src/app/\(public\)/guides/page.tsx \
       > /tmp/manual.patch

# 手动应用 patch
./scripts/ai-patch-runner.sh /tmp/manual.patch
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
2. ✅ 升级到 V3（Full-file Proposal Mode）
3. ⬜ 用户验收 `/tools` 和 `/destinations`
4. ⬜ Night 2: `/guides` + `/checklists` via V3 patch-based pipeline
5. ⬜ Night 3: `/topics` + `/search` via V3 patch-based pipeline
6. ⬜ 集成到 cron job 自动执行
7. ⬜ 建立 proposal 模板库

---

## 10. Night Pipeline V3 实际运行总结

### 10.1 成功点

#### ✅ V3 模式验证成功
- **Full-file Proposal 模式有效**：Claude 输出完整文件内容，脚本生成 patch，避免了 V2 的格式错误问题
- **Design System 基础组件建立**：成功创建 14 个基础组件（PageContainer, PageHero, SectionHeader 等）
- **Build 验证通过**：所有组件通过 TypeScript 类型检查和 Next.js 构建
- **文档完整**：生成了组件索引文档和架构方案文档

#### ✅ 工作流程优化
- **Proposal 目录结构清晰**：`.hermes/pipeline/proposals/<task-id>/` 便于审查和调试
- **Patch 生成自动化**：脚本自动对比原始文件和 proposal 文件，生成 unified diff
- **错误处理完善**：缺少文件、超出 allowlist、空 patch 等情况都有明确的错误码

#### ✅ 实际案例
```bash
# Design System 基础组件建立任务
Task ID: design-system-v1-foundation
Mode: full-file-proposal
Files: 14 个组件 + index.ts + 文档
Result: ✅ 成功
```

### 10.2 失败点

#### ❌ V2 模式失败案例
- **Patch 格式错误**：Claude 生成的 unified diff 经常有 hunk header 行数不匹配
- **Context line 不匹配**：Claude 无法准确记住文件的实际内容，导致 patch 应用失败
- **需要人工干预**：多次尝试后仍需手动修复 patch，效率低下

#### ❌ V1 模式失败案例
- **直接编辑风险高**：Claude 直接修改文件，无法审查和回滚
- **缺乏版本控制**：修改后难以追踪变更历史
- **错误难以定位**：出现问题时难以确定是哪一步出错

### 10.3 经验

#### 模式选择
1. **优先使用 V3 (Full-file Proposal)**：
   - 适用于：组件创建、页面重构、批量修改
   - 优势：Claude 只需理解需求，不需要掌握 diff 格式
   - 成功率：接近 100%

2. **避免使用 V2 (Patch Generation)**：
   - 问题：Claude 生成的 patch 格式错误率高
   - 适用场景：仅限简单、小范围修改
   - 成功率：约 60-70%

3. **禁止使用 V1 (Direct Edit)**：
   - 风险：无法审查、无法回滚
   - 适用场景：无（已废弃）

#### 任务设计
1. **明确 allowlist**：
   - 必须明确指定允许修改的文件路径
   - 避免使用通配符（如 `src/**`）
   - 示例：`["src/components/design-system/PageContainer.tsx"]`

2. **详细的 prompt**：
   - 说明修改目的和预期结果
   - 提供具体的技术要求（TypeScript、Tailwind、响应式等）
   - 明确禁止事项（不要修改业务逻辑、不要引入新依赖等）

3. **分阶段执行**：
   - 大任务拆分为多个小任务
   - 每个任务完成后验证
   - 避免一次性修改过多文件

#### 调试技巧
1. **查看 proposal 文件**：
   ```bash
   cat .hermes/pipeline/proposals/<task-id>/src/components/design-system/PageContainer.tsx
   ```

2. **手动生成 patch**：
   ```bash
   diff -u original.tsx proposal.tsx > manual.patch
   ```

3. **检查错误日志**：
   ```bash
   cat .hermes/pipeline/patches/<task-id>.stderr.txt
   ```

### 10.4 禁止事项

#### 绝对禁止
- ❌ **禁止修改硬禁止文件**：
  - `package.json` / `package-lock.json`
  - `prisma/schema.prisma`
  - `src/middleware.ts`
  - `src/app/api/**`
  - `.env` 文件

- ❌ **禁止触碰 production**：
  - 不直接修改 production 数据库
  - 不直接部署到 production 环境
  - 不修改 9833416@qq.com 相关配置

- ❌ **禁止使用 V1 模式**：
  - 不使用 Claude 直接编辑文件
  - 不使用 `acceptEdits` 或 `bypassPermissions`

#### 谨慎操作
- ⚠️ **修改业务逻辑前必须确认**：
  - 确认修改不会影响现有功能
  - 确认有完整的测试覆盖
  - 确认可以回滚

- ⚠️ **大批量修改前必须 dry-run**：
  ```bash
  ./scripts/night-run.sh --dry-run
  ```

- ⚠️ **修改前必须备份**：
  ```bash
  git add .
  git commit -m "backup before night pipeline"
  ```

### 10.5 最佳实践

#### 任务准备
1. **明确目标**：
   ```markdown
   目标：创建 PageContainer 组件
   要求：
   - TypeScript + React
   - Tailwind CSS
   - 响应式设计
   - 支持 Dark Mode
   ```

2. **指定 allowlist**：
   ```json
   {
     "allowlist": [
       "src/components/design-system/PageContainer.tsx"
     ]
   }
   ```

3. **提供上下文**：
   - 相关文件路径
   - 依赖的组件
   - 预期的使用场景

#### 执行流程
1. **Dry-run 验证**：
   ```bash
   ./scripts/night-run.sh --dry-run
   ```

2. **执行任务**：
   ```bash
   ./scripts/night-run.sh
   ```

3. **审查 proposal**：
   ```bash
   ls -la .hermes/pipeline/proposals/<task-id>/
   cat .hermes/pipeline/proposals/<task-id>/src/components/design-system/PageContainer.tsx
   ```

4. **验证 patch**：
   ```bash
   cat .hermes/pipeline/patches/<task-id>.patch
   ```

5. **应用并测试**：
   ```bash
   npm run build
   npm run dev
   ```

#### 错误处理
1. **Proposal 缺失文件**：
   - 错误码：`FULL_FILE_PROPOSAL_MISSING_FILE`
   - 解决：重新执行任务，或手动创建缺失文件

2. **Proposal 超出 allowlist**：
   - 错误码：`FULL_FILE_PROPOSAL_OUTSIDE_ALLOWLIST`
   - 解决：检查 allowlist 配置，或调整 prompt

3. **Patch 为空**：
   - 错误码：`FULL_FILE_PROPOSAL_EMPTY_PATCH`
   - 解决：检查 proposal 文件是否与原始文件相同

4. **Build 失败**：
   - 解决：查看构建错误，修复 proposal 文件，重新生成 patch

#### 性能优化
1. **并行执行**：
   - 多个独立任务可以并行执行
   - 使用不同的 task-id 避免冲突

2. **缓存 proposal**：
   - 保留 proposal 文件用于调试
   - 定期清理旧的 proposal 目录

3. **监控资源**：
   ```bash
   ./scripts/hermes-health-check.sh
   ```

---

## 11. Program Manager V2 命令入口

> 新增时间: 2026-07-09  
> 版本: v2.0 (Script Implementation)

### 11.1 概述

Program Manager V2 为 `night-run.sh` 增加了 `--batch` 和 `--task` 命令，支持直接执行指定的 Batch 或 Task，而不再依赖队列顺序。

### 11.2 新增命令

```bash
# 执行指定 Batch
bash scripts/night-run.sh --batch <batch-id>

# 执行指定 Task
bash scripts/night-run.sh --task <task-id>

# Dry run 模式（模拟执行，不实际修改）
bash scripts/night-run.sh --batch <batch-id> --dry-run
bash scripts/night-run.sh --task <task-id> --dry-run
```

### 11.3 内置 Batch/Task Registry

脚本内置了以下 Batch 和 Task 的映射：

**可用 Batch：**

| Batch ID | 名称 | 风险等级 | 预计耗时 |
|----------|------|----------|----------|
| DS-02-B3 | Topics & Search Design System | 🟢 低 | 30-45min |
| DS-05-B4 | WorkspaceSidebar 整合 | 🟡 中 | 30min |
| DS-05-B5 | ToolGrid 整合 | 🟡 中 | 1h |

**可用 Task：**

| Task ID | 名称 | 风险等级 | 预计耗时 |
|---------|------|----------|----------|
| ds-02-b3-topics | Apply Design System to /topics | 🟢 低 | 15min |
| ds-02-b3-search | Apply Design System to /search | 🟢 低 | 15min |
| ds-05-b4-1 | Consolidate WorkspaceSidebar | 🟡 中 | 20min |
| ds-05-b5-1 | Create unified ToolGrid | 🟡 中 | 30min |

### 11.4 使用示例

```bash
# 1. 查看帮助
bash scripts/night-run.sh --help

# 2. Dry run 测试 Batch
bash scripts/night-run.sh --batch DS-02-B3 --dry-run

# 3. Dry run 测试 Task
bash scripts/night-run.sh --task ds-05-b4-1 --dry-run

# 4. 实际执行 Batch（会调用 Claude Code 生成 proposal）
bash scripts/night-run.sh --batch DS-02-B3

# 5. 实际执行 Task
bash scripts/night-run.sh --task ds-05-b4-1
```

### 11.5 错误处理

- **Batch 不存在**: 输出 `PROGRAM_BATCH_NOT_FOUND`，并列出所有可用 Batch
- **Task 不存在**: 输出 `PROGRAM_TASK_NOT_FOUND`，并列出所有可用 Task

### 11.6 与原有命令的兼容性

所有原有命令仍然有效：

```bash
# 原有命令（不受影响）
bash scripts/night-run.sh                     # 运行队列中的下一个任务
bash scripts/night-run.sh --status            # 查看状态
bash scripts/night-run.sh --enqueue <desc>    # 添加任务到队列
bash scripts/night-run.sh --list              # 列出队列
bash scripts/night-run.sh --dry-run           # 模拟运行队列中的下一个任务
bash scripts/night-run.sh --help              # 显示帮助
```

---

## 12. Rate Limit 自动恢复机制

> 新增时间: 2026-07-09  
> 版本: v3.2 (Rate Limit Resume)

### 12.1 概述

当 Claude Code 遇到 429 rate limit 或 provider rate limiting 时，Night Pipeline 会自动暂停并在一段时间后重试当前任务，而不是直接失败。

### 12.2 触发条件

`claude-generate-patch.sh` 会在以下情况下返回 `RATE_LIMITED` 状态：

1. **Exit code 75** — Claude Code 明确返回的 rate limit 信号
2. **输出包含 rate limit 关键词** — 即使 exit code 为 0，如果输出中包含以下关键词也会触发：
   - `429`
   - `rate limit` / `rate_limit`
   - `provider rate`
   - `too many request`
   - `throttl`

### 12.3 暂停策略

**第一次 rate limit：**
- 暂停时长：22 分钟（1320 秒）
- 写入 `.hermes/pipeline/rate-limit.lock`
- 更新 `state.json` 状态为 `RATE_LIMITED_PAUSED`

**1 小时内第二次 rate limit：**
- 暂停时长：30 分钟（1800 秒）
- 视为连续 rate limit，使用更长的暂停时间

**最大重试次数：**
- 最多重试 3 次
- 超过 3 次后输出 `PROGRAM_RATE_LIMIT_MAX_RETRY_PAUSED` 并停止

### 12.4 rate-limit.lock 文件结构

```json
{
  "task_id": "DS-02-B3",
  "batch_id": "DS-02-B3",
  "pause_seconds": 1320,
  "retry_count": 1,
  "resume_epoch": 1720523456,
  "created": "2026-07-09T10:30:00"
}
```

**字段说明：**
- `task_id` — 当前正在执行的 Task ID
- `batch_id` — 当前正在执行的 Batch ID
- `pause_seconds` — 暂停时长（秒）
- `retry_count` — 已重试次数
- `resume_epoch` — 恢复时间的 Unix 时间戳
- `created` — 锁文件创建时间

### 12.5 恢复流程

1. 暂停结束后，`night-run.sh` 检查 `rate-limit.lock`
2. 如果当前时间 >= `resume_epoch`，删除锁文件
3. 重新调用 `claude-generate-patch.sh` 执行同一个 Task
4. 如果再次触发 rate limit，重复暂停流程（retry_count + 1）

### 12.6 Cooldown 处理（Exit Code 76）

当 Claude Code 返回 exit code 76（cooldown / concurrent block）时：

- 等待 60 秒后重试
- 最多重试 5 次
- 超过 5 次后输出 `CLAUDE_CODE_COOLDOWN_MAX_RETRY` 并停止

### 12.7 --status 显示 Rate Limit 信息

运行 `bash scripts/night-run.sh --status` 时，如果存在 `rate-limit.lock`，会显示：

```
Rate Limit Status:
  status: RATE_LIMITED
  task_id: DS-02-B3
  batch_id: DS-02-B3
  retry_count: 1/3
  pause_seconds: 1320
  resume_time: 2026-07-09 11:00:00
  remaining: 1800s (30m0s)
  created: 2026-07-09T10:30:00
```

如果没有 rate limit，显示：

```
Rate Limit Status:
  status: OK (no active rate limit)
```

### 12.8 Dry Run 行为

使用 `--dry-run` 时，如果遇到 rate limit：

- **不会真的 sleep**
- 只输出将会暂停的时长和恢复时间
- 输出 `NIGHT_DRY_RUN_RATE_LIMIT_SIMULATED`

示例：

```bash
$ bash scripts/night-run.sh --batch DS-02-B3 --dry-run
[INFO] DRY RUN: Would pause 1320s then retry task DS-02-B3
[INFO] DRY RUN: Resume at: 2026-07-09 11:00:00
[INFO] DRY RUN: Rate limit retry: 1/3
NIGHT_DRY_RUN_RATE_LIMIT_SIMULATED
```

### 12.9 手动清除 Rate Limit Lock

如果需要手动清除 rate limit lock（不推荐）：

```bash
rm -f .hermes/pipeline/rate-limit.lock
```

然后重新运行任务：

```bash
bash scripts/night-run.sh --batch DS-02-B3
```

### 12.10 状态码

| 状态码 | 含义 |
|--------|------|
| `RATE_LIMITED` | Claude Code 触发 rate limit |
| `RATE_LIMITED_PAUSED` | 已暂停，等待恢复 |
| `PROGRAM_RATE_LIMIT_MAX_RETRY_PAUSED` | 超过最大重试次数，已停止 |
| `CLAUDE_CODE_COOLDOWN_MAX_RETRY` | Cooldown 重试超过 5 次 |

### 12.11 示例场景

**场景 1：第一次 rate limit**

```bash
$ bash scripts/night-run.sh --batch DS-02-B3
[STEP] 3/7 Generate patch (V3 full-file proposal mode)
[WARN] RATE LIMITED: rate limit (attempt 1/3)
[WARN] Pausing 1320s (22-30min). Resume at: 2026-07-09 11:00:00
[WARN] Retry count: 1/3
[INFO] Sleeping 1320s...
# ... 22 分钟后 ...
[INFO] Resumed. Retrying task DS-02-B3...
[STEP] 3/7 Generate patch (V3 full-file proposal mode)
[OK] Patch generated: .hermes/pipeline/patches/DS-02-B3.patch
```

**场景 2：连续 rate limit**

```bash
$ bash scripts/night-run.sh --batch DS-02-B3
[STEP] 3/7 Generate patch (V3 full-file proposal mode)
[WARN] RATE LIMITED: rate limit (attempt 1/3)
[WARN] Pausing 1320s. Resume at: 2026-07-09 11:00:00
# ... 22 分钟后 ...
[INFO] Resumed. Retrying task DS-02-B3...
[STEP] 3/7 Generate patch (V3 full-file proposal mode)
[WARN] RATE LIMITED: consecutive rate limit (2x in 1h)
[WARN] Pausing 1800s. Resume at: 2026-07-09 11:30:00
# ... 30 分钟后 ...
[INFO] Resumed. Retrying task DS-02-B3...
[OK] Patch generated
```

**场景 3：超过最大重试次数**

```bash
$ bash scripts/night-run.sh --batch DS-02-B3
# ... 3 次 rate limit 后 ...
[ERROR] Rate limit retry count exceeded maximum (3)
[ERROR] Task: DS-02-B3 | Batch: DS-02-B3
PROGRAM_RATE_LIMIT_MAX_RETRY_PAUSED
```

---

## 13. Checkpoint Engine（V3.3 新增）

> 新增时间: 2026-07-09  
> 版本: v3.3 (Checkpoint Engine)

### 13.1 概述

Checkpoint Engine 提供四级 checkpoint 保存和恢复能力，确保任务在崩溃或中断后能够自动恢复，避免重复执行已完成的工作。

### 13.2 Checkpoint 层级

```
Program Checkpoint (.hermes/pipeline/checkpoints/program.json)
├── Epic Checkpoint (epic.json)
├── Batch Checkpoint (batch.json)
└── Task Checkpoint (task.json)
```

### 13.3 Checkpoint 文件结构

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

### 13.4 Checkpoint 保存时机

Checkpoint 在以下时机自动保存：

1. **Task 开始执行时** - 保存 in_progress 状态
2. **Task 执行失败时** - 保存 failed 状态和错误信息
3. **Task 执行成功时** - 保存 completed 状态和完成时间
4. **Rate limit 暂停时** - 保存 rate_limit_status
5. **Retry 发生时** - 更新 retry_count

### 13.5 Resume Engine

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

### 13.6 Program State

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

### 13.7 命令

**查看 Program 状态**
```bash
bash scripts/night-run.sh --program-status
```

输出示例：
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

### 13.8 Morning Brief V2

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

### 13.9 Night Report V2

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

### 13.10 Crash Recovery

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

### 13.11 文件结构

```
.hermes/pipeline/
├── checkpoints/                    # Checkpoint 文件
│   ├── program.json               # Program 级别 checkpoint
│   ├── epic.json                  # Epic 级别 checkpoint
│   ├── batch.json                 # Batch 级别 checkpoint
│   └── task.json                  # Task 级别 checkpoint
├── program-state.json             # 全局 Program 状态
└── ...

.hermes/reports/
├── morning-brief.md               # 每日早间报告
└── night-report.md                # 每晚执行报告
```

---

**文档版本**: v3.3  
**创建时间**: 2026-07-08  
**更新时间**: 2026-07-09  
**关联脚本**: `scripts/night-run.sh`, `scripts/claude-generate-patch.sh`, `scripts/ai-patch-runner.sh`, `scripts/hermes-health-check.sh`
