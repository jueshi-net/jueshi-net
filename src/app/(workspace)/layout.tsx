import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserNavSidebar } from "@/components/user/UserSidebar";
import { WorkspaceProviders } from "@/components/user/WorkspaceProviders";
import TopBar from "./topbar";

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
