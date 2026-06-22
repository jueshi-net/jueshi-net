import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  try {
    const authRes = await requireAdmin();
    if (authRes instanceof NextResponse) return authRes;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [postCount, commentCount, pendingPosts, pendingComments, reportCount, todayPosts, todayComments] = await Promise.all([
      prisma.forumPost.count(),
      prisma.forumComment.count(),
      prisma.forumPost.count({ where: { status: "pending" } }),
      prisma.forumComment.count({ where: { status: "pending" } }),
      prisma.forumReport.count({ where: { status: "pending" } }),
      prisma.forumPost.count({ where: { createdAt: { gte: today } } }),
      prisma.forumComment.count({ where: { createdAt: { gte: today } } }),
    ]);

    return NextResponse.json({
      postCount, commentCount, pendingPosts, pendingComments, reportCount, todayPosts, todayComments,
    });
  } catch (error) {
    console.error("[Admin Community Stats Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
