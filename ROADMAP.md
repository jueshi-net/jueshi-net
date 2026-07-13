# 项目路线图 (Program Manager V2)

> 最后更新: 2026-07-09  
> 管理模式: Program → Epic → Batch → Task

---

## 当前 Programs 概览

| Program | 状态 | 进度 | 目标 |
|---------|------|------|------|
| Design System Migration | 🟡 进行中 | 27.5% | 统一组件库，消除重复 |
| V4 Shell Unification | 🟡 进行中 | 40% | 所有页面使用 V4 Shell |
| Workspace Enhancement | 🔴 未开始 | 0% | 提升工作区体验 |
| Performance Optimization | 🔴 未开始 | 0% | 优化加载性能 |

---

## Program 1: Design System Migration

**目标**: 建立统一的设计系统，消除组件重复，提升开发效率  
**进度**: 27.5%  
**状态**: 🟡 进行中

### Epic DS-01: Foundation ✅ 完成

**目标**: 建立 Design System 基础组件库  
**进度**: 100%

**已完成的 Batches**:
- ✅ DS-01-B1: 创建 14 个基础组件 (PageHero, SectionHeader, ContentSection, StatsGrid, StatsCard, ActionCard, EmptyState, PageCTA, StickySidebar, FilterToolbar, BreadcrumbBar, TagGroup, StatusBadge, PageContainer)
- ✅ DS-01-B2: 建立组件文档和使用规范

### Epic DS-02: Public Pages 🟡 进行中

**目标**: 将公共页面迁移到 Design System  
**进度**: 30%

**已完成的 Batches**:
- ✅ DS-02-B1: Starter & Pricing (Night 5)
- ✅ DS-02-B2: Guides & Checklists (Night 5)

**待执行的 Batches**:
- 🔴 DS-02-B3: Topics & Search Design System 应用
  - 修改文件: `src/app/(public)/topics/page.tsx`, `src/app/(public)/search/page.tsx`
  - 预计耗时: 30-45min
  - 风险: 🟢 低
  
- 🔴 DS-02-B4: Resources Design System 应用
  - 修改文件: `src/app/(public)/resources/page.tsx`, `src/app/(public)/resources/[slug]/page.tsx`
  - 预计耗时: 1-2h
  - 风险: 🟡 中
  
- 🔴 DS-02-B5: Tools Design System 应用
  - 修改文件: `src/app/(public)/tools/page.tsx`, `src/app/(public)/tools/[tool-name]/page.tsx`
  - 预计耗时: 1-2h
  - 风险: 🟡 中

### Epic DS-03: Workspace Pages 🔴 未开始

**目标**: 将工作区页面迁移到 Design System  
**进度**: 0%

**待执行的 Batches**:
- 🔴 DS-03-B1: Workspace 试点页面
  - 选择低风险页面进行试点
  - 验证 Design System 在 Workspace 环境的适用性
  
- 🔴 DS-03-B2: Workspace 核心页面
  - 迁移主要工作区页面
  
- 🔴 DS-03-B3: Workspace 全部页面
  - 完成所有工作区页面迁移

### Epic DS-04: Admin Pages 🔴 未开始

**目标**: 将管理后台页面迁移到 Design System  
**进度**: 0%

**待执行的 Batches**:
- 🔴 DS-04-B1: Admin 试点页面
- 🔴 DS-04-B2: Admin 核心页面
- 🔴 DS-04-B3: Admin 全部页面

### Epic DS-05: Component Consolidation 🟡 进行中

**目标**: 合并重复组件，建立唯一组件源  
**进度**: 60%

**已完成的 Batches**:
- ✅ DS-05-B1: ActionCard 整合 (Night 6)
  - 删除: `src/components/saas/ActionCard.tsx`
  - 保留: `src/components/design-system/ActionCard.tsx`
  - 更新 4 个文件的导入路径
  
- ✅ DS-05-B2: StatusBadge 整合 (Night 6)
  - 删除: `src/components/saas/StatusBadge.tsx`
  - 保留: `src/components/design-system/StatusBadge.tsx`
  - 更新 14 个文件的导入路径
  
- ✅ DS-05-B3: EmptyState 整合 (Night 6)
  - 删除: `src/components/saas/SaasEmptyState.tsx`, `src/components/workspace/EmptyState.tsx`
  - 保留: `src/components/design-system/EmptyState.tsx`
  - 更新 11 个文件的导入路径

**待执行的 Batches**:
- 🔴 DS-05-B4: WorkspaceSidebar 整合
  - 删除: `src/components/saas/WorkspaceSidebar.tsx`
  - 保留: `src/components/workspace/WorkspaceSidebar.tsx`
  - 预计耗时: 30min
  - 风险: 🟡 中
  
- 🔴 DS-05-B5: ToolGrid 整合
  - 合并: `src/components/home/tool-grid.tsx` + `src/components/tools/tool-grid.tsx`
  - 创建: `src/components/design-system/ToolGrid.tsx`
  - 预计耗时: 1h
  - 风险: 🟡 中

---

## Program 2: V4 Shell Unification

**目标**: 将所有公共页面迁移到 V4 Shell，统一视觉体验  
**进度**: 40%  
**状态**: 🟡 进行中

