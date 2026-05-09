# Tool Notes — 海外百宝箱

## 汇率工具 /tools/exchange-rate

- **数据源**: ExchangeRate-API (api.exchangerate-api.com/v4/latest/CNY)
- **缓存策略**: 当前为 Node.js 内存缓存（单实例，约 30 分钟 TTL）+ Next.js revalidate 30 分钟。
- **生产环境建议**: 如需跨实例稳定缓存、避免冷启动重复请求，后续可接入 Redis / Vercel KV / 数据库缓存。当前内存缓存适合开发和轻量使用场景。
- **页面口径**: "参考汇率"（非"实时汇率"），明确标注数据来源、最后更新时间、缓存状态及"仅供参考"声明。
- **失败策略**: API 失败时返回缓存数据（标注 stale）；无缓存时显示错误信息，不显示假数据。
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

- 5 国（加拿大、美国、英国、澳大利亚、新西兰）100 个城市参考数据。
- 提供格式正则校验，非投递验证。
- 官方入口：各国邮政官网。
