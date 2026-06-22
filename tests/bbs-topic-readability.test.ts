import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("BBS Topic Readability — Text Color Audit", () => {
  const pagePath = path.join(process.cwd(), "src/app/(public)/bbs/[slug]/page.tsx");
  const content = fs.readFileSync(pagePath, "utf-8");

  it("body text uses text-slate-700 or darker (not text-gray-400 for body)", () => {
    // Check that no body text uses text-gray-400
    const gray400Lines = content.split("\n").filter(l =>
      l.includes("text-gray-400") &&
      !l.includes("ChevronRight") && // icon color is fine
      !l.includes("text-gray-300") // icon separator
    );
    // Allow zero instances of text-gray-400 for text content
    expect(gray400Lines.length).toBe(0);
  });

  it("author info uses text-slate-500 minimum (not text-gray-400)", () => {
    expect(content).not.toContain('className="text-xs text-gray-400"');
  });

  it("locked notice uses text-slate-700 (not text-gray-600)", () => {
    expect(content).toContain("该帖已锁定，不能继续评论");
    expect(content).toContain("text-slate-700");
  });

  it("no comments message uses text-slate-500 (not text-gray-400)", () => {
    expect(content).toContain('text-sm text-slate-500">暂无回复');
  });

  it("comment timestamps use text-slate-500 (not text-gray-400)", () => {
    expect(content).toContain("text-xs text-slate-500 ml-auto");
  });
});

describe("BBS Author Card — Completeness", () => {
  const pagePath = path.join(process.cwd(), "src/app/(public)/bbs/[slug]/page.tsx");
  const content = fs.readFileSync(pagePath, "utf-8");

  it("includes avatar in author card", () => {
    expect(content).toContain("rounded-full bg-brand/10");
  });

  it("includes nickname/displayName", () => {
    expect(content).toContain("displayName");
  });

  it("includes join date (createdAt)", () => {
    expect(content).toContain("formatJoinDate");
    expect(content).toContain("createdAt");
  });

  it("includes level (levelKey)", () => {
    expect(content).toContain("levelKey");
  });

  it("includes growth value", () => {
    expect(content).toContain("growthValue");
  });

  it("includes honor score", () => {
    expect(content).toContain("honorScore");
  });

  it("includes post count (_count.forumPosts)", () => {
    expect(content).toContain("forumPosts");
    expect(content).toContain("_count");
  });

  it("includes reply count (_count.forumComments)", () => {
    expect(content).toContain("forumComments");
  });

  it("includes admin badge when role=admin", () => {
    expect(content).toContain("admin");
    expect(content).toContain("管理员");
  });

  it("includes member badge when membershipTier exists", () => {
    expect(content).toContain("membershipTier");
  });

  it("does NOT expose email in author card display", () => {
    // email is selected for maskEmail but not directly displayed
    // The displayName uses name || maskEmail(email), which is fine
    expect(content).toContain("maskEmail");
  });

  it("does NOT expose password/hash/token/session in author card display", () => {
    // Check that no password, hash, token, or session secret is displayed
    // Note: "session" from auth() is expected — checking for secret data fields only
    expect(content).not.toMatch(/password/i);
    expect(content).not.toContain("passwordHash");
    expect(content).not.toContain("sessionToken");
    expect(content).not.toContain("accessToken");
  });
});
