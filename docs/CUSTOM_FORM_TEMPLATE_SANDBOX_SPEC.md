# Custom Form Template Sandbox Specification

> **版本**: v1.20.42.18.6.15  
> **状态**: Design Spec  
> **原则**: 禁止任意 JS，允许安全变量绑定和官方组件 block

---

## 1. 安全目标

| 目标 | 描述 |
|------|------|
| 禁止任意 JS | 用户自定义模板不能包含或执行 JavaScript |
| 禁止数据泄露 | 模板不能访问 cookie/session/token/localStorage |
| 禁止网络请求 | 模板不能发起 fetch/XHR/WebSocket |
| XSS 防护 | 所有用户输入和模板变量必须经过转义 |
| 安全渲染 | 模板在隔离环境中渲染 |

---

## 2. 允许的能力

### 2.1 安全变量绑定

使用 `{{variable}}` 双花括号语法，支持嵌套路径：

```
{{company.name}}
{{company.address}}
{{document.invoiceNo}}
{{document.date}}
{{items[0].name}}
{{total.amount}}
```

**变量白名单**：

| 变量路径 | 来源 | 示例 |
|---------|------|------|
| `company.*` | CompanyProfile | name, address, phone, email, taxId |
| `document.*` | 文档表单数据 | invoiceNo, date, currency, terms |
| `items.*` | 商品明细数组 | name, qty, price, hsCode, weight |
| `total.*` | 计算汇总 | amount, currency, weight, volume |
| `meta.*` | 元数据 | toolKey, version, generatedAt |

**禁止的变量**：
- `cookie.*`
- `session.*`
- `token.*`
- `localStorage.*`
- `process.*`
- `window.*`
- `document.cookie`
- 任何以 `_` 开头的内部变量

### 2.2 有限 CSS Tokens

允许用户自定义以下 CSS 属性（通过 design tokens）：

```css
/* 允许的 tokens */
--primary-color: #1d4ed8;
--border-color: #bfdbfe;
--heading-bg: #dbeafe;
--text-color: #1e3a5f;
--font-size: 14px;
--padding: 16px;
--border-radius: 8px;
--table-style: grid | zebra | minimal;
--header-style: classic | banner | compact | minimal;
```

**禁止的 CSS**：
- `position: fixed/absolute`（可能覆盖安全 UI）
- `z-index`（可能覆盖安全 UI）
- `url()` 引用外部资源
- `@import`
- `expression()` / `javascript:`

### 2.3 官方组件 Block

模板由预定义的 block 组件组合而成：

| Block | 用途 | 安全级别 |
|-------|------|---------|
| `<TableBlock>` | 数据表格 | ✅ 安全 |
| `<TitleBlock>` | 标题 | ✅ 安全 |
| `<SignBlock>` | 签名区 | ✅ 安全 |
| `<LogoBlock>` | 公司 Logo | ✅ 安全（图片 URL 校验） |
| `<StampBlock>` | 印章 | ✅ 安全 |
| `<BarcodeBlock>` | 条码 | ✅ 安全 |
| `<QrcodeBlock>` | 二维码 | ✅ 安全 |
| `<TextBlock>` | 文本段落 | ✅ 安全 |
| `<TotalBlock>` | 金额汇总 | ✅ 安全 |
| `<ItemListBlock>` | 商品列表 | ✅ 安全 |

**Block 属性**：只能接受白名单内的变量绑定和 CSS tokens，不接受任意字符串。

---

## 3. 渲染策略

### 3.1 方案：安全服务端渲染 + 客户端水合

```
模板 JSON → 服务端解析 → 生成安全 React 组件树 → 客户端水合
```

**不使用 iframe sandbox 的原因**：
- iframe 会导致打印/导出困难
- iframe 通信需要 postMessage，增加复杂度
- 服务端渲染更安全，可以在解析阶段拦截所有危险内容

### 3.2 解析流程

```
1. 读取模板 JSON 配置
2. 验证所有 block 类型在白名单中
3. 验证所有变量绑定在白名单中
4. 验证所有 CSS tokens 在允许列表中
5. 对所有字符串值进行 XSS 转义
6. 生成 React 组件树
7. 客户端水合（无 JS 执行能力）
```

### 3.3 XSS 防护

```typescript
function sanitizeValue(value: string): string {
  // 1. 移除所有 HTML 标签
  const stripped = value.replace(/<[^>]*>/g, "");
  // 2. 转义特殊字符
  return stripped
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function validateVariable(path: string): boolean {
  const FORBIDDEN = ["cookie", "session", "token", "localStorage", "process", "window", "document.cookie"];
  for (const f of FORBIDDEN) {
    if (path.startsWith(f)) return false;
  }
  return true;
}
```

