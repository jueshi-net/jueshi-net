import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminCommunityDashboard } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminCommunityPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [postCount, commentCount, pendingPosts, pendingComments, reportCount, todayPosts, todayComments, userCount] = await Promise.all([
    prisma.forumPost.count(),
    prisma.forumComment.count(),
    prisma.forumPost.count({ where: { status: "pending" } }),
    prisma.forumComment.count({ where: { status: "pending" } }),
    prisma.forumReport.count({ where: { status: "pending" } }),
    prisma.forumPost.count({ where: { createdAt: { gte: today } } }),
    prisma.forumComment.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count(),
  ]);

  return (
    <AdminCommunityDashboard
      stats={{ postCount, commentCount, pendingPosts, pendingComments, reportCount, todayPosts, todayComments, userCount }}
    />
  );
}
