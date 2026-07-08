# PAGE_LIFECYCLE.md

> 页面生命周期管理 — 所有页面的状态分类  
> 最后更新: 2026-07-09

---

## 生命周期阶段定义

| 阶段 | 定义 | 维护策略 |
|------|------|----------|
| **Production** | 已上线，稳定运行 | 正常维护，优先修复 |
| **Active** | 开发中，即将上线 | 积极开发，测试验证 |
| **Legacy** | 旧版本，仍在使用 | 逐步迁移，保持兼容 |
| **Experimental** | 实验性质，未上线 | 可选开发，随时废弃 |
| **Preview** | 预览版本，供审核 | 短期存在，审核后删除 |
| **Deprecated** | 已废弃，待删除 | 停止开发，计划删除 |
| **Deleted** | 已删除 | 归档记录 |

---

## Production 页面 (205)

### V4 Shell 页面 (7)

| 路由 | Shell | 状态 | 备注 |
|------|-------|------|------|
| `/` | JueshiV4HomeCandidateV4Shell | ✅ Production | 首页 |
| `/tools` | V4PublicShell | ✅ Production | 工具中心 |
| `/resources` | V4PublicShell | ✅ Production | 资源目录 |
| `/resources/site/[id]` | V4PublicShell | ✅ Production | 资源详情 |
| `/destinations` | V4PublicShell | ✅ Production | 目的地 |
| `/guides` | V4PublicShell | 🟡 Staging | 待验收 |
| `/checklists` | V4PublicShell | 🟡 Staging | 待验收 |

### Public Layout 页面 (~116)

使用旧版 Header/Footer，通过 PublicLayoutClient 提供布局。

**核心页面**：
- `/topics` — 专题列表
- `/search` — 搜索
- `/blog`, `/blog/[slug]` — 博客
- `/community`, `/community/[slug]` — 社区
- `/countries`, `/countries/[country]` — 国家信息
- `/cities/[city]` — 城市信息
- `/starter`, `/starter/[slug]` — 新手指南
- `/pricing` — 定价
- `/packages/[id]` — 套餐
- `/feedback` — 反馈
- `/privacy`, `/terms` — 法律页面
- `/changelog` — 更新日志
- `/help` — 帮助
- `/analytics` — 分析
- `/tracking` — 追踪
- `/favorites` — 收藏
- `/login`, `/register` — 认证
- `/forgot-password`, `/reset-password` — 密码重置
- `/preferences` — 偏好设置
- `/profile` — 个人资料
- `/notifications` — 通知
- `/subscribe`, `/subscribe/confirm` — 订阅
- `/payment/success` — 支付成功
- `/share/[id]` — 分享

**工具页面** (20+)：
- `/tools/shipping-calculator`
- `/tools/exchange-rate`
- `/tools/postal-code`
- `/tools/hs-code`
- `/tools/commercial-invoice`
- `/tools/shipping-label`
- `/tools/template-studio`
- 等等...

### Workspace 页面 (24)

需要登录，使用 WorkspaceLayout。

- `/workspace` — 工作区首页
- `/workspace/favorites` — 收藏
- `/workspace/memos` — 备忘录
- `/workspace/documents` — 文档
- `/workspace/products` — 产品
- `/workspace/company-profiles` — 公司档案
- `/workspace/task-chains` — 任务链
- `/workspace/templates` — 模板
- `/workspace/invites` — 邀请
- `/workspace/notifications` — 通知
- `/workspace/settings` — 设置
- `/workspace/member` — 会员
- `/workspace/ad-entitlements` — 广告权益
- `/dashboard/*` — 仪表盘 (6 页面)
- `/workbench` — 工作台
- `/my-links` — 我的链接

### Admin 页面 (58)

管理后台，使用 AdminLayout。

详见 `02_PAGE_REGISTRY.md` 中的 Admin 页面列表。

---

## Active 页面 (0)

当前无处于 Active 开发阶段的页面。

---

## Legacy 页面 (~116)

使用旧版 Header/Footer 的 Public Layout 页面。

**迁移计划**：
- P0: `/topics`, `/search` → V4 Shell (Night 3)
- P1: `/about`, `/contact` → Design System 试点
- P2: `/blog`, `/community` → V4 Shell
- P3: 其他页面 → 逐步迁移

