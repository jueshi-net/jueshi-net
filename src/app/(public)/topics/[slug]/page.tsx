import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import {
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  Star,
  Shield,
  Zap,
  Users,
  Target,
  CheckCircle,
  AlertCircle,
  Home,
  ChevronRight,
  Sparkles,
  Download,
  BookOpen,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnail } from "@/lib/youtube";
import { getTopicBySlug as getCmsTopicBySlug } from "@/lib/cms-utils";
import SmartRelatedLinks from "@/components/smart-related-links";
import TaskChainCta from "@/components/content/task-chain-cta";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import { ContentSection, SectionHeader } from "@/components/design-system";

// Reuse rating/category constants from static data (these are UI-only constants, not data)
import {
  ratingInfo,
  categories,
} from "@/lib/topics/overseas-essential-apps";

const RATING_ORDER = ["S", "A", "B", "C", "D"] as const;

// v1.20.42.18.6.16.6.84.3.21: Removed generateStaticParams to fix
// "Page changed from static to dynamic at runtime" error caused by
// await searchParams (preview mode). All topic pages are now dynamic.
// Removed force-dynamic to allow proper HTTP 404 status code setting.
export const revalidate = 0;

// ===== Data fetching =====

async function getTopicBySlug(slug: string) {
  try {
    const topic = await prisma.topic.findUnique({
      where: { slug },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        sections: { orderBy: { sortOrder: "asc" } },
      },
    });
    return topic;
  } catch {
    return null;
  }
}

