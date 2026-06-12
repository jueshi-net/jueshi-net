import type { Metadata } from "next";
import Link from "next/link";
import { Home, ChevronRight, BookOpen, ArrowRight, Calendar, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CommunityAnalytics } from "@/components/community-analytics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "社区 - 绝世百宝箱",
  description: "只读工具案例与问答精选，帮助海外华人解决实际问题。涵盖 HS Code、Commercial Invoice、物流运费等实用内容。",
  alternates: { canonical: "https://jueshi.net/community" },
  openGraph: {
    title: "社区 - 绝世百宝箱",
    description: "只读工具案例与问答精选，帮助海外华人解决实际问题。",
    url: "https://jueshi.net/community",
    type: "website",
  },
};

// Fallback 内容（当数据库内容不足时使用）
const FALLBACK_ARTICLES = [
  {
    slug: "hs-code-lookup-guide",
    title: "HS Code 查询完全指南：从入门到精通",
    summary: "一文搞懂 HS Code 查询，避免报关错误，节省时间和成本",
    category: "报关",
    tags: ["HS Code", "报关", "海关编码"],
    linkedTool: "/tools/hs-code",
    ctaText: "立即查询 HS Code",
    publishedAt: "2026-06-01T00:00:00Z",
  },
  {
    slug: "commercial-invoice-template-guide",
    title: "Commercial Invoice 模板与填写指南",
    summary: "从零开始学习 Commercial Invoice，包含模板下载和填写示例",
    category: "单据",
    tags: ["Commercial Invoice", "商业发票", "外贸单据"],
    linkedTool: "/tools/documents/commercial-invoice",
    ctaText: "生成 Commercial Invoice",
    publishedAt: "2026-06-02T00:00:00Z",
  },
  {
    slug: "quote-sheet-pricing-strategy",
    title: "Quote Sheet 定价策略：如何报价赢得客户",
    summary: "学习外贸报价技巧，包含 Quote Sheet 模板和定价公式",
    category: "单据",
    tags: ["Quote Sheet", "报价单", "定价策略"],
    linkedTool: "/tools/documents/quotation",
    ctaText: "生成 Quote Sheet",
    publishedAt: "2026-06-03T00:00:00Z",
  },
  {
    slug: "shipping-cost-calculation-guide",
    title: "国际运费计算完全指南",
    summary: "一文搞懂国际运费计算，包含海运、空运、快递费用对比",
    category: "物流",
    tags: ["运费计算", "国际物流", "海运", "空运"],
    linkedTool: "/tools/shipping-calculator",
    ctaText: "计算运费",
    publishedAt: "2026-06-04T00:00:00Z",
  },
  {
    slug: "postal-code-format-guide",
    title: "各国邮编格式大全",
    summary: "全球主要国家邮编格式指南，包含验证工具和常见错误",
    category: "地址",
    tags: ["邮编", "postal code", "地址格式"],
    linkedTool: "/tools/postal-code",
    ctaText: "验证邮编",
    publishedAt: "2026-06-05T00:00:00Z",
  },
];

async function getCommunityContent() {
  try {
    const topics = await prisma.topic.findMany({
      where: { status: "published" },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        summary: true,
        coverEmoji: true,
        tags: true,
        publishedAt: true,
        updatedAt: true,
        _count: { select: { items: true } },
      },
    });

    const validTopics = topics.filter(t => 
      t.title && 
      t.title.length > 5 && 
      !t.title.includes("hsdfhdsfhdsfhdfhdsf")
    );

    return validTopics;
  } catch {
    return [];
  }
}

export default async function CommunityPage() {
  const dbTopics = await getCommunityContent();
  
  const allArticles = [
    ...dbTopics.map(t => ({
      slug: t.slug,
      title: t.title,
      summary: t.summary || t.subtitle || "",
      category: "专题",
      tags: (t.tags as string[]) || [],
      linkedTool: "/topics",
      ctaText: "查看专题",
      publishedAt: t.publishedAt?.toISOString() || t.updatedAt?.toISOString(),
      emoji: t.coverEmoji,
      itemCount: t._count.items,
      source: "db" as const,
    })),
    ...FALLBACK_ARTICLES.map(a => ({ ...a, source: "fallback" as const, emoji: "📝", itemCount: null })),
  ];

  const categories = Array.from(new Set(allArticles.map(a => a.category)));

  return (
    <div className="min-h-screen bg-gray-50">
      <CommunityAnalytics />
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-1.5 text-sm text-blue-100 mb-6 min-h-[44px]">
            <Link href="/" className="hover:text-white transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> 首页
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">社区</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm text-blue-100 border border-white/10 mb-6">
              <BookOpen className="w-4 h-4" />
              <span>只读工具案例与问答精选</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">社区</h1>
            <p className="text-lg text-blue-100/90 max-w-2xl leading-relaxed">
              精选工具使用案例、常见问题解答、实操指南。帮助你快速解决海外生活和工作中的实际问题。
            </p>
            <div className="mt-4 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 text-sm text-blue-100">
              💡 当前为只读内容社区，不开放发帖与评论。所有内容均由编辑团队精选。
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 pb-16 relative z-10">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-blue-600">{allArticles.length}</div>
            <div className="text-sm text-gray-600 mt-1">精选文章</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-green-600">{categories.length}</div>
            <div className="text-sm text-gray-600 mt-1">内容分类</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-purple-600">7</div>
            <div className="text-sm text-gray-600 mt-1">关联工具</div>
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 py-1.5">分类：</span>
            {categories.map(cat => (
              <a
                key={cat}
                href={`#${cat}`}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-blue-100 hover:text-blue-700 transition-colors"
              >
                {cat}
              </a>
            ))}
          </div>
        </div>

        {/* 文章列表 */}
        {categories.map(category => {
          const categoryArticles = allArticles.filter(a => a.category === category);
          if (categoryArticles.length === 0) return null;

          return (
            <section key={category} id={category} className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>{category}</span>
                <span className="text-sm font-normal text-gray-500">({categoryArticles.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryArticles.map(article => (
                  <Link
                    key={article.slug}
                    href={`/community/${article.slug}`}
                    className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{article.emoji || "📝"}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">
                          {article.summary}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {article.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                          {article.itemCount && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                              <BookOpen className="w-3 h-3" />
                              {article.itemCount} 项
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(article.publishedAt).toLocaleDateString("zh-CN")}
                          </div>
                          <div className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
                            {article.ctaText}
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* 底部提示 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 text-center mt-12">
          <h3 className="text-lg font-bold text-gray-900 mb-2">需要更多帮助？</h3>
          <p className="text-sm text-gray-600 mb-4">
            访问我们的工具库，使用专业工具解决你的实际问题
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/tools" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              🛠️ 浏览所有工具
            </Link>
            <Link href="/topics" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
              📖 查看更多专题
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
