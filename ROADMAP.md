# ROADMAP.md

> 项目路线图 — 长期规划，非 Night Task  
> 最后更新: 2026-07-09

---

## 总览

```
Phase A (已完成)     → 基础设施建立
Phase B (当前)       → 知识层建立
Phase C (下一步)     → V4 Shell 全面统一
Phase D (中期)       → Design System 全面应用
Phase E (长期)       → 生产就绪
```

---

## Phase A: 基础设施建立 ✅ 已完成

**时间**: 2026-07-08  
**状态**: ✅ 完成

### 目标

建立自动化开发基础设施，包括 Night Pipeline 和 Design System。

### 范围

1. **Night Pipeline V1 → V2 → V3**
   - V1 失败：Hermes 转述文件内容
   - V2 失败：Claude 手写 patch 格式错误
   - V3 成功：Full-file Proposal Mode

2. **V4 Shell 统一 (Phase 1)**
   - 首页 `/` — V4HomeCandidateV4Shell
   - `/tools` — V4PublicShell
   - `/resources` — V4PublicShell
   - `/resources/site/[id]` — V4PublicShell
   - `/destinations` — V4PublicShell
   - `/guides` — V4PublicShell (Staging)
   - `/checklists` — V4PublicShell (Staging)

3. **Design System V1**
   - 14 个基础组件建立
   - 组件文档完成

### 完成条件

- [x] Night Pipeline V3 稳定运行
- [x] 7 个页面完成 V4 Shell 统一
- [x] Design System V1 组件建立
- [x] 项目交接文档完成

### 风险

- ~~Pipeline 稳定性~~ — 已解决（V3 成功率 ~100%）
- ~~Patch 格式错误~~ — 已解决（diff -u 生成）

---

## Phase B: 知识层建立 🔄 当前

**时间**: 2026-07-09  
**状态**: 🔄 进行中

### 目标

建立项目知识体系，确保项目记忆不丢失，新会话可快速接管。

### 范围

1. **Project Inventory (已完成)**
   - 12 份审计文档
   - 页面/组件/API/功能注册表
   - 重复代码/死代码审计

2. **Project Governance Phase A (已完成)**
   - PROJECT_MEMORY.md — 项目记忆
   - PROJECT_GOVERNANCE.md — 治理规则
   - 统计口径修正

3. **Project Governance Phase B (进行中)**
   - PROJECT_BIBLE.md — 永久规则
   - ADR 文档 (5 份)
   - FEATURE_REGISTRY.md 升级
   - PAGE_LIFECYCLE.md
   - COMPONENT_LIFECYCLE.md
   - ROADMAP.md (本文档)
   - AI_COLLABORATION.md

### 完成条件

- [x] Project Inventory 完成
- [x] Governance Phase A 完成
- [ ] Governance Phase B 完成
- [ ] 所有文档提交并验证

### 风险

- 文档过多导致维护负担 → 明确更新频率和责任人

---

## Phase C: V4 Shell 全面统一

**时间**: 预计 2-4 周  
**状态**: ⏳ 待开始

### 目标

将所有公共页面统一为 V4 Shell，覆盖率从 3.2% 提升到 80%+。

### 范围

1. **P0 页面 (1-2 周)**
   - `/topics` — V4 Shell 统一
   - `/search` — V4 Shell 统一
   - `/countries` — V4 Shell 统一
   - `/blog`, `/blog/[slug]` — V4 Shell 统一

2. **P1 页面 (2-3 周)**
   - `/community/*` — V4 Shell 统一
   - `/starter/*` — V4 Shell 统一
   - `/pricing` — V4 Shell 统一
   - `/packages/[id]` — V4 Shell 统一

3. **P2 页面 (3-4 周)**
   - 工具详情页 (`/tools/[tool-name]`) — V4 Shell 统一
   - 其他公共页面

### 完成条件

- [ ] V4 Shell 覆盖率 > 80%
- [ ] 所有公共页面使用统一 Header/Footer
- [ ] public-layout-client.tsx 跳过列表更新
- [ ] 用户验收通过

### 风险

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| 页面数量多 | 🟡 中 | Night Pipeline 自动化 |
| 工具页面复杂 | 🟡 中 | 逐页迁移，充分测试 |
| 用户体验变化 | 🟡 中 | Staging 验证 + 用户验收 |
| 回滚困难 | 🟢 低 | 每页独立，可单独回滚 |

### 依赖

- Night Pipeline V3 稳定运行
- 用户验收流程

---

## Phase D: Design System 全面应用

**时间**: 预计 4-8 周  
**状态**: ⏳ 待开始

### 目标

