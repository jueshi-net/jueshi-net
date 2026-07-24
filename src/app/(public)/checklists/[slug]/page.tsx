import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import ChecklistClient from "./checklist-client";
import { Breadcrumb } from "@/components/breadcrumb";
import { ChecklistViewTracker } from "./checklist-view-tracker";
import { ChecklistToolLink } from "./checklist-tool-link";
import TaskChainCta from "@/components/content/task-chain-cta";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// v1.20.42.18.4.7: Check Checklist model first, fallback to LandingPage
async function getChecklistFromModel(slug: string, previewMode: boolean = false) {
  try {
    const checklist = await prisma.checklist.findUnique({
      where: { slug, status: previewMode ? undefined : "published" },
    });
    if (!checklist) return null;
    // In preview mode, allow draft; otherwise only published
    if (!previewMode && checklist.status !== "published") return null;
    return { source: "model" as const, checklist };
  } catch {
    return null; // Checklist table may not exist during build
  }
}

async function getChecklist(slug: string) {
  const page = await prisma.landingPage.findUnique({
    where: { slug, pageType: "checklist", status: "published" },
    select: {
      slug: true, title: true, seoTitle: true, seoDescription: true,
      heroSection: true, faqItems: true, officialLinks: true,
      relatedTools: true, relatedTopics: true, relatedArticles: true,
      ctaConfig: true, updatedAt: true, publishedAt: true,
    },
  });
  if (!page) return null;

  // Fetch related published articles
  const articles = page.relatedArticles.length > 0
    ? await prisma.article.findMany({ where: { slug: { in: page.relatedArticles }, status: "published" }, select: { slug: true, title: true, seoTitle: true, seoDescription: true } })
    : [];

  return { ...page, relatedArticlesData: articles };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const previewMode = sp.preview === "true";

  // v1.20.42.18.6.16.6.84.3.17: Use unified admin auth helper
  if (previewMode) {
    const isAdminUser = await isAdmin();
    if (!isAdminUser) {
      // Return empty metadata - page component will call notFound()
      return {};
    }
  }

  // v1.20.42.18.4.7: Check Checklist model first
  const modelChecklist = await getChecklistFromModel(slug, previewMode);
  if (modelChecklist) {
    const c = modelChecklist.checklist as any;
    const isDraft = c.status === "draft";
    
    // v1.20.42.18.6.16.6.81: Extract keywords from metadataJson
    let keywords = "";
    if (c.metadataJson) {
      try {
        const meta = typeof c.metadataJson === "string" ? JSON.parse(c.metadataJson) : c.metadataJson;
        const contentOps = meta.contentOps || {};
        
        // v1.20.42.18.6.16.6.81: Priority 1 - Use admin-editable metaKeywords from seo
        if (contentOps.seo?.metaKeywords) {
          keywords = contentOps.seo.metaKeywords;
        }
        // Priority 2 - Generate from primaryKeyword + secondaryKeywords
        else if (contentOps.primaryKeyword) {
          const keywordSet = new Set<string>();
          
          // Primary keyword
          if (contentOps.primaryKeyword) {
            keywordSet.add(contentOps.primaryKeyword);
          }
          
          // Secondary keywords
          if (Array.isArray(contentOps.secondaryKeywords)) {
            contentOps.secondaryKeywords.forEach((kw: string) => keywordSet.add(kw));
          }
          
          // Page type keyword
          keywordSet.add("清单");
          
          // Limit to 15 keywords
          const keywordArray = Array.from(keywordSet).slice(0, 15);
          keywords = keywordArray.join(",");
        }
      } catch (e) {
        // Fallback to empty
      }
    }
    
    // Fallback keywords if metadataJson not available
    if (!keywords) {
      keywords = `${c.title},清单,出国清单,留学清单,checklist`;
    }
    
    return {
      title: c.seoTitle || c.title,
      description: c.seoDescription || c.summary || "",
      keywords,
      alternates: c.canonicalUrl ? { canonical: c.canonicalUrl } : { canonical: `https://jueshi.net/checklists/${c.slug}` },
      // Preview mode or draft: noindex, nofollow
      robots: (previewMode || isDraft) ? { index: false, follow: false } : (c.robots === "noindex,nofollow" ? { index: false, follow: false } : undefined),
    };
  }

  // Fallback to LandingPage
  const page = await getChecklist(slug);
  if (!page) {
    // Return empty metadata - page component will call notFound()
    return {};
  }

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || "",
    alternates: { canonical: `https://jueshi.net/checklists/${page.slug}` },
  };
}

