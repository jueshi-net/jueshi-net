import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Check if user is admin
    const session = await auth();
    const isAdmin = session?.user?.role === "admin" || session?.user?.role === "ADMIN";

    // Non-admin can only see published articles
    const where: Record<string, unknown> = {};
    if (status && status !== "all") {
      // Admin can filter by status; non-admin always sees published only
      if (isAdmin) {
        where.status = status;
      } else {
        where.status = "published";
      }
    } else if (!isAdmin) {
      // Default for non-admin: only published
      where.status = "published";
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }],
    });
    return NextResponse.json({ success: true, data: articles });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const article = await prisma.article.create({
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content,
        excerpt: body.excerpt,
        coverImage: body.coverImage,
        author: body.author,
        status: body.status || "draft",
        publishedAt: body.status === "published" ? new Date() : null,
      },
    });
    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create article" }, { status: 500 });
  }
}
