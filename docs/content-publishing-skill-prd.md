# 内容发布技能 / 内容增长引擎 — 产品需求文档 (PRD)

**版本:** v1.0  
**日期:** 2026-06-30  
**作者:** Hermes Agent  
**状态:** 待审核

---

## 1. 产品名称

**中文名称:** 绝世百宝箱内容增长引擎  
**英文名称:** Jueshi Content Growth Engine  
**内部代号:** ContentForge

---

## 2. 产品定位

为 jueshi.net / 绝世百宝箱平台提供 AI 辅助内容生产、SEO/GEO 优化、人工审核、定时发布、视频分发的全链路内容增长系统。

**核心价值:**
- 将粗略选题转化为高质量、SEO 友好的结构化内容
- 半自动工作流：AI 生成 + 人工确认 + 定时发布
- 一次创作，多平台分发（网页 + YouTube + Shorts + TikTok + Bilibili）
- 内容资产沉淀，持续带来搜索流量

---

## 3. 使用对象

| 角色 | 职责 | 权限 |
|------|------|------|
| **站长/运营** | 选题规划、内容审核、发布决策 | 完整权限 |
| **内容编辑** | 粗稿输入、内容修改、质量把控 | 创建/编辑草稿 |
| **AI Agent** | 内容生成、SEO 优化、结构化处理 | 生成草稿、建议优化 |
| **SEO 专员** | 关键词研究、SEO 评分、排名监控 | 查看 SEO 数据 |

---

## 4. 核心目标

### 4.1 业务目标

1. **内容产出效率提升 3x** — 从选题到发布从 3 天缩短到 1 天
2. **SEO 流量增长 200%** — 6 个月内有机搜索流量翻倍
3. **内容质量一致性** — 所有内容达到 80+ 质量评分
4. **多平台覆盖** — 每篇内容自动生成视频脚本，覆盖 3+ 平台

### 4.2 技术目标

1. **半自动工作流** — AI 生成草稿，人工确认发布
2. **SEO/GEO 内置** — 每篇内容自动优化搜索意图和地理定位
3. **结构化数据** — 自动生成 JSON-LD，提升富摘要展示率
4. **内容资产化** — 内链网络、标签体系、关联推荐

---

## 5. 内容类型

### 5.1 专题 (Topics)

**定义:** 围绕特定场景/人群的主题聚合页，包含多个子项和章节。

**典型场景:**
- 出海必装 APP 评级
- 留学生活攻略专题
- 跨境电商工具指南

**结构:**
```
Topic
├── 基础信息 (title, slug, summary, cover)
├── SEO 元数据 (seoTitle, seoDescription)
├── 视频资产 (youtubeUrl, youtubeVideoId)
├── TopicItem[] (子项，如 APP 列表)
│   ├── name, rating, category
│   ├── description, analogy
│   ├── officialUrl, riskTip
│   └── suitableFor, beginnerAdvice
└── TopicSection[] (章节，如 FAQ、CTA)
    ├── type (intro/notice/faq/cta)
    └── title, content, sortOrder
```

### 5.2 指南 (Guides)

**定义:** 深度教程/操作指南，解决特定问题。

**典型场景:**
- 如何填写商业发票
- HS 编码查询指南
- 海外邮编查询教程

**结构:**
```
Guide
├── 基础信息 (title, slug, summary, body)
├── 分类标签 (category, tags)
├── SEO 元数据 (seoTitle, seoDescription, canonicalUrl)
├── 关联内容 (relatedTools, relatedTopics, relatedChecklists)
├── 发布控制 (status, publishedAt, sortOrder)
└── 视频脚本 (待新增)
```

### 5.3 清单 (Checklists)

**定义:** 步骤化任务清单，引导用户完成复杂操作。

**典型场景:**
- 跨境发货清单
- 海关申报检查清单
- 留学行前准备清单

**结构:**
```
Checklist
├── 基础信息 (title, slug, summary)
├── 步骤列表 (steps: Json[])
│   ├── title, description
│   ├── completed, optional
│   └── toolLink (关联工具)
├── 关联内容 (relatedTools, relatedTaskChain, relatedGuides)
├── SEO 元数据 (seoTitle, seoDescription, canonicalUrl)
└── 发布控制 (status, publishedAt, sortOrder)
```

---

## 6. 输入字段

### 6.1 粗稿输入 (用户/编辑提供)

