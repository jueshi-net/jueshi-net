// GET /bbs/feed.xml - RSS 2.0 feed for published forum posts
import { NextRequest } from "next/server";
import {
  getFeedPosts,
  generateRSSFeed,
  generateFeedETag,
  getFeedLastModified,
} from "@/lib/community/feed";
import { trackForumFeedView } from "@/lib/community/analytics-events";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const posts = await getFeedPosts({ limit: 20 });
    const lastModified = await getFeedLastModified();
    const etag = generateFeedETag(posts);

    // Check If-None-Match for ETag
    const ifNoneMatch = _req.headers.get("if-none-match");
    if (ifNoneMatch === etag) {
      return new Response(null, { status: 304, headers: { ETag: etag } });
    }

    // Check If-Modified-Since
    const ifModifiedSince = _req.headers.get("if-modified-since");
    if (ifModifiedSince) {
      const ifSinceDate = new Date(ifModifiedSince);
      if (lastModified <= ifSinceDate) {
        return new Response(null, { status: 304, headers: { ETag: etag } });
      }
    }

    const xml = generateRSSFeed(posts, {});

    // Track feed view (non-blocking)
    trackForumFeedView({ feedType: "rss", path: "/bbs/feed.xml" }).catch(() => {});

    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=600, s-maxage=1800",
        ETag: etag,
        "Last-Modified": lastModified.toUTCString(),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[Forum RSS Feed Error]", error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Feed Error</title><description>暂无法获取订阅</description></channel></rss>',
      {
        status: 500,
        headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
      }
    );
  }
}
