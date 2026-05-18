import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Eye, Clock, ArrowLeft, Wrench, ArrowRight, BookOpen, Home } from "lucide-react";
import Link from "next/link";
import { TrackedArticleToolLink } from "@/components/tracked-article-tool-link";
import { AdSlot } from "@/components/ad-slot";
import { ArticleLayoutClient } from "./article-layout-client";

const TOOL_MAP: Record<string, { name: string; route: string; icon: string; desc: string }> = {
  "tracking": { name: "运单号整理工具", route: "/tracking", icon: "📦", desc: "批量整理运单号，自动识别承运商" },
  "shipping-estimator": { name: "运费估算器", route: "/tools/shipping-calculator", icon: "🧮", desc: "计算体积重和费用参考" },
  "hs-code": { name: "HS编码查询", route: "/tools/hs-code", icon: "📋", desc: "100个常用商品HS编码参考" },
  "sensitive-goods": { name: "敏感物品参考", route: "/tools/sensitive-goods", icon: "⚠️", desc: "特殊物品寄送参考和合规话术" },
  "postal-code": { name: "邮编格式校验", route: "/tools/postal-code", icon: "📮", desc: "5国邮编格式验证" },
  "address-formatter": { name: "地址格式化", route: "/tools/address-formatter", icon: "📝", desc: "5国地址格式一键生成" },
  "invoice": { name: "发票生成器", route: "/tools/invoice", icon: "📄", desc: "在线生成商业发票和装箱单" },
  "quote": { name: "报价单生成器", route: "/tools/quote", icon: "💰", desc: "外贸报价单模板" },
  "calculator": { name: "计算器", route: "/tools/shipping-calculator", icon: "🔢", desc: "在线计算工具" },
  "customs-generator": { name: "报关单生成", route: "/tools/customs-generator", icon: "📦", desc: "报关单据生成工具" },
};

function getRelatedTools(relatedTools: unknown): Array<{ name: string; route: string; icon: string; desc: string }> {
  if (!relatedTools) return [];
  const slugs: string[] = typeof relatedTools === "string" ? JSON.parse(relatedTools) : (Array.isArray(relatedTools) ? relatedTools : []);
  return slugs.map((slug) => TOOL_MAP[slug]).filter(Boolean);
}

interface Props {
  params: Promise<{ slug: string }>;
}

/** Extract TOC headings from HTML content */
interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function extractToc(html: string): TocItem[] {
  const toc: TocItem[] = [];
  const regex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
  let match;
  let idx = 0;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10) as 2 | 3;
    const text = match[2].replace(/<[^>]*>/g, "").trim();
    if (text) {
      const id = `heading-${idx++}`;
      toc.push({ id, text, level });
    }
  }
  return toc;
}

