# PROJECT_MEMORY.md

> 项目长期记忆 — 每次开发前必须阅读  
> 最后更新: 2026-07-09  
> 维护者: Hermes Agent + 开发团队

---

## 1. 项目当前阶段

| 项目 | 值 |
|------|-----|
| **项目名** | 绝世百宝箱 (jueshi.net) |
| **当前阶段** | Public Experience Upgrade Batch 1 完成 |
| **管理模式** | Program → Epic → Batch → Task → Checkpoint → Resume |
| **Pipeline 版本** | V3.2 Full-file Proposal Mode + Rate Limit Resume + Checkpoint Engine |
| **Design System** | V1 Foundation（14 组件，公共页面迁移进行中） |
| **重复组件** | 7 组 → 5 组（Phase 5 Batch 1 完成） |

### SSH 部署永久规则

**xixiong-saas staging/production SSH 连接必须使用 `deploy@192.129.155.149`。**

遇到 banner/kex 超时，先核对用户名，不得尝试 root/admin/chq。

### Program Manager V3 状态

**当前状态**: ✅ CHECKPOINT_ENGINE_READY + Night 8 完成

- ✅ 四层模型建立 (Program → Epic → Batch → Task)
- ✅ Program Queue 规范建立
- ✅ `--batch <batch-id>` 命令已实现
- ✅ `--task <task-id>` 命令已实现
- ✅ Batch/Task Registry 内置映射
- ✅ `--dry-run` 组合支持
- ✅ `--help` 已更新
- ✅ Rate limit 自动暂停/恢复机制已实现
- ✅ Cooldown (exit 76) 自动重试机制已实现
- ✅ Checkpoint Engine 已实现（program/epic/batch/task 四级 checkpoint）
- ✅ Resume Engine 已实现（自动检测未完成 task 并恢复）
- ✅ Program State 管理已实现（program-state.json）
- ✅ Morning Brief V2 自动生成器
- ✅ Night Report V2 自动生成器
- ✅ `--program-status` 命令已实现
- ✅ Crash Recovery 支持（基于 checkpoint 恢复）

### Program 概览

| Program | 状态 | 进度 | 关键指标 |
|---------|------|------|----------|
| **Design System Migration** | 🟡 进行中 | 27.5% | 重复组件 7→4，DS 覆盖率 0.9% |
| **V4 Shell Unification** | 🟡 进行中 | 40% | V4 覆盖率 5.9% |
| **Workspace Enhancement** | 🔴 未开始 | 0% | - |
| **Performance Optimization** | 🔴 未开始 | 0% | - |

### 最近完成

- ✅ Phase 5 Batch 1: WorkspaceSidebar 收敛（删除 2 个死代码组件，减少 377 行）
- ✅ Night 8: V4 Shell 统一 - Blog 和 Cities 页面（/guides/[slug], /cities/[city]）
- ✅ Night 6: 组件整合（ActionCard, StatusBadge, EmptyState）
- ✅ Night 5: V4 Shell 统一 + Design System 应用
- ✅ Night 4: V4 Shell 统一（Core Pages）

---

## 2. 当前分支

```
ui/overnight-polish-phase1
```

---

## 3. 当前 Pipeline 版本

**V3 — Full-file Proposal Mode**

- Claude Code 只读，输出完整文件内容
- 脚本使用 `diff -u` 生成 unified diff patch
- `ai-patch-runner.sh` 确定性 apply + build + rollback
- 成功率 ~100%

---

## 4. 当前 Design System 版本

**V1 — Foundation**

14 个基础组件已建立，**0 个页面使用**。

| 组件 | 文件 |
|------|------|
| PageContainer | `design-system/PageContainer.tsx` |
| PageHero | `design-system/PageHero.tsx` |
| SectionHeader | `design-system/SectionHeader.tsx` |
| ContentSection | `design-system/ContentSection.tsx` |
| StatsGrid | `design-system/StatsGrid.tsx` |
| StatsCard | `design-system/StatsCard.tsx` |
| ActionCard | `design-system/ActionCard.tsx` |
| EmptyState | `design-system/EmptyState.tsx` |
| PageCTA | `design-system/PageCTA.tsx` |
| StickySidebar | `design-system/StickySidebar.tsx` |
| FilterToolbar | `design-system/FilterToolbar.tsx` |
| BreadcrumbBar | `design-system/BreadcrumbBar.tsx` |
| TagGroup | `design-system/TagGroup.tsx` |
| StatusBadge | `design-system/StatusBadge.tsx` |

