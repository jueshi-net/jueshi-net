# ContentOps Auto Keyword Generation Rules

**版本**: v1.0  
**创建时间**: 2026-07-03  
**适用范围**: Hermes 生成 checklist/guide/topic 时自动填入 SEO 字段

---

## 概述

当 Hermes 生成 checklist/guide/topic 内容时，必须自动生成 SEO/GEO/keywords 字段，填入 metadataJson.contentOps。

---

## 自动生成字段

用户给选题后，Hermes 必须自动生成：

| 字段 | 数量 | 说明 |
|------|------|------|
| primaryKeyword | 1 | 主关键词 |
| secondaryKeywords | 5-10 | 副关键词数组 |
| metaKeywords | 5-15 | Meta keywords，逗号分隔 |
| longTailQuestions | 5-10 | 长尾问题 |
| domesticSearchKeywords | 3-5 | 国内搜索关键词 |
| overseasSearchKeywords | 3-5 | 海外搜索关键词 |
| familyAudienceKeywords | 3-5 | 家长/亲属关键词 |
| searchIntent | 1 | 搜索意图 |
| targetAudience | 1 | 目标受众描述 |
| audienceStage | 1 | 受众阶段 |
| GEO answer keywords | 1 | GEO 答案关键词 |
| FAQ question keywords | 3-5 | FAQ 问题关键词 |

---

## 目标用户覆盖

必须覆盖以下用户群体：

1. **海外华人** — 已在海外的华人、留学生
2. **准留学生** — 准备出国留学的学生
3. **留学生家长** — 送孩子出国的家长
4. **准备出国的人** — 未出海但计划出国的人
5. **跨境卖家** — 跨境电商从业者
6. **外贸从业者** — 外贸 SOHO、工厂
7. **国际物流用户** — 集运、物流需求
8. **海外生活知识用户** — 想了解海外生活的人

---

## 示例：留学生出国前准备清单

### primaryKeyword

```
留学生出国前准备清单
```

### secondaryKeywords

```yaml
- 出国留学清单
- 留学生行前准备
- 孩子出国留学要准备什么
- 加拿大留学出发前准备
- 美国留学行前清单
- 出国前 checklist
- 留学生家长准备事项
```

### metaKeywords

```
留学生出国准备,出国留学清单,留学生行前准备,留学生家长,加拿大留学准备,美国留学准备,英国留学准备,澳洲留学准备,出国前准备清单,海外生活指南
```

### longTailQuestions

```yaml
- 留学生出国前多久开始准备？
- 出国留学需要带什么东西？
- 留学生家长需要准备什么？
- 加拿大留学出发前要准备哪些文件？
- 美国留学行前清单有哪些？
- 出国留学行李怎么准备？
- 留学生出国前要办哪些手续？
```

### domesticSearchKeywords

```yaml
- 出国留学准备
- 留学生行前准备
- 孩子出国留学要准备什么
- 送孩子出国准备清单
```

### overseasSearchKeywords

```yaml
- study abroad checklist
- international student preparation
- pre-departure checklist
```

### familyAudienceKeywords

```yaml
- 留学生家长准备事项
- 送孩子出国留学准备
- 留学生家长须知
```

### searchIntent

```
informational
```

### targetAudience

```
即将出国留学的学生和家长
```

### audienceStage

```
准备出国阶段
```

### targetCountries

```yaml
- 加拿大
- 美国
- 英国
- 澳大利亚
```

### targetSearchEngines

```yaml
- Google
- Baidu
- Bing
```

---

## metadataJson 结构

```json
{
  "contentOps": {
    "qualityScore": 88,
    "primaryKeyword": "留学生出国前准备清单",
    "secondaryKeywords": [
      "出国留学清单",
      "留学生行前准备",
      "孩子出国留学要准备什么",
      "加拿大留学出发前准备",
      "美国留学行前清单",
      "出国前 checklist",
      "留学生家长准备事项"
    ],
    "seo": {
      "metaKeywords": "留学生出国准备,出国留学清单,留学生行前准备,留学生家长,加拿大留学准备,美国留学准备,英国留学准备,澳洲留学准备,出国前准备清单,海外生活指南",
      "searchIntent": "informational",
      "targetAudience": "即将出国留学的学生和家长",
      "targetCountries": ["加拿大", "美国", "英国", "澳大利亚"],
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
        "international student preparation"
      ],
      "familyAudienceKeywords": [
        "留学生家长准备事项",
        "送孩子出国留学准备"
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

## 生成规则

### 1. primaryKeyword

- 从选题中提取核心关键词
- 包含页面类型词（清单/指南/专题）
- 长度不超过 20 个字符

### 2. secondaryKeywords

- 5-10 个相关关键词
- 包含不同搜索意图
- 包含不同用户群体
- 包含不同国家/地区变体

### 3. metaKeywords

- 5-15 个关键词
- 合并 primaryKeyword + secondaryKeywords
- 去重
- 中文逗号分隔

### 4. longTailQuestions

- 5-10 个问题
- 覆盖不同用户群体
- 覆盖不同搜索意图
- 可用于 FAQ 模块

### 5. domesticSearchKeywords

- 3-5 个国内搜索关键词
- 适合百度、360、搜狗
- 中文长尾词

### 6. overseasSearchKeywords

- 3-5 个海外搜索关键词
- 适合 Google、Bing
- 英文关键词

### 7. familyAudienceKeywords

- 3-5 个家长/亲属关键词
- 覆盖"家长/亲属关注阶段"用户

### 8. searchIntent

- informational: 信息查询
- navigational: 导航查询
- transactional: 交易查询

### 9. targetAudience

- 一句话描述目标受众
- 包含用户群体和场景

### 10. audienceStage

- 未出海了解阶段
- 准备出国阶段
- 已在海外阶段
- 家长/亲属关注阶段
- 跨境经营阶段

---

## 更新记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-07-03 | 初始版本 |
