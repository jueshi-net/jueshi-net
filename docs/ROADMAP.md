# v0.3 → v1.0 路线图

> 短期 → 中期 → 长期任务，按优先级顺序执行

## Phase 1: 短期任务 — 核心工具优化

| # | 工具 | 任务 | 说明 |
|---|------|------|------|
| 1 | exchange-rate | 升级 ExchangeRate-API v6 | 更稳定数据、更多币种、更高 QPS |
| 2 | postal-code | 扩充城市范围数据 | 140 个城市（CA 49/US 31/UK 26/AU 22/NZ 12），0 重复 |
| 3 | tracking | 批量追踪 + 单号复制 | 支持多单号同时查 17TRACK，每个单号可单独复制 |
| 4 | home-page | 核心工具 Tooltip | 首页核心工具卡片增加悬浮提示 |

## Phase 2: 中期任务 — 数据与资源扩充

| # | 工具 | 任务 | 说明 |
|---|------|------|------|
| 1 | hs-code | 导入外部数据 | product-declarations-ext.json 扩充 HS 库 |
| 2 | resources | 新增文章种子数据 | prisma/seed-phase3.json |
| 3 | resources | 新增资源种子数据 | prisma/seed-phase3-resources.json |
| 4 | postal-code | 添加官方入口链接 | 五国邮政官网快捷入口 |
| 5 | home-page | 工具关联指南链接 | shipping-calculator/hs-code/sensitive-goods/postal-code → guides |

## Phase 3: 长期任务 — 高级功能与分析

| # | 工具 | 任务 | 说明 |
|---|------|------|------|
| 1 | exchange-rate | 历史汇率图表 | 30 天趋势图 |
| 2 | postal-code | 增强可投递性验证 | 更精确的城市/邮编匹配 |
| 3 | hs-code | 批量查询 | 支持一次查询多个品名 |
| 4 | hs-code | 导出 CSV | nameCn/nameEn/hsCode/riskLevel |
| 5 | memo | 云同步 | 跨设备备份（可选登录） |
| 6 | memo | 提醒功能 | 到期提醒 |

## 状态追踪

- [x] Phase 1: 短期任务（2026-05-09 完成）
- [x] Phase 2: 中期任务（2026-05-09 完成）
- [ ] Phase 3: 长期任务（进行中）
  - [x] 汇率历史走势图（ECB/Frankfurter）
  - [x] HS 编码批量查询 + CSV 导出
  - [ ] Memo 云同步（NextAuth v5）
  - [ ] Memo 到期提醒
  - [ ] 邮编增强可投递性验证
