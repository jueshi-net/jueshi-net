# Beta Scope & Non-Goals

**生成时间**: 2026-06-12T15:05:00Z  
**版本**: v1.20.42.6.59

---

## Beta 目标

允许小范围真实用户（10-50 人）使用核心工具和文档保存功能，收集反馈，验证产品方向。

---

## Beta 范围（In-Scope）

### 核心工具（全部开放）

| 工具 | 路径 | 状态 |
|---|---|---|
| HS Code 查询 | /tools/hs-code | ✅ |
| Postal Code 查询 | /tools/postal-code | ✅ |
| Exchange Rate 汇率 | /tools/exchange-rate | ✅ |
| Shipping Calculator 运费计算 | /tools/shipping-calculator | ✅ |
| Commercial Invoice 商业发票 | /tools/commercial-invoice | ✅ |
| Quote Sheet 报价单 | /tools/documents/quotation | ✅ |
| Address Formatter 地址格式化 | /tools/address-formatter | ✅ |
| Sensitive Goods 敏感货查询 | /tools/sensitive-goods | ✅ |
| Shipping Mark 唛头 | /tools/shipping-mark | ✅ |
| Container 装箱 | /tools/container | ✅ |
| QR Code 二维码 | /tools/qrcode | ✅ |
| Zip 压缩 | /tools/zip | ✅ |
| ... 共 32 个工具页面 | | ✅ |

### 文档保存（全部开放）