### Epic V4-01: Core Pages ✅ 完成

**目标**: 统一核心公共页面  
**进度**: 100%

**已完成的 Batches**:
- ✅ V4-01-B1: Home 页面 (Night 1-3)
- ✅ V4-01-B2: Tools 页面 (Night 4)
- ✅ V4-01-B3: Resources 页面 (Night 4)

### Epic V4-02: Content Pages 🟡 进行中

**目标**: 统一内容类页面  
**进度**: 60%

**已完成的 Batches**:
- ✅ V4-02-B1: Guides 页面 (Night 5)
- ✅ V4-02-B2: Checklists 页面 (Night 5)
- ✅ V4-02-B3: Topics 页面 (Night 4)
- ✅ V4-02-B4: Search 页面 (Night 4)

**待执行的 Batches**:
- 🔴 V4-02-B5: Starter & Pricing 页面
  - 修改文件: `src/app/(public)/starter/page.tsx`, `src/app/(public)/pricing/page.tsx`
  - 预计耗时: 30min
  - 风险: 🟢 低

### Epic V4-03: Community Pages 🔴 未开始

**目标**: 统一社区页面  
**进度**: 0%

**待执行的 Batches**:
- 🔴 V4-03-B1: Community 审计
  - 审计现有社区页面结构
  - 评估迁移风险
  
- 🔴 V4-03-B2: Community 核心页面
  - 迁移主要社区页面
  
- 🔴 V4-03-B3: Community 全部页面
  - 完成所有社区页面迁移

### Epic V4-04: Destination Pages 🔴 未开始

**目标**: 统一目的地页面  
**进度**: 0%

**待执行的 Batches**:
- 🔴 V4-04-B1: Destinations 审计
- 🔴 V4-04-B2: Destinations 核心页面
- 🔴 V4-04-B3: Destinations 全部页面

---

## Program 3: Workspace Enhancement 🔴 未开始

**目标**: 提升工作区功能和用户体验  
**进度**: 0%  
**状态**: 🔴 未开始

### 规划中的 Epics

- 🔴 WE-01: 工作区导航优化
- 🔴 WE-02: 工作区功能增强
- 🔴 WE-03: 工作区性能优化

---

## Program 4: Performance Optimization 🔴 未开始

**目标**: 优化页面加载速度和 SEO  
**进度**: 0%  
**状态**: 🔴 未开始

### 规划中的 Epics

- 🔴 PO-01: 代码分割优化
- 🔴 PO-02: 图片优化
- 🔴 PO-03: SEO 增强

---

## 执行优先级

### P0 - 本周必须完成

1. **DS-02-B3**: Topics & Search Design System 应用
2. **DS-05-B4**: WorkspaceSidebar 组件整合
3. **DS-05-B5**: ToolGrid 组件整合

### P1 - 下周完成

1. **DS-02-B4**: Resources Design System 应用
2. **DS-02-B5**: Tools Design System 应用
3. **V4-03-B1**: Community Pages 审计

### P2 - 后续迭代

1. **DS-03**: Workspace Pages Design System 应用
2. **DS-04**: Admin Pages Design System 应用
3. **V4-04**: Destination Pages V4 Shell 统一

---

## 关键里程碑

| 里程碑 | 目标日期 | 状态 |
|--------|----------|------|
| Design System Foundation 完成 | 2026-07-08 | ✅ 已达成 |
| 组件整合完成 60% | 2026-07-09 | ✅ 已达成 |
| Public Pages Design System 完成 | 2026-07-15 | 🟡 进行中 |
| 所有组件整合完成 | 2026-07-20 | 🔴 待开始 |
| V4 Shell 覆盖率 80% | 2026-07-30 | 🔴 待开始 |
| Design System 覆盖率 80% | 2026-08-15 | 🔴 待开始 |

---

## 风险与依赖

### 当前风险

1. **Workspace 页面改造风险** 🔴
   - 涉及用户核心功能
   - 需要先完成组件整合
   
2. **资源详情页复杂性** 🟡
   - 包含大量自定义交互
   - 需要分阶段改造

3. **Community 页面未开始** 🔴
   - 包含社区功能
   - 需要谨慎处理

### 依赖关系

```
DS-05 (组件整合) → DS-03 (Workspace Pages)
DS-02 (Public Pages) → V4-02 (Content Pages)
V4-01 (Core Pages) → V4-03 (Community Pages)
```

---

## 文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| Program Model | `docs/program/PROGRAM_MODEL.md` | 四层模型定义 |
| Program Progress | `docs/program/PROGRAM_PROGRESS.md` | 进度追踪 |
| Program Queue Spec | `docs/program/PROGRAM_QUEUE_SPEC.md` | Queue 规范 |
| Automation Boundary | `docs/program/AUTOMATION_BOUNDARY.md` | 自动化边界 |
| Project Memory | `PROJECT_MEMORY.md` | 项目长期记忆 |

---

**文档状态**: ROADMAP_V2_PROGRAM_MANAGER  
**版本**: v2.0  
**创建时间**: 2026-07-09  
**下次更新**: Program 状态变更时
