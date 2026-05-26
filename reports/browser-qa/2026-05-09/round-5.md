# E2E Browser Test Report — Round 5

**Time**: 2026-05-09T15:27:54.419Z
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
| Failed Requests | 31 |
| Analytics Requests | 22 |

## Page Results

- **home**: passed (2026-05-09T15:27:12.589Z)
- **tracking**: passed (2026-05-09T15:27:14.517Z)
- **shipping-calculator**: passed (2026-05-09T15:27:15.585Z)
- **hs-code**: passed (2026-05-09T15:27:20.564Z)
- **postal-code**: passed (2026-05-09T15:27:25.722Z)
- **exchange-rate**: passed (2026-05-09T15:27:27.476Z)
- **memo**: passed (2026-05-09T15:27:40.011Z)
- **resources**: passed (2026-05-09T15:27:41.741Z)
- **guides**: passed (2026-05-09T15:27:47.789Z)
- **api-stats**: 404 (2026-05-09T15:27:47.864Z)
- **rate-limit**: passed (2026-05-09T15:27:54.388Z)

## Performance Timings

- home-load: 1581ms
- home-click-物流追踪: 1670ms
- home-click-运费/CBM: 28ms
- home-click-HS编码: 25ms
- home-click-邮编地址: 27ms
- home-click-汇率查询: 20ms
- home-click-工作便签: 34ms
- tracking-load: 147ms
- tracking-parse: 1158ms
- tracking-copy-one: 24ms
- tracking-17track: 51ms
- shipping-load: 150ms
- shipping-calc: 743ms
- hs-load: 526ms
- postal-load: 171ms
- postal-validate-CA: 1145ms
- postal-validate-US: 37ms
- postal-validate-GB: 41ms
- postal-validate-AU: 51ms
- postal-validate-NZ: 50ms
- exchange-load: 127ms
- exchange-convert: 752ms
- memo-load: 10078ms
- memo-add: 41ms
- memo-export: 35ms
- resources-load: 171ms
- guides-load: 1944ms

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

- round-5-home.png
- round-5-tracking.png
- round-5-shipping-calculator.png
- round-5-hs-code.png
- round-5-postal-code.png
- round-5-exchange-rate.png
- round-5-memo.png
- round-5-resources.png
- round-5-guides.png
- round-5-api-stats.png
- round-5-rate-limit.png
