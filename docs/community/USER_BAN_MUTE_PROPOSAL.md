# P4: User Ban/Mute Schema Proposal

## Status
**PROPOSAL ONLY — NOT EXECUTED**

Schema changes are forbidden for the Forum Agent. This document
proposes minimal schema additions for user restriction capabilities.

## Current State

The `User` model has:
- `role` — "admin" or "user" (no ban/mute state)
- No `banned`, `muted`, `suspended`, or `status` field
- No `bannedUntil` or `mutedUntil` field

The `UserCommunityProfile` model has:
- `isPublic` — visibility toggle
- No ban/mute fields

## Problem

Without ban/mute fields, the forum cannot:
1. Prevent banned users from posting or commenting
2. Prevent muted users from posting (but allow viewing)
3. Show ban/mute reason to the affected user
4. Time-limit restrictions (e.g. 7-day mute)

## Proposed Schema Changes

### Option A: Add fields to User model (preferred)

```prisma
model User {
  // ... existing fields ...
  
  // Forum restriction fields
  forumBanned     Boolean    @default(false) @map("forum_banned")
  forumMuted      Boolean    @default(false) @map("forum_muted")
  forumBannedUntil DateTime? @map("forum_banned_until")
  forumMutedUntil  DateTime? @map("forum_muted_until")
  forumBanReason   String?   @map("forum_ban_reason")
  forumMuteReason  String?   @map("forum_mute_reason")
}
```

### Option B: Add a ForumUserRestriction model

```prisma
model ForumUserRestriction {
  id          String   @id @default(cuid())
  userId      String   @unique @map("user_id")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  banned      Boolean  @default(false)
  muted       Boolean  @default(false)
  bannedUntil DateTime?
  mutedUntil  DateTime?
  banReason   String?
  muteReason  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("forum_user_restrictions")
}
```

## Enforcement Points

Once the schema is added, enforcement would be:

1. **Post creation** (`POST /api/forum/posts`): Check `forumBanned` or `forumMuted` → 403
2. **Comment creation** (`POST /api/forum/posts/[slug]/comments`): Check `forumBanned` or `forumMuted` → 403
3. **Like/Bookmark/Report**: Check `forumBanned` → 403
4. **Admin panel**: Show ban/mute controls in user management
5. **Frontend**: Show "您已被禁言/封禁" message with reason and expiry

## Current Workaround

Without schema changes, admins can:
- Use the existing `role` field (change to a restricted role)
- Use the post-level `hidden` status to hide individual content
- Use ModerationLog to track manual actions

This is insufficient for systematic user management.

## Recommendation

Option A (add fields to User model) is preferred because:
- Minimal migration (6 nullable/defaulted columns)
- No additional JOIN needed
- Simple boolean checks in API routes
- Consistent with existing `role` and `membershipTier` pattern

## Decision Required

Default Integrator must:
1. Review this proposal
2. Decide on Option A or B
3. Execute the Prisma migration
4. Notify Forum Agent to implement enforcement code
