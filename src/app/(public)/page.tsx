import Link from 'next/link';
import {
  Package, Calculator, FileText, MapPin, Globe, Briefcase,
  ArrowRight, Zap, Users, BookOpen, Calendar, Eye, Star,
  Tag, Receipt, ClipboardList, FileBadge, Shield,
  Layers, Sparkles, TrendingUp, CreditCard, ShieldCheck,
} from 'lucide-react';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { TrackedHomeToolLink } from '@/components/tracked-home-tool-link';
import { AdSlot } from '@/components/ad-slot';

// Base metadata (not exported — merged with generateMetadata)
const baseMetadata: Metadata = {
  title: {
    template: '%s | 海外百宝箱',
    default: '海外百宝箱 - 海外华人的常用工具与资源平台',
  },
  description: '查包裹、算运费、做单据、查邮编、找资源，一个站搞定。面向海外华人的常用工具与资源平台，涵盖跨境寄送、生活资源、出海经营。',
  keywords: ['海外华人', '集运物流', '包裹查询', '邮编地址', '翻译工具', 'HS编码', '发票生成', '跨境生意'],
  alternates: {
    canonical: 'https://jueshi.net/',
  },
  openGraph: {
    title: '海外百宝箱 - 海外华人的常用工具与资源平台',
    description: '查包裹、算运费、做单据、查邮编、找资源，一个站搞定。',
    type: 'website',
    url: 'https://jueshi.net/',
    locale: 'zh_CN',
    siteName: '海外百宝箱',
    images: [
      {
        url: 'https://jueshi.net/og-image.png',
        width: 1200,
        height: 630,
        alt: '海外百宝箱',
      },
    ],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  let linkCount = 50, articleCount = 10, postalCount = 2760000, userCount = 5;
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
    title: `海外百宝箱 - 查包裹、算运费、做单据、查邮编、找资源`,
    description: `海外华人的常用工具与资源平台。收录${linkCount}+实用网站，提供体积计算、汇率查询、发票生成等工具。`,
    openGraph: {
      ...baseMetadata.openGraph,
      title: `海外百宝箱 - 海外华人的常用工具与资源平台`,
    },
  };
}

