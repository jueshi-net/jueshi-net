/**
 * Anti-spam and content risk control utilities for the forum.
 *
 * These functions provide lightweight, schema-free checks that can be
 * layered on top of existing rate-limit / duplicate-content checks
 * without modifying the Prisma schema or introducing third-party services.
 */

/**
 * Result of a content risk check.
 */
export interface ContentRiskResult {
  /** true when the content passes all checks and is safe to accept */
  ok: boolean;
  /** human-readable error message when ok=false */
  error?: string;
  /** machine-readable risk code */
  code?: string;
}

/** Maximum number of external links allowed in a post */
export const MAX_EXTERNAL_LINKS = 5;

/** Maximum number of times the same link can appear */
export const MAX_DUPLICATE_LINKS = 3;

/** Maximum consecutive identical characters (e.g. "aaaaaaa") */
export const MAX_CONSECUTIVE_CHARS = 20;

/** Minimum meaningful content ratio (non-whitespace, non-punctuation) */
export const MIN_MEANINGFUL_RATIO = 0.3;

/** URL regex – matches http(s) and bare-domain patterns */
const URL_REGEX = /https?:\/\/[^\s<>"']+/gi;
const BARE_DOMAIN_REGEX = /\b[a-z0-9-]+\.(com|cn|net|org|io|me|cc|co|xyz|info)\b/gi;

/**
 * Extract all URLs from text (both full and bare-domain forms).
 * Returns duplicates if the same URL appears multiple times.
 */
export function extractUrls(text: string): string[] {
  const urls: string[] = [];
  const fullUrlRanges: { start: number; end: number }[] = [];

  // First pass: collect full http(s) URLs and their positions
  URL_REGEX.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = URL_REGEX.exec(text)) !== null) {
    urls.push(m[0].toLowerCase());
    fullUrlRanges.push({ start: m.index, end: m.index + m[0].length });
  }

  // Second pass: collect bare domains only if they don't overlap with a full URL
  BARE_DOMAIN_REGEX.lastIndex = 0;
  while ((m = BARE_DOMAIN_REGEX.exec(text)) !== null) {
    const domainStart = m.index;
    const domainEnd = m.index + m[0].length;
    const overlaps = fullUrlRanges.some(
      (r) => domainStart >= r.start && domainEnd <= r.end
    );
    if (!overlaps) {
      urls.push(m[0].toLowerCase());
    }
  }

  return urls;
}

/**
 * Check external link count and duplicate link suspicion.
 */
export function checkExternalLinks(
  text: string,
  maxLinks = MAX_EXTERNAL_LINKS,
  maxDupes = MAX_DUPLICATE_LINKS
): ContentRiskResult {
  const urls = extractUrls(text);

  if (urls.length > maxLinks) {
    return {
      ok: false,
      error: `内容包含过多外部链接（最多 ${maxLinks} 个）`,
      code: "too_many_links",
    };
  }

  // Check for suspicious repeated links
  const linkCounts = new Map<string, number>();
  for (const url of urls) {
    linkCounts.set(url, (linkCounts.get(url) || 0) + 1);
  }

  for (const [url, count] of linkCounts) {
    if (count > maxDupes) {
      return {
        ok: false,
        error: `检测到可疑重复链接，同一链接出现 ${count} 次（最多 ${maxDupes} 次）`,
        code: "duplicate_link",
      };
    }
    void url; // suppress unused var
  }

  return { ok: true };
}

/**
 * Detect excessively long runs of the same character (e.g. "啊啊啊啊啊啊").
 */
export function checkConsecutiveChars(
  text: string,
  max = MAX_CONSECUTIVE_CHARS
): ContentRiskResult {
  if (text.length < max) return { ok: true };

  let run = 1;
  for (let i = 1; i < text.length; i++) {
    if (text[i] === text[i - 1]) {
      run++;
      if (run > max) {
        return {
          ok: false,
          error: `检测到超长连续字符（连续 ${run} 个相同字符）`,
          code: "consecutive_chars",
        };
      }
    } else {
      run = 1;
    }
  }

  return { ok: true };
}

/**
 * Check for whitespace-only or meaningless content.
 *
 * "Meaningless" = the ratio of actual content characters (letters, digits,
 * CJK) to total length falls below MIN_MEANINGFUL_RATIO.
 */
export function checkMeaningfulContent(
  text: string,
  minRatio = MIN_MEANINGFUL_RATIO
): ContentRiskResult {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return {
      ok: false,
      error: "内容不能为空",
      code: "empty_content",
    };
  }

  // Count meaningful characters: letters, digits, CJK
  const meaningful = (trimmed.match(/[\p{L}\p{N}]/gu) || []).length;
  const ratio = meaningful / trimmed.length;

  if (ratio < minRatio) {
    return {
      ok: false,
      error: `内容有效信息不足，请输入有意义的文字`,
      code: "low_meaningful_ratio",
    };
  }

  return { ok: true };
}

/**
 * Run all content risk checks in sequence.
 * Returns the first failure or ok=true.
 */
export function runContentRiskChecks(
  text: string,
  opts?: {
    maxLinks?: number;
    maxDupes?: number;
    maxConsecutive?: number;
    minRatio?: number;
  }
): ContentRiskResult {
  const meaningful = checkMeaningfulContent(text, opts?.minRatio);
  if (!meaningful.ok) return meaningful;

  const links = checkExternalLinks(text, opts?.maxLinks, opts?.maxDupes);
  if (!links.ok) return links;

  const chars = checkConsecutiveChars(text, opts?.maxConsecutive);
  if (!chars.ok) return chars;

  return { ok: true };
}

/**
 * Sanitise user-supplied HTML by removing dangerous tags/attributes.
 * This is a supplementary check — the primary XSS protection is in the
 * rendering layer (PostContent component).
 *
 * Returns { cleaned, hasDangerous } where hasDangerous indicates whether
 * any dangerous content was found and removed.
 */
export function sanitiseHtml(html: string): {
  cleaned: string;
  hasDangerous: boolean;
} {
  let hasDangerous = false;

  // Remove <script> tags and their contents
  let cleaned = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    () => {
      hasDangerous = true;
      return "";
    }
  );

  // Remove on* event handlers (onclick, onload, onerror, etc.)
  cleaned = cleaned.replace(/\son\w+\s*=\s*"[^"]*"/gi, () => {
    hasDangerous = true;
    return "";
  });
  cleaned = cleaned.replace(/\son\w+\s*=\s*'[^']*'/gi, () => {
    hasDangerous = true;
    return "";
  });

  // Remove javascript: URLs
  cleaned = cleaned.replace(/javascript:/gi, () => {
    hasDangerous = true;
    return "";
  });

  // Remove <iframe> tags
  cleaned = cleaned.replace(/<\/?iframe\b[^>]*>/gi, () => {
    hasDangerous = true;
    return "";
  });

  // Remove <object> and <embed> tags
  cleaned = cleaned.replace(/<\/?(object|embed)\b[^>]*>/gi, () => {
    hasDangerous = true;
    return "";
  });

  return { cleaned: cleaned.trim(), hasDangerous };
}

/**
 * Check if a string contains XSS-unsafe HTML patterns.
 * Does NOT modify the input — just reports whether it's dangerous.
 */
export function containsXss(html: string): boolean {
  return sanitiseHtml(html).hasDangerous;
}
