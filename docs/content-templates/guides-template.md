# 指南 (Guides) 内容模板

**版本:** v1.0  
**日期:** 2026-06-30  
**适用类型:** 深度教程/操作指南

---

## 1. 页面结构

### 1.1 基础信息

```yaml
title: "如何填写商业发票 Commercial Invoice"
slug: "how-to-fill-commercial-invoice"
category: "shipping" # shipping / customs / logistics / life / business / templates
tags: ["商业发票", "外贸单据", "报关"]

summary: "商业发票是跨境贸易的核心单据。本指南详细讲解如何填写 Commercial Invoice，包括必填字段、常见错误、模板下载。"

# 封面
cover_image: "/images/guides/commercial-invoice-guide.jpg"
author: "Hermes Agent"
```

### 1.2 内容主体

```yaml
body: |
  ## 什么是商业发票？
  
  商业发票（Commercial Invoice）是跨境贸易中卖方开给买方的单据，列明商品、数量、价格、交易条款。
  海关用它来计算关税，银行用它来处理付款。
  
  ## 必填字段
  
  ### 1. 卖方信息 (Seller/Exporter)
  - 公司名称
  - 地址
  - 联系方式
  
  ### 2. 买方信息 (Buyer/Importer)
  - 公司名称
  - 地址
  - 联系方式
  
  ### 3. 发票信息
  - 发票号
  - 日期
  - 订单号
  
  ### 4. 商品明细
  - 商品描述
  - 数量
  - 单价
  - 总价
  - HS 编码
  - 原产地
  
  ### 5. 交易条款
  - Incoterms (如 FOB, CIF)
  - 付款方式
  - 运输方式
  
  ## 常见错误
  
  1. **商品描述过于笼统** — 不要写"衣服"，要写"男士棉质 T 恤"
  2. **HS 编码错误** — 用我们的 HS 编码查询工具确认
  3. **货币单位缺失** — 必须标注 USD/EUR 等
  4. **Incoterms 不明确** — 必须写清版本（如 CIF Shanghai Incoterms 2020）
  
  ## 模板下载
  
  [下载商业发票模板](/tools/documents/commercial-invoice)
  
  ## 相关工具
  
  - [商业发票生成器](/tools/commercial-invoice)
  - [HS 编码查询](/tools/hs-code)
  - [汇率换算](/tools/exchange-rate)
```

---

## 2. SEO 字段

```yaml
seo:
  title: "如何填写商业发票 Commercial Invoice | 完整指南 - 绝世百宝箱"
  description: "商业发票填写指南：必填字段、常见错误、模板下载。帮你快速掌握 Commercial Invoice 填写技巧。"
  canonical_url: "https://jueshi.net/guides/how-to-fill-commercial-invoice"
  robots: "index,follow"
```

---

## 3. 关联内容

```yaml
related_content:
  related_tools:
    - "commercial-invoice"
    - "hs-code"
    - "exchange-rate"
  
  related_topics:
    - "cross-border-ecommerce"
  
  related_checklists:
    - "shipping-preparation-checklist"
  
  related_guides:
    - "how-to-calculate-shipping-cost"
```

---

## 4. 视频脚本

```yaml
video_script:
  youtube:
    title: "如何填写商业发票 | Commercial Invoice 完整教程"
    duration: "5-7 分钟"
    script: |
      [开场]
      做外贸，商业发票必不可少。今天教你怎么填。
      
      [正文]
      第一步：填写卖方信息...
      第二步：填写买方信息...
      第三步：商品明细...
      
      [总结]
      记住这 5 个要点，商业发票不再难。
```

---

## 5. 审核清单

```yaml
checklist:
  seo:
    - "Title 包含关键词"
    - "Description ≤ 160 字符"
    - "H1 唯一"
    - "内链 ≥ 3 个"
  
  content:
    - "步骤清晰"
    - "有实操示例"
    - "无 AI 套话"
  
  technical:
    - "JSON-LD HowTo"
    - "移动端友好"
```

---

**文档版本:** v1.0  
**最后更新:** 2026-06-30
