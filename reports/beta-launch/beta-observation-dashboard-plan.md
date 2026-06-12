# Beta Observation Dashboard Plan

**生成时间**: 2026-06-13 00:55 UTC  
**用途**: Beta 期间监控指标和观察看板

---

## 指标分类

### 1. 用户指标

| 指标 | 说明 | 数据来源 | 监控频率 | 目标值 |
|------|------|----------|----------|--------|
| 注册数 | 新注册用户总数 | users 表 | 每日 | Beta 期间 10-50 |
| 登录成功率 | 成功登录次数 / 总登录尝试次数 | EventLog (LOGIN_SUCCESS / LOGIN_ATTEMPT) | 每日 | > 95% |
| DAU | 日活跃用户数 | sessions 表 | 每日 | Beta 期间 5-20 |
| 新用户转化 | 注册后 7 天内使用核心工具的用户比例 | users + tool_metric_dailies | 每周 | > 60% |
| 留存率 | 注册后 7 天 / 30 天仍活跃的用户比例 | users + sessions | 每周 | > 40% (7天) |

### 2. 功能指标

| 指标 | 说明 | 数据来源 | 监控频率 | 目标值 |
|------|------|----------|----------|--------|
| HS Code 使用次数 | HS Code 查询总次数 | tool_metric_dailies (toolName='hs-code') | 每日 | 持续增长 |
| Postal Code 使用次数 | Postal Code 查询总次数 | tool_metric_dailies (toolName='postal-code') | 每日 | 持续增长 |
| Exchange Rate 使用次数 | 汇率查询总次数 | tool_metric_dailies (toolName='exchange-rate') | 每日 | 持续增长 |
| Shipping Calculator 使用次数 | 运费计算总次数 | tool_metric_dailies (toolName='shipping-calculator') | 每日 | 持续增长 |
| Quote Sheet 保存数 | Quote Sheet 文档保存总次数 | tool_document_history (action='create'/'update', toolName='quote-sheet') | 每日 | 持续增长 |
| Commercial Invoice 保存数 | Commercial Invoice 文档保存总次数 | tool_document_history (action='create'/'update', toolName='commercial-invoice') | 每日 | 持续增长 |
| Workspace 访问数 | Workspace 页面访问总次数 | EventLog (WORKSPACE_VIEW) | 每日 | 持续增长 |
| TaskChainDraft 保存数 | TaskChainDraft 保存总次数 | tool_document_history (toolName='task-chain-draft') | 每日 | 持续增长 |

### 3. 论坛指标

| 指标 | 说明 | 数据来源 | 监控频率 | 目标值 |
|------|------|----------|----------|--------|
| 发帖数 | 论坛发帖总数 | forum_posts | 每日 | Beta 期间 10-50 |
| 评论数 | 论坛评论总数 | forum_comments | 每日 | Beta 期间 20-100 |
| 审核通过数 | 审核通过的帖子/评论数 | forum_posts/forum_comments (status='approved') | 每日 | > 80% |
| 垃圾拦截数 | 被拦截的垃圾帖子/评论数 | forum_posts/forum_comments (status='spam') | 每日 | 监控异常增长 |
| 活跃用户数 | 发帖/评论的独立用户数 | forum_posts/forum_comments | 每周 | Beta 期间 5-20 |

### 4. 稳定性指标

| 指标 | 说明 | 数据来源 | 监控频率 | 目标值 |
|------|------|----------|----------|--------|
| Runtime Guard 通过率 | Runtime Guard 检查通过次数 / 总检查次数 | runtime-guard.json | 每小时 | > 99% |
| PM2 restart 次数 | PM2 进程重启总次数 | pm2 status | 每小时 | < 5 次/天 |
| 500 错误数 | HTTP 500 错误总数 | PM2 logs / Nginx logs | 每小时 | < 10 次/天 |
| DB 错误数 | 数据库错误总数 | PM2 logs (P1000/P2010/28P01) | 每小时 | 0 次/天 |
| P1000 次数 | Prisma P1000 错误次数 | PM2 logs | 每小时 | 0 次/天 |
| P2010 次数 | Prisma P2010 错误次数 | PM2 logs | 每小时 | 0 次/天 |
| 28P01 次数 | PostgreSQL 28P01 错误次数 | PM2 logs | 每小时 | 0 次/天 |
| 页面加载时间 | 首页/工具页平均加载时间 | Nginx logs / APM | 每日 | < 3 秒 |

### 5. 反馈指标

| 指标 | 说明 | 数据来源 | 监控频率 | 目标值 |
|------|------|----------|----------|--------|
| Bug 报告数 | 用户报告的 Bug 总数 | 论坛 / 邮箱 | 每日 | 监控趋势 |
| 用户建议数 | 用户提出的功能建议总数 | 论坛 / 邮箱 | 每日 | 监控趋势 |
| 无法完成任务数 | 用户报告无法完成的任务数 | 论坛 / 邮箱 | 每日 | < 5 次/周 |
| 重复问题数 | 重复报告的问题数 | 论坛 | 每周 | 监控趋势 |

