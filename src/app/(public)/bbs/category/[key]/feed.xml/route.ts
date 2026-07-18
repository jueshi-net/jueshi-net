// GET /bbs/category/[key]/feed.xml - RSS feed for a specific category
import { NextRequest } from "next/server";
import {
  getFeedPosts,
  generateRSSFeed,
  generateFeedETag,
  getFeedLastModified,
} from "@/lib/community/feed";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;

    const posts = await getFeedPosts({ categoryKey: key, limit: 20 });
    const lastModified = await getFeedLastModified({ categoryKey: key });
    const etag = generateFeedETag(posts, key);

    // Check If-None-Match
    const ifNoneMatch = req.headers.get("if-none-match");
    if (ifNoneMatch === etag) {
      return new Response(null, { status: 304, headers: { ETag: etag } });
    }

    // Check If-Modified-Since
    const ifModifiedSince = req.headers.get("if-modified-since");
    if (ifModifiedSince) {
      const ifSinceDate = new Date(ifModifiedSince);
      if (lastModified <= ifSinceDate) {
        return new Response(null, { status: 304, headers: { ETag: etag } });
      }
    }

    const xml = generateRSSFeed(posts, { categoryKey: key });

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
    console.error("[Forum Category RSS Feed Error]", error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Feed Error</title></channel></rss>',
      {
        status: 500,
        headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
      }
    );
  }
}
