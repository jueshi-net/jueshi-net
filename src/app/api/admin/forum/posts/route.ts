// GET /api/admin/forum/posts — 管理帖子列表

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const res = await requireAdmin();
  if (res instanceof NextResponse) return res;

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const category = url.searchParams.get("category") || undefined;
  const q = url.searchParams.get("q") || undefined;
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(url.searchParams.get("pageSize") || "20", 10))
  );

  try {
    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = { key: category };
    if (q) where.title = { contains: q, mode: "insensitive" };

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { name: true, email: true } },
          category: true,
        },
      }),
      prisma.forumPost.count({ where }),
    ]);

    return NextResponse.json({ posts, total, page, pageSize });
  } catch (error) {
    console.error("[Admin Forum Posts GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
