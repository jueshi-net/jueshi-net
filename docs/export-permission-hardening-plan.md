# 导出权限强制收口方案

> 版本: v1.0  
> 日期: 2026-05-15  
> 状态: 设计草案

---

## 一、当前为什么仍可绕过？

### 1.1 导出仍在客户端执行

当前 Word/PNG/PDF 导出全部在浏览器端完成：
- **Word**: 前端拼接 HTML → 创建 Blob → 触发下载
- **PNG**: 前端 html2canvas 渲染 DOM → 生成 canvas → 下载
- **PDF**: 前端 `window.print()` 或 jsPDF

服务端只提供 `/api/export/authorize` 授权接口，但**不强制验证返回的 token**。前端拿到 token 后可以选择忽略，直接执行导出。

### 1.2 授权 token 没有被强制验证

`/api/export/authorize` 返回的 `token` 是一个 5 分钟有效的签名票据，但：
- 前端调用 `authorizeExportClient()` 后只读取 `allowed` 字段
- token 没有被传回任何服务端接口进行验证
- 恶意用户可以直接调用导出逻辑，跳过 `authorizeExportClient()`

### 1.3 去品牌和会员模板无法真正保护

因为导出在客户端执行：
- 前端收到 `mustShowBranding: true` 后仍然可以选择忽略
- 前端收到 `allowedTemplateStyle: "standard"` 后仍然可以使用会员模板
- 没有服务端渲染来强制执行这些限制

---

## 二、授权 token 当前有没有被强制验证？

**没有。**

token 生成于 `/api/export/authorize`，但没有任何服务端接口验证它。它只是一个"软性"授权标记，依赖前端自觉遵守。

---

## 三、如果继续前端导出，能不能真正保护去品牌和会员模板？

**不能。** 前端导出的本质决定了：
- 所有渲染逻辑在用户浏览器中执行
- 用户可以修改前端代码（浏览器 DevTools / 自定义脚本）
- 任何前端强制（如 `if (!canRemoveBranding()) addWatermark()`）都可以被绕过

**唯一真正有效的方式是服务端渲染导出。**

---

## 四、最终方案：服务端导出

### 4.1 推荐技术选型

| 导出类型 | 推荐方案 | 理由 |
|----------|----------|------|
| **Word (.docx)** | `docx` npm 包（服务端生成） | 纯 JS 库，不依赖浏览器，可精确控制格式 |
| **PNG/PDF** | Playwright server-side screenshot | 完整渲染 React 组件，保证视觉一致性 |

### 4.2 为什么选这些

- **`docx`**: 轻量（~200KB），不需要外部依赖，适合 VPS 部署。可以在服务端根据 DB role 决定文档内容、品牌页脚等。
- **Playwright**: 可以复用现有的 React 组件渲染，不需要重写布局逻辑。但需要安装 Chromium（~150MB），增加 VPS 内存占用。

---

## 五、分阶段方案

### Phase A：当前状态（已完成）✅

- ✅ `/api/me/permissions` 返回真实 DB 角色
- ✅ `/api/export/authorize` 服务端校验 + 返回 token
- ✅ 前端 `usePermissions()` 优先请求服务端，fallback 到 localStorage
- ✅ `ExportLog` 表记录导出次数
- ✅ Word 每日 3 次限制已落地
- ⚠️ 前端仍可绕过（接受低风险）
- ⚠️ 去品牌和会员模板只是前端提示

**风险评估**: 低。普通用户不会主动绕过，恶意用户即使绕过也只能给自己生成文件（不影响他人数据）。

### Phase B：Word 导出服务端化（推荐下一个做）

新增 `POST /api/export/document/word`：

```
请求:
{
  "documentType": "commercial-invoice",
  "formData": { ... },       // 单据数据
  "companyProfile": { ... },  // 公司信息
  "lineItems": [ ... ],       // 行项目
  "templateStyle": "blue",    // 请求的模板
  "removeBranding": true      // 请求去品牌
}

服务端处理:
1. 读取 session → 获取 userId
2. 查询 DB → 获取真实 role
3. 验证 token（可选，如果前端先调 authorize）或直接校验权限
4. 检查 Word 每日配额（user 角色）
5. 根据 role 强制决定：
   - guest: 403
   - user: 强制 standard 模板 + 带品牌页脚
   - member/admin: 允许请求的模板 + 可选去品牌
6. 使用 docx 库生成 .docx 文件
7. 写入 ExportLog
8. 返回文件流
```

**前端改动**:
- Word 导出按钮改为调用 `POST /api/export/document/word`
- 不再在客户端拼接 HTML
- PNG/PDF 暂时不动

**工作量估计**: 2-3 天

### Phase C：PNG/PDF 服务端化（长期）

新增 `POST /api/export/document/image` 和 `POST /api/export/document/pdf`：

```
请求:
{
  "documentType": "commercial-invoice",
  "formData": { ... },
  "format": "png" | "pdf",
  "templateStyle": "blue",
  "removeBranding": true
}

服务端处理:
1. 验证角色权限
2. 启动 Playwright（或使用已有的 headless Chrome）
3. 渲染 React 组件到 offscreen 页面
4. 根据 role 决定是否添加品牌水印
5. 截图/生成 PDF
6. 返回文件
```

**前置条件**:
- VPS 安装 Playwright + Chromium
- 内存检查（当前 8GB 够用，但需要 ~200MB 额外）
- 可能需要独立渲染页面（如 `/api/render/document/[type]`）

**工作量估计**: 3-5 天

---

## 六、Phase B 详细设计：服务端 Word 导出

### 6.1 API 设计

```
POST /api/export/document/word

Authorization: NextAuth session cookie

Body:
{
  "token": "optional-signed-token",  // 如果前端先调了 authorize
  "documentType": "commercial-invoice",
  "data": { ... formData ... },
  "lineItems": [ ... ],
  "companyProfile": { ... }
}

Response:
  200: application/msword 文件流
  401: 未登录
  403: 权限不足 / 每日配额用完
  400: 参数错误
  500: 生成失败
```

### 6.2 权限矩阵

| 角色 | Word 导出 | 模板选择 | 去品牌 | 每日限制 |
|------|-----------|----------|--------|----------|
| guest | ❌ 403 | - | - | - |
| user | ✅ | 强制 standard | 强制 false | 3 次/天 |
| member | ✅ | 全部允许 | ✅ | 不限 |
| admin | ✅ | 全部允许 | ✅ | 不限 |

### 6.3 实现要点

1. 使用 `docx` npm 包在服务端构建文档
2. 复用现有的 `getTemplate()` 和字段定义
3. 根据 role 决定是否添加品牌页脚
4. 写入 `ExportLog` 记录
5. 返回 `Content-Disposition: attachment` 的文件流

---

## 七、总结

| 阶段 | 状态 | 保护级别 | 工作量 |
|------|------|----------|--------|
| Phase A（当前） | ✅ 已完成 | 低（前端可绕过） | - |
| Phase B（Word 服务端化） | 📋 待做 | 高 | 2-3 天 |
| Phase C（PNG/PDF 服务端化） | 📋 长期 | 最高 | 3-5 天 |

**推荐优先级**: Phase B 应该作为下一个开发阶段（v1.13.4 或 v1.14.0）。

---

> 注意：本轮（v1.13.3）只做权限真实测试和方案设计，不执行服务端导出实现。
