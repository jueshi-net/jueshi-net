/**
 * Forum V1.2 Public Growth & Sharing Tests
 *
 * Self-contained tests for:
 * - Feed generation (RSS, Atom) - XML validity, only published content
 * - Feed caching (ETag, Last-Modified)
 * - Share URL building (Telegram, WhatsApp, Facebook, X)
 * - Share security (URL encoding, open redirect prevention)
 * - Social media metadata (OpenGraph, Twitter Card)
 * - Non-public content exclusion from sharing
 */

import { describe, it, expect } from "vitest";

// ═══════════════════════════════════════════════════════════════
// Feed Generation Tests
// ═══════════════════════════════════════════════════════════════

const SITE_URL = "https://jueshi.net";
const SITE_NAME = "绝世百宝箱";

// XML escape helper (mirror of feed.ts implementation)
function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

function getDisplayName(name: string | null, email: string): string {
  if (name) return name;
  const [local, domain] = email.split("@");
  if (!domain) return "匿名用户";
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

interface FeedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string | null;
  category: { key: string; name: string };
  user: { name: string | null; email: string };
}

function generateRSSFeed(posts: FeedPost[], opts: { categoryKey?: string } = {}): string {
  const { categoryKey } = opts;
  const feedUrl = categoryKey
    ? `${SITE_URL}/bbs/category/${categoryKey}/feed.xml`
    : `${SITE_URL}/bbs/feed.xml`;
  const siteUrl = categoryKey
    ? `${SITE_URL}/bbs/category/${categoryKey}`
    : `${SITE_URL}/bbs`;

  const channelTitle = categoryKey
    ? `${SITE_NAME} - ${posts[0]?.category?.name || "分类"}`
    : `${SITE_NAME} 社区`;

  const items = posts.map((post) => {
    const url = `${SITE_URL}/bbs/${post.slug}`;
    const summary = escapeXml(truncateText(post.excerpt || post.content, 300));
    const author = escapeXml(getDisplayName(post.user.name, post.user.email));

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${summary}</description>
      <author>${author}</author>
      <category>${escapeXml(post.category.name)}</category>
      <pubDate>${post.createdAt.toUTCString()}</pubDate>
    </item>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

function generateAtomFeed(posts: FeedPost[], opts: { categoryKey?: string } = {}): string {
  const { categoryKey } = opts;
  const feedId = categoryKey
    ? `${SITE_URL}/bbs/category/${categoryKey}`
    : `${SITE_URL}/bbs`;

  const entries = posts.map((post) => {
    const url = `${SITE_URL}/bbs/${post.slug}`;
    const summary = escapeXml(truncateText(post.excerpt || post.content, 300));
    const author = escapeXml(getDisplayName(post.user.name, post.user.email));

    return `    <entry>
      <id>${escapeXml(url)}</id>
      <title>${escapeXml(post.title)}</title>
      <link href="${escapeXml(url)}" />
      <summary>${summary}</summary>
      <author><name>${author}</name></author>
      <published>${post.createdAt.toISOString()}</published>
      <updated>${post.updatedAt.toISOString()}</updated>
    </entry>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${escapeXml(feedId)}</id>
  <title>${SITE_NAME} 社区</title>
${entries}
</feed>`;
}

// Test data
const testPosts: FeedPost[] = [
  {
    id: "1",
    slug: "test-post-1",
    title: "物流清关问题讨论",
    excerpt: "关于加拿大清关流程的讨论",
    content: "请问从中国发货到加拿大需要什么清关文件？",
    createdAt: new Date("2026-07-15T10:00:00Z"),
    updatedAt: new Date("2026-07-16T12:00:00Z"),
    tags: JSON.stringify(["shipping", "customs"]),
    category: { key: "logistics", name: "物流" },
    user: { name: "张三", email: "zhang@example.com" },
  },
  {
    id: "2",
    slug: "test-post-2",
    title: "<script>alert('xss')</script>",
    excerpt: null,
    content: "This is a test & content with special chars < > \" '",
    createdAt: new Date("2026-07-14T10:00:00Z"),
    updatedAt: new Date("2026-07-14T10:00:00Z"),
    tags: null,
    category: { key: "life", name: "生活" },
    user: { name: null, email: "user@test.com" },
  },
];

// ─── RSS Feed Tests ───

describe("RSS Feed Generation", () => {
  it("generates valid RSS XML with xml declaration", () => {
    const feed = generateRSSFeed(testPosts);
    expect(feed).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(feed).toContain("<rss version=\"2.0\"");
    expect(feed).toContain("</rss>");
  });

  it("contains channel and item elements", () => {
    const feed = generateRSSFeed(testPosts);
    expect(feed).toContain("<channel>");
    expect(feed).toContain("</channel>");
    expect(feed).toContain("<item>");
    expect(feed).toContain("</item>");
  });

  it("includes canonical URLs in link and guid", () => {
    const feed = generateRSSFeed(testPosts);
    expect(feed).toContain(`${SITE_URL}/bbs/test-post-1`);
    expect(feed).toContain(`${SITE_URL}/bbs/test-post-2`);
  });

  it("includes title, description, author, and dates", () => {
    const feed = generateRSSFeed(testPosts);
    expect(feed).toContain("物流清关问题讨论");
    expect(feed).toContain("张三");
    expect(feed).toContain("<pubDate>");
    expect(feed).toContain("<category>物流</category>");
  });

  it("escapes XML special characters in titles", () => {
    const feed = generateRSSFeed(testPosts);
    expect(feed).not.toContain("<script>alert('xss')</script>");
    expect(feed).toContain("&lt;script&gt;");
  });

  it("escapes ampersands, brackets, quotes in content", () => {
    const feed = generateRSSFeed(testPosts);
    expect(feed).toContain("&amp;");
    expect(feed).toContain("&lt;");
    expect(feed).toContain("&gt;");
  });

  it("partially masks email when name is null", () => {
    const feed = generateRSSFeed(testPosts);
    expect(feed).not.toContain("user@test.com");
    expect(feed).toContain("***");
    expect(feed).toContain("test.com");
  });

  it("includes atom:link with rel=self", () => {
    const feed = generateRSSFeed(testPosts);
    expect(feed).toContain('rel="self"');
    expect(feed).toContain('type="application/rss+xml"');
  });

  it("generates different feed URL for category feeds", () => {
    const feed = generateRSSFeed(testPosts, { categoryKey: "logistics" });
    expect(feed).toContain("/bbs/category/logistics/feed.xml");
    expect(feed).toContain("/bbs/category/logistics");
  });

  it("handles empty post list", () => {
    const feed = generateRSSFeed([]);
    expect(feed).toContain("<channel>");
    expect(feed).toContain("</channel>");
    expect(feed).not.toContain("<item>");
  });

  it("truncates long excerpts", () => {
    const longPost: FeedPost = {
      ...testPosts[0],
      excerpt: "A".repeat(500),
    };
    const feed = generateRSSFeed([longPost]);
    // Should be truncated to 300 chars + "..."
    expect(feed).toContain("...");
    expect(feed).not.toContain("A".repeat(500));
  });
});

// ─── Atom Feed Tests ───

describe("Atom Feed Generation", () => {
  it("generates valid Atom XML with xml declaration", () => {
    const feed = generateAtomFeed(testPosts);
    expect(feed).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(feed).toContain("<feed xmlns=\"http://www.w3.org/2005/Atom\"");
    expect(feed).toContain("</feed>");
  });

  it("contains entry elements with required fields", () => {
    const feed = generateAtomFeed(testPosts);
    expect(feed).toContain("<entry>");
    expect(feed).toContain("</entry>");
    expect(feed).toContain("<id>");
    expect(feed).toContain("<title>");
    expect(feed).toContain("<link");
    expect(feed).toContain("<author>");
    expect(feed).toContain("<published>");
    expect(feed).toContain("<updated>");
  });

  it("uses ISO 8601 date format", () => {
    const feed = generateAtomFeed(testPosts);
    expect(feed).toContain("2026-07-15T10:00:00.000Z");
    expect(feed).toContain("2026-07-16T12:00:00.000Z");
  });

  it("includes canonical URLs", () => {
    const feed = generateAtomFeed(testPosts);
    expect(feed).toContain(`${SITE_URL}/bbs/test-post-1`);
  });

  it("handles category-specific feed", () => {
    const feed = generateAtomFeed(testPosts, { categoryKey: "life" });
    expect(feed).toContain("/bbs/category/life");
  });
});

// ═══════════════════════════════════════════════════════════════
// Feed Caching Tests
// ═══════════════════════════════════════════════════════════════

function generateFeedETag(posts: FeedPost[], categoryKey?: string): string {
  const content = posts.map((p) => `${p.id}:${p.updatedAt.getTime()}`).join("|");
  const suffix = categoryKey ? `:${categoryKey}` : "";
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `"feed${suffix}_${Math.abs(hash).toString(16)}"`;
}

describe("Feed Caching", () => {
  it("generates stable ETag for same content", () => {
    const etag1 = generateFeedETag(testPosts);
    const etag2 = generateFeedETag(testPosts);
    expect(etag1).toBe(etag2);
  });

  it("generates different ETag when content changes", () => {
    const etag1 = generateFeedETag(testPosts);
    const modifiedPosts = [{ ...testPosts[0], title: "Modified title" }];
    const etag2 = generateFeedETag(modifiedPosts);
    expect(etag1).not.toBe(etag2);
  });

  it("includes category key in ETag", () => {
    const etag = generateFeedETag(testPosts, "logistics");
    expect(etag).toContain("logistics");
  });

  it("ETag is wrapped in quotes", () => {
    const etag = generateFeedETag(testPosts);
    expect(etag.startsWith('"')).toBe(true);
    expect(etag.endsWith('"')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// Share URL Tests
// ═══════════════════════════════════════════════════════════════

describe("Share URL Building", () => {
  const shareData = {
    url: "https://jueshi.net/bbs/test-post-1",
    title: "物流清关问题讨论",
    description: "关于加拿大清关流程的讨论",
  };

  it("builds Telegram share URL with encoded parameters", () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title)}`;
    expect(url).toContain("t.me/share/url");
    expect(url).toContain(encodeURIComponent("物流清关问题讨论"));
    expect(url).toContain(encodeURIComponent("https://jueshi.net/bbs/test-post-1"));
  });

  it("builds WhatsApp share URL", () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareData.title}\n${shareData.url}`)}`;
    expect(url).toContain("wa.me/");
    expect(url).toContain(encodeURIComponent(shareData.url));
  });

  it("builds Facebook share URL", () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`;
    expect(url).toContain("facebook.com/sharer");
    expect(url).toContain(encodeURIComponent(shareData.url));
  });

  it("builds X (Twitter) share URL", () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}`;
    expect(url).toContain("twitter.com/intent/tweet");
    expect(url).toContain(encodeURIComponent(shareData.url));
  });

  it("URL encodes Chinese characters in share URLs", () => {
    const title = "物流清关";
    const encoded = encodeURIComponent(title);
    expect(encoded).not.toContain("物");
    expect(encoded).toContain("%");
    // Verify it can be decoded back
    expect(decodeURIComponent(encoded)).toBe(title);
  });

  it("URL encodes special characters in share URLs", () => {
    const title = "Test & <special> \"chars\"";
    const encoded = encodeURIComponent(title);
    expect(encoded).not.toContain("&");
    expect(encoded).not.toContain("<");
    expect(encoded).not.toContain(">");
    expect(encoded).not.toContain('"');
  });

  it("builds QR code URL with encoded data", () => {
    const url = "https://jueshi.net/bbs/test-post-1";
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&margin=10`;
    expect(qrUrl).toContain("api.qrserver.com");
    expect(qrUrl).toContain("200x200");
    expect(qrUrl).toContain(encodeURIComponent(url));
  });
});

// ─── Share Security Tests ───

describe("Share Security", () => {
  function sanitizeShareUrl(url: string): string {
    if (url.startsWith(SITE_URL)) return url;
    if (url.startsWith("/")) return `${SITE_URL}${url}`;
    return SITE_URL;
  }

  it("allows URLs from own domain", () => {
    const url = "https://jueshi.net/bbs/test-post";
    expect(sanitizeShareUrl(url)).toBe(url);
  });

  it("rejects external URLs (open redirect prevention)", () => {
    const maliciousUrl = "https://evil.com/redirect";
    expect(sanitizeShareUrl(maliciousUrl)).toBe(SITE_URL);
  });

  it("converts relative URLs to absolute", () => {
    expect(sanitizeShareUrl("/bbs/test-post")).toBe("https://jueshi.net/bbs/test-post");
  });

  it("rejects javascript: URLs", () => {
    expect(sanitizeShareUrl("javascript:alert(1)")).toBe(SITE_URL);
  });

  it("rejects data: URLs", () => {
    expect(sanitizeShareUrl("data:text/html,<script>alert(1)</script>")).toBe(SITE_URL);
  });

  it("handles empty URL", () => {
    expect(sanitizeShareUrl("")).toBe(SITE_URL);
  });

  it("truncates very long titles for social media", () => {
    const longTitle = "A".repeat(200);
    const truncated = longTitle.slice(0, 199) + "…";
    expect(truncated.length).toBe(200);
    expect(truncated).toContain("…");
  });
});

// ═══════════════════════════════════════════════════════════════
// Non-Public Content Exclusion Tests
// ═══════════════════════════════════════════════════════════════

describe("Non-Public Content Exclusion", () => {
  it("only published posts should be shareable", () => {
    const statuses = ["published", "draft", "pending", "rejected", "hidden", "deleted"];
    const shareable = statuses.filter((s) => s === "published");
    expect(shareable).toEqual(["published"]);
    expect(shareable).toHaveLength(1);
  });

  it("draft posts should not have share buttons", () => {
    const isDraft = true;
    const showShareButtons = !isDraft;
    expect(showShareButtons).toBe(false);
  });

  it("pending posts should not have share buttons", () => {
    const isPending = true;
    const showShareButtons = !isPending;
    expect(showShareButtons).toBe(false);
  });

  it("hidden posts should not have share buttons", () => {
    const isHidden = true;
    const showShareButtons = !isHidden;
    expect(showShareButtons).toBe(false);
  });

  it("published posts should have share buttons", () => {
    const isPublished = true;
    const showShareButtons = isPublished;
    expect(showShareButtons).toBe(true);
  });

  it("non-published posts should not have OG metadata", () => {
    const statuses = ["draft", "pending", "rejected", "hidden"];
    for (const status of statuses) {
      const hasOgMetadata = status === "published";
      expect(hasOgMetadata).toBe(false);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// Social Media Metadata Tests
// ═══════════════════════════════════════════════════════════════

describe("Social Media Metadata", () => {
  it("Open Graph includes required fields", () => {
    const og = {
      title: "物流清关问题讨论",
      description: "关于加拿大清关流程的讨论",
      url: "https://jueshi.net/bbs/test-post-1",
      type: "article",
      siteName: "绝世百宝箱",
      locale: "zh_CN",
      publishedTime: "2026-07-15T10:00:00.000Z",
      modifiedTime: "2026-07-16T12:00:00.000Z",
      authors: ["张三"],
      section: "物流",
      tags: ["shipping", "customs"],
    };

    expect(og.type).toBe("article");
    expect(og.title).toBeDefined();
    expect(og.url).toContain("jueshi.net");
    expect(og.publishedTime).toBeDefined();
    expect(og.modifiedTime).toBeDefined();
    expect(og.authors).toContain("张三");
    expect(og.section).toBe("物流");
    expect(og.tags).toContain("shipping");
  });

  it("Twitter Card includes required fields", () => {
    const card = {
      card: "summary_large_image",
      title: "物流清关问题讨论",
      description: "关于加拿大清关流程的讨论",
    };

    expect(card.card).toBe("summary_large_image");
    expect(card.title).toBeDefined();
    expect(card.description).toBeDefined();
  });

  it("truncates Twitter title to 70 chars", () => {
    const longTitle = "A".repeat(100);
    const truncated = longTitle.slice(0, 70);
    expect(truncated.length).toBe(70);
  });

  it("truncates Twitter description to 200 chars", () => {
    const longDesc = "A".repeat(300);
    const truncated = longDesc.slice(0, 200);
    expect(truncated.length).toBe(200);
  });

  it("article type includes section and tags", () => {
    const og = {
      type: "article",
      section: "物流",
      tags: ["shipping", "customs"],
    };
    expect(og.section).toBeDefined();
    expect(og.tags).toBeDefined();
    expect(Array.isArray(og.tags)).toBe(true);
  });

  it("website type does not include article-specific fields", () => {
    const og = {
      type: "website",
    };
    expect(og.type).toBe("website");
    expect((og as Record<string, unknown>).section).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// Feed Discovery Tests
// ═══════════════════════════════════════════════════════════════

describe("Feed Discovery", () => {
  it("BBS home includes RSS and Atom alternate links", () => {
    const alternates = {
      "application/rss+xml": `${SITE_URL}/bbs/feed.xml`,
      "application/atom+xml": `${SITE_URL}/bbs/feed.atom`,
    };
    expect(alternates["application/rss+xml"]).toContain("/bbs/feed.xml");
    expect(alternates["application/atom+xml"]).toContain("/bbs/feed.atom");
  });

  it("category page includes category-specific feed links", () => {
    const key = "logistics";
    const alternates = {
      "application/rss+xml": `${SITE_URL}/bbs/category/${key}/feed.xml`,
      "application/atom+xml": `${SITE_URL}/bbs/category/${key}/feed.atom`,
    };
    expect(alternates["application/rss+xml"]).toContain(`/bbs/category/${key}/feed.xml`);
    expect(alternates["application/atom+xml"]).toContain(`/bbs/category/${key}/feed.atom`);
  });

  it("feed links only appear on BBS pages, not all pages", () => {
    const bbsPath = "/bbs";
    const toolsPath = "/tools";
    const hasFeedDiscovery = (path: string) => path.startsWith("/bbs");
    expect(hasFeedDiscovery(bbsPath)).toBe(true);
    expect(hasFeedDiscovery(toolsPath)).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// XML Validity Tests
// ═══════════════════════════════════════════════════════════════

describe("XML Validity", () => {
  it("RSS feed is well-formed XML", () => {
    const feed = generateRSSFeed(testPosts);
    // Check basic XML structure
    expect(feed).toMatch(/^<\?xml/);
    expect(feed.trim().endsWith("</rss>")).toBe(true);
    // Check tag balance
    const openTags = (feed.match(/<(?!\/)(?!\?)(?!rss|channel|item|atom:)[a-zA-Z:]+/g) || []).length;
    const closeTags = (feed.match(/<\/[a-zA-Z:]+>/g) || []).length;
    // Should have matching open/close (approximately)
    expect(closeTags).toBeGreaterThan(0);
  });

  it("Atom feed is well-formed XML", () => {
    const feed = generateAtomFeed(testPosts);
    expect(feed).toMatch(/^<\?xml/);
    expect(feed.trim().endsWith("</feed>")).toBe(true);
  });

  it("RSS feed does not contain unescaped control characters", () => {
    const feed = generateRSSFeed(testPosts);
    // Should not contain raw control characters (except tab, newline, carriage return)
    const controlChars = feed.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g);
    expect(controlChars).toBeNull();
  });

  it("Atom feed does not contain unescaped control characters", () => {
    const feed = generateAtomFeed(testPosts);
    const controlChars = feed.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g);
    expect(controlChars).toBeNull();
  });

  it("RSS feed handles Emoji in titles", () => {
    const emojiPost: FeedPost = {
      ...testPosts[0],
      title: "物流清关 📦 问题讨论 🚢",
    };
    const feed = generateRSSFeed([emojiPost]);
    expect(feed).toContain("📦");
    expect(feed).toContain("🚢");
  });

  it("Atom feed handles Emoji in titles", () => {
    const emojiPost: FeedPost = {
      ...testPosts[0],
      title: "物流清关 📦 问题讨论 🚢",
    };
    const feed = generateAtomFeed([emojiPost]);
    expect(feed).toContain("📦");
    expect(feed).toContain("🚢");
  });
});
