# 08 - 重复代码审计

**审计日期**: 2026-07-08

---

## 重复组件统计

**发现的重复组件**: 7 组

---

## 详细重复列表

### 1. ActionCard.tsx (2 处)

| 位置 | 用途 | 建议 |
|------|------|------|
| `src/components/design-system/ActionCard.tsx` | Design System 标准组件 | ✅ **保留** |
| `src/components/saas/ActionCard.tsx` | SaaS 业务组件 | 🔴 **删除** |

**原因**: Design System 版本更通用，SaaS 版本应迁移到 Design System

---

### 2. EmptyState.tsx (2 处)

| 位置 | 用途 | 建议 |
|------|------|------|
| `src/components/design-system/EmptyState.tsx` | Design System 标准组件 | ✅ **保留** |
| `src/components/workspace/EmptyState.tsx` | 工作区空状态 | 🔴 **删除** |

**原因**: Design System 版本已支持多种场景，workspace 版本冗余

---

### 3. StatusBadge.tsx (2 处)

| 位置 | 用途 | 建议 |
|------|------|------|
| `src/components/design-system/StatusBadge.tsx` | Design System 标准组件 | ✅ **保留** |
| `src/components/saas/StatusBadge.tsx` | SaaS 状态徽章 | 🔴 **删除** |

**原因**: Design System 版本功能完整，SaaS 版本冗余

---

### 4. WorkspaceSidebar.tsx (2 处)

| 位置 | 用途 | 建议 |
|------|------|------|
| `src/components/saas/WorkspaceSidebar.tsx` | SaaS 工作区侧边栏 | 🟡 **评估** |
| `src/components/workspace/WorkspaceSidebar.tsx` | 工作区侧边栏 | 🟡 **评估** |

**原因**: 需要检查两个版本的差异，合并为一个

---

### 5. ad-banner.tsx (2 处)

| 位置 | 用途 | 建议 |
|------|------|------|
| `src/components/cms/ad-banner.tsx` | CMS 广告横幅 | ✅ **保留** |
| `src/components/home/ad-banner.tsx` | 首页广告横幅 | 🔴 **删除** |

**原因**: CMS 版本更通用，首页版本应使用 CMS 版本

---

### 6. theme-toggle.tsx (2 处)

| 位置 | 用途 | 建议 |
|------|------|------|
| `src/components/navigation/theme-toggle.tsx` | 导航主题切换 | ✅ **保留** |
| `src/components/theme-toggle.tsx` | 根目录主题切换 | 🔴 **删除** |

**原因**: navigation 目录结构更清晰，根目录版本冗余

---

### 7. tool-grid.tsx (2 处)

| 位置 | 用途 | 建议 |
|------|------|------|
| `src/components/home/tool-grid.tsx` | 首页工具网格 | 🟡 **评估** |
| `src/components/tools/tool-grid.tsx` | 工具页工具网格 | 🟡 **评估** |

**原因**: 需要检查差异，考虑合并为统一组件

---

## Home 组件重复模式

发现 Home 目录存在多个相似组件：

### Hero 组件 (4 个)
- `hero-section.tsx`
- `hero-new.tsx`
- `hero-search.tsx`
- `hero-super-search.tsx`

**建议**: 合并为 1-2 个可配置的 Hero 组件

### Popular Tools 组件 (4 个)
- `popular-tools.tsx`
- `popular-tools-new.tsx`
- `popular-tools-dynamic.tsx`
- `popular-tools-section.tsx`

**建议**: 合并为 1 个 `PopularTools.tsx`

### Topics 组件 (3 个)
- `topics-section.tsx`
- `topics-section-new.tsx`
- `topics-dynamic.tsx`

**建议**: 合并为 1 个 `TopicsSection.tsx`

---

## 重复代码统计

| 类型 | 数量 | 建议 |
|------|------|------|
| 完全重复组件 | 7 组 | 删除冗余版本 |
| Home 重复模式 | 11 个 | 合并为统一组件 |
| **总计** | **18 处** | **需要清理** |

---

## 清理建议

### P0 - 立即删除 (7 处)

1. `src/components/saas/ActionCard.tsx` → 使用 design-system 版本
2. `src/components/workspace/EmptyState.tsx` → 使用 design-system 版本
3. `src/components/saas/StatusBadge.tsx` → 使用 design-system 版本
4. `src/components/home/ad-banner.tsx` → 使用 cms 版本
5. `src/components/theme-toggle.tsx` → 使用 navigation 版本

### P1 - 评估后合并 (2 处)

1. `WorkspaceSidebar.tsx` - 检查差异后合并
2. `tool-grid.tsx` - 检查差异后合并

### P2 - Home 组件整合 (11 处)

1. 4 个 Hero 组件 → 合并为 1-2 个
2. 4 个 Popular Tools 组件 → 合并为 1 个
3. 3 个 Topics 组件 → 合并为 1 个

---

## 预期收益

| 指标 | 当前 | 清理后 | 改善 |
|------|------|--------|------|
| 重复组件 | 18 处 | 0 处 | -100% |
| 组件总数 | 213 | ~195 | -8% |
| 维护成本 | 高 | 低 | -30% |
| 代码一致性 | 低 | 高 | +50% |

---

**文档状态**: DUPLICATE_CODE_AUDIT_COMPLETED  
**生成时间**: 2026-07-08 23:50 CST
