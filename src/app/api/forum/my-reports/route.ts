// GET /api/forum/my-reports - 当前用户的举报记录
// Only returns reports submitted by the authenticated user

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { session } = authResult;
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

    const [reports, total] = await Promise.all([
      prisma.forumReport.findMany({
        where: { reporterId: userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          post: {
            select: {
              id: true,
              slug: true,
              title: true,
              status: true,
            },
          },
          comment: {
            select: {
              id: true,
              content: true,
              status: true,
            },
          },
        },
      }),
      prisma.forumReport.count({ where: { reporterId: userId } }),
    ]);

    // Map to safe output - no internal admin notes exposed
    const items = reports.map((r) => ({
      id: r.id,
      reason: r.reason,
      description: r.description,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      resolvedAt: r.resolvedAt?.toISOString() || null,
      // Only show resolution text (already shown in notification), never internal notes
      resolution: r.resolution || null,
      post: r.post
        ? {
            id: r.post.id,
            slug: r.post.slug,
            title: r.post.title,
            status: r.post.status,
            // Content is considered "accessible" if the post is published or hidden (not deleted)
            isAccessible: r.post.status !== "deleted",
          }
        : null,
      comment: r.comment
        ? {
            id: r.comment.id,
            contentPreview: r.comment.content.slice(0, 100),
            status: r.comment.status,
            isAccessible: r.comment.status !== "deleted",
          }
        : null,
    }));

    return NextResponse.json({ reports: items, total, page, pageSize });
  } catch (error) {
    console.error("[My Reports Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
