import Link from 'next/link';
import { Package, Search, Calculator, FileText, MapPin, Globe, Briefcase, ArrowRight, Zap, Users, BookOpen, Calendar, Eye } from 'lucide-react';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

// Base metadata (not exported — merged with generateMetadata)
const baseMetadata: Metadata = {
  title: {
    template: '%s | 海外百宝箱',
    default: '海外百宝箱 - 海外华人的常用工具与资源平台',
  },
  description: '查包裹、算运费、做单据、查邮编、找资源，一个站搞定。面向海外华人的常用工具与资源平台，涵盖跨境寄送、生活资源、出海经营。',
  keywords: ['海外华人', '集运物流', '包裹查询', '邮编地址', '翻译工具', 'HS编码', '发票生成', '跨境生意'],
  alternates: {
    canonical: 'https://kjbxb.com/',
  },
  openGraph: {
    title: '海外百宝箱 - 海外华人的常用工具与资源平台',
    description: '查包裹、算运费、做单据、查邮编、找资源，一个站搞定。',
    type: 'website',
    url: 'https://kjbxb.com/',
    locale: 'zh_CN',
    siteName: '海外百宝箱',
    images: [
      {
        url: 'https://kjbxb.com/og-image.png',
        width: 1200,
        height: 630,
        alt: '海外百宝箱',
      },
    ],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const { getSiteStats } = await import("@/lib/stats-cache");
  const stats = await getSiteStats();
  return {
    ...baseMetadata,
    title: `海外百宝箱 - 查包裹、算运费、做单据、查邮编、找资源`,
    description: `海外华人的常用工具与资源平台。收录${stats.linkCount}+实用网站，提供体积计算、汇率查询、发票生成等工具。`,
    openGraph: {
      ...baseMetadata.openGraph,
      title: `海外百宝箱 - 海外华人的常用工具与资源平台`,
    },
  };
}

export default async function LandingPage() {
  // Get real stats from database (cached 30s)
  let linkCount = 50, articleCount = 10, postalCount = 1080000, userCount = 5;
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
    url: 'https://kjbxb.com/',
    description: '海外华人的常用工具与资源平台',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://kjbxb.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  // Scene entries
  const scenes = [
    { title: "我要查包裹", href: "/tracking", icon: Package, color: "bg-blue-50 text-blue-600 border-blue-100", desc: "物流追踪 / 批量查询 / 异常解释" },
    { title: "我要算运费", href: "/tools/shipping-estimator", icon: Calculator, color: "bg-green-50 text-green-600 border-green-100", desc: "体积重计算 / 集运估算 / 汇率换算" },
    { title: "我要做单据", href: "/tools/invoice", icon: FileText, color: "bg-purple-50 text-purple-600 border-purple-100", desc: "发票 / 装箱单 / 报价单 / 收据" },
    { title: "我要查邮编地址", href: "/tools/postal-code", icon: MapPin, color: "bg-orange-50 text-orange-600 border-orange-100", desc: "全球邮编 / 地址格式 / 偏远地区" },
    { title: "我要找海外资源", href: "/resources", icon: BookOpen, color: "bg-teal-50 text-teal-600 border-teal-100", desc: "生活办事 / 银行学校 / 网盘资料" },
    { title: "我要了解跨境寄送", href: "/shipping", icon: Package, color: "bg-red-50 text-red-600 border-red-100", desc: "运费估算 / 敏感货参考 / 寄送指南" },
  ];

  // 8 Core tools
  const coreTools = [
    { name: '物流追踪', href: '/tracking', emoji: '📦', desc: '单号查询 / 批量整理' },
    { name: '体积/CBM计算', href: '/tools/calculator', emoji: '📐', desc: '体积重 / CBM 计算' },
    { name: '体积重与运费估算', href: '/tools/shipping-estimator', emoji: '💰', desc: '体积重 / 计费重 / 费用构成' },
    { name: '发票/装箱单', href: '/tools/invoice', emoji: '🧾', desc: '商业发票 / 装箱单生成' },
    { name: 'HS编码助手', href: '/tools/hs-code', emoji: '🔍', desc: '海关商品编码查询' },
    { name: '邮编/地址工具', href: '/tools/postal-code', emoji: '📮', desc: '全球邮编 / 地址格式化' },
    { name: '报价/收据生成', href: '/tools/quote', emoji: '💵', desc: '快速生成报价单收据' },
    { name: '敏感货参考', href: '/tools/sensitive-goods', emoji: '⚠️', desc: '食品 / 电池 / 液体分类参考' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6">
            <Globe className="w-4 h-4" />
            海外华人的常用工具与资源平台
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            海外华人的<span className="text-yellow-300">常用工具箱</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            查包裹、算运费、做单据、查邮编、找资源，一个站搞定。
          </p>
          
          {/* 6 Scene Entries */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
            {scenes.map((s) => {
              const Icon = s.icon;
              return (
                <Link 
                  key={s.title} 
                  href={s.href} 
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all group text-left"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                  <p className="text-xs text-blue-100">{s.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '收录网站', value: `${linkCount}+` },
            { label: '教程文章', value: `${articleCount}+` },
            { label: '邮编数据', value: `${(postalCount / 10000).toFixed(0)}万+` },
            { label: '活跃用户', value: `${userCount}+` },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg border p-5 text-center">
              <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Core Tools */}
      <div className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">核心工具箱</h2>
          <p className="text-gray-500 text-center mb-10">海外华人最常用的 8 大工具</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {coreTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="text-3xl mb-3">{tool.emoji}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{tool.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{tool.desc}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/tools" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700">
              查看全部工具 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Links */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">热门导航</h2>
        <p className="text-gray-500 text-center mb-10">精选最实用的跨境物流与海外生活网站</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-4 text-center hover:shadow-md hover:scale-105 transition-all border border-gray-100"
            >
              <div className="text-3xl mb-2">{link.icon || '🔗'}</div>
              <h3 className="text-sm font-semibold text-gray-900 truncate">{link.title}</h3>
              {link.category && (
                <p className="text-xs text-gray-400 mt-1">{link.category.icon} {link.category.name}</p>
              )}
            </a>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/nav" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700">
            浏览全部导航 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Latest Articles */}
      {latestArticles.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">最新指南</h2>
              <p className="text-gray-500 mt-1">集运、清关、海外生活攻略</p>
            </div>
            <Link href="/guides" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {latestArticles.map((a: any) => (
              <Link
                key={a.id}
                href={`/guides/${a.slug}`}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
              >
                {a.coverImage ? (
                  <div className="w-full h-40 bg-gray-100 overflow-hidden">
                    <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-blue-300" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {a.title}
                  </h3>
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

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-3">开始使用海外百宝箱</h2>
          <p className="text-blue-100 mb-6 text-lg">免费注册，即刻体验一站式工具箱</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            立即注册
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
