/**
 * v1.20.42.18.6.4: Community Forum Product Upgrade Tests
 * Tests DB consistency, schema upgrades, API authorization, and core forum flows
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("v18.6.4 — DB Consistency & Schema", () => {
  it("schema should have ForumPost.tags field", () => {
    const schema = fs.readFileSync(path.join(process.cwd(), "prisma/schema.prisma"), "utf-8");
    expect(schema).toContain("tags");
    expect(schema).toContain("isSolved");
    expect(schema).toContain("acceptedCommentId");
    expect(schema).toContain("isFeatured");
    expect(schema).toContain("relatedTool");
    expect(schema).toContain("relatedGuideId");
    expect(schema).toContain("relatedChecklistId");
    expect(schema).toContain("relatedTaskChainType");
  });

  it("schema should have ForumComment.floorNumber and isAccepted", () => {
    const schema = fs.readFileSync(path.join(process.cwd(), "prisma/schema.prisma"), "utf-8");
    expect(schema).toContain("floorNumber");
    expect(schema).toContain("isAccepted");
  });

  it("schema should have ForumNotification model", () => {
    const schema = fs.readFileSync(path.join(process.cwd(), "prisma/schema.prisma"), "utf-8");
    expect(schema).toContain("model ForumNotification");
    expect(schema).toContain("forum_notifications");
  });

  it("schema should have ModerationLog model", () => {
    const schema = fs.readFileSync(path.join(process.cwd(), "prisma/schema.prisma"), "utf-8");
    expect(schema).toContain("model ModerationLog");
    expect(schema).toContain("moderation_logs");
  });

  it("migration SQL should not contain DROP TABLE", () => {
    const migration = fs.readFileSync(
      path.join(process.cwd(), "prisma/migrations/v18.6.4_forum_upgrade/migration.sql"), "utf-8"
    );
    const lines = migration.split("\n").filter(l => !l.trim().startsWith("--"));
    const activeSQL = lines.join("\n");
    expect(activeSQL).not.toMatch(/DROP\s+TABLE/i);
    expect(activeSQL).not.toMatch(/DROP\s+INDEX/i);
    expect(activeSQL).not.toMatch(/DELETE\s+FROM/i);
    expect(activeSQL).not.toMatch(/TRUNCATE/i);
  });

  it("migration should only use ADD COLUMN / CREATE TABLE / CREATE INDEX / ALTER", () => {
    const migration = fs.readFileSync(
      path.join(process.cwd(), "prisma/migrations/v18.6.4_forum_upgrade/migration.sql"), "utf-8"
    );
    expect(migration).toMatch(/ADD COLUMN IF NOT EXISTS/i);
    expect(migration).toMatch(/CREATE TABLE IF NOT EXISTS/i);
    expect(migration).toMatch(/CREATE INDEX IF NOT EXISTS/i);
  });
});

describe("v18.6.4 — No Independent Forum User System", () => {
  it("should not have ForumUser/CommunityUser/ForumAccount/ForumSession in schema", () => {
    const schema = fs.readFileSync(path.join(process.cwd(), "prisma/schema.prisma"), "utf-8");
    expect(schema).not.toContain("model ForumUser");
    expect(schema).not.toContain("model CommunityUser");
    expect(schema).not.toContain("model ForumAccount");
    expect(schema).not.toContain("model ForumSession");
    expect(schema).not.toContain("model ForumAuth");
  });

  it("should not have independent forum login/register pages", () => {
    const srcDir = path.join(process.cwd(), "src/app");
    function findFiles(dir: string, pattern: string): string[] {
      if (!fs.existsSync(dir)) return [];
      const results: string[] = [];
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...findFiles(fullPath, pattern));
        } else if (entry.name.includes(pattern)) {
          results.push(fullPath);
        }
      }
      return results;
    }
    expect(findFiles(srcDir, "forum-login").length).toBe(0);
    expect(findFiles(srcDir, "forum-register").length).toBe(0);
    expect(findFiles(srcDir, "community-login").length).toBe(0);
    expect(findFiles(srcDir, "community-register").length).toBe(0);
  });

  it("ForumPost.userId should reference User.id", () => {
    const schema = fs.readFileSync(path.join(process.cwd(), "prisma/schema.prisma"), "utf-8");
    const postModel = schema.match(/model ForumPost \{[\s\S]*?\}/)?.[0] || "";
    expect(postModel).toContain("userId");
    expect(postModel).toContain("User");
  });
});

describe("v18.6.4 — API Routes Exist", () => {
  it("accept answer API route should exist", () => {
    const apiPath = path.join(process.cwd(), "src/app/api/forum/posts/[slug]/accept/route.ts");
    expect(fs.existsSync(apiPath)).toBe(true);
  });

  it("notifications API route should exist", () => {
    const apiPath = path.join(process.cwd(), "src/app/api/forum/notifications/route.ts");
    expect(fs.existsSync(apiPath)).toBe(true);
  });

  it("community stats API route should exist", () => {
    const apiPath = path.join(process.cwd(), "src/app/api/forum/stats/route.ts");
    expect(fs.existsSync(apiPath)).toBe(true);
  });

  it("moderation log API route should exist", () => {
    const apiPath = path.join(process.cwd(), "src/app/api/admin/community/moderation-log/route.ts");
    expect(fs.existsSync(apiPath)).toBe(true);
  });
});

describe("v18.6.4 — Frontend Pages Exist", () => {
  it("community home page should exist and be upgraded (canonical /bbs)", () => {
    // /bbs is the canonical community route (menu + footer entry point)
    const bbsPath = path.join(process.cwd(), "src/app/(public)/bbs/page.tsx");
    expect(fs.existsSync(bbsPath)).toBe(true);
    const bbsContent = fs.readFileSync(bbsPath, "utf-8");
    expect(bbsContent).toContain("force-dynamic");
    expect(bbsContent.length).toBeGreaterThan(5000); // Upgraded page should be substantial
    // /community should redirect to /bbs
    const communityPath = path.join(process.cwd(), "src/app/(public)/community/page.tsx");
    expect(fs.existsSync(communityPath)).toBe(true);
    const communityContent = fs.readFileSync(communityPath, "utf-8");
    expect(communityContent).toContain("redirect");
    expect(communityContent).toContain("/bbs");
  });

  it("topic detail page should exist with upgraded features", () => {
    // /bbs/[slug] is the canonical topic detail route
    const bbsDetailPath = path.join(process.cwd(), "src/app/(public)/bbs/[slug]/page.tsx");
    expect(fs.existsSync(bbsDetailPath)).toBe(true);
    const bbsDetailContent = fs.readFileSync(bbsDetailPath, "utf-8");
    expect(bbsDetailContent).toContain("force-dynamic");
    // /community/t/[slug] should redirect to /bbs/[slug]
    const communityDetailPath = path.join(process.cwd(), "src/app/(public)/community/t/[slug]/page.tsx");
    expect(fs.existsSync(communityDetailPath)).toBe(true);
    const communityDetailContent = fs.readFileSync(communityDetailPath, "utf-8");
    expect(communityDetailContent).toContain("redirect");
  });

  it("topic detail client should exist", () => {
    const clientPath = path.join(process.cwd(), "src/app/(public)/community/t/[slug]/topic-detail-client.tsx");
    expect(fs.existsSync(clientPath)).toBe(true);
  });

  it("composer client should exist and be upgraded", () => {
    const clientPath = path.join(process.cwd(), "src/app/(public)/community/new/new-post-client.tsx");
    expect(fs.existsSync(clientPath)).toBe(true);
    const content = fs.readFileSync(clientPath, "utf-8");
    expect(content.length).toBeGreaterThan(5000);
  });

  it("workspace community page should exist", () => {
    const pagePath = path.join(process.cwd(), "src/app/(public)/workspace/community/page.tsx");
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  it("admin community dashboard should exist", () => {
    const pagePath = path.join(process.cwd(), "src/app/(admin)/admin/community/page.tsx");
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  it("admin posts page should exist with search", () => {
    const pagePath = path.join(process.cwd(), "src/app/(admin)/admin/community/posts/page.tsx");
    expect(fs.existsSync(pagePath)).toBe(true);
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("searchParams");
  });

  it("RelatedDiscussions component should exist", () => {
    const componentPath = path.join(process.cwd(), "src/components/community/related-discussions.tsx");
    expect(fs.existsSync(componentPath)).toBe(true);
  });
});

describe("v18.6.4 — Security Checks", () => {
  it("admin pages should use auth() + redirect pattern", () => {
    const adminPages = [
      "src/app/(admin)/admin/community/page.tsx",
      "src/app/(admin)/admin/community/posts/page.tsx",
      "src/app/(admin)/admin/community/comments/page.tsx",
      "src/app/(admin)/admin/community/flagged/page.tsx",
    ];
    for (const page of adminPages) {
      const content = fs.readFileSync(path.join(process.cwd(), page), "utf-8");
      expect(content).toContain("auth()");
      expect(content).toContain("redirect");
      expect(content).toContain("force-dynamic");
    }
  });

  it("should not use /admin/community/reports path", () => {
    const srcDir = path.join(process.cwd(), "src");
    function checkDir(dir: string): boolean {
      if (!fs.existsSync(dir)) return false;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "reports" && dir.includes("admin/community")) return true;
          if (checkDir(fullPath)) return true;
        }
      }
      return false;
    }
    expect(checkDir(srcDir)).toBe(false);
  });

  it("accept answer API should require auth", () => {
    const apiPath = path.join(process.cwd(), "src/app/api/forum/posts/[slug]/accept/route.ts");
    const content = fs.readFileSync(apiPath, "utf-8");
    expect(content).toContain("requireAuth") ;
  });

  it("notifications API should require auth", () => {
    const apiPath = path.join(process.cwd(), "src/app/api/forum/notifications/route.ts");
    const content = fs.readFileSync(apiPath, "utf-8");
    expect(content).toContain("requireAuth") ;
  });

  it("moderation log API should require admin", () => {
    const apiPath = path.join(process.cwd(), "src/app/api/admin/community/moderation-log/route.ts");
    const content = fs.readFileSync(apiPath, "utf-8");
    expect(content).toContain("requireAdmin");
  });
});
