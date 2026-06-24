# 商品资料库 MVP 规格

## 一、现有模型

Prisma schema 已有 `ProductItem` 模型：

```
model ProductItem {
  id            String   @id @default(cuid())
  userId        String   @map("user_id")
  name          String
  sku           String?
  description   String?
  hsCode        String?  @map("hs_code")
  unit          String?  @default("PCS")
  unitPrice     Decimal? @map("unit_price") @db.Decimal(12, 2)
  currency      String?  @default("CNY")
  netWeight     Float?   @map("net_weight")
  grossWeight   Float?   @map("gross_weight")
  length        Float?
  width         Float?
  height        Float?
  imageUrl      String?  @map("image_url")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## 二、已有实现

- **API**: `/api/workspace/products` (GET/POST) — 已有完整 CRUD
- **API**: `/api/workspace/products/[id]` (GET/PUT/DELETE) — 已有
- **API**: `/api/workspace/products/import` — 批量导入
- **API**: `/api/workspace/products/template` — 下载模板
- **工作台页面**: `/workspace/products` — 已有完整 UI（列表、新增、编辑、删除、搜索、导入）

## 三、MVP 状态

**已有完整实现** — ProductItem 模型 + API + 工作台页面全部就绪。

### 可在单据工具中集成

ProductSelector 组件已存在于代码中（`src/components/product-selector.tsx`）。

## 四、后续增强方向

1. 商品分类/标签
2. 图片上传
3. 批量编辑
4. 商品导入/导出优化
5. 与单据工具深度集成（选择商品自动填入明细行）
