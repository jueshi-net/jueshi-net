# PROJECT_GOVERNANCE.md

> 项目治理规则 — 确保项目健康度和可维护性  
> 最后更新: 2026-07-09  
> 维护者: Hermes Agent + 开发团队

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

**诊断步骤**（遇到连接问题时）：
1. 检查用户名是否为 `deploy`
2. 检查服务器地址是否为 `192.129.155.149`
3. 检查 SSH 服务连接数/MaxStartups 问题
4. 查看 auth 日志
5. 检查当前已有 SSH 连接数

---

## 1. Inventory 使用规则

### 1.1 Inventory 文档清单

| 文档 | 用途 | 更新频率 |
|------|------|----------|
| `01_PROJECT_OVERVIEW.md` | 项目总体结构 | 每月 |
| `02_PAGE_REGISTRY.md` | 页面注册表 | 每次页面变更 |
| `03_COMPONENT_REGISTRY.md` | 组件注册表 | 每次组件变更 |
| `04_DESIGN_SYSTEM_COVERAGE.md` | Design System 覆盖率 | 每次应用 DS |
| `05_API_REGISTRY.md` | API 注册表 | 每次 API 变更 |
| `06_DATABASE_REGISTRY.md` | 数据库 Model 注册表 | Schema 变更时 |
| `07_FEATURE_REGISTRY.md` | 功能注册表 | 功能变更时 |
| `08_DUPLICATE_CODE_AUDIT.md` | 重复代码审计 | 每月 |
| `09_DEAD_CODE_AUDIT.md` | 死代码审计 | 每月 |
| `10_NAVIGATION_MAP.md` | 导航地图 | 导航变更时 |
| `11_PAGE_RELATION_GRAPH.md` | 页面关系图 | 页面关系变更时 |
| `12_EXECUTIVE_SUMMARY.md` | 执行摘要 | 每月 |

### 1.2 Inventory 使用流程

**开发前必须检查：**

1. **修改页面前** → 查阅 `02_PAGE_REGISTRY.md`
   - 确认页面状态（Production/Staging/Draft）
   - 确认是否使用 V4 Shell
   - 确认 Layout 类型

2. **修改组件前** → 查阅 `03_COMPONENT_REGISTRY.md`
   - 确认组件分类（Design System/Legacy/UI Lab）
   - 确认引用页面
   - 确认是否建议保留/删除

3. **创建新组件前** → 查阅 `08_DUPLICATE_CODE_AUDIT.md`
   - 确认是否已有类似组件
   - 避免重复创建

4. **删除代码前** → 查阅 `09_DEAD_CODE_AUDIT.md`
   - 确认是否为死代码
   - 确认删除风险

---

## 2. Feature Registry 使用规则

### 2.1 Feature Registry 用途

`07_FEATURE_REGISTRY.md` 记录所有业务功能模块：

- 功能完成度
- 入口页面
- 后台管理
- 依赖关系
- 风险等级
- 维护状态

### 2.2 使用流程

**开发新功能前：**

1. 查阅 Feature Registry，确认是否已有类似功能
2. 确认功能的入口页面和后台管理
3. 确认依赖关系和风险等级
4. 更新 Feature Registry（如新增功能）

**修改功能前：**

1. 查阅 Feature Registry，了解功能现状
2. 确认影响的页面和 API
3. 评估风险等级
4. 测试后更新 Feature Registry

---

## 3. Page Registry 使用规则

### 3.1 Page Registry 用途

`02_PAGE_REGISTRY.md` 记录所有页面：

- 路由路径
- 文件位置
- Layout 类型
- Server/Client 组件
- V4 Shell 状态
- 页面状态（Production/Staging/Draft）

### 3.2 使用流程

**创建新页面前：**

1. 查阅 Page Registry，确认路由是否冲突
2. 确认使用哪个 Layout（Public/Admin/Workspace）
3. 确认是否需要 V4 Shell
4. 创建后更新 Page Registry

**修改页面前：**

1. 查阅 Page Registry，了解页面现状
2. 确认页面状态（Production 页面需谨慎）
3. 确认是否使用 V4 Shell
4. 修改后更新 Page Registry

---

## 4. Component Registry 使用规则

### 4.1 Component Registry 用途

`03_COMPONENT_REGISTRY.md` 记录所有组件：

- 组件名称和路径
- 组件用途
- 引用页面
- 分类（Design System/Legacy/UI Lab/Experimental）
- 建议（保留/删除/合并）

### 4.2 使用流程

**使用组件前：**

