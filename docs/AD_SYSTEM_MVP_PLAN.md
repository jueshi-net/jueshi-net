# Ad System MVP Planning & v1.20.42.6.14 Integrity Check

> **Generated**: 2026-06-08
> **Version**: v1.20.42.6.15
> **Status**: 规划完成，零代码变更

---

## 1. v1.20.42.6.14 完整性复核结论

### 1.1 Commit 审计
- `8ab834f` (v1.20.42.6.14: Landing Page & Ad Inventory Blueprint MVP)
  - 新增 11 文件：Prisma schema (+49行), Admin 页面/API (+802行), 导航更新
  - **关键发现**: `prisma/schema.prisma` 已包含 AdPlacement / LandingPage 模型，但 **未提交对应 migration SQL 文件**。
- `905c2f8` (v1.20.42.6.14: Update docs)
  - 更新 2 文档：MONETIZATION_IA.md, PROJECT_MEMORY.md

### 1.2 Prisma Schema 与 Migration 复核
- ✅ Schema 包含 `AdPlacement` (19 字段) 和 `LandingPage` (18 字段)
- ❌ **Migration 缺失**: `prisma/migrations/` 仅 18 个目录，无 AdPlacement/LandingPage 对应 SQL。
- ⚠️ `_prisma_migrations` 表有 25 条记录 (DB 实际状态)，含多条未提交迁移。
- ✅ `prisma migrate status` 报告 "Database schema is up to date!" (因 Prisma 7 仅对比 schema vs DB)

### 1.3 生产 DB 表复核
- ✅ `ad_placements` 表存在，**19 条种子数据** 完整入库
- ✅ `landing_pages` 表存在，0 条记录 (仅后台)
- ✅ 表结构完全匹配 schema 定义

### 1.4 Admin 页面回归
- ✅ `/admin/ad-placements`: CRUD 完整，筛选/搜索/状态切换正常
- ✅ `/admin/landing-pages`: CRUD 完整，状态切换/关联配置正常
- ✅ Admin 导航: 23 项 (grep 确认)
- ✅ 非 Admin 拦截: 返回 307 跳转 `/login`

### 1.5 安全边界验证
- ✅ 零前台广告渲染
- ✅ 零公开落地页路由 (`/lp/` 不存在)
- ✅ 零敏感信息进入 Git (密码/Key 已排除)

**结论**: v1.20.42.6.14 功能完整可用，但存在 **migration SQL 未提交** 的技术债务，需在后续版本补齐 baseline migration。

---

## 2. AdCampaign 与 AdPlacement 关系规划

### 2.1 当前 AdCampaign 能力审计
| 能力 | 现状 | 说明 |
|---|---|---|
| `placements[]` | 🟡 字符串数组 | 前端硬编码 16 个 placement key |
| UI 配置 | 🟢 多选下拉 | 在 `/admin/ads` 中勾选投放位置 |
| 统计计数 | 🟡 仅计数器 | `impressions` / `clicks` Int 字段，无明细日志 |
| 广告选择逻辑 | 🔴 缺失 | 无前端广告拉取 API |
| 前端组件 | 🔴 缺失 | 无广告渲染组件 |

### 2.2 关系演进建议

| 阶段 | 策略 | 操作 |
|---|---|---|
| **MVP (当前)** | 软关联保留 | 继续保留 `AdCampaign.placements[]`，允许前端写入任意 key。`AdPlacement` 仅作为"合法 key 注册表"供 Admin 参考。 |
| **P1** | 双向引用 | 在 `AdCampaign` 新增 `placementKeys: String[]` 与 `AdPlacement.key` 软关联。前端 UI 从硬编码改为读取 `AdPlacement` 列表。 |
| **P2** | 规范关系表 | 新增 `AdCampaignPlacement` 中间表 (campaignId + placementKey + priority + enabled)，替代 `placements[]` 数组。 |
| **迁移策略** | 渐进式 | 保持 `placements[]` 向后兼容，新增中间表后同步写入，验证无误后废弃数组字段。 |

