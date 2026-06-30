# 清单 (Checklists) 内容模板

**版本:** v1.0  
**日期:** 2026-06-30  
**适用类型:** 步骤化任务清单

---

## 1. 页面结构

### 1.1 基础信息

```yaml
title: "跨境发货准备清单"
slug: "shipping-preparation-checklist"
summary: "发货前必做事项清单：从包装到报关，一步步帮你做好准备。"

# 步骤列表
steps:
  - title: "准备商品包装"
    description: "确保商品包装牢固，适合长途运输。易碎品需要额外保护。"
    completed: false
    optional: false
    tool_link: null
  
  - title: "准备商业发票"
    description: "填写 Commercial Invoice，包括商品描述、数量、价格、HS 编码。"
    completed: false
    optional: false
    tool_link: "/tools/commercial-invoice"
  
  - title: "确认 HS 编码"
    description: "为每个商品确认 HS 编码，避免清关问题。"
    completed: false
    optional: false
    tool_link: "/tools/hs-code"
  
  - title: "计算运费"
    description: "根据重量、体积、目的地计算运费。"
    completed: false
    optional: false
    tool_link: "/tools/shipping-calculator"
  
  - title: "选择物流渠道"
    description: "根据时效、成本选择合适的物流渠道（快递/空运/海运）。"
    completed: false
    optional: false
    tool_link: null
  
  - title: "准备报关资料"
    description: "根据目的国要求准备报关资料（发票、装箱单、产地证等）。"
    completed: false
    optional: false
    tool_link: null
  
  - title: "贴标"
    description: "在包裹外箱贴上运单标签、唛头。"
    completed: false
    optional: false
    tool_link: "/tools/shipping-mark"
  
  - title: "购买保险（可选）"
    description: "高价值商品建议购买运输保险。"
    completed: false
    optional: true
    tool_link: null
  
  - title: "预约取件"
    description: "联系物流公司预约取件时间。"
    completed: false
    optional: false
    tool_link: null

# 关联内容
related_tools:
  - "commercial-invoice"
  - "hs-code"
  - "shipping-calculator"
  - "shipping-mark"

related_task_chain: "shipping-preparation"

related_guides:
  - "how-to-fill-commercial-invoice"
  - "how-to-calculate-shipping-cost"

related_topics:
  - "cross-border-ecommerce"
```

---

## 2. SEO 字段

```yaml
seo:
  title: "跨境发货准备清单 | 发货前必做 9 件事 - 绝世百宝箱"
  description: "跨境发货清单：从包装到报关，一步步帮你做好准备。包含商业发票、HS 编码、运费计算等关键步骤。"
  canonical_url: "https://jueshi.net/checklists/shipping-preparation-checklist"
  robots: "index,follow"
```

---

## 3. 视频脚本

```yaml
video_script:
  shorts:
    title: "跨境发货 9 步清单 #shorts"
    duration: "60 秒"
    script: |
      跨境发货前必做 9 件事：
      1. 包装商品
      2. 准备商业发票
      3. 确认 HS 编码
      4. 计算运费
      5. 选择物流
      6. 准备报关资料
      7. 贴标
      8. 买保险
      9. 预约取件
      
      完整清单在我们网站，链接在简介！
```

---

## 4. 审核清单

```yaml
checklist:
  content:
    - "步骤清晰、可操作"
    - "关联工具链接正确"
    - "可选步骤标注清楚"
  
  seo:
    - "Title 包含关键词"
    - "Description ≤ 160 字符"
  
  technical:
    - "JSON-LD 有效"
    - "移动端友好"
```

---

**文档版本:** v1.0  
**最后更新:** 2026-06-30
