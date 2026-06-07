import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CompanyProfilesClient from "./company-profiles-client";

export default async function CompanyProfilesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/company-profiles");
  return <CompanyProfilesClient />;
}
