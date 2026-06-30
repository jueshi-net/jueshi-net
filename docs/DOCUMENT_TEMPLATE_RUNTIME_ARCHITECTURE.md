# Document Template Runtime Architecture

> **版本**: v1.20.42.18.6.15  
> **状态**: Design + MVP Implementation  
> **原则**: 数据能力统一，视觉模板自由

---

## 1. 核心理念

```
┌─────────────────────────────────────────────────────────┐
│                    Document Runtime                       │
│                                                           │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │  Capability Layer│  │      Template Layer          │  │
│  │  (统一底座)       │  │      (自由模板)               │  │
│  │                  │  │                              │  │
│  │  • Company       │  │  • StandardDocumentTemplate  │  │
│  │  • Product       │  │  • CustomFormShell           │  │
│  │  • Draft         │  │  • LabelPrintTemplate        │  │
│  │  • Export        │  │  • ScriptGeneratorTemplate   │  │
│  │  • Entitlement   │  │  • User Custom Templates     │  │
│  │  • Audit         │  │  • Enterprise Templates      │  │
│  │  • Chain         │  │                              │  │
│  └───────┬──────────┘  └───────────┬──────────────────┘  │
│          │                        │                       │
│          └──────────┬─────────────┘                       │
│                     ▼                                     │
│           ┌─────────────────┐                             │
│           │  Tool Runtime   │                             │
│           │  (运行时协调)    │                             │
│           └─────────────────┘                             │
└─────────────────────────────────────────────────────────┘
```

**设计原则**:
1. 能力是 Plug-in，模板是 Shell — 能力可组合，模板可替换
2. 工具声明需要哪些能力，Runtime 负责注入
3. 模板完全控制视觉，能力不强制 UI
4. 自定义模板在沙箱内运行，不能访问 cookie/session/token

---

## 2. Document Core 数据结构

```typescript
// src/lib/document-runtime/types.ts

/** 工具能力声明 */
interface CapabilitySet {
  company: boolean;        // 公司资料
  product: boolean;        // 商品资料
  draft: boolean;          // 草稿保存/恢复
  export: ExportType[];    // 导出能力 ['pdf', 'word', 'excel', 'print']
  chain: boolean;          // 单据链路
  entitlement: boolean;    // 会员门禁
  audit: AuditLevel;       // 审计级别
  bbs: boolean;            // BBS 联动
  content: boolean;        // 工具内容（指南/FAQ/错误）
}

/** 工具注册信息 */
interface ToolRegistration {
  key: string;                    // 唯一标识
  route: string;                  // 路由路径
  titleZh: string;
  titleEn: string;
  category: ToolCategory;         // trade/logistics/customs/consolidation/finance/label/script
  rendererType: RendererType;     // 'standard-document' | 'custom-form' | 'label-print' | 'script-generator'
  capabilities: CapabilitySet;
  customizationLevel: 'locked' | 'official-only' | 'enterprise' | 'user';
  auditLevel: 'P0' | 'P1' | 'P2';
  version: string;
}

/** 运行时上下文 — 注入到工具中的能力实例 */
interface RuntimeContext {
  toolKey: string;
  company?: CompanyAdapter;
  product?: ProductAdapter;
  draft?: DraftAdapter;
  export?: ExportAdapter;
  entitlement?: EntitlementAdapter;
  audit?: AuditAdapter;
  chain?: ChainAdapter;
}

/** Runtime Hook — 工具通过此 Hook 获取注入的能力 */
interface UseRuntimeResult {
  ctx: RuntimeContext | null;
  ready: boolean;
  error: string | null;
}
```

---

## 3. Template Registry

### 3.1 注册表结构

```typescript
// src/lib/document-runtime/template-registry.ts

const TEMPLATE_REGISTRY: Map<string, ToolRegistration> = new Map();

function registerTool(config: ToolRegistration): void {
  TEMPLATE_REGISTRY.set(config.key, config);
}

function getTool(key: string): ToolRegistration | undefined {
  return TEMPLATE_REGISTRY.get(key);
}

function getAllTools(): ToolRegistration[] {
  return Array.from(TEMPLATE_REGISTRY.values());
}

function getToolsByCategory(category: ToolCategory): ToolRegistration[] {
  return getAllTools().filter(t => t.category === category);
}

function getToolsByRendererType(type: RendererType): ToolRegistration[] {
  return getAllTools().filter(t => t.rendererType === type);
}
```

