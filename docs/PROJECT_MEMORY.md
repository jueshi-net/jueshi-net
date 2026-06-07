# PROJECT MEMORY — 海外百宝箱 (xixiong-saas)

> **Generated**: 2026-05-28
> **Phase**: 三期 — UX 精修与板块联动 [DONE]
> **Version**: v1.41.0+ (main branch)
> **Target Users**: 跨境电商/SOHO, 留学生, 数字游民, 出国务工旅行, 海外华人华侨
> **Positioning**: 全域出国基础设施平台 (NOT just cross-border seller tool)

## ✅ 三期前端歼灭战完成记录 (2026-05-28)

### 模块一：全局导航重构
- 删除社区BBS链接（延至四期）
- 主导航新增：邮编查询、HS码查询（置顶）
- 新增下拉菜单：单据中心（6项）、全能工具（5项）
- 移动端菜单精简，删除重复论坛区

### 模块二：首页去重 + 订阅打通
- 删除首页中段重复NewsletterForm（保留底部）
- 订阅API集成Resend（条件初始化，无API Key时不报错）

### 模块三：专题404修复
- 根因：templateType !== rating_list 直接404，忽略CMS回退
- 修复：非rating_list专题优先渲染CMS回退内容
- 创建 docs/TOPIC_GENERATION_PROMPT.md 标准专题导入模板

### 模块四：邮编页功能挂载
- 新增当地实时时钟组件（支持8国时区）
- 新增中国驻XX大使馆链接（8国）
- 新增汇率工具快捷跳转按钮

### 模块五：国家页服务商websiteUrl
- Prisma schema新增 websiteUrl String? (DestinationService + DestinationGuide)
- Admin编辑页新增官网地址输入框
- 前端服务商名称支持点击跳转外链（target="_blank"）

### 数据库变更
- destination_services.website_url (text, nullable) — 服务商官网
- destination_guides.website_url (text, nullable) — 指南链接
- hs_codes.code 移除 @unique（支持51838条多CIQ记录）

---

---

## 🔴 零数据丢失与非破坏性更新规范（铁律）

### 数据库红线
1. **仅允许 ADD，禁止 DROP**：修改 Prisma Schema 时，只能添加新字段（如 `url`, `bbsPostId`, `isEnabled`），**绝对禁止**删除现有表（Drop Table）或缩减字段。
2. **禁止 deleteMany / TRUNCATE 用户资产**：所有涉及数据的脚本必须采用 `upsert` 或 `create` 逻辑。`deleteMany` 和 `TRUNCATE` 仅允许用于一次性开发/测试脚本（如灌入 HS Code 数据前的清空操作），绝不允许用于清理用户生成的资产记录（`User`, `LinkItem`, `Article`, `Favorite`, `Memo` 等）。
3. **灌库前确认目标 DB**：执行任何 Prisma 数据操作前，必须 `grep DATABASE_URL .env.production` 确认连接的是 `127.0.0.1:5432/bxb_prod`，绝不可误连 Neon 测试库。
4. **Prisma 7 适配器**：必须使用 `@prisma/adapter-pg`，不能使用旧版 `datasourceUrl`。

### 路由红线
1. **禁止直接删除活跃页面**：优化菜单与组件结构时，必须采用平滑迁移策略。现有活跃路由（`/resources`, `/guides`, `/tools/hs-code`, `/destinations`, `/topics`, `/nav`, `/starter`, `/tools/*`, `/blog/*` 等）**不得直接删除**。
2. **新增路由必须测试**：新路由上线前必须在 VPS 上 `curl` 验证 200，确认无 404/500 错误。
3. **重定向保留旧入口**：如需重命名路由，必须在旧路径设置 `redirect()` 到新路。

### 构建与部署红线
1. **禁止在开发阶段执行 `npm run build`**：Build 仅在确认所有页面功能正常后、部署前执行。
2. **rsync 后必须重建**：VPS 部署后 MUST 执行 `rm -rf .next && npm run build`，否则旧 chunk 缓存导致 ChunkLoadError。
3. **禁止本地 git status 作为 VPS 验证**：代码写了不算完成。必须在 VPS 上 `grep -n` 确认实际文件内容，并在浏览器 Cmd+Shift+R 硬刷新验证。
4. **SEO daemon 熔断**：生成残次品时立即 `pm2 stop seo-daemon`，不得让其持续产出垃圾数据。

### 内容安全规范
1. **Nickname 占位检测**：`!rawName || rawName === '用户' || rawName === 'user' || rawName === 'User'` → fallback 到 email prefix → 最终 "跨境卖家"。绝不允许显示 "用户" 作为 display name。
2. **UI 文案包容性**：必须覆盖所有出海人群："无论您是跨境商户、留学生还是数字游民，这里都有为您定制的出海解法"。
3. **YouTube playlists**：仅用于内部选题研究，**绝不**在前端展示。
4. **广告策略**：native card-based，明确标注"推广"/"赞助"/"推荐"，无弹窗，无 AdSense，默认 `enabled: false`（`src/lib/data/ads.ts`）。

