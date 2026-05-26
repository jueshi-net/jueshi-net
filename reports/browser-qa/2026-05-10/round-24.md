# E2E Browser Test Report — Round 24

**Time**: 2026-05-10T05:01:37.123Z
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
| Failed Requests | 488 |
| Analytics Requests | 21 |

## Page Results

- **home**: passed (2026-05-10T05:01:00.602Z)
- **tracking**: passed (2026-05-10T05:01:02.394Z)
- **shipping-calculator**: passed (2026-05-10T05:01:03.427Z)
- **hs-code**: passed (2026-05-10T05:01:09.900Z)
- **postal-code**: passed (2026-05-10T05:01:14.584Z)
- **exchange-rate**: passed (2026-05-10T05:01:18.329Z)
- **memo**: passed (2026-05-10T05:01:21.616Z)
- **resources**: passed (2026-05-10T05:01:26.341Z)
- **guides**: passed (2026-05-10T05:01:32.277Z)
- **api-stats**: 403 (2026-05-10T05:01:32.288Z)
- **rate-limit**: passed (2026-05-10T05:01:37.093Z)

## Performance Timings

- home-load: 90ms
- home-click-物流追踪: 552ms
- home-click-运费/CBM: 522ms
- home-click-HS编码: 519ms
- home-click-邮编地址: 527ms
- home-click-汇率查询: 521ms
- home-click-工作便签: 529ms
- tracking-load: 89ms
- tracking-parse: 223ms
- tracking-copy-one: 220ms
- tracking-17track: 226ms
- shipping-load: 39ms
- shipping-calc: 699ms
- hs-load: 161ms
- postal-load: 50ms
- postal-validate-CA: 218ms
- postal-validate-US: 224ms
- postal-validate-GB: 219ms
- postal-validate-AU: 224ms
- postal-validate-NZ: 235ms
- exchange-load: 56ms
- exchange-convert: 223ms
- memo-load: 53ms
- memo-add: 121ms
- memo-export: 128ms
- resources-load: 38ms
- guides-load: 1846ms

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

- round-24-home.png
- round-24-tracking.png
- round-24-shipping-calculator.png
- round-24-hs-code.png
- round-24-postal-code.png
- round-24-exchange-rate.png
- round-24-memo.png
- round-24-resources.png
- round-24-guides.png
- round-24-api-stats.png
- round-24-rate-limit.png
