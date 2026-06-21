// Server Component: loads guides from DB directly
import { prisma } from "@/lib/prisma";
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
  return <GuidesListClient guides={serialized} />;
}
