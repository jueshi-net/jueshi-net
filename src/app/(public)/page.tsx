import Link from "next/link";
import {
  ArrowRight,
  Globe,
  BookOpen,
  MapPin,
  Zap,
  Star,
  TrendingUp,
  ShieldCheck,
  ShoppingBag,
  GraduationCap,
  Sparkles,
  Store,
} from "lucide-react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TrackedHomeToolLink } from "@/components/tracked-home-tool-link";
import {
  buttonVariants,
  cardStyles,
  sectionTitleStyles,
  badgeStyles,
} from "@/lib/ui-styles";
import { scenarioPackages } from "@/data/scenario-packages";
import HeroSearch from "@/components/home/hero-search";

// ===== Metadata =====

const baseMetadata: Metadata = {
  title: {
    template: "%s | 海外百宝箱",
    default: "海外百宝箱 - 你的出海 SaaS 工作台",
  },
  description:
    "查包裹、算运费、做单据、查邮编、找资源，一个站搞定。面向海外华人的常用工具与资源平台，涵盖跨境寄送、生活资源、出海经营。",
  keywords: [
    "海外华人",
    "集运物流",
    "包裹查询",
    "邮编地址",
    "翻译工具",
    "HS编码",
    "发票生成",
    "跨境生意",
  ],
  alternates: {
    canonical: "https://jueshi.net/",
  },
  openGraph: {
    title: "海外百宝箱 - 你的出海 SaaS 工作台",
    description: "查包裹、算运费、做单据、查邮编、找资源，一个站搞定。",
    type: "website",
    url: "https://jueshi.net/",
    locale: "zh_CN",
    siteName: "海外百宝箱",
    images: [
      {
        url: "https://jueshi.net/og-image.png",
        width: 1200,
        height: 630,
        alt: "海外百宝箱",
      },
    ],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  let linkCount = 50,
    articleCount = 10,
    postalCount = 2760000,
    userCount = 5;
  try {
    const { getSiteStats } = await import("@/lib/stats-cache");
    const data = await getSiteStats();
    linkCount = data.linkCount ?? linkCount;
    articleCount = data.articleCount ?? articleCount;
    postalCount = data.postalCount ?? postalCount;
    userCount = data.userCount ?? userCount;
  } catch (e) {
    console.warn("Homepage generateMetadata: DB unavailable, using defaults:", e);
  }
  return {
    ...baseMetadata,
    title: "海外百宝箱 - 你的出海 SaaS 工作台",
    description: `海外华人的常用工具与资源平台。收录${linkCount}+实用网站，提供体积计算、汇率查询、发票生成等工具。`,
    openGraph: {
      ...baseMetadata.openGraph,
      title: "海外百宝箱 - 你的出海 SaaS 工作台",
    },
  };
}

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag: ShoppingBag,
  GraduationCap: GraduationCap,
  Sparkles: Sparkles,
  ShieldCheck: ShieldCheck,
  Store: Store,
};

// ===== Page =====