将 Design System 组件应用到所有页面，覆盖率从 0% 提升到 60%+。

### 范围

1. **Phase D1: 试点 (1-2 周)**
   - `/about` — Design System 替换
   - `/contact` — Design System 替换
   - 验证组件设计是否满足需求

2. **Phase D2: 内容页面 (2-4 周)**
   - `/blog`, `/blog/[slug]` — Design System 替换
   - `/guides/[slug]` — Design System 替换
   - `/checklists/[slug]` — Design System 替换
   - `/topics/[slug]` — Design System 替换

3. **Phase D3: 工具页面 (2-4 周)**
   - `/tools/[tool-name]` — Design System 替换
   - `/resources/site/[id]` — Design System 替换

4. **Phase D4: 清理 (1-2 周)**
   - 删除被替代的重复组件
   - 清理 Legacy 组件
   - 更新 COMPONENT_LIFECYCLE.md

### 完成条件

- [ ] Design System 覆盖率 > 60%
- [ ] 重复组件清理完成
- [ ] 所有页面使用统一组件
- [ ] 性能无下降

### 风险

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| 组件不满足需求 | 🟡 中 | 试点验证，及时调整 |
| 样式不一致 | 🟡 中 | Design Token 统一 |
| 性能下降 | 🟢 低 | 性能测试对比 |
| 破坏现有功能 | 🟡 中 | 充分测试 + 回滚机制 |

### 依赖

- Phase C 完成（V4 Shell 统一）
- Design System 组件验证

---

## Phase E: 生产就绪

**时间**: 预计 2-4 周  
**状态**: ⏳ 待开始

### 目标

将所有改动部署到 Production，确保系统稳定运行。

### 范围

1. **Audit (1 周)**
   - 运行 `tools/jueshi-audit`
   - 修复 P0/P1 问题
   - 准备证据路径

2. **Staging 验证 (1 周)**
   - 用户验收所有改动
   - 性能测试
   - 安全测试
   - 兼容性测试

3. **Production 部署 (1 周)**
   - 部署到 Production
   - Smoke test
   - 监控观察
   - 回滚预案

4. **观察期 (1 周)**
   - 监控错误率
   - 监控性能指标
   - 收集用户反馈
   - 修复紧急问题

### 完成条件

- [ ] Audit 通过（P0/P1 清零）
- [ ] 用户验收通过
- [ ] Production 部署成功
- [ ] 观察期无重大问题
- [ ] 性能指标达标

### 风险

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| Audit 发现问题 | 🔴 高 | 提前修复，预留时间 |
| 用户不接受 | 🟡 中 | 充分沟通，逐步推进 |
| 部署失败 | 🟡 中 | 回滚预案，灰度发布 |
| 性能下降 | 🟡 中 | 性能基准测试 |

### 依赖

- Phase C 完成
- Phase D 完成
- 用户验收

---

## 时间线总览

```
2026-07-08  Phase A ✅ 完成
            ├── Night Pipeline V3
            ├── V4 Shell (7 pages)
            └── Design System V1

2026-07-09  Phase B 🔄 进行中
            ├── Project Inventory
            ├── Governance Phase A
            └── Governance Phase B

2026-07-10~ Phase C ⏳ 待开始 (2-4 weeks)
            └── V4 Shell 全面统一 (80%+)

2026-08~    Phase D ⏳ 待开始 (4-8 weeks)
            └── Design System 全面应用 (60%+)

2026-09~    Phase E ⏳ 待开始 (2-4 weeks)
            └── Production 部署
```

---

## 成功指标

| 指标 | 当前 | Phase C | Phase D | Phase E |
|------|------|---------|---------|---------|
| V4 Shell 覆盖率 | 3.2% | 80%+ | 80%+ | 80%+ |
| Design System 覆盖率 | 0% | 0% | 60%+ | 60%+ |
| 重复组件 | 7 组 | 7 组 | 0 组 | 0 组 |
| Dead Code | ~40 | ~40 | ~10 | 0 |
| Production 更新 | ❌ | ❌ | ❌ | ✅ |

---

## 决策记录

| 日期 | 决策 | 原因 |
|------|------|------|
| 2026-07-09 | Phase B 优先于 Phase C | 知识层是长期资产，避免重复劳动 |
| 2026-07-09 | V4 Shell 先于 Design System | Shell 是基础，DS 是上层建筑 |
| 2026-07-09 | 渐进式迁移而非一次性重写 | 降低风险，可逐步验证 |

---

**文档状态**: ROADMAP_ESTABLISHED  
**生成时间**: 2026-07-09  
**下次更新**: 每个 Phase 完成时
