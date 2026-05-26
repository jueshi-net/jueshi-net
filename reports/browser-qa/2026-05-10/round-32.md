# E2E Browser Test Report — Round 32

**Time**: 2026-05-10T07:01:36.958Z
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
| Console Errors | 58 |
| Failed Requests | 482 |
| Analytics Requests | 21 |

## Page Results

- **home**: passed (2026-05-10T07:01:00.787Z)
- **tracking**: passed (2026-05-10T07:01:02.679Z)
- **shipping-calculator**: passed (2026-05-10T07:01:03.626Z)
- **hs-code**: passed (2026-05-10T07:01:10.085Z)
- **postal-code**: passed (2026-05-10T07:01:14.786Z)
- **exchange-rate**: passed (2026-05-10T07:01:18.530Z)
- **memo**: passed (2026-05-10T07:01:21.785Z)
- **resources**: passed (2026-05-10T07:01:26.508Z)
- **guides**: passed (2026-05-10T07:01:32.420Z)
- **api-stats**: 403 (2026-05-10T07:01:32.432Z)
- **rate-limit**: passed (2026-05-10T07:01:36.928Z)

## Performance Timings

- home-load: 89ms
- home-click-物流追踪: 532ms
- home-click-运费/CBM: 517ms
- home-click-HS编码: 521ms
- home-click-邮编地址: 528ms
- home-click-汇率查询: 525ms
- home-click-工作便签: 524ms
- tracking-load: 44ms
- tracking-parse: 223ms
- tracking-copy-one: 225ms
- tracking-17track: 243ms
- shipping-load: 91ms
- shipping-calc: 625ms
- hs-load: 153ms
- postal-load: 51ms
- postal-validate-CA: 231ms
- postal-validate-US: 233ms
- postal-validate-GB: 233ms
- postal-validate-AU: 222ms
- postal-validate-NZ: 224ms
- exchange-load: 56ms
- exchange-convert: 223ms
- memo-load: 76ms
- memo-add: 124ms
- memo-export: 124ms
- resources-load: 43ms
- guides-load: 1822ms

## P0 Issues

✅ None

## P1 Issues

✅ None

## P2 Issues

✅ None

## P3 Issues

✅ None

## Console Errors

- [home] Access to fetch at 'https://api.frankfurter.app/2026-04-10..2026-05-10?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [tracking] Access to fetch at 'https://api.frankfurter.app/2026-04-10..2026-05-10?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [shipping-calculator] Access to fetch at 'https://api.frankfurter.app/2026-04-10..2026-05-10?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [hs-code] Access to fetch at 'https://api.frankfurter.app/2026-04-10..2026-05-10?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [postal-code] Access to fetch at 'https://api.frankfurter.app/2026-04-10..2026-05-10?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [exchange-rate] Access to fetch at 'https://api.frankfurter.app/2026-04-10..2026-05-10?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [home] Failed to load resource: net::ERR_FAILED
- [tracking] Failed to load resource: net::ERR_FAILED
- [shipping-calculator] Failed to load resource: net::ERR_FAILED
- [hs-code] Failed to load resource: net::ERR_FAILED
- [postal-code] Failed to load resource: net::ERR_FAILED
- [exchange-rate] Failed to load resource: net::ERR_FAILED
- [home] Access to fetch at 'https://api.frankfurter.app/2026-04-10..2026-05-10?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [tracking] Access to fetch at 'https://api.frankfurter.app/2026-04-10..2026-05-10?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [shipping-calculator] Access to fetch at 'https://api.frankfurter.app/2026-04-10..2026-05-10?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [hs-code] Access to fetch at 'https://api.frankfurter.app/2026-04-10..2026-05-10?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [postal-code] Access to fetch at 'https://api.frankfurter.app/2026-04-10..2026-05-10?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [exchange-rate] Access to fetch at 'https://api.frankfurter.app/2026-04-10..2026-05-10?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [home] Failed to load resource: net::ERR_FAILED
- [tracking] Failed to load resource: net::ERR_FAILED
- [shipping-calculator] Failed to load resource: net::ERR_FAILED
- [hs-code] Failed to load resource: net::ERR_FAILED
- [postal-code] Failed to load resource: net::ERR_FAILED
- [exchange-rate] Failed to load resource: net::ERR_FAILED
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

- round-32-home.png
- round-32-tracking.png
- round-32-shipping-calculator.png
- round-32-hs-code.png
- round-32-postal-code.png
- round-32-exchange-rate.png
- round-32-memo.png
- round-32-resources.png
- round-32-guides.png
- round-32-api-stats.png
- round-32-rate-limit.png
