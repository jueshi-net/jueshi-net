# Design Review — Workspace Task Chain Persistence

**版本**: v1.20.42.6.41
**日期**: 2026-06-11
**性质**: 纯设计审查，零代码实现

---

## 一、核心设计问题回答

### Q1: 任务链是否应该作为一种 ToolDocument 保存？

**结论：不应该直接作为 ToolDocument 保存。**

理由：
- ToolDocumentDraft 的 `toolKey` 枚举值是具体工具（如 `commercial_invoice`、`quote_sheet`），不是工作流
- 任务链是**跨工具上下文**，不是某个工具的完整表单数据
- 强行用 `toolKey = "task_chain_shipping"` 会污染现有草稿列表
- Workspace `/workspace/documents` 会混入非单据条目，用户困惑

### Q2: 如果复用 ToolDocument，应该使用什么 toolSlug？

**不推荐复用。** 但如果必须选：
- ~~`task-chain-shipping`~~ — 语义不清
- ~~`cross-border-shipping-task`~~ — 太长
- ~~`shipping-workflow`~~ — 与"工作流"概念混淆

**结论**：不应该复用 ToolDocumentDraft。

### Q3: ToolDocument 当前字段是否足够保存任务链上下文？

**字段层面足够，语义层面不够。**

- `dataJson` 可以存任意 JSON 字符串 → 技术上能存 TaskChainContext
- 但 `title` 必填（至少 2 字）→ 需要自动生成标题
- `companyProfileId` 可选 → 任务链不一定关联公司
- 无 `status` 字段 → 无法区分 active/completed/archived
- 无 `sourceTool` 字段 → 无法追踪来源
- 无 `linkedDraftIds` → 无法关联后续创建的草稿

### Q4: 是否可以把 taskChain context 存到 ToolDocument.content / data / payload 之类的 JSON 字段？

**技术上可以，但不推荐。**

- `dataJson` 是字符串，存入后无法直接查询内部字段
- 无法按 `hsCode` / `destinationCountry` 等字段过滤
- 无法按 `status` 过滤（无此字段）
- 与真实工具草稿混在一起，管理困难

### Q5: 是否需要新增 TaskChainDraft 模型？

**推荐：需要，但分阶段。**

- 短期（6.42-6.43）：可以先用 localStorage + 登录导入
- 中期（6.44+）：必须新增独立模型

理由：
- 任务链有独立生命周期（draft → active → completed → archived）
- 需要跨草稿关联（taskChainId 贯穿多个 ToolDocumentDraft）
- 需要支持匿名用户过渡到登录用户
- 需要独立展示在 Workspace

### Q6: 如果新增 TaskChainDraft，它和 ToolDocumentDraft 是否会重复？

**不会重复，是互补关系。**

| 维度 | TaskChainDraft | ToolDocumentDraft |
|---|---|---|
| 存储内容 | 跨工具上下文摘要 | 单个工具完整表单 |
| 生命周期 | 任务级（可跨多天） | 文档级（单次编辑） |
| 关联关系 | 1:N → ToolDocumentDraft | N:1 → TaskChainDraft |
| 用户身份 | 支持匿名 → 登录 | 必须登录 |
| 展示位置 | Workspace 任务区 | Workspace 单据区 |

### Q7: Workspace 里应该展示为什么？

**推荐：展示为"任务"（Task），不是"草稿"。**

- 草稿 = 某个工具的未完成表单
- 任务 = 跨工具的未完成工作流
- 用户心智模型：「我有一笔发往加拿大的货要处理」→ 这是任务，不是草稿

展示位置：
- Workspace 主页面新增"我的任务"区域（与"单据历史"并列）
- 新增 `/workspace/tasks` 子页面（已有此路径，目前是 UserTask 待办）
- 或新增 `/workspace/task-chains` 独立页面

### Q8: 用户点击"继续任务"时，应该回到哪个页面？

**推荐：回到最后一个活跃工具页面，带 taskChainId 参数。**

示例：
- `/tools/documents/commercial-invoice?taskChainId=xxx` → 恢复任务链上下文
- `/tools/hs-code?taskChainId=xxx` → 继续查 HS 编码

不推荐：
- ~~`/workspace/task-chains/[id]`~~ — 需要新建详情页，成本高
- ~~`/tools/hs-code?taskId=xxx`~~ — 参数名不统一

