// Server Component: loads checklists from DB directly
import { prisma } from "@/lib/prisma";
import { ListChecks } from "lucide-react";
import AdminPageFrame from "@/components/templates/AdminPageFrame";
import ChecklistsListClient from "./checklists-list-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "清单管理 — 管理后台",
  robots: { index: false, follow: false },
};

export default async function AdminChecklistsPage() {
  const checklists = await prisma.checklist.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, slug: true, title: true, summary: true, steps: true,
      status: true, sortOrder: true, publishedAt: true,
      createdAt: true, updatedAt: true,
    },
  });

  // Serialize dates/JSON for client component
  const serialized = JSON.parse(JSON.stringify(checklists));
  return (
    <AdminPageFrame
      title="清单管理"
      description="管理内容清单和步骤"
      icon={<ListChecks className="w-5 h-5" />}
      variant="table"
    >
      <ChecklistsListClient checklists={serialized} />
    </AdminPageFrame>
  );
}
