"use client";

import Link from "next/link";
import { FileText, Heart, Building2, Target, ArrowRight, Sparkles } from "lucide-react";

export default function WorkspaceClient({ user, draftCount, favCount, profileCount }: { user: any; draftCount: number; favCount: number; profileCount: number }) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">欢迎回来，{user.name || user.email || '用户'} 👋</h1>
        <p className="text-teal-100 text-sm">管理你的单据、收藏、公司资料与成长任务。</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="我的单据" value={draftCount} href="/workspace/documents" color="teal" />
        <StatCard icon={Heart} label="我的收藏" value={favCount} href="/workspace/favorites" color="rose" />
        <StatCard icon={Building2} label="公司资料" value={profileCount} href="/workspace/company-profiles" color="blue" />
        <StatCard icon={Target} label="待办任务" value="—" href="/workspace/tasks" color="amber" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> 快速入口</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/tools" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-teal-50 hover:border-teal-200 transition-all min-h-[48px]">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center"><ArrowRight className="w-4 h-4 text-teal-600" /></div>
            <span className="text-sm font-medium">去工具中心</span>
          </Link>
          <Link href="/workspace/company-profiles" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all min-h-[48px]">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><Building2 className="w-4 h-4 text-blue-600" /></div>
            <span className="text-sm font-medium">创建公司资料</span>
          </Link>
          <Link href="/workspace/documents" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-purple-50 hover:border-purple-200 transition-all min-h-[48px]">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center"><FileText className="w-4 h-4 text-purple-600" /></div>
            <span className="text-sm font-medium">查看我的单据</span>
          </Link>
          <Link href="/workspace/member" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-amber-50 hover:border-amber-200 transition-all min-h-[48px]">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center"><Target className="w-4 h-4 text-amber-600" /></div>
            <span className="text-sm font-medium">查看会员权益</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, href, color }: { icon: any; label: string; value: string | number; href: string; color: string }) {
  const colors: Record<string, string> = {
    teal: "bg-teal-50 text-teal-600 border-teal-100 hover:border-teal-200 hover:bg-teal-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-200 hover:bg-rose-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-200 hover:bg-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-200 hover:bg-amber-100",
  };
  return (
    <Link href={href} className={`p-4 rounded-xl border transition-all cursor-pointer ${colors[color] || colors.teal}`}>
      <Icon className="w-5 h-5 mb-2" />
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </Link>
  );
}
