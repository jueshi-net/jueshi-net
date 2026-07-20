# Service Provider Module — Data Model Proposal (Round 1)

> **Status:** PROPOSED — not yet migrated. Awaiting approval.
> **MIGRATION_REQUIRED:** true
> **Date:** 2026-07-18

## 1. Existing Reusable Models

| Model | Reuse? | Notes |
|-------|--------|-------|
| `User` | ✅ | `role`, `membershipTier`, `points`, `growthValue`, `levelKey`, `badges`, `honorScore`, `image`, `name`, `email` — full identity. Used as `ownerUserId` FK. |
| `UserLevel` | ✅ | lv1–lv5 level system. Reused for provider owner's level display. |
| `UserBadge` / `UserBadgeAward` | ✅ | Badge system. Reused for provider owner's badge display. |
| `EventLog` | ✅ | Generic event log (`eventType`, `action`, `path`, `userId`, `metadata` JSON). Reused for event contract audit trail. |
| `AuditLog` | ✅ | Audit trail (`userId`, `action`, `entity`, `entityId`, `details`). Reused for admin actions (approve/reject/verify). |
| `UserCompanyProfile` | ⚠️ Partial | Has `companyName`, `contactName`, `phone`, `email`, `website`, `address`, `logoDataUrl`. BUT it's tied to document generation, not a public directory. **Do not overload** — create a separate `ServiceProvider` model. |
| `Category` | ❌ | Existing `Category` is for `LinkItem` (bookmark links), not services. Has hierarchy but wrong domain. |
| `Favorite` / `UserFavorite` | ⚠️ Partial | `UserFavorite` is generic (`resourceType`, `resourceUrl`). Could reuse for provider favorites, but lacks `providerId` FK for efficient queries. |
| `DestinationService` | ❌ | Static catalog entries tied to `Destination` (country pages). NOT provider-owned. Wrong abstraction. |
| `PointLedger` | ✅ | Points ledger. Reused if inquiry actions award points. |
| `GrowthLog` | ✅ | Growth log. Reused if inquiry actions award growth value. |

## 2. Existing Reusable Services

| Service | Path | Reuse? |
|---------|------|--------|
| `auth()` | `@/lib/auth` | ✅ NextAuth session — use for userId/role |
| `requireAdmin()` | `@/lib/auth-guard` | ✅ Admin guard (returns NextResponse, not throw) |
| `getUserCommunityInfo()` | `@/lib/honor-helpers` | ✅ User identity + level + badges |
| Platform Kernel | `@/platform` | ✅ Module/flag/capability/block/action/event registries (this round) |

## 3. Duplicate Model Risks

| Risk | Mitigation |
|------|------------|
| Creating a second `Organization`/`Business` table that overlaps `UserCompanyProfile` | `UserCompanyProfile` is for document generation; `ServiceProvider` is for public directory + inquiry. Different lifecycle. Keep separate. |
| Creating a second `Category` table | Use a dedicated `ServiceCategory` table (backend-configurable). Do NOT reuse `Category` (link domain). |
| Creating a second `Favorite` table | Reuse `UserFavorite` with `resourceType: "provider"` OR create `ProviderFavorite` for efficient FK queries. Decision: create `ProviderFavorite` (cleaner queries, provider-scoped). |
| Creating a second `Review` system | `ToolReview` is for tools. `ForumComment` is for posts. Create `ProviderReview` for provider reviews. |

## 4. PROPOSED_NEW_MODELS

### 4.1 ServiceProvider (服务商主体)

```prisma
model ServiceProvider {
  id                 String   @id @default(cuid())
  ownerUserId        String   @map("owner_user_id")
  owner              User     @relation(fields: [ownerUserId], references: [id], onDelete: Cascade)
  providerType       String   @map("provider_type") // organization | professional | official
  displayName        String   @map("display_name")
  slug               String   @unique
  handle             String?  @unique @map("handle") // for /professional/[handle]
  logoUrl            String?  @map("logo_url")
  coverUrl           String?  @map("cover_url")
  description        String?  @db.Text
  languages          String[] @default([])
  countries          String[] @default([])
  cities             String[] @default([])
  serviceAreas       String[] @default([]) @map("service_areas")
  contactPreference  String   @default("inquiry") @map("contact_preference") // inquiry | email | phone | website
  status             String   @default("draft") // draft | pending | published | suspended | rejected
  verificationStatus String   @default("unverified") @map("verification_status") // unverified | pending | verified | rejected
  claimedAt          DateTime? @map("claimed_at")
  submittedAt        DateTime? @map("submitted_at")
  approvedAt         DateTime? @map("approved_at")
  approvedBy         String?  @map("approved_by")
  rejectionReason    String?  @map("rejection_reason") @db.Text
  sortOrder          Int      @default(0) @map("sort_order")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @default(now()) @updatedAt @map("updated_at")

  services           Service[]
  verifications      ProviderVerification[]
  inquiries          ProviderInquiry[]
  favorites          ProviderFavorite[]
  reports            ProviderReport[]

  @@index([ownerUserId])
  @@index([providerType])
  @@index([status])
  @@index([verificationStatus])
  @@map("service_providers")
}
```

