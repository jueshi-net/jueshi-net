# UI V4 全站优化计划

> **版本**: v1.0  
> **创建时间**: 2026-07-06  
> **状态**: 待执行  
> **模式**: UI_V4_POLISH_PLAN_DOC_ONLY_REVISED

---

## 一、计划概述

本计划旨在对绝世百宝箱（jueshi.net）全站公开页面进行 UI V4 风格优化，分 10 个阶段（Phase A-J）逐步执行。

### 核心原则

1. **安全第一**：不破坏现有功能，不触碰 production，不修改业务逻辑
2. **渐进式优化**：每批只修改明确文件，逐步推进
3. **严格验收**：每批完成后必须 build、curl、移动端验证
4. **用户确认**：关键节点需要用户验收确认

### 当前状态

- ✅ Phase 1 已完成：`/tools`、`/workspace`、`/login`、`tool-card` 浅层优化
- ⚠️ 大部分页面还未开始 UI 优化
- ⚠️ 全局 Header/Footer 未统一
- ⚠️ `/workspace` 需要三栏 SaaS 工作台布局
- ⚠️ `/resources` 需要参考用户样式图排版

---

## 二、执行规则（必须严格遵守）

### 2.1 Git 操作规则

**禁止**：
- ❌ `git add .`（禁止泛化添加所有文件）
- ❌ `git add src/`（禁止泛化添加整个目录）
- ❌ `rsync -avz src/ deploy@...`（禁止泛化同步整个目录）

**必须**：
- ✅ `git add src/app/(public)/tools/page.tsx`（只添加明确文件）
- ✅ `rsync -avz src/app/(public)/tools/page.tsx deploy@...`（只同步明确文件）
- ✅ 每批只提交本批次明确修改的 UI 文件

### 2.2 高风险检查规则

每批提交前必须执行：

```bash
git diff --name-only | grep -E '^(package\.json|package-lock\.json|prisma/schema\.prisma|src/middleware\.ts|src/app/api/|src/lib/task-chain\.ts|src/lib/destinations-db\.ts)' && echo "HIGH_RISK_DIFF_FOUND_STOP" || echo "UI_DIFF_SAFE"
```

只有输出 `UI_DIFF_SAFE` 才能继续提交。

### 2.3 部署流程规则

每批完成后必须执行：

1. **提交代码**：
   ```bash
   git add [明确文件列表]
   git commit -m "style: [phase] [description]"
   git push origin [branch]
   ```

2. **同步到 staging**：
   ```bash
   rsync -avz [明确文件列表] deploy@192.129.155.149:/home/deploy/xixiong-saas-staging/
   ```

3. **Build 验证**：
   ```bash
   ssh deploy@192.129.155.149 "cd /home/deploy/xixiong-saas-staging && npm run build"
   ```

4. **PM2 重启**：
   ```bash
   ssh deploy@192.129.155.149 "pm2 restart xixiong-staging"
   ```

5. **curl 验证**：
   ```bash
   curl -I https://i.jueshi.net/[page]
   # 必须返回 200 状态码
   ```

6. **移动端验证**：
   - 使用浏览器工具访问页面
   - 检查 390px 宽度下是否有横向滚动
   - 检查所有按钮是否可点击
   - 检查所有链接是否有效

7. **链接审计**：
   ```bash
   curl -s https://i.jueshi.net/[page] | grep -o 'href="#"' | wc -l
   curl -s https://i.jueshi.net/[page] | grep -o 'href=""' | wc -l
   curl -s https://i.jueshi.net/[page] | grep -o 'href="javascript:void[^"]*"' | wc -l
   # 必须全部为 0
   ```

8. **截图验收**：
   - 生成桌面端截图
   - 生成移动端截图（390px）
   - 保存到 `reports/ui-v4-polish/screenshots/[phase]/`

### 2.4 安全红线（绝对禁止）

- ❌ 不触碰 production（104.250.109.99）
- ❌ 不触碰 production DB
- ❌ 不触碰 9833416@qq.com
- ❌ 不使用 SQL
- ❌ 不执行 db push / migration
- ❌ 不修改 schema.prisma
- ❌ 不修改 package.json / package-lock.json
- ❌ 不启动 ContentOps
- ❌ 不进入广告后台流程
- ❌ 用户验收通过前不进入广告后台流程

### 2.5 每批报告必须包含

每批完成后必须报告：

