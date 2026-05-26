# E2E Browser Test Report — Round 301

**Time**: 2026-05-10T10:09:45.840Z
**URL**: http://localhost:3000
**Viewport**: iPhone 13 (390x844)
**Headless**: true

## Summary

| Metric | Value |
|--------|-------|
| Pages Tested | 11 |
| P0 (Critical) | 0 |
| P1 (Major) | 0 |
| P2 (Minor) | 0 |
| P3 (Cosmetic) | 0 |
| Console Errors | 34 |
| Failed Requests | 472 |
| Analytics Requests | 21 |

## Page Results

- **home**: passed (2026-05-10T10:09:09.320Z)
- **tracking**: passed (2026-05-10T10:09:11.204Z)
- **shipping-calculator**: passed (2026-05-10T10:09:12.192Z)
- **hs-code**: passed (2026-05-10T10:09:18.771Z)
- **postal-code**: passed (2026-05-10T10:09:23.432Z)
- **exchange-rate**: passed (2026-05-10T10:09:27.693Z)
- **memo**: passed (2026-05-10T10:09:30.927Z)
- **resources**: passed (2026-05-10T10:09:35.636Z)
- **guides**: passed (2026-05-10T10:09:41.457Z)
- **api-stats**: 403 (2026-05-10T10:09:41.471Z)
- **rate-limit**: passed (2026-05-10T10:09:45.813Z)

## Performance Timings

- home-load: 168ms
- home-click-物流追踪: 539ms
- home-click-运费/CBM: 538ms
- home-click-HS编码: 541ms
- home-click-邮编地址: 521ms
- home-click-汇率查询: 523ms
- home-click-工作便签: 518ms
- tracking-load: 97ms
- tracking-parse: 233ms
- tracking-copy-one: 224ms
- tracking-17track: 240ms
- shipping-load: 90ms
- shipping-calc: 668ms
- hs-load: 144ms
- postal-load: 50ms
- postal-validate-CA: 223ms
- postal-validate-US: 220ms
- postal-validate-GB: 222ms
- postal-validate-AU: 228ms
- postal-validate-NZ: 220ms
- exchange-load: 56ms
- exchange-convert: 228ms
- memo-load: 36ms
- memo-add: 119ms
- memo-export: 122ms
- resources-load: 34ms
- guides-load: 1732ms

## P0 Issues

✅ None

## P1 Issues

✅ None

## P2 Issues

✅ None

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
- [home] Failed to load resource: the server responded with a status of 404 (Not Found)
- [tracking] Failed to load resource: the server responded with a status of 404 (Not Found)
- [shipping-calculator] Failed to load resource: the server responded with a status of 404 (Not Found)
- [hs-code] Failed to load resource: the server responded with a status of 404 (Not Found)
- [postal-code] Failed to load resource: the server responded with a status of 404 (Not Found)
- [exchange-rate] Failed to load resource: the server responded with a status of 404 (Not Found)
- [memo] Failed to load resource: the server responded with a status of 404 (Not Found)
- [resources] Failed to load resource: the server responded with a status of 404 (Not Found)
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

- round-301-home.png
- round-301-tracking.png
- round-301-shipping-calculator.png
- round-301-hs-code.png
- round-301-postal-code.png
- round-301-exchange-rate.png
- round-301-memo.png
- round-301-resources.png
- round-301-guides.png
- round-301-api-stats.png
- round-301-rate-limit.png
