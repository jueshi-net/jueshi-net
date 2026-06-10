# Soak Test Progress

**Started:** 2026-06-10T10:11:37.285Z | **Last:** 2026-06-10T10:12:25.223Z
**Progress:** 3/3 | **Pass:** 3 | **Fail:** 0

## Issues
None.

## HTTP Redirect Checks
- `/tools/quote`: httpStatus=308, location=/tools/documents/quotation, pass=true
- `/tools/quote-sheet`: httpStatus=308, location=/tools/documents/quotation, pass=true
- `/workspace`: httpStatus=307, location=/login, pass=true
- `/admin`: httpStatus=307, location=/login?reason=no-session, pass=true

## Slowest
- `/`: avg 1854ms, max 1907ms
- `/tools/quote-sheet`: avg 864ms, max 1437ms
- `/tools/quote`: avg 672ms, max 954ms
- `/admin`: avg 561ms, max 620ms
- `/workspace`: avg 529ms, max 569ms
- `/login`: avg 370ms, max 387ms
- `/tools`: avg 357ms, max 420ms
- `/robots.txt`: avg 347ms, max 369ms
- `/checklists/toronto-rental-viewing-checklist`: avg 346ms, max 425ms
- `/sitemap.xml`: avg 331ms, max 489ms

## Sitemap
- pass=true, drafts=none

## Top 404 URLs
None

## Top CORS URLs
- https://bbs.jueshi.net/?_rsc=mb9ys (1 times)

## AdSlot
Known non-blocking (no-fill) — not P0/P1.

## Admin
SKIPPED: SOAK_ADMIN_EMAIL/SOAK_ADMIN_PASSWORD not set