```yaml
# 基础信息
title: "2026 年出海必装 APP 推荐"
topic: "海外生活工具"
target_audience: "新移民、留学生"
rough_content: |
  WhatsApp 必备，类似微信。
  Wise 汇款便宜。
  Google Maps 导航好用。
  ...

# SEO 意图
primary_keyword: "海外必装APP"
secondary_keywords: ["出国APP推荐", "留学生APP"]
search_intent: "informational"
target_country: ["CA", "US", "UK", "AU"]

# 视频需求
generate_video_script: true
video_platforms: ["youtube", "shorts", "tiktok"]
video_tone: "friendly, practical"
```

### 6.2 系统自动提取

```yaml
# 关键词分析
extracted_entities: ["WhatsApp", "Wise", "Google Maps"]
related_questions: ["海外用什么聊天软件", "哪个汇款APP便宜"]
search_volume_estimate: 1200

# 内容分类
auto_category: "tools_rating"
auto_tags: ["communication", "finance", "navigation"]

# 内链机会
internal_link_candidates:
  - slug: "exchange-rate"
    relevance: 0.85
  - slug: "postal-code"
    relevance: 0.72
```

---

## 7. 输出字段

### 7.1 结构化内容

```yaml
# SEO 元数据
seo_title: "2026 海外必装 APP 推荐 | 留学生新移民必备 10 款"
seo_description: "精选 10 款海外生活必备 APP：聊天、汇款、导航、购物。真实使用体验，帮你快速适应海外生活。"
canonical_url: "https://jueshi.net/topics/must-have-apps-2026"

# 结构化数据
json_ld:
  "@context": "https://schema.org"
  "@type": "ItemList"
  "name": "海外必装 APP 推荐"
  "itemListElement": [...]

# 内容主体
structured_content:
  hero:
    title: "2026 年海外必装 APP 推荐"
    subtitle: "留学生、新移民必备，帮你快速适应海外生活"
    badges: ["2026 最新版", "实测推荐"]
  
  sections:
    - type: "intro"
      content: "刚到海外，不知道装什么 APP？..."
    
    - type: "rating_list"
      items:
        - name: "WhatsApp"
          rating: "S"
          category: "通讯"
          description: "海外版微信，必备"
          analogy: "就像国内的微信"
          suitableFor: "所有人"
          beginnerAdvice: "注册需要海外手机号"
          officialUrl: "https://whatsapp.com"
          riskTip: "注意隐私设置"
    
    - type: "faq"
      questions:
        - q: "这些 APP 收费吗？"
          a: "大部分免费，部分有高级功能..."
    
    - type: "cta"
      content: "需要汇款？试试我们的汇率工具 →"

# 视频脚本
video_script:
  youtube:
    title: "2026 海外必装 APP 推荐 | 留学生新移民必看"
    duration: "8-10 分钟"
    script: |
      [开场 0:00-0:30]
      刚到海外，不知道装什么 APP？今天推荐 10 款必备神器...
      
      [正文 0:30-8:00]
      第一款：WhatsApp...
      
      [结尾 8:00-10:00]
      以上就是今天的推荐，记得点赞订阅...
    
    thumbnail_prompt: "手机屏幕显示 10 个 APP 图标，背景是世界地图"
  
  shorts:
    title: "海外必装 3 大 APP #shorts"
    duration: "60 秒"
    script: |
      刚到海外？这 3 个 APP 必装！
      1. WhatsApp - 聊天必备
      2. Wise - 汇款最便宜
      3. Google Maps - 导航神器
      关注我，获取更多海外生活技巧！
```

---

## 8. 审核流程

### 8.1 状态机

```
[草稿] draft
  ↓ AI 生成
[待审核] pending_review
  ↓ 编辑审核
[需修改] needs_revision ←→ [待审核] pending_review
  ↓ 审核通过
[已批准] approved
  ↓ 定时发布 / 手动发布
[已发布] published
  ↓ 下架
[已归档] archived
```

### 8.2 审核清单

**SEO 检查:**
- [ ] Title 包含主关键词，60 字符内
- [ ] Description 包含主关键词，160 字符内
- [ ] H1 唯一，包含主关键词
- [ ] H2/H3 结构清晰
- [ ] 内链 ≥ 3 个
- [ ] 外链 ≥ 1 个（权威来源）
- [ ] 图片有 alt 文本
- [ ] URL slug 简洁含关键词

**内容质量:**
- [ ] 无 AI 套话（"在当今社会"、"值得注意的是"）
- [ ] 有独特价值（数据、案例、对比）
- [ ] 段落 ≤ 150 字
- [ ] 有实操步骤
- [ ] FAQ 覆盖 3+ 相关问题

**技术检查:**
- [ ] Canonical URL 正确
- [ ] JSON-LD 结构化数据有效
- [ ] 移动端友好
- [ ] 页面加载 < 3 秒

