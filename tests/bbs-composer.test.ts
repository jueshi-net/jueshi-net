import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("BBS Composer — Basic Capabilities", () => {
  const composerPath = path.join(process.cwd(), "src/components/bbs/bbs-composer.tsx");
  const formPath = path.join(process.cwd(), "src/components/bbs/post-form.tsx");

  it("bbs-composer.tsx exists", () => {
    expect(fs.existsSync(composerPath)).toBe(true);
  });

  it("has bold formatting button", () => {
    const c = fs.readFileSync(composerPath, "utf-8");
    expect(c).toContain("Bold");
    expect(c).toContain("**");
  });

  it("has italic formatting button", () => {
    const c = fs.readFileSync(composerPath, "utf-8");
    expect(c).toContain("Italic");
    expect(c).toContain("*");
  });

  it("has heading formatting button", () => {
    const c = fs.readFileSync(composerPath, "utf-8");
    expect(c).toContain("Heading");
    expect(c).toContain("## ");
  });

  it("has list formatting buttons", () => {
    const c = fs.readFileSync(composerPath, "utf-8");
    expect(c).toContain("ListOrdered");
    expect(c).toContain("- ");
  });

  it("has quote formatting button", () => {
    const c = fs.readFileSync(composerPath, "utf-8");
    expect(c).toContain("Quote");
    expect(c).toContain("> ");
  });

  it("has code formatting button", () => {
    const c = fs.readFileSync(composerPath, "utf-8");
    expect(c).toContain("Code");
    expect(c).toContain("`");
  });

  it("has link formatting button", () => {
    const c = fs.readFileSync(composerPath, "utf-8");
    expect(c).toContain("Link2");
    expect(c).toContain("](");
  });

  it("has emoji picker", () => {
    const c = fs.readFileSync(composerPath, "utf-8");
    expect(c).toContain("Smile");
    expect(c).toContain("EMOJI_LIST");
    expect(c).toContain("😀");
  });

  it("has preview mode", () => {
    const c = fs.readFileSync(composerPath, "utf-8");
    expect(c).toContain("showPreview");
    expect(c).toContain("预览");
  });

  it("post-form uses BbsComposer", () => {
    const c = fs.readFileSync(formPath, "utf-8");
    expect(c).toContain("BbsComposer");
    expect(c).toContain("bbs-composer");
  });
});
