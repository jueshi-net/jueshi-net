import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  try {
    const authRes = await requireAdmin();
    if (authRes instanceof NextResponse) return authRes;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where = status ? { status } : {};
    const [comments, total] = await Promise.all([
      prisma.forumComment.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          post: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.forumComment.count({ where }),
    ]);

    return NextResponse.json({ comments, total, page, pageSize });
  } catch (error) {
    console.error("[Admin Comments GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
