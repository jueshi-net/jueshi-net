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
    {
      url: `${BASE_URL}/bbs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/community`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/countries`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/countries/canada`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/countries/united-states`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/countries/united-kingdom`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/countries/australia`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/countries/japan`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/countries/singapore`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/countries/malaysia`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Tools
  const toolSlugs = [
    "shipping-calculator", "shipping-estimator", "hs-code", "sensitive-goods",
    "postal-code", "address-formatter", "invoice", "commercial-invoice",
    "customs-generator", "qrcode", "exchange-rate",
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

  // Canonical Quote Sheet page (not /tools/quote or /tools/quote-sheet)
  const quoteSheetPage: MetadataRoute.Sitemap = [{
    url: `${BASE_URL}/tools/documents/quotation`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }];

  // Dynamic pages (DB dependent)
  let articlePages: MetadataRoute.Sitemap = [];
  let lpPages: MetadataRoute.Sitemap = [];
  let checklistPages: MetadataRoute.Sitemap = [];
  let communityPages: MetadataRoute.Sitemap = [];
  let forumCategoryPages: MetadataRoute.Sitemap = [];
  let forumPostPages: MetadataRoute.Sitemap = [];

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
      where: { status: "published", pageType: { not: "checklist" } },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    lpPages = landingPages.map((lp) => ({
      url: `${BASE_URL}/lp/${lp.slug}`,
      lastModified: lp.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    // Published Checklists
    const checklists = await prisma.landingPage.findMany({
      where: { status: "published", pageType: "checklist" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    checklistPages = checklists.map((c) => ({
      url: `${BASE_URL}/checklists/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    // Published Topics (for community pages)
    const topics = await prisma.topic.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    communityPages = topics.map((t) => ({
      url: `${BASE_URL}/community/${t.slug}`,
      lastModified: t.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    // Active Forum Categories
    const forumCategories = await prisma.forumCategory.findMany({
      where: { isActive: true },
      select: { key: true, updatedAt: true },
      orderBy: { sortOrder: "asc" },
    });

    forumCategoryPages = forumCategories.map((cat) => ({
      url: `${BASE_URL}/bbs/category/${cat.key}`,
      lastModified: cat.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

    // Published Forum Posts (only published, not pending/hidden)
    const forumPosts = await prisma.forumPost.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    forumPostPages = forumPosts.map((post) => ({
      url: `${BASE_URL}/bbs/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (e) {
    console.error("[sitemap] DB fetch failed, returning static pages + tools only");
  }

  return [...staticPages, ...tools, ...quoteSheetPage, ...articlePages, ...lpPages, ...checklistPages, ...communityPages, ...forumCategoryPages, ...forumPostPages];
}