---

## 5. 已完成页面

### V4 Shell 统一 (9 个 Production 页面)

| 页面 | Shell | 状态 |
|------|-------|------|
| `/` 首页 | JueshiV4HomeCandidateV4Shell | ✅ Production |
| `/tools` | JueshiV4PublicShell | ✅ Production |
| `/resources` | JueshiV4PublicShell | ✅ Production |
| `/resources/site/[id]` | JueshiV4PublicShell | ✅ Production |
| `/destinations` | JueshiV4PublicShell | ✅ Production |
| `/guides` | JueshiV4PublicShell | 🟡 Staging（待验收） |
| `/checklists` | JueshiV4PublicShell | 🟡 Staging（待验收） |
| `/topics` | JueshiV4PublicShell | ✅ Staging（Night 4 完成） |
| `/search` | JueshiV4PublicShell | ✅ Staging（Night 4 完成） |

### 未统一页面 (214 个)

- `/topics` — P0 待统一
- `/search` — P0 待统一
- `/about`, `/contact` — P1 Design System 试点
- `/workspace/*` — P3 高风险

---

## 6. 已验证成功的方案

| 方案 | 验证结果 |
|------|----------|
| V3 Full-file Proposal Pipeline | ✅ Patch 成功率 ~100% |
| JueshiV4PublicShell 包裹模式 | ✅ 7 页面验证通过 |
| public-layout-client 跳过逻辑 | ✅ 正确隔离 V4 页面 |
| Night Pipeline 自动部署 staging | ✅ build + deploy + curl 验证 |
| Design System 组件建立 | ✅ 14 组件已建立 |

---

## 7. 已踩坑并禁止重复的方案

| 坑 | 原因 | 禁止方案 |
|----|------|----------|
| V1 Pipeline 失败 | Hermes 转述文件内容导致信息丢失 | ❌ 不让 Hermes 转述代码 |
| V2 Pipeline 失败 | Claude 手写 unified diff 格式错误 | ❌ 不让 Claude 生成 patch |
| Claude direct file edit | 无法审计、无法回滚 | ❌ 不再作为默认方案 |
| Design System 重复创建 | 已有组件未查就重新创建 | ❌ 必须先查 COMPONENT_REGISTRY |
| prisma db push | 可能破坏 production 数据 | ❌ 永远禁止 |
| 直接修改 production | 无 staging 验证 | ❌ 必须 staging-first |

---

## 8. 不要重复开发的组件

**Design System 已有，不要重新创建：**

- PageContainer, PageHero, SectionHeader, ContentSection
- StatsGrid, StatsCard, ActionCard, EmptyState
- PageCTA, StickySidebar, FilterToolbar
- BreadcrumbBar, TagGroup, StatusBadge

**重复组件（不要创建更多重复版本）：**

- ActionCard (design-system vs saas) — 保留 design-system
- EmptyState (design-system vs workspace) — 保留 design-system
- StatusBadge (design-system vs saas) — 保留 design-system
- WorkspaceSidebar (saas vs workspace) — 待合并
- ad-banner (cms vs home) — 待合并
- theme-toggle (navigation vs root) — 保留 navigation
- tool-grid (home vs tools) — 待合并

---

## 9. 不要删除的组件

| 组件 | 原因 |
|------|------|
| `JueshiV4HomeCandidateV4Shell` | 首页生产使用 |
| `JueshiV4PublicShell` | 7 个页面生产使用 |
| `JueshiV4Header` / `JueshiV4Footer` | V4 页面使用 |
| `header.tsx` | 非 V4 页面仍在使用 |
| `footer-new.tsx` | 非 V4 页面仍在使用 |
| `public-layout-client.tsx` | V4 跳过逻辑核心 |
| Design System 全部 14 个组件 | 即将应用 |
| `9833416@qq.com` 相关代码 | 永久保护账号 |

