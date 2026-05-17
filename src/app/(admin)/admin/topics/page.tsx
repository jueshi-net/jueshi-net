// Server Component: loads topics from DB directly — no client fetch needed
import { prisma } from "@/lib/prisma";
import TopicsListClient from "./topics-list-client";

export default async function AdminTopicsPage() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, slug: true, title: true, subtitle: true,
      status: true, templateType: true, coverEmoji: true,
      youtubeUrl: true, youtubeVideoId: true, publishedAt: true,
      createdAt: true, updatedAt: true,
      _count: { select: { items: true, sections: true } },
    },
  });

  // Serialize dates for client component
  const serialized = JSON.parse(JSON.stringify(topics));
  return <TopicsListClient topics={serialized} />;
}
