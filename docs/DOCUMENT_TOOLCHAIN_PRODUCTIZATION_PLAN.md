# 单据工具链产品化方案

## 一、链路设计

### 核心链路

```
Quote Sheet (报价单)
  → Proforma Invoice (形式发票)
    → Commercial Invoice (商业发票)
      → Packing List (装箱单)
        → Container Loading List (装柜清单)
```

### 辅助链路

```
Commercial Invoice → Customs Declaration Authorization (报关委托书)
Commercial Invoice → Express Declaration (快递申报单)
Packing List → Shipping Mark (唛头)
Any Document → Delivery Note (送货单)
```

### 贯穿要素

- Company Profile（公司资料）— 全链路统一
- Product Items（商品明细）— Quote → PI → CI → PL 传递
- Currency / Exchange Rate（币种/汇率）— 可选联动
- HS Code — 从商品资料带入

## 二、数据传递格式

### 2.1 统一 item schema

```typescript
interface ChainDocumentItem {
  id: string;
  productSku?: string;
  chineseName: string;
  englishName: string;
  hsCode?: string;
  material?: string;
  usage?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  currency: string;
  totalAmount: number;
  netWeight?: number;
  grossWeight?: number;
  volume?: number;
}
```

### 2.2 链路传递数据

```typescript
interface ChainTransferData {
  sourceType: string;      // 'quotation' | 'proforma-invoice' | ...
  sourceId?: string;        // draft ID if saved
  companyProfileId: string;
  items: ChainDocumentItem[];
  currency: string;
  exchangeRate?: number;
  notes?: string;
  targetTool?: string;     // next tool in chain
}
```

## 三、实现方案

### Phase 1: UI 链路入口（最小实现）

1. 在动态路由工具页面添加"从上一单据导入"按钮
2. 从 localStorage 读取上一个保存的草稿
3. 映射字段到当前工具
4. 不需要新 API，纯前端实现

### Phase 2: Workspace 链路（需 DB）

1. 保存草稿到 Workspace（DocumentHistory）
2. 从 Workspace 加载历史草稿
3. 链路页面展示"下一步"按钮
4. 传递 ChainTransferData 到下一工具

### Phase 3: 商品资料库联动

1. 商品资料库提供 item 模板
2. 工具中可选择商品自动填入
3. 链路传递时自动带 HS Code

## 四、各步骤实现细节

### Quote Sheet → Proforma Invoice

- 传递：公司资料 + 商品明细 + 币种 + 总价
- Quote Sheet 保存后显示"生成形式发票"按钮
- 点击后跳转 /tools/documents/proforma-invoice?from=quotation&draftId=xxx
- 目标页面读取 draftId，填充字段

### Proforma Invoice → Commercial Invoice

- 传递：公司资料 + 商品明细 + 币种
- 字段映射基本一致
- PI 保存后显示"生成商业发票"按钮

### Commercial Invoice → Packing List

- 传递：公司资料 + 商品明细（去掉价格）+ 重量/体积
- CI 保存后显示"生成装箱单"按钮
- Packing List 不显示价格字段

### Packing List → Container Loading List

- 传递：公司资料 + 商品明细 + 箱号/件数
- PL 保存后显示"生成装柜清单"按钮

## 五、状态标记

- 未实现：❌
- 设计完成：📝
- 部分实现：🔄
- 完整实现：✅

| 链路 | 状态 |
|------|------|
| Quote → PI | 📝 设计完成 |
| PI → CI | 📝 设计完成 |
| CI → PL | 📝 设计完成 |
| PL → CLL | 📝 设计完成 |
| Company Profile 贯穿 | ✅ 已实现 |
| Product Items 贯穿 | 📝 设计完成 |
| Currency 联动 | ❌ 未实现 |
| HS Code 自动带入 | ❌ 未实现（需商品资料库） |
