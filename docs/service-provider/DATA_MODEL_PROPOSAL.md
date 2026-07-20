# Service Provider Module — Data Model Proposal (Round 2A Updated)

> **Status:** MIGRATED on preview DB (xixiong_service_provider_preview)
> **MIGRATION_REQUIRED:** true (EXECUTED on preview only)
> **Date:** 2026-07-18 (Round 2A)

## Changes from Round 1

| Change | Reason |
|--------|--------|
| `Service` → `ProviderService` | Avoid conflicts with a generic "Service" concept |
| `ProviderMember` ADDED | Support team membership (OWNER/ADMIN/EDITOR/VIEWER) |
| `ProviderReview` DEFERRED | `PROVIDER_REVIEW_STATUS=DEFERRED` — not created this round |
| `DomainEventOutbox` ADDED | Persistent domain events for reliable async processing |
| `logoUrl` → `avatarUrl` | Per Round 2A spec field naming |

## UserCompanyProfile Boundary

**UserCompanyProfile** = private tool data for document/form prefill. NOT public, NOT part of yellow pages, does NOT carry review status.

**ServiceProvider** = public yellow-pages entity with independent review lifecycle, services, verifications, members, and inquiries.

`ServiceProvider` CANNOT directly modify `UserCompanyProfile`.

Allowed: `prefillProviderApplicationFromCompanyProfile()` — copies initial data ONE-WAY, no implicit bidirectional sync.

## Final Model List (9 models)

1. ServiceProvider
2. ProviderMember
3. ProviderService
4. ServiceCategory
5. ProviderVerification
6. ProviderInquiry
7. ProviderFavorite
8. ProviderReport
9. DomainEventOutbox

**NOT created:** ProviderReview (DEFERRED), Reputation system, Achievement system, Conversation/Message.

## Migration

- **Name:** 20260720145734_service_provider_modular_mvp
- **SQL:** 271 lines, all CREATE TABLE + CREATE INDEX + ADD CONSTRAINT (FK)
- **Destructive SQL:** NONE (no DROP, DELETE, TRUNCATE)
- **Executed on:** xixiong_service_provider_preview (isolated preview DB)
- **NOT executed on:** bxb_prod (staging), production DB

## State Machines

### ServiceProvider
```
DRAFT → PENDING_REVIEW → APPROVED → SUSPENDED
                  ↘ REJECTED → DRAFT (edit + resubmit)
```

### ProviderService
```
DRAFT → PENDING_REVIEW → PUBLISHED → SUSPENDED
```
