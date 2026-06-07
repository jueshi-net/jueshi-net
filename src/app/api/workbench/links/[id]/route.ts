// PATCH /api/workbench/links/[id] — update a link
// DELETE /api/workbench/links/[id] — delete a link

import { NextResponse } from "next/server";
import { requireLogin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { validateUrl, validateTitle, validateDescription } from "@/lib/workbench/validation";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const res = await requireLogin();
  if ("error" in res) return res.error;

  const { session } = res;
  const userId = session.user.id;
  const { id } = await params;

  try {
    // Check ownership
    const existing = await prisma.workbenchLink.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "链接不存在" }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: "无权操作此链接" }, { status: 403 });
    }

    const body = await req.json();
    const { title, url, description, iconUrl, category } = body;

    // Validate (only if provided)
    if (title !== undefined) {
      const titleResult = validateTitle(title);
      if (!titleResult.valid) {
        return NextResponse.json({ error: titleResult.error }, { status: 400 });
      }
    }

    if (url !== undefined) {
      const urlResult = validateUrl(url);
      if (!urlResult.valid) {
        return NextResponse.json({ error: urlResult.error }, { status: 400 });
      }
    }

    if (description !== undefined) {
      const descResult = validateDescription(description);
      if (!descResult.valid) {
        return NextResponse.json({ error: descResult.error }, { status: 400 });
      }
    }

    // Update
    const link = await prisma.workbenchLink.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(url !== undefined && { url: url.trim() }),
        ...(description !== undefined && { description: description.trim() || null }),
        ...(iconUrl !== undefined && { iconUrl: iconUrl || null }),
        ...(category !== undefined && { category: category || null }),
      },
      select: {
        id: true,
        title: true,
        url: true,
        description: true,
        iconUrl: true,
        category: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ link });
  } catch (error) {
    console.error("[Workbench Link PATCH Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const res = await requireLogin();
  if ("error" in res) return res.error;

  const { session } = res;
  const userId = session.user.id;
  const { id } = await params;

  try {
    // Check ownership
    const existing = await prisma.workbenchLink.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "链接不存在" }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: "无权操作此链接" }, { status: 403 });
    }

    // Delete
    await prisma.workbenchLink.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[Workbench Link DELETE Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
