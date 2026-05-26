// PATCH /api/me/notifications/[id] — mark single notification as read
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;

  const result = await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true, readAt: new Date() },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "通知不存在或无权操作" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