---

## 10. 高风险区域

| 区域 | 风险 | 原因 |
|------|------|------|
| `/workspace/*` | 🔴 高 | 涉及认证逻辑，影响用户核心功能 |
| `prisma/schema.prisma` | 🔴 高 | 数据库结构，不可逆 |
| `src/middleware.ts` | 🔴 高 | 全局中间件 |
| `src/app/api/**` | 🔴 高 | API 接口 |
| `src/lib/auth.ts` | 🔴 高 | 认证逻辑 |
| `package.json` | 🔴 高 | 依赖管理 |
| Production 环境 | 🔴 高 | 影响真实用户 |

---

## 11. Production 保护规则

### 永久禁止

- ❌ `prisma db push` — 永远禁止
- ❌ 破坏性 SQL (DROP/DELETE/TRUNCATE) — 永远禁止
- ❌ Production 直接修改 — 必须 staging-first
- ❌ 输出密钥 (DATABASE_URL, SSH key, password) — 永远禁止
- ❌ 修改/删除 9833416@qq.com — 永远保护
- ❌ 重置 9833416@qq.com 密码 — 永远禁止
- ❌ 未经确认切换 DNS — 永远禁止
- ❌ 声称用户满意 — 永远禁止
- ❌ 扩展 Beta — 永远禁止
- ❌ 公开推广 — 永远禁止

### Staging-First 流程

```
feature/* → staging branch → i.jueshi.net → 用户验收 → audit → main → jueshi.net → smoke test → 观察
```

### Audit Gate (强制)

- Production 发布前必须运行 `tools/jueshi-audit`
- 没有证据路径的 audit 结果无效
- P0/P1 问题未清除不能进入 production
- 用户不能豁免 P0/P1

---

## 12. 账号保护规则

### 永久保护账号

| 账号 | 规则 |
|------|------|
| `9833416@qq.com` | ❌ 禁止修改/删除/重置/ repurpose |
| `9833416@qq.com` 密码 | ❌ 禁止重置 |

### 允许操作的账号

| 账号 | 用途 |
|------|------|
| `test@jueshi.net` | 测试账号 |
| Beta invite codes | BETA2026-001, INVITE-X3RC7SSW |

---

## 13. Claude Code 角色

**当前角色**: 只读 Proposal Generator

