import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://jueshi.net";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/guides`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/resources`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Tools
  const toolSlugs = [
    "shipping-calculator", "shipping-estimator", "hs-code", "sensitive-goods",
    "postal-code", "address-formatter", "invoice", "commercial-invoice",
    "quote", "quote-sheet", "customs-generator", "qrcode", "exchange-rate",
    "tracking", "documents", "shipping-mark", "container", "handover-note",
    "receipt", "debit-note", "shipping-label", "inbound-receipt", "memo",
    "inbound", "zip", "video-script-sop", "document-tools",
  ];

  const tools: MetadataRoute.Sitemap = toolSlugs.map((slug) => ({
    url: `${BASE_URL}/tools/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Dynamic pages (DB dependent)
  let articlePages: MetadataRoute.Sitemap = [];
  let lpPages: MetadataRoute.Sitemap = [];

  try {
    // Published Articles
    const articles = await prisma.article.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    articlePages = articles.map((a) => ({
      url: `${BASE_URL}/guides/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    // Published Landing Pages
    const landingPages = await prisma.landingPage.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    lpPages = landingPages.map((lp) => ({
      url: `${BASE_URL}/lp/${lp.slug}`,
      lastModified: lp.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (e) {
    console.error("[sitemap] DB fetch failed, returning static pages + tools only");
  }

  return [...staticPages, ...tools, ...articlePages, ...lpPages];
}
