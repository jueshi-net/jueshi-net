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
      {/* 强制 100dvh 物理高度，防止高度坍塌 */}
      <div className="flex h-[100dvh] w-full bg-[#F5F5F7] overflow-hidden">
        <UserNavSidebar className="hidden md:flex w-64 flex-shrink-0" />
        <div className="flex flex-col flex-1 w-full h-full overflow-hidden">
          <TopBar className="flex-shrink-0" />
          <main className="w-full flex-1 overflow-y-auto p-4 md:p-6 pb-24">{children}</main>
        </div>
      </div>
    </WorkspaceProviders>
  );
}
