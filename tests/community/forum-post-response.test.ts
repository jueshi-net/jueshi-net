import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * FORUM-POST-001: Verify that the post creation form correctly parses
 * the API response shape { success: true, post: { id, slug, status } }
 * and redirects based on moderation status.
 */

const POST_FORM = readFileSync(
  join(__dirname, "../../src/components/bbs/post-form.tsx"),
  "utf-8",
);

const BBS_PAGE = readFileSync(
  join(__dirname, "../../src/app/(public)/bbs/page.tsx"),
  "utf-8",
);

describe("FORUM-POST-001: Post form response parsing", () => {
  it("must read data.post (not data.slug)", () => {
    // The old bug read data.slug directly; the fix reads data.post
    expect(POST_FORM).toContain("data.post");
    expect(POST_FORM).not.toContain("data.slug");
  });

  it("must validate post object exists with slug and status", () => {
    expect(POST_FORM).toContain("!post");
    expect(POST_FORM).toContain("post.slug");
    expect(POST_FORM).toContain("post.status");
  });

  it("must show error when post object is missing", () => {
    expect(POST_FORM).toContain("发布成功但返回数据异常");
  });
});

describe("FORUM-POST-001: Status-aware redirect", () => {
  it("must redirect to /bbs/<slug> when status is published", () => {
    // Find the redirect logic
    const publishedCheck = POST_FORM.indexOf('post.status === "published"');
    expect(publishedCheck).toBeGreaterThan(0);

    // After the published check, it should push to /bbs/${post.slug}
    const afterCheck = POST_FORM.slice(publishedCheck, publishedCheck + 200);
    expect(afterCheck).toContain("router.push(`/bbs/${post.slug}`)");
  });

  it("must redirect to /bbs?created=1&status=<status> when not published", () => {
    // The else branch should redirect with status
    expect(POST_FORM).toContain("created=1");
    expect(POST_FORM).toContain("post.status");
  });

  it("must NOT redirect pending posts to post detail page", () => {
    // Ensure there's no unconditional redirect to /bbs/${post.slug}
    // The redirect to /bbs/${post.slug} must be inside the published check
    const redirectIdx = POST_FORM.indexOf("router.push(`/bbs/${post.slug}`)");
    const publishedIdx = POST_FORM.indexOf('post.status === "published"');

    expect(redirectIdx).toBeGreaterThan(0);
    expect(publishedIdx).toBeGreaterThan(0);
    expect(publishedIdx).toBeLessThan(redirectIdx);
  });
});

describe("FORUM-POST-001: User message for pending posts", () => {
  it("success message must mention moderation/review", () => {
    expect(POST_FORM).toContain("审核");
  });

  it("must NOT claim post is immediately public", () => {
    // The old message said "帖子已提交！正在跳转..." without mentioning review
    expect(POST_FORM).not.toContain("🎉 帖子已提交！正在跳转...");
  });
});

describe("FORUM-POST-001: Forum home page handles created=1", () => {
  it("must accept created and status searchParams", () => {
    expect(BBS_PAGE).toContain("created");
    expect(BBS_PAGE).toContain("status");
  });

  it("must show success banner when created=1", () => {
    expect(BBS_PAGE).toContain("createdFlag");
    expect(BBS_PAGE).toContain("帖子已提交");
  });

  it("must show pending-specific message when status=pending", () => {
    expect(BBS_PAGE).toContain("审核通过后将在社区公开");
  });
});
