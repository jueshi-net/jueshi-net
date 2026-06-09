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
  const campaignId = searchParams.get("campaignId") || undefined;
  const creativeType = searchParams.get("creativeType") || undefined;
  const search = searchParams.get("search") || undefined;

  const where: any = {};
  if (campaignId) where.campaignId = campaignId;
  if (creativeType) where.creativeType = creativeType;
  if (search) {
    where.title = { contains: search, mode: "insensitive" as const };
  }

  const creatives = await prisma.adCreative.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(creatives);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  const body = await req.json();
  try {
    const creative = await prisma.adCreative.create({
      data: {
        campaignId: body.campaignId,
        title: body.title,
        creativeType: body.creativeType,
        imageUrl: body.imageUrl || null,
        targetUrl: body.targetUrl || null,
        codeSnippet: body.codeSnippet || null,
        headline: body.headline || null,
        bodyText: body.bodyText || null,
        ctaText: body.ctaText || null,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    return NextResponse.json(creative, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
