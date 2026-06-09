# Checklist Content MVP Planning + Data Shape

> **版本：** v1.20.42.6.23
> **日期：** 2026-06-09
> **状态：** 📋 规划阶段，MVP 页面暂未开发
> **本轮边界：** 仅规划与文档化，不开发前台页面，不新增 migration

---

## 1. 定位

Checklist（清单）是**可执行的操作步骤列表**，不是普通文章。

| 维度 | 专题 (Topic) | 清单 (Checklist) | 文章 (Article) | 落地页 (LandingPage) |
|---|---|---|---|---|
| **定位** | 宏观入口、知识地图 | 行动步骤、核对列表 | 经验总结、教程 | 场景转化、单用途页 |
| **用户意图** | "我想了解这个方向" | "我要照着做" | "我想学某个知识点" | "我需要解决某件事" |
| **交互形态** | 浏览、跳转 | 勾选、打勾、进度条 | 阅读 | 填写、下载 |
| **内容长度** | 3000-5000字+ | 1000-3000字+步骤 | 800-3000字 | 500-2000字 |
| **工具绑定** | 间接（指向专题内工具） | 强绑定（每步对应工具） | 偶尔（底部推荐） | 弱绑定（主工具推荐） |
| **SEO意图** | 宽泛（"跨境电商指南"） | 具体（"Shopify开店清单"） | 中长尾 | 长尾/转化型 |
| **更新频率** | 低频 | 高频（政策变化时） | 中频 | 低频 |

---

## 2. 现有模型复用审计

### 2.1 Article
- **复用难度：** 高。Article 只有 `content` (markdown) 字段，没有结构化清单步骤。
- **判断：** ❌ 不可复用。清单需要 `checklistItems[]` 结构化数据，不适合塞进 markdown。

### 2.2 Topic + TopicItem
- **复用难度：** 中。Topic 是"专题"，TopicItem 是专题下的条目（工具/资源）。
- **判断：** ❌ 不可复用。Topic 是"目录"概念，不是"行动步骤"。

### 2.3 LandingPage
- **复用难度：** 中高。LandingPage 有 `pageType` 字段和 `faqItems`/`officialLinks` 等 JSON 字段。
- **判断：** ⚠️ MVP 阶段可以借用 `pageType="checklist"` + 新增 JSON 字段承载清单步骤，但 LandingPage 的语义是"单页转化"，与清单的"多步执行"语义不同。

### 2.4 结论
- **MVP 阶段：** ✅ 复用 `LandingPage` 模型，通过 `pageType="checklist"` 扩展。新增的清单步骤数据存在 `heroSection` 或新增 JSON 字段中（本轮不新增 migration，用现有 JSON 字段承载）。
- **长期：** 需要独立 `Checklist` + `ChecklistItem` 模型。

---

## 3. MVP 数据模型规划

### 3.1 基础字段 (LandingPage 已有)

| 字段 | 类型 | 说明 | 状态 |
|---|---|---|---|
| `slug` | String | URL slug | ✅ 已有 |
| `title` | String | 清单标题 | ✅ 已有 |
| `seoTitle` | String? | SEO 标题 | ✅ 已有 |
| `seoDescription` | String? | SEO 描述 | ✅ 已有 |
| `status` | String | draft/published/hidden | ✅ 已有 |
| `pageType` | String | 固定为 `checklist` | ✅ 已有 |
| `heroSection` | Json? | Hero 区（标题、副标题、CTA） | ✅ 已有 |
| `faqItems` | Json? | FAQ 列表 | ✅ 已有 |
| `officialLinks` | Json? | 官方链接 | ✅ 已有 |
| `ctaConfig` | Json? | CTA 配置 | ✅ 已有 |
| `relatedTools` | String[] | 关联工具 slugs | ✅ 已有 |
| `relatedTopics` | String[] | 关联专题 slugs | ✅ 已有 |
| `relatedArticles` | String[] | 关联文章 slugs | ✅ 已有 |

### 3.2 新增字段 (MVP 存 JSON)

以下字段在 MVP 阶段通过现有 JSON 字段承载，不新增 migration：

