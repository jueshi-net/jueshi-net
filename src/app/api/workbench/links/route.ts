// POST /api/workbench/links — create a new workbench link

import { NextResponse } from "next/server";
import { requireLogin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { validateUrl, validateTitle, validateDescription, getMaxLinks } from "@/lib/workbench/validation";

export async function GET(req: Request) {
  const res = await requireLogin();
  if ("error" in res) return res.error;

  const { session } = res;
  const userId = session.user.id;

  try {
    const links = await prisma.workbenchLink.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
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

    return NextResponse.json({ links });
  } catch (error) {
    console.error("[Workbench Links GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const res = await requireLogin();
  if ("error" in res) return res.error;

  const { session, role } = res;
  const userId = session.user.id;

  try {
    const body = await req.json();
    const { title, url, description, iconUrl, category } = body;

    // Validate
    const titleResult = validateTitle(title);
    if (!titleResult.valid) {
      return NextResponse.json({ error: titleResult.error }, { status: 400 });
    }

    const urlResult = validateUrl(url);
    if (!urlResult.valid) {
      return NextResponse.json({ error: urlResult.error }, { status: 400 });
    }

    const descResult = validateDescription(description);
    if (!descResult.valid) {
      return NextResponse.json({ error: descResult.error }, { status: 400 });
    }

    // Check limit
    const count = await prisma.workbenchLink.count({ where: { userId } });
    const maxLinks = getMaxLinks(role);
    if (count >= maxLinks) {
      return NextResponse.json(
        { error: `已达到自定义网址上限（${maxLinks}个），请删除一些后再添加` },
        { status: 409 }
      );
    }

    // Create
    const link = await prisma.workbenchLink.create({
      data: {
        userId,
        title: title.trim(),
        url: url.trim(),
        description: description?.trim() || null,
        iconUrl: iconUrl || null,
        category: category || null,
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

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    console.error("[Workbench Links POST Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
