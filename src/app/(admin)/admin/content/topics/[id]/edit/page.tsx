// Server Component: loads topic by id from DB, passes to client editor
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TopicEditClient from "./topic-edit-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "编辑专题 — 管理后台",
  robots: { index: false, follow: false },
};

export default async function TopicEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      sections: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!topic) notFound();

  // Serialize dates/JSON for client component
  const serialized = JSON.parse(JSON.stringify(topic));
  return <TopicEditClient topic={serialized} />;
}
