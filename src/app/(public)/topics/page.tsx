import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, Star, AlertTriangle, Users, Shield, Home, ChevronRight } from "lucide-react";

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

const topics = [
  {
    slug: "overseas-essential-apps",
    title: "出海之后必装 APP 评级推荐",
    subtitle: "S/A/B/C/D 评级，18 个海外生活必备 APP",
    description:
      "刚出国不知道装什么？从通讯、社交、学习到工作，每个 APP 都有国内类比和避坑提醒，少走弯路。",
    emoji: "📱",
    badge: "NEW",
    badgeColor: "bg-green-100 text-green-700",
    tags: ["18 个 APP", "避坑提醒", "国内类比"],
    suitableFor: ["出海新人", "留学生", "海外华人", "跨境从业者"],
    features: [
      { icon: "🏆", text: "S/A/B/C/D 评级" },
      { icon: "🇨🇳", text: "每个都有国内类比" },
      { icon: "⚠️", text: "避坑提醒" },
      { icon: "🆕", text: "新手推荐标识" },
    ],
  },
];

export default function TopicsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-teal-700 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/topics/${topic.slug}`}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all flex flex-col"
            >
              {/* Header */}
              <div className="p-5 md:p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-4xl">{topic.emoji}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${topic.badgeColor}`}>
                    {topic.badge}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                  {topic.title}
                </h2>
                <p className="text-sm text-gray-400 mb-3">{topic.subtitle}</p>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{topic.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {topic.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 适合谁看 */}
                {topic.suitableFor && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                    <span>👤 适合：</span>
                    <span className="text-gray-600">{topic.suitableFor.join(" / ")}</span>
                  </div>
                )}

                {/* Features */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {topic.features.map((f) => (
                    <div key={f.text} className="flex items-center gap-1.5 text-sm text-gray-500">
                      <span>{f.icon}</span>
                      <span className="text-xs">{f.text}</span>
                    </div>
                  ))}
                </div>
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
          ))}
        </div>

        {/* More topics coming soon */}
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
