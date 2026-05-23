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
      <div className="flex flex-col min-h-screen w-full bg-[#F5F5F7]">
        <UserNavSidebar className="hidden md:flex w-64 flex-shrink-0" />
        <div className="flex-1 flex flex-col w-full">
          <TopBar className="flex-shrink-0" />

          <main className="w-full flex-grow p-4 md:p-6 pb-24">{children}</main>
        </div>
      </div>
    </WorkspaceProviders>
  );
}
