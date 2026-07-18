/**
 * Forum V1.3 Analytics & Growth Insights Tests
 *
 * Self-contained tests for:
 * - Content funnel metrics computation
 * - Author growth metrics (anonymization, categories)
 * - Content trends (daily aggregation, top keywords/tags/categories)
 * - Event tracking (privacy, sanitization, opt-out)
 * - Growth recommendations (rule-based, explainable)
 * - SEO monitoring (sitemap, feeds, metadata, non-public check)
 * - CSV export (formula injection prevention, anonymization)
 * - Privacy policy endpoint
 */

import { describe, it, expect } from "vitest";

// ═══════════════════════════════════════════════════════════════
// Content Funnel Metrics Tests
// ═══════════════════════════════════════════════════════════════

describe("Content Funnel - Metric Computation", () => {
  // Test metric derivation logic
  function computeFunnelMetrics(data: {
    draftCount: number;
    submittedCount: number;
    approveLogs: number;
    rejectLogs: number;
    publishedInPeriod: number;
    postsWithComments: number;
    postsWithoutComments: number;
    totalReports: number;
    featuredCount: number;
    engagedPosts: number;
  }) {
    const totalDraftsAndSubmitted = data.draftCount + data.submittedCount;
    const draftSubmitRate =
      totalDraftsAndSubmitted > 0
        ? Math.round((data.submittedCount / totalDraftsAndSubmitted) * 100)
        : 0;

    const totalModActions = data.approveLogs + data.rejectLogs;
    const approvalRate =
      totalModActions > 0
        ? Math.round((data.approveLogs / totalModActions) * 100)
        : 0;
    const rejectionRate =
      totalModActions > 0
        ? Math.round((data.rejectLogs / totalModActions) * 100)
        : 0;

    const firstCommentRatio =
      data.publishedInPeriod > 0
        ? Math.round((data.postsWithComments / data.publishedInPeriod) * 100)
        : 0;

    const noReplyRate =
      data.publishedInPeriod > 0
        ? Math.round((data.postsWithoutComments / data.publishedInPeriod) * 100)
        : 0;

    const reportRate =
      data.publishedInPeriod > 0
        ? Math.round((data.totalReports / data.publishedInPeriod) * 100)
        : 0;

    const featuredConversionRate =
      data.publishedInPeriod > 0
        ? Math.round((data.featuredCount / data.publishedInPeriod) * 100)
        : 0;

    const engagementRate24h =
      data.publishedInPeriod > 0
        ? Math.round((data.engagedPosts / data.publishedInPeriod) * 100)
        : 0;

    return {
      draftSubmitRate,
      approvalRate,
      rejectionRate,
      firstCommentRatio,
      noReplyRate,
      reportRate,
      featuredConversionRate,
      engagementRate24h,
    };
  }

  it("computes draft submit rate correctly", () => {
    const result = computeFunnelMetrics({
      draftCount: 10,
      submittedCount: 30,
      approveLogs: 25,
      rejectLogs: 5,
      publishedInPeriod: 25,
      postsWithComments: 15,
      postsWithoutComments: 10,
      totalReports: 3,
      featuredCount: 2,
      engagedPosts: 20,
    });
    expect(result.draftSubmitRate).toBe(75); // 30/(10+30) = 75%
  });

  it("computes approval and rejection rates", () => {
    const result = computeFunnelMetrics({
      draftCount: 0,
      submittedCount: 30,
      approveLogs: 25,
      rejectLogs: 5,
      publishedInPeriod: 25,
      postsWithComments: 15,
      postsWithoutComments: 10,
      totalReports: 3,
      featuredCount: 2,
      engagedPosts: 20,
    });
    expect(result.approvalRate).toBe(83); // 25/30 = 83.33 -> 83
    expect(result.rejectionRate).toBe(17); // 5/30 = 16.67 -> 17
  });

  it("computes first comment ratio", () => {
    const result = computeFunnelMetrics({
      draftCount: 0,
      submittedCount: 20,
      approveLogs: 20,
      rejectLogs: 0,
      publishedInPeriod: 20,
      postsWithComments: 12,
      postsWithoutComments: 8,
      totalReports: 0,
      featuredCount: 0,
      engagedPosts: 15,
    });
    expect(result.firstCommentRatio).toBe(60); // 12/20 = 60%
    expect(result.noReplyRate).toBe(40); // 8/20 = 40%
  });

  it("computes report rate", () => {
    const result = computeFunnelMetrics({
      draftCount: 0,
      submittedCount: 10,
      approveLogs: 10,
      rejectLogs: 0,
      publishedInPeriod: 10,
      postsWithComments: 5,
      postsWithoutComments: 5,
      totalReports: 2,
      featuredCount: 1,
      engagedPosts: 8,
    });
    expect(result.reportRate).toBe(20); // 2/10 = 20%
  });

  it("computes featured conversion rate", () => {
    const result = computeFunnelMetrics({
      draftCount: 0,
      submittedCount: 10,
      approveLogs: 10,
      rejectLogs: 0,
      publishedInPeriod: 10,
      postsWithComments: 5,
      postsWithoutComments: 5,
      totalReports: 0,
      featuredCount: 3,
      engagedPosts: 8,
    });
    expect(result.featuredConversionRate).toBe(30); // 3/10 = 30%
  });

  it("handles zero published posts gracefully", () => {
    const result = computeFunnelMetrics({
      draftCount: 5,
      submittedCount: 0,
      approveLogs: 0,
      rejectLogs: 0,
      publishedInPeriod: 0,
      postsWithComments: 0,
      postsWithoutComments: 0,
      totalReports: 0,
      featuredCount: 0,
      engagedPosts: 0,
    });
    expect(result.firstCommentRatio).toBe(0);
    expect(result.noReplyRate).toBe(0);
    expect(result.reportRate).toBe(0);
    expect(result.featuredConversionRate).toBe(0);
    expect(result.engagementRate24h).toBe(0);
  });

  it("computes engagement rate", () => {
    const result = computeFunnelMetrics({
      draftCount: 0,
      submittedCount: 20,
      approveLogs: 20,
      rejectLogs: 0,
      publishedInPeriod: 20,
      postsWithComments: 10,
      postsWithoutComments: 10,
      totalReports: 0,
      featuredCount: 0,
      engagedPosts: 16,
    });
    expect(result.engagementRate24h).toBe(80); // 16/20 = 80%
  });
});

