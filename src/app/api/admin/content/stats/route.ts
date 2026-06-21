import { NextResponse } from "next/server";
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

// GET /api/admin/content/stats — aggregate content stats
export async function GET() {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  try {
    const [
      guideTotal,
      guidePublished,
      guideDraft,
      guideArchived,
      checklistTotal,
      checklistPublished,
      checklistDraft,
      checklistArchived,
      landingPageTotal,
      landingPagePublished,
      landingPageDraft,
      topicTotal,
      topicPublished,
      topicDraft,
    ] = await Promise.all([
      // Guides
      prisma.guide.count(),
      prisma.guide.count({ where: { status: "published" } }),
      prisma.guide.count({ where: { status: "draft" } }),
      prisma.guide.count({ where: { status: "archived" } }),
      // Checklists
      prisma.checklist.count(),
      prisma.checklist.count({ where: { status: "published" } }),
      prisma.checklist.count({ where: { status: "draft" } }),
      prisma.checklist.count({ where: { status: "archived" } }),
      // Landing pages
      prisma.landingPage.count(),
      prisma.landingPage.count({ where: { status: "published" } }),
      prisma.landingPage.count({ where: { status: "draft" } }),
      // Topics
      prisma.topic.count(),
      prisma.topic.count({ where: { status: "published" } }),
      prisma.topic.count({ where: { status: "draft" } }),
    ]);

    const publishedTotal =
      guidePublished + checklistPublished + landingPagePublished + topicPublished;
    const draftTotal =
      guideDraft + checklistDraft + landingPageDraft + topicDraft;

    return NextResponse.json({
      guides: {
        total: guideTotal,
        published: guidePublished,
        draft: guideDraft,
        archived: guideArchived,
      },
      checklists: {
        total: checklistTotal,
        published: checklistPublished,
        draft: checklistDraft,
        archived: checklistArchived,
      },
      landingPages: {
        total: landingPageTotal,
        published: landingPagePublished,
        draft: landingPageDraft,
      },
      topics: {
        total: topicTotal,
        published: topicPublished,
        draft: topicDraft,
      },
      summary: {
        published: publishedTotal,
        draft: draftTotal,
      },
    });
  } catch (e: any) {
    console.error("Admin content stats error:", e);
    return NextResponse.json({ error: "获取统计失败" }, { status: 500 });
  }
}
