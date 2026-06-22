import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { adjustHonor } from "@/lib/honor-helpers";

// POST /api/admin/community/honor — admin manually adjust user honor
export async function POST(req: NextRequest) {
  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  const { session } = authRes;
  const adminId = session.user.id;

  try {
    const body = await req.json();
    const { userId, delta, reason } = body;

    if (!userId || !delta || !reason) {
      return NextResponse.json(
        { error: "缺少必填字段: userId, delta, reason" },
        { status: 400 }
      );
    }

    if (typeof delta !== "number" || delta === 0) {
      return NextResponse.json(
        { error: "delta 必须是非零数字" },
        { status: 400 }
      );
    }

    if (reason.length < 3) {
      return NextResponse.json(
        { error: "原因说明至少 3 个字符" },
        { status: 400 }
      );
    }

    const result = await adjustHonor(
      userId,
      delta,
      "admin_adjust",
      reason,
      undefined,
      adminId
    );

    if (!result.success) {
      return NextResponse.json({ error: result.reason }, { status: 409 });
    }

    return NextResponse.json({ success: true, newHonor: result.newHonor });
  } catch (error) {
    console.error("[Admin Honor Adjust Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// GET /api/admin/community/honor — list honor logs
export async function GET(req: NextRequest) {
  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const pageSize = 20;

  const where = userId ? { userId } : {};
  const [logs, total] = await Promise.all([
    prisma.honorLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { name: true, email: true, image: true } },
      },
    }),
    prisma.honorLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, pageSize });
}
