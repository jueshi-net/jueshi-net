// Server Component: loads topic data from DB, passes to client editor
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TopicEditorClient from "./topic-editor-client";

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

  // Serialize dates for client component
  const serialized = JSON.parse(JSON.stringify(topic));
  return <TopicEditorClient topic={serialized} />;
}
