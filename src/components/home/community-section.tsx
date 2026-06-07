import Link from "next/link";
import { MessageSquare, ArrowRight, Clock, TrendingUp, Eye, ExternalLink } from "lucide-react";

const POSTS = [
  { title: "加拿大集运被税了，求助", author: "多伦多小李", avatar: "🇨🇦", replies: 24, views: 1890, time: "2小时前", tag: "hot" },
  { title: "英国 VAT 注册经验分享", author: "伦敦仓管", avatar: "🇬🇧", replies: 18, views: 1340, time: "5小时前", tag: "new" },
  { title: "Temu 最新物流政策更新", author: "跨境老王", avatar: "🛒", replies: 31, views: 2560, time: "8小时前", tag: "hot" },
  // Sponsored post
  { title: "集运巴巴：中美专线首重低至 ¥28/kg", author: "集运巴巴官方", avatar: "📦", replies: 5, views: 890, time: "1天前", tag: "sponsored" },
  { title: "海外仓怎么选？求推荐", author: "新手卖家", avatar: "🆕", replies: 12, views: 780, time: "1天前", tag: "new" },
  { title: "TikTok 小店入驻指南", author: "内容运营", avatar: "🎵", replies: 45, views: 3420, time: "1天前", tag: "hot" },
  { title: "澳洲 GST 退税全流程", author: "悉尼会计", avatar: "🇦🇺", replies: 9, views: 650, time: "2天前", tag: "new" },
  { title: "独立站 PayPal 风控避坑", author: "Shopify老手", avatar: "💳", replies: 22, views: 1890, time: "2天前", tag: "hot" },
];

export default function CommunitySection() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">社区论坛</h2>
            <p className="mt-1 text-sm text-gray-500">与跨境同行交流实战经验</p>
          </div>
          <Link
            href="/bbs"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-all shadow-sm"
          >
            进入论坛 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-[#f8fafc] border border-gray-200 rounded-[20px] overflow-hidden">
          {/* Header tabs */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-sm font-semibold text-teal-600">
                <TrendingUp className="w-4 h-4" /> 热门
              </button>
              <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
                <Clock className="w-4 h-4" /> 最新
              </button>
            </div>
          </div>

          {/* Posts - V2EX style */}
          <div className="divide-y divide-gray-100">
            {POSTS.map((post) => {
              const isSponsored = post.tag === "sponsored";
              return (
                <div
                  key={post.title}
                  className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50 ${
                    isSponsored ? "bg-orange-50/50 border-l-4 border-orange-400" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-lg shrink-0">
                    {post.avatar}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {post.tag === "hot" && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded shrink-0">HOT</span>
                      )}
                      {post.tag === "new" && (
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">NEW</span>
                      )}
                      {isSponsored && (
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-100 px-1.5 py-0.5 rounded shrink-0 flex items-center gap-0.5">
                          <ExternalLink className="w-3 h-3" /> 赞助
                        </span>
                      )}
                      <span className={`text-sm font-medium truncate ${isSponsored ? "text-orange-700" : "text-gray-900"}`}>
                        {post.title}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      <span className="text-gray-600">{post.author}</span> · {post.time}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {post.replies}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.views > 1000 ? `${(post.views / 1000).toFixed(1)}k` : post.views}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile CTA */}
          <div className="sm:hidden px-5 py-4 border-t border-gray-200">
            <Link href="/bbs" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl">
              进入论坛 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
