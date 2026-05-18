// GET /api/me/membership — check if current user is an active member
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, memberUntil: true },
  });

  if (!user) return NextResponse.json({ isMember: false });

  const isMember = user.role === "admin" || user.role === "member" || !!(user.memberUntil && user.memberUntil > new Date());

  return NextResponse.json({ isMember, role: user.role, memberUntil: user.memberUntil });
}
