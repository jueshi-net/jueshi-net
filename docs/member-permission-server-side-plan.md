# 会员权限服务端校验方案

> 版本: v0.1  
> 状态: 设计草案，待确认  
> 日期: 2026-05-15  
> 基于: v1.12.9-stable (commit `3110be8`)

---

## 一、当前安全审计

### 1.1 问题发现

当前 `src/lib/membership/permissions.ts` 中 `getRole()` 完全依赖客户端 `localStorage.bxb_role`：

```typescript
function getRole(): UserRole {
  if (typeof window === "undefined") return "guest";
  const saved = localStorage.getItem("bxb_role");
  if (saved === "member" || saved === "admin") return saved as UserRole;
  if (saved === "user") return "user";
  return "guest";
}
```

**严重问题：**
- 任何用户可在浏览器控制台执行 `localStorage.setItem("bxb_role", "member")` 即可绕过所有限制
- SSR 环境下 `getRole()` 始终返回 `"guest"`（`typeof window === "undefined"`）
- 没有任何服务端 API 层校验

### 1.2 当前仅靠 localStorage 的功能

| 功能 | 校验方式 | 风险等级 | 说明 |
|------|----------|----------|------|
| **Word 导出** | `canExportWord()` → localStorage | 🔴 高 | 可直接修改 localStorage 绕过 |
| **Logo 上传** | `canUploadLogo()` → localStorage | 🔴 高 | 文件上传无服务端校验 |
| **云端草稿** | `canSaveCloudDraft()` → localStorage | 🔴 高 | 服务端 API 无权限校验 |
| **自定义模板风格** | `canUseCustomStyle()` → localStorage | 🟡 中 | 仅影响前端展示 |
| **去除品牌标识** | `canRemoveBranding()` → localStorage | 🟡 中 | 仅影响前端展示 |
| **公司模板数量** | `maxCompanyProfiles` → localStorage | 🟡 中 | 前端限制数量，服务端未校验 |
| **唛头批量数量** | `getLabelBatchLimit()` → localStorage | 🟡 中 | 前端限制数量，服务端未校验 |
| **PNG/PDF 导出** | 当前无限制（全员可用） | 🟢 低 | 暂不限制 |
| **会员资料下载** | 前端判断 | 🟡 中 | 如有此功能需服务端校验 |

---

## 二、统一服务端角色获取

### 2.1 设计 `getCurrentUserFromSession()`

```typescript
// src/lib/server/auth.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export interface ServerUserContext {
  id: string;
  email: string;
  name: string | null;
  role: 'guest' | 'user' | 'member' | 'admin';
  isAuthenticated: boolean;
  membershipLevel?: string | null;  // 来自 UserSubscription
  subscriptionStatus?: 'active' | 'canceled' | 'expired' | 'none';
}

export async function getCurrentUserFromSession(): Promise<ServerUserContext> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return {
      id: '',
      email: '',
      name: null,
      role: 'guest',
      isAuthenticated: false,
      subscriptionStatus: 'none',
    };
  }

  // 从数据库获取用户真实角色和订阅状态
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscriptions: {
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { plan: true },
      },
    },
  });

  if (!user) {
    return {
      id: '',
      email: session.user.email,
      name: session.user.name || null,
      role: 'user',
      isAuthenticated: true,
      subscriptionStatus: 'none',
    };
  }

  // 角色优先级: admin > member (active subscription) > user
  let role: ServerUserContext['role'] = 'user';
  if (user.role === 'admin') {
    role = 'admin';
  } else if (user.subscriptions.length > 0 && user.subscriptions[0].status === 'active') {
    role = 'member';
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role,
    isAuthenticated: true,
    membershipLevel: user.subscriptions[0]?.plan?.name || null,
    subscriptionStatus: user.subscriptions.length > 0 ? 'active' : 'none',
  };
}
```

### 2.2 权限校验中间件