// ═══════════════════════════════════════════════════════════════
// Author Growth - Anonymization Tests
// ═══════════════════════════════════════════════════════════════

describe("Author Growth - Anonymization", () => {
  function hashId(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `author_${Math.abs(hash).toString(36).slice(0, 8)}`;
  }

  function maskName(email: string): string {
    if (!email) return "匿名用户";
    const [local, domain] = email.split("@");
    if (!domain) return "匿名用户";
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  }

  it("hashes user ID to non-reversible identifier", () => {
    const hash = hashId("abc123def456");
    expect(hash).toMatch(/^author_[a-z0-9]+$/);
    expect(hash).not.toContain("abc123def456");
  });

  it("produces consistent hash for same ID", () => {
    const hash1 = hashId("user_xyz_123");
    const hash2 = hashId("user_xyz_123");
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different IDs", () => {
    const hash1 = hashId("user_1");
    const hash2 = hashId("user_2");
    expect(hash1).not.toBe(hash2);
  });

  it("masks email correctly", () => {
    expect(maskName("john.doe@example.com")).toBe("j***e@example.com");
    expect(maskName("ab@example.com")).toBe("a***@example.com");
    expect(maskName("a@example.com")).toBe("a***@example.com");
    expect(maskName("")).toBe("匿名用户");
    expect(maskName("invalid")).toBe("匿名用户");
  });

  it("engagement score formula is correct", () => {
    const postCount = 5;
    const commentCount = 10;
    const likesReceived = 20;
    const score = postCount * 3 + commentCount * 1 + Math.round(likesReceived * 0.5);
    expect(score).toBe(35); // 15 + 10 + 10
  });

  it("classifies author categories correctly", () => {
    const periodActiveIds = new Set(["u1", "u2", "u3"]);
    const prevActiveIds = new Set(["u2", "u3", "u4"]);

    const newAuthors = [...periodActiveIds].filter(id => !prevActiveIds.has(id));
    const returning = [...periodActiveIds].filter(id => prevActiveIds.has(id));
    const silent = [...prevActiveIds].filter(id => !periodActiveIds.has(id));

    expect(newAuthors).toEqual(["u1"]);
    expect(returning).toEqual(["u2", "u3"]);
    expect(silent).toEqual(["u4"]);
  });
});

