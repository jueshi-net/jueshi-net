import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserNavSidebar } from "@/components/user/UserSidebar";
import { WorkspaceProviders } from "@/components/user/WorkspaceProviders";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <WorkspaceProviders>
      <div className="flex h-screen w-full bg-[#F5F5F7] overflow-hidden">
        {/* 左侧固定边栏 — 移动端隐藏 */}
        <UserNavSidebar className="hidden md:flex w-64 flex-shrink-0" />

        {/* 右侧主体内容区 */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <TopBar className="flex-shrink-0" />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </WorkspaceProviders>
  );
}

function TopBar({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
        <div className="px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600 transition-colors">首页</a>
            <span className="text-gray-300">›</span>
            <span className="text-gray-700 font-medium">工作台</span>
          </div>
          <span className="md:hidden text-sm font-bold text-gray-900 tracking-tight">工作台</span>
          <div className="w-8" />
        </div>
      </div>
    </div>
  );
}
