import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ChecklistClient from "./checklist-client";
import { Breadcrumb } from "@/components/breadcrumb";
import { ChecklistViewTracker } from "./checklist-view-tracker";

interface Props {
  params: Promise<{ slug: string }>;
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getChecklist(slug);
  if (!page) return { title: "未找到清单" };

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || "",
    alternates: { canonical: `https://jueshi.net/checklists/${page.slug}` },
  };
}

export default async function ChecklistPage({ params }: Props) {
  const { slug } = await params;
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
                <a key={toolSlug} href={`/tools/${toolSlug}`} className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                  <span className="font-medium text-teal-700">{name}</span>
                  <div className="text-xs text-gray-500 mt-1">/tools/{toolSlug} →</div>
                </a>
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