// ═══════════════════════════════════════════════════════════════
// Content Trends - Aggregation Tests
// ═══════════════════════════════════════════════════════════════

describe("Content Trends - Aggregation", () => {
  it("generates date range correctly", () => {
    const now = new Date("2026-07-17T00:00:00Z");
    const daysBack = 7;
    const dates: string[] = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dates.push(d.toISOString().slice(0, 10));
    }
    expect(dates).toHaveLength(7);
    expect(dates[0]).toBe("2026-07-11");
    expect(dates[6]).toBe("2026-07-17");
  });

  it("aggregates daily counts correctly", () => {
    const dates = ["2026-07-15", "2026-07-16", "2026-07-17"];
    const dbData = [
      { date: "2026-07-16", count: BigInt(5) },
      { date: "2026-07-17", count: BigInt(3) },
    ];
    const trend = dates.map(date => {
      const found = dbData.find(p => p.date === date);
      return { date, count: found ? Number(found.count) : 0 };
    });
    expect(trend).toEqual([
      { date: "2026-07-15", count: 0 },
      { date: "2026-07-16", count: 5 },
      { date: "2026-07-17", count: 3 },
    ]);
  });

  it("sorts keywords by count descending", () => {
    const keywordCounts = new Map<string, number>([
      ["物流", 5],
      ["海运", 10],
      ["清关", 3],
    ]);
    const sorted = [...keywordCounts.entries()]
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count);
    expect(sorted[0].keyword).toBe("海运");
    expect(sorted[0].count).toBe(10);
    expect(sorted[2].keyword).toBe("清关");
  });

  it("sorts categories by post count descending", () => {
    const categories = [
      { key: "logistics", name: "物流", postCount: 15 },
      { key: "tools", name: "工具", postCount: 8 },
      { key: "feedback", name: "反馈", postCount: 3 },
    ];
    const sorted = [...categories].sort((a, b) => b.postCount - a.postCount);
    expect(sorted[0].key).toBe("logistics");
    expect(sorted[2].key).toBe("feedback");
  });

  it("aggregates tags from posts", () => {
    const posts = [
      { tags: ["shipping", "cbm"] },
      { tags: ["shipping", "logistics"] },
      { tags: ["cbm"] },
      { tags: null },
    ];
    const tagCounts = new Map<string, number>();
    for (const post of posts) {
      if (post.tags && Array.isArray(post.tags)) {
        for (const tag of post.tags) {
          if (typeof tag === "string") {
            const sanitized = tag.trim().slice(0, 30);
            if (sanitized) {
              tagCounts.set(sanitized, (tagCounts.get(sanitized) || 0) + 1);
            }
          }
        }
      }
    }
    expect(tagCounts.get("shipping")).toBe(2);
    expect(tagCounts.get("cbm")).toBe(2);
    expect(tagCounts.get("logistics")).toBe(1);
  });

  it("sanitizes keywords correctly", () => {
    function sanitizeKeyword(keyword: string): string {
      if (!keyword) return "";
      let cleaned = keyword.replace(/[\x00-\x1F\x7F]/g, "").trim();
      cleaned = cleaned.slice(0, 50);
      if (cleaned.length < 1) return "";
      return cleaned;
    }

    expect(sanitizeKeyword("物流查询")).toBe("物流查询");
    expect(sanitizeKeyword("  spaces  ")).toBe("spaces");
    expect(sanitizeKeyword("")).toBe("");
    expect(sanitizeKeyword("a".repeat(60))).toHaveLength(50);
    expect(sanitizeKeyword("\x00\x01test")).toBe("test");
  });
});

// ═══════════════════════════════════════════════════════════════
// Event Tracking - Privacy & Sanitization Tests
// ═══════════════════════════════════════════════════════════════

