// GET /api/tools/reviews?toolKey=xxx — get approved reviews for a tool
// POST /api/tools/reviews — create a new review (login required)

import { NextResponse } from "next/server";
import { requireLogin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { validateRating, validateContent, hashIP, getDailyReviewPoints } from "@/lib/tool-reviews/validation";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const toolKey = url.searchParams.get("toolKey");

  if (!toolKey) {
    return NextResponse.json({ error: "toolKey 是必需的" }, { status: 400 });
  }

  try {
    // Get approved reviews
    const reviews = await prisma.toolReview.findMany({
      where: { toolKey, status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        rating: true,
        content: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    });

    // Get stats
    const stats = await prisma.toolReview.aggregate({
      where: { toolKey, status: "approved" },
      _avg: { rating: true },
      _count: { id: true },
    });

    // Mask user info
    const maskedReviews = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      userName: r.user?.name || r.user?.email?.split("@")[0] || "匿名用户",
    }));

    return NextResponse.json({
      reviews: maskedReviews,
      avgRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0,
      reviewCount: stats._count.id,
    });
  } catch (error) {
    console.error("[Reviews GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const res = await requireLogin();
  if ("error" in res) return res.error;

  const { session } = res;
  const userId = session.user.id;

  try {
    const body = await req.json();
    const { toolKey, rating, content } = body;

    // Validate
    if (!toolKey || typeof toolKey !== "string" || !toolKey.trim()) {
      return NextResponse.json({ error: "toolKey 不能为空" }, { status: 400 });
    }

    const ratingResult = validateRating(rating);
    if (!ratingResult.valid) {
      return NextResponse.json({ error: ratingResult.error }, { status: 400 });
    }

    const contentResult = validateContent(content);
    if (!contentResult.valid) {
      return NextResponse.json({ error: contentResult.error }, { status: 400 });
    }

    // Daily submission limit: max 3 per user per tool per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = await prisma.toolReview.count({
      where: {
        userId,
        toolKey: toolKey.trim(),
        createdAt: { gte: today, lt: tomorrow },
      },
    });

    if (todayCount >= 3) {
      return NextResponse.json(
        { error: "今日对该工具的短评已达上限（3条）" },
        { status: 429 }
      );
    }

    // Check daily point cap
    const { canEarn } = await getDailyReviewPoints(prisma, userId);

    // Create review
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const ua = req.headers.get("user-agent") || "";

    const review = await prisma.toolReview.create({
      data: {
        userId,
        toolKey: toolKey.trim(),
        rating: rating as number,
        content: content.trim(),
        status: "pending",
        ipHash: hashIP(ip),
        userAgent: ua.slice(0, 200),
      },
    });

    // Award points if within daily cap
    let pointsAwarded = false;
    if (canEarn) {
      await prisma.$transaction(async (tx) => {
        // Double-check cap inside transaction
        const todayPoints = await tx.pointLedger.aggregate({
          where: {
            userId,
            type: "tool_review",
            createdAt: { gte: today, lt: tomorrow },
          },
          _sum: { points: true },
        });

        const earned = (todayPoints._sum?.points || 0) as number;
        if (earned < 30) {
          await tx.pointLedger.create({
            data: {
              userId,
              type: "tool_review",
              points: 10,
              reason: "工具短评奖励",
              relatedId: review.id,
            },
          });
          await tx.user.update({
            where: { id: userId },
            data: { points: { increment: 10 } },
          });
          await tx.toolReview.update({
            where: { id: review.id },
            data: { pointsAwarded: true },
          });
          pointsAwarded = true;
        }
      });
    }

    return NextResponse.json(
      {
        review: { id: review.id, status: review.status },
        pointsAwarded,
        message: pointsAwarded ? "短评已提交，获得 +10 积分" : "短评已提交，等待审核（今日积分已达上限）",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Reviews POST Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
