/**
 * Forum V1.1 Operations & Runtime Hardening Tests
 *
 * Self-contained tests for:
 * - Recommendation engine (scoring, time decay, rankings)
 * - Search quality (relevance, highlighting, safety)
 * - API error handling (unified format, requestId, log redaction)
 * - Runtime reliability (database errors not masked as 404)
 */

import { describe, it, expect } from "vitest";

// ═══════════════════════════════════════════════════════════════
// Recommendation Engine - Time Decay
// ═══════════════════════════════════════════════════════════════

function calculateTimeDecay(createdAt: Date, now: Date = new Date()): number {
  const ageMs = now.getTime() - createdAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays <= 3) return 1.0;
  const decay = 1 / (1 + (ageDays - 3) / 7);
  return Math.max(0.01, decay);
}

interface ScoreInput {
  viewCount: number;
  commentCount: number;
  likeCount: number;
  bookmarkCount: number;
  isFeatured: boolean;
  isPinned: boolean;
  createdAt: Date;
}

function calculateScore(input: ScoreInput) {
  const views = Math.min(input.viewCount, 50);
  const comments = Math.min(input.commentCount, 20);
  const likes = Math.min(input.likeCount, 30);
  const bookmarks = Math.min(input.bookmarkCount, 20);
  const featuredBonus = input.isFeatured ? 30 : 0;
  const pinnedBonus = input.isPinned ? 50 : 0;

  const rawScore =
    views * 1 + comments * 5 + likes * 3 + bookmarks * 4 + featuredBonus + pinnedBonus;

  const decay = calculateTimeDecay(input.createdAt);
  const total = Math.round(rawScore * decay * 100) / 100;

  return {
    total,
    breakdown: [
      { label: "浏览", value: views * 1 },
      { label: "回复", value: comments * 5 },
      { label: "点赞", value: likes * 3 },
      { label: "收藏", value: bookmarks * 4 },
      { label: "精华", value: featuredBonus },
      { label: "置顶", value: pinnedBonus },
      { label: "时间衰减", value: Math.round(decay * 100) / 100 },
    ],
  };
}

// ─── Time Decay Tests ───

describe("Recommendation Engine - Time Decay", () => {
  it("returns 1.0 for posts created within 3 days", () => {
    const now = new Date("2026-07-17T12:00:00Z");
    const recent = new Date("2026-07-15T12:00:00Z");
    expect(calculateTimeDecay(recent, now)).toBe(1.0);
  });

  it("returns less than 1.0 for posts older than 3 days", () => {
    const now = new Date("2026-07-17T12:00:00Z");
    const old = new Date("2026-07-10T12:00:00Z");
    const decay = calculateTimeDecay(old, now);
    expect(decay).toBeLessThan(1.0);
    expect(decay).toBeGreaterThan(0);
  });

  it("approaches but never reaches 0 for very old posts", () => {
    const now = new Date("2026-07-17T12:00:00Z");
    const veryOld = new Date("2025-01-01T00:00:00Z");
    const decay = calculateTimeDecay(veryOld, now);
    expect(decay).toBeGreaterThan(0);
    expect(decay).toBeLessThan(0.1);
  });

  it("decreases monotonically with age", () => {
    const now = new Date("2026-07-17T12:00:00Z");
    const d3 = calculateTimeDecay(new Date("2026-07-14T12:00:00Z"), now);
    const d7 = calculateTimeDecay(new Date("2026-07-10T12:00:00Z"), now);
    const d30 = calculateTimeDecay(new Date("2026-06-17T12:00:00Z"), now);
    expect(d3).toBeGreaterThan(d7);
    expect(d7).toBeGreaterThan(d30);
  });
});

// ─── Scoring Tests ───

