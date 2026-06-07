import Link from "next/link";
import { ArrowLeft, Package, Truck, Search, MapPin, Mail, Calculator, Shield, ArrowRight } from "lucide-react";
import { Metadata } from "next";
import NewsletterForm from "@/components/ui/newsletter-form";

export const metadata: Metadata = {
  title: "留学生集运专区 — 海外百宝箱",
  description: "专为海外留学生打造的集运与生活工具大全：运费计算、包裹追踪、敏感货查询、邮编校验、地址格式化一站式服务。",
};

interface ToolCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  tag?: string;
  tagColor?: string;
}

interface DestLink {
  name: string;
  emoji: string;
  href: string;
  desc: string;
}

const tools: ToolCard[] = [
  {
    title: "运费计算器",
    description: "对比多家国际快递报价，一键计算海运/空运/专线价格",
    icon: <Calculator className="w-6 h-6" />,
    href: "/tools/shipping-calculator",
    tag: "高频",
    tagColor: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  },
  {
    title: "包裹追踪",
    description: "集成 17Track，实时追踪 DHL/FedEx/UPS/EMS 等全球物流状态",
    icon: <Truck className="w-6 h-6" />,
    href: "/tracking",
    tag: "必备",
    tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    title: "敏感货查询",
    description: "查清哪些物品不能邮寄：食品、药品、化妆品、电池等分类指引",
    icon: <Shield className="w-6 h-6" />,
    href: "/tools/sensitive-goods",
  },
  {
    title: "邮编查询",
    description: "全球邮编极速搜索，支持国家/城市级联，覆盖 200+ 国家地区",
    icon: <MapPin className="w-6 h-6" />,
    href: "/tools/postal-code",
    tag: "推荐",
    tagColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
  {
    title: "地址格式化",
    description: "将中文地址一键转换为国际快递标准英文格式，避免拼写错误",
    icon: <Mail className="w-6 h-6" />,
    href: "/tools/address-formatter",
  },
  {
    title: "HS 编码查询",
    description: "海关编码快速检索，了解关税税率与清关要求",
    icon: <Search className="w-6 h-6" />,
    href: "/tools/hs-code",
  },
  {
    title: "集装箱计算",
    description: "20 尺/40 尺柜装载估算，拼箱/整箱成本对比",
    icon: <Package className="w-6 h-6" />,
    href: "/tools/container",
  },
];

const destinations: DestLink[] = [
  { name: "英国", emoji: "🇬🇧", href: "/destinations/uk", desc: "海关清关 + VAT 税务指南" },
  { name: "美国", emoji: "🇺🇸", href: "/destinations/usa", desc: "CBP 清关 + 海外仓推荐" },
  { name: "澳大利亚", emoji: "🇦🇺", href: "/destinations/australia", desc: "GST 注册 + 物流时效" },
  { name: "加拿大", emoji: "🇨🇦", href: "/destinations/canada", desc: "CBSA 流程 + 留学行李" },
  { name: "新加坡", emoji: "🇸🇬", href: "/destinations/singapore", desc: "GST 税率 + 双清包税" },
  { name: "新西兰", emoji: "🇳🇿", href: "/destinations/new-zealand", desc: "MPI 检疫 + 物流专线" },
  { name: "日本", emoji: "🇯🇵", href: "/destinations/japan", desc: "通关手续 + 消费税" },
  { name: "韩国", emoji: "🇰🇷", href: "/destinations/south-korea", desc: "KCS 清关 + 关税指南" },
];

export default function StudentShippingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-teal-900/10">
      {/* Navigation */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 min-h-[44px]">
            <ArrowLeft className="w-4 h-4" /> 返回首页
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-cyan-500/10 dark:from-teal-500/5 dark:via-emerald-500/3 dark:to-cyan-500/5" />
        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-100/80 dark:bg-teal-900/30 backdrop-blur-sm text-teal-700 dark:text-teal-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-teal-200/50 dark:border-teal-700/50">
            🎓 留学生专属
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            留学生海外集运<br className="sm:hidden" />与生活百宝箱
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            从集运比价到包裹追踪，从敏感货查询到地址格式化<br />
            一站式解决留学生寄件、收件、清关全流程
          </p>
        </div>
      </section>

      {/* Tool Matrix */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-teal-600" />
          高频工具矩阵
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-5 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                      {tool.title}
                    </h3>
                    {tool.tag && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${tool.tagColor}`}>
                        {tool.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* pSEO Destinations */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          热门留学目的地
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {destinations.map((d) => (
            <Link
              key={d.name}
              href={d.href}
              className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all duration-200"
            >
              <div className="text-2xl mb-2">{d.emoji}</div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors mb-0.5">
                {d.name}留学
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">{d.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-8 text-center text-white shadow-xl shadow-teal-500/20">
          <h2 className="text-2xl font-bold mb-2">需要更多集运帮助？</h2>
          <p className="text-teal-100 mb-6 text-sm">注册免费账号，解锁无限导出、AI 智能文案与更多高级工具</p>
          <Link href="/login?callbackUrl=/starter/student" className="inline-flex items-center gap-2 bg-white text-teal-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-teal-50 transition-colors text-sm shadow-lg">
            立即登录解锁 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-12" />

      {/* Newsletter */}
      <div className="max-w-3xl mx-auto px-4 pb-8">
        <NewsletterForm />
      </div>
    </div>
  );
}
