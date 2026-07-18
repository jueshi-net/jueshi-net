// GET /api/forum/trending - Content recommendations and rankings
// Supports: today, week, latest, replies, featured, unanswered, category, tag, new-user

import { NextRequest, NextResponse } from "next/server";
import {
  getTodaysHot,
  getWeeklyHot,
  getLatestDiscussions,
  getMostReplied,
  getFeaturedQuality,
  getUnanswered,
  getByCategory,
  getByTag,
  getNewUserFriendly,
  getTopContributors,
} from "@/lib/community/recommendations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "today";
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const category = searchParams.get("category") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const excludeSlug = searchParams.get("excludeSlug") || undefined;

    let posts;
    switch (type) {
      case "today":
        posts = await getTodaysHot(limit);
        break;
      case "week":
        posts = await getWeeklyHot(limit);
        break;
      case "latest":
        posts = await getLatestDiscussions(limit);
        break;
      case "replies":
        posts = await getMostReplied(limit);
        break;
      case "featured":
        posts = await getFeaturedQuality(limit);
        break;
      case "unanswered":
        posts = await getUnanswered(limit);
        break;
      case "category":
        if (!category) {
          return NextResponse.json({ error: "缺少 category 参数" }, { status: 400 });
        }
        posts = await getByCategory(category, excludeSlug || undefined, limit);
        break;
      case "tag":
        if (!tag) {
          return NextResponse.json({ error: "缺少 tag 参数" }, { status: 400 });
        }
        posts = await getByTag(tag, excludeSlug || undefined, limit);
        break;
      case "new-user":
        posts = await getNewUserFriendly(limit);
        break;
      case "contributors":
        const contributors = await getTopContributors(limit);
        return NextResponse.json({ type, contributors });
      default:
        return NextResponse.json({ error: `未知的推荐类型: ${type}` }, { status: 400 });
    }

    return NextResponse.json({ type, posts });
  } catch (error) {
    console.error("[Forum Trending API Error]", error);
    return NextResponse.json(
      { error: "获取推荐内容失败", code: "DATABASE_ERROR" },
      { status: 500 }
    );
  }
}
