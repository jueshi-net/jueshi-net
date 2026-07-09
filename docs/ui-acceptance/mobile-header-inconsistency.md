# Mobile Header Inconsistency - UI Acceptance Issue

**Status**: 🟡 NEEDS_SECOND_REWORK  
**Date**: 2026-07-09  
**Priority**: P1  
**Mode**: AUDIT (read-only, needs user visual verification)

---

## Problem Statement

用户截图证明移动端 Header 在不同页面存在视觉不一致，虽然代码层面已统一使用 `JueshiV4PublicShell`，但实际渲染效果仍有差异。

---

## Reported Issues

### 1. /community Header 与其他页面不同
- **现象**: Header 样式、高度、Logo 尺寸与其他 V4 页面不一致
- **可能原因**: 
  - 未使用 `JueshiV4PublicShell`
  - 使用了旧版 Header 组件
  - 自定义了 Header 样式

### 2. /tools 顶部结构明显不同
- **现象**: 顶部区域结构与 /resources、/guides 等页面不同
- **可能原因**:
  - ToolFilterBar 影响了 Header 视觉位置
  - 页面自定义了额外的顶部元素
  - Hero 起点不一致

### 3. /guides /checklists /resources Hero 起点不一致
- **现象**: Hero 区域距离 Header 的距离不同
- **可能原因**:
  - 页面使用了不同的 padding/margin
  - BreadcrumbBar 位置不一致
  - PageContainer 的 paddingTop 设置不同

### 4. 移动端 Header 需要统一 Spec
- **当前规格** (来自 `JueshiV4Header.tsx`):
  ```typescript
  height: h-[76px]
  logo: h-[44px]
  max-width: max-w-[1440px]
  background: bg-white/95 backdrop-blur-md
  border: border-b border-[#E8ECF3]
  shadow: shadow-sm
  ```
- **问题**: 虽然代码规格统一，但实际渲染可能因以下原因不一致：
  - 浏览器缓存
  - CDN 缓存
  - 页面自定义样式覆盖
  - 不同页面的 wrapper 结构差异

---

## Pages Requiring Verification

| Page | URL | Status | Notes |
|------|-----|--------|-------|
| /community | https://i.jueshi.net/community | ❌ INCONSISTENT | Header 与其他页面不同 |
| /tools | https://i.jueshi.net/tools | ❌ INCONSISTENT | 顶部结构不同 |
| /guides | https://i.jueshi.net/guides | ❌ INCONSISTENT | Hero 起点不一致 |
| /checklists | https://i.jueshi.net/checklists | ❌ INCONSISTENT | Hero 起点不一致 |
| /resources | https://i.jueshi.net/resources | ❌ INCONSISTENT | Hero 起点不一致 |
| /topics | https://i.jueshi.net/topics | ⚠️ NEEDS_CHECK | 未明确报告，需验证 |
| /search | https://i.jueshi.net/search | ⚠️ NEEDS_CHECK | 未明确报告，需验证 |
| /destinations | https://i.jueshi.net/destinations | ⚠️ NEEDS_CHECK | 未明确报告，需验证 |

---

## Required Actions

### Phase 1: Investigation (AUDIT)
- [ ] 检查 /community 是否使用 `JueshiV4PublicShell`
- [ ] 检查 /tools 的 ToolFilterBar 是否影响 Header 视觉
- [ ] 对比所有页面的 BreadcrumbBar 位置
- [ ] 检查所有页面的 PageContainer paddingTop 设置
- [ ] 使用浏览器 DevTools 检查实际渲染的 Header 高度、Logo 尺寸

### Phase 2: Fix (DEV)
- [ ] 统一所有页面的 wrapper 结构
- [ ] 移除页面自定义的 Header 样式
- [ ] 确保所有页面使用相同的 PageContainer 配置
- [ ] 统一 BreadcrumbBar 的 margin/padding
- [ ] 移除 ToolFilterBar 对 Header 的影响（如果有）

### Phase 3: Verification (AUDIT)
- [ ] 在 390px 宽度下截图对比所有页面
- [ ] 验证 Header 高度一致（76px）
- [ ] 验证 Logo 尺寸一致（44px）
- [ ] 验证 Hero 起点一致
- [ ] 验证移动端菜单功能正常

---

## Technical Details

### Current Implementation
```typescript
// JueshiV4PublicShell.tsx
export default function JueshiV4PublicShell({ children }: JueshiV4PublicShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const handleMenuClick = useCallback(() => setMenuOpen(prev => !prev), []);

  return (
    <>
      <JueshiV4Header onMenuClick={handleMenuClick} menuOpen={menuOpen} />
      <main className="flex-1">{children}</main>
      <JueshiV4Footer />
    </>
  );
}
```

### Expected Header Spec
```typescript
// JueshiV4Header.tsx
<header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E8ECF3] shadow-sm">
  <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
    <div className="flex items-center justify-between h-[76px]">
      <Image
        src={brandLogo}
        alt="绝世百宝箱"
        width={160}
        height={44}
        className="h-[44px] w-auto object-contain"
        priority
      />
      {/* ... */}
    </div>
  </div>
</header>
```

---

## Next Steps

1. **用户视觉验收**: 需要用户在真实移动设备上验证问题
2. **截图对比**: 收集所有页面的移动端截图
3. **代码审查**: 检查每个页面的 wrapper 结构
4. **二次返工**: 根据发现的问题进行修复

---

## Related Documents

- `PROJECT_BIBLE.md` - Section 0: 服务器环境永久规则
- `PROJECT_MEMORY.md` - SSH 部署永久规则
- `docs/NIGHT_PIPELINE.md` - 部署流程
- `src/components/layout/JueshiV4PublicShell.tsx` - 统一 Shell 组件
- `src/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Header.tsx` - 统一 Header 组件

---

**Final Verdict**: `BLOCKED_NEEDS_USER_DECISION`

需要用户视觉验收后决定是否进行二次返工。