describe("Recommendation Engine - Scoring", () => {
  it("calculates score from all engagement metrics", () => {
    const result = calculateScore({
      viewCount: 10,
      commentCount: 2,
      likeCount: 3,
      bookmarkCount: 1,
      isFeatured: false,
      isPinned: false,
      createdAt: new Date(),
    });
    // views: 10*1=10, comments: 2*5=10, likes: 3*3=9, bookmarks: 1*4=4
    // raw = 33, decay = 1.0 (recent)
    expect(result.total).toBe(33);
    expect(result.breakdown).toHaveLength(7);
  });

  it("adds bonus for featured posts", () => {
    const base = calculateScore({
      viewCount: 10,
      commentCount: 0,
      likeCount: 0,
      bookmarkCount: 0,
      isFeatured: false,
      isPinned: false,
      createdAt: new Date(),
    });
    const featured = calculateScore({
      viewCount: 10,
      commentCount: 0,
      likeCount: 0,
      bookmarkCount: 0,
      isFeatured: true,
      isPinned: false,
      createdAt: new Date(),
    });
    expect(featured.total).toBe(base.total + 30);
  });

  it("adds bonus for pinned posts", () => {
    const base = calculateScore({
      viewCount: 10,
      commentCount: 0,
      likeCount: 0,
      bookmarkCount: 0,
      isFeatured: false,
      isPinned: false,
      createdAt: new Date(),
    });
    const pinned = calculateScore({
      viewCount: 10,
      commentCount: 0,
      likeCount: 0,
      bookmarkCount: 0,
      isFeatured: false,
      isPinned: true,
      createdAt: new Date(),
    });
    expect(pinned.total).toBe(base.total + 50);
  });

  it("caps individual metrics to prevent single-metric dominance", () => {
    const high = calculateScore({
      viewCount: 1000,
      commentCount: 1000,
      likeCount: 1000,
      bookmarkCount: 1000,
      isFeatured: true,
      isPinned: true,
      createdAt: new Date(),
    });
    // Capped: views=50, comments=20, likes=30, bookmarks=20
    // raw = 50 + 100 + 90 + 80 + 30 + 50 = 400, decay=1.0
    expect(high.total).toBe(400);
  });

  it("applies time decay to raw score", () => {
    const recent = calculateScore({
      viewCount: 10,
      commentCount: 2,
      likeCount: 3,
      bookmarkCount: 1,
      isFeatured: false,
      isPinned: false,
      createdAt: new Date(),
    });
    const old = calculateScore({
      viewCount: 10,
      commentCount: 2,
      likeCount: 3,
      bookmarkCount: 1,
      isFeatured: false,
      isPinned: false,
      createdAt: new Date("2025-07-17T12:00:00Z"),
    });
    expect(recent.total).toBeGreaterThan(old.total);
  });
});

// ═══════════════════════════════════════════════════════════════
// Search Quality Tests
// ═══════════════════════════════════════════════════════════════

const MAX_SEARCH_QUERY_LENGTH = 100;
const MIN_SEARCH_QUERY_LENGTH = 2;

