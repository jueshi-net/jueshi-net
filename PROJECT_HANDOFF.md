# 项目交接文档

## 当前项目状态

- **项目**: jueshi.net / xixiong-saas
- **当前分支**: `ui/overnight-polish-phase1`
- **当前 HEAD**: `e3cf062`
- **交接日期**: 2026-07-08

---

## 已完成阶段

### Phase 1: V4 Shell 统一 (已完成)
- ✅ `/tools` 页面 - V4 Shell 统一
- ✅ `/destinations` 页面 - V4 Shell 统一
- ✅ `/guides` 页面 - V4 Shell 统一
- ✅ `/checklists` 页面 - V4 Shell 统一
- ✅ `/resources` 页面 - V4 Shell 统一

### Phase 2: Night Pipeline 建立 (已完成)
- ✅ Night Pipeline V1 - 基础架构
- ✅ Night Pipeline V2 - Readonly Claude Patch Mode
- ✅ Night Pipeline V3 - Full-file Proposal Mode (当前版本)

### Phase 3: Design System V1 (已完成)
- ✅ 架构审计文档 (`docs/JUESHI_DESIGN_SYSTEM_V1_PLAN.md`)
- ✅ 14 个基础组件建立 (`src/components/design-system/`)
- ✅ 组件索引文档 (`docs/DESIGN_SYSTEM_COMPONENT_INDEX.md`)

---

## Night Pipeline 当前版本

**版本**: V3 (Full-file Proposal Mode)

**核心特性**:
- Claude Code 只读模式，输出完整文件内容
- 脚本自动生成 unified diff patch
- 消除 Claude 手写 patch 的格式错误
- 支持 allowlist 验证和自动回滚

**关键脚本**:
- `scripts/night-run.sh` - 主编排器
- `scripts/claude-generate-patch.sh` - Claude 调用和 patch 生成
- `scripts/ai-patch-runner.sh` - patch 应用和验证

**使用方式**:
```bash
# 1. 准备任务队列
cat > .hermes/pipeline/queue.json << 'EOF'
[{
  "id": "task-id",
  "title": "任务标题",
  "mode": "full-file-proposal",
  "allowed_files": ["src/app/(public)/page.tsx"],
  "prompt": "任务描述..."
}]
EOF

# 2. 执行任务
bash scripts/night-run.sh
```

---

## Design System 当前版本

**版本**: V1 (Foundation)

**组件清单** (14 个):
1. `PageContainer` - 页面容器
2. `PageHero` - 页面英雄区域
3. `SectionHeader` - 章节标题
4. `ContentSection` - 内容区块
5. `StatsGrid` - 统计网格
6. `StatsCard` - 统计卡片
7. `ActionCard` - 行动卡片
8. `EmptyState` - 空状态
9. `PageCTA` - 页面行动号召
10. `StickySidebar` - 粘性侧边栏
11. `FilterToolbar` - 筛选工具栏
12. `BreadcrumbBar` - 面包屑导航
13. `TagGroup` - 标签组
14. `StatusBadge` - 状态徽章

**技术栈**:
- TypeScript + React
- Tailwind CSS
- 响应式设计 (sm/md/lg/xl)
- Dark Mode 支持

**导入方式**:
```tsx
import PageContainer from '@/components/design-system/PageContainer';
import PageHero from '@/components/design-system/PageHero';
```

---

## 已统一 V4 Shell 页面

| 页面 | 状态 | Commit | 备注 |
|------|------|--------|------|
| `/` (首页) | ✅ 已统一 | - | V4 Home Candidate |
| `/resources` | ✅ 已统一 | - | V4 Public Shell |
| `/tools` | ✅ 已统一 | `98ee66d` | V4 Public Shell |
| `/destinations` | ✅ 已统一 | `98ee66d` | V4 Public Shell |
| `/guides` | ✅ 已统一 | `0cb4083` | V4 Public Shell |
| `/checklists` | ✅ 已统一 | `0cb4083` | V4 Public Shell |

---

## 尚未统一页面

| 页面 | 优先级 | 预计工作量 | 风险等级 |
|------|--------|------------|----------|
| `/topics` | P1 | 中 | 低 |
| `/search` | P1 | 中 | 低 |
| `/about` | P2 | 小 | 低 |
| `/contact` | P2 | 小 | 低 |
| `/workspace/*` | P3 | 大 | 高 |
| `/resources/site/[id]` | P3 | 中 | 中 |

---

## 当前风险

### 技术风险
1. **Design System 未全面应用** - 仅建立基础组件，尚未替换业务页面
2. **Night Pipeline 稳定性** - V3 刚建立，需要更多实战验证
3. **Claude Code 限流** - 高频调用可能触发 API 限流

### 运维风险
1. **进程稳定性** - 曾发生 9.5 小时失联，需监控进程健康
2. **内存泄漏** - 长时间运行可能导致内存问题
3. **XPC 连接中断** - macOS 系统级问题，难以完全避免

### 业务风险
1. **Production 未更新** - 所有改动仅在 staging，未进入 production
2. **用户验收未完成** - `/guides` 和 `/checklists` 需要用户视觉验收
3. **回滚能力** - 需要确保 production 回滚机制可靠

