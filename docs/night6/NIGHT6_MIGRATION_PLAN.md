# NIGHT6_MIGRATION_PLAN.md

## 组件迁移计划

### 迁移概览

| 组件 | 引用次数 | 风险等级 | 预计修改文件数 | 预计耗时 | 需要 Pipeline |
|------|---------|---------|--------------|---------|--------------|
| ActionCard (saas→ds) | 4 | 🟢 低 | 4 | 30min | ✅ 是 |
| StatusBadge (saas→ds) | 14 | 🟡 中 | 14 | 1h | ✅ 是 |
| SaasEmptyState (saas→ds) | 11 | 🟡 中 | 11 | 1h | ✅ 是 |
| WorkspaceSidebar (saas删除) | 0 | 🟢 低 | 0 | 10min | ❌ 否 |
| workspace/EmptyState (删除) | 0 | 🟢 低 | 0 | 10min | ❌ 否 |

---

## 详细迁移步骤

### 1. ActionCard 迁移

**当前状态**:
- Design System 版本: `src/components/design-system/ActionCard.tsx` ✅ 保留
- SaaS 版本: `src/components/saas/ActionCard.tsx` ❌ 删除
- 引用次数: 4 处

**迁移步骤**:
1. 查找所有引用 `saas/ActionCard` 的文件
2. 替换导入路径为 `design-system/ActionCard`
3. 验证 props 兼容性
4. 删除 `saas/ActionCard.tsx`
5. 构建验证

**预计修改文件**:
```
src/app/(workspace)/workspace/page.tsx
src/app/(workspace)/workspace/settings/page.tsx
src/app/(workspace)/workspace/tasks/page.tsx
src/app/(workspace)/workspace/memos/page.tsx
```

**风险**: 🟢 低
- 功能简单
- Props 兼容
- 影响范围小

---

### 2. StatusBadge 迁移

**当前状态**:
- Design System 版本: `src/components/design-system/StatusBadge.tsx` ✅ 保留
- SaaS 版本: `src/components/saas/StatusBadge.tsx` ❌ 删除
- 引用次数: 14 处

**迁移步骤**:
1. 查找所有引用 `saas/StatusBadge` 的文件
2. 替换导入路径为 `design-system/StatusBadge`
3. 验证 props 兼容性（特别是 status 类型）
4. 删除 `saas/StatusBadge.tsx`
5. 构建验证

**预计修改文件**:
```
src/app/(workspace)/workspace/*/page.tsx (多个文件)
src/components/saas/*.tsx (多个组件)
```

**风险**: 🟡 中
- 引用较多
- 需要验证所有 status 类型
- 可能影响视觉一致性

---

### 3. SaasEmptyState 迁移

**当前状态**:
- Design System 版本: `src/components/design-system/EmptyState.tsx` ✅ 保留
- SaaS 版本: `src/components/saas/SaasEmptyState.tsx` ❌ 删除
- 引用次数: 11 处

**迁移步骤**:
1. 查找所有引用 `saas/SaasEmptyState` 的文件
2. 替换导入路径为 `design-system/EmptyState`
3. 验证 props 兼容性（icon, title, description, action）
4. 删除 `saas/SaasEmptyState.tsx`
5. 构建验证

**预计修改文件**:
```
src/app/(workspace)/workspace/*/page.tsx (多个文件)
src/components/saas/*.tsx (多个组件)
```

**风险**: 🟡 中
- 引用较多
- 需要验证空状态样式
- 可能影响用户体验

---

### 4. WorkspaceSidebar 清理

**当前状态**:
- Workspace 版本: `src/components/workspace/WorkspaceSidebar.tsx` ✅ 保留
- SaaS 版本: `src/components/saas/WorkspaceSidebar.tsx` ❌ 删除
- 引用次数: 0 处

**迁移步骤**:
1. 确认无引用
2. 直接删除 `saas/WorkspaceSidebar.tsx`
3. 构建验证

**预计修改文件**: 0

**风险**: 🟢 低
- 无引用
- 直接删除

---

### 5. workspace/EmptyState 清理

**当前状态**:
- Design System 版本: `src/components/design-system/EmptyState.tsx` ✅ 保留
- Workspace 版本: `src/components/workspace/EmptyState.tsx` ❌ 删除
- 引用次数: 0 处

**迁移步骤**:
1. 确认无引用
2. 直接删除 `workspace/EmptyState.tsx`
3. 构建验证

**预计修改文件**: 0

**风险**: 🟢 低
- 无引用
- 直接删除

---

## 执行顺序

### 阶段 1: 低风险清理 (10min)
1. 删除 `saas/WorkspaceSidebar.tsx` (无引用)
2. 删除 `workspace/EmptyState.tsx` (无引用)
3. 构建验证

### 阶段 2: ActionCard 迁移 (30min)
1. 替换 4 处引用
2. 删除 `saas/ActionCard.tsx`
3. 构建验证
4. 部署 staging

### 阶段 3: StatusBadge 迁移 (1h)
1. 替换 14 处引用
2. 删除 `saas/StatusBadge.tsx`
3. 构建验证
4. 部署 staging

### 阶段 4: SaasEmptyState 迁移 (1h)
1. 替换 11 处引用
2. 删除 `saas/SaasEmptyState.tsx`
3. 构建验证
4. 部署 staging

---

## 验证清单

### 每个组件迁移后验证
- [ ] 构建成功
- [ ] 无 TypeScript 错误
- [ ] 无运行时错误
- [ ] 视觉一致性检查
- [ ] 功能测试

### 最终验证
- [ ] 所有页面正常加载
- [ ] 无控制台错误
- [ ] 性能无下降
- [ ] 文档更新

---

## 回滚计划

如果迁移过程中出现问题：

1. **立即停止**: 停止当前迁移步骤
2. **恢复备份**: 使用 git 恢复到迁移前状态
3. **分析问题**: 检查错误日志和构建输出
4. **修复问题**: 调整迁移策略
5. **重新执行**: 从失败的步骤重新开始

---

## 成功标准

- [ ] 所有重复组件已删除
- [ ] 所有引用已更新
- [ ] 构建成功
- [ ] 部署成功
- [ ] 无运行时错误
- [ ] 文档已更新

---

## 预计总耗时

- 阶段 1: 10min
- 阶段 2: 30min
- 阶段 3: 1h
- 阶段 4: 1h
- 验证和文档: 30min

**总计**: 约 3.5 小时
