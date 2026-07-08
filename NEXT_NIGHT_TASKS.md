# Night 6 任务计划

## 前置任务：组件合并（P0）

在继续 Design System 应用之前，需要先解决组件重复问题。

### 1. ActionCard 合并
- **现状**：存在两个版本
  - `src/components/design-system/ActionCard.tsx` (Design System)
  - `src/components/saas/ActionCard.tsx` (SaaS 业务)
- **建议**：保留 design-system 版本，更新 saas 页面的引用
- **影响页面**：`/workspace` 等使用 saas/ActionCard 的页面
- **风险**：🟡 中（需要测试所有使用页面）

### 2. MetricCard/StatsCard 合并
- **现状**：存在两个版本
  - `src/components/design-system/StatsCard.tsx` (Design System)
  - `src/components/saas/MetricCard.tsx` (SaaS 业务)
- **建议**：保留 design-system 版本，更新 saas 页面的引用
- **影响页面**：`/workspace` 等使用 saas/MetricCard 的页面
- **风险**：🟡 中（需要测试所有使用页面）

### 3. EmptyState 合并
- **现状**：存在两个版本
  - `src/components/design-system/EmptyState.tsx` (Design System)
  - `src/components/workspace/EmptyState.tsx` (Workspace)
- **建议**：保留 design-system 版本，更新 workspace 页面的引用
- **影响页面**：`/workspace/*` 相关页面
- **风险**：🟡 中

### 4. StatusBadge 合并
- **现状**：存在两个版本
  - `src/components/design-system/StatusBadge.tsx` (Design System)
  - `src/components/saas/StatusBadge.tsx` (SaaS 业务)
- **建议**：保留 design-system 版本，更新 saas 页面的引用
- **影响页面**：SaaS 相关页面
- **风险**：🟢 低

---

## 继续 V4 Shell 统一（P1）

### 5. Blog 页面
- **页面**：`/blog` 和 `/blog/[slug]`
- **任务**：应用 JueshiV4PublicShell
- **风险**：🟢 低（内容页面，无复杂交互）
- **预计耗时**：30-45 分钟

### 6. Community 页面
- **页面**：`/community` 相关页面
- **任务**：应用 JueshiV4PublicShell
- **风险**：🟡 中（包含用户交互）
- **预计耗时**：1-2 小时

### 7. Countries 页面
- **页面**：`/countries` 和 `/countries/[country]`
- **任务**：应用 JueshiV4PublicShell
- **风险**：🟢 低（静态内容页面）
- **预计耗时**：30-45 分钟

---

## Design System 试点（P2）

### 8. Help 和 Feedback 页面
- **页面**：`/help` 和 `/feedback`
- **任务**：应用 Design System 组件（PageHero, ContentSection, SectionHeader）
- **风险**：🟢 低（简单页面）
- **预计耗时**：1-2 小时

### 9. Resources 详情页优化
- **页面**：`/resources/site/[id]`
- **任务**：应用 Design System 组件（低风险部分）
  - 使用 ContentSection 包装内容区块
  - 使用 SectionHeader 替换标题
  - 使用 TagGroup 替换标签展示
- **风险**：🟡 中（页面结构复杂）
- **预计耗时**：2-3 小时

---

## 任务优先级排序

| 优先级 | 任务 | 预计耗时 | 风险 | 依赖 |
|--------|------|----------|------|------|
| P0 | 组件合并（4个组件） | 2-3 小时 | 🟡 中 | 无 |
| P1 | Blog 页面 V4 Shell | 30-45 分钟 | 🟢 低 | 无 |
| P1 | Community 页面 V4 Shell | 1-2 小时 | 🟡 中 | 无 |
| P1 | Countries 页面 V4 Shell | 30-45 分钟 | 🟢 低 | 无 |
| P2 | Help/Feedback Design System | 1-2 小时 | 🟢 低 | P0 完成 |
| P2 | Resources 详情页优化 | 2-3 小时 | 🟡 中 | P0 完成 |

---

## 建议执行顺序

### Night 6 前半段（组件合并）
1. 合并 ActionCard
2. 合并 MetricCard/StatsCard
3. 合并 EmptyState
4. 合并 StatusBadge
5. 测试所有受影响的页面

### Night 6 后半段（继续 V4 Shell）
1. Blog 页面 V4 Shell 统一
2. Countries 页面 V4 Shell 统一
3. 部署到 staging 并验证

### Night 7（Design System 试点）
1. Help/Feedback 页面 Design System 应用
2. Resources 详情页优化（低风险部分）
3. 部署到 staging 并验证

### Night 8（继续 Design System）
1. Community 页面 V4 Shell 统一
2. Resources 详情页优化（中风险部分）
3. 全面测试和验收

---

## 预期成果

完成 Night 6-8 后：
- **V4 Shell 覆盖率**：5.0% → 15-20%
- **Design System 覆盖率**：0.9% → 5-10%
- **重复组件**：7 组 → 3 组（合并 4 组）
- **组件治理**：显著改善

---

## 风险缓解

### 组件合并风险
- **缓解措施**：逐个合并，每次合并后完整测试
- **回滚方案**：保留旧组件，随时可以回退

### V4 Shell 统一风险
- **缓解措施**：先统一简单页面，再处理复杂页面
- **回滚方案**：每个页面独立 commit，可单独回滚

### Design System 应用风险
- **缓解措施**：先试点简单页面，验证后再推广
- **回滚方案**：保留原有实现，可快速回退

---

## 验收标准

### 组件合并验收
- [ ] 所有重复组件已合并
- [ ] 所有引用已更新
- [ ] 所有受影响页面功能正常
- [ ] 无 TypeScript 错误
- [ ] Build 成功

### V4 Shell 统一验收
- [ ] 新页面使用 JueshiV4PublicShell
- [ ] public-layout-client.tsx 跳过逻辑正确
- [ ] 页面功能正常
- [ ] 样式一致
- [ ] Build 成功

### Design System 应用验收
- [ ] 使用 Design System 组件
- [ ] 样式与设计规范一致
- [ ] 响应式布局正确
- [ ] 页面功能正常
- [ ] Build 成功

---

**文档状态**：NEXT_NIGHT_TASKS_PLANNED  
**创建时间**：2026-07-09  
**下次更新**：Night 6 完成后
