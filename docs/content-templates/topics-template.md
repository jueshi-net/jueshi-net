# 专题 (Topics) 内容模板

**版本:** v1.0  
**日期:** 2026-06-30  
**适用类型:** 专题聚合页

---

## 1. 页面结构

### 1.1 基础信息

```yaml
title: "2026 年海外必装 APP 推荐"
subtitle: "留学生、新移民必备，帮你快速适应海外生活"
slug: "must-have-apps-2026"
template_type: "rating_list" # rating_list / guide_list / comparison / faq_collection

# 封面
cover_emoji: "📱"
cover_image: "/images/topics/must-have-apps-2026.jpg"

# 受众定位
suitable_for:
  - "新移民"
  - "留学生"
  - "数字游民"

# 标签
tags:
  - "APP推荐"
  - "海外生活"
  - "必备工具"
```

### 1.2 Hero 区域

```yaml
hero:
  badges:
    - label: "2026 最新版"
      color: "blue"
    - label: "实测推荐"
      color: "green"
  
  title: "2026 年海外必装 APP 推荐"
  subtitle: "精选 10 款必备神器，帮你快速适应海外生活"
  
  stats:
    - label: "精选 APP"
      value: "10 款"
    - label: "覆盖场景"
      value: "5 大类"
    - label: "更新时间"
      value: "2026-06"
```

### 1.3 内容章节

```yaml
sections:
  # 1. 引言
  - type: "intro"
    title: "为什么需要这些 APP？"
    content: |
      刚到海外，面对陌生的环境，一款好用的 APP 能让你事半功倍。
      
      我们精选了 10 款经过实测的必备 APP，覆盖通讯、汇款、导航、购物、生活等场景。
      每款 APP 都附带使用建议和注意事项，帮你避开常见坑。
  
  # 2. 评分列表
  - type: "rating_list"
    title: "精选 APP 推荐"
    items:
      - name: "WhatsApp"
        alias: "海外版微信"
        rating: "S" # S/A/B/C/D
        category: "通讯"
        icon_text: "💬"
        icon_bg: "green-100"
        icon_fg: "green-600"
        install_priority: "先装"
        
        description: "全球最流行的即时通讯软件，几乎所有海外用户都在用。"
        analogy: "就像国内的微信，但更简洁专注聊天。"
        suitable_for: "所有人"
        beginner_advice: "注册需要海外手机号，建议落地后第一时间注册。"
        risk_tip: "默认开启端到端加密，但注意备份聊天记录。"
        official_url: "https://whatsapp.com"
        is_beginner_friendly: true
      
      - name: "Wise"
        alias: "前 TransferWise"
        rating: "S"
        category: "汇款"
        icon_text: "💸"
        icon_bg: "blue-100"
        icon_fg: "blue-600"
        install_priority: "高频"
        
        description: "国际汇款神器，汇率透明，手续费低。"
        analogy: "就像支付宝转账，但是跨国的。"
        suitable_for: "需要汇款的人"
        beginner_advice: "首次注册需要身份验证，提前准备好护照。"
        risk_tip: "大额汇款可能需要额外证明，提前准备。"
        official_url: "https://wise.com"
        is_beginner_friendly: true
  
  # 3. 对比表格
  - type: "comparison"
    title: "APP 对比一览"
    columns:
      - key: "name"
        label: "APP 名称"
      - key: "category"
        label: "分类"
      - key: "rating"
        label: "评分"
      - key: "price"
        label: "费用"
      - key: "platform"
        label: "平台"
  
  # 4. 注意事项
  - type: "notice"
    title: "使用注意事项"
    content: |
      1. **隐私保护** — 定期检查 APP 权限设置
      2. **数据备份** — 重要数据定期备份到云端
      3. **版本更新** — 保持 APP 为最新版本
      4. **网络安全** — 避免在公共 WiFi 下进行敏感操作
  
  # 5. FAQ
  - type: "faq"
    title: "常见问题"
    questions:
      - q: "这些 APP 都免费吗？"
        a: "大部分免费，部分有高级功能需要付费。我们在每款 APP 介绍中都标注了费用情况。"
      
      - q: "需要海外手机号才能注册吗？"
        a: "部分 APP 需要（如 WhatsApp），建议落地后第一时间办理当地手机卡。"
      
      - q: "这些 APP 在国内能用吗？"
        a: "大部分可以，但建议出国后再注册，避免账号地区冲突。"
  
  # 6. CTA
  - type: "cta"
    title: "需要更多帮助？"
    content: "查看我们的留学生活攻略专题 →"
    link: "/topics/student-life-guide"
    button_text: "查看专题"
```

---

## 2. SEO 字段

### 2.1 元数据