**视频检查:**
- [ ] 脚本时长符合要求
- [ ] 有明确的 CTA
- [ ] 包含关键词
- [ ] 封面提示词清晰

### 8.3 审核权限

| 操作 | 站长 | 编辑 | AI Agent |
|------|------|------|----------|
| 创建草稿 | ✅ | ✅ | ✅ |
| 编辑草稿 | ✅ | ✅ | ✅ |
| 提交审核 | ✅ | ✅ | ❌ |
| 审核通过 | ✅ | ❌ | ❌ |
| 要求修改 | ✅ | ✅ | ❌ |
| 发布 | ✅ | ❌ | ❌ |
| 定时发布 | ✅ | ❌ | ❌ |
| 下架 | ✅ | ❌ | ❌ |

---

## 9. 定时发布流程

### 9.1 定时发布模型

```yaml
ContentSchedule:
  content_id: "clxyz123"
  scheduled_at: "2026-07-01T10:00:00Z"
  timezone: "America/Toronto"
  status: "scheduled" # scheduled / published / failed
  published_at: null
  retry_count: 0
  created_by: "user_id"
  created_at: "2026-06-30T15:00:00Z"
```

### 9.2 发布任务调度

```
每小时检查一次：
1. 查询 scheduled_at <= now() AND status = 'scheduled'
2. 对每条记录：
   a. 更新 status = 'publishing'
   b. 生成静态页面
   c. 更新 sitemap
   d. 提交 Search Console URL
   e. 更新 status = 'published', published_at = now()
   f. 失败时 retry_count++，最多重试 3 次
```

### 9.3 发布后动作

```yaml
on_publish:
  - update_sitemap: true
  - submit_to_search_console: true
  - generate_social_posts:
      - twitter: "新文章发布：{title} {url}"
      - weibo: "新文章发布：{title} {url}"
  - notify_subscribers: true
  - trigger_video_generation: true
```

---

## 10. SEO/GEO 优化规则

### 10.1 SEO 优化

**Title 优化:**
- 长度：50-60 字符
- 格式：`主关键词 | 次要关键词 - 品牌名`
- 示例：`海外必装 APP 推荐 | 留学生新移民必备 - 绝世百宝箱`

**Description 优化:**
- 长度：150-160 字符
- 包含主关键词 + CTA
- 示例：`精选 10 款海外生活必备 APP：聊天、汇款、导航、购物。真实使用体验，帮你快速适应海外生活。点击查看完整推荐 →`

**内容优化:**
- H1 唯一，包含主关键词
- H2/H3 层级清晰
- 关键词密度 1-2%
- 段落 ≤ 150 字
- 列表/表格增加可读性

**内链优化:**
- 每篇 ≥ 3 个内链
- 锚文本包含关键词
- 关联相关工具/指南/清单

**结构化数据:**
- Article / BlogPosting
- ItemList (专题)
- HowTo (指南)
- FAQPage
- BreadcrumbList

### 10.2 GEO 优化 (Generative Engine Optimization)

**目标:** 优化内容以被 AI 搜索引擎（Google SGE、Bing Chat、Perplexity）引用。

**策略:**

1. **直接回答问题**
   - 在开头 100 字内直接回答标题问题
   - 使用"是/否"、数字、简短定义开头

2. **结构化答案**
   - 使用清晰的 H2/H3 结构
   - 列表/表格呈现对比信息
   - 每个段落聚焦一个问题

3. **权威引用**
   - 引用官方来源（政府网站、权威机构）
   - 提供数据和统计
   - 标注信息来源

4. **FAQ 覆盖**
   - 覆盖 "People Also Ask" 问题
   - 每个 FAQ 直接回答，≤ 100 字
   - 使用结构化数据标记

5. **地理定位**
   - 明确目标国家/地区
   - 提供地区特定信息（如加拿大 vs 美国）
   - 使用当地术语和例子

**GEO 评分标准:**
- 直接回答意图 (30%)
- 结构化清晰度 (25%)
- 权威引用 (20%)
- FAQ 覆盖度 (15%)
- 地理定位准确性 (10%)

---

## 11. 视频分发输出

### 11.1 视频类型

| 类型 | 时长 | 平台 | 用途 |
|------|------|------|------|
| **长视频** | 8-15 分钟 | YouTube | 深度讲解 |
| **短视频** | 30-60 秒 | Shorts/TikTok/Bilibili | 快速 tips |
| **口播稿** | - | 内部使用 | 录制参考 |

### 11.2 视频脚本结构

