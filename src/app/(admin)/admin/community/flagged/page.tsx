import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminReportsManager } from "./reports-client";

export const dynamic = "force-dynamic";

export default async function AdminCommunityReportsPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/login");

  const reports = await prisma.forumReport.findMany({
    where: { status: "pending" },
    include: {
      reporter: { select: { name: true, email: true } },
      post: { select: { title: true, slug: true, content: true, userId: true } },
      comment: { select: { content: true, userId: true, postId: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <AdminReportsManager
      reports={reports.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        reporter: { name: r.reporter.name, email: r.reporter.email },
        post: r.post ? { title: r.post.title, slug: r.post.slug, content: r.post.content.slice(0, 200) } : null,
        comment: r.comment ? { content: r.comment.content.slice(0, 200) } : null,
      }))}
    />
  );
}
