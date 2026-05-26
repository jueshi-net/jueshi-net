# E2E Browser Test Report — Round 7

**Time**: 2026-05-09T15:31:37.410Z
**URL**: http://localhost:3000
**Viewport**: iPhone 13 (390x844)
**Headless**: true

## Summary

| Metric | Value |
|--------|-------|
| Pages Tested | 11 |
| P0 (Critical) | 0 |
| P1 (Major) | 2 |
| P2 (Minor) | 1 |
| P3 (Cosmetic) | 0 |
| Console Errors | 18 |
| Failed Requests | 12 |
| Analytics Requests | 21 |

## Page Results

- **home**: passed (2026-05-09T15:30:49.907Z)
- **tracking**: passed (2026-05-09T15:30:52.419Z)
- **shipping-calculator**: passed (2026-05-09T15:30:53.605Z)
- **hs-code**: passed (2026-05-09T15:31:00.472Z)
- **postal-code**: passed (2026-05-09T15:31:05.725Z)
- **exchange-rate**: passed (2026-05-09T15:31:07.935Z)
- **memo**: passed (2026-05-09T15:31:21.036Z)
- **resources**: passed (2026-05-09T15:31:24.256Z)
- **guides**: passed (2026-05-09T15:31:30.683Z)
- **api-stats**: 404 (2026-05-09T15:31:30.726Z)
- **rate-limit**: passed (2026-05-09T15:31:37.378Z)

## Performance Timings

- home-load: 5187ms
- home-click-物流追踪: 1157ms
- home-click-运费/CBM: 22ms
- home-click-HS编码: 17ms
- home-click-邮编地址: 29ms
- home-click-汇率查询: 24ms
- home-click-工作便签: 24ms
- tracking-load: 137ms
- tracking-parse: 1276ms
- tracking-copy-one: 16ms
- tracking-17track: 36ms
- shipping-load: 144ms
- shipping-calc: 856ms
- hs-load: 436ms
- postal-load: 154ms
- postal-validate-CA: 1292ms
- postal-validate-US: 48ms
- postal-validate-GB: 39ms
- postal-validate-AU: 49ms
- postal-validate-NZ: 53ms
- exchange-load: 135ms
- exchange-convert: 916ms
- memo-load: 10060ms
- memo-add: 35ms
- memo-export: 46ms
- resources-load: 64ms
- guides-load: 2337ms

## P0 Issues

✅ None

## P1 Issues

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

- round-7-home.png
- round-7-tracking.png
- round-7-shipping-calculator.png
- round-7-hs-code.png
- round-7-postal-code.png
- round-7-exchange-rate.png
- round-7-memo.png
- round-7-resources.png
- round-7-guides.png
- round-7-api-stats.png
- round-7-rate-limit.png
