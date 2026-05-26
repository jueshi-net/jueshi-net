// Server Component — loads levels + badges from DB directly
import { prisma } from "@/lib/prisma";
import LevelsClient from "./levels-client";

export default async function AdminLevelsPage() {
  const [levels, badges] = await Promise.all([
    prisma.userLevel.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.userBadge.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return <LevelsClient initialLevels={levels} initialBadges={badges} />;
}