**决策**: MVP 阶段 **A + B + C**。保留现有字段，不做强外键，避免破坏现有广告活动。

---

## 3. AdCreative 素材库 MVP 规划

### 3.1 数据模型建议

```prisma
model AdCreative {
  id          String   @id @default(cuid())
  campaignId  String   @map("campaign_id")
  title       String   // 内部备注，如"夏季促销-横幅A"
  creativeType String  @map("creative_type") // image / html / text / native
  imageUrl    String?  @map("image_url")
  targetUrl   String?  @map("target_url")
  codeSnippet String?  @map("code_snippet") @db.Text
  headline    String?  // 文案标题
  bodyText    String?  @map("body_text") @db.Text
  ctaText     String?  @map("cta_text") // 按钮文案，如"了解更多"
  isActive    Boolean  @default(true) @map("is_active")
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([campaignId])
  @@index([isActive])
  @@map("ad_creatives")
}
```

### 3.2 兼容性设计
- **复用现有字段**: `AdCampaign.imageUrl` / `codeSnippet` 继续可用，视为"默认素材"
- **多素材轮播**: 允许一个 Campaign 关联多个 Creative，前端按 `sortOrder` 轮播展示
- **图片上传**: MVP 复用现有 `upload` 逻辑 (如 Next.js API route + 本地存储/CDN)，不新建上传服务
- **HTML 安全**: `codeSnippet` 仅支持 `<a>`, `<img>`, `<div>`, `<span>`, `<p>`, `<br>`, `<strong>`, `<em>` 标签，过滤 `<script>`, `<iframe>`, `on*` 事件。使用 DOMPurify 或服务器端白名单过滤
- **广告类型映射**:
  - 自营广告: image / text / native
  - 直客广告: image / html (客户提供的定制素材)
  - 程序化广告: html (网盟 JS snippet)

---

## 4. AdEvent 展示/点击日志 MVP 规划

### 4.1 数据模型建议

```prisma
model AdEvent {
  id             String   @id @default(cuid())
  campaignId     String   @map("campaign_id")
  placementKey   String   @map("placement_key")
  creativeId     String?  @map("creative_id")
  eventType      String   @map("event_type") // impression / click
  pageType       String?  @map("page_type") // home / tool / article / ...
  pagePath       String?  @map("page_path") // /tools/tracking
  userId         String?  @map("user_id") // 登录用户
  sessionId      String?  @map("session_id") // 匿名用户标识
  country        String?  // 2-letter code
  device         String?  // desktop / mobile / tablet
  referrer       String?  @db.Text
  userAgentHash  String?  @map("user_agent_hash") // SHA-256 hash, 不存明文
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamp(6)

  @@index([campaignId, createdAt])
  @@index([placementKey, eventType, createdAt])
  @@index([userId, createdAt])
  @@index([createdAt])
  @@map("ad_events")
}
```

### 4.2 安全与隐私
- **不记录敏感个人信息**: 不存 IP、邮箱、完整 User-Agent
- **IP 脱敏**: 如需记录，存前两段 `192.168.x.x` 或 SHA-256 hash
- **User-Agent**: 仅存 hash，用于防刷检测，不反查设备
- **聚合策略**: 每日定时 job 将 `AdEvent` 聚合到 `AdCampaign.impressions/clicks` 计数器

### 4.3 数据保留与清理
- **原始日志**: 保留 90 天
- **聚合数据**: 保留永久 (写入 `AdCampaign` 计数器 + 月度统计表)
- **清理策略**: 定时 cron job `DELETE FROM ad_events WHERE created_at < NOW() - INTERVAL '90 days'`

---

## 5. AdRule 投放规则 MVP 规划

### 5.1 MVP 轻规则 (先做)