### 4.2 Service (服务项目)

```prisma
model Service {
  id              String   @id @default(cuid())
  providerId      String   @map("provider_id")
  provider        ServiceProvider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  categoryId      String   @map("category_id")
  category        ServiceCategory @relation(fields: [categoryId], references: [id])
  title           String
  slug            String   @unique
  summary         String?  @db.Text
  description     String?  @db.Text
  serviceCountries String[] @default([]) @map("service_countries")
  serviceCities   String[] @default([]) @map("service_cities")
  languages       String[] @default([])
  priceMode       String   @default("quote") @map("price_mode") // quote | fixed | range | hourly
  priceFrom       Decimal? @map("price_from") @db.Decimal(10, 2)
  currency        String   @default("USD")
  deliveryMode    String?  @map("delivery_mode") // online | offline | hybrid
  status          String   @default("draft") // draft | pending | published | suspended
  sortOrder       Int      @default(0) @map("sort_order")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @default(now()) @updatedAt @map("updated_at")

  inquiries       ProviderInquiry[]

  @@index([providerId])
  @@index([categoryId])
  @@index([status])
  @@map("services")
}
```

### 4.3 ServiceCategory (服务分类)

```prisma
model ServiceCategory {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  icon        String?
  description String?
  sortOrder   Int      @default(0) @map("sort_order")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @default(now()) @updatedAt @map("updated_at")

  services    Service[]

  @@map("service_categories")
}
```

### 4.4 ProviderVerification (认证)

```prisma
model ProviderVerification {
  id          String   @id @default(cuid())
  providerId  String   @map("provider_id")
  provider    ServiceProvider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  type        String   // identity | business | professional | platform
  status      String   @default("pending") // pending | verified | rejected
  evidenceUrl String?  @map("evidence_url")
  verifiedBy  String?  @map("verified_by")
  verifiedAt  DateTime? @map("verified_at")
  notes       String?  @db.Text
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @default(now()) @updatedAt @map("updated_at")

  @@index([providerId])
  @@index([type])
  @@map("provider_verifications")
}
```

### 4.5 ProviderInquiry (咨询线索)

```prisma
model ProviderInquiry {
  id              String   @id @default(cuid())
  requesterUserId String   @map("requester_user_id")
  requester       User     @relation(fields: [requesterUserId], references: [id], onDelete: Cascade)
  providerId      String   @map("provider_id")
  provider        ServiceProvider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  serviceId       String?  @map("service_id")
  service         Service? @relation(fields: [serviceId], references: [id], onDelete: SetNull)
  sourceType      String   @default("direct") @map("source_type") // direct | tool | guide | country | block
  sourceId        String?  @map("source_id")
  message         String?  @db.Text
  status          String   @default("new") // new | contacted | resolved | closed
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @default(now()) @updatedAt @map("updated_at")

  @@index([requesterUserId])
  @@index([providerId])
  @@index([status])
  @@map("provider_inquiries")
}
```

### 4.6 ProviderFavorite (收藏)

```prisma
model ProviderFavorite {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  providerId  String   @map("provider_id")
  provider    ServiceProvider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now()) @map("created_at")

  @@unique([userId, providerId])
  @@index([userId])
  @@map("provider_favorites")
}
```

### 4.7 ProviderReport (举报)

```prisma
model ProviderReport {
  id           String   @id @default(cuid())
  reporterUserId String @map("reporter_user_id")
  reporter     User     @relation(fields: [reporterUserId], references: [id], onDelete: Cascade)
  providerId   String   @map("provider_id")
  provider     ServiceProvider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  category     String   // spam | fraud | inaccurate | inappropriate | other
  reason       String   @db.Text
  status       String   @default("pending") // pending | investigating | resolved | dismissed
  resolution   String?  @db.Text
  resolvedBy   String?  @map("resolved_by")
  resolvedAt   DateTime? @map("resolved_at")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @default(now()) @updatedAt @map("updated_at")

  @@index([providerId])
  @@index([status])
  @@map("provider_reports")
}
```

## 5. User Model Extension

The `User` model needs back-relations for the new tables:

```prisma
// Add to User model:
serviceProviders     ServiceProvider[]
providerInquiries    ProviderInquiry[]
providerFavorites    ProviderFavorite[]
providerReports      ProviderReport[]
```

## 6. Migration Plan

1. Create migration: `prisma migrate dev --name add_service_provider_module`
2. Output migration SQL for review
3. Check destructive: **NO** — all `CREATE TABLE`, no `DROP`/`ALTER COLUMN` on existing tables (only `ALTER TABLE users ADD` for relations, which Prisma handles)
4. Execute on **preview/staging DB only** (NOT production)
5. Backup before execution
6. `prisma validate` + `prisma generate`
7. **NOT executed in Round 1** — Round 1 is skeleton only

## 7. First-Seed Categories

```
国际物流与集运, 报关与清关, 外贸服务, 跨境电商服务, 支付与收款,
海外生活服务, 留学与教育, 法律与税务, 房产与租赁, 翻译与认证, IT与数字服务
```

These are backend-configurable via `ServiceCategory` table (NOT hardcoded in page components).
