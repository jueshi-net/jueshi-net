import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowLeft, LayoutDashboard, Link2, FileText, Megaphone, Users, FolderOpen, Settings, Bell, Tags, ClipboardList, Link as LinkIcon, Activity, Import, MessageSquare, TrendingUp, HeartPulse, Mail, Database, Webhook, Star, Award, MessageCircle } from "lucide-react";


export const metadata: Metadata = {
  title: "管理后台",
  robots: { index: false, follow: false },
};

const navItems = [
  { href: "/admin", label: "管理面板", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "系统分析", icon: TrendingUp },
  { href: "/admin/links", label: "链接管理", icon: Link2 },
  { href: "/admin/link-health", label: "链接健康", icon: HeartPulse },
  { href: "/admin/categories", label: "分类管理", icon: FolderOpen },
  { href: "/admin/tags", label: "标签管理", icon: Tags },
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/cms", label: "文章管理", icon: FileText },
  { href: "/admin/ads", label: "广告管理", icon: Megaphone },
  { href: "/admin/topics", label: "专题管理", icon: FileText },
  { href: "/admin/levels", label: "等级勋章", icon: Star },
  { href: "/admin/short-links", label: "短链管理", icon: LinkIcon },
  { href: "/admin/feedback", label: "反馈管理", icon: MessageSquare },
  { href: "/admin/newsletter", label: "邮件广播", icon: Mail },
  { href: "/admin/webhooks", label: "Webhook 管理", icon: Webhook },
  { href: "/admin/import", label: "数据导入", icon: Import },
  { href: "/admin/import-bookmarks", label: "书签导入", icon: Import },
  { href: "/admin/backup", label: "数据备份", icon: Database },
  { href: "/admin/audit", label: "审计日志", icon: ClipboardList },
  { href: "/admin/health", label: "系统健康", icon: Activity },
  { href: "/admin/settings", label: "系统设置", icon: Settings },
  { href: "/admin/tool-reviews", label: "短评审核", icon: MessageSquare },
  { href: "/admin/forum", label: "论坛管理", icon: MessageCircle },
  { href: "/admin/growth-logs", label: "成长日志", icon: TrendingUp },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "admin") {
    redirect("/dashboard");
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
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
