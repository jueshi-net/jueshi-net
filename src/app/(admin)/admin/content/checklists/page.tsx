// Server Component: loads checklists from DB directly
import { prisma } from "@/lib/prisma";
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
  return <ChecklistsListClient checklists={serialized} />;
}
