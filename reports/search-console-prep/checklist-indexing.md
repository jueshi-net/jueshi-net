# Search Console Prep — Checklist Pages

**Date:** 2026-06-10
**Version:** v1.20.42.6.34

## 当前状态

- 已有 2 篇 published checklist：
  - `/checklists/student-first-abroad-packing-checklist`
  - `/checklists/first-shipping-checklist`
- sitemap.xml 已自动包含这两篇
- robots.txt 正常，无阻止抓取

## Google Search Console 准备步骤

### 1. 验证网站所有权
- 已有 Google Search Console 账户
- jueshi.net 已验证（DNS TXT 或 HTML 文件）
- 确认 sitemap URL：`https://jueshi.net/sitemap.xml`

### 2. 提交 Sitemap
- 进入 Search Console → jueshi.net → Sitemaps
- 提交 `sitemap.xml`
- 确认状态为"成功"

### 3. 检查 URL 收录
- 检查以下 URL 的收录状态：
  - `https://jueshi.net/checklists/student-first-abroad-packing-checklist`
  - `https://jueshi.net/checklists/first-shipping-checklist`
- 使用 "URL 检查" 工具逐个检查
- 如未收录，点击"请求编入索引"

### 4. 监控索引覆盖
- 检查 "页面" → "已编入索引" 是否包含 checklist 页面
- 检查 "已排除" 是否有 checklist 页面的异常排除原因
- 常见排除原因及处理：
  - "已抓取 - 尚未编入索引" → 正常，等待 1-3 天
  - "被 robots.txt 阻止" → 检查 robots.txt
  - "替代网页" → 检查 canonical URL

### 5. 核心网页指标
- 监控 checklist 页面的 Core Web Vitals：
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1
- 使用 PageSpeed Insights 测试 checklist 页面

## Bing Webmaster Tools

### 1. 验证网站
- 类似 Google Search Console，提交 Bing Webmaster

### 2. 提交 Sitemap
- 提交 `https://jueshi.net/sitemap.xml`

## 索引优化建议

### Checklist 页面 SEO 特征
- 每篇有独立 `<title>` 和 `<meta description>`
- 有 `<h1>` 标题
- 有 canonical URL
- 有结构化数据（如 FAQ）
- 页面加载速度良好

### 需要关注的问题
- FAQ 是客户端渲染，Google 可能需要额外时间解析
- 相关工具和相关清单的链接结构影响内链权重
- 建议后续为 checklist 页面添加 JSON-LD FAQ schema

## 下一步

1. 在 Search Console 提交 sitemap
2. 检查 URL 收录状态
3. 观察 7-14 天的索引和流量数据
4. 根据数据决定是否发布更多 checklist
