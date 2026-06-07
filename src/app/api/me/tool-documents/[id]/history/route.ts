// GET /api/me/tool-documents/[id]/history — get document history versions
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;

  // Verify document ownership
  const draft = await prisma.toolDocumentDraft.findFirst({
    where: { id, userId },
  });
  if (!draft) return NextResponse.json({ error: "文档不存在或无权访问" }, { status: 404 });

  const history = await prisma.toolDocumentHistory.findMany({
    where: { documentId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ success: true, data: history });
}