**长视频 (YouTube):**
```
[开场 Hook] 0:00-0:30
- 吸引注意力的问题/数据
- 预告视频内容

[目录] 0:30-0:45
- 列出将要讲解的要点

[正文] 0:45-12:00
- 每个要点 1-2 分钟
- 配合视觉演示

[总结] 12:00-13:00
- 回顾要点
- CTA（订阅、点赞、评论）

[结尾] 13:00-15:00
- 相关推荐
- 片尾卡片
```

**短视频 (Shorts/TikTok):**
```
[Hook] 0:00-0:05
- 直接抛出问题/结果

[正文] 0:05-0:50
- 3-5 个要点
- 每个要点 5-10 秒

[CTA] 0:50-1:00
- 关注/点赞/评论
```

### 11.3 视频资产字段

```yaml
VideoAsset:
  content_id: "clxyz123"
  platform: "youtube" # youtube / shorts / tiktok / bilibili
  title: "2026 海外必装 APP 推荐"
  description: "精选 10 款..."
  script: "..."
  duration_seconds: 600
  thumbnail_prompt: "手机屏幕显示 10 个 APP 图标..."
  tags: ["海外生活", "APP推荐", "留学"]
  status: "draft" # draft / ready / published
  published_url: null
  created_at: "2026-06-30T15:00:00Z"
```

---

## 12. 权限与安全

### 12.1 权限模型

```yaml
roles:
  admin:
    - content.create
    - content.edit
    - content.delete
    - content.publish
    - content.schedule
    - content.review
    - video.create
    - video.publish
  
  editor:
    - content.create
    - content.edit
    - content.submit_review
    - video.create
  
  seo_specialist:
    - content.view
    - seo.edit
    - analytics.view
  
  viewer:
    - content.view
```

### 12.2 安全措施

1. **内容审核** — 所有发布必须经过人工审核
2. **版本控制** — 保留内容历史版本
3. **操作日志** — 记录所有创建/编辑/发布操作
4. **权限隔离** — 编辑不能直接发布
5. **定时任务审计** — 记录定时发布执行情况

### 12.3 数据保护

- 不存储用户密码
- API 密钥加密存储
- 定期备份内容数据
- 敏感操作二次确认

---

## 13. MVP 范围 (V1)

### 13.1 核心功能

**内容生成:**
- [x] 粗稿输入界面
- [x] AI 内容生成（调用 LLM）
- [x] 三类内容模板（Topic/Guide/Checklist）
- [x] SEO 元数据生成
- [x] 内链推荐

**审核流程:**
- [x] 草稿状态管理
- [x] 审核清单
- [x] 审核通过/要求修改
- [x] 手动发布

**SEO/GEO:**
- [x] Title/Description 优化
- [x] 结构化数据生成
- [x] FAQ 自动生成
- [x] GEO 评分

**视频:**
- [x] 长视频脚本生成
- [x] 短视频脚本生成
- [x] 封面提示词生成

### 13.2 技术实现

**数据存储:**
- 使用现有 Topic/Guide/Checklist 模型
- 新增 ContentDraft 表存储草稿
- 新增 ContentSchedule 表存储定时任务

**API:**
- POST /api/admin/content-drafts — 创建草稿
- GET /api/admin/content-drafts — 列表
- PATCH /api/admin/content-drafts/:id — 更新
- POST /api/admin/content-drafts/:id/review — 审核
- POST /api/admin/content-drafts/:id/publish — 发布

**前端:**
- /admin/content/drafts — 草稿列表
- /admin/content/drafts/new — 创建草稿
- /admin/content/drafts/:id — 编辑/审核

### 13.3 不包含

- ❌ 定时发布（V2）
- ❌ 自动提交 Search Console（V2）
- ❌ 多 Agent 协作（V3）
- ❌ YouTube API 集成（V3）
- ❌ 关键词排名监控（V3）

---

## 14. V2 范围

### 14.1 增强功能

**定时发布:**
- [ ] scheduledAt 字段
- [ ] 定时任务调度器
- [ ] 发布失败重试
- [ ] 发布日历视图

**SEO 自动化:**
- [ ] 自动提交 Search Console
- [ ] Sitemap 自动更新
- [ ] 内容刷新提醒
- [ ] 批量选题池

**内容分析:**
- [ ] 关键词密度检查
- [ ] 可读性评分
- [ ] 竞品对比
- [ ] 内容差距分析

**视频增强:**
- [ ] 自动生成字幕文件
- [ ] 多语言脚本翻译
- [ ] 视频封面自动生成

---

## 15. V3 范围

### 15.1 高级功能

**多 Agent 协作:**
- [ ] SEO Agent — 关键词研究
- [ ] Content Agent — 内容生成
- [ ] Review Agent — 质量检查
- [ ] Video Agent — 脚本生成
- [ ] Analytics Agent — 表现监控

