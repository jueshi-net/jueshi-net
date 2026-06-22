import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminCommentsManager } from "./comments-client";

export const dynamic = "force-dynamic";

export default async function AdminCommunityCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/login");

  const { status } = await searchParams;

  const comments = await prisma.forumComment.findMany({
    where: status ? { status } : {},
    include: {
      user: { select: { name: true, email: true } },
      post: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <AdminCommentsManager
      comments={comments.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        user: { name: c.user.name, email: c.user.email },
        post: { title: c.post.title, slug: c.post.slug },
      }))}
      currentStatus={status || ""}
    />
  );
}
