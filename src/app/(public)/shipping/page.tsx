import type { Metadata } from "next";
import Link from "next/link";
import { Package, Truck, MapPin, Calculator, FileText, AlertCircle, Globe, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: '跨境寄送 - 海外百宝箱',
  description: '包裹追踪、运费估算、地址格式、敏感货参考 — 跨境寄送全流程工具与资源',
};

const shippingTools = [
  {
    title: "物流追踪入口",
    description: "批量单号整理，一键跳转承运商官网查询",
    icon: Package,
    href: "/tracking",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    title: "体积重与运费估算",
    description: "体积重计算、计费重估算、费用构成理解",
    icon: Calculator,
    href: "/tools/shipping-estimator",
    color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
  },
  {
    title: "地址格式生成器",
    description: "加拿大、美国、澳洲、英国标准地址格式",
    icon: MapPin,
    href: "/tools/address-formatter",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
  },
  {
    title: "敏感货参考查询",
    description: "食品/液体/电池/化妆品/粉末等分类参考",
    icon: AlertCircle,
    href: "/tools/sensitive-goods",
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300",
  },
  {
    title: "体积/CBM计算",
    description: "快速计算包裹体积重量和立方数",
    icon: Calculator,
    href: "/tools/calculator",
    color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300",
  },
  {
    title: "箱唛生成器",
    description: "生成标准箱唛标签，支持PDF导出",
    icon: FileText,
    href: "/tools/customs-generator",
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300",
  },
];

const shippingGuides = [
  { title: "国际快递公司官网", items: ["DHL", "FedEx", "UPS", "USPS", "Canada Post", "Australia Post"] },
  { title: "物流查询工具", items: ["17TRACK", "AfterShip", "ParcelsApp", "TrackingMore"] },
  { title: "寄送指南", items: ["跨境寄送是什么", "如何挑选服务商", "报价怎么看", "常见隐藏费用"] },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-10 h-10" />
            <h1 className="text-3xl font-bold">跨境寄送</h1>
          </div>
          <p className="text-blue-100 text-lg">
            包裹追踪、运费估算、地址格式、敏感货参考 — 跨境寄送全流程工具一站搞定
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-800 dark:text-amber-300 text-sm">
            海外百宝箱是独立工具与资源平台，不直接承运、不代收包裹、不代表任何物流服务商。
            本页工具与资料仅供参考，相关价格、时效和规则请以实际服务商为准。
          </p>
        </div>

        {/* Tools Grid */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">寄送工具</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {shippingTools.map((tool) => {
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {tool.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{tool.description}</p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                  立即使用 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Resources */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">跨境寄送资源</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shippingGuides.map((section) => (
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
