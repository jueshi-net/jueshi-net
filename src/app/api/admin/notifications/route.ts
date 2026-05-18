// POST /api/admin/notifications — admin sends notification to a user
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "无权限" }, { status: 403 });

  const body = await req.json();
  const { userId, type = "admin_message", title, message, link } = body;

  if (!userId || !title || !message) {
    return NextResponse.json({ error: "userId、title、message 必填" }, { status: 400 });
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link: link || null,
      isRead: false,
    },
  });

  return NextResponse.json({ success: true, notification });
}
