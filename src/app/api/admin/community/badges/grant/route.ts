import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

// POST /api/admin/community/badges/grant — admin grant badge to user
export async function POST(req: NextRequest) {
  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  const { session } = authRes;
  const adminId = session.user.id;

  try {
    const body = await req.json();
    const { userId, badgeId, reason } = body;

    if (!userId || !badgeId) {
      return NextResponse.json(
        { error: "缺少必填字段: userId, badgeId" },
        { status: 400 }
      );
    }

    // Check badge exists
    const badge = await prisma.userBadge.findUnique({
      where: { id: badgeId },
    });
    if (!badge) {
      return NextResponse.json({ error: "勋章不存在" }, { status: 404 });
    }

    // Check if already awarded
    const existing = await prisma.userBadgeAward.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
    });
    if (existing) {
      return NextResponse.json({ error: "该用户已拥有此勋章" }, { status: 409 });
    }

    // Grant badge
    await prisma.userBadgeAward.create({
      data: {
        userId,
        badgeId,
        reason: reason || `管理员 ${session.user.name || "admin"} 手动授予`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Badge Grant Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// DELETE /api/admin/community/badges/grant — admin remove badge
export async function DELETE(req: NextRequest) {
  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const body = await req.json();
    const { userId, badgeId } = body;

    if (!userId || !badgeId) {
      return NextResponse.json(
        { error: "缺少必填字段: userId, badgeId" },
        { status: 400 }
      );
    }

    await prisma.userBadgeAward.deleteMany({
      where: { userId, badgeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Badge Remove Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
