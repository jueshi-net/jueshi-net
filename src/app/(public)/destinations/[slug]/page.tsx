import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDestination, getAllSlugs, resolveTitle } from "@/lib/destinations-config";
import { SITE_URL } from "@/lib/seo";
import DestinationHero from "./destination-hero-client";

// ─── Static params for SSG ───────────────────────────────────────────────

export function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }));
}

// ─── Dynamic SEO Metadata ────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) return { title: "国家页面未找到" };

  const title = resolveTitle(dest.seo.titleTemplate, dest);
  const canonical = `${SITE_URL}/destinations/${slug}`;

  return {
    title,
    description: dest.seo.description,
    keywords: dest.seo.keywords.join(", "),
    alternates: { canonical },
    openGraph: {
      title,
      description: dest.seo.description,
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
  const dest = getDestination(slug);

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