### 3.2 已注册工具（8 个 MVP）

| key | route | category | rendererType | capabilities | customizationLevel |
|-----|-------|----------|-------------|-------------|-------------------|
| standard-quotation | /tools/documents/quotation | trade | standard-document | company+product+draft+export(pdf,word)+chain+entitlement+audit+bbs+content | locked |
| commercial-invoice | /tools/documents/commercial-invoice | trade | standard-document | 同上 | locked |
| supply-chain-quote | /tools/documents/quotation | trade | custom-form | company+product+draft+export(pdf,word)+chain+entitlement+audit+bbs+content | enterprise |
| inbound-receipt | /tools/inbound-receipt | logistics | custom-form | company+draft+export(pdf)+entitlement+audit | enterprise |
| handover-note | /tools/handover-note | logistics | custom-form | company+draft+export(pdf)+entitlement+audit | enterprise |
| shipping-label | /tools/shipping-label | label | label-print | company+draft+export(pdf,print)+entitlement+audit | enterprise |
| debit-note | /tools/debit-note | finance | custom-form | company+draft+export(pdf)+entitlement+audit | enterprise |
| shooting-script | /tools/video-script-sop | script | script-generator | draft+entitlement+audit | user |

---

## 4. Capability Registry

```typescript
// src/lib/document-runtime/capability-registry.ts

type CapabilityName = 'company' | 'product' | 'draft' | 'export' | 
                       'chain' | 'entitlement' | 'audit' | 'bbs' | 'content';

const CAPABILITY_REGISTRY = {
  company: {
    name: 'Company Profile',
    description: '公司资料选择、多公司切换、自动填充',
    requiredProps: ['profiles', 'selectedProfile', 'onSelect'],
  },
  product: {
    name: 'Product Catalog',
    description: '商品库选择、HS Code/重量/体积自动填充',
    requiredProps: ['products', 'onSelect', 'onFill'],
  },
  draft: {
    name: 'Draft Save/Restore',
    description: '草稿保存、恢复、历史、复制、删除',
    requiredProps: ['toolKey', 'save', 'load', 'list', 'duplicate', 'delete'],
  },
  export: {
    name: 'Export',
    description: 'PDF/Word/Excel/Print 导出',
    requiredProps: ['formats', 'exportFn', 'entitlementCheck'],
  },
  chain: {
    name: 'Document Chain',
    description: '单据链路：报价→PI→CI→PL→装柜',
    requiredProps: ['chainType', 'generateNext', 'navigateTo'],
  },
  entitlement: {
    name: 'Membership Entitlement',
    description: '会员等级门禁、权益检查',
    requiredProps: ['tier', 'checkAccess', 'upgradePrompt'],
  },
  audit: {
    name: 'Audit Trail',
    description: '操作审计日志',
    requiredProps: ['logAction', 'logExport', 'logError'],
  },
  bbs: {
    name: 'BBS Linkage',
    description: '社区讨论联动',
    requiredProps: ['relatedTool', 'postUrl'],
  },
  content: {
    name: 'Tool Content',
    description: '使用指南、FAQ、常见错误、示例',
    requiredProps: ['guide', 'faq', 'errors', 'examples'],
  },
};
```

---

## 5. Form Runtime Hooks

### 5.1 useToolRuntime（主 Hook）

```typescript
// src/lib/document-runtime/tool-runtime.ts

function useToolRuntime(toolKey: string): UseRuntimeResult {
  // 1. 从 Template Registry 获取工具注册信息
  // 2. 根据 capabilities 声明，初始化各 Adapter
  // 3. 返回 RuntimeContext
}
```

### 5.2 Adapter Hooks（工具按需使用）

| Hook | 功能 | 使用条件 |
|------|------|---------|
| `useCompanyAdapter(toolKey)` | 公司资料选择/填充 | capabilities.company = true |
| `useProductAdapter(toolKey)` | 商品选择/填充 | capabilities.product = true |
| `useDraftAdapter(toolKey, emptyForm)` | 草稿 CRUD | capabilities.draft = true |
| `useExportAdapter(toolKey, formats)` | 导出 | capabilities.export.length > 0 |
| `useEntitlementAdapter(toolKey)` | 会员门禁 | capabilities.entitlement = true |
| `useAuditAdapter(toolKey)` | 审计日志 | always |
| `useChainAdapter(toolKey)` | 单据链路 | capabilities.chain = true |

