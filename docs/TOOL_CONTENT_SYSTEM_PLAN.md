# 工具配套内容系统规划

## 一、目标

围绕工具补内容，不先做大 CMS。每个核心工具配套：
- 使用指南
- FAQ
- 常见错误
- 示例模板
- 官方资源链接
- 社区讨论链接
- 清单

## 二、内容结构

### 2.1 工具内容关联

```typescript
interface ToolContent {
  toolSlug: string;           // 工具路由
  guideId?: string;           // 使用指南 ID
  faqIds: string[];           // FAQ ID 列表
  commonErrors: ErrorEntry[];
  templateIds: string[];      // 示例模板
  officialResourceIds: string[];
  communityTopicIds: string[];
  checklistIds: string[];
}

interface ErrorEntry {
  id: string;
  title: string;
  description: string;
  solution: string;
  severity: 'info' | 'warning' | 'error';
}
```

### 2.2 内容字段

每个内容项需要：
- title
- description
- content (markdown)
- SEO title / description / canonical
- status: draft / preview / published / archived
- publishDate
- author
- relatedTool

## 三、发布流程

1. 草稿 → 预览 → 发布 → 归档
2. SEO 检查（title/description/canonical）
3. staging 预览 → production 发布
4. 后台可配置

## 四、SEO 规范

- 每个工具页面有独立的 SEO title/description
- canonical URL 指向工具页面
- 内容页面 canonical 指向内容页面
- robots.txt 控制索引
- sitemap.xml 包含工具+内容页面

## 五、staging 实现方案

### 5.1 工具页面区块

在工具页面底部添加：

```tsx
<div className="tool-content-section">
  <RelatedGuides toolSlug={slug} />
  <FAQSection toolSlug={slug} />
  <CommonErrors toolSlug={slug} />
  <RelatedResources toolSlug={slug} />
</div>
```

### 5.2 后台配置

- 如果现有 CMS（Article）支持，复用
- 否则使用 JSON 配置文件（admin 可编辑）
- 无内容时显示默认提示，不留大坑

### 5.3 样板内容

优先为以下工具创建样板：
1. 商业发票 (commercial-invoice)
2. 装箱单 (packing-list)
3. 邮编查询 (postal-code)

每个样板包含：
- 1 篇使用指南（500-800字）
- 3-5 条 FAQ
- 2-3 条常见错误
- 1 个示例模板
- 2-3 个官方资源链接

## 六、审计

- 工具页面显示配套内容 ✅
- 无内容时无空白大坑 ✅
- SEO meta 正确 ✅
- 移动端正常 ✅
