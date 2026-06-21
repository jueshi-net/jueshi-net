-- Seed: Additional Guides + Checklist for v18.5.0 Phase 3
-- Idempotent: ON CONFLICT (slug) DO NOTHING
-- All content includes disclaimer: 数据仅供参考，请以官方机构最新规定为准。

-- ─── Guide 1: canada-address-format ────────────────────────────
INSERT INTO guides (
  id, slug, title, summary, body, category, tags,
  "relatedTools", "relatedTopics", "relatedChecklists", "relatedGuides",
  status, "seoTitle", "seoDescription",
  robots, "publishedAt", "createdAt", "updatedAt"
) VALUES (
  'guide-canada-address-v1850',
  'canada-address-format',
  '加拿大地址和邮编格式指南',
  '了解加拿大地址的标准格式、邮编规则（A1A 1A1）和常见注意事项。',
  '# 加拿大地址和邮编格式

## 地址格式

加拿大地址通常按以下顺序书写：

```
收件人姓名
门牌号 街道名
城市, 省份缩写 邮编
CANADA
```

示例：
```
Zhang San
1234 Main Street
Toronto, ON M4B 1B3
CANADA
```

## 邮编格式

加拿大邮编格式为 **A1A 1A1**：
- 字母-数字-字母 + 空格 + 数字-字母-数字
- 前三个字符为 Forward Sortation Area (FSA)
- 后三个字符为 Local Delivery Unit (LDU)

## 省份缩写

| 省份 | 缩写 |
|------|------|
| Ontario | ON |
| British Columbia | BC |
| Quebec | QC |
| Alberta | AB |
| Manitoba | MB |
| Saskatchewan | SK |
| Nova Scotia | NS |
| New Brunswick | NB |

## 常见注意事项

1. 邮编中的字母必须大写
2. 邮编中间有一个空格
3. 省份必须使用两字母缩写
4. 国际包裹建议在最后一行写明 CANADA

> ⚠️ 免责声明：以上信息仅供参考，请以加拿大邮政（Canada Post）官方规定为准。

## 相关工具

- [邮编格式校验工具](/tools/postal-code) — 验证加拿大邮编格式
- [地址格式化工具](/tools/address-formatter) — 一键生成标准地址

## 相关指南

- [中国寄加拿大完整流程](/guides/shipping-from-china-to-canada-guide)
- [商业发票填写指南](/guides/commercial-invoice-guide)

## 相关清单

- [中国寄加拿大 8 步清单](/checklists/canada-shipping-checklist)
- [发货前资料检查清单](/checklists/export-documents-checklist)',
  'shipping',
  '{"canada","address","postal-code","格式"}',
  '{"postal-code","address-formatter"}',
  '{"cross-border-shipping"}',
  '{"canada-shipping-checklist","export-documents-checklist"}',
  '{"shipping-from-china-to-canada-guide","commercial-invoice-guide"}',
  'published',
  '加拿大地址和邮编格式指南 | 绝世百宝箱',
  '了解加拿大地址标准格式、邮编规则（A1A 1A1）和省份缩写，确保包裹正确投递。',
  'index,follow',
  NOW(), NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- ─── Guide 2: commercial-invoice-guide ────────────────────────
INSERT INTO guides (
  id, slug, title, summary, body, category, tags,
  "relatedTools", "relatedTopics", "relatedChecklists", "relatedGuides",
  status, "seoTitle", "seoDescription",
  robots, "publishedAt", "createdAt", "updatedAt"
) VALUES (
  'guide-commercial-invoice-v1850',
  'commercial-invoice-guide',
  '商业发票填写指南',
  '跨境发货商业发票的必填字段、常见错误和注意事项。',
  '# 商业发票填写指南

## 什么是商业发票

商业发票（Commercial Invoice）是国际贸易中的核心单据，用于报关、清关和计算关税。

## 必填字段

1. **发件人信息**：姓名、地址、联系方式
2. **收件人信息**：姓名、地址、联系方式
3. **发票日期和编号**
4. **商品描述**：品名、材质、用途
5. **HS 编码**：海关编码（建议使用 [HS编码查询工具](/tools/hs-code)）
6. **数量和单位**
7. **单价和总价**：币种和金额
8. **原产国**
9. **贸易条款**（Incoterms）
10. **总重量和包装方式**

## 常见错误

| 错误 | 后果 |
|------|------|
| 品名过于笼统（如"衣服"） | 海关可能扣关查验 |
| 低报价值 | 罚款或没收 |
| 缺少 HS 编码 | 清关延迟 |
| 金额不一致 | 海关质疑 |

## 填写建议

1. 品名要具体：不要写"衣服"，写"100% cotton t-shirt"
2. 如实申报价值
3. 使用正确的 HS 编码
4. 保留发票副本

> ⚠️ 免责声明：以上信息仅供参考，具体报关要求请咨询专业报关行或海关官方。

## 相关工具

- [发票生成器](/tools/commercial-invoice) — 在线生成商业发票
- [装箱单生成](/tools/packing-list) — 生成配套装箱单
- [HS编码查询](/tools/hs-code) — 查找正确编码

## 相关指南

- [中国寄加拿大完整流程](/guides/shipping-from-china-to-canada-guide)
- [加拿大地址和邮编格式](/guides/canada-address-format)
- [装箱单填写指南](/guides/packing-list-guide)

## 相关清单

- [发货前资料检查清单](/checklists/export-documents-checklist)
- [中国寄加拿大 8 步清单](/checklists/canada-shipping-checklist)',
  'customs',
  '{"commercial-invoice","发票","报关","清关"}',
  '{"commercial-invoice","packing-list","hs-code"}',
  '{"cross-border-shipping"}',
  '{"export-documents-checklist","canada-shipping-checklist"}',
  '{"shipping-from-china-to-canada-guide","canada-address-format","packing-list-guide"}',
  'published',
  '商业发票填写指南 — 跨境发货必读 | 绝世百宝箱',
  '商业发票必填字段、常见错误和填写建议，确保顺利报关清关。',
  'index,follow',
  NOW(), NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- ─── Guide 3: packing-list-guide ──────────────────────────────
INSERT INTO guides (
  id, slug, title, summary, body, category, tags,
  "relatedTools", "relatedTopics", "relatedChecklists", "relatedGuides",
  status, "seoTitle", "seoDescription",
  robots, "publishedAt", "createdAt", "updatedAt"
) VALUES (
  'guide-packing-list-v1850',
  'packing-list-guide',
  '装箱单填写指南',
  '跨境发货装箱单的作用、必填字段和与商业发票的配合使用。',
  '# 装箱单填写指南

## 什么是装箱单

装箱单（Packing List）是详细列明每个包装内商品信息的单据，与商业发票配合使用。

## 装箱单 vs 商业发票

| 项目 | 商业发票 | 装箱单 |
|------|----------|--------|
| 核心信息 | 价值、贸易条款 | 数量、重量、包装 |
| 用途 | 报关、征税 | 验货、仓储 |
| 必须有价格 | 是 | 否 |

## 必填字段

1. **发件人/收件人信息**
2. **箱号**：Carton No. 1/3, 2/3, 3/3
3. **每箱内容**：品名、数量
4. **毛重（Gross Weight）**：每箱 + 总计
5. **净重（Net Weight）**：每箱 + 总计
6. **箱规**：长×宽×高（建议使用 [CBM计算器](/tools/shipping-calculator)）
7. **总体积（CBM）**

## 填写建议

1. 每箱编号清晰
2. 毛重净重要准确
3. 箱规用厘米标注
4. 总数量和总重量要与发票一致

> ⚠️ 免责声明：以上信息仅供参考，具体要求请咨询物流公司或海关官方。

## 相关工具

- [装箱单生成](/tools/packing-list) — 在线生成装箱单
- [CBM计算器](/tools/shipping-calculator) — 计算体积重
- [发票生成器](/tools/commercial-invoice) — 配套发票

## 相关指南

- [商业发票填写指南](/guides/commercial-invoice-guide)
- [中国寄加拿大完整流程](/guides/shipping-from-china-to-canada-guide)

## 相关清单

- [发货前资料检查清单](/checklists/export-documents-checklist)',
  'customs',
  '{"packing-list","装箱单","包装","物流"}',
  '{"packing-list","commercial-invoice","shipping-calculator"}',
  '{"cross-border-shipping"}',
  '{"export-documents-checklist","canada-shipping-checklist"}',
  '{"commercial-invoice-guide","shipping-from-china-to-canada-guide"}',
  'published',
  '装箱单填写指南 — 跨境发货包装规范 | 绝世百宝箱',
  '装箱单必填字段、与商业发票的区别、填写建议，确保货物顺利通关。',
  'index,follow',
  NOW(), NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- ─── Checklist: export-documents-checklist ────────────────────
INSERT INTO checklists (
  id, slug, title, summary, steps,
  "relatedTools", "relatedTaskChain", "relatedGuides", "relatedTopics",
  status, "seoTitle", "seoDescription",
  robots, "publishedAt", "createdAt", "updatedAt"
) VALUES (
  'checklist-export-docs-v1850',
  'export-documents-checklist',
  '发货前资料检查清单',
  '发货前必须确认的所有资料和文件，避免因资料缺失导致扣关或退回。',
  '[
    {"title": "确认收件人地址", "description": "核实收件人姓名、地址、邮编格式正确（特别是加拿大 A1A 1A1 格式）", "completed": false, "optional": false, "toolLink": "/tools/address-formatter"},
    {"title": "准备商业发票", "description": "填写完整的商业发票，包括品名、HS编码、数量、单价、总价、原产国", "completed": false, "optional": false, "toolLink": "/tools/commercial-invoice"},
    {"title": "准备装箱单", "description": "填写装箱单，包括每箱内容、毛重净重、箱规、总体积", "completed": false, "optional": false, "toolLink": "/tools/packing-list"},
    {"title": "查询HS编码", "description": "确认商品对应的HS编码正确，避免清关延误", "completed": false, "optional": false, "toolLink": "/tools/hs-code"},
    {"title": "检查禁限寄物品", "description": "确认货物不在目的地国家禁限寄名单中", "completed": false, "optional": false, "toolLink": "/tools/sensitive-goods"},
    {"title": "确认贸易条款", "description": "与买家确认 Incoterms（DDP/DDU/DAP等）", "completed": false, "optional": false, "toolLink": ""},
    {"title": "计算运费", "description": "使用运费估算器预估运费和体积重", "completed": false, "optional": true, "toolLink": "/tools/shipping-calculator"},
    {"title": "保留所有文件副本", "description": "发票、装箱单、运单各保留电子版和纸质副本", "completed": false, "optional": false, "toolLink": ""}
  ]'::jsonb,
  '{"commercial-invoice","packing-list","hs-code","address-formatter","shipping-calculator","sensitive-goods"}',
  'shipping',
  '{"commercial-invoice-guide","packing-list-guide","canada-address-format","shipping-from-china-to-canada-guide"}',
  '{"cross-border-shipping"}',
  'published',
  '发货前资料检查清单 — 跨境发货必备 | 绝世百宝箱',
  '发货前必须确认的资料文件清单，包括地址、发票、装箱单、HS编码等8个关键步骤。',
  'index,follow',
  NOW(), NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;
