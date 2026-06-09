---
name: checklist-contentops
description: "Hermes ContentOps Checklist Draft Generator — 根据选题包生成 checklist draft JSON，强制 draft 状态，不直接发布。"
version: "1.0.0"
author: "Hermes Agent"
created: "2026-06-09"
---

# Checklist ContentOps Draft Generator

## 适用场景

- 留学生出国清单
- 第一次集运清单
- 城市避坑清单
- 跨境电商发货前清单
- 工具使用前检查清单

## 快速开始

```bash
# 1. 准备选题包 YAML → content-drafts/topic-packs/
# 2. Hermes 根据 YAML 生成 draft JSON → content-drafts/checklists/
# 3. 校验 → node scripts/validate-checklist-draft.mjs <json-file>
# 4. （可选）导入 → node scripts/import-checklist-draft.mjs <json-file>
# 5. Admin 审核 → /admin/landing-pages
# 6. 人工发布
```

或使用 wrapper 脚本一键完成：

```bash
# 生成 + 校验（默认）
node scripts/hermes-generate-checklist-draft.mjs content-drafts/topic-packs/xxx.yaml

# 生成 + 校验 + 导入 draft
node scripts/hermes-generate-checklist-draft.mjs content-drafts/topic-packs/xxx.yaml --import-draft
```

## 核心红线

### 永远只能生成 draft

- **Hermes 生成的清单必须 `status = "draft"`，永远不允许 `status = "published"`。**
- `publish_mode` 字段固定为 `"draft"`，输入 `published` 时强制降级为 `draft` 并输出 warning。
- 所有 draft 必须经过**人工审核**后才能由 Admin 手动发布。
- wrapper 脚本即使传入 `--import-draft`，也强制 `status=draft`。

### 不编造高风险内容

- 政策、法律、签证、海关、医疗、税务等内容必须标注 `[需人工核验]`。
- 不编造官方数据、费用金额、办理时限、法律条文。
- 所有官方链接必须保留占位，URL 可为空但 `label` 必须明确。

### 不批量生成

- 每次只处理一个选题包。
- 不自动循环生成多篇清单。

## 输入格式：Topic Pack (YAML)

```yaml
type: checklist
title: 留学生第一次出国行李准备清单
audience: 留学生 / 海外华人
region: 通用
city: ""
scenario: 第一次出国留学
primary_intent: 帮助留学生准备出国前行李
difficulty: easy
estimated_time: "2-3小时"
sections:
  - 证件与文件
  - 电子产品
  - 生活用品
related_tools:
  - address-formatter
  - shipping-calculator
  - invoice
related_topics: []
related_articles: []
official_links_needed:
  - 签证要求
  - 航空公司行李规定
pitfalls:
  - 不要超重
  - 不要带禁运物品
faq_questions:
  - 出国行李能带什么？
next_steps:
  - 第一次使用集运清单
publish_mode: draft
requires_human_review: true
```

### Topic Pack 字段说明

| 字段 | 必填 | 说明 |
|---|---|---|
| `type` | ✅ | 固定 `"checklist"` |
| `title` | ✅ | 中文标题 |
| `audience` | ✅ | 目标用户群体 |
| `region` | ✅ | 地理区域（通用/北美/欧洲等） |
| `city` | 可选 | 城市（为空表示通用） |
| `scenario` | ✅ | 使用场景描述 |
| `primary_intent` | ✅ | 清单主要目的 |
| `difficulty` | ✅ | `easy` / `medium` / `hard` |
| `estimated_time` | ✅ | 预计耗时 |
| `sections` | ✅ | 分组标题列表（至少 2 个） |
| `related_tools` | ✅ | 相关工具 slug（至少 2 个） |
| `related_topics` | 可选 | 相关专题 slug |
| `related_articles` | 可选 | 相关文章 slug |
| `official_links_needed` | ✅ | 需要的官方链接标签 |
| `pitfalls` | ✅ | 避坑提示（至少 3 条） |
| `faq_questions` | ✅ | FAQ 问题（至少 3 个） |
| `next_steps` | 可选 | 下一步推荐清单 |
| `publish_mode` | ✅ | 固定 `"draft"` |
| `requires_human_review` | ✅ | 固定 `true` |

## 输出格式：Draft JSON

输出为 `LandingPage` 模型可直接写入的 JSON：

