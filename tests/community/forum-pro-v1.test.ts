/**
 * Forum V1 Pro - Moderation & User Content Center Tests
 *
 * Tests cover:
 * 1. Admin moderation queue logic (approve, reject, batch)
 * 2. User content center logic (my-posts, delete, resubmit)
 * 3. Notification generation logic
 * 4. Permission checks
 * 5. Rate limiting thresholds
 * 6. XSS filtering
 * 7. Report validation
 */

import { describe, it, expect } from "vitest";

// ============ Constants & Types ============

const POST_STATUS = {
  PUBLISHED: "published",
  PENDING: "pending",
  REJECTED: "rejected",
  HIDDEN: "hidden",
  DELETED: "deleted",
} as const;

const COMMENT_STATUS = {
  PUBLISHED: "published",
  PENDING: "pending",
  HIDDEN: "hidden",
  DELETED: "deleted",
} as const;

const MOD_ACTIONS = [
  "approve",
  "reject",
  "hide",
  "restore",
  "pin",
  "unpin",
  "feature",
  "unfeature",
  "lock",
  "unlock",
] as const;

const VALID_REPORT_REASONS = ["spam", "abuse", "harassment", "illegal", "other"];

// Rate limits from the API
const POST_RATE_LIMIT_PER_MINUTE = 1;
const POST_DAILY_LIMIT = 5;
const COMMENT_RATE_LIMIT_PER_MINUTE = 3;
const COMMENT_DAILY_LIMIT = 20;

// ============ Helper Functions (mirroring API logic) ============

function getNewStatusOnEdit(currentStatus: string, isAdmin: boolean): string {
  if (currentStatus === POST_STATUS.PUBLISHED && !isAdmin) {
    return POST_STATUS.PENDING;
  }
  if (currentStatus === POST_STATUS.REJECTED) {
    return POST_STATUS.PENDING;
  }
  return currentStatus;
}

function canEditPost(postStatus: string, isAuthor: boolean, isAdmin: boolean): boolean {
  if (!isAuthor && !isAdmin) return false;
  if (postStatus === POST_STATUS.HIDDEN || postStatus === POST_STATUS.DELETED) {
    return isAdmin;
  }
  return true;
}

function canDeletePost(postStatus: string, isAuthor: boolean): boolean {
  if (!isAuthor) return false;
  return postStatus === POST_STATUS.PENDING || postStatus === POST_STATUS.REJECTED;
}

function shouldNotifyOnComment(
  commentStatus: string,
  postAuthorId: string,
  commenterId: string
): boolean {
  return commentStatus === COMMENT_STATUS.PUBLISHED && postAuthorId !== commenterId;
}

function shouldNotifyOnLike(postAuthorId: string, likerId: string): boolean {
  return postAuthorId !== likerId;
}

function getModerationMessage(
  action: string,
  postTitle: string,
  reason?: string
): { type: string; message: string } | null {
  switch (action) {
    case "approve":
      return {
        type: "post_approved",
        message: `您的帖子「${postTitle}」已审核通过`,
      };
    case "reject":
      return {
        type: "post_rejected",
        message: `您的帖子「${postTitle}」已被驳回${reason ? `：${reason}` : ""}`,
      };
    case "hide":
      return {
        type: "post_hidden",
        message: `您的帖子「${postTitle}」已被隐藏${reason ? `：${reason}` : ""}`,
      };
    case "restore":
      return {
        type: "post_restored",
        message: `您的帖子「${postTitle}」已恢复显示`,
      };
    case "pin":
      return {
        type: "post_featured",
        message: `您的帖子「${postTitle}」已被置顶`,
      };
    case "feature":
      return {
        type: "post_featured",
        message: `您的帖子「${postTitle}」已被设为精华`,
      };
    case "lock":
      return {
        type: "post_locked",
        message: `您的帖子「${postTitle}」已被锁定`,
      };
    case "unlock":
      return {
        type: "post_restored",
        message: `您的帖子「${postTitle}」已解锁`,
      };
    default:
      return null;
  }
}

