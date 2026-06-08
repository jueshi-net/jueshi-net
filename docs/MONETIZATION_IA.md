# Admin Monetization IA — 信息架构规划

> **归档日期**: 2026-06-08
> **版本**: v1.20.42.6.13
> **状态**: 规划中，本轮零代码变更

---

## 1. 现有 Admin 变现能力审计

| 页面/模块 | 状态 | 当前能做什么 | 数据模型 | API 路由 | 广告位/素材/统计 | 关联能力 |
|---|---|---|---|---|---|---|
| `/admin/ads` | 🟢 完整 | 创建/编辑/删除广告活动，配置直投图片/网盟代码，设置投放位置列表(`placements`)，定向国家，优先级，起止时间 | `AdCampaign` | `/api/admin/ads` (内置) | ✅ 素材(`imageUrl`), ✅ 投放位(`placements[]`), ✅ 统计(`impressions`/`clicks`) | 无页面级关联 |
| `/admin/analytics` | 🟡 基础 | 展示用户/链接/文章/反馈等总量概览，热门分类，热门链接 | 聚合查询 | `/api/admin/analytics` | ❌ 无广告统计 | 无 |
| `/admin/topics` | 🟢 完整 | 专题 CRUD，APP 评级清单，YouTube 视频关联 | `Topic`, `TopicItem`, `TopicSection` | `/api/admin/topics` | ❌ 无广告位 | 支持 section/item 关联 |
| `/admin/cms` | 🟢 完整 | 文章 CRUD，Markdown 编辑器，分类，标签，关联工具(`relatedTools`) | `Article`, `ArticleTag` | `/api/admin/cms` | ❌ 无广告位 | ✅ 关联工具(`relatedTools[]`) |
| `/admin/resources` | 🟢 完整 | 资源库管理，分类，质量评分，AI 爬取状态 | `Resource` | `/api/admin/resources` | ❌ 无广告位 | `Resource` 本身是广告载体 |
| `/admin/links` | 🟢 完整 | 网址导航 CRUD，批量导入导出，分类 | `LinkItem`, `Category` | `/api/admin/links` | ❌ 无广告位 | `LinkItem.isFeatured`/`isPinned` |
| `/admin/homepage` | 🟡 隐藏 | 首页运营配置 | `HomepageConfig` | `/api/admin/homepage` | ❌ 无广告位 | 配置首页模块开关 |
| `/admin/settings` | 🟢 基础 | 站点名称/描述，注册开关，维护模式，邮件服务 | `HomepageConfig`(部分) | `/api/admin/settings` | ❌ | 全局开关 |

**结论：**
- 广告系统已有最小可用底座 (`AdCampaign` 表 + `/admin/ads` UI)
- 支持直投/网盟双模式，支持投放位置列表和优先级
- **缺失：** 无独立广告位管理、无广告素材库、无展示/点击日志表、无页面级关联配置

---

## 2. 落地页配置 IA

### 2.1 页面结构定义

```yaml
LandingPage:
  id: cuid
  slug: string (unique)          # 路由 /lp/[slug]
  title: string                   # 页面标题
  seoTitle: string?               # SEO 标题
  seoDescription: string?         # SEO 描述
  pageType: enum                  # country / tool / topic / guide
  status: enum                    # draft / published / hidden
  
  # 内容模块
  heroSection:
    title: string
    subtitle: string?
    ctaText: string               # CTA 按钮文案
    ctaUrl: string                # CTA 跳转链接
    backgroundImage: string?
  
  # 关联内容
  primaryTool: string?            # 主工具 slug
  relatedTools: string[]          # 相关工具 slugs
  relatedTopics: string[]         # 相关专题 slugs
  relatedArticles: string[]       # 相关文章 slugs
  faqItems:                       # FAQ 列表
    - question: string
      answer: string
  officialLinks:                  # 官方链接
    - label: string
      url: string
      icon: string?
  
  # 广告配置
  adPlacements:
    - placementKey: string        # hero-bottom / content-mid / result-bottom / footer
      enabled: boolean
      campaignIds: string[]       # 允许投放的广告活动 ID
  
  # 元数据
  createdAt: DateTime
  updatedAt: DateTime
  publishedAt: DateTime?
```

### 2.2 数据模型策略

| 字段/模块 | 策略 | 说明 |
|---|---|---|
| `slug`, `title`, `seoTitle`, `seoDescription` | **新增模型** `LandingPage` | 核心页面标识 |
| `pageType`, `status` | **新增模型** | 页面类型与发布状态 |
| `heroSection` | **JSON 字段** 过渡 | 结构相对固定，用 `Json` 列存储 |
| `relatedTools`/`relatedTopics`/`relatedArticles` | **复用现有** | 工具用 `Tool.slug`，专题用 `Topic.slug`，文章用 `Article.slug` |
| `faqItems`, `officialLinks` | **JSON 字段** | 列表型配置适合 JSON |
| `adPlacements` | **JSON 字段** 过渡 | 记录 `placementKey` + `enabled` + `campaignIds` |
| CTA 配置 | **复用现有** | 可复用 `HomepageConfig` 模式或直接存 JSON |

