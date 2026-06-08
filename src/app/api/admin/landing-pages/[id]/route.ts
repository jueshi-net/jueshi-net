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
    const page = await prisma.landingPage.update({
      where: { id },
      data: {
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.seoTitle !== undefined && { seoTitle: body.seoTitle }),
        ...(body.seoDescription !== undefined && { seoDescription: body.seoDescription }),
        ...(body.pageType !== undefined && { pageType: body.pageType }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.heroSection !== undefined && { heroSection: body.heroSection }),
        ...(body.primaryTool !== undefined && { primaryTool: body.primaryTool }),
        ...(body.relatedTools !== undefined && { relatedTools: body.relatedTools }),
        ...(body.relatedTopics !== undefined && { relatedTopics: body.relatedTopics }),
        ...(body.relatedArticles !== undefined && { relatedArticles: body.relatedArticles }),
        ...(body.faqItems !== undefined && { faqItems: body.faqItems }),
        ...(body.officialLinks !== undefined && { officialLinks: body.officialLinks }),
        ...(body.adPlacements !== undefined && { adPlacements: body.adPlacements }),
        ...(body.ctaConfig !== undefined && { ctaConfig: body.ctaConfig }),
        ...(body.status === "published" && !body.publishedAt && { publishedAt: new Date() }),
      },
    });
    return NextResponse.json(page);
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: `Slug "${body.slug}" 已存在` }, { status: 409 });
    }
    if (e.code === "P2025") {
      return NextResponse.json({ error: "页面不存在" }, { status: 404 });
    }
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  const { id } = await params;
  await prisma.landingPage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
