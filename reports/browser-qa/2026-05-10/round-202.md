# E2E Browser Test Report — Round 202

**Time**: 2026-05-10T09:50:19.194Z
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
| Failed Requests | 471 |
| Analytics Requests | 21 |

## Page Results

- **home**: passed (2026-05-10T09:49:42.044Z)
- **tracking**: passed (2026-05-10T09:49:43.850Z)
- **shipping-calculator**: passed (2026-05-10T09:49:44.882Z)
- **hs-code**: passed (2026-05-10T09:49:51.465Z)
- **postal-code**: passed (2026-05-10T09:49:56.140Z)
- **exchange-rate**: passed (2026-05-10T09:50:00.405Z)
- **memo**: passed (2026-05-10T09:50:03.673Z)
- **resources**: passed (2026-05-10T09:50:08.371Z)
- **guides**: passed (2026-05-10T09:50:14.236Z)
- **api-stats**: 403 (2026-05-10T09:50:14.249Z)
- **rate-limit**: passed (2026-05-10T09:50:19.166Z)

## Performance Timings

- home-load: 85ms
- home-click-物流追踪: 562ms
- home-click-运费/CBM: 530ms
- home-click-HS编码: 529ms
- home-click-邮编地址: 528ms
- home-click-汇率查询: 517ms
- home-click-工作便签: 544ms
- tracking-load: 92ms
- tracking-parse: 224ms
- tracking-copy-one: 222ms
- tracking-17track: 236ms
- shipping-load: 40ms
- shipping-calc: 708ms
- hs-load: 160ms
- postal-load: 45ms
- postal-validate-CA: 232ms
- postal-validate-US: 218ms
- postal-validate-GB: 221ms
- postal-validate-AU: 221ms
- postal-validate-NZ: 219ms
- exchange-load: 66ms
- exchange-convert: 251ms
- memo-load: 39ms
- memo-add: 124ms
- memo-export: 117ms
- resources-load: 37ms
- guides-load: 1787ms

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

- round-202-home.png
- round-202-tracking.png
- round-202-shipping-calculator.png
- round-202-hs-code.png
- round-202-postal-code.png
- round-202-exchange-rate.png
- round-202-memo.png
- round-202-resources.png
- round-202-guides.png
- round-202-api-stats.png
- round-202-rate-limit.png
