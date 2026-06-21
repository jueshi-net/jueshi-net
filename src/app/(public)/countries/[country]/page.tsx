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
  Sparkles,
  Globe,
} from "lucide-react";
import { SITE_URL } from "@/lib/seo";

// Force SSR — DB not available during build time
export const dynamic = "force-dynamic";

// ─── Tool map (mirrors guides/[slug]) ────────────────────────────────────
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
  params: Promise<{ country: string }>;
}

async function getCountryPage(country: string) {
  const page = await prisma.landingPage.findUnique({
    where: { slug: country, pageType: "country", status: "published" },
  });
  if (!page) return null;

  // Fetch related articles (guides) by slug
  const relatedArticleSlugs = page.relatedArticles || [];
  const articles =
    relatedArticleSlugs.length > 0
      ? await prisma.article.findMany({
          where: { slug: { in: relatedArticleSlugs }, status: "published" },
          select: {
            slug: true,
            title: true,
            excerpt: true,
            seoTitle: true,
            seoDescription: true,
            publishedAt: true,
            category: true,
          },
        })
      : [];

  // Also fetch published Guides matching the related article slugs
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

  return { page, articles, guides };
}

// ─── SEO Metadata ────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const data = await getCountryPage(country);
  if (!data) return { title: "国家页面未找到" };

  const { page } = data;
  const hero = (page.heroSection as Record<string, any> | null) || {};
  const title = page.seoTitle || hero.title || page.title;
  const description = page.seoDescription || hero.subtitle || hero.summary || "";
  const canonical = page.seoTitle ? `${SITE_URL}/countries/${country}` : `${SITE_URL}/countries/${country}`;
  const robots = (page as any).robots || "index,follow";

  return {
    title,
    description,
    alternates: { canonical },
    robots,
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

// ─── Page ────────────────────────────────────────────────────────────────
export default async function CountryPage({ params }: Props) {
  const { country } = await params;
  const data = await getCountryPage(country);
  if (!data) notFound();

  const { page, articles, guides } = data;
  const hero = (page.heroSection as Record<string, any> | null) || {};
  const faqItems = (page.faqItems as any[] | null) || [];
  const officialLinks = (page.officialLinks as any[] | null) || [];
  const ctaConfig = (page.ctaConfig as Record<string, any> | null) || {};
  const relatedTools = getRelatedTools(page.relatedTools);

  const countryName = hero.title || page.title || country;
  const heroSubtitle = hero.subtitle || hero.summary || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 overflow-x-hidden">
        {/* Breadcrumb: 首页 > 国家 > [Country Name] */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap" aria-label="面包屑导航">
          <Link href="/" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
            <Home className="w-4 h-4" />
            <span>首页</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <Link href="/destinations" className="hover:text-gray-900 transition-colors">
            国家
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{countryName}</span>
        </nav>

        {/* ─── Hero Section ─── */}
        <section className="bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-lg">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Globe className="w-5 h-5 text-teal-200" />
            <span className="px-2.5 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
              国家指南
            </span>
            {hero.flag && <span className="text-2xl">{hero.flag}</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-3">
            {countryName}
          </h1>
          {heroSubtitle && (
            <p className="text-teal-100 text-base sm:text-lg max-w-2xl leading-relaxed">
              {heroSubtitle}
            </p>
          )}
          {hero.tags && Array.isArray(hero.tags) && hero.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {hero.tags.map((tag: string, i: number) => (
                <span key={i} className="px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs border border-white/10">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {hero.ctaText && hero.ctaUrl && (
            <div className="mt-6">
              <Link
                href={hero.ctaUrl}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-teal-700 rounded-lg font-medium hover:bg-teal-50 transition-colors min-h-[44px]"
              >
                {hero.ctaText}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>

        {/* ─── 广告位: 内容顶部 ─── */}
        <AdPlaceholder label="广告位 · 内容顶部" />

        {/* ─── Related Tools ─── */}
        {relatedTools.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-teal-600" />
              🛠 实用工具
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.route}
                  href={tool.route}
                  className="group flex flex-col gap-2 p-5 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-teal-200 transition-all"
                >
                  <span className="text-3xl">{tool.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">{tool.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{tool.desc}</p>
                  </div>
                  <div className="mt-auto pt-2 flex items-center gap-1 text-sm text-teal-600 font-medium">
                    使用工具 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── Related Guides (Articles + Guides) ─── */}
        {(articles.length > 0 || guides.length > 0) && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              📖 相关指南
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Guides from Guide model */}
              {guides.map((g) => (
                <Link
                  key={`g-${g.slug}`}
                  href={`/guides/${g.slug}`}
                  className="group block p-4 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-teal-200 transition-all"
                >
                  {g.category && <span className="text-xs text-teal-600 font-medium">{g.category}</span>}
                  <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors mt-1 line-clamp-2">
                    {g.seoTitle || g.title}
                  </h3>
                  {(g.summary || g.seoDescription) && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{g.summary || g.seoDescription}</p>
                  )}
                </Link>
              ))}
              {/* Articles from Article model */}
              {articles.map((a) => (
                <Link
                  key={`a-${a.slug}`}
                  href={`/guides/${a.slug}`}
                  className="group block p-4 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-teal-200 transition-all"
                >
                  {a.category && <span className="text-xs text-teal-600 font-medium">{a.category}</span>}
                  <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors mt-1 line-clamp-2">
                    {a.seoTitle || a.title}
                  </h3>
                  {(a.excerpt || a.seoDescription) && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.excerpt || a.seoDescription}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── 广告位: 内容中部 ─── */}
        <AdPlaceholder label="广告位 · 内容中部" />

        {/* ─── FAQ ─── */}
        {faqItems.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal-600" />
              ❓ 常见问题
            </h2>
            <div className="space-y-3">
              {faqItems.map((faq: any, i: number) => (
                <details key={i} className="group bg-white border border-gray-200 rounded-lg">
                  <summary className="cursor-pointer p-4 font-medium text-gray-900 flex items-center justify-between list-none">
                    {faq.question}
                    <span className="transition-transform group-open:rotate-180 text-gray-400">▼</span>
                  </summary>
                  <div className="px-4 pb-4 text-gray-600 leading-relaxed">{faq.answer}</div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ─── Official Links ─── */}
        {officialLinks.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-teal-600" />
              🔗 官方链接
            </h2>
            <div className="space-y-2">
              {officialLinks
                .filter((l: any) => l.url && l.url.trim())
                .map((link: any, i: number) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{link.label}</span>
                    <span className="text-xs text-gray-400 truncate flex-1 ml-auto">{link.url}</span>
                  </a>
                ))}
            </div>
          </section>
        )}

        {/* ─── Task Chain CTA ─── */}
        {ctaConfig && (ctaConfig.text || ctaConfig.title) && (
          <section className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-center text-white">
            <Sparkles className="w-8 h-8 mx-auto mb-3 text-teal-100" />
            {ctaConfig.title && <h2 className="text-xl font-bold mb-2">{ctaConfig.title}</h2>}
            {ctaConfig.description && <p className="text-teal-100 mb-4 max-w-xl mx-auto">{ctaConfig.description}</p>}
            {ctaConfig.text && ctaConfig.url && (
              <Link
                href={ctaConfig.url}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-700 rounded-lg font-medium hover:bg-teal-50 transition-colors min-h-[44px]"
              >
                {ctaConfig.text}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </section>
        )}

        {/* ─── 广告位: 内容底部 ─── */}
        <AdPlaceholder label="广告位 · 内容底部" />

        {/* ─── Disclaimer ─── */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
          <p className="text-sm text-amber-800">
            <span className="font-medium">免责声明：</span>
            本页内容仅供参考，各国政策、海关规定及平台规则可能随时变化，请以官方最新信息为准。
          </p>
        </div>

        {/* ─── Back navigation ─── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/destinations"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
          >
            <Home className="w-4 h-4" />
            返回国家列表
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Ad slot placeholder component ───────────────────────────────────────
function AdPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-sm"
      aria-label={label}
    >
      {label}
    </div>
  );
}
