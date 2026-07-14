// Server Component: loads guides from DB directly
import { prisma } from "@/lib/prisma";
import { BookOpen } from "lucide-react";
import AdminPageFrame from "@/components/templates/AdminPageFrame";
import GuidesListClient from "./guides-list-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "指南管理 — 管理后台",
  robots: { index: false, follow: false },
};

export default async function AdminGuidesPage() {
  const guides = await prisma.guide.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, slug: true, title: true, summary: true, category: true,
      tags: true, status: true, sortOrder: true, publishedAt: true,
      createdAt: true, updatedAt: true,
    },
  });

  // Serialize dates for client component
  const serialized = JSON.parse(JSON.stringify(guides));
  return (
    <AdminPageFrame
      title="指南管理"
      description="管理内容指南和分类"
      icon={<BookOpen className="w-5 h-5" />}
      variant="table"
    >
      <GuidesListClient guides={serialized} />
    </AdminPageFrame>
  );
}