export default async function LandingPage() {
  // Site stats (cached 30s)
  let linkCount = 50,
    articleCount = 10,
    postalCount = 2760000,
    userCount = 5;
  try {
    const { getSiteStats } = await import("@/lib/stats-cache");
    const data = await getSiteStats();
    linkCount = data.linkCount;
    articleCount = data.articleCount;
    postalCount = data.postalCount;
    userCount = data.userCount;
  } catch (e) {
    console.warn(
      "Failed to fetch stats for static generation, using defaults:",
      e
    );
  }

  // Featured links (top 6 by clicks)
  let featuredLinks: any[] = [];
  let latestArticles: any[] = [];
  try {
    featuredLinks = await prisma.linkItem.findMany({
      where: { status: "active" },
      orderBy: [{ clicks: "desc" }],
      take: 6,
      include: { category: { select: { name: true, icon: true } } },
    });

    latestArticles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }],
      take: 3,
    });
  } catch (e) {
    console.warn("Failed to fetch featured data for static generation:", e);
  }

  // Core tools for grid
  const coreTools = [
    {
      name: "商业发票",
      href: "/tools/commercial-invoice",
      icon: Globe,
      desc: "国际贸易必备，自动生成多语言商业发票",
    },
    {
      name: "报价单",
      href: "/tools/quote-sheet",
      icon: MapPin,
      desc: "专业报价单生成，支持多币种、多语言",
    },
    {
      name: "唛头面单",
      href: "/tools/documents?type=mark",
      icon: Zap,
      desc: "一键生成唛头标签和快递面单",
    },
    {
      name: "HS 编码查询",
      href: "/tools/hs-code",
      icon: Star,
      desc: "商品 HS 编码快速查询，报关必备",
    },
  ];

  // Popular tools
  const popularTools = [
    {
      name: "邮编查询",
      href: "/tools/postal-code",
      icon: MapPin,
      desc: "全球邮编地址格式化",
    },
    {
      name: "汇率查询",
      href: "/tools/exchange-rate",
      icon: TrendingUp,
      desc: "实时汇率 / 历史趋势",
    },
    {
      name: "AI 商品文案",
      href: "/ai-tools/product-copy",
      icon: Zap,
      desc: "AI 撰写产品描述",
    },
    {
      name: "排行榜",
      href: "/rankings",
      icon: TrendingUp,
      desc: "热门工具实时排行",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO ===== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950">
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[600px] aspect-square bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-14 pb-12 md:pt-20 md:pb-16">
          {/* Top badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-blue-100 border border-white/10">
              <Globe className="w-4 h-4" />
              <span>出海商家 · 海外华人 · 留学生 的 AI 工具箱</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
            海外百宝箱
            <span className="block text-2xl sm:text-3xl md:text-4xl font-semibold text-blue-200 mt-2">
              你的出海 SaaS 工作台
            </span>
          </h1>

          <p className="text-center text-lg md:text-xl text-blue-200/90 max-w-2xl mx-auto mb-8">
            查包裹、算运费、做单据、查邮编、找资源，一个站搞定。
            <br className="hidden sm:block" />
            从日常工具到 AI 赋能，为你精选最实用的出海效率方案。
          </p>

          {/* Search bar — bound to CommandMenu */}
          <div className="max-w-2xl mx-auto mb-10">
            <HeroSearch />
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tools"
              className={`inline-flex items-center justify-center gap-2 px-8 py-3 ${buttonVariants.primary.replace("text-sm", "text-base")} shadow-lg shadow-teal-500/25 hover:shadow-teal-400/30`}
            >
              <Zap className="w-5 h-5" />
              开始使用工具
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 min-h-[48px] bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 transition-all duration-200"
            >
              <ShieldCheck className="w-5 h-5" />
              进入我的工作台
            </Link>
          </div>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-20">
        <div className={cardStyles.base}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                label: "收录网站",
                value: `${linkCount}+`,
                icon: Globe,
                color: "text-blue-600",
              },
              {
                label: "教程文章",
                value: `${articleCount}+`,
                icon: BookOpen,
                color: "text-emerald-600",
              },
              {
                label: "邮编数据",
                value: `${(postalCount / 10000).toFixed(0)}万+`,
                icon: MapPin,
                color: "text-orange-600",
              },
              {
                label: "活跃用户",
                value: `${userCount}+`,
                icon: Globe,
                color: "text-violet-600",
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== CORE TOOLS ===== */}
      <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-8">
          <h2 className={sectionTitleStyles.base}>核心工具引擎</h2>
          <p className={sectionTitleStyles.subtitle}>
            出海经营最常用的单据与查询工具，一键直达
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <TrackedHomeToolLink
                key={tool.name}
                href={tool.href}
                toolName={tool.name}
                className="group block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-teal-200 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                    <Icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors truncate">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5 leading-snug">
                      {tool.desc}
                    </p>
                  </div>
                </div>
              </TrackedHomeToolLink>
            );
          })}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/tools"
            className={`inline-flex items-center gap-1.5 ${buttonVariants.ghost}`}
          >
            查看全部工具 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ===== SCENARIO PACKAGES ===== */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="mb-8">
            <h2 className={sectionTitleStyles.base}>场景解决方案</h2>
            <p className={sectionTitleStyles.subtitle}>
              按你的业务场景，一键打包所需工具和指南
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {scenarioPackages.map((pkg) => {
              const Icon = ICON_MAP[pkg.icon] || Globe;
              return (
                <Link
                  key={pkg.id}
                  href={pkg.href}
                  className="group block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {pkg.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {pkg.toolCount} 个内置工具
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-snug mb-3">
                    {pkg.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.tags.map((tag) => (
                      <span
                        key={tag}
                        className={badgeStyles.info}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 mt-4 text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                    查看详情
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== POPULAR TOOLS ===== */}
      <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className={`${sectionTitleStyles.base} flex items-center gap-2`}
            >
              <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              热门工具
            </h2>
            <p className={sectionTitleStyles.subtitle}>
              最常被使用的核心工具
            </p>
          </div>
          <Link
            href="/tools"
            className={`hidden sm:inline-flex items-center gap-1.5 ${buttonVariants.ghost}`}
          >
            查看全部 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <TrackedHomeToolLink
                key={tool.name}
                href={tool.href}
                toolName={tool.name}
                className="group block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-teal-200 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                    <Icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors truncate">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">{tool.desc}</p>
                  </div>
                </div>
              </TrackedHomeToolLink>
            );
          })}
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Link
            href="/tools"
            className={`inline-flex items-center gap-2 ${buttonVariants.ghost}`}
          >
            查看全部工具 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ===== CONTENT & RESOURCES ===== */}
      <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        {/* Newcomer spotlight */}
        <div className="mb-10">
          <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50 rounded-xl border border-indigo-100 p-5 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-shrink-0">
                <span className="text-4xl">📱</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-bold mb-2">
                  NEW
                </div>
                <h2 className="font-bold text-gray-900 text-lg">
                  出海新人专题：出海之后必装 APP 评级推荐
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  S/A/B/C/D 评级，18 个 APP 从通讯、社交到工作全覆盖。每个都有国内类比和避坑提醒。
                </p>
              </div>
              <Link
                href="/topics/overseas-essential-apps"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex-shrink-0 min-h-[48px]"
              >
                查看专题
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Guides & Resources */}
        <div className="text-center mb-8">
          <h2 className={sectionTitleStyles.base}>指南 & 资源</h2>
          <p className={sectionTitleStyles.subtitle}>
            集运攻略、清关指南、出海经验分享，帮你少走弯路
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href="/guides"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
                  实用指南
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  集运、清关、海外生活攻略，从入门到精通
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-sm font-medium text-blue-600 group-hover:text-blue-700">
                  浏览全部指南
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/resources"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-emerald-700 transition-colors">
                  资源导航
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  精选物流、支付、建站、获客等出海必备网站
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-sm font-medium text-emerald-600 group-hover:text-emerald-700">
                  浏览全部导航
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Latest articles */}
        {latestArticles.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                最新发布
              </h3>
              <Link
                href="/guides"
                className="text-sm text-teal-600 hover:text-teal-700 min-h-[44px] inline-flex items-center px-2"
              >
                查看全部{" "}
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {latestArticles.slice(0, 3).map((a: any) => (
                <Link
                  key={a.id}
                  href={`/guides/${a.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  {a.coverImage ? (
                    <div className="w-full h-36 bg-gray-100 overflow-hidden">
                      <img
                        src={a.coverImage}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-blue-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 mb-1.5 text-sm">
                      {a.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        {a.publishedAt
                          ? new Date(a.publishedAt).toLocaleDateString(
                              "zh-CN"
                            )
                          : new Date(a.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
