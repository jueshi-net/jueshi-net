import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MemberClient from "./member-client";

export default async function MemberPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/member");

  const [user, permissions] = await Promise.allSettled([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, memberUntil: true, growthValue: true, levelKey: true, points: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, memberUntil: true },
    }).then(async (u) => {
      const isMember = u?.role === 'member';
      const canUploadLogo = isMember;
      const canCloudDraft = isMember;
      const canExportWord = isMember;
      const canRemoveBranding = isMember;
      const companyProfilesMax = isMember ? 10 : 1;
      const maxDrafts = isMember ? 100 : 10;
      return {
        role: u?.role || "user",
        limits: {
          memoMax: isMember ? 50 : 10,
          companyProfilesMax,
          labelBatchMax: isMember ? 20 : 5,
          maxDrafts,
          canUploadLogo,
          canUseCustomStyle: isMember,
          canRemoveBranding,
          canCloudDraft,
          canExportWord,
          wordExportDailyLimit: isMember ? 50 : 0,
        },
        isMember,
        memberUntil: u?.memberUntil,
        points: 0,
      };
    }),
  ]);

  const userData = user.status === "fulfilled" ? user.value : null;
  const perms = permissions.status === "fulfilled" ? permissions.value : null;

  return <MemberClient userData={userData} permissions={perms} />;
}
