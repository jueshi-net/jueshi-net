// GET /api/forum/admin/reports - 管理员举报列表
// POST /api/forum/admin/reports - 处理举报（resolve/dismiss）

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { adjustHonor, incrementCommunityStat } from "@/lib/honor-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

    const validStatuses = ["pending", "investigating", "resolved", "dismissed", "all"];
    const filterStatus = validStatuses.includes(status) ? status : "pending";
    const filterWhere = filterStatus === "all" ? {} : { status: filterStatus };

    const [reports, total] = await Promise.all([
      prisma.forumReport.findMany({
        where: filterWhere,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          reporter: { select: { id: true, name: true, email: true } },
          post: {
            select: {
              id: true,
              slug: true,
              title: true,
              content: true,
              status: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
          comment: {
            select: {
              id: true,
              content: true,
              status: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      prisma.forumReport.count({ where: filterWhere }),
    ]);

    return NextResponse.json({ reports, total, page, pageSize });
  } catch (error) {
    console.error("[Admin Reports GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// POST /api/forum/admin/reports - 处理举报
// body: { reportId: string, action: "investigate" | "resolve" | "dismiss", resolution: string }
export async function POST(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;
    const { session } = adminResult;
    const adminId = session.user.id;

    const body = await request.json();
    const { reportId, action, resolution } = body as {
      reportId: string;
      action: "investigate" | "resolve" | "dismiss";
      resolution?: string;
    };

    if (!reportId || typeof reportId !== "string") {
      return NextResponse.json({ error: "缺少 reportId" }, { status: 400 });
    }

    if (!action || !["investigate", "resolve", "dismiss"].includes(action)) {
      return NextResponse.json({ error: "无效的操作" }, { status: 400 });
    }

    // resolve and dismiss require a resolution reason
    if ((action === "resolve" || action === "dismiss") && (!resolution || resolution.trim().length < 2)) {
      return NextResponse.json({ error: "处理结果至少 2 个字符" }, { status: 400 });
    }

    const report = await prisma.forumReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "举报不存在" }, { status: 404 });
    }

    // Cannot re-process already resolved/dismissed reports
    if (report.status === "resolved" || report.status === "dismissed") {
      return NextResponse.json({ error: "该举报已处理，不能重复处理" }, { status: 409 });
    }

    // investigate can only be applied to pending reports
    if (action === "investigate" && report.status !== "pending") {
      return NextResponse.json({ error: "只能对待处理举报进行受理" }, { status: 400 });
    }

    if (action === "investigate") {
      // Mark as investigating
      await prisma.forumReport.update({
        where: { id: reportId },
        data: { status: "investigating" },
      });

      // Log the investigation
      await prisma.moderationLog.create({
        data: {
          adminId,
          action: "investigate_report",
          postId: report.postId,
          commentId: report.commentId,
          reason: "开始受理举报",
        },
      });

      return NextResponse.json({ success: true, action });
    }

    // resolve or dismiss
    const newStatus = action === "resolve" ? "resolved" : "dismissed";
    const trimmedResolution = resolution!.trim();

    await prisma.$transaction(async (tx) => {
      await tx.forumReport.update({
        where: { id: reportId },
        data: {
          status: newStatus,
          resolvedBy: adminId,
          resolvedAt: new Date(),
          resolution: trimmedResolution,
        },
      });

      // Create moderation log
      await tx.moderationLog.create({
        data: {
          adminId,
          action: action === "resolve" ? "resolve_report" : "dismiss_report",
          postId: report.postId,
          commentId: report.commentId,
          reason: trimmedResolution,
        },
      });

      // Notify reporter
      await tx.forumNotification.create({
        data: {
          userId: report.reporterId,
          type: "report_resolved",
          postId: report.postId,
          commentId: report.commentId,
          actorId: adminId,
          message:
            action === "resolve"
              ? `您的举报已处理：${trimmedResolution}`
              : `您的举报已审核：${trimmedResolution}`,
        },
      });

      // Notify post author if resolved with action taken
      if (action === "resolve" && report.postId) {
        const post = await tx.forumPost.findUnique({
          where: { id: report.postId },
          select: { userId: true, title: true },
        });
        if (post) {
          await tx.forumNotification.create({
            data: {
              userId: post.userId,
              type: "report_resolved",
              postId: report.postId,
              actorId: adminId,
              message: `您的帖子「${post.title}」收到举报处理：${trimmedResolution}`,
            },
          });
        }
      }

      // ─── V1.5: 举报采纳激励 ────────────────────────────
      // 举报被采纳(resolve)时，给举报人 +5 荣誉值
      if (action === "resolve") {
        await adjustHonor(
          report.reporterId,
          5,
          "report_accepted",
          `举报被采纳：${trimmedResolution}`,
          report.id,
          adminId,
          tx
        ).catch(() => {});

        await incrementCommunityStat(report.reporterId, "reportAcceptedCount", 1, tx).catch(() => {});
      }
    });

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("[Admin Reports POST Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
