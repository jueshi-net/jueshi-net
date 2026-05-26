/**
 * GET /api/auth/sso — Flarum SSO JWT 签发端点
 *
 * 流程：
 * 1. 检查主站登录状态
 * 2. 未登录 → 302 到 /login?callbackUrl=/api/auth/sso
 * 3. 已登录 → 从 DB 读取用户信息（id, name, email, badges）
 * 4. 用 FLARUM_JWT_SECRET 签发 5 分钟有效期的 JWT
 * 5. 302 重定向到 Flarum SSO 桥接页
 *
 * JWT 格式严格契合 maicol07/flarum-ext-sso 插件标准：
 *   { user: { id, attributes: { email, username, isEmailConfirmed } }, remember }
 * 签名验证：HS256，issuer=jueshi.net，audience=Flarum URL
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const FLARUM_URL = process.env.FLARUM_URL || "https://bbs.jueshi.net";
const JWT_SECRET = process.env.FLARUM_JWT_SECRET;

export async function GET(req: Request) {
  if (!JWT_SECRET) {
    console.error("[SSO] FLARUM_JWT_SECRET is not configured");
    return NextResponse.json(
      { error: "SSO configuration error" },
      { status: 500 }
    );
  }

  // 1. 身份判定：获取主站 session
  const session = await auth();

  if (!session?.user?.email) {
    // 2. 未登录 → 302 到主站登录页，登录后回跳此端点
    const callbackUrl = `${process.env.NEXTAUTH_URL || "https://jueshi.net"}/api/auth/sso`;
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, req.url)
    );
  }

  // 3. 已登录 → 从数据库提取完整用户信息
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      badges: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "User not found in database" },
      { status: 404 }
    );
  }

  // 4. JWT 签发 — maicol07/flarum-ext-sso 插件格式
  //    Payload 必须包含 user.id + user.attributes.email/username
  const secret = new TextEncoder().encode(JWT_SECRET);
  const now = Math.floor(Date.now() / 1000);

  const token = await new SignJWT({
    user: {
      id: user.id,
      attributes: {
        email: user.email,
        username: user.name || user.email.split("@")[0],
        isEmailConfirmed: true,
      },
    },
    remember: false,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + 5 * 60) // 5 分钟，防重放攻击
    .setIssuer("jueshi.net")
    .setAudience(FLARUM_URL)
    .sign(secret);

  // 5. 安全重定向到 Flarum SSO 桥接页
  const bridgeUrl = `${FLARUM_URL}/sso-callback.html?token=${token}`;
  return NextResponse.redirect(bridgeUrl);
}
