import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * FORUM-404-001 + FORUM-404-002: Verify that missing forum entities
 * return real HTTP 404 via notFound(), and that route-level loading.tsx
 * files do NOT cause streamed soft 404 (HTTP 200) responses.
 *
 * Key principle: notFound() must be called BEFORE any streaming begins.
 * Route-level loading.tsx creates an implicit <Suspense> that starts
 * streaming HTTP 200 before the page component runs.
 */

const BBS_DIR = join(__dirname, "../../src/app/(public)/bbs");
const POST_PAGE = readFileSync(join(BBS_DIR, "[slug]/page.tsx"), "utf-8");
const CATEGORY_PAGE = readFileSync(
  join(BBS_DIR, "category/[key]/page.tsx"),
  "utf-8",
);

describe("FORUM-404-001: Post detail page 404 behavior", () => {
  it("getPost function must NOT have a catch block that returns null", () => {
    const getPostStart = POST_PAGE.indexOf("async function getPost(");
    const getPostEnd = POST_PAGE.indexOf("async function getLikeCount(");
    const getPostBody = POST_PAGE.slice(getPostStart, getPostEnd);
    expect(getPostBody).not.toContain("catch {");
  });

  it("generateMetadata must call notFound() when post is missing", () => {
    const metaStart = POST_PAGE.indexOf("export async function generateMetadata(");
    const metaEnd = POST_PAGE.indexOf("export default async function PostDetailPage(");
    const metaBody = POST_PAGE.slice(metaStart, metaEnd);
    expect(metaBody).toContain("notFound()");
    expect(metaBody).not.toContain('buildTitle("帖子不存在")');
  });

  it("page component must call notFound() before any Promise.all or rendering", () => {
    const pageStart = POST_PAGE.indexOf("export default async function PostDetailPage(");
    const pageBody = POST_PAGE.slice(pageStart);
    const notFoundIdx = pageBody.indexOf("notFound()");
    const renderIdx = pageBody.indexOf("return (");

    expect(notFoundIdx).toBeGreaterThan(0);
    expect(renderIdx).toBeGreaterThan(0);
    expect(notFoundIdx).toBeLessThan(renderIdx);
  });

  it("notFound must be imported from next/navigation", () => {
    expect(POST_PAGE).toContain('import { notFound } from "next/navigation"');
  });
});

describe("FORUM-404-001: Category page 404 behavior", () => {
  it("getCategory function must NOT have a catch block that returns null", () => {
    const getCatStart = CATEGORY_PAGE.indexOf("async function getCategory(");
    const getCatEnd = CATEGORY_PAGE.indexOf("async function getPosts(");
    const getCatBody = CATEGORY_PAGE.slice(getCatStart, getCatEnd);
    expect(getCatBody).not.toContain("catch {");
  });

  it("generateMetadata must call notFound() when category is missing", () => {
    const metaStart = CATEGORY_PAGE.indexOf("export async function generateMetadata(");
    const metaEnd = CATEGORY_PAGE.indexOf("export default async function CategoryPage(");
    const metaBody = CATEGORY_PAGE.slice(metaStart, metaEnd);
    expect(metaBody).toContain("notFound()");
    expect(metaBody).not.toContain('buildTitle("分类不存在")');
  });

  it("page component must call notFound() for missing category before rendering", () => {
    const pageStart = CATEGORY_PAGE.indexOf("export default async function CategoryPage(");
    const pageBody = CATEGORY_PAGE.slice(pageStart);
    const notFoundIdx = pageBody.indexOf("notFound()");
    const returnIdx = pageBody.indexOf("return (");

    expect(notFoundIdx).toBeGreaterThan(0);
    expect(returnIdx).toBeGreaterThan(0);
    expect(notFoundIdx).toBeLessThan(returnIdx);
  });
});

describe("FORUM-404-002: No route-level loading.tsx for dynamic entity routes", () => {
  it("must NOT have loading.tsx at /bbs/[slug]/", () => {
    const loadingPath = join(BBS_DIR, "[slug]/loading.tsx");
    expect(existsSync(loadingPath)).toBe(false);
  });

  it("must NOT have loading.tsx at /bbs/category/[key]/", () => {
    const loadingPath = join(BBS_DIR, "category/[key]/loading.tsx");
    expect(existsSync(loadingPath)).toBe(false);
  });

  it("may keep loading.tsx at /bbs/ (homepage only)", () => {
    // Homepage loading.tsx is OK because it doesn't need strict 404.
    // It only wraps /bbs/page.tsx, not child routes.
    const loadingPath = join(BBS_DIR, "loading.tsx");
    expect(existsSync(loadingPath)).toBe(true);
  });
});

describe("FORUM-404-002: Internal Suspense for secondary content", () => {
  it("post detail page must use Suspense import", () => {
    expect(POST_PAGE).toContain("import { Suspense } from \"react\"");
  });

  it("post detail page must have a PostCommentsSection async component", () => {
    expect(POST_PAGE).toContain("async function PostCommentsSection(");
  });

  it("post detail page must wrap PostCommentsSection in Suspense", () => {
    expect(POST_PAGE).toContain("<Suspense");
    expect(POST_PAGE).toContain("<PostCommentsSection");
  });

  it("post detail page must have a CommentsSkeleton fallback", () => {
    expect(POST_PAGE).toContain("CommentsSkeleton");
  });

  it("category page must use Suspense import", () => {
    expect(CATEGORY_PAGE).toContain("import { Suspense } from \"react\"");
  });

  it("category page must have a CategoryPostList async component", () => {
    expect(CATEGORY_PAGE).toContain("async function CategoryPostList(");
  });

  it("category page must wrap CategoryPostList in Suspense", () => {
    expect(CATEGORY_PAGE).toContain("<Suspense");
    expect(CATEGORY_PAGE).toContain("<CategoryPostList");
  });

  it("category page must have a CategoryContentSkeleton fallback", () => {
    expect(CATEGORY_PAGE).toContain("CategoryContentSkeleton");
  });
});

describe("FORUM-404-002: Entity check before streaming", () => {
  it("post page calls notFound() before any Suspense boundary", () => {
    const pageStart = POST_PAGE.indexOf("export default async function PostDetailPage(");
    const pageBody = POST_PAGE.slice(pageStart);
    const notFoundIdx = pageBody.indexOf("notFound()");
    const suspenseIdx = pageBody.indexOf("<Suspense");

    expect(notFoundIdx).toBeGreaterThan(0);
    expect(suspenseIdx).toBeGreaterThan(0);
    // notFound() must come before Suspense
    expect(notFoundIdx).toBeLessThan(suspenseIdx);
  });

  it("category page calls notFound() before any Suspense boundary", () => {
    const pageStart = CATEGORY_PAGE.indexOf("export default async function CategoryPage(");
    const pageBody = CATEGORY_PAGE.slice(pageStart);
    const notFoundIdx = pageBody.indexOf("notFound()");
    const suspenseIdx = pageBody.indexOf("<Suspense");

    expect(notFoundIdx).toBeGreaterThan(0);
    expect(suspenseIdx).toBeGreaterThan(0);
    // notFound() must come before Suspense
    expect(notFoundIdx).toBeLessThan(suspenseIdx);
  });
});

describe("FORUM-404: not-found.tsx renders V4 shell", () => {
  it("not-found page exists and uses JueshiV4PublicShell", () => {
    const notFoundPage = readFileSync(join(BBS_DIR, "not-found.tsx"), "utf-8");
    expect(notFoundPage).toContain("JueshiV4PublicShell");
    expect(notFoundPage).toContain("404");
  });
});
