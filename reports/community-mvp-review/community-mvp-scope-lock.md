# Community MVP Scope Lock

**创建时间**: 2026-06-12  
**版本**: v1.1 (6.49.1 修正)  
**状态**: 待批准

---

## ⚠️ 6.49.1 修正说明

v1.20.42.6.49 审计报告不完整，漏审了以下关键发现：

1. **外部 Flarum 论坛曾经存在** (bbs.jueshi.net)
   - 完整的部署脚本 FLARUM_DEPLOY.sh (210 行)
   - SSO 集成代码 /api/auth/sso
   - 多处引用（首页、Footer、Command Palette）

2. **首页社区组件存在**
   - community-section.tsx - V2EX 风格帖子列表（硬编码 8 个帖子）
   - community-fireworks.tsx - 社区烟火气组件（硬编码 3 个帖子）

3. **BBS Migration 历史**
   - 20260517173000_v21_bbs_forum
   - 20260517182500_v21_1_bbs_positive_gate
   - 都是占位符（SELECT 1），说明曾经计划但后来放弃

4. **Topic 系统可以复用**
   - 11 个 Topic，43 个 TopicItem，3 个已发布
   - 完整的前后端和管理后台

详见：v1.20.42.6.49.1-legacy-community-audit.md

---

## 一、推荐方案：方案 A — 复用 Topic 系统做只读 Community

### 核心特征

- ✅ 无用户发帖
- ✅ 无评论功能
- ✅ 无新数据库表
- ✅ 无 migration
- ✅ 使用静态数据文件（MDX/JSON/TS）
- ✅ 复用现有 Topic 系统（可选）
- ✅ 页面展示工具案例、FAQ、问答精选
- ✅ 每篇内容关联工具 CTA
- ✅ 加入 sitemap
- ✅ EventLog 埋点

### 允许实现

#### 页面

1. `/community` — 社区首页（列表页）
   - 展示所有社区文章
   - 按工具分类筛选
   - 搜索功能（前端过滤）

2. `/community/[slug]` — 文章详情页
   - Markdown 渲染
   - 工具 CTA 按钮
   - 相关文章推荐
   - 面包屑导航

#### 数据

- 静态数据文件：`src/data/community-articles.ts`
- 每篇文章包含：
  - slug, title, description
  - content (Markdown)
  - linkedTool (关联工具)
  - tags, category
  - ctaText, ctaUrl

#### 埋点

使用现有 EventLog：
- `community_list_view` — 查看列表
- `community_article_view` — 查看文章
- `community_cta_click` — 点击 CTA
- `community_tool_continue` — 继续到工具

#### SEO

- 每篇文章独立 metadata
- 加入 sitemap
- canonical URL
- openGraph 标签

#### 导航

- Header 添加轻量入口（不改变大结构）
- Footer 添加链接
- 面包屑导航

---

## 二、禁止实现

### 绝对禁止

- ❌ 用户发帖功能
- ❌ 评论功能
- ❌ 点赞/收藏功能
- ❌ 用户主页
- ❌ 审核后台
- ❌ 新增数据库表
- ❌ 新增 migration
- ❌ 富文本编辑器
- ❌ 搜索索引系统
- ❌ 推荐系统
- ❌ 会员限制
- ❌ AI 生成内容批量发布
- ❌ UGC（用户生成内容）
- ❌ 第三方社区服务接入

### 技术禁止

- ❌ 修改 Prisma schema
- ❌ 修改 ToolDocument schema
- ❌ 重构 Workspace / Dashboard
- ❌ 修改 Auth / Session / middleware
- ❌ 修改 Commercial Invoice 核心逻辑
- ❌ 修改 Quote Sheet 核心逻辑
- ❌ 改变 Header 大结构
- ❌ 扩大广告

---

## 三、实现范围

### Phase 1: 基础页面（v1.20.42.6.50）

**允许**:
1. 创建 `/community` 列表页
2. 创建 `/community/[slug]` 详情页
3. 创建静态数据文件 `src/data/community-articles.ts`
4. 添加 EventLog 埋点
5. 加入 sitemap
6. Header/Footer 轻量入口

**禁止**:
- 任何 UGC 功能
- 任何数据库变更
- 任何核心功能修改

### Phase 2: 内容扩充（v1.20.42.6.51+）

**允许**:
1. 添加更多社区文章（5-10 篇）
2. 优化 SEO
3. 添加分类筛选
4. 添加搜索功能（前端）

**禁止**:
- 同上

### Phase 3: 数据分析（v1.20.42.6.52+）

**允许**:
1. Admin Analytics 接入社区数据
2. 查看社区文章浏览量
3. 查看 CTA 点击率
4. 查看工具转化

**禁止**:
- 同上

---

## 四、数据模型

### 静态数据结构

```typescript
// src/data/community-articles.ts

export interface CommunityArticle {
  slug: string;
  title: string;
  description: string;
  content: string; // Markdown
  linkedTool: string; // 工具路径，如 "/tools/hs-code"
  category: string; // 分类
  tags: string[];
  ctaText: string; // CTA 按钮文字
  ctaUrl: string; // CTA 链接
  publishedAt: string; // ISO date
  updatedAt?: string;
}

export const communityArticles: CommunityArticle[] = [
  {
    slug: "hs-code-lookup-guide",
    title: "HS Code 查询完全指南：从入门到精通",
    description: "一文搞懂 HS Code 查询，避免报关错误",
    content: "# HS Code 查询指南\n\n...",
    linkedTool: "/tools/hs-code",
    category: "报关",
    tags: ["HS Code", "报关", "海关"],
    ctaText: "立即查询 HS Code",
    ctaUrl: "/tools/hs-code",
    publishedAt: "2026-06-12T00:00:00Z",
  },
  // ... 更多文章
];
```

