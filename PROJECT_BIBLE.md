# PROJECT_BIBLE.md

> 绝世百宝箱永久规则圣经  
> 本文档仅记录永久规则，不记录日常开发进度  
> 最后更新: 2026-07-09

---

## 0. 服务器环境永久规则

### 0.1 环境分离模式

当前采用开发/预览服务器与生产服务器分离模式。

### 0.2 Staging / 开发预览环境

| 项目 | 值 |
|------|-----|
| SSH | `deploy@192.129.155.149` |
| PM2 | `xixiong-staging` |
| 域名 | `i.jueshi.net` |
| 目录 | `/home/deploy/xixiong-saas-staging` |
| 权限 | 仅允许 staging build / staging deploy / staging DB |

### 0.3 Production / 生产环境

| 项目 | 值 |
|------|-----|
| SSH | 必须单独确认后才能操作 |
| PM2 | 必须单独确认后才能操作 |
| 域名 | `jueshi.net` |
| 目录 | 必须单独确认后才能操作 |

**生产环境操作前提**：
- 必须单独确认生产服务器 SSH、PM2、目录、域名后才能操作
- 未经用户在当前对话明确授权，禁止连接 production
- 禁止生产 DB migration / db push / 数据修改

### 0.4 SSH 连接故障诊断

遇到 SSH banner/kex/timeout 时：
1. **第一优先级**检查是否连错用户、连错服务器、连错环境
2. 不得默认判定服务器故障

### 0.5 永久禁止

- ❌ 不得用 root/admin/chq 等用户替代 deploy
- ❌ 不得混用 staging 与 production
- ❌ 不得触碰 9833416@qq.com

---

## 1. 平台定位

**绝世百宝箱 (jueshi.net)** — 海外华人的实用工具箱

### 核心用户群

| 用户群 | 需求 |
|--------|------|
| 跨境电商卖家 | 物流计算、单据生成、HS编码查询 |
| 外贸 SOHO | 商业发票、装箱单、报关单 |
| 留学生 | 签证指南、生活资源、汇率换算 |
| 数字游民 | 目的地信息、邮编查询、公司注册 |
| 海外华人社区 | 交流论坛、经验分享 |

### 核心价值主张

- **工具驱动** — 20+ 实用工具解决实际问题
- **内容赋能** — 指南、清单、专题提供知识支持
- **社区连接** — 论坛和社区建立用户纽带
- **一站式** — 覆盖出国全流程需求

---

## 2. 产品边界

### 做什么

- ✅ 实用工具（运费计算、汇率、邮编、HS编码、单据生成）
- ✅ 内容平台（指南、清单、专题、博客）
- ✅ 资源导航（海外生活、学习、工作资源）
- ✅ 社区互动（论坛、评论、徽章）
- ✅ 工作区（收藏、文档、备忘录、任务链）
- ✅ AI 辅助（产品文案、翻译润色、文档摘要）

### 不做什么

- ❌ 不做社交网络（不是 Facebook/微信）
- ❌ 不做电商平台（不卖实物商品）
- ❌ 不做 SaaS 订阅工具（不是 Notion/Slack）
- ❌ 不做新闻门户（不是今日头条）
- ❌ 不做即时通讯（不是 WhatsApp/Telegram）

---

## 3. 永久设计原则

### 3.1 移动优先

- 所有页面必须响应式
- 移动端体验优先于桌面端
- 触摸友好（按钮最小 44px）

### 3.2 性能优先

- 首屏加载 < 3s
- Lighthouse Performance > 80
- 图片懒加载
- 代码分割

### 3.3 可访问性

- 语义化 HTML
- ARIA 标签
- 键盘导航
- 颜色对比度 WCAG AA

### 3.4 渐进增强

- 核心功能不依赖 JavaScript
- Server Component 优先
- Client Component 仅在必要时使用

### 3.5 一致性

- 统一视觉语言（V4 Shell）
- 统一交互模式（Design System）
- 统一导航结构
- 统一信息架构

---

## 4. Design System 原则

### 4.1 组件设计

- **单一职责** — 每个组件只做一件事
- **可组合** — 小组件组合成大组件
- **可配置** — 通过 Props 控制行为
- **可测试** — 独立可测试

### 4.2 样式原则

