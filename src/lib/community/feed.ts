/**
 * Feed generation utilities for RSS and Atom feeds.
 *
 * Only published posts are included.
 * Drafts, pending, rejected, hidden, and deleted posts are excluded.
 */

import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { prisma } from "@/lib/prisma";

// ─── Types ───

export interface FeedPost {
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

export interface FeedOptions {
  categoryKey?: string;
  limit?: number;
}

// ─── Data Fetching ───

/**
 * Fetch published posts for feed.
 * Only status='published' posts are included.
 */
export async function getFeedPosts(opts: FeedOptions = {}): Promise<FeedPost[]> {
  const { categoryKey, limit = 20 } = opts;

  const where: Record<string, unknown> = {
    status: "published",
  };
  if (categoryKey) {
    where.category = { key: categoryKey };
  }

  const posts = await prisma.forumPost.findMany({
    where,
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: Math.min(limit, 50),
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      tags: true,
      category: { select: { key: true, name: true } },
      user: { select: { name: true, email: true } },
    },
  });

  return posts as FeedPost[];
}

/**
 * Get the last modified date for feed cache headers.
 */
export async function getFeedLastModified(opts: FeedOptions = {}): Promise<Date> {
  const where: Record<string, unknown> = {
    status: "published",
  };
  if (opts.categoryKey) {
    where.category = { key: opts.categoryKey };
  }

  const latest = await prisma.forumPost.findFirst({
    where,
    orderBy: { updatedAt: "desc" },
    select: { updatedAt: true },
  });

  return latest?.updatedAt || new Date(0);
}

/**
 * Generate a stable ETag for the feed.
 */
export function generateFeedETag(posts: FeedPost[], categoryKey?: string): string {
  const content = posts.map((p) => `${p.id}:${p.updatedAt.getTime()}`).join("|");
  const suffix = categoryKey ? `:${categoryKey}` : "";
  // Simple hash for ETag (not crypto-secure, but sufficient for caching)
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `"feed${suffix}_${Math.abs(hash).toString(16)}"`;
}

// ─── XML Escaping ───

function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // Remove control characters that are invalid in XML
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

function getDisplayName(name: string | null, email: string): string {
  if (name) return name;
  // Partially mask email
  const [local, domain] = email.split("@");
  if (!domain) return "匿名用户";
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

function getPostTags(tags: string | null): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags as string[];
  try {
    const parsed = JSON.parse(tags as string);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ─── RSS 2.0 Generator ───

export function generateRSSFeed(posts: FeedPost[], opts: FeedOptions = {}): string {
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
  const channelDesc = categoryKey
    ? `${posts[0]?.category?.name || "分类"}分类的最新讨论`
    : "交流海外生活、工具经验、物流问题的社区";

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/bbs/${post.slug}`;
      const summary = escapeXml(
        truncateText(post.excerpt || post.content, 300)
      );
      const author = escapeXml(getDisplayName(post.user.name, post.user.email));
      const tags = getPostTags(post.tags as string | null);

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${summary}</description>
      <author>${author}</author>
      <category>${escapeXml(post.category.name)}</category>
      <pubDate>${post.createdAt.toUTCString()}</pubDate>
      <lastBuildDate>${post.updatedAt.toUTCString()}</lastBuildDate>${tags
        .map((t) => `\n      <category domain="tag">${escapeXml(t)}</category>`)
        .join("")}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(channelDesc)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

// ─── Atom 1.0 Generator ───

export function generateAtomFeed(posts: FeedPost[], opts: FeedOptions = {}): string {
  const { categoryKey } = opts;
  const feedId = categoryKey
    ? `${SITE_URL}/bbs/category/${categoryKey}`
    : `${SITE_URL}/bbs`;
  const feedUrl = categoryKey
    ? `${SITE_URL}/bbs/category/${categoryKey}/feed.atom`
    : `${SITE_URL}/bbs/feed.atom`;
  const siteUrl = categoryKey
    ? `${SITE_URL}/bbs/category/${categoryKey}`
    : `${SITE_URL}/bbs`;
  const title = categoryKey
    ? `${SITE_NAME} - ${posts[0]?.category?.name || "分类"}`
    : `${SITE_NAME} 社区`;
  const subtitle = categoryKey
    ? `${posts[0]?.category?.name || "分类"}分类的最新讨论`
    : "交流海外生活、工具经验、物流问题的社区";

  const entries = posts
    .map((post) => {
      const url = `${SITE_URL}/bbs/${post.slug}`;
      const summary = escapeXml(
        truncateText(post.excerpt || post.content, 300)
      );
      const author = escapeXml(getDisplayName(post.user.name, post.user.email));
      const tags = getPostTags(post.tags as string | null);

      return `    <entry>
      <id>${escapeXml(url)}</id>
      <title>${escapeXml(post.title)}</title>
      <link href="${escapeXml(url)}" />
      <summary>${summary}</summary>
      <author>
        <name>${author}</name>
      </author>
      <category term="${escapeXml(post.category.name)}" />${tags
        .map((t) => `\n      <category term="${escapeXml(t)}" label="${escapeXml(t)}" />`)
        .join("")}
      <published>${post.createdAt.toISOString()}</published>
      <updated>${post.updatedAt.toISOString()}</updated>
    </entry>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${escapeXml(feedId)}</id>
  <title>${escapeXml(title)}</title>
  <link href="${escapeXml(siteUrl)}" />
  <link href="${escapeXml(feedUrl)}" rel="self" type="application/atom+xml" />
  <subtitle>${escapeXml(subtitle)}</subtitle>
  <updated>${posts.length > 0 ? posts[0].updatedAt.toISOString() : new Date().toISOString()}</updated>
${entries}
</feed>`;
}

// ─── Feed Link Tags ───

export function getFeedLinkTags(path: string): { rel: string; type: string; href: string }[] {
  const baseUrl = SITE_URL;
  return [
    {
      rel: "alternate",
      type: "application/rss+xml",
      href: `${baseUrl}${path}/feed.xml`,
    },
    {
      rel: "alternate",
      type: "application/atom+xml",
      href: `${baseUrl}${path}/feed.atom`,
    },
  ];
}
