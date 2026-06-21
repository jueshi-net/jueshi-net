import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function requireAdmin(session: any) {
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role || "";
  if (!["管理员", "ADMIN", "admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

interface ChecklistUpdateBody {
  title?: string;
  slug?: string;
  summary?: string;
  steps?: Prisma.InputJsonValue;
  relatedTools?: string[];
  relatedTaskChain?: string | null;
  relatedGuides?: string[];
  relatedTopics?: string[];
  status?: string;
  coverImage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  robots?: string;
  sortOrder?: number;
  publishedAt?: string | null;
}

// GET /api/admin/checklists/[id] — single checklist
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  try {
    const { id } = await params;
    const checklist = await prisma.checklist.findUnique({ where: { id } });
    if (!checklist) {
      return NextResponse.json({ error: "清单不存在" }, { status: 404 });
    }
    return NextResponse.json(checklist);
  } catch (e: any) {
    console.error("Admin checklist get error:", e);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// PUT /api/admin/checklists/[id] — update checklist
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  try {
    const { id } = await params;
    const body = (await req.json()) as ChecklistUpdateBody;

    // If status is being changed to "published", set publishedAt to now() if not already set
    let publishedAtValue: Date | undefined = undefined;
    if (body.status === "published") {
      const existing = await prisma.checklist.findUnique({
        where: { id },
        select: { publishedAt: true },
      });
      if (!existing) {
        return NextResponse.json({ error: "清单不存在" }, { status: 404 });
      }
      if (!existing.publishedAt && !body.publishedAt) {
        publishedAtValue = new Date();
      }
    }

    const checklist = await prisma.checklist.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.summary !== undefined && { summary: body.summary }),
        ...(body.steps !== undefined && { steps: body.steps }),
        ...(body.relatedTools !== undefined && { relatedTools: body.relatedTools }),
        ...(body.relatedTaskChain !== undefined && { relatedTaskChain: body.relatedTaskChain }),
        ...(body.relatedGuides !== undefined && { relatedGuides: body.relatedGuides }),
        ...(body.relatedTopics !== undefined && { relatedTopics: body.relatedTopics }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
        ...(body.seoTitle !== undefined && { seoTitle: body.seoTitle }),
        ...(body.seoDescription !== undefined && { seoDescription: body.seoDescription }),
        ...(body.canonicalUrl !== undefined && { canonicalUrl: body.canonicalUrl }),
        ...(body.robots !== undefined && { robots: body.robots }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(publishedAtValue && { publishedAt: publishedAtValue }),
      },
    });
    return NextResponse.json(checklist);
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "slug 已存在" }, { status: 409 });
    }
    if (e.code === "P2025") {
      return NextResponse.json({ error: "清单不存在" }, { status: 404 });
    }
    console.error("Admin checklist update error:", e);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// DELETE /api/admin/checklists/[id] — delete checklist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  try {
    const { id } = await params;
    await prisma.checklist.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === "P2025") {
      return NextResponse.json({ error: "清单不存在" }, { status: 404 });
    }
    console.error("Admin checklist delete error:", e);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
