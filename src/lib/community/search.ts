/**
 * Enhanced search utilities for the forum.
 *
 * Features:
 * - Title weighting (title matches rank higher than content matches)
 * - Phrase matching (exact phrase gets boost)
 * - Tag matching (tag hits get boost)
 * - Category matching (category hits get boost)
 * - Special character sanitization
 * - Query length limiting
 * - Search result highlighting
 * - Empty result suggestions
 */

// ─── Constants ───

/** Maximum query length to prevent database overload */
export const MAX_SEARCH_QUERY_LENGTH = 100;

/** Minimum meaningful query length */
export const MIN_SEARCH_QUERY_LENGTH = 2;

// ─── Query Sanitization ───

/**
 * Sanitize a search query for safe database use.
 * - Removes SQL-like patterns
 * - Limits length
 * - Strips control characters
 * - Preserves CJK characters
 */
export function sanitizeSearchQuery(raw: string): string {
  if (!raw || typeof raw !== "string") return "";

  // Remove control characters
  let q = raw.replace(/[\x00-\x1F\x7F]/g, "");

  // Remove SQL injection patterns (defensive, Prisma already parameterizes)
  q = q.replace(/['";\\]/g, "");

  // Limit length
  q = q.slice(0, MAX_SEARCH_QUERY_LENGTH);

  // Trim
  q = q.trim();

  return q;
}

/**
 * Validate search query. Returns error message if invalid.
 */
export function validateSearchQuery(q: string): { valid: boolean; error?: string } {
  if (!q) return { valid: true }; // Empty query is valid (returns all)
  if (q.length < MIN_SEARCH_QUERY_LENGTH) {
    return { valid: false, error: `搜索关键词至少 ${MIN_SEARCH_QUERY_LENGTH} 个字符` };
  }
  if (q.length > MAX_SEARCH_QUERY_LENGTH) {
    return { valid: false, error: `搜索关键词不能超过 ${MAX_SEARCH_QUERY_LENGTH} 个字符` };
  }
  return { valid: true };
}

// ─── Search Relevance ───

export interface SearchRelevanceResult {
  /** Score for sorting (higher = more relevant) */
  score: number;
  /** Breakdown of how the score was calculated */
  breakdown: { label: string; value: number }[];
  /** Whether the title matched */
  titleMatch: boolean;
  /** Whether the content matched */
  contentMatch: boolean;
  /** Whether a tag matched */
  tagMatch: boolean;
  /** Whether the category matched */
  categoryMatch: boolean;
}

/**
 * Calculate search relevance score for a post.
 *
 * Weights:
 *   Title match:    +100 (exact phrase) / +50 (partial)
 *   Content match:  +20 (exact phrase) / +10 (partial)
 *   Tag match:      +40
 *   Category match: +30
 *   Featured boost: +10
 *   Solved boost:   +5
 *   Recent boost:   +5 (within 7 days)
 */
export function calculateSearchRelevance(params: {
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

  // Title match
  const titleMatch = title.includes(q);
  const titleExactMatch = title === q || title.startsWith(q);
  const titleScore = titleExactMatch ? 100 : titleMatch ? 50 : 0;
  score += titleScore;
  if (titleScore) breakdown.push({ label: "标题匹配", value: titleScore });

  // Content match
  const contentMatch = content.includes(q);
  const contentScore = contentMatch ? 10 : 0;
  score += contentScore;
  if (contentScore) breakdown.push({ label: "内容匹配", value: contentScore });

  // Tag match
  const tagMatch = tags.some((t) => t.toLowerCase().includes(q));
  const tagScore = tagMatch ? 40 : 0;
  score += tagScore;
  if (tagScore) breakdown.push({ label: "标签匹配", value: tagScore });

  // Category match
  const categoryMatch = category.includes(q);
  const categoryScore = categoryMatch ? 30 : 0;
  score += categoryScore;
  if (categoryScore) breakdown.push({ label: "分类匹配", value: categoryScore });

  // Featured boost
  if (params.isFeatured) {
    score += 10;
    breakdown.push({ label: "精华加成", value: 10 });
  }

  // Solved boost
  if (params.isSolved) {
    score += 5;
    breakdown.push({ label: "已解决加成", value: 5 });
  }

  // Recent boost (within 7 days)
  const ageDays = (Date.now() - params.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 7) {
    score += 5;
    breakdown.push({ label: "近期内容加成", value: 5 });
  }

  return {
    score,
    breakdown,
    titleMatch,
    contentMatch,
    tagMatch,
    categoryMatch,
  };
}

// ─── Highlighting ───

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

/**
 * Split text into segments, highlighting the query match.
 * Returns segments for rendering in the UI.
 */
export function highlightSearchMatch(
  text: string,
  query: string,
  maxContextLength = 200
): HighlightSegment[] {
  if (!query || !text) return [{ text: text.slice(0, maxContextLength), highlighted: false }];

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Find first match position
  const matchIndex = lowerText.indexOf(lowerQuery);
  if (matchIndex === -1) {
    return [{ text: text.slice(0, maxContextLength), highlighted: false }];
  }

  // Calculate context window around the match
  const matchEnd = matchIndex + query.length;
  const contextStart = Math.max(0, matchIndex - 50);
  const contextEnd = Math.min(text.length, matchEnd + 50);

  const segments: HighlightSegment[] = [];

  // Before match
  if (contextStart < matchIndex) {
    const prefix = text.slice(contextStart, matchIndex);
    segments.push({ text: contextStart > 0 ? `...${prefix}` : prefix, highlighted: false });
  }

  // The match itself
  segments.push({ text: text.slice(matchIndex, matchEnd), highlighted: true });

  // After match
  if (matchEnd < contextEnd) {
    const suffix = text.slice(matchEnd, contextEnd);
    segments.push({ text: contextEnd < text.length ? `${suffix}...` : suffix, highlighted: false });
  }

  return segments;
}

// ─── Empty Result Suggestions ───

export interface SearchSuggestion {
  type: "spelling" | "popular_tag" | "category" | "tip";
  text: string;
  href?: string;
}

/**
 * Generate suggestions when search returns no results.
 */
export function generateEmptySearchSuggestions(query: string, popularTags: string[], categories: { key: string; name: string }[]): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = [];

  // Spelling suggestion (simple - remove spaces, try shorter)
  if (query.length > 4) {
    const shorter = query.slice(0, -1);
    suggestions.push({
      type: "spelling",
      text: `尝试更短的关键词："${shorter}"`,
      href: `/bbs?q=${encodeURIComponent(shorter)}`,
    });
  }

  // Popular tags
  if (popularTags.length > 0) {
    suggestions.push({
      type: "popular_tag",
      text: `热门标签：${popularTags.slice(0, 3).join("、")}`,
      href: `/bbs?tag=${encodeURIComponent(popularTags[0])}`,
    });
  }

  // Category suggestion
  if (categories.length > 0) {
    suggestions.push({
      type: "category",
      text: `浏览分类：${categories.slice(0, 3).map((c) => c.name).join("、")}`,
      href: `/bbs/category/${categories[0].key}`,
    });
  }

  // Search tip
  suggestions.push({
    type: "tip",
    text: "搜索提示：使用更简洁的关键词，或尝试按分类浏览",
  });

  return suggestions;
}

// ─── Search Query Builder ───

/**
 * Build a Prisma where clause for forum post search.
 * Title matches are prioritized via separate OR clauses.
 */
export function buildSearchWhereClause(query: string): Record<string, unknown> {
  const q = sanitizeSearchQuery(query);
  if (!q) {
    return { status: "published" };
  }

  return {
    status: "published",
    OR: [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ],
  };
}