```yaml
seo:
  title: "2026 海外必装 APP 推荐 | 留学生新移民必备 10 款 - 绝世百宝箱"
  description: "精选 10 款海外生活必备 APP：聊天、汇款、导航、购物。真实使用体验，帮你快速适应海外生活。点击查看完整推荐。"
  canonical_url: "https://jueshi.net/topics/must-have-apps-2026"
  robots: "index,follow"
  
  # Open Graph
  og:
    title: "2026 海外必装 APP 推荐"
    description: "精选 10 款必备神器，帮你快速适应海外生活"
    image: "https://jueshi.net/images/topics/must-have-apps-2026-og.jpg"
    url: "https://jueshi.net/topics/must-have-apps-2026"
    type: "website"
  
  # Twitter Card
  twitter:
    card: "summary_large_image"
    title: "2026 海外必装 APP 推荐"
    description: "精选 10 款必备神器"
    image: "https://jueshi.net/images/topics/must-have-apps-2026-twitter.jpg"
```

### 2.2 关键词策略

```yaml
keywords:
  primary: "海外必装APP"
  secondary:
    - "出国APP推荐"
    - "留学生APP"
    - "新移民APP"
    - "海外生活APP"
  
  long_tail:
    - "2026海外必装APP"
    - "留学生必备APP"
    - "海外生活必备软件"
  
  related:
    - "海外聊天软件"
    - "国际汇款APP"
    - "海外导航软件"
```

### 2.3 结构化数据

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "2026 海外必装 APP 推荐",
  "description": "精选 10 款海外生活必备 APP",
  "url": "https://jueshi.net/topics/must-have-apps-2026",
  "numberOfItems": 10,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "SoftwareApplication",
        "name": "WhatsApp",
        "applicationCategory": "CommunicationApplication",
        "operatingSystem": "iOS, Android, Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "1234"
        }
      }
    }
  ]
}
```

---

## 3. GEO 字段

### 3.1 直接回答

```yaml
direct_answer:
  question: "海外必装哪些 APP？"
  answer: |
    海外必装 APP 包括：WhatsApp（通讯）、Wise（汇款）、Google Maps（导航）、
    Amazon/当地电商（购物）、Uber/当地打车（出行）。
    这 5 款覆盖生活核心场景，建议落地后第一时间安装。
```

### 3.2 地理定位

```yaml
geo_targeting:
  primary_countries: ["CA", "US", "UK", "AU"]
  regions:
    - country: "CA"
      notes: "加拿大推荐用 Kijiji 二手交易"
    - country: "US"
      notes: "美国推荐用 Venmo 转账"
    - country: "UK"
      notes: "英国推荐用 Monzo 银行"
```

---

## 4. 内链规则

### 4.1 内链策略

```yaml
internal_links:
  # 关联工具
  related_tools:
    - slug: "exchange-rate"
      anchor: "汇率换算工具"
      context: "需要汇款？先用我们的汇率工具算算成本"
    
    - slug: "postal-code"
      anchor: "邮编查询"
      context: "不知道当地邮编？用邮编查询工具"
  
  # 关联指南
  related_guides:
    - slug: "how-to-choose-bank"
      anchor: "如何选择海外银行"
      context: "了解更多海外生活技巧"
  
  # 关联清单
  related_checklists:
    - slug: "moving-abroad-checklist"
      anchor: "出国行前清单"
      context: "准备出国？检查这份清单"
  
  # 关联专题
  related_topics:
    - slug: "student-life-guide"
      anchor: "留学生活攻略"
      context: "留学生必看专题"
```

### 4.2 内链密度

```yaml
link_density:
  min_internal_links: 5
  max_internal_links: 15
  anchor_text_rules:
    - "包含关键词"
    - "描述性短语"
    - "避免'点击这里'"
```

---

## 5. FAQ 规则

### 5.1 FAQ 结构

```yaml
faq:
  min_questions: 5
  max_questions: 10
  
  question_rules:
    - "覆盖 People Also Ask 问题"
    - "包含关键词"
    - "直接、简洁"
  
  answer_rules:
    - "直接回答，≤ 100 字"
    - "提供具体信息"
    - "可包含内链"
```

### 5.2 FAQ 示例

```yaml
faq_examples:
  - q: "这些 APP 收费吗？"
    a: "大部分免费。WhatsApp、Google Maps 完全免费；Wise 汇款收取小额手续费（通常 < 1%）。"
  
  - q: "需要海外手机号吗？"
    a: "WhatsApp 需要海外手机号注册。建议落地后第一时间办当地手机卡。"
  
  - q: "国内能用吗？"
    a: "大部分可以，但建议出国后注册，避免账号地区冲突。部分 APP（如 Google 服务）在国内需要特殊网络。"
```

---

## 6. 结构化数据建议

### 6.1 推荐 Schema 类型

```yaml
schema_types:
  primary: "ItemList"
  secondary:
    - "SoftwareApplication" # 每个 APP
    - "FAQPage" # FAQ 部分
    - "BreadcrumbList" # 面包屑
```

### 6.2 必填字段

```yaml
required_fields:
  ItemList:
    - "name"
    - "description"
    - "url"
    - "numberOfItems"
    - "itemListElement"
  
  SoftwareApplication:
    - "name"
    - "applicationCategory"
    - "operatingSystem"
    - "offers"
