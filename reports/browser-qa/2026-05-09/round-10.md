# E2E Browser Test Report — Round 10

**Time**: 2026-05-09T15:51:08.789Z
**URL**: http://localhost:3000
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
| Console Errors | 9 |
| Failed Requests | 30 |
| Analytics Requests | 22 |

## Page Results

- **home**: passed (2026-05-09T15:50:21.752Z)
- **tracking**: passed (2026-05-09T15:50:24.177Z)
- **shipping-calculator**: passed (2026-05-09T15:50:25.373Z)
- **hs-code**: passed (2026-05-09T15:50:32.210Z)
- **postal-code**: passed (2026-05-09T15:50:37.460Z)
- **exchange-rate**: passed (2026-05-09T15:50:39.724Z)
- **memo**: passed (2026-05-09T15:50:52.852Z)
- **resources**: passed (2026-05-09T15:50:54.557Z)
- **guides**: passed (2026-05-09T15:51:00.858Z)
- **api-stats**: 200 (2026-05-09T15:51:02.218Z)
- **rate-limit**: passed (2026-05-09T15:51:08.754Z)

## Performance Timings

- home-load: 5094ms
- home-click-物流追踪: 1215ms
- home-click-运费/CBM: 26ms
- home-click-HS编码: 23ms
- home-click-邮编地址: 23ms
- home-click-汇率查询: 24ms
- home-click-工作便签: 22ms
- tracking-load: 157ms
- tracking-parse: 1150ms
- tracking-copy-one: 24ms
- tracking-17track: 51ms
- shipping-load: 201ms
- shipping-calc: 864ms
- hs-load: 479ms
- postal-load: 113ms
- postal-validate-CA: 1278ms
- postal-validate-US: 48ms
- postal-validate-GB: 44ms
- postal-validate-AU: 41ms
- postal-validate-NZ: 53ms
- exchange-load: 193ms
- exchange-convert: 919ms
- memo-load: 10089ms
- memo-add: 29ms
- memo-export: 26ms
- resources-load: 139ms
- guides-load: 2210ms

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

- round-10-home.png
- round-10-tracking.png
- round-10-shipping-calculator.png
- round-10-hs-code.png
- round-10-postal-code.png
- round-10-exchange-rate.png
- round-10-memo.png
- round-10-resources.png
- round-10-guides.png
- round-10-api-stats.png
- round-10-rate-limit.png
