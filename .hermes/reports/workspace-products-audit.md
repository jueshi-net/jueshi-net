# Products 页面全量审计报告

Generated: 2026-07-13T19:45+08:00
Base: 88f7319

## 基础信息

```
PRODUCTS_PAGE_FILE=src/app/(workspace)/workspace/products/page.tsx
PRODUCTS_CLIENT_FILE=（无独立文件，整个 page.tsx 是 'use client'）
PRODUCTS_SUPPORT_FILES=（无专属组件文件）
TOTAL_LINE_COUNT=737
```

## 组件架构

```
SERVER_COMPONENT_FILES=0
CLIENT_COMPONENT_FILES=1 (page.tsx 整体是 'use client')
USES_WORKSPACE_PAGE_FRAME=false
CURRENT_LAYOUT_STRUCTURE=WorkspacePageHeader + max-w-7xl mx-auto + px-6 py-6
```

## 业务功能

### CRUD 流程
```
CREATE_FLOW=handleNew() → setShowForm(true) → handleSave() → POST /api/workspace/products
EDIT_FLOW=handleEdit(product) → setFormData → setShowForm(true) → handleSave() → PATCH /api/workspace/products/[id]
DELETE_FLOW=handleDelete(id) → confirm() → DELETE /api/workspace/products/[id]
```

### 高级功能
```
BULK_ACTIONS=false
IMPORT_EXPORT=true
  - handleDownloadTemplate() → GET /api/workspace/products/template
  - handleImportFile() → 解析 CSV
  - handleImport() → POST /api/workspace/products/import
FILE_UPLOAD=false (仅 CSV 文本解析)
```

### API 端点
```
API_ENDPOINTS=
  - GET /api/workspace/products (列表查询)
  - POST /api/workspace/products (创建)
  - PATCH /api/workspace/products/[id] (更新)
  - DELETE /api/workspace/products/[id] (删除)
  - GET /api/workspace/products/template (下载模板)
  - POST /api/workspace/products/import (批量导入)
```

### 权限检查
```
PERMISSION_CHECKS=false (页面级无权限检查，依赖 API 层)
DANGEROUS_TEST_ACTIONS=
  - handleDelete (真实删除)
  - handleSave (真实创建/更新)
  - handleImport (真实批量导入)
```

## 风险评估

```
REACT_OBJECT_RENDER_RISKS=
  - StatusBadge 使用对象配置（已在 Wave 02 修复）
  - EmptyState 使用对象配置（已在 Wave 02 修复）
  - 无直接渲染对象风险

RISK=HIGH
  - 737 行大型客户端组件
  - 包含完整 CRUD 业务逻辑
  - 包含批量导入功能
  - 包含多个模态框（表单、导入）
  - 包含复杂表单验证
```

## 当前布局结构

```tsx
<div className="min-h-screen bg-gray-50">
  <WorkspacePageHeader ... />
  <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
    {/* 统计指标 */}
    {/* 搜索与过滤 */}
    {/* Import Modal */}
    {/* Product Form Modal */}
    {/* Product List */}
  </div>
</div>
```

## 迁移策略

### 目标
将页面拆分为 server component + client component，使用 WorkspacePageFrame 包装

### 实现方案
1. 创建 `products-client.tsx`：提取当前的客户端逻辑（状态管理、API 调用、表单处理）
2. 修改 `page.tsx`：作为 server component，获取 RightRail 数据，包装 WorkspacePageFrame

### 保留内容
- ✅ 产品列表（CompactTable）
- ✅ 搜索与过滤
- ✅ 统计指标
- ✅ 新建/编辑/删除/复制功能
- ✅ 导入/导出功能
- ✅ 所有表单字段和验证
- ✅ 所有 API 调用
- ✅ 所有权限判断（API 层）
- ✅ Loading/空状态/错误状态

### 禁止修改
- ❌ API 端点
- ❌ 数据结构
- ❌ 业务逻辑
- ❌ 表单验证
- ❌ 权限检查

## 文件拆分计划

### products-client.tsx（新建）
- 所有 useState
- 所有 useEffect
- 所有 fetch 函数
- 所有 handler 函数
- 所有模态框 JSX
- 表格和表单 JSX

### page.tsx（修改）
- 移除 'use client'
- 添加 server-side 数据获取（unreadNotifs, badgeCount, recentMemos）
- 添加 WorkspacePageFrame 包装
- 添加 WorkspaceRightRail
- 导入并渲染 ProductsClient

## 迁移后预期结构

```tsx
// page.tsx (server component)
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WorkspacePageFrame from "@/components/workspace/WorkspacePageFrame";
import WorkspaceRightRail from "@/components/workspace/WorkspaceRightRail";
import ProductsClient from "./products-client";

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/products");

  const userId = session.user.id;

  const [unreadNotifs, badgeCount, recentMemos] = await Promise.all([
    prisma.notification.count({ where: { userId, readAt: null } }).catch(() => 0),
    prisma.userBadgeAward.count({ where: { userId } }).catch(() => 0),
    prisma.memo.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }).catch(() => []),
  ]);

  return (
    <WorkspacePageFrame
      rightRail={
        <WorkspaceRightRail
          unreadNotifs={unreadNotifs}
          badgeCount={badgeCount}
          recentMemos={recentMemos}
          userId={userId}
        />
      }
    >
      <ProductsClient />
    </WorkspacePageFrame>
  );
}
```

## 验证清单

- [ ] Claude exit code=0
- [ ] stdout 有成功标记
- [ ] git diff 非空
- [ ] 只修改允许的文件
- [ ] 使用 WorkspacePageFrame
- [ ] 不自行渲染 WorkspaceRightRail
- [ ] 无页面级三栏
- [ ] 无 max-w-7xl mx-auto
- [ ] CRUD 功能完整保留
- [ ] 无 React error #31
- [ ] Build 成功
- [ ] Playwright 通过