- **Tailwind CSS** — 原子化 CSS，不写自定义 CSS
- **响应式** — sm/md/lg/xl 断点
- **Dark Mode** — 所有组件支持
- **主题化** — CSS 变量支持主题切换

### 4.3 命名规范

- **PascalCase** — 组件文件名（PageContainer.tsx）
- **kebab-case** — 工具函数文件名（theme-toggle.tsx）
- **语义化** — 名称反映用途，不反映实现

### 4.4 目录结构

```
src/components/
├── design-system/     # Design System 组件（最高优先级）
├── layout/            # 布局组件
├── ui/                # 基础 UI 组件
├── saas/              # SaaS 业务组件
├── workspace/         # 工作区组件
├── user/              # 用户相关组件
├── tools/             # 工具页面组件
├── navigation/        # 导航组件
├── home/              # 首页组件（Legacy，待迁移）
└── ui-lab/            # 实验组件（不用于 Production）
```

---

## 5. V4 Shell 原则

### 5.1 Shell 架构

```
JueshiV4PublicShell
├── JueshiV4Header (统一页头)
├── <main>{children}</main> (页面内容)
└── JueshiV4Footer (统一页脚)
```

### 5.2 使用规则

- 所有公共页面必须使用 V4 Shell 或 Public Layout
- V4 Shell 页面跳过 Public Layout 的 Header/Footer（避免重复）
- 跳过逻辑在 `public-layout-client.tsx` 中维护
- 新增 V4 Shell 页面时，必须同步更新跳过逻辑

### 5.3 页面分类

| 类型 | Shell | Header/Footer | 说明 |
|------|-------|---------------|------|
| V4 Shell 页面 | JueshiV4PublicShell | V4 Header/Footer | 页面自带 Shell |
| Public Layout 页面 | 无 | 旧 Header/Footer | 由 Layout 提供 |
| Admin 页面 | Admin Layout | Admin Header | 管理后台 |
| Workspace 页面 | Workspace Layout | Workspace Header | 用户工作区 |

---

## 6. Workspace 原则

### 6.1 认证要求

- 所有 `/workspace/*` 页面必须登录
- 未登录用户重定向到 `/login`
- 使用 NextAuth v5 JWT 模式

### 6.2 数据隔离

- 用户只能访问自己的数据
- API 层必须验证用户身份
- 管理员可以访问所有数据（通过 Admin 后台）

### 6.3 功能边界

- 工作区是用户的私人空间
- 不包含公共内容
- 不包含社交功能
- 专注于工具和文档管理

---

## 7. SEO 原则

### 7.1 Metadata

- 每个页面必须有 `title` 和 `description`
- 使用 `generateMetadata` 动态生成
- Open Graph 标签完整
- Twitter Card 标签完整

### 7.2 结构化数据

- 使用 JSON-LD
- 适合的内容类型（Article, Product, Organization）
- BreadcrumbList 用于导航页面

### 7.3 技术 SEO

- 语义化 HTML（h1-h6, nav, main, article, section）
- 内部链接合理
- 外部链接 `rel="noopener noreferrer"`
- 图片 `alt` 属性
- `robots.txt` 和 `sitemap.xml`

### 7.4 国际化

- 默认语言：中文 (zh_CN)
- `hreflang` 标签
- `locale` 设置

---

## 8. Landing Page 原则

### 8.1 结构

```
Landing Page
├── Hero (价值主张 + CTA)
├── Features (功能展示)
├── Social Proof (用户评价/数据)
├── CTA (行动号召)
└── Footer
```

### 8.2 设计原则

- 单一目标（一个页面一个 CTA）
- 视觉层次清晰
- 减少干扰（无导航栏或简化导航）
- 移动端优化

### 8.3 性能要求

- 首屏加载 < 2s
- Lighthouse > 90
- 图片优化（WebP, lazy load）

---

## 9. ContentOps 原则

### 9.1 内容类型

| 类型 | 用途 | 格式 |
|------|------|------|
| Guide（指南） | 教程、操作指南 | Markdown + Frontmatter |
| Checklist（清单） | 检查清单、步骤列表 | Markdown + Frontmatter |
| Article（文章） | 博客文章、新闻 | Markdown + Frontmatter |
| Topic（专题） | 主题聚合 | 数据库 Model |
| Resource（资源） | 外部资源导航 | 数据库 Model |

