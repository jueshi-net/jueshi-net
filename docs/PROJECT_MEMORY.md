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
| `AdPlacement` | 广告位库存 | 19 (种子数据) |
| `LandingPage` | 落地页配置 | 0 (仅后台) |
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
#### 🔧 管理后台 (`/admin/*`) — 30 页面
- `/admin` — Dashboard 总览
- `/admin/ads` — 广告管理
- `/admin/ad-placements` — 广告位管理 (v1.20.42.6.14)
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
- `/admin/landing-pages` — 落地页管理 (v1.20.42.6.14)
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

## 🛡️ Dashboard/Admin 保护规则 (v1.20.42.6.11 锁定, v1.20.42.6.14 扩展)

### 路由保护
1. `/workspace` 是正式工作台路由，不得替换为其他路径。
2. `/workbench` 仅作为兼容跳转，不得作为主入口。
3. Dashboard 当前 8 个用户端页面不得被删除：`/workspace`, `/workspace/documents`, `/workspace/company-profiles`, `/workspace/favorites`, `/workspace/notifications`, `/workspace/member`, `/workspace/tasks`, `/workspace/settings`。
4. UserSidebar / MobileTabs 不得随意替换或移除。
5. 后续工具迁移不得修改 `src/app/(workspace)` 目录结构。
6. 后续 Auth 修改必须回归 `/workspace` 首屏加载测试。
7. 后续 Dashboard 新功能只能增量增强，不得用简化版覆盖现有页面。

### Admin 导航保护
8. Admin 导航 5 组 23 项结构不得随意删减（v1.20.42.6.14 从 21 增至 23）。
9. 新增 Admin 页面必须先有完整功能，禁止加入 404 空菜单。
10. 高级工具型页面（如 webhooks、import-bookmarks）不得误放入核心运营入口。
10.1. 已新增: "落地页管理" (/admin/landing-pages) → 内容与资源分组
10.2. 已新增: "广告位管理" (/admin/ad-placements) → 广告与数据分组

### 数据库红线
11. Dashboard/Admin 相关功能不得新增 Prisma schema/migration，除非先单独报告并获得确认。
12. 通知、收藏、成长值等现有表结构不得随意修改字段类型。

### v1.20.42.6.14 新增红线
13. **禁止前台广告渲染**：`AdPlacement` 仅为广告位库存定义，不代表任何前台展示能力。`LandingPage` 当前仅后台配置，不代表公开发布。
14. 任何前台广告渲染或公开落地页路由 (`/lp/[slug]`) 的开发必须单独报告并获得用户确认后方可启动。
15. `AdCampaign` 现有字段含义不得修改，`AdCampaign.placements` 字段不得删除。

### v1.20.42.6.15 新增红线
16. AdCreative / AdEvent / AdRule 当前仅规划，不实现。
17. AdPlacement 当前仅为广告位库存，不代表任何前台展示或投放能力。
18. LandingPage 当前仅为后台配置模型，无公开路由渲染。
19. `prisma/migrations/` 必须与 `_prisma_migrations` 表保持同步，禁止未提交 migration 导致 DB schema 漂移。

### v1.20.42.6.15.1 Migration Baseline 修复记录
20. 已补齐 `20260514000000_sync_schema` 占位 migration (DB 有记录但 repo 缺失)
21. 已新增 `20260609013309_baseline_full_schema` 完整 baseline migration (67 表, IF NOT EXISTS 幂等)
22. 临时空数据库验证: 20 migrations 全部应用, 68 表与生产 DB 完全一致
23. 后续新增数据库模型必须随代码提交 migration SQL，禁止 schema.prisma 变更但 migration 缺失
24. 生产 DB 不允许手工漂移，所有 schema 变更必须通过 migration 文件

### v1.20.42.6.15.2 Baseline Resolve Lock 记录
25. 已通过 `prisma migrate resolve --applied 20260609013309_baseline_full_schema` 将 baseline 在生产 DB 标记为已应用
26. `prisma migrate status` 现已显示 `Database schema is up to date!`，无 pending migration
27. AdCreative / AdEvent Backend MVP 前置条件全部满足

### v1.20.42.6.16 AdCreative & AdEvent Backend MVP 记录
28. 已新增 `AdCreative` 模型 (ad_creatives 表) 与 `AdEvent` 模型 (ad_events 表)
29. 已新增 `/admin/ad-creatives` 广告素材管理页面 (CRUD 完整)
30. 已增强 `/admin/ads`: 显示素材数量、非法 placement key 警告
31. 已新增 `POST /api/ads/events` 广告事件 API (impression/click)
32. AdCreative 当前只是后台素材库，不代表前台渲染
33. AdEvent 当前只是日志基础，不代表前台自动埋点
34. 仍禁止前台广告渲染