1. 查阅 Component Registry，确认组件分类
2. 优先使用 Design System 组件
3. 避免使用标记为"建议删除"的组件
4. 确认组件的引用页面（避免破坏）

**创建新组件前：**

1. 查阅 `08_DUPLICATE_CODE_AUDIT.md`，确认是否已有类似组件
2. 查阅 Component Registry，确认命名规范
3. 确定组件分类（Design System/UI Lab/Legacy）
4. 创建后更新 Component Registry

---

## 5. Dead Code 删除流程

### 5.1 Dead Code 识别

**死代码特征：**

- 无引用（grep 搜索无结果）
- 无入口（无路由、无链接）
- 标记为 @deprecated
- UI Lab 旧版本（v1-v3）
- 临时文件（tmp/temp/draft）
- 测试文件在 src 目录

### 5.2 删除流程

```
1. 查阅 09_DEAD_CODE_AUDIT.md
2. 确认代码为死代码（无引用、无入口）
3. 确认删除风险（🟢 低 / 🟡 中 / 🔴 高）
4. 备份代码（git commit 或 branch）
5. 删除代码
6. 运行 build 验证
7. 运行测试验证
8. 更新 Component Registry
9. 提交 commit
```

### 5.3 禁止删除

- ❌ Production 页面
- ❌ 有引用的组件
- ❌ Design System 组件
- ❌ 标记为"不能删除"的代码

---

## 6. Duplicate Code 合并流程

### 6.1 Duplicate Code 识别

**重复代码特征：**

- 同名组件在不同目录
- 功能相似的组件
- 多个版本的同一组件

### 6.2 合并流程

```
1. 查阅 08_DUPLICATE_CODE_AUDIT.md
2. 确认重复组件
3. 确定保留版本（优先 Design System）
4. 更新引用（将所有引用指向保留版本）
5. 删除冗余版本
6. 运行 build 验证
7. 运行测试验证
8. 更新 Component Registry
9. 提交 commit
```

### 6.3 合并优先级

**保留优先级：**

1. Design System 组件（最高）
2. 被更多页面引用的组件
3. 最近更新的组件
4. 命名更规范的组件

---

## 7. Design System 替换流程

### 7.1 替换优先级

**Phase 1: 简单页面（P0）**

- `/about` — 静态页面
- `/contact` — 静态页面
- `/help` — 帮助页面

**Phase 2: 内容页面（P1）**

- `/blog` — 博客列表
- `/blog/[slug]` — 博客详情
- `/guides/[slug]` — 指南详情

**Phase 3: 工具页面（P2）**

- `/tools/[tool-name]` — 20+ 工具页面
- `/resources/site/[id]` — 资源详情

**Phase 4: 工作区页面（P3）**

- `/workspace/*` — 用户工作区

### 7.2 替换流程

```
1. 选择目标页面（从 Phase 1 开始）
2. 查阅 03_COMPONENT_REGISTRY.md，确认 Design System 组件
3. 分析页面结构，确定使用哪些 DS 组件
4. 创建 proposal（使用 V3 Pipeline）
5. 应用 patch
6. build 验证
7. 部署 staging
8. 视觉验证
9. 用户验收
10. 更新 04_DESIGN_SYSTEM_COVERAGE.md
11. 提交 commit
```

### 7.3 禁止事项

- ❌ 不重新创建已有 DS 组件
- ❌ 不修改 DS 组件（除非有充分理由）
- ❌ 不在 Production 页面直接替换（必须 staging-first）

---

## 8. Night Pipeline 执行前检查

### 8.1 执行前检查清单

**环境检查：**

- [ ] 当前分支正确（`ui/overnight-polish-phase1`）
- [ ] Health check 通过（`bash scripts/hermes-health-check.sh`）
- [ ] Pipeline 状态为 IDLE 或 COMPLETED
- [ ] 无活跃锁（`ls .hermes/pipeline/locks/`）

**任务检查：**

- [ ] queue.json 已准备
- [ ] 任务描述清晰
- [ ] allowed_files 正确
- [ ] 任务风险等级评估

**安全检查：**

- [ ] 不涉及硬禁止文件
- [ ] 不涉及 Production
- [ ] 不涉及 9833416@qq.com
- [ ] 不涉及 prisma db push

### 8.2 执行流程

```bash
# 1. 健康检查
bash scripts/hermes-health-check.sh

# 2. 查看状态
bash scripts/night-run.sh --status

# 3. Dry run（可选）
bash scripts/night-run.sh --dry-run

# 4. 执行
bash scripts/night-run.sh

# 5. 检查结果
bash scripts/night-run.sh --status
git log --oneline -5
```

