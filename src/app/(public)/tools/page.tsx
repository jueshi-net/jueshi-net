import { Metadata } from 'next';
import Link from 'next/link';
import { Package, Calculator, FileText, MapPin, Briefcase, Globe, AlertTriangle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: '工具中心 - 海外百宝箱',
  description: '海外华人常用工具箱：查包裹、算运费、做单据、查邮编、敏感货参考',
};

export default function ToolsCenterPage() {
  const categories = [
    { 
      name: "跨境寄送工具", 
      tools: [
        { name: "物流追踪", href: "/tracking", icon: Package, desc: "单号查询 / 批量整理" },
        { name: "体积重与运费估算", href: "/tools/shipping-estimator", icon: Calculator, desc: "体积重 / 计费重 / 费用构成" },
        { name: "体积重 / CBM 计算", href: "/tools/calculator", icon: Calculator, desc: "体积重 / CBM 计算" },
        { name: "敏感货参考查询", href: "/tools/sensitive-goods", icon: AlertTriangle, desc: "食品 / 电池 / 液体分类参考" },
      ]
    },
    { 
      name: "单据生成", 
      tools: [
        { name: "发票生成器", href: "/tools/invoice", icon: FileText, desc: "商业发票" },
        { name: "收据生成器", href: "/tools/receipt", icon: FileText, desc: "快速收据" },
        { name: "报价单生成", href: "/tools/quote", icon: FileText, desc: "专业报价" },
        { name: "箱唛生成", href: "/tools/shipping-mark", icon: FileText, desc: "箱唛制作" },
      ]
    },
    { 
      name: "查询工具", 
      tools: [
        { name: "邮编查询", href: "/tools/postal-code", icon: MapPin, desc: "全球邮编数据库" },
        { name: "地址格式生成", href: "/tools/address-formatter", icon: MapPin, desc: "中地址格式" },
        { name: "HS编码查询", href: "/tools/hs-code", icon: Globe, desc: "海关商品编码" },
        { name: "汇率查询", href: "/tools/exchange-rate", icon: Globe, desc: "实时汇率" },
      ]
    },
    { 
      name: "出海经营", 
      tools: [
        { name: "集装箱查询", href: "/tools/container", icon: Briefcase, desc: "集装箱规格" },
        { name: "海关申报生成", href: "/tools/customs-generator", icon: Briefcase, desc: "报关单据" },
        { name: "二维码生成", href: "/tools/qrcode", icon: Globe, desc: "一键生成" },
        { name: "备忘录", href: "/tools/memo", icon: FileText, desc: "在线笔记" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">工具中心</h1>
          <p className="text-lg text-blue-100">海外华人最常用的工具箱，查包裹、算运费、做单据、查邮编，一个站搞定</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        {categories.map((cat) => (
          <div key={cat.name} className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{cat.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cat.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{tool.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{tool.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