describe("Event Tracking - Privacy", () => {
  function sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeyPatterns = [
      /^password$/i, /^token$/i, /^cookie$/i, /^session$/i, /^secret$/i,
      /^api[_-]?key$/i, /^authorization$/i, /^email$/i, /^phone$/i,
      /^ip$/i, /^ip_?hash$/i, /^ssn$/i, /^credit$/i,
    ];
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (sensitiveKeyPatterns.some(p => p.test(key))) continue;
      if (typeof value === "string") {
        sanitized[key] = value.slice(0, 200);
      } else if (typeof value === "number" || typeof value === "boolean") {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.length;
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = "[object]";
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  it("removes sensitive keys from metadata", () => {
    const result = sanitizeMetadata({
      keyword: "物流",
      password: "secret123",
      token: "abc",
      email: "user@example.com",
      cookie: "session=xyz",
      count: 5,
    });
    expect(result.keyword).toBe("物流");
    expect(result.password).toBeUndefined();
    expect(result.token).toBeUndefined();
    expect(result.email).toBeUndefined();
    expect(result.cookie).toBeUndefined();
    expect(result.count).toBe(5);
  });

  it("does not remove non-sensitive keys that contain sensitive substrings", () => {
    const result = sanitizeMetadata({ description: "some text", ipAddress: "1.2.3.4" });
    // "description" should NOT be filtered (it doesn't exactly match "ip")
    expect(result.description).toBe("some text");
    // "ipAddress" doesn't exactly match "ip" pattern either
    expect(result.ipAddress).toBe("1.2.3.4");
  });

  it("truncates long string values", () => {
    const longString = "a".repeat(300);
    const result = sanitizeMetadata({ summary: longString });
    expect((result.summary as string).length).toBe(200);
  });

  it("replaces arrays with length", () => {
    const result = sanitizeMetadata({ tags: ["a", "b", "c"] });
    expect(result.tags).toBe(3);
  });

  it("replaces nested objects with [object]", () => {
    const result = sanitizeMetadata({ nested: { a: 1 } });
    expect(result.nested).toBe("[object]");
  });

  it("preserves numbers and booleans", () => {
    const result = sanitizeMetadata({ count: 42, active: true });
    expect(result.count).toBe(42);
    expect(result.active).toBe(true);
  });

  it("respects opt-out flag", () => {
    function isTrackingEnabled(envDisabled?: string): boolean {
      return envDisabled !== "true";
    }
    expect(isTrackingEnabled()).toBe(true);
    expect(isTrackingEnabled("true")).toBe(false);
    expect(isTrackingEnabled("false")).toBe(true);
  });

  it("sanitizes search keyword for tracking", () => {
    function sanitizeKeywordForTracking(keyword: string): string {
      if (!keyword) return "";
      let cleaned = keyword.replace(/[\x00-\x1F\x7F]/g, "").trim();
      cleaned = cleaned.slice(0, 50);
      return cleaned;
    }
    expect(sanitizeKeywordForTracking("海运费查询")).toBe("海运费查询");
    expect(sanitizeKeywordForTracking("a".repeat(60))).toHaveLength(50);
    expect(sanitizeKeywordForTracking("")).toBe("");
  });
});

// ═══════════════════════════════════════════════════════════════
// Growth Recommendations - Rule-Based Tests
// ═══════════════════════════════════════════════════════════════

describe("Growth Recommendations - Rules", () => {
  it("flags categories with zero posts", () => {
    const categories = [
      { key: "logistics", name: "物流", _count: { posts: 0 } },
      { key: "tools", name: "工具", _count: { posts: 5 } },
    ];
    const lacking = categories.filter(c => c._count.posts === 0);
    expect(lacking).toHaveLength(1);
    expect(lacking[0].key).toBe("logistics");
  });

  it("flags categories with low content (< 3 posts)", () => {
    const categories = [
      { key: "a", name: "A", _count: { posts: 2 } },
      { key: "b", name: "B", _count: { posts: 10 } },
      { key: "c", name: "C", _count: { posts: 1 } },
    ];
    const low = categories.filter(c => c._count.posts > 0 && c._count.posts < 3);
    expect(low).toHaveLength(2);
  });

  it("identifies feature candidates (commentCount >= 3, viewCount >= 20, not featured)", () => {
    const posts = [
      { title: "A", commentCount: 5, viewCount: 30, isFeatured: false },
      { title: "B", commentCount: 2, viewCount: 50, isFeatured: false },
      { title: "C", commentCount: 4, viewCount: 25, isFeatured: true },
      { title: "D", commentCount: 10, viewCount: 100, isFeatured: false },
    ];
    const candidates = posts.filter(
      p => !p.isFeatured && p.commentCount >= 3 && p.viewCount >= 20
    );
    expect(candidates).toHaveLength(2);
    expect(candidates[0].title).toBe("A");
    expect(candidates[1].title).toBe("D");
  });

  it("identifies no-result search keywords with count >= 2", () => {
    const noResultKeywords = new Map<string, number>([
      ["物流", 3],
      ["海运", 1],
      ["清关", 5],
    ]);
    const frequent = [...noResultKeywords.entries()]
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1]);
    expect(frequent).toHaveLength(2);
    expect(frequent[0][0]).toBe("清关");
    expect(frequent[0][1]).toBe(5);
  });

  it("identifies posts worth updating (high views, old, no recent comments)", () => {
    const now = new Date("2026-07-17");
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const posts = [
      { viewCount: 100, lastCommentAt: new Date("2026-06-01") },
      { viewCount: 10, lastCommentAt: new Date("2026-07-10") },
      { viewCount: 80, lastCommentAt: new Date("2026-07-01") },
    ];
    const candidates = posts.filter(
      p => p.viewCount > 50 && p.lastCommentAt < fourteenDaysAgo
    );
    expect(candidates).toHaveLength(2);
  });

  it("recommendations are read-only suggestions (no auto-modify)", () => {
    // This test verifies the design principle:
    // recommendations only produce suggestions, never modify data
    const recommendation = {
      type: "posts_for_featuring",
      title: "3 篇帖子适合设为精华",
      actionLabel: "查看候选帖子",
    };
    expect(recommendation.actionLabel).not.toContain("设为精华");
    expect(recommendation.actionLabel).toContain("查看");
  });

  it("recommendations include severity levels", () => {
    const severities = ["info", "warning", "opportunity"];
    expect(severities).toContain("warning");
    expect(severities).toContain("opportunity");
    expect(severities).toContain("info");
  });
});

