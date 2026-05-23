import HeroSuperSearch from "@/components/home/hero-super-search";
import IdentityCards from "@/components/home/identity-cards";
import MarketOverview from "@/components/home/market-overview";
import BannerAd from "@/components/home/banner-ad";
import ToolGrid from "@/components/home/tool-grid";
import TopicShowcase from "@/components/home/topic-showcase";
import ResourceNav from "@/components/home/resource-nav";
import CommunityFireworks from "@/components/home/community-fireworks";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 1. Hero Super Search (includes title + search) */}
      <section className="bg-gradient-to-b from-teal-50/50 to-gray-50 dark:from-gray-900 dark:to-gray-900 relative overflow-hidden">
        <HeroSuperSearch />
      </section>

      {/* Stats Bar */}
      <div className="border-y border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-6 px-4 py-3 text-center text-sm sm:gap-10">
          {[
            { value: '68+', label: '实用工具' },
            { value: '24', label: '精选专题' },
            { value: '7', label: '出海市场' },
            { value: '每日', label: '持续更新' },
          ].map(s => (
            <div key={s.label} className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">{s.value}</span>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Identity Cards */}
      <section><IdentityCards /></section>

      {/* 3. Global Market Overview */}
      <section><MarketOverview /></section>

      {/* 4. Banner Ad */}
      <BannerAd />

      {/* 5. Tool Grid with Native Ad */}
      <section><ToolGrid /></section>

      {/* 6. Topic Showcase */}
      <section><TopicShowcase /></section>

      {/* 7. Banner Ad */}
      <BannerAd />

      {/* 8. Resource Nav with Native Ad */}
      <section><ResourceNav /></section>

      {/* 9. Community */}
      <section><CommunityFireworks /></section>

      {/* CTA Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-blue-600 p-8 text-center text-white shadow-xl shadow-teal-500/20">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <h2 className="text-xl font-bold md:text-2xl">还没找到你需要的工具？</h2>
            <p className="mt-2 text-sm text-teal-100 md:text-base">去社区提问，或告诉我们你想找什么，我们会帮你推荐</p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="https://bbs.jueshi.net"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-teal-700 shadow-md transition hover:bg-teal-50 hover:shadow-lg"
              >
                💬 去社区提问
              </a>
              <a
                href="/tools"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                🔍 浏览全部工具
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 py-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} 海外百宝箱 jueshi.net — 为出海人群打造的瑞士军刀
      </footer>
    </div>
  );
}
