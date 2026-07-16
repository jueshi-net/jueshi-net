import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * FORUM-404-001: Verify that missing forum entities return real HTTP 404
 * via notFound(), and real database errors are NOT masked as 404.
 *
 * These tests verify code structure since the page server components
 * cannot be directly imported in a test runner without a full Next.js
 * runtime. The tests check that:
 * 1. getPost/getCategory do NOT swallow errors via catch { return null }
 * 2. generateMetadata calls notFound() for missing entities
 * 3. Page components call notFound() before any rendering begins
 */

const POST_PAGE = readFileSync(
  join(__dirname, "../../src/app/(public)/bbs/[slug]/page.tsx"),
  "utf-8",
);

const CATEGORY_PAGE = readFileSync(
  join(__dirname, "../../src/app/(public)/bbs/category/[key]/page.tsx"),
  "utf-8",
);

describe("FORUM-404-001: Post detail page 404 behavior", () => {
  it("getPost function must NOT have a catch block that returns null", () => {
    // The old code had: catch { return null; }
    // The new code should not have this pattern in getPost
    const getPostMatch = POST_PAGE.match(
      /async function getPost[\s\S]*?\n\}/,
    );
    expect(getPostMatch).not.toBeNull();
    const getPostBody = getPostMatch![0];

    // Must NOT contain catch { return null; }
    expect(getPostBody).not.toContain("catch {");
    expect(getPostBody).not.toContain("return null;");
  });

  it("generateMetadata must call notFound() when post is missing", () => {
    const metadataMatch = POST_PAGE.match(
      /export async function generateMetadata[\s\S]*?\n\}/,
    );
    expect(metadataMatch).not.toBeNull();
    const metadataBody = metadataMatch![0];

    // Must call notFound() instead of returning metadata with robots: noindex
    expect(metadataBody).toContain("notFound()");
    expect(metadataBody).not.toContain('buildTitle("帖子不存在")');
  });

  it("page component must call notFound() before any Promise.all or rendering", () => {
    const pageMatch = POST_PAGE.match(
      /export default async function PostDetailPage[\s\S]*?\n\}/,
    );
    expect(pageMatch).not.toBeNull();
    const pageBody = pageMatch![0];

    // notFound() must appear before Promise.all
    const notFoundIdx = pageBody.indexOf("notFound()");
    const promiseAllIdx = pageBody.indexOf("Promise.all");

    expect(notFoundIdx).toBeGreaterThan(0);
    expect(promiseAllIdx).toBeGreaterThan(0);
    expect(notFoundIdx).toBeLessThan(promiseAllIdx);
  });

  it("notFound must be imported from next/navigation", () => {
    expect(POST_PAGE).toContain(
      'import { notFound } from "next/navigation"',
    );
  });
});

describe("FORUM-404-001: Category page 404 behavior", () => {
  it("getCategory function must NOT have a catch block that returns null", () => {
    const getCategoryMatch = CATEGORY_PAGE.match(
      /async function getCategory[\s\S]*?\n\}/,
    );
    expect(getCategoryMatch).not.toBeNull();
    const getCategoryBody = getCategoryMatch![0];

    // Must NOT contain catch { return null; }
    expect(getCategoryBody).not.toContain("catch {");
  });

  it("generateMetadata must call notFound() when category is missing", () => {
    const metadataMatch = CATEGORY_PAGE.match(
      /export async function generateMetadata[\s\S]*?\n\}/,
    );
    expect(metadataMatch).not.toBeNull();
    const metadataBody = metadataMatch![0];

    // Must call notFound() instead of returning metadata with robots: noindex
    expect(metadataBody).toContain("notFound()");
    expect(metadataBody).not.toContain('buildTitle("分类不存在")');
  });

  it("page component must call notFound() for missing category before rendering", () => {
    const pageMatch = CATEGORY_PAGE.match(
      /export default async function CategoryPage[\s\S]*?\n\}/,
    );
    expect(pageMatch).not.toBeNull();
    const pageBody = pageMatch![0];

    // notFound() must appear before the return statement
    const notFoundIdx = pageBody.indexOf("notFound()");
    const returnIdx = pageBody.indexOf("return (");

    expect(notFoundIdx).toBeGreaterThan(0);
    expect(returnIdx).toBeGreaterThan(0);
    expect(notFoundIdx).toBeLessThan(returnIdx);
  });
});

describe("FORUM-404-001: not-found.tsx renders V4 shell", () => {
  it("not-found page exists and uses JueshiV4PublicShell", () => {
    const notFoundPage = readFileSync(
      join(__dirname, "../../src/app/(public)/bbs/not-found.tsx"),
      "utf-8",
    );
    expect(notFoundPage).toContain("JueshiV4PublicShell");
    expect(notFoundPage).toContain("404");
  });
});
