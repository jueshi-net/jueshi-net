/**
 * Forum V1.4 - Content Quality Inspection Engine
 *
 * Provides actionable content quality checks for forum administrators:
 * - Expired content detection (old posts that may be outdated)
 * - Broken link checking (external URLs in published posts)
 * - Duplicate topic identification (similar titles)
 * - No-reply content operations (published posts with 0 comments)
 * - Featured candidate suggestions (high engagement, not yet featured)
 * - Edit/update suggestions (posts with quality issues)
 *
 * All checks are read-only. No automatic modifications to posts.
 */

import { prisma } from "@/lib/prisma";
import { extractUrls } from "@/lib/community/anti-spam";

// ─── Types ──────────────────────────────────────────────

export type QualityIssueType =
  | "expired_content"
  | "broken_link"
  | "duplicate_topic"
  | "no_reply"
  | "feature_candidate"
  | "edit_suggestion"
  | "stale_pinned";

export type Severity = "critical" | "warning" | "info" | "opportunity";

export interface QualityIssue {
  type: QualityIssueType;
  severity: Severity;
  postId: string;
  slug: string;
  title: string;
  category?: string;
  description: string;
  actionLabel: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface ContentQualityReport {
  generatedAt: string;
  summary: {
    totalIssues: number;
    byType: Record<QualityIssueType, number>;
    bySeverity: Record<Severity, number>;
    postsInspected: number;
  };
  issues: QualityIssue[];
}

export interface MaintenanceQueueItem {
  priority: number;
  issue: QualityIssue;
}

export interface MaintenanceQueue {
  generatedAt: string;
  queue: MaintenanceQueueItem[];
  counts: {
    critical: number;
    warning: number;
    info: number;
    opportunity: number;
  };
}

// ─── Configuration ──────────────────────────────────────

/** Posts older than this (days) are considered potentially expired */
export const EXPIRED_CONTENT_DAYS = 180;

/** Posts with 0 comments older than this (days) are flagged */
export const NO_REPLY_DAYS = 7;

/** Minimum title similarity (0-1) to flag as duplicate */
export const DUPLICATE_SIMILARITY_THRESHOLD = 0.6;

/** Posts with content shorter than this (chars) get edit suggestions */
export const SHORT_CONTENT_THRESHOLD = 50;

/** Maximum number of posts to inspect for broken links (performance limit) */
export const MAX_BROKEN_LINK_CHECKS = 50;

/** Featured candidate thresholds */
export const FEATURE_MIN_COMMENTS = 3;
export const FEATURE_MIN_VIEWS = 20;

/** Priority weights for maintenance queue */
const PRIORITY_WEIGHTS: Record<QualityIssueType, number> = {
  broken_link: 1, // highest priority
  expired_content: 2,
  duplicate_topic: 3,
  no_reply: 4,
  stale_pinned: 5,
  edit_suggestion: 6,
  feature_candidate: 7, // lowest priority (opportunity)
};

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  opportunity: 3,
};

// ─── Title Normalization & Similarity ────────────────────

/**
 * Normalize a title for comparison: lowercase, strip punctuation,
 * collapse whitespace, remove common filler words.
 */
