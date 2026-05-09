# E2E Browser Test Report — Round 3

**Time**: 2026-05-09T15:23:48.978Z
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
| Analytics Requests | 147 |

## Page Results

- **home**: passed (2026-05-09T15:23:07.291Z)
- **tracking**: passed (2026-05-09T15:23:09.179Z)
- **shipping-calculator**: passed (2026-05-09T15:23:10.223Z)
- **hs-code**: passed (2026-05-09T15:23:15.100Z)
- **postal-code**: passed (2026-05-09T15:23:20.217Z)
- **exchange-rate**: passed (2026-05-09T15:23:21.978Z)
- **memo**: passed (2026-05-09T15:23:34.479Z)
- **resources**: passed (2026-05-09T15:23:36.226Z)
- **guides**: passed (2026-05-09T15:23:42.320Z)
- **api-stats**: 404 (2026-05-09T15:23:42.403Z)
- **rate-limit**: passed (2026-05-09T15:23:48.932Z)

## Performance Timings

- home-load: 1255ms
- home-click-物流追踪: 1206ms
- home-click-运费/CBM: 29ms
- home-click-HS编码: 28ms
- home-click-邮编地址: 27ms
- home-click-汇率查询: 21ms
- home-click-工作便签: 25ms
- tracking-load: 143ms
- tracking-parse: 1131ms
- tracking-copy-one: 24ms
- tracking-17track: 49ms
- shipping-load: 132ms
- shipping-calc: 719ms
- hs-load: 454ms
- postal-load: 166ms
- postal-validate-CA: 1143ms
- postal-validate-US: 33ms
- postal-validate-GB: 43ms
- postal-validate-AU: 41ms
- postal-validate-NZ: 59ms
- exchange-load: 145ms
- exchange-convert: 755ms
- memo-load: 10073ms
- memo-add: 27ms
- memo-export: 28ms
- resources-load: 166ms
- guides-load: 2000ms

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

- round-3-home.png
- round-3-tracking.png
- round-3-shipping-calculator.png
- round-3-hs-code.png
- round-3-postal-code.png
- round-3-exchange-rate.png
- round-3-memo.png
- round-3-resources.png
- round-3-guides.png
- round-3-api-stats.png
- round-3-rate-limit.png
