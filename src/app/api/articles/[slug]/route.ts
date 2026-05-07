import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const article = await prisma.article.findUnique({
      where: { slug },
    });
    if (!article) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: article });
  } catch {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { slug } = await params;
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.summary !== undefined) updateData.summary = body.summary;
    if (body.cover !== undefined) updateData.cover = body.cover;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === "PUBLISHED") updateData.publishedAt = new Date();
      if (body.status === "DRAFT") updateData.publishedAt = null;
    }

    const article = await prisma.article.update({ where: { slug }, data: updateData });
    return NextResponse.json({ success: true, data: article });
  } catch {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { slug } = await params;
    await prisma.article.delete({ where: { slug } });
    return NextResponse.json({ success: true, message: "Article deleted" });
  } catch {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  return { session };
}
