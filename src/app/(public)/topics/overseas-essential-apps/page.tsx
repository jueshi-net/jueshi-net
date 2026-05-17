import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  Star,
  Shield,
  Zap,
  Users,
  BookOpen,
  Target,
  CheckCircle,
  AlertCircle,
  Home,
  ChevronRight,
} from "lucide-react";
import {
  apps,
  categories,
  ratingInfo,
  type AppRating,
  type AppCategory,
} from "@/lib/topics/overseas-essential-apps";

export const metadata: Metadata = {
  title: "出海之后必装 APP 评级推荐 — 海外百宝箱",
  description:
    "S/A/B/C/D 评级，18 个海外生活必备 APP 推荐。每个 APP 都有国内类比、避坑提醒、适合人群。给刚出海新人的实用指南。",
  alternates: { canonical: "https://jueshi.net/topics/overseas-essential-apps" },
  openGraph: {
    title: "出海之后必装 APP 评级推荐 — 海外百宝箱",
    description:
      "S/A/B/C/D 评级，18 个海外生活必备 APP 推荐。每个 APP 都有国内类比、避坑提醒。",
    url: "https://jueshi.net/topics/overseas-essential-apps",
    type: "website",
  },
};

// Group apps by rating for ordered display
const RATING_ORDER: AppRating[] = ["S", "A", "B", "C", "D"];

