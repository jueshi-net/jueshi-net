# E2E Browser Test Report — Round 6

**Time**: 2026-05-09T15:29:28.127Z
**URL**: http://localhost:3000
**Viewport**: iPhone 13 (390x844)
**Headless**: true

## Summary

| Metric | Value |
|--------|-------|
| Pages Tested | 11 |
| P0 (Critical) | 0 |
| P1 (Major) | 3 |
| P2 (Minor) | 1 |
| P3 (Cosmetic) | 0 |
| Console Errors | 18 |
| Failed Requests | 31 |
| Analytics Requests | 24 |

## Page Results

- **home**: passed (2026-05-09T15:28:47.601Z)
- **tracking**: passed (2026-05-09T15:28:49.602Z)
- **shipping-calculator**: passed (2026-05-09T15:28:50.646Z)
- **hs-code**: passed (2026-05-09T15:28:55.550Z)
- **postal-code**: passed (2026-05-09T15:29:00.766Z)
- **exchange-rate**: passed (2026-05-09T15:29:02.735Z)
- **memo**: passed (2026-05-09T15:29:15.240Z)
- **resources**: passed (2026-05-09T15:29:16.951Z)
- **guides**: passed (2026-05-09T15:29:22.822Z)
- **api-stats**: 404 (2026-05-09T15:29:22.873Z)
- **rate-limit**: passed (2026-05-09T15:29:28.085Z)

## Performance Timings

- home-load: 4930ms
- home-click-物流追踪: 1155ms
- home-click-运费/CBM: 21ms
- home-click-HS编码: 29ms
- home-click-邮编地址: 32ms
- home-click-汇率查询: 21ms
- home-click-工作便签: 25ms
- tracking-load: 129ms
- tracking-parse: 1253ms
- tracking-copy-one: 19ms
- tracking-17track: 56ms
- shipping-load: 133ms
- shipping-calc: 723ms
- hs-load: 490ms
- postal-load: 142ms
- postal-validate-CA: 1269ms
- postal-validate-US: 48ms
- postal-validate-GB: 48ms
- postal-validate-AU: 51ms
- postal-validate-NZ: 39ms
- exchange-load: 72ms
- exchange-convert: 1000ms
- memo-load: 10056ms
- memo-add: 33ms
- memo-export: 31ms
- resources-load: 139ms
- guides-load: 1786ms

## P0 Issues

✅ None

## P1 Issues

- [resources] 分类入口 /resources/logistics 不存在
- [resources] 分类入口 /resources/business 不存在
- [resources] 分类入口 /resources/templates 不存在

## P2 Issues

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

- `article_click` → `blog` (`click_related_运费估算器`)
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

- round-6-home.png
- round-6-tracking.png
- round-6-shipping-calculator.png
- round-6-hs-code.png
- round-6-postal-code.png
- round-6-exchange-rate.png
- round-6-memo.png
- round-6-resources.png
- round-6-guides.png
- round-6-api-stats.png
- round-6-rate-limit.png