export const dynamic = "force-dynamic";

export default async function ChecklistPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const previewMode = sp.preview === "true";

  // v1.20.42.18.6.16.6.84.3.17: Use unified admin auth helper for draft preview
  if (previewMode) {
    const isAdminUser = await isAdmin();
    if (!isAdminUser) {
      // Not admin - treat as not found for security
      notFound();
    }
  }

  // v1.20.42.18.4.7: Check Checklist model first
  const modelChecklist = await getChecklistFromModel(slug, previewMode);
  if (modelChecklist) {
    const c = modelChecklist.checklist as any;
    const isDraft = c.status === "draft";
    const steps = (c.steps as any[]) || [];
    const TOOL_MAP: Record<string, { name: string; route: string; icon: string }> = {
      "hs-code": { name: "HS编码查询", route: "/tools/hs-code", icon: "📋" },
      "shipping-estimator": { name: "运费估算器", route: "/tools/shipping-calculator", icon: "🧮" },
      "postal-code": { name: "邮编格式校验", route: "/tools/postal-code", icon: "📮" },
      "commercial-invoice": { name: "发票生成器", route: "/tools/commercial-invoice", icon: "📄" },
      "packing-list": { name: "装箱单生成", route: "/tools/packing-list", icon: "📦" },
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Preview Mode Banner */}
        {(previewMode || isDraft) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 font-medium">
              🔒 预览模式 — 此内容尚未发布，不会被搜索引擎索引
            </p>
            <p className="text-yellow-600 text-sm mt-1">
              状态: {c.status === "draft" ? "草稿" : c.status} | slug: {c.slug}
            </p>
          </div>
        )}

        <Breadcrumb />

        <section className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{c.title}</h1>
          {c.summary && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{c.summary}</p>}
        </section>

        {/* ContentOps Metadata Rendering - 优化顺序 */}
        {c.metadataJson?.contentOps && (
          <>
            {/* GEO Answer Block - 增强版 */}
            {c.metadataJson.contentOps.geoAnswerBlock?.directAnswer && (
              <section className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-green-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  快速答案
                </h2>
                <p className="text-green-800 text-lg leading-relaxed mb-4">
                  {c.metadataJson.contentOps.geoAnswerBlock.directAnswer}
                </p>
                {c.metadataJson.contentOps.geoAnswerBlock.targetAudience && (
                  <div className="bg-white/60 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-green-900">
                      👥 适用人群：{c.metadataJson.contentOps.geoAnswerBlock.targetAudience}
                    </p>
                  </div>
                )}
                {c.metadataJson.contentOps.geoAnswerBlock.targetCountries && c.metadataJson.contentOps.geoAnswerBlock.targetCountries.length > 0 && (
                  <div className="bg-white/60 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-green-900 mb-2">
                      🌍 适用国家/地区：
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {c.metadataJson.contentOps.geoAnswerBlock.targetCountries.map((country: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {country}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-green-100 rounded-lg p-3 mt-4">
                  <p className="text-sm text-green-900 font-medium">
                    ⏰ 建议准备时间：提前 3-6 个月开始准备
                  </p>
                </div>
              </section>
            )}
          </>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">📋 清单步骤</h2>
          <div className="space-y-3">
            {steps.map((step: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <input type="checkbox" className="mt-1 w-5 h-5 rounded text-teal-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{idx + 1}. {step.title}</span>
                    {step.optional && <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">可选</span>}
                  </div>
                  {step.description && <p className="text-sm text-gray-600 mt-1">{step.description}</p>}
                  {step.toolLink && TOOL_MAP[step.toolLink] && (
                    <a href={TOOL_MAP[step.toolLink].route} className="inline-flex items-center gap-1 mt-2 text-sm text-teal-600 hover:underline">
                      {TOOL_MAP[step.toolLink].icon} {TOOL_MAP[step.toolLink].name} →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400 border-t pt-4">⚠️ 以上内容仅供参考，不构成专业建议。</p>
        </div>

        {c.relatedTools.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🔧 相关工具</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {c.relatedTools.map((ts: string) => TOOL_MAP[ts]).filter(Boolean).map((tool: any) => (
                <a key={tool.route} href={tool.route} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:border-teal-300 transition-all">
                  <span className="text-2xl">{tool.icon}</span>
                  <span className="font-medium text-gray-900">{tool.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Task Chain CTA */}
        <TaskChainCta
          title="把本清单加入发货任务链"
          description="使用工具生成发票/装箱单草稿，一步步完成跨境发货。"
          buttonText="开始跨境发货任务链"
        />

        {/* ContentOps Metadata Rendering - 续 */}
        {c.metadataJson?.contentOps && (
          <>
            {/* FAQ from metadataJson - 前 3 条默认展开 */}
            {c.metadataJson.contentOps.faq && c.metadataJson.contentOps.faq.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border-2 border-blue-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-3xl">❓</span>
                  常见问题
                </h2>
                <div className="space-y-4">
                  {c.metadataJson.contentOps.faq.map((faq: any, i: number) => (
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
            {c.metadataJson.contentOps.internalLinks && c.metadataJson.contentOps.internalLinks.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🔗 相关内容推荐</h2>
                <div className="space-y-4">
                  {/* 按 reason 分组 */}
                  {(() => {
                    const grouped = c.metadataJson.contentOps.internalLinks.reduce((acc: any, link: any) => {
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
            {c.metadataJson.contentOps.videoPack && (
              <section className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎬</span>
                  视频讲解脚本
                </h2>
                {c.metadataJson.contentOps.videoPack.youtubeTitle && (
                  <div className="bg-white/70 rounded-lg p-4 mb-3">
                    <p className="text-sm font-medium text-purple-900 mb-2">📺 YouTube 标题：</p>
                    <p className="text-purple-800 font-semibold">{c.metadataJson.contentOps.videoPack.youtubeTitle}</p>
                  </div>
                )}
                {c.metadataJson.contentOps.videoPack.youtubeUrl && (
                  <div className="bg-white/70 rounded-lg p-4">
                    <p className="text-sm font-medium text-purple-900 mb-2">🔗 视频链接：</p>
                    <a href={c.metadataJson.contentOps.videoPack.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline break-all">
                      {c.metadataJson.contentOps.videoPack.youtubeUrl}
                    </a>
                  </div>
                )}
                <p className="text-sm text-purple-700 mt-4 italic">
                  💡 此视频脚本可用于后续 YouTube/Shorts 内容制作
                </p>
              </section>
            )}

            {/* JSON-LD Structured Data */}
            {c.metadataJson.contentOps.structuredData && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(c.metadataJson.contentOps.structuredData)
                }}
              />
            )}
          </>
        )}
      </div>
    );
  }

  // Fallback: LandingPage model (existing behavior)
  const page = await getChecklist(slug);
  if (!page) notFound();

  const hero = (page.heroSection as Record<string, any>) || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Tracking */}
      <ChecklistViewTracker slug={page.slug} />

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Hero */}
      <section className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
          {hero.audience && <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-full">{hero.audience}</span>}
          {hero.region && <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full">{hero.region}</span>}
          {hero.city && <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full">{hero.city}</span>}
          {hero.scenario && <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full">{hero.scenario}</span>}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{page.title}</h1>
        {hero.summary && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{hero.summary}</p>}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500 flex-wrap">
          {hero.difficulty && <span>难度: {hero.difficulty}</span>}
          {hero.estimatedTime && <span>⏱ {hero.estimatedTime}</span>}
          {hero.lastReviewedAt && <span>🕒 最后更新: {hero.lastReviewedAt}</span>}
        </div>
      </section>

      {/* Quick Answer */}
      {hero.quickAnswer && (
        <section className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h2 className="font-semibold text-green-800 mb-2">💡 快速答案</h2>
          <p className="text-green-700">{hero.quickAnswer}</p>
        </section>
      )}

      {/* Back to Topic / 所属专题 */}
      {(hero.internalLinks?.backToTopic || (page.relatedTopics || []).length > 0) && (
        <section className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <p className="text-sm text-indigo-700">
            📚 本清单属于
            {hero.internalLinks?.backToTopic ? (
              <a href={hero.internalLinks.backToTopic} className="font-medium underline hover:text-indigo-900 mx-1">「{hero.internalLinks.backToTopic.split('/').pop()?.replace(/-/g, ' ')} 专题」</a>
            ) : (
              <span className="font-medium mx-1">「{(page.relatedTopics || []).map(s => s.replace(/-/g, ' ')).join(' / ')}」</span>
            )}
            {(page.relatedTopics || []).length > 0 && (
              <span className="ml-2">
                {(page.relatedTopics || []).map(s => (
                  <a key={s} href={`/topics/${s}`} className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs mr-1 hover:bg-indigo-200">{s.replace(/-/g, ' ')}</a>
                ))}
              </span>
            )}
          </p>
        </section>
      )}

      {/* Progress & Sections */}
      <ChecklistClient
        sections={hero.sections || []}
        slug={page.slug}
      />

      {/* Pitfalls */}
      {hero.avoidPitfalls && hero.avoidPitfalls.length > 0 && (
        <section className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-3">
          <h2 className="font-semibold text-red-800 text-lg">⚠️ 避坑提醒</h2>
          <ul className="space-y-2">
            {hero.avoidPitfalls.map((pitfall: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-red-700">
                <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                <span>{pitfall}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Related Tools */}
      {page.relatedTools && page.relatedTools.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">🛠 本清单用到的工具</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {page.relatedTools.map((toolSlug: string) => {
              const toolNames: Record<string, string> = {
                "postal-code": "邮编查询工具",
                "address-formatter": "地址格式化工具",
                "shipping-calculator": "运费计算工具",
                "invoice": "发票生成工具",
                "commercial-invoice": "商业发票工具",
                "tracking": "物流追踪工具",
                "hs-code": "HS 编码查询工具",
                "quote-sheet": "报价单工具",
              };
              const name = toolNames[toolSlug] || `${toolSlug.replace(/-/g, ' ')} 工具`;
              return (
                <ChecklistToolLink
                  key={toolSlug}
                  slug={page.slug}
                  toolSlug={toolSlug}
                  name={name}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Related Topics */}
      {page.relatedTopics && page.relatedTopics.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">📚 相关专题</h2>
          <div className="flex flex-wrap gap-2">
            {page.relatedTopics.map((slug: string) => (
              <a key={slug} href={`/topics/${slug}`} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                {slug}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Related Articles */}
      {page.relatedArticlesData && page.relatedArticlesData.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">📖 相关文章</h2>
          <div className="space-y-3">
            {page.relatedArticlesData.map((art: any) => (
              <a key={art.slug} href={`/guides/${art.slug}`} className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="font-medium text-gray-900">{art.seoTitle || art.title}</div>
                {art.seoDescription && <div className="text-sm text-gray-500 mt-1 line-clamp-2">{art.seoDescription}</div>}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Official Links — only show reviewed links with real URLs */}
      {(() => {
        const pageLinks = (page.officialLinks as any[]) || [];
        const heroLinks = hero.officialLinks || [];
        // Prefer heroSection links (newer), fall back to page-level links
        const raw = heroLinks.length > 0 ? heroLinks : pageLinks;
        const links = (raw as any[]).filter((l: any) => l.url && l.url.trim() && !l.needsReview);
        if (links.length === 0) return null;
        return (
          <section>
            <h2 className="font-semibold text-gray-900 text-lg mb-4">🔗 官方链接</h2>
            <div className="space-y-2">
              {links.map((link: any, i: number) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-gray-700 font-medium">{link.label}</span>
                  <span className="text-xs text-gray-400 truncate flex-1">{link.url}</span>
                </a>
              ))}
            </div>
          </section>
        );
      })()}

      {/* FAQ */}
      {page.faqItems && (page.faqItems as any[]).length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">❓ 常见问题</h2>
          <div className="space-y-4">
            {(page.faqItems as any[]).map((faq: any, i: number) => (
              <details key={i} className="group bg-gray-50 rounded-lg">
                <summary className="cursor-pointer p-4 font-medium text-gray-900 flex items-center justify-between list-none">
                  {faq.question}
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Next Steps — only link to published checklists */}
      {hero.nextSteps && hero.nextSteps.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">👣 完成本清单后，建议继续阅读</h2>
          <div className="flex flex-wrap gap-3">
            {hero.nextSteps.map((step: any, i: number) => {
              const stepText = typeof step === "string" ? step : (step.title || step);
              const stepUrl = typeof step === "object" && step.url ? step.url : null;
              const stepSlug = stepUrl
                ? stepUrl.replace('/checklists/', '')
                : stepText.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
              // Only render if we have an explicit URL, skip auto-generated draft links
              if (!stepUrl) return null;
              return (
                <a
                  key={i}
                  href={stepUrl}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
                >
                  {stepText}
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Task Chain CTA */}
      <TaskChainCta
        title="把本清单加入发货任务链"
        description="使用工具生成发票/装箱单草稿，一步步完成跨境发货。"
        buttonText="开始跨境发货任务链"
      />

      {/* CTA */}
      {page.ctaConfig && (
        <section className="text-center py-8">
          <a
            href={(page.ctaConfig as any).url || "/register"}
            className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-lg"
          >
            {(page.ctaConfig as any).text || "立即开始"}
          </a>
        </section>
      )}
    </div>
  );
}
