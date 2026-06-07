import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WorkspaceClient from "./workspace-client";

export default async function WorkspacePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace");

  // Fetch summary data
  const [draftCount, favCount, profileCount] = await Promise.all([
    prisma.toolDocumentDraft.count({ where: { userId: session.user.id } }).catch(() => 0),
    prisma.userFavorite.count({ where: { userId: session.user.id } }).catch(() => 0),
    prisma.userCompanyProfile.count({ where: { userId: session.user.id } }).catch(() => 0),
  ]);

  return <WorkspaceClient user={session.user} draftCount={draftCount} favCount={favCount} profileCount={profileCount} />;
}
