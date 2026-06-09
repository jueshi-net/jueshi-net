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
        ],
      },
    ],
    sitemap: "https://jueshi.net/sitemap.xml",
  };
}
