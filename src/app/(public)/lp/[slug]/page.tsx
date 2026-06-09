import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SafeAdSlot } from "@/components/ads/SafeAdSlot";
import {
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wrench,
  BookOpen,
  Star,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

// Tool metadata lookup — extend as tools grow
const TOOL_META: Record<string, { name: string; route: string; icon: string; desc: string }> = {
  "shipping-calculator": { name: "运费估算器", route: "/tools/shipping-calculator", icon: "🧮", desc: "计算体积重和费用参考" },
  "shipping-estimator": { name: "运费估算器", route: "/tools/shipping-calculator", icon: "🧮", desc: "计算体积重和费用参考" },
  "hs-code": { name: "HS编码查询", route: "/tools/hs-code", icon: "📋", desc: "100个常用商品HS编码参考" },
  "sensitive-goods": { name: "敏感物品参考", route: "/tools/sensitive-goods", icon: "⚠️", desc: "特殊物品寄送参考和合规话术" },
  "postal-code": { name: "邮编格式校验", route: "/tools/postal-code", icon: "📮", desc: "5国邮编格式验证" },
  "address-formatter": { name: "地址格式化", route: "/tools/address-formatter", icon: "📝", desc: "5国地址格式一键生成" },
  "invoice": { name: "发票生成器", route: "/tools/invoice", icon: "📄", desc: "在线生成商业发票和装箱单" },
  "commercial-invoice": { name: "商业发票生成器", route: "/tools/commercial-invoice", icon: "📄", desc: "在线生成商业发票" },
  "quote": { name: "报价单生成器", route: "/tools/quote", icon: "💰", desc: "外贸报价单模板" },
  "quote-sheet": { name: "报价单生成器", route: "/tools/quote-sheet", icon: "💰", desc: "外贸报价单模板" },
  "calculator": { name: "计算器", route: "/tools/shipping-calculator", icon: "🔢", desc: "在线计算工具" },
  "customs-generator": { name: "报关单生成", route: "/tools/customs-generator", icon: "📦", desc: "报关单据生成工具" },
  "qrcode": { name: "二维码生成器", route: "/tools/qrcode", icon: "📱", desc: "在线生成二维码" },
  "exchange-rate": { name: "汇率查询", route: "/tools/exchange-rate", icon: "💱", desc: "实时汇率查询和换算" },
  "tracking": { name: "运单号整理工具", route: "/tracking", icon: "📦", desc: "批量整理运单号" },
  "documents": { name: "外贸单据生成器", route: "/tools/documents", icon: "📋", desc: "一站式外贸单据" },
  "shipping-mark": { name: "唛头生成器", route: "/tools/shipping-mark", icon: "🏷️", desc: "一键生成运输唛头" },
  "container": { name: "集装箱装载计算器", route: "/tools/container", icon: "🚢", desc: "计算集装箱装载方案" },
  "handover-note": { name: "交接单生成器", route: "/tools/handover-note", icon: "📝", desc: "生成货物交接单" },
  "receipt": { name: "收据生成器", route: "/tools/receipt", icon: "🧾", desc: "在线生成收据" },
  "debit-note": { name: "借记单生成器", route: "/tools/debit-note", icon: "📄", desc: "生成借记单" },
  "shipping-label": { name: "运输标签生成器", route: "/tools/shipping-label", icon: "🏷️", desc: "生成运输标签" },
  "inbound-receipt": { name: "入库单生成器", route: "/tools/inbound-receipt", icon: "📦", desc: "生成入库单" },
  "memo": { name: "备忘录工具", route: "/tools/memo", icon: "📝", desc: "快速创建备忘录" },
  "inbound": { name: "入库管理", route: "/tools/inbound", icon: "📦", desc: "入库记录管理" },
  "zip": { name: "邮编查询", route: "/tools/zip", icon: "📮", desc: "邮编查询工具" },
  "video-script-sop": { name: "视频脚本SOP", route: "/tools/video-script-sop", icon: "🎬", desc: "视频脚本标准流程" },
  "document-tools": { name: "单据工具集合", route: "/tools/document-tools", icon: "📋", desc: "外贸单据工具集合" },
};

function getToolInfo(slug: string) {
  return TOOL_META[slug] || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.landingPage.findUnique({ where: { slug } });

  if (!page || page.status !== "published") {
    return { title: "页面未找到" };
  }

  return {
    title: page.seoTitle || `${page.title} | 海外百宝箱`,
    description: page.seoDescription || undefined,
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription || undefined,
      type: "website",
      url: `https://jueshi.net/lp/${page.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: page.seoTitle || page.title,
      description: page.seoDescription || undefined,
    },
    alternates: {
      canonical: `https://jueshi.net/lp/${page.slug}`,
    },
  };
}

