// v1.20.18.1: Admin stats as Server Component — avoids client-side fetch auth cookie issues
import { loadAdminStats } from "@/lib/admin-stats";
import AdminDashboardClient from "./admin-dashboard-client";

export default async function AdminPage() {
  const stats = await loadAdminStats();

  return <AdminDashboardClient stats={stats} />;
}