| 目标字段 | 承载方式 | 数据结构 |
|---|---|---|
| `checklistType` | `heroSection.type` | `student`/`shipping`/`city`/`ecommerce`/`travel`/`life` |
| `audience` | `heroSection.audience` | string, 如 "跨境电商卖家" |
| `region` | `heroSection.region` | string, 如 "美国" |
| `city` | `heroSection.city` | string, 如 "洛杉矶" |
| `scenario` | `heroSection.scenario` | string, 如 "首次开店" |
| `difficulty` | `heroSection.difficulty` | `easy`/`medium`/`hard` |
| `estimatedTime` | `heroSection.estimatedTime` | string, 如 "2-3小时" |
| `summary` | `heroSection.summary` | string, 清单简介 |
| `quickAnswer` | `heroSection.quickAnswer` | string, 快速答案 |
| `checklistItems` | 存 `heroSection` 的 `items` 字段 | 数组，结构见下 |
| `sections` | 存 `heroSection` 的 `sections` 字段 | 分组数组 |
| `avoidPitfalls` | `heroSection.pitfalls` | 避坑提醒数组 |
| `nextSteps` | `heroSection.nextSteps` | 下一步建议 |
| `lastReviewedAt` | `heroSection.lastReviewedAt` | ISO 日期字符串 |

### 3.3 ChecklistItem 数据结构

```typescript
interface ChecklistItem {
  id: string;              // 唯一 ID
  title: string;           // 步骤标题
  description?: string;    // 详细说明
  category?: string;       // 所属分组（如"注册阶段"）
  required: boolean;       // 是否必做
  priority: "high" | "medium" | "low";  // 优先级
  timing?: string;         // 时机（如"开店前"、"发货后"）
  warning?: string;        // 警告提示
  relatedToolSlug?: string; // 关联工具
  officialLink?: { label: string; url: string; }; // 官方链接
  completedDefault: boolean; // 默认是否勾选
}
```

### 3.4 Section 数据结构

```typescript
interface Section {
  id: string;
  title: string;           // 分组标题（如"一、注册阶段"）
  description?: string;    // 分组说明
  items: ChecklistItem[];  // 该分组下的清单项
}
```

---

## 4. Checklist 页面模板规划（本轮不开发）

### 4.1 模块顺序

1. **Hero 区** — 标题、副标题、适用人群徽章、预估时间
2. **进度条** — 已勾选数 / 总项数（本地存储）
3. **快速答案** — 一句话核心结论（如有）
4. **分组核对列表** — 按 Section 展开，每组可折叠
   - 必做项（红色标记）
   - 可选项（灰色标记）
   - 不建议项（黄色警告）
5. **避坑提醒** — 卡片式警告框
6. **相关工具** — 工具卡片列表（绑定相关工具）
7. **相关专题** — 专题入口卡片
8. **相关文章** — 文章卡片
9. **官方链接** — 官方入口列表
10. **FAQ** — 折叠式问答
11. **下一步** — 推荐后续清单
12. **CTA** — 行动号召（注册/收藏/分享）
13. **最后更新** — `lastReviewedAt` 时间戳

### 4.2 交互要求

- 每个 ChecklistItem 可勾选（本地 localStorage 持久化）
- 进度条实时更新
- Section 可折叠/展开
- 移动端优先，勾选区域必须 ≥ 44px
- 勾选状态不跨设备同步（MVP 阶段）

### 4.3 内容红线

- ❌ 不编造签证政策、海关规则、航空公司规定
- ✅ 政策相关内容必须标注 `[需人工核验]`
- ✅ 官方链接占位必须存在
- ✅ 每个步骤尽量绑定站内工具

---

## 5. SEO 与内链规则

### 5.1 收录规则

1. 每个清单只能对应**一个主搜索意图**，不与专题抢同一关键词。
2. `status=published` 才可被搜索引擎索引。
3. `draft/hidden` 不进 sitemap，返回 404。
4. 测试清单（`slug` 含 `test-`）必须 `hidden`，不进 sitemap。
5. 清单页必须回链所属专题（内链回指）。
6. 清单项中的工具必须链接到站内工具页。
7. 底部推荐必须链接"下一步清单"。
8. 锚文本必须具体描述目标（如 "Shopify 注册教程" 而非 "点击这里"）。
9. 清单页必须显示 `lastReviewedAt` 更新日期。
10. 不与 LandingPage 的转化意图冲突（清单偏信息，LandingPage 偏行动）。

