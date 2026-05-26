# E2E Browser Test Report — Round 2

**Time**: 2026-05-09T23:31:33.048Z
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
| Failed Requests | 513 |
| Analytics Requests | 21 |

## Page Results

- **home**: passed (2026-05-09T23:30:57.049Z)
- **tracking**: passed (2026-05-09T23:30:58.893Z)
- **shipping-calculator**: passed (2026-05-09T23:30:59.850Z)
- **hs-code**: passed (2026-05-09T23:31:06.363Z)
- **postal-code**: passed (2026-05-09T23:31:11.034Z)
- **exchange-rate**: passed (2026-05-09T23:31:14.760Z)
- **memo**: passed (2026-05-09T23:31:18.087Z)
- **resources**: passed (2026-05-09T23:31:22.787Z)
- **guides**: passed (2026-05-09T23:31:28.627Z)
- **api-stats**: 403 (2026-05-09T23:31:28.640Z)
- **rate-limit**: passed (2026-05-09T23:31:33.014Z)

## Performance Timings

- home-load: 85ms
- home-click-物流追踪: 568ms
- home-click-运费/CBM: 527ms
- home-click-HS编码: 518ms
- home-click-邮编地址: 522ms
- home-click-汇率查询: 525ms
- home-click-工作便签: 522ms
- tracking-load: 43ms
- tracking-parse: 227ms
- tracking-copy-one: 223ms
- tracking-17track: 232ms
- shipping-load: 91ms
- shipping-calc: 629ms
- hs-load: 151ms
- postal-load: 45ms
- postal-validate-CA: 227ms
- postal-validate-US: 233ms
- postal-validate-GB: 221ms
- postal-validate-AU: 218ms
- postal-validate-NZ: 218ms
- exchange-load: 60ms
- exchange-convert: 222ms
- memo-load: 120ms
- memo-add: 119ms
- memo-export: 128ms
- resources-load: 38ms
- guides-load: 1751ms

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

- round-2-home.png
- round-2-tracking.png
- round-2-shipping-calculator.png
- round-2-hs-code.png
- round-2-postal-code.png
- round-2-exchange-rate.png
- round-2-memo.png
- round-2-resources.png
- round-2-guides.png
- round-2-api-stats.png
- round-2-rate-limit.png
