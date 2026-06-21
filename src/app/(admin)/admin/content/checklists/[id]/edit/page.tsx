// Server Component: loads checklist by id from DB, passes to client editor
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ChecklistEditClient from "./checklist-edit-client";

export const metadata = {
  title: "编辑清单 — 管理后台",
  robots: { index: false, follow: false },
};

export default async function ChecklistEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const checklist = await prisma.checklist.findUnique({ where: { id } });

  if (!checklist) notFound();

  // Serialize dates/JSON for client component
  const serialized = JSON.parse(JSON.stringify(checklist));
  return <ChecklistEditClient checklist={serialized} />;
}
