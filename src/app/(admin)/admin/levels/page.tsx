// Server Component — levels management only. Badges moved to /admin/community/badges.
import { prisma } from "@/lib/prisma";
import LevelsClient from "./levels-client";

export const dynamic = 'force-dynamic';

export default async function AdminLevelsPage() {
  let levels = [];
  try {
    levels = await prisma.userLevel.findMany({ orderBy: { sortOrder: "asc" } });
  } catch (error) {
    console.error('Failed to fetch user levels:', error);
  }
  return <LevelsClient initialLevels={levels} />;
}
