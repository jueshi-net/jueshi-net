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

export async function GET(req: NextRequest) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const pageType = searchParams.get("pageType") || undefined;
  const device = searchParams.get("device") || undefined;
  const search = searchParams.get("search") || undefined;
  const isActive = searchParams.get("isActive");

  const where: any = {};
  if (pageType) where.pageType = pageType;
  if (device) where.device = device;
  if (isActive !== null && isActive !== undefined) where.isActive = isActive === "true";
  if (search) {
    where.OR = [
      { key: { contains: search, mode: "insensitive" as const } },
      { name: { contains: search, mode: "insensitive" as const } },
    ];
  }

  const placements = await prisma.adPlacement.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(placements);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  const body = await req.json();
  try {
    const placement = await prisma.adPlacement.create({
      data: {
        key: body.key,
        name: body.name,
        pageType: body.pageType,
        zone: body.zone,
        device: body.device || "all",
        description: body.description || null,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    return NextResponse.json(placement, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: `广告位 key "${body.key}" 已存在` }, { status: 409 });
    }
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
