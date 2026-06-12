import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Home, ChevronRight, ArrowRight, Calendar, Tag, BookOpen, ExternalLink, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CommunityAnalytics } from "@/components/community-analytics";

export const dynamic = "force-dynamic";

// Fallback 内容详情（简化版）
const FALLBACK_DETAILS: Record<string, any> = {
  "hs-code-lookup-guide": {
    title: "HS Code 查询完全指南：从入门到精通",
    summary: "一文搞懂 HS Code 查询，避免报关错误，节省时间和成本",
    category: "报关",
    tags: ["HS Code", "报关", "海关编码", "关税"],
    linkedTool: "/tools/hs-code",
    linkedToolName: "HS Code 查询工具",
    ctaText: "立即查询 HS Code",
    publishedAt: "2026-06-01T00:00:00Z",
    content: "HS Code 查询完全指南内容...",
  },
  "commercial-invoice-template-guide": {
    title: "Commercial Invoice 模板与填写指南",
    summary: "从零开始学习 Commercial Invoice，包含模板下载和填写示例",
    category: "单据",
    tags: ["Commercial Invoice", "商业发票", "外贸单据", "模板"],
    linkedTool: "/tools/documents/commercial-invoice",
    linkedToolName: "Commercial Invoice 生成器",
    ctaText: "生成 Commercial Invoice",
    publishedAt: "2026-06-02T00:00:00Z",
    content: "Commercial Invoice 指南内容...",
  },
  "quote-sheet-pricing-strategy": {
    title: "Quote Sheet 定价策略：如何报价赢得客户",
    summary: "学习外贸报价技巧，包含 Quote Sheet 模板和定价公式",
    category: "单据",
    tags: ["Quote Sheet", "报价单", "定价策略", "外贸"],
    linkedTool: "/tools/documents/quotation",
    linkedToolName: "Quote Sheet 生成器",
    ctaText: "生成 Quote Sheet",
    publishedAt: "2026-06-03T00:00:00Z",
    content: "Quote Sheet 定价策略内容...",
  },
  "shipping-cost-calculation-guide": {
    title: "国际运费计算完全指南",
    summary: "一文搞懂国际运费计算，包含海运、空运、快递费用对比",
    category: "物流",
    tags: ["运费计算", "国际物流", "海运", "空运", "快递"],
    linkedTool: "/tools/shipping-calculator",
    linkedToolName: "运费计算器",
    ctaText: "计算运费",
    publishedAt: "2026-06-04T00:00:00Z",
    content: "国际运费计算指南内容...",
  },
  "postal-code-format-guide": {
    title: "各国邮编格式大全",
    summary: "全球主要国家邮编格式指南，包含验证工具和常见错误",
    category: "地址",
    tags: ["邮编", "postal code", "地址格式", "国际邮件"],
    linkedTool: "/tools/postal-code",
    linkedToolName: "邮编查询工具",
    ctaText: "验证邮编",
    publishedAt: "2026-06-05T00:00:00Z",
    content: "各国邮编格式指南内容...",
  },
};

async function getTopicBySlug(slug: string) {
  try {
    const topic = await prisma.topic.findUnique({
      where: { slug },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!topic || topic.status !== "published") {
      return null;
    }

    return topic;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  const topic = await getTopicBySlug(slug);
  
  if (topic) {
    return {
      title: `${topic.title} - 社区`,
      description: topic.summary || topic.subtitle || "",
      alternates: { canonical: `https://jueshi.net/community/${slug}` },
      openGraph: {
        title: topic.title,
        description: topic.summary || topic.subtitle || "",
        url: `https://jueshi.net/community/${slug}`,
        type: "article",
      },
    };
  }

  const fallback = FALLBACK_DETAILS[slug];
  if (fallback) {
    return {
      title: `${fallback.title} - 社区`,
      description: fallback.summary,
      alternates: { canonical: `https://jueshi.net/community/${slug}` },
      openGraph: {
        title: fallback.title,
        description: fallback.summary,
        url: `https://jueshi.net/community/${slug}`,
        type: "article",
      },
    };
  }

  return {
    title: "文章未找到 - 社区",
    description: "抱歉，您访问的文章不存在",
  };
}

export default async function CommunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const topic = await getTopicBySlug(slug);
  
  if (topic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CommunityAnalytics />
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4">
            <nav className="flex items-center gap-1.5 text-sm text-blue-100 mb-6 min-h-[44px]">
              <Link href="/" className="hover:text-white transition-colors inline-flex items-center gap-1">
                <Home className="w-3.5 h-3.5" /> 首页
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/community" className="hover:text-white transition-colors">
                社区
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-medium">文章详情</span>
            </nav>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm text-blue-100 border border-white/10 mb-6">
                <BookOpen className="w-4 h-4" />
                <span>专题文章</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{topic.title}</h1>
              {topic.subtitle && (
                <p className="text-lg text-blue-100/90 max-w-2xl leading-relaxed">{topic.subtitle}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-blue-100">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(topic.publishedAt || topic.createdAt).toLocaleDateString("zh-CN")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {topic.items.length} 项内容
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-6 pb-16 relative z-10">
          {/* 摘要 */}
          {topic.summary && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">摘要</h2>
              <p className="text-gray-700 leading-relaxed">{topic.summary}</p>
            </div>
          )}

          {/* 内容列表 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">内容详情</h2>
            <div className="space-y-4">
              {topic.items.map((item) => (
                <div key={item.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{item.iconText || "📌"}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      {item.alias && <p className="text-sm text-gray-500 mt-0.5">{item.alias}</p>}
                      {item.description && (
                        <p className="text-gray-700 mt-2 leading-relaxed">{item.description}</p>
                      )}
                      {item.officialUrl && (
                        <a
                          href={item.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          官方网站
                        </a>
                      )}
                    </div>
                    {item.rating && (
                      <div className={`px-2 py-1 rounded text-sm font-bold ${
                        item.rating === "S" ? "bg-red-100 text-red-700" :
                        item.rating === "A" ? "bg-blue-100 text-blue-700" :
                        item.rating === "B" ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {item.rating}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">想要查看更多内容？</h3>
            <p className="text-sm text-gray-600 mb-4">
              访问我们的专题库，发现更多精选内容
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/topics" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                📖 浏览所有专题
              </Link>
              <Link href="/community" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                返回社区
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fallback = FALLBACK_DETAILS[slug];
  if (fallback) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CommunityAnalytics />
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4">
            <nav className="flex items-center gap-1.5 text-sm text-blue-100 mb-6 min-h-[44px]">
              <Link href="/" className="hover:text-white transition-colors inline-flex items-center gap-1">
                <Home className="w-3.5 h-3.5" /> 首页
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/community" className="hover:text-white transition-colors">
                社区
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-medium">文章详情</span>
            </nav>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm text-blue-100 border border-white/10 mb-6">
                <BookOpen className="w-4 h-4" />
                <span>{fallback.category}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{fallback.title}</h1>
              <p className="text-lg text-blue-100/90 max-w-2xl leading-relaxed">{fallback.summary}</p>
              <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-blue-100">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(fallback.publishedAt).toLocaleDateString("zh-CN")}
                </span>
                {fallback.tags?.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="inline-flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-6 pb-16 relative z-10">
          {/* 文章内容 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">{fallback.content}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">准备好开始了吗？</h3>
            <p className="text-sm text-gray-600 mb-4">
              使用我们的专业工具，快速解决你的问题
            </p>
            <Link
              href={fallback.linkedTool}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-colors"
            >
              {fallback.ctaText}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="mt-4">
              <Link href="/community" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" />
                返回社区
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  notFound();
}
