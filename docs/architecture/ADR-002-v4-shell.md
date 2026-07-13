# ADR-002: V4 Shell 统一架构

## Status

✅ **Accepted** (2026-07-08)

## Context

jueshi.net 经历了多次 UI 改版，导致公共页面视觉风格不一致：

- 首页使用 `JueshiV4HomeCandidateV4Shell`（V4 候选版本 4）
- 工具页、资源页等使用旧版 `header.tsx` + `footer-new.tsx`
- 不同页面的 Header/Footer 样式、导航结构、交互模式各不相同
- 用户在不同页面间跳转时体验割裂

需要统一所有公共页面的外壳（Shell），确保视觉和交互一致性。

## Decision

采用 **V4 Shell 统一架构**：

### 核心组件

1. **JueshiV4PublicShell** — 公共页面统一外壳
   - 包含 `JueshiV4Header`（统一页头）
   - 包含 `JueshiV4Footer`（统一页脚）
   - 包裹页面内容

2. **JueshiV4HomeCandidateV4Shell** — 首页专用外壳
   - 包含首页特有的 Hero、工具网格、专题展示等
   - 使用相同的 Header/Footer

### 路由跳过逻辑

在 `public-layout-client.tsx` 中维护跳过列表：

```typescript
const isUILab = pathname.startsWith('/ui-lab');
const isV4Home = pathname === '/';
const isResources = pathname === '/resources';
const isResourcesSite = pathname.startsWith('/resources/site/');
const isTools = pathname === '/tools';
const isDestinations = '/destinations';
const isGuides = pathname === '/guides';
const isChecklists = pathname === '/checklists';

if (isUILab || isV4Home || isResources || isResourcesSite || 
    isTools || isDestinations || isGuides || isChecklists) {
  return <>{children}</>;  // 跳过 Public Layout
}
```

### 页面分类

| 类型 | Shell | Header/Footer | 数量 |
|------|-------|---------------|------|
| V4 Shell 页面 | JueshiV4PublicShell | V4 Header/Footer | 7 |
| Public Layout 页面 | 无 | 旧 Header/Footer | ~116 |
| Admin 页面 | Admin Layout | Admin Header | 58 |
| Workspace 页面 | Workspace Layout | Workspace Header | 24 |

### 迁移优先级

1. **P0**: `/topics`, `/search` — 核心功能页面
2. **P1**: `/about`, `/contact` — 简单静态页面（Design System 试点）
3. **P2**: `/blog`, `/community` — 内容页面
4. **P3**: `/workspace/*` — 高风险，需认证

## Alternatives Considered

### Alternative 1: 全面重写所有页面

**Approach**: 一次性重写所有 221 个页面

**Pros**:
- 一步到位
- 完全统一

**Cons**:
- 工作量巨大（221 页面）
- 风险极高
- 无法渐进式验证

**Why Rejected**: 风险太高，无法渐进式推进

### Alternative 2: 保持现状

**Approach**: 不统一，各页面保持独立

**Pros**:
- 零工作量
- 零风险

**Cons**:
- 用户体验割裂
- 维护成本高
- 品牌形象不统一

**Why Rejected**: 长期不可持续

### Alternative 3: CSS 层面统一

**Approach**: 不改组件结构，只统一 CSS 样式

**Pros**:
- 改动小
- 风险低

**Cons**:
- 无法统一交互逻辑
- 无法统一导航结构
- 治标不治本

**Why Rejected**: 无法解决根本问题

## Consequences

### Positive

1. **用户体验一致** — 所有公共页面视觉风格统一
2. **维护成本降低** — Header/Footer 只需维护一份
3. **品牌统一** — 用户在不同页面感受到一致的品牌
4. **渐进式迁移** — 可以逐页迁移，风险可控
5. **可回滚** — 每页独立，可以单独回滚

### Negative

1. **跳过逻辑复杂** — `public-layout-client.tsx` 需要维护跳过列表
2. **迁移周期长** — 221 个页面需要逐步迁移
3. **双重维护** — 迁移期间需要同时维护新旧 Header/Footer
4. **覆盖率低** — 目前仅 3.2%（7/221）

### Mitigations

- **跳过逻辑**: 文档化在 `PROJECT_GOVERNANCE.md`，每次新增 V4 页面时更新
- **迁移周期**: 通过 Night Pipeline 自动化加速
- **双重维护**: 优先完成迁移，减少过渡期
- **覆盖率**: 制定 Roadmap，分阶段推进

## Implementation Details

### 文件结构

```
src/components/
├── layout/
│   ├── JueshiV4PublicShell.tsx      # 公共 Shell
│   ├── header.tsx                    # 旧版 Header（待替换）
│   └── footer-new.tsx               # 旧版 Footer（待替换）
└── ui-lab/
    └── jueshi-v4-home-candidate-v4/
        ├── JueshiV4HomeCandidateV4Shell.tsx  # 首页 Shell
        ├── JueshiV4Header.tsx                # V4 Header
        └── JueshiV4Footer.tsx                # V4 Footer
```

### 使用方式

```tsx
// V4 Shell 页面
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';

export default function TopicsPage() {
  return (
    <JueshiV4PublicShell>
      {/* 页面内容 */}
    </JueshiV4PublicShell>
  );
}
```

### 当前状态

- ✅ 首页 (`/`) — V4 Shell
- ✅ `/tools` — V4 Shell
- ✅ `/resources` — V4 Shell
- ✅ `/resources/site/[id]` — V4 Shell
- ✅ `/destinations` — V4 Shell
- ✅ `/guides` — V4 Shell (Staging)
- ✅ `/checklists` — V4 Shell (Staging)
- ⏳ `/topics` — 待迁移 (Night 3)
- ⏳ `/search` — 待迁移 (Night 3)

## Related Decisions

- **ADR-001**: Night Pipeline V3
- **ADR-003**: Design System
- **ADR-004**: Public Layout

## References

- `src/components/layout/JueshiV4PublicShell.tsx` — 实现
- `src/app/(public)/public-layout-client.tsx` — 跳过逻辑
- `PROJECT_MEMORY.md` — 已完成页面列表

---

**Decision Date**: 2026-07-08  
**Decision Makers**: Development Team  
**Review Date**: 2026-10-08 (quarterly)