- ✅ 使用 `-p` headless 模式
- ✅ 只读工具 (Read, Grep, Glob, ListDirectory)
- ✅ 输出完整文件内容 (`<<<FILE:path>>>` 格式)
- ❌ 不使用 Write/Edit/MultiEdit
- ❌ 不使用 acceptEdits/bypassPermissions
- ❌ 不直接修改 src/**

**不再使用 Claude Code direct file edit 作为默认方案。**

---

## 14. Hermes 角色

**当前角色**: 编排器 + Patch Runner

- ✅ 读取任务队列 (queue.json)
- ✅ 调用 Claude Code 生成 proposal
- ✅ 使用 `diff -u` 生成 patch
- ✅ 运行 `ai-patch-runner.sh` 应用 patch
- ✅ 执行 build + deploy + curl 验证
- ✅ 管理状态 (state.json, completed.json)
- ✅ 失败时自动 rollback

---

## 15. OpenClaw 角色

**当前角色**: Gateway 服务

- ✅ 运行在 port 18789
- ✅ 提供 Hermes Agent 通信通道
- ✅ FD 监控 (当前 45，健康)

---

## 16. Patch Pipeline 标准流程

### V3 Full-file Proposal Pipeline

```
1. 准备 queue.json (任务队列)
2. hermes-health-check.sh (健康检查)
3. Claude Code 读取目标文件 (Read 工具)
4. Claude Code 输出完整文件 (<<<FILE:path>>> 格式)
5. 脚本提取到 proposals/<task-id>/<path>
6. diff -u 生成 patch → patches/<task-id>.patch
7. ai-patch-runner.sh 验证 (allowlist + 硬禁止)
8. git apply 应用 patch
9. npm run build 构建验证
10. 失败 → git reset --hard 回滚
11. deploy-staging.sh 部署
12. curl 验证 HTTP 200
13. 更新 state.json + completed.json
```

### 默认方案

**默认使用 V3 Full-file Proposal Pipeline。**

- Claude 负责生成完整文件 proposal
- Hermes/Patch Runner 负责 deterministic apply/build/rollback

---

## 17. 每次开发前必须阅读的文件

### 必读文件

1. `PROJECT_MEMORY.md` (本文档)
2. `docs/PROJECT_GOVERNANCE.md` (治理规则)
3. `docs/project-audit/12_EXECUTIVE_SUMMARY.md` (项目健康度)

### 按需阅读

| 场景 | 必读文件 |
|------|----------|
| 修改页面前 | `docs/project-audit/02_PAGE_REGISTRY.md` |
| 修改组件前 | `docs/project-audit/03_COMPONENT_REGISTRY.md` |
| 修改功能前 | `docs/project-audit/07_FEATURE_REGISTRY.md` |
| 删除代码前 | `docs/project-audit/09_DEAD_CODE_AUDIT.md` |
| 创建组件前 | `docs/project-audit/08_DUPLICATE_CODE_AUDIT.md` |
| 使用 Design System | `docs/DESIGN_SYSTEM_COMPONENT_INDEX.md` |

---

## 18. 下一步推荐任务

### 当前 Program 队列

**Program: Design System Migration (进度 27.5%)**

| Epic | 状态 | 进度 | 下一 Batch |
|------|------|------|-----------|
| DS-01 Foundation | ✅ 完成 | 100% | - |
| DS-02 Public Pages | 🟡 进行中 | 30% | DS-02-B3: Topics & Search |
| DS-03 Workspace Pages | 🔴 未开始 | 0% | DS-03-B1: Workspace 试点 |
| DS-04 Admin Pages | 🔴 未开始 | 0% | DS-04-B1: Admin 试点 |
| DS-05 Component Consolidation | 🟡 进行中 | 60% | DS-05-B4: WorkspaceSidebar |

**Program: V4 Shell Unification (进度 40%)**

| Epic | 状态 | 进度 | 下一 Batch |
|------|------|------|-----------|
| V4-01 Core Pages | ✅ 完成 | 100% | - |
| V4-02 Content Pages | 🟡 进行中 | 60% | V4-02-B5: Starter & Pricing |
| V4-03 Community Pages | 🔴 未开始 | 0% | V4-03-B1: Community 审计 |
| V4-04 Destination Pages | 🔴 未开始 | 0% | V4-04-B1: Destinations 审计 |

### 优先级排序

**P0（本周必须完成）**:
1. DS-02-B3: Topics & Search Design System 应用
2. DS-05-B4: WorkspaceSidebar 组件整合
3. DS-05-B5: ToolGrid 组件整合

**P1（下周完成）**:
1. DS-02-B4: Resources Design System 应用
2. DS-02-B5: Tools Design System 应用
3. V4-03-B1: Community Pages 审计

**P2（后续迭代）**:
1. DS-03: Workspace Pages Design System 应用
2. DS-04: Admin Pages Design System 应用
3. V4-04: Destination Pages V4 Shell 统一

### 入口命令

```bash
# 执行 Program Queue
bash scripts/program-runner.sh

# 或手动执行特定 Batch
bash scripts/night-run.sh --batch DS-02-B3
```

---

## 19. Program Manager V2 文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| Program Model | `docs/program/PROGRAM_MODEL.md` | 四层模型定义 |
| Program Progress | `docs/program/PROGRAM_PROGRESS.md` | 进度追踪 |
| Program Queue Spec | `docs/program/PROGRAM_QUEUE_SPEC.md` | Queue 规范 |
| Automation Boundary | `docs/program/AUTOMATION_BOUNDARY.md` | 自动化边界 |

**文档状态**: PROGRAM_MANAGER_V2_READY  
**生成时间**: 2026-07-09  
**下次更新**: Program 状态变更时
