# Patch-Based Claude Pipeline

> **为什么从 Claude direct file edit 切换到 patch-based**

---

## 1. 背景与动机

### 1.1 问题

在 V4 过夜长链路任务中，我们遇到了以下问题：

1. **Claude Code 非交互直接写文件不稳定** — `acceptEdits` 模式下 Claude Code 直接修改文件，但缺乏确定性验证步骤
2. **FD 泄漏** — `acceptEdits` 模式可能导致文件描述符泄漏，Hermes 曾出现 `Too many open files` 错误
3. **缺乏原子性** — 直接编辑没有"全部成功或全部回滚"的保证
4. **审计困难** — 直接编辑难以在应用前审查变更内容
5. **职责模糊** — Claude Code 同时负责生成和写入，难以区分"AI 建议"和"系统执行"

### 1.2 目标

- **确定性**: 每次应用 patch 的结果可预测
- **可审计**: patch 可在应用前人工或自动审查
- **原子性**: build 失败时自动回滚，不留半改状态
- **安全**: 硬禁止文件永远不被修改
- **可追溯**: 每个 patch 都有来源标记

---

## 2. 职责划分

| 角色 | 职责 | 不做什么 |
|------|------|----------|
| **Hermes** | 任务编排、patch 保存、调用 runner、验证结果、提交代码 | 不直接写业务代码 |
| **Claude Code** | 只生成 unified diff patch（通过 `--patch` 或输出 diff） | 不直接写文件（除非交互式授权环境） |
| **ai-patch-runner.sh** | 验证 allowlist、apply patch、build、失败回滚 | 不自动 commit、不 deploy |
| **OpenClaw** | 基础设施维护、进程管理、FD 监控 | 不改业务代码 |
| **用户** | 视觉验收、最终 approve、触发 production deploy | — |

---

## 3. 标准任务流程

