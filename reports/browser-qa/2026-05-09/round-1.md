# E2E Browser Test Report — Round 1

**Time**: 2026-05-09T23:16:33.146Z
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
| Failed Requests | 410 |
| Analytics Requests | 21 |

## Page Results

- **home**: passed (2026-05-09T23:15:57.141Z)
- **tracking**: passed (2026-05-09T23:15:58.949Z)
- **shipping-calculator**: passed (2026-05-09T23:15:59.961Z)
- **hs-code**: passed (2026-05-09T23:16:06.467Z)
- **postal-code**: passed (2026-05-09T23:16:11.157Z)
- **exchange-rate**: passed (2026-05-09T23:16:14.894Z)
- **memo**: passed (2026-05-09T23:16:18.187Z)
- **resources**: passed (2026-05-09T23:16:22.912Z)
- **guides**: passed (2026-05-09T23:16:28.791Z)
- **api-stats**: 403 (2026-05-09T23:16:28.803Z)
- **rate-limit**: passed (2026-05-09T23:16:33.105Z)

## Performance Timings

- home-load: 164ms
- home-click-物流追踪: 538ms
- home-click-运费/CBM: 518ms
- home-click-HS编码: 520ms
- home-click-邮编地址: 521ms
- home-click-汇率查询: 524ms
- home-click-工作便签: 518ms
- tracking-load: 46ms
- tracking-parse: 225ms
- tracking-copy-one: 226ms
- tracking-17track: 237ms
- shipping-load: 36ms
- shipping-calc: 685ms
- hs-load: 145ms
- postal-load: 45ms
- postal-validate-CA: 233ms
- postal-validate-US: 232ms
- postal-validate-GB: 224ms
- postal-validate-AU: 220ms
- postal-validate-NZ: 230ms
- exchange-load: 87ms
- exchange-convert: 224ms
- memo-load: 75ms
- memo-add: 126ms
- memo-export: 128ms
- resources-load: 36ms
- guides-load: 1797ms

## P0 Issues

✅ None

## P1 Issues

✅ None

## P2 Issues

✅ None

## P3 Issues

✅ None

## Console Errors

- [home] Access to fetch at 'https://api.frankfurter.app/2026-04-09..2026-05-09?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [tracking] Access to fetch at 'https://api.frankfurter.app/2026-04-09..2026-05-09?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [shipping-calculator] Access to fetch at 'https://api.frankfurter.app/2026-04-09..2026-05-09?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [hs-code] Access to fetch at 'https://api.frankfurter.app/2026-04-09..2026-05-09?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [postal-code] Access to fetch at 'https://api.frankfurter.app/2026-04-09..2026-05-09?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [exchange-rate] Access to fetch at 'https://api.frankfurter.app/2026-04-09..2026-05-09?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [home] Failed to load resource: net::ERR_FAILED
- [tracking] Failed to load resource: net::ERR_FAILED
- [shipping-calculator] Failed to load resource: net::ERR_FAILED
- [hs-code] Failed to load resource: net::ERR_FAILED
- [postal-code] Failed to load resource: net::ERR_FAILED
- [exchange-rate] Failed to load resource: net::ERR_FAILED
- [home] Access to fetch at 'https://api.frankfurter.app/2026-04-09..2026-05-09?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [tracking] Access to fetch at 'https://api.frankfurter.app/2026-04-09..2026-05-09?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [shipping-calculator] Access to fetch at 'https://api.frankfurter.app/2026-04-09..2026-05-09?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [hs-code] Access to fetch at 'https://api.frankfurter.app/2026-04-09..2026-05-09?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [postal-code] Access to fetch at 'https://api.frankfurter.app/2026-04-09..2026-05-09?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- [exchange-rate] Access to fetch at 'https://api.frankfurter.app/2026-04-09..2026-05-09?from=EUR&to=USD,CNY' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
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

- round-1-home.png
- round-1-tracking.png
- round-1-shipping-calculator.png
- round-1-hs-code.png
- round-1-postal-code.png
- round-1-exchange-rate.png
- round-1-memo.png
- round-1-resources.png
- round-1-guides.png
- round-1-api-stats.png
- round-1-rate-limit.png
