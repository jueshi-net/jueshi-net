import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { adjustHonor, incrementCommunityStat } from "@/lib/honor-helpers";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authRes = await requireAdmin();
    if (authRes instanceof NextResponse) return authRes;
    const { session } = authRes;
    const { id } = await params;
    const body = await request.json();
    const { resolution } = body; // "action_taken" or "no_action"

    const report = await prisma.forumReport.findUnique({ where: { id } });
    if (!report) return NextResponse.json({ error: "举报不存在" }, { status: 404 });
    if (report.status !== "pending") return NextResponse.json({ error: "举报已处理" }, { status: 400 });

    await prisma.forumReport.update({
      where: { id },
      data: {
        status: "resolved",
        resolvedBy: session.user.id,
        resolvedAt: new Date(),
        resolution,
      },
    });

    if (resolution === "action_taken") {
      // Award reporter +5 honor for valid report
      await adjustHonor(report.reporterId, 5, "有效举报", "report_accepted", report.id, session.user.id).catch(() => {});
      await incrementCommunityStat(report.reporterId, "reportAcceptedCount").catch(() => {});

      // Penalize reported user -10 honor
      if (report.postId) {
        const post = await prisma.forumPost.findUnique({ where: { id: report.postId } });
        if (post) {
          await adjustHonor(post.userId, -10, "举报成立", "violation", report.id, session.user.id).catch(() => {});
          await incrementCommunityStat(post.userId, "violationCount").catch(() => {});
        }
      } else if (report.commentId) {
        const comment = await prisma.forumComment.findUnique({ where: { id: report.commentId } });
        if (comment) {
          await adjustHonor(comment.userId, -10, "举报成立", "violation", report.id, session.user.id).catch(() => {});
          await incrementCommunityStat(comment.userId, "violationCount").catch(() => {});
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Report Resolve Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