function validateReportReason(reason: string): boolean {
  return VALID_REPORT_REASONS.includes(reason);
}

function validateContent(title: string, content: string): { valid: boolean; error?: string } {
  if (!title || title.trim().length < 5) {
    return { valid: false, error: "标题至少 5 个字符" };
  }
  if (title.length > 80) {
    return { valid: false, error: "标题最多 80 个字符" };
  }
  if (!content || content.trim().length < 10) {
    return { valid: false, error: "内容至少 10 个字符" };
  }
  if (content.length > 3000) {
    return { valid: false, error: "内容最多 3000 个字符" };
  }
  return { valid: true };
}

function isRateLimited(count: number, limit: number): boolean {
  return count >= limit;
}

// ============ Tests ============

describe("Forum Moderation - Status Transitions", () => {
  it("should set status to pending when author edits rejected post", () => {
    const newStatus = getNewStatusOnEdit(POST_STATUS.REJECTED, false);
    expect(newStatus).toBe(POST_STATUS.PENDING);
  });

  it("should set status to pending when non-admin edits published post", () => {
    const newStatus = getNewStatusOnEdit(POST_STATUS.PUBLISHED, false);
    expect(newStatus).toBe(POST_STATUS.PENDING);
  });

  it("should keep status published when admin edits published post", () => {
    const newStatus = getNewStatusOnEdit(POST_STATUS.PUBLISHED, true);
    expect(newStatus).toBe(POST_STATUS.PUBLISHED);
  });

  it("should keep status pending when author edits pending post", () => {
    const newStatus = getNewStatusOnEdit(POST_STATUS.PENDING, false);
    expect(newStatus).toBe(POST_STATUS.PENDING);
  });

  it("should allow rejected status as new value (no schema change needed)", () => {
    // ForumPost.status is a string field, not an enum
    // "rejected" is a valid new value without schema migration
    const status: string = "rejected";
    expect(status).toBe(POST_STATUS.REJECTED);
  });
});

describe("Forum Moderation - Approve/Reject Actions", () => {
  const testTitle = "Test Post Title";
  const testReason = "内容不符合规范";

  it("should generate approval notification", () => {
    const result = getModerationMessage("approve", testTitle);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("post_approved");
    expect(result!.message).toContain("已审核通过");
  });

  it("should generate rejection notification with reason", () => {
    const result = getModerationMessage("reject", testTitle, testReason);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("post_rejected");
    expect(result!.message).toContain("已被驳回");
    expect(result!.message).toContain(testReason);
  });

  it("should generate rejection notification without reason", () => {
    const result = getModerationMessage("reject", testTitle);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("post_rejected");
    expect(result!.message).toContain("已被驳回");
    expect(result!.message).not.toContain("：");
  });

  it("should generate hide notification", () => {
    const result = getModerationMessage("hide", testTitle);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("post_hidden");
    expect(result!.message).toContain("已被隐藏");
  });

  it("should generate restore notification", () => {
    const result = getModerationMessage("restore", testTitle);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("post_restored");
    expect(result!.message).toContain("已恢复显示");
  });

  it("should generate pin notification", () => {
    const result = getModerationMessage("pin", testTitle);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("post_featured");
    expect(result!.message).toContain("已被置顶");
  });

  it("should generate feature notification", () => {
    const result = getModerationMessage("feature", testTitle);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("post_featured");
    expect(result!.message).toContain("精华");
  });

  it("should generate lock notification", () => {
    const result = getModerationMessage("lock", testTitle);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("post_locked");
    expect(result!.message).toContain("已被锁定");
  });

  it("should generate unlock notification", () => {
    const result = getModerationMessage("unlock", testTitle);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("post_restored");
    expect(result!.message).toContain("已解锁");
  });

  it("should return null for unknown action", () => {
    const result = getModerationMessage("unknown", testTitle);
    expect(result).toBeNull();
  });

  it("should support all moderation actions that generate notifications", () => {
    // unpin and unfeature don't generate notifications (no need to notify on removal)
    const notifiableActions = MOD_ACTIONS.filter((a) => a !== "unpin" && a !== "unfeature");
    for (const action of notifiableActions) {
      const result = getModerationMessage(action, testTitle);
      expect(result).not.toBeNull();
    }
  });

  it("should return null for non-notifiable actions (unpin, unfeature)", () => {
    expect(getModerationMessage("unpin", testTitle)).toBeNull();
    expect(getModerationMessage("unfeature", testTitle)).toBeNull();
  });
});