### 9.2 内容流程

```
草稿 → 审核 → 发布 → 监控 → 更新/归档
```

### 9.3 质量标准

- 原创内容（不抄袭）
- 准确信息（定期验证）
- 实用价值（解决实际问题）
- 格式规范（Markdown 规范）

---

## 10. 永久禁止事项

### 10.1 代码层面

- ❌ `prisma db push` — 永远禁止
- ❌ 破坏性 SQL (DROP/DELETE/TRUNCATE) — 永远禁止
- ❌ 输出密钥 (DATABASE_URL, SSH key, password) — 永远禁止
- ❌ `acceptEdits` / `bypassPermissions` — 永远禁止
- ❌ Claude Code 直接修改 src/** — 不再作为默认方案

### 10.2 运维层面

- ❌ Production 直接修改 — 必须 staging-first
- ❌ 未经确认切换 DNS — 永远禁止
- ❌ 声称用户满意 — 永远禁止
- ❌ 扩展 Beta — 永远禁止
- ❌ 公开推广 — 永远禁止

### 10.3 开发流程

- ❌ 不测试就部署 — 永远禁止
- ❌ 不审查就合并 — 永远禁止
- ❌ 不备份就修改 — 永远禁止

---

## 11. Production 保护规则

### 11.1 Staging-First 流程

```
feature/* → staging branch → i.jueshi.net → 用户验收 → audit → main → jueshi.net → smoke test → 观察
```

### 11.2 Audit Gate

- Production 发布前必须运行 `tools/jueshi-audit`
- 没有证据路径的 audit 结果无效
- P0/P1 问题未清除不能进入 production
- 用户不能豁免 P0/P1

### 11.3 环境标记

- `/etc/jueshi-environment` (优先)
- `/home/deploy/.jueshi-environment` (备选)
- 脚本必须读取环境标记，不匹配则 exit 1

### 11.4 回滚机制

- Production 必须可回滚
- 回滚前必须备份
- 回滚后必须验证

---

## 12. 9833416@qq.com 永久保护

### 12.1 保护规则

| 操作 | 允许 |
|------|------|
| 修改账号信息 | ❌ 禁止 |
| 删除账号 | ❌ 禁止 |
| 重置密码 | ❌ 禁止 |
|  repurpose（改作他用） | ❌ 禁止 |
| 修改邮箱地址 | ❌ 禁止 |
| 修改角色/权限 | ❌ 禁止 |

### 12.2 原因

此账号为永久保护账号，具有特殊地位。任何操作都可能影响系统稳定性。

### 12.3 替代方案

- 测试使用 `test@jueshi.net`
- 其他操作使用普通用户账号
- 管理员操作使用其他管理员账号

---

## 13. AI Agent 永久规则

### 13.1 Claude Code

**角色**: 只读 Proposal Generator

- ✅ 阅读代码、理解项目
- ✅ 输出完整文件 Proposal
- ❌ 不直接修改业务代码
- ❌ 不使用 Write/Edit/MultiEdit
- ❌ 不使用 acceptEdits/bypassPermissions

### 13.2 Hermes Agent

**角色**: Task Orchestrator + Pipeline Runner

- ✅ 读取任务队列
- ✅ 调用 Claude Code 生成 Proposal
- ✅ 生成 Patch（diff -u）
- ✅ 应用 Patch（git apply）
- ✅ 构建验证（npm run build）
- ✅ 部署 Staging
- ✅ 验证部署（curl）
- ✅ 失败回滚（git reset --hard）

### 13.3 OpenClaw

**角色**: Gateway + Health Monitor

- ✅ 运行 Gateway 服务
- ✅ 提供通信通道
- ✅ 健康监控
- ✅ 进程重启

### 13.4 协作原则

- **分离关注点** — 每个 Agent 只做自己的事
- **最小权限** — 每个 Agent 只拥有必要的权限
- **可审计** — 所有操作可追踪
- **可回滚** — 所有修改可撤销

---

## 附录：文档版本

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0 | 2026-07-09 | 初始版本 |

---

**文档状态**: PROJECT_BIBLE_ESTABLISHED  
**性质**: 永久规则，不记录日常进度  
**更新频率**: 仅在规则变更时更新
