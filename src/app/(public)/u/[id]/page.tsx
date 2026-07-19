import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserCommunityInfo } from "@/lib/honor-helpers";
import { UserProfileTabs } from "@/components/community/user-profile-tabs";
import { CommunityProfileCard, type ProfileTask } from "@/components/community/CommunityProfileCard";
import { auth } from "@/lib/auth";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import { BreadcrumbBar } from "@/components/design-system/BreadcrumbBar";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Star,
  CheckCircle,
  Award,
  Calendar,
  MapPin,
  Lock,
} from "lucide-react";
import {
  buildProfileJsonLd,
  renderJsonLd,
} from "@/lib/community/structured-data";
import { GROWTH_TASKS, getUserTaskStatus } from "@/lib/growth-tasks";
import { getTodayDateKey } from "@/lib/date-utils";

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

  const session = await auth();
  const isOwnProfile = session?.user?.id === id;

  const info = await getUserCommunityInfo(id);

  if (!info) {
    notFound();
  }

  // Check privacy
  if (!isOwnProfile && info.profile && !info.profile.isPublic) {
    return (
      <JueshiV4PublicShell>
        <div className="min-h-screen bg-bg">
          <div className="max-w-[1200px] mx-auto px-4 py-6">
            <BreadcrumbBar
              items={[
                { title: "首页", href: "/" },
                { title: "社区论坛", href: "/bbs" },
                { title: "用户名片" },
              ]}
            />
            <div className="max-w-md mx-auto py-16 text-center">
              <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">该用户的资料不公开。</p>
              <Link
                href="/bbs"
                className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand-dark"
              >
                <ArrowLeft className="w-4 h-4" />
                返回社区
              </Link>
            </div>
          </div>
        </div>
      </JueshiV4PublicShell>
    );
  }

  // Fetch user's published posts
  const userPosts = await prisma.forumPost.findMany({
    where: { userId: id, status: "published" },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 10,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      viewCount: true,
      commentCount: true,
      isPinned: true,
      isFeatured: true,
      isSolved: true,
      createdAt: true,
      category: { select: { id: true, key: true, name: true } },
    },
  });

  // Fetch user's comments (answers)
  const userComments = await prisma.forumComment.findMany({
    where: { userId: id, status: "published" },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      content: true,
      createdAt: true,
      isAccepted: true,
      post: {
        select: { id: true, slug: true, title: true },
      },
    },
  });

  // Fetch all levels for growth progress
  const allLevels = await prisma.userLevel.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { key: true, name: true, minGrowth: true, maxGrowth: true, iconText: true, color: true },
  });

  // Fetch all forum badges (to show unearned ones too)
  const allForumBadges = await prisma.userBadge.findMany({
    where: { category: "forum", isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      key: true,
      name: true,
      description: true,
      iconText: true,
      color: true,
      category: true,
      conditionText: true,
    },
  });

  // Map earned badges
  const earnedBadgeKeys = new Set(info.badges.map((b) => b.key));
  const allForumBadgesWithData = allForumBadges.map((b) => ({
    ...b,
    awardedAt: earnedBadgeKeys.has(b.key)
      ? info.badges.find((eb) => eb.key === b.key)?.awardedAt
      : undefined,
  }));

  // Calculate growth progress
  const currentLevel = info.level;
  const currentLevelIndex = allLevels.findIndex((l) => l.key === (info.user.levelKey || "lv1"));
  const currentLevelFromAll = currentLevelIndex >= 0 ? allLevels[currentLevelIndex] : null;
  const nextLevel = currentLevelIndex >= 0 && currentLevelIndex < allLevels.length - 1
    ? allLevels[currentLevelIndex + 1]
    : null;
  const growthMin = currentLevel.minGrowth;
  const growthMax = nextLevel?.minGrowth || currentLevelFromAll?.maxGrowth || growthMin;
  const growthProgress = growthMax > growthMin
    ? Math.min(100, Math.round(((info.user.growthValue - growthMin) / (growthMax - growthMin)) * 100))
    : 100;
  const remainingToNext = nextLevel ? Math.max(0, growthMax - info.user.growthValue) : undefined;

  // Display name
  const displayName = info.profile?.displayName || info.user.name || "匿名用户";
  const isAdmin = info.user.role === "admin";
  const isMember = info.user.membershipTier !== "free";
  const joinDateMode = info.profile?.joinedAtDisplayMode || "date";
  const joinDateText = formatJoinDate(info.user.createdAt.toISOString(), joinDateMode);

  // Security: only fetch email for the profile owner
  const userEmail = isOwnProfile
    ? (await prisma.user.findUnique({ where: { id }, select: { email: true } }))?.email
    : undefined;

  // Fetch checkin data (always fetch - streak is public, button is own-only)
  const checkinData = await prisma.user.findUnique({
    where: { id },
    select: { checkinStreak: true, lastCheckinDate: true },
  });
  const todayKey = getTodayDateKey();
  const hasCheckedInToday = checkinData?.lastCheckinDate === todayKey;
  const checkinStreak = checkinData?.checkinStreak || 0;

  // Fetch today's task status (own profile only)
  let todayTasks: ProfileTask[] = [];
  if (isOwnProfile) {
    const taskStatusMap = await getUserTaskStatus(id);
    todayTasks = GROWTH_TASKS
      .filter((t) => t.isActive)
      .map((t) => {
        const status = taskStatusMap.get(t.key);
        return {
          key: t.key,
          title: t.title,
          completed: status?.completed || false,
          rewardGrowth: t.rewardGrowth,
        };
      });
  }

  // Stats
  const stat = info.stat;
  const stats = [
    { icon: FileText, label: "发帖", value: stat.postCount },
    { icon: MessageSquare, label: "回复", value: stat.commentCount },
    { icon: Star, label: "精华", value: stat.featuredPostCount },
    { icon: CheckCircle, label: "被采纳", value: stat.acceptedAnswerCount },
  ];

  // P4: SEO ProfilePage structured data
  const profileJsonLd = buildProfileJsonLd({
    userId: info.user.id,
    name: info.user.name,
    email: userEmail || "",
    role: info.user.role,
    honorScore: info.user.honorScore,
    postCount: info.stat?.postCount || 0,
    commentCount: info.stat?.commentCount || 0,
  });

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-bg">
        {/* P4: SEO ProfilePage JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: renderJsonLd(profileJsonLd) }}
        />

        {/* Breadcrumb */}
        <div className="bg-white border-b border-border-light">
          <div className="max-w-[1200px] mx-auto px-4 py-2.5">
            <BreadcrumbBar
              items={[
                { title: "首页", href: "/" },
                { title: "社区论坛", href: "/bbs" },
                { title: `${displayName} 的名片` },
              ]}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          {/* Back link */}
          <Link
            href="/bbs"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回社区
          </Link>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            {/* Left: CommunityProfileCard + Forum extras */}
            <aside className="space-y-4">
              {/* CommunityProfileCard - unified growth-oriented identity panel */}
              <CommunityProfileCard
                displayName={displayName}
                avatarUrl={info.user.image || undefined}
                levelKey={info.user.levelKey || "lv1"}
                levelLabel={currentLevel.name}
                levelIcon={currentLevel.iconText}
                levelColor={currentLevel.color}
                publicTitle={info.profile?.publicTitle}
                isAdmin={isAdmin}
                isMember={isMember}
                membershipTier={info.user.membershipTier}
                points={info.user.points}
                growthValue={info.user.growthValue}
                growthMin={growthMin}
                growthMax={growthMax}
                growthProgress={growthProgress}
                remainingToNext={remainingToNext}
                nextLevelName={nextLevel?.name || null}
                isMaxLevel={!nextLevel}
                isOwnProfile={isOwnProfile}
                checkinStreak={checkinStreak}
                hasCheckedInToday={hasCheckedInToday}
                todayTasks={todayTasks}
                badges={info.badges.map((b) => ({
                  key: b.key,
                  name: b.name,
                  iconText: b.iconText,
                  color: b.color,
                }))}
                honorScore={info.user.honorScore}
              />

              {/* Forum-specific extras (not in the identity card) */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                {/* Bio */}
                {info.profile?.bio && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {info.profile.bio}
                  </p>
                )}

                {/* Location + Join date */}
                <div className="space-y-1.5">
                  {info.profile?.locationText && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {info.profile.locationText}
                    </div>
                  )}
                  {joinDateText && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {joinDateText}
                    </div>
                  )}
                </div>

                {/* Honor score (for other users - own profile shows it in the card) */}
                {!isOwnProfile && info.user.honorScore > 0 && (
                  <div className="flex items-center gap-1.5 pt-2 border-t border-gray-50">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-gray-600">社区荣誉</span>
                    <span className="text-sm font-bold text-amber-500 ml-auto">{info.user.honorScore}</span>
                  </div>
                )}
              </div>

              {/* Own profile: points explanation */}
              {isOwnProfile && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
                  <h3 className="font-semibold text-title text-sm">积分、成长值、荣誉值的区别</h3>
                  <ul className="text-xs text-gray-600 space-y-1.5">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#6C5DD3] mt-0.5">•</span>
                      <span><strong>积分</strong>：可消费资产，用于兑换会员、小权益。签到/任务获得。</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#6C5DD3] mt-0.5">•</span>
                      <span><strong>成长值</strong>：等级经验值，不可消费。用于升级，来自签到、任务、发帖等。代表活跃度。</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#6C5DD3] mt-0.5">•</span>
                      <span><strong>荣誉值</strong>：可信度背书，不可消费。来自被采纳、被加精、有效举报等。代表社区信任。</span>
                    </li>
                  </ul>
                  <p className="text-[10px] text-gray-400">积分余额仅自己可见，不会公开展示。</p>
                </div>
              )}
            </aside>

            {/* Right: Stats + Tabs */}
            <div className="space-y-4">
              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((statItem) => {
                  const Icon = statItem.icon;
                  return (
                    <div
                      key={statItem.label}
                      className="bg-white rounded-xl border border-border shadow-card p-4 text-center"
                    >
                      <div className="flex items-center justify-center mb-1">
                        <Icon className="w-4 h-4 text-accent" />
                      </div>
                      <div className="text-xl font-bold text-title">
                        {statItem.value}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {statItem.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tabs: Posts / Answers / Badges */}
              <UserProfileTabs
                posts={userPosts.map((p) => ({
                  ...p,
                  createdAt: p.createdAt.toISOString(),
                }))}
                comments={userComments.map((c) => ({
                  ...c,
                  createdAt: c.createdAt.toISOString(),
                }))}
                earnedBadges={info.badges.map((b) => ({ ...b, description: null, conditionText: null }))}
                allForumBadges={allForumBadgesWithData}
                isOwnProfile={isOwnProfile}
              />
            </div>
          </div>
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}

function formatJoinDate(dateStr: string, mode: string = "date"): string {
  const date = new Date(dateStr);
  if (mode === "hidden") return "";
  if (mode === "year") return `${date.getFullYear()}年加入`;
  if (mode === "month") return `${date.getFullYear()}年${date.getMonth() + 1}月加入`;
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日加入`;
}
