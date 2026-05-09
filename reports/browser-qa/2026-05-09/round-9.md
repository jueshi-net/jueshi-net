# E2E Browser Test Report — Round 9

**Time**: 2026-05-09T15:41:56.360Z
**URL**: http://localhost:3000
**Viewport**: iPhone 13 (390x844)
**Headless**: true

## Summary

| Metric | Value |
|--------|-------|
| Pages Tested | 11 |
| P0 (Critical) | 0 |
| P1 (Major) | 0 |
| P2 (Minor) | 1 |
| P3 (Cosmetic) | 0 |
| Console Errors | 18 |
| Failed Requests | 26 |
| Analytics Requests | 21 |

## Page Results

- **home**: passed (2026-05-09T15:41:08.274Z)
- **tracking**: passed (2026-05-09T15:41:10.691Z)
- **shipping-calculator**: passed (2026-05-09T15:41:11.918Z)
- **hs-code**: passed (2026-05-09T15:41:18.924Z)
- **postal-code**: passed (2026-05-09T15:41:24.032Z)
- **exchange-rate**: passed (2026-05-09T15:41:26.331Z)
- **memo**: passed (2026-05-09T15:41:39.411Z)
- **resources**: passed (2026-05-09T15:41:45.773Z)
- **guides**: passed (2026-05-09T15:41:51.712Z)
- **api-stats**: 404 (2026-05-09T15:41:51.790Z)
- **rate-limit**: passed (2026-05-09T15:41:56.316Z)

## Performance Timings

- home-load: 5378ms
- home-click-物流追踪: 1170ms
- home-click-运费/CBM: 25ms
- home-click-HS编码: 23ms
- home-click-邮编地址: 24ms
- home-click-汇率查询: 21ms
- home-click-工作便签: 27ms
- tracking-load: 143ms
- tracking-parse: 1159ms
- tracking-copy-one: 20ms
- tracking-17track: 50ms
- shipping-load: 222ms
- shipping-calc: 897ms
- hs-load: 517ms
- postal-load: 151ms
- postal-validate-CA: 1152ms
- postal-validate-US: 32ms
- postal-validate-GB: 38ms
- postal-validate-AU: 35ms
- postal-validate-NZ: 46ms
- exchange-load: 205ms
- exchange-convert: 942ms
- memo-load: 10058ms
- memo-add: 31ms
- memo-export: 30ms
- resources-load: 97ms
- guides-load: 1848ms

## P0 Issues

✅ None

## P1 Issues

✅ None

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

- round-9-home.png
- round-9-tracking.png
- round-9-shipping-calculator.png
- round-9-hs-code.png
- round-9-postal-code.png
- round-9-exchange-rate.png
- round-9-memo.png
- round-9-resources.png
- round-9-guides.png
- round-9-api-stats.png
- round-9-rate-limit.png
