// POST /api/admin/notifications/broadcast — admin broadcasts to all enabled users
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { broadcastNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  const body = await req.json();
  const { type, title, message, link, confirm } = body;

  // Must confirm with exact text
  if (confirm !== "CONFIRM") {
    return NextResponse.json(
      { error: "必须输入 CONFIRM 确认才能群发" },
      { status: 400 }
    );
  }

  // Only system or admin_message
  if (type !== "system" && type !== "admin_message") {
    return NextResponse.json(
      { error: "群发只能是 system 或 admin_message" },
      { status: 400 }
    );
  }

  if (!title || !message) {
    return NextResponse.json(
      { error: "标题和内容必填" },
      { status: 400 }
    );
  }
  if (title.length > 80) {
    return NextResponse.json({ error: "标题最多 80 字" }, { status: 400 });
  }
  if (message.length > 500) {
    return NextResponse.json({ error: "内容最多 500 字" }, { status: 400 });
  }

  // Validate linkUrl: must be empty, relative path, or https://jueshi.net/*
  if (link && !link.startsWith("/") && !link.startsWith("https://jueshi.net/")) {
    return NextResponse.json(
      { error: "链接必须是站内路径或 https://jueshi.net/..." },
      { status: 400 }
    );
  }

  const result = await broadcastNotification(type, title, message, link || null);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    createdCount: result.createdCount,
    message: `已发送 ${result.createdCount} 条通知`,
  });
}
