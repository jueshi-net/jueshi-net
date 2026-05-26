import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── POST: Save document to workspace ───
// Body: { documentType, documentNo?, documentData: { formData, lineItems } }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { documentType, documentNo, documentData } = body;

    if (!documentType || !documentData) {
      return NextResponse.json({ error: "缺少必要参数: documentType, documentData" }, { status: 400 });
    }

    const doc = await prisma.documentHistory.create({
      data: {
        userId: session.user.id,
        documentType,
        documentNo: documentNo || null,
        documentData: typeof documentData === "string" ? documentData : JSON.stringify(documentData),
      },
    });

    return NextResponse.json({ success: true, id: doc.id, createdAt: doc.createdAt });
  } catch (err: any) {
    console.error("[POST /api/user/documents]", err);
    return NextResponse.json({ error: "保存失败", details: err.message }, { status: 500 });
  }
}

// ─── GET: List user's document history ───
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { userId: session.user.id };
    if (type) where.documentType = type;

    const docs = await prisma.documentHistory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    });

    return NextResponse.json({
      success: true,
      count: docs.length,
      documents: docs.map(d => ({
        id: d.id,
        documentType: d.documentType,
        documentNo: d.documentNo,
        documentData: d.documentData,
        createdAt: d.createdAt,
      })),
    });
  } catch (err: any) {
    console.error("[GET /api/user/documents]", err);
    return NextResponse.json({ error: "查询失败", details: err.message }, { status: 500 });
  }
}

// ─── DELETE: Remove a document history entry ───
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "缺少 id 参数" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.documentHistory.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "无权删除" }, { status: 403 });
    }

    await prisma.documentHistory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[DELETE /api/user/documents]", err);
    return NextResponse.json({ error: "删除失败", details: err.message }, { status: 500 });
  }
}