---

## Experimental 页面 (7)

### UI Lab 页面

| 路由 | 用途 | 状态 |
|------|------|------|
| `/ui-lab/jueshi-v4` | V4 原始版本 | 🟡 实验 |
| `/ui-lab/jueshi-v4-home-candidate` | V4 候选 v1 | 🟡 实验 |
| `/ui-lab/jueshi-v4-home-candidate-v2` | V4 候选 v2 | 🟡 实验 |
| `/ui-lab/jueshi-v4-home-candidate-v3` | V4 候选 v3 | 🟡 实验 |
| `/ui-lab/jueshi-v4-home-candidate-v4` | V4 候选 v4 | ✅ 已投产（首页） |
| `/ui-lab/jueshi-v4-topnav` | V4 导航版本 | 🟡 实验 |
| `/ui-lab/jueshi-v4-topnav-polished` | V4 导航优化版 | 🟡 实验 |

**清理计划**：
- 保留 `jueshi-v4-home-candidate-v4`（已投产）
- 评估其他版本，考虑删除

---

## Preview 页面 (9)

### resources-v2 (7)

| 路由 | 用途 | 状态 |
|------|------|------|
| `/resources-v2` | 资源目录 v2 | 🟡 预览 |
| `/resources-v2/scenarios/shipping` | 寄件场景 | 🟡 预览 |
| `/resources-v2/scenarios/invoice` | 发票场景 | 🟡 预览 |
| `/resources-v2/scenarios/postal` | 邮编场景 | 🟡 预览 |
| `/resources-v2/scenarios/official` | 官方机构 | 🟡 预览 |
| `/resources-v2/scenarios/documents` | 外贸单据 | 🟡 预览 |
| `/resources-v2/scenarios/payment` | 跨境收款 | 🟡 预览 |

**问题**：无外部链接指向，无 robots noindex，疑似废弃。

### community-preview (2)

| 路由 | 用途 | 状态 |
|------|------|------|
| `/community-preview-v2` | 社区预览 v2 | 🟡 预览 |
| `/community-preview-v3` | 社区预览 v3 | 🟡 预览 |

**问题**：无外部链接指向，robots noindex，预览用途。

**清理计划**：确认后删除

---

## Deprecated 页面 (0)

当前无明确标记为 Deprecated 的页面。

**候选**：
- `/resources-v2/*` — 如无使用价值，标记为 Deprecated
- `/community-preview-*` — 如无使用价值，标记为 Deprecated

---

## Deleted 页面 (0)

当前无已删除的页面记录。

---

## 生命周期管理流程

### 新增页面

1. 确定页面类型（Production/Experimental/Preview）
2. 选择合适的 Layout（V4 Shell / Public Layout / Workspace / Admin）
3. 开发并测试
4. 更新本文档
5. 部署到 Staging
6. 用户验收
7. 部署到 Production
8. 更新状态为 Production

### 迁移页面

1. 识别需要迁移的页面（Legacy → Production）
2. 制定迁移计划
3. 通过 Night Pipeline 自动化迁移
4. 测试验证
5. 更新本文档
6. 部署到 Staging
7. 用户验收
8. 部署到 Production

### 废弃页面

1. 识别废弃页面（Production → Deprecated）
2. 确认无外部链接
3. 确认无 SEO 影响
4. 标记为 Deprecated
5. 通知相关方
6. 等待观察期（30 天）
7. 删除页面
8. 更新状态为 Deleted

### 清理 Experimental/Preview

1. 定期审查 Experimental/Preview 页面
2. 评估是否有继续使用价值
3. 有价值的 → 迁移到 Production
4. 无价值的 → 标记为 Deprecated → Deleted

---

## 统计摘要

| 阶段 | 数量 | 百分比 |
|------|------|--------|
| Production | 205 | 92.8% |
| Active | 0 | 0% |
| Legacy | ~116 | 52.5% (包含在 Production 中) |
| Experimental | 7 | 3.2% |
| Preview | 9 | 4.1% |
| Deprecated | 0 | 0% |
| Deleted | 0 | 0% |
| **总计** | **221** | **100%** |

---

**文档状态**: PAGE_LIFECYCLE_ESTABLISHED  
**生成时间**: 2026-07-09  
**下次更新**: 页面状态变更时
