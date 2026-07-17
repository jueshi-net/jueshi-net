# Forum V1 P1 - Schema Change Proposals

## 1. DRAFT_CAPABILITY_AUDIT

### Current State
- ForumPost.status is a `String` field with values: `published`, `pending`, `rejected`, `hidden`, `deleted`
- No `draft` status exists
- `pending` is used for moderation review, not for user draft saving
- Users cannot save incomplete posts without submitting for review
- No auto-save capability exists

### Problem
- A user who starts writing a post but doesn't finish must either submit an incomplete post (goes to moderation) or lose all content
- There's no way to save a work-in-progress post
- pending cannot serve as draft because it triggers moderation workflow (admin sees it, notifications may be generated)

### Is `draft` Status Required?
**YES** - A dedicated `draft` status is needed because:
1. `pending` triggers moderation queue display (admin sees drafts they shouldn't)
2. `pending` may trigger rate limiting counts
3. Drafts should not count toward daily post limits
4. Drafts should not appear in any public or admin listing
5. Only the author should see drafts

### Is a New Model Required for Auto-Save?
**NO** - The existing `ForumPost` model can be extended:
- Add `draft` to the `status` string field (no enum change needed)
- Add `autosavedAt DateTime?` field for tracking last auto-save
- No new model needed; drafts are just ForumPosts with status="draft"

### Is `status` String Field Safe to Extend?
**YES** - The `status` field is a plain `String`, not a Prisma enum. Adding `"draft"` as a new value requires:
- No migration (string field accepts any value)
- Update filtering logic in all queries to exclude `draft` from public/admin listings
- Sitemap must exclude `draft` posts (already excludes non-published)
- Middleware/Proxy doesn't filter by status (page-level check)
- Moderation queue must filter: `status: { in: ["pending", "rejected", "hidden"] }` (already excludes draft)

### Proposed Schema Change
```prisma
model ForumPost {
  // ... existing fields ...
  status           String           @default("pending")  // published / pending / draft / rejected / hidden / deleted
  // No new fields needed - draft is just a status value
}
```

**Migration**: NOT REQUIRED - `status` is a string field, not an enum.
- All existing queries already filter by `status: "published"` for public access
- Admin moderation queue already filters specific statuses
- User content center can add a "drafts" tab by filtering `status: "draft"`

### Impact on Existing Systems
| System | Change Required | Details |
|--------|----------------|---------|
| Sitemap | None | Already only includes published posts |
| Proxy/Middleware | None | Page-level status check handles it |
| Moderation Queue | None | Already filters by pending/rejected/hidden |
| User Content Center | Add draft tab | Filter by `status: "draft"` |
| Rate Limiting | Exclude drafts | Don't count draft posts toward daily limit |
| Post Creation | Allow draft save | New API endpoint or status param |

---

## 2. COMMENT_REPLY_SCHEMA_PROPOSAL (楼中楼)

### Current State
- ForumComment has no `parentId` field
- All comments are flat (first-level only)
- No threaded/nested replies possible
- Comment section uses floor numbering (#2, #3, etc.)

### Problem
- Users cannot reply to specific comments
- No way to track conversation threads
- Cannot notify the parent comment author

### Minimal Implementation

#### Schema Change Required: YES
```prisma
model ForumComment {
  // ... existing fields ...
  parentId  String?  @map("parent_id")  // null = top-level, otherwise points to parent comment
  parent    ForumComment?  @relation("CommentReply", fields: [parentId], references: [id], onDelete: SetNull)
  replies   ForumComment[] @relation("CommentReply")
  
  @@index([parentId])
}
```

**Migration Required**: YES - Adding `parentId` column to `forum_comments` table.
```sql
ALTER TABLE forum_comments ADD COLUMN parent_id TEXT;
CREATE INDEX forum_comments_parent_id_idx ON forum_comments(parent_id);
```

#### Design Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Max Reply Depth | 2 levels (parent + child) | Simpler UI, avoids deep nesting complexity |
| Notification | Notify parent comment author | New type: `comment_reply` |
| Parent Deletion | `onDelete: SetNull` | Child becomes top-level if parent deleted |
| Pagination | Per-parent limit | Load top 3 replies per parent, "load more" button |
| Display | Indented under parent | 1-level indent with visual connector line |

#### Impact on Existing Systems
| System | Change Required |
|--------|----------------|
| Comments API | Accept `parentId` in POST, filter in GET |
| Comment Section UI | Render nested replies with indent |
| Notifications | New type `comment_reply` |
| Rate Limiting | Same limits apply to replies |
| Floor Numbering | Only top-level comments get floor numbers |

---

## 3. DATABASE_SCHEMA_CHANGE_REQUIRED

### Summary
| Change | Required | Migration | Schema Edit |
|--------|----------|-----------|-------------|
| Draft status | NO | NO | NO (string field) |
| Comment parentId | YES | YES | YES (add field + relation) |

### Recommendation
1. **Draft**: Implement immediately using existing `status` string field. No migration needed.
2. **Comment Replies**: Defer to next iteration. Requires migration + UI changes. Submit proposal only.

### Migration NOT Executed
- No `prisma db push`
- No `prisma migrate`
- No `prisma db seed`
- Schema proposals only - implementation requires Default Integrator approval