| 功能 | 路径 | 状态 |
|---|---|---|
| 文档中心 | /tools/documents | ✅ |
| 草稿列表 | /tools/documents/drafts | ✅ |
| 文档类型 | /tools/documents/[type] | ✅ |
| 报价单 | /tools/documents/quotation | ✅ |
| DocumentHistory 保存/恢复 | /api/me/tool-documents/* | ✅ |
| TaskChainDraft 任务链 | /api/me/task-chains/* | ✅ |
| Save-to-Workspace | Workspace 入口 | ✅ |

### 用户系统（全部开放）

| 功能 | 路径 | 状态 |
|---|---|---|
| 注册 | /login?mode=signup | ✅ |
| 登录 | /login | ✅ |
| 登出 | /api/auth/signout | ✅ |
| Session 管理 | NextAuth JWT | ✅ |
| Workspace 工作台 | /workspace | ✅ |
| 个人资料 | /profile | ✅ |
| 通知 | /notifications | ✅ |
| 设置 | /preferences | ✅ |

### Admin（仅管理员）

| 功能 | 路径 | 状态 |
|---|---|---|
| Admin Dashboard | /admin | ✅ |
| Analytics | /admin/analytics | ✅ |
| Task Chains | /admin/analytics/task-chains | ✅ |
| Users | /admin/users | ✅ |
| Forum | /admin/forum | ✅ |
| ... 共 35 个管理页面 | | ✅ |

### Forum（基础功能）

| 功能 | 路径 | 状态 |
|---|---|---|
| 论坛首页 | /bbs | ✅ |
| 发帖 | /bbs/new | ✅ |
| 分类 | /bbs/category/[key] | ✅ |
| 帖子详情 | /bbs/[slug] | ✅ |
| 帖子编辑 | /bbs/[slug]/edit | ✅ |
| 发帖 API | /api/forum/posts | ✅ |
| 评论 API | /api/forum/posts/[slug]/comments | ✅ |
| 审核流程 | pending/published | ✅ |
| 反垃圾基础 | 频率限制 | ✅ |
| GrowthLog 奖励 | 帖子+20 / 评论+5 | ✅ |

### SEO / 品牌

| 功能 | 状态 |
|---|---|
| sitemap.xml | ✅ |
| robots.txt | ✅ |
| favicon | ✅ |
| logo | ✅ |
| OG 图片 | ✅ |
| manifest.json | ✅ |

---

## Beta 非目标（Out-of-Scope）

### 明确排除

| 功能 | 原因 | 预计时间 |
|---|---|---|
| 论坛评论回复 | 论坛增强，不阻塞核心功能 | Beta 后 1 月 |
| 论坛@提及 | 论坛增强，不阻塞核心功能 | Beta 后 1 月 |
| 完整举报系统 | 社区运营，不阻塞核心功能 | Beta 后 2 月 |
| 完整社区运营体系 | 社区运营，不阻塞核心功能 | Beta 后 2 月 |
| Flarum 数据库 DROP | 已退役，保留审计备份 | Beta 后 3 月 |
| 高级会员体系 | 增长功能，不阻塞核心功能 | Beta 后 3 月 |
| 支付功能 | 变现功能，不阻塞核心功能 | Beta 后 3 月 |
| 增长任务自动化 | 增长功能，不阻塞核心功能 | Beta 后 3 月 |
| 大规模 SEO 内容计划 | SEO，不阻塞核心功能 | Beta 后 3 月 |
| 完整无障碍优化 | 用户体验，不阻塞核心功能 | Beta 后 3 月 |
| 所有工具深度美化 | 用户体验，不阻塞核心功能 | Beta 后 3 月 |
| 全量公开大规模增长 | 运营策略，Beta 后决定 | Beta 后决定 |

### 明确不做

| 功能 | 原因 |
|---|---|
| 重新启用 Flarum | 已退役，内置论坛已恢复 |
| 使用旧服务器 142.171.184.179 | 已禁用，使用 192.129.155.149 |
| bbs.jueshi.net 子域名 | 已清零，统一使用 /bbs |

---

## Beta 成功标准

### 定量指标

| 指标 | 目标 |
|---|---|
| 注册用户数 | 10-50 人 |
| 日活跃用户 | 5-20 人 |
| 核心工具使用次数 | 100+ 次/周 |
| 文档保存次数 | 20+ 次/周 |
| 论坛发帖数 | 5+ 篇/周 |
| P0 错误数 | 0 |
| P1 错误数 | < 5 个/周 |

### 定性指标

| 指标 | 目标 |
|---|---|
| 用户反馈 | 收集 10+ 条反馈 |
| 核心功能可用 | 所有核心工具可用 |
| 数据库稳定 | 无数据丢失 |
| 安全无泄露 | 无密码/DATABASE_URL 泄露 |

---

## Beta 退出标准

### 继续 Beta

- P0 错误数 = 0
- 用户反馈积极
- 核心功能可用
- 数据库稳定

### 暂停 Beta

- P0 错误数 > 0
- 数据丢失
- 安全泄露
- 用户反馈消极

### 结束 Beta，正式开放

- Beta 成功标准达成
- 用户反馈积极
- 产品方向验证完成
- 准备大规模增长

---

## Beta 时间线

| 阶段 | 时间 | 目标 |
|---|---|---|
| Milestone 1: Beta Readiness Fixes | 1-2 天 | 修复 P1，准备上线 |
| Milestone 2: Beta Final Verification | 1 天 | 最终验证，锁定版本 |
| Milestone 3: Beta Launch | 持续 | 小范围开放，收集反馈 |
| Milestone 4: Post-Beta Forum Enhancement | Beta 后 2-4 周 | 完善论坛 |
| Milestone 5: Growth / Membership / Monetization | Beta 后 1-3 月 | 增长、会员、变现 |

---

## 决策记录

### 决策 1：暂缓论坛增强

**决策**：暂缓 6.58-B-R3、6.58-C、评论回复、@提及等论坛增强任务

**原因**：
- 项目已进入 Beta 上线收口阶段
- 不应继续以原子级任务推进
- 核心工具和文档保存才是上线主线
- 论坛增强不阻塞 Beta

**影响**：
- 论坛基础功能可用（发帖/评论/审核）
- 论坛增强功能（评论回复/@提及）Beta 后再做

### 决策 2：Beta 范围以核心工具为主

**决策**：Beta 范围以核心工具和文档保存为主，论坛为基础功能

**原因**：
- 核心工具是产品主卖点
- 文档保存是核心需求
- 论坛是附加功能，不是主卖点

**影响**：
- Beta 主卖点是核心工具 + 文档保存
- 论坛作为附加功能开放

### 决策 3：小范围开放 Beta

**决策**：小范围开放 Beta（10-50 人），收集反馈后再决定是否大规模开放

**原因**：
- 产品方向需要验证
- 需要收集真实用户反馈
- 避免大规模上线后发现重大问题

**影响**：
- Beta 期间用户数控制在 10-50 人
- 收集反馈后再决定是否大规模开放

### 决策 4：论坛增强放入 Beta 后 backlog

**决策**：论坛增强、会员体系、支付功能等放入 Beta 后 backlog

**原因**：
- 不阻塞 Beta
- Beta 后再决定优先级
- 根据用户反馈调整

**影响**：
- 论坛增强、会员体系、支付功能 Beta 后再做
- 根据用户反馈决定优先级

---

**报告生成时间**: 2026-06-12T15:05:00Z  
**报告状态**: ✅ 完成，等待决策
