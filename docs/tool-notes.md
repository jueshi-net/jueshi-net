# Tool Notes — 海外百宝箱

## 汇率工具 /tools/exchange-rate

- **数据源**: ExchangeRate-API v4 免费端点 (api.exchangerate-api.com/v4/latest/CNY)
- **v6 升级路径**: 生产环境如需更稳定数据、更多币种、更高 QPS，可升级至 v6 端点：
  - URL 格式: `https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest/CNY`
  - 需注册获取 API Key: https://www.exchangerate-api.com/
  - 升级时需修改 `src/app/api/exchange-rate/route.ts` 中的 fetch URL
  - 将 `API_KEY` 作为环境变量 `EXCHANGE_RATE_API_KEY` 注入
- **缓存策略**: Node.js 进程内内存缓存（单实例有效，TTL 30 分钟）+ Next.js 数据缓存 30 分钟。
- **生产环境建议**: 如需跨实例稳定缓存、避免冷启动重复请求，后续可接入 Redis / Vercel KV / 数据库缓存。当前内存缓存适合开发和轻量使用场景。
- **API 响应字段**: source, base(CNY), date, updatedAt, rates(仅 9 种货币), isStale。不返回第三方原始完整 JSON。
- **页面口径**: "参考汇率"（非"实时汇率"），明确标注数据来源、数据基准、汇率日期、本站更新时间、缓存状态及"仅供参考"声明。
- **失败策略**: API 失败时返回缓存数据（标记 isStale=true）；无缓存时显示错误，不显示假数据。
- **支持币种**: CNY, USD, CAD, EUR, GBP, AUD, NZD, JPY, HKD。

## 运费计算器 /tools/shipping-calculator

- 由原 `/tools/calculator` 和 `/tools/shipping-estimator` 合并而来。
- 旧路由已设为 308 永久重定向到新路由。
- 输出口径为"费用构成参考"，非"报价"。

## HS 编码查询 /tools/hs-code

- 数据来源：内部整理 500 条常见跨境商品申报参考。
- 口径：HS 编码为"候选编码"，风险等级为"参考级别"。
- 不代表任何物流服务商、海关或报关行的最终判断。
- 实际归类需结合商品材质、用途、加工工艺等综合判断。

## 邮编查询 /tools/postal-code

- 5 国（加拿大、美国、英国、澳大利亚、新西兰）140 个城市参考数据。
- 提供格式正则校验，非投递验证。
- 官方入口：各国邮政官网。

## Seed 数据维护

- 种子文件 `prisma/seed-phase2-3.ts` 当前约 1850 行，包含：
  - **Articles**: 20 篇（原始 10 + Phase 2A 新增 10）
  - **Resources**: 80 条（4 类各 20 条，总计 81 含 1 条 extra）
  - **Categories**: 6 个分类
  - **Categories 资源**: 各 20 条
- **维护建议**：后续当文章超过 30 篇或资源超过 100 条时，建议拆分为独立 seed 文件：
  - `prisma/seed-articles.ts` — 文章种子
  - `prisma/seed-resources.ts` — 资源种子
  - `prisma/seed-main.ts` — 分类/用户/链接等核心数据
  - 主 `prisma/seed.ts` 按顺序导入
- 这样便于多人协作编辑、减少合并冲突、提高加载性能。
