// Server Component: loads guide by id from DB, passes to client editor
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import GuideEditClient from "./guide-edit-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "编辑指南 — 管理后台",
  robots: { index: false, follow: false },
};

export default async function GuideEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const guide = await prisma.guide.findUnique({ where: { id } });

  if (!guide) notFound();

  // Serialize dates for client component
  const serialized = JSON.parse(JSON.stringify(guide));
  return <GuideEditClient guide={serialized} />;
}
