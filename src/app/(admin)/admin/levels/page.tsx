// Server Component — levels management only. Badges moved to /admin/community/badges.
import { prisma } from "@/lib/prisma";
import LevelsClient from "./levels-client";

export default async function AdminLevelsPage() {
  const levels = await prisma.userLevel.findMany({ orderBy: { sortOrder: "asc" } });
  return <LevelsClient initialLevels={levels} />;
}
