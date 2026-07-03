# 自然语言到 Draft 的完整工作流

**版本**: v1.0  
**创建时间**: 2026-07-03  
**适用范围**: Hermes 生成 checklist/guide/topic 内容

---

## 概述

本文档说明从用户给选题到最终发布的完整流程。Hermes 负责生成内容草稿，用户负责审核和发布。

---

## 完整流程

### 1. 用户给选题

**示例**:
```
请帮我创建一篇关于"加拿大留学行前准备清单"的内容。

目标用户：准留学生和留学生家长
目标国家：加拿大
受众阶段：准备出国阶段
```

### 2. Hermes 判断类型

Hermes 根据选题自动判断内容类型：
- **checklist**: 清单类内容（步骤、检查项）
- **guide**: 指南类内容（教程、说明）
- **topic**: 专题类内容（APP 评测、工具对比）

**判断依据**:
- 包含"清单"、"步骤"、"检查" → checklist
- 包含"指南"、"教程"、"如何" → guide
- 包含"评测"、"对比"、"推荐" → topic

### 3. Hermes 生成 payload

Hermes 自动生成完整的 payload，包括：

**基础字段**:
- title: 标题
- slug: URL 标识
- summary: 摘要
- steps/body: 内容主体

**SEO/GEO 字段** (metadataJson.contentOps):
- primaryKeyword: 主关键词
- secondaryKeywords: 副关键词数组 (5-10 个)
- seo.metaKeywords: Meta keywords (5-15 个)
- seo.searchIntent: 搜索意图
- seo.targetAudience: 目标受众
- seo.audienceStage: 受众阶段
- seo.targetCountries: 目标国家
- seo.targetSearchEngines: 目标搜索引擎
- qualityScore: 质量评分
- faq: FAQ 数组
- internalLinks: 内链数组

**示例 payload**:
```json
{
  "title": "加拿大留学行前准备清单",
  "slug": "canada-student-pre-departure-checklist",
  "summary": "加拿大留学行前必做事项清单：从签证到报到，一步步帮你做好准备。",
  "steps": [
    { "title": "确认签证", "description": "检查签证有效期，确认入境要求。" },
    { "title": "购买机票", "description": "比较价格，选择合适航班。" }
  ],
  "metadataJson": {
    "contentOps": {
      "primaryKeyword": "加拿大留学行前准备清单",
      "secondaryKeywords": [
        "加拿大留学清单",
        "加拿大留学行前准备",
        "加拿大留学出发前准备"
      ],
      "seo": {
        "metaKeywords": "加拿大留学,留学清单,行前准备,留学生家长,加拿大留学准备",
        "searchIntent": "informational",
        "targetAudience": "即将前往加拿大留学的学生和家长",
        "audienceStage": "准备出国阶段",
        "targetCountries": ["加拿大"],
        "targetSearchEngines": ["Google", "Baidu", "Bing"]
      },
      "qualityScore": 85,
      "faq": [
        { "question": "加拿大留学前多久开始准备？", "answer": "建议提前3-6个月开始准备。" }
      ],
      "internalLinks": [
        { "slug": "student-pre-departure-checklist", "title": "留学生出国前准备清单", "reason": "相关清单" }
      ]
    }
  }
}
```

### 4. Validator 检查

Hermes 自动验证 payload：
- ✅ title 不为空
- ✅ slug 不为空且唯一
- ✅ steps/body 不为空
- ✅ metadataJson.contentOps.seo 完整
- ✅ primaryKeyword 存在
- ✅ secondaryKeywords 5-10 个
- ✅ metaKeywords 5-15 个
- ✅ qualityScore >= 80

### 5. Dry-run 输出

Hermes 输出 dry-run 摘要：
```
=== ContentOps Draft Dry-Run ===

Type: checklist
Title: 加拿大留学行前准备清单
Slug: canada-student-pre-departure-checklist
Status: draft

SEO/GEO:
- Primary Keyword: 加拿大留学行前准备清单
- Secondary Keywords: 3 个
- Meta Keywords: 5 个
- Quality Score: 85/100

Validation: ✅ PASS

Ready to create draft? (yes/no)
```

### 6. Staging 创建 draft

用户确认后，Hermes 在 staging 创建 draft：
```bash
POST /api/admin/checklists
{
  "title": "加拿大留学行前准备清单",
  "slug": "canada-student-pre-departure-checklist",
  "status": "draft",
  "metadataJson": { ... }
}
```

**返回**:
```json
{
  "id": "cmr1prod000000000000002",
  "slug": "canada-student-pre-departure-checklist",
  "status": "draft"
}
```

### 7. Production 创建 draft

Staging 验证通过后，Hermes 在 production 创建 draft：
```bash
POST /api/admin/checklists
{
  "title": "加拿大留学行前准备清单",
  "slug": "canada-student-pre-departure-checklist",
  "status": "draft",
  "metadataJson": { ... }
}
```

### 8. 用户后台审核

用户登录后台审核 draft：
1. 访问: https://jueshi.net/admin/content/checklists
2. 找到新创建的 draft
3. 点击编辑
4. 审核内容：
   - 基础信息（标题、摘要、步骤）
   - SEO/GEO 设置（关键词、受众、搜索引擎）
   - ContentOps 元数据（质量评分、FAQ、内链）
5. 修改或确认

### 9. 用户手动发布

用户确认无误后，手动发布：
1. 在编辑页面，将状态改为 "published"
2. 点击保存
3. 系统自动设置 publishedAt
4. 系统自动更新 robots 为 "index,follow"

### 10. 发布后 SEO 验证

发布后，Hermes 自动验证：
- ✅ public URL 返回 200
- ✅ sitemap 包含该 URL
- ✅ 列表页包含该 draft
- ✅ meta keywords 正确输出
- ✅ title/description/canonical 正确
- ✅ 无 noindex

---

## 关键原则

### Hermes 不自动发布

- ✅ Hermes 默认创建 draft
- ✅ Hermes 不自动改变 status
- ✅ 用户审核后才发布

### SEO/GEO 自动生成

- ✅ Hermes 自动生成 primaryKeyword
- ✅ Hermes 自动生成 secondaryKeywords
- ✅ Hermes 自动生成 metaKeywords
- ✅ 后台可编辑覆盖

### 安全性

- ✅ draft 不进 sitemap
- ✅ draft 不在列表页显示
- ✅ draft 的 public URL 返回 404
- ✅ preview 需要 admin 登录

---

## 示例：用一句自然语言创建第二篇草稿

**用户输入**:
```
请帮我创建一篇关于"美国留学行前准备清单"的内容。

目标用户：准留学生和留学生家长
目标国家：美国
受众阶段：准备出国阶段
```

**Hermes 自动完成**:
1. 判断类型：checklist
2. 生成 payload（包含完整 SEO/GEO 字段）
3. 验证 payload
4. 输出 dry-run 摘要
5. 在 staging 创建 draft
6. 在 production 创建 draft
7. 返回 draftId 和编辑链接

**用户操作**:
1. 登录后台
2. 编辑 draft
3. 审核内容
4. 手动发布

---

## 相关文件

- **CLI 脚本**: `scripts/create-contentops-draft.mjs`
- **Validator**: `scripts/validate-contentops-payload.mjs`
- **Schema**: `docs/contentops/contentops-payload-schema.md`
- **SEO 规范**: `docs/seo/admin-seo-keywords-fields-spec.md`
- **自动关键词规则**: `docs/seo/contentops-auto-keyword-generation-rules.md`

---

## 更新记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-07-03 | 初始版本 |
