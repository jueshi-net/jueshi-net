import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Community Route Redirect — /community → /bbs", () => {
  it("/community/page.tsx redirects to /bbs", () => {
    const p = path.join(process.cwd(), "src/app/(public)/community/page.tsx");
    expect(fs.existsSync(p)).toBe(true);
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("redirect");
    expect(content).toContain("/bbs");
  });

  it("/community/t/[slug]/page.tsx redirects to /bbs/[slug]", () => {
    const p = path.join(process.cwd(), "src/app/(public)/community/t/[slug]/page.tsx");
    expect(fs.existsSync(p)).toBe(true);
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("redirect");
    expect(content).toContain("/bbs/");
  });

  it("/community/new/page.tsx redirects to /bbs/new", () => {
    const p = path.join(process.cwd(), "src/app/(public)/community/new/page.tsx");
    expect(fs.existsSync(p)).toBe(true);
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("redirect");
    expect(content).toContain("/bbs/new");
  });

  it("/community/c/[slug]/page.tsx redirects to /bbs/category/[key]", () => {
    const p = path.join(process.cwd(), "src/app/(public)/community/c/[slug]/page.tsx");
    expect(fs.existsSync(p)).toBe(true);
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("redirect");
    expect(content).toContain("/bbs/category/");
  });

  it("/community/[slug]/page.tsx redirects to /bbs/[slug]", () => {
    const p = path.join(process.cwd(), "src/app/(public)/community/[slug]/page.tsx");
    expect(fs.existsSync(p)).toBe(true);
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("redirect");
    expect(content).toContain("/bbs/");
  });
});

describe("BBS Route Consistency", () => {
  it("header links to /bbs", () => {
    const p = path.join(process.cwd(), "src/components/layout/header.tsx");
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain('"/bbs"');
    // Should not have /community as primary link
    const communityLines = content.split("\n").filter(l => l.includes("/community"));
    expect(communityLines.length).toBe(0);
  });

  it("footer links to /bbs", () => {
    const p = path.join(process.cwd(), "src/components/layout/footer.tsx");
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain('"/bbs"');
    // Should not have /community as primary link
    const communityLines = content.split("\n").filter(l => l.includes("/community"));
    expect(communityLines.length).toBe(0);
  });

  it("no new /community main links in source (excluding redirect files and admin)", () => {
    // Check that no component or page uses href="/community" as a link
    // (redirect files are allowed to contain /bbs but not /community as href)
    const checkFiles = [
      "src/components/layout/header.tsx",
      "src/components/layout/footer.tsx",
      "src/components/layout/footer-new.tsx",
    ];
    for (const f of checkFiles) {
      const p = path.join(process.cwd(), f);
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf-8");
        expect(content).not.toContain('href="/community"');
      }
    }
  });
});