```typescript
// src/lib/server/permission.ts
import { getCurrentUserFromSession, ServerUserContext } from './auth';
import { NextRequest, NextResponse } from 'next/server';

export class PermissionError extends Error {
  constructor(message: string, public status: number = 403) {
    super(message);
    this.name = 'PermissionError';
  }
}

/** 要求已登录（任何角色） */
export async function requireAuth(): Promise<ServerUserContext> {
  const user = await getCurrentUserFromSession();
  if (!user.isAuthenticated) {
    throw new PermissionError('请先登录', 401);
  }
  return user;
}

/** 要求会员或管理员 */
export async function requireMember(): Promise<ServerUserContext> {
  const user = await requireAuth();
  if (user.role !== 'member' && user.role !== 'admin') {
    throw new PermissionError('此功能需要会员权限', 403);
  }
  return user;
}

/** 要求管理员 */
export async function requireAdmin(): Promise<ServerUserContext> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new PermissionError('需要管理员权限', 403);
  }
  return user;
}

/** API Route 包装器：自动捕获权限错误并返回 JSON 响应 */
export function withPermission<T>(
  handler: (user: ServerUserContext, request: NextRequest) => Promise<T>,
  requiredRole: 'auth' | 'member' | 'admin' = 'auth'
) {
  return async (request: NextRequest) => {
    try {
      let user: ServerUserContext;
      switch (requiredRole) {
        case 'admin':
          user = await requireAdmin();
          break;
        case 'member':
          user = await requireMember();
          break;
        default:
          user = await requireAuth();
      }
      return await handler(user, request);
    } catch (error) {
      if (error instanceof PermissionError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.status }
        );
      }
      throw error;
    }
  };
}
```

---

## 三、需要修改的 API 列表

### 3.1 必须服务端校验的 API

| API 路由 | 当前状态 | 需要修改 | 所需权限 |
|----------|----------|----------|----------|
| `POST /api/documents/export/word` | 无校验 | 添加 `requireMember()` | member |
| `POST /api/documents/logo` | 无校验 | 添加 `requireMember()` | member |
| `POST /api/documents/drafts` (云端保存) | 无校验 | 添加 `requireMember()` | member |
| `POST /api/documents/templates` | 无校验 | 添加 `requireMember()` | member |
| `GET /api/documents/drafts` (云端读取) | 无校验 | 添加 `requireAuth()` | auth |
| `POST /api/labels/batch` | 无校验 | 根据数量判断权限 | auth/member |

### 3.2 暂不需要服务端校验的 API

| API 路由 | 原因 |
|----------|------|
| `POST /api/documents/export/png` | 当前全员可用 |
| `POST /api/documents/export/pdf` | 当前全员可用 |
| `GET /api/documents/*` (模板列表) | 公开数据 |

---

## 四、客户端适配

### 4.1 保留前端 localStorage 作为降级

服务端校验上线后，前端 `getRole()` 改为：
1. 先尝试调用 `/api/user/me` 获取真实角色
2. 缓存到 localStorage（带时间戳）
3. 如果 API 失败，使用 localStorage 缓存值（降级）

### 4.2 新增 `/api/user/me` 路由

```typescript
// GET /api/user/me
// 返回当前用户的真实角色（来自数据库）
{
  success: true,
  data: {
    id: "xxx",
    email: "user@example.com",
    name: "张三",
    role: "member",
    subscriptionStatus: "active",
    membershipLevel: "Pro Monthly"
  }
}
```

---

## 五、实施步骤

| 步骤 | 内容 | 风险 |
|------|------|------|
| 1 | 创建 `src/lib/server/auth.ts` 和 `permission.ts` | 无 |
| 2 | 创建 `GET /api/user/me` 路由 | 无 |
| 3 | 修改 Word 导出 API，添加 `requireMember()` | 低（影响少数用户） |
| 4 | 修改 Logo 上传 API，添加 `requireMember()` | 低 |
| 5 | 修改云端草稿 API，添加 `requireMember()` | 中（影响已存草稿） |
| 6 | 修改客户端 `getRole()`，增加 API 回源 | 低 |
| 7 | 全量审计其他 API，逐个添加权限校验 | 中 |

---

> 本文档为设计草案，等待确认后进入实施阶段。