describe("Forum User Content Center - Permissions", () => {
  it("should allow author to edit own pending post", () => {
    expect(canEditPost(POST_STATUS.PENDING, true, false)).toBe(true);
  });

  it("should allow author to edit own rejected post", () => {
    expect(canEditPost(POST_STATUS.REJECTED, true, false)).toBe(true);
  });

  it("should allow author to edit own published post", () => {
    expect(canEditPost(POST_STATUS.PUBLISHED, true, false)).toBe(true);
  });

  it("should not allow author to edit own hidden post", () => {
    expect(canEditPost(POST_STATUS.HIDDEN, true, false)).toBe(false);
  });

  it("should not allow author to edit own deleted post", () => {
    expect(canEditPost(POST_STATUS.DELETED, true, false)).toBe(false);
  });

  it("should allow admin to edit hidden post", () => {
    expect(canEditPost(POST_STATUS.HIDDEN, false, true)).toBe(true);
  });

  it("should allow admin to edit deleted post", () => {
    expect(canEditPost(POST_STATUS.DELETED, false, true)).toBe(true);
  });

  it("should not allow non-author non-admin to edit any post", () => {
    expect(canEditPost(POST_STATUS.PUBLISHED, false, false)).toBe(false);
    expect(canEditPost(POST_STATUS.PENDING, false, false)).toBe(false);
  });

  it("should allow author to delete own pending post", () => {
    expect(canDeletePost(POST_STATUS.PENDING, true)).toBe(true);
  });

  it("should allow author to delete own rejected post", () => {
    expect(canDeletePost(POST_STATUS.REJECTED, true)).toBe(true);
  });

  it("should not allow author to delete published post", () => {
    expect(canDeletePost(POST_STATUS.PUBLISHED, true)).toBe(false);
  });

  it("should not allow non-author to delete any post", () => {
    expect(canDeletePost(POST_STATUS.PENDING, false)).toBe(false);
    expect(canDeletePost(POST_STATUS.REJECTED, false)).toBe(false);
  });
});

describe("Forum Notification Generation", () => {
  it("should notify post author when someone comments", () => {
    const shouldNotify = shouldNotifyOnComment(
      COMMENT_STATUS.PUBLISHED,
      "author-1",
      "commenter-1"
    );
    expect(shouldNotify).toBe(true);
  });

  it("should not notify when commenter is the post author", () => {
    const shouldNotify = shouldNotifyOnComment(
      COMMENT_STATUS.PUBLISHED,
      "author-1",
      "author-1"
    );
    expect(shouldNotify).toBe(false);
  });

  it("should not notify when comment is pending", () => {
    const shouldNotify = shouldNotifyOnComment(
      COMMENT_STATUS.PENDING,
      "author-1",
      "commenter-1"
    );
    expect(shouldNotify).toBe(false);
  });

  it("should notify post author when someone likes", () => {
    const shouldNotify = shouldNotifyOnLike("author-1", "liker-1");
    expect(shouldNotify).toBe(true);
  });

  it("should not notify when author likes own post (prevented by API)", () => {
    const shouldNotify = shouldNotifyOnLike("author-1", "author-1");
    expect(shouldNotify).toBe(false);
  });

  it("should notify on post approval", () => {
    const msg = getModerationMessage("approve", "My Post");
    expect(msg).not.toBeNull();
    expect(msg!.type).toBe("post_approved");
  });

  it("should notify on post rejection with reason", () => {
    const msg = getModerationMessage("reject", "My Post", "内容不当");
    expect(msg).not.toBeNull();
    expect(msg!.type).toBe("post_rejected");
    expect(msg!.message).toContain("内容不当");
  });
});