### 不使用数据库

- ❌ 不创建 CommunityArticle 表
- ❌ 不创建 migration
- ✅ 使用静态 TS 文件
- ✅ 构建时编译到 bundle

---

## 五、EventLog 埋点

### 事件类型

```typescript
// 社区列表浏览
{
  eventType: "community_list_view",
  toolName: "community",
  action: "view",
  path: "/community",
  metadata: { category?: string, search?: string }
}

// 社区文章浏览
{
  eventType: "community_article_view",
  toolName: "community",
  action: "view",
  path: "/community/[slug]",
  metadata: { slug: string, linkedTool: string }
}

// CTA 点击
{
  eventType: "community_cta_click",
  toolName: "community",
  action: "click",
  path: "/community/[slug]",
  metadata: { slug: string, ctaUrl: string }
}

// 继续到工具
{
  eventType: "community_tool_continue",
  toolName: "community",
  action: "click",
  path: "/community/[slug]",
  metadata: { slug: string, linkedTool: string }
}
```

### 使用现有 EventLog

- ✅ 复用现有 EventLog 模型
- ✅ 不创建新表
- ✅ 不修改 schema

---

## 六、SEO 策略

### Sitemap

```xml
<url>
  <loc>https://jueshi.net/community</loc>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://jueshi.net/community/hs-code-lookup-guide</loc>
  <changefreq>monthly</changefreq>
  <priority>0.6</priority>
</url>
```

### Metadata

```typescript
// /community/[slug]/page.tsx
export const metadata = {
  title: `${article.title} - 社区`,
  description: article.description,
  alternates: {
    canonical: `https://jueshi.net/community/${article.slug}`,
  },
  openGraph: {
    title: article.title,
    description: article.description,
    url: `https://jueshi.net/community/${article.slug}`,
    type: "article",
  },
};
```

### 结构化数据

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "HS Code 查询完全指南",
  "description": "一文搞懂 HS Code 查询",
  "url": "https://jueshi.net/community/hs-code-lookup-guide",
  "datePublished": "2026-06-12",
  "author": {
    "@type": "Organization",
    "name": "绝世百宝箱"
  }
}
```

---

## 七、风险清单

### 低风险

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| 内容质量 | 低 | 人工审核所有文章 |
| SEO 低质 | 低 | 每篇文章关联工具，避免空泛内容 |
| 维护成本 | 低 | 静态文件，易于维护 |

### 零风险

| 风险 | 等级 | 说明 |
|------|------|------|
| UGC 风险 | 无 | 无用户生成内容 |
| 审核风险 | 无 | 无 UGC |
| 垃圾内容 | 无 | 无 UGC |
| 新 schema 风险 | 无 | 无数据库变更 |
| 权限复杂度 | 无 | 无用户功能 |
| 影响稳定性 | 无 | 独立模块，不影响核心功能 |

---

## 八、成功标准

### Phase 1 完成标准

- [ ] `/community` 页面可访问
- [ ] `/community/[slug]` 页面可访问
- [ ] 至少 5 篇社区文章
- [ ] EventLog 埋点正常
- [ ] 加入 sitemap
- [ ] Header/Footer 入口正常

### SEO 标准（3 个月后）

- [ ] 社区页面被 Google 收录
- [ ] 至少 3 篇文章有自然搜索流量
- [ ] CTA 点击率 > 5%

### 产品标准（3 个月后）

- [ ] 社区页面月访问 > 1000
- [ ] 工具转化 > 50 次/月
- [ ] 用户反馈正面

---

## 九、决策记录

### 为什么选择方案 A？

1. **零数据库风险**
   - 不需要 migration
   - 不需要新表
   - 不影响现有系统

2. **快速上线**
   - 静态页面，开发快
   - 无需审核系统
   - 无需权限控制

3. **SEO 价值**
   - 可以立即加入 sitemap
   - 每篇文章独立 SEO
   - 关联工具 CTA

4. **可验证**
   - 可以用 EventLog 验证效果
   - 可以观察工具转化
   - 可以收集用户反馈

### 为什么不选择方案 B/C？

**方案 B（半动态）**:
- 需要后台管理
- 需要少量 API
- 复杂度高于方案 A
- 当前不需要

**方案 C（真正社区）**:
- 需要新 schema/migration
- 需要审核系统
- 需要反垃圾
- 风险高，成本高
- 当前不应该做

---

## 十、下一步

### 如果批准方案 A

1. 创建 v1.20.42.6.50 执行指令
2. 实现 `/community` 和 `/community/[slug]`
3. 创建 5 篇初始文章
4. 添加 EventLog 埋点
5. 加入 sitemap
6. 部署上线

### 如果不批准

- 保持现状
- 继续优化工具链
- 等待更好的时机

---

**文档创建时间**: 2026-06-12 01:15 UTC  
**文档版本**: v1.0  
**状态**: 待批准
