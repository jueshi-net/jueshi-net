# 工具内容后台配置规格

## 一、现有 CMS

项目已有 Article 模型，可用于工具配套内容。

## 二、映射方案

### 方案 A: 复用 Article 模型
- Article.category = "tool-guide" / "tool-faq" / "tool-errors"
- Article.tags = [toolSlug]
- 优点: 不需要 migration
- 缺点: FAQ/错误结构化程度不够

### 方案 B: 前端配置组件 (当前 MVP)
- 内容直接写在组件中 (tool-content-section.tsx)
- 优点: 快速、无依赖
- 缺点: 非技术用户无法编辑

### 方案 C: JSON 配置 + 后台编辑
- 创建 ToolContent JSON 文件
- 后台可编辑 JSON
- 优点: 灵活、可后台化
- 缺点: 需要开发后台编辑器

## 三、推荐路径

1. 当前: 前端配置 (MVP) ✅
2. 短期: 方案 A — 复用 Article 模型，按 category + tags 关联
3. 中期: 方案 C — JSON 配置 + 后台编辑器

## 四、字段需求

```
ToolContent {
  toolSlug: string       // 工具路由 slug
  guideId?: string       // Article ID (使用指南)
  faqIds: string[]       // Article IDs (FAQ)
  errorEntries: ErrorEntry[]  // 结构化错误列表
  templateIds: string[]  // 模板 IDs
  seoTitle?: string
  seoDescription?: string
  canonical?: string
}
```