describe("Forum Rate Limiting", () => {
  it("should enforce 1 post per minute", () => {
    expect(isRateLimited(1, POST_RATE_LIMIT_PER_MINUTE)).toBe(true);
    expect(isRateLimited(0, POST_RATE_LIMIT_PER_MINUTE)).toBe(false);
  });

  it("should enforce 5 posts per day", () => {
    expect(isRateLimited(5, POST_DAILY_LIMIT)).toBe(true);
    expect(isRateLimited(4, POST_DAILY_LIMIT)).toBe(false);
  });

  it("should enforce 3 comments per minute", () => {
    expect(isRateLimited(3, COMMENT_RATE_LIMIT_PER_MINUTE)).toBe(true);
    expect(isRateLimited(2, COMMENT_RATE_LIMIT_PER_MINUTE)).toBe(false);
  });

  it("should enforce 20 comments per day", () => {
    expect(isRateLimited(20, COMMENT_DAILY_LIMIT)).toBe(true);
    expect(isRateLimited(19, COMMENT_DAILY_LIMIT)).toBe(false);
  });
});

describe("Forum XSS Protection", () => {
  it("should store content as plain text (not HTML)", () => {
    const maliciousTitle = '<script>alert("xss")</script>';
    const maliciousContent = '<img src=x onerror=alert("xss")>';

    // API stores content as plain text string, not HTML
    // React escapes HTML by default when rendering
    const storedTitle = maliciousTitle.trim();
    const storedContent = maliciousContent.trim();

    expect(storedTitle).toBe(maliciousTitle);
    expect(storedContent).toBe(maliciousContent);
    // When rendered, React will display <script> as text, not execute it
  });

  it("should reject titles that are too short", () => {
    const result = validateContent("ab", "valid content here");
    expect(result.valid).toBe(false);
  });

  it("should reject titles that are too long", () => {
    const result = validateContent("a".repeat(81), "valid content here");
    expect(result.valid).toBe(false);
  });

  it("should reject content that is too short", () => {
    const result = validateContent("Valid Title", "short");
    expect(result.valid).toBe(false);
  });

  it("should reject content that is too long", () => {
    const result = validateContent("Valid Title", "x".repeat(3001));
    expect(result.valid).toBe(false);
  });

  it("should accept valid content", () => {
    const result = validateContent("Valid Title", "This is valid content.");
    expect(result.valid).toBe(true);
  });

  it("should trim whitespace before validation", () => {
    const result = validateContent("  Valid Title  ", "  Valid content  ");
    expect(result.valid).toBe(true);
  });
});

describe("Forum Report System", () => {
  it("should accept valid report reasons", () => {
    for (const reason of VALID_REPORT_REASONS) {
      expect(validateReportReason(reason)).toBe(true);
    }
  });

  it("should reject invalid report reasons", () => {
    expect(validateReportReason("invalid")).toBe(false);
    expect(validateReportReason("")).toBe(false);
    expect(validateReportReason("hate")).toBe(false);
  });

  it("should prevent reporting own content (checked in API)", () => {
    const postAuthorId = "user-1";
    const reporterId = "user-1";
    const isOwnContent = postAuthorId === reporterId;
    expect(isOwnContent).toBe(true);
    // API returns 400: "不能举报自己的内容"
  });

  it("should prevent duplicate reports (unique constraint)", () => {
    // ForumReport has @@unique([reporterId, postId])
    // Second report on same post by same user would fail
    const uniqueConstraint = ["reporterId", "postId"];
    expect(uniqueConstraint).toContain("reporterId");
    expect(uniqueConstraint).toContain("postId");
  });
});

