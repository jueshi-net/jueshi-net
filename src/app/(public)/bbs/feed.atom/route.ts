// GET /bbs/feed.atom - Atom 1.0 feed for published forum posts
import { NextRequest } from "next/server";
import {
  getFeedPosts,
  generateAtomFeed,
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

    const xml = generateAtomFeed(posts, {});

    // Track feed view (non-blocking)
    trackForumFeedView({ feedType: "atom", path: "/bbs/feed.atom" }).catch(() => {});

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
    console.error("[Forum Atom Feed Error]", error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Feed Error</title></feed>',
      {
        status: 500,
        headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
      }
    );
  }
}
