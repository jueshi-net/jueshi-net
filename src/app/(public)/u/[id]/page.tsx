import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserCommunityInfo } from "@/lib/honor-helpers";
import { UserTrustCard, type TrustCardData } from "@/components/community/user-trust-card";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true, communityProfile: { select: { displayName: true } } },
  });
  const name = user?.communityProfile?.displayName || user?.name || "用户";
  return {
    title: `${name} 的社区名片 - 绝世百宝箱`,
    description: `查看 ${name} 的社区资料、等级、荣誉值和勋章`,
    robots: { index: true, follow: true },
  };
}

export default async function PublicUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Get current user to check if viewing own profile
  const session = await auth();
  const isOwnProfile = session?.user?.id === id;

  const info = await getUserCommunityInfo(id);

  if (!info) {
    notFound();
  }

  // Check privacy
  if (!isOwnProfile && info.profile && !info.profile.isPublic) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">该用户的资料不公开。</p>
        <Link href="/bbs" className="text-teal-600 hover:underline mt-4 inline-block">
          ← 返回社区
        </Link>
      </div>
    );
  }

  const trustCardData: TrustCardData = {
    user: {
      id: info.user.id,
      name: info.user.name,
      image: info.user.image,
      role: info.user.role,
      membershipTier: info.user.membershipTier,
      growthValue: info.user.growthValue,
      levelKey: info.user.levelKey,
      honorScore: info.user.honorScore,
      points: info.user.points,
      createdAt: info.user.createdAt.toISOString(),
    },
    profile: info.profile
      ? {
          displayName: info.profile.displayName,
          bio: info.profile.bio,
          locationText: info.profile.locationText,
          publicTitle: info.profile.publicTitle,
          isPublic: info.profile.isPublic,
          joinedAtDisplayMode: info.profile.joinedAtDisplayMode,
        }
      : null,
    stat: info.stat,
    badges: info.badges,
    level: info.level,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Link
        href="/bbs"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        返回社区
      </Link>

      <UserTrustCard data={trustCardData} isOwnProfile={isOwnProfile} />

      {/* Explanation section for own profile */}
      {isOwnProfile && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-2">
          <h3 className="font-semibold text-blue-900 text-sm">积分、成长值、荣誉值的区别</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>💰 <strong>积分</strong>：可消费资产，用于兑换会员、小权益。签到/任务获得。</li>
            <li>📈 <strong>成长值</strong>：等级经验值，不可消费。用于升级，来自签到、任务、发帖等。代表活跃度。</li>
            <li>🏆 <strong>荣誉值</strong>：可信度背书，不可消费。来自被采纳、被加精、有效举报等。代表社区信任。</li>
          </ul>
          <p className="text-xs text-blue-500">积分余额仅自己可见，不会公开展示。</p>
        </div>
      )}
    </div>
  );
}
