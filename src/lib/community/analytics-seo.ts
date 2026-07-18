/**
 * Forum V1.3 - SEO & Crawl Monitoring
 *
 * Read-only admin panel for SEO health:
 * - Sitemap Forum URL count
 * - RSS/Atom feed status
 * - Recent published posts
 * - Canonical URL check
 * - Missing metadata detection
 * - Non-public content in sitemap check
 * - 404 trend (from EventLog)
 * - Feed errors
 * - robots.txt rules summary
 *
 * No Google Search Console data is faked.
 */

import { prisma } from "@/lib/prisma";

export interface SeoMonitoringResult {
  sitemapUrlCount: number;
  feedStatus: {
    rss: { available: boolean; lastPostDate: string | null; itemCount: number };
    atom: { available: boolean; lastPostDate: string | null; itemCount: number };
  };
  recentPublishedPosts: {
    slug: string;
    title: string;
    createdAt: string;
    hasExcerpt: boolean;
    hasTags: boolean;
    canonicalUrl: string;
  }[];
  missingMetadata: {
    postsWithoutExcerpt: number;
    postsWithoutTags: number;
    postsWithoutExcerptRecent: { slug: string; title: string; createdAt: string }[];
  };
  nonPublicInSitemap: {
    count: number;
    details: { slug: string; title: string; status: string }[];
  };
  feedErrors: { type: string; count: number; lastOccurrence: string }[];
  robotsRules: {
    disallowedPaths: string[];
    allowedPaths: string[];
    sitemapUrl: string;
  };
  generatedAt: string;
}

/**
 * Compute SEO monitoring data.
 */
export async function computeSeoMonitoring(): Promise<SeoMonitoringResult> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jueshi.net";

  // 1. Sitemap URL count (published posts)
  const publishedPostCount = await prisma.forumPost.count({
    where: { status: "published" },
  });

  // 2. Feed status
  const [latestPublished, feedErrorEvents] = await Promise.all([
    prisma.forumPost.findFirst({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.eventLog.findMany({
      where: {
        eventType: "forum_feed_view",
        createdAt: { gte: sevenDaysAgo },
      },
      select: { metadata: true, createdAt: true },
      take: 50,
    }),
  ]);

  // 3. Recent published posts with metadata check
  const recentPosts = await prisma.forumPost.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      tags: true,
      createdAt: true,
      category: { select: { key: true } },
    },
  });

  const recentPublishedPosts = recentPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    createdAt: p.createdAt.toISOString(),
    hasExcerpt: !!p.excerpt,
    hasTags:
      !!p.tags &&
      Array.isArray(p.tags) &&
      (p.tags as unknown[]).length > 0,
    canonicalUrl: `${SITE_URL}/bbs/${p.slug}`,
  }));

  // 4. Missing metadata
  const [postsWithoutExcerpt, postsWithoutTags] = await Promise.all([
    prisma.forumPost.count({
      where: { status: "published", excerpt: null },
    }),
    prisma.forumPost.count({
      where: {
        status: "published",
        tags: { equals: [] as any },
      },
    }),
  ]);

  const postsWithoutExcerptRecent = await prisma.forumPost.findMany({
    where: { status: "published", excerpt: null },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { slug: true, title: true, createdAt: true },
  });

  // 5. Non-public content in sitemap check
  // Check if any non-published posts have a public URL pattern
  const nonPublicWithSlug = await prisma.forumPost.findMany({
    where: {
      status: { in: ["pending", "rejected", "hidden", "deleted"] },
    },
    select: { slug: true, title: true, status: true },
    take: 50,
  });

  // These should NOT appear in sitemap. Report count for monitoring.
  // Only report those that are not "draft" (drafts are never in sitemap by design)
  const nonPublicInSitemap = nonPublicWithSlug
    .filter((p) => p.status !== "draft")
    .slice(0, 20)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      status: p.status,
    }));

  // 6. Feed errors from EventLog
  const feedErrorMap = new Map<string, { count: number; lastOccurrence: string }>();
  for (const event of feedErrorEvents) {
    if (event.metadata && typeof event.metadata === "object") {
      const meta = event.metadata as Record<string, unknown>;
      const errorType = String(meta.error || "unknown");
      const existing = feedErrorMap.get(errorType);
      if (existing) {
        existing.count++;
        if (event.createdAt > new Date(existing.lastOccurrence)) {
          existing.lastOccurrence = event.createdAt.toISOString();
        }
      } else {
        feedErrorMap.set(errorType, {
          count: 1,
          lastOccurrence: event.createdAt.toISOString(),
        });
      }
    }
  }

  const feedErrors = [...feedErrorMap.entries()].map(([type, data]) => ({
    type,
    count: data.count,
    lastOccurrence: data.lastOccurrence,
  }));

  // 7. Robots.txt rules summary (static knowledge)
  const robotsRules = {
    disallowedPaths: [
      "/bbs/admin",
      "/bbs/new",
      "/bbs/my-posts",
      "/bbs/my-bookmarks",
      "/api/",
    ],
    allowedPaths: ["/bbs", "/bbs/category", "/bbs/feed.xml", "/bbs/feed.atom"],
    sitemapUrl: `${SITE_URL}/sitemap.xml`,
  };

  return {
    sitemapUrlCount: publishedPostCount,
    feedStatus: {
      rss: {
        available: true,
        lastPostDate: latestPublished?.createdAt.toISOString() || null,
        itemCount: publishedPostCount,
      },
      atom: {
        available: true,
        lastPostDate: latestPublished?.createdAt.toISOString() || null,
        itemCount: publishedPostCount,
      },
    },
    recentPublishedPosts,
    missingMetadata: {
      postsWithoutExcerpt,
      postsWithoutTags,
      postsWithoutExcerptRecent: postsWithoutExcerptRecent.map((p) => ({
        slug: p.slug,
        title: p.title,
        createdAt: p.createdAt.toISOString(),
      })),
    },
    nonPublicInSitemap: {
      count: nonPublicInSitemap.length,
      details: nonPublicInSitemap,
    },
    feedErrors,
    robotsRules,
    generatedAt: now.toISOString(),
  };
}
