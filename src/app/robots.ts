import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/tools/",
          "/guides/",
          "/lp/",
          "/blog/",
          "/resources/",
          "/bbs",
          "/bbs/",
          "/bbs/category/",
        ],
        disallow: [
          "/admin",
          "/workspace",
          "/api",
          "/login",
          "/register",
          "/auth",
          "/_next",
          "/static",
          // P4: Forum private pages must not be indexed
          "/bbs/new",
          "/bbs/admin",
          "/bbs/my-posts",
          "/bbs/my-reports",
          "/bbs/my-comments",
          "/bbs/my-bookmarks",
          "/bbs/operations",
          "/bbs/notifications",
          "/bbs/*/edit",
          // User profile pages - not indexed by default to protect privacy
          "/profile",
          // Allow /u/[id] for public profiles (has its own JSON-LD)
        ],
      },
    ],
    sitemap: "https://jueshi.net/sitemap.xml",
  };
}
