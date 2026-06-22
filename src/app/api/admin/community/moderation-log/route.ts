import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

// GET /api/admin/community/moderation-log
// 获取管理操作审计日志（分页），仅管理员可访问。
// 返回日志及操作管理员公开信息（name/image），不泄露 email/password/points。
export async function GET(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10))
    );
    const action = searchParams.get("action") || undefined;

    const where: any = {};
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      prisma.moderationLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          admin: { select: { id: true, name: true, image: true } },
          post: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.moderationLog.count({ where }),
    ]);

    return NextResponse.json({ logs, total, page, pageSize });
  } catch (error) {
    console.error("[Moderation Log GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