export function normalizeTitle(title: string): string[] {
  const fillerWords = new Set([
    "的", "了", "在", "是", "我", "有", "和", "就", "不", "人", "都", "一",
    "一个", "上", "也", "很", "到", "说", "要", "去", "你", "会", "着", "没有",
    "看", "好", "自己", "这", "那", "怎么", "什么", "为什么", "如何", "请问",
    "the", "a", "an", "is", "are", "was", "were", "to", "of", "in", "on", "at",
    "for", "with", "how", "what", "why", "can", "do", "does",
  ]);

  // Split Chinese characters into individual chars, keep ASCII words
  const tokens: string[] = [];
  const cleaned = title
    .toLowerCase()
    .replace(/[，。！？、；：""''（）【】《》\-—…·,.!?;:"'()\[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const part of cleaned.split(" ")) {
    if (!part) continue;
    // Check if it's ASCII (word) or CJK (split into chars)
    if (/^[\x00-\x7f]+$/.test(part)) {
      if (part.length >= 2 && !fillerWords.has(part)) {
        tokens.push(part);
      }
    } else {
      // CJK: split into bigrams for better matching
      for (let i = 0; i < part.length; i++) {
        const ch = part[i];
        if (fillerWords.has(ch)) continue;
        const bigram = i < part.length - 1 ? part.substring(i, i + 2) : ch;
        // Check if the bigram itself is a filler word
        if (fillerWords.has(bigram)) {
          i++; // skip the next char since it's part of the filler bigram
          continue;
        }
        tokens.push(bigram);
      }
    }
  }

  return tokens;
}

/**
 * Calculate Jaccard similarity between two token sets.
 * Returns 0-1, where 1 means identical.
 */
export function jaccardSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// ─── Individual Quality Checks ──────────────────────────

/**
 * Find published posts that may be expired/outdated.
 * Flags posts older than EXPIRED_CONTENT_DAYS that have time-sensitive
 * content (contains dates, years, or "最新"/"2024"/"2025" etc).
 */
export async function findExpiredContent(
  daysThreshold = EXPIRED_CONTENT_DAYS
): Promise<QualityIssue[]> {
  const cutoff = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000);

  const oldPosts = await prisma.forumPost.findMany({
    where: {
      status: "published",
      createdAt: { lt: cutoff },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  const issues: QualityIssue[] = [];

  for (const post of oldPosts) {
    // Check if content has time-sensitive signals
    const timeSignals = [
      /\b20[12]\d\b/, // years like 2023, 2024
      /最新|最新版|新版|新规|新政|新政策|最新政策/,
      /截止|截至|有效期|过期|到期/,
      /月\d+日|\d+月\d+/,
    ];

    const hasTimeSignal = timeSignals.some((re) => re.test(post.content) || re.test(post.title));
    const contentChanged = post.updatedAt > post.createdAt;
    const ageDays = Math.floor((Date.now() - post.createdAt.getTime()) / (24 * 60 * 60 * 1000));

    if (hasTimeSignal || ageDays > 365) {
      issues.push({
        type: "expired_content",
        severity: ageDays > 365 ? "warning" : "info",
        postId: post.id,
        slug: post.slug,
        title: post.title,
        category: post.category?.name,
        description: `帖子发布于 ${ageDays} 天前${hasTimeSignal ? "，包含时效性内容" : ""}${
          contentChanged ? `（最后更新于 ${Math.floor((Date.now() - post.updatedAt.getTime()) / (24 * 60 * 60 * 1000))} 天前）` : ""
        }。建议检查内容是否仍然准确，必要时更新。`,
        actionLabel: "查看帖子",
        actionUrl: `/bbs/${post.slug}`,
        metadata: {
          ageDays,
          hasTimeSignal,
          lastUpdatedDaysAgo: Math.floor(
            (Date.now() - post.updatedAt.getTime()) / (24 * 60 * 60 * 1000)
          ),
        },
      });
    }
  }

  return issues;
}

/**
 * Find duplicate topics by title similarity.
 * Groups published posts with similar titles (Jaccard >= threshold).
 */
export async function findDuplicateTopics(
  similarityThreshold = DUPLICATE_SIMILARITY_THRESHOLD
): Promise<QualityIssue[]> {
  const posts = await prisma.forumPost.findMany({
    where: { status: "published" },
    select: {
      id: true,
      slug: true,
      title: true,
      createdAt: true,
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  // Pre-compute normalized tokens for all posts
  const postTokens = posts.map((p) => ({
    ...p,
    tokens: normalizeTitle(p.title),
  }));

  const issues: QualityIssue[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < postTokens.length; i++) {
    if (processed.has(postTokens[i].id)) continue;

    const duplicates: typeof postTokens = [];
    for (let j = i + 1; j < postTokens.length; j++) {
      if (processed.has(postTokens[j].id)) continue;

      const similarity = jaccardSimilarity(
        postTokens[i].tokens,
        postTokens[j].tokens
      );

      if (similarity >= similarityThreshold) {
        duplicates.push(postTokens[j]);
        processed.add(postTokens[j].id);
      }
    }

    if (duplicates.length > 0) {
      processed.add(postTokens[i].id);

      issues.push({
        type: "duplicate_topic",
        severity: "warning",
        postId: postTokens[i].id,
        slug: postTokens[i].slug,
        title: postTokens[i].title,
        category: postTokens[i].category?.name,
        description: `发现 ${duplicates.length} 篇标题相似的帖子：「${duplicates
          .slice(0, 3)
          .map((d) => d.title)
          .join("」「")}」。建议合并或区分内容。`,
        actionLabel: "查看帖子",
        actionUrl: `/bbs/${postTokens[i].slug}`,
        metadata: {
          duplicates: duplicates.map((d) => ({
            slug: d.slug,
            title: d.title,
            createdAt: d.createdAt.toISOString(),
          })),
        },
      });
    }
  }

  return issues;
}

/**
 * Find published posts with no replies after NO_REPLY_DAYS.
 */
export async function findNoReplyContent(
  daysThreshold = NO_REPLY_DAYS
): Promise<QualityIssue[]> {
  const cutoff = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000);

  const unreplied = await prisma.forumPost.findMany({
    where: {
      status: "published",
      commentCount: 0,
      createdAt: { lt: cutoff },
      isLocked: false,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      createdAt: true,
      viewCount: true,
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return unreplied.map((post) => {
    const ageDays = Math.floor(
      (Date.now() - post.createdAt.getTime()) / (24 * 60 * 60 * 1000)
    );

    return {
      type: "no_reply" as const,
      severity: ageDays > 30 ? "warning" : "info",
      postId: post.id,
      slug: post.slug,
      title: post.title,
      category: post.category?.name,
      description: `帖子已发布 ${ageDays} 天，浏览 ${post.viewCount} 次，但无任何评论。${
        post.viewCount > 10
          ? "有一定浏览量但无人回复，考虑引导讨论。"
          : "浏览量较低，考虑优化标题或补充内容。"
      }`,
      actionLabel: "查看帖子",
      actionUrl: `/bbs/${post.slug}`,
      metadata: {
        ageDays,
        viewCount: post.viewCount,
      },
    };
  });
}

/**
 * Find published posts suitable for featuring (high engagement, not yet featured).
 */
export async function findFeatureCandidates(
  minComments = FEATURE_MIN_COMMENTS,
  minViews = FEATURE_MIN_VIEWS
): Promise<QualityIssue[]> {
  const candidates = await prisma.forumPost.findMany({
    where: {
      status: "published",
      isFeatured: false,
      isPinned: false,
      commentCount: { gte: minComments },
      viewCount: { gte: minViews },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      viewCount: true,
      commentCount: true,
      createdAt: true,
      category: { select: { name: true } },
      _count: {
        select: {
          likes: true,
          bookmarks: true,
        },
      },
    },
    orderBy: [{ commentCount: "desc" }, { viewCount: "desc" }],
    take: 20,
  });

  return candidates.map((post) => ({
    type: "feature_candidate" as const,
    severity: "opportunity" as const,
    postId: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category?.name,
    description: `高互动帖子：${post.commentCount} 条评论，${post.viewCount} 次浏览，${
      post._count.likes
    } 个赞，${post._count.bookmarks} 个收藏。建议设为精华帖。`,
    actionLabel: "设为精华",
    actionUrl: `/bbs/admin?tab=feature-candidates`,
    metadata: {
      viewCount: post.viewCount,
      commentCount: post.commentCount,
      likeCount: post._count.likes,
      bookmarkCount: post._count.bookmarks,
    },
  }));
}

/**
 * Find posts with quality issues that suggest an edit is needed.
 * Checks: short content, missing excerpt, missing tags, excessive links.
 */
export async function findEditSuggestions(): Promise<QualityIssue[]> {
  const posts = await prisma.forumPost.findMany({
    where: { status: "published" },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      excerpt: true,
      tags: true,
      createdAt: true,
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const issues: QualityIssue[] = [];

  for (const post of posts) {
    const problems: string[] = [];

    // Short content
    if (post.content.length < SHORT_CONTENT_THRESHOLD) {
      problems.push("内容过短");
    }

    // Missing excerpt
    if (!post.excerpt || post.excerpt.trim().length === 0) {
      problems.push("缺少摘要");
    }

    // Missing tags
    const tags = post.tags;
    if (!tags || (Array.isArray(tags) && tags.length === 0)) {
      problems.push("无标签");
    }

    // Excessive external links
    const urls = extractUrls(post.content);
    if (urls.length > 5) {
      problems.push(`外链较多(${urls.length}个)`);
    }

    if (problems.length > 0) {
      issues.push({
        type: "edit_suggestion",
        severity: "info",
        postId: post.id,
        slug: post.slug,
        title: post.title,
        category: post.category?.name,
        description: `帖子存在质量问题：${problems.join("、")}。建议编辑优化。`,
        actionLabel: "编辑帖子",
        actionUrl: `/bbs/${post.slug}/edit`,
        metadata: {
          problems,
          contentLength: post.content.length,
          hasExcerpt: !!post.excerpt,
          tagCount: Array.isArray(tags) ? tags.length : 0,
          linkCount: urls.length,
        },
      });
    }
  }

  return issues;
}

/**
 * Find pinned posts that have been stale (no recent activity).
 */
export async function findStalePinned(): Promise<QualityIssue[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const stalePinned = await prisma.forumPost.findMany({
    where: {
      isPinned: true,
      status: "published",
      OR: [
        { lastCommentAt: { lt: thirtyDaysAgo } },
        { lastCommentAt: null, createdAt: { lt: thirtyDaysAgo } },
      ],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      createdAt: true,
      lastCommentAt: true,
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return stalePinned.map((post) => {
    const lastActivity = post.lastCommentAt || post.createdAt;
    const daysSinceActivity = Math.floor(
      (Date.now() - lastActivity.getTime()) / (24 * 60 * 60 * 1000)
    );

    return {
      type: "stale_pinned" as const,
      severity: "info" as const,
      postId: post.id,
      slug: post.slug,
      title: post.title,
      category: post.category?.name,
      description: `置顶帖已 ${daysSinceActivity} 天无活动。考虑取消置顶或更新内容。`,
      actionLabel: "查看帖子",
      actionUrl: `/bbs/${post.slug}`,
      metadata: {
        daysSinceActivity,
        lastActivity: lastActivity.toISOString(),
      },
    };
  });
}

/**
 * Check external links in published posts for broken links.
 * Returns issues for URLs that return 4xx/5xx or fail to connect.
 *
 * NOTE: This is a network-dependent check. It should be run with
 * a limit (MAX_BROKEN_LINK_CHECKS) and timeout to avoid blocking.
 */
export async function findBrokenLinks(
  maxChecks = MAX_BROKEN_LINK_CHECKS
): Promise<QualityIssue[]> {
  // Get published posts with content containing URLs
  const posts = await prisma.forumPost.findMany({
    where: {
      status: "published",
      content: { contains: "http" },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      category: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: maxChecks,
  });

  const issues: QualityIssue[] = [];

  for (const post of posts) {
    const urls = [...new Set(extractUrls(post.content))].slice(0, 5); // max 5 links per post

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
          method: "HEAD",
          signal: controller.signal,
          redirect: "follow",
        });

        clearTimeout(timeout);

        if (response.status >= 400) {
          issues.push({
            type: "broken_link",
            severity: response.status >= 500 ? "warning" : "info",
            postId: post.id,
            slug: post.slug,
            title: post.title,
            category: post.category?.name,
            description: `帖子中的外链返回 HTTP ${response.status}：${url}`,
            actionLabel: "查看帖子",
            actionUrl: `/bbs/${post.slug}`,
            metadata: {
              url,
              statusCode: response.status,
            },
          });
        }
      } catch {
        // Network error or timeout - skip (don't report as broken, could be temporary)
      }
    }
  }

  return issues;
}

// ─── Main Inspection Function ────────────────────────────

/**
 * Run all content quality checks and return a comprehensive report.
 * @param options - Optional configuration for individual checks
 */
export async function inspectContentQuality(options?: {
  checkBrokenLinks?: boolean;
  maxBrokenLinkChecks?: number;
  expiredDays?: number;
  noReplyDays?: number;
  duplicateThreshold?: number;
}): Promise<ContentQualityReport> {
  const checkBrokenLinks = options?.checkBrokenLinks ?? false; // disabled by default (network)

  const [
    expired,
    duplicates,
    noReply,
    features,
    editSuggestions,
    stalePinned,
    brokenLinks,
  ] = await Promise.all([
    findExpiredContent(options?.expiredDays),
    findDuplicateTopics(options?.duplicateThreshold),
    findNoReplyContent(options?.noReplyDays),
    findFeatureCandidates(),
    findEditSuggestions(),
    findStalePinned(),
    checkBrokenLinks
      ? findBrokenLinks(options?.maxBrokenLinkChecks)
      : Promise.resolve([]),
  ]);

  const issues = [
    ...expired,
    ...brokenLinks,
    ...duplicates,
    ...noReply,
    ...stalePinned,
    ...editSuggestions,
    ...features,
  ];

  // Build summary
  const byType = {} as Record<QualityIssueType, number>;
  const bySeverity = {} as Record<Severity, number>;

  const allTypes: QualityIssueType[] = [
    "expired_content", "broken_link", "duplicate_topic", "no_reply",
    "feature_candidate", "edit_suggestion", "stale_pinned",
  ];
  const allSeverities: Severity[] = ["critical", "warning", "info", "opportunity"];

  for (const t of allTypes) byType[t] = 0;
  for (const s of allSeverities) bySeverity[s] = 0;

  for (const issue of issues) {
    byType[issue.type]++;
    bySeverity[issue.severity]++;
  }

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalIssues: issues.length,
      byType,
      bySeverity,
      postsInspected: expired.length + duplicates.length + noReply.length +
        features.length + editSuggestions.length + stalePinned.length,
    },
    issues,
  };
}

/**
 * Build a prioritized maintenance queue from quality issues.
 * Priority is determined by issue type and severity.
 */
export function buildMaintenanceQueue(
  report: ContentQualityReport
): MaintenanceQueue {
  const queue: MaintenanceQueueItem[] = report.issues.map((issue) => ({
    priority: PRIORITY_WEIGHTS[issue.type] * 10 + SEVERITY_RANK[issue.severity],
    issue,
  }));

  queue.sort((a, b) => a.priority - b.priority);

  const counts = { critical: 0, warning: 0, info: 0, opportunity: 0 };
  for (const item of queue) {
    counts[item.issue.severity]++;
  }

  return {
    generatedAt: report.generatedAt,
    queue,
    counts,
  };
}
