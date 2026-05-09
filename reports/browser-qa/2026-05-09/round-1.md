# E2E Browser Test Report — Round 1

**Time**: 2026-05-09T15:18:11.629Z
**URL**: http://localhost:3000
**Viewport**: iPhone 13 (390x844)
**Headless**: true

## Summary

| Metric | Value |
|--------|-------|
| Pages Tested | 6 |
| P0 (Critical) | 1 |
| P1 (Major) | 0 |
| P2 (Minor) | 1 |
| P3 (Cosmetic) | 0 |
| Console Errors | 0 |
| Failed Requests | 48 |
| Analytics Requests | 0 |

## Page Results

- **home**: passed (2026-05-09T15:17:46.931Z)
- **tracking**: passed (2026-05-09T15:17:49.295Z)
- **shipping-calculator**: passed (2026-05-09T15:17:50.329Z)
- **hs-code**: passed (2026-05-09T15:17:54.794Z)
- **postal-code**: passed (2026-05-09T15:17:59.504Z)
- **exchange-rate**: passed (2026-05-09T15:18:01.172Z)

## Performance Timings

- home-load: 95ms
- home-click-物流追踪: 1518ms
- home-click-运费/CBM: 27ms
- home-click-HS编码: 16ms
- home-click-邮编地址: 19ms
- home-click-汇率查询: 25ms
- home-click-工作便签: 20ms
- tracking-load: 93ms
- tracking-parse: 1696ms
- tracking-copy-one: 21ms
- tracking-17track: 26ms
- shipping-load: 40ms
- shipping-calc: 641ms
- hs-load: 160ms
- postal-load: 49ms
- postal-validate-CA: 1106ms
- postal-validate-US: 16ms
- postal-validate-GB: 23ms
- postal-validate-AU: 22ms
- postal-validate-NZ: 18ms
- exchange-load: 41ms
- exchange-convert: 745ms
- memo-load: 10020ms

## P0 Issues

- [runner] Round 1 crashed: c is not defined

## P1 Issues

✅ None

## P2 Issues

- [tracking] 未检测到 tracking 埋点请求

## P3 Issues

✅ None

## Console Errors

✅ None

## Analytics

No analytics requests captured

## Screenshots

- round-1-home.png
- round-1-tracking.png
- round-1-shipping-calculator.png
- round-1-hs-code.png
- round-1-postal-code.png
- round-1-exchange-rate.png
