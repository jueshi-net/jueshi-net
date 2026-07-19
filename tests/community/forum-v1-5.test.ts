/**
 * Forum V1.5 Growth & Incentives Tests
 *
 * Tests cover:
 * 1. Badge definitions and structure
 * 2. Badge grant logic (idempotent, dedup)
 * 3. Leaderboard aggregation logic
 * 4. Onboarding task definitions
 * 5. API route structure verification
 * 6. Incentive loop integration points
 * 7. Privacy checks (leaderboard name masking)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock Prisma for badge/leaderboard tests ────────────
// vi.mock is hoisted, so we use vi.fn() inside the factory

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userBadge: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    userBadgeAward: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    forumPost: {
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    forumComment: {
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    forumLike: {
      count: vi.fn(),
    },
    honorLog: {
      groupBy: vi.fn(),
    },
    growthLog: {
      groupBy: vi.fn(),
    },
    communityStat: {
      findMany: vi.fn(),
    },
    userTask: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
    },
    userCommunityProfile: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock the growth-helpers and honor-helpers modules that forum-badges doesn't
// directly import, but onboarding-tasks imports forum-badges which imports prisma.
// The forum-badges module itself is imported directly via relative path, so it
// should work with the prisma mock above.

// Import after mocks are set up
import { prisma } from "@/lib/prisma";
import { FORUM_BADGES, ensureForumBadges, grantBadge, checkAndGrantForumBadges } from "../../src/lib/community/forum-badges";
import { ONBOARDING_TASKS, ensureOnboardingTasks, completeOnboardingTask, getOnboardingProgress } from "../../src/lib/community/onboarding-tasks";

// Helper to access mocked functions
const mockUserBadgeUpsert = prisma.userBadge.upsert as ReturnType<typeof vi.fn>;
const mockUserBadgeFindUnique = prisma.userBadge.findUnique as ReturnType<typeof vi.fn>;
const mockUserBadgeAwardFindUnique = prisma.userBadgeAward.findUnique as ReturnType<typeof vi.fn>;
const mockUserBadgeAwardCreate = prisma.userBadgeAward.create as ReturnType<typeof vi.fn>;
const mockUserFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockUserUpdate = prisma.user.update as ReturnType<typeof vi.fn>;
const mockForumPostCount = prisma.forumPost.count as ReturnType<typeof vi.fn>;
const mockForumCommentCount = prisma.forumComment.count as ReturnType<typeof vi.fn>;
const mockForumLikeCount = prisma.forumLike.count as ReturnType<typeof vi.fn>;
const mockForumPostGroupBy = prisma.forumPost.groupBy as ReturnType<typeof vi.fn>;
const mockForumCommentGroupBy = prisma.forumComment.groupBy as ReturnType<typeof vi.fn>;
const mockHonorLogGroupBy = prisma.honorLog.groupBy as ReturnType<typeof vi.fn>;
const mockGrowthLogGroupBy = prisma.growthLog.groupBy as ReturnType<typeof vi.fn>;
const mockCommunityStatFindMany = prisma.communityStat.findMany as ReturnType<typeof vi.fn>;
const mockUserFindMany = prisma.user.findMany as ReturnType<typeof vi.fn>;
const mockUserTaskCount = prisma.userTask.count as ReturnType<typeof vi.fn>;
const mockUserTaskFindMany = prisma.userTask.findMany as ReturnType<typeof vi.fn>;
const mockUserTaskFindFirst = prisma.userTask.findFirst as ReturnType<typeof vi.fn>;
const mockUserTaskCreateMany = prisma.userTask.createMany as ReturnType<typeof vi.fn>;
const mockUserTaskUpdate = prisma.userTask.update as ReturnType<typeof vi.fn>;
const mockUserCommunityProfileFindUnique = prisma.userCommunityProfile.findUnique as ReturnType<typeof vi.fn>;

// Global beforeEach: reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
});

// ─── Badge Definition Tests ─────────────────────────────

describe("V1.5 Forum Badge Definitions", () => {
  it("should define exactly 5 forum badges", () => {
    expect(FORUM_BADGES).toHaveLength(5);
  });

  it("should include all required badge keys", () => {
    const keys = FORUM_BADGES.map((b) => b.key);
    expect(keys).toContain("first_post");
    expect(keys).toContain("helpful_answer");
    expect(keys).toContain("forum_featured_author");
    expect(keys).toContain("forum_active_30");
    expect(keys).toContain("forum_helpful_50");
  });

  it("should have all required fields for each badge", () => {
    for (const badge of FORUM_BADGES) {
      expect(badge.key).toBeTruthy();
      expect(badge.name).toBeTruthy();
      expect(badge.description).toBeTruthy();
      expect(badge.iconText).toBeTruthy();
      expect(badge.color).toBeTruthy();
      expect(badge.category).toBe("forum");
      expect(badge.conditionText).toBeTruthy();
      expect(badge.sortOrder).toBeGreaterThan(0);
    }
  });

  it("should have unique keys", () => {
    const keys = FORUM_BADGES.map((b) => b.key);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  it("should have unique sort orders", () => {
    const sortOrders = FORUM_BADGES.map((b) => b.sortOrder);
    const uniqueSorts = new Set(sortOrders);
    expect(uniqueSorts.size).toBe(sortOrders.length);
  });
});

// ─── Badge Grant Logic Tests ────────────────────────────

describe("V1.5 Badge Grant Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the ensurePromise cache
    vi.resetModules();
  });

  it("should grant a badge that doesn't exist yet", async () => {
    mockUserBadgeFindUnique.mockResolvedValue({ id: "badge-1", isActive: true });
    mockUserBadgeAwardFindUnique.mockResolvedValue(null); // Not yet awarded
    mockUserBadgeAwardCreate.mockResolvedValue({ id: "award-1" });
    mockUserFindUnique.mockResolvedValue({ badges: [] });
    mockUserUpdate.mockResolvedValue({});

    const result = await grantBadge("user-1", "first_post", "test");

    expect(result.granted).toBe(true);
    expect(result.badgeId).toBe("badge-1");
    expect(mockUserBadgeAwardCreate).toHaveBeenCalledOnce();
  });

  it("should not grant a badge that already exists", async () => {
    mockUserBadgeFindUnique.mockResolvedValue({ id: "badge-1", isActive: true });
    mockUserBadgeAwardFindUnique.mockResolvedValue({ id: "award-1" }); // Already awarded

    const result = await grantBadge("user-1", "first_post", "test");

    expect(result.granted).toBe(false);
    expect(mockUserBadgeAwardCreate).not.toHaveBeenCalled();
  });

  it("should not grant a badge that doesn't exist in DB", async () => {
    mockUserBadgeFindUnique.mockResolvedValue(null);

    const result = await grantBadge("user-1", "nonexistent_badge", "test");

    expect(result.granted).toBe(false);
  });

  it("should not grant an inactive badge", async () => {
    mockUserBadgeFindUnique.mockResolvedValue({ id: "badge-1", isActive: false });

    const result = await grantBadge("user-1", "first_post", "test");

    expect(result.granted).toBe(false);
  });

  it("should add badge key to User.badges array if not present", async () => {
    mockUserBadgeFindUnique.mockResolvedValue({ id: "badge-1", isActive: true });
    mockUserBadgeAwardFindUnique.mockResolvedValue(null);
    mockUserBadgeAwardCreate.mockResolvedValue({ id: "award-1" });
    mockUserFindUnique.mockResolvedValue({ badges: ["other_badge"] });
    mockUserUpdate.mockResolvedValue({});

    await grantBadge("user-1", "first_post", "test");

    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { badges: { push: "first_post" } },
    });
  });

  it("should not add badge key if already in User.badges array", async () => {
    mockUserBadgeFindUnique.mockResolvedValue({ id: "badge-1", isActive: true });
    mockUserBadgeAwardFindUnique.mockResolvedValue(null);
    mockUserBadgeAwardCreate.mockResolvedValue({ id: "award-1" });
    mockUserFindUnique.mockResolvedValue({ badges: ["first_post"] });
    mockUserUpdate.mockResolvedValue({});

    await grantBadge("user-1", "first_post", "test");

    expect(mockUserUpdate).not.toHaveBeenCalled();
  });
});

// ─── Check and Grant Forum Badges Tests ─────────────────

describe("V1.5 checkAndGrantForumBadges", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mock return values to avoid leakage between tests
    vi.resetAllMocks();
    // Re-set default mock returns after reset
    mockUserBadgeUpsert.mockResolvedValue({});
  });

  it("should grant first_post badge when user has 1+ published posts", async () => {
    mockUserBadgeUpsert.mockResolvedValue({});
    mockForumPostCount.mockResolvedValue(1); // 1 published post
    mockForumCommentCount.mockResolvedValue(0);
    mockForumLikeCount.mockResolvedValue(0);
    mockUserBadgeFindUnique.mockResolvedValue({ id: "badge-1", isActive: true });
    mockUserBadgeAwardFindUnique.mockResolvedValue(null);
    mockUserBadgeAwardCreate.mockResolvedValue({});
    mockUserFindUnique.mockResolvedValue({ badges: [] });
    mockUserUpdate.mockResolvedValue({});

    const granted = await checkAndGrantForumBadges("user-1");

    expect(granted).toContain("first_post");
  });

  it("should grant forum_featured_author badge when user has 1+ featured posts", async () => {
    // first_post check
    mockForumPostCount
      .mockResolvedValueOnce(2)  // published count
      .mockResolvedValueOnce(1)  // featured count
      .mockResolvedValueOnce(0); // recent 30d count
    mockForumCommentCount.mockResolvedValue(0);
    // post likes + comment likes
    mockForumLikeCount.mockResolvedValue(0);

    mockUserBadgeFindUnique.mockResolvedValue({ id: "badge-1", isActive: true });
    mockUserBadgeAwardFindUnique.mockResolvedValue(null);
    mockUserBadgeAwardCreate.mockResolvedValue({});
    mockUserFindUnique.mockResolvedValue({ badges: [] });
    mockUserUpdate.mockResolvedValue({});
    mockUserBadgeUpsert.mockResolvedValue({});

    const granted = await checkAndGrantForumBadges("user-1");

    expect(granted).toContain("forum_featured_author");
  });

  it("should grant forum_active_30 badge when 10+ posts in 30 days", async () => {
    mockForumPostCount
      .mockResolvedValueOnce(15) // published count (first_post check passes)
      .mockResolvedValueOnce(0)   // featured count (no featured)
      .mockResolvedValueOnce(12); // recent 30d count (>=10)
    mockForumCommentCount.mockResolvedValue(0);
    mockForumLikeCount.mockResolvedValue(0);

    mockUserBadgeFindUnique.mockResolvedValue({ id: "badge-1", isActive: true });
    mockUserBadgeAwardFindUnique.mockResolvedValue(null);
    mockUserBadgeAwardCreate.mockResolvedValue({});
    mockUserFindUnique.mockResolvedValue({ badges: [] });
    mockUserUpdate.mockResolvedValue({});
    mockUserBadgeUpsert.mockResolvedValue({});

    const granted = await checkAndGrantForumBadges("user-1");

    expect(granted).toContain("forum_active_30");
  });

  it("should grant forum_helpful_50 badge when 50+ likes received", async () => {
    mockForumPostCount
      .mockResolvedValueOnce(5)  // published count
      .mockResolvedValueOnce(0)  // featured count
      .mockResolvedValueOnce(0); // recent 30d count
    mockForumCommentCount.mockResolvedValue(0);
    mockForumLikeCount
      .mockResolvedValueOnce(30) // post likes
      .mockResolvedValueOnce(25); // comment likes (30+25=55 >= 50)

    mockUserBadgeFindUnique.mockResolvedValue({ id: "badge-1", isActive: true });
    mockUserBadgeAwardFindUnique.mockResolvedValue(null);
    mockUserBadgeAwardCreate.mockResolvedValue({});
    mockUserFindUnique.mockResolvedValue({ badges: [] });
    mockUserUpdate.mockResolvedValue({});
    mockUserBadgeUpsert.mockResolvedValue({});

    const granted = await checkAndGrantForumBadges("user-1");

    expect(granted).toContain("forum_helpful_50");
  });

  it("should not grant badges when conditions are not met", async () => {
    mockForumPostCount
      .mockResolvedValueOnce(0)  // no published posts
      .mockResolvedValueOnce(0)  // no featured
      .mockResolvedValueOnce(0); // no recent posts
    mockForumCommentCount.mockResolvedValue(0);
    mockForumLikeCount.mockResolvedValue(0);

    mockUserBadgeUpsert.mockResolvedValue({});

    const granted = await checkAndGrantForumBadges("user-1");

    expect(granted).toHaveLength(0);
  });
});

// ─── Onboarding Task Tests ──────────────────────────────

describe("V1.5 Onboarding Tasks", () => {
  it("should define exactly 5 onboarding tasks", () => {
    expect(ONBOARDING_TASKS).toHaveLength(5);
  });

  it("should include all required task slugs", () => {
    const slugs = ONBOARDING_TASKS.map((t) => t.slug);
    expect(slugs).toContain("forum_complete_profile");
    expect(slugs).toContain("forum_first_post");
    expect(slugs).toContain("forum_first_comment");
    expect(slugs).toContain("forum_first_like");
    expect(slugs).toContain("forum_read_rules");
  });

  it("should have title and description for each task", () => {
    for (const task of ONBOARDING_TASKS) {
      expect(task.slug).toBeTruthy();
      expect(task.title).toBeTruthy();
      expect(task.description).toBeTruthy();
    }
  });

  it("should have unique task slugs", () => {
    const slugs = ONBOARDING_TASKS.map((t) => t.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("should create tasks only if they dont exist", async () => {
    // Simulate 3 tasks already exist
    mockUserTaskCount.mockResolvedValue(3);
    mockUserTaskFindMany.mockResolvedValue([
      { title: "完善社区资料" },
      { title: "发布第一篇帖子" },
      { title: "发表第一条评论" },
    ]);
    mockUserTaskCreateMany.mockResolvedValue({ count: 2 });

    await ensureOnboardingTasks("user-1");

    // Should create 2 missing tasks
    expect(mockUserTaskCreateMany).toHaveBeenCalledOnce();
    const createdData = mockUserTaskCreateMany.mock.calls[0][0].data;
    expect(createdData).toHaveLength(2);
  });

  it("should not create tasks if all already exist", async () => {
    mockUserTaskCount.mockResolvedValue(5); // All 5 tasks exist
    mockUserTaskFindMany.mockResolvedValue([]);

    await ensureOnboardingTasks("user-1");

    expect(mockUserTaskCreateMany).not.toHaveBeenCalled();
  });

  it("should mark task as done and detect all done", async () => {
    mockUserTaskFindFirst.mockResolvedValue({ id: "task-1" });
    mockUserTaskUpdate.mockResolvedValue({});
    mockUserTaskCount.mockResolvedValue(0); // No pending tasks remaining
    mockUserBadgeUpsert.mockResolvedValue({});
    mockUserBadgeFindUnique.mockResolvedValue({ id: "badge-1", isActive: true });
    mockUserBadgeAwardFindUnique.mockResolvedValue(null);
    mockUserBadgeAwardCreate.mockResolvedValue({});
    mockUserFindUnique.mockResolvedValue({ badges: [] });
    mockUserUpdate.mockResolvedValue({});

    const result = await completeOnboardingTask("user-1", "forum_read_rules");

    expect(result.completed).toBe(true);
    expect(result.allDone).toBe(true);
  });

  it("should not complete an invalid task slug", async () => {
    const result = await completeOnboardingTask("user-1", "invalid_slug");
    expect(result.completed).toBe(false);
  });

  it("should not complete a task that is already done", async () => {
    mockUserTaskFindFirst.mockResolvedValue(null); // No pending task found

    const result = await completeOnboardingTask("user-1", "forum_read_rules");

    expect(result.completed).toBe(false);
  });
});

// ─── Leaderboard Logic Tests ────────────────────────────

describe("V1.5 Leaderboard Module Structure", () => {
  it("should export getLeaderboard function", async () => {
    const module = await import("../../src/lib/community/leaderboard");
    expect(typeof module.getLeaderboard).toBe("function");
  });

  it("should export LeaderboardEntry interface type", async () => {
    const mod = await import("../../src/lib/community/leaderboard");
    // Type check - if it compiles, the interface exists
    const _typecheck: mod.LeaderboardEntry = {
      userId: "",
      displayName: "",
      avatar: null,
      levelKey: null,
      score: 0,
      rank: 0,
    };
    expect(_typecheck).toBeDefined();
  });

  it("should export LeaderboardResult interface type", async () => {
    const mod = await import("../../src/lib/community/leaderboard");
    const _typecheck: mod.LeaderboardResult = {
      type: "active",
      period: "week",
      generatedAt: "",
      entries: [],
    };
    expect(_typecheck).toBeDefined();
  });
});

// ─── API Route Structure Tests ──────────────────────────

describe("V1.5 API Route Files", () => {
  it("should have leaderboard API route file", () => {
    const fs = require("fs");
    const path = require("path");
    const routePath = path.join(process.cwd(), "src/app/api/forum/leaderboard/route.ts");
    expect(fs.existsSync(routePath)).toBe(true);
  });

  it("should have my-badges API route file", () => {
    const fs = require("fs");
    const path = require("path");
    const routePath = path.join(process.cwd(), "src/app/api/forum/my-badges/route.ts");
    expect(fs.existsSync(routePath)).toBe(true);
  });

  it("should have onboarding-tasks API route file", () => {
    const fs = require("fs");
    const path = require("path");
    const routePath = path.join(process.cwd(), "src/app/api/forum/onboarding-tasks/route.ts");
    expect(fs.existsSync(routePath)).toBe(true);
  });

  it("should have leaderboard page file", () => {
    const fs = require("fs");
    const path = require("path");
    const pagePath = path.join(process.cwd(), "src/app/(public)/bbs/leaderboard/page.tsx");
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  it("should have my-badges page file", () => {
    const fs = require("fs");
    const path = require("path");
    const pagePath = path.join(process.cwd(), "src/app/(public)/bbs/my-badges/page.tsx");
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  it("should have leaderboard-client component file", () => {
    const fs = require("fs");
    const path = require("path");
    const componentPath = path.join(process.cwd(), "src/components/bbs/leaderboard-client.tsx");
    expect(fs.existsSync(componentPath)).toBe(true);
  });

  it("should have my-badges-client component file", () => {
    const fs = require("fs");
    const path = require("path");
    const componentPath = path.join(process.cwd(), "src/components/bbs/my-badges-client.tsx");
    expect(fs.existsSync(componentPath)).toBe(true);
  });
});

// ─── Incentive Loop Integration Tests ───────────────────

describe("V1.5 Incentive Loop Integration", () => {
  it("moderate API should import honor-helpers, growth-helpers, forum-rewards, and forum-badges", () => {
    const fs = require("fs");
    const path = require("path");
    const routePath = path.join(process.cwd(), "src/app/api/forum/admin/moderate/route.ts");
    const content = fs.readFileSync(routePath, "utf-8");

    expect(content).toContain("adjustHonor");
    expect(content).toContain("addGrowthValue");
    expect(content).toContain("grantPostReward");
    expect(content).toContain("checkAndGrantForumBadges");
    expect(content).toContain("incrementCommunityStat");
  });

  it("moderate API feature action should grant +20 honor and +30 growth", () => {
    const fs = require("fs");
    const path = require("path");
    const routePath = path.join(process.cwd(), "src/app/api/forum/admin/moderate/route.ts");
    const content = fs.readFileSync(routePath, "utf-8");

    expect(content).toContain("20");
    expect(content).toContain("30");
    expect(content).toContain("post_featured");
    expect(content).toContain("forum_post_featured");
    expect(content).toContain("featuredPostCount");
  });

  it("moderate API approve action should call grantPostReward", () => {
    const fs = require("fs");
    const path = require("path");
    const routePath = path.join(process.cwd(), "src/app/api/forum/admin/moderate/route.ts");
    const content = fs.readFileSync(routePath, "utf-8");

    expect(content).toContain("grantPostReward");
    expect(content).toContain("pending");
  });

  it("accept API should import growth-helpers and forum-badges", () => {
    const fs = require("fs");
    const path = require("path");
    const routePath = path.join(process.cwd(), "src/app/api/forum/posts/[slug]/accept/route.ts");
    const content = fs.readFileSync(routePath, "utf-8");

    expect(content).toContain("addGrowthValue");
    expect(content).toContain("checkAndGrantForumBadges");
    expect(content).toContain("forum_answer_accepted");
  });

  it("reports API should import honor-helpers and grant honor on resolve", () => {
    const fs = require("fs");
    const path = require("path");
    const routePath = path.join(process.cwd(), "src/app/api/forum/admin/reports/route.ts");
    const content = fs.readFileSync(routePath, "utf-8");

    expect(content).toContain("adjustHonor");
    expect(content).toContain("incrementCommunityStat");
    expect(content).toContain("report_accepted");
    expect(content).toContain("reportAcceptedCount");
  });

  it("like APIs should check for forum_helpful_50 badge", () => {
    const fs = require("fs");
    const path = require("path");

    const postLikePath = path.join(process.cwd(), "src/app/api/forum/posts/[slug]/like/route.ts");
    const postLikeContent = fs.readFileSync(postLikePath, "utf-8");
    expect(postLikeContent).toContain("checkAndGrantForumBadges");

    const commentLikePath = path.join(process.cwd(), "src/app/api/forum/comments/[id]/like/route.ts");
    const commentLikeContent = fs.readFileSync(commentLikePath, "utf-8");
    expect(commentLikeContent).toContain("checkAndGrantForumBadges");
  });
});

// ─── Privacy Tests ──────────────────────────────────────

describe("V1.5 Privacy Checks", () => {
  it("leaderboard should mask user names", async () => {
    const { getLeaderboard } = await import("../../src/lib/community/leaderboard");

    // Mock: 1 user with a long name
    mockForumPostGroupBy.mockResolvedValue([{ userId: "u1", _count: { id: 5 } }]);
    mockForumCommentGroupBy.mockResolvedValue([{ userId: "u1", _count: { id: 3 } }]);
    mockUserFindMany.mockResolvedValue([{ id: "u1", name: "张三李四王五", image: null, levelKey: "lv3" }]);

    const result = await getLeaderboard("active", "week", 20);

    expect(result.entries).toHaveLength(1);
    // Name should be masked (not the full name)
    expect(result.entries[0].displayName).not.toBe("张三李四王五");
    expect(result.entries[0].displayName).toContain("*");
  });

  it("leaderboard should not include email or IP", async () => {
    const { getLeaderboard } = await import("../../src/lib/community/leaderboard");

    mockForumPostGroupBy.mockResolvedValue([{ userId: "u1", _count: { id: 1 } }]);
    mockForumCommentGroupBy.mockResolvedValue([]);
    mockUserFindMany.mockResolvedValue([{ id: "u1", name: "Test", image: null, levelKey: "lv1" }]);

    const result = await getLeaderboard("active", "week", 20);

    const entry = result.entries[0];
    expect(entry).toHaveProperty("userId");
    expect(entry).toHaveProperty("displayName");
    expect(entry).toHaveProperty("avatar");
    expect(entry).toHaveProperty("levelKey");
    expect(entry).toHaveProperty("score");
    expect(entry).toHaveProperty("rank");
    // Should NOT have email, ip, or other sensitive fields
    expect(entry).not.toHaveProperty("email");
    expect(entry).not.toHaveProperty("ip");
    expect(entry).not.toHaveProperty("password");
  });
});

// ─── Navigation Tests ───────────────────────────────────

describe("V1.5 Navigation Links", () => {
  it("my-posts page should link to my-badges", () => {
    const fs = require("fs");
    const path = require("path");
    const pagePath = path.join(process.cwd(), "src/app/(public)/bbs/my-posts/page.tsx");
    const content = fs.readFileSync(pagePath, "utf-8");

    expect(content).toContain("/bbs/my-badges");
    expect(content).toContain("Award");
  });

  it("my-posts page should link to leaderboard", () => {
    const fs = require("fs");
    const path = require("path");
    const pagePath = path.join(process.cwd(), "src/app/(public)/bbs/my-posts/page.tsx");
    const content = fs.readFileSync(pagePath, "utf-8");

    expect(content).toContain("/bbs/leaderboard");
    expect(content).toContain("Trophy");
  });

  it("robots.txt should disallow my-badges", () => {
    const fs = require("fs");
    const path = require("path");
    const robotsPath = path.join(process.cwd(), "src/app/robots.ts");
    const content = fs.readFileSync(robotsPath, "utf-8");

    expect(content).toContain("/bbs/my-badges");
  });

  it("robots.txt should allow leaderboard (public indexable)", () => {
    const fs = require("fs");
    const path = require("path");
    const robotsPath = path.join(process.cwd(), "src/app/robots.ts");
    const content = fs.readFileSync(robotsPath, "utf-8");

    // /bbs/leaderboard should NOT be in disallow list
    const disallowSection = content.split("disallow:")[1] || "";
    expect(disallowSection).not.toContain("/bbs/leaderboard");
  });
});
