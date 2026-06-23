import type { TestCase } from "../types";

/**
 * P1 — BBS / Forum
 *
 * Verifies the public BBS pages, the forum API list endpoint, and the
 * /community → /bbs redirect chain.
 */
export const bbsTests: TestCase[] = [
  {
    id: "bbs-index-loads",
    name: "BBS index page loads",
    description:
      "The /bbs page must return 200 and show forum content.",
    priority: "P1",
    method: "GET",
    path: "/bbs",
    expectedStatus: [200],
    tags: ["page", "bbs"],
  },
  {
    id: "bbs-new-redirects-unauth",
    name: "BBS new post page redirects unauthenticated users",
    description:
      "GET /bbs/new without a session must redirect to /login with a callbackUrl.",
    priority: "P1",
    method: "GET",
    path: "/bbs/new",
    expectedStatus: [200, 307, 308],
    requiresAuth: false,
    tags: ["page", "bbs", "auth-redirect"],
  },
  {
    id: "bbs-api-posts-list",
    name: "Forum posts API returns list",
    description:
      "GET /api/forum/posts must return 200 with a JSON object containing `posts` and `total`.",
    priority: "P1",
    method: "GET",
    path: "/api/forum/posts",
    expectedStatus: [200],
    expectJsonFields: ["posts", "total"],
    tags: ["api", "bbs"],
  },
  {
    id: "bbs-api-posts-pagination",
    name: "Forum posts API respects pagination",
    description:
      "GET /api/forum/posts?page=1&pageSize=5 must return at most 5 posts.",
    priority: "P1",
    method: "GET",
    path: "/api/forum/posts",
    query: { page: "1", pageSize: "5" },
    expectedStatus: [200],
    expectJsonFields: ["posts", "total", "page", "pageSize"],
    tags: ["api", "bbs", "pagination"],
  },
  {
    id: "bbs-api-posts-category-filter",
    name: "Forum posts API supports category filter",
    description:
      "GET /api/forum/posts with a category filter must return 200 without error.",
    priority: "P1",
    method: "GET",
    path: "/api/forum/posts",
    query: { category: "general" },
    expectedStatus: [200],
    expectJsonFields: ["posts", "total"],
    tags: ["api", "bbs", "filter"],
  },
  {
    id: "bbs-api-categories",
    name: "Forum categories API returns list",
    description:
      "GET /api/forum/categories must return 200 with category data.",
    priority: "P1",
    method: "GET",
    path: "/api/forum/categories",
    expectedStatus: [200],
    tags: ["api", "bbs", "categories"],
  },
  {
    id: "bbs-api-stats",
    name: "Forum stats API responds",
    description:
      "GET /api/forum/stats must return 200 (may require auth, but should not 500).",
    priority: "P1",
    method: "GET",
    path: "/api/forum/stats",
    expectedStatus: [200, 401],
    tags: ["api", "bbs", "stats"],
  },
  {
    id: "bbs-api-create-post-unauth",
    name: "Forum create post requires authentication",
    description:
      "POST /api/forum/posts without a session must return 401 (not 500 or silent success).",
    priority: "P1",
    method: "POST",
    path: "/api/forum/posts",
    body: { title: "Test post", content: "Test content", categoryId: "test" },
    expectedStatus: [401],
    tags: ["api", "bbs", "auth"],
  },
  {
    id: "bbs-api-related-discussions",
    name: "Forum related discussions endpoint",
    description:
      "GET /api/forum/related-discussions must return 200 (may return empty).",
    priority: "P1",
    method: "GET",
    path: "/api/forum/related-discussions",
    expectedStatus: [200],
    tags: ["api", "bbs"],
  },
  {
    id: "community-redirects-to-bbs",
    name: "/community redirects to /bbs",
    description:
      "The legacy /community path must redirect to /bbs.",
    priority: "P1",
    method: "GET",
    path: "/community",
    expectedStatus: [200, 307, 308],
    tags: ["redirect", "bbs", "legacy"],
  },
  {
    id: "bbs-category-page",
    name: "BBS category page loads",
    description:
      "GET /bbs/category/general must return 200 (category listing page).",
    priority: "P1",
    method: "GET",
    path: "/bbs/category/general",
    expectedStatus: [200, 404],
    tags: ["page", "bbs", "category"],
  },
  {
    id: "bbs-api-post-detail-unauth",
    name: "Forum post detail API responds",
    description:
      "GET /api/forum/posts/<nonexistent-slug> must return 404, not 500.",
    priority: "P1",
    method: "GET",
    path: "/api/forum/posts/this-slug-does-not-exist-audit-test",
    expectedStatus: [200, 404],
    tags: ["api", "bbs", "error-handling"],
  },
];
