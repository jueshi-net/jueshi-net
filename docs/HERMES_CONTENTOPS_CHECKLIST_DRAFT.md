# Hermes ContentOps Checklist Draft Generator — 规范与红线

> **版本：** v1.20.42.6.25
> **日期：** 2026-06-09
> **状态：** ✅ MVP 已建立

---

## 1. 核心红线

### 永远只能生成 `draft`

- **Hermes 生成的清单必须 `status = "draft"`，永远不允许 `status = "published"`。**
- `publish_mode` 字段固定为 `"draft"`，输入 `published` 时强制降级为 `draft` 并输出 warning。
- 所有 draft 必须经过**人工审核**后才能由 Admin 手动发布。

### 不编造高风险内容

- 政策、法律、签证、海关、医疗、税务等内容必须标注 `[需人工核验]`。
- 不编造官方数据、费用金额、办理时限、法律条文。
- 所有官方链接必须保留占位，URL 可为空但 `label` 必须明确。

### 不批量生成

- 每次只处理一个选题包。
- 不自动循环生成多篇清单。

---

## 2. Hermes 输入格式（选题包）

使用 YAML 格式输入，字段如下：

```yaml
type: checklist
title: 第一次使用集运注意事项清单
audience: 海外华人 / 留学生 / 跨境卖家
region: 通用
city: ""
scenario: 第一次使用集运
primary_intent: 帮助用户完成第一次集运前的准备和避坑
difficulty: medium
estimated_time: "1-2小时"
sections:
  - 下单前准备
  - 仓库地址填写
  - 包裹入库与申报
  - 支付与发货
related_tools:
  - postal-code
  - address-formatter
  - shipping-calculator
  - invoice
related_topics:
  - cross-border-shipping
related_articles: []
official_links_needed:
  - 海关政策
  - 物流公司规则
pitfalls:
  - 不要低报价值
  - 不要寄禁运物品
faq_questions:
  - 第一次集运最容易出错的地方是什么？
next_steps:
  - 商业发票准备清单
  - 国际快递发货前检查清单
publish_mode: draft
requires_human_review: true
```

---

## 3. 输出 JSON 格式（LandingPage 写入结构）

Hermes 根据选题包生成以下 JSON，通过 `scripts/import-checklist-draft.mjs` 写入 `LandingPage`：

```json
{
  "slug": "first-shipping-checklist",
  "title": "第一次使用集运注意事项清单",
  "seoTitle": "第一次使用集运注意事项清单（完整版）",
  "seoDescription": "涵盖集运发货前的所有必要步骤，从地址获取、包装要求、申报规范到物流追踪，助你避开新手常见坑点。",
  "pageType": "checklist",
  "status": "draft",
  "relatedTools": ["postal-code", "address-formatter", "shipping-calculator", "invoice"],
  "relatedTopics": ["cross-border-shipping"],
  "relatedArticles": [],
  "ctaConfig": { "text": "开始使用工具", "url": "/tools" },
  "heroSection": {
    "checklistType": "shipping",
    "audience": "海外华人 / 留学生 / 跨境卖家",
    "region": "通用",
    "city": "",
    "scenario": "第一次使用集运",
    "difficulty": "medium",
    "estimatedTime": "1-2小时",
    "quickAnswer": "集运核心流程：获取海外仓地址 → 国内采购/发货至海外仓 → 仓库合箱打包 → 支付国际运费 → 等待签收。",
    "summary": "本清单涵盖首次使用集运发货前的所有必要步骤...",
    "sections": [...],
    "avoidPitfalls": [...],
    "nextSteps": [...],
    "lastReviewedAt": "2026-06-09",
    "requiresHumanReview": true,
    "internalLinks": {
      "backToTopic": "/topics/cross-border-shipping",
      "relatedTools": ["/tools/postal-code", "/tools/address-formatter"],
      "relatedArticles": [],
      "nextChecklists": ["commercial-invoice-checklist"]
    }
  },
  "faqItems": [
    { "question": "...", "answer": "..." }
  ],
  "officialLinks": [
    { "label": "海关政策", "url": "" },
    { "label": "物流公司规则", "url": "" }
  ]
}
```

---

## 4. LandingPage 字段映射

| LandingPage 字段 | 来源 | 说明 |
|---|---|---|
| `slug` | 生成 | 小写英文连字符，如 `first-shipping-checklist` |
| `title` | 输入 | 中文标题 |
| `seoTitle` | 生成 | 通常为 `title` + 补充词，或直接复用 `title` |
| `seoDescription` | 生成 | 80-160 字符，包含核心关键词 |
| `pageType` | 固定 | `"checklist"` |
| `status` | 固定 | `"draft"`（红线：绝不写入 `published`） |
| `relatedTools` | 输入 | 工具 slug 数组，至少 2 个 |
| `relatedTopics` | 输入 | 专题 slug 数组 |
| `relatedArticles` | 输入 | 文章 slug 数组 |
| `heroSection` | 生成 | 见下方 heroSection 结构 |
| `faqItems` | 生成 | 至少 3 个 FAQ |
| `officialLinks` | 生成 | 占位，URL 可为空 |
| `ctaConfig` | 默认 | `{ text: "开始使用工具", url: "/tools" }` |