export default function OverseasEssentialAppsPage() {
  const appsByRating = RATING_ORDER.map((rating) => ({
    rating,
    info: ratingInfo[rating],
    apps: apps.filter((a) => a.rating === rating).sort((a, b) =>
      categories.findIndex((c) => c.id === a.category) -
      categories.findIndex((c) => c.id === b.category)
    ),
  })).filter((g) => g.apps.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO ===== */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-teal-700 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 md:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-blue-200 mb-6 min-h-[44px]">
            <Link href="/" className="hover:text-white transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> 首页
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">出海必装 APP</span>
          </nav>

          {/* Title */}
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                📱 18 个 APP
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                🏆 S/A/B/C/D 评级
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                ⚠️ 避坑提醒
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
              出海之后必装 APP<br />
              <span className="text-2xl md:text-3xl text-blue-200">S/A/B/C/D 评级推荐</span>
            </h1>
            <p className="text-lg text-blue-100/90 max-w-2xl leading-relaxed">
              刚出国不知道装什么？这 18 个 APP 帮你从通讯、社交、学习到工作全覆盖。
              每个 APP 都有国内类比和避坑提醒，少走弯路。
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 pb-16">
        {/* ===== 文章式开篇 ===== */}
        <div className="bg-white rounded-xl shadow-sm border p-5 md:p-6 mb-8">
          <div className="prose prose-sm max-w-none">
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              刚出海最尴尬的不是不会英语，而是不知道该用哪些软件。
              到了国外你会发现，国内常用的微信、支付宝、淘宝在很多场景下用不了，
              而当地人都用什么、哪些是注册服务必须用的、哪些有替代方案，没人给你整理过。
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              这份清单从 <strong>18 个 APP</strong> 中帮你筛选——按实用程度分 <strong>S / A / B / C / D</strong> 五个等级，
              每个都标注了「国内类比」「适合谁」「避坑提醒」。
              不用在一堆应用商店里逐个试，照着这份清单装就行。
            </p>
          </div>
        </div>

        {/* ===== 评级规则说明 ===== */}
        <div className="bg-white rounded-xl shadow-sm border p-5 md:p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            怎么读这份榜单
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {RATING_ORDER.map((rating) => {
              const info = ratingInfo[rating];
              return (
                <div key={rating} className={`flex items-center gap-2 p-3 rounded-lg ${info.bg}`}>
                  <span className={`text-lg font-extrabold ${info.color}`}>{info.label}</span>
                  <span className="text-sm text-gray-600">{info.desc}</span>
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
        </div>

        {/* ===== 按用途分类 ===== */}
        <div className="bg-white rounded-xl shadow-sm border p-5 md:p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            按用途分类
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            不确定自己需要什么？根据用途快速定位：
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count = apps.filter((a) => a.category === cat.id).length;
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
        </div>

        {/* ===== APP 卡片网格 by Rating ===== */}
        {appsByRating.map(({ rating, info, apps: ratingApps }) => (
          <section key={rating} id={`rating-${rating}`} className="mb-10">
            {/* Rating header */}
            <div className={`flex items-center gap-3 mb-4 p-4 rounded-xl ${info.bg}`}>
              <span className={`text-2xl font-extrabold ${info.color}`}>{info.label} 级</span>
              <span className="text-gray-600 text-sm">{info.desc}</span>
              <span className="text-gray-400 text-sm ml-auto">{ratingApps.length} 个</span>
            </div>

            {/* App cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ratingApps.map((app) => (
                <AppCard key={app.name} app={app} />
              ))}
            </div>
          </section>
        ))}

        {/* ===== 避坑提醒区 ===== */}
        <section className="mb-10">
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 md:p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-red-800">⚠️ 海外上网必知的 5 个避坑提醒</h2>
                <p className="text-sm text-red-600 mt-1">不管你是留学、工作还是移民，请务必记住：</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                {
                  title: "永远不要相信「先转账后发货」",
                  desc: "无论是 Telegram、Facebook Marketplace 还是任何平台，正规交易都有买家保护。先转账给陌生人的，99% 是诈骗。",
                },
                {
                  title: "重要账号务必开启两步验证（2FA）",
                  desc: "Gmail、WhatsApp、Facebook、Instagram 都支持。开启后即使密码泄露，黑客也无法登录。推荐使用 Authenticator App 而非短信验证。",
                },
                {
                  title: "不要在公开场合暴露个人敏感信息",
                  desc: "家庭住址、银行信息、护照号码等不要在任何社交平台公开。海外身份盗窃问题比国内更严重，信息一旦泄露很难补救。",
                },
                {
                  title: "App 只从官方渠道下载",
                  desc: "Google Play、App Store、官网下载。不要从第三方网站下载 APK，不要相信「破解版」「免费版」，这些往往带有木马。",
                },
                {
                  title: "警惕冒充熟人的消息",
                  desc: "WhatsApp、Telegram 上冒充朋友/家人的骗局非常普遍。收到「我换了号码」「帮我转账」类消息，先电话确认。",
                },
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
          </div>
        </section>

        {/* ===== 相关入口 CTA ===== */}
        <section className="mb-10">
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
                  <Link
                    href="/tools"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors min-h-[44px]"
                  >
                    🛠️ 工具中心
                  </Link>
                  <Link
                    href="/starter"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]"
                  >
                    🎯 场景包
                  </Link>
                  <Link
                    href="/resources"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]"
                  >
                    📚 资源库
                  </Link>
                  <Link
                    href="/guides"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]"
                  >
                    📖 实用指南
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 下一篇预告 ===== */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📖</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">下一篇做什么？</h3>
                <p className="text-sm text-gray-600 mb-3">
                  我们正在准备「出海新人必备网站导航」—— 按行业分类整理实用的出海工具和服务网站，敬请期待。
                </p>
                <Link href="/topics" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium min-h-[44px]">
                  ← 返回专题列表
                </Link>
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
      </div>
    </div>
  );
}

function AppCard({ app }: { app: typeof apps[number] }) {
  const info = ratingInfo[app.rating];
  const cat = categories.find((c) => c.id === app.category);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 text-base">{app.name}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${info.bg} ${info.color}`}>
                {info.label}
              </span>
            </div>
            <p className="text-xs text-gray-400">{app.alias}</p>
          </div>
        </div>

        {/* Category badge */}
        {cat && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full mt-2">
            {cat.emoji} {cat.label}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pb-3 space-y-3 flex-1">
        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">{app.description}</p>

        {/* Analogy */}
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-700">{app.analogy}</p>
        </div>

        {/* Suitable for */}
        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">适合：</span>{app.suitableFor}
          </p>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">避坑：</span>{app.warning}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <a
          href={app.domain}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium min-h-[44px]"
        >
          <ExternalLink className="w-3 h-3" />
          访问官网
        </a>
        {app.beginnerRecommended && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            新手推荐
          </span>
        )}
      </div>
    </div>
  );
}