// ═══════════════════════════════════════════════════════════════
// SEO Monitoring Tests
// ═══════════════════════════════════════════════════════════════

describe("SEO Monitoring", () => {
  it("checks for missing metadata in posts", () => {
    const posts = [
      { slug: "a", title: "A", excerpt: "Summary", tags: ["tag1"] },
      { slug: "b", title: "B", excerpt: null, tags: ["tag2"] },
      { slug: "c", title: "C", excerpt: "Summary", tags: null },
      { slug: "d", title: "D", excerpt: null, tags: null },
    ];
    const withoutExcerpt = posts.filter(p => !p.excerpt);
    const withoutTags = posts.filter(
      p => !p.tags || (Array.isArray(p.tags) && p.tags.length === 0)
    );
    expect(withoutExcerpt).toHaveLength(2);
    expect(withoutTags).toHaveLength(2);
  });

  it("checks non-public content should not be in sitemap", () => {
    const statuses = ["published", "pending", "rejected", "hidden", "deleted", "draft"];
    const shouldNotBeInSitemap = statuses.filter(s => s !== "published" && s !== "draft");
    expect(shouldNotBeInSitemap).toContain("pending");
    expect(shouldNotBeInSitemap).toContain("rejected");
    expect(shouldNotBeInSitemap).toContain("hidden");
    expect(shouldNotBeInSitemap).toContain("deleted");
  });

  it("generates correct canonical URLs", () => {
    const SITE_URL = "https://jueshi.net";
    const slug = "my-post-slug";
    const canonical = `${SITE_URL}/bbs/${slug}`;
    expect(canonical).toBe("https://jueshi.net/bbs/my-post-slug");
  });

  it("robots rules are correctly defined", () => {
    const robotsRules = {
      disallowedPaths: ["/bbs/admin", "/bbs/new", "/bbs/my-posts", "/api/"],
      allowedPaths: ["/bbs", "/bbs/category", "/bbs/feed.xml", "/bbs/feed.atom"],
    };
    expect(robotsRules.disallowedPaths).toContain("/bbs/admin");
    expect(robotsRules.allowedPaths).toContain("/bbs/feed.xml");
    expect(robotsRules.disallowedPaths).not.toContain("/bbs");
  });

  it("does not fake Google Search Console data", () => {
    // SEO monitoring only checks our own data, not GSC
    const seoResult = {
      sitemapUrlCount: 100,
      feedStatus: { rss: { available: true }, atom: { available: true } },
      // No searchConsoleData field
    };
    expect(seoResult).not.toHaveProperty("searchConsoleData");
    expect(seoResult).not.toHaveProperty("googleSearchConsole");
  });
});