1. 修改文件列表
2. 是否修改高风险文件：必须为否
3. 是否触碰 production：必须为否
4. 是否触碰 9833416@qq.com：必须为否
5. 是否使用 SQL：必须为否
6. 是否 db push / migration：必须为否
7. build 结果
8. PM2 重启结果
9. curl 结果
10. 链接审计结果
11. 移动端验收结果
12. 截图结果
13. 是否建议用户验收

---

## 三、Phase 详细计划

### Phase A：安全基线 + UI 规范文档

**目标**：建立 V4 设计系统文档，作为后续所有优化的参考标准

**页面范围**：
- 无页面修改，仅创建文档

**允许修改文件**：
- `docs/ui-v4-design-system.md`（新建）

**禁止修改文件**：
- 所有源代码文件
- 所有业务逻辑文件

**UI 目标**：
- 建立颜色系统（主色、辅色、中性色、语义色）
- 建立字体规范（字号、字重、行高）
- 建立间距系统（4px 基准网格）
- 建立组件规范（按钮、卡片、表单、导航）
- 建立动效规范（过渡时间、缓动函数）

**验收标准**：
- 文档包含完整的颜色系统定义
- 文档包含完整的字体规范
- 文档包含完整的间距系统
- 文档包含完整的组件规范
- 文档通过用户审阅确认

**移动端标准**：
- 不适用（文档阶段）

**链接审计标准**：
- 不适用（文档阶段）

**是否需要用户截图验收**：
- ✅ 是（用户审阅文档）

**回滚策略**：
- 删除文档文件即可
- 不影响任何功能

**预计批次**：1 批  
**预计时间**：1-2 小时

---

### Phase B：全局壳层微调，不破坏首页原 V4

**目标**：微调全局 Header/Footer/页面容器，保护首页原 V4 结构

**页面范围**：
- 全局 Header
- 全局 Footer
- 页面容器（`src/app/(public)/layout.tsx`）

**允许修改文件**：
- `src/components/layout/header.tsx`
- `src/components/layout/footer.tsx`
- `src/app/(public)/layout.tsx`

**禁止修改文件**：
- `src/app/(public)/page.tsx`（首页，不修改）
- 所有业务逻辑文件
- 所有 API 路由
- `package.json`、`schema.prisma`

**UI 目标**：
- Header 在所有页面显示一致（除首页外）
- Footer 在所有页面显示一致
- 页面容器最大宽度、内边距统一
- 不破坏首页原 V4 结构

**验收标准**：
- Header 在 `/tools`、`/workspace`、`/login` 等页面显示一致
- Footer 在所有页面显示一致
- 页面容器最大宽度统一（1280px）
- 页面容器内边距统一（px-4 sm:px-6 lg:px-8）
- 首页 `/` 保持原 V4 结构不变
- 移动端 390px 无横向滚动

**移动端标准**：
- 390px：Header 折叠为汉堡菜单
- 390px：Footer 单列布局
- 390px：页面容器内边距 px-4

**链接审计标准**：
- 所有页面 href="#" = 0
- 所有页面 href="" = 0
- 所有页面 javascript:void = 0

**是否需要用户截图验收**：
- ✅ 是

**回滚策略**：
- `git revert [commit]`
- 重新部署到 staging

**预计批次**：2 批  
**预计时间**：2-4 小时

**批次划分**：
- 批次 1：Header + 页面容器
- 批次 2：Footer

---

### Phase C：/workspace 三栏 SaaS 工作台专项

**目标**：将工作台改为三栏 SaaS 工作台布局

**页面范围**：
- `/workspace` 工作台主页
- `/workspace` 页面容器

**允许修改文件**：
- `src/app/(workspace)/workspace/page.tsx`
- `src/app/(workspace)/layout.tsx`
- `src/components/workspace/*`（工作台相关组件）

**禁止修改文件**：
- 工作台数据获取逻辑
- 工作台业务逻辑
- 用户认证逻辑
- `package.json`、`schema.prisma`

**UI 目标**：
- 三栏布局：左侧导航（240px）、中间主内容（flex-1）、右侧辅助信息（320px）
- 左侧导航：用户信息卡、快捷入口、主要功能导航
- 中间主内容：核心数据卡、任务列表、最近活动、推荐工具
- 右侧辅助信息：通知中心、备忘录、会员权益卡、邀请奖励卡
- 参考 Ant Design Pro、Material Dashboard 视觉风格
- 不引入新依赖，不复制整套代码

