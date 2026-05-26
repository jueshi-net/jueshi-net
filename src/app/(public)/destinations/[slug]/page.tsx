import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDestinationBySlug, getAllDestinationSlugs, REGION_GROUPS } from "@/lib/destinations-db";
import { getCountryBySlug, getAllCountries } from "@/lib/cms-utils";
import SmartRelatedLinks from "@/components/smart-related-links";
import { SITE_URL } from "@/lib/seo";
import DestinationHero from "./destination-hero-client";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

// Force SSR — DB not available during build time (Neon pooler blocks static connections)
export const dynamic = "force-dynamic";

// ─── Static params: use region config + CMS content to generate all possible slugs ───

export function generateStaticParams() {
  const allSlugs = new Set<string>();
  for (const g of REGION_GROUPS) {
    for (const s of g.slugs) allSlugs.add(s);
  }
  // Also add CMS country slugs
  try {
    const cmsCountries = getAllCountries();
    cmsCountries.forEach(c => {
      if (c.frontmatter.country) {
        allSlugs.add(c.frontmatter.country.toLowerCase());
      }
    });
  } catch {
    // CMS content may not exist during build
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
    // During build time, DB may not be reachable — try CMS fallback
    const cmsCountry = getCountryBySlug(slug);
    if (cmsCountry) {
      return {
        title: `${cmsCountry.frontmatter.title} — 海外百宝箱`,
        description: cmsCountry.frontmatter.subtitle || `${cmsCountry.frontmatter.flag} ${cmsCountry.frontmatter.title}出海指南`,
      };
    }
    return { title: `${slug} — 出海全能工具箱` };
  }
  if (!dest) {
    // Try CMS fallback
    const cmsCountry = getCountryBySlug(slug);
    if (cmsCountry) {
      return {
        title: `${cmsCountry.frontmatter.title} — 海外百宝箱`,
        description: cmsCountry.frontmatter.subtitle || undefined,
      };
    }
    return { title: "国家页面未找到" };
  }

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
  const cmsCountry = getCountryBySlug(slug);

  if (!dest && !cmsCountry) {
    notFound();
  }

  // Extract country code for smart interlinking
  const countryCode = cmsCountry?.frontmatter.country || (dest && 'code' in dest ? (dest as any).code : slug.substring(0, 2)).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero + Smart Search */}
      {dest && <DestinationHero dest={dest} />}

      {/* CMS Content Section */}
      {cmsCountry && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Back to destinations list */}
          <Link href="/destinations" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 mb-6 min-h-[44px]">
            <ArrowLeft className="w-4 h-4" /> 返回全球目的地
          </Link>

          {/* CMS Article Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content (2/3) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                  {cmsCountry.frontmatter.flag} {cmsCountry.frontmatter.title}
                </h1>
                {cmsCountry.frontmatter.subtitle && (
                  <p className="text-lg text-gray-500 mb-6">{cmsCountry.frontmatter.subtitle}</p>
                )}

                {/* Markdown content — render as prose */}
                <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-a:text-teal-600 prose-strong:text-gray-900">
                  {cmsCountry.content.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return <h2 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b">{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={i} className="text-lg font-semibold text-gray-800 mt-6 mb-3">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('|')) {
                      return null; // Skip markdown tables for now (render as pre)
                    }
                    if (line.startsWith('- **[')) {
                      // Parse markdown links: - **[title](url)** — description
                      const match = line.match(/- \*\*\[(.+?)\]\((.+?)\)\*\*\s*—?\s*(.*)/);
                      if (match) {
                        return (
                          <div key={i} className="flex items-start gap-2 py-2">
                            <span className="text-teal-500 mt-0.5">→</span>
                            <Link href={match[2]} className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline">
                              {match[1]}
                            </Link>
                            {match[3] && <span className="text-xs text-gray-500">{match[3]}</span>}
                          </div>
                        );
                      }
                    }
                    if (line.trim() === '') return <br key={i} />;
                    if (line.startsWith('- ')) {
                      return <p key={i} className="text-sm text-gray-700 pl-4 before:content-['•'] before:mr-2 before:text-gray-400">{line.replace('- ', '')}</p>;
                    }
                    return <p key={i} className="text-sm text-gray-700 leading-relaxed mb-2">{line}</p>;
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar (1/3) — Smart Interlinking */}
            <div className="space-y-6">
              <SmartRelatedLinks
                country={countryCode}
                tags={cmsCountry.frontmatter.tags}
                type="destination"
                layout="sidebar"
              />

              {/* Related tools quick access */}
              {cmsCountry.frontmatter.related_tools && cmsCountry.frontmatter.related_tools.length > 0 && (
                <div className="bg-white border rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-teal-600" /> 相关工具
                  </h3>
                  <div className="space-y-2">
                    {cmsCountry.frontmatter.related_tools.map((tool: string, i: number) => (
                      <Link key={i} href={`/tools/${tool}`}
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                        → {tool}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom related links */}
          <div className="mt-10">
          <SmartRelatedLinks
            country={countryCode}
            tags={cmsCountry.frontmatter.tags}
            type="destination"
            layout="bottom"
          />
          </div>
        </div>
      )}
    </div>
  );
}