---

## 监控看板设计

### 实时看板 (每小时更新)

```
┌─────────────────────────────────────────┐
│ 海外百宝箱 Beta 实时监控                │
├─────────────────────────────────────────┤
│ Runtime Guard: ✅ 99.5% 通过率          │
│ PM2 Status: ✅ Online (3h uptime)       │
│ DB Errors: ✅ 0 (P1000/P2010/28P01)     │
│ 500 Errors: ✅ 2 (今日)                 │
└─────────────────────────────────────────┘
```

### 每日看板 (每日更新)

```
┌─────────────────────────────────────────┐
│ 海外百宝箱 Beta 每日报告                │
│ 日期: 2026-06-13                        │
├─────────────────────────────────────────┤
│ 用户指标                                │
│ - 注册数: 15 (+5)                       │
│ - 登录成功率: 96.5%                     │
│ - DAU: 12                               │
│                                         │
│ 功能指标                                │
│ - HS Code: 45 次                        │
│ - Postal Code: 32 次                    │
│ - Quote Sheet 保存: 8 次                │
│ - Commercial Invoice 保存: 5 次         │
│                                         │
│ 论坛指标                                │
│ - 发帖: 3                               │
│ - 评论: 7                               │
│ - 审核通过: 10 (100%)                   │
│                                         │
│ 稳定性指标                              │
│ - PM2 restart: 0                        │
│ - 500 错误: 2                           │
│ - DB 错误: 0                            │
└─────────────────────────────────────────┘
```

### 每周看板 (每周更新)

```
┌─────────────────────────────────────────┐
│ 海外百宝箱 Beta 周报                    │
│ 周期: 2026-06-13 ~ 2026-06-19           │
├─────────────────────────────────────────┤
│ 用户增长                                │
│ - 新注册: 35                            │
│ - DAU 平均: 18                          │
│ - 7 天留存: 45%                         │
│                                         │
│ 功能使用                                │
│ - HS Code: 280 次                       │
│ - Postal Code: 195 次                   │
│ - Quote Sheet 保存: 52 次               │
│ - Commercial Invoice 保存: 38 次        │
│                                         │
│ 论坛活跃度                              │
│ - 发帖: 22                              │
│ - 评论: 48                              │
│ - 活跃用户: 15                          │
│                                         │
│ 稳定性                                  │
│ - PM2 restart: 2                        │
│ - 500 错误: 12                          │
│ - DB 错误: 0                            │
│                                         │
│ 用户反馈                                │
│ - Bug 报告: 5                           │
│ - 功能建议: 8                           │
│ - 无法完成任务: 2                       │
└─────────────────────────────────────────┘
```

---

## 告警规则

### P0 告警 (立即处理)

- Runtime Guard 通过率 < 90%
- PM2 restart > 10 次/小时
- DB 错误 (P1000/P2010/28P01) > 0
- 500 错误 > 50 次/小时

### P1 告警 (1 小时内处理)

- Runtime Guard 通过率 < 95%
- PM2 restart > 5 次/小时
- 500 错误 > 20 次/小时
- 页面加载时间 > 10 秒

### P2 告警 (24 小时内处理)

- 登录成功率 < 90%
- DAU 下降 > 30%
- 论坛垃圾帖子 > 20%
- Bug 报告 > 10 次/天

---

## 数据收集方案

### 方案 A: 数据库查询 (推荐)

使用 Prisma 或 SQL 直接查询数据库，生成指标报告。

**优点**:
- 数据准确
- 实时性好
- 无需额外工具

**缺点**:
- 需要编写查询脚本
- 可能影响数据库性能

### 方案 B: EventLog 分析

使用 EventLog 表记录关键事件，分析事件数据。

**优点**:
- 灵活扩展
- 不影响核心业务
- 可以记录详细上下文

**缺点**:
- 需要写入 EventLog
- 数据量可能较大

### 方案 C: APM 工具

使用 APM 工具 (如 Sentry, DataDog) 监控应用性能。

**优点**:
- 实时监控
- 自动告警
- 可视化看板

**缺点**:
- 需要额外成本
- 需要集成 SDK

---

## 建议

**推荐方案**: 方案 A + 方案 B

- 使用数据库查询获取用户指标、功能指标、论坛指标
- 使用 EventLog 记录关键事件 (登录、保存、访问等)
- 使用 PM2 logs 监控稳定性指标
- 使用论坛收集用户反馈

**实施步骤**:
1. 编写指标查询脚本 (每日/每周执行)
2. 配置 EventLog 写入 (关键事件)
3. 配置 PM2 logs 监控 (每小时检查)
4. 生成监控看板 (每日/每周报告)
5. 配置告警规则 (P0/P1/P2)

---

**文档生成时间**: 2026-06-13 00:55 UTC  
**文档路径**: `reports/beta-launch/beta-observation-dashboard-plan.md`