**验收标准**：
- 三栏布局在 1024px+ 屏幕正常显示
- 左侧导航包含用户信息、快捷入口、主要功能
- 中间主内容包含核心数据、任务列表、最近活动
- 右侧辅助信息包含通知、备忘录、会员权益
- 移动端 390px 自动折叠为单栏
- 所有功能按钮可点击
- 所有数据正常显示

**移动端标准**：
- 390px：单栏布局，左侧导航折叠为底部导航
- 768px：双栏布局，右侧辅助信息栏折叠
- 1024px+：三栏布局

**链接审计标准**：
- 所有链接 href="#" = 0
- 所有链接 href="" = 0
- 所有链接 javascript:void = 0

**是否需要用户截图验收**：
- ✅ 是（重点专项，必须用户确认）

**回滚策略**：
- `git revert [commit]`
- 重新部署到 staging

**预计批次**：3 批  
**预计时间**：4-6 小时

**批次划分**：
- 批次 1：布局结构 + 左侧导航
- 批次 2：中间主内容
- 批次 3：右侧辅助信息

---

### Phase D：/resources 网址导航专项，参考用户样式图

**目标**：参考用户提供的样式图，优化网址导航排版

**页面范围**：
- `/resources` 网址导航主页

**允许修改文件**：
- `src/app/(public)/resources/page.tsx`
- `src/components/resources/*`（网址导航相关组件）

**禁止修改文件**：
- 网址导航数据获取逻辑
- 网址导航分类逻辑
- `package.json`、`schema.prisma`

**UI 目标**：
- 参考用户提供的样式图排版（需用户提供样式图）
- 顶部搜索/过滤区：大尺寸搜索框、分类标签、排序选项
- 网址网格区：每个分类一个区块，区块标题 + 网址卡片网格
- 卡片样式：图标 + 标题 + 描述 + 访问按钮
- 分类清晰，视觉层次分明
- 响应式布局：390px 单列、768px 双列、1024px+ 三列或四列

**验收标准**：
- 参考样式图排版（需用户提供样式图）
- 搜索/过滤功能正常
- 分类清晰，视觉层次分明
- 网址卡片样式统一
- 移动端 390px 无横向滚动
- 所有链接可点击

**移动端标准**：
- 390px：单列布局
- 768px：双列布局
- 1024px+：三列或四列布局

**链接审计标准**：
- 所有链接 href="#" = 0
- 所有链接 href="" = 0
- 所有链接 javascript:void = 0

**是否需要用户截图验收**：
- ✅ 是（需要用户提供样式图并确认）

**回滚策略**：
- `git revert [commit]`
- 重新部署到 staging

**预计批次**：2 批  
**预计时间**：3-4 小时

**批次划分**：
- 批次 1：搜索/过滤区 + 布局结构
- 批次 2：网址卡片 + 响应式适配

**前置条件**：
- ⚠️ 需要用户提供样式图

---

### Phase E：/tools 工具中心深度优化

**目标**：深度优化工具中心页面，统一页头、页尾、页面结构

**页面范围**：
- `/tools` 工具中心主页
- `/tools` 页面容器

**允许修改文件**：
- `src/app/(public)/tools/page.tsx`
- `src/components/tools/tool-card.tsx`（已优化，可能需要微调）
- `src/components/tools/tool-filter-bar.tsx`
- `src/components/tools/tool-grid.tsx`

**禁止修改文件**：
- 工具数据获取逻辑
- 工具搜索/过滤逻辑
- 工具路由
- `package.json`、`schema.prisma`

**UI 目标**：
- 工具卡片视觉统一（图标、标题、描述、标签）
- 过滤栏样式优化
- 工具网格布局优化
- 空状态页面优化
- 与全局 Header/Footer 样式统一

**验收标准**：
- 工具卡片视觉统一
- 过滤栏样式优化
- 工具网格布局优化
- 空状态页面优化
- 移动端 390px 无横向滚动
- 所有工具链接可点击

**移动端标准**：
- 390px：单列布局
- 768px：双列布局
- 1024px+：三列或四列布局

**链接审计标准**：
- 所有链接 href="#" = 0
- 所有链接 href="" = 0
- 所有链接 javascript:void = 0

**是否需要用户截图验收**：
- ✅ 是

**回滚策略**：
- `git revert [commit]`
- 重新部署到 staging

**预计批次**：2 批  
**预计时间**：2-4 小时

**批次划分**：
- 批次 1：工具卡片 + 过滤栏
- 批次 2：工具网格 + 空状态

---

### Phase F：高频工具详情页分批优化

