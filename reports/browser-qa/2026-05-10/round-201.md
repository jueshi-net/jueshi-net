# E2E Browser Test Report — Round 201

**Time**: 2026-05-10T09:49:13.871Z
**URL**: http://localhost:3000
**Viewport**: iPhone 13 (390x844)
**Headless**: true

## Summary

| Metric | Value |
|--------|-------|
| Pages Tested | 5 |
| P0 (Critical) | 1 |
| P1 (Major) | 0 |
| P2 (Minor) | 0 |
| P3 (Cosmetic) | 0 |
| Console Errors | 0 |
| Failed Requests | 40 |
| Analytics Requests | 2 |

## Page Results

- **home**: passed (2026-05-10T09:48:25.695Z)
- **tracking**: passed (2026-05-10T09:48:27.503Z)
- **shipping-calculator**: passed (2026-05-10T09:48:28.565Z)
- **hs-code**: passed (2026-05-10T09:48:35.030Z)
- **postal-code**: passed (2026-05-10T09:48:39.723Z)

## Performance Timings

- home-load: 149ms
- home-click-物流追踪: 541ms
- home-click-运费/CBM: 519ms
- home-click-HS编码: 525ms
- home-click-邮编地址: 521ms
- home-click-汇率查询: 528ms
- home-click-工作便签: 523ms
- tracking-load: 91ms
- tracking-parse: 221ms
- tracking-copy-one: 223ms
- tracking-17track: 237ms
- shipping-load: 76ms
- shipping-calc: 729ms
- hs-load: 152ms
- postal-load: 44ms
- postal-validate-CA: 229ms
- postal-validate-US: 223ms
- postal-validate-GB: 232ms
- postal-validate-AU: 225ms
- postal-validate-NZ: 220ms
- exchange-load: 70ms
- exchange-convert: 218ms

## P0 Issues

- [runner] Round 201 crashed: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('button').filter({ hasText: /查看走势/ })


## P1 Issues

✅ None

## P2 Issues

✅ None

## P3 Issues

✅ None

## Console Errors

✅ None

## Analytics

- `tool_calculate` → `exchange-rate` (`convert_currency`)
- `tool_click` → `exchange-rate` (`view_history`)

## Screenshots

- round-201-home.png
- round-201-tracking.png
- round-201-shipping-calculator.png
- round-201-hs-code.png
- round-201-postal-code.png
