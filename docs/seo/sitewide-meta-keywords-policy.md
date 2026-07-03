# Sitewide Meta Keywords Policy

**版本**: v1.0  
**创建时间**: 2026-07-03  
**适用范围**: jueshi.net 全站

---

## 概述

Meta keywords 标签虽然不是 Google 排名核心因素，但国内站长工具（如站长之家、5118 等）会检查该字段。补齐 meta keywords 有利于基础 SEO 体检完整性。

---

## 核心规则

### 1. 数量限制

- **每页 5-15 个关键词**
- 不超过 15 个，避免堆砌嫌疑
- 不少于 5 个，确保覆盖面

### 2. 格式规范

- **中文逗号分隔**: `关键词1，关键词2，关键词3`
- **不堆砌**: 不放重复或无意义的词
- **不放与页面无关的词**: 每个关键词必须与页面内容相关

### 3. 页面类型策略

#### 首页 (/)

覆盖范围：
- 品牌词：绝世百宝箱
- 核心工具：邮编查询、HS编码、汇率换算、运费计算
- 用户场景：海外华人、跨境电商、留学生活、外贸单据
- 内容类型：指南、清单、工具导航

**示例**:
```
绝世百宝箱，海外华人工具，跨境工具，邮编查询，HS编码查询，汇率换算，国际运费计算，外贸单据工具，海外生活指南，出国清单，跨境电商工具，实用工具导航
```

#### 分类页 (/tools, /checklists, /guides, /topics, /resources)

覆盖范围：
- 分类意图：工具中心、清单、指南、专题、资源导航
- 核心功能：该分类下的主要功能
- 目标用户：该分类面向的用户群体

**示例 (/tools)**:
```
工具中心，跨境工具，外贸工具，海外华人工具，实用工具，在线工具，免费工具，跨境电商工具，物流工具，单据工具
```

#### 工具页 (/tools/postal-code, /tools/hs-code, /tools/exchange-rate)

覆盖范围：
- 工具名称：邮编查询、HS编码查询、汇率换算
- 常见搜索词：国际邮编、商品编码、货币汇率
- 使用场景：寄件、集运、外贸、跨境电商

**示例 (/tools/postal-code)**:
```
邮编查询，国际邮编，海外邮编，地址查询，集运邮编，国际快递邮编，加拿大邮编，美国邮编，英国邮编，澳大利亚邮编
```

#### 内容页 (/checklists/[slug], /guides/[slug], /topics/[slug])

覆盖范围：
- 优先使用 `metadataJson.contentOps.primaryKeyword`
- 合并 `secondaryKeywords`
- 合并页面类型词（清单/指南/专题）
- 限制总数不超过 15
- 去重

**示例 (/checklists/student-pre-departure-checklist)**:
```
留学生出国准备，出国留学清单，留学生行前准备，出国前checklist，留学生出国前准备清单，留学准备，海外生活清单，出国清单，留学生必备清单
```

### 4. 特殊页面规则

#### Draft 页面

- **不输出 index keywords** 或仍 **noindex**
- 保持 `robots: noindex, nofollow`

#### Preview 页面

- **永远 noindex, nofollow**
- 不输出 keywords

#### Staging 页面 (i.jueshi.net)

- **永远 noindex, nofollow**
- 不输出 keywords

#### Archived 页面

- **不输出 index keywords** 或仍 **noindex**
- 保持 `robots: noindex, nofollow`

---

## 实施检查清单

- [ ] 首页 keywords 已添加
- [ ] 工具中心 keywords 已添加
- [ ] 资源目录 keywords 已添加
- [ ] 清单列表 keywords 已添加
- [ ] 指南列表 keywords 已添加
- [ ] 专题列表 keywords 已添加
- [ ] 核心工具页 keywords 已添加
- [ ] 已发布内容页 keywords 已添加
- [ ] Draft 页面未输出 keywords
- [ ] Preview 页面未输出 keywords
- [ ] Staging 页面未输出 keywords
- [ ] Archived 页面未输出 keywords

---

## 验证方法

### 1. HTML 检查

```bash
curl -s "https://jueshi.net" | grep '<meta name="keywords"'
```

预期输出：
```html
<meta name="keywords" content="绝世百宝箱，海外华人工具，跨境工具，..." />
```

### 2. 站长工具检查

使用站长之家、5118 等工具检查：
- Keywords 字段不为空
- 关键词数量在 5-15 个之间
- 关键词与页面内容相关

### 3. SEO 审计工具

使用 Screaming Frog、Ahrefs 等工具审计：
- 无重复 keywords
- 无堆砌 keywords
- 无无关 keywords

---

## 更新记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-07-03 | 初始版本 |

---

## 参考

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Meta Keywords - Does Google Use Them?](https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag)
- [Baidu SEO Guidelines](https://ziyuan.baidu.com/course/wikiinfo?tagid=300005)
