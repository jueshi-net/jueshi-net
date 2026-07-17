// GET /api/forum/admin/reports - 管理员举报列表
// POST /api/forum/admin/reports - 处理举报（resolve/dismiss）

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

    const validStatuses = ["pending", "resolved", "dismissed", "all"];
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
// body: { reportId: string, action: "resolve" | "dismiss", resolution?: string }
export async function POST(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;
    const { session } = adminResult;
    const adminId = session.user.id;

    const body = await request.json();
    const { reportId, action, resolution } = body as {
      reportId: string;
      action: "resolve" | "dismiss";
      resolution?: string;
    };

    if (!reportId || typeof reportId !== "string") {
      return NextResponse.json({ error: "缺少 reportId" }, { status: 400 });
    }

    if (!action || !["resolve", "dismiss"].includes(action)) {
      return NextResponse.json({ error: "无效的操作" }, { status: 400 });
    }

    const report = await prisma.forumReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "举报不存在" }, { status: 404 });
    }

    if (report.status !== "pending") {
      return NextResponse.json({ error: "该举报已处理" }, { status: 409 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.forumReport.update({
        where: { id: reportId },
        data: {
          status: action === "resolve" ? "resolved" : "dismissed",
          resolvedBy: adminId,
          resolvedAt: new Date(),
          resolution: action === "resolve" ? "action_taken" : "no_action",
        },
      });

      // Create moderation log
      await tx.moderationLog.create({
        data: {
          adminId,
          action: action === "resolve" ? "reject_report" : "reject_report",
          postId: report.postId,
          commentId: report.commentId,
          reason: resolution || (action === "resolve" ? "举报成立" : "举报驳回"),
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
              ? "您的举报已处理，已采取相应措施"
              : "您的举报已审核，暂未发现违规",
        },
      });
    });

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("[Admin Reports POST Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
