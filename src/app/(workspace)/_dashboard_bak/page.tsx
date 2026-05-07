import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calculator, Receipt, FileText, StickyNote, DollarSign, Search, Container, BarChart3, Link2, Star, TrendingUp, Package } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: session.user.id },
    include: {
      links: { take: 20, orderBy: [{ sortOrder: "asc" }] },
    },
  });

  const [favCount, totalClicks, memoCount] = await Promise.all([
    prisma.favorite.count({ where: { userId: session.user.id } }),
    prisma.linkItem.aggregate({ where: { workspaceId: workspace?.id || "" }, _sum: { clicks: true } }),
    prisma.memo.count({ where: { userId: session.user.id } }),
  ]);

  const quickTools = [
    { name: "体积计算", desc: "材积重", icon: Calculator, href: "/tools/calculator", color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
    { name: "汇率查询", desc: "实时汇率", icon: DollarSign, href: "/tools/exchange-rate", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    { name: "收据", desc: "收款凭证", icon: Receipt, href: "/tools/receipt", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
    { name: "发票", desc: "形式发票", icon: FileText, href: "/tools/invoice", color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" },
    { name: "备忘录", desc: "云笔记", icon: StickyNote, href: "/tools/memo", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
    { name: "物流查询", desc: "快递追踪", icon: Search, href: "/search", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
    { name: "集装箱", desc: "装箱计算", icon: Container, href: "/tools/container", color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" },
    { name: "物流追踪", desc: "实时追踪", icon: Package, href: "/tracking", color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          你好，{session?.user?.name || "用户"} 👋
        </h1>
        <p className="text-blue-100 mt-1">
          {workspace?.name || "我的工作台"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "收藏链接", value: favCount, icon: Star, color: "text-yellow-500" },
          { label: "备忘录", value: memoCount, icon: StickyNote, color: "text-orange-500" },
          { label: "总点击", value: totalClicks._sum.clicks || 0, icon: TrendingUp, color: "text-green-500" },
          { label: "我的链接", value: workspace?.links?.length || 0, icon: Link2, color: "text-blue-500" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Tools */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">快捷工具</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {quickTools.map((tool) => (
            <Link key={tool.name} href={tool.href} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all group">
              <div className={`w-10 h-10 ${tool.color} rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
                <tool.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{tool.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Workspace Links */}
      {workspace?.links && workspace.links.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">我的链接</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {workspace.links.map((link) => (
              <Link key={link.id} href={link.url} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all group">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">{link.title}</h3>
                {link.description && <p className="text-xs text-gray-400 mt-1 truncate">{link.description}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!workspace?.links?.length && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center text-gray-400">
          <p>还没有添加自定义链接</p>
          <Link href="/my-links" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            前往添加 →
          </Link>
        </div>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';
