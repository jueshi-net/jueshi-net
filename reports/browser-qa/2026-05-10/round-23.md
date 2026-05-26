# E2E Browser Test Report — Round 23

**Time**: 2026-05-10T04:46:36.718Z
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
| Failed Requests | 487 |
| Analytics Requests | 21 |

## Page Results

- **home**: passed (2026-05-10T04:46:00.631Z)
- **tracking**: passed (2026-05-10T04:46:02.422Z)
- **shipping-calculator**: passed (2026-05-10T04:46:03.434Z)
- **hs-code**: passed (2026-05-10T04:46:10.010Z)
- **postal-code**: passed (2026-05-10T04:46:14.710Z)
- **exchange-rate**: passed (2026-05-10T04:46:18.435Z)
- **memo**: passed (2026-05-10T04:46:21.735Z)
- **resources**: passed (2026-05-10T04:46:26.456Z)
- **guides**: passed (2026-05-10T04:46:32.232Z)
- **api-stats**: 403 (2026-05-10T04:46:32.245Z)
- **rate-limit**: passed (2026-05-10T04:46:36.685Z)

## Performance Timings

- home-load: 103ms
- home-click-物流追踪: 538ms
- home-click-运费/CBM: 520ms
- home-click-HS编码: 522ms
- home-click-邮编地址: 519ms
- home-click-汇率查询: 530ms
- home-click-工作便签: 520ms
- tracking-load: 46ms
- tracking-parse: 218ms
- tracking-copy-one: 222ms
- tracking-17track: 232ms
- shipping-load: 38ms
- shipping-calc: 693ms
- hs-load: 147ms
- postal-load: 48ms
- postal-validate-CA: 229ms
- postal-validate-US: 222ms
- postal-validate-GB: 220ms
- postal-validate-AU: 229ms
- postal-validate-NZ: 231ms
- exchange-load: 57ms
- exchange-convert: 224ms
- memo-load: 76ms
- memo-add: 123ms
- memo-export: 123ms
- resources-load: 34ms
- guides-load: 1696ms

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

- round-23-home.png
- round-23-tracking.png
- round-23-shipping-calculator.png
- round-23-hs-code.png
- round-23-postal-code.png
- round-23-exchange-rate.png
- round-23-memo.png
- round-23-resources.png
- round-23-guides.png
- round-23-api-stats.png
- round-23-rate-limit.png
