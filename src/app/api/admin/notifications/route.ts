// GET /api/admin/notifications — admin list with filters
// POST /api/admin/notifications — admin sends notification to a user
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/permissions";
import { listAdminNotifications, sendNotificationByEmail } from "@/lib/notifications";

/** GET — list notifications with filters */
export async function GET(req: NextRequest) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  const { searchParams } = new URL(req.url);
  const result = await listAdminNotifications({
    page: parseInt(searchParams.get("page") || "1"),
    pageSize: parseInt(searchParams.get("pageSize") || "20"),
    email: searchParams.get("email") || undefined,
    type: searchParams.get("type") || undefined,
    unreadOnly: searchParams.get("unreadOnly") === "true",
  });

  return NextResponse.json({ success: true, ...result });
}

/** POST — send notification to a user */
export async function POST(req: NextRequest) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  const json = await req.json();
  const { email, type = "admin_message", title, message: body, link } = json;

  if (!email || !title || !body) {
    return NextResponse.json(
      { error: "邮箱、标题、内容必填" },
      { status: 400 }
    );
  }
  if (title.length > 80) {
    return NextResponse.json(
      { error: "标题最多 80 字" },
      { status: 400 }
    );
  }
  if (body.length > 500) {
    return NextResponse.json(
      { error: "内容最多 500 字" },
      { status: 400 }
    );
  }

  // Validate linkUrl: must be relative path or https://jueshi.net/*
  if (link && !link.startsWith("/") && !link.startsWith("https://jueshi.net/")) {
    return NextResponse.json(
      { error: "链接必须是站内路径或 https://jueshi.net/..." },
      { status: 400 }
    );
  }

  const result = await sendNotificationByEmail(email, type, title, body, link);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "发送失败" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, message: "通知已发送" });
}
