import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("BBS New Post Page — /bbs/new", () => {
  it("new post page exists", () => {
    const p = path.join(process.cwd(), "src/app/(public)/bbs/new/page.tsx");
    expect(fs.existsSync(p)).toBe(true);
  });

  it("has force-dynamic", () => {
    const p = path.join(process.cwd(), "src/app/(public)/bbs/new/page.tsx");
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("force-dynamic");
  });

  it("has clear title '发布新帖'", () => {
    const p = path.join(process.cwd(), "src/app/(public)/bbs/new/page.tsx");
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("发布新帖");
  });

  it("redirects unauthenticated users to login", () => {
    const p = path.join(process.cwd(), "src/app/(public)/bbs/new/page.tsx");
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("redirect");
    expect(content).toContain("/login?callbackUrl=/bbs/new");
  });

  it("uses /bbs links, not /community", () => {
    const p = path.join(process.cwd(), "src/app/(public)/bbs/new/page.tsx");
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain('href="/bbs"');
    expect(content).not.toContain('href="/community"');
  });

  it("has posting rules visible", () => {
    const p = path.join(process.cwd(), "src/app/(public)/bbs/new/page.tsx");
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("发帖须知");
  });
});

describe("BBS Post Form Component", () => {
  it("post form exists", () => {
    const p = path.join(process.cwd(), "src/components/bbs/post-form.tsx");
    expect(fs.existsSync(p)).toBe(true);
  });

  it("has tag input support", () => {
    const p = path.join(process.cwd(), "src/components/bbs/post-form.tsx");
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("tag");
    expect(content).toContain("tags");
  });

  it("redirects to /bbs/[slug] on success", () => {
    const p = path.join(process.cwd(), "src/components/bbs/post-form.tsx");
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("/bbs/");
    expect(content).toContain("data.slug");
  });

  it("has category visual selection (not just dropdown)", () => {
    const p = path.join(process.cwd(), "src/components/bbs/post-form.tsx");
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("type=\"button\"");
    expect(content).toContain("categoryId");
  });
});
