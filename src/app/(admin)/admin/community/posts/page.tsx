import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPostsManager } from "./posts-client";

export const dynamic = "force-dynamic";

export default async function AdminCommunityPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/login");

  const { status } = await searchParams;

  const posts = await prisma.forumPost.findMany({
    where: status ? { status } : {},
    include: {
      user: { select: { name: true, email: true, image: true } },
      category: true,
      _count: { select: { comments: true, reports: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <AdminPostsManager
      posts={posts.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        user: { name: p.user.name, email: p.user.email, image: p.user.image },
        category: { name: p.category.name, key: p.category.key },
      }))}
      currentStatus={status || ""}
    />
  );
}