```json
{
  "slug": "student-first-abroad-packing-checklist",
  "title": "留学生第一次出国行李准备清单",
  "seoTitle": "留学生第一次出国行李准备清单（完整版）",
  "seoDescription": "...",
  "pageType": "checklist",
  "status": "draft",
  "relatedTools": ["address-formatter", "shipping-calculator", "invoice"],
  "relatedTopics": [],
  "relatedArticles": [],
  "ctaConfig": { "text": "开始使用工具", "url": "/tools" },
  "heroSection": {
    "checklistType": "packing",
    "audience": "留学生",
    "region": "通用",
    "city": "",
    "scenario": "第一次出国留学",
    "difficulty": "easy",
    "estimatedTime": "2-3小时",
    "quickAnswer": "...",
    "summary": "...",
    "sections": [
      {
        "id": "sec-1",
        "title": "一、证件与文件",
        "description": "",
        "items": [
          {
            "id": "item-1",
            "title": "护照及签证",
            "description": "确认护照有效期 6 个月以上",
            "category": "证件与文件",
            "required": true,
            "priority": "high",
            "timing": "出发前",
            "warning": "",
            "relatedToolSlug": "",
            "officialLink": { "label": "", "url": "" },
            "completedDefault": false
          }
        ]
      }
    ],
    "avoidPitfalls": ["避坑1", "避坑2", "避坑3"],
    "nextSteps": ["下一步清单1"],
    "lastReviewedAt": "2026-06-09",
    "requiresHumanReview": true,
    "internalLinks": {
      "backToTopic": "/topics/study-abroad",
      "relatedTools": ["/tools/address-formatter", "/tools/shipping-calculator"],
      "relatedArticles": [],
      "nextChecklists": ["first-shipping-checklist"]
    }
  },
  "faqItems": [
    { "question": "...", "answer": "..." }
  ],
  "officialLinks": [
    { "label": "签证要求", "url": "", "needsReview": true },
    { "label": "航空公司行李规定", "url": "", "needsReview": true }
  ]
}
```

## 生成流程

1. **读取选题包** — 解析 YAML/JSON topic pack
2. **生成 draft JSON** — 填充所有必填字段
3. **运行校验脚本** — `node scripts/validate-checklist-draft.mjs <json-file>`
4. **校验通过** — 保存到 `content-drafts/checklists/`
5. **（可选）导入数据库** — 人工执行 `node scripts/import-checklist-draft.mjs <json-file>`
6. **Admin 人工审核** — `/admin/landing-pages` 查看 draft
7. **人工发布** — 手动改为 `published`

## SEO/内链要求

- ✅ 必须生成 `seoTitle`（30-60 字符）
- ✅ 必须生成 `seoDescription`（80-160 字符）
- ✅ 必须生成 `internalLinks`（backToTopic, relatedTools, relatedArticles, nextChecklists）
- ✅ 必须有 `relatedTools`（至少 2 个）
- ✅ 必须有 `FAQ`（至少 3 个）
- ✅ 必须有 `nextSteps`（至少 2 个）
- ✅ 必须有 `avoidPitfalls`（至少 3 条）
- ✅ 锚文本必须具体，禁止"点击这里""查看更多"

## ChecklistItem 优先级

- `"high"` — 高优先级，红色标记
- `"medium"` — 中优先级，橙色标记
- `"low"` — 低优先级，无标记

## 高风险内容标记

以下内容必须添加 `[需人工核验]` 标记：

- 签证类型、材料清单、办理时限
- 海关免税额度、禁运物品清单
- 税务政策、申报金额限制
- 医疗要求（体检、疫苗、保险）
- 法律法规条款
- 航空公司/物流公司的具体运费/时效

标记位置：`ChecklistItem.warning` 或 `avoidPitfalls` 数组项

## 人工审核检查清单

- [ ] 所有 `[需人工核验]` 标记的内容已核实
- [ ] 官方链接 URL 已填写
- [ ] 政策/法律条款未编造
- [ ] 费用/时效数据准确
- [ ] SEO title/description 合理
- [ ] 内部链接目标存在且正确
- [ ] 无敏感信息泄露
- [ ] 拼写/语法无误

审核通过后，在 Admin 中将 status 从 `draft` 改为 `published`。

## 脚本说明

### validate-checklist-draft.mjs

校验清单 draft JSON 是否符合规范。

```bash
node scripts/validate-checklist-draft.mjs <json-file>
```

校验项：status=draft, pageType=checklist, slug 格式, sections/items 数量, FAQ, relatedTools 等。

### import-checklist-draft.mjs

导入 draft 到 LandingPage 数据库（**强制 status=draft**）。

```bash
node scripts/import-checklist-draft.mjs <json-file>
```

安全规则：
- 不写入 published
- 不删除已有正式内容
- 支持 upsert by slug

### hermes-generate-checklist-draft.mjs

Wrapper 脚本：生成 + 校验 + 可选导入。

```bash
# 生成 + 校验
node scripts/hermes-generate-checklist-draft.mjs <topic-pack-yaml>

# 生成 + 校验 + 导入 draft
node scripts/hermes-generate-checklist-draft.mjs <topic-pack-yaml> --import-draft
```

注意：
- 脚本中**不调用外部 LLM API**（由 Hermes Agent 负责生成正文）
- 脚本只负责结构补齐、校验和保存
- **不写入任何 secret**
- **不自动 published**
