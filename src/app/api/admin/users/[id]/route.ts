// PATCH /api/admin/users/[id] - Admin: adjust role or points

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "无权限" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { role, pointsAdjust, pointsAdjustReason } = body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id }, select: { id: true, role: true, points: true } });
      if (!target) throw new Error("用户不存在");

      const updates: Record<string, unknown> = {};

      if (role && ["user", "member", "admin"].includes(role)) {
        updates.role = role;
        if (role !== "member") {
          updates.memberUntil = null;
        }
      }

      if (typeof pointsAdjust === "number" && pointsAdjust !== 0) {
        updates.points = { increment: pointsAdjust };
      }

      const updated = await tx.user.update({ where: { id }, data: updates });

      // Write ledger if points were adjusted
      if (typeof pointsAdjust === "number" && pointsAdjust !== 0) {
        await tx.pointLedger.create({
          data: {
            userId: id,
            type: "admin_adjust",
            points: pointsAdjust,
            reason: pointsAdjustReason || `管理员调整积分 (${pointsAdjust > 0 ? "+" : ""}${pointsAdjust})`,
            metadata: { adjustedBy: session!.user!.id },
          },
        });
      }

      return updated;
    });

    return NextResponse.json({ success: true, user: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "操作失败" }, { status: 400 });
  }
}
