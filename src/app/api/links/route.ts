import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { title: { contains: search } },
            { url: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {};

    const [links, total] = await Promise.all([
      prisma.linkItem.findMany({
        where,
        include: { category: { select: { name: true, icon: true } } },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.linkItem.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: links, links, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch links" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  try {
    const body = await req.json();
    const link = await prisma.linkItem.create({
      data: {
        title: body.title,
        url: body.url,
        description: body.description || "",
        icon: body.icon || "",
        categoryId: body.categoryId || null,
        sortOrder: body.sortOrder || 0,
        isFeatured: body.isFeatured || false,
        status: body.status || "active",
      },
      include: { category: { select: { name: true } } },
    });
    return NextResponse.json({ success: true, data: link });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create link" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const body = await req.json();
    const link = await prisma.linkItem.update({
      where: { id },
      data: {
        title: body.title,
        url: body.url,
        description: body.description,
        icon: body.icon,
        categoryId: body.categoryId,
        sortOrder: body.sortOrder,
        isFeatured: body.isFeatured,
        status: body.status,
      },
    });
    return NextResponse.json({ success: true, data: link });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update link" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.linkItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete link" }, { status: 500 });
  }
}