---

## 📊 当前项目进度与核心功能清单

### 环境概览
| 项目 | 值 |
|---|---|
| **VPS** | 192.129.155.149 (deploy 用户, id_ed25519) |
| **PM2 进程** | `xixiong-saas` (Next.js), `jueshi-miner` (爬虫守护), `crontab` (滴灌调度) |
| **数据库** | Local PostgreSQL `127.0.0.1:5432/bxb_prod` (VPS 本地) |
| **框架** | Next.js 16.2.4 + Prisma 7 + PostgreSQL |
| **当前版本** | v1.41.0+ |
| **部署脚本** | `scripts/deploy.sh` (rsync) |

### 数据库表 (62 个 Prisma Models)
| 模型 | 说明 | 记录数 |
|---|---|---|
| `User` | 用户账户 | 13 |
| `UserPreference` | 用户偏好设置 | - |
| `Account` / `Session` | NextAuth 认证 | - |
| `LinkItem` | 导航链接 | - |
| `Category` / `Tag` / `LinkTag` | 链接分类标签 | - |
| `Favorite` | 收藏夹 | - |
| `Memo` | 便签 | - |
| `Workspace` / `WorkspaceMember` | 工作空间 | - |
| `ShortLink` | 短链接 | - |
| `AuditLog` / `Feedback` | 审计与反馈 | - |
| `Notification` | 通知 | - |
| `AdCampaign` | 广告活动 | - |
| `InviteCode` | 邀请码 | - |
| `Article` | 文章/指南 | 20 |
| `Resource` | 导航资源 | 928 |
| `Subscription` / `SubscriptionPlan` / `UserSubscription` | 订阅系统 | - |
| `Webhook` | Webhook 管理 | - |
| `EmailSubscription` / `NewsletterBroadcast` | 邮件与 Newsletter | - |
| `PostalCode` | 邮政编码库 | - |
| `HSCode` | 海关 HS 编码 | **51,838** |
| `ExportLog` / `EventLog` | 导出与事件日志 | - |
| `PointLedger` / `DailyCheckIn` | 积分与签到 | - |
| `UserTask` / `RewardItem` / `UserReward` | 任务与奖励 | - |
| `WorkbenchLink` | 工作台链接 | - |
| `ToolFavorite` / `ToolReview` | 工具收藏/评价 | - |
| `AIUsageLog` | AI 使用记录 | - |
| `Topic` / `TopicItem` / `TopicSection` | 专题系统 | 11 |
| `UserLevel` / `UserBadge` / `UserBadgeAward` / `GrowthLog` | 成长体系 | - |
| `UserCompanyProfile` / `UserCompanyProfileHistory` | 企业档案 | - |
| `ToolDocumentDraft` / `ToolDocumentHistory` / `DocumentHistory` | 文档工具历史 | - |
| `Tool` | 工具库 | 0 |
| `HubSeoContent` | SEO 内容 | - |
| `UserWidgetConfig` / `UserCustomNav` | 用户组件/导航配置 | - |
| `Destination` | 目的地(国家) | 21 |
| `DestinationTool` / `DestinationGuide` / `DestinationService` | 目的地内容 | - |
| `UserOnboardingState` | 用户引导状态 | - |
| `UserFavorite` | 用户收藏(新) | - |

### 前端路由结构
#### 🔧 管理后台 (`/admin/*`) — 28 页面
- `/admin` — Dashboard 总览
- `/admin/ads` — 广告管理
- `/admin/analytics` — 数据分析
- `/admin/audit` — 审计日志
- `/admin/backup` — 数据库备份
- `/admin/categories` — 分类管理
- `/admin/cms` — CMS 文章管理 (Articles)
- `/admin/destinations/*` — 目的地管理
- `/admin/feedback` — 用户反馈
- `/admin/growth-logs` — 成长日志
- `/admin/health` — 健康检查
- `/admin/import` / `import-bookmarks` — 数据导入
- `/admin/invites` — 邀请码管理
- `/admin/levels` — 等级管理
- `/admin/link-health` — 链接健康监控
- `/admin/links` — 链接管理
- `/admin/newsletter` — Newsletter 广播
- `/admin/notifications` — 通知管理
- `/admin/resources` / `resources/import` — 资源管理
- `/admin/settings` — 系统设置
- `/admin/short-links` — 短链接管理
- `/admin/tags` — 标签管理
- `/admin/tool-reviews` — 工具评价管理
- `/admin/topics/*` — 专题管理
- `/admin/users` — 用户管理
- `/admin/webhooks` — Webhook 管理

