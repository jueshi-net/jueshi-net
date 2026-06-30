# 内容质量评分器规范

**版本:** v1.0  
**日期:** 2026-06-30

---

## 1. 评分维度

### 1.1 SEO 优化 (25 分)

| 检查项 | 分值 | 标准 |
|--------|------|------|
| Title 质量 | 5 | 包含主关键词，50-60 字符 |
| Description 质量 | 5 | 包含主关键词，150-160 字符，有 CTA |
| H1/H2 结构 | 5 | H1 唯一，H2 层级清晰 |
| 关键词密度 | 3 | 1-2% 合理范围 |
| 内链建设 | 4 | ≥ 3 个相关内链 |
| 结构化数据 | 3 | JSON-LD 有效 |

### 1.2 内容质量 (25 分)

| 检查项 | 分值 | 标准 |
|--------|------|------|
| 无 AI 套话 | 5 | 无"在当今社会"等套话 |
| 独特价值 | 5 | 有数据/案例/对比 |
| 结构清晰 | 5 | 段落 ≤ 150 字，有列表/表格 |
| 实操性 | 5 | 有具体步骤/建议 |
| FAQ 质量 | 5 | ≥ 5 个问题，直接回答 |

### 1.3 用户价值 (20 分)

| 检查项 | 分值 | 标准 |
|--------|------|------|
| 解决实际问题 | 10 | 明确解决用户痛点 |
| 具体建议 | 5 | 提供可操作建议 |
| 覆盖目标受众 | 5 | 符合目标受众需求 |

### 1.4 技术实现 (15 分)

| 检查项 | 分值 | 标准 |
|--------|------|------|
| 页面速度 | 5 | < 3 秒加载 |
| 移动端友好 | 5 | 响应式设计 |
| 结构化数据有效 | 5 | Google 验证通过 |

### 1.5 GEO 优化 (15 分)

| 检查项 | 分值 | 标准 |
|--------|------|------|
| 直接回答意图 | 5 | 开头 100 字直接回答 |
| 结构化清晰度 | 3 | H2/H3 层级清晰 |
| 权威引用 | 3 | 引用官方来源 |
| FAQ 覆盖度 | 2 | 覆盖 PAA 问题 |
| 地理定位准确性 | 2 | 明确目标国家 |

---

## 2. 评分计算

```typescript
function calculateQualityScore(content: ContentDraft): number {
  const seoScore = calculateSEOScore(content); // 0-25
  const contentScore = calculateContentScore(content); // 0-25
  const userValueScore = calculateUserValueScore(content); // 0-20
  const technicalScore = calculateTechnicalScore(content); // 0-15
  const geoScore = calculateGEOScore(content); // 0-15
  
  return seoScore + contentScore + userValueScore + technicalScore + geoScore;
}
```

---

## 3. 评分等级

| 分数范围 | 等级 | 发布建议 |
|----------|------|----------|
| 90-100 | A | 立即发布 |
| 80-89 | B | 可发布，建议优化 |
| 70-79 | C | 需要优化后发布 |
| 60-69 | D | 大幅修改 |
| < 60 | F | 重写 |

---

## 4. 评分规则详解

### 4.1 Title 质量 (5 分)

```typescript
function scoreTitle(title: string, primaryKeyword: string): number {
  let score = 0;
  
  // 包含主关键词 (2分)
  if (title.includes(primaryKeyword)) score += 2;
  
  // 长度合适 50-60 字符 (2分)
  if (title.length >= 50 && title.length <= 60) score += 2;
  
  // 有吸引力 (1分)
  if (hasPowerWords(title) || hasNumbers(title)) score += 1;
  
  return score;
}
```

### 4.2 Description 质量 (5 分)

```typescript
function scoreDescription(description: string, primaryKeyword: string): number {
  let score = 0;
  
  // 包含主关键词 (2分)
  if (description.includes(primaryKeyword)) score += 2;
  
  // 长度合适 150-160 字符 (2分)
  if (description.length >= 150 && description.length <= 160) score += 2;
  
  // 有 CTA (1分)
  if (hasCTA(description)) score += 1;
  
  return score;
}
```

### 4.3 无 AI 套话 (5 分)

```typescript
function scoreNoAIFluff(content: string): number {
  const fluffPhrases = [
    "在当今社会",
    "值得注意的是",
    "不可否认",
    "众所周知",
    "综上所述"
  ];
  
  const fluffCount = fluffPhrases.filter(phrase => 
    content.includes(phrase)
  ).length;
  
  if (fluffCount === 0) return 5;
  if (fluffCount <= 2) return 3;
  return 0;
}
```

### 4.4 内链建设 (4 分)

```typescript
function scoreInternalLinks(content: string, internalLinks: number): number {
  if (internalLinks >= 5) return 4;
  if (internalLinks >= 3) return 3;
  if (internalLinks >= 1) return 1;
  return 0;
}
```

---

## 5. 评分报告

```yaml
quality_report:
  total_score: 85
  grade: "B"
  
  breakdown:
    seo_optimization: 22/25
    content_quality: 23/25
    user_value: 18/20
    technical_implementation: 13/15
    geo_optimization: 9/15
  
  issues:
    - severity: "medium"
      category: "geo_optimization"
      message: "缺少直接回答段落"
      recommendation: "在开头 100 字添加直接回答"
    
    - severity: "low"
      category: "seo_optimization"
      message: "内链数量不足"
      recommendation: "添加 2 个相关工具链接"
  
  recommendations:
    - "添加直接回答段落"
    - "增加 2 个内链"
    - "优化 FAQ 覆盖度"
```

---

## 6. 自动化检查

### 6.1 检查时机

- 内容生成后自动评分
- 编辑修改后重新评分
- 发布前最终评分

### 6.2 评分门槛

```yaml
publish_threshold:
  minimum_score: 80
  blocking_issues:
    - "Title 缺失"
    - "Description 缺失"
    - "H1 缺失"
    - "结构化数据无效"
```

---

**文档版本:** v1.0  
**最后更新:** 2026-06-30
