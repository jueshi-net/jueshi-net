# 内容发布 Agent 工作流设计

**版本:** v1.0  
**日期:** 2026-06-30

---

## 1. 工作流概览

```
[粗稿输入] → [内容理解] → [选题分类] → [关键词提取] → [资料补全]
    ↓
[内容生成] → [SEO 检查] → [GEO 检查] → [重复检查] → [内链推荐]
    ↓
[视频脚本] → [草稿入库] → [人工审核] → [定时发布] → [发布监控]
    ↓
[旧文刷新]
```

---

## 2. 详细流程

### 2.1 粗稿输入

**输入:**
```yaml
title: "海外汇款攻略"
rough_content: |
  Wise 最便宜，汇率透明。
  银行汇款贵但安全。
  西联汇款快但贵。
target_audience: "留学生、新移民"
target_countries: ["CA", "US", "UK"]
```

**处理:**
1. 解析标题和粗稿
2. 识别目标受众和国家
3. 确定内容类型（Guide/Topic/Checklist）

### 2.2 内容理解

**处理:**
1. 提取核心主题：海外汇款
2. 识别关键实体：Wise、银行、西联汇款
3. 理解用户意图：比较不同汇款方式

**输出:**
```yaml
understanding:
  topic: "海外汇款"
  entities: ["Wise", "银行汇款", "西联汇款"]
  intent: "comparison"
  audience: ["留学生", "新移民"]
  countries: ["CA", "US", "UK"]
```

### 2.3 选题分类

**分类规则:**
- 包含多个对比项 → Topic (rating_list)
- 深度教程 → Guide
- 步骤清单 → Checklist

**输出:**
```yaml
classification:
  type: "guide"
  template: "comparison_guide"
  priority: "high" # 基于搜索量和竞争度
```

### 2.4 关键词提取

**处理:**
1. 从粗稿提取主关键词
2. 生成次要关键词
3. 识别长尾关键词
4. 估算搜索量

**输出:**
```yaml
keywords:
  primary: "海外汇款"
  secondary: ["国际汇款", "汇款手续费"]
  long_tail: ["海外汇款哪个最便宜", "留学生汇款方式"]
  search_volume: 2400
  competition: "medium"
```

### 2.5 资料补全

**处理:**
1. 查询相关工具数据
2. 获取最新汇率
3. 查找官方来源
4. 收集用户常见问题

**输出:**
```yaml
supplements:
  exchange_rates: {...}
  fee_comparison: {...}
  official_sources: [...]
  faq_questions: [...]
```

### 2.6 内容生成

**处理:**
1. 根据模板生成结构化内容
2. 填充 SEO 元数据
3. 生成 FAQ
4. 生成内链建议

**输出:**
```yaml
generated_content:
  seo_title: "海外汇款方式对比 | Wise vs 银行 vs 西联 - 绝世百宝箱"
  seo_description: "..."
  body: "..."
  faq: [...]
  internal_links: [...]
```

### 2.7 SEO 检查

**检查项:**
- [ ] Title 包含主关键词
- [ ] Description ≤ 160 字符
- [ ] H1 唯一
- [ ] 关键词密度 1-2%
- [ ] 内链 ≥ 3 个
- [ ] 结构化数据有效

**输出:**
```yaml
seo_score: 85
issues: []
recommendations: [...]
```

### 2.8 GEO 检查

**检查项:**
- [ ] 直接回答问题
- [ ] 结构化清晰
- [ ] 权威引用
- [ ] FAQ 覆盖度
- [ ] 地理定位准确

**输出:**
```yaml
geo_score: 78
issues: []
recommendations: [...]
```

### 2.9 重复内容检查

**处理:**
1. 查询现有内容
2. 计算相似度
3. 识别重复主题

**输出:**
```yaml
duplicate_check:
  similar_content: []
  similarity_score: 0.15
  status: "unique"
```

### 2.10 内链推荐

**处理:**
1. 分析内容主题
2. 匹配相关工具/指南/清单
3. 生成内链建议

**输出:**
```yaml
internal_links:
  - slug: "exchange-rate"
    anchor: "汇率换算工具"
    relevance: 0.92
  - slug: "hs-code"
    anchor: "HS 编码查询"
    relevance: 0.78
```

### 2.11 视频脚本生成

**处理:**
1. 提取内容要点
2. 生成 YouTube 长视频脚本
3. 生成 Shorts 短视频脚本
4. 生成封面提示词

**输出:**
```yaml
video_assets:
  youtube:
    title: "..."
    script: "..."
    thumbnail_prompt: "..."
  shorts:
    title: "..."
    script: "..."
```

### 2.12 草稿入库

**处理:**
1. 创建 ContentDraft 记录
2. 设置状态为 pending_review
3. 关联视频资产

**输出:**
```yaml
draft_id: "clxyz123"
status: "pending_review"
created_at: "2026-06-30T15:00:00Z"
```

### 2.13 人工审核