### Q9: 任务链和 Quote Sheet / Commercial Invoice 草稿如何关联？

**推荐：在 ToolDocumentDraft 中新增 `taskChainId` 可选字段。**

```prisma
model ToolDocumentDraft {
  // ... existing fields ...
  taskChainId String? @map("task_chain_id") // 可选关联
}
```

- 从任务链创建的草稿自动关联
- Workspace 可展示「此发票属于任务 #123」
- 任务详情页可展示「已创建 3 个草稿」

### Q10: 未登录用户 localStorage 数据登录后是否可以导入？

**推荐：可以，登录后提示"导入到工作台"。**

流程：
1. 用户未登录时使用任务链 → 数据存 localStorage
2. 用户登录成功 → 检测 localStorage 有任务链数据
3. 弹窗提示：「检测到未保存的任务数据，是否导入到工作台？」
4. 用户确认 → 调用 API 创建 TaskChainDraft → 清除 localStorage
5. 用户拒绝 → 保留 localStorage，下次登录再提示

### Q11: 免费用户和会员用户是否应该有不同保存上限？

**推荐：是。**

| 用户类型 | 任务链上限 | 理由 |
|---|---|---|
| 未登录 | 0（仅 localStorage） | 无后端存储 |
| 免费用户 | 5 个活跃任务 | 控制成本 |
| 会员用户 | 50 个活跃任务 | 付费权益 |
| 管理员 | 无限 | 内部使用 |

### Q12: 是否需要管理员查看任务链？

**推荐：是，但优先级低。**

- 管理员可查看用户任务链（审计/客服场景）
- 不需要修改权限，只读查看
- 可通过 `/admin/task-chains` 页面或 API 实现

### Q13: 是否涉及隐私风险？

**有风险，需明确告知。**

风险点：
- 任务链可能包含商品名、地址、邮编等敏感信息
- 跨工具传递增加数据暴露面
- 管理员查看权限需审计日志

缓解措施：
- 隐私政策明确告知数据存储范围
- 提供"清除所有任务数据"功能
- 管理员查看需记录审计日志
- 数据保留策略（90 天未活跃自动归档）

### Q14: 数据保留多久？

**推荐：**

| 状态 | 保留期限 | 处理 |
|---|---|---|
| draft | 90 天无更新 → archived | 自动归档 |
| active | 无限制 | 用户活跃使用 |
| completed | 180 天 | 自动归档 |
| archived | 365 天 | 自动删除 |

### Q15: 是否需要导出任务链资料包？

**推荐：是，作为会员权益。**

- 导出为 JSON / PDF
- 包含所有上下文 + 关联草稿
- 会员专属（免费用户只能查看）

### Q16: 是否需要 PDF / 打印？

**推荐：是，但优先级低。**

- 任务链摘要 PDF（非完整草稿）
- 用于线下沟通/存档
- 可作为积分兑换权益

### Q17: 是否需要与 CompanyProfile 打通？

**推荐：是，自然打通。**

- 从任务链创建 Commercial Invoice 时自动关联公司资料
- 任务链可记录「使用哪个公司资料」
- Workspace 任务详情展示公司信息

---

## 二、关键设计决策

### 决策 1：任务链是独立概念，不是工具草稿

- 任务链 ≠ 工具草稿
- 任务链 = 跨工具工作流上下文
- 需要独立模型、独立展示、独立生命周期

### 决策 2：支持匿名用户过渡到登录用户

- localStorage 是匿名用户的唯一选择
- 登录后必须提供导入机制
- 导入后清除 localStorage，避免重复

### 决策 3：任务链与工具草稿是 1:N 关系

- 一个任务链可关联多个草稿
- 草稿通过 `taskChainId` 反向关联
- Workspace 可展示完整任务视图

### 决策 4：分阶段实施

- 短期：localStorage + 登录导入（不做后端持久化）
- 中期：新增 TaskChainDraft 模型
- 长期：完整工作流系统

---

## 三、设计约束

1. **不修改现有 ToolDocumentDraft 核心逻辑**
2. **不修改 Quote Sheet / Commercial Invoice 保存/恢复/导出**
3. **不修改 Auth / Session / middleware**
4. **不修改 Workspace 现有展示逻辑（只新增）**
5. **不新增 migration（本轮只做设计）**

---

## 四、下一步

详见 `recommended-plan.md` 和 `options-comparison.md`。
