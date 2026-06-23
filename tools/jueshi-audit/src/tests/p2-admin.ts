import type { TestCase } from "../types";

/**
 * P2 — Admin Panel Access Control
 *
 * Verifies that all admin pages and admin API endpoints reject
 * unauthenticated / non-admin requests. These cases do NOT require
 * credentials — they assert the *negative* path (access denied).
 *
 * Cases marked `requiresAuth: true` are skipped by `--public-only`.
 */
export const adminTests: TestCase[] = [
  {
    id: "admin-page-redirects-unauth",
    name: "Admin page redirects unauthenticated users",
    description:
      "GET /admin without a session must redirect to /login (not expose the admin UI).",
    priority: "P2",
    method: "GET",
    path: "/admin",
    expectedStatus: [200, 307, 308],
    requiresAuth: true,
    tags: ["page", "admin", "auth"],
  },
  {
    id: "admin-users-page-protected",
    name: "Admin users page is protected",
    description:
      "GET /admin/users without an admin session must not return 200 with user data.",
    priority: "P2",
    method: "GET",
    path: "/admin/users",
    expectedStatus: [200, 307, 308],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["page", "admin", "auth"],
  },
  {
    id: "admin-destinations-page-protected",
    name: "Admin destinations page is protected",
    description:
      "GET /admin/destinations without an admin session must not return 200 with data.",
    priority: "P2",
    method: "GET",
    path: "/admin/destinations",
    expectedStatus: [200, 307, 308],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["page", "admin", "auth"],
  },
  {
    id: "admin-api-overview-protected",
    name: "Admin API overview requires admin",
    description:
      "GET /api/admin/overview without auth must return 401, not admin data.",
    priority: "P2",
    method: "GET",
    path: "/api/admin/overview",
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["api", "admin", "auth"],
  },
  {
    id: "admin-api-users-protected",
    name: "Admin API users list requires admin",
    description:
      "GET /api/admin/users without auth must return 401, not user data.",
    priority: "P2",
    method: "GET",
    path: "/api/admin/users",
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["api", "admin", "auth", "user-data"],
  },
  {
    id: "admin-api-settings-protected",
    name: "Admin API settings requires admin",
    description:
      "GET /api/admin/settings without auth must return 401, not site settings.",
    priority: "P2",
    method: "GET",
    path: "/api/admin/settings",
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["api", "admin", "auth"],
  },
  {
    id: "admin-elevate-wrong-secret",
    name: "Admin elevate rejects wrong secret",
    description:
      "POST /api/admin/elevate with a wrong secret must return 403, not elevate the user.",
    priority: "P2",
    method: "POST",
    path: "/api/admin/elevate",
    query: { secret: "wrong-secret-audit-test" },
    expectedStatus: [401, 403],
    tags: ["api", "admin", "security"],
  },
  {
    id: "admin-elevate-default-secret-blocked",
    name: "Admin elevate with default placeholder secret",
    description:
      "POST /api/admin/elevate with the default 'CHANGE_ME_IN_PRODUCTION' secret must NOT succeed in production/staging.",
    priority: "P2",
    method: "POST",
    path: "/api/admin/elevate",
    query: { secret: "CHANGE_ME_IN_PRODUCTION" },
    expectedStatus: [401, 403],
    tags: ["api", "admin", "security", "default-secret"],
  },
  {
    id: "admin-api-topics-protected",
    name: "Admin API topics requires admin",
    description:
      "GET /api/admin/topics without auth must return 401.",
    priority: "P2",
    method: "GET",
    path: "/api/admin/topics",
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["api", "admin", "auth"],
  },
  {
    id: "admin-api-guides-protected",
    name: "Admin API guides requires admin",
    description:
      "GET /api/admin/guides without auth must return 401.",
    priority: "P2",
    method: "GET",
    path: "/api/admin/guides",
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["api", "admin", "auth"],
  },
  {
    id: "admin-api-newsletter-protected",
    name: "Admin API newsletter requires admin",
    description:
      "GET /api/admin/newsletter without auth must return 401.",
    priority: "P2",
    method: "GET",
    path: "/api/admin/newsletter",
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["api", "admin", "auth"],
  },
  {
    id: "admin-api-destinations-protected",
    name: "Admin API destinations requires admin",
    description:
      "GET /api/admin/destinations without auth must return 401, not destination data.",
    priority: "P2",
    method: "GET",
    path: "/api/admin/destinations",
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["api", "admin", "auth"],
  },
  {
    id: "admin-api-notifications-protected",
    name: "Admin API notifications requires admin",
    description:
      "GET /api/admin/notifications without auth must return 401.",
    priority: "P2",
    method: "GET",
    path: "/api/admin/notifications",
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["api", "admin", "auth"],
  },
  {
    id: "admin-api-community-stats-protected",
    name: "Admin community stats requires admin",
    description:
      "GET /api/admin/community/stats without auth must return 401.",
    priority: "P2",
    method: "GET",
    path: "/api/admin/community/stats",
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["api", "admin", "community"],
  },
];
