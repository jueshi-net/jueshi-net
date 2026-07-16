import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, Home, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import { PublicCategoryPageFrame } from "@/components/templates/public/PublicCategoryPageFrame";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "专题 - 绝世百宝箱",
  description: "精选专题内容：出海必装 APP 评级、实用工具指南、生活攻略。帮助你快速适应海外生活。",
  keywords: "专题,出海专题,海外生活专题,APP评级,工具指南,生活攻略,海外华人专题,留学专题,跨境专题,实用专题",
  alternates: { canonical: "https://jueshi.net/topics" },
  openGraph: {
    title: "专题 - 绝世百宝箱",
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
    <JueshiV4PublicShell>
      <PublicCategoryPageFrame
        title="专题推荐"
        subtitle="围绕真实使用场景的精选内容，不写空泛的理论，只给你最实用的指南。"
      >
        {/* Topic cards */}
        {topics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl border border-gray-200 p-10">
              <div className="text-4xl mb-4">🔜</div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">更多专题即将上线</h3>
              <p className="text-base text-gray-500 max-w-md mx-auto">
                我们还在准备更多实用专题，涵盖海外生活、求职、购物、交通等方面。
                关注我们的更新，第一时间获取新内容。
              </p>
            </div>
          </div>
        )}

        {/* Related links */}
        <div className="mt-12 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100 p-8">
          <h3 className="font-bold text-lg text-gray-900 mb-4">还需要什么？</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/tools" className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors min-h-[48px]">
              🛠️ 工具中心
            </Link>
            <Link href="/starter" className="inline-flex items-center gap-2 px-5 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[48px]">
              🎯 场景包
            </Link>
            <Link href="/guides" className="inline-flex items-center gap-2 px-5 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[48px]">
              📖 实用指南
            </Link>
          </div>
        </div>
      </PublicCategoryPageFrame>
    </JueshiV4PublicShell>
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
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Icon stack with emoji */}
          <div className="flex -space-x-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-base border-2 border-white shadow-sm bg-gradient-to-br from-indigo-500 to-teal-500"
            >
              {topic.coverEmoji || "📑"}
            </div>
          </div>
          <div className="flex gap-2">
            {topic.youtubeVideoId && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                ▶ 含视频
              </span>
            )}
            {itemCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                {itemCount} 个条目
              </span>
            )}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
          {topic.title}
        </h2>
        {topic.subtitle && (
          <p className="text-sm text-gray-400 mb-4">{topic.subtitle}</p>
        )}
        {topic.summary && (
          <p className="text-sm text-gray-600 leading-relaxed mb-5 line-clamp-3">{topic.summary}</p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-500 text-sm rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 适合谁看 */}
        {suitableFor.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>👤 适合：</span>
            <span className="text-gray-600">{suitableFor.slice(0, 4).join(" / ")}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 md:px-8 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
        <span className="text-base text-blue-600 font-medium group-hover:text-blue-700 transition-colors inline-flex items-center gap-1">
          阅读专题
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
        <span className="text-sm text-gray-400">免费</span>
      </div>
    </Link>
  );
}
