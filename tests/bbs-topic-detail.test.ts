import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("BBS Topic Detail Page", () => {
  const pagePath = path.join(process.cwd(), "src/app/(public)/bbs/[slug]/page.tsx");

  it("page exists", () => {
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  it("has force-dynamic", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("force-dynamic");
  });

  it("uses /bbs canonical (not /community)", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain('buildCanonical(`/bbs/${slug}`)');
    expect(content).not.toContain('href="/community"');
  });

  it("has breadcrumb with /bbs links", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain('href="/bbs"');
    expect(content).toContain('href={`/bbs/category/${post.category.key}`}');
  });

  it("has floor-style comments with #number", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("#");
    expect(content).toContain("index + 2");
  });

  it("has right sidebar with topic info", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("话题信息");
    expect(content).toContain("浏览");
    expect(content).toContain("回复");
  });

  it("has author trust card", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("作者信息");
  });

  it("has action buttons (like, bookmark, share, report)", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("点赞");
    expect(content).toContain("收藏");
    expect(content).toContain("分享");
    expect(content).toContain("举报");
  });

  it("shows locked notice", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("该帖已锁定");
  });

  it("admin actions only visible to admin", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("isAdmin");
    expect(content).toContain("管理员操作");
  });

  it("does not leak email/points/password/token", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).not.toMatch(/\.password/);
    expect(content).not.toMatch(/\.points\b/);
    expect(content).not.toMatch(/session\.token/);
    expect(content).toContain("maskEmail");
  });
});
