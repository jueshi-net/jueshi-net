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

  // v1.20.42.18.6.11.3: Use memberUntil date for membership, NOT role=member
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, memberUntil: true },
  }).catch(() => null);
  
  const isMember = Boolean(user?.memberUntil && new Date(user.memberUntil) > new Date());

  return <CompanyProfilesClient profiles={profiles} isMember={isMember} />;
}
