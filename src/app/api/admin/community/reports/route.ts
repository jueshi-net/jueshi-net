import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  try {
    const authRes = await requireAdmin();
    if (authRes instanceof NextResponse) return authRes;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const [reports, total] = await Promise.all([
      prisma.forumReport.findMany({
        where: { status },
        include: {
          reporter: { select: { name: true, email: true } },
          post: { select: { title: true, slug: true, userId: true } },
          comment: { select: { content: true, userId: true, postId: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.forumReport.count({ where: { status } }),
    ]);

    return NextResponse.json({ reports, total, page, pageSize });
  } catch (error) {
    console.error("[Admin Reports GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