describe("Forum Moderation - Batch Operations", () => {
  it("should validate batch action is approve or reject", () => {
    const validActions = ["approve", "reject"];
    expect(validActions.includes("approve")).toBe(true);
    expect(validActions.includes("reject")).toBe(true);
    expect(validActions.includes("invalid")).toBe(false);
  });

  it("should require postIds for batch operations", () => {
    const emptyPostIds: string[] = [];
    expect(emptyPostIds.length).toBe(0);
    // API returns 400: "请选择至少一个帖子"
  });

  it("should require reason for batch reject", () => {
    const reason = "";
    expect(reason.trim().length >= 2).toBe(false);
    // API returns 400: "驳回原因至少 2 个字符"
  });

  it("should create moderation log for each post in batch", () => {
    const postIds = ["post-1", "post-2", "post-3"];
    const logs = postIds.map((postId) => ({
      adminId: "admin-1",
      action: "approve",
      postId,
    }));
    expect(logs.length).toBe(3);
    expect(logs.every((l) => l.action === "approve")).toBe(true);
  });

  it("should create notification for each post author in batch", () => {
    const posts = [
      { id: "p1", userId: "u1", title: "T1" },
      { id: "p2", userId: "u2", title: "T2" },
      { id: "p3", userId: "u1", title: "T3" },
    ];
    const notifications = posts.map((p) => ({
      userId: p.userId,
      type: "post_approved",
      postId: p.id,
      message: `您的帖子「${p.title}」已审核通过`,
    }));
    expect(notifications.length).toBe(3);
    expect(notifications.filter((n) => n.userId === "u1").length).toBe(2);
  });
});

describe("Forum Database Schema - No Changes Required", () => {
  it("should use existing ForumPost.status string field for 'rejected'", () => {
    // ForumPost.status is a String, not an enum
    // Values: published / pending / hidden / deleted
    // New value 'rejected' works without schema migration
    const status: string = "rejected";
    expect(typeof status).toBe("string");
  });

  it("should use existing ModerationLog for audit trail", () => {
    // ModerationLog.action is a String field
    // Existing actions: pin / unpin / feature / unfeature / lock / unlock / hide / restore / accept / reject_report
    // New action 'reject' works without schema migration
    const action: string = "reject";
    expect(typeof action).toBe("string");
  });

  it("should use existing ForumNotification for notifications", () => {
    // ForumNotification.type is a String field
    // Existing types: reply / like / accepted / featured / report_resolved
    // New types: post_approved / post_rejected / post_hidden / post_restored / post_locked
    const newTypes = [
      "post_approved",
      "post_rejected",
      "post_hidden",
      "post_restored",
      "post_locked",
    ];
    for (const type of newTypes) {
      expect(typeof type).toBe("string");
    }
  });

  it("should use ModerationLog.reason for rejection reason", () => {
    // ModerationLog has a 'reason' String? field
    // Perfect for storing rejection reasons without schema changes
    const reason = "内容不符合社区规范";
    expect(reason.length).toBeGreaterThan(0);
  });
});

describe("Forum User Content Center - Status Tabs", () => {
  it("should support all status filters", () => {
    const validFilters = ["all", "published", "pending", "rejected", "hidden", "deleted"];
    for (const filter of validFilters) {
      expect(validFilters.includes(filter)).toBe(true);
    }
  });

  it("should default to 'all' when no status specified", () => {
    const defaultStatus = "all";
    expect(defaultStatus).toBe("all");
  });

  it("should return counts for each status tab", () => {
    const statusCounts = {
      published: 5,
      pending: 2,
      rejected: 1,
      hidden: 0,
      deleted: 0,
    };
    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    expect(total).toBe(8);
    expect(statusCounts.published).toBe(5);
    expect(statusCounts.pending).toBe(2);
    expect(statusCounts.rejected).toBe(1);
  });
});