### v1.20.42.6.17 Safe Ad Rendering Pilot Planning 记录
35. 已制定 `docs/SAFE_AD_RENDERING_PILOT_PLAN.md`，规划首批安全广告渲染试点
36. 首批试点仅限 `article.footer_recommend` 与 `tool.footer_banner`，暂缓 `landing.block_between`
37. **绝对禁止广告区域**：Quote Sheet 编辑区、工具表单中间、工作台核心区、登录/注册页、Admin 后台、Hero 正下方
38. 第一批广告渲染必须单独版本执行，未经确认不得提前渲染
39. AdEvent API 需后续加固 (adRenderToken/nonce)，当前匿名可访问为中风险
40. SafeAdSlot 组件仅规划，未开发

### v1.20.42.6.18 AdEvent API Hardening + Miner Health Audit 记录
41. 已实现 `adRenderToken` 机制 (`src/lib/ad-token.ts`)：HMAC-SHA256 签名，10 分钟有效期，timing-safe 校验
42. `POST /api/ads/events` 已加固：强制 adRenderToken，缺失返回 401，无效返回 403，不写事件不增计数
43. 新增 6 项关系校验：campaign/placement/creative 三级关联验证，click 必须匹配 token 的 creativeId
44. ~~新增测试端点 `POST /api/ads/test-generate-token`~~ → **v1.20.42.6.18.1 已删除**，改用 `scripts/test-ad-token.mjs` 本地脚本
45. **jueshi-miner 异常根因**：`scripts/advanced-crawler/daemon.ts` 文件不存在（仅保留 daemon.log），PM2 配置指向已删除脚本导致 3503 次重启
46. jueshi-miner 已停用（`pm2 stop` + 从 ecosystem.config.js 移除 autorestart），不影响主站
47. PM2 热重启 (restart) 存在模块缓存问题，新代码需冷重启 (pkill -9 + PM2 delete all + nohup npm start) 才能生效
48. 广告事件 API 安全红线：必须使用 adRenderToken，禁止匿名上报，禁止保存原始 IP/UA

### v1.20.42.6.18.2 Production Runtime Lock + Full AdEvent Verification 记录
56. xixiong-saas 已正式恢复 PM2 管理（interpreter: "bash"），不再使用 nohup
57. ecosystem.config.js 已移除 jueshi-miner 配置，pm2 save 后 dump.pm2 仅含 xixiong-saas
58. 创建 TEST_VERIFY 测试数据：campaign (599e30e9...) + creative (1dd220f1...)，baseline impressions=0 clicks=0
59. AdEvent API 10 项测试全部通过（9 项生产运行时 + 1 项代码验证），最终计数器 impressions=3 clicks=2
60. 失败请求未写入 AdEvent 表，未递增计数器
61. test-generate-token 端点 404 确认删除，scripts 引用 0 处
62. 前台广告渲染仍未开始，仍需 SafeAdSlot 组件 + resolve API 开发

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

## v1.20.42.6.21 Landing Page Admin Preview + Content IA Notes

- Admin /admin/landing-pages 增强：列表新增公开 URL / 预览摘要 / 无效 slug warning
- 编辑页新增"打开公开页"按钮（仅 published）+ 预览摘要 + 无效引用 warning
- API /api/admin/landing-pages GET 增加 heroSection/faqItems/officialLinks/ctaConfig 字段
- SEO metadata 确认正常（title/og:title/description/canonical/twitter:card 全部存在且非空）
- landing.block_between 广告链路验证通过：resolve → SafeAdSlot → impression/click → AdEvent
- 专题/清单长期规划已写入 docs/CONTENT_IA_LONG_TERM.md（详见 19.1 报告）
- SEO 内链长期规划已写入 docs/CONTENT_IA_LONG_TERM.md 第十章（详见 19.2 报告）
- 未开发清单页 / 未批量 SEO / 未扩大广告位
- 修改文件：landing-pages-client.tsx + route.ts（仅 Admin 增强，不影响前台）

## v1.20.42.6.19.2 SEO & Internal Linking Long-term Planning

详见 `docs/CONTENT_IA_LONG_TERM.md` 第十章：