### 2.3 依赖前置条件

- ✅ `Tool` 模型已有 (`slug`, `name`, `route`)
- ✅ `Topic` 模型已有 (`slug`, `title`, `status`)
- ✅ `Article` 模型已有 (`slug`, `title`, `status`)
- ⚠️ **文章系统需完善**：当前 CMS 无富文本封面图/摘要优化，建议先补全
- ⚠️ **落地页路由**：需新增 `/lp/[slug]` 页面模板

---

## 3. 广告库存系统 IA

### 3.1 分层架构

```
AdPlacement (广告位)
  ↓ 1:N
AdCampaign (广告活动)
  ↓ 1:N
AdCreative (广告素材)
  ↓ 1:N
AdEvent (展示/点击日志)
  
AdRule (投放规则) → 关联 Placement + Campaign
```

### 3.2 模型定义建议

| 模型 | 用途 | 已有/新增 |
|---|---|---|
| `AdPlacement` | 广告位定义 (首页首屏/工具页右侧/文章页正文中等) | **新增** |
| `AdCampaign` | 广告活动 (已有) | 🟢 已有 (`AdCampaign`) |
| `AdCreative` | 素材库 (图片/代码/文案)，支持一个活动多素材轮播 | **新增** |
| `AdRule` | 投放规则 (时间/地域/设备/用户类型过滤) | **新增** |
| `AdEvent` | 展示/点击日志 (impression/click, userId?, ip, userAgent, timestamp) | **新增** |

### 3.3 各页面广告位规划

| 页面类型 | 建议广告区域 | 广告类型建议 | 干扰等级 |
|---|---|---|---|
| **首页** | 首屏下方横幅、中部卡片推荐、底部通栏 | 自营 / 直客 | 中 |
| **工具页** | 结果区下方推荐、右侧栏(桌面)、底部横幅 | 自营(相关工具) / 直客 | 低(工具操作区不加广告) |
| **文章页** | 正文中插入(每 3 段)、右侧栏、底部推荐 | 程序化 / 自营 | 中 |
| **专题页** | 专题项之间插入、底部推荐区 | 自营(相关专题) / 直客 | 低 |
| **落地页** | Hero 下方、内容区块之间、CTA 旁 | 直客 / 自营 | 高(需控制密度) |
| **黄页页** | 商家列表顶部、详情页侧栏 | 直客(认证商家) | 中 |
| **任务链页** | 链步骤之间、完成页推荐 | 自营(引导下一步) | 低 |
| **工作台** | 轻量推荐卡片(非打断式) | 自营(内部工具引导) | 极低 |

### 3.4 广告类型适配

| 类型 | 适合位置 | 说明 |
|---|---|---|
| **程序化广告** | 文章页正文、首页通栏、落地页底部 | Google Adsense 等，自动填充 |
| **自营广告** | 工具页推荐位、专题项间、工作台 | 推广自家工具/专题/文章 |
| **直客广告** | 首页首屏、落地页 Hero 下、黄页顶部 | 品牌客户独占位，高价 |

---

## 4. Admin 未来分组蓝图

> ⚠️ 本轮不修改现有 21 项导航，仅输出规划蓝图。

### 4.1 建议新增分组

| 分组名 | 导航项 | 状态 | 说明 |
|---|---|---|---|
| **首页与落地页** | 首页运营、落地页管理 | 🟡 已有 `/admin/homepage` | 首页配置已存在，落地页需新开发 |
| **内容与关联** | 内容块管理、相关文章/工具/专题配置 | 🟡 部分已有 | 文章/专题已有，关联配置需新页面 |
| **广告与变现** | 广告位管理、广告素材管理、广告活动管理、广告统计 | 🟢 广告活动已有 | `/admin/ads` 已实现活动管理，缺素材/位/统计 |
| **任务与成长** | 任务链管理、等级/勋章/信用 | 🟢 等级/勋章已有 | `/admin/levels` 已存在，任务链需新开发 |
| **黄页与商家** | 黄页/商家审核 | 🔴 缺失 | 需全新开发 |

### 4.2 MVP 优先级排序

