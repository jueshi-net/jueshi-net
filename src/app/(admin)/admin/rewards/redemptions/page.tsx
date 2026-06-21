import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminRedemptionsClient from "./admin-redemptions-client";

export default async function AdminRedemptionsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  return <AdminRedemptionsClient />;
}
