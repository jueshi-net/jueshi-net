/**
 * Forum V1.3 - Event Tracking (EventLog Reuse)
 *
 * Reuses the existing EventLog model for forum analytics.
 * No new database models are created.
 *
 * Supported event types:
 * - forum_search: User searched the forum
 * - forum_filter: User filtered posts by category/tag
 * - forum_post_view: User viewed a post
 * - forum_share: User clicked a share button
 * - forum_feed_view: User viewed RSS/Atom feed
 * - forum_draft_create: User created a draft
 * - forum_submit_review: User submitted a post for review
 * - forum_moderation_complete: Admin completed a moderation action
 *
 * Privacy rules:
 * - No post content is recorded
 * - No passwords, tokens, or cookies
 * - Search keywords are length-limited and sanitized
 * - No sensitive PII in metadata
 * - Supports opt-out via privacy policy
 */

import { prisma } from "@/lib/prisma";

export interface ForumEventInput {
  eventType: string;
  toolName?: string;
  action?: string;
  path?: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  referrer?: string;
  deviceType?: string;
}

/**
 * Check if event tracking is enabled (privacy opt-out support).
 * Can be disabled via FORUM_ANALYTICS_DISABLED env var or per-request flag.
 */
export function isTrackingEnabled(): boolean {
  return process.env.FORUM_ANALYTICS_DISABLED !== "true";
}

/**
 * Sanitize metadata to remove any sensitive data.
 * - Removes keys matching sensitive patterns
 * - Truncates string values to 200 chars
 * - Removes nested objects deeper than 2 levels
 */
export function sanitizeMetadata(
  metadata: Record<string, unknown>
): Record<string, unknown> {
  // Exact key match for sensitive patterns (not substring)
  const sensitiveKeyPatterns = [
    /^password$/i,
    /^token$/i,
    /^cookie$/i,
    /^session$/i,
    /^secret$/i,
    /^api[_-]?key$/i,
    /^authorization$/i,
    /^email$/i,
    /^phone$/i,
    /^ip$/i,
    /^ip_?hash$/i,
    /^ssn$/i,
    /^credit$/i,
  ];

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    // Skip sensitive keys (exact match)
    if (sensitiveKeyPatterns.some((pattern) => pattern.test(key))) {
      continue;
    }

    // Truncate string values
    if (typeof value === "string") {
      sanitized[key] = value.slice(0, 200);
    } else if (typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      // Only store array length, not contents
      sanitized[key] = value.length;
    } else if (typeof value === "object" && value !== null) {
      // Flatten one level
      sanitized[key] = "[object]";
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Record a forum event.
 * Non-blocking: errors are logged but not thrown.
 */
export async function trackForumEvent(input: ForumEventInput): Promise<void> {
  if (!isTrackingEnabled()) return;

  try {
    const sanitizedMetadata = input.metadata
      ? sanitizeMetadata(input.metadata)
      : undefined;

    await prisma.eventLog.create({
      data: {
        eventType: input.eventType,
        toolName: input.toolName || "forum",
        action: input.action,
        path: input.path,
        sessionId: input.sessionId,
        userId: input.userId,
        metadata: sanitizedMetadata as any,
      },
    });
  } catch (error) {
    // Non-blocking: log but don't throw
    console.error("[Forum Event Track Error]", error);
  }
}

/**
 * Convenience wrappers for common forum events.
 */

export async function trackForumSearch(params: {
  keyword: string;
  category?: string;
  resultCount: number;
  sessionId?: string;
  userId?: string;
  path?: string;
}): Promise<void> {
  const sanitizedKeyword = sanitizeKeywordForTracking(params.keyword);
  await trackForumEvent({
    eventType: "forum_search",
    action: "search",
    path: params.path || "/bbs",
    sessionId: params.sessionId,
    userId: params.userId,
    metadata: {
      keyword: sanitizedKeyword,
      category: params.category,
      resultCount: params.resultCount,
    },
  });
}

export async function trackForumFilter(params: {
  category?: string;
  tag?: string;
  sort?: string;
  sessionId?: string;
  userId?: string;
  path?: string;
}): Promise<void> {
  await trackForumEvent({
    eventType: "forum_filter",
    action: "filter",
    path: params.path || "/bbs",
    sessionId: params.sessionId,
    userId: params.userId,
    metadata: {
      category: params.category,
      tag: params.tag,
      sort: params.sort,
    },
  });
}

export async function trackForumPostView(params: {
  postSlug: string;
  postId: string;
  sessionId?: string;
  userId?: string;
  path?: string;
}): Promise<void> {
  await trackForumEvent({
    eventType: "forum_post_view",
    action: "view",
    path: params.path,
    sessionId: params.sessionId,
    userId: params.userId,
    metadata: {
      postSlug: params.postSlug,
      postId: params.postId,
    },
  });
}

export async function trackForumShare(params: {
  postSlug: string;
  platform: string; // telegram, whatsapp, facebook, x, copy, native, qr
  sessionId?: string;
  userId?: string;
  path?: string;
}): Promise<void> {
  await trackForumEvent({
    eventType: "forum_share",
    action: "share",
    path: params.path,
    sessionId: params.sessionId,
    userId: params.userId,
    metadata: {
      postSlug: params.postSlug,
      platform: params.platform,
    },
  });
}

export async function trackForumFeedView(params: {
  feedType: "rss" | "atom";
  categoryKey?: string;
  sessionId?: string;
  path?: string;
}): Promise<void> {
  await trackForumEvent({
    eventType: "forum_feed_view",
    action: "feed_view",
    path: params.path,
    sessionId: params.sessionId,
    metadata: {
      feedType: params.feedType,
      categoryKey: params.categoryKey,
    },
  });
}

export async function trackForumDraftCreate(params: {
  categoryId?: string;
  sessionId?: string;
  userId?: string;
  path?: string;
}): Promise<void> {
  await trackForumEvent({
    eventType: "forum_draft_create",
    action: "draft_create",
    path: params.path || "/bbs/new",
    sessionId: params.sessionId,
    userId: params.userId,
    metadata: {
      categoryId: params.categoryId,
    },
  });
}

export async function trackForumSubmitReview(params: {
  postId: string;
  categoryId?: string;
  sessionId?: string;
  userId?: string;
  path?: string;
}): Promise<void> {
  await trackForumEvent({
    eventType: "forum_submit_review",
    action: "submit_review",
    path: params.path,
    sessionId: params.sessionId,
    userId: params.userId,
    metadata: {
      postId: params.postId,
      categoryId: params.categoryId,
    },
  });
}

export async function trackForumModerationComplete(params: {
  action: string; // approve, reject, pin, feature, etc.
  postId?: string;
  adminId: string;
}): Promise<void> {
  await trackForumEvent({
    eventType: "forum_moderation_complete",
    action: params.action,
    path: "/bbs/admin",
    userId: params.adminId,
    metadata: {
      postId: params.postId,
    },
  });
}

/**
 * Sanitize a search keyword for event tracking.
 * - Max 50 characters
 * - Remove control characters
 * - No full PII storage
 */
function sanitizeKeywordForTracking(keyword: string): string {
  if (!keyword) return "";
  let cleaned = keyword.replace(/[\x00-\x1F\x7F]/g, "").trim();
  cleaned = cleaned.slice(0, 50);
  return cleaned;
}
