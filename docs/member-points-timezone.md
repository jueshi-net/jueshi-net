# 积分体系时区规范

## 版本
v1.14.1 (2026-05-16)

## 时区选择
**America/Vancouver (Pacific Time)**

选择理由：
- 目标用户群为海外华人，北美为主要用户区域
- 温哥华/洛杉矶/旧金山是主要华人聚居地
- 与北美主流服务（银行、电商）时区对齐

## 统一工具函数
所有日期相关操作使用 `src/lib/date-utils.ts`：

| 函数 | 用途 | 示例 |
|------|------|------|
| `getTodayDateKey()` | 获取今日 dateKey (YYYY-MM-DD) | "2026-05-15" |
| `getDateKey(offset)` | 获取偏移日期的 dateKey | `getDateKey(-1)` = 昨天 |
| `getTodayRange()` | 获取今日 [start, end) 范围 | 用于 PointLedger 聚合查询 |
| `getDateRange(dateKey)` | 获取指定 dateKey 的范围 | 用于历史数据查询 |

## 使用场景

### DailyCheckIn.dateKey
```ts
const dateKey = getTodayDateKey(); // "2026-05-15"
```

### PointLedger 每日聚合
```ts
const { start, end } = getTodayRange();
const todayEarned = await prisma.pointLedger.aggregate({
  _sum: { points: true },
  where: { userId, createdAt: { gte: start, lt: end } },
});
```

### UserTask 每日积分上限
```ts
const { start, end } = getTodayRange();
const dailyTaskPoints = await prisma.pointLedger.aggregate({
  _sum: { points: true },
  where: { userId, type: "task_complete", createdAt: { gte: start, lt: end } },
});
```

## 禁止的做法
❌ `new Date().toISOString().slice(0, 10)` — UTC 日期，跨天问题
❌ `new Date().setHours(0, 0, 0, 0)` — 依赖服务器本地时区
❌ 每个 API 各自计算日期 — 必须使用 date-utils

## 风险提示
- **DST 切换**: 太平洋时间在 3 月和 11 月会切换 PDT/PST，`getTodayRange()` 使用 `Intl.DateTimeFormat` 自动处理 DST
- **数据库存储**: PostgreSQL 存储 `TIMESTAMP(3)` UTC，查询时将 TZ-aware 时间范围转换为 UTC
- **跨天窗口**: PST (UTC-8) / PDT (UTC-7)，当服务器时间是 UTC 时，"今天"的窗口在 UTC 中是 08:00-08:00 (PST) 或 07:00-07:00 (PDT)