```
┌─────────────────────────────────────────────────────────────────┐
│  1. 任务选择                                                     │
│     Hermes 从 docs/audit-evidence/v4-shell-coverage-matrix.md   │
│     选择下一批待改页面                                            │
├─────────────────────────────────────────────────────────────────┤
│  2. Claude 生成 patch                                            │
│     claude-safe --patch "修改 /checklists 使用 JueshiV4Shell"   │
│     输出 → /tmp/task-YYYYMMDD-HHMMSS.patch                      │
├─────────────────────────────────────────────────────────────────┤
│  3. Patch 保存                                                   │
│     Hermes 保存 patch 到 docs/patches/ 或直接传给 runner         │
├─────────────────────────────────────────────────────────────────┤
│  4. ai-patch-runner 检查                                         │
│     - 路径 allowlist 检查                                        │
│     - 硬禁止文件检查                                              │
│     - git apply --check                                         │
├─────────────────────────────────────────────────────────────────┤
│  5. Apply                                                        │
│     git apply (原子操作)                                         │
├─────────────────────────────────────────────────────────────────┤
│  6. Build                                                        │
│     npm run build                                               │
│     失败 → git reset --hard HEAD → PATCH_BUILD_FAILED_ROLLED_BACK│
├─────────────────────────────────────────────────────────────────┤
│  7. Deploy staging                                               │
│     ./scripts/deploy-staging.sh                                  │
├─────────────────────────────────────────────────────────────────┤
│  8. curl 验证                                                    │
│     curl -I https://i.jueshi.net/<page>                         │
├─────────────────────────────────────────────────────────────────┤
│  9. Report                                                       │
│     更新 docs/overnight-v4-chain-report.md                       │
│     标记: CLAUDE_GENERATED_PATCH + HERMES_APPLIED_PATCH          │
├─────────────────────────────────────────────────────────────────┤
│ 10. 用户视觉验收                                                  │
│     浏览器访问 staging URL                                        │
│     确认 UI 正确、无双 Header/Footer                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. 状态码

### 4.1 Patch 来源标记

| 状态码 | 含义 |
|--------|------|
| `CLAUDE_GENERATED_PATCH` | Claude Code 生成了 patch（未应用） |
| `HERMES_APPLIED_PATCH` | Hermes 通过 ai-patch-runner 成功应用了 patch |
| `CLAUDE_CODE_DIRECT_FILE_EDIT` | **已废弃** — 仅在 Claude Code 交互式授权环境中直接改文件时使用 |

### 4.2 Runner 状态码

| 状态码 | 含义 |
|--------|------|
| `PATCH_APPLIED_BUILD_OK` | Patch 应用成功，build 通过 |
| `PATCH_BUILD_FAILED_ROLLED_BACK` | Build 失败，已自动回滚 |
| `PATCH_HARD_BLOCKED_PATH` | Patch 命中硬禁止文件 |
| `PATCH_OUTSIDE_ALLOWLIST` | Patch 超出 allowlist |
| `PATCH_APPLY_CHECK_FAILED` | `git apply --check` 失败 |
| `PATCH_APPLY_FAILED` | `git apply` 失败 |
| `PATCH_POST_APPLY_VIOLATION_ROLLED_BACK` | 应用后 diff 违反 allowlist |
| `PATCH_DRY_RUN_OK` | Dry-run 模式，所有检查通过 |
| `PIPELINE_INFRA_BLOCKED_DIRTY_WORKTREE` | 工作区不干净，无法应用 |

### 4.3 Health Check 状态码

| 状态码 | 含义 |
|--------|------|
| `HEALTH_OK` | 一切正常 |
| `HERMES_FD_WARNING` | FD > 500 |
| `HERMES_FD_CRITICAL` | FD > 1000 |
| `CLAUDE_RATE_LIMIT_ACTIVE` | rate-limit.lock 存在 |
| `CLAUDE_RUNNING_LOCK_ACTIVE` | claude-safe-running.lock 存在 |

---

## 5. 安全规则

### 5.1 Allowlist

只有以下路径可以被 patch 修改：

```
src/app/(public)/**
src/components/layout/**
src/components/ui-lab/**
docs/**
```

### 5.2 硬禁止

以下文件/路径**永远**不能被 patch 修改：

```
package.json
package-lock.json
prisma/schema.prisma
src/middleware.ts
src/app/api/**
src/lib/task-chain.ts
src/lib/destinations-db.ts
.env
.env.*
**/SKILL.md
```

### 5.3 其他红线

- 不碰 production
- 不碰 production DB
- 不碰 9833416@qq.com
- 不使用 SQL
- 不执行 prisma db push / migration
- 不新增依赖

---

## 6. 使用示例

### 6.1 生成 patch（Claude Code）

```bash
# Claude Code 输出 unified diff 到 stdout
~/bin/claude-safe --patch "将 /checklists 页面包装为 JueshiV4PublicShell" > /tmp/checklists-v4.patch
```

### 6.2 Dry-run 检查

```bash
./scripts/ai-patch-runner.sh /tmp/checklists-v4.patch --dry-run
```

### 6.3 应用 patch

```bash
./scripts/ai-patch-runner.sh /tmp/checklists-v4.patch
```

### 6.4 审查并提交

```bash
git diff  # 审查变更
git add 'src/app/(public)/checklists/page.tsx'
git commit -m "style: apply v4 shell to checklists page"
```

### 6.5 部署验证

```bash
./scripts/deploy-staging.sh
curl -I https://i.jueshi.net/checklists
```

### 6.6 健康检查

```bash
./scripts/hermes-health-check.sh           # 全面检查
./scripts/hermes-health-check.sh 12345     # 检查特定 PID
```

---

## 7. 回滚策略

### 7.1 自动回滚

ai-patch-runner 在以下情况自动回滚：

- Build 失败 → `git reset --hard HEAD`
- Post-apply diff 违反 allowlist → `git checkout -- .`

### 7.2 手动回滚

```bash
# 查看备份
ls .patch-backups/

# 恢复到 patch 前状态
git reset --hard HEAD

# 或从备份恢复
git apply .patch-backups/pre-patch-YYYYMMDD-HHMMSS.diff
```

---

## 8. 下一步

1. ✅ 建立基础设施（本文档 + 脚本）
2. ⬜ 用 patch-based 模式执行 Phase 4 第二批（P2 页面）
3. ⬜ 建立 patch 存档目录 `docs/patches/`
4. ⬜ 集成到过夜长链路 cron job
5. ⬜ 用户验收后合入 production

---

**文档创建时间**: 2026-07-08 07:19 CST  
**关联脚本**: `scripts/hermes-health-check.sh`, `scripts/ai-patch-runner.sh`  
**关联状态**: `docs/nightly-task-state.md`