---

## 4. 模板版本化

### 4.1 版本状态机

```
draft → pending_review → approved → published
                    ↓
               rejected → draft (修改后重新提交)
               
published → disabled (管理员操作)
```

### 4.2 版本数据结构

```typescript
interface TemplateVersion {
  version: number;           // 自增版本号
  status: TemplateStatus;    // 当前状态
  origin: TemplateOrigin;    // 来源
  createdAt: string;         // 创建时间
  reviewedBy?: string;       // 审核人
  reviewNote?: string;       // 审核备注
  publishedAt?: string;      // 发布时间
  configHash: string;        // 配置哈希（检测变更）
}
```

---

## 5. 模板分类与审核

### 5.1 官方模板

| 属性 | 值 |
|------|-----|
| 来源 | 平台官方团队 |
| 审核 | 内部 QA 流程 |
| 可见范围 | 全部用户 |
| 定制 | 不可修改 |
| 版本 | 跟随平台版本 |

### 5.2 企业模板

| 属性 | 值 |
|------|-----|
| 来源 | 企业管理员 |
| 审核 | 平台审核（安全扫描 + 人工抽检） |
| 可见范围 | 该企业成员 |
| 定制 | 企业管理员可修改 |
| 版本 | 企业独立版本号 |
| 限制 | 每企业最多 20 个自定义模板 |

### 5.3 个人模板

| 属性 | 值 |
|------|-----|
| 来源 | 个人用户 |
| 审核 | 自动安全扫描（无需人工） |
| 可见范围 | 创建者本人 |
| 定制 | 创建者可修改 |
| 版本 | 个人版本号 |
| 限制 | 免费用户 3 个，Pro 用户 10 个 |

### 5.4 团队模板

| 属性 | 值 |
|------|-----|
| 来源 | 团队管理员 |
| 审核 | 企业管理员审核 |
| 可见范围 | 该团队成员 |
| 定制 | 团队管理员可修改 |
| 版本 | 团队版本号 |

---

## 6. 文件上传限制

| 类型 | 允许 | 大小限制 | 说明 |
|------|------|---------|------|
| Logo 图片 | PNG/JPG/SVG | 500KB | SVG 需额外 XSS 扫描 |
| 印章图片 | PNG/JPG | 500KB | 透明背景 |
| 签名图片 | PNG | 200KB | 手写签名扫描 |
| 附件 | PDF | 5MB | 导出附件 |
| 其他 | ❌ | — | 不允许其他文件类型 |

**SVG 安全扫描**：
- 移除 `<script>` 标签
- 移除 `on*` 事件属性
- 移除 `javascript:` URL
- 移除外部引用 `xlink:href` 指向非白名单域名

---

## 7. 审计策略

### 7.1 模板操作审计

| 操作 | 日志级别 | 记录内容 |
|------|---------|---------|
| 创建模板 | INFO | userId, toolKey, origin |
| 修改模板 | INFO | userId, templateId, version, diff |
| 提交审核 | INFO | userId, templateId, version |
| 审核通过/拒绝 | WARN | reviewerId, templateId, decision, note |
| 发布/停用 | WARN | adminId, templateId, action |
| 使用模板 | DEBUG | userId, templateId, toolKey |
| 导出使用模板 | INFO | userId, templateId, format |

### 7.2 安全事件审计

| 事件 | 级别 | 处理 |
|------|------|------|
| 检测到 JS 代码 | ERROR | 阻止保存，记录用户 |
| 检测到禁止变量 | ERROR | 阻止保存，记录用户 |
| 检测到 XSS 尝试 | ERROR | 阻止渲染，记录用户 |
| 检测到禁止 CSS | WARN | 移除禁止项，允许保存 |
| SVG 含恶意代码 | ERROR | 阻止上传，记录用户 |

---

## 8. 安全边界总结

| 规则 | 实现 |
|------|------|
| ❌ 禁止任意 JS | 模板 JSON 配置，无代码执行 |
| ✅ 允许变量绑定 | 白名单变量，`{{}}` 语法 |
| ✅ 允许有限 CSS | 白名单 tokens |
| ✅ 允许官方 block | 预定义安全组件 |
| ❌ 禁止访问 cookie/session | 变量白名单排除 |
| ❌ 禁止网络请求 | 无 fetch/XHR 能力 |
| ✅ XSS 防护 | 全局转义 + 标签移除 |
| ✅ 文件上传限制 | 类型+大小+内容扫描 |
| ✅ 模板版本化 | 版本号+状态机 |
| ✅ 审核机制 | 自动扫描+人工审核 |

---

**文档状态**: Specification Complete  
**下一步**: Phase 6 — 模板市场产品规划
