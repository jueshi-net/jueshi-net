import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WorkspaceProviders } from "@/components/user/WorkspaceProviders";
import WorkspaceMobileNav from "@/components/workspace/WorkspaceMobileNav";
import { UserNavSidebar } from "@/components/user/UserSidebar";
import TopBar from "./topbar";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/workspace");
  }

  return (
    <WorkspaceProviders>
      <div className="flex min-h-screen bg-[#F6F8FC] overflow-x-hidden">
        <UserNavSidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto md:pb-0 pb-16">{children}</main>
        </div>
        <WorkspaceMobileNav />
      </div>
    </WorkspaceProviders>
  );
}
