# E2E Browser Test Report — Round 11

**Time**: 2026-05-09T15:55:42.090Z
**URL**: http://localhost:3001
**Viewport**: iPhone 13 (390x844)
**Headless**: true

## Summary

| Metric | Value |
|--------|-------|
| Pages Tested | 11 |
| P0 (Critical) | 0 |
| P1 (Major) | 3 |
| P2 (Minor) | 0 |
| P3 (Cosmetic) | 0 |
| Console Errors | 18 |
| Failed Requests | 213 |
| Analytics Requests | 21 |

## Page Results

- **home**: passed (2026-05-09T15:54:56.703Z)
- **tracking**: passed (2026-05-09T15:54:59.143Z)
- **shipping-calculator**: passed (2026-05-09T15:55:00.191Z)
- **hs-code**: passed (2026-05-09T15:55:06.621Z)
- **postal-code**: passed (2026-05-09T15:55:11.351Z)
- **exchange-rate**: passed (2026-05-09T15:55:13.517Z)
- **memo**: passed (2026-05-09T15:55:26.508Z)
- **resources**: passed (2026-05-09T15:55:28.157Z)
- **guides**: passed (2026-05-09T15:55:36.727Z)
- **api-stats**: 403 (2026-05-09T15:55:36.743Z)
- **rate-limit**: passed (2026-05-09T15:55:42.058Z)

## Performance Timings

- home-load: 146ms
- home-click-物流追踪: 2602ms
- home-click-运费/CBM: 22ms
- home-click-HS编码: 20ms
- home-click-邮编地址: 19ms
- home-click-汇率查询: 17ms
- home-click-工作便签: 20ms
- tracking-load: 47ms
- tracking-parse: 1262ms
- tracking-copy-one: 18ms
- tracking-17track: 41ms
- shipping-load: 134ms
- shipping-calc: 707ms
- hs-load: 151ms
- postal-load: 51ms
- postal-validate-CA: 1094ms
- postal-validate-US: 17ms
- postal-validate-GB: 19ms
- postal-validate-AU: 19ms
- postal-validate-NZ: 22ms
- exchange-load: 95ms
- exchange-convert: 929ms
- memo-load: 10022ms
- memo-add: 20ms
- memo-export: 27ms
- resources-load: 42ms
- guides-load: 4493ms

## P0 Issues

✅ None

## P1 Issues

- [resources] 分类入口 /resources/logistics 不存在
- [resources] 分类入口 /resources/business 不存在
- [resources] 分类入口 /resources/templates 不存在

## P2 Issues

✅ None

## P3 Issues

✅ None

## Console Errors

- [home] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [tracking] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [shipping-calculator] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [hs-code] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [postal-code] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [exchange-rate] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [memo] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [resources] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [guides] Failed to load resource: the server responded with a status of 403 (Forbidden)
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

- round-11-home.png
- round-11-tracking.png
- round-11-shipping-calculator.png
- round-11-hs-code.png
- round-11-postal-code.png
- round-11-exchange-rate.png
- round-11-memo.png
- round-11-resources.png
- round-11-guides.png
- round-11-api-stats.png
- round-11-rate-limit.png
