import { Metadata } from 'next';
import Link from 'next/link';
import {
  Package, Calculator, FileText, MapPin, Briefcase, Globe,
  AlertTriangle, ArrowRight, Sparkles, BookOpen, Target, Users,
  Star, Info,
} from 'lucide-react';

export const metadata: Metadata = {
  title: '工具中心 - 海外百宝箱',
  description: '海外华人常用工具箱：查包裹、算运费、做单据、查邮编、AI 文案，一个站搞定。适合出海商家、海外华人、留学生。',
  alternates: { canonical: 'https://jueshi.net/tools' },
  openGraph: {
    title: '工具中心 - 海外百宝箱',
    description: '海外华人常用工具箱：查包裹、算运费、做单据、查邮编、AI 文案，一个站搞定。',
    url: 'https://jueshi.net/tools',
    type: 'website',
  },
};

export default function ToolsCenterPage() {
  const categories = [
    {
      name: "物流与地址",
      icon: Package,
      description: "查包裹、算运费、查邮编，跨境寄送必备工具",
      tools: [
        { name: "物流追踪", href: "/tracking", icon: Package, desc: "单号查询 / 批量整理", status: "可用" as const, users: "集运/海淘用户" },
        { name: "运费计算器", href: "/tools/shipping-calculator", icon: Calculator, desc: "体积重 / CBM / 计费重 / 费用参考", status: "可用" as const, users: "集运/海淘用户" },
        { name: "邮编查询", href: "/tools/postal-code", icon: MapPin, desc: "全球邮编数据库 / 格式校验 / DB 查询", status: "可用" as const, users: "集运/地址核对用户" },
        { name: "敏感货参考查询", href: "/tools/sensitive-goods", icon: AlertTriangle, desc: "食品 / 电池 / 液体分类参考", status: "可用" as const, users: "集运用户" },
      ]
    },
    {
      name: "外贸与单据",
      icon: FileText,
      description: "发票、装箱单、唛头面单、报价单，单据一站生成",
      tools: [
        { name: "单据中心", href: "/tools/documents", icon: FileText, desc: "发票/装箱单/报价单/合同，一站管理", status: "可用" as const, users: "外贸/电商卖家" },
        { name: "发票生成器", href: "/tools/invoice", icon: FileText, desc: "商业发票快速生成", status: "可用" as const, users: "外贸卖家" },
        { name: "收据生成器", href: "/tools/receipt", icon: FileText, desc: "快速收据 / 收款凭证", status: "可用" as const, users: "中小商家" },
        { name: "报价单生成", href: "/tools/quote", icon: FileText, desc: "专业报价单模板", status: "可用" as const, users: "外贸/批发商" },
        { name: "箱唛生成", href: "/tools/shipping-mark", icon: FileText, desc: "外箱唛头制作 / 标签打印", status: "可用" as const, users: "仓储/物流" },
      ]
    },
    {
      name: "AI 效率工具",
      icon: Sparkles,
      description: "AI 辅助商品文案、翻译润色、文档摘要，提升日常工作效率",
      tools: [
        { name: "AI 商品文案", href: "/ai-tools/product-copy", icon: Sparkles, desc: "一键生成多平台商品标题、五点描述、SEO 关键词", status: "体验版" as const, users: "电商卖家/代购" },
        { name: "AI 翻译润色", href: "/ai-tools/translate-polish", icon: Globe, desc: "商务邮件翻译、英文润色、多语言沟通", status: "体验版" as const, users: "外贸/留学生" },
        { name: "AI 文档摘要", href: "/ai-tools/document-summary", icon: BookOpen, desc: "合同/协议/PDF 快速摘要、风险提示、关键条款提取", status: "体验版" as const, users: "商务/法律/留学" },
        { name: "短视频 SOP 生成器", href: "/tools/video-script-sop", icon: Sparkles, desc: "AI 自动生成爆款短视频脚本，支持多平台多风格", status: "体验版" as const, users: "电商卖家/内容创作者" },
      ]
    },
    {
      name: "查询与经营",
      icon: Briefcase,
      description: "HS编码、汇率、集装箱、二维码，出海经营辅助工具",
      tools: [
        { name: "HS编码查询", href: "/tools/hs-code", icon: Globe, desc: "海关商品编码搜索", status: "可用" as const, users: "外贸/报关" },
        { name: "汇率查询", href: "/tools/exchange-rate", icon: Globe, desc: "实时汇率 / 多币种换算", status: "可用" as const, users: "跨境/汇款" },
        { name: "集装箱查询", href: "/tools/container", icon: Briefcase, desc: "集装箱规格 / 容积参考", status: "可用" as const, users: "海运/物流" },
        { name: "二维码生成", href: "/tools/qrcode", icon: Globe, desc: "一键生成二维码", status: "可用" as const, users: "通用" },
        { name: "备忘录", href: "/tools/memo", icon: FileText, desc: "在线笔记 / 快速记录", status: "可用" as const, users: "通用" },
      ]
    },
  ];

  const statusBadge = (status: "可用" | "体验版" | "待开放") => {
    if (status === "可用") return null; // 不显示，节省空间
    if (status === "体验版") {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-violet-50 text-violet-600 text-[10px] rounded font-medium">
          <Sparkles className="w-2.5 h-2.5" /> 体验版
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-400 text-[10px] rounded font-medium">
        待开放
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO ===== */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-blue-100 border border-white/10 mb-6">
            <Target className="w-4 h-4" />
            <span>出海商家 · 海外华人 · 留学生 的效率工具箱</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-4">工具中心</h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            查包裹、算运费、做单据、查邮编、AI 文案生成 —— 一个站搞定。<br className="hidden sm:block" />
            所有工具免费使用，无需安装软件，打开浏览器即可操作。
          </p>

          {/* Quick nav pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <a href="#logistics" className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/25 transition-colors min-h-[44px] inline-flex items-center gap-1.5">
              📦 物流与地址
            </a>
            <a href="#documents" className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/25 transition-colors min-h-[44px] inline-flex items-center gap-1.5">
              📄 外贸与单据
            </a>
            <a href="#ai" className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/25 transition-colors min-h-[44px] inline-flex items-center gap-1.5">
              ✨ AI 效率工具
            </a>
            <a href="#business" className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/25 transition-colors min-h-[44px] inline-flex items-center gap-1.5">
              💼 查询与经营
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 pb-16 relative z-10">
        {/* ===== Tool Categories ===== */}
        {categories.map((cat) => {
          const Icon = cat.icon;
          const sectionId = cat.name === "物流与地址" ? "logistics"
            : cat.name === "外贸与单据" ? "documents"
            : cat.name === "AI 效率工具" ? "ai"
            : "business";

          return (
            <div key={cat.name} id={sectionId} className="bg-white rounded-xl shadow-sm border p-5 md:p-6 mb-6">
              {/* Category header */}
              <div className="flex items-start gap-3 mb-1">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{cat.name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{cat.description}</p>
                </div>
              </div>

              {/* Tool grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-5">
                {cat.tools.map((tool) => {
                  const ToolIcon = tool.icon;
                  const isAI = cat.name === "AI 效率工具";

                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className={`flex items-start gap-3 p-4 rounded-lg border transition-all group min-h-[44px] ${
                        isAI
                          ? "border-violet-100 hover:border-violet-300 hover:bg-violet-50/50"
                          : "border-gray-100 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isAI ? "bg-violet-100" : "bg-gray-100"
                      } group-hover:bg-opacity-80 transition-colors`}>
                        <ToolIcon className={`w-4.5 h-4.5 ${
                          isAI ? "text-violet-600" : "text-gray-600 group-hover:text-blue-600"
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className={`font-semibold text-sm group-hover:text-blue-600 transition-colors ${
                            isAI ? "text-violet-700" : "text-gray-900"
                          }`}>
                            {tool.name}
                          </h3>
                          {statusBadge(tool.status)}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{tool.desc}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Users className="w-3 h-3 text-gray-300" />
                          <span className="text-[10px] text-gray-400">{tool.users}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* ===== AI 体验版统一说明 ===== */}
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-violet-800 mb-1">关于 AI 体验版</h3>
              <p className="text-sm text-violet-700 leading-relaxed">
                AI 工具当前为体验版，生成结果仅供参考，请人工核对后使用。
                游客每日可免费使用 1 次，登录后获得更多额度。正式 AI 功能即将开放。
              </p>
            </div>
          </div>
        </div>

        {/* ===== 新手引导 ===== */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100 p-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                新手不知道从哪里开始？
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                如果你是第一次来，不知道哪个工具适合你，
                可以试试我们的「场景包」—— 按你的实际需求，一站式工具包马上可用。
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/starter/amazon"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors min-h-[44px]"
                >
                  📦 亚马逊卖家
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/starter/taobao-shipping"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  🛍️ 反向海淘
                </Link>
                <Link
                  href="/starter/student"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  🎒 留学生集运
                </Link>
                <Link
                  href="/starter/student-paper"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  🎓 留学生论文
                </Link>
                <Link
                  href="/topics/overseas-essential-apps"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors min-h-[44px]"
                >
                  📱 APP 评级清单
                </Link>
                <Link
                  href="/starter"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-teal-700 rounded-lg text-sm font-medium border border-teal-200 hover:bg-teal-50 transition-colors min-h-[44px]"
                >
                  查看全部 6 个场景 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
