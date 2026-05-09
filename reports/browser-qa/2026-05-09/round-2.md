# E2E Browser Test Report — Round 2

**Time**: 2026-05-09T15:19:36.349Z
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
| Console Errors | 9 |
| Failed Requests | 274 |
| Analytics Requests | 189 |

## Page Results

- **home**: passed (2026-05-09T15:18:50.482Z)
- **tracking**: passed (2026-05-09T15:18:52.263Z)
- **shipping-calculator**: passed (2026-05-09T15:18:53.219Z)
- **hs-code**: passed (2026-05-09T15:18:57.681Z)
- **postal-code**: passed (2026-05-09T15:19:02.421Z)
- **exchange-rate**: passed (2026-05-09T15:19:04.104Z)
- **memo**: passed (2026-05-09T15:19:16.499Z)
- **resources**: passed (2026-05-09T15:19:18.139Z)
- **guides**: passed (2026-05-09T15:19:26.044Z)
- **api-stats**: 404 (2026-05-09T15:19:26.083Z)
- **rate-limit**: passed (2026-05-09T15:19:36.315Z)

## Performance Timings

- home-load: 83ms
- home-click-物流追踪: 2858ms
- home-click-运费/CBM: 25ms
- home-click-HS编码: 28ms
- home-click-邮编地址: 12ms
- home-click-汇率查询: 19ms
- home-click-工作便签: 24ms
- tracking-load: 44ms
- tracking-parse: 1108ms
- tracking-copy-one: 22ms
- tracking-17track: 33ms
- shipping-load: 38ms
- shipping-calc: 614ms
- hs-load: 146ms
- postal-load: 56ms
- postal-validate-CA: 1096ms
- postal-validate-US: 23ms
- postal-validate-GB: 24ms
- postal-validate-AU: 15ms
- postal-validate-NZ: 17ms
- exchange-load: 46ms
- exchange-convert: 755ms
- memo-load: 10019ms
- memo-add: 23ms
- memo-export: 22ms
- resources-load: 37ms
- guides-load: 3814ms

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

## Analytics

- `undefined` → `undefined` (`undefined`)
- `undefined` → `undefined` (`undefined`)
- `undefined` → `undefined` (`undefined`)
- `undefined` → `undefined` (`undefined`)
- `undefined` → `undefined` (`undefined`)
- `undefined` → `undefined` (`undefined`)
- `undefined` → `undefined` (`undefined`)
- `undefined` → `undefined` (`undefined`)
- `undefined` → `undefined` (`undefined`)
- `undefined` → `undefined` (`undefined`)
- `undefined` → `undefined` (`undefined`)
- `undefined` → `undefined` (`undefined`)
- `undefined` → `undefined` (`undefined`)
- `undefined` → `undefined` (`undefined`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)
- `tool_click` → `rate-test` (`test`)

## Screenshots

- round-2-home.png
- round-2-tracking.png
- round-2-shipping-calculator.png
- round-2-hs-code.png
- round-2-postal-code.png
- round-2-exchange-rate.png
- round-2-memo.png
- round-2-resources.png
- round-2-guides.png
- round-2-api-stats.png
- round-2-rate-limit.png