#### 🌐 公开页面 (`/(public)/*`) — 45+ 页面
- `/` — 首页 (Landing)
- `/ai-learning` — AI 学习
- `/ai-tools` — AI 工具集 (document-summary, product-copy, translate-polish)
- `/analytics` — 公开分析
- `/api-docs` — API 文档
- `/blog` / `/blog/[slug]` — 博客
- `/business` — 企业服务
- `/changelog` — 更新日志
- `/design-system` — 设计系统
- `/destinations` / `/destinations/[slug]` — 目的地指南 (21 个国家)
- `/export` — 数据导出
- `/favorites` — 收藏夹
- `/feedback` — 反馈
- `/guides` / `/guides/[slug]` — 指南/文章 (20 篇)
- `/help` — 帮助中心
- `/logistics` — 物流信息
- `/nav` — 导航站
- `/packages` / `/packages/[id]` — 服务套餐
- `/pricing` — 定价页
- `/privacy` / `/terms` — 隐私/条款
- `/profile` — 个人主页
- `/rankings` — 排行榜
- `/resources` / `/resources/[slug]` — 资源导航 (928 条)
- `/scenario/[role]` — 角色场景 (student, merchant, traveler, nomad)
- `/search` — 搜索
- `/shipping` — 运费查询
- `/starter` / `/starter/[slug]` / `apps` / `student` — 新手入门
- `/tools/*` — 工具箱 (20+ 子页面):
  - `address-formatter`, `calculator`, `commercial-invoice`, `container`,
  - `customs-generator`, `debit-note`, `documents`, `exchange-rate`,
  - `handover-note`, `hs-code` (51,838 条海关数据), `inbound`, `inbound-receipt`,
  - `invoice`, `memo`, `postal-code`, `qrcode`, `quote`, `quote-sheet`, `receipt`,
  - `sensitive-goods`, `shipping-calculator`, `shipping-estimator`, `shipping-label`,
  - `shipping-mark`, `video-script-sop`, `zip`
- `/topics` / `/topics/[slug]` — 专题 (11 个)
- `/tracking` — 物流追踪

#### 💼 工作区 (`/(workspace)/*`) — 10 页面
- `/workbench` — 工作台
- `/workspace` — 工作空间
- `/dashboard` / `documents` / `notifications` / `points` / `stats` / `tasks`
- `/my-links` — 我的链接
- `/settings` — 设置

#### 🔐 认证 & 其他
- `/login`, `/forgot-password` — 登录/找回密码
- `/notifications`, `/preferences` — 通知/偏好
- `/go/[id]` — 跳转页
- `/s/[code]` — 短链跳转
- `/share/[id]` — 分享页
- `/subscribe/confirm` — 订阅确认
- `/rss.xml` — RSS

### 守护进程 & 自动化
| 进程 | 说明 | 状态 |
|---|---|---|
| `xixiong-saas` | Next.js 生产服务 | online |
| `jueshi-miner` | BFS 递归爬虫 (UA 轮换 + 延迟抖动) | online |
| `crontab` | 每日 10:00 滴灌发布任务 | active |
| `seo-daemon` | AI 文章生成管线 | **STOPPED** (待修复后重启) |

### 关键脚本
| 脚本 | 用途 |
|---|---|
| `scripts/deploy.sh` | rsync 部署脚本 |
| `scripts/drip-publisher.ts` | 每日滴灌发布 |
| `scripts/ai-article-pipeline.ts` | AI 文章生成管线 |
| `scripts/import-resources.ts` | 资源批量导入 |
| `scripts/advanced-crawler/harvester.ts` | BFS 爬虫引擎 |
| `scripts/inject-v2.ts` | HS Code 极速灌浆 |
| `scripts/parse-hs-excel-v2.py` | Excel 解析 (103 sheets → 51,838 条) |

---

## 🚫 绝对禁止事项

1. ❌ 禁止 `prisma db push` / `migrate` 不确认目标 DB
2. ❌ 禁止 `npm run build` 在功能未完成时
3. ❌ 禁止删除 `/resources`, `/guides`, `/tools/hs-code` 等活跃路由
4. ❌ 禁止对 `users`, `articles`, `resources`, `favorites` 等用户资产表执行 `TRUNCATE` / `deleteMany`
5. ❌ 禁止本地 git status 代替 VPS 实际验证
6. ❌ 禁止显示 "用户" 作为昵称
7. ❌ 禁止在前端展示 YouTube playlists
8. ❌ 禁止将产品定位为仅限"跨境卖家"（必须包容所有出海人群）
9. ❌ 禁止使用 142.171.184.179（旧 VPS IP）
10. ❌ 禁止对 HS Code 等核心数据执行无备份的破坏性操作

---

## 📝 三期待办方向（待规划）

- [ ] UX 精修：各页面 UI 统一与交互优化
- [ ] 板块联动：工具 ↔ 导航 ↔ 文章 ↔ 目的地的交叉引用
- [ ] 用户增长：注册转化漏斗优化、社交分享增强
- [ ] SEO 内容管线修复：恢复 seo-daemon 正常产出
- [ ] 工具库丰富：扩充 `/tools/*` 子功能
- [ ] 移动端适配：iPhone Safari 真机测试与优化

---

*本文档为所有后续操作的潜意识基础。执行任何三期代码前，必须阅读并遵守上述规范。*
