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
    const { email, password, name, inviteCode } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "邮箱和密码为必填" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "密码至少6位" }, { status: 400 });
    }

    // ─── 邀请码强校验 ───
    if (!inviteCode || !inviteCode.trim()) {
      return NextResponse.json(
        { success: false, error: "当前为内测阶段，请输入邀请码注册" },
        { status: 403 }
      );
    }

    const invite = await prisma.inviteCode.findUnique({
      where: { code: inviteCode.trim().toUpperCase() },
    });

    if (!invite) {
      return NextResponse.json(
        { success: false, error: "邀请码无效或不存在" },
        { status: 403 }
      );
    }

    if (!invite.isActive) {
      return NextResponse.json(
        { success: false, error: "该邀请码已被停用" },
        { status: 403 }
      );
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "该邀请码已过期" },
        { status: 403 }
      );
    }

    if (invite.usedCount >= invite.maxUses) {
      return NextResponse.json(
        { success: false, error: "该邀请码已被抢空" },
        { status: 403 }
      );
    }

    // ─── 检查邮箱是否已被注册 ───
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: "邮箱已被注册" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ─── 事务：创建用户 + 邀请码计数 + 积分流水 ───
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          password: hashedPassword,
          role: "user",
          badges: ["BLACK_GOLD_PIONEER"],  // 初代黑金勋章
          points: 500,                     // 先锋探路官注册奖励 +500
        },
      });

      // 邀请码 usedCount + 1
      await tx.inviteCode.update({
        where: { id: invite.id },
        data: { usedCount: { increment: 1 } },
      });

      // 积分流水记录
      await tx.pointLedger.create({
        data: {
          userId: user.id,
          type: "invite_signup",
          points: 500,
          reason: "先锋探路官注册奖励",
        },
      });

      return user;
    });

    // Auto-create workspace
    await prisma.workspace.create({
      data: {
        ownerId: result.id,
        name: `${result.name || result.email?.split('@')[0]}的工作台`,
        slug: `ws-${result.id.slice(0, 8)}`,
      },
    }).catch(() => {}); // silently ignore workspace creation failure

    return NextResponse.json({
      success: true,
      data: { id: result.id, name: result.name, email: result.email, badges: result.badges },
    });
  } catch (error) {
    console.error('Register failed:', error);
    return NextResponse.json({ success: false, error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
