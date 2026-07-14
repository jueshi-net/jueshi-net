// Server Component — levels management only. Badges moved to /admin/community/badges.
import { prisma } from "@/lib/prisma";
import { Award } from "lucide-react";
import AdminPageFrame from "@/components/templates/AdminPageFrame";
import LevelsClient from "./levels-client";

export const dynamic = 'force-dynamic';

export default async function AdminLevelsPage() {
  let levels = [];
  try {
    levels = await prisma.userLevel.findMany({ orderBy: { sortOrder: "asc" } });
  } catch (error) {
    console.error('Failed to fetch user levels:', error);
  }
  return (
    <AdminPageFrame
      title="会员等级管理"
      description="管理用户等级体系和成长值规则"
      icon={<Award className="w-5 h-5" />}
      variant="table"
    >
      <LevelsClient initialLevels={levels} />
    </AdminPageFrame>
  );
}
