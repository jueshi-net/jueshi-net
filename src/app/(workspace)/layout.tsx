import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserNavSidebar } from "@/components/user/UserSidebar";

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
    <div className="min-h-screen bg-[#F5F5F7]">
      <UserNavSidebar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-5 lg:ml-0">{children}</main>
    </div>
  );
}
