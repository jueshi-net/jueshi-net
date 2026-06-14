import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { authLimiter } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const limit = await authLimiter.check(ip);
  if (!limit.success) {
    return NextResponse.json(
      { success: false, error: "请求过于频繁，请稍后重试" },
      { status: 429, headers: { "Retry-After": String(limit.reset - Math.floor(Date.now() / 1000)) } }
    );
  }

  // Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "请填写所有字段" },
        { status: 400 }
      );
    }

    // Validate new password length (minimum 12 characters for security)
    if (newPassword.length < 12) {
      return NextResponse.json(
        { success: false, error: "新密码至少12位" },
        { status: 400 }
      );
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "两次输入的新密码不一致" },
        { status: 400 }
      );
    }

    // Fetch current user with password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: "账号异常，请联系管理员" },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "当前密码错误" },
        { status: 400 }
      );
    }

    // Hash new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: newHashedPassword },
    });

    return NextResponse.json({ success: true, message: "密码修改成功" });
  } catch (error) {
    console.error("[CHANGE_PASSWORD] Error:", error);
    return NextResponse.json(
      { success: false, error: "修改失败，请稍后重试" },
      { status: 500 }
    );
  }
}
