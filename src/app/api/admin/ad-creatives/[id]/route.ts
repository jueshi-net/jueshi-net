import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function requireAdmin(session: any) {
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role || "";
  if (!["管理员", "ADMIN", "admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  const { id } = await params;
  const body = await req.json();

  try {
    const creative = await prisma.adCreative.update({
      where: { id },
      data: {
        ...(body.campaignId !== undefined && { campaignId: body.campaignId }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.creativeType !== undefined && { creativeType: body.creativeType }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.targetUrl !== undefined && { targetUrl: body.targetUrl }),
        ...(body.codeSnippet !== undefined && { codeSnippet: body.codeSnippet }),
        ...(body.headline !== undefined && { headline: body.headline }),
        ...(body.bodyText !== undefined && { bodyText: body.bodyText }),
        ...(body.ctaText !== undefined && { ctaText: body.ctaText }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });
    return NextResponse.json(creative);
  } catch (e: any) {
    if (e.code === "P2025") {
      return NextResponse.json({ error: "素材不存在" }, { status: 404 });
    }
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  const { id } = await params;
  await prisma.adCreative.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
