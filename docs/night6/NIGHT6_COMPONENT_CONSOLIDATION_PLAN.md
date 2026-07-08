# NIGHT6_COMPONENT_CONSOLIDATION_PLAN.md

## 建立唯一组件来源

### 1. ActionCard 组件

| 位置 | 版本 | 用途 | 建议操作 | 原因说明 |
|------|------|------|----------|----------|
| `src/components/design-system/ActionCard.tsx` | Design System | 标准设计系统组件 | ✅ **保留** | 遵循统一设计语言，更通用且可复用 |
| `src/components/saas/ActionCard.tsx` | SaaS 业务 | SaaS 业务专用组件 | 🔴 **删除** | 与 Design System 版本功能重复，应使用标准组件 |

**迁移策略**:
1. 更新所有 `import { ActionCard } from '../saas/ActionCard'` 为 `import { ActionCard } from '../design-system/ActionCard'`
2. 检查现有实现是否有特殊需求，如有则通过 props 配置实现
3. 测试所有使用场景确保功能正常

### 2. EmptyState 组件 (3个版本)

| 位置 | 版本 | 用途 | 建议操作 | 原因说明 |
|------|------|------|----------|----------|
| `src/components/design-system/EmptyState.tsx` | Design System | 标准空状态组件 | ✅ **保留** | 最完整的实现，支持多场景配置 |
| `src/components/saas/SaasEmptyState.tsx` | SaaS 业务 | SaaS 空状态 | 🔴 **删除** | 与标准版本重复，应统一使用设计系统组件 |
| `src/components/workspace/EmptyState.tsx` | 工作区 | 工作区空状态 | 🔴 **删除** | 与标准版本重复，应统一使用设计系统组件 |

**迁移策略**:
1. 将 SaaS 和 Workspace 的特有样式/内容转换为 Design System EmptyState 的 props
2. 更新导入路径：`import { EmptyState } from '../design-system/EmptyState'`
3. 保持原有视觉效果，通过配置参数实现
4. 全面测试各页面空状态显示

### 3. StatusBadge 组件

| 位置 | 版本 | 用途 | 建议操作 | 原因说明 |
|------|------|------|----------|----------|
| `src/components/design-system/StatusBadge.tsx` | Design System | 标准状态徽章 | ✅ **保留** | 遵循统一设计规范，功能最完整 |
| `src/components/saas/StatusBadge.tsx` | SaaS 业务 | SaaS 状态徽章 | 🔴 **删除** | 与 Design System 版本重复，应统一使用标准组件 |

**迁移策略**:
1. 替换所有 SaaS 版本的导入为 Design System 版本
2. 通过 props 配置满足特定业务需求
3. 确保所有状态类型（success, warning, error, info）正常显示

### 4. WorkspaceSidebar 组件

| 位置 | 版本 | 用途 | 建议操作 | 原因说明 |
|------|------|------|----------|----------|
| `src/components/workspace/WorkspaceSidebar.tsx` | 工作区 | 工作区左侧导航（生产使用） | ✅ **保留** | 当前生产环境实际使用版本，经过验证 |
| `src/components/saas/WorkspaceSidebar.tsx` | SaaS 业务 | SaaS 工作区导航 | 🔴 **删除** | 功能重复，workspace 版本为实际生产版本 |

**迁移策略**:
1. 删除 `src/components/saas/WorkspaceSidebar.tsx`
2. 如 SaaS 需要特殊功能，在保留的工作区版本上添加配置选项
3. 更新任何指向 SaaS 版本的导入

### 5. tool-grid 组件

| 位置 | 版本 | 用途 | 建议操作 | 原因说明 |
|------|------|------|----------|----------|
| `src/components/home/tool-grid.tsx` | 首页版 | 首页工具网格 | 🟡 **合并为通用版本** | 功能相似，应合并减少维护成本 |
| `src/components/tools/tool-grid.tsx` | 工具页版 | 工具页工具网格 | 🟡 **合并为通用版本** | 功能相似，应合并减少维护成本 |

**迁移策略**:
1. 创建新的通用 `ToolGrid.tsx` 组件在 `src/components/design-system/` 目录
2. 将两个版本的功能合并，通过 props 配置不同显示模式
3. 更新首页和工具页的导入路径
4. 确保两个页面的原有功能完全保持

## 组件去重实施计划

### Phase 1: 准备阶段
- [ ] 备份当前组件代码
- [ ] 创建新组件结构（如需要）
- [ ] 编写迁移测试用例

### Phase 2: 组件迁移
- [ ] ActionCard → 统一使用 Design System 版本
- [ ] EmptyState → 统一使用 Design System 版本
- [ ] StatusBadge → 统一使用 Design System 版本
- [ ] WorkspaceSidebar → 保留 workspace 版本，删除 saas 版本
- [ ] tool-grid → 合并为通用组件

### Phase 3: 验证阶段
- [ ] 功能回归测试
- [ ] 视觉一致性检查
- [ ] 性能基准测试
- [ ] 代码质量审查

### Phase 4: 清理阶段
- [ ] 删除废弃组件文件
- [ ] 清理相关引用和导入
- [ ] 更新文档和注释
- [ ] 提交最终变更

## 风险控制

### 低风险组件
- ActionCard, StatusBadge: 功能简单，替换安全
- SaasEmptyState: 非核心组件，影响范围小

### 中风险组件
- WorkspaceSidebar: 生产使用，需要充分测试
- tool-grid: 影响多个页面，需要兼容性保证

### 安全措施
1. 每个组件替换前进行充分测试
2. 保留回滚备份
3. 逐步替换而非一次性全部删除
4. 持续集成验证通过后才进行下一步
