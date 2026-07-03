# China Search Engine Optimization Policy

**版本**: v1.0  
**创建时间**: 2026-07-03  
**适用范围**: jueshi.net 面向国内搜索引擎的 SEO 策略

---

## 概述

jueshi.net 不仅面向海外华人，也面向还未出海的人、准留学生、家长、跨境卖家和想了解海外知识的国内用户。因此需要优化国内搜索引擎（百度、360、搜狗、神马、Bing）。

---

## 必须做（基础）

### 1. 百度搜索资源平台接入

**步骤**：
1. 注册百度搜索资源平台账号
2. 验证站点所有权（DNS 验证或文件验证）
3. 提交 sitemap
4. 配置 robots.txt
5. 开启自动推送（JS 代码）

**提交 URL**：
- https://jueshi.net/sitemap.xml

### 2. Sitemap 提交

**必须提交**：
- 百度: https://ziyuan.baidu.com/
- 360: https://zhanzhang.so.com/
- 搜狗: https://zhanzhang.sogou.com/
- 神马: https://zhanzhang.sm.cn/
- Bing: https://www.bing.com/webmasters/

### 3. robots.txt 检查

**当前 robots.txt**：
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://jueshi.net/sitemap.xml
```

**检查项**：
- ✅ 允许所有爬虫抓取首页
- ✅ 禁止抓取 admin 和 api
- ✅ 包含 sitemap 路径
- ⚠️ 后续可添加百度专用规则

### 4. 页面 title/description/keywords 三件套

**已完成**（v1.20.42.18.6.16.6.80）：
- ✅ 首页 keywords 已添加
- ✅ 核心页面 keywords 已添加
- ✅ 内容页 keywords 从 metadataJson 提取

### 5. 中文长尾词策略

**必须覆盖**：
- 准留学生：出国留学准备、留学清单、出国前要准备什么
- 留学生家长：送孩子出国准备、留学生家长须知、孩子出国留学要准备什么
- 未出海人群：海外生活指南、出国攻略、海外生活攻略
- 跨境卖家：跨境电商工具、外贸单据、国际物流
- 外贸从业者：HS编码查询、商业发票、装箱单

### 6. 移动端体验

**检查项**：
- ✅ 响应式设计
- ✅ 移动端加载速度
- ✅ 移动端可访问性
- ⚠️ 后续可优化 Core Web Vitals

### 7. 避免关键词堆砌

**规则**：
- 每页 keywords 不超过 15 个
- 不重复关键词
- 不放与页面无关的词
- 自然融入内容

### 8. 内容更新频率

**建议**：
- 每周发布 1-2 篇新内容
- 每月更新旧内容
- 保持 sitemap 更新

---

## 后续做（进阶）

### 9. 百度自动推送

**JS 代码**：
```html
<script>
(function(){
    var bp = document.createElement('script');
    var curProtocol = window.location.protocol.split(':')[0];
    if (curProtocol === 'https'){
        bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
    }
    else{
        bp.src = 'http://push.zhanzhang.baidu.com/push.js';
    }
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(bp, s);
})();
</script>
```

**状态**: ⚠️ 后续添加

### 10. 百度结构化数据

**支持类型**：
- Article（文章）
- FAQ（常见问题）
- HowTo（操作指南）
- BreadcrumbList（面包屑）

**状态**: ⚠️ 后续优化

### 11. 360 搜索优化

**步骤**：
1. 提交 sitemap
2. 配置 robots.txt
3. 优化中文关键词
4. 提交原创保护

**状态**: ⚠️ 后续做

### 12. 搜狗搜索优化

**步骤**：
1. 提交 sitemap
2. 微信公众号关联
3. 优化中文关键词

**状态**: ⚠️ 后续做

### 13. 神马搜索优化

**步骤**：
1. 提交 sitemap
2. 移动端优化
3. 优化中文关键词

**状态**: ⚠️ 后续做

---

## 基础提交清单

| 搜索引擎 | 提交 URL | 状态 |
|----------|----------|------|
| 百度 | https://ziyuan.baidu.com/ | ⚠️ 待提交 |
| 360 | https://zhanzhang.so.com/ | ⚠️ 待提交 |
| 搜狗 | https://zhanzhang.sogou.com/ | ⚠️ 待提交 |
| 神马 | https://zhanzhang.sm.cn/ | ⚠️ 待提交 |
| Bing | https://www.bing.com/webmasters/ | ⚠️ 待提交 |
| Google | https://search.google.com/search-console | ⚠️ 待提交 |

---

## 用户群体关键词策略

### 准留学生

**关键词**：
- 出国留学准备
- 留学清单
- 出国前要准备什么
- 留学申请流程
- 留学签证办理

**搜索意图**: informational

### 留学生家长

**关键词**：
- 送孩子出国准备
- 留学生家长须知
- 孩子出国留学要准备什么
- 留学生家长准备事项
- 留学费用准备

**搜索意图**: informational

### 未出海人群

**关键词**：
- 海外生活指南
- 出国攻略
- 海外生活攻略
- 海外华人生活
- 出国前准备

**搜索意图**: informational

### 跨境卖家

**关键词**：
- 跨境电商工具
- 外贸单据
- 国际物流
- 集运工具
- 跨境电商平台

**搜索意图**: transactional

### 外贸从业者

**关键词**：
- HS编码查询
- 商业发票
- 装箱单
- 外贸报价
- 海关编码

**搜索意图**: transactional

---

## 更新记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-07-03 | 初始版本 |
