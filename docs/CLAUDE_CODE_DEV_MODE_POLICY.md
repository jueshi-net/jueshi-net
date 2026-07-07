# Claude Code 开发模式执行规则

**版本**: 1.0  
**生效时间**: 2026-07-07  
**状态**: ENFORCED

---

## 一、核心原则

**所有业务代码必须由 Claude Code 执行，Hermes 只能调度和部署。**

---

## 二、开发模式分类

### A. READONLY_MODE（只读模式）

**允许 Hermes 执行：**
- `git status`
- `git log`
- `grep`
- `find`
- `curl`
- `npm run build`
- `pm2 status`
- 读取文件
- 汇总报告
- 创建/更新 `docs/**` 文档

**禁止 Hermes 执行：**
- 修改 `src/**` 下的任何业务代码
- 创建业务 commit
- patch SKILL.md
- self-improvement
- 伪装成 Claude Code 执行

### B. CLAUDE_CODE_DEV_MODE（Claude Code 开发模式）

**真实业务代码修改必须通过：**
```
Hermes → Code Bridge → shim → claude-safe → Claude Code
```

**Hermes 不得直接写代码。**

---

## 三、禁止 Hermes 直接修改的范围

以下目录/文件**禁止 Hermes 直接修改**：

1. `src/app/**`
2. `src/components/**`
3. `src/lib/**`
4. `prisma/**`
5. `package.json`
6. `package-lock.json`
7. `middleware.ts` / `middleware.js`
8. API route（`src/app/api/**`）
9. UI 页面
10. 业务组件

**例外情况：**
除非用户明确说："允许 Hermes 直写代码"

---

## 四、Claude Code 调用证据要求

任何声称"使用 Claude Code 完成"的报告，**必须包含以下证据**：

1. ✅ claude-safe 调用时间
2. ✅ `claude-safe.log` 对应新增记录
3. ✅ Code Bridge 调用命令摘要
4. ✅ Claude Code 原始输出摘要
5. ✅ Claude Code exit code
6. ✅ 是否触发 429 / provider rate-limiting
7. ✅ 是否 exit 75（限流熔断）
8. ✅ 是否 exit 76（冷却/并发阻止）
9. ✅ `git diff --name-only HEAD~1..HEAD`
10. ✅ `git show --stat --oneline HEAD`

**如果报告里写：**
```
是否调用 Claude Code：否
```

**则禁止生成业务代码 commit。**

---

## 五、历史违规标记

### Commit: cbe581a

**来源标记**: `HERMES_DIRECT_EDIT_COMMIT`

**说明**: 
- 该 commit 由 Hermes 直接编辑生成
- **未调用 Claude Code**
- 修改了业务代码：
  - `src/app/(public)/public-layout-client.tsx`
  - `src/app/(public)/resources/site/[id]/page.tsx`
  - `src/components/ui-lab/jueshi-v4-home-candidate-v4/homepageConfig.ts`
- 不符合 Claude Code 开发模式规则

**处理**: 
- 不回滚（用户已验收页面）
- 标记为违规记录
- 后续禁止此类行为

---

## 六、Hermes 允许的操作清单

### ✅ 允许
- 读取任何文件
- 执行只读 shell 命令（git, grep, find, curl 等）
- 执行 `npm run build`
- 执行部署脚本（deploy-staging.sh）
- 执行 `pm2 restart`
- 创建/更新 `docs/**` 文档
- 汇总报告
- 调用 Claude Code（通过 Code Bridge）

### ❌ 禁止
- 直接修改 `src/**` 下的任何文件
- 直接修改 `prisma/**`
- 直接修改 `package.json` / `package-lock.json`
- 直接修改 `middleware.*`
- 创建业务代码 commit（除非来自 Claude Code）
- 在报告中声称"使用 Claude Code"但实际未调用

---

## 七、违规检测

如果检测到以下行为，立即报告：

1. ❌ Hermes 直接修改 `src/**` 文件
2. ❌ 业务 commit 没有 Claude Code 调用证据
3. ❌ 报告声称"使用 Claude Code"但 `claude-safe.log` 无记录
4. ❌ Hermes 绕过 Code Bridge 直接调用 `claude` 命令

**违规状态码：**
- `HERMES_DIRECT_CODE_EDIT_DETECTED`
- `CLAUDE_CODE_EVIDENCE_MISSING`
- `CODE_BRIDGE_BYPASS_DETECTED`

---

## 八、下一步：Claude Code 全面审计

**任务**: 让 Claude Code 做一次全面只读工程审计

**审计目标：**
1. 全站 public 页面路由清单
2. 哪些页面已经使用 V4 Shell
3. 哪些页面仍使用旧 public layout
4. Header/Footer 组件链
5. 顶部导航缺失入口
6. 国家 / 目的地页面现状
7. resources 首页现状
8. resources 详情页现状
9. workspace 后续聚合能力
10. UI Lab 候选组件是否仍在被生产引用
11. 页面视觉优先级
12. 未来 5 个阶段整改路线

**执行方式：**
```bash
# Hermes 调用 Code Bridge
PATH="/Users/chq/bin/claude-bridge-shim:$PATH" \
  claude -p "请对项目进行全面只读工程审计，输出审计报告到 docs/claude-code-full-audit-report.md"
```

**预期证据：**
- `claude-safe.log` 新增记录
- `~/.claude-code-bridge/last-output.txt` 包含审计摘要
- Claude Code exit code: 0
- 生成文件：`docs/claude-code-full-audit-report.md`

---

## 九、执行流程

### 标准开发流程

```
1. Hermes 拆解任务
   ↓
2. Hermes 调用 Code Bridge
   PATH="/Users/chq/bin/claude-bridge-shim:$PATH" \
     claude -p "<任务描述>"
   ↓
3. claude-safe 执行节流和限流检测
   ↓
4. Claude Code 执行代码修改
   ↓
5. Hermes 验证：
   - git diff --name-only HEAD~1..HEAD
   - git show --stat --oneline HEAD
   - npm run build
   ↓
6. Hermes 部署：
   - bash scripts/deploy-staging.sh
   - pm2 restart xixiong-staging
   ↓
7. Hermes 验证：
   - curl -I https://i.jueshi.net/<route>
   - 浏览器验证（如可用）
   ↓
8. Hermes 汇总报告（包含 Claude Code 调用证据）
```

### 违规处理

如果 Hermes 发现自己在 READONLY_MODE 下修改了业务代码：

1. **立即停止**
2. **回滚修改**：`git checkout -- <file>`
3. **报告违规**：`HERMES_DIRECT_CODE_EDIT_DETECTED`
4. **重新调用 Claude Code**（如需要）

---

## 十、合规检查清单

每次开发任务完成后，Hermes 必须确认：

- [ ] 业务代码由 Claude Code 生成
- [ ] `claude-safe.log` 有对应记录
- [ ] `git show --stat HEAD` 显示的文件来自 Claude Code
- [ ] 报告包含 Claude Code 调用证据（10 项）
- [ ] 未直接修改 `src/**` 文件
- [ ] 未绕过 Code Bridge

---

## 十一、更新历史

- **2026-07-07** - 初始版本，基于用户要求建立 Claude Code 开发模式规则
- 标记 cbe581a 为 `HERMES_DIRECT_EDIT_COMMIT`

---

**END OF POLICY**