**流程:**
1. 编辑查看草稿
2. 检查审核清单
3. 通过/要求修改

**输出:**
```yaml
review_result: "approved"
reviewer: "editor_id"
reviewed_at: "2026-06-30T16:00:00Z"
```

### 2.14 定时发布

**处理:**
1. 设置发布时间
2. 创建定时任务
3. 到时间自动发布

**输出:**
```yaml
schedule:
  scheduled_at: "2026-07-01T10:00:00Z"
  status: "scheduled"
```

### 2.15 发布监控

**监控项:**
- 页面索引状态
- 关键词排名
- 流量数据
- 用户互动

**输出:**
```yaml
metrics:
  indexed: true
  keywords_ranking: {...}
  traffic: {...}
  engagement: {...}
```

### 2.16 旧文刷新

**触发条件:**
- 内容 > 6 个月
- 流量下降 > 30%
- 关键词排名下降 > 5 位

**处理:**
1. 识别需要刷新的内容
2. 生成刷新建议
3. 通知编辑审核

---

## 3. Agent 角色

### 3.1 SEO Agent

**职责:**
- 关键词研究
- SEO 优化建议
- 排名监控

**工具:**
- Search Console API
- 关键词研究工具

### 3.2 Content Agent

**职责:**
- 内容生成
- 质量检查
- 内链建议

**工具:**
- LLM API
- 内容模板库

### 3.3 Video Agent

**职责:**
- 脚本生成
- 封面提示词
- 多平台适配

**工具:**
- LLM API
- 视频脚本模板

### 3.4 Analytics Agent

**职责:**
- 流量监控
- 排名监控
- 刷新建议

**工具:**
- Analytics API
- Search Console API

---

## 4. 技术实现

### 4.1 API 设计

```typescript
// 创建草稿
POST /api/admin/content-drafts
{
  "title": "海外汇款攻略",
  "rough_content": "...",
  "content_type": "guide"
}

// 获取草稿列表
GET /api/admin/content-drafts

// 更新草稿
PATCH /api/admin/content-drafts/:id

// 审核草稿
POST /api/admin/content-drafts/:id/review
{
  "action": "approve" | "revise",
  "comments": "..."
}

// 定时发布
POST /api/admin/content-drafts/:id/schedule
{
  "scheduled_at": "2026-07-01T10:00:00Z"
}

// 手动发布
POST /api/admin/content-drafts/:id/publish

// 生成视频包
POST /api/admin/content-drafts/:id/video-pack
```

### 4.2 数据库模型

```prisma
model ContentDraft {
  id            String   @id @default(cuid())
  title         String
  slug          String   @unique
  contentType   String   @map("content_type") // topic / guide / checklist
  roughContent  String   @map("rough_content") @db.Text
  structuredContent Json @map("structured_content")
  seoTitle      String?  @map("seo_title")
  seoDescription String? @map("seo_description")
  status        String   @default("draft") // draft / pending_review / approved / published / archived
  qualityScore  Int?     @map("quality_score")
  seoScore      Int?     @map("seo_score")
  geoScore      Int?     @map("geo_score")
  scheduledAt   DateTime? @map("scheduled_at")
  publishedAt   DateTime? @map("published_at")
  createdBy     String   @map("created_by")
  reviewedBy    String?  @map("reviewed_by")
  reviewedAt    DateTime? @map("reviewed_at")
  reviewComments String? @map("review_comments") @db.Text
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  videoAssets   ContentVideoAsset[]
  publishLogs   ContentPublishLog[]
  
  @@map("content_drafts")
}

model ContentVideoAsset {
  id              String   @id @default(cuid())
  contentDraftId  String   @map("content_draft_id")
  contentDraft    ContentDraft @relation(fields: [contentDraftId], references: [id])
  platform        String   // youtube / shorts / tiktok / bilibili
  title           String
  script          String   @db.Text
  durationSeconds Int      @map("duration_seconds")
  thumbnailPrompt String?  @map("thumbnail_prompt") @db.Text
  status          String   @default("draft") // draft / ready / published
  publishedUrl    String?  @map("published_url")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  @@map("content_video_assets")
}

model ContentPublishLog {
  id              String   @id @default(cuid())
  contentDraftId  String   @map("content_draft_id")
  contentDraft    ContentDraft @relation(fields: [contentDraftId], references: [id])
  action          String   // scheduled / published / failed / refreshed
  details         String?  @db.Text
  executedAt      DateTime @default(now()) @map("executed_at")
  
  @@map("content_publish_logs")
}
```

---

## 5. 实施计划

### Phase 1 (Week 1-2)
- 数据模型设计
- API 开发
- 基础前端界面

### Phase 2 (Week 3)
- AI 内容生成集成
- SEO/GEO 检查
- 审核流程

### Phase 3 (Week 4)
- 视频脚本生成
- 定时发布
- 测试上线

---

**文档版本:** v1.0  
**最后更新:** 2026-06-30