- 页面角色与搜索意图防冲突：专题(攻略) / 清单(步骤) / 工具(执行) / 文章(对比) / 落地页(场景)
- 内链路径模型：专题 → 清单 → 工具 → 用户资产
- 锚文本规范：必须具体描述目标页，禁止泛化锚文本（"点击这里"）
- 内链规则：专题至少 2 清单 + 3 工具 + 2 文章链接；清单每步绑工具；落地页禁止孤岛
- Hermes ContentOps 生成内容时必须同时输出 internal_links 配置
- 纯文档规划，零代码/零数据库/零 Admin/零前台变更

## v1.20.42.6.19.1 Content IA Long-term Planning

详见 `docs/CONTENT_IA_LONG_TERM.md`：

- 专题（Topic）= 知识地图 / 资源集合 / 主题入口
- 清单（Checklist）= 行动步骤 / 避坑核对 / 场景任务单
- 两者不是重复栏目，而是"专题 → 清单 → 工具 → 用户资产 / 任务链"的转化路径
- 未来专题和清单内容必须使用 AI 友好、搜索友好的结构化发布规范
- 可规划 Hermes ContentOps Skill，本轮不开发
- 纯文档规划，零代码/零数据库/零 Admin 变更

## v1.20.42.6.19 Safe Ad Rendering Pilot 规则

- 前台广告必须使用 SafeAdSlot 组件 + /api/ads/resolve API + adRenderToken 强制校验
- SafeAdSlot 仅在文章页底部(article.footer_recommend)和工具页底部(tool.footer_banner)接入
- 禁止区域：表单中间、Quote Sheet 编辑区、结果核心区上方、工作台核心区、登录/注册页、弹窗、Admin 后台、公开落地页
- 测试 token 只能通过本地脚本(scripts/test-ad-token.mjs)或受控后台方式生成
- 前台广告渲染前必须完成 AdEvent 生产运行时验证(10 项)
- html/codeSnippet 类型广告禁止前台渲染（安全限制）
- 新增广告位必须先在 AdPlacement 表中注册，否则 resolve API 返回 null

## v1.20.42.6.26 Quote Sheet 路径记录

- 当前正式单据路径倾向：`/tools/documents/quotation`（Workspace 内链指向此路径，`/tools/quote` 自动 308 重定向至此）
- `/tools/quote-sheet` 已 308 永久重定向到 `/tools/documents/quotation`
- 两者已合并，只有一个 canonical 页面渲染 Quote Sheet 内容
- sitemap 只输出 `/tools/documents/quotation`
- 所有内部链接统一指向 `/tools/documents/quotation`

## v1.20.42.6.27 Git 流程规范

- 本地和 VPS 曾因直接在 VPS commit 导致同内容不同 hash
- 文件内容可通过 MD5 校验对齐，但 git history 分叉
- **推荐流程**：本地开发 → git commit → rsync 到 VPS → VPS git reset --hard 对齐本地 → PM2 reload
- 或在 VPS commit 后，必须 `git fetch` 回本地合并
- 不要长期保留两套分叉历史

## v1.20.42.6.28 Hermes ContentOps Skill

- Skill 位置：`hermes/skills/checklist-contentops/SKILL.md`
- 配套目录：
  - `content-drafts/topic-packs/` — 选题包 YAML 示例
  - `content-drafts/checklists/` — 生成的 draft JSON
- Wrapper 脚本：`scripts/hermes-generate-checklist-draft.mjs`
  - 读取 topic pack → 生成 draft JSON → 校验 → 保存
  - `--import-draft` 参数可选导入数据库（强制 status=draft）
  - 不调用外部 LLM API（由 Hermes Agent 负责生成正文）
- 校验脚本：`scripts/validate-checklist-draft.mjs`
- 导入脚本：`scripts/import-checklist-draft.mjs`（已修复本地/VPS 兼容）
- 永远只生成 draft，不自动 published
- 所有 draft 必须经过人工审核后才由 Admin 发布

## v1.20.42.6.29 Batch Draft Trial

- 已生成 3 个真实 draft：
  1. `student-first-abroad-packing-checklist` — 留学生行李清单（5 sections, 20 items, 5 FAQ, 5 pitfalls）
  2. `first-shipping-checklist` — 集运新手清单（5 sections, 20 items, 5 FAQ, 5 pitfalls）
  3. `toronto-rental-viewing-checklist` — 多伦多租房避坑（5 sections, 20 items, 5 FAQ, 5 pitfalls）
- Validator 规则修正：sections>=3, items>=10, faq>=5, pitfalls>=5(error), tools>=3, officialLinks>=2+needsReview
- 所有 draft 已导入 LandingPage，status 全部为 draft
- draft 页面返回 404，不进入 sitemap
- Git 文件内容本地/VPS 完全一致（MD5 校验通过）
