// GET /api/me/company-profiles — list company profiles for current user
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;

  try {
    const profiles = await prisma.userCompanyProfile.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ success: true, data: profiles });
  } catch {
    return NextResponse.json({ error: "加载失败" }, { status: 500 });
  }
}