/** Add id attributes to h2/h3 headings for anchor links */
function addHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  let idx = 0;
  const result = html.replace(/<h([23])\s*([^>]*)>(.*?)<\/h\1>/gi, (_full, level, attrs, content) => {
    const id = `heading-${idx++}`;
    const text = content.replace(/<[^>]*>/g, "").trim();
    if (text) {
      toc.push({ id, text, level: parseInt(level, 10) as 2 | 3 });
    }
    const newAttrs = attrs.replace(/\bid=["'][^"']*["']/gi, "").trim();
    return `<h${level} id="${id}" ${newAttrs}>${content}</h${level}>`;
  });
  return { html: result, toc };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || article.status !== "published") return { title: "文章未找到" };

  const desc = article.seoDescription || article.excerpt || article.content.replace(/<[^>]*>/g, "").slice(0, 150);

  return {
    title: `${article.title} | 海外百宝箱`,
    description: desc,
    openGraph: {
      title: article.title,
      description: desc,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: article.author ? [article.author] : ["海外百宝箱"],
      images: article.coverImage ? [{ url: article.coverImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: desc,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  "跨境寄送": "跨境寄送",
  "海外生活": "海外生活",
  "出海经营": "出海经营",
};

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  let article: Awaited<ReturnType<typeof prisma.article.findUnique>>;
  try {
    article = await prisma.article.findUnique({ where: { slug } });
  } catch {
    notFound();
  }

  if (!article || article.status !== "published") {
    notFound();
  }

  // Fetch related articles (same category, published, excluding current)
  const relatedArticles = await prisma.article.findMany({
    where: {
      status: "published",
      slug: { not: slug },
      ...(article.category ? { category: article.category } : {}),
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
    select: { title: true, slug: true, excerpt: true, publishedAt: true, category: true },
  });

  const readingTime = Math.max(1, Math.ceil(article.content.replace(/<[^>]*>/g, "").length / 500));
  const publishDate = article.publishedAt || article.createdAt;
  const updateDate = article.updatedAt;
  const categoryLabel = article.category ? (CATEGORY_LABELS[article.category] || article.category) : "实用指南";
  const authorDisplay = article.author || "海外百宝箱编辑部";

  // Process content: add heading IDs and extract TOC
  const { html: processedContent, toc } = addHeadingIds(article.content);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.content.replace(/<[^>]*>/g, "").slice(0, 200),
    author: { "@type": "Organization", name: authorDisplay },
    publisher: { "@type": "Organization", name: "海外百宝箱" },
    datePublished: publishDate.toISOString(),
    dateModified: updateDate.toISOString(),
    mainEntityOfPage: `https://jueshi.net/guides/${slug}`,
  };

  return (
    <ArticleLayoutClient toc={toc}>
      <div className="min-h-screen bg-gray-50">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="面包屑导航">
            <Link href="/" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
              <Home className="w-4 h-4" />
              <span>首页</span>
            </Link>
            <span className="text-gray-300">/</span>
            <Link href="/guides" className="hover:text-gray-900 transition-colors">
              实用指南
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium truncate">{article.title}</span>
          </nav>

          {/* Article Card */}
          <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Hero Section */}
            <header className="px-6 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-8">
              {article.coverImage && (
                <div className="w-full aspect-[16/7] sm:aspect-[21/9] bg-gray-100 rounded-lg mb-6 overflow-hidden">
                  <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" loading="eager" />
                </div>
              )}

              <div className="mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-teal-50 text-teal-700 border border-teal-100">
                  <BookOpen className="w-3.5 h-3.5" />
                  {categoryLabel}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6">
                  {article.excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 flex-shrink-0" />
                  发布于 {new Date(publishDate).toLocaleDateString("zh-CN")}
                </span>
                {updateDate && updateDate > publishDate && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    更新于 {new Date(updateDate).toLocaleDateString("zh-CN")}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 flex-shrink-0" />
                  {article.views} 阅读
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  约 {readingTime} 分钟
                </span>
                <span className="hidden sm:inline text-gray-300">|</span>
                <span className="hidden sm:inline text-gray-600">{authorDisplay}</span>
              </div>
            </header>

            {/* Ad: Article Top */}
            <div className="px-6 sm:px-10">
              <AdSlot placement="article-top" className="mb-6 sm:mb-8" />
            </div>

            {/* Content */}
            <div className="px-6 sm:px-10">
              <div
                className="prose prose-gray max-w-none sm:prose-lg
                  prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mt-8 prose-headings:mb-4 prose-headings:scroll-mt-20
                  prose-h2:text-2xl prose-h2:border-b prose-h2:border-gray-100 prose-h2:pb-2
                  prose-h3:text-xl prose-h3:text-gray-800
                  prose-p:text-gray-700 prose-p:leading-7 prose-p:my-4
                  prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900
                  prose-li:text-gray-700
                  prose-img:rounded-lg
                  prose-blockquote:border-l-teal-500 prose-blockquote:bg-teal-50/50 prose-blockquote:py-2 prose-blockquote:px-4
                  prose-code:text-teal-700 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-gray-900 prose-pre:text-gray-100
                  prose-hr:border-gray-200
                  dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            </div>

            {/* Ad: Article Bottom */}
            <div className="px-6 sm:px-10">
              <AdSlot placement="article-bottom" className="mt-8 mb-8" />
            </div>

            {/* Related Tools */}
            {getRelatedTools(article.relatedTools).length > 0 && (
              <section className="px-6 sm:px-10 mt-4 pt-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-teal-600" />
                  🔧 相关工具
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getRelatedTools(article.relatedTools).map((tool) => (
                    <TrackedArticleToolLink key={tool.route} href={tool.route} toolName={tool.name}>
                      <div className="group flex flex-col gap-3 p-5 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md hover:border-teal-200 transition-all duration-200">
                        <span className="text-3xl">{tool.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">{tool.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{tool.desc}</p>
                        </div>
                        <div className="mt-auto pt-2 flex items-center gap-1 text-sm text-teal-600 font-medium">
                          使用工具 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </TrackedArticleToolLink>
                  ))}
                </div>
              </section>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section className="px-6 sm:px-10 mt-4 pt-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                  📖 相关文章
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedArticles.map((ra) => (
                    <Link key={ra.slug} href={`/guides/${ra.slug}`} className="group block p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md hover:border-teal-200 transition-all">
                      {ra.category && (
                        <span className="text-xs text-teal-600 font-medium">{ra.category}</span>
                      )}
                      <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors mt-1 line-clamp-2">{ra.title}</h3>
                      {ra.excerpt && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ra.excerpt}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Disclaimer */}
            <div className="px-6 sm:px-10 mt-8 pt-6 border-t border-gray-100">
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">免责声明：</span>
                  内容仅供参考，政策/平台规则可能变化，请以官方信息为准。
                </p>
              </div>
            </div>
          </article>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/guides" className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              <ArrowLeft className="w-4 h-4" />
              返回指南列表
            </Link>
            <Link href="/resources" className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-all shadow-sm">
              查看资源库
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </ArticleLayoutClient>
  );
}

export const dynamic = 'force-dynamic';
