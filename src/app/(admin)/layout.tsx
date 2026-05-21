import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowLeft, LayoutDashboard, Users, Settings, Bell, Activity, Database, ExternalLink } from "lucide-react";


export const metadata: Metadata = {
  title: "管理后台",
  robots: { index: false, follow: false },
};

const navItems = [
  { href: "/admin", label: "总控台", icon: LayoutDashboard },
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/ads", label: "广告管理", icon: ExternalLink },
  { href: "/admin/invites", label: "邀请码管理", icon: Shield },
  { href: "/admin/notifications", label: "通知中心", icon: Bell },
  { href: "/admin/health", label: "系统健康", icon: Activity },
  { href: "/admin/backup", label: "数据备份", icon: Database },
  { href: "/admin/settings", label: "系统设置", icon: Settings },
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
        <main className="flex-1 p-4 md:p-6 pb-8 pb-[env(safe-area-inset-bottom)]">{children}</main>
      </div>
    </div>
  );
}