// ===== Metadata =====

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
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
  const topic = await getTopicBySlug(slug);

  if (!topic || (!previewMode && topic.status !== "published")) {
    // Return empty metadata - page component will call notFound()
    return {};
  }

  const title = topic.seoTitle || topic.title;
  const description =
    topic.seoDescription || topic.summary || topic.subtitle || "";
  const url = `https://jueshi.net/topics/${topic.slug}`;
  const isDraft = topic.status === "draft";

  const ogImage = topic.youtubeVideoId
    ? getYouTubeThumbnail(topic.youtubeVideoId)
    : undefined;

  const meta: Metadata = {
    title: `${title} — 绝世百宝箱`,
    description,
    alternates: { canonical: url },
    // Preview mode or draft: noindex, nofollow
    robots: (previewMode || isDraft) ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      ...(ogImage ? { images: [{ url: ogImage, width: 480, height: 360 }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };

  return meta;
}

// ===== JSON-LD =====

function VideoObjectJsonLd({
  videoId,
  title,
  description,
  youtubeUrl,
}: {
  videoId: string;
  title: string;
  description: string;
  youtubeUrl?: string | null;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    description,
    thumbnailUrl: [`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`],
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    ...(youtubeUrl ? { contentUrl: youtubeUrl } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ===== CMS-only Topic Page =====

function CmsTopicPage({ cmsTopic }: { cmsTopic: import("@/lib/cms-utils").ParsedTopic }) {
  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-700 text-white relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 md:py-14">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
              {cmsTopic.frontmatter.title}
            </h1>
            {cmsTopic.frontmatter.subtitle && (
              <p className="text-lg text-purple-100/90 max-w-2xl">{cmsTopic.frontmatter.subtitle}</p>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <ContentSection>
                <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-a:text-teal-600 prose-strong:text-gray-900">
                  {cmsTopic.content.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b">{line.replace('## ', '')}</h2>;
                    if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold text-gray-800 mt-6 mb-3">{line.replace('### ', '')}</h3>;
                    if (line.startsWith('- **[')) {
                      const match = line.match(/- \*\*\[(.+?)\]\((.+?)\)\*\*\s*—?\s*(.*)/);
                      if (match) return (
                        <div key={i} className="flex items-start gap-2 py-2">
                          <span className="text-teal-500 mt-0.5">→</span>
                          <Link href={match[2]} className="text-sm font-medium text-teal-600 hover:underline">{match[1]}</Link>
                          {match[3] && <span className="text-xs text-gray-500">{match[3]}</span>}
                        </div>
                      );
                    }
                    if (line.trim() === '') return <br key={i} />;
                    if (line.startsWith('- ')) return <p key={i} className="text-sm text-gray-700 pl-4 before:content-['•'] before:mr-2 before:text-gray-400">{line.replace('- ', '')}</p>;
                    return <p key={i} className="text-sm text-gray-700 leading-relaxed mb-2">{line}</p>;
                  })}
                </div>
              </ContentSection>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <SmartRelatedLinks
                tags={cmsTopic.frontmatter.tags}
                tool={cmsTopic.frontmatter.slug}
                type="article"
                layout="sidebar"
              />
              {cmsTopic.frontmatter.related_tools && cmsTopic.frontmatter.related_tools.length > 0 && (
                <ContentSection>
                  <SectionHeader title="相关工具" />
                  <div className="space-y-2">
                    {cmsTopic.frontmatter.related_tools.map((tool: string, i: number) => (
                      <Link key={i} href={`/tools/${tool}`} className="block px-3 py-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                        → {tool}
                      </Link>
                    ))}
                  </div>
                </ContentSection>
              )}
            </div>
          </div>

          {/* Bottom related */}
          <div className="mt-10">
            <SmartRelatedLinks
              tags={cmsTopic.frontmatter.tags}
              tool={cmsTopic.frontmatter.slug}
              type="article"
              layout="bottom"
            />
          </div>
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}

// ===== Page =====

export default async function TopicSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
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

  const topic = await getTopicBySlug(slug);
  const cmsTopic = getCmsTopicBySlug(slug);

  // CMS-only fallback when no DB topic exists
  if ((!topic || (!previewMode && topic.status !== "published")) && cmsTopic) {
    return <CmsTopicPage cmsTopic={cmsTopic} />;
  }

  // Not found / not published
  if (!topic || (!previewMode && topic.status !== "published")) {
    notFound();
  }

  // Only rating_list template has a full DB-rendered page.
  // For other published templates, fall back to CMS content if available.
  if (topic.templateType !== "rating_list") {
    if (cmsTopic) {
      return <CmsTopicPage cmsTopic={cmsTopic} />;
    }
    notFound();
  }

  const items = topic.items || [];
  const sections = topic.sections || [];
  const isDraft = topic.status === "draft";

  // v1.20.42.18.6.16.6.84.3.21: If rating_list template has no items (e.g. draft from bot),
  // show a simple preview page with metadataJson content instead of crashing.
  if (items.length === 0 && previewMode) {
    const contentOps = (topic.metadataJson as any)?.contentOps;
    const faq = contentOps?.faq || [];
    const pitfalls = contentOps?.pitfalls || [];
    const internalLinks = contentOps?.internalLinks || [];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center mb-6 mx-4 mt-4">
          <p className="text-yellow-800 font-medium">
            🔒 预览模式 — 此内容尚未发布，不会被搜索引擎索引
          </p>
          <p className="text-yellow-600 text-sm mt-1">
            状态: {topic.status} | slug: {topic.slug} | items: 0 (草稿尚未填充 APP 数据)
          </p>
        </div>
        <div className="max-w-4xl mx-auto px-4 pb-16 space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{topic.title}</h1>
            {topic.subtitle && <p className="text-gray-600 mb-4">{topic.subtitle}</p>}
            {topic.summary && <p className="text-gray-700 leading-relaxed">{topic.summary}</p>}
          </div>
          {faq.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">常见问题</h2>
              <div className="space-y-3">
                {faq.map((item: any, i: number) => (
                  <div key={i}>
                    <p className="font-medium text-gray-900">Q: {item.question}</p>
                    <p className="text-gray-600 text-sm mt-1">A: {item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {pitfalls.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">避坑提醒</h2>
              <ul className="space-y-2">
                {pitfalls.map((item: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">⚠️</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {internalLinks.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">相关链接</h2>
              <ul className="space-y-2">
                {internalLinks.map((link: string, i: number) => (
                  <li key={i}>
                    <Link href={link} className="text-sm text-teal-600 hover:underline">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Parse data fields
  const suitableFor = (topic.suitableFor as string[] | null) || [];
  const tags = (topic.tags as string[] | null) || [];
  const heroBadges = (topic.heroBadges as { label: string; color: string }[] | null) || [];

  // Group items by rating
  const appsByRating = RATING_ORDER.map((rating) => ({
    rating,
    info: ratingInfo[rating],
    apps: items
      .filter((item) => item.rating === rating)
      .sort((a, b) => {
        const aCatIdx = categories.findIndex((c) => c.id === a.category);
        const bCatIdx = categories.findIndex((c) => c.id === b.category);
        return aCatIdx - bCatIdx;
      }),
  })).filter((g) => g.apps.length > 0);

  // Quick start items
  const quickStartItems = items
    .filter((item) => item.installPriority === "先装")
    .slice(0, 5);

  // YouTube
  const youtubeVideoId = topic.youtubeVideoId || null;
  const youtubeEmbedUrl = youtubeVideoId ? getYouTubeEmbedUrl(youtubeVideoId) : null;
  const youtubeTitle = topic.youtubeTitle || topic.title;
  const youtubeDescription = topic.youtubeDescription || topic.summary || topic.subtitle || "";

  // Intro sections
  const introSections = sections.filter((s) => s.type === "intro");

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        {/* Preview Mode Banner */}
        {(previewMode || isDraft) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center mb-6 mx-4 mt-4">
            <p className="text-yellow-800 font-medium">
              🔒 预览模式 — 此内容尚未发布，不会被搜索引擎索引
            </p>
            <p className="text-yellow-600 text-sm mt-1">
              状态: {topic.status} | slug: {topic.slug}
            </p>
          </div>
        )}

        {/* VideoObject JSON-LD */}
        {youtubeVideoId && (
          <VideoObjectJsonLd
            videoId={youtubeVideoId}
            title={youtubeTitle}
            description={youtubeDescription}
            youtubeUrl={topic.youtubeUrl}
          />
        )}

        {/* ===== HERO ===== */}
        <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-teal-700 text-white relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 md:py-14">
            {/* Title */}
            <div className="max-w-3xl">
              {/* Hero badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {heroBadges.length > 0 ? (
                  heroBadges.map((badge, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10"
                    >
                      {badge.label}
                    </span>
                  ))
                ) : (
                  <>
                    {items.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                        📱 {items.length} 个 APP
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                      🏆 S/A/B/C/D 评级
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                      ⚠️ 避坑提醒
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
                {topic.title}
                {topic.subtitle && (
                  <>
                    <br />
                    <span className="text-2xl md:text-3xl text-blue-200">{topic.subtitle}</span>
                  </>
                )}
              </h1>
              {topic.summary && (
                <p className="text-lg text-blue-100/90 max-w-2xl leading-relaxed">
                  {topic.summary}
                </p>
              )}
            </div>
          </div>
        </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 pb-16">
        {/* ===== 文章式开篇 ===== */}
        <ContentSection>
          {introSections.length > 0 ? (
            introSections.map((section) => (
              <div key={section.id} className="prose prose-sm max-w-none">
                {section.title && (
                  <SectionHeader title={section.title} />
                )}
                {section.content && (
                  <div>
                    {section.content.split("\n").map((p, i) => (
                      <p key={i} className="text-base text-gray-700 leading-relaxed mb-4 last:mb-0">
                        {p}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            /* Default intro fallback */
            <div className="prose prose-sm max-w-none">
              <p className="text-base text-gray-700 leading-relaxed mb-4">
                刚出海最尴尬的不是不会英语，而是不知道该用哪些软件。
                到了国外你会发现，国内常用的很多软件在很多场景下用不了，
                而当地人都用什么、哪些是注册服务必须用的、哪些有替代方案，没人给你整理过。
              </p>
              <p className="text-base text-gray-700 leading-relaxed">
                这份清单从 <strong>{items.length} 个 APP</strong> 中帮你筛选——按实用程度分 <strong>S / A / B / C / D</strong> 五个等级，
                每个都标注了「国内类比」「适合谁」「避坑提醒」。
                不用在一堆应用商店里逐个试，照着这份清单装就行。
              </p>
            </div>
          )}
        </ContentSection>

        {/* ===== YouTube Video ===== */}
        {youtubeVideoId && youtubeEmbedUrl && (
          <ContentSection>
            <SectionHeader title={`▶️ ${youtubeTitle}`} />
            <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={youtubeEmbedUrl}
                title={youtubeTitle}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            {youtubeDescription && (
              <p className="text-sm text-gray-500 mt-3">{youtubeDescription}</p>
            )}
          </ContentSection>
        )}

        {/* ===== 先装清单 ===== */}
        {quickStartItems.length > 0 && (
          <ContentSection>
            <SectionHeader 
              title={`如果你刚出海，先装这 ${quickStartItems.length} 个`} 
              description="不用纠结顺序，到了当地就装上下面的就行："
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {quickStartItems.map((app) => (
                <div key={app.id} className="bg-white rounded-xl border border-emerald-100 p-3 text-center hover:shadow-md transition-shadow">
                  <div
                    className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: app.iconBg || "#6366f1", color: app.iconFg || "#ffffff" }}
                  >
                    {app.iconText || app.name.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900">{app.name}</h3>
                  {app.alias && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{app.alias}</p>
                  )}
                  {app.beginnerAdvice && (
                    <p className="text-[10px] text-emerald-600 mt-1 font-medium">{app.beginnerAdvice.slice(0, 20)}…</p>
                  )}
                </div>
              ))}
            </div>
          </ContentSection>
        )}

        {/* ===== 怎么读这份榜单 ===== */}
        <ContentSection>
          <SectionHeader title="怎么读这份榜单" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {RATING_ORDER.map((rating) => {
              const info = ratingInfo[rating];
              return (
                <div key={rating} className={`flex flex-col gap-1 p-3 rounded-lg ${info.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-extrabold ${info.color}`}>{info.label}</span>
                    <span className="text-sm text-gray-600">{info.desc}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-snug">{info.advice}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>阅读建议：</strong>S 级到了海外就先装上，A 级日常高频使用，B 级按需安装，
              C 和 D 级先了解即可，有需要再说。所有 APP 均可免费使用基础功能。
              评级基于海外生活实用性和不可替代程度，主观判断，仅供参考。
            </p>
          </div>
        </ContentSection>

        {/* ===== 按用途分类 ===== */}
        {appsByRating.length > 0 && (
          <ContentSection>
            <SectionHeader title="按用途分类" description="不确定自己需要什么？根据用途快速定位：" />
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const count = items.filter((a) => a.category === cat.id).length;
                if (count === 0) return null;
                return (
                  <a
                    key={cat.id}
                    href={`#cat-${cat.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent transition-colors min-h-[44px]"
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                    <span className="text-xs text-gray-400">({count})</span>
                  </a>
                );
              })}
            </div>
          </ContentSection>
        )}

        {/* ===== APP 卡片网格 by Rating ===== */}
        {appsByRating.map(({ rating, info, apps: ratingApps }) => (
          <ContentSection key={rating}>
            <SectionHeader title={`${info.label} 级 APP`} description={`${info.desc}（${ratingApps.length} 个）`} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ratingApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </ContentSection>
        ))}

        {/* ===== 避坑提醒区 ===== */}
        {(() => {
          const noticeSections = sections.filter((s) => s.type === "notice");
          if (noticeSections.length > 0) {
            return noticeSections.map((section) => (
              <ContentSection key={section.id}>
                <SectionHeader title={section.title || "避坑提醒"} />
                {section.content && (
                  <p className="text-sm text-red-700">{section.content}</p>
                )}
              </ContentSection>
            ));
          }

          // Default fallback warnings
          return (
            <ContentSection>
              <SectionHeader title="⚠️ 海外上网必知的 5 个避坑提醒" description="不管你是留学、工作还是移民，请务必记住：" />
              <div className="space-y-3">
                {[
                  { title: "永远不要相信「先转账后发货」", desc: "无论是 Telegram、Facebook Marketplace 还是任何平台，正规交易都有买家保护。先转账给陌生人的，99% 是诈骗。" },
                  { title: "重要账号务必开启两步验证（2FA）", desc: "Gmail、WhatsApp、Facebook、Instagram 都支持。开启后即使密码泄露，黑客也无法登录。推荐使用 Authenticator App 而非短信验证。" },
                  { title: "不要在公开场合暴露个人敏感信息", desc: "家庭住址、银行信息、护照号码等不要在任何社交平台公开。海外身份盗窃问题比国内更严重，信息一旦泄露很难补救。" },
                  { title: "App 只从官方渠道下载", desc: "Google Play、App Store、官网下载。不要从第三方网站下载 APK，不要相信「破解版」「免费版」，这些往往带有木马。" },
                  { title: "警惕冒充熟人的消息", desc: "WhatsApp、Telegram 上冒充朋友/家人的骗局非常普遍。收到「我换了号码」「帮我转账」类消息，先电话确认。" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white rounded-lg p-3">
                    <CheckCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{tip.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ContentSection>
          );
        })()}

        {/* ===== CMS Content fallback when no DB topic ===== */}
        <div className="mt-8">
          <SmartRelatedLinks
            tags={tags.length > 0 ? tags : undefined}
            tool={slug.includes('app') || slug.includes('tool') ? slug : undefined}
            type="article"
            layout="bottom"
          />
        </div>

        {/* ===== 下一篇预告 ===== */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📖</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">下一篇：《出海新人必备网站导航》</h3>
                  <span className="inline-flex items-center px-2 py-0.5 bg-gray-200 text-gray-500 text-[10px] rounded-full font-medium">
                    筹备中
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  按行业分类整理实用的出海工具和服务网站——建站、支付、物流、获客、法律合规，敬请期待。
                </p>
                <Link href="/topics" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium min-h-[44px]">
                  ← 返回专题列表
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Task Chain CTA ===== */}
        <TaskChainCta
          title="开始跨境发货任务链"
          description="把本专题的工具和指南加入发货任务链，一步步完成跨境发货。"
        />

        {/* ===== 相关入口 CTA ===== */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100 p-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  还需要什么？这些工具也帮到你
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  装了这些 APP，接下来你可能还需要：
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/tools" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors min-h-[44px]">
                    🛠️ 工具中心
                  </Link>
                  <Link href="/starter" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]">
                    🎯 场景包
                  </Link>
                  <Link href="/resources" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]">
                    📚 资源库
                  </Link>
                  <Link href="/guides" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]">
                    📖 实用指南
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">免责声明</p>
              <p className="mt-1">
                本评级仅供参考，不构成任何商业推荐。APP 的功能、可用性、隐私政策可能随时变化，请以官方信息为准。
                评级基于 2026 年 5 月的使用体验，后续可能调整。
              </p>
            </div>
          </div>
        </div>

        {/* ContentOps Metadata Rendering */}
        {topic.metadataJson?.contentOps && (
          <>
            {/* GEO Answer Block */}
            {topic.metadataJson.contentOps.geoAnswerBlock?.directAnswer && (
              <section className="bg-green-50 border border-green-200 rounded-xl p-6 mt-6">
                <h2 className="font-semibold text-green-800 mb-2">💡 快速答案</h2>
                <p className="text-green-700">{topic.metadataJson.contentOps.geoAnswerBlock.directAnswer}</p>
                {topic.metadataJson.contentOps.geoAnswerBlock.targetAudience && (
                  <p className="text-sm text-green-600 mt-2">
                    适合：{topic.metadataJson.contentOps.geoAnswerBlock.targetAudience}
                  </p>
                )}
              </section>
            )}

            {/* FAQ from metadataJson */}
            {topic.metadataJson.contentOps.faq && topic.metadataJson.contentOps.faq.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">❓ 常见问题</h2>
                <div className="space-y-4">
                  {topic.metadataJson.contentOps.faq.map((faq: any, i: number) => (
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

            {/* Internal Links */}
            {topic.metadataJson.contentOps.internalLinks && topic.metadataJson.contentOps.internalLinks.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🔗 相关内容</h2>
                <div className="space-y-2">
                  {topic.metadataJson.contentOps.internalLinks.map((link: any, i: number) => (
                    <a key={i} href={link.url} className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="font-medium text-gray-900">{link.title}</div>
                      {link.reason && <div className="text-sm text-gray-500 mt-1">{link.reason}</div>}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* JSON-LD Structured Data */}
            {topic.metadataJson.contentOps.structuredData && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(topic.metadataJson.contentOps.structuredData)
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
    </JueshiV4PublicShell>
  );
}

// ===== App Card Component =====

const priorityColors: Record<string, string> = {
  "先装": "bg-emerald-100 text-emerald-700",
  "高频": "bg-green-100 text-green-700",
  "按需": "bg-blue-100 text-blue-700",
  "了解即可": "bg-gray-100 text-gray-500",
};

function AppCard({ app }: { app: {
  id: string;
  name: string;
  alias: string | null;
  rating: string | null;
  category: string | null;
  iconText: string | null;
  iconBg: string | null;
  iconFg: string | null;
  installPriority: string | null;
  description: string | null;
  analogy: string | null;
  suitableFor: string | null;
  beginnerAdvice: string | null;
  riskTip: string | null;
  officialUrl: string | null;
  isBeginnerFriendly: boolean;
} }) {
  const info = app.rating ? ratingInfo[app.rating as keyof typeof ratingInfo] : ratingInfo["B"];
  const cat = app.category ? categories.find((c) => c.id === app.category) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Header: Icon + Rating */}
      <div className="p-4 pb-0">
        <div className="flex items-start gap-3">
          {/* App Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold shadow-sm"
            style={{ backgroundColor: app.iconBg || "#6366f1", color: app.iconFg || "#ffffff" }}
          >
            {app.iconText || app.name.charAt(0)}
          </div>

          {/* Name + Badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-gray-900 text-base">{app.name}</h3>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${info.bg} ${info.color}`}>
                {info.label}
              </span>
            </div>
            {app.alias && (
              <p className="text-xs text-gray-400">{app.alias}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {cat && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">
                  {cat.emoji} {cat.label}
                </span>
              )}
              {app.installPriority && (
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${priorityColors[app.installPriority] || "bg-gray-100 text-gray-500"}`}>
                  {app.installPriority}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-3 space-y-3 flex-1">
        {/* One-line analogy */}
        {app.analogy && (
          <p className="text-xs text-gray-500 italic">{app.analogy}</p>
        )}

        {/* Description */}
        {app.description && (
          <p className="text-sm text-gray-600 leading-relaxed">{app.description}</p>
        )}

        {/* Beginner Advice */}
        {app.beginnerAdvice && (
          <div className="bg-teal-50 rounded-lg p-2.5 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-teal-700">
              <span className="font-medium">新手建议：</span>{app.beginnerAdvice}
            </p>
          </div>
        )}

        {/* Suitable for */}
        {app.suitableFor && (
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">适合：</span>{app.suitableFor}
            </p>
          </div>
        )}

        {/* Warning */}
        {app.riskTip && (
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">避坑：</span>{app.riskTip}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        {app.officialUrl ? (
          <a
            href={app.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium min-h-[44px]"
          >
            <ExternalLink className="w-3 h-3" />
            访问官网
          </a>
        ) : (
          <span className="text-xs text-gray-400 italic">暂无官网链接</span>
        )}
        {app.isBeginnerFriendly && (
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            新手推荐
          </span>
        )}
      </div>
    </div>
  );
}
