// GET /bbs/category/[key]/feed.atom - Atom feed for a specific category
import { NextRequest } from "next/server";
import {
  getFeedPosts,
  generateAtomFeed,
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

    const xml = generateAtomFeed(posts, { categoryKey: key });

    return new Response(xml, {
      headers: {
        "Content-Type": "application/atom+xml; charset=utf-8",
        "Cache-Control": "public, max-age=600, s-maxage=1800",
        ETag: etag,
        "Last-Modified": lastModified.toUTCString(),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[Forum Category Atom Feed Error]", error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Feed Error</title></feed>',
      {
        status: 500,
        headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
      }
    );
  }
}