---

## 5. heroSection JSON 结构

```json
{
  "checklistType": "shipping",
  "audience": "海外华人",
  "region": "通用",
  "city": "",
  "scenario": "第一次使用集运",
  "difficulty": "medium",
  "estimatedTime": "1-2小时",
  "quickAnswer": "一句话核心结论",
  "summary": "清单简介（100-200字）",
  "sections": [Section],
  "avoidPitfalls": ["避坑1", "避坑2"],
  "nextSteps": ["下一步清单1", "下一步清单2"],
  "lastReviewedAt": "2026-06-09",
  "requiresHumanReview": true,
  "internalLinks": {
    "backToTopic": "/topics/xxx",
    "relatedTools": ["/tools/xxx"],
    "relatedArticles": [],
    "nextChecklists": ["xxx-checklist"]
  }
}
```

---

## 6. ChecklistItem 结构

```json
{
  "id": "item-1",
  "title": "步骤标题",
  "description": "详细说明（可选）",
  "category": "所属分组（与 Section title 一致）",
  "required": true,
  "priority": "high",
  "timing": "时机描述",
  "warning": "[需人工核验] 警告内容",
  "relatedToolSlug": "tool-slug",
  "officialLink": { "label": "官方链接名称", "url": "" },
  "completedDefault": false
}
```

### priority 取值
- `"high"` — 高优先级，红色标记
- `"medium"` — 中优先级，橙色标记
- `"low"` — 低优先级，无标记

---

## 7. Section 结构

```json
{
  "id": "sec-1",
  "title": "一、分组标题",
  "description": "分组说明（可选）",
  "items": [ChecklistItem]
}
```

- 至少 2 个 Section
- 每个 Section 至少 3 个 ChecklistItem
- 总 ChecklistItem 数至少 8 个

---

## 8. SEO 字段规则

1. `seoTitle` 长度 30-60 字符，必须包含核心搜索意图。
2. `seoDescription` 长度 80-160 字符，包含关键词但不堆砌。
3. `canonical` 由页面自动生成，格式 `https://jueshi.net/checklists/[slug]`。
4. `draft/hidden` 不生成 SEO metadata（`notFound()`）。
5. 不与专题页抢同一关键词。

---

## 9. internal_links 规则

1. `backToTopic` — 回链所属专题（必填）。
2. `relatedTools` — 链向相关工具页（至少 2 个）。
3. `relatedArticles` — 链向相关文章（可选）。
4. `nextChecklists` — 推荐下一步清单（至少 1 个）。
5. 锚文本必须具体，不使用"点击这里"。

---

## 10. 官方链接占位规则

1. `officialLinks` 数组中的每个条目必须有 `label`（描述性名称）。
2. `url` 可为空字符串 `""`，表示待人工填写。
3. URL 待填写的条目必须在 Admin 中可见标记。
4. 已确认的官方链接必须使用 `rel="nofollow noopener noreferrer"`。

---

## 11. 高风险内容标记规则

以下内容类型必须添加 `[需人工核验]` 标记：

- 签证类型、材料清单、办理时限
- 海关免税额度、禁运物品清单
- 税务政策、申报金额限制
- 医疗要求（体检、疫苗、保险）
- 法律法规条款
- 航空公司/物流公司的具体运费/时效

标记位置：
- `ChecklistItem.warning` 字段
- `avoidPitfalls` 数组项

---

## 12. 人工审核要求

生成 draft 后，必须由人工审核以下内容：

- [ ] 所有 `[需人工核验]` 标记的内容已核实
- [ ] 官方链接 URL 已填写
- [ ] 政策/法律条款未编造
- [ ] 费用/时效数据准确
- [ ] SEO title/description 合理
- [ ] 内部链接目标存在且正确
- [ ] 无敏感信息泄露
- [ ] 拼写/语法无误

审核通过后，在 Admin 中将 status 从 `draft` 改为 `published`。

---

## 13. 工具使用流程

```
1. 编写选题包 YAML → content-drafts/checklists/*.yaml
2. Hermes 根据 YAML 生成 JSON draft → content-drafts/checklists/*.json
3. 运行校验脚本 → node scripts/validate-checklist-draft.mjs *.json
4. 运行导入脚本 → node scripts/import-checklist-draft.mjs *.json
5. Admin 审核 → /admin/landing-pages 查看 draft
6. 人工修改（如需）→ 通过 Admin JSON 编辑区调整
7. 发布 → 手动改为 published
```

---

## 14. 红线检查清单

- [x] `status` 永远只能是 `"draft"`
- [x] `publish_mode` 固定为 `"draft"`
- [x] 不批量生成
- [x] 不编造高风险内容
- [x] 官方链接必须占位
- [x] `[需人工核验]` 标记不可省略
- [x] 内部链接必须存在
- [x] FAQ 至少 3 个
- [x] Section 至少 2 个
- [x] ChecklistItem 至少 8 个