| 规则 | 实现方式 | 说明 |
|---|---|---|
| Campaign Active | `WHERE isActive = true` | 基础开关 |
| Date Range | `WHERE startDate <= NOW() AND (endDate IS NULL OR endDate >= NOW())` | 时间控制 |
| Placement Match | `WHERE placementKey = ANY(placements)` | 投放位匹配 |
| Priority | `ORDER BY priority DESC` | 多广告竞争时优先展示 |
| PageType | 前端路由判断 | 仅在指定页面类型渲染 |
| Country | 前端/边缘判断 | 根据 GeoIP 或用户设置过滤 |
| Device | 前端 UA 判断 | desktop / mobile 分离投放 |
| UserType | 前端 session 判断 | guest / logged_in / member |

### 5.2 暂缓规则 (P2+)
- Frequency cap (同用户每日可见次数上限)
- 预算控制 (每日/总预算耗尽自动下线)
- A/B 测试分流
- 智能出价

**决策**: MVP 只做 8 条轻规则，全部在**广告拉取 API** 层完成过滤，前端无需规则逻辑。

---

## 6. 安全前台广告渲染规划

### 6.1 首批安全广告位

| 广告位 Key | 位置 | 理由 |
|---|---|---|
| `article.footer_recommend` | 文章页底部推荐区 | 阅读完成后展示，不打断阅读 |
| `landing.block_between` | 落地页内容区块间 | 自然内容流中插入，视觉连贯 |
| `tool.footer_banner` | 工具页底部通栏 | 工具操作完成后展示，零干扰 |

### 6.2 暂不进入的页面/区域 🔴

| 区域 | 理由 |
|---|---|
| 工具表单中间 | 破坏核心操作流 |
| 工具结果核心区域上方 | 干扰用户查看关键结果 |
| 工作台核心区域 | 用户生产力工具，零容忍广告 |
| 登录/注册页 | 降低转化率 |
| Admin 后台 | 运营工具，不应有广告 |
| Quote Sheet 编辑区 | 核心付费转化路径 |

### 6.3 渲染规范

- **预留高度**: 桌面端 280px，移动端 200px，避免 CLS (Cumulative Layout Shift)
- **广告标识**: 右上角固定 "广告 / Sponsored" 标签 (灰色小字，opacity-60)
- **移动端规则**: 全屏宽度卡片式，不得浮层/弹窗
- **会员策略**: 未来 `isPremium=true` 用户减少 50% 广告或替换为"推荐工具"原生卡片
- **防误点**: 广告区域与操作按钮保持 8px 以上间距，按钮样式与广告明显区分
- **失败处理**: 广告加载失败时静默隐藏 (display: none)，不显示空白占位/错误提示

---

## 7. MVP 实施顺序

1. **P0**: 补齐 `AdPlacement` / `LandingPage` migration SQL 文件 (技术债务)
2. **P0**: 创建 `AdCreative` 模型与 Admin 管理页
3. **P0**: 增强 `/admin/ads` 关联 AdPlacement 注册表
4. **P1**: 创建广告拉取 API (`GET /api/ads?placement=...`)
5. **P1**: 创建 `AdEvent` 模型与 impression/click 埋点 API
6. **P2**: 前台广告组件 (`<AdSlot placementKey="..." />`)
7. **P2**: 首批 3 个安全广告位前端渲染
8. **P3**: AdRule 规则引擎与定时聚合 Job

---

## 8. 不破坏规则

1. `AdCampaign.placements[]` 字符串数组在 P2 阶段前**不得删除**
2. 前台广告组件首次上线必须**默认 disabled**，通过 Admin 开关逐步放量
3. 所有新增 Prisma migration 必须先 `diff` 审计，确认无 `DROP` / `ALTER COLUMN TYPE` 破坏性操作
4. 广告系统代码不得混入 `(workspace)` / `(public)/tools` 核心业务目录
5. `AdEvent` 日志表清理 job 不得影响 `AdCampaign.impressions/clicks` 聚合计数器
