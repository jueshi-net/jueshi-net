import { redirect } from "next/navigation";

// v1.39.0: Legacy /dashboard now redirects to unified /workspace
export default function DashboardRedirect() {
  redirect("/workspace");
}
