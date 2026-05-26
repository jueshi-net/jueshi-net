# E2E Browser Test Report — Round 503

**Time**: 2026-05-10T11:28:20.112Z
**URL**: http://localhost:3000
**Viewport**: iPhone 13 (390x844)
**Headless**: true

## Summary

| Metric | Value |
|--------|-------|
| Pages Tested | 12 |
| P0 (Critical) | 0 |
| P1 (Major) | 0 |
| P2 (Minor) | 0 |
| P3 (Cosmetic) | 0 |
| Console Errors | 38 |
| Failed Requests | 555 |
| Analytics Requests | 21 |

## Page Results

- **home**: passed (2026-05-10T11:27:43.480Z)
- **tracking**: passed (2026-05-10T11:27:45.332Z)
- **shipping-calculator**: passed (2026-05-10T11:27:46.277Z)
- **hs-code**: passed (2026-05-10T11:27:52.784Z)
- **postal-code**: passed (2026-05-10T11:27:57.446Z)
- **exchange-rate**: passed (2026-05-10T11:28:01.706Z)
- **starter**: passed (2026-05-10T11:28:01.841Z)
- **memo**: passed (2026-05-10T11:28:05.077Z)
- **resources**: passed (2026-05-10T11:28:09.761Z)
- **guides**: passed (2026-05-10T11:28:15.576Z)
- **api-stats**: 403 (2026-05-10T11:28:15.588Z)
- **rate-limit**: passed (2026-05-10T11:28:20.082Z)

## Performance Timings

- home-load: 86ms
- home-click-物流追踪: 565ms
- home-click-运费/CBM: 522ms
- home-click-HS编码: 525ms
- home-click-邮编地址: 520ms
- home-click-汇率查询: 531ms
- home-click-工作便签: 520ms
- tracking-load: 91ms
- tracking-parse: 227ms
- tracking-copy-one: 217ms
- tracking-17track: 236ms
- shipping-load: 84ms
- shipping-calc: 619ms
- hs-load: 145ms
- postal-load: 46ms
- postal-validate-CA: 217ms
- postal-validate-US: 232ms
- postal-validate-GB: 230ms
- postal-validate-AU: 217ms
- postal-validate-NZ: 222ms
- exchange-load: 56ms
- exchange-convert: 222ms
- starter-load: 54ms
- memo-load: 31ms
- memo-add: 120ms
- memo-export: 125ms
- resources-load: 37ms
- guides-load: 1726ms

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

- round-503-home.png
- round-503-tracking.png
- round-503-shipping-calculator.png
- round-503-hs-code.png
- round-503-postal-code.png
- round-503-exchange-rate.png
- round-503-starter.png
- round-503-memo.png
- round-503-resources.png
- round-503-guides.png
- round-503-api-stats.png
- round-503-rate-limit.png
