import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, BarChart3, Globe, CreditCard, ShoppingCart, TrendingUp, ArrowRight, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: '出海经营 - 海外百宝箱',
  description: '跨境电商、收款工具、HS编码、广告工具、AI助手 — 出海经营一站式资源',
};

const businessTools = [
  {
    title: "HS 编码助手",
    description: "快速查询商品海关编码，生成英文申报名",
    icon: BarChart3,
    href: "/tools/hs-code",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    title: "Commercial Invoice",
    description: "生成标准商业发票，支持PDF导出",
    icon: FileText,
    href: "/tools/invoice",
    color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
  },
  {
    title: "报价单生成器",
    description: "快速生成专业报价单，支持多币种",
    icon: CreditCard,
    href: "/tools/quote",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
  },
  {
    title: "收据生成器",
    description: "生成标准收据凭证，支持自定义模板",
    icon: FileText,
    href: "/tools/receipt",
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300",
  },
  {
    title: "汇率换算",
    description: "实时汇率查询，多币种换算",
    icon: TrendingUp,
    href: "/tools/exchange-rate",
    color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300",
  },
  {
    title: "电商工具集",
    description: "选品、广告、数据分析工具推荐",
    icon: ShoppingCart,
    href: "/nav?category=ecommerce",
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300",
  },
];

const businessResources = [
  { title: "跨境平台", items: ["Amazon", "eBay", "Shopify", "速卖通", "Shopee", "Lazada"] },
  { title: "收款工具", items: ["PayPal", "Stripe", "Payoneer", "万里汇", "PingPong", "空中云汇"] },
  { title: "广告与营销", items: ["Google Ads", "Facebook Ads", "TikTok Ads", "联盟营销", "SEO工具"] },
];

export default function BusinessPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-10 h-10" />
            <h1 className="text-3xl font-bold">出海经营</h1>
          </div>
          <p className="text-purple-100 text-lg">
            跨境电商、收款工具、HS编码、发票单据 — 出海经营全流程支持
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Tools Grid */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">经营工具</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {businessTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5"
              >
                <div className={`w-12 h-12 rounded-lg ${tool.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {tool.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{tool.description}</p>
                <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
                  立即使用 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Resources */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">出海经营资源</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {businessResources.map((section) => (
            <div key={section.title} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
