# Post-Beta Priority Roadmap

**生成时间**: 2026-06-13 08:55 UTC  
**用途**: Beta 后优先级路线图

---

## 一、Beta 后 7 天优先级 (Post-Beta P1)

### 1.1 验证和完善部分实现的功能

**工作量估算**: 3-5 天

#### 文档工具（6 个）

| 工具 | 路由 | 验证内容 | 优先级 |
|------|------|----------|--------|
| Receipt / Payment Receipt | /tools/receipt | 功能完整性、UI、保存/恢复 | P1 |
| Debit Note | /tools/debit-note | 功能完整性、UI、保存/恢复 | P1 |
| Handover Note | /tools/handover-note | 功能完整性、UI、保存/恢复 | P1 |
| Shipping Label | /tools/documents/shipping-label | 功能完整性、UI、保存/恢复 | P1 |
| Inbound Receipt | /tools/inbound-receipt | 功能完整性、UI、保存/恢复 | P1 |
| Video Script SOP | /tools/video-script-sop | 功能完整性、UI、保存/恢复 | P1 |

#### 物流工具（1 个）

| 工具 | 路由 | 验证内容 | 优先级 |
|------|------|----------|--------|
| Address formatter | /tools/address-formatter | 功能完整性、UI | P1 |

#### AI 工具（3 个）

| 工具 | 路由 | 验证内容 | 优先级 |
|------|------|----------|--------|
| AI document-summary | /ai-tools/document-summary | 功能完整性、AI 调用 | P1 |
| AI product-copy | /ai-tools/product-copy | 功能完整性、AI 调用 | P1 |
| AI translate-polish | /ai-tools/translate-polish | 功能完整性、AI 调用 | P1 |

#### 工作流（1 个）

| 功能 | 路由 | 验证内容 | 优先级 |
|------|------|----------|--------|
| TaskChainDraft | /workspace/tasks | 功能完整性、保存/恢复 | P1 |

#### 信息架构（3 个）

| 功能 | 路由 | 验证内容 | 优先级 |
|------|------|----------|--------|
| /scenarios | /scenario/[role] | 页面完整性、角色场景 | P1 |
| /pricing | /pricing | 页面完整性、订阅流程 | P1 |
| Landing pages | /lp/[slug] | 页面完整性、发布流程 | P1 |

#### 商业化（2 个）

| 功能 | 路由 | 验证内容 | 优先级 |
|------|------|----------|--------|
| Membership | /workspace/member | 功能完整性、订阅管理 | P1 |
| Growth / badges | /workspace/stats | 功能完整性、成长体系 | P1 |

**总计**: 16 个功能需要验证和完善

---

### 1.2 Git Remote Recovery

**工作量估算**: 0.5 天

**任务**:
1. 配置 GitHub remote
2. Push 代码和 tag
3. 验证远程仓库

**优先级**: P1

---

### 1.3 修复 Beta 用户反馈的 P0/P1 问题

**工作量估算**: 1-2 天

**任务**:
1. 收集 Beta 用户反馈
2. 分类问题（P0/P1/P2/P3）
3. 优先修复 P0/P1 问题

**优先级**: P1

---

## 二、Beta 后 30 天优先级 (Post-Beta P2)

### 2.1 开发高优先级文档工具

**工作量估算**: 5-7 天

#### Document Tool Engine（文档工具引擎）

**任务**:
1. 设计 Document Tool Engine 架构
2. 实现统一的文档工具引擎
3. 优化 CompanyProfile 复用机制
4. 完善 Draft restore 和 DocumentHistory

**优先级**: P2

#### 基于引擎开发文档工具

**任务**:
1. Packing List（装箱单）
2. Proforma Invoice（形式发票）

**优先级**: P2

**预期收益**:
- 快速实现 10+ 个文档工具
- 提升外贸用户体验
- 增强产品竞争力

---

### 2.2 开发物流工具

**工作量估算**: 3-5 天

**任务**:
1. Volumetric Weight Calculator（体积重计算器）
2. Multi-package chargeable weight（多件计费重）

**优先级**: P2

**预期收益**:
- 完善物流工具链
- 提升集运用户体验

---

### 2.3 开发 AI 单据自动填充

**工作量估算**: 5-7 天

**前提条件**:
- CompanyProfile 稳定
- 基础字段完善

**任务**:
1. AI Commercial Invoice autofill（AI 商业发票自动填充）
2. AI address parser（AI 地址解析）

**优先级**: P2

**预期收益**:
- 提升单据创建效率
- 增强 AI 功能

---

### 2.4 完善信息架构

**工作量估算**: 3-5 天

**任务**:
1. /templates（模板中心）
2. /admin/homepage（首页配置管理）

**优先级**: P2

---

### 2.5 开发前台广告渲染

**工作量估算**: 3-5 天

**任务**:
1. SafeAdSlot 组件
2. /api/ads/resolve API
3. 前台广告渲染（article.footer_recommend + tool.footer_banner）

**优先级**: P2

**注意**: 前台广告渲染当前被禁止，需要单独版本执行

---

## 三、长期路线图 (P3)

### 3.1 Project Brain（AI 项目推进表）

**工作量估算**: 10-15 天

**功能**:
1. Project Brain / AI 项目推进表
2. Feature Registry
3. Route Registry
4. API Registry
5. Database Registry
6. Change Request
7. Validation Report
8. AI Context Snapshot
9. Design Guideline
10. Pre-dev audit workflow

**优先级**: P3

---

### 3.2 Stripe / payment

**工作量估算**: 10-15 天

**功能**:
1. Stripe 集成
2. 支付流程
3. 订阅管理
4. 发票生成

**优先级**: P3

---

