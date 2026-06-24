# 单据工具链数据流

## 一、数据模型

### 1.1 现有模型

- `DocumentHistory` — 已有，用于保存草稿
- `UserCompanyProfile` — 已有，公司资料
- `export_logs` — 已有，导出记录

### 1.2 需要新增的模型

```prisma
model ProductCatalog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  sku         String?
  chineseName String
  englishName String?
  hsCode      String?
  material    String?
  usage       String?
  unitPrice   Float?
  currency    String   @default("CNY")
  unit        String   @default("个")
  netWeight   Float?
  grossWeight Float?
  volume      Float?
  imageUrl    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 1.3 草稿数据格式

```typescript
interface DocumentDraft {
  id: string;
  type: string;           // document type slug
  userId: string;
  companyProfileId?: string;
  data: {
    items?: ChainDocumentItem[];
    [key: string]: any;
  };
  status: 'draft' | 'saved' | 'archived';
  sourceType?: string;     // chain source
  sourceId?: string;       // chain source draft ID
  createdAt: string;
  updatedAt: string;
}
```

## 二、数据流图

```
[商品资料库] → [Quote Sheet] → [Proforma Invoice] → [Commercial Invoice] → [Packing List] → [Container Loading List]
       ↑              ↓                ↓                   ↓                  ↓                    ↓
       ↑          [Draft]         [Draft]             [Draft]            [Draft]              [Draft]
       ↑              ↓                ↓                   ↓                  ↓                    ↓
       ↑         [Workspace]     [Workspace]         [Workspace]        [Workspace]          [Workspace]
       ↑
[Company Profile] → 贯穿全链路
```

## 三、API 设计

### 3.1 草稿 API（现有）

- `POST /api/documents/drafts` — 保存草稿
- `GET /api/documents/drafts` — 获取草稿列表
- `GET /api/documents/drafts/[id]` — 获取单个草稿
- `DELETE /api/documents/drafts/[id]` — 删除草稿

### 3.2 链路 API（新增）

- `POST /api/documents/chain` — 从源单据创建目标单据
  - Body: `{ sourceType, sourceId, targetType }`
  - Response: `{ targetUrl, draftId }`

### 3.3 商品资料 API（新增）

- `GET /api/products` — 获取用户商品列表
- `POST /api/products` — 创建商品
- `PUT /api/products/[id]` — 更新商品
- `DELETE /api/products/[id]` — 删除商品

## 四、前端实现

### 4.1 链路入口

在工具页面底部添加"下一步"区域：

```tsx
<div className="chain-actions">
  <h3>下一步</h3>
  <button onClick={() => chainTo('proforma-invoice')}>
    生成形式发票 →
  </button>
</div>
```

### 4.2 链路传递

```typescript
async function chainTo(targetType: string) {
  // 1. 保存当前草稿
  const draft = await saveDraft();
  
  // 2. 创建链路
  const res = await fetch('/api/documents/chain', {
    method: 'POST',
    body: JSON.stringify({
      sourceType: currentType,
      sourceId: draft.id,
      targetType,
    }),
  });
  
  const { targetUrl } = await res.json();
  
  // 3. 跳转
  window.location.href = targetUrl;
}
```

### 4.3 目标工具接收

```typescript
// 在 page.tsx 中
const searchParams = useSearchParams();
const fromDraftId = searchParams.get('fromDraftId');

useEffect(() => {
  if (fromDraftId) {
    loadFromChain(fromDraftId);
  }
}, [fromDraftId]);
```
