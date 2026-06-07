import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-lg text-gray-900">运营后台</span>
        <div className="flex gap-4 text-sm">
          <Link href="/admin/homepage" className="text-gray-600 hover:text-teal-600">首页配置</Link>
          <Link href="/admin/analytics/home" className="text-gray-600 hover:text-teal-600">数据分析</Link>
          <Link href="/" className="text-gray-600 hover:text-teal-600">返回前台</Link>
        </div>
      </nav>
      <main className="p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
