# 下一夜任务清单

## P0 - 紧急任务

### 1. /topics 页面 V4 Shell 统一

**目标**: 将 `/topics` 页面接入 V4 Public Shell，统一导航和视觉风格

**涉及页面**:
- `/topics` - 专题列表页

**预计修改文件**:
- `src/app/(public)/topics/page.tsx`
- `src/app/(public)/public-layout-client.tsx` (添加 isTopics 条件)

**风险等级**: 🟢 低
- 页面结构简单
- 无复杂业务逻辑
- 类似 `/guides` 和 `/checklists`

**预计耗时**: 30-45 分钟

**验收标准**:
- [ ] 页面显示 V4 Header/Footer
- [ ] 导航正常跳转
- [ ] 响应式布局正常
- [ ] Dark Mode 正常

---

### 2. /search 页面 V4 Shell 统一

**目标**: 将 `/search` 页面接入 V4 Public Shell

**涉及页面**:
- `/search` - 搜索结果页

**预计修改文件**:
- `src/app/(public)/search/page.tsx`
- `src/app/(public)/public-layout-client.tsx` (添加 isSearch 条件)

**风险等级**: 🟢 低
- 页面结构简单
- 主要是展示搜索结果

**预计耗时**: 30-45 分钟

**验收标准**:
- [ ] 页面显示 V4 Header/Footer
- [ ] 搜索功能正常
- [ ] 结果列表正常显示
- [ ] 分页功能正常

---

## P1 - 重要任务

### 3. Design System 替换 - /about 页面

**目标**: 使用 Design System V1 组件重构 `/about` 页面

**涉及页面**:
- `/about` - 关于我们页面

**预计修改文件**:
- `src/app/(public)/about/page.tsx`

**预计使用组件**:
- `PageContainer` - 页面容器
- `PageHero` - 页面标题区
- `SectionHeader` - 章节标题
- `ContentSection` - 内容区块
- `StatsCard` - 数据统计卡片

**风险等级**: 🟢 低
- 静态页面，无复杂交互
- 适合首次 Design System 替换

**预计耗时**: 1-2 小时

**验收标准**:
- [ ] 使用 Design System 组件
- [ ] 视觉风格统一
- [ ] 响应式布局正常
- [ ] 性能无下降

---

### 4. Design System 替换 - /contact 页面

**目标**: 使用 Design System V1 组件重构 `/contact` 页面

**涉及页面**:
- `/contact` - 联系我们页面

**预计修改文件**:
- `src/app/(public)/contact/page.tsx`

**预计使用组件**:
- `PageContainer` - 页面容器
- `PageHero` - 页面标题区
- `ContentSection` - 内容区块
- `ActionCard` - 联系方式卡片

**风险等级**: 🟢 低
- 静态页面，结构简单

**预计耗时**: 1-2 小时

**验收标准**:
- [ ] 使用 Design System 组件
- [ ] 表单功能正常
- [ ] 联系方式展示正常

---

### 5. Design System V2 - 增加组件

**目标**: 根据实际需求，增加 Design System 组件

**预计新增组件**:
- `SearchBar` - 搜索框组件
- `Pagination` - 分页组件
- `Tabs` - 标签页组件
- `Modal` - 弹窗组件

**风险等级**: 🟡 中
- 需要考虑通用性和可扩展性
- 需要充分的测试

**预计耗时**: 3-4 小时

**验收标准**:
- [ ] 组件 Props 设计合理
- [ ] 支持响应式
- [ ] 支持 Dark Mode
- [ ] 文档完整

---

## P2 - 一般任务

### 6. /resources/site/[id] 页面优化

**目标**: 优化资源详情页面的视觉和交互

**涉及页面**:
- `/resources/site/[id]` - 资源详情页

**预计修改文件**:
- `src/app/(public)/resources/site/[id]/page.tsx`

**预计使用组件**:
- `PageContainer` - 页面容器
- `BreadcrumbBar` - 面包屑导航
- `StickySidebar` - 侧边栏
- `TagGroup` - 标签组
- `StatusBadge` - 状态徽章

**风险等级**: 🟡 中
- 页面结构较复杂
- 包含多个交互元素

**预计耗时**: 2-3 小时

**验收标准**:
- [ ] 使用 Design System 组件
- [ ] 侧边栏粘性正常
- [ ] 面包屑导航正确
- [ ] 标签和状态展示正常

---

### 7. Night Pipeline 稳定性增强

**目标**: 增强 Night Pipeline 的稳定性和错误处理

**预计改进**:
- 增加重试机制
- 改进错误日志
- 增加进度监控
- 优化性能

