# Soak Test Progress

**Started:** 2026-06-10T10:05:13.378Z | **Last:** 2026-06-10T10:06:11.631Z
**Progress:** 3/3 | **Pass:** 0 | **Fail:** 3

## Issues
- iter #1: `/tools/quote (HTTP)` — Expected redirect status 3xx, got 200
- iter #1: `/tools/quote-sheet (HTTP)` — Expected redirect status 3xx, got 200
- iter #1: `/workspace (HTTP)` — Expected redirect status 3xx, got 200
- iter #1: `/admin (HTTP)` — Expected redirect status 3xx, got 200
- iter #2: `/tools/quote (HTTP)` — Expected redirect status 3xx, got 200
- iter #2: `/tools/quote-sheet (HTTP)` — Expected redirect status 3xx, got 200
- iter #2: `/workspace (HTTP)` — Expected redirect status 3xx, got 200
- iter #2: `/admin (HTTP)` — Expected redirect status 3xx, got 200
- iter #2: `/tools/documents/quotation` — Missing h1 title
- iter #3: `/tools/quote (HTTP)` — Expected redirect status 3xx, got 200
- iter #3: `/tools/quote-sheet (HTTP)` — Expected redirect status 3xx, got 200
- iter #3: `/workspace (HTTP)` — Expected redirect status 3xx, got 200
- iter #3: `/admin (HTTP)` — Expected redirect status 3xx, got 200

## HTTP Redirect Checks
- `/tools/quote`: httpStatus=200, location=N/A, pass=false
- `/tools/quote-sheet`: httpStatus=200, location=N/A, pass=false
- `/workspace`: httpStatus=200, location=N/A, pass=false
- `/admin`: httpStatus=200, location=N/A, pass=false

## Slowest
- `/`: avg 2575ms, max 2932ms
- `/admin`: avg 823ms, max 905ms
- `/tools/quote`: avg 658ms, max 736ms
- `/tools/quote-sheet`: avg 622ms, max 647ms
- `/workspace`: avg 579ms, max 729ms
- `/tools`: avg 519ms, max 672ms
- `/login`: avg 450ms, max 648ms
- `/checklists/toronto-rental-viewing-checklist`: avg 364ms, max 497ms
- `/tools/documents/quotation`: avg 351ms, max 366ms
- `/checklists/student-first-abroad-packing-checklist`: avg 350ms, max 394ms

## Sitemap
- pass=true, drafts=none

## Top 404 URLs
None

## Top CORS URLs
None

## AdSlot
Known non-blocking (no-fill) — not P0/P1.

## Admin
SKIPPED: SOAK_ADMIN_EMAIL/SOAK_ADMIN_PASSWORD not set