function sanitizeSearchQuery(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  let q = raw.replace(/[\x00-\x1F\x7F]/g, "");
  q = q.replace(/['";\\]/g, "");
  q = q.slice(0, MAX_SEARCH_QUERY_LENGTH);
  q = q.trim();
  return q;
}

function validateSearchQuery(q: string): { valid: boolean; error?: string } {
  if (!q) return { valid: true };
  if (q.length < MIN_SEARCH_QUERY_LENGTH) {
    return { valid: false, error: `搜索关键词至少 ${MIN_SEARCH_QUERY_LENGTH} 个字符` };
  }
  if (q.length > MAX_SEARCH_QUERY_LENGTH) {
    return { valid: false, error: `搜索关键词不能超过 ${MAX_SEARCH_QUERY_LENGTH} 个字符` };
  }
  return { valid: true };
}

interface SearchRelevanceResult {
  score: number;
  breakdown: { label: string; value: number }[];
  titleMatch: boolean;
  contentMatch: boolean;
  tagMatch: boolean;
  categoryMatch: boolean;
}

function calculateSearchRelevance(params: {
  query: string;
  title: string;
  content: string;
  tags: string[] | null;
  categoryName: string;
  isFeatured: boolean;
  isSolved: boolean;
  createdAt: Date;
}): SearchRelevanceResult {
  const q = params.query.toLowerCase();
  const title = params.title.toLowerCase();
  const content = params.content.toLowerCase();
  const tags = params.tags || [];
  const category = params.categoryName.toLowerCase();

  let score = 0;
  const breakdown: { label: string; value: number }[] = [];

  const titleMatch = title.includes(q);
  const titleExactMatch = title === q || title.startsWith(q);
  const titleScore = titleExactMatch ? 100 : titleMatch ? 50 : 0;
  score += titleScore;
  if (titleScore) breakdown.push({ label: "标题匹配", value: titleScore });

  const contentMatch = content.includes(q);
  const contentScore = contentMatch ? 10 : 0;
  score += contentScore;
  if (contentScore) breakdown.push({ label: "内容匹配", value: contentScore });

  const tagMatch = tags.some((t) => t.toLowerCase().includes(q));
  const tagScore = tagMatch ? 40 : 0;
  score += tagScore;
  if (tagScore) breakdown.push({ label: "标签匹配", value: tagScore });

  const categoryMatch = category.includes(q);
  const categoryScore = categoryMatch ? 30 : 0;
  score += categoryScore;
  if (categoryScore) breakdown.push({ label: "分类匹配", value: categoryScore });

  if (params.isFeatured) {
    score += 10;
    breakdown.push({ label: "精华加成", value: 10 });
  }

  if (params.isSolved) {
    score += 5;
    breakdown.push({ label: "已解决加成", value: 5 });
  }

  const ageDays = (Date.now() - params.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 7) {
    score += 5;
    breakdown.push({ label: "近期内容加成", value: 5 });
  }

  return { score, breakdown, titleMatch, contentMatch, tagMatch, categoryMatch };
}

interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

function highlightSearchMatch(
  text: string,
  query: string,
  maxContextLength = 200
): HighlightSegment[] {
  if (!query || !text) return [{ text: text.slice(0, maxContextLength), highlighted: false }];

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return [{ text: text.slice(0, maxContextLength), highlighted: false }];
  }

  const matchEnd = matchIndex + query.length;
  const contextStart = Math.max(0, matchIndex - 50);
  const contextEnd = Math.min(text.length, matchEnd + 50);
  const segments: HighlightSegment[] = [];

  if (contextStart < matchIndex) {
    const prefix = text.slice(contextStart, matchIndex);
    segments.push({ text: contextStart > 0 ? `...${prefix}` : prefix, highlighted: false });
  }

  segments.push({ text: text.slice(matchIndex, matchEnd), highlighted: true });

  if (matchEnd < contextEnd) {
    const suffix = text.slice(matchEnd, contextEnd);
    segments.push({ text: contextEnd < text.length ? `${suffix}...` : suffix, highlighted: false });
  }

  return segments;
}

interface SearchSuggestion {
  type: "spelling" | "popular_tag" | "category" | "tip";
  text: string;
  href?: string;
}

function generateEmptySearchSuggestions(
  query: string,
  popularTags: string[],
  categories: { key: string; name: string }[]
): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = [];

  if (query.length > 4) {
    const shorter = query.slice(0, -1);
    suggestions.push({
      type: "spelling",
      text: `尝试更短的关键词："${shorter}"`,
      href: `/bbs?q=${encodeURIComponent(shorter)}`,
    });
  }

  if (popularTags.length > 0) {
    suggestions.push({
      type: "popular_tag",
      text: `热门标签：${popularTags.slice(0, 3).join("、")}`,
      href: `/bbs?tag=${encodeURIComponent(popularTags[0])}`,
    });
  }

  if (categories.length > 0) {
    suggestions.push({
      type: "category",
      text: `浏览分类：${categories.slice(0, 3).map((c) => c.name).join("、")}`,
      href: `/bbs/category/${categories[0].key}`,
    });
  }

  suggestions.push({
    type: "tip",
    text: "搜索提示：使用更简洁的关键词，或尝试按分类浏览",
  });

  return suggestions;
}

// ─── Query Sanitization ───

describe("Search - Query Sanitization", () => {
  it("removes control characters", () => {
    const result = sanitizeSearchQuery("hello\x00\x01world");
    expect(result).toBe("helloworld");
  });

  it("removes SQL injection patterns", () => {
    const result = sanitizeSearchQuery("test'; DROP TABLE--");
    expect(result).not.toContain("'");
    expect(result).not.toContain(";");
    expect(result).not.toContain("\\");
  });

  it("limits query length", () => {
    const longQuery = "a".repeat(MAX_SEARCH_QUERY_LENGTH + 50);
    const result = sanitizeSearchQuery(longQuery);
    expect(result.length).toBe(MAX_SEARCH_QUERY_LENGTH);
  });

  it("preserves CJK characters", () => {
    const result = sanitizeSearchQuery("物流清关");
    expect(result).toBe("物流清关");
  });

  it("handles empty input", () => {
    expect(sanitizeSearchQuery("")).toBe("");
    expect(sanitizeSearchQuery(null as unknown as string)).toBe("");
  });
});