**目标**：优化 7 个高频工具详情页的 UI

**页面范围**：
- `/tools/postal-code`
- `/tools/hs-code`
- `/tools/exchange-rate`
- `/tools/shipping-calculator`
- `/tools/commercial-invoice`
- `/tools/quote`
- `/tools/container`

**允许修改文件**：
- 每个工具页面的 `page.tsx` 和客户端组件
- 工具表单组件
- 工具结果展示组件

**禁止修改文件**：
- 工具计算逻辑
- 工具 API 调用逻辑
- 工具数据验证逻辑
- `package.json`、`schema.prisma`

**UI 目标**：
- 表单样式统一（输入框、下拉框、按钮）
- 结果展示样式统一
- 说明区、FAQ 区样式统一
- 与全局 Header/Footer 样式统一

**验收标准**：
- 表单样式统一
- 结果展示样式统一
- 说明区、FAQ 区样式统一
- 移动端 390px 无横向滚动
- 所有计算功能正常

**移动端标准**：
- 390px：表单单列布局
- 768px+：表单双列布局（如适用）

**链接审计标准**：
- 所有链接 href="#" = 0
- 所有链接 href="" = 0
- 所有链接 javascript:void = 0

**是否需要用户截图验收**：
- ✅ 是（每批都需要）

**回滚策略**：
- `git revert [commit]`
- 重新部署到 staging

**预计批次**：4 批  
**预计时间**：6-8 小时

**批次划分**：
- 批次 1：`/tools/postal-code` + `/tools/hs-code`
- 批次 2：`/tools/exchange-rate` + `/tools/shipping-calculator`
- 批次 3：`/tools/commercial-invoice` + `/tools/quote`
- 批次 4：`/tools/container`

---

### Phase G：/checklists /guides /topics 内容页优化

**目标**：优化内容聚合页的 UI

**页面范围**：
- `/checklists` 清单页
- `/guides` 指南页
- `/topics` 专题页

**允许修改文件**：
- `src/app/(public)/checklists/page.tsx`
- `src/app/(public)/guides/page.tsx`
- `src/app/(public)/topics/page.tsx`
- 内容列表组件
- 内容卡片组件

**禁止修改文件**：
- 内容数据获取逻辑
- 内容分类逻辑
- 内容详情路由
- `package.json`、`schema.prisma`

**UI 目标**：
- 列表卡片样式统一
- 标签、摘要、CTA 可读
- 详情页排版优化
- 与全局 Header/Footer 样式统一

**验收标准**：
- 列表卡片样式统一
- 标签、摘要、CTA 可读
- 详情页排版优化
- 移动端 390px 无横向滚动

**移动端标准**：
- 390px：单列布局
- 768px+：双列布局

**链接审计标准**：
- 所有链接 href="#" = 0
- 所有链接 href="" = 0
- 所有链接 javascript:void = 0

**是否需要用户截图验收**：
- ✅ 是

**回滚策略**：
- `git revert [commit]`
- 重新部署到 staging

**预计批次**：2 批  
**预计时间**：3-4 小时

**批次划分**：
- 批次 1：`/checklists` + `/guides`
- 批次 2：`/topics`

---

### Phase H：/community 社区 UI 微调，不改版式

**目标**：优化社区论坛 UI，不改版式

**页面范围**：
- `/community` 社区主页
- `/community/[slug]` 帖子详情页

**允许修改文件**：
- `src/app/(public)/community/page.tsx`
- `src/app/(public)/community/[slug]/page.tsx`
- `src/components/community/*`（社区相关组件）

**禁止修改文件**：
- 社区版式结构
- 社区业务逻辑
- 社区数据获取逻辑
- 社区路由结构
- `package.json`、`schema.prisma`

**UI 目标**：
- 帖子列表样式统一
- 帖子详情页样式统一
- 评论样式统一
- 表单样式统一
- 与全局 Header/Footer 样式统一
- **不改版式**：保持现有 DOM 结构

**验收标准**：
- 帖子列表样式统一
- 帖子详情页样式统一
- 评论样式统一
- 表单样式统一
- 移动端 390px 无横向滚动
- 所有功能正常（发帖、评论、点赞）
- **不新增假帖子详情页**

**移动端标准**：
- 390px：单列布局
- 768px+：双列布局

**链接审计标准**：
- 所有链接 href="#" = 0
- 所有链接 href="" = 0
- 所有链接 javascript:void = 0

**是否需要用户截图验收**：
- ✅ 是

