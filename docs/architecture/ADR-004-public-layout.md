# ADR-004: Public Layout 架构

## Status

✅ **Accepted** (2026-07-08)

## Context

jueshi.net 的公共页面需要统一的布局结构，包括：

- 全局导航（Header）
- 页脚信息（Footer）
- 页面内容区域
- 响应式适配
- 主题切换支持

同时需要处理 V4 Shell 页面和传统页面的共存问题：
- V4 Shell 页面自带 Header/Footer（如首页、工具页）
- 传统页面需要 Public Layout 提供 Header/Footer
- 避免 Header/Footer 重复渲染

## Decision

采用 **Public Layout 架构**，通过 `public-layout-client.tsx` 实现智能路由跳过逻辑：

### 核心组件

1. **PublicLayoutClient** — 客户端布局组件
   - 检测当前路由
   - 决定是否提供 Header/Footer
   - 包裹页面内容

2. **Header** (`header.tsx`) — 全局页头
   - 导航菜单
   - 用户登录状态
   - 主题切换
   - 移动端菜单

3. **Footer** (`footer-new.tsx`) — 全局页脚
   - 快速链接
   - 版权信息
   - 社交媒体

### 路由跳过逻辑

```typescript
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/header';
import FooterNew from '@/components/layout/footer-new';

export function PublicLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // V4 Shell 页面跳过 Public Layout
  const isUILab = pathname.startsWith('/ui-lab');
  const isV4Home = pathname === '/';
  const isResources = pathname === '/resources';
  const isResourcesSite = pathname.startsWith('/resources/site/');
  const isTools = pathname === '/tools';
  const isDestinations = pathname === '/destinations';
  const isGuides = pathname === '/guides';
  const isChecklists = pathname === '/checklists';

  if (isUILab || isV4Home || isResources || isResourcesSite || 
      isTools || isDestinations || isGuides || isChecklists) {
    return <>{children}</>;  // 跳过 Header/Footer
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <FooterNew />
    </>
  );
}
```

### 页面分类

| 类型 | Layout | Header/Footer | 示例页面 |
|------|--------|---------------|----------|
| V4 Shell 页面 | 跳过 | 自带 V4 Header/Footer | `/`, `/tools`, `/resources` |
| Public Layout 页面 | PublicLayoutClient | Header + FooterNew | `/topics`, `/search`, `/blog` |
| Admin 页面 | AdminLayout | Admin Header | `/admin/*` |
| Workspace 页面 | WorkspaceLayout | Workspace Header | `/workspace/*` |

### 维护规则

1. **新增 V4 Shell 页面时**：必须更新 `public-layout-client.tsx` 的跳过列表
2. **移除 V4 Shell 时**：必须从跳过列表中删除
3. **修改 Header/Footer 时**：需要同时考虑 V4 和传统页面

## Alternatives Considered

### Alternative 1: 每个页面独立管理 Header/Footer

**Approach**: 每个页面自己导入 Header 和 Footer

**Pros**:
- 灵活性高
- 页面完全独立

**Cons**:
- 重复代码多
- 维护成本高
- 容易遗漏

**Why Rejected**: 违反 DRY 原则，维护困难

### Alternative 2: 服务端 Layout 统一处理

**Approach**: 在 `layout.tsx` 中统一提供 Header/Footer

**Pros**:
- 简单直接
- 无需客户端逻辑

**Cons**:
- 无法处理 V4 Shell 页面
- 灵活性不足
- 无法根据路由动态调整

**Why Rejected**: 无法处理 V4 Shell 和传统页面共存

### Alternative 3: 使用 Next.js Middleware

**Approach**: 在 Middleware 中判断路由，决定是否应用 Layout

**Pros**:
- 服务端处理，性能好
- 逻辑集中

**Cons**:
- 无法访问客户端状态
- 复杂度高
- 调试困难

**Why Rejected**: 过度设计，客户端逻辑更简单

## Consequences

### Positive

1. **统一管理** — Header/Footer 在一处维护
2. **智能跳过** — V4 Shell 页面自动跳过，避免重复
3. **灵活性** — 可以根据路由动态调整布局
4. **易于维护** — 新增/移除 V4 Shell 页面只需更新跳过列表
5. **向后兼容** — 传统页面无需修改

### Negative

1. **客户端逻辑** — 需要客户端组件（`use client`）
2. **跳过列表维护** — 每次新增 V4 Shell 页面需要手动更新
3. **调试复杂** — 需要理解跳过逻辑才能调试布局问题
4. **潜在错误** — 忘记更新跳过列表会导致 Header/Footer 重复

### Mitigations

- **客户端逻辑**: 使用 `usePathname` 钩子，性能影响小
- **跳过列表维护**: 文档化在 `PROJECT_GOVERNANCE.md`，作为开发流程的一部分
- **调试复杂**: 提供清晰的注释和文档
- **潜在错误**: 通过 Code Review 和自动化测试捕获

## Implementation Details

### 文件结构

```
src/app/(public)/
├── layout.tsx                    # Public Layout 入口
├── public-layout-client.tsx      # 客户端布局逻辑
└── [pages]                       # 公共页面

src/components/layout/
├── header.tsx                    # 全局页头
└── footer-new.tsx                # 全局页脚
```

### 使用方式

```tsx
// src/app/(public)/layout.tsx
import { PublicLayoutClient } from './public-layout-client';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayoutClient>{children}</PublicLayoutClient>;
}
```

### 当前跳过列表

| 路由 | 原因 |
|------|------|
| `/ui-lab/*` | UI Lab 实验页面 |
| `/` | 首页使用 V4HomeCandidateV4Shell |
| `/resources` | 使用 V4PublicShell |
| `/resources/site/*` | 使用 V4PublicShell |
| `/tools` | 使用 V4PublicShell |
| `/destinations` | 使用 V4PublicShell |
| `/guides` | 使用 V4PublicShell |
| `/checklists` | 使用 V4PublicShell |

### 维护流程

1. **新增 V4 Shell 页面**:
   ```tsx
   // 1. 页面使用 V4PublicShell
   import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';
   
   export default function NewPage() {
     return (
       <JueshiV4PublicShell>
         {/* content */}
       </JueshiV4PublicShell>
     );
   }
   
   // 2. 更新 public-layout-client.tsx
   const isNewPage = pathname === '/new-page';
   if (/* ... */ || isNewPage) {
     return <>{children}</>;
   }
   ```

2. **移除 V4 Shell**:
   ```tsx
   // 从跳过列表中删除对应路由
   ```

## Related Decisions

- **ADR-002**: V4 Shell 统一架构
- **ADR-003**: Design System V1
- **ADR-005**: Production Protection

## References

- `src/app/(public)/public-layout-client.tsx` — 实现
- `src/components/layout/header.tsx` — Header 组件
- `src/components/layout/footer-new.tsx` — Footer 组件
- `PROJECT_GOVERNANCE.md` — 维护规则

---

**Decision Date**: 2026-07-08  
**Decision Makers**: Development Team  
**Review Date**: 2026-10-08 (quarterly)
