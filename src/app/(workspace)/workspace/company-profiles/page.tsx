import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CompanyProfilesClient from "./company-profiles-client";

export default async function CompanyProfilesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/company-profiles");

  const profiles = await prisma.userCompanyProfile.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  }).catch(() => []);

  const isMember = session.user.role === "member";

  return <CompanyProfilesClient profiles={profiles} isMember={isMember} />;
}
