# ADR-003: Design System V1 基础架构

## Status

✅ **Accepted** (2026-07-08)

## Context

jueshi.net 存在大量重复组件和不一致的 UI 实现：

- 213 个组件中存在 7 组重复（ActionCard、EmptyState、StatusBadge 等）
- 不同页面使用不同样式的相似组件
- 缺乏统一的设计语言和组件规范
- 维护和扩展成本高

需要建立 Design System 来：
1. 统一视觉语言和交互模式
2. 减少重复代码
3. 提高开发效率
4. 确保一致性

## Decision

建立 **Design System V1**，包含 14 个基础组件：

### 组件清单

| 组件 | 用途 | 状态 |
|------|------|------|
| PageContainer | 页面容器，统一内边距和最大宽度 | ✅ 已建立 |
| PageHero | 页面顶部英雄区域（标题、描述、CTA） | ✅ 已建立 |
| SectionHeader | 区块标题（主标题、副标题、描述） | ✅ 已建立 |
| ContentSection | 内容区块容器 | ✅ 已建立 |
| StatsGrid | 统计数据网格布局 | ✅ 已建立 |
| StatsCard | 统计卡片（数字、标签、趋势） | ✅ 已建立 |
| ActionCard | 行动卡片（标题、描述、按钮） | ✅ 已建立 |
| EmptyState | 空状态展示（图标、标题、描述、操作） | ✅ 已建立 |
| PageCTA | 页面底部行动号召 | ✅ 已建立 |
| StickySidebar | 粘性侧边栏 | ✅ 已建立 |
| FilterToolbar | 筛选工具栏 | ✅ 已建立 |
| BreadcrumbBar | 面包屑导航 | ✅ 已建立 |
| TagGroup | 标签组 | ✅ 已建立 |
| StatusBadge | 状态徽章 | ✅ 已建立 |

### 设计原则

1. **原子化** — 小组件组合成大组件
2. **可配置** — 通过 Props 控制行为和样式
3. **响应式** — 支持 sm/md/lg/xl 断点
4. **Dark Mode** — 所有组件支持主题切换
5. **可访问性** — 语义化 HTML，ARIA 标签

### 技术实现

- **样式方案**: Tailwind CSS（原子化 CSS）
- **类型系统**: TypeScript（完整类型定义）
- **组件模式**: React 函数组件 + Hooks
- **导出方式**: 统一从 `@/components/design-system` 导入

### 使用示例

```tsx
import { PageContainer, PageHero, StatsGrid, StatsCard } from '@/components/design-system';

export default function HomePage() {
  return (
    <PageContainer>
      <PageHero 
        title="绝世百宝箱"
        description="海外华人的实用工具箱"
        ctaText="开始使用"
        ctaHref="/tools"
      />
      
      <StatsGrid>
        <StatsCard value="20+" label="实用工具" />
        <StatsCard value="100+" label="资源导航" />
        <StatsCard value="50+" label="指南文章" />
      </StatsGrid>
    </PageContainer>
  );
}
```

## Alternatives Considered

### Alternative 1: 使用第三方 UI 库

**Approach**: 使用 Material-UI、Ant Design、Chakra UI 等

**Pros**:
- 开箱即用，组件丰富
- 社区支持好
- 文档完善

**Cons**:
- 体积大（影响性能）
- 定制成本高（难以匹配品牌）
- 学习曲线
- 依赖外部维护

**Why Rejected**: 体积过大，定制成本高，不符合轻量级原则

### Alternative 2: 继续维护现有组件

**Approach**: 不建立 Design System，继续维护 213 个现有组件

**Pros**:
- 零迁移成本
- 零学习成本

**Cons**:
- 重复代码持续增加
- 一致性问题无法解决
- 维护成本越来越高

**Why Rejected**: 长期不可持续，技术债务增加

### Alternative 3: 渐进式重构

**Approach**: 不建立新 Design System，逐步重构现有组件

**Pros**:
- 风险低
- 渐进式推进

**Cons**:
- 缺乏统一规范
- 重构方向不一致
- 无法根本解决问题

**Why Rejected**: 缺乏顶层设计，容易走偏

## Consequences

### Positive

1. **统一设计语言** — 所有页面使用相同的组件和样式
2. **减少重复代码** — 消除 7 组重复组件
3. **提高开发效率** — 开发者无需重复造轮子
4. **降低维护成本** — 组件集中管理，易于更新
5. **提升一致性** — 用户体验更加统一
6. **支持主题化** — 轻松实现 Dark Mode 和品牌定制

### Negative

1. **学习成本** — 开发者需要学习 Design System 的使用方式
2. **迁移成本** — 现有页面需要逐步迁移到 Design System
3. **灵活性限制** — 某些特殊场景可能需要自定义组件
4. **初期投入** — 需要时间建立和完善 Design System

### Mitigations

- **学习成本**: 提供完整文档和使用示例（`docs/DESIGN_SYSTEM_COMPONENT_INDEX.md`）
- **迁移成本**: 通过 Night Pipeline 自动化迁移，分阶段推进
- **灵活性**: Design System 提供基础组件，允许在特殊场景下自定义
- **初期投入**: 已完成 V1 基础架构，后续迭代成本降低

## Implementation Details

### 目录结构

```
src/components/design-system/
├── index.ts                    # 统一导出
├── PageContainer.tsx           # 页面容器
├── PageHero.tsx                # 英雄区域
├── SectionHeader.tsx           # 区块标题
├── ContentSection.tsx          # 内容区块
├── StatsGrid.tsx               # 统计网格
├── StatsCard.tsx               # 统计卡片
├── ActionCard.tsx              # 行动卡片
├── EmptyState.tsx              # 空状态
├── PageCTA.tsx                 # 行动号召
├── StickySidebar.tsx           # 粘性侧边栏
├── FilterToolbar.tsx           # 筛选工具栏
├── BreadcrumbBar.tsx           # 面包屑
├── TagGroup.tsx                # 标签组
└── StatusBadge.tsx             # 状态徽章
```

### 组件规范

每个组件必须包含：
1. **TypeScript 类型定义** — Props 接口
2. **默认值** — 合理的默认配置
3. **响应式支持** — 移动端到桌面端
4. **Dark Mode** — 主题切换支持
5. **可访问性** — ARIA 标签、键盘导航

### 当前状态

- ✅ V1 基础架构完成（14 个组件）
- ✅ 组件文档完成（`DESIGN_SYSTEM_COMPONENT_INDEX.md`）
- ⏳ 页面迁移未开始（0/221 页面使用 Design System）
- ⏳ 重复组件清理未开始

### 下一步计划

1. **试点迁移** — 选择 2-3 个简单页面（`/about`, `/contact`）
2. **验证效果** — 确认 Design System 满足需求
3. **批量迁移** — 通过 Night Pipeline 自动化迁移
4. **清理重复** — 删除被 Design System 替代的重复组件

## Related Decisions

- **ADR-002**: V4 Shell 统一架构
- **ADR-004**: Public Layout 架构
- **ADR-001**: Night Pipeline V3（用于自动化迁移）

## References

- `src/components/design-system/` — 组件实现
- `docs/DESIGN_SYSTEM_COMPONENT_INDEX.md` — 组件文档
- `docs/project-audit/04_DESIGN_SYSTEM_COVERAGE.md` — 覆盖率报告
- `docs/project-audit/08_DUPLICATE_CODE_AUDIT.md` — 重复代码审计

---

**Decision Date**: 2026-07-08  
**Decision Makers**: Development Team  
**Review Date**: 2026-10-08 (quarterly)
