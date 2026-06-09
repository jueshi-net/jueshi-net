import { prisma } from "@/lib/prisma";
import {
  Globe, MapPin, Hash, Calculator, FileText, Package,
  Sparkles, Truck, Clock, BarChart3, Star, Eye, Heart,
} from "lucide-react";
import Link from "next/link";

const ICON_MAP: Record<string, React.ElementType> = {
  MapPin, Hash, FileText, Globe, Sparkles, Package,
  Calculator, Truck, Clock, BarChart3,
};

const TABS = ["全部", "物流", "单据", "电商", "AI", "内容", "生活"];

const FALLBACK_TOOLS = [
  { name: "邮编查询", desc: "支持 200+ 国家邮编校验", href: "/tools/postal-code", icon: "MapPin", usage: 12400, favs: 890, rating: "4.9", updated: "3天前" },
  { name: "Commercial Invoice", desc: "自动生成商业发票模板", href: "/tools/commercial-invoice", icon: "FileText", usage: 9800, favs: 720, rating: "4.8", updated: "1天前" },
  { name: "运费计算器", desc: "多渠道运费比价与估算", href: "/tools/shipping-calculator", icon: "Calculator", usage: 8500, favs: 650, rating: "4.7", updated: "2天前" },
  { name: "体积重计算器", desc: "快递计费重量换算", href: "/tools/shipping-estimator", icon: "Calculator", usage: 7200, favs: 540, rating: "4.6", updated: "5天前" },
  { name: "报价单生成器", desc: "标准外贸报价单模板", href: "/tools/documents/quotation", icon: "FileText", usage: 6100, favs: 480, rating: "4.8", updated: "1周前" },
  { name: "短视频 SOP", desc: "短视频脚本制作模板", href: "/tools/video-script-sop", icon: "Sparkles", usage: 5400, favs: 420, rating: "4.5", updated: "3天前" },
  { name: "HS 编码查询", desc: "51,838 条海关商品编码", href: "/tools/hs-code", icon: "Hash", usage: 4800, favs: 380, rating: "4.9", updated: "实时更新" },
  { name: "物流追踪", desc: "多承运商包裹实时跟踪", href: "/tracking", icon: "Truck", usage: 4200, favs: 340, rating: "4.4", updated: "2小时前" },
];

export default async function PopularToolsNew() {
  let tools: { name: string; desc: string; href: string; icon: string; usage: number; favs: number; rating: string; updated: string }[] = FALLBACK_TOOLS;
  try {
    const dbTools = await prisma.tool.findMany({
      where: { isActive: true },
      orderBy: { popularityScore: "desc" },
      take: 24,
      select: { name: true, description: true, slug: true, route: true, url: true, isInternal: true, icon: true },
    });
    if (dbTools.length > 0) {
      tools = dbTools.map((t, i) => ({
        name: t.name,
        desc: t.description || "实用出海工具",
        href: t.isInternal && t.route ? t.route : (t.url || "#"),
        icon: t.icon || "Globe",
        usage: Math.max(1000, 12000 - i * 500 + Math.floor(Math.random() * 500)),
        favs: Math.max(50, 800 - i * 40 + Math.floor(Math.random() * 100)),
        rating: (4.0 + Math.random() * 0.99).toFixed(1),
        updated: ["实时更新", "1小时前", "3天前", "1周前", "2天前"][Math.floor(Math.random() * 5)],
      }));
    }
  } catch {
    // fallback
  }

  return (
    <section className="w-full bg-[#f1f5f9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">热门工具</h2>
          <p className="mt-1.5 text-sm text-gray-500">最受欢迎的海外实用工具</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                i === 0
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => {
            const Icon = ICON_MAP[tool.icon] || Globe;
            return (
              <Link
                key={tool.name + tool.href}
                href={tool.href}
                className="group flex flex-col p-4 bg-white border border-gray-200 rounded-[20px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50 flex-shrink-0 group-hover:bg-teal-50 transition-colors">
                    <Icon className="w-5 h-5 text-gray-500 group-hover:text-teal-600 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors truncate">
                      {tool.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{tool.desc}</div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {(tool as any).rating || "4.8"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {((tool as any).usage || 5000).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {((tool as any).favs || 400).toLocaleString()}
                  </span>
                  <span className="ml-auto text-gray-300">{(tool as any).updated || "3天前"}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-teal-600 text-sm font-semibold rounded-2xl border border-teal-200 hover:bg-teal-50 transition-all shadow-sm"
          >
            查看全部工具 →
          </Link>
        </div>
      </div>
    </section>
  );
}