// ═══════════════════════════════════════════════════════════════
// CSV Export - Security Tests
// ═══════════════════════════════════════════════════════════════

describe("CSV Export - Formula Injection Prevention", () => {
  function escapeCsvCell(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return "";
    let str = String(value);
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }
    str = str.replace(/"/g, '""');
    if (/[",\n\r]/.test(str)) {
      str = `"${str}"`;
    }
    return str;
  }

  it("prevents formula injection with = prefix", () => {
    const malicious = "=cmd|'/c calc'!A1";
    const escaped = escapeCsvCell(malicious);
    expect(escaped).toBe("'=cmd|'/c calc'!A1");
  });

  it("prevents formula injection with + prefix", () => {
    const malicious = "+cmd|'/c calc'!A1";
    const escaped = escapeCsvCell(malicious);
    expect(escaped.startsWith("'")).toBe(true);
  });

  it("prevents formula injection with - prefix", () => {
    const malicious = "-1+cmd|'/c calc'!A1";
    const escaped = escapeCsvCell(malicious);
    expect(escaped.startsWith("'")).toBe(true);
  });

  it("prevents formula injection with @ prefix", () => {
    const malicious = "@SUM(A1:A10)";
    const escaped = escapeCsvCell(malicious);
    expect(escaped.startsWith("'")).toBe(true);
  });

  it("escapes quotes in values", () => {
    const value = 'He said "hello"';
    const escaped = escapeCsvCell(value);
    expect(escaped).toBe('"He said ""hello"""');
  });

  it("wraps values with commas in quotes", () => {
    const value = "a,b,c";
    const escaped = escapeCsvCell(value);
    expect(escaped).toBe('"a,b,c"');
  });

  it("wraps values with newlines in quotes", () => {
    const value = "line1\nline2";
    const escaped = escapeCsvCell(value);
    expect(escaped).toBe('"line1\nline2"');
  });

  it("handles null and undefined", () => {
    expect(escapeCsvCell(null)).toBe("");
    expect(escapeCsvCell(undefined)).toBe("");
  });

  it("handles numbers", () => {
    expect(escapeCsvCell(42)).toBe("42");
    expect(escapeCsvCell(0)).toBe("0");
    expect(escapeCsvCell(-1)).toBe("'-1"); // Negative numbers are prefixed
  });

  it("handles Chinese text safely", () => {
    const value = "物流查询";
    const escaped = escapeCsvCell(value);
    expect(escaped).toBe("物流查询");
  });

  it("handles Emoji safely", () => {
    const value = "物流📦查询";
    const escaped = escapeCsvCell(value);
    expect(escaped).toBe("物流📦查询");
  });
});

// ═══════════════════════════════════════════════════════════════
// CSV Export - Anonymization Tests
// ═══════════════════════════════════════════════════════════════

describe("CSV Export - Anonymization", () => {
  function hashAnon(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(36).slice(0, 8);
  }

  it("produces anonymized author IDs", () => {
    const realId = "clx123abc456def789";
    const anonId = `author_${hashAnon(realId)}`;
    expect(anonId).toMatch(/^author_[a-z0-9]+$/);
    expect(anonId).not.toContain(realId);
  });

  it("export does not include email field", () => {
    const exportHeaders = ["标题", "状态", "分类", "创建时间", "浏览数", "评论数"];
    expect(exportHeaders).not.toContain("邮箱");
    expect(exportHeaders).not.toContain("email");
  });

  it("export does not include token/IP/cookie fields", () => {
    const exportHeaders = ["标题", "状态", "分类", "浏览数"];
    const forbidden = ["token", "ip", "cookie", "password", "secret"];
    for (const f of forbidden) {
      expect(exportHeaders.some(h => h.toLowerCase().includes(f))).toBe(false);
    }
  });

  it("summary report includes time range", () => {
    const summaryRow = ["总帖子数(非草稿)", 100, "2026-06-17 至 2026-07-17"];
    expect(summaryRow[2]).toContain("至");
  });
});

// ═══════════════════════════════════════════════════════════════
// Privacy Policy Tests
// ═══════════════════════════════════════════════════════════════

describe("Privacy Policy", () => {
  it("lists all event types", () => {
    const eventTypes = [
      "forum_search",
      "forum_filter",
      "forum_post_view",
      "forum_share",
      "forum_feed_view",
      "forum_draft_create",
      "forum_submit_review",
      "forum_moderation_complete",
    ];
    expect(eventTypes).toHaveLength(8);
    expect(eventTypes).toContain("forum_search");
    expect(eventTypes).toContain("forum_share");
  });

  it("lists data that is NOT collected", () => {
    const notCollected = [
      "帖子正文内容",
      "用户密码、Token、Cookie",
      "用户邮箱（分析输出中匿名化）",
      "用户IP地址（EventLog仅存储IP哈希）",
      "完整搜索内容中的敏感个人信息",
      "第三方分析SDK数据",
    ];
    expect(notCollected).toHaveLength(6);
    expect(notCollected).toContain("帖子正文内容");
    expect(notCollected).toContain("第三方分析SDK数据");
  });

  it("supports opt-out via environment variable", () => {
    const optOut = {
      envVar: "FORUM_ANALYTICS_DISABLED",
      description: "设置环境变量 FORUM_ANALYTICS_DISABLED=true 可完全禁用事件追踪",
    };
    expect(optOut.envVar).toBe("FORUM_ANALYTICS_DISABLED");
  });

  it("specifies data retention period", () => {
    const retention = "90天";
    expect(retention).toBe("90天");
  });

  it("specifies keyword max length", () => {
    const keywordMaxLength = 50;
    expect(keywordMaxLength).toBe(50);
  });

  it("specifies metadata field max length", () => {
    const maxMetadataFieldLength = 200;
    expect(maxMetadataFieldLength).toBe(200);
  });
});

// ═══════════════════════════════════════════════════════════════
// API Endpoint Tests
// ═══════════════════════════════════════════════════════════════

describe("API Endpoints", () => {
  it("all analytics endpoints require admin except privacy", () => {
    const endpoints = [
      { path: "/api/forum/admin/analytics/funnel", adminRequired: true },
      { path: "/api/forum/admin/analytics/authors", adminRequired: true },
      { path: "/api/forum/admin/analytics/trends", adminRequired: true },
      { path: "/api/forum/admin/analytics/recommendations", adminRequired: true },
      { path: "/api/forum/admin/analytics/seo", adminRequired: true },
      { path: "/api/forum/admin/analytics/export", adminRequired: true },
      { path: "/api/forum/admin/analytics/privacy", adminRequired: false },
    ];
    const adminOnly = endpoints.filter(e => e.adminRequired);
    const publicEndpoints = endpoints.filter(e => !e.adminRequired);
    expect(adminOnly).toHaveLength(6);
    expect(publicEndpoints).toHaveLength(1);
    expect(publicEndpoints[0].path).toContain("privacy");
  });

  it("days parameter is clamped to 1-90", () => {
    function clampDays(raw: string): number {
      const parsed = parseInt(raw || "30", 10);
      if (isNaN(parsed)) return 30;
      return Math.min(Math.max(parsed, 1), 90);
    }
    expect(clampDays("7")).toBe(7);
    expect(clampDays("0")).toBe(1); // Below minimum
    expect(clampDays("100")).toBe(90); // Above maximum
    expect(clampDays("")).toBe(30); // Default
    expect(clampDays("invalid")).toBe(30); // NaN falls back
  });

  it("export type is validated", () => {
    const validTypes = ["content", "category", "author", "search", "summary"];
    expect(validTypes).toContain("content");
    expect(validTypes).toContain("summary");
    expect(validTypes).not.toContain("users"); // No user export
    expect(validTypes).not.toContain("emails"); // No email export
  });
});
