// GET /api/admin/forum/comments — 管理评论列表

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const res = await requireAdmin();
  if (res instanceof NextResponse) return res;

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(url.searchParams.get("pageSize") || "20", 10))
  );

  try {
    const where: any = {};
    if (status) where.status = status;

    const [comments, total] = await Promise.all([
      prisma.forumComment.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { name: true, email: true } },
          post: { select: { title: true } },
        },
      }),
      prisma.forumComment.count({ where }),
    ]);

    return NextResponse.json({ comments, total, page, pageSize });
  } catch (error) {
    console.error("[Admin Forum Comments GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