---

## 下一夜开发入口

### 入口 1: 继续 V4 Shell 统一
```bash
# 目标: 统一 /topics 和 /search 页面
# 使用 Night Pipeline V3
bash scripts/night-run.sh
```

### 入口 2: Design System 替换
```bash
# 目标: 将现有页面替换为 Design System 组件
# 需要逐页替换，建议从简单页面开始
# 例如: /about, /contact
```

### 入口 3: Production 部署
```bash
# 目标: 将 staging 改动部署到 production
# 必须先通过用户验收和 audit
tools/jueshi-audit
```

---

## 严禁修改区域

### 永久禁止
- ❌ `prisma db push` - 永远禁止
- ❌ 破坏性 SQL (DROP/DELETE/TRUNCATE) - 永远禁止
- ❌ Production 直接修改 - 必须通过 staging-first
- ❌ 输出密钥 (DATABASE_URL, SSH key, password) - 永远禁止
- ❌ 修改/删除 9833416@qq.com - 永远保护
- ❌ 重置 9833416@qq.com 密码 - 永远禁止
- ❌ 未经确认切换 DNS - 永远禁止
- ❌ 声称用户满意 - 永远禁止
- ❌ 扩展 Beta - 永远禁止
- ❌ 公开推广 - 永远禁止

### 硬禁止文件
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

---

## Production 保护规则

### Staging-First 流程
```
feature/* → staging branch → i.jueshi.net → 用户验收 → audit → main → jueshi.net → smoke test → 观察
```

### Audit Gate (强制)
- Production 发布前必须运行 `tools/jueshi-audit`
- 没有证据路径的 audit 结果无效
- P0/P1 问题未清除不能进入 production
- 用户不能豁免 P0/P1

### 环境标记
- `/etc/jueshi-environment` (优先)
- `/home/deploy/.jueshi-environment` (备选)
- 脚本必须读取环境标记，不匹配则 exit 1

---

## Claude Code 开发规则

### 只读模式 (推荐)
```bash
~/bin/claude-safe -p \
  --allowedTools "Read,Grep,Glob,ListDirectory,Bash(git diff:*),Bash(git status:*)" \
  -- "任务描述"
```

### 写入模式 (谨慎)
```bash
~/bin/claude-safe -p \
  --allowedTools "Read,Grep,Glob,ListDirectory,Edit,Write,Bash(git diff:*)" \
  -- "任务描述"
```

### 禁止事项
- ❌ 不使用 `acceptEdits`
- ❌ 不使用 `bypassPermissions`
- ❌ 不让 Claude 直接修改 `src/**` (除非明确允许)
- ❌ 不让 Claude 修改 `package.json`
- ❌ 不让 Claude 修改 `prisma/schema.prisma`

### 最佳实践
- ✅ 使用 `claude-safe` 包装器
- ✅ 限制工具访问范围
- ✅ 审查所有修改
- ✅ 使用 Night Pipeline 自动化

---

## Pipeline 使用说明

### Night Pipeline V3 工作流
1. **准备任务队列** - 编辑 `.hermes/pipeline/queue.json`
2. **健康检查** - 自动检查 FD 和进程状态
3. **Claude 生成 proposal** - 输出完整文件内容
4. **脚本生成 patch** - 使用 `diff -u` 生成 unified diff
5. **验证 patch** - allowlist 和硬禁止检查
6. **应用 patch** - `git apply`
7. **构建验证** - `npm run build`
8. **部署 staging** - `deploy-staging.sh`
9. **curl 验证** - HTTP 200 检查
10. **更新状态** - 记录到 `state.json`

### 关键文件
- `.hermes/pipeline/queue.json` - 任务队列
- `.hermes/pipeline/state.json` - 当前状态
- `.hermes/pipeline/completed.json` - 已完成任务
- `.hermes/pipeline/patches/` - 生成的 patch
- `.hermes/pipeline/proposals/` - Claude 输出的完整文件

### 故障排查
```bash
# 检查状态
bash scripts/night-run.sh --status

# Dry run
bash scripts/night-run.sh --dry-run

# 查看日志
cat .hermes/pipeline/patches/<task-id>.stderr.txt
```

---

## 下一步建议

### 立即行动
1. **用户验收** - 验收 `/guides` 和 `/checklists` 页面
2. **继续统一** - 统一 `/topics` 和 `/search` 页面
3. **Design System 替换** - 从简单页面开始替换

### 中期目标
1. **完成所有公共页面 V4 Shell 统一**
2. **Design System V2** - 增加更多组件
3. **Production 部署** - 通过 audit 后部署

### 长期目标
1. **全面 Design System 覆盖**
2. **自动化测试** - 增加 E2E 测试
3. **性能优化** - 监控和优化页面性能

---

## 联系方式

- **项目**: jueshi.net
- **Staging**: https://i.jueshi.net
- **Production**: https://jueshi.net
- **分支**: `ui/overnight-polish-phase1`
- **最后更新**: 2026-07-08

---

**文档状态**: PROJECT_HANDOFF_READY  
**生成时间**: 2026-07-08 22:35 CST
