# jueshi-audit — Full Audit Report

**Date:** 2026-06-23T14:31:53.415Z
**Target:** https://i.jueshi.net
**Mode:** full (with credentials)
**Verdict:** STAGING_AUDIT_FOUND_ISSUES

---

## Summary

| Metric | Count |
|--------|-------|
| Total | 43 |
| PASS | 31 |
| FAIL | 12 |
| BLOCKED | 0 |
| NOT_RUN | 0 |
| P0 failures | 0 |
| P1 failures | 3 |
| Bugs | 12 |

## All Test Results

| ID | Module | Priority | Status | Notes |
|-----|--------|----------|--------|-------|
| P1-001 | Postal Code | P1 | FAIL | No country selector found |
| P1-002 | Postal Code | P1 | PASS | CA ZZZ999 no_match correct |
| P1-003 | Postal Code | P1 | PASS | US 90210 Beverly Hills result |
| P1-004 | Postal Code | P1 | PASS | JP 100-0000 Tokyo result |
| P1-005 | Postal Code | P1 | PASS | No map link (acceptable for no_match or non-exact) |
| P1-009 | Country Page | P1 | PASS | Hero/H1 found |
| P1-010 | Country Page | P1 | PASS | Time card found |
| P1-011 | Country Page | P1 | PASS | 44 quick links found |
| P1-012 | Country Page | P1 | PASS | 0 tool-related elements |
| P1-013 | Country Page | P1 | PASS | BBS link found |
| P1-014 | Country Page | P1 | PASS | FAQ section found |
| P1-015 | Country Page | P1 | FAIL | No disclaimer |
| P1-016 | Country Page | P1 | PASS | Layout check (2-col or single acceptable) |
| P1-017 | Country Page | P1 | PASS | US page: 200 |
| P1-017 | BBS | P1 | PASS | 10 post links found |
| P1-018 | BBS | P1 | PASS | Post detail loaded (9498 chars) |
| P1-019 | BBS | P1 | PASS | Unauthenticated /bbs/new redirected to login |
| P1-020 | Login | P1 | FAIL | Login failed |
| P2-001 | Admin Login | P2 | FAIL | Admin login failed |
| P2-MOBILE-iphone12- | Mobile | P2 | PASS | iphone12 /: scrollW=390 clientW=390 OK |
| P2-MOBILE-iphone12-destinations-canada | Mobile | P2 | PASS | iphone12 /destinations/canada: scrollW=390 clientW=390 OK |
| P2-MOBILE-iphone12-tools-postal-code | Mobile | P2 | PASS | iphone12 /tools/postal-code: scrollW=390 clientW=390 OK |
| P2-MOBILE-iphone12-bbs | Mobile | P2 | PASS | iphone12 /bbs: scrollW=390 clientW=390 OK |
| P2-MOBILE-android360- | Mobile | P2 | PASS | android360 /: scrollW=360 clientW=360 OK |
| P2-MOBILE-android360-destinations-canada | Mobile | P2 | PASS | android360 /destinations/canada: scrollW=360 clientW=360 OK |
| P2-MOBILE-android360-tools-postal-code | Mobile | P2 | PASS | android360 /tools/postal-code: scrollW=360 clientW=360 OK |
| P2-MOBILE-android360-bbs | Mobile | P2 | PASS | android360 /bbs: scrollW=360 clientW=360 OK |
| P2-MOBILE-ipad- | Mobile | P2 | PASS | ipad /: scrollW=768 clientW=768 OK |
| P2-MOBILE-ipad-destinations-canada | Mobile | P2 | PASS | ipad /destinations/canada: scrollW=768 clientW=768 OK |
| P2-MOBILE-ipad-tools-postal-code | Mobile | P2 | PASS | ipad /tools/postal-code: scrollW=768 clientW=768 OK |
| P2-MOBILE-ipad-bbs | Mobile | P2 | PASS | ipad /bbs: scrollW=768 clientW=768 OK |
| P2-MOBILE-desktop- | Mobile | P2 | FAIL | desktop /: scrollW=1329 clientW=1280 OVERFLOW! |
| P2-MOBILE-desktop-destinations-canada | Mobile | P2 | FAIL | desktop /destinations/canada: scrollW=1329 clientW=1280 OVERFLOW! |
| P2-MOBILE-desktop-tools-postal-code | Mobile | P2 | FAIL | desktop /tools/postal-code: scrollW=1329 clientW=1280 OVERFLOW! |
| P2-MOBILE-desktop-bbs | Mobile | P2 | FAIL | desktop /bbs: scrollW=1329 clientW=1280 OVERFLOW! |
| P3-001 | SEO | P3 | FAIL | page.getAttribute: Timeout 30000ms exceeded.
Call log:
  - waiting for locator(' |
| P3-002 | SEO | P3 | PASS | title=Y desc=Y canonical=Y og=Y robots=index,follow |
| P3-003 | SEO | P3 | FAIL | page.getAttribute: Timeout 30000ms exceeded.
Call log:
  - waiting for locator(' |
| P3-004 | SEO | P3 | PASS | X-Robots-Tag: noindex, nofollow |
| P3-005 | Security | P3 | PASS | Unauth /admin → /login?reason=no-session |
| P3-006 | Security | P3 | PASS | XSS input not executed (escaped) |
| P3-007 | Security | P3 | FAIL | 500 error on SQL injection input |
| P3-008 | Ops | P3 | FAIL | /api/health: 401 |

## Production Release Gate

| Check | Result |
|-------|--------|
| P0 failures | 0 ✅ |
| P1 failures | 3 ❌ |
| Allowed to proceed | NO |

## Safety Checklist

| Check | Result |
|-------|--------|
| prisma db push | NO ✅ |
| destructive SQL | NO ✅ |
| production modified | NO ✅ |
| secrets in output | NO ✅ |
| 9833416@qq.com modified | NO ✅ |

## Evidence

- Screenshots: 56 files in artifacts/screenshots/
- Console logs: 12 files in artifacts/console/
- Network logs: 12 files in artifacts/network/
