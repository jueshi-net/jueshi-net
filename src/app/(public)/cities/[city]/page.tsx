import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  Wrench,
  BookOpen,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  Building2,
} from "lucide-react";
import { SITE_URL } from "@/lib/seo";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import { BreadcrumbBar, TagGroup, ContentSection, SectionHeader, PageCTA } from "@/components/design-system";

// Force SSR — DB not available during build time
export const dynamic = "force-dynamic";

const TOOL_MAP: Record<string, { name: string; route: string; icon: string; desc: string }> = {
  tracking: { name: "运单号整理工具", route: "/tracking", icon: "📦", desc: "批量整理运单号" },
  "shipping-estimator": { name: "运费估算器", route: "/tools/shipping-calculator", icon: "🧮", desc: "计算体积重和费用参考" },
  "hs-code": { name: "HS编码查询", route: "/tools/hs-code", icon: "📋", desc: "100个常用商品HS编码参考" },
  "postal-code": { name: "邮编格式校验", route: "/tools/postal-code", icon: "📮", desc: "5国邮编格式验证" },
  "commercial-invoice": { name: "发票生成器", route: "/tools/commercial-invoice", icon: "📄", desc: "商业发票和装箱单" },
  "packing-list": { name: "装箱单生成", route: "/tools/packing-list", icon: "📦", desc: "装箱单生成工具" },
  "address-formatter": { name: "地址格式化", route: "/tools/address-formatter", icon: "📝", desc: "5国地址格式一键生成" },
  cbm: { name: "CBM计算器", route: "/tools/shipping-calculator", icon: "📐", desc: "体积重计算" },
};

function getRelatedTools(relatedTools: string[] | undefined | null) {
  if (!relatedTools || relatedTools.length === 0) return [];
  return relatedTools
    .map((slug) => TOOL_MAP[slug])
    .filter(Boolean) as Array<{ name: string; route: string; icon: string; desc: string }>;
}

interface Props {
  params: Promise<{ city: string }>;
}

async function getCityPage(city: string) {
  const page = await prisma.landingPage.findUnique({
    where: { slug: city, pageType: "city", status: "published" },
  });
  if (!page) return null;

  const relatedArticleSlugs = page.relatedArticles || [];
  const guides =
    relatedArticleSlugs.length > 0
      ? await prisma.guide.findMany({
          where: { slug: { in: relatedArticleSlugs }, status: "published" },
          select: {
            slug: true,
            title: true,
            summary: true,
            seoTitle: true,
            seoDescription: true,
            publishedAt: true,
            category: true,
          },
        })
      : [];

  return { page, guides };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const data = await getCityPage(city);
  if (!data) return { title: "城市页面未找到" };

  const { page } = data;
  const hero = (page.heroSection as Record<string, any> | null) || {};
  const title = page.seoTitle || hero.title || page.title;
  const description = page.seoDescription || hero.subtitle || hero.summary || "";
  const canonical = `${SITE_URL}/cities/${city}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: "index,follow",
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: "zh_CN",
      siteName: "绝世百宝箱",
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const data = await getCityPage(city);
  if (!data) notFound();

  const { page, guides } = data;
  const hero = (page.heroSection as Record<string, any> | null) || {};
  const faqItems = (page.faqItems as any[] | null) || [];
  const officialLinks = (page.officialLinks as any[] | null) || [];
  const ctaConfig = (page.ctaConfig as Record<string, any> | null) || {};
  const relatedTools = getRelatedTools(page.relatedTools);

  const cityName = hero.title || page.title || city;
  const heroSubtitle = hero.subtitle || hero.summary || "";

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 overflow-x-hidden">
          {/* Breadcrumb */}
          <BreadcrumbBar
            items={[
              { title: "首页", href: "/" },
              { title: cityName, current: true }
            ]}
            className="mb-6"
          />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-lg">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Building2 className="w-5 h-5 text-indigo-200" />
            <TagGroup
              tags={[{ text: "城市指南", type: "info", rounded: true }]}
              className="[&_span]:bg-white/15 [&_span]:border [&_span]:border-white/10 [&_span]:text-white"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-3">
            {cityName}
          </h1>
          {heroSubtitle && (
            <p className="text-base sm:text-lg text-indigo-100 leading-relaxed max-w-2xl">
              {heroSubtitle}
            </p>
          )}
          {hero.badges && Array.isArray(hero.badges) && hero.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {hero.badges.map((badge: any, i: number) => (
                <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs border border-white/10">
                  {badge.label || badge}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <ContentSection>
            <SectionHeader title="相关工具" icon={<Wrench className="w-5 h-5 text-gray-600" />} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.route}
                  href={tool.route}
                  className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
                >
                  <span className="text-2xl">{tool.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {tool.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">{tool.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 mt-1 transition-colors" />
                </Link>
              ))}
            </div>
          </ContentSection>
        )}

        {/* Related Guides */}
        {guides.length > 0 && (
          <ContentSection>
            <SectionHeader title="相关指南" icon={<BookOpen className="w-5 h-5 text-gray-600" />} />
            <div className="space-y-3">
              {guides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
                >
                  <div className="font-semibold text-gray-900">{guide.title}</div>
                  {guide.summary && <div className="text-sm text-gray-500 mt-1 line-clamp-2">{guide.summary}</div>}
                </Link>
              ))}
            </div>
          </ContentSection>
        )}

        {/* FAQ */}
        {faqItems.length > 0 && (
          <ContentSection>
            <SectionHeader title="常见问题" icon={<HelpCircle className="w-5 h-5 text-gray-600" />} />
            <div className="space-y-3">
              {faqItems.map((faq: any, i: number) => (
                <details key={i} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                    {faq.question || faq.q}
                    <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                    {faq.answer || faq.a}
                  </div>
                </details>
              ))}
            </div>
          </ContentSection>
        )}

        {/* Official Links */}
        {officialLinks.length > 0 && (
          <ContentSection>
            <SectionHeader title="官方链接" icon={<ExternalLink className="w-5 h-5 text-gray-600" />} />
            <div className="space-y-2">
              {officialLinks.map((link: any, i: number) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-900 font-medium">{link.label || link.title || link.url}</span>
                </a>
              ))}
            </div>
          </ContentSection>
        )}

        {/* CTA */}
        {ctaConfig.title && (
          <PageCTA
            title={ctaConfig.title}
            description={ctaConfig.description || ""}
            primaryAction={{
              label: ctaConfig.buttonText || "开始",
              href: ctaConfig.href || "#"
            }}
            variant="dark"
          />
        )}

        {/* Disclaimer */}
        <div className="text-xs text-gray-400 border-t pt-4">
          <p>
            ※ 本页面内容仅供参考，不构成专业建议。具体操作请以相关机构最新要求为准。
          </p>
        </div>
      </div>
    </div>
    </JueshiV4PublicShell>
  );
}
