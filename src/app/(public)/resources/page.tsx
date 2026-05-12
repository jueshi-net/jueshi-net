import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, LifeBuoy, Truck, Briefcase, ArrowRight, Wrench, Brain, GraduationCap, Globe, Shield, Puzzle } from 'lucide-react';

export const metadata: Metadata = {
  title: '资源库 - 海外百宝箱',
  description: '海外华人常用生活资源、跨境寄送资料、出海经营模板、新手工具、AI 资源',
};

export default function ResourcesPage() {
  const categories = [
    // 新增：新手资源 7 大分类
    { name: "外网新手必装", slug: "starter", icon: Wrench, desc: "刚能访问外网必看的基础软件、浏览器、密码管理、翻译工具", color: "bg-red-100 text-red-600" },
    { name: "AI 工具合集", slug: "ai-tools", icon: Brain, desc: "ChatGPT、Claude、Gemini、Midjourney 等主流 AI 平台", color: "bg-violet-100 text-violet-600" },
    { name: "视频学习平台", slug: "video-learning", icon: GraduationCap, desc: "YouTube、Coursera、Khan Academy、edX 在线课程", color: "bg-pink-100 text-pink-600" },
    { name: "海外生活服务", slug: "overseas-life", icon: Globe, desc: "银行、汇款、购物、社交、生活办事一站整理", color: "bg-cyan-100 text-cyan-600" },
    { name: "出海经营工具", slug: "business-tools", icon: Briefcase, desc: "建站、收款、CDN、数据分析，从 0 到 1 出海", color: "bg-amber-100 text-amber-600" },
    { name: "账号安全隐私", slug: "security", icon: Shield, desc: "密码管理、两步验证、加密邮箱、隐私保护工具", color: "bg-slate-100 text-slate-600" },
    { name: "浏览器插件", slug: "browser-extensions", icon: Puzzle, desc: "翻译、暗色模式、比价、笔记等效率提升扩展", color: "bg-emerald-100 text-emerald-600" },
    // 原有分类
    { name: "海外生活资源", slug: "life", icon: LifeBuoy, desc: "政府、银行、医疗、教育、生活服务常用网站与指南", color: "bg-green-100 text-green-600" },
    { name: "集运物流参考", slug: "logistics", icon: Truck, desc: "承运商查询、集运渠道介绍、敏感货邮寄指南", color: "bg-blue-100 text-blue-600" },
    { name: "出海经营资源", slug: "business", icon: Briefcase, desc: "跨境平台、收款工具、广告投放、AI工具导航", color: "bg-purple-100 text-purple-600" },
    { name: "模板资源", slug: "templates", icon: FileText, desc: "报价单、发票、装箱单、箱唛等可编辑模板下载", color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-500 via-teal-600 to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">资源库</h1>
          <p className="text-lg text-teal-100">海外生活、集运物流、出海经营的实用资料与模板</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/resources/${cat.slug}`}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-teal-300 transition-all"
              >
                <div className={`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{cat.name}</h2>
                <p className="text-gray-500 mb-4">{cat.desc}</p>
                <div className="flex items-center gap-2 text-teal-600 font-medium">
                  进入资源 <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
