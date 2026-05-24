import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDestinationBySlug, getAllDestinationSlugs, REGION_GROUPS } from "@/lib/destinations-db";
import { SITE_URL } from "@/lib/seo";
import DestinationHero from "./destination-hero-client";

// Force SSR — DB not available during build time (Neon pooler blocks static connections)
export const dynamic = "force-dynamic";

// ─── Static params: use region config to generate all possible slugs (no DB needed) ───

export function generateStaticParams() {
  const allSlugs = new Set<string>();
  for (const g of REGION_GROUPS) {
    for (const s of g.slugs) allSlugs.add(s);
  }
  return Array.from(allSlugs).map(slug => ({ slug }));
}

// ─── Dynamic SEO Metadata ────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let dest: Awaited<ReturnType<typeof getDestinationBySlug>> | null = null;
  try {
    dest = await getDestinationBySlug(slug);
  } catch {
    // During build time, DB may not be reachable — return default metadata
    return { title: `${slug} — 出海全能工具箱` };
  }
  if (!dest) return { title: "国家页面未找到" };

  const title = dest.seoTitle || `${dest.name}出海全能工具箱`;
  const canonical = `${SITE_URL}/destinations/${slug}`;

  return {
    title,
    description: dest.seoDescription || undefined,
    keywords: dest.keywords.join(", "),
    alternates: { canonical },
    openGraph: {
      title,
      description: dest.seoDescription || undefined,
      url: canonical,
      locale: "zh_CN",
      type: "website",
      siteName: "海外百宝箱",
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);

  if (!dest) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero + Smart Search */}
      <DestinationHero dest={dest} />
    </div>
  );
}
