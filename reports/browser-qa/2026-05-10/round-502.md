# E2E Browser Test Report — Round 502

**Time**: 2026-05-10T11:27:05.036Z
**URL**: http://localhost:3000
**Viewport**: iPhone 13 (390x844)
**Headless**: true

## Summary

| Metric | Value |
|--------|-------|
| Pages Tested | 12 |
| P0 (Critical) | 0 |
| P1 (Major) | 1 |
| P2 (Minor) | 0 |
| P3 (Cosmetic) | 0 |
| Console Errors | 38 |
| Failed Requests | 572 |
| Analytics Requests | 21 |

## Page Results

- **home**: passed (2026-05-10T11:26:28.304Z)
- **tracking**: passed (2026-05-10T11:26:30.118Z)
- **shipping-calculator**: passed (2026-05-10T11:26:31.153Z)
- **hs-code**: passed (2026-05-10T11:26:37.742Z)
- **postal-code**: passed (2026-05-10T11:26:42.449Z)
- **exchange-rate**: passed (2026-05-10T11:26:46.711Z)
- **starter**: passed (2026-05-10T11:26:46.838Z)
- **memo**: passed (2026-05-10T11:26:50.050Z)
- **resources**: passed (2026-05-10T11:26:54.781Z)
- **guides**: passed (2026-05-10T11:27:00.624Z)
- **api-stats**: 403 (2026-05-10T11:27:00.640Z)
- **rate-limit**: passed (2026-05-10T11:27:05.003Z)

## Performance Timings

- home-load: 162ms
- home-click-物流追踪: 553ms
- home-click-运费/CBM: 523ms
- home-click-HS编码: 525ms
- home-click-邮编地址: 521ms
- home-click-汇率查询: 521ms
- home-click-工作便签: 520ms
- tracking-load: 93ms
- tracking-parse: 230ms
- tracking-copy-one: 225ms
- tracking-17track: 233ms
- shipping-load: 80ms
- shipping-calc: 710ms
- hs-load: 156ms
- postal-load: 55ms
- postal-validate-CA: 220ms
- postal-validate-US: 224ms
- postal-validate-GB: 221ms
- postal-validate-AU: 229ms
- postal-validate-NZ: 226ms
- exchange-load: 57ms
- exchange-convert: 220ms
- starter-load: 49ms
- memo-load: 28ms
- memo-add: 121ms
- memo-export: 114ms
- resources-load: 37ms
- guides-load: 1752ms

## P0 Issues

✅ None

## P1 Issues

- [starter] 页面不应出现「代理节点」

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
- [starter] Failed to load resource: the server responded with a status of 404 (Not Found)
- [memo] Failed to load resource: the server responded with a status of 404 (Not Found)
- [resources] Failed to load resource: the server responded with a status of 404 (Not Found)
- [home] Failed to load resource: the server responded with a status of 404 (Not Found)
- [tracking] Failed to load resource: the server responded with a status of 404 (Not Found)
- [shipping-calculator] Failed to load resource: the server responded with a status of 404 (Not Found)
- [hs-code] Failed to load resource: the server responded with a status of 404 (Not Found)
- [postal-code] Failed to load resource: the server responded with a status of 404 (Not Found)
- [exchange-rate] Failed to load resource: the server responded with a status of 404 (Not Found)
- [starter] Failed to load resource: the server responded with a status of 404 (Not Found)
- [memo] Failed to load resource: the server responded with a status of 404 (Not Found)
- [resources] Failed to load resource: the server responded with a status of 404 (Not Found)
- [home] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [tracking] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [shipping-calculator] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [hs-code] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [postal-code] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [exchange-rate] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [starter] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [memo] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [resources] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [guides] Failed to load resource: the server responded with a status of 403 (Forbidden)
- [home] Failed to load resource: the server responded with a status of 429 (Too Many Requests)
- [tracking] Failed to load resource: the server responded with a status of 429 (Too Many Requests)
- [shipping-calculator] Failed to load resource: the server responded with a status of 429 (Too Many Requests)
- [hs-code] Failed to load resource: the server responded with a status of 429 (Too Many Requests)
- [postal-code] Failed to load resource: the server responded with a status of 429 (Too Many Requests)
- [exchange-rate] Failed to load resource: the server responded with a status of 429 (Too Many Requests)
- [starter] Failed to load resource: the server responded with a status of 429 (Too Many Requests)
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

- round-502-home.png
- round-502-tracking.png
- round-502-shipping-calculator.png
- round-502-hs-code.png
- round-502-postal-code.png
- round-502-exchange-rate.png
- round-502-starter.png
- round-502-memo.png
- round-502-resources.png
- round-502-guides.png
- round-502-api-stats.png
- round-502-rate-limit.png
