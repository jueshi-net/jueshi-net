/**
 * v1.20.42.18.6.1.1: Unified User System Verification Tests
 *
 * Verifies that the community/forum system fully reuses the existing User model.
 * No independent forum user system, no independent login/register, no role pollution.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const schemaPath = join(process.cwd(), "prisma", "schema.prisma");
const schema = readFileSync(schemaPath, "utf-8");

describe("v18.6.1.1 — Unified User System Schema Audit", () => {
  it("should NOT have model ForumUser", () => {
    expect(schema).not.toMatch(/model\s+ForumUser\s*\{/);
  });

  it("should NOT have model CommunityUser", () => {
    expect(schema).not.toMatch(/model\s+CommunityUser\s*\{/);
  });

  it("should NOT have model ForumAccount", () => {
    expect(schema).not.toMatch(/model\s+ForumAccount\s*\{/);
  });

  it("should NOT have model ForumSession", () => {
    expect(schema).not.toMatch(/model\s+ForumSession\s*\{/);
  });

  it("should NOT have model ForumAuth", () => {
    expect(schema).not.toMatch(/model\s+ForumAuth\s*\{/);
  });

  it("ForumPost.userId should reference User.id", () => {
    const forumPostMatch = schema.match(
      /model\s+ForumPost\s*\{[\s\S]*?\}/
    );
    expect(forumPostMatch).toBeTruthy();
    expect(forumPostMatch![0]).toMatch(/userId\s+String/);
    expect(forumPostMatch![0]).toMatch(
      /user\s+User\s+@relation\(fields:\s*\[userId\],\s*references:\s*\[id\]/
    );
  });

  it("ForumComment.userId should reference User.id", () => {
    const forumCommentMatch = schema.match(
      /model\s+ForumComment\s*\{[\s\S]*?\}/
    );
    expect(forumCommentMatch).toBeTruthy();
    expect(forumCommentMatch![0]).toMatch(/userId\s+String/);
    expect(forumCommentMatch![0]).toMatch(
      /user\s+User\s+@relation\(fields:\s*\[userId\],\s*references:\s*\[id\]/
    );
  });

  it("HonorLog.userId should reference User.id", () => {
    const honorLogMatch = schema.match(
      /model\s+HonorLog\s*\{[\s\S]*?\}/
    );
    expect(honorLogMatch).toBeTruthy();
    expect(honorLogMatch![0]).toMatch(/userId\s+String/);
    expect(honorLogMatch![0]).toMatch(
      /user\s+User\s+@relation\(fields:\s*\[userId\],\s*references:\s*\[id\]/
    );
  });

  it("UserBadgeAward.userId should reference User.id", () => {
    const badgeAwardMatch = schema.match(
      /model\s+UserBadgeAward\s*\{[\s\S]*?\}/
    );
    expect(badgeAwardMatch).toBeTruthy();
    expect(badgeAwardMatch![0]).toMatch(/userId\s+String/);
    expect(badgeAwardMatch![0]).toMatch(
      /user\s+User\s+@relation\(fields:\s*\[userId\],\s*references:\s*\[id\]/
    );
  });

  it("CommunityStat.userId should reference User.id", () => {
    const statMatch = schema.match(
      /model\s+CommunityStat\s*\{[\s\S]*?\}/
    );
    expect(statMatch).toBeTruthy();
    expect(statMatch![0]).toMatch(/userId\s+String/);
    expect(statMatch![0]).toMatch(
      /user\s+User\s+@relation\(fields:\s*\[userId\],\s*references:\s*\[id\]/
    );
  });

  it("UserCommunityProfile.userId should reference User.id", () => {
    const profileMatch = schema.match(
      /model\s+UserCommunityProfile\s*\{[\s\S]*?\}/
    );
    expect(profileMatch).toBeTruthy();
    expect(profileMatch![0]).toMatch(/userId\s+String/);
    expect(profileMatch![0]).toMatch(
      /user\s+User\s+@relation\(fields:\s*\[userId\],\s*references:\s*\[id\]/
    );
  });

  it("User.honorScore should be a field on User model (not a separate table)", () => {
    const userMatch = schema.match(/model\s+User\s*\{[\s\S]*?\n\}/);
    expect(userMatch).toBeTruthy();
    expect(userMatch![0]).toMatch(/honorScore\s+Int\s+@default\(0\)/);
  });

  it("Badge model (UserBadge) should NOT represent users, only badge definitions", () => {
    const badgeMatch = schema.match(
      /model\s+UserBadge\s*\{[\s\S]*?\}/
    );
    expect(badgeMatch).toBeTruthy();
    // UserBadge should NOT have email, password, or role fields
    expect(badgeMatch![0]).not.toMatch(/email/i);
    expect(badgeMatch![0]).not.toMatch(/password/i);
    expect(badgeMatch![0]).not.toMatch(/role/i);
  });
});

describe("v18.6.1.1 — Code Reference Audit", () => {
  it("should NOT have independent forum login page", () => {
    const forumLoginPaths = [
      "src/app/(public)/forum/login",
      "src/app/(public)/community/login",
      "src/app/(auth)/forum/login",
      "src/app/(auth)/community/login",
    ];
    for (const p of forumLoginPaths) {
      const fullPath = join(process.cwd(), p, "page.tsx");
      try {
        readFileSync(fullPath, "utf-8");
        throw new Error(`Found independent forum login page: ${p}`);
      } catch (e: any) {
        if (e.code !== "ENOENT") throw e;
      }
    }
  });

  it("should NOT have independent forum register page", () => {
    const forumRegisterPaths = [
      "src/app/(public)/forum/register",
      "src/app/(public)/community/register",
      "src/app/(auth)/forum/register",
      "src/app/(auth)/community/register",
    ];
    for (const p of forumRegisterPaths) {
      const fullPath = join(process.cwd(), p, "page.tsx");
      try {
        readFileSync(fullPath, "utf-8");
        throw new Error(`Found independent forum register page: ${p}`);
      } catch (e: any) {
        if (e.code !== "ENOENT") throw e;
      }
    }
  });

  it("forum posts API should use requireAuth from auth-guard", () => {
    const postsApi = readFileSync(
      join(
        process.cwd(),
        "src/app/api/forum/posts/route.ts"
      ),
      "utf-8"
    );
    expect(postsApi).toMatch(/import.*requireAuth.*from.*auth-guard/);
    expect(postsApi).toMatch(/requireAuth\(\)/);
  });

  it("forum comments API should use requireAuth from auth-guard", () => {
    const commentsApi = readFileSync(
      join(
        process.cwd(),
        "src/app/api/forum/posts/[slug]/comments/route.ts"
      ),
      "utf-8"
    );
    expect(commentsApi).toMatch(/import.*requireAuth.*from.*auth-guard/);
    expect(commentsApi).toMatch(/requireAuth\(\)/);
  });

  it("admin honor API should use requireAdmin from auth-guard", () => {
    const honorApi = readFileSync(
      join(
        process.cwd(),
        "src/app/api/admin/community/honor/route.ts"
      ),
      "utf-8"
    );
    expect(honorApi).toMatch(/import.*requireAdmin.*from.*auth-guard/);
    expect(honorApi).toMatch(/requireAdmin\(\)/);
  });

  it("admin badge grant API should use requireAdmin from auth-guard", () => {
    const grantApi = readFileSync(
      join(
        process.cwd(),
        "src/app/api/admin/community/badges/grant/route.ts"
      ),
      "utf-8"
    );
    expect(grantApi).toMatch(/import.*requireAdmin.*from.*auth-guard/);
    expect(grantApi).toMatch(/requireAdmin\(\)/);
  });
});

describe("v18.6.1.1 — Public Profile Privacy Audit", () => {
  it("public user API should NOT return email", () => {
    const api = readFileSync(
      join(process.cwd(), "src/app/api/community/user/[id]/route.ts"),
      "utf-8"
    );
    // The response object should not include email
    const responseMatch = api.match(
      /return NextResponse\.json\(\{[\s\S]*?\}\)/
    );
    expect(responseMatch).toBeTruthy();
    expect(responseMatch![0]).not.toMatch(/email/);
  });

  it("public user API should NOT return points", () => {
    const api = readFileSync(
      join(process.cwd(), "src/app/api/community/user/[id]/route.ts"),
      "utf-8"
    );
    const responseMatch = api.match(
      /return NextResponse\.json\(\{[\s\S]*?\}\)/
    );
    expect(responseMatch).toBeTruthy();
    expect(responseMatch![0]).not.toMatch(/points/);
  });

  it("UserTrustCard should only show points when isOwnProfile", () => {
    const component = readFileSync(
      join(process.cwd(), "src/components/community/user-trust-card.tsx"),
      "utf-8"
    );
    // Check that points display is guarded by isOwnProfile
    expect(component).toMatch(/isOwnProfile/);
    // Find the points display line and verify it's inside isOwnProfile conditional
    expect(component).toMatch(/\{isOwnProfile\s*&&[\s\S]*?points\}/);
  });

  it("UserTrustCard should NOT display email", () => {
    const component = readFileSync(
      join(process.cwd(), "src/components/community/user-trust-card.tsx"),
      "utf-8"
    );
    expect(component).not.toMatch(/user\.email/);
    expect(component).not.toMatch(/\{email\}/);
  });

  it("UserTrustCard should NOT display password or hash", () => {
    const component = readFileSync(
      join(process.cwd(), "src/components/community/user-trust-card.tsx"),
      "utf-8"
    );
    expect(component).not.toMatch(/password/i);
    expect(component).not.toMatch(/hash/i);
  });
});