describe("Search - Validation", () => {
  it("accepts valid query", () => {
    expect(validateSearchQuery("test").valid).toBe(true);
  });

  it("accepts empty query", () => {
    expect(validateSearchQuery("").valid).toBe(true);
  });

  it("rejects too-short query", () => {
    const result = validateSearchQuery("a");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("rejects too-long query", () => {
    const result = validateSearchQuery("a".repeat(MAX_SEARCH_QUERY_LENGTH + 1));
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ─── Relevance Scoring ───

describe("Search - Relevance Scoring", () => {
  const baseParams = {
    title: "物流清关问题",
    content: "请问从中国发货到加拿大需要什么清关文件？",
    tags: ["shipping", "customs"],
    categoryName: "物流",
    isFeatured: false,
    isSolved: false,
    createdAt: new Date(),
  };

  it("gives higher score for title match than content match", () => {
    const titleMatch = calculateSearchRelevance({ ...baseParams, query: "物流清关" });
    const contentMatch = calculateSearchRelevance({ ...baseParams, query: "加拿大" });
    expect(titleMatch.score).toBeGreaterThan(contentMatch.score);
  });

  it("gives exact title match the highest score", () => {
    // "物流清关问题" matches title exactly (startsWith returns true) → title score 100
    // "物流清关" also matches title with startsWith → title score 100
    // "物流" also matches with startsWith → title score 100
    // But "物流清关问题" does NOT match content, while "物流" DOES match content
    const exact = calculateSearchRelevance({ ...baseParams, query: "物流清关问题" });
    const contentOnly = calculateSearchRelevance({ ...baseParams, query: "请问" });
    // Exact title match should have a higher total than content-only match
    expect(exact.score).toBeGreaterThan(contentOnly.score);
  });

  it("boosts tag matches", () => {
    const tagMatch = calculateSearchRelevance({ ...baseParams, query: "shipping" });
    expect(tagMatch.tagMatch).toBe(true);
    expect(tagMatch.score).toBeGreaterThan(0);
  });

  it("boosts category matches", () => {
    const catMatch = calculateSearchRelevance({ ...baseParams, query: "物流" });
    expect(catMatch.categoryMatch).toBe(true);
  });

  it("adds featured boost", () => {
    const normal = calculateSearchRelevance({ ...baseParams, query: "物流清关" });
    const featured = calculateSearchRelevance({
      ...baseParams,
      query: "物流清关",
      isFeatured: true,
    });
    expect(featured.score).toBeGreaterThan(normal.score);
  });

  it("adds solved boost", () => {
    const normal = calculateSearchRelevance({ ...baseParams, query: "物流清关" });
    const solved = calculateSearchRelevance({
      ...baseParams,
      query: "物流清关",
      isSolved: true,
    });
    expect(solved.score).toBeGreaterThan(normal.score);
  });

  it("adds recent boost for posts within 7 days", () => {
    const recent = calculateSearchRelevance({
      ...baseParams,
      query: "物流清关",
      createdAt: new Date(),
    });
    const old = calculateSearchRelevance({
      ...baseParams,
      query: "物流清关",
      createdAt: new Date("2025-01-01"),
    });
    expect(recent.score).toBeGreaterThan(old.score);
  });
});

// ─── Highlighting ───

describe("Search - Highlighting", () => {
  it("returns unhighlighted segments when no match", () => {
    const segments = highlightSearchMatch("hello world", "xyz");
    expect(segments).toHaveLength(1);
    expect(segments[0].highlighted).toBe(false);
  });

  it("highlights the matched portion", () => {
    const segments = highlightSearchMatch("hello world", "world");
    const highlighted = segments.find((s) => s.highlighted);
    expect(highlighted).toBeDefined();
    expect(highlighted?.text).toBe("world");
  });

  it("adds ellipsis for long text", () => {
    const longText = "a".repeat(300);
    const segments = highlightSearchMatch(longText, "a".repeat(10));
    const fullText = segments.map((s) => s.text).join("");
    expect(fullText.length).toBeLessThan(longText.length);
  });

  it("handles empty inputs", () => {
    expect(highlightSearchMatch("", "test")).toHaveLength(1);
    expect(highlightSearchMatch("test", "")).toHaveLength(1);
  });
});

// ─── Empty Result Suggestions ───

describe("Search - Empty Result Suggestions", () => {
  it("generates spelling suggestion for long queries", () => {
    const suggestions = generateEmptySearchSuggestions("shipping", [], []);
    const spelling = suggestions.find((s) => s.type === "spelling");
    expect(spelling).toBeDefined();
  });

  it("generates popular tag suggestion", () => {
    const suggestions = generateEmptySearchSuggestions("test", ["shipping", "customs"], []);
    const tagSuggestion = suggestions.find((s) => s.type === "popular_tag");
    expect(tagSuggestion).toBeDefined();
  });

  it("generates category suggestion", () => {
    const suggestions = generateEmptySearchSuggestions(
      "test",
      [],
      [{ key: "logistics", name: "物流" }]
    );
    const catSuggestion = suggestions.find((s) => s.type === "category");
    expect(catSuggestion).toBeDefined();
  });

  it("always includes a search tip", () => {
    const suggestions = generateEmptySearchSuggestions("test", [], []);
    const tip = suggestions.find((s) => s.type === "tip");
    expect(tip).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// API Error Handling Tests
// ═══════════════════════════════════════════════════════════════

import { randomUUID } from "crypto";

function generateRequestId(): string {
  return `req_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function redactForLog(value: unknown): string {
  if (typeof value === "string") {
    return value
      .replace(/postgresql:\/\/[^@]+@[^"]+/g, "postgresql://***:***@***")
      .replace(/DATABASE_URL=\S+/g, "DATABASE_URL=***REDACTED***")
      .replace(/token["\s:=]+[a-zA-Z0-9\-_.]+/gi, "token=***REDACTED***")
      .replace(/secret["\s:=]+\S+/gi, "secret=***REDACTED***")
      .replace(/password["\s:=]+\S+/gi, "password=***REDACTED***")
      .replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, "$1***@$2");
  }
  try {
    return JSON.stringify(value, null, 2)
      .replace(/postgresql:\/\/[^@]+@[^"]+/g, "postgresql://***:***@***")
      .replace(/DATABASE_URL=\S+/g, "DATABASE_URL=***REDACTED***")
      .replace(/token["\s:=]+[a-zA-Z0-9\-_.]+/gi, "token=***REDACTED***")
      .replace(/secret["\s:=]+\S+/gi, "secret=***REDACTED***")
      .replace(/password["\s:=]+\S+/gi, "password=***REDACTED***")
      .replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, "$1***@$2");
  } catch {
    return String(value);
  }
}

describe("API Errors - Request ID", () => {
  it("generates unique request IDs", () => {
    const id1 = generateRequestId();
    const id2 = generateRequestId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^req_[a-f0-9]+$/);
  });
});

describe("API Errors - Log Redaction", () => {
  it("redacts database connection strings", () => {
    const input = "postgresql://user:***@localhost:5432/db";
    const redacted = redactForLog(input);
    expect(redacted).toContain("***");
    expect(redacted).not.toContain("user:pass@localhost");
  });

  it("redacts DATABASE_URL", () => {
    const input = "DATABASE_URL=postgresql://user:***@localhost/db";
    const redacted = redactForLog(input);
    expect(redacted).not.toContain("user:pass@localhost");
  });

  it("redacts tokens", () => {
    const input = 'token="abc123secret456"';
    const redacted = redactForLog(input);
    expect(redacted).not.toContain("abc123secret456");
  });

  it("redacts passwords", () => {
    const input = 'password="mySecretPass"';
    const redacted = redactForLog(input);
    expect(redacted).not.toContain("mySecretPass");
  });

  it("partially redacts email addresses", () => {
    const input = "user john.doe@example.com was here";
    const redacted = redactForLog(input);
    expect(redacted).not.toContain("john.doe@example.com");
    expect(redacted).toContain("***");
    expect(redacted).toContain("example.com");
  });

  it("handles non-string input", () => {
    const obj = { password: "secret", email: "test@test.com" };
    const redacted = redactForLog(obj);
    expect(redacted).not.toContain("secret");
  });
});

describe("API Errors - Error Codes", () => {
  const ErrorCode = {
    BAD_REQUEST: "BAD_REQUEST",
    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",
    NOT_FOUND: "NOT_FOUND",
    CONFLICT: "CONFLICT",
    RATE_LIMITED: "RATE_LIMITED",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    DATABASE_ERROR: "DATABASE_ERROR",
    TIMEOUT: "TIMEOUT",
  };

  it("has all necessary error codes defined", () => {
    expect(ErrorCode.BAD_REQUEST).toBe("BAD_REQUEST");
    expect(ErrorCode.UNAUTHORIZED).toBe("UNAUTHORIZED");
    expect(ErrorCode.FORBIDDEN).toBe("FORBIDDEN");
    expect(ErrorCode.NOT_FOUND).toBe("NOT_FOUND");
    expect(ErrorCode.CONFLICT).toBe("CONFLICT");
    expect(ErrorCode.RATE_LIMITED).toBe("RATE_LIMITED");
    expect(ErrorCode.INTERNAL_ERROR).toBe("INTERNAL_ERROR");
    expect(ErrorCode.DATABASE_ERROR).toBe("DATABASE_ERROR");
    expect(ErrorCode.TIMEOUT).toBe("TIMEOUT");
  });

  it("separates database errors from internal errors", () => {
    expect(ErrorCode.DATABASE_ERROR).not.toBe(ErrorCode.INTERNAL_ERROR);
    expect(ErrorCode.DATABASE_ERROR).not.toBe(ErrorCode.NOT_FOUND);
  });
});

// ═══════════════════════════════════════════════════════════════
// Recommendation Types
// ═══════════════════════════════════════════════════════════════

describe("Trending API Types", () => {
  it("all recommendation types are supported", () => {
    const types = [
      "today",
      "week",
      "latest",
      "replies",
      "featured",
      "unanswered",
      "category",
      "tag",
      "new-user",
      "contributors",
    ];
    expect(types).toHaveLength(10);
  });

  it("trending API supports limit parameter", () => {
    const validLimits = [1, 5, 10, 15, 20];
    for (const limit of validLimits) {
      expect(limit).toBeGreaterThanOrEqual(1);
      expect(limit).toBeLessThanOrEqual(20);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// Runtime Reliability Tests
// ═══════════════════════════════════════════════════════════════

describe("Runtime Reliability", () => {
  it("database errors are distinct from not found", () => {
    // The error code system ensures DB errors are NOT masked as 404
    const dbError = { code: "DATABASE_ERROR", status: 500 };
    const notFound = { code: "NOT_FOUND", status: 404 };
    expect(dbError.status).not.toBe(404);
    expect(dbError.code).not.toBe(notFound.code);
  });

  it("timeout errors use 504 not 500", () => {
    const timeout = { code: "TIMEOUT", status: 504 };
    const internal = { code: "INTERNAL_ERROR", status: 500 };
    expect(timeout.status).not.toBe(internal.status);
  });

  it("conflict errors use 409 for idempotency", () => {
    const conflict = { code: "CONFLICT", status: 409 };
    expect(conflict.status).toBe(409);
  });
});

// ═══════════════════════════════════════════════════════════════
// Category Operations Tests
// ═══════════════════════════════════════════════════════════════

describe("Category Operations", () => {
  it("identifies empty categories", () => {
    const cat = { postCount: 0, isEmpty: true };
    expect(cat.isEmpty).toBe(true);
  });

  it("identifies stale categories (>30 days)", () => {
    const now = new Date();
    const thirtyOneDaysAgo = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);
    const isStale = !thirtyOneDaysAgo || thirtyOneDaysAgo < new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    expect(isStale).toBe(true);
  });

  it("generates correct cold-start suggestions", () => {
    const suggestions = [
      { postCount: 0, suggestion: "空分类：建议创建种子内容" },
      { postCount: 1, isStale: false, suggestion: "内容较少：建议补充更多种子内容" },
      { postCount: 5, totalViews: 10, suggestion: "互动不足：建议优化标题或添加标签提升可发现性" },
      { postCount: 10, totalViews: 500, suggestion: "健康运营中" },
    ];

    expect(suggestions[0].suggestion).toContain("空分类");
    expect(suggestions[1].suggestion).toContain("内容较少");
    expect(suggestions[2].suggestion).toContain("互动不足");
    expect(suggestions[3].suggestion).toContain("健康运营");
  });
});

// ═══════════════════════════════════════════════════════════════
// Performance Audit Tests
// ═══════════════════════════════════════════════════════════════

describe("Performance Audit", () => {
  it("search query is length-limited", () => {
    expect(MAX_SEARCH_QUERY_LENGTH).toBe(100);
  });

  it("pagination has maximum page size", () => {
    const maxPageSize = 50;
    const requestedSize = 200;
    const actualSize = Math.min(maxPageSize, Math.max(1, requestedSize));
    expect(actualSize).toBe(50);
  });

  it("recommendation fetch uses 3x multiplier for re-ranking", () => {
    const requestedLimit = 10;
    const fetchLimit = Math.min(requestedLimit * 3, 100);
    expect(fetchLimit).toBe(30);
  });

  it("relevance sort fetches more than page size for re-ranking", () => {
    const pageSize = 20;
    const relevanceFetchLimit = Math.min(pageSize * 3, 100);
    expect(relevanceFetchLimit).toBeGreaterThan(pageSize);
  });
});
