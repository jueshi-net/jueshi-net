/**
 * v1.20.42.18.6.2: Community Forum MVP Tests
 * Tests DB consistency, API authorization, and core forum flows
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SCHEMA = fs.readFileSync(path.join(process.cwd(), "prisma/schema.prisma"), "utf-8");

// ===== DB Consistency Gate =====
describe("DB Consistency Gate", () => {
  it("should not have ForumUser model", () => {
    expect(SCHEMA).not.toMatch(/model\s+ForumUser\b/);
  });

  it("should not have CommunityUser model", () => {
    expect(SCHEMA).not.toMatch(/model\s+CommunityUser\b/);
  });

  it("should not have ForumAccount model", () => {
    expect(SCHEMA).not.toMatch(/model\s+ForumAccount\b/);
  });

  it("should not have ForumSession model", () => {
    expect(SCHEMA).not.toMatch(/model\s+ForumSession\b/);
  });

  it("should not have ForumAuth model", () => {
    expect(SCHEMA).not.toMatch(/model\s+ForumAuth\b/);
  });

  it("should have ForumLike model with userId → User.id", () => {
    expect(SCHEMA).toMatch(/model\s+ForumLike\b/);
    expect(SCHEMA).toMatch(/userId\s+String\s+@map\("user_id"\)/);
    expect(SCHEMA).toMatch(/user\s+User\s+@relation/);
  });

  it("should have ForumBookmark model with userId → User.id", () => {
    expect(SCHEMA).toMatch(/model\s+ForumBookmark\b/);
    expect(SCHEMA).toMatch(/userId\s+String\s+@map\("user_id"\)/);
  });

  it("should have ForumReport model with reporterId → User.id", () => {
    expect(SCHEMA).toMatch(/model\s+ForumReport\b/);
    expect(SCHEMA).toMatch(/reporterId\s+String\s+@map\("reporter_id"\)/);
  });

  it("should have ForumPost.userId → User.id", () => {
    const postSection = SCHEMA.match(/model\s+ForumPost\s+\{[^}]+\}/)?.[0] || "";
    expect(postSection).toMatch(/userId\s+String\s+@map\("user_id"\)/);
  });

  it("should have ForumComment.userId → User.id", () => {
    const commentSection = SCHEMA.match(/model\s+ForumComment\s+\{[^}]+\}/)?.[0] || "";
    expect(commentSection).toMatch(/userId\s+String\s+@map\("user_id"\)/);
  });

  it("should have HonorLog.userId → User.id", () => {
    const honorSection = SCHEMA.match(/model\s+HonorLog\s+\{[^}]+\}/)?.[0] || "";
    expect(honorSection).toMatch(/userId\s+String\s+@map\("user_id"\)/);
  });

  it("should have UserBadgeAward.userId → User.id", () => {
    const badgeSection = SCHEMA.match(/model\s+UserBadgeAward\s+\{[^}]+\}/)?.[0] || "";
    expect(badgeSection).toMatch(/userId\s+String\s+@map\("user_id"\)/);
  });
});

// ===== Code Reference Audit =====
describe("Code Reference Audit", () => {
  const srcDir = path.join(process.cwd(), "src");

  function searchSrc(pattern: string): boolean {
    const { execSync } = require("child_process");
    try {
      execSync(`grep -rn "${pattern}" src/ --include="*.ts" --include="*.tsx" -l`, { stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  }

  it("should not have ForumUser references in code", () => {
    expect(searchSrc("ForumUser")).toBe(false);
  });

  it("should not have CommunityUser references in code", () => {
    expect(searchSrc("CommunityUser")).toBe(false);
  });

  it("should not have ForumAccount references in code", () => {
    expect(searchSrc("ForumAccount")).toBe(false);
  });

  it("should not have ForumSession references in code", () => {
    expect(searchSrc("ForumSession")).toBe(false);
  });

  it("should not have forum login page", () => {
    const loginExists = fs.existsSync(path.join(srcDir, "app/forum/login/page.tsx")) ||
                        fs.existsSync(path.join(srcDir, "app/(forum)/login/page.tsx"));
    expect(loginExists).toBe(false);
  });

  it("should not have forum register page", () => {
    const regExists = fs.existsSync(path.join(srcDir, "app/forum/register/page.tsx")) ||
                      fs.existsSync(path.join(srcDir, "app/(forum)/register/page.tsx"));
    expect(regExists).toBe(false);
  });

  it("should have forum post API using requireAuth", () => {
    const postApi = fs.readFileSync(
      path.join(srcDir, "app/api/forum/posts/route.ts"), "utf-8"
    );
    expect(postApi).toMatch(/requireAuth/);
  });

  it("should have forum comment API using requireAuth", () => {
    const commentApi = fs.readFileSync(
      path.join(srcDir, "app/api/forum/posts/[slug]/comments/route.ts"), "utf-8"
    );
    expect(commentApi).toMatch(/requireAuth/);
  });

  it("should have admin community API using requireAdmin", () => {
    const adminPostsApi = fs.readFileSync(
      path.join(srcDir, "app/api/admin/community/posts/route.ts"), "utf-8"
    );
    expect(adminPostsApi).toMatch(/requireAdmin/);
  });

  it("should have like API using requireAuth", () => {
    const likeApi = fs.readFileSync(
      path.join(srcDir, "app/api/forum/posts/[slug]/like/route.ts"), "utf-8"
    );
    expect(likeApi).toMatch(/requireAuth/);
  });

  it("should have report API using requireAuth", () => {
    const reportApi = fs.readFileSync(
      path.join(srcDir, "app/api/forum/posts/[slug]/report/route.ts"), "utf-8"
    );
    expect(reportApi).toMatch(/requireAuth/);
  });

  it("should have admin report resolve API using requireAdmin", () => {
    const resolveApi = fs.readFileSync(
      path.join(srcDir, "app/api/admin/community/flagged/[id]/route.ts"), "utf-8"
    );
    expect(resolveApi).toMatch(/requireAdmin/);
  });

  it("should prevent self-like in like API", () => {
    const likeApi = fs.readFileSync(
      path.join(srcDir, "app/api/forum/posts/[slug]/like/route.ts"), "utf-8"
    );
    expect(likeApi).toMatch(/不能给自己|self.?like|自己的帖子/i);
  });

  it("should prevent self-report in report API", () => {
    const reportApi = fs.readFileSync(
      path.join(srcDir, "app/api/forum/posts/[slug]/report/route.ts"), "utf-8"
    );
    expect(reportApi).toMatch(/不能举报自己|self.?report|自己的内容/i);
  });

  it("should prevent duplicate likes with unique constraint", () => {
    expect(SCHEMA).toMatch(/@@unique\(\[userId,\s*postId\]\)/);
  });

  it("should prevent duplicate reports with unique constraint", () => {
    expect(SCHEMA).toMatch(/@@unique\(\[reporterId,\s*postId\]\)/);
  });

  it("should prevent duplicate bookmarks with unique constraint", () => {
    expect(SCHEMA).toMatch(/@@unique\(\[userId,\s*postId\]\)/);
  });
});

// ===== Privacy Audit =====
describe("Privacy Audit", () => {
  it("public user API should not return email", () => {
    const userApi = fs.readFileSync(
      path.join(process.cwd(), "src/app/api/community/user/[id]/route.ts"), "utf-8"
    );
    // The API should not include email in the response
    expect(userApi).not.toMatch(/email:\s*true/);
  });

  it("topic detail page should not expose email in serialized post", () => {
    const topicPage = fs.readFileSync(
      path.join(process.cwd(), "src/app/(public)/community/t/[slug]/page.tsx"), "utf-8"
    );
    // Should not include email in user select
    expect(topicPage).not.toMatch(/email:\s*true/);
  });

  it("topic detail client should not display email", () => {
    const clientPage = fs.readFileSync(
      path.join(process.cwd(), "src/app/(public)/community/t/[slug]/topic-detail-client.tsx"), "utf-8"
    );
    expect(clientPage).not.toMatch(/\.email/);
  });
});

// ===== MVP Feature Coverage =====
describe("MVP Feature Coverage", () => {
  it("should have community home page", () => {
    expect(fs.existsSync(path.join(process.cwd(), "src/app/(public)/community/page.tsx"))).toBe(true);
  });

  it("should have category page", () => {
    expect(fs.existsSync(path.join(process.cwd(), "src/app/(public)/community/c/[slug]/page.tsx"))).toBe(true);
  });

  it("should have topic detail page", () => {
    expect(fs.existsSync(path.join(process.cwd(), "src/app/(public)/community/t/[slug]/page.tsx"))).toBe(true);
  });

  it("should have new post page", () => {
    expect(fs.existsSync(path.join(process.cwd(), "src/app/(public)/community/new/page.tsx"))).toBe(true);
  });

  it("should have admin community dashboard", () => {
    expect(fs.existsSync(path.join(process.cwd(), "src/app/(admin)/admin/community/page.tsx"))).toBe(true);
  });

  it("should have admin posts page", () => {
    expect(fs.existsSync(path.join(process.cwd(), "src/app/(admin)/admin/community/posts/page.tsx"))).toBe(true);
  });

  it("should have admin comments page", () => {
    expect(fs.existsSync(path.join(process.cwd(), "src/app/(admin)/admin/community/comments/page.tsx"))).toBe(true);
  });

  it("should have admin reports page", () => {
    expect(fs.existsSync(path.join(process.cwd(), "src/app/(admin)/admin/community/flagged/page.tsx"))).toBe(true);
  });

  it("should have like API", () => {
    expect(fs.existsSync(path.join(process.cwd(), "src/app/api/forum/posts/[slug]/like/route.ts"))).toBe(true);
  });

  it("should have bookmark API", () => {
    expect(fs.existsSync(path.join(process.cwd(), "src/app/api/forum/posts/[slug]/bookmark/route.ts"))).toBe(true);
  });

  it("should have report API", () => {
    expect(fs.existsSync(path.join(process.cwd(), "src/app/api/forum/posts/[slug]/report/route.ts"))).toBe(true);
  });

  it("should have admin post moderation API", () => {
    expect(fs.existsSync(path.join(process.cwd(), "src/app/api/admin/community/posts/[id]/route.ts"))).toBe(true);
  });

  it("should have admin report resolve API", () => {
    expect(fs.existsSync(path.join(process.cwd(), "src/app/api/admin/community/flagged/[id]/route.ts"))).toBe(true);
  });

  it("should have admin community stats API", () => {
    expect(fs.existsSync(path.join(process.cwd(), "src/app/api/admin/community/stats/route.ts"))).toBe(true);
  });

  it("migration SQL should not contain DROP TABLE/INDEX", () => {
    const migration = fs.readFileSync(
      path.join(process.cwd(), "prisma/migrations/v18.6.2_forum_mvp/migration.sql"), "utf-8"
    );
    expect(migration).not.toMatch(/DROP\s+(TABLE|INDEX|COLUMN)/i);
  });

  it("migration SQL should not contain DELETE FROM", () => {
    const migration = fs.readFileSync(
      path.join(process.cwd(), "prisma/migrations/v18.6.2_forum_mvp/migration.sql"), "utf-8"
    );
    expect(migration).not.toMatch(/DELETE\s+FROM/i);
  });

  it("migration SQL should not contain TRUNCATE statement", () => {
    const migration = fs.readFileSync(
      path.join(process.cwd(), "prisma/migrations/v18.6.2_forum_mvp/migration.sql"), "utf-8"
    );
    // Remove SQL comments before checking
    const lines = migration.split("\n").filter(l => !l.trim().startsWith("--"));
    const code = lines.join("\n");
    expect(code).not.toMatch(/TRUNCATE\s+/i);
  });
});
