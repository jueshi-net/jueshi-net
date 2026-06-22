import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserCommunityInfo } from "@/lib/honor-helpers";

// GET /api/community/user/[id] — public community profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const info = await getUserCommunityInfo(id);

    if (!info) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // Check if profile is public
    if (info.profile && !info.profile.isPublic) {
      return NextResponse.json({ error: "该用户资料不公开" }, { status: 403 });
    }

    // Return public data only — NO email, NO phone, NO points (unless own profile)
    return NextResponse.json({
      user: {
        id: info.user.id,
        name: info.user.name,
        image: info.user.image,
        role: info.user.role,
        membershipTier: info.user.membershipTier,
        growthValue: info.user.growthValue,
        levelKey: info.user.levelKey,
        honorScore: info.user.honorScore,
        createdAt: info.user.createdAt,
      },
      profile: info.profile,
      stat: info.stat,
      badges: info.badges,
      level: info.level,
    });
  } catch (error) {
    console.error("[Community User GET Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