**平台集成:**
- [ ] YouTube API 上传
- [ ] TikTok API 上传
- [ ] Bilibili API 上传
- [ ] Twitter/微博自动发布

**智能优化:**
- [ ] 关键词表现监控
- [ ] 旧文自动改版建议
- [ ] A/B 测试标题
- [ ] 内容聚类分析

**自动化工作流:**
- [ ] 选题自动生成
- [ ] 内容日历规划
- [ ] 自动内链建设
- [ ] 自动外链机会发现

---

## 16. 不做范围

**明确不做:**

1. **全自动批量发布** — 必须有人工审核环节
2. **垃圾内容生成** — 不追求数量，追求质量
3. **黑帽 SEO** — 不做关键词堆砌、隐藏文本
4. **抄袭/洗稿** — 所有内容必须原创或有独特价值
5. **敏感内容** — 不涉及政治、宗教、色情等
6. **虚假宣传** — 不夸大效果、不误导用户
7. **自动化评论/互动** — 不做虚假互动

---

## 17. 成功指标

### 17.1 V1 成功指标

| 指标 | 目标 | 衡量方式 |
|------|------|----------|
| 内容产出效率 | 3 篇/周 | 发布数量 |
| 内容质量评分 | ≥ 80 分 | 质量评分器 |
| SEO 优化率 | 100% | SEO 检查清单 |
| 视频脚本生成率 | 100% | 视频资产数量 |
| 审核通过率 | ≥ 80% | 一次通过比例 |

### 17.2 V2 成功指标

| 指标 | 目标 | 衡量方式 |
|------|------|----------|
| 有机搜索流量 | +50% | Search Console |
| 关键词排名 | Top 10 数量 +30% | 排名监控工具 |
| 内容索引率 | ≥ 95% | Search Console |
| 平均页面停留时间 | ≥ 3 分钟 | Analytics |
| 跳出率 | ≤ 60% | Analytics |

### 17.3 V3 成功指标

| 指标 | 目标 | 衡量方式 |
|------|------|----------|
| 有机搜索流量 | +200% | Search Console |
| AI 搜索引用次数 | ≥ 10 次/月 | 手动监控 |
| 视频观看次数 | ≥ 1000 次/月 | YouTube Analytics |
| 内容资产价值 | 可量化 | 流量 × 转化率 |

---

## 18. 风险与缓解

### 18.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| AI 生成内容质量不稳定 | 高 | 人工审核 + 质量评分 |
| LLM API 故障 | 中 | 多供应商备份 |
| 定时任务失败 | 中 | 重试机制 + 告警 |
| 数据库性能瓶颈 | 低 | 索引优化 + 缓存 |

### 18.2 业务风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 内容不符合用户需求 | 高 | 关键词研究 + 用户反馈 |
| SEO 算法变化 | 中 | 遵循白帽 SEO |
| 视频平台政策变化 | 中 | 多平台分散风险 |
| 内容同质化 | 中 | 强调独特价值 |

### 18.3 合规风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 版权问题 | 高 | 原创内容 + 引用标注 |
| 隐私问题 | 中 | 不收集敏感信息 |
| 广告法合规 | 中 | 不夸大宣传 |

---

## 19. 时间线

### 19.1 V1 MVP (4 周)

- **Week 1:** 数据模型设计 + API 开发
- **Week 2:** 前端界面 + AI 集成
- **Week 3:** 审核流程 + SEO 优化
- **Week 4:** 测试 + 上线

### 19.2 V2 (6 周)

- **Week 5-6:** 定时发布
- **Week 7-8:** SEO 自动化
- **Week 9-10:** 内容分析
- **Week 11:** 测试 + 上线

### 19.3 V3 (8 周)

- **Week 12-14:** 多 Agent 协作
- **Week 15-17:** 平台集成
- **Week 18-19:** 智能优化

---

## 20. 附录

### 20.1 术语表

- **SEO:** Search Engine Optimization，搜索引擎优化
- **GEO:** Generative Engine Optimization，生成式引擎优化
- **JSON-LD:** JavaScript Object Notation for Linked Data，结构化数据格式
- **SGE:** Search Generative Experience，Google 搜索生成式体验
- **CTA:** Call To Action，行动号召

### 20.2 参考资源

- [Google SEO 指南](https://developers.google.com/search/docs)
- [Schema.org 结构化数据](https://schema.org/)
- [Content Marketing Institute](https://contentmarketinginstitute.com/)

---

**文档版本:** v1.0  
**最后更新:** 2026-06-30  
**下一步:** 技术架构设计 → 数据模型 → API 设计 → 实施计划
