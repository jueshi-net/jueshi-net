import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/permissions";
import { listAdminNotifications } from "@/lib/notifications";
import NotificationsAdminClient from "./notifications-admin-client";

export const metadata: Metadata = {
  title: "通知管理",
  robots: { index: false, follow: false },
};

export default async function NotificationsAdminPage(props: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    email?: string;
    type?: string;
    unreadOnly?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const adminError = await requireAdmin();
  if ("error" in adminError) redirect("/dashboard");

  const sp = await props.searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(sp.pageSize || "20", 10)));

  const result = await listAdminNotifications({
    page,
    pageSize,
    email: sp.email || undefined,
    type: sp.type || undefined,
    unreadOnly: sp.unreadOnly === "true",
  });

  return (
    <NotificationsAdminClient
      initialResult={result}
      initialFilters={{
        email: sp.email || "",
        type: sp.type || "",
        unreadOnly: sp.unreadOnly === "true",
      }}
    />
  );
}
