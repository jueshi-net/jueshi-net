import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { authLimiter } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const limit = await authLimiter.check(ip);
  if (!limit.success) {
    return NextResponse.json(
      { success: false, error: "请求过于频繁，请稍后重试" },
      { status: 429, headers: { "Retry-After": String(limit.reset - Math.floor(Date.now() / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "邮箱和密码为必填" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "密码至少6位" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: "邮箱已被注册" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        password: hashedPassword,
        role: "user",
      },
    });

    // Auto-create workspace
    await prisma.workspace.create({
      data: {
        ownerId: user.id,
        name: `${user.name || user.email?.split('@')[0]}的工作台`,
        slug: `ws-${user.id.slice(0, 8)}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email },
    });
  } catch {
    return NextResponse.json({ success: false, error: "注册失败" }, { status: 500 });
  }
}
