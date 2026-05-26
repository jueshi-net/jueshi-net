# E2E Browser Test Report — Round 501

**Time**: 2026-05-10T11:13:57.384Z
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
| Failed Requests | 484 |
| Analytics Requests | 21 |

## Page Results

- **home**: passed (2026-05-10T11:13:20.752Z)
- **tracking**: passed (2026-05-10T11:13:22.576Z)
- **shipping-calculator**: passed (2026-05-10T11:13:23.603Z)
- **hs-code**: passed (2026-05-10T11:13:30.071Z)
- **postal-code**: passed (2026-05-10T11:13:34.747Z)
- **exchange-rate**: passed (2026-05-10T11:13:38.985Z)
- **memo**: passed (2026-05-10T11:13:42.250Z)
- **resources**: passed (2026-05-10T11:13:46.959Z)
- **guides**: passed (2026-05-10T11:13:52.805Z)
- **api-stats**: 403 (2026-05-10T11:13:52.820Z)
- **rate-limit**: passed (2026-05-10T11:13:57.353Z)

## Performance Timings

- home-load: 147ms
- home-click-物流追踪: 538ms
- home-click-运费/CBM: 537ms
- home-click-HS编码: 528ms
- home-click-邮编地址: 516ms
- home-click-汇率查询: 522ms
- home-click-工作便签: 523ms
- tracking-load: 91ms
- tracking-parse: 231ms
- tracking-copy-one: 222ms
- tracking-17track: 240ms
- shipping-load: 168ms
- shipping-calc: 700ms
- hs-load: 152ms
- postal-load: 44ms
- postal-validate-CA: 229ms
- postal-validate-US: 224ms
- postal-validate-GB: 219ms
- postal-validate-AU: 226ms
- postal-validate-NZ: 221ms
- exchange-load: 52ms
- exchange-convert: 220ms
- memo-load: 37ms
- memo-add: 126ms
- memo-export: 124ms
- resources-load: 33ms
- guides-load: 1760ms

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

- round-501-home.png
- round-501-tracking.png
- round-501-shipping-calculator.png
- round-501-hs-code.png
- round-501-postal-code.png
- round-501-exchange-rate.png
- round-501-memo.png
- round-501-resources.png
- round-501-guides.png
- round-501-api-stats.png
- round-501-rate-limit.png