---

## 6. Adapter 接口

### 6.1 Company Adapter
```typescript
interface CompanyAdapter {
  profiles: CompanyProfile[];
  selectedProfile: CompanyProfile | null;
  loading: boolean;
  onSelect: (profile: CompanyProfile) => void;
  refresh: () => Promise<void>;
}
```

### 6.2 Product Adapter
```typescript
interface ProductAdapter {
  products: Product[];
  loading: boolean;
  onSelect: (product: Product) => void;
  search: (keyword: string) => Promise<Product[]>;
}
```

### 6.3 Draft Adapter
```typescript
interface DraftAdapter {
  draftId: string | null;
  saving: boolean;
  saved: boolean;
  saveMsg: string;
  loadingDraft: boolean;
  handleSave: () => Promise<void>;
  handleRestore: (json: string) => void;
  handleDuplicate: (id: string) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
}
```

### 6.4 Export Adapter
```typescript
interface ExportAdapter {
  formats: ExportType[];
  handleExport: (type: ExportType, data: unknown) => Promise<void>;
  isEntitled: (type: ExportType) => boolean;
}
```

### 6.5 Entitlement Adapter
```typescript
interface EntitlementAdapter {
  tier: 'free' | 'pro' | 'enterprise';
  canAccess: boolean;
  reason: string | null;
  upgradeUrl: string;
}
```

### 6.6 Audit Adapter
```typescript
interface AuditAdapter {
  logAction: (action: string, meta?: Record<string, unknown>) => void;
  logExport: (format: string, success: boolean) => void;
  logError: (error: string, context?: Record<string, unknown>) => void;
}
```

---

## 7. Custom Template Sandbox

### 安全边界

| 层面 | 规则 |
|------|------|
| JS 执行 | ❌ 禁止用户自定义 JS |
| 变量绑定 | ✅ 允许 `{{company.name}}` 格式变量 |
| CSS | ✅ 允许有限 design tokens（颜色、间距） |
| 组件 | ✅ 允许官方 block 组件（表格/标题/签名/Logo/印章/条码/二维码） |
| 数据访问 | ❌ 禁止访问 cookie/session/token/localStorage |
| 网络 | ❌ 禁止 fetch/XHR/WebSocket |
| 渲染 | ✅ iframe sandbox 或安全服务端渲染 |

### 模板版本化

```typescript
interface TemplateVersion {
  version: number;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published' | 'disabled';
  createdAt: string;
  reviewedBy?: string;
  reviewNote?: string;
}
```

### 模板分类

| 类型 | 来源 | 审核要求 | 可见范围 |
|------|------|---------|---------|
| 官方模板 | 平台官方 | 内部 QA | 全部用户 |
| 企业模板 | 企业管理员 | 平台审核 | 该企业成员 |
| 个人模板 | 个人用户 | 自动审核(安全扫描) | 创建者本人 |
| 团队模板 | 企业团队管理员 | 企业管理员审核 | 该团队 |

---

## 8. 迁移路线

### Phase A（当前 — MVP）
- ✅ Template Registry + Capability Registry + types 定义
- ✅ CustomFormShell + 3 个 Bridge 组件
- ✅ 3 个个性化工具接入示范
- ✅ 沙箱安全方案设计

### Phase B（下一步）
- 将 useDocumentToolBase 重构为 useToolRuntime
- 将 Company/Product/Draft/Export 逻辑迁移到 Adapter 模式
- 独立工具逐个接入 CustomFormShell

### Phase C（中期）
- 模板编辑器（可视化拖拽）
- 企业模板管理后台
- 模板审核流程

### Phase D（长期）
- 模板市场
- 模板导入导出
- 模板商业化

---

## 9. 安全边界总结

| 规则 | 实现 |
|------|------|
| 禁止触碰 production | CURRENT_MODE=DEV，SSH staging only |
| 禁止合并 main | 分支 staging only |
| 禁止 prisma db push | 无 DB schema 变更 |
| 禁止修改 9833416@qq.com | 不涉及用户数据 |
| 禁止提交 secret | 不涉及密钥 |
| 禁止任意 JS | 沙箱设计禁止 |
| 禁止模板访问 cookie/session | 沙箱隔离 |
| 禁止 HTML 伪造 Word | 使用 JSZip OOXML |

---

**文档状态**: Architecture Design Complete  
**下一步**: Phase 3 — Template Registry MVP Implementation
