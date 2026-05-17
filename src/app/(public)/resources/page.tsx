import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FileText, LifeBuoy, Truck, Briefcase, Wrench, Brain, GraduationCap, Globe, Shield, Puzzle } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: '海外资源库 - 精选出海工具与资料',
  description: '精选出海、生活、留学、物流、AI 工具与资料入口',
};

const categories = [
  {
    name: '外网新手必装',
    slug: 'starter',
    icon: Wrench,
    desc: '刚能访问外网必看的基础软件、浏览器、密码管理、翻译工具',
    audience: '外网新手',
    color: 'bg-red-100 text-red-600',
  },
  {
    name: 'AI 工具合集',
    slug: 'ai-tools',
    icon: Brain,
    desc: 'ChatGPT、Claude、Gemini、Midjourney 等主流 AI 平台',
    audience: '效率追求者',
    color: 'bg-violet-100 text-violet-600',
  },
  {
    name: '视频学习平台',
    slug: 'video-learning',
    icon: GraduationCap,
    desc: 'YouTube、Coursera、Khan Academy、edX 在线课程',
    audience: '终身学习者',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    name: '海外生活服务',
    slug: 'overseas-life',
    icon: Globe,
    desc: '银行、汇款、购物、社交、生活办事一站整理',
    audience: '海外华人',
    color: 'bg-cyan-100 text-cyan-600',
  },
  {
    name: '出海经营工具',
    slug: 'business-tools',
    icon: Briefcase,
    desc: '建站、收款、CDN、数据分析，从 0 到 1 出海',
    audience: '跨境商家',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    name: '账号安全隐私',
    slug: 'security',
    icon: Shield,
    desc: '密码管理、两步验证、加密邮箱、隐私保护工具',
    audience: '隐私重视者',
    color: 'bg-slate-100 text-slate-600',
  },
  {
    name: '浏览器插件',
    slug: 'browser-extensions',
    icon: Puzzle,
    desc: '翻译、暗色模式、比价、笔记等效率提升扩展',
    audience: '效率达人',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    name: '海外生活资源',
    slug: 'life',
    icon: LifeBuoy,
    desc: '政府、银行、医疗、教育、生活服务常用网站与指南',
    audience: '海外华人',
    color: 'bg-green-100 text-green-600',
  },
  {
    name: '集运物流参考',
    slug: 'logistics',
    icon: Truck,
    desc: '承运商查询、集运渠道介绍、敏感货邮寄指南',
    audience: '跨境寄件人',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    name: '出海经营资源',
    slug: 'business',
    icon: Briefcase,
    desc: '跨境平台、收款工具、广告投放、AI工具导航',
    audience: '跨境电商',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    name: '模板资源',
    slug: 'templates',
    icon: FileText,
    desc: '报价单、发票、装箱单、箱唛等可编辑模板下载',
    audience: '外贸从业者',
    color: 'bg-orange-100 text-orange-600',
  },
];

const scenes = [
  {
    title: '跨境商家常用资源',
    desc: '建站收款、广告投放、物流追踪、税务合规一站式导航',
    emoji: '🏪',
    href: '/resources/business-tools',
    gradient: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    accent: 'text-amber-700',
    tags: ['建站工具', '收款通道', '物流查询'],
  },
  {
    title: '海外华人生活资源',
    desc: '银行开户、汇款转账、医疗教育、购物社交全覆盖',
    emoji: '🌏',
    href: '/resources/overseas-life',
    gradient: 'from-cyan-50 to-teal-50',
    border: 'border-cyan-200',
    accent: 'text-cyan-700',
    tags: ['银行汇款', '生活服务', '社交工具'],
  },
  {
    title: '留学生学习工具',
    desc: '在线课程、学术搜索、文献管理、语言提升必备合集',
    emoji: '🎓',
    href: '/resources/video-learning',
    gradient: 'from-pink-50 to-rose-50',
    border: 'border-pink-200',
    accent: 'text-pink-700',
    tags: ['在线课程', '学术工具', '语言学习'],
  },
  {
    title: '物流与单据资源',
    desc: '承运商对比、报价单模板、装箱单发票、箱唛一键下载',
    emoji: '📦',
    href: '/resources/logistics',
    gradient: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    accent: 'text-blue-700',
    tags: ['承运商', '单据模板', '集运指南'],
  },
];

async function getCategoryCounts() {
  const counts = await prisma.resource.groupBy({
    by: ['category'],
    where: { isActive: true },
    _count: { id: true },
  });
  const map: Record<string, number> = {};
  for (const c of counts) {
    map[c.category] = c._count.id;
  }
  return map;
}

export default async function ResourcesPage() {
  const counts = await getCategoryCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 text-center">
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
              工具导航
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
              资料合集
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
              海外服务
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
              持续更新
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            海外资源库
          </h1>
          <p className="text-base md:text-lg text-teal-100 max-w-xl mx-auto">
            精选出海、生活、留学、物流、AI 工具与资料入口
          </p>
        </div>
      </div>

      {/* Category Cards */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = counts[cat.slug] ?? 0;
            return (
              <Link
                key={cat.slug}
                href={`/resources/${cat.slug}`}
                className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-teal-300 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h2 className="text-base font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                        {cat.name}
                      </h2>
                      <span className="shrink-0 inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                        {count}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{cat.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        👤 {cat.audience}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-teal-600 font-medium group-hover:gap-1.5 transition-all">
                        进入 <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Scene Entry Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">按场景快速进入</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {scenes.map((scene) => (
            <Link
              key={scene.title}
              href={scene.href}
              className={`group rounded-xl p-6 bg-gradient-to-br ${scene.gradient} border ${scene.border} hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl shrink-0">{scene.emoji}</span>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-lg font-bold ${scene.accent} mb-1`}>
                    {scene.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {scene.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {scene.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-2.5 py-0.5 bg-white/70 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Note */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center text-sm text-gray-400">
          资源由后台 /admin/resources 管理，隐藏资源不会在前台展示。
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