```

---

## 7. 视频口播字段

### 7.1 YouTube 长视频

```yaml
youtube_video:
  title: "2026 海外必装 APP 推荐 | 留学生新移民必看 10 款神器"
  description: |
    刚到海外不知道装什么 APP？今天推荐 10 款必备神器！
    
    📱 本期推荐：
    0:00 开场
    0:30 WhatsApp - 聊天必备
    2:00 Wise - 汇款神器
    3:30 Google Maps - 导航
    ...
    
    🔗 相关链接：
    - 汇率工具：https://jueshi.net/tools/exchange-rate
    - 邮编查询：https://jueshi.net/tools/postal-code
    
    #海外生活 #留学 #APP推荐
  duration: "8-10 分钟"
  
  script: |
    [开场 0:00-0:30]
    刚到海外，不知道装什么 APP？今天推荐 10 款必备神器，帮你快速适应海外生活！
    
    [目录 0:30-0:45]
    我们会从通讯、汇款、导航、购物、生活五个方面来推荐。
    
    [正文 0:45-8:00]
    第一款：WhatsApp...
    
    [总结 8:00-9:00]
    以上就是今天的 10 款推荐，记得点赞订阅！
    
    [结尾 9:00-10:00]
    需要汇款？试试我们的汇率工具，链接在描述栏。
  
  thumbnail_prompt: "手机屏幕显示 10 个 APP 图标，背景是世界地图，标题文字'海外必装 APP'"
  
  tags: ["海外生活", "留学", "APP推荐", "新移民", "必备软件"]
```

### 7.2 Shorts / TikTok 短视频

```yaml
short_video:
  title: "海外必装 3 大 APP #shorts"
  duration: "60 秒"
  
  script: |
    [Hook 0:00-0:05]
    刚到海外？这 3 个 APP 必装！
    
    [正文 0:05-0:50]
    1. WhatsApp - 聊天必备，海外版微信
    2. Wise - 汇款最便宜，汇率透明
    3. Google Maps - 导航神器，公交自驾都能用
    
    [CTA 0:50-1:00]
    关注我，获取更多海外生活技巧！
  
  hashtags: ["#海外生活", "#留学", "#APP推荐", "#shorts"]
```

---

## 8. 审核清单

### 8.1 SEO 检查

```yaml
seo_checklist:
  - title: "Title 包含主关键词"
    check: "seo_title contains '海外必装APP'"
    required: true
  
  - title: "Description ≤ 160 字符"
    check: "seo_description.length <= 160"
    required: true
  
  - title: "H1 唯一"
    check: "h1_count == 1"
    required: true
  
  - title: "内链 ≥ 5 个"
    check: "internal_links_count >= 5"
    required: true
  
  - title: "Canonical URL 正确"
    check: "canonical_url == 'https://jueshi.net/topics/must-have-apps-2026'"
    required: true
```

### 8.2 内容质量检查

```yaml
quality_checklist:
  - title: "无 AI 套话"
    check: "no_ai_fluff"
    required: true
  
  - title: "有独特价值"
    check: "has_unique_value"
    required: true
  
  - title: "段落 ≤ 150 字"
    check: "paragraph_length <= 150"
    required: true
  
  - title: "FAQ ≥ 5 个问题"
    check: "faq_count >= 5"
    required: true
```

### 8.3 技术检查

```yaml
technical_checklist:
  - title: "JSON-LD 有效"
    check: "json_ld_valid"
    required: true
  
  - title: "移动端友好"
    check: "mobile_friendly"
    required: true
  
  - title: "页面加载 < 3 秒"
    check: "page_speed < 3"
    required: true
```

---

## 9. 发布前质量评分

### 9.1 评分维度

```yaml
scoring:
  seo_optimization: 25 # SEO 优化程度
  content_quality: 25 # 内容质量
  user_value: 20 # 用户价值
  technical_implementation: 15 # 技术实现
  video_readiness: 15 # 视频就绪度
```

### 9.2 评分标准

```yaml
scoring_criteria:
  seo_optimization:
    - "Title 优化 (5分)"
    - "Description 优化 (5分)"
    - "关键词密度 (5分)"
    - "内链建设 (5分)"
    - "结构化数据 (5分)"
  
  content_quality:
    - "无 AI 套话 (5分)"
    - "有独特价值 (5分)"
    - "结构清晰 (5分)"
    - "段落简洁 (5分)"
    - "FAQ 质量 (5分)"
  
  user_value:
    - "解决实际问题 (10分)"
    - "提供具体建议 (5分)"
    - "覆盖目标受众 (5分)"
  
  technical_implementation:
    - "页面速度 (5分)"
    - "移动端友好 (5分)"
    - "结构化数据有效 (5分)"
  
  video_readiness:
    - "脚本完整 (5分)"
    - "时长合适 (5分)"
    - "封面提示词清晰 (5分)"
```

### 9.3 发布门槛

```yaml
publish_threshold:
  minimum_score: 80
  recommended_score: 90
  
  blocking_issues:
    - "SEO 基础字段缺失"
    - "内容质量评分 < 15"
    - "技术实现评分 < 10"
```

---

**文档版本:** v1.0  
**最后更新:** 2026-06-30  
**下一步:** 指南模板 → 清单模板
