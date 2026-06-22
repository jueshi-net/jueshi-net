import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/forum/stats
// 社区公开统计（无需登录），仅返回聚合计数，不泄露任何用户隐私
export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalPosts, totalComments, totalUsers, todayPosts, pendingReports] =
      await Promise.all([
        prisma.forumPost.count({ where: { status: "published" } }),
        prisma.forumComment.count({ where: { status: "published" } }),
        prisma.user.count(),
        prisma.forumPost.count({
          where: { status: "published", createdAt: { gte: todayStart } },
        }),
        prisma.forumReport.count({ where: { status: "pending" } }),
      ]);

    return NextResponse.json({
      totalPosts,
      totalComments,
      totalUsers,
      todayPosts,
      pendingReports,
    });
  } catch (error) {
    console.error("[Forum Stats Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