export default async function LandingPage() {
  // Get real stats from database (cached 30s)
  let linkCount = 50, articleCount = 10, postalCount = 2760000, userCount = 5;
  try {
    const { getSiteStats } = await import("@/lib/stats-cache");
    const data = await getSiteStats();
    linkCount = data.linkCount;
    articleCount = data.articleCount;
    postalCount = data.postalCount;
    userCount = data.userCount;
  } catch (e) {
    console.warn("Failed to fetch stats for static generation, using defaults:", e);
  }

  // Featured links (by clicks, top 12)
  let featuredLinks: any[] = [];
  let latestArticles: any[] = [];
  try {
    featuredLinks = await prisma.linkItem.findMany({
      where: { status: 'active' },
      orderBy: [{ clicks: 'desc' }],
      take: 12,
      include: { category: { select: { name: true, icon: true } } },
    });

    // Latest articles
    latestArticles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ publishedAt: 'desc' }],
      take: 3,
    });
  } catch (e) {
    console.warn("Failed to fetch featured data for static generation:", e);
  }

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '海外百宝箱',
    url: 'https://jueshi.net/',
    description: '海外华人的常用工具与资源平台',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://jueshi.net/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  // ====== SCENE ENTRIES (merged documents +唛头面单) ======
  const scenes = [
    { title: "我要查包裹", href: "/tracking", icon: Package, gradient: "from-blue-500 to-blue-700", desc: "物流追踪 / 批量查询 / 异常解释" },
    { title: "我要做单据 / 面单", href: "/tools/documents", icon: FileText, gradient: "from-purple-500 to-indigo-700", desc: "发票、报价单、装箱单、唛头、快递面单，一站生成", isPortal: true },
    { title: "我要算运费", href: "/tools/shipping-calculator", icon: Calculator, gradient: "from-emerald-500 to-green-700", desc: "体积重计算 / 集运估算 / CBM" },
    { title: "我要查邮编地址", href: "/tools/postal-code", icon: MapPin, gradient: "from-orange-500 to-amber-700", desc: "全球邮编 / 地址格式 / 偏远地区" },
    { title: "我要出海做生意", href: "/business", icon: Briefcase, gradient: "from-cyan-500 to-blue-700", desc: "建站、收款、物流、获客、工具导航" },
    { title: "我要学习 AI", href: "/ai-learning", icon: Zap, gradient: "from-violet-500 to-purple-700", desc: "AI工具、教程、资料库、实用导航" },
  ];

  // Sub-entries for the merged documents card
  const documentSubEntries = [
    { label: "唛头/面单生成器", icon: Tag },
    { label: "商业发票", icon: Receipt },
    { label: "装箱单", icon: Package },
    { label: "报价单", icon: ClipboardList },
    { label: "销售合同", icon: FileBadge },
    { label: "报关/清关资料", icon: Shield },
  ];

  // ====== CAPABILITY CARDS (hero) ======
  const capabilities = [
    {
      icon: Zap,
      title: 'AI 工具',
      desc: '商品文案、翻译润色、多语言客服，AI 赋能日常工作',
      href: '/ai-learning',
      color: 'from-violet-50 to-purple-50 border-violet-200',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
    },
    {
      icon: Layers,
      title: '场景工具包',
      desc: '查包裹、做单据、算运费，按场景一键直达',
      href: '/tools',
      color: 'from-blue-50 to-indigo-50 border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: MapPin,
      title: '邮编 / 物流',
      desc: '全球邮编查询、地址格式化、运费计算参考',
      href: '/tools/postal-code',
      color: 'from-orange-50 to-amber-50 border-orange-200',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      icon: CreditCard,
      title: '会员积分',
      desc: '每日签到赚积分，解锁高级工具与专属资源',
      href: '/dashboard',
      color: 'from-amber-50 to-yellow-50 border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
  ];

  // 6 Core tools for popular section
  const popularTools = [
    { name: '邮编查询', href: '/tools/postal-code', icon: MapPin, desc: '全球邮编地址格式化' },
    { name: '单据生成', href: '/tools/documents', icon: FileText, desc: '发票/装箱单/合同' },
    { name: '唛头标签', href: '/tools/documents?type=mark', icon: Tag, desc: '一键生成唛头面单' },
    { name: 'AI商品文案', href: '/ai-tools/product-copy', icon: Sparkles, desc: 'AI 撰写产品描述' },
    { name: 'AI翻译润色', href: '/ai-tools/translate-polish', icon: Globe, desc: '多语言翻译优化' },
    { name: '排行榜', href: '/rankings', icon: TrendingUp, desc: '热门工具实时排行' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ===== HERO ===== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950">
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[600px] aspect-square bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-14 pb-12 md:pt-20 md:pb-16">
          {/* Top badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-blue-100 border border-white/10">
              <Globe className="w-4 h-4" />
              <span>出海商家 · 海外华人 · 留学生 的 AI 工具箱与资源导航</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
            海外百宝箱
            <span className="block text-2xl sm:text-3xl md:text-4xl font-semibold text-blue-200 mt-2">
              工具 · 资源 · AI · 工作台 · 积分会员
            </span>
          </h1>

          <p className="text-center text-lg md:text-xl text-blue-200/90 max-w-2xl mx-auto mb-8">
            查包裹、算运费、做单据、查邮编、找资源，一个站搞定。<br className="hidden sm:block" />
            从日常工具到 AI 赋能，为你精选最实用的出海效率方案。
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/tools"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 min-h-[48px] bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/25 hover:shadow-teal-400/30"
            >
              <Sparkles className="w-5 h-5" />
              开始使用工具
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 min-h-[48px] bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 transition-all duration-200"
            >
              <ShieldCheck className="w-5 h-5" />
              进入我的工作台
            </Link>
          </div>

          {/* Capability cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <Link
                  key={cap.title}
                  href={cap.href}
                  className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${cap.color} border p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${cap.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${cap.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{cap.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 leading-snug">{cap.desc}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: '收录网站', value: `${linkCount}+`, icon: Globe, color: 'text-blue-600' },
              { label: '教程文章', value: `${articleCount}+`, icon: BookOpen, color: 'text-emerald-600' },
              { label: '邮编数据', value: `${(postalCount / 10000).toFixed(0)}万+`, icon: MapPin, color: 'text-orange-600' },
              { label: '活跃用户', value: `${userCount}+`, icon: Users, color: 'text-violet-600' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== SCENE CARDS ===== */}
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">按场景开始</h2>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto">不用从一堆工具里慢慢找，选择你的任务，直接开始</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {scenes.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.title}
                href={s.href}
                className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${s.gradient} p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
              >
                {/* Subtle glow */}
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-white">{s.title}</h3>
                  </div>

                  <p className="text-sm text-white/80 mb-4">{s.desc}</p>

                  {/* Sub-entries for Documents card */}
                  {s.isPortal && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {documentSubEntries.map((sub) => {
                        const SubIcon = sub.icon;
                        return (
                          <div
                            key={sub.label}
                            className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-2.5 py-2 text-xs text-white/90 group-hover:bg-white/25 transition-colors"
                          >
                            <SubIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{sub.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* CTA arrow */}
                  <div className="flex items-center gap-2 text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                    立即使用
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ===== POPULAR TOOLS ===== */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                热门工具
              </h2>
              <p className="text-gray-500 mt-1">最常被使用的核心工具</p>
            </div>
            <Link href="/tools" className="hidden sm:inline-flex items-center gap-1.5 text-teal-600 font-medium hover:text-teal-700 transition-colors min-h-[44px] px-3 py-2">
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <TrackedHomeToolLink
                  key={tool.name}
                  href={tool.href}
                  toolName={tool.name}
                  className="group block rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-teal-200 transition-all duration-200 min-h-[44px]"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                      <Icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors truncate">{tool.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{tool.desc}</p>
                    </div>
                  </div>
                </TrackedHomeToolLink>
              );
            })}
          </div>

          {/* Mobile: "view all" button */}
          <div className="text-center mt-6 sm:hidden">
            <Link href="/tools" className="inline-flex items-center gap-2 text-teal-600 font-medium min-h-[44px] px-4 py-2">
              查看全部工具 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ===== CONTENT & RESOURCES GUIDE ===== */}
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">指南 & 资源</h2>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto">集运攻略、清关指南、出海经验分享，帮你少走弯路</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Guides card */}
          <Link
            href="/guides"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">实用指南</h3>
                <p className="text-sm text-gray-500 mt-1">集运、清关、海外生活攻略，从入门到精通</p>
                <div className="flex items-center gap-1.5 mt-3 text-sm font-medium text-blue-600 group-hover:text-blue-700">
                  浏览全部指南
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Resources card */}
          <Link
            href="/resources"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-emerald-700 transition-colors">资源导航</h3>
                <p className="text-sm text-gray-500 mt-1">精选物流、支付、建站、获客等出海必备网站</p>
                <div className="flex items-center gap-1.5 mt-3 text-sm font-medium text-emerald-600 group-hover:text-emerald-700">
                  浏览全部导航
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Latest articles (if available) */}
        {latestArticles.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">最新发布</h3>
              <Link href="/guides" className="text-sm text-teal-600 hover:text-teal-700 min-h-[44px] inline-flex items-center px-2">
                查看全部 <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
                      <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
                        <Calendar className="w-3 h-3" />
                        {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('zh-CN') : new Date(a.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {a.views}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== QUICK ACCESS (compact) ===== */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          快速入口
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { name: '物流追踪', href: '/tracking', emoji: '📦' },
            { name: '运费/CBM', href: '/tools/shipping-calculator', emoji: '📐' },
            { name: '单据中心', href: '/tools/documents', emoji: '📋' },
            { name: 'HS编码', href: '/tools/hs-code', emoji: '🔍' },
            { name: '邮编地址', href: '/tools/postal-code', emoji: '📮' },
            { name: '汇率查询', href: '/tools/exchange-rate', emoji: '💱' },
          ].map((tool) => (
            <TrackedHomeToolLink
              key={tool.name}
              href={tool.href}
              toolName={tool.name}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-teal-200 transition-all min-h-[44px]"
            >
              <span className="text-2xl">{tool.emoji}</span>
              <span className="text-xs font-medium text-gray-700 text-center">{tool.name}</span>
            </TrackedHomeToolLink>
          ))}
        </div>
      </div>

      {/* Ad Slots */}
      <div className="max-w-6xl mx-auto px-4 -mt-2 mb-6">
        <AdSlot placement="home-after-tools" variant="card" />
      </div>
      <div className="max-w-6xl mx-auto px-4 -mt-4 mb-6">
        <AdSlot placement="home-before-footer" variant="banner" />
      </div>

      {/* ===== FEATURED LINKS ===== */}
      {featuredLinks.length > 0 && (
        <div className="bg-white">
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">热门导航</h2>
              <p className="text-gray-500 mt-2">精选最实用的跨境物流与海外生活网站</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {featuredLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2 bg-gray-50 rounded-xl p-4 hover:shadow-md hover:bg-white hover:border-teal-200 border border-transparent transition-all duration-200 min-h-[44px]"
                >
                  <div className="text-2xl">{link.icon || '🔗'}</div>
                  <h3 className="text-sm font-medium text-gray-700 text-center truncate w-full group-hover:text-teal-600 transition-colors">{link.title}</h3>
                  {link.category && (
                    <p className="text-xs text-gray-400">{link.category.icon} {link.category.name}</p>
                  )}
                </a>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link href="/resources" className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 min-h-[44px] px-4 py-2">
                浏览全部导航 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ===== CTA ===== */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">开始使用海外百宝箱</h2>
          <p className="text-teal-100 mb-8 text-lg">免费注册，即刻体验一站式工具箱</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 min-h-[48px] bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-colors shadow-lg"
            >
              立即注册
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/starter"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 min-h-[48px] bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all"
            >
              新手入门指南
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
