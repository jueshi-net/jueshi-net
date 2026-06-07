// GET /api/me/company-profiles/[id]/history — list history versions (auth + userId isolation)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;

  // Verify profile ownership
  const profile = await prisma.userCompanyProfile.findFirst({
    where: { id, userId },
  });
  if (!profile) return NextResponse.json({ error: "公司资料不存在或无权访问" }, { status: 404 });

  const history = await prisma.userCompanyProfileHistory.findMany({
    where: { profileId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ success: true, data: history });
}
