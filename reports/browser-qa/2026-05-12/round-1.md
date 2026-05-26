# E2E Browser Test Report — Round 1

**Time**: 2026-05-12T01:12:55.916Z
**URL**: http://localhost:3000
**Viewport**: iPhone 13 (390x844)
**Headless**: true

## Summary

| Metric | Value |
|--------|-------|
| Pages Tested | 1 |
| P0 (Critical) | 1 |
| P1 (Major) | 5 |
| P2 (Minor) | 0 |
| P3 (Cosmetic) | 0 |
| Console Errors | 10 |
| Failed Requests | 10 |
| Analytics Requests | 0 |

## Page Results

- **home**: passed (2026-05-12T01:12:15.782Z)

## Performance Timings

- home-load: 116ms
- home-click-物流追踪: 584ms
- tracking-load: 10029ms

## P0 Issues

- [runner] Round 1 crashed: page.fill: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('textarea')


## P1 Issues

- [home] 热门工具「运费/CBM」入口不存在: /tools/shipping-calculator
- [home] 热门工具「HS编码」入口不存在: /tools/hs-code
- [home] 热门工具「邮编地址」入口不存在: /tools/postal-code
- [home] 热门工具「汇率查询」入口不存在: /tools/exchange-rate
- [home] 热门工具「工作便签」入口不存在: /tools/memo

## P2 Issues

✅ None

## P3 Issues

✅ None

## Console Errors

- [home] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
- [home] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
- [home] Failed to load resource: the server responded with a status of 404 (Not Found)
- [home] Failed to load resource: the server responded with a status of 404 (Not Found)
- [home] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
- [home] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
- [home] Failed to load resource: the server responded with a status of 404 (Not Found)
- [tracking] Failed to load resource: the server responded with a status of 404 (Not Found)
- [home] Failed to load resource: the server responded with a status of 404 (Not Found)
- [tracking] Failed to load resource: the server responded with a status of 404 (Not Found)

## Analytics

No analytics requests captured

## Screenshots

- round-1-home.png
