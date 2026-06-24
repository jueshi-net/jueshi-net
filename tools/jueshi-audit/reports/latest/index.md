# jueshi-audit — Full Audit Report (v3 stabilized)

**Date:** 2026-06-24T09:25:58.166Z
**Target:** https://i.jueshi.net
**Mode:** v3-stabilized (NextAuth CSRF API + storageState)
**Verdict:** STAGING_AUDIT_FOUND_ISSUES

---

## Summary

| Metric | Count |
|--------|-------|
| Total | 71 |
| PASS | 68 |
| FAIL | 3 |
| BLOCKED | 0 |
| NOT_RUN | 0 |
| P0 fail | 1 |
| P1 fail | 2 |
| P1 blocked | 0 |
| Bugs | 3 |

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
| P0-009 | Redirect | P0 | FAIL | /community → /community |  |
| P0-013 | SEO | P0 | PASS | X-Robots-Tag: noindex, nofollow |  |
| P1-001 | Login | P1 | PASS | User login success (test@jueshi.net) |  |
| P1-002 | Security | P1 | PASS | User denied admin access |  |
| P1-NAV-AVATAR-USER | Navigation | P1 | PASS | Avatar btn=BUTTON aria-expanded=false aria-haspopup=true menu=true |  |
| P1-NAV-AVATAR-WORKSPACE | Navigation | P1 | PASS | Workspace link in avatar menu: found |  |
| P1-NAV-AVATAR-PERMISSION | Navigation | P1 | PASS | Admin link for regular user: hidden (correct) |  |
| P2-001 | Admin Login | P2 | PASS | Admin login success (test-admin@local.test) |  |
| P2-002 | Admin | P2 | PASS | dashboard: 200, 36671 chars |  |
| P2-003 | Admin | P2 | PASS | community: 200, 34218 chars |  |
| P2-004 | Admin | P2 | PASS | posts: 200, 37592 chars |  |
| P2-005 | Admin | P2 | PASS | comments: 200, 34266 chars |  |
| P2-006 | Admin | P2 | PASS | flagged: 200, 33550 chars |  |
| P2-007 | Admin | P2 | PASS | badges: 200, 39031 chars |  |
| P1-NAV-AVATAR-ADMIN | Navigation | P1 | PASS | Admin avatar menu=true admin-link=true |  |
| P1-003 | Country Page | P1 | PASS | Canada page loaded |  |
| P1-004 | Country Page | P1 | FAIL | Disclaimer: missing |  |
| P1-005 | Country Page | P1 | PASS | BBS link check |  |
| P1-006 | Country Page | P1 | PASS | FAQ found |  |
| P1-007 | BBS | P1 | PASS | 13 posts |  |
| P1-008 | BBS | P1 | PASS | /bbs/new: redirected to login |  |
| P1-POSTAL-MAC-WEBKIT-COUNTRY | Postal/WebKit | P1 | PASS | WebKit: combobox=1 selector=1 dropdown=true |  |
| P1-POSTAL-MAC-WEBKIT-CA | Postal/WebKit | P1 | PASS | WebKit: Canada selected |  |
| P1-POSTAL-MAC-WEBKIT-US | Postal/WebKit | P1 | PASS | WebKit: United States selected |  |
| P1-POSTAL-MAC-WEBKIT-JP | Postal/WebKit | P1 | PASS | WebKit: Japan selected |  |
| P1-COMPANY-LINK-QUOTE | Company Linkage | P1 | PASS | Quote picker=true company="QS Test Company" |  |
| P1-COMPANY-LINK-EDIT | Company Linkage | P1 | FAIL | locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('butt |  |
| P1-COMPANY-LINK-INVOICE | Company Linkage | P1 | PASS | Invoice picker=true company="QS Test Company" |  |
| P1-COMPANY-LINK-CONSISTENCY | Company Linkage | P1 | PASS | Quote="QS Test Company" Invoice="QS Test Company" match=true |  |
| P1-COMPANY-LINK-EMPTY | Company Linkage | P1 | PASS | Profiles exist - empty state N/A |  |
| P1-MEMBER-NO-ROLE-MEMBER | Membership Linkage | P1 | PASS | isActiveMember=false based on memberUntil (not role), hasExpiry=false |  |
| P1-MEMBER-WORKSPACE-CONSISTENCY | Membership Linkage | P1 | PASS | Workspace shows member status: member |  |
| P1-MEMBER-COMPANY-ENTITLEMENT | Membership Linkage | P1 | PASS | Company profiles page loaded, logoUpload=true |  |
| P1-MEMBER-FREE-LIMIT | Membership Linkage | P1 | PASS | Member page shows limits/entitlements: true |  |
| P2-WORKSPACE-ACTIONS-DESKTOP | Workspace Layout | P2 | PASS | DESKTOP 1280px: grid=true cards=7/7 truncation=false overflow=false |  |
| P2-WORKSPACE-ACTIONS-NO-OVERFLOW | Workspace Layout | P2 | PASS | scrollW=1280 clientW=1280 overflow=false |  |
| P2-WORKSPACE-ACTIONS-MACBOOK | Workspace Layout | P2 | PASS | MACBOOK 1440px: grid=true cards=7/7 truncation=false overflow=false |  |
| P2-WORKSPACE-ACTIONS-TABLET | Workspace Layout | P2 | PASS | TABLET 768px: grid=true cards=7/7 truncation=false overflow=true |  |
| P2-WORKSPACE-ACTIONS-MOBILE | Workspace Layout | P2 | PASS | MOBILE 390px: grid=true cards=7/7 truncation=false overflow=true |  |
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
| P3-002 | SEO | P3 | PASS | title=Y desc=Y canonical=Y og=Y robots=none http=200 |  |
| P3-003 | SEO | P3 | PASS | title=Y desc=Y canonical=Y og=Y robots=none http=200 |  |
| P3-004 | SEO | P3 | PASS | X-Robots-Tag: noindex, nofollow |  |
| P3-005 | Security | P3 | PASS | Unauth /admin → /login?reason=no-session |  |
| P3-006 | Security | P3 | PASS | XSS not executed (React auto-escapes) |  |
| P3-007 | Security | P3 | PASS | SQLi input returns 200 with empty results (Prisma parameterized) |  |
| P3-008 | Ops | P3 | PASS | /api/health: 401 (design behavior) | DESIGN_BEHAVIOR |

## Release Gate

| Check | Result |
|-------|--------|
| P0 fail | 1 ❌ |
| P1 fail | 2 ❌ |
| P1 blocked | 0 ✅ |
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

- Screenshots: 94 files in artifacts/screenshots/
- Storage states: 2 files (NOT committed to git)
