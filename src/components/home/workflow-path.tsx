import Link from "next/link";
import { ArrowRight, Hash, Calculator, FileText, DollarSign, Package, CheckCircle } from "lucide-react";

const STEPS = [
  {
    step: 1,
    icon: Hash,
    title: "查编码",
    desc: "查询 HS 编码、邮编",
    tools: [
      { label: "HS 编码查询", href: "/tools/hs-code" },
      { label: "邮编查询", href: "/tools/postal-code" },
    ],
    color: "bg-blue-500",
  },
  {
    step: 2,
    icon: Calculator,
    title: "算运费",
    desc: "估算物流费用、CBM",
    tools: [
      { label: "运费计算", href: "/tools/shipping-calculator" },
      { label: "集装箱计算", href: "/tools/container" },
    ],
    color: "bg-purple-500",
  },
  {
    step: 3,
    icon: DollarSign,
    title: "做报价",
    desc: "生成报价单、换算汇率",
    tools: [
      { label: "报价单 Quote Sheet", href: "/tools/documents/quotation" },
      { label: "汇率换算", href: "/tools/exchange-rate" },
    ],
    color: "bg-orange-500",
  },
  {
    step: 4,
    icon: FileText,
    title: "出单据",
    desc: "商业发票、装箱单",
    tools: [
      { label: "商业发票", href: "/tools/commercial-invoice" },
      { label: "单据模板中心", href: "/tools/documents" },
    ],
    color: "bg-teal-500",
  },
  {
    step: 5,
    icon: Package,
    title: "存工作台",
    desc: "保存草稿、管理客户",
    tools: [
      { label: "我的工作台", href: "/workbench" },
      { label: "我的单据", href: "/workspace/documents" },
    ],
    color: "bg-emerald-500",
  },
];

export default function WorkflowPath() {
  return (
    <section className="w-full bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            跨境贸易工作流
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-lg mx-auto">
            从查编码到出单据，5 步完成完整流程
          </p>
        </div>

        <div className="relative">
          {/* Connection line (desktop only) */}
          <div className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-0.5 bg-gray-200" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="relative flex flex-col items-center text-center">
                  {/* Step number circle */}
                  <div className={`relative z-10 w-12 h-12 rounded-full ${s.color} flex items-center justify-center text-white font-bold text-lg shadow-lg mb-4`}>
                    {s.step}
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-3 shadow-sm">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>

                  {/* Title & desc */}
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">{s.desc}</p>

                  {/* Tool links */}
                  <div className="space-y-1.5 w-full">
                    {s.tools.map((t) => (
                      <Link
                        key={t.href}
                        href={t.href}
                        className="flex items-center justify-center gap-1 text-xs text-teal-600 hover:text-teal-700 hover:underline font-medium"
                      >
                        <CheckCircle className="w-3 h-3 flex-shrink-0" />
                        {t.label}
                      </Link>
                    ))}
                  </div>

                  {/* Arrow (between steps on desktop) */}
                  {s.step < 5 && (
                    <div className="hidden lg:block absolute top-14 -right-3 z-20">
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/tools/documents"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
          >
            开始使用 — 生成商业发票
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
