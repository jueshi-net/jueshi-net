import { prisma } from "@/lib/prisma";
import {
  Globe, MapPin, Hash, Calculator, FileText, Package,
  Sparkles, Truck, Clock, BarChart3, Star, Eye, Heart,
} from "lucide-react";
import Link from "next/link";
import { getHomepageConfig } from "@/lib/homepage-config";

const ICON_MAP: Record<string, React.ElementType> = {
  MapPin, Hash, FileText, Globe, Sparkles, Package,
  Calculator, Truck, Clock, BarChart3,
};

const TABS = ["全部", "物流", "单据", "电商", "AI", "内容", "生活"];

export default async function PopularToolsDynamic() {
  const config = await getHomepageConfig();
  let tools: { id: string; name: string; desc: string; href: string; icon: string; usage: number; favs: number; updated: string; isNew: boolean }[] = [];

  try {
    const dbTools = await prisma.tool.findMany({
      where: { isActive: true },
      select: { id: true, name: true, description: true, slug: true, route: true, url: true, isInternal: true, icon: true, popularityScore: true, updatedAt: true },
      orderBy: { popularityScore: "desc" },
      take: config.tools.maxDisplay || 16,
    });

    if (dbTools.length > 0) {
      tools = dbTools.map((t) => {
        const score = t.popularityScore || 0;
        const usage = Math.max(0, score);
        const favs = Math.floor(score * 0.1);
        const daysAgo = Math.floor((Date.now() - t.updatedAt.getTime()) / 86400000);
        const updated = daysAgo === 0 ? "今天" : `${daysAgo}天前`;
        const isNew = daysAgo <= 3;

        return {
          id: t.id,
          name: t.name,
          desc: t.description || "实用出海工具",
          href: t.isInternal && t.route ? t.route : (t.url || "#"),
          icon: t.icon || "Globe",
          usage,
          favs,
          updated,
          isNew,
        };
      });
    }
  } catch (err) {
    console.error("[PopularTools] DB error:", err);
  }

  if (tools.length === 0) return null;

  return (
    <section className="w-full bg-[#f1f5f9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
            🔥 本周热门工具
          </h2>
          <p className="mt-1.5 text-sm text-gray-500">基于真实使用数据排序</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {TABS.map((tab, i) => (
            <button key={tab} className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${i === 0 ? "bg-teal-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-600"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => {
            const Icon = ICON_MAP[tool.icon] || Globe;
            return (
              <Link key={tool.id} href={tool.href} className="group flex flex-col p-4 bg-white border border-gray-200 rounded-[20px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50 flex-shrink-0 group-hover:bg-teal-50 transition-colors relative">
                    <Icon className="w-5 h-5 text-gray-500 group-hover:text-teal-600 transition-colors" />
                    {tool.isNew && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors truncate">{tool.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{tool.desc}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                  {tool.usage > 0 ? (
                    <>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{tool.usage.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{tool.favs.toLocaleString()}</span>
                    </>
                  ) : <span className="text-teal-600 font-medium">新上线</span>}
                  <span className="ml-auto text-gray-300">{tool.updated}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link href="/tools" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-teal-600 text-sm font-semibold rounded-2xl border border-teal-200 hover:bg-teal-50 transition-all shadow-sm">
            查看全部工具 →
          </Link>
        </div>
      </div>
    </section>
  );
}