| 优先级 | 模块 | 理由 | 预计工作量 |
|---|---|---|---|
| **P0** | 广告位管理 (`AdPlacement`) | 完善现有广告系统底座，无需前端渲染变更 | 1-2 天 |
| **P0** | 落地页基础模型 (`LandingPage`) | 支撑 pSEO 与商业化，JSON 配置过渡 | 2-3 天 |
| **P1** | 广告素材管理 (`AdCreative`) | 解耦素材与活动，支持轮播 | 1-2 天 |
| **P1** | 文章关联工具增强 | CMS 已有 `relatedTools`，需 UI 暴露 | 0.5 天 |
| **P2** | 广告统计日志 (`AdEvent`) | 需前端埋点 + 后端日志表 | 2-3 天 |
| **P2** | 落地页前端模板 | 需设计 `/lp/[slug]` 页面 | 2-3 天 |
| **P3** | 任务链引擎 | 复杂状态机，长期规划 | 5+ 天 |
| **P3** | 黄页/商家系统 | 涉及商户审核、信用分，长期规划 | 5+ 天 |

---

## 5. 不破坏规则

1. 新增 `AdPlacement` / `AdCreative` / `AdEvent` / `LandingPage` 模型时，**只允许 ADD，禁止 DROP** 现有字段。
2. 广告系统升级不得破坏现有 `/admin/ads` 页面，只能增量增强。
3. 落地页系统不得影响现有专题/文章/工具路由。
4. 所有新增 Prisma migration 必须先经过审计并用户确认后方可执行。
5. 广告位配置变更不得影响工具核心操作区域。



---

## 7. v1.20.42.6.14 实际落地情况

### 7.1 已实现的模型

**AdPlacement (广告位)**
```prisma
model AdPlacement {
  id          String   @id @default(cuid())
  key         String   @unique
  name        String
  pageType    String   // home / tool / article / topic / landing / yellowpage / task / workspace
  zone        String   // hero_below / sidebar / result_below / content_mid / footer / native_card
  device      String   @default("all") // all / desktop / mobile
  description String?
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime
  updatedAt   DateTime
}
```

**LandingPage (落地页配置)**
```prisma
model LandingPage {
  id               String   @id @default(cuid())
  slug             String   @unique
  title            String
  seoTitle         String?
  seoDescription   String?  @db.Text
  pageType         String   // country / tool / topic / guide / city / postal / landing
  status           String   @default("draft") // draft / published / hidden
  heroSection      Json?
  primaryTool      String?
  relatedTools     String[]
  relatedTopics    String[]
  relatedArticles  String[]
  faqItems         Json?
  officialLinks    Json?
  adPlacements     Json?
  ctaConfig        Json?
  createdAt        DateTime
  updatedAt        DateTime
  publishedAt      DateTime?
}
```

### 7.2 已创建的 Admin 路由

| 路由 | 类型 | 功能 |
|---|---|---|
| `/admin/ad-placements` | 页面 | 广告位列表/新建/编辑/启用停用/搜索/筛选 |
| `/admin/landing-pages` | 页面 | 落地页列表/新建/编辑/状态切换/搜索/筛选 |
| `/api/admin/ad-placements` | API | GET 列表 (支持 pageType/device/search/isActive 筛选), POST 创建 |
| `/api/admin/ad-placements/[id]` | API | PUT 更新, DELETE 删除 |
| `/api/admin/landing-pages` | API | GET 列表 (支持 pageType/status/search 筛选), POST 创建 |
| `/api/admin/landing-pages/[id]` | API | PUT 更新 (含状态切换/发布时自动设置 publishedAt), DELETE 删除 |

### 7.3 Admin 导航变更

- 原 5 组 21 项 → 现 5 组 **23 项**
- 新增: "落地页管理" → 内容与资源分组
- 新增: "广告位管理" → 广告与数据分组

### 7.4 仍未实现

| 模块 | 状态 | 说明 |
|---|---|---|
| AdCreative (素材库) | 🔴 未实现 | 长期规划 |
| AdEvent (展示/点击日志) | 🔴 未实现 | 需前端埋点 |
| AdRule (投放规则) | 🔴 未实现 | 长期规划 |
| 前台广告渲染 | 🔴 未实现 | **本轮禁止** |
| 公开落地页渲染 | 🔴 未实现 | 仅后台配置 |
| 基础广告位种子 | ✅ 已执行 | 19 个广告位已写入生产 DB (幂等) |

---

## 8. 下一阶段建议

**推荐进入 `Landing Page & Ad Inventory Blueprint MVP` (v1.20.42.6.14)：**
1. 新增 `AdPlacement` 模型与 Admin 管理页
2. 新增 `LandingPage` 模型 (JSON 配置过渡) 与 Admin CRUD
3. 增强 `/admin/ads` 关联广告位
4. 零前端渲染变更，纯 Admin 后台增强
