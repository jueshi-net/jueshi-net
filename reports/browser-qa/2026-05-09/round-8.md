# E2E Browser Test Report — Round 8

**Time**: 2026-05-09T15:35:22.251Z
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
| Failed Requests | 50 |
| Analytics Requests | 21 |

## Page Results

- **home**: passed (2026-05-09T15:34:31.916Z)
- **tracking**: passed (2026-05-09T15:34:34.395Z)
- **shipping-calculator**: passed (2026-05-09T15:34:35.565Z)
- **hs-code**: passed (2026-05-09T15:34:42.417Z)
- **postal-code**: passed (2026-05-09T15:34:47.551Z)
- **exchange-rate**: passed (2026-05-09T15:34:49.726Z)
- **memo**: passed (2026-05-09T15:35:02.821Z)
- **resources**: passed (2026-05-09T15:35:09.145Z)
- **guides**: passed (2026-05-09T15:35:15.467Z)
- **api-stats**: 404 (2026-05-09T15:35:15.518Z)
- **rate-limit**: passed (2026-05-09T15:35:22.222Z)

## Performance Timings

- home-load: 1020ms
- home-click-物流追踪: 1191ms
- home-click-运费/CBM: 23ms
- home-click-HS编码: 22ms
- home-click-邮编地址: 21ms
- home-click-汇率查询: 18ms
- home-click-工作便签: 32ms
- tracking-load: 141ms
- tracking-parse: 1204ms
- tracking-copy-one: 23ms
- tracking-17track: 35ms
- shipping-load: 151ms
- shipping-calc: 824ms
- hs-load: 452ms
- postal-load: 151ms
- postal-validate-CA: 1191ms
- postal-validate-US: 47ms
- postal-validate-GB: 44ms
- postal-validate-AU: 40ms
- postal-validate-NZ: 52ms
- exchange-load: 132ms
- exchange-convert: 883ms
- memo-load: 10054ms
- memo-add: 29ms
- memo-export: 38ms
- resources-load: 144ms
- guides-load: 2231ms

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

- round-8-home.png
- round-8-tracking.png
- round-8-shipping-calculator.png
- round-8-hs-code.png
- round-8-postal-code.png
- round-8-exchange-rate.png
- round-8-memo.png
- round-8-resources.png
- round-8-guides.png
- round-8-api-stats.png
- round-8-rate-limit.png
