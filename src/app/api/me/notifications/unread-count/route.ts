// GET /api/me/notifications/unread-count
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  return NextResponse.json({ success: true, count });
}
