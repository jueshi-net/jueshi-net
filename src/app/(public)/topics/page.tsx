import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, Home, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "专题推荐 — 海外百宝箱",
  description: "精选专题内容：出海必装 APP 评级、实用工具指南、生活攻略。帮助你快速适应海外生活。",
  alternates: { canonical: "https://jueshi.net/topics" },
  openGraph: {
    title: "专题推荐 — 海外百宝箱",
    description: "精选专题内容：出海必装 APP 评级、实用工具指南、生活攻略。",
    url: "https://jueshi.net/topics",
    type: "website",
  },
};

async function getTopics() {
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
        heroBadges: true,
        suitableFor: true,
        tags: true,
        youtubeVideoId: true,
        publishedAt: true,
        updatedAt: true,
        _count: { select: { items: true } },
      },
    });
    return topics;
  } catch {
    return [];
  }
}

export default async function TopicsPage() {
  const topics = await getTopics();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-teal-700 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-1.5 text-sm text-blue-200 mb-6 min-h-[44px]">
            <Link href="/" className="hover:text-white transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> 首页
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">专题推荐</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm text-blue-100 border border-white/10 mb-6">
              <Sparkles className="w-4 h-4" />
              <span>精选专题内容，帮你快速适应海外生活</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">专题推荐</h1>
            <p className="text-lg text-blue-100/90 max-w-2xl leading-relaxed">
              围绕真实使用场景的精选内容，不写空泛的理论，只给你最实用的指南。
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 pb-16 relative z-10">
        {/* Topic cards */}
        {topics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">暂无专题</h2>
            <p className="text-sm text-gray-500">我们正在准备更多精彩内容，敬请期待。</p>
          </div>
        )}

        {/* More topics coming soon */}
        {topics.length > 0 && (
          <div className="mt-10 text-center">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-3xl mb-3">🔜</div>
              <h3 className="font-bold text-gray-900 mb-2">更多专题即将上线</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                我们还在准备更多实用专题，涵盖海外生活、求职、购物、交通等方面。
                关注我们的更新，第一时间获取新内容。
              </p>
            </div>
          </div>
        )}

        {/* Related links */}
        <div className="mt-8 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100 p-6">
          <h3 className="font-bold text-gray-900 mb-3">还需要什么？</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/tools" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors min-h-[44px]">
              🛠️ 工具中心
            </Link>
            <Link href="/starter" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]">
              🎯 场景包
            </Link>
            <Link href="/guides" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]">
              📖 实用指南
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicCard({ topic }: { topic: Awaited<ReturnType<typeof getTopics>>[number] }) {
  const suitableFor = (topic.suitableFor as string[] | null) || [];
  const tags = (topic.tags as string[] | null) || [];
  const itemCount = topic._count.items;

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all flex flex-col"
    >
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Icon stack with emoji */}
          <div className="flex -space-x-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm border-2 border-white shadow-sm bg-gradient-to-br from-indigo-500 to-teal-500"
            >
              {topic.coverEmoji || "📑"}
            </div>
          </div>
          <div className="flex gap-1.5">
            {topic.youtubeVideoId && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                ▶ 含视频
              </span>
            )}
            {itemCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
                {itemCount} 个条目
              </span>
            )}
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
          {topic.title}
        </h2>
        {topic.subtitle && (
          <p className="text-sm text-gray-400 mb-3">{topic.subtitle}</p>
        )}
        {topic.summary && (
          <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">{topic.summary}</p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 适合谁看 */}
        {suitableFor.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <span>👤 适合：</span>
            <span className="text-gray-600">{suitableFor.slice(0, 4).join(" / ")}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 md:px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
        <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700 transition-colors inline-flex items-center gap-1">
          阅读专题
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
        <span className="text-xs text-gray-400">免费</span>
      </div>
    </Link>
  );
}
