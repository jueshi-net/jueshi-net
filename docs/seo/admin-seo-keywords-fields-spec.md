# Admin SEO Keywords Fields Specification

**版本**: v1.0  
**创建时间**: 2026-07-03  
**适用范围**: Checklist/Guide/Topic 内容管理

---

## 概述

为支持长期内容运营，后台必须可编辑 SEO 字段。Hermes 生成内容时自动填入默认值，用户可覆盖。

---

## 字段规范

### 统一字段列表

每篇 checklist/guide/topic 至少支持：

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| seoTitle | String | 否 | SEO 标题，留空使用 title |
| seoDescription | String | 否 | SEO 描述，留空使用 summary |
| metaKeywords | String | 否 | Meta keywords，逗号分隔，5-15 个 |
| primaryKeyword | String | 否 | 主关键词 |
| secondaryKeywords | String[] | 否 | 副关键词数组，5-10 个 |
| searchIntent | String | 否 | 搜索意图：informational/navigational/transactional |
| targetAudience | String | 否 | 目标受众描述 |
| targetCountries | String[] | 否 | 目标国家/地区 |
| targetRegions | String[] | 否 | 目标地区（如：北美、欧洲） |
| audienceStage | String | 否 | 受众阶段（见下方枚举） |
| targetSearchEngines | String[] | 否 | 目标搜索引擎（见下方枚举） |
| canonicalUrl | String | 否 | Canonical URL |
| robots | String | 否 | Robots 规则：index,follow / noindex,nofollow |

---

## 枚举值

### audienceStage

```typescript
type AudienceStage = 
  | "未出海了解阶段"      // 想了解海外生活的人
  | "准备出国阶段"        // 准留学生、准备出国的人
  | "已在海外阶段"        // 已在海外的华人、留学生
  | "家长/亲属关注阶段"   // 留学生家长、亲属
  | "跨境经营阶段";       // 跨境卖家、外贸从业者
```

### targetSearchEngines

```typescript
type TargetSearchEngine = 
  | "Google"
  | "Baidu"
  | "Bing"
  | "360"
  | "Sogou"
  | "Shenma";
```

---

## 存储策略

### 优先使用 metadataJson

**不新增独立 DB 字段**，所有新 SEO 字段存储在：

```
metadataJson.contentOps.seo
```

### 结构示例

```json
{
  "contentOps": {
    "qualityScore": 88,
    "primaryKeyword": "留学生出国前准备清单",
    "secondaryKeywords": [
      "出国留学清单",
      "留学生行前准备"
    ],
    "seo": {
      "metaKeywords": "留学生出国准备,出国留学清单,留学生行前准备,留学生家长,加拿大留学准备,美国留学准备,英国留学准备,澳洲留学准备,出国前准备清单,海外生活指南",
      "searchIntent": "informational",
      "targetAudience": "即将出国留学的学生和家长",
      "targetCountries": ["加拿大", "美国", "英国", "澳大利亚"],
      "targetRegions": ["北美", "欧洲", "大洋洲"],
      "audienceStage": "准备出国阶段",
      "targetSearchEngines": ["Google", "Baidu", "Bing"],
      "longTailQuestions": [
        "留学生出国前多久开始准备？",
        "出国留学需要带什么东西？",
        "留学生家长需要准备什么？"
      ],
      "domesticSearchKeywords": [
        "出国留学准备",
        "留学生行前准备",
        "孩子出国留学要准备什么"
      ],
      "overseasSearchKeywords": [
        "study abroad checklist",
        "international student preparation",
        "pre-departure checklist"
      ],
      "familyAudienceKeywords": [
        "留学生家长准备事项",
        "送孩子出国留学准备",
        "留学生家长须知"
      ]
    },
    "faq": [...],
    "internalLinks": [...],
    "structuredData": {...},
    "geoAnswerBlock": {...},
    "videoPack": {...}
  }
}
```

---

## 后台编辑 UI

### 区块名称

**SEO / GEO 设置**

### 字段布局