### 8.3 失败处理

**Patch 应用失败：**

1. 查看日志：`cat .hermes/pipeline/patches/<task-id>.stderr.txt`
2. 检查 proposal：`cat .hermes/pipeline/proposals/<task-id>/<path>`
3. 手动修复 proposal（如需要）
4. 重新生成 patch：`bash scripts/night-run.sh`

**Build 失败：**

1. 自动回滚（git reset --hard）
2. 查看 build 日志
3. 修复代码问题
4. 重新执行

---

## 9. /new 新会话启动流程

### 9.1 启动检查清单

**必读文件：**

1. `PROJECT_MEMORY.md` — 项目记忆
2. `docs/PROJECT_GOVERNANCE.md` — 治理规则（本文档）
3. `docs/project-audit/12_EXECUTIVE_SUMMARY.md` — 项目健康度

**基线检查：**

```bash
# 1. 检查分支
git branch --show-current

# 2. 检查 HEAD
git rev-parse HEAD

# 3. 检查工作区状态
git status --short

# 4. 健康检查
bash scripts/hermes-health-check.sh

# 5. Pipeline 状态
bash scripts/night-run.sh --status
```

### 9.2 启动流程

```
1. 阅读 PROJECT_MEMORY.md
2. 阅读 PROJECT_GOVERNANCE.md
3. 执行基线检查
4. 确认当前阶段和下一步任务
5. 开始开发
```

### 9.3 禁止事项

- ❌ 不阅读文档直接开发
- ❌ 不检查基线直接开发
- ❌ 重复已完成的开发

---

## 10. 每晚任务结束 Handoff 流程

### 10.1 Handoff 检查清单

**代码检查：**

- [ ] 所有修改已提交
- [ ] build 通过
- [ ] 测试通过（如有）
- [ ] 无临时文件

**文档更新：**

- [ ] 更新 PROJECT_MEMORY.md（如阶段变更）
- [ ] 更新 Page Registry（如有页面变更）
- [ ] 更新 Component Registry（如有组件变更）
- [ ] 更新 Design System Coverage（如有 DS 应用）

**状态记录：**

- [ ] 记录完成的任务
- [ ] 记录未完成的任务
- [ ] 记录遇到的问题和解决方案
- [ ] 更新 NEXT_NIGHT_TASKS.md

### 10.2 Handoff 流程

```bash
# 1. 检查未提交的文件
git status --short

# 2. 提交代码（如有）
git add <files>
git commit -m "feat: ..."

# 3. 更新文档
# 编辑 PROJECT_MEMORY.md
# 编辑 NEXT_NIGHT_TASKS.md

# 4. 提交文档
git add PROJECT_MEMORY.md NEXT_NIGHT_TASKS.md
git commit -m "docs: update project memory and tasks"

# 5. 生成 Handoff 报告
# 输出当前状态、完成的任务、下一步任务
```

### 10.3 Handoff 报告模板

```markdown
# Night X Handoff Report

## 当前状态

- 分支: ui/overnight-polish-phase1
- HEAD: <commit-hash>
- 阶段: Phase X

## 完成的任务

1. 任务 1 — ✅ 完成
2. 任务 2 — ✅ 完成

## 未完成的任务

1. 任务 3 — ⏳ 进行中
2. 任务 4 — ⏸️ 暂停

## 遇到的问题

1. 问题 1 — 解决方案
2. 问题 2 — 待解决

## 下一步任务

1. 任务 3 — 预计耗时 X
2. 任务 4 — 预计耗时 Y

## 风险

- 风险 1
- 风险 2
```

---

## 附录：治理规则总结

### 开发前必须做

1. ✅ 阅读 PROJECT_MEMORY.md
2. ✅ 阅读 PROJECT_GOVERNANCE.md
3. ✅ 查阅相关 Registry 文档
4. ✅ 执行基线检查
5. ✅ 确认任务风险

### 开发中必须做

1. ✅ 使用 V3 Pipeline（默认方案）
2. ✅ 避免重复创建组件
3. ✅ 遵循 staging-first 流程
4. ✅ 保护 Production 和 9833416@qq.com

### 开发后必须做

1. ✅ 提交代码
2. ✅ 更新文档
3. ✅ 生成 Handoff 报告
4. ✅ 记录问题和解决方案

---

**文档状态**: PROJECT_GOVERNANCE_ESTABLISHED  
**生成时间**: 2026-07-09 00:20 CST  
**下次更新**: 治理规则变更时
