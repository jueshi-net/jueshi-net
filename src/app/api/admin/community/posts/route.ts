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
    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, image: true } },
          category: true,
          _count: { select: { comments: true, reports: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.forumPost.count({ where }),
    ]);

    return NextResponse.json({ posts, total, page, pageSize });
  } catch (error) {
    console.error("[Admin Posts GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