**涉及文件**:
- `scripts/night-run.sh`
- `scripts/claude-generate-patch.sh`
- `scripts/ai-patch-runner.sh`

**风险等级**: 🟡 中
- 需要充分测试
- 不能影响现有功能

**预计耗时**: 2-3 小时

**验收标准**:
- [ ] 错误处理完善
- [ ] 日志清晰可读
- [ ] 性能无下降
- [ ] 现有功能正常

---

### 8. Production 部署准备

**目标**: 准备将 staging 改动部署到 production

**预计工作**:
- 运行 `tools/jueshi-audit`
- 修复 P0/P1 问题
- 准备部署计划
- 准备回滚方案

**风险等级**: 🔴 高
- 影响生产环境
- 需要充分测试
- 需要用户确认

**预计耗时**: 3-4 小时

**验收标准**:
- [ ] Audit 通过
- [ ] 所有测试通过
- [ ] 回滚方案就绪
- [ ] 用户确认部署

---

## P3 - 长期任务

### 9. /workspace/* 页面重构

**目标**: 重构工作区页面，使用 Design System

**涉及页面**:
- `/workspace` - 工作区首页
- `/workspace/favorites` - 收藏页面
- `/workspace/settings` - 设置页面
- 等其他 workspace 子页面

**预计修改文件**:
- `src/app/(authenticated)/workspace/**/*.tsx`

**预计使用组件**:
- `PageContainer` - 页面容器
- `SectionHeader` - 章节标题
- `ActionCard` - 功能卡片
- `StatusBadge` - 状态徽章
- `EmptyState` - 空状态

**风险等级**: 🔴 高
- 涉及认证逻辑
- 包含复杂业务逻辑
- 影响用户体验

**预计耗时**: 8-12 小时

**验收标准**:
- [ ] 使用 Design System 组件
- [ ] 业务逻辑不变
- [ ] 认证流程正常
- [ ] 性能无下降

---

### 10. 自动化测试

**目标**: 为关键页面增加自动化测试

**预计测试**:
- E2E 测试 (Playwright)
- 单元测试 (Jest)
- 视觉回归测试

**涉及文件**:
- `tests/e2e/**/*.spec.ts`
- `tests/unit/**/*.test.ts`

**风险等级**: 🟡 中
- 需要学习测试框架
- 需要维护测试代码

**预计耗时**: 6-8 小时

**验收标准**:
- [ ] 关键页面有测试覆盖
- [ ] 测试稳定可靠
- [ ] CI/CD 集成

---

### 11. 性能优化

**目标**: 优化页面性能，提升用户体验

**预计优化**:
- 图片懒加载
- 代码分割
- 缓存策略
- 关键路径优化

**涉及文件**:
- `next.config.js`
- 各个页面组件

**风险等级**: 🟡 中
- 需要性能分析
- 可能影响功能

**预计耗时**: 4-6 小时

**验收标准**:
- [ ] Lighthouse 评分提升
- [ ] 首屏加载时间减少
- [ ] 功能无影响

---

### 12. 文档完善

**目标**: 完善项目文档

**预计文档**:
- 组件使用指南
- API 文档
- 部署指南
- 故障排查手册

**涉及文件**:
- `docs/**/*.md`

**风险等级**: 🟢 低
- 纯文档工作

**预计耗时**: 4-6 小时

**验收标准**:
- [ ] 文档完整
- [ ] 示例清晰
- [ ] 易于理解

---

## 任务执行建议

### 推荐执行顺序

**第一夜**: P0 任务
1. `/topics` 页面 V4 Shell 统一
2. `/search` 页面 V4 Shell 统一

**第二夜**: P1 任务
3. `/about` 页面 Design System 替换
4. `/contact` 页面 Design System 替换

**第三夜**: P1 任务
5. Design System V2 组件开发

**第四夜**: P2 任务
6. `/resources/site/[id]` 页面优化
7. Night Pipeline 稳定性增强

**第五夜**: P2 任务
8. Production 部署准备

**后续**: P3 任务
9-12. 按需执行

### 执行原则

1. **先简单后复杂** - 从低风险任务开始
2. **先统一后替换** - 先完成 V4 Shell 统一，再进行 Design System 替换
3. **先测试后部署** - 充分测试后再考虑 production 部署
4. **小步快跑** - 每个任务独立提交，便于回滚

### 风险控制

1. **每次只做一个任务** - 避免多个任务相互影响
2. **充分测试** - 每个任务完成后都要测试
3. **及时提交** - 完成任务后立即提交
4. **记录问题** - 遇到问题及时记录，便于后续排查

---

**文档状态**: NEXT_NIGHT_TASKS_READY  
**生成时间**: 2026-07-08 22:35 CST  
**最后更新**: 2026-07-08