```
┌─────────────────────────────────────────────────────────┐
│ SEO / GEO 设置                                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ SEO Title                                               │
│ [________________________________]                      │
│ 留空则使用标题                                          │
│                                                         │
│ SEO Description                                         │
│ [________________________________]                      │
│ [________________________________]                      │
│ 留空则使用简介                                          │
│                                                         │
│ Meta Keywords                                           │
│ [________________________________]                      │
│ 逗号分隔，5-15 个关键词                                 │
│ ⚠️ 当前 12 个关键词                                     │
│                                                         │
│ Primary Keyword                                         │
│ [________________________________]                      │
│                                                         │
│ Secondary Keywords                                      │
│ [________________________________]                      │
│ 逗号分隔，5-10 个关键词                                  │
│                                                         │
│ Search Intent                                           │
│ [informational ▼]                                       │
│                                                         │
│ Target Audience                                         │
│ [________________________________]                      │
│                                                         │
│ Audience Stage                                          │
│ [准备出国阶段 ▼]                                        │
│                                                         │
│ Target Countries                                        │
│ [________________________________]                      │
│ 逗号分隔，如：加拿大,美国,英国                           │
│                                                         │
│ Target Search Engines                                   │
│ ☑ Google  ☑ Baidu  ☑ Bing  ☐ 360  ☐ Sogou              │
│                                                         │
│ Canonical URL                                           │
│ [________________________________]                      │
│                                                         │
│ Robots                                                  │
│ [index,follow ▼]                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 页面 Metadata 输出规则

### 优先级

```typescript
// Meta Keywords
let keywords = "";

// 1. 优先使用后台 metaKeywords
if (metadataJson?.contentOps?.seo?.metaKeywords) {
  keywords = metadataJson.contentOps.seo.metaKeywords;
}
// 2. 否则从 primaryKeyword + secondaryKeywords 生成
else if (metadataJson?.contentOps?.primaryKeyword) {
  const keywordSet = new Set<string>();
  keywordSet.add(metadataJson.contentOps.primaryKeyword);
  
  if (Array.isArray(metadataJson.contentOps.secondaryKeywords)) {
    metadataJson.contentOps.secondaryKeywords.forEach(kw => keywordSet.add(kw));
  }
  
  // 添加页面类型词
  keywordSet.add(pageType); // "清单" / "指南" / "专题"
  
  keywords = Array.from(keywordSet).slice(0, 15).join(",");
}
// 3. 否则 fallback 到 title
else {
  keywords = `${title},${pageType}`;
}
```

### 去重和限制

- 去重：使用 Set
- 限制：最多 15 个关键词
- 分隔符：中文逗号

---

## Draft/Preview 规则

| 状态 | Robots | Keywords 输出 |
|------|--------|--------------|
| draft | noindex, nofollow | 输出（但不被索引） |
| preview | noindex, nofollow | 输出（但不被索引） |
| published | index, follow | 输出 |
| archived | noindex, nofollow | 不输出 |

---

## Staging 规则

- 永远 noindex, nofollow
- 输出 keywords（但不被索引）

---

## Hermes 自动生成规则

当 Hermes 生成 checklist/guide/topic 时，必须自动生成：

```yaml
metadataJson:
  contentOps:
    primaryKeyword: "留学生出国前准备清单"
    secondaryKeywords:
      - "出国留学清单"
      - "留学生行前准备"
      - "孩子出国留学要准备什么"
      - "加拿大留学出发前准备"
      - "美国留学行前清单"
      - "出国前 checklist"
      - "留学生家长准备事项"
    seo:
      metaKeywords: "留学生出国准备,出国留学清单,留学生行前准备,留学生家长,加拿大留学准备,美国留学准备,英国留学准备,澳洲留学准备,出国前准备清单,海外生活指南"
      searchIntent: "informational"
      targetAudience: "即将出国留学的学生和家长"
      targetCountries:
        - "加拿大"
        - "美国"
        - "英国"
        - "澳大利亚"
      audienceStage: "准备出国阶段"
      targetSearchEngines:
        - "Google"
        - "Baidu"
        - "Bing"
      longTailQuestions:
        - "留学生出国前多久开始准备？"
        - "出国留学需要带什么东西？"
        - "留学生家长需要准备什么？"
      domesticSearchKeywords:
        - "出国留学准备"
        - "留学生行前准备"
        - "孩子出国留学要准备什么"
      overseasSearchKeywords:
        - "study abroad checklist"
        - "international student preparation"
      familyAudienceKeywords:
        - "留学生家长准备事项"
        - "送孩子出国留学准备"
```

---

## 实施检查清单

- [ ] 后台 checklist 编辑页可编辑 SEO/GEO 字段
- [ ] 后台 guide 编辑页可编辑 SEO/GEO 字段
- [ ] 后台 topic 编辑页可编辑 SEO/GEO 字段
- [ ] 保存到 metadataJson.contentOps.seo
- [ ] 页面 head 输出 keywords
- [ ] keywords 去重且不超过 15 个
- [ ] draft/preview 仍 noindex
- [ ] published 页面 index
- [ ] staging 仍 noindex
- [ ] 旧内容 metadataJson=null 不崩
- [ ] Hermes 自动生成 keywords

---

## 更新记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-07-03 | 初始版本 |