### 5.2 内链拓扑

```
专题 (Topic) → 清单 (Checklist) → 工具 (Tool)
     ↕               ↓                ↓
   文章 (Article) ← 步骤关联 ← 工具详情页
```

---

## 6. Hermes ContentOps 输入格式

### 6.1 输入模板

Hermes 生成清单 draft 时使用以下 YAML 输入格式：

```yaml
type: checklist
title: "美国留学生活行前清单"
audience: "留学生"
region: "美国"
city: ""
scenario: "首次出国"
primary_intent: "留学生出国前需要办理哪些手续、准备哪些物品"
difficulty: medium
estimated_time: "2-3小时"
sections:
  - title: "证件与文件"
    items:
      - title: "办理护照"
        description: ""
        required: true
        priority: high
        timing: "出发前1-2个月"
        warning: ""
        related_tool_slug: ""
        official_link: { label: "国家移民管理局", url: "https://www.nia.gov.cn/" }
      - title: "申请签证"
        description: ""
        required: true
        priority: high
        timing: "拿到offer后"
        warning: "[需人工核验] 签证类型和材料清单可能随政策变化"
        related_tool_slug: ""
        official_link: { label: "美国驻华大使馆", url: "https://www.ustraveldocs.com/cn/" }
  - title: "住宿安排"
    items:
      - title: "确定住宿方式"
        description: "宿舍/校外租房/寄宿家庭"
        required: true
        priority: high
        timing: "出发前1个月"
        warning: ""
        related_tool_slug: ""
        official_link: {}
related_tools: ["passport-info", "visa-guide"]
related_topics: ["留学美国"]
related_articles: []
official_links_needed: ["签证申请", "I-20表格", "体检证明"]
pitfalls:
  - "不要等到最后一周才办签证"
  - "确认学校提供的住宿截止日期"
faq_questions:
  - "留学生需要带哪些公证文件？"
  - "机票什么时候买最便宜？"
next_steps: ["美国留学生活入境清单", "海外租房避坑指南"]
publish_mode: draft  # 永远只能是 draft
requires_human_review: true
```

### 6.2 生成约束

1. **Hermes 只能生成 `publish_mode: draft`**，不允许直接 `published`。
2. 必须输出完整的 YAML metadata。
3. 必须输出 `internal_links`（专题→工具→文章的回链关系）。
4. 必须输出 FAQ（至少 3 个常见问题）。
5. 必须输出官方链接占位（即使 URL 暂时为空）。
6. 对政策、法律、签证、海关、医疗等高风险内容，**必须**加 `[需人工核验]` 标记。
7. 不编造任何官方数据、政策细节、费用金额。
8. 生成的 `slug` 必须符合 `audience-region-scenario-checklist` 格式。
9. `estimated_time` 和 `difficulty` 必须合理，不夸大。
10. 每个 Section 至少包含 3 个 ChecklistItem。

---

## 7. 后续实施路径

| 阶段 | 目标 | 预计工作量 |
|---|---|---|
| **MVP (本轮规划)** | 数据模型、页面模板、SEO 规则、Hermes 输入格式 | ✅ 完成 |
| **Phase 1: Admin 清单编辑** | 在 Admin 中新增"清单编辑"视图，支持 ChecklistItem CRUD | ~3天 |
| **Phase 2: 前台模板** | 实现 `/checklists/[slug]` 公开页面 + 交互 | ~4天 |
| **Phase 3: Hermes 生成** | ContentOps skill 生成清单 draft | ~2天 |
| **Phase 4: 独立模型** | 从 LandingPage 拆分出独立 Checklist 模型 | ~2天 |

---

## 8. 本轮禁止事项确认

- ✅ **未开发清单前台页面**
- ✅ **未新增数据库 migration**
- ✅ **未使用 prisma db push**
- ✅ **未批量生成 SEO 页面**
- ✅ **未扩大广告位**
- ✅ **未修改 Quote Sheet**
- ✅ **未修改 Auth**
- ✅ **未重写 Workspace**
- ✅ **未恢复 src/app/admin 旧目录**
- ✅ **未接入第三方广告脚本**
- ✅ **未让 Hermes 自动直接发布 published 内容**
