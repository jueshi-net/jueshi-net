# E2E Browser Test Report — Round 100

**Time**: 2026-05-09T22:39:37.014Z
**URL**: http://localhost:3000
**Viewport**: iPhone 13 (390x844)
**Headless**: false

## Summary

| Metric | Value |
|--------|-------|
| Pages Tested | 11 |
| P0 (Critical) | 0 |
| P1 (Major) | 3 |
| P2 (Minor) | 0 |
| P3 (Cosmetic) | 0 |
| Console Errors | 18 |
| Failed Requests | 150 |
| Analytics Requests | 21 |

## Page Results

- **home**: passed (2026-05-09T22:38:37.183Z)
- **tracking**: passed (2026-05-09T22:38:39.906Z)
- **shipping-calculator**: passed (2026-05-09T22:38:42.308Z)
- **hs-code**: passed (2026-05-09T22:38:53.788Z)
- **postal-code**: passed (2026-05-09T22:39:03.462Z)
- **exchange-rate**: passed (2026-05-09T22:39:06.133Z)
- **memo**: passed (2026-05-09T22:39:21.405Z)
- **resources**: passed (2026-05-09T22:39:23.671Z)
- **guides**: passed (2026-05-09T22:39:32.297Z)
- **api-stats**: 403 (2026-05-09T22:39:32.521Z)
- **rate-limit**: passed (2026-05-09T22:39:36.898Z)

## Performance Timings

- home-load: 263ms
- home-click-物流追踪: 1428ms
- home-click-运费/CBM: 218ms
- home-click-HS编码: 217ms
- home-click-邮编地址: 217ms
- home-click-汇率查询: 231ms
- home-click-工作便签: 236ms
- tracking-load: 250ms
- tracking-parse: 763ms
- tracking-copy-one: 218ms
- tracking-17track: 247ms
- shipping-load: 231ms
- shipping-calc: 1814ms
- hs-load: 336ms
- postal-load: 249ms
- postal-validate-CA: 2860ms
- postal-validate-US: 262ms
- postal-validate-GB: 261ms
- postal-validate-AU: 272ms
- postal-validate-NZ: 283ms
- exchange-load: 251ms
- exchange-convert: 800ms
- memo-load: 10239ms
- memo-add: 290ms
- memo-export: 378ms
- resources-load: 244ms
- guides-load: 4010ms

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

- round-100-home.png
- round-100-tracking.png
- round-100-shipping-calculator.png
- round-100-hs-code.png
- round-100-postal-code.png
- round-100-exchange-rate.png
- round-100-memo.png
- round-100-resources.png
- round-100-guides.png
- round-100-api-stats.png
- round-100-rate-limit.png
