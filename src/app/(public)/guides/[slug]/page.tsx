import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { CalendarDays, Eye, Clock, ArrowLeft, Wrench, ArrowRight, BookOpen, Home } from "lucide-react";
import Link from "next/link";
import TaskChainCta from "@/components/content/task-chain-cta";
import { TrackedArticleToolLink } from "@/components/tracked-article-tool-link";
import { AdSlot } from "@/components/ad-slot";
import { SafeAdSlot } from "@/components/ads/SafeAdSlot";
import { ArticleLayoutClient } from "./article-layout-client";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import { TagGroup, ContentSection, SectionHeader, PageCTA } from "@/components/design-system";

const TOOL_MAP: Record<string, { name: string; route: string; icon: string; desc: string }> = {
  "tracking": { name: "运单号整理工具", route: "/tracking", icon: "📦", desc: "批量整理运单号，自动识别承运商" },
  "shipping-estimator": { name: "运费估算器", route: "/tools/shipping-calculator", icon: "🧮", desc: "计算体积重和费用参考" },
  "hs-code": { name: "HS编码查询", route: "/tools/hs-code", icon: "📋", desc: "100个常用商品HS编码参考" },
  "sensitive-goods": { name: "敏感物品参考", route: "/tools/sensitive-goods", icon: "⚠️", desc: "特殊物品寄送参考和合规话术" },
  "postal-code": { name: "邮编格式校验", route: "/tools/postal-code", icon: "📮", desc: "5国邮编格式验证" },
  "address-formatter": { name: "地址格式化", route: "/tools/address-formatter", icon: "📝", desc: "5国地址格式一键生成" },
  "invoice": { name: "发票生成器", route: "/tools/invoice", icon: "📄", desc: "在线生成商业发票和装箱单" },
  "quote": { name: "报价单生成器", route: "/tools/documents/quotation", icon: "💰", desc: "外贸报价单模板" },
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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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

// v1.20.42.18.4.7: Guide model support — check Guide first, fallback to Article
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const previewMode = sp.preview === "true";

  // v1.20.42.18.6.16.6.84.3.17: Use unified admin auth helper
  if (previewMode) {
    const isAdminUser = await isAdmin();
    if (!isAdminUser) {
      return { title: "未找到指南" };
    }
  }

  // 1. Check Guide model first
  try {
    const guide = await prisma.guide.findUnique({ where: { slug } });
    if (guide && (previewMode || guide.status === "published")) {
      const desc = guide.seoDescription || guide.summary || guide.body.replace(/<[^>]*>/g, "").slice(0, 150);
      const isDraft = guide.status === "draft";
      return {
        title: `${guide.seoTitle || guide.title} | 绝世百宝箱`,
        description: desc,
        alternates: guide.canonicalUrl ? { canonical: guide.canonicalUrl } : { canonical: `https://jueshi.net/guides/${slug}` },
        // Preview mode or draft: noindex, nofollow
        robots: (previewMode || isDraft) ? { index: false, follow: false } : (guide.robots === "noindex,nofollow" ? { index: false, follow: false } : undefined),
        openGraph: {
          title: guide.title,
          description: desc,
          type: "article",
          publishedTime: guide.publishedAt?.toISOString(),
          authors: guide.author ? [guide.author] : ["绝世百宝箱"],
          images: guide.coverImage ? [{ url: guide.coverImage }] : [],
        },
      };
    }
  } catch { /* Guide table may not exist during build — fall through */ }

  // 2. Fallback to Article model
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || article.status !== "published") return { title: "文章未找到" };

  const desc = article.seoDescription || article.excerpt || article.content.replace(/<[^>]*>/g, "").slice(0, 150);

  return {
    title: `${article.title} | 绝世百宝箱`,
    description: desc,
    alternates: { canonical: `https://jueshi.net/guides/${slug}` },
    openGraph: {
      title: article.title,
      description: desc,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: article.author ? [article.author] : ["绝世百宝箱"],
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

export default async function ArticlePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const previewMode = sp.preview === "true";

  // v1.20.42.18.6.16.6.84.3.17: Use unified admin auth helper for draft preview
  if (previewMode) {
    const isAdminUser = await isAdmin();
    if (!isAdminUser) {
      notFound();
    }
  }

  // v1.20.42.18.4.7: Check Guide model first
  try {
    const guide = await prisma.guide.findUnique({ where: { slug } });
    if (guide && (previewMode || guide.status === "published")) {
      const guideTools = getRelatedTools(guide.relatedTools);
      const readingTime = Math.max(1, Math.ceil(guide.body.replace(/<[^>]*>/g, "").length / 500));
      const { html: processedContent, toc } = addHeadingIds(guide.body);
      const publishDate = guide.publishedAt || guide.createdAt;
      const isDraft = guide.status === "draft";

      return (
        <JueshiV4PublicShell>
          <ArticleLayoutClient toc={toc}>
            <div className="min-h-screen bg-gray-50">
              <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
                {/* Preview Mode Banner */}
                {(previewMode || isDraft) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center mb-6">
                    <p className="text-yellow-800 font-medium">
                      🔒 预览模式 — 此内容尚未发布，不会被搜索引擎索引
                    </p>
                    <p className="text-yellow-600 text-sm mt-1">
                      状态: {guide.status} | slug: {guide.slug}
                    </p>
                  </div>
                )}

                <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <header className="px-6 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-8">
                    <div className="mb-4">
                      <TagGroup
                        tags={[{ text: guide.category || "指南", type: "info", rounded: true }]}
                      />
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">{guide.title}</h1>
                    {guide.summary && <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6">{guide.summary}</p>}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {guide.author && <span>{guide.author}</span>}
                      <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" />{publishDate.toLocaleDateString("zh-CN")}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />约 {readingTime} 分钟</span>
                    </div>
                </header>

                <div className="px-6 sm:px-10 pb-8">
                  <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: processedContent }} />
                  <p className="mt-8 text-sm text-gray-400 border-t pt-4">⚠️ 以上内容仅供参考，不构成专业建议。HS编码、报关、税务等具体问题请咨询专业人士。</p>
                </div>

                {guideTools.length > 0 && (
                  <div className="px-6 sm:px-10 py-6 bg-gray-50 border-t">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Wrench className="w-5 h-5 text-teal-600" />相关工具</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {guideTools.map((tool) => (
                        <Link key={tool.route} href={tool.route} className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-teal-300 hover:shadow-sm transition-all">
                          <span className="text-2xl">{tool.icon}</span>
                          <div><div className="font-medium text-gray-900">{tool.name}</div><div className="text-sm text-gray-500">{tool.desc}</div></div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </article>

              {/* Task Chain CTA */}
              <TaskChainCta />

              {/* ContentOps Metadata Rendering - 优化版 */}
              {guide.metadataJson?.contentOps && (
                <>
                  {/* GEO Answer Block - 增强版 */}
                  {guide.metadataJson.contentOps.geoAnswerBlock?.directAnswer && (
                    <section className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 mt-6 shadow-sm">
                      <h2 className="text-xl font-bold text-green-900 mb-3 flex items-center gap-2">
                        <span className="text-2xl">💡</span>
                        快速答案
                      </h2>
                      <p className="text-green-800 text-lg leading-relaxed mb-4">
                        {guide.metadataJson.contentOps.geoAnswerBlock.directAnswer}
                      </p>
                      {guide.metadataJson.contentOps.geoAnswerBlock.targetAudience && (
                        <div className="bg-white/60 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-green-900">
                            👥 适用人群：{guide.metadataJson.contentOps.geoAnswerBlock.targetAudience}
                          </p>
                        </div>
                      )}
                      {guide.metadataJson.contentOps.geoAnswerBlock.targetCountries && guide.metadataJson.contentOps.geoAnswerBlock.targetCountries.length > 0 && (
                        <div className="bg-white/60 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-green-900 mb-2">
                            🌍 适用国家/地区：
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {guide.metadataJson.contentOps.geoAnswerBlock.targetCountries.map((country: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                {country}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  )}

                  {/* FAQ from metadataJson - 前 3 条默认展开 */}
                  {guide.metadataJson.contentOps.faq && guide.metadataJson.contentOps.faq.length > 0 && (
                    <section className="bg-white rounded-xl shadow-sm border-2 border-blue-200 p-6 mt-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="text-3xl">❓</span>
                        常见问题
                      </h2>
                      <div className="space-y-4">
                        {guide.metadataJson.contentOps.faq.map((faq: any, i: number) => (
                          <details key={i} className="group bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200" open={i < 3}>
                            <summary className="cursor-pointer p-4 font-semibold text-gray-900 flex items-center justify-between list-none text-lg">
                              <span>{faq.question}</span>
                              <span className="transition-transform group-open:rotate-180 text-blue-600">▼</span>
                            </summary>
                            <div className="px-4 pb-4 text-gray-700 leading-relaxed text-base">{faq.answer}</div>
                          </details>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Internal Links - 分组显示 */}
                  {guide.metadataJson.contentOps.internalLinks && guide.metadataJson.contentOps.internalLinks.length > 0 && (
                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">🔗 相关内容推荐</h2>
                      <div className="space-y-4">
                        {(() => {
                          const grouped = guide.metadataJson.contentOps.internalLinks.reduce((acc: any, link: any) => {
                            const category = link.reason || '其他';
                            if (!acc[category]) acc[category] = [];
                            acc[category].push(link);
                            return acc;
                          }, {});
                          
                          return Object.entries(grouped).map(([category, links]: [string, any]) => (
                            <div key={category}>
                              <h3 className="text-lg font-semibold text-gray-800 mb-3">{category}</h3>
                              <div className="space-y-2">
                                {(links as any[]).map((link: any, i: number) => (
                                  <a key={i} href={link.url} className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                    <div className="font-medium text-gray-900 text-base">{link.title}</div>
                                    {link.reason && <div className="text-sm text-gray-500 mt-1">{link.reason}</div>}
                                  </a>
                                ))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </section>
                  )}

                  {/* Video Pack Preview */}
                  {guide.metadataJson.contentOps.videoPack && (
                    <section className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mt-6">
                      <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">🎬</span>
                        视频讲解脚本
                      </h2>
                      {guide.metadataJson.contentOps.videoPack.youtubeTitle && (
                        <div className="bg-white/70 rounded-lg p-4 mb-3">
                          <p className="text-sm font-medium text-purple-900 mb-2">📺 YouTube 标题：</p>
                          <p className="text-purple-800 font-semibold">{guide.metadataJson.contentOps.videoPack.youtubeTitle}</p>
                        </div>
                      )}
                      {guide.metadataJson.contentOps.videoPack.youtubeUrl && (
                        <div className="bg-white/70 rounded-lg p-4">
                          <p className="text-sm font-medium text-purple-900 mb-2">🔗 视频链接：</p>
                          <a href={guide.metadataJson.contentOps.videoPack.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline break-all">
                            {guide.metadataJson.contentOps.videoPack.youtubeUrl}
                          </a>
                        </div>
                      )}
                      <p className="text-sm text-purple-700 mt-4 italic">
                        💡 此视频脚本可用于后续 YouTube/Shorts 内容制作
                      </p>
                    </section>
                  )}

                  {/* JSON-LD Structured Data */}
                  {guide.metadataJson.contentOps.structuredData && (
                    <script
                      type="application/ld+json"
                      dangerouslySetInnerHTML={{
                        __html: JSON.stringify(guide.metadataJson.contentOps.structuredData)
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </ArticleLayoutClient>
        </JueshiV4PublicShell>
      );
    }
  } catch { /* Guide table may not exist during build — fall through to Article */ }

  // Fallback: Article model (existing behavior)
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
  const authorDisplay = article.author || "绝世百宝箱编辑部";

  // Process content: add heading IDs and extract TOC
  const { html: processedContent, toc } = addHeadingIds(article.content);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.content.replace(/<[^>]*>/g, "").slice(0, 200),
    author: { "@type": "Organization", name: authorDisplay },
    publisher: { "@type": "Organization", name: "绝世百宝箱" },
    datePublished: publishDate.toISOString(),
    dateModified: updateDate.toISOString(),
    mainEntityOfPage: `https://jueshi.net/guides/${slug}`,
  };

  return (
    <JueshiV4PublicShell>
      <ArticleLayoutClient toc={toc}>
        <div className="min-h-screen bg-gray-50">
          {/* JSON-LD */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
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
                <TagGroup
                  tags={[{ text: categoryLabel, type: "info", rounded: true }]}
                />
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

            {/* SafeAdSlot: article.footer_recommend */}
            <div className="px-6 sm:px-10 mt-4">
              <SafeAdSlot
                placementKey="article.footer_recommend"
                pageType="article"
                pagePath={`/guides/${slug}`}
                className="mb-8"
              />
            </div>

            {/* Related Tools */}
            {getRelatedTools(article.relatedTools).length > 0 && (
              <ContentSection className="px-6 sm:px-10 mt-4 pt-8 border-t border-gray-100">
                <SectionHeader title="相关工具" icon={<Wrench className="w-5 h-5 text-teal-600" />} />
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
              </ContentSection>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <ContentSection className="px-6 sm:px-10 mt-4 pt-8 border-t border-gray-100">
                <SectionHeader title="相关文章" icon={<BookOpen className="w-5 h-5 text-teal-600" />} />
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
              </ContentSection>
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

          {/* Task Chain CTA */}
          <TaskChainCta />

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
  </JueshiV4PublicShell>
  );
}

export const dynamic = 'force-dynamic';
