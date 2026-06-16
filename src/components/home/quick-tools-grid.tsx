import Link from "next/link";
import { ArrowRight, FileText, Hash, DollarSign, Calculator, Package, Container, Truck } from "lucide-react";

const QUICK_TOOLS = [
  {
    href: "/tools/hs-code",
    icon: Hash,
    title: "HS 编码查询",
    desc: "海关编码检索",
    color: "from-blue-500 to-blue-600",
    status: "已开放",
  },
  {
    href: "/tools/postal-code",
    icon: Package,
    title: "邮编查询",
    desc: "全球邮编检索",
    color: "from-emerald-500 to-teal-600",
    status: "已开放",
  },
  {
    href: "/tools/exchange-rate",
    icon: DollarSign,
    title: "汇率换算",
    desc: "实时汇率",
    color: "from-orange-500 to-amber-600",
    status: "已开放",
  },
  {
    href: "/tools/shipping-calculator",
    icon: Calculator,
    title: "运费计算",
    desc: "国际物流估算",
    color: "from-purple-500 to-violet-600",
    status: "已开放",
  },
  {
    href: "/tools/container",
    icon: Container,
    title: "集装箱计算",
    desc: "CBM / 装柜估算",
    color: "from-indigo-500 to-blue-600",
    status: "已开放",
  },
  {
    href: "/tools/commercial-invoice",
    icon: FileText,
    title: "商业发票",
    desc: "在线生成导出",
    color: "from-teal-500 to-cyan-600",
    status: "已开放",
  },
  {
    href: "/tools/documents/quotation",
    icon: FileText,
    title: "报价单",
    desc: "Quote Sheet",
    color: "from-rose-500 to-pink-600",
    status: "已开放",
  },
  {
    href: "/tracking",
    icon: Truck,
    title: "物流追踪",
    desc: "17TRACK 全球查询",
    color: "from-amber-500 to-orange-600",
    status: "已开放",
  },
];

export default function QuickToolsGrid() {
  return (
    <section className="w-full bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            高频工具快捷入口
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            即点即用，无需注册
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {QUICK_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="relative p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      {tool.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors mb-1">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">{tool.desc}</p>
                  <div className="flex items-center gap-1 text-xs font-medium text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    立即使用 <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            浏览全部工具
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
