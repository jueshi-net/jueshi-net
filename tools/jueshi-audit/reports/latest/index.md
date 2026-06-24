# jueshi-audit — Full Audit Report (v3 stabilized)

**Date:** 2026-06-24T16:59:46.904Z
**Target:** https://i.jueshi.net
**Mode:** v3-stabilized (NextAuth CSRF API + storageState)
**Verdict:** STAGING_AUDIT_FOUND_ISSUES

---

## Summary

| Metric | Count |
|--------|-------|
| Total | 50 |
| PASS | 47 |
| FAIL | 1 |
| BLOCKED | 2 |
| NOT_RUN | 0 |
| P0 fail | 0 |
| P1 fail | 0 |
| P1 blocked | 2 |
| Bugs | 1 |

## All Results

| ID | Module | Priority | Status | Notes | Type |
|-----|--------|----------|--------|-------|------|
| P0-001 | Public Page | P0 | PASS | /: 200 |  |
| P0-002 | Public Page | P0 | PASS | /destinations/canada: 200 |  |
| P0-003 | Public Page | P0 | PASS | /tools/postal-code: 200 |  |
| P0-004 | Public Page | P0 | PASS | /bbs: 200 |  |
| P0-005 | Public Page | P0 | PASS | /login: 200 |  |
| P0-006 | Security | P0 | PASS | Unauth /admin → /login?reason=no-session |  |
| P0-007 | Redirect | P0 | PASS | /destinations/usa → /destinations/united-states |  |
| P0-008 | Redirect | P0 | PASS | /countries → /destinations |  |
| P0-009 | Redirect | P0 | PASS | /community → /bbs |  |
| P0-013 | SEO | P0 | PASS | X-Robots-Tag: noindex, nofollow |  |
| P1-001 | Login | P1 | BLOCKED | BLOCKED_NO_CREDENTIAL | BLOCKED_NO_CREDENTIAL |
| P1-002 | Login | P1 | BLOCKED | BLOCKED_NO_CREDENTIAL | BLOCKED_NO_CREDENTIAL |
| P1-003 | Country Page | P1 | PASS | Canada page loaded |  |
| P1-004 | Country Page | P1 | PASS | Disclaimer: found |  |
| P1-005 | Country Page | P1 | PASS | BBS link check |  |
| P1-006 | Country Page | P1 | PASS | FAQ found |  |
| P1-007 | BBS | P1 | PASS | 13 posts |  |
| P1-008 | BBS | P1 | PASS | /bbs/new: redirected to login |  |
| P1-POSTAL-MAC-WEBKIT-COUNTRY | Postal/WebKit | P1 | PASS | WebKit: combobox=1 selector=1 dropdown=true |  |
| P1-POSTAL-MAC-WEBKIT-CA | Postal/WebKit | P1 | PASS | WebKit: Canada selected |  |
| P1-POSTAL-MAC-WEBKIT-US | Postal/WebKit | P1 | PASS | WebKit: United States selected |  |
| P1-POSTAL-MAC-WEBKIT-JP | Postal/WebKit | P1 | PASS | WebKit: Japan selected |  |
| P2-MOBILE-iphone12- | Mobile | P2 | PASS | iphone12 /: scrollW=390 clientW=390 OK |  |
| P2-MOBILE-iphone12-destinations-canada | Mobile | P2 | PASS | iphone12 /destinations/canada: scrollW=390 clientW=390 OK |  |
| P2-MOBILE-iphone12-tools-postal-code | Mobile | P2 | PASS | iphone12 /tools/postal-code: scrollW=390 clientW=390 OK |  |
| P2-MOBILE-iphone12-bbs | Mobile | P2 | PASS | iphone12 /bbs: scrollW=390 clientW=390 OK |  |
| P2-MOBILE-android360- | Mobile | P2 | PASS | android360 /: scrollW=360 clientW=360 OK |  |
| P2-MOBILE-android360-destinations-canada | Mobile | P2 | PASS | android360 /destinations/canada: scrollW=360 clientW=360 OK |  |
| P2-MOBILE-android360-tools-postal-code | Mobile | P2 | PASS | android360 /tools/postal-code: scrollW=360 clientW=360 OK |  |
| P2-MOBILE-android360-bbs | Mobile | P2 | PASS | android360 /bbs: scrollW=360 clientW=360 OK |  |
| P2-MOBILE-ipad- | Mobile | P2 | PASS | ipad /: scrollW=768 clientW=768 OK |  |
| P2-MOBILE-ipad-destinations-canada | Mobile | P2 | PASS | ipad /destinations/canada: scrollW=768 clientW=768 OK |  |
| P2-MOBILE-ipad-tools-postal-code | Mobile | P2 | PASS | ipad /tools/postal-code: scrollW=768 clientW=768 OK |  |
| P2-MOBILE-ipad-bbs | Mobile | P2 | PASS | ipad /bbs: scrollW=768 clientW=768 OK |  |
| P2-MOBILE-desktop- | Mobile | P2 | PASS | desktop /: scrollW=1280 clientW=1280 OK |  |
| P2-MOBILE-desktop-destinations-canada | Mobile | P2 | PASS | desktop /destinations/canada: scrollW=1280 clientW=1280 OK |  |
| P2-MOBILE-desktop-tools-postal-code | Mobile | P2 | PASS | desktop /tools/postal-code: scrollW=1280 clientW=1280 OK |  |
| P2-MOBILE-desktop-bbs | Mobile | P2 | PASS | desktop /bbs: scrollW=1280 clientW=1280 OK |  |
| P3-001 | SEO | P3 | PASS | title=Y desc=Y canonical=N og=Y robots=none http=200 |  |
| P3-002 | SEO | P3 | PASS | title=Y desc=Y canonical=Y og=Y robots=index,follow http=200 |  |
| P3-003 | SEO | P3 | PASS | title=Y desc=Y canonical=Y og=Y robots=none http=200 |  |
| P3-004 | SEO | P3 | PASS | X-Robots-Tag: noindex, nofollow |  |
| P3-005 | Security | P3 | PASS | Unauth /admin → /login?reason=no-session |  |
| P3-006 | Security | P3 | PASS | XSS not executed (React auto-escapes) |  |
| P3-007 | Security | P3 | PASS | SQLi input returns 200 with empty results (Prisma parameterized) |  |
| P3-008 | Ops | P3 | PASS | /api/health: 401 (design behavior) | DESIGN_BEHAVIOR |
| P3-009 | ResourcesV2 | P3 | PASS | /resources-v2 status=200 |  |
| P3-010 | ResourcesV2 | P3 | PASS | Scenario cards: found |  |
| P3-011 | ResourcesV2 | P3 | FAIL | No server errors: false |  |
| P3-012 | ResourcesV2 | P3 | PASS | /resources (old) status=200 |  |

## Release Gate

| Check | Result |
|-------|--------|
| P0 fail | 0 ✅ |
| P1 fail | 0 ✅ |
| P1 blocked | 2 ⚠️ |
| Allowed to apply for OPS | NO |

## Safety Checklist

| Check | Result |
|-------|--------|
| prisma db push | NO ✅ |
| destructive SQL | NO ✅ |
| production modified | NO ✅ |
| secrets committed | NO ✅ |
| cookie/session committed | NO ✅ |
| 9833416@qq.com modified | NO ✅ |

## Evidence

- Screenshots: 219 files in artifacts/screenshots/
- Storage states: 2 files (NOT committed to git)
