# E2E Browser Test Report — Round 4

**Time**: 2026-05-09T15:25:55.850Z
**URL**: http://localhost:3000
**Viewport**: iPhone 13 (390x844)
**Headless**: true

## Summary

| Metric | Value |
|--------|-------|
| Pages Tested | 11 |
| P0 (Critical) | 0 |
| P1 (Major) | 3 |
| P2 (Minor) | 3 |
| P3 (Cosmetic) | 0 |
| Console Errors | 18 |
| Failed Requests | 37 |
| Analytics Requests | 23 |

## Page Results

- **home**: passed (2026-05-09T15:25:13.527Z)
- **tracking**: passed (2026-05-09T15:25:15.570Z)
- **shipping-calculator**: passed (2026-05-09T15:25:16.613Z)
- **hs-code**: passed (2026-05-09T15:25:21.531Z)
- **postal-code**: passed (2026-05-09T15:25:27.227Z)
- **exchange-rate**: passed (2026-05-09T15:25:29.042Z)
- **memo**: passed (2026-05-09T15:25:41.516Z)
- **resources**: passed (2026-05-09T15:25:43.211Z)
- **guides**: passed (2026-05-09T15:25:49.090Z)
- **api-stats**: 404 (2026-05-09T15:25:49.139Z)
- **rate-limit**: passed (2026-05-09T15:25:55.806Z)

## Performance Timings

- home-load: 4825ms
- home-click-物流追踪: 1156ms
- home-click-运费/CBM: 26ms
- home-click-HS编码: 33ms
- home-click-邮编地址: 28ms
- home-click-汇率查询: 65ms
- home-click-工作便签: 28ms
- tracking-load: 135ms
- tracking-parse: 1298ms
- tracking-copy-one: 18ms
- tracking-17track: 54ms
- shipping-load: 138ms
- shipping-calc: 723ms
- hs-load: 500ms
- postal-load: 156ms
- postal-validate-CA: 1742ms
- postal-validate-US: 44ms
- postal-validate-GB: 42ms
- postal-validate-AU: 42ms
- postal-validate-NZ: 47ms
- exchange-load: 108ms
- exchange-convert: 798ms
- memo-load: 10058ms
- memo-add: 25ms
- memo-export: 32ms
- resources-load: 127ms
- guides-load: 1779ms

## P0 Issues

✅ None

## P1 Issues

- [resources] 分类入口 /resources/logistics 不存在
- [resources] 分类入口 /resources/business 不存在
- [resources] 分类入口 /resources/templates 不存在

## P2 Issues

- [tracking] 未检测到 tracking 埋点请求
- [guides] 文章相关工具点击未触发埋点
- [api-stats] /api/events/stats returned status 404

## P3 Issues

✅ None

## Console Errors

- [home] Failed to load resource: the server responded with a status of 404 (Not Found)
- [tracking] Failed to load resource: the server responded with a status of 404 (Not Found)
- [shipping-calculator] Failed to load resource: the server responded with a status of 404 (Not Found)
- [hs-code] Failed to load resource: the server responded with a status of 404 (Not Found)
- [postal-code] Failed to load resource: the server responded with a status of 404 (Not Found)
- [exchange-rate] Failed to load resource: the server responded with a status of 404 (Not Found)
- [memo] Failed to load resource: the server responded with a status of 404 (Not Found)
- [resources] Failed to load resource: the server responded with a status of 404 (Not Found)
- [guides] Failed to load resource: the server responded with a status of 404 (Not Found)
- [home] Failed to load resource: the server responded with a status of 429 (Too Many Requests)
- [tracking] Failed to load resource: the server responded with a status of 429 (Too Many Requests)
- [shipping-calculator] Failed to load resource: the server responded with a status of 429 (Too Many Requests)
- [hs-code] Failed to load resource: the server responded with a status of 429 (Too Many Requests)
- [postal-code] Failed to load resource: the server responded with a status of 429 (Too Many Requests)
- [exchange-rate] Failed to load resource: the server responded with a status of 429 (Too Many Requests)
- [memo] Failed to load resource: the server responded with a status of 429 (Too Many Requests)
- [resources] Failed to load resource: the server responded with a status of 429 (Too Many Requests)
- [guides] Failed to load resource: the server responded with a status of 429 (Too Many Requests)

## Analytics

- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)

## Screenshots

- round-4-home.png
- round-4-tracking.png
- round-4-shipping-calculator.png
- round-4-hs-code.png
- round-4-postal-code.png
- round-4-exchange-rate.png
- round-4-memo.png
- round-4-resources.png
- round-4-guides.png
- round-4-api-stats.png
- round-4-rate-limit.png
