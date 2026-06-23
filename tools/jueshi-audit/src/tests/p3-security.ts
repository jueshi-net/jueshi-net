import type { TestCase } from "../types";

/**
 * P3 — Security Audit
 *
 * Verifies access control on sensitive endpoints, checks for common
 * security misconfigurations, and ensures error responses do not leak
 * sensitive information.
 */
export const securityTests: TestCase[] = [
  {
    id: "api-health-protected",
    name: "Health endpoint requires admin",
    description:
      "GET /api/health without auth must return 401 — it exposes system info (memory, uptime, DB status).",
    priority: "P3",
    method: "GET",
    path: "/api/health",
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["security", "api", "info-leak"],
  },
  {
    id: "api-backup-protected",
    name: "Backup endpoint requires admin",
    description:
      "GET /api/backup without auth must return 401 — backups contain all data.",
    priority: "P3",
    method: "GET",
    path: "/api/backup",
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["security", "api", "backup"],
  },
  {
    id: "api-audit-protected",
    name: "Audit log endpoint requires auth",
    description:
      "GET /api/audit without auth must return 401 — audit logs are sensitive.",
    priority: "P3",
    method: "GET",
    path: "/api/audit",
    expectedStatus: [401, 403],
    requiresAuth: true,
    tags: ["security", "api", "audit-log"],
  },
  {
    id: "api-stats-protected",
    name: "Stats endpoint requires admin",
    description:
      "GET /api/stats without auth must return 401 — stats expose analytics data.",
    priority: "P3",
    method: "GET",
    path: "/api/stats",
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["security", "api", "stats"],
  },
  {
    id: "api-webhooks-protected",
    name: "Webhooks endpoint requires admin",
    description:
      "GET /api/webhooks without auth must return 401.",
    priority: "P3",
    method: "GET",
    path: "/api/webhooks",
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["security", "api", "webhooks"],
  },
  {
    id: "api-export-protected",
    name: "Export endpoint requires auth",
    description:
      "GET /api/export without auth must return 401 — exports contain user data.",
    priority: "P3",
    method: "GET",
    path: "/api/export",
    expectedStatus: [401, 403],
    requiresAuth: true,
    tags: ["security", "api", "export"],
  },
  {
    id: "api-export-authorize-protected",
    name: "Export authorize endpoint requires auth",
    description:
      "GET /api/export/authorize without auth must return 401.",
    priority: "P3",
    method: "GET",
    path: "/api/export/authorize",
    expectedStatus: [401, 403],
    requiresAuth: true,
    tags: ["security", "api", "export"],
  },
  {
    id: "env-file-not-accessible",
    name: ".env file is not publicly accessible",
    description:
      "GET /.env must return 404 — environment files must never be served.",
    priority: "P3",
    method: "GET",
    path: "/.env",
    expectedStatus: [404],
    expectNotContains: ["DATABASE_URL", "SECRET", "API_KEY"],
    tags: ["security", "info-leak", "env"],
  },
  {
    id: "git-directory-not-accessible",
    name: ".git directory is not publicly accessible",
    description:
      "GET /.git/config must return 404 — git metadata must never be served.",
    priority: "P3",
    method: "GET",
    path: "/.git/config",
    expectedStatus: [404],
    expectNotContains: ["[core]", "[remote"],
    tags: ["security", "info-leak", "git"],
  },
  {
    id: "api-links-protected",
    name: "Links API requires admin",
    description:
      "GET /api/links without auth must return 401 — link management is admin-only.",
    priority: "P3",
    method: "GET",
    path: "/api/links",
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["security", "api", "links"],
  },
  {
    id: "api-links-bulk-protected",
    name: "Links bulk API requires admin",
    description:
      "POST /api/links/bulk without auth must return 401.",
    priority: "P3",
    method: "POST",
    path: "/api/links/bulk",
    body: {},
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["security", "api", "links", "bulk"],
  },
  {
    id: "api-subscriptions-protected",
    name: "Subscriptions API requires admin",
    description:
      "GET /api/subscriptions without auth must return 401.",
    priority: "P3",
    method: "GET",
    path: "/api/subscriptions",
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["security", "api", "subscriptions"],
  },
  {
    id: "api-stats-trends-protected",
    name: "Stats trends API requires admin",
    description:
      "GET /api/stats/trends without auth must return 401.",
    priority: "P3",
    method: "GET",
    path: "/api/stats/trends",
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["security", "api", "stats"],
  },
  {
    id: "api-me-change-password-protected",
    name: "Change password requires session",
    description:
      "POST /api/me/change-password without auth must return 401, not change any password.",
    priority: "P3",
    method: "POST",
    path: "/api/me/change-password",
    body: { currentPassword: "test", newPassword: "test" },
    expectedStatus: [401, 403],
    requiresAuth: true,
    tags: ["security", "api", "password"],
  },
  {
    id: "api-favorites-protected",
    name: "Favorites API requires auth",
    description:
      "GET /api/favorites without auth must return 401, not expose user favorites.",
    priority: "P3",
    method: "GET",
    path: "/api/favorites",
    expectedStatus: [401, 403],
    requiresAuth: true,
    tags: ["security", "api", "favorites"],
  },
  {
    id: "api-tracking-no-leak",
    name: "Tracking API does not leak sensitive data",
    description:
      "GET /api/tracking without auth must not return 200 with user-identifiable data.",
    priority: "P3",
    method: "GET",
    path: "/api/tracking",
    expectedStatus: [200, 401, 403],
    expectNotContains: ["email", "password", "token", "session"],
    tags: ["security", "api", "info-leak"],
  },
  {
    id: "home-no-error-leak",
    name: "Homepage does not leak stack traces",
    description:
      "GET / must not contain error/stack-trace indicators in the HTML.",
    priority: "P3",
    method: "GET",
    path: "/",
    expectedStatus: [200],
    expectNotContains: ["stack trace", "at /node_modules", "SyntaxError", "TypeError:"],
    tags: ["security", "info-leak", "homepage"],
  },
  {
    id: "api-admin-elevate-get-not-allowed",
    name: "Admin elevate rejects GET method",
    description:
      "GET /api/admin/elevate must not be accepted — only POST should be allowed (method not allowed or auth error).",
    priority: "P3",
    method: "GET",
    path: "/api/admin/elevate",
    expectedStatus: [401, 403, 405],
    tags: ["security", "api", "admin", "method"],
  },
];