### 3.3 Shipment Case / Export Order workspace

**工作量估算**: 8-12 天

**功能**:
1. 出货案例工作空间
2. 出口订单管理
3. 案例模板

**优先级**: P3

---

### 3.4 Product library shared across documents

**工作量估算**: 5-8 天

**功能**:
1. 产品库
2. 跨文档共享
3. 产品信息管理

**优先级**: P3

---

### 3.5 其他 P2/P3 功能

**工作量估算**: 20-30 天

**功能**:
1. Purchase Order（采购订单）
2. Delivery Note（送货单）
3. Package tracking aggregator（包裹追踪聚合器）
4. Consolidated shipping declaration（集运申报单）
5. Product database（产品数据库）
6. Quotation profit calculator（报价利润计算器）
7. Multi-currency quotation（多币种报价）
8. Product English name optimizer（产品英文名优化器）
9. AI product name optimizer（AI 产品名优化器）
10. AI SOP generator（AI SOP 生成器）
11. AI customer service reply helper（AI 客服回复助手）

**优先级**: P3

---

## 四、里程碑规划

### 4.1 里程碑 1: Beta 稳定化 (Beta 后 7 天)

**目标**: 验证和完善现有功能，修复 Beta 用户反馈的问题

**任务**:
1. 验证 16 个部分实现的功能
2. Git Remote Recovery
3. 修复 P0/P1 问题

**工作量**: 5-7 天

**预期成果**:
- 所有部分实现的功能验证完成
- Git remote 配置完成
- Beta 用户反馈的 P0/P1 问题解决

---

### 4.2 里程碑 2: Document Tool Engine (Beta 后 30 天)

**目标**: 开发文档工具引擎，快速实现更多文档工具

**任务**:
1. 设计 Document Tool Engine 架构
2. 实现引擎
3. 基于引擎开发 Packing List 和 Proforma Invoice

**工作量**: 10-15 天

**预期成果**:
- Document Tool Engine 完成
- Packing List 和 Proforma Invoice 上线
- 可以快速实现更多文档工具

---

### 4.3 里程碑 3: Logistics Toolkit (Beta 后 45 天)

**目标**: 完善物流工具链

**任务**:
1. Volumetric Weight Calculator
2. Multi-package chargeable weight
3. 优化 Address formatter

**工作量**: 8-12 天

**预期成果**:
- 物流工具链完善
- 提升集运用户体验

---

### 4.4 里程碑 4: AI 单据自动填充 (Beta 后 60 天)

**目标**: 开发 AI 单据自动填充功能

**前提条件**:
- CompanyProfile 稳定
- Document Tool Engine 完成

**任务**:
1. AI Commercial Invoice autofill
2. AI address parser

**工作量**: 10-15 天

**预期成果**:
- AI 单据自动填充上线
- 提升单据创建效率

---

### 4.5 里程碑 5: 前台广告渲染 (Beta 后 75 天)

**目标**: 开发前台广告渲染功能

**任务**:
1. SafeAdSlot 组件
2. /api/ads/resolve API
3. 前台广告渲染

**工作量**: 8-12 天

**预期成果**:
- 前台广告渲染上线
- 开始广告变现

---

## 五、资源分配建议

### 5.1 开发资源

**Beta 后 7 天**:
- 100% 验证和完善现有功能
- 0% 新功能开发

**Beta 后 30 天**:
- 60% Document Tool Engine
- 20% Logistics Toolkit
- 20% 其他功能

**Beta 后 60 天**:
- 40% AI 单据自动填充
- 30% 信息架构完善
- 30% 其他功能

**Beta 后 90 天**:
- 30% Project Brain
- 30% Stripe / payment
- 40% 其他功能

### 5.2 测试资源

**Beta 后 7 天**:
- 100% Beta 用户反馈测试

**Beta 后 30 天**:
- 60% Document Tool Engine 测试
- 40% 回归测试

**Beta 后 60 天**:
- 50% AI 功能测试
- 50% 回归测试

---

## 六、风险评估

### 6.1 技术风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| Document Tool Engine 设计复杂 | 高 | 中 | 先做 MVP，逐步迭代 |
| AI 单据自动填充准确率低 | 中 | 中 | 先做简单场景，逐步优化 |
| Stripe 集成复杂 | 高 | 低 | 参考现有集成案例 |

### 6.2 产品风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| Beta 用户反馈大量 P0 问题 | 高 | 低 | 优先修复，暂停新功能 |
| 文档工具需求变化 | 中 | 中 | 保持架构灵活性 |
| 物流工具使用率低 | 中 | 中 | 收集用户反馈，持续优化 |

### 6.3 运营风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| Beta 用户流失 | 高 | 中 | 持续沟通，快速响应反馈 |
| 广告变现效果差 | 中 | 中 | 先做小规模测试，逐步扩大 |
| 竞争对手快速迭代 | 中 | 中 | 保持敏捷开发，快速响应市场 |

---

## 七、关键指标

### 7.1 Beta 后 7 天指标

- 验证完成的功能数: 16/16
- P0/P1 问题解决率: 100%
- Git remote 配置: 完成

### 7.2 Beta 后 30 天指标

- Document Tool Engine 完成度: 100%
- 新增文档工具数: 2+
- 用户满意度: > 80%

### 7.3 Beta 后 60 天指标

- AI 单据自动填充准确率: > 80%
- 物流工具使用率: > 30%
- 用户留存率: > 60%

### 7.4 Beta 后 90 天指标

- 广告收入: > $100/月
- 付费用户数: > 10
- 月活跃用户数: > 100

---

**文档生成时间**: 2026-06-13 08:55 UTC  
**文档路径**: `reports/product-roadmap/post-beta-priority-roadmap.md`
