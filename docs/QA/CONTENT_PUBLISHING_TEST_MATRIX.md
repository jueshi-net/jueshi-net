# 内容发布测试矩阵 — v1.20.42.18.6.6.7

---

## 测试范围

| # | 测试项 | 环境 | 前置条件 | 操作步骤 | 预期结果 | 严重级别 |
|---|--------|------|----------|----------|----------|----------|
| CP-01 | 用户选题 | staging | admin 登录 | 确定选题方向 | 选题记录 | P3 |
| CP-02 | Hermes 草稿生成 | staging | admin 登录 | 生成内容草稿 | 草稿保存 | P2 |
| CP-03 | 编辑草稿 | staging | 有草稿 | 修改标题/内容 | 保存成功 | P2 |
| CP-04 | SEO 标题 | staging | 编辑草稿 | 填写 meta title | 保存成功，预览正确 | P1 |
| CP-05 | SEO 描述 | staging | 编辑草稿 | 填写 meta description | 保存成功 | P1 |
| CP-06 | canonical | staging | 编辑草稿 | 设置 canonical | 正确 | P1 |
| CP-07 | index/noindex | staging | 编辑草稿 | 设置 index 状态 | 正确 | P1 |
| CP-08 | 预览 | staging | 有草稿 | 点击预览 | 新窗口打开 | P2 |
| CP-09 | 发布到 staging | staging | 有草稿 | 点击发布 | 发布成功 | P1 |
| CP-10 | 归档 | staging | 有已发布内容 | 点击归档 | 内容下架 | P2 |
| CP-11 | 关联专题 | staging | 编辑草稿 | 选择关联专题 | 关联成功 | P2 |
| CP-12 | 关联文章 | staging | 编辑草稿 | 选择关联文章 | 关联成功 | P2 |
| CP-13 | 关联清单 | staging | 编辑草稿 | 选择关联清单 | 关联成功 | P2 |
| CP-14 | 图片上传 | staging | 编辑草稿 | 上传图片 | 成功 | P2 |
| CP-15 | XSS 输入 | staging | 编辑草稿 | 输入 <script> | 被过滤 | P2 |
| CP-16 | Markdown 格式 | staging | 编辑草稿 | 使用 Markdown | 正确渲染 | P2 |
| CP-17 | 外链安全 | staging | 编辑草稿 | 添加外链 | rel=nofollow | P2 |
| CP-18 | 错别字检查 | staging | 有草稿 | 检查内容 | 无错别字 | P3 |
| CP-19 | 重复内容 | staging | 有草稿 | 检查 canonical | 无重复 | P1 |
| CP-20 | 发布确认 | staging | 有草稿 | 确认发布 | 需用户确认 | P1 |
