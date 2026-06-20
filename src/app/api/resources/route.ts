import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const sourceType = searchParams.get("sourceType") || undefined;
    const isAd = searchParams.get("isAd");
    const sortBy = searchParams.get("sortBy") || "updatedAt";

    // Check if user is admin
    const session = await auth();
    const isAdmin = ["管理员", "admin", "ADMIN"].includes(session?.user?.role || "");

    const where: any = {};
    if (category) where.category = category;
    if (sourceType) where.sourceType = sourceType;
    if (isAd !== null && isAd !== undefined && isAd !== "") {
      where.isAd = isAd === "true";
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { url: { contains: search, mode: "insensitive" } },
      ];
    }

    // Non-admin only sees active resources
    if (!isAdmin) {
      where.isActive = true;
    }

    // Build orderBy based on sortBy parameter
    let orderBy: any;
    switch (sortBy) {
      case "createdAt":
        orderBy = { createdAt: "desc" };
        break;
      case "sortOrder":
        orderBy = [{ sortOrder: "asc" }, { createdAt: "desc" }];
        break;
      case "qualityScore":
        orderBy = { qualityScore: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "updatedAt":
      default:
        orderBy = { updatedAt: "desc" };
        break;
    }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.resource.count({ where }),
    ]);

    return NextResponse.json({ resources, total, page, limit });
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (!["管理员", "admin", "ADMIN"].includes(session.user.role))) {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const resource = await prisma.resource.create({
      data: {
        name: body.name,
        url: body.url,
        description: body.description || "",
        category: body.category,
        tags: body.tags || [],
        sourceType: body.sourceType || "third-party",
        usage: body.usage || "",
        disclaimer: body.disclaimer || "",
        isActive: body.isActive !== false,
        sortOrder: body.sortOrder || 0,
        iconUrl: body.iconUrl || null,
        isAd: body.isAd || false,
        // v1.20.42.13.3: featured fields
        isFeatured: body.isFeatured || false,
        featuredGroup: body.featuredGroup || null,
        featuredOrder: body.featuredOrder ?? null,
        featuredStartAt: body.featuredStartAt ? new Date(body.featuredStartAt) : null,
        featuredEndAt: body.featuredEndAt ? new Date(body.featuredEndAt) : null,
      },
    });
    return NextResponse.json({ success: true, resource });
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (!["管理员", "admin", "ADMIN"].includes(session.user.role))) {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少 ID" }, { status: 400 });

  try {
    const body = await req.json();
    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.url !== undefined) data.url = body.url;
    if (body.description !== undefined) data.description = body.description;
    if (body.category !== undefined) data.category = body.category;
    if (body.tags !== undefined) data.tags = body.tags;
    if (body.sourceType !== undefined) data.sourceType = body.sourceType;
    if (body.usage !== undefined) data.usage = body.usage;
    if (body.disclaimer !== undefined) data.disclaimer = body.disclaimer;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
    if (body.iconUrl !== undefined) data.iconUrl = body.iconUrl;
    if (body.isAd !== undefined) data.isAd = body.isAd;
    // v1.20.42.13.3: featured fields
    if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured;
    if (body.featuredGroup !== undefined) data.featuredGroup = body.featuredGroup || null;
    if (body.featuredOrder !== undefined) data.featuredOrder = body.featuredOrder;
    if (body.featuredStartAt !== undefined) data.featuredStartAt = body.featuredStartAt ? new Date(body.featuredStartAt) : null;
    if (body.featuredEndAt !== undefined) data.featuredEndAt = body.featuredEndAt ? new Date(body.featuredEndAt) : null;

    const resource = await prisma.resource.update({ where: { id }, data });
    return NextResponse.json({ success: true, resource });
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (!["管理员", "admin", "ADMIN"].includes(session.user.role))) {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少 ID" }, { status: 400 });

  try {
    await prisma.resource.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