**回滚策略**：
- `git revert [commit]`
- 重新部署到 staging

**预计批次**：2 批  
**预计时间**：3-4 小时

**批次划分**：
- 批次 1：社区主页
- 批次 2：帖子详情页

---

### Phase I：/login 最终统一

**目标**：将登录页与全站 V4 风格最终统一

**页面范围**：
- `/login` 登录页

**允许修改文件**：
- `src/app/login/login-client.tsx`
- `src/app/login/page.tsx`

**禁止修改文件**：
- 登录认证逻辑
- 登录 API 调用
- 登录路由
- `package.json`、`schema.prisma`

**UI 目标**：
- 登录页与全局 Header/Footer 样式统一
- 表单样式与全站统一
- 按钮样式与全站统一
- 最终视觉统一

**验收标准**：
- 登录页与全局 Header/Footer 样式统一
- 表单样式与全站统一
- 按钮样式与全站统一
- 移动端 390px 无横向滚动
- 登录功能正常

**移动端标准**：
- 390px：单列布局
- 表单输入框全宽

**链接审计标准**：
- 所有链接 href="#" = 0
- 所有链接 href="" = 0
- 所有链接 javascript:void = 0

**是否需要用户截图验收**：
- ✅ 是

**回滚策略**：
- `git revert [commit]`
- 重新部署到 staging

**预计批次**：1 批  
**预计时间**：1-2 小时

---

### Phase J：全站链接、移动端、截图验收

**目标**：全站链接、移动端、截图验收

**页面范围**：
- 所有公开页面

**允许修改文件**：
- 仅修复发现的问题（如有）

**禁止修改文件**：
- 无新增功能

**UI 目标**：
- 全站视觉统一
- 所有链接有效
- 所有页面移动端适配正常
- 生成完整验收报告

**验收标准**：
- 所有页面 curl 验证通过（200 状态码）
- 所有页面链接审计通过（无 href="#"、无空 href、无 javascript:void）
- 所有页面移动端 390px 验收通过
- 所有页面截图验收通过
- 生成完整的验收报告

**移动端标准**：
- 所有页面 390px 无横向滚动
- 所有页面按钮可点击
- 所有页面链接有效

**链接审计标准**：
- 所有页面 href="#" = 0
- 所有页面 href="" = 0
- 所有页面 javascript:void = 0

**是否需要用户截图验收**：
- ✅ 是（最终验收）

**回滚策略**：
- 仅修复问题，不涉及大规模回滚

**预计批次**：1 批  
**预计时间**：2-3 小时

---

## 四、总结

### 总批次数

- Phase A：1 批
- Phase B：2 批
- Phase C：3 批
- Phase D：2 批
- Phase E：2 批
- Phase F：4 批
- Phase G：2 批
- Phase H：2 批
- Phase I：1 批
- Phase J：1 批

**总计**：20 批

### 预计时间

- 每批预计 1-2 小时（包括开发、测试、验收）
- 总计预计 20-40 小时

### 关键原则

1. **不引入新依赖**：所有优化仅使用现有的 Tailwind CSS 和 lucide-react
2. **不复制整套代码**：仅参考视觉要点，不复制业务逻辑
3. **每批完成后必须验收**：commit、build、curl、移动端验证
4. **不改版式，只改 UI**：特别是社区论坛，保持现有结构
5. **安全第一**：不触碰 production、不触碰数据库、不修改业务逻辑
6. **禁止泛化操作**：禁止 `git add .`，禁止泛化 rsync
7. **用户验收通过前不进入广告后台流程**

### 下一步

1. 用户审阅本计划文档
2. 用户提供 `/resources` 样式图（Phase D 前置条件）
3. 从 Phase A 开始执行

---

## 五、附录

### 5.1 参考项目

- Ant Design Pro（视觉风格）
- Material Dashboard（布局结构）
- Tailwind UI（组件样式）

### 5.2 参考文档

- `docs/ui-v4-design-system.md`（Phase A 创建）
- `docs/HERMES_ALWAYS_READ.md`
- `docs/HERMES_ROLE_POLICY.md`
- `docs/STAGING_FIRST_POLICY.md`

### 5.3 相关文档

- `AGENTS.md`
- `docs/JUESHI_AUDIT_TO_RELEASE_GATE.md`
- `docs/BRANCHING_POLICY.md`

---

**文档版本**: v1.0  
**最后更新**: 2026-07-06  
**状态**: 待用户审阅