/** Render FAQ accordion (client-side) */
function FAQAccordion({ items }: { items: { question: string; answer: string }[] }) {
  // Since this is a server component, we use a simple details/summary pattern
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <details
          key={i}
          className="group bg-white border border-gray-100 rounded-xl overflow-hidden"
        >
          <summary className="flex items-center justify-between cursor-pointer p-5 font-medium text-gray-900 hover:bg-gray-50 transition-colors list-none">
            <span>{item.question}</span>
            <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="px-5 pb-5 text-gray-600 leading-relaxed">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

export default async function LandingPagePublic({ params }: Props) {
  const { slug } = await params;

  const page = await prisma.landingPage.findUnique({ where: { slug } });

  if (!page || page.status !== "published") {
    notFound();
  }

  const hero = page.heroSection as Record<string, string> | null;
  const faqItems = (page.faqItems as { question: string; answer: string }[] | null) || [];
  const officialLinks = (page.officialLinks as { label: string; url: string; icon?: string }[] | null) || [];
  const ctaConfig = page.ctaConfig as { text?: string; url?: string; style?: string } | null;
  const relatedTools = (page.relatedTools as string[] | null) || [];
  const relatedTopics = (page.relatedTopics as string[] | null) || [];
  const relatedArticles = (page.relatedArticles as string[] | null) || [];

  // Fetch matching tools
  const tools = relatedTools.map(getToolInfo).filter(Boolean);
  if (page.primaryTool) {
    const primary = getToolInfo(page.primaryTool);
    if (primary && !tools.find(t => t.route === primary.route)) {
      tools.unshift(primary);
    }
  }

  // Fetch matching articles
  const articles = relatedArticles.length > 0
    ? await prisma.article.findMany({
        where: { slug: { in: relatedArticles }, status: "published" },
        select: { title: true, slug: true, excerpt: true, category: true },
      })
    : [];

  // Fetch matching topics
  const topics = relatedTopics.length > 0
    ? await prisma.topic.findMany({
        where: { slug: { in: relatedTopics }, status: "published" },
        select: { title: true, slug: true, summary: true },
      }).catch(() => [])
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      {hero && (
        <section className="bg-gradient-to-br from-teal-600 to-teal-800 text-white">
          <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {hero.title || page.title}
            </h1>
            {(hero.subtitle || page.seoDescription) && (
              <p className="text-lg sm:text-xl text-teal-100 mb-8 max-w-3xl mx-auto">
                {hero.subtitle || page.seoDescription}
              </p>
            )}
            {hero.ctaText && (
              <a
                href={hero.ctaUrl || "#"}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-all shadow-lg text-lg"
              >
                {hero.ctaText}
                <ArrowRight className="w-5 h-5" />
              </a>
            )}
          </div>
        </section>
      )}

      {/* Primary Tool */}
      {page.primaryTool && getToolInfo(page.primaryTool) && (
        <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
            {(() => {
              const t = getToolInfo(page.primaryTool)!;
              return (
                <Link href={t.route} className="group flex items-center gap-4">
                  <span className="text-4xl">{t.icon}</span>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                      {t.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{t.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })()}
          </div>
        </section>
      )}

      {/* Related Tools */}
      {tools.length > 1 && (
        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600" />
            相关工具
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((t) => (
              <Link
                key={t.route}
                href={t.route}
                className="group flex flex-col gap-3 p-5 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-teal-200 transition-all"
              >
                <span className="text-3xl">{t.icon}</span>
                <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">{t.name}</h3>
                <p className="text-sm text-gray-500">{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Ad: landing.block_between */}
      <section className="max-w-5xl mx-auto px-4 py-4">
        <SafeAdSlot
          placementKey="landing.block_between"
          pageType="landing"
          pagePath={`/lp/${slug}`}
          className="mb-8"
        />
      </section>

      {/* Related Topics */}
      {topics.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-teal-600" />
            相关专题
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="group p-5 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-teal-200 transition-all"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-teal-700">{topic.title}</h3>
                {topic.summary && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{topic.summary}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Articles */}
      {articles.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            相关文章
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((a) => (
              <Link
                key={a.slug}
                href={`/guides/${a.slug}`}
                className="group p-5 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-teal-200 transition-all"
              >
                {a.category && (
                  <span className="text-xs text-teal-600 font-medium">{a.category}</span>
                )}
                <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 mt-1 line-clamp-2">{a.title}</h3>
                {a.excerpt && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.excerpt}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqItems.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">常见问题</h2>
          <FAQAccordion items={faqItems} />
        </section>
      )}

      {/* Official Links */}
      {officialLinks.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">官方链接</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {officialLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-teal-200 transition-all"
              >
                <span className="text-2xl">{link.icon || "🔗"}</span>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-teal-700">{link.label}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <ExternalLink className="w-3 h-3" /> 访问官网
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      {ctaConfig && ctaConfig.text && (
        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">{ctaConfig.text}</h2>
            {ctaConfig.url && (
              <a
                href={ctaConfig.url}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-all shadow-lg"
              >
                {ctaConfig.text}
                <ArrowRight className="w-5 h-5" />
              </a>
            )}
          </div>
        </section>
      )}

      {/* Bottom padding */}
      <div className="h-16" />
    </div>
  );
}

export const dynamic = "force-dynamic";
