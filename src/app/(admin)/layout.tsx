import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Shield, ArrowLeft, LayoutDashboard, Users, Settings, Bell, Activity, Database,
  ExternalLink, Upload, FolderOpen, Globe, BookOpen, LayoutTemplate, Megaphone,
  MessageSquare, BarChart3, Award, TrendingUp, FileCheck, Link2, Image as ImageIcon,
} from "lucide-react";


export const metadata: Metadata = {
  title: "管理后台",
  robots: { index: false, follow: false },
};

const navSections = [
  {
    title: "核心运营",
    items: [
      { href: "/admin", label: "总控台", icon: LayoutDashboard },
      { href: "/admin/users", label: "用户管理", icon: Users },
      { href: "/admin/feedback", label: "反馈管理", icon: MessageSquare },
      { href: "/admin/tool-reviews", label: "工具点评", icon: FileCheck },
      { href: "/admin/levels", label: "等级与勋章", icon: Award },
      { href: "/admin/growth-logs", label: "成长值流水", icon: TrendingUp },
      { href: "/admin/invites", label: "邀请码管理", icon: Shield },
    ]
  },
  {
    title: "内容与资源",
    items: [
      { href: "/admin/topics", label: "专题管理", icon: FolderOpen },
      { href: "/admin/cms", label: "文章与指南", icon: BookOpen },
      { href: "/admin/resources", label: "🌍 网址导航大厅", icon: Globe },
      { href: "/admin/links", label: "网址管理", icon: Link2 },
      { href: "/admin/destinations", label: "国家/地区 (pSEO)", icon: Globe },
      { href: "/admin/resources/import", label: "资源导入", icon: Upload },
      { href: "/admin/landing-pages", label: "落地页管理", icon: LayoutTemplate },
    ]
  },
  {
    title: "广告与数据",
    items: [
      { href: "/admin/ads", label: "广告管理", icon: ExternalLink },
      { href: "/admin/ad-placements", label: "广告位管理", icon: Megaphone },
      { href: "/admin/ad-creatives", label: "广告素材", icon: ImageIcon },
      { href: "/admin/analytics/dashboard", label: "流量分析", icon: BarChart3 },
      { href: "/admin/analytics", label: "系统分析", icon: TrendingUp },
      { href: "/admin/analytics/task-chains", label: "TaskChain Analytics", icon: TrendingUp },
      { href: "/admin/ad-entitlements", label: "广告权益", icon: Megaphone },
    ]
  },
  {
    title: "通知与消息",
    items: [
      { href: "/admin/notifications", label: "通知中心", icon: Bell },
      { href: "/admin/newsletter", label: "邮件广播", icon: MessageSquare },
    ]
  },
  {
    title: "系统与安全",
    items: [
      { href: "/admin/audit", label: "审计日志", icon: Activity },
      { href: "/admin/health", label: "系统健康", icon: Activity },
      { href: "/admin/backup", label: "数据备份", icon: Database },
      { href: "/admin/settings", label: "系统设置", icon: Settings },
    ]
  }
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?reason=no-session");
  const role = (session.user as any).role || "";
  if (!["管理员", "ADMIN", "admin"].includes(role)) {
    redirect("/dashboard?error=not-admin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 bg-slate-900 text-white min-h-[calc(100vh-3.5rem)] p-4 hidden md:block">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" /> 返回首页
          </Link>
          <div className="flex items-center gap-2 px-3 py-2 mb-4">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="font-semibold">管理后台</span>
          </div>
          <nav className="space-y-4">
            {navSections.map((section) => (
              <div key={section.title}>
                <div className="px-3 mb-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {section.title}
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6 pb-8 pb-[env(safe-area-inset-bottom)]">{children}</main>
      </div>
    </div>
  );
}
